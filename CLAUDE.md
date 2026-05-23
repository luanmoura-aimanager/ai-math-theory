@AGENTS.md

# CLAUDE.md — agent handoff for ai-math-theory

> Read this top-to-bottom before doing anything in this repo. Then read
> `../website_plan.md` for the long-term platform plan. The `@AGENTS.md`
> line above pulls in the Next.js 16 warning — heed it.

## 1. What this is

A study site for the book-in-progress **"Do perceptron aos LLMs"** — a
dissertation-verbose, math-first walk-through of deep learning up to LLMs,
modelled on the Anthropic Courses reading experience.

Reader-product: chapters on the left, math-rendered MDX in the centre, a
"Mark complete" checkmark per session that persists *in the browser* (see
§5 — auth and cross-device sync are deferred until the site has real users).

## 2. Who Luan is, and how to talk to him

- Physicist by training, MSc in deep learning. The dissertation PDF is at
  `../2019_dis_lmgmoura.pdf`. He authored it — he reads notation fluently and
  does not want hand-waving.
- Web-dev beginner. Comfortable in a terminal but new to React/Next/Auth.js.
  When you make a non-obvious choice, leave a one-line comment saying *why*.
- Native Portuguese speaker, but the site currently ships in English (UI
  strings + `.mdx` content). An EN/PT toggle is on the backlog. Code,
  comments, and this CLAUDE.md stay in English.
- Prefers terse, dense answers with specifics over hedged generalities.
- Companion documents: `../llm_study_roadmap.md` is the source-of-truth for
  *content*; `../website_plan.md` for *long-term platform direction*.

## 3. Division of labour with the other agent

This repo is collaboratively edited by two Claude instances:

| Lane | Owner | Files |
|---|---|---|
| Platform / infra | **You (Claude Code)** | Everything *except* `content/` |
| Content authoring | **Cowork** | `content/**/*.mdx`, `content/chapters.json` |

**Hard rule: do not edit `content/`.** The two demo `.mdx` files there are
calibration samples for the rendering pipeline. New session content is
written by Cowork, who has the dissertation PDF and the roadmap loaded. If a
content change is structurally required (e.g., adding a frontmatter field),
open it with Luan first.

You *can* and should:

- Add MDX-rendering primitives (custom components, prose styles).
- Extend `src/lib/content.ts` with new derivations from the tree.
- Edit `chapters.json` only with Luan's confirmation.

## 4. Tech stack (already chosen — do not re-litigate)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js **16.2.6** (App Router, Turbopack) | Newer than the original plan's "Next 15" — same App Router; Turbopack imposes one constraint, see §7.1. |
| Language | TypeScript strict | `tsconfig.json` is the create-next-app default. |
| Styling | Tailwind **v4** | v4 deprecates `@apply` for utilities. Reading-pane styles are vanilla CSS in `src/app/globals.css`. |
| Content | MDX via `@next/mdx` | `.mdx` files live in `content/`, dynamically imported by `app/session/[...slug]/page.tsx`. |
| Math | KaTeX via `remark-math` + `rehype-katex` | Plugin specifiers must be **strings**, see §7.1. |
| Frontmatter | `gray-matter` | Parsed in `src/lib/content.ts`. |
| Persistence | **Browser `localStorage`** | MVP only. See §5 and §8 for the future migration path to DB+auth. |
| Pkg manager | npm | Lockfile is `package-lock.json`. |

**Not in this MVP** (deferred — see §8): authentication, server-side database,
deploy. The `website_plan.md` original plan assumed all of these. They will
come back when there's reader demand for cross-device sync.

## 5. Current state of the code

