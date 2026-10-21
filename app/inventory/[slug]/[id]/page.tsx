import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/MarketingShell";
import { VehicleDetail } from "@/components/inventory/VehicleDetail";
import { DEALERSHIP } from "@/lib/dealership";
import { fetchIndexableInventory, getVehicle } from "@/lib/inventory/fetch";
import {
  vehicleCanonical,
  vehicleJsonLd,
  vehicleKeywords,
  vehicleSeoDescription,
  vehicleSeoTitle,
} from "@/lib/inventory/seo";
import { vehicleHref, vehicleName, vehicleRouteId, vehicleSlug } from "@/lib/inventory/slug";
import { relatedVehicles } from "@/lib/seo-system/related";
import { readOverride } from "@/lib/seo-system/store";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type RouteParams = { slug: string; id: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  const vehicles = await fetchIndexableInventory();
  return vehicles.map((vehicle) => ({
    slug: vehicleSlug(vehicle),
    id: vehicleRouteId(vehicle),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const vehicle = await getVehicle(params.slug, params.id);
  if (!vehicle) return { title: "Vehicle", robots: { index: false, follow: false } };

  const override = await readOverride(vehicleHref(vehicle));
  const title = override?.title || vehicleSeoTitle(vehicle);
  const description = override?.description || vehicleSeoDescription(vehicle);
  const url = vehicleCanonical(vehicle);
  const image = vehicle.images?.[0] || vehicle.image;
  const alt = `${vehicleName(vehicle)} for sale in ${DEALERSHIP.city}, ${DEALERSHIP.region} ${DEALERSHIP.postalCode}`;

  return {
    title,
    description,
    keywords: vehicleKeywords(vehicle),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: DEALERSHIP.name,
      locale: "en_US",
      images: image ? [{ url: image, alt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function VehiclePage({ params }: { params: RouteParams }) {
  const vehicle = await getVehicle(params.slug, params.id);
  if (!vehicle) notFound();
  const inventory = await fetchIndexableInventory();
  const related = relatedVehicles(vehicle, inventory);

  const jsonLd = vehicleJsonLd(vehicle);

  return (
    <MarketingShell vehicleInterest={vehicleName(vehicle)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VehicleDetail vehicle={vehicle} related={related} />
    </MarketingShell>
  );
}
