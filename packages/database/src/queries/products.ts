import type { DatabaseClient } from "../client";

const PRODUCT_WITH_SIZES =
  "id, slug, name, description, image_path, sort_order, product_sizes ( id, label, diameter_mm, height_mm, weight_g, serves, price_pence, sort_order )";

/** All active cheesecakes with their active sizes, in display order. */
export async function getActiveProducts(db: DatabaseClient) {
  const { data, error } = await db
    .from("products")
    .select(PRODUCT_WITH_SIZES)
    .eq("is_active", true)
    .eq("product_sizes.is_active", true)
    .order("sort_order")
    .order("name")
    .order("sort_order", { referencedTable: "product_sizes" });

  if (error) {
    throw new Error(`getActiveProducts failed: ${error.message}`);
  }
  return data;
}

/** One active cheesecake by its URL slug, or null if not found. */
export async function getProductBySlug(db: DatabaseClient, slug: string) {
  const { data, error } = await db
    .from("products")
    .select(PRODUCT_WITH_SIZES)
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("product_sizes.is_active", true)
    .order("sort_order", { referencedTable: "product_sizes" })
    .maybeSingle();

  if (error) {
    throw new Error(`getProductBySlug failed: ${error.message}`);
  }
  return data;
}

/** The shape returned for each product, inferred from the query itself. */
export type ProductWithSizes = Awaited<ReturnType<typeof getActiveProducts>>[number];
