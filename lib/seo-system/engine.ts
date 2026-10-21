import { SITE_URL } from "@/lib/dealership";
import { HOME_H1, HOME_TITLE } from "@/lib/site-metadata";
import { vehicleSeoDescription, vehicleSeoTitle } from "@/lib/inventory/seo";
import { vehicleHref, vehicleName } from "@/lib/inventory/slug";
import type { Vehicle } from "@/lib/inventory/types";
import { themeForWeek } from "./program";
import type {
  InternalLinkOpportunity,
  InventoryEvent,
  InventorySnapshot,
  KeywordPerformance,
  NormalizedVehicle,
  PageOverride,
  ScoreSet,
  SEOChange,
  SEOIssue,
  SEORecommendation,
  SeoStore,
  SoldSuggestion,
  WeeklyReport,
} from "./types";

export { PROGRAM, programWeek, themeForWeek } from "./program";

const CATEGORY_MIN = 4;

export function normalizeInventory(
  vehicles: Vehicle[],
  previous: Record<string, NormalizedVehicle>,
  now: string
): NormalizedVehicle[] {
  return vehicles
    .filter((vehicle) => vehicle.status !== "sold")
    .map((vehicle) => {
      const key = vehicleKey(vehicle);
      const prior = previous[key];
      const images = uniqueImages(vehicle);
      return {
        key,
        id: vehicle.id,
        vin: clean(vehicle.vin),
        stockNumber: clean(vehicle.stockNumber),
        year: vehicle.year,
        make: vehicle.make.trim(),
        model: vehicle.model.trim(),
        trim: clean(vehicle.trim),
        price: vehicle.price > 0 ? vehicle.price : undefined,
        mileage: vehicle.mileage > 0 ? vehicle.mileage : undefined,
        exteriorColor: clean(vehicle.exteriorColor),
        interiorColor: clean(vehicle.interiorColor),
        engine: clean(vehicle.engine),
        transmission: clean(vehicle.transmission),
        drivetrain: clean(vehicle.drivetrain),
        mpgCity: vehicle.mpgCity,
        mpgHighway: vehicle.mpgHighway,
        images,
        path: vehicleHref(vehicle),
        availability: vehicle.status === "pending" ? "pending" : "available",
        firstSeen: prior?.firstSeen || now,
        lastSeen: now,
      };
    });
}

export function diffInventory(
  previous: NormalizedVehicle[],
  next: NormalizedVehicle[]
): InventoryEvent[] {
  const prevMap = new Map(previous.map((vehicle) => [vehicle.key, vehicle]));
  const nextMap = new Map(next.map((vehicle) => [vehicle.key, vehicle]));
  const events: InventoryEvent[] = [];

  for (const vehicle of next) {
    const prior = prevMap.get(vehicle.key);
    if (!prior) {
      events.push({ type: "new", key: vehicle.key, name: nameOf(vehicle), path: vehicle.path });
      continue;
    }
    if (prior.price != null && vehicle.price != null && prior.price !== vehicle.price) {
      events.push({
        type: "price",
        key: vehicle.key,
        name: nameOf(vehicle),
        path: vehicle.path,
        from: prior.price,
        to: vehicle.price,
        delta: vehicle.price - prior.price,
      });
    }
    if (prior.mileage != null && vehicle.mileage != null && prior.mileage !== vehicle.mileage) {
      events.push({
        type: "mileage",
        key: vehicle.key,
        name: nameOf(vehicle),
        path: vehicle.path,
        from: prior.mileage,
        to: vehicle.mileage,
      });
    }
    const imageDelta = diffImages(prior.images, vehicle.images);
    if (imageDelta.added || imageDelta.removed) {
      events.push({
        type: "images",
        key: vehicle.key,
        name: nameOf(vehicle),
        path: vehicle.path,
        added: imageDelta.added,
        removed: imageDelta.removed,
      });
    }
    const fields = changedFields(prior, vehicle);
    if (fields.length) {
      events.push({
        type: "details",
        key: vehicle.key,
        name: nameOf(vehicle),
        path: vehicle.path,
        fields,
      });
    }
  }

  for (const prior of previous) {
    if (nextMap.has(prior.key)) continue;
    events.push({
      type: "sold",
      key: prior.key,
      name: nameOf(prior),
      path: prior.path,
      suggestion: soldSuggestion(prior, next),
    });
  }

  return events;
}

