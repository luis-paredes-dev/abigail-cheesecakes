import type { Metadata } from "next";
import Link from "next/link";

import { getActiveProducts } from "@abigail/database";
import { formatPrice } from "@abigail/shared";

import { getDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Cheesecakes | Abigail's Cheesecakes",
  description: "Browse our homemade cheesecakes, available in several sizes.",
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
          {products.map((product) => {
            const prices = product.product_sizes.map((size) => size.price_pence);
            const fromPrice = prices.length > 0 ? Math.min(...prices) : null;

            return (
              <li key={product.id}>
                <Link
                  href={`/cheesecakes/${product.slug}`}
                  className="group block h-full rounded-xl border p-4 transition-shadow hover:shadow-md focus-visible:outline-2"
                >
                  <div aria-hidden="true" className="aspect-square w-full rounded-lg bg-muted" />
                  <h2 className="mt-4 text-lg font-semibold group-hover:underline">
                    {product.name}
                  </h2>
                  {product.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {product.description}
                    </p>
                  )}
                  {fromPrice !== null && (
                    <p className="mt-3 font-medium">From {formatPrice(fromPrice)}</p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
