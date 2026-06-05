"use server";

import { revalidatePath } from "next/cache";
import { getPool } from "@/lib/db";
import { auth } from "@/auth";

/** Result of a progress mutation. `ok: false` lets the client revert its optimistic state. */
export type ProgressResult = { ok: boolean };

/**
 * Set (or clear) the studied state for one session for the current user.
 * Presence of a row means "studied"; clearing deletes it. Never throws — on
 * any failure it returns { ok: false } and the client reverts. `slug` is the
 * full session key "<chapterSlug>/<fileSlug>".
 */
export async function setStudied(
  slug: string,
  studied: boolean,
): Promise<ProgressResult> {
  const pool = getPool();
  if (!pool) return { ok: false };
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false };

  try {
    if (studied) {
      await pool.query(
        `INSERT INTO progress (user_id, slug, updated_at)
         VALUES ($1, $2, now())
         ON CONFLICT (user_id, slug)
         DO UPDATE SET updated_at = now()`,
        [userId, slug],
      );
    } else {
      await pool.query(
        "DELETE FROM progress WHERE user_id = $1 AND slug = $2",
        [userId, slug],
      );
    }
  } catch (err) {
    console.error("setStudied failed", err);
    return { ok: false };
  }
  // The sidebar checkmarks are server-seeded in the root layout, which wraps
  // every route (including /session/[...slug] where toggles happen). Revalidate
  // the layout segment so the seed refreshes across all of them, not just "/".
  revalidatePath("/", "layout");
  return { ok: true };
}
