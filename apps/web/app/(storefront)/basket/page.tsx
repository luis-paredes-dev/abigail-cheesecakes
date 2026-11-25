import type { Metadata } from "next";

import { BasketView } from "@/components/basket-view";

export const metadata: Metadata = {
  title: "Your basket | Abigail's Cheesecakes",
  // A visitor's basket is personal, so search engines shouldn't list this page.
  robots: { index: false },
};

export default function BasketPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Your basket</h1>
      <div className="mt-8">
        <BasketView />
      </div>
    </section>
  );
}
