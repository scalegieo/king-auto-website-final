import { fetchInventory, getInventoryRevalidateSeconds } from "@/lib/inventory/fetch";
import { HomePage } from "@/components/HomePage";

export const revalidate = getInventoryRevalidateSeconds();

export default async function Page() {
  const vehicles = await fetchInventory();

  return <HomePage vehicles={vehicles} />;
}
