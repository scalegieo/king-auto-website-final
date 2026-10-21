import type { Metadata } from "next";
import { MarketingShell } from "@/components/MarketingShell";
import { InventoryGrid } from "@/components/InventoryGrid";
import { DEALERSHIP, SITE_URL } from "@/lib/dealership";
import { fetchIndexableInventory } from "@/lib/inventory/fetch";
import { inventoryJsonLd } from "@/lib/inventory/seo";

export const dynamic = "force-dynamic";

const PLACE = `${DEALERSHIP.city}, ${DEALERSHIP.region} ${DEALERSHIP.postalCode}`;
const TITLE = `Used Cars for Sale in ${PLACE}`;
const DESCRIPTION = `Browse used cars, trucks, and SUVs for sale at ${DEALERSHIP.name} in ${PLACE}. Live inventory with year, make, model, price, and mileage at ${DEALERSHIP.addressLine1}. Serving Denver and Aurora. Call ${DEALERSHIP.phoneDisplay}.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "used cars Aurora CO",
    "used cars Denver",
    `used cars ${DEALERSHIP.postalCode}`,
    "cars for sale Aurora Colorado",
    "Havana St dealership",
    "King Auto Inc inventory",
    DEALERSHIP.postalCode,
    DEALERSHIP.city,
  ],
  alternates: { canonical: `${SITE_URL}/inventory` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/inventory`,
    siteName: DEALERSHIP.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/brand/og.png",
        width: 1200,
        height: 630,
        alt: `${DEALERSHIP.name} used cars in ${PLACE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/brand/og.png"],
  },
};

export default async function InventoryPage() {
  const vehicles = await fetchIndexableInventory();
  const jsonLd = inventoryJsonLd(vehicles);

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="pt-16 sm:pt-20">
        <InventoryGrid vehicles={vehicles} variant="page" />
      </div>
    </MarketingShell>
  );
}
