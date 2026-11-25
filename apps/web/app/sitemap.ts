import type { MetadataRoute } from "next";

import { getActiveProducts } from "@abigail/database";

import { getDb } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

// Rebuild the sitemap from the database at most once an hour.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getActiveProducts(getDb());

  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/cheesecakes`, changeFrequency: "weekly", priority: 0.8 },
    ...products.map((product) => ({
      url: `${SITE_URL}/cheesecakes/${product.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
