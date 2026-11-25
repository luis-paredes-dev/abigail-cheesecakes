import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { getActiveProducts, getProductBySlug } from "@abigail/database";

import { ProductImage } from "@/components/product-image";
import { ProductSizes } from "@/components/product-sizes";
import { getDb } from "@/lib/db";
import { SITE_NAME } from "@/lib/site";

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

  const title = `${product.name} | ${SITE_NAME}`;
  const description = product.description ?? undefined;

  return {
    title,
    description,
    alternates: { canonical: `/cheesecakes/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `/cheesecakes/${product.slug}`,
      siteName: SITE_NAME,
      locale: "en_GB",
      type: "website",
    },
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
        <ProductImage
          slug={product.slug}
          name={product.name}
          sizes="(min-width: 768px) 480px, 90vw"
          className="rounded-xl"
        />

        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {product.description && (
            <p className="mt-3 text-muted-foreground">{product.description}</p>
          )}

          <div className="mt-8">
            <ProductSizes
              productName={product.name}
              productSlug={product.slug}
              sizes={product.product_sizes}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
