import { formatPrice } from "./units";

export type OrderMessageLine = {
  quantity: number;
  productName: string;
  sizeLabel: string;
  unitPricePence: number;
};

export type OrderMessageInput = {
  reference: string;
  customerName: string;
  phone: string;
  lines: OrderMessageLine[];
  fulfilment:
    | { method: "pickup" }
    | { method: "delivery"; zoneName: string; feePence: number; address: string };
  notes?: string;
};

/** The WhatsApp message a customer sends to confirm their order. */
export function formatOrderMessage(input: OrderMessageInput): string {
  const subtotal = input.lines.reduce((sum, l) => sum + l.unitPricePence * l.quantity, 0);
  const fee = input.fulfilment.method === "delivery" ? input.fulfilment.feePence : 0;

  const parts = [
    "Hi Abigail! I've just placed an order on your website.",
    "",
    `Order: ${input.reference}`,
    `Name: ${input.customerName}`,
    `Phone: ${input.phone}`,
    "",
    ...input.lines.map(
      (l) =>
        `${l.quantity} × ${l.productName} (${l.sizeLabel}) — ${formatPrice(l.unitPricePence * l.quantity)}`,
    ),
    "",
    `Subtotal: ${formatPrice(subtotal)}`,
  ];

  if (input.fulfilment.method === "delivery") {
    parts.push(
      `Delivery (${input.fulfilment.zoneName}): ${formatPrice(fee)}`,
      `Total: ${formatPrice(subtotal + fee)}`,
      "",
      `Delivery address: ${input.fulfilment.address}`,
    );
  } else {
    parts.push(`Total: ${formatPrice(subtotal)}`, "", "Pickup");
  }

  if (input.notes) {
    parts.push(`Notes: ${input.notes}`);
  }

  return parts.join("\n");
}

/** A link that opens WhatsApp with the message ready to send. Number in international format, digits only. */
export function whatsappLink(phoneNumber: string, message: string): string {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
