# Backlog

Small platform improvements. Pick from here when you have an idle hour and
nothing more urgent. Cowork can read this to flag content-side dependencies;
Claude Code can pick items off the top.

Format: one-line title + optional context. Move to "Done" with date when shipped.

## Open

- **Light/dark mode toggle.** Currently the site follows
  `prefers-color-scheme` automatically with no manual override. Add a
  three-way toggle (System / Light / Dark) in the header, persist the
  choice in `localStorage` (use a versioned key like
  `ai-math-theory:theme:v1` to mirror progress). Beware SSR flash —
  inline the initial theme decision in `<head>` before React hydrates.

- **Language toggle (EN/PT).** Site is English-only for now. Add a header
  switch that toggles between English and Portuguese versions of each
  session. Implementation sketch: content tree gains `*.en.mdx` / `*.pt.mdx`
  pairs, `getChapterTree()` picks the right one based on a cookie/state.
  Sidebar and other UI strings move to a small `i18n.ts` dictionary.
  Default to English. Cowork will write Portuguese versions only after the
  toggle ships and the English course is reasonably full.

- **Auto-deploy `.claude/` to .gitignore.** Claude Code's local session
  storage shows up as untracked. One-liner.

- **Landing page upgrade.** Current `/` is a one-paragraph placeholder.
  Once the course has a few chapters, redo it: short pitch, "what you'll
  learn", who it's for, link to chapter 0.

- **Progress percentage somewhere visible.** A small "X / Y sessions
  complete" indicator in the header or sidebar footer. Reads from
  `useProgress()` and `getAllSessions()`.

- **Per-session reading time estimate visible in the sidebar.** Each
  session's frontmatter already has `estimatedMinutes`; surface it as a
  small grey badge next to the title.

## Done

(empty for now — items move here with a date when shipped)
