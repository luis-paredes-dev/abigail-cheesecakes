import type { DatabaseClient } from "../client";

export type OrderItemInput = {
  productSizeId: string;
  quantity: number;
};

type OrderBase = {
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  items: OrderItemInput[];
};

/** Delivery orders need a zone and address; pickup orders cannot have them. */
export type CreateOrderInput =
  | (OrderBase & { fulfilmentMethod: "delivery"; deliveryZoneId: string; deliveryAddress: string })
  | (OrderBase & { fulfilmentMethod: "pickup" });

/**
 * Places an order via the place_order database function.
 * Prices and totals are calculated in the database, never sent from the client.
 * Returns the short order reference (e.g. "A3F9C21B").
 */
export async function createOrder(db: DatabaseClient, input: CreateOrderInput): Promise<string> {
  const deliveryArgs =
    input.fulfilmentMethod === "delivery"
      ? { p_delivery_zone_id: input.deliveryZoneId, p_delivery_address: input.deliveryAddress }
      : {};

  const { data, error } = await db.rpc("place_order", {
    p_full_name: input.fullName,
    p_phone: input.phone,
    p_fulfilment_method: input.fulfilmentMethod,
    p_items: input.items.map((item) => ({
      product_size_id: item.productSizeId,
      quantity: item.quantity,
    })),
    p_email: input.email,
    p_notes: input.notes,
    ...deliveryArgs,
  });

  if (error) {
    throw new Error(`createOrder failed: ${error.message}`);
  }
  return data;
}