export function analyzeSite(input: {
  runId: string;
  now: string;
  week: number;
  vehicles: NormalizedVehicle[];
  previous: NormalizedVehicle[];
  events: InventoryEvent[];
  existing: Pick<SeoStore, "recommendations" | "changes" | "overrides">;
  searchRows: KeywordPerformance[];
}): {
  issues: SEOIssue[];
  recommendations: SEORecommendation[];
  pendingChanges: SEOChange[];
  appliedChanges: SEOChange[];
  overrides: Record<string, PageOverride>;
  links: InternalLinkOpportunity[];
} {
  const issues: SEOIssue[] = [];
  const recommendations: SEORecommendation[] = [];
  const links: InternalLinkOpportunity[] = [];
  const overrides = { ...input.existing.overrides };
  const seen = new Set(
    input.existing.recommendations
      .filter((item) => item.status === "pending" || item.status === "applied")
      .map((item) => `${item.type}|${item.path}|${item.proposed}`)
  );

  const titles = new Map<string, string[]>();
  for (const vehicle of input.vehicles) {
    const asVehicle = toVehicle(vehicle);
    const title = input.existing.overrides[vehicle.path]?.title || vehicleSeoTitle(asVehicle);
    const description =
      input.existing.overrides[vehicle.path]?.description || vehicleSeoDescription(asVehicle);
    titles.set(title, [...(titles.get(title) || []), vehicle.path]);

    if (!titleIsStrong(title, vehicle)) {
      queue(recommendations, seen, {
        runId: input.runId,
        now: input.now,
        path: vehicle.path,
        type: "title",
        field: "title",
        current: title,
        proposed: proposedTitle(vehicle),
        reason: "The title is missing the year, make, model, trim we actually have, or Aurora.",
        confidence: vehicle.trim ? 0.8 : 0.86,
        risk: "medium",
        impact: "Clearer search result for this specific vehicle.",
        safeToAutoApply: false,
      });
    }

    if (!description.trim()) {
      queue(recommendations, seen, {
        runId: input.runId,
        now: input.now,
        path: vehicle.path,
        type: "missing_description",
        field: "description",
        current: "",
        proposed: vehicleSeoDescription(asVehicle),
        reason: "This vehicle page has no meta description.",
        confidence: 0.95,
        risk: "low",
        impact: "Gives the result a unique description from known vehicle facts.",
        safeToAutoApply: true,
      });
    }

    if (vehicle.images.length === 0) {
      issues.push(issue(input, vehicle.path, "warning", "missing_image", `${nameOf(vehicle)} has no photo in the feed.`));
    }

    const schemaProblems = schemaMismatches(vehicle);
    for (const problem of schemaProblems) {
      issues.push(issue(input, vehicle.path, "error", "schema_mismatch", problem));
    }
  }

  for (const [title, paths] of Array.from(titles.entries())) {
    if (paths.length < 2) continue;
    issues.push(
      issue(
        input,
        paths[0],
        "warning",
        "duplicate_title",
        `Title “${title}” is used by ${paths.length} vehicles.`
      )
    );
  }

  if (!HOME_TITLE.toLowerCase().includes("aurora")) {
    issues.push(issue(input, "/", "warning", "local_title", "Homepage title does not mention Aurora."));
  }
  queue(recommendations, seen, {
    runId: input.runId,
    now: input.now,
    path: "/",
    type: "homepage_title",
    field: "title",
    current: HOME_TITLE,
    proposed: "King Auto Inc. | Used Cars in Aurora, CO 80014",
    reason:
      "The lot is at 2180 S Havana St, Aurora, CO 80014. Denver is the surrounding market, not a second showroom. This stays queued for review.",
    confidence: 0.7,
    risk: "medium",
    impact: "Makes the homepage result clearly local to Aurora.",
    safeToAutoApply: false,
  });

  if (HOME_H1.toLowerCase().includes("denver")) {
    issues.push(issue(input, "/", "error", "h1_location", "Homepage H1 presents Denver as the dealership city."));
  }

  for (const event of input.events) {
    if (event.type === "sold" && event.suggestion?.action === "review_redirect" && event.suggestion.destination) {
      queue(recommendations, seen, {
        runId: input.runId,
        now: input.now,
        path: event.path,
        type: "sold_redirect",
        current: "404 after the vehicle leaves the feed",
        proposed: event.suggestion.destination,
        reason: event.suggestion.reason,
        confidence: 0.55,
        risk: "high",
        impact: "May preserve a visitor who lands on a sold vehicle URL.",
        safeToAutoApply: false,
      });
    }
    if (event.type === "sold" && event.suggestion?.action === "leave_404") {
      issues.push(issue(input, event.path, "info", "sold_404", event.suggestion.reason));
    }
  }

  for (const group of groupsOf(input.vehicles)) {
    if (group.count < CATEGORY_MIN) continue;
    const path = `/inventory?make=${encodeURIComponent(group.make)}`;
    queue(recommendations, seen, {
      runId: input.runId,
      now: input.now,
      path,
      type: "category_page",
      current: `${group.count} ${group.label} vehicles, no dedicated category URL`,
      proposed: `Used ${group.label} in Aurora, CO`,
      reason: `${group.count} active ${group.label} vehicles is enough to be useful. One or two would not be.`,
      confidence: 0.75,
      risk: "high",
      impact: "A real category page could match shoppers looking for this make or model.",
      safeToAutoApply: false,
    });
    links.push({
      id: `link-${group.key}`,
      from: "/inventory",
      to: path,
      anchor: `Used ${group.label}`,
      reason: `${group.count} vehicles in stock.`,
      createdAt: input.now,
    });
  }

  for (const row of input.searchRows) {
    if (row.impressions >= 50 && row.ctr < 0.02 && row.position <= 20) {
      queue(recommendations, seen, {
        runId: input.runId,
        now: input.now,
        path: row.page || "/",
        type: "ctr",
        current: `“${row.query}” position ${row.position.toFixed(1)}, CTR ${(row.ctr * 100).toFixed(1)}%`,
        proposed: "Review the title and description against this query. Do not add unsupported claims.",
        reason: "Search Console shows impressions with a weak click rate.",
        confidence: 0.6,
        risk: "medium",
        impact: "Possible CTR improvement if the result text matches the query.",
        safeToAutoApply: false,
      });
    }
    if (row.position >= 11 && row.position <= 20 && row.impressions >= 20) {
      issues.push(
        issue(
          input,
          row.page || "/",
          "info",
          "page_two",
          `“${row.query}” is around position ${row.position.toFixed(1)}.`
        )
      );
    }
  }

  const open = recommendations.filter((item) => !alreadyHandled(input.existing, item));
  const pendingChanges: SEOChange[] = [];
  const appliedChanges: SEOChange[] = [];

  for (const recommendation of open) {
    if (!recommendation.safeToAutoApply || recommendation.risk !== "low" || !recommendation.field) {
      pendingChanges.push(changeFrom(recommendation, "pending", input.existing.overrides[recommendation.path] || null));
      continue;
    }
    const beforeOverride = input.existing.overrides[recommendation.path] || null;
    overrides[recommendation.path] = {
      ...overrides[recommendation.path],
      [recommendation.field]: recommendation.proposed,
    };
    recommendation.status = "applied";
    appliedChanges.push(changeFrom(recommendation, "applied", beforeOverride));
  }

  return {
    issues,
    recommendations: open,
    pendingChanges,
    appliedChanges,
    overrides,
    links,
  };
}

