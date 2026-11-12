import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types.generated";

/** A Supabase client typed against the generated database schema. */
export type DatabaseClient = SupabaseClient<Database>;

/**
 * Creates a typed Supabase client.
 *
 * The URL and key are passed in rather than read from the environment,
 * so this package works unchanged in Next.js and in a future Expo app.
 * Only the publishable (anon) key belongs here — never the service role key.
 */
export function createDatabaseClient(url: string, publishableKey: string): DatabaseClient {
  if (!url) {
    throw new Error("createDatabaseClient: Supabase URL is required.");
  }
  if (!publishableKey) {
    throw new Error("createDatabaseClient: Supabase publishable key is required.");
  }

  return createClient<Database>(url, publishableKey);
}
