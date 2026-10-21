import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";
import { SITE_URL } from "@/lib/dealership";
import { fetchIndexableInventory } from "@/lib/inventory/fetch";
import { readOverride } from "@/lib/seo-system/store";
import { HOME_DESCRIPTION, HOME_TITLE } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const override = await readOverride("/");
  return {
    title: { absolute: override?.title || HOME_TITLE },
    description: override?.description || HOME_DESCRIPTION,
    alternates: { canonical: SITE_URL },
  };
}

export default async function Page() {
  const vehicles = await fetchIndexableInventory();
  return <HomePage vehicles={vehicles} />;
}
