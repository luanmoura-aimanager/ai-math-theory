/**
 * /session/[...slug] — renders one MDX session.
 *
 * The catch-all `[...slug]` matches "ch0-math-foundations/0.1-vector-spaces"
 * as a two-segment path. We:
 *   1. validate the slug exists in the content tree,
 *   2. dynamically import the .mdx file (compiled by @next/mdx with the math
 *      plugins from next.config.ts),
 *   3. render it inside the .prose-textbook column with a footer that holds
 *      the MarkComplete button.
 */

import { notFound } from "next/navigation";
import { getAllSessions, getSessionBySlug } from "@/lib/content";
import { MarkCompleteButton } from "@/components/MarkCompleteButton";

type Params = { slug: string[] };

export function generateStaticParams() {
  // Pre-render every known session at build time. Next.js will still serve
  // unknown slugs via on-demand SSR (and we 404 them in the page itself).
  return getAllSessions().map((s) => ({ slug: s.slug.split("/") }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const session = getSessionBySlug(slug.join("/"));
  if (!session) return { title: "Sessão não encontrada" };
  return { title: `${session.title} — AI / ML Theory` };
}

export default async function SessionPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const slugStr = slug.join("/");
  const session = getSessionBySlug(slugStr);
  if (!session) notFound();

  // Dynamic import — webpack/turbopack will only bundle the .mdx files that
  // generateStaticParams discovered. The path mirrors the on-disk layout
  // under /content (configured as project root, so no alias needed).
  let MdxComponent: React.ComponentType;
  try {
    const mod = await import(`@/../content/${session.chapterSlug}/${session.fileSlug}.mdx`);
    MdxComponent = mod.default;
  } catch {
    notFound();
  }

  return (
    <article className="prose-textbook">
      <header className="not-prose mb-8">
        <div className="text-[12px] uppercase tracking-[0.14em] text-[var(--muted)]">
          {session.chapterSlug.replace(/^ch/, "Capítulo ").split("-")[0]}
          {session.estimatedMinutes ? ` · ${session.estimatedMinutes} min` : ""}
        </div>
        <h1 className="mt-2 text-[2rem] leading-tight font-semibold tracking-tight">
          {session.title}
        </h1>
        {session.goal && (
          <p className="mt-3 text-[15px] text-[var(--muted)] italic max-w-[60ch]">
            <strong className="not-italic font-medium text-[var(--foreground)]">
              Objetivo:
            </strong>{" "}
            {session.goal}
          </p>
        )}
      </header>

      <MdxComponent />

      <footer className="mt-14 pt-6 border-t border-[var(--rule)]">
        <MarkCompleteButton slug={session.slug} />
      </footer>
    </article>
  );
}
