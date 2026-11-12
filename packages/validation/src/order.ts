import { z } from "zod";

import { customerSchema } from "./customer";

export const orderItemSchema = z.object({
  productSizeId: z.uuid(),
  quantity: z.int().min(1).max(20),
});

const orderBaseSchema = customerSchema.extend({
  notes: z.string().trim().max(500).optional(),
  items: z.array(orderItemSchema).min(1, "Your basket is empty").max(50),
});

/** Mirrors the database rule: delivery needs a zone and address; pickup has neither. */
export const createOrderSchema = z.discriminatedUnion("fulfilmentMethod", [
  orderBaseSchema.extend({
    fulfilmentMethod: z.literal("delivery"),
    deliveryZoneId: z.uuid("Choose a delivery area"),
    deliveryAddress: z.string().trim().min(5, "Enter your full address").max(300),
  }),
  orderBaseSchema.extend({
    fulfilmentMethod: z.literal("pickup"),
  }),
]);

export type OrderItem = z.infer<typeof orderItemSchema>;
export type CreateOrder = z.infer<typeof createOrderSchema>;
