import { getDb } from "@/lib/db";

// Always run on request: a cached response would never reach the database.
export const dynamic = "force-dynamic";

/**
 * Keep-alive for the Supabase free plan, which pauses a project after about
 * 7 days without database activity. Called once a day by Vercel Cron
 * (see `vercel.json`). Vercel sends `Authorization: Bearer <CRON_SECRET>`,
 * so other callers are rejected.
 */
export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;

  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }

  // One cheap read through the normal RLS path counts as activity.
  const { error } = await getDb().from("products").select("id").limit(1);

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, checkedAt: new Date().toISOString() });
}
