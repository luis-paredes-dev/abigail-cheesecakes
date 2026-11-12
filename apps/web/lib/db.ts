import { createDatabaseClient, type DatabaseClient } from "@abigail/database";

/**
 * Creates the Supabase client used by Server Components.
 * Uses the publishable key only, so RLS applies exactly as for any visitor.
 */
export function getDb(): DatabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in apps/web/.env.local",
    );
  }

  return createDatabaseClient(url, key);
}
