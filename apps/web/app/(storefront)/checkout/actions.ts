"use server";

import { createOrder, getActiveDeliveryZones, getActiveProducts } from "@abigail/database";
import { formatOrderMessage, whatsappLink, type OrderMessageLine } from "@abigail/shared";
import { createOrderSchema } from "@abigail/validation";

import { getDb } from "@/lib/db";

/** Form fields sent back after an error, so the customer doesn't have to retype them. */
export type CheckoutValues = {
  fullName: string;
  phone: string;
  email: string;
  notes: string;
  fulfilmentMethod: string;
  deliveryZoneId: string;
  deliveryAddress: string;
};

export type CheckoutState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors: Partial<Record<keyof CheckoutValues | "items", string>>;
      values: CheckoutValues;
    }
  | { status: "success"; reference: string; whatsappUrl: string };

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseItems(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function placeOrder(
  _previous: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const values: CheckoutValues = {
    fullName: text(formData, "fullName"),
    phone: text(formData, "phone"),
    email: text(formData, "email"),
    notes: text(formData, "notes"),
    fulfilmentMethod: text(formData, "fulfilmentMethod"),
    deliveryZoneId: text(formData, "deliveryZoneId"),
    deliveryAddress: text(formData, "deliveryAddress"),
  };

  // 1. Validate with the same Zod schema the rest of the project uses.
  const parsed = createOrderSchema.safeParse({
    ...values,
    email: values.email || undefined,
    notes: values.notes || undefined,
    items: parseItems(text(formData, "items")),
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof CheckoutValues | "items", string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !(field in fieldErrors)) {
        fieldErrors[field as keyof CheckoutValues | "items"] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
      values,
    };
  }

  const whatsappNumber = process.env.WHATSAPP_NUMBER;
  if (!whatsappNumber) {
    console.error("placeOrder: WHATSAPP_NUMBER is not set");
    return {
      status: "error",
      message: "Online ordering is temporarily unavailable. Please try again later.",
      fieldErrors: {},
      values,
    };
  }

  const order = parsed.data;
  const db = getDb();

  // 2. Save the order. place_order reads the real prices from the database.
  let reference: string;
  try {
    reference = await createOrder(db, order);
  } catch (error) {
    console.error(error);
    const unavailable = error instanceof Error && error.message.includes("unavailable");
    return {
      status: "error",
      message: unavailable
        ? "Something in your basket is no longer available. Please review your basket and try again."
        : "Sorry, we couldn't place your order. Please try again.",
      fieldErrors: {},
      values,
    };
  }

  // 3. Build the WhatsApp message from database prices, not the basket's copy.
  const [products, zones] = await Promise.all([getActiveProducts(db), getActiveDeliveryZones(db)]);
  const sizes = new Map(
    products.flatMap((product) =>
      product.product_sizes.map((size) => [size.id, { product, size }] as const),
    ),
  );

  const lines: OrderMessageLine[] = order.items.flatMap((item) => {
    const match = sizes.get(item.productSizeId);
    return match
      ? [
          {
            quantity: item.quantity,
            productName: match.product.name,
            sizeLabel: match.size.label,
            unitPricePence: match.size.price_pence,
          },
        ]
      : [];
  });

  const zone =
    order.fulfilmentMethod === "delivery"
      ? zones.find((z) => z.id === order.deliveryZoneId)
      : undefined;

  const message = formatOrderMessage({
    reference,
    customerName: order.fullName,
    phone: order.phone,
    lines,
    fulfilment:
      order.fulfilmentMethod === "delivery"
        ? {
            method: "delivery",
            zoneName: zone?.name ?? "Delivery",
            feePence: zone?.fee_pence ?? 0,
            address: order.deliveryAddress,
          }
        : { method: "pickup" },
    notes: order.notes,
  });

  return { status: "success", reference, whatsappUrl: whatsappLink(whatsappNumber, message) };
}
