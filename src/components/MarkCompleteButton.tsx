"use client";

/**
 * MarkCompleteButton — appears at the end of every session page.
 *
 * MVP behavior: toggles the slug in the in-memory ProgressProvider. The
 * sidebar listens to the same context and updates its checkmark in the
 * same render. No persistence — that's Phase D/F.
 */

import { useProgress } from "@/components/ProgressProvider";

export function MarkCompleteButton({ slug }: { slug: string }) {
  const { isCompleted, toggle } = useProgress();
  const done = isCompleted(slug);

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      className={[
        "inline-flex items-center gap-2 rounded-md px-4 py-2 text-[14px] font-medium border transition-colors",
        done
          ? "bg-[var(--accent)] border-[var(--accent)] text-white hover:bg-[var(--accent)]/90"
          : "bg-[var(--background-elev)] border-[var(--rule)] text-[var(--foreground)] hover:bg-[var(--background)]",
      ].join(" ")}
      aria-pressed={done}
    >
      <span aria-hidden="true">{done ? "✓" : "○"}</span>
      <span>{done ? "Sessão concluída" : "Marcar como concluída"}</span>
    </button>
  );
}
