import type { Metadata } from "next";

import { getActiveProducts } from "@abigail/database";

import { ProductCard } from "@/components/product-card";
import { getDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Cheesecakes | Abigail's Cheesecakes",
  description: "Browse our homemade cheesecakes, available in several sizes.",
  alternates: { canonical: "/cheesecakes" },
};

// Rebuild this page from the database at most every 5 minutes.
export const revalidate = 300;

export default async function CheesecakesPage() {
  const products = await getActiveProducts(getDb());

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold">Our cheesecakes</h1>
      <p className="mt-2 text-muted-foreground">
        Homemade to order. Every cheesecake comes in several sizes.
      </p>

      {products.length === 0 ? (
        <p className="mt-10">No cheesecakes are available right now. Please check back soon.</p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <li key={product.id}>
              {/* The first photo is the main thing on screen on phones, so load it straight away. */}
              <ProductCard product={product} eager={index === 0} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
