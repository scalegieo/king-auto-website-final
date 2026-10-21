import type { Vehicle } from "./types";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function vehicleSlug(vehicle: Vehicle): string {
  if (vehicle.slug) return vehicle.slug;
  return slugify(
    [vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
      .filter(Boolean)
      .join(" ")
  );
}

export function vehicleRouteId(vehicle: Vehicle): string {
  return String(vehicle.id).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Canonical path for a vehicle detail page. */
export function vehicleHref(vehicle: Vehicle): string {
  return `/inventory/${vehicleSlug(vehicle)}/${vehicleRouteId(vehicle)}`;
}

export function vehicleName(vehicle: Vehicle): string {
  return [vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
    .filter(Boolean)
    .join(" ");
}