```
ai-math-theory/
├── content/                                # 🚫 Cowork's lane — do not edit
│   ├── chapters.json
│   └── ch0-math-foundations/
│       ├── 0.1-vector-spaces.mdx
│       └── 0.2-matrix-calculus.mdx
├── src/
│   ├── app/
│   │   ├── layout.tsx                      # shell: Header + Sidebar + main
│   │   ├── page.tsx                        # landing
│   │   ├── globals.css                     # tokens + .prose-textbook + KaTeX overrides
│   │   └── session/[...slug]/page.tsx      # dynamic MDX route
│   ├── components/
│   │   ├── Header.tsx                      # site title (no auth UI)
│   │   ├── Sidebar.tsx                     # chapter tree + checkmarks
│   │   ├── ProgressProvider.tsx            # localStorage-backed
│   │   ├── MarkCompleteButton.tsx          # consumes useProgress()
│   │   └── mdx/
│   │       ├── Aside.tsx                   # <Aside type="note|warning|history">
│   │       ├── SelfTest.tsx                # end-of-section exercise box
│   │       └── Figure.tsx                  # centred figure with caption
│   ├── lib/content.ts                      # filesystem → ChapterMeta[] tree
│   └── mdx-components.tsx                  # registers Aside/SelfTest/Figure
├── next.config.ts                          # MDX + math plugins
├── package.json
├── SETUP.md                                # Luan-facing run instructions
└── README.md                               # currently boilerplate; OK to overwrite
```

Build is green:

```bash
npm run build
```

emits `/`, `/session/ch0-math-foundations/0.1-vector-spaces`,
`/session/ch0-math-foundations/0.2-matrix-calculus` as static pages.

## 6. The contract that lets you swap localStorage → DB+auth later

`src/components/ProgressProvider.tsx` exports `useProgress()` returning
`{ completed: Set<string>, isCompleted(slug), toggle(slug) }`. **Keep that
exact API.** When DB+auth come back (§8):

- The Provider becomes a thin wrapper that reads server-fetched `completed`
  slugs as initial state and POSTs `/api/progress` inside `toggle`.
- `Sidebar.tsx`, `MarkCompleteButton.tsx`, and any new component that uses
  `useProgress()` must compile **with zero changes** — that's the success
  criterion of the migration.
- A one-time migration on first sign-in copies the user's `localStorage`
  state into their server-side `Progress` rows so they don't lose history.

## 7. Pitfalls already discovered (don't re-find these)

### 7.1 Turbopack rejects non-serialisable loader options

`@next/mdx` plugins **must be passed as string specifiers**, not imported
functions:

```ts
// ✅ correct, what's in next.config.ts now
remarkPlugins: [["remark-math"]],
rehypePlugins: [["rehype-katex", { strict: false, throwOnError: false }]],

// ❌ breaks the build with "loader options not serializable"
remarkPlugins: [remarkMath],
rehypePlugins: [[rehypeKatex, { strict: false }]],
```

### 7.2 Fonts

We deliberately do **not** use `next/font/google`. Reasons: build fails
without network, adds a runtime dependency, and the system stack reads
near-identically for body text. Stack is in `globals.css` `--font-sans` /
`--font-mono`. Only switch back to a Google font if Luan explicitly asks.

### 7.3 KaTeX

`strict: false, throwOnError: false` on `rehype-katex` is intentional —
otherwise textbook idioms (e.g. `\boxed{...}`, `\begin{aligned}`) abort the
build. Don't tighten this.

### 7.4 localStorage + SSR

`localStorage` is unavailable during server render. The `ProgressProvider`
loads it inside a `useEffect`, so the *first paint* always shows zero
checkmarks and they "pop in" on hydrate. Acceptable for MVP. If this becomes
visually distracting, hide the checkmark column with `opacity-0` until the
provider sets a `mounted` flag — don't try to read storage during SSR.

### 7.5 MDX frontmatter must be stripped via `remark-frontmatter`

The `.mdx` files in `content/` start with a YAML `--- ... ---` block.
`gray-matter` reads it server-side in `src/lib/content.ts` for sidebar
metadata, but `@next/mdx` itself does not know that YAML is metadata — left
unhandled, the literal `title: "..."` etc. renders as a paragraph at the
top of each session. `remark-frontmatter` (configured in `next.config.ts`)
parses and discards the block before MDX hands content to React. Don't
remove it from `remarkPlugins`. If you ever add `remark-mdx-frontmatter`
on top, that exposes frontmatter as JS exports — we don't need that yet.

### 7.6 Inline KaTeX must be visually loud

Default KaTeX inline math at the surrounding text's font-size renders too
small against 17px prose (`\mathbb{R}^n`, subscripts, fractions all
compress). The override in `globals.css` bumps inline `.katex` to 1.12em
and display `.katex` to 1.18em, and forces `color: inherit` so dark mode
doesn't dim math relative to surrounding prose. Don't revert.

