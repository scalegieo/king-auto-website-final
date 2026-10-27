import type { Metadata } from "next";
import { FinancingPage } from "@/components/FinancingPage";
import { DEALERSHIP, SITE_URL } from "@/lib/dealership";

const PLACE = `${DEALERSHIP.city}, ${DEALERSHIP.region} ${DEALERSHIP.postalCode}`;
const TITLE = `Car Financing in ${PLACE}`;
const DESCRIPTION = `Get pre-approved for a used car at ${DEALERSHIP.name} in ${PLACE}. Soft credit check, multiple lenders, and same-day decisions at ${DEALERSHIP.addressLine1}. Call ${DEALERSHIP.phoneDisplay}.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "car financing Aurora CO",
    "used car loans Denver",
    "auto financing Aurora Colorado",
    "pre-approved car loan Havana St",
    "King Auto Inc financing",
    DEALERSHIP.postalCode,
    DEALERSHIP.city,
  ],
  alternates: { canonical: `${SITE_URL}/financing` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/financing`,
    siteName: DEALERSHIP.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/brand/og.png",
        width: 1200,
        height: 630,
        alt: `${DEALERSHIP.name} car financing in ${PLACE}`,
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

export default function FinancingRoute() {
  return <FinancingPage />;
}
