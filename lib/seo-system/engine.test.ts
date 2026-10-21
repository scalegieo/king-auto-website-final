import assert from "node:assert/strict";
import test from "node:test";
import type { Vehicle } from "@/lib/inventory/types";
import {
  analyzeSite,
  decideChange,
  diffInventory,
  normalizeInventory,
  opportunityScore,
} from "./engine";
import { emptyStore } from "./types";
import { relatedVehicles } from "./related";

const now = "2026-10-20T15:00:00.000Z";

function car(partial: Partial<Vehicle> & Pick<Vehicle, "id" | "make" | "model" | "year">): Vehicle {
  return {
    price: 20000,
    mileage: 40000,
    image: "https://cdn.example.com/car.jpg",
    status: "available",
    ...partial,
  };
}

test("price changes are recorded and sold cars are not sent home", () => {
  const first = normalizeInventory(
    [car({ id: "1", vin: "VIN1", year: 2024, make: "Toyota", model: "RAV4", trim: "XLE", price: 27995 })],
    {},
    now
  );
  const second = normalizeInventory(
    [car({ id: "1", vin: "VIN1", year: 2024, make: "Toyota", model: "RAV4", trim: "XLE", price: 26995 })],
    Object.fromEntries(first.map((vehicle) => [vehicle.key, vehicle])),
    now
  );
  const price = diffInventory(first, second).find((event) => event.type === "price");
  assert.equal(price?.delta, -1000);

  const gone = diffInventory(second, []);
  const sold = gone.find((event) => event.type === "sold");
  assert.equal(sold?.suggestion?.action, "leave_404");
  assert.equal(sold?.suggestion?.destination, undefined);
  assert.match(sold?.suggestion?.reason || "", /homepage/i);
});

test("a sold vehicle can only be queued toward a remaining sibling", () => {
  const sold = normalizeInventory(
    [car({ id: "1", vin: "SOLD", year: 2024, make: "Ford", model: "F-150", trim: "XLT" })],
    {},
    now
  );
  const sibling = normalizeInventory(
    [car({ id: "2", vin: "KEEP", year: 2023, make: "Ford", model: "F-150", trim: "XLT" })],
    {},
    now
  );
  const event = diffInventory(sold, sibling).find((item) => item.type === "sold");
  assert.equal(event?.suggestion?.action, "review_redirect");
  assert.equal(event?.suggestion?.destination, sibling[0].path);
  assert.notEqual(event?.suggestion?.destination, "/");
});

test("one Toyota does not create a category, four Fords stay queued", () => {
  const vehicles = normalizeInventory(
    [
      car({ id: "t", year: 2022, make: "Toyota", model: "Camry" }),
      ...[1, 2, 3, 4].map((n) =>
        car({ id: `f${n}`, vin: `FORD${n}`, year: 2020 + n, make: "Ford", model: "Escape" })
      ),
    ],
    {},
    now
  );
  const result = analyzeSite({
    runId: "run-1",
    now,
    week: 8,
    vehicles,
    previous: [],
    events: [],
    existing: emptyStore(),
    searchRows: [],
  });
  assert.equal(
    result.recommendations.some((item) => item.proposed.includes("Toyota Camry")),
    false
  );
  const ford = result.recommendations.find((item) => item.type === "category_page" && item.proposed.includes("Ford Escape"));
  assert.ok(ford);
  assert.equal(ford?.safeToAutoApply, false);
  assert.equal(result.appliedChanges.some((change) => change.changeType === "category_page"), false);
});

test("a weak title is queued and a second run does not repeat it", () => {
  const vehicles = normalizeInventory(
    [car({ id: "9", vin: "WEAK9", year: 2024, make: "Toyota", model: "RAV4", trim: "XLE" })],
    {},
    now
  );
  const path = vehicles[0].path;
  const first = analyzeSite({
    runId: "run-1",
    now,
    week: 4,
    vehicles,
    previous: [],
    events: [],
    existing: {
      ...emptyStore(),
      overrides: { [path]: { title: "2024 Toyota RAV4" } },
    },
    searchRows: [],
  });
  const titleChange = first.pendingChanges.find((change) => change.changeType === "title");
  assert.ok(titleChange);
  assert.equal(titleChange?.status, "pending");
  assert.match(titleChange?.after || "", /XLE/);
  assert.match(titleChange?.after || "", /Aurora/);

  const second = analyzeSite({
    runId: "run-2",
    now,
    week: 5,
    vehicles,
    previous: vehicles,
    events: [],
    existing: {
      ...emptyStore(),
      overrides: { [path]: { title: "2024 Toyota RAV4" } },
      recommendations: first.recommendations,
      changes: first.pendingChanges,
    },
    searchRows: [],
  });
  assert.equal(
    second.recommendations.filter((item) => item.type === "title" && item.path === path).length,
    0
  );
});

test("missing description can be applied and rolled back", () => {
  const vehicles = normalizeInventory(
    [car({ id: "3", vin: "DESC3", year: 2021, make: "Honda", model: "Civic" })],
    {},
    now
  );
  const path = vehicles[0].path;
  const result = analyzeSite({
    runId: "run-d",
    now,
    week: 4,
    vehicles,
    previous: [],
    events: [],
    existing: { ...emptyStore(), overrides: { [path]: { description: " " } } },
    searchRows: [],
  });
  const applied = result.appliedChanges.find((change) => change.changeType === "missing_description");
  assert.ok(applied);
  assert.match(result.overrides[path].description || "", /Aurora/);

  const store = emptyStore();
  store.changes = result.appliedChanges;
  store.overrides = result.overrides;
  store.recommendations = result.recommendations;
  const rolled = decideChange(store, applied!.id, "rollback", now);
  assert.equal(rolled.ok, true);
  if (rolled.ok) {
    assert.equal(rolled.store.overrides[path]?.description, " ");
    assert.equal(rolled.store.changes.find((change) => change.id === applied!.id)?.status, "rolled_back");
  }
});

test("opportunity score does not invent a ranking", () => {
  const withStockOnly = opportunityScore({ count: 8 });
  const withPosition = opportunityScore({ count: 8, position: 12.3, impressions: 3200 });
  assert.ok(withStockOnly < withPosition);
  assert.ok(withPosition <= 100);
});

test("related cars come from the supplied inventory only", () => {
  const current = car({ id: "a", year: 2024, make: "Toyota", model: "RAV4", trim: "XLE", price: 28000 });
  const related = relatedVehicles(current, [
    current,
    car({ id: "b", year: 2023, make: "Toyota", model: "RAV4", trim: "LE", price: 25000 }),
    car({ id: "c", year: 2012, make: "Ford", model: "Focus", price: 4000, mileage: 180000 }),
  ]);
  assert.equal(related.some((item) => item.name.includes("Focus")), false);
  assert.equal(related[0]?.name.includes("RAV4"), true);
});
