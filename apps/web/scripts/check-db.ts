/**
 * Database smoke test: fetches active products through @abigail/database
 * using the publishable key, exactly as a website visitor would (RLS applies).
 *
 * Run with: pnpm --filter web db:check
 */
import { createDatabaseClient, getActiveProducts } from "@abigail/database";

function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in apps/web/.env.local",
    );
  }

  const db = createDatabaseClient(url, key);
  const products = await getActiveProducts(db);

  console.log(`Found ${products.length} active product(s):\n`);
  for (const product of products) {
    console.log(`- ${product.name} (/${product.slug})`);
    for (const size of product.product_sizes) {
      console.log(`    ${size.label}: ${formatPence(size.price_pence)}`);
    }
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
