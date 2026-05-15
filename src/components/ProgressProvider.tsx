"use client";

// localStorage-backed progress for MVP. Swap point documented in CLAUDE.md §6:
// when DB+auth come back, replace this file only — Sidebar and MarkCompleteButton
// consume useProgress() and must compile with zero changes.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "ai-math-theory:progress:v1";

type ProgressContextValue = {
  completed: ReadonlySet<string>;
  isCompleted: (slug: string) => boolean;
  toggle: (slug: string) => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());

  // Load from localStorage after mount — storage is unavailable during SSR,
  // so the first paint shows zero checkmarks and they pop in on hydrate (§7.4).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCompleted(new Set(JSON.parse(raw) as string[]));
    } catch {
      // Quota exceeded, private mode, or corrupt data — start fresh.
    }
  }, []);

  // Persist whenever completed changes (skip the initial empty-set write).
  useEffect(() => {
    if (completed.size === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
    } catch {
      // Ignore write failures — progress is still correct in memory.
    }
  }, [completed]);

  const toggle = useCallback((slug: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // best-effort
      }
      return next;
    });
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      completed,
      isCompleted: (slug) => completed.has(slug),
      toggle,
    }),
    [completed, toggle],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside <ProgressProvider>");
  return ctx;
}