export function scores(input: {
  vehicles: number;
  issues: SEOIssue[];
  weakTitles: number;
}): ScoreSet {
  const technicalHits = input.issues.filter((item) =>
    ["schema_mismatch", "duplicate_title", "missing_image"].includes(item.code)
  ).length;
  const technical = clamp(100 - technicalHits * 8);
  const content = input.vehicles === 0 ? 0 : clamp(100 - Math.round((input.weakTitles / input.vehicles) * 100));
  const inventory = input.vehicles > 0 ? 100 : 0;
  const local = input.issues.some((item) => item.code === "h1_location" || item.code === "local_title") ? 60 : 100;
  const indexing = input.vehicles > 0 ? 100 : 40;
  const parts = [technical, content, inventory, local, indexing];
  const overall = Math.round(parts.reduce((sum, value) => sum + value, 0) / parts.length);
  return {
    overall,
    technical,
    content,
    inventory,
    local,
    indexing,
    performance: null,
  };
}

export function buildReport(input: {
  runId: string;
  now: string;
  week: number;
  vehicles: NormalizedVehicle[];
  events: InventoryEvent[];
  issues: SEOIssue[];
  recommendations: SEORecommendation[];
  applied: number;
  queued: number;
  searchRows: KeywordPerformance[];
  previousScores?: ScoreSet;
}): WeeklyReport {
  const theme = themeForWeek(input.week);
  const byMake = countBy(input.vehicles, (vehicle) => vehicle.make);
  const byModel = countBy(input.vehicles, (vehicle) => `${vehicle.make} ${vehicle.model}`);
  const score = scores({
    vehicles: input.vehicles.length,
    issues: input.issues,
    weakTitles: input.recommendations.filter((item) => item.type === "title").length,
  });
  const search = summarizeSearch(input.searchRows);
  const opportunities = topOpportunities(input.vehicles, input.searchRows, byModel);

  return {
    id: `report-${input.runId}`,
    runId: input.runId,
    week: input.week,
    theme: theme.theme,
    rangeStart: weekStart(input.now),
    rangeEnd: input.now.slice(0, 10),
    scores: score,
    previousScores: input.previousScores,
    inventory: {
      active: input.vehicles.length,
      added: input.events.filter((event) => event.type === "new").length,
      sold: input.events.filter((event) => event.type === "sold").length,
      priceChanges: input.events.filter((event) => event.type === "price").length,
      byMake,
      byModel,
    },
    search,
    work: [
      `${input.vehicles.length} active vehicles read from the live feed`,
      `${input.issues.length} audit notes`,
      `${input.applied} safe changes applied`,
      `${input.queued} items waiting for approval`,
      theme.focus,
    ],
    opportunities,
    nextWeek: nextActions(theme.week, opportunities),
    createdAt: input.now,
  };
}

