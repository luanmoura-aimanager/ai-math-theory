import "server-only";
import { getPool } from "./db";
import { auth } from "@/auth";

/**
 * Server-side read of study progress. amt tracks a single binary state per
 * session ("completed" or not), so progress is just the set of studied slugs
 * for the signed-in user. A slug is the full session key,
 * e.g. "ch0-math-foundations/0.1-vector-spaces" (SessionMeta.slug).
 *
 * Degrades to "anonymous" (no DB / no session) without throwing — the page
 * renders the same with or without auth.
 */

export type ProgressState = {
  signedIn: boolean;
  /** Studied-session slugs for the current user (empty if anon/no DB). */
  completed: string[];
};

/**
 * Resolve sign-in status and studied slugs in a SINGLE auth() lookup. The
 * layout needs both, and auth() hits the session store, so we don't want to
 * call it twice per render.
 */
export async function getProgressState(): Promise<ProgressState> {
  const pool = getPool();
  if (!pool) return { signedIn: false, completed: [] };
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { signedIn: false, completed: [] };

  const { rows } = await pool.query<{ slug: string }>(
    "SELECT slug FROM progress WHERE user_id = $1",
    [userId],
  );
  return { signedIn: true, completed: rows.map((r) => r.slug) };
}
