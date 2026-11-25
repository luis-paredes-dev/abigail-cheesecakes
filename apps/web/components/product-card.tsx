import Link from "next/link";

import type { ProductWithSizes } from "@abigail/database";
import { formatPrice } from "@abigail/shared";

import { ProductImage } from "@/components/product-image";

type Props = {
  product: ProductWithSizes;
  /** h2 on the catalogue page, h3 inside a titled section such as the home page. */
  headingLevel?: "h2" | "h3";
  /** Load the photo straight away; use for the first card when it's at the top of the page. */
  eager?: boolean;
};

export function ProductCard({ product, headingLevel = "h2", eager = false }: Props) {
  const Heading = headingLevel;
  const prices = product.product_sizes.map((size) => size.price_pence);
  const fromPrice = prices.length > 0 ? Math.min(...prices) : null;

  return (
    <Link
      href={`/cheesecakes/${product.slug}`}
      className="group block h-full rounded-xl border bg-card p-4 transition-shadow hover:shadow-md focus-visible:outline-2"
    >
      <ProductImage
        slug={product.slug}
        name={product.name}
        sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
        className="rounded-lg"
        eager={eager}
      />
      <Heading className="mt-4 text-lg font-semibold group-hover:underline">{product.name}</Heading>
      {product.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
      )}
      {fromPrice !== null && <p className="mt-3 font-medium">From {formatPrice(fromPrice)}</p>}
    </Link>
  );
}
