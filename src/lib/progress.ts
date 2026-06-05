import "server-only";
import { getPool } from "./db";
import { auth } from "@/auth";

/**
 * Server-side read of study progress. amt tracks a single binary state per
 * session ("completed" or not), so progress is just the set of studied slugs
 * for the signed-in user. A slug is the full session key,
 * e.g. "ch0-math-foundations/0.1-vector-spaces" (SessionMeta.slug).
 *
 * All functions degrade to "anonymous" (no DB / no session) by returning empty
 * results, never throwing — the page renders the same with or without auth.
 */

/** True when a user is authenticated (and a DB is configured). */
export async function isSignedIn(): Promise<boolean> {
  if (!getPool()) return false;
  const session = await auth();
  return Boolean(session?.user?.id);
}

/** The studied-session slugs for the current user (empty if anon/no DB). */
export async function getStudiedSlugs(): Promise<string[]> {
  const pool = getPool();
  if (!pool) return [];
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const { rows } = await pool.query<{ slug: string }>(
    "SELECT slug FROM progress WHERE user_id = $1",
    [userId],
  );
  return rows.map((r) => r.slug);
}
