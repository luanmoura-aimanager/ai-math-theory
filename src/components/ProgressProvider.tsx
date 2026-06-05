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

  // Mirror the latest set in a ref so toggle() can read current state and run
  // its persistence side effect *outside* the state updater (Strict Mode calls
  // updaters twice in dev — a side effect there would double-fire).
  const completedRef = useRef(completed);
  useEffect(() => {
    completedRef.current = completed;
  }, [completed]);

  // setState lives inside this effect by necessity: localStorage is unavailable
  // during SSR, so progress can only be hydrated/migrated after mount. This is
  // the SSR-safe pattern the rule below can't statically see.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
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
    // leftover local slugs up once, then drop the local copy so we don't repeat.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const seeded = new Set(initialCompleted ?? []);
      const toMigrate = (JSON.parse(raw) as string[]).filter(
        (s) => !seeded.has(s),
      );
      if (toMigrate.length > 0) {
        setCompleted((prev) => {
          const next = new Set(prev);
          toMigrate.forEach((s) => next.add(s));
          return next;
        });
        Promise.all(toMigrate.map((s) => setStudied(s, true))).finally(() => {
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch {
            // best-effort cleanup
          }
        });
      } else {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // best-effort cleanup
        }
      }
    } catch {
      // Ignore malformed local data — server state already stands.
    }
  }, [signedIn, initialCompleted]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggle = useCallback(
    (slug: string) => {
      const willComplete = !completedRef.current.has(slug);

      setCompleted((prev) => {
        const next = new Set(prev);
        if (willComplete) next.add(slug);
        else next.delete(slug);
        return next;
      });

      if (signedIn) {
        // Persist to Neon; revert the optimistic change if the write failed.
        setStudied(slug, willComplete).then((res) => {
          if (res.ok) return;
          setCompleted((cur) => {
            const reverted = new Set(cur);
            if (willComplete) reverted.delete(slug);
            else reverted.add(slug);
            return reverted;
          });
        });
      } else {
        // Anonymous: persist to localStorage.
        try {
          const next = new Set(completedRef.current);
          if (willComplete) next.add(slug);
          else next.delete(slug);
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
        } catch {
          // best-effort; progress is still correct in memory
        }
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