export function topOpportunities(
  vehicles: NormalizedVehicle[],
  rows: KeywordPerformance[],
  models = countBy(vehicles, (vehicle) => `${vehicle.make} ${vehicle.model}`)
): WeeklyReport["opportunities"] {
  const fromInventory = models
    .filter((model) => model.count >= 3)
    .map((model) => {
      const match = rows.find((row) => row.query.toLowerCase().includes(model.name.toLowerCase()));
      const score = opportunityScore({
        count: model.count,
        position: match?.position,
        impressions: match?.impressions,
      });
      return {
        title: `Used ${model.name} in Aurora`,
        detail: match
          ? `${model.count} in stock. Search position ${match.position.toFixed(1)}, ${match.impressions} impressions.`
          : `${model.count} in stock. No Search Console query stored for this model yet.`,
        score,
        priority: (score >= 70 ? "HIGH" : score >= 45 ? "MEDIUM" : "LOW") as "HIGH" | "MEDIUM" | "LOW",
      };
    });

  const fromSearch = rows
    .filter((row) => row.position >= 11 && row.position <= 20)
    .map((row) => ({
      title: row.query,
      detail: `Position ${row.position.toFixed(1)}, ${row.impressions} impressions, CTR ${(row.ctr * 100).toFixed(1)}%.`,
      score: opportunityScore({
        count: 1,
        position: row.position,
        impressions: row.impressions,
      }),
      priority: "HIGH" as const,
    }));

  return [...fromInventory, ...fromSearch].sort((a, b) => b.score - a.score).slice(0, 8);
}

export function opportunityScore(input: {
  count: number;
  position?: number;
  impressions?: number;
}): number {
  let score = Math.min(40, input.count * 8);
  if (input.position != null && input.position >= 11 && input.position <= 20) score += 30;
  else if (input.position != null && input.position <= 10) score += 10;
  if (input.impressions != null) score += Math.min(30, Math.round(input.impressions / 100));
  return Math.max(0, Math.min(100, score));
}

export function decideChange(
  store: SeoStore,
  id: string,
  action: "approve" | "reject" | "rollback",
  now: string
): { ok: true; store: SeoStore } | { ok: false; error: string } {
  const change = store.changes.find((item) => item.id === id);
  if (!change) return { ok: false, error: "Change not found." };

  if (action === "reject") {
    if (change.status !== "pending") return { ok: false, error: "Only pending changes can be rejected." };
    change.status = "rejected";
    change.resolvedAt = now;
    const recommendation = store.recommendations.find((item) => item.id === change.recommendationId);
    if (recommendation) recommendation.status = "rejected";
    return { ok: true, store };
  }

  if (action === "approve") {
    if (change.status !== "pending") return { ok: false, error: "Only pending changes can be approved." };
    if (!change.field) return { ok: false, error: "This item is a note, not a page edit." };
    change.overridesBefore = store.overrides[change.path] || null;
    change.status = "applied";
    change.resolvedAt = now;
    store.overrides[change.path] = {
      ...store.overrides[change.path],
      [change.field]: change.after,
    };
    const recommendation = store.recommendations.find((item) => item.id === change.recommendationId);
    if (recommendation) recommendation.status = "applied";
    return { ok: true, store };
  }

  if (change.status !== "applied") return { ok: false, error: "Only applied changes can be rolled back." };
  change.status = "rolled_back";
  change.resolvedAt = now;
  if (change.overridesBefore) store.overrides[change.path] = change.overridesBefore;
  else delete store.overrides[change.path];
  return { ok: true, store };
}

