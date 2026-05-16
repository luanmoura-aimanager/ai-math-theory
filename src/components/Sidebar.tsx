"use client";

/**
 * Sidebar — chapter/session navigation with completion checkmarks.
 *
 * Receives the chapter tree as props (computed on the server in layout.tsx)
 * and reads completion state from the client-side ProgressProvider. The
 * current pathname highlights the active session.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ChapterMeta } from "@/lib/content";
import { useProgress } from "@/components/ProgressProvider";

export function Sidebar({ chapters }: { chapters: ChapterMeta[] }) {
  const pathname = usePathname();
  const { isCompleted } = useProgress();

  return (
    <nav
      aria-label="Course contents"
      className="h-full w-72 shrink-0 border-r border-[var(--rule)] bg-[var(--background-elev)] overflow-y-auto"
    >
      <div className="px-5 py-5 border-b border-[var(--rule)]">
        <Link href="/" className="block">
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Course
          </div>
          <div className="mt-1 text-[15px] font-semibold text-[var(--foreground)] leading-snug">
            From the Perceptron to LLMs
          </div>
        </Link>
      </div>

      <ol className="px-2 py-4 space-y-5">
        {chapters.map((chapter) => (
          <li key={chapter.slug}>
            <div className="px-3 pb-2 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
              {chapter.title}
            </div>
            <ul className="space-y-0.5">
              {chapter.sessions.map((session) => {
                const href = `/session/${session.slug}`;
                const active = pathname === href;
                const done = isCompleted(session.slug);
                return (
                  <li key={session.slug}>
                    <Link
                      href={href}
                      className={[
                        "group flex items-start gap-2.5 rounded-md px-3 py-2 text-[13.5px] leading-snug",
                        active
                          ? "bg-[var(--accent-soft)] text-[var(--foreground)]"
                          : "text-[var(--foreground)] hover:bg-[var(--background)]",
                      ].join(" ")}
                    >
                      <CheckMark done={done} />
                      <span className="flex-1">{session.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function CheckMark({ done }: { done: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={[
        "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] leading-none",
        done
          ? "bg-[var(--accent)] border-[var(--accent)] text-white"
          : "border-[var(--rule)] text-transparent",
      ].join(" ")}
    >
      {done ? "✓" : "·"}
    </span>
  );
}
