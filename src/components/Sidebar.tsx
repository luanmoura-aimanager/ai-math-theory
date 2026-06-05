"use client";

/**
 * Sidebar — chapter/session navigation with completion checkmarks.
 *
 * Receives the chapter tree as props (computed on the server in layout.tsx)
 * and reads completion state from the client-side ProgressProvider. The
 * current pathname highlights the active session.
 *
 * On viewports below `md` the sidebar collapses into a slide-in drawer
 * controlled by a fixed hamburger button. The button lives here (not in the
 * header) so the open/close state can stay local and Header can remain a
 * server component.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ChapterMeta } from "@/lib/content";
import { useProgress } from "@/components/ProgressProvider";

export function Sidebar({ chapters }: { chapters: ChapterMeta[] }) {
  const pathname = usePathname();
  const { isCompleted } = useProgress();
  const [open, setOpen] = useState(false);

  // Close the drawer when the user navigates to a session on mobile. Syncing to
  // a route change is exactly the external-system case this setState-in-effect
  // is meant for, so the rule's cascading-render warning doesn't apply.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="course-contents"
        onClick={() => setOpen((v) => !v)}
        className="md:hidden fixed top-2.5 left-3 z-50 inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--rule)] bg-[var(--background-elev)] text-[var(--foreground)] shadow-sm"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 z-30 bg-black/40"
        />
      )}

      <nav
        id="course-contents"
        aria-label="Course contents"
        className={[
          "border-r border-[var(--rule)] bg-[var(--background-elev)] overflow-y-auto",
          // Mobile: fixed slide-in drawer.
          "fixed inset-y-0 left-0 z-40 w-72 transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop (>= md): in-flow column, always visible.
          "md:static md:translate-x-0 md:h-full md:shrink-0",
        ].join(" ")}
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
    </>
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

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      className="h-5 w-5"
    >
      <path d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      className="h-5 w-5"
    >
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}
