import type { DatabaseClient } from "../client";

/** Active delivery zones with their fees, in display order. */
export async function getActiveDeliveryZones(db: DatabaseClient) {
  const { data, error } = await db
    .from("delivery_zones")
    .select("id, name, description, fee_pence")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  if (error) {
    throw new Error(`getActiveDeliveryZones failed: ${error.message}`);
  }
  return data;
}

export type DeliveryZone = Awaited<ReturnType<typeof getActiveDeliveryZones>>[number];
