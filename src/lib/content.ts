/**
 * content.ts — derive the chapter/session tree from the filesystem.
 *
 * The site treats /content as the source of truth. We walk it once on the
 * server, parse frontmatter from each .mdx file, and return a structured tree
 * of chapters → sessions. Pages and the sidebar both consume this.
 *
 * Conventions (mirrored from website_plan.md §7–§8):
 *   /content/<chapter-slug>/<session-slug>.mdx
 *   chapter slugs look like "ch0-math-foundations", session slugs like
 *   "0.1-vector-spaces".
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type SessionMeta = {
  /** Full slug used in the URL: e.g. "ch0-math-foundations/0.1-vector-spaces". */
  slug: string;
  /** Slug of the parent chapter folder. */
  chapterSlug: string;
  /** Filename slug (without .mdx). */
  fileSlug: string;
  title: string;
  order: number;
  estimatedMinutes?: number;
  goal?: string;
  prerequisites?: string[];
};

export type ChapterMeta = {
  slug: string;
  title: string;
  order: number;
  sessions: SessionMeta[];
};

const CONTENT_ROOT = path.join(process.cwd(), "content");

// chapters.json is a tiny ordering manifest: { "ch0-math-foundations": { title, order } }.
// Without it we'd have to encode order in directory names; the manifest keeps
// both the URL slug and the human-readable title cleanly separated.
type ChapterManifestEntry = { title: string; order: number };
type ChapterManifest = Record<string, ChapterManifestEntry>;

function readChapterManifest(): ChapterManifest {
  const manifestPath = path.join(CONTENT_ROOT, "chapters.json");
  if (!fs.existsSync(manifestPath)) return {};
  return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as ChapterManifest;
}

/**
 * Read all .mdx files in a chapter directory and parse their frontmatter.
 * Sessions without `order` in frontmatter sort last (alphabetical fallback).
 */
function readChapter(chapterSlug: string, manifestEntry: ChapterManifestEntry | undefined): ChapterMeta {
  const dir = path.join(CONTENT_ROOT, chapterSlug);
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const sessions: SessionMeta[] = files.map((file) => {
    const fileSlug = file.replace(/\.mdx?$/, "");
    const fullPath = path.join(dir, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(raw);

    return {
      slug: `${chapterSlug}/${fileSlug}`,
      chapterSlug,
      fileSlug,
      title: (data.title as string) ?? fileSlug,
      order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
      estimatedMinutes: data.estimatedMinutes as number | undefined,
      goal: data.goal as string | undefined,
      prerequisites: data.prerequisites as string[] | undefined,
    };
  });

  sessions.sort((a, b) => a.order - b.order || a.fileSlug.localeCompare(b.fileSlug));

  return {
    slug: chapterSlug,
    title: manifestEntry?.title ?? chapterSlug,
    order: manifestEntry?.order ?? Number.MAX_SAFE_INTEGER,
    sessions,
  };
}

/**
 * Return the full chapter tree, ordered by the manifest. Cached for the
 * lifetime of the server process — content is a build-time artifact.
 */
let cachedTree: ChapterMeta[] | null = null;
export function getChapterTree(): ChapterMeta[] {
  if (cachedTree) return cachedTree;

  if (!fs.existsSync(CONTENT_ROOT)) {
    cachedTree = [];
    return cachedTree;
  }

  const manifest = readChapterManifest();
  const chapterDirs = fs
    .readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  cachedTree = chapterDirs
    .map((slug) => readChapter(slug, manifest[slug]))
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));

  return cachedTree;
}

/** Flat list of every session, useful for generating static params. */
export function getAllSessions(): SessionMeta[] {
  return getChapterTree().flatMap((c) => c.sessions);
}

/** Look up a session by its full slug ("chapter/session"). */
export function getSessionBySlug(slug: string): SessionMeta | undefined {
  return getAllSessions().find((s) => s.slug === slug);
}
