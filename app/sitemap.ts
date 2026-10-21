import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/dealership";
import { fetchIndexableInventory } from "@/lib/inventory/fetch";
import { vehicleHref } from "@/lib/inventory/slug";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await fetchIndexableInventory();
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/inventory`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...vehicles.map((vehicle) => ({
      url: `${SITE_URL}${vehicleHref(vehicle)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