export function snapshotPaths(vehicles: NormalizedVehicle[]): string[] {
  return [SITE_URL, `${SITE_URL}/inventory`, ...vehicles.map((vehicle) => `${SITE_URL}${vehicle.path}`)];
}

function soldSuggestion(sold: NormalizedVehicle, current: NormalizedVehicle[]): SoldSuggestion {
  const siblings = current.filter(
    (vehicle) => same(vehicle.make, sold.make) && same(vehicle.model, sold.model)
  );
  if (siblings.length === 0) {
    return {
      action: "leave_404",
      reason: `${nameOf(sold)} left the feed and no ${sold.make} ${sold.model} remains. Leave the URL as not found. Do not redirect it to the homepage.`,
    };
  }
  const target = [...siblings].sort((a, b) => {
    const trimA = a.trim && sold.trim && same(a.trim, sold.trim) ? 1 : 0;
    const trimB = b.trim && sold.trim && same(b.trim, sold.trim) ? 1 : 0;
    return trimB - trimA || b.year - a.year;
  })[0];
  return {
    action: "review_redirect",
    destination: target.path,
    reason: `${nameOf(sold)} is gone. ${nameOf(target)} is still on the lot. A redirect needs approval and must not point at the homepage.`,
  };
}

function titleIsStrong(title: string, vehicle: NormalizedVehicle): boolean {
  const text = title.toLowerCase();
  if (!text.includes(String(vehicle.year))) return false;
  if (!text.includes(vehicle.make.toLowerCase())) return false;
  if (!text.includes(vehicle.model.toLowerCase())) return false;
  if (vehicle.trim && !text.includes(vehicle.trim.toLowerCase())) return false;
  if (!text.includes("aurora")) return false;
  return true;
}

function proposedTitle(vehicle: NormalizedVehicle): string {
  const name = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(" ");
  return `${name} for Sale in Aurora, CO | King Auto`;
}

function schemaMismatches(vehicle: NormalizedVehicle): string[] {
  const problems: string[] = [];
  if (!vehicle.make || !vehicle.model || !vehicle.year) {
    problems.push("Vehicle schema would be missing make, model, or year.");
  }
  return problems;
}

function queue(
  list: SEORecommendation[],
  seen: Set<string>,
  input: Omit<SEORecommendation, "id" | "status" | "createdAt"> & { now: string }
): void {
  const fingerprint = `${input.type}|${input.path}|${input.proposed}`;
  if (seen.has(fingerprint)) return;
  if (input.current === input.proposed) return;
  seen.add(fingerprint);
  list.push({
    id: `rec-${hash(fingerprint)}`,
    runId: input.runId,
    path: input.path,
    type: input.type,
    current: input.current,
    proposed: input.proposed,
    reason: input.reason,
    confidence: input.confidence,
    risk: input.risk,
    impact: input.impact,
    status: input.safeToAutoApply ? "applied" : "pending",
    safeToAutoApply: input.safeToAutoApply,
    field: input.field,
    createdAt: input.now,
  });
}

function alreadyHandled(existing: Pick<SeoStore, "recommendations" | "changes">, item: SEORecommendation): boolean {
  return existing.recommendations.some(
    (prior) =>
      prior.type === item.type &&
      prior.path === item.path &&
      prior.proposed === item.proposed &&
      (prior.status === "pending" || prior.status === "applied" || prior.status === "rejected")
  );
}

function changeFrom(
  recommendation: SEORecommendation,
  status: "pending" | "applied",
  overridesBefore: PageOverride | null
): SEOChange {
  return {
    id: `chg-${recommendation.id}`,
    runId: recommendation.runId,
    recommendationId: recommendation.id,
    path: recommendation.path,
    changeType: recommendation.type,
    field: recommendation.field,
    before: recommendation.current,
    after: recommendation.proposed,
    overridesBefore,
    reason: recommendation.reason,
    confidence: recommendation.confidence,
    risk: recommendation.risk,
    status,
    createdAt: recommendation.createdAt,
    resolvedAt: status === "applied" ? recommendation.createdAt : undefined,
  };
}

