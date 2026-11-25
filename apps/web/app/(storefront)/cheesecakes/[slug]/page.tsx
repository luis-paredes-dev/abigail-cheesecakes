import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { getActiveProducts, getProductBySlug } from "@abigail/database";

import { ProductSizes } from "@/components/product-sizes";
import { getDb } from "@/lib/db";

// Rebuild each product page from the database at most every 5 minutes.
export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

// Metadata and the page both need the product; cache() makes it one database query.
const loadProduct = cache((slug: string) => getProductBySlug(getDb(), slug));

// Pre-build a page for every active cheesecake at build time.
export async function generateStaticParams() {
  const products = await getActiveProducts(getDb());
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);

  if (!product) {
    return { title: "Cheesecake not found | Abigail's Cheesecakes" };
  }

  return {
    title: `${product.name} | Abigail's Cheesecakes`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await loadProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/cheesecakes" className="text-sm text-muted-foreground hover:underline">
        ← All cheesecakes
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div aria-hidden="true" className="aspect-square w-full rounded-xl bg-muted" />

        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {product.description && (
            <p className="mt-3 text-muted-foreground">{product.description}</p>
          )}

          <div className="mt-8">
            <ProductSizes sizes={product.product_sizes} />
          </div>
        </div>
      </div>
    </section>
  );
}
