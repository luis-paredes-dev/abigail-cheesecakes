import type { Metadata } from "next";

import { getActiveDeliveryZones } from "@abigail/database";

import { CheckoutForm } from "@/components/checkout-form";
import { getDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Checkout | Abigail's Cheesecakes",
  robots: { index: false },
};

// Delivery zones and fees can change, so refresh them at most every 5 minutes.
export const revalidate = 300;

export default async function CheckoutPage() {
  const zones = await getActiveDeliveryZones(getDb());

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <div className="mt-8">
        <CheckoutForm zones={zones} />
      </div>
    </section>
  );
}