function groupsOf(vehicles: NormalizedVehicle[]): Array<{ key: string; label: string; make: string; count: number }> {
  const makes = countBy(vehicles, (vehicle) => vehicle.make).map((row) => ({
    key: `make-${row.name}`,
    label: row.name,
    make: row.name,
    count: row.count,
  }));
  const models = countBy(vehicles, (vehicle) => `${vehicle.make} ${vehicle.model}`).map((row) => ({
    key: `model-${row.name}`,
    label: row.name,
    make: row.name.split(" ")[0] || row.name,
    count: row.count,
  }));
  return [...makes, ...models];
}

function countBy(vehicles: NormalizedVehicle[], keyFn: (vehicle: NormalizedVehicle) => string) {
  const map = new Map<string, number>();
  for (const vehicle of vehicles) {
    const key = keyFn(vehicle);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function summarizeSearch(rows: KeywordPerformance[]): WeeklyReport["search"] {
  if (rows.length === 0) {
    return {
      connected: false,
      note: "Search Console is not connected, so clicks, impressions, and positions are not estimated.",
    };
  }
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  const position =
    impressions > 0
      ? rows.reduce((sum, row) => sum + row.position * row.impressions, 0) / impressions
      : 0;
  return {
    connected: true,
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position,
    note: "Totals are from the stored Search Console rows for this run.",
  };
}

function nextActions(week: number, opportunities: WeeklyReport["opportunities"]): string[] {
  const upcoming = themeForWeek(Math.min(26, week + 1));
  const items = opportunities.slice(0, 3).map((item) => item.title);
  return [upcoming.focus, ...items].slice(0, 5);
}

function issue(
  input: { runId: string; now: string },
  path: string,
  severity: SEOIssue["severity"],
  code: string,
  message: string
): SEOIssue {
  return {
    id: `iss-${hash(`${code}|${path}|${message}`)}`,
    runId: input.runId,
    path,
    severity,
    code,
    message,
    createdAt: input.now,
  };
}

function toVehicle(vehicle: NormalizedVehicle): Vehicle {
  return {
    id: vehicle.id,
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim,
    price: vehicle.price ?? 0,
    mileage: vehicle.mileage ?? 0,
    image: vehicle.images[0] || "",
    images: vehicle.images,
    status: vehicle.availability === "pending" ? "pending" : "available",
    vin: vehicle.vin,
    stockNumber: vehicle.stockNumber,
    exteriorColor: vehicle.exteriorColor,
    interiorColor: vehicle.interiorColor,
    engine: vehicle.engine,
    transmission: vehicle.transmission,
    drivetrain: vehicle.drivetrain,
    mpgCity: vehicle.mpgCity,
    mpgHighway: vehicle.mpgHighway,
    slug: vehicle.path.split("/")[2],
  };
}

function vehicleKey(vehicle: Vehicle): string {
  return (vehicle.vin || vehicle.id).trim().toLowerCase();
}

function nameOf(vehicle: NormalizedVehicle): string {
  return [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(" ");
}

function uniqueImages(vehicle: Vehicle): string[] {
  const list = vehicle.images?.length ? vehicle.images : vehicle.image ? [vehicle.image] : [];
  return Array.from(new Set(list.map((url) => url.split("?")[0])));
}

function diffImages(before: string[], after: string[]): { added: number; removed: number } {
  const a = new Set(before);
  const b = new Set(after);
  return {
    added: Array.from(b).filter((url) => !a.has(url)).length,
    removed: Array.from(a).filter((url) => !b.has(url)).length,
  };
}

function changedFields(before: NormalizedVehicle, after: NormalizedVehicle): string[] {
  const fields: Array<keyof NormalizedVehicle> = [
    "trim",
    "exteriorColor",
    "interiorColor",
    "engine",
    "transmission",
    "drivetrain",
    "availability",
  ];
  return fields.filter((field) => before[field] && after[field] && before[field] !== after[field]) as string[];
}

function clean(value?: string): string | undefined {
  const text = value?.trim();
  return text ? text : undefined;
}

function same(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function hash(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

function weekStart(iso: string): string {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() - 6);
  return date.toISOString().slice(0, 10);
}

export function previousSnapshot(snapshots: InventorySnapshot[]): NormalizedVehicle[] {
  return snapshots.length ? snapshots[snapshots.length - 1].vehicles : [];
}

export { vehicleName };