## 8. Future expansion (when DB+auth come back)

**Trigger:** the moment Luan asks for "cross-device sync" or "I want my
progress on my phone too" or anyone else logs in to the site to study.

The original `website_plan.md` Phases C/D/F/G describe the full migration.
In short:

1. **Phase C — Database.** Re-add Prisma + a Postgres provider (Neon was the
   original choice; revisit since Neon has changed pricing). The Prisma
   schema we previously checked in had `User`, `Account`, `Session`,
   `VerificationToken`, `Progress` models from `website_plan.md §6`.
2. **Phase D — Auth.** Re-add `next-auth@beta` with Google provider and
   `@auth/prisma-adapter`. `src/lib/auth.ts` re-exports
   `auth, handlers, signIn, signOut`. The `Header.tsx` placeholder becomes a
   real signed-in/signed-out menu.
3. **Phase F — Persistence.** Add `POST/GET /api/progress` route, refactor
   `ProgressProvider` to read server data + POST on toggle. Server-fetch
   initial state in `app/layout.tsx` to avoid the SSR flicker described in
   §7.4. Keep the migration step that ingests existing `localStorage` slugs
   into the user's first `Progress` rows.
4. **Phase G — Deploy.** Vercel + GitHub. Don't forget to add the prod URL
   to Google Cloud Console authorised redirect URIs (the universal first-
   deploy gotcha).

When that day comes, the right move is for Luan to open Claude Code with a
new prompt referencing this section and `website_plan.md §6, §9`. The work
is well-scoped and Phase C+D was already half-done once — the deleted
schema and Prisma config can be recovered from git history if needed.

## 9. Conventions

### 9.1 Code

- Server components by default; only mark `"use client"` when the file uses
  hooks, browser APIs, or event handlers.
- All paths use the `@/*` alias (`tsconfig.json` already maps it to `./src/*`).
- New components go in `src/components/`. New server-only utilities in
  `src/lib/`.
- Comments: short, *why* over *what*. Past-tense rationale where applicable.

### 9.2 UI / styling

- Reading column = `.prose-textbook` from `globals.css`. Don't apply Tailwind
  prose plugins on top — the rules are hand-tuned.
- Colour tokens live in `:root` of `globals.css`. Use them via
  `var(--accent)`, `var(--rule)`, etc., not raw hex.
- Tailwind v4 quirks: no `@apply` for utilities, no `tailwind.config.js`
  (config lives in `@theme inline { ... }` inside `globals.css`).
- Dark-mode is automatic via `prefers-color-scheme`. Don't add a manual
  toggle without asking — it complicates SSR hydration and Luan hasn't
  asked for it.

### 9.3 Content tone & voice

All prose in `content/` is authored under `content/STYLE.md`. Load it
before any session that writes or edits `.mdx`. The short version: no
em-dashes, no empty intensifiers (`literally`, `exactly`, `simply`), no
"let's" pedagogy, no colorful filler in headers, no vague threats.
Default to surgical edits; reach for structural rewrites only when
removing the artificial element exposes that the sentence was carrying
tone instead of content.

### 9.4 Content (so you know, but you don't author)

Frontmatter shape every `.mdx` must have:

```yaml
---
title: "0.1 — Espaços vetoriais e produto interno, a visão de ML"
chapter: 0
order: 1
estimatedMinutes: 18
goal: "Frase única descrevendo o que o leitor saberá fazer."
prerequisites: ["ch0-math-foundations/0.0-prereqs"]
---
```

`getChapterTree()` reads these. If you add a field, update both `SessionMeta`
in `src/lib/content.ts` and document it here.

## 10. Decision log

- **2026-05-15 — Original handoff.** Fases C+D+F+G commissioned (DB + auth
  + persistência + deploy).
- **2026-05-15 — Phase C done.** Prisma + Neon installed, schema migrated,
  3 MDX components shipped (Aside, SelfTest, Figure).
- **2026-05-15 — Scope reduction.** Auth + DB removed; persistence moved to
  `localStorage`. Rationale: no real users yet, infrastructure was a
  distraction from content authoring. Future migration path documented in §8.
