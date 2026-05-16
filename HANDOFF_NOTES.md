# Handoff notes — 2026-05-15

End of the platform build cycle that was commissioned in CLAUDE.md §13 (original phases C/D/F/G). Most decisions and current state are captured in CLAUDE.md; this file is the **diff** vs. the original plan.

## Final state

- **Production:** https://ai-math-theory.vercel.app
- **Repo:** `luanmoura-aimanager/ai-math-theory` (private)
- **Vercel project:** `luanmoura-aimanagers-projects/ai-math-theory`
- **Auto-deploy:** GitHub → Vercel wired up; push to `main` deploys in ~30s; PRs get preview URLs.

## Deviations from the original plan

| Phase | Originally planned | What shipped |
|---|---|---|
| C — DB | Prisma + Neon Postgres | **Removed.** Was fully wired (Neon migrated, schema applied) then ripped out the same day. |
| D — Auth | Auth.js v5 + Google OAuth | **Skipped.** No auth in MVP. |
| F — Persistence | `POST /api/progress` against Postgres | **Replaced by `localStorage`** (key `ai-math-theory:progress:v1`). Provider API unchanged — Sidebar and MarkCompleteButton compiled with zero diff. |
| G — Deploy | Vercel via dashboard import | Done via CLI (`npx vercel --prod`). GitHub integration required granting the Vercel GitHub App access to the private repo (settled via github.com/apps/vercel/installations/select_target). |

**Rationale:** no real readers yet → infrastructure was a distraction from content authoring. Migration path back to DB+auth is documented in CLAUDE.md §8.

## Stack changes vs. CLAUDE.md §4

None — the stack table in CLAUDE.md already reflects the localStorage-MVP state. `package.json` no longer carries Prisma, Neon adapter, or `ws` deps.

## Pitfalls that bit us this round (already documented, listed here for the record)

- **Prisma 7 is a breaking-change release.** `url` and `directUrl` moved out of `schema.prisma` into `prisma.config.ts`; `PrismaClient` constructor now requires `adapter` or `accelerateUrl` (no implicit `DATABASE_URL` read). If §8 of CLAUDE.md is ever followed back to a DB, the next agent should either pin to Prisma 6 or know about these constraints up front.
- **`npx vercel` deploys the local filesystem, not the git tree.** An orphaned `src/lib/prisma.ts` (untracked, intermediate state) was uploaded by the first deploy attempt and broke the build. Lesson for Cowork: if a build that's green locally fails on Vercel, check `git status` first.
- **Vercel GitHub App needs explicit repo access for new private repos.** The `vercel git connect` call fails silently until the app is granted access via GitHub settings.

## For Cowork

- **First paint shows zero checkmarks.** `localStorage` isn't readable during SSR; the provider hydrates on `useEffect`, so completed sessions "pop in" after first paint. Acceptable per CLAUDE.md §7.4. If this becomes ugly with many sessions, the fix is documented there.
- **Auto-deploy works.** Every `git push` to `main` ships. PR branches get preview URLs. No local build required to share work in progress.
- **`public/diagrams/` is empty.** The `<Figure>` component expects assets there; please commit SVGs alongside the `.mdx` that uses them.
- **Landing page (`/`) and SETUP.md** are still untouched from before this cycle. The site loads, but `/` is bare. Likely first non-content task whenever someone gets to it.

## Recovery hint for the §8 migration

The Auth.js-v5-compatible Prisma schema we wrote and threw away is **not** in git history (it lived only in the first commit's deletion). `website_plan.md §6` has the canonical version, but its `Account` model is truncated. The full field list Auth.js v5 expects:

```prisma
model Account {
  id                String   @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?  @db.Text
  access_token      String?  @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?  @db.Text
  session_state     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

`VerificationToken` (`identifier`, `token @unique`, `expires`, `@@unique([identifier, token])`) is also required.
