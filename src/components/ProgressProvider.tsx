"use client";

// Progress state for the study site. This is the swap point described in
// CLAUDE.md §6: the public API (`useProgress()` -> { completed, isCompleted,
// toggle }) is unchanged, so Sidebar and MarkCompleteButton compile as-is.
//
// Two backends, chosen at runtime by the `signedIn` prop:
//   - anonymous  -> browser localStorage (the original MVP behaviour)
//   - signed-in  -> Neon via the setStudied() server action; `initialCompleted`
//                   is server-seeded in layout.tsx so checkmarks are correct on
//                   first paint (no SSR flicker for signed-in users).
// On first sign-in, any local slugs are migrated up once so history survives.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { setStudied } from "@/app/actions/progress";

const STORAGE_KEY = "ai-math-theory:progress:v1";

type ProgressContextValue = {
  completed: ReadonlySet<string>;
  isCompleted: (slug: string) => boolean;
  toggle: (slug: string) => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({
  children,
  signedIn = false,
  initialCompleted,
}: {
  children: ReactNode;
  signedIn?: boolean;
  initialCompleted?: string[];
}) {
  const [completed, setCompleted] = useState<Set<string>>(
    () => new Set(initialCompleted ?? []),
  );

  // Mirror the latest set in a ref so toggle() can read current state without a
  // stale closure when deciding whether a click marks or unmarks.
  const completedRef = useRef(completed);
  useEffect(() => {
    completedRef.current = completed;
  }, [completed]);

  // The last state the SERVER has confirmed for the signed-in user — the
  // baseline a failed write reverts to. Reverting to this (not to the inverse
  // of the click) keeps overlapping toggles from leaving the UI disagreeing
  // with the database. Seeded from the server-rendered slugs.
  const confirmedRef = useRef<Set<string>>(new Set(initialCompleted ?? []));

  // Hydration/migration is one-time work. layout passes a fresh `initialCompleted`
  // array on every server render, so without this guard the effect below would
  // re-fire on each re-render (e.g. after a revalidation).
  const hydratedRef = useRef(false);

  // setState lives inside this effect by necessity: localStorage is unavailable
  // during SSR, so progress can only be hydrated/migrated after mount. This is
  // the SSR-safe pattern the rule below can't statically see.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    if (!signedIn) {
      // Anonymous: hydrate from localStorage after mount (unavailable in SSR).
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setCompleted(new Set(JSON.parse(raw) as string[]));
      } catch {
        // Quota exceeded, private mode, or corrupt data — start fresh.
      }
      return;
    }

    // Signed-in: server-seeded state is the source of truth. Migrate any
    // leftover local slugs up once. Persist localStorage to the slugs that
    // FAILED to write (so the next load retries them) rather than blindly
    // clearing it — otherwise a transient DB error would silently drop history.
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage unreadable — server state already stands.
    }
    if (!raw) return;

    let toMigrate: string[];
    try {
      const seeded = new Set(initialCompleted ?? []);
      toMigrate = (JSON.parse(raw) as string[]).filter((s) => !seeded.has(s));
    } catch {
      // Corrupt local data — drop it; server state is authoritative.
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // best-effort cleanup
      }
      return;
    }

    if (toMigrate.length === 0) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // best-effort cleanup
      }
      return;
    }

    // Optimistically reflect the migrated slugs in the UI.
    setCompleted((prev) => {
      const next = new Set(prev);
      toMigrate.forEach((s) => next.add(s));
      return next;
    });

    void (async () => {
      const settled = await Promise.all(
        toMigrate.map(async (s) => ({
          slug: s,
          ok: (await setStudied(s, true)).ok,
        })),
      );
      const failed = settled.filter((r) => !r.ok).map((r) => r.slug);
      // Successful slugs are now the server's truth.
      confirmedRef.current = new Set(confirmedRef.current);
      settled
        .filter((r) => r.ok)
        .forEach((r) => confirmedRef.current.add(r.slug));
      try {
        if (failed.length > 0)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(failed));
        else localStorage.removeItem(STORAGE_KEY);
      } catch {
        // best-effort; failures stay queued in memory either way
      }
    })();
  }, [signedIn, initialCompleted]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggle = useCallback(
    (slug: string) => {
      const willComplete = !completedRef.current.has(slug);

      // Single optimistic update. For anonymous users, persist localStorage
      // here using the freshly-composed `next` set — NOT a lagging ref — so two
      // rapid toggles of different slugs can't clobber each other's write. The
      // setItem is idempotent, so a Strict-Mode double-invoke is harmless; the
      // non-idempotent server call below stays outside the updater.
      setCompleted((prev) => {
        const next = new Set(prev);
        if (willComplete) next.add(slug);
        else next.delete(slug);
        if (!signedIn) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
          } catch {
            // best-effort; progress is still correct in memory
          }
        }
        return next;
      });

      if (signedIn) {
        setStudied(slug, willComplete).then((res) => {
          if (res.ok) {
            // Record the new server truth for this slug.
            const c = new Set(confirmedRef.current);
            if (willComplete) c.add(slug);
            else c.delete(slug);
            confirmedRef.current = c;
            return;
          }
          // Write failed: revert this slug to the last server-confirmed value,
          // not the inverse of this click, so an overlapping toggle that already
          // succeeded isn't clobbered by a stale failure.
          const studied = confirmedRef.current.has(slug);
          setCompleted((cur) => {
            if (cur.has(slug) === studied) return cur;
            const reverted = new Set(cur);
            if (studied) reverted.add(slug);
            else reverted.delete(slug);
            return reverted;
          });
        });
      }
    },
    [signedIn],
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      completed,
      isCompleted: (slug) => completed.has(slug),
      toggle,
    }),
    [completed, toggle],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx)
    throw new Error("useProgress must be used inside <ProgressProvider>");
  return ctx;
}
