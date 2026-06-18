# ADR 0001 — Stack and divergences from the frontend project standard

- **Status:** accepted
- **Date:** 2026-06-18

## Context

This repo is the **documentation website** for RAGSpine (https://rag-spine.org). It is
a static, content-driven site. We wrap an already-working Fumadocs app into a monorepo
conforming to the frontend project standard, and gate it behind one zero-warning command.

## Decision — the stack

- **Fumadocs + Next.js (App Router)**, React 19, TypeScript 6, Tailwind v4
  (`@tailwindcss/postcss`), ESLint 9 flat config, Orama static search.
- **Static export:** `next.config.mjs` sets `output: 'export'`; `pnpm --filter
@rag-spine/web build` emits a fully static site to `apps/web/out/`.
- **Deploy target:** **Cloudflare Pages** (build output dir `apps/web/out`, custom
  domain `rag-spine.org`). No runtime server, no secrets.
- **Monorepo:** pnpm workspace + Turborepo. One app (`apps/web`) today;
  `pnpm-workspace.yaml` globs `apps/*` + `packages/*` so packages split out for free.
- **Gate:** `ci.sh` chains `typecheck → lint → format:check → test → build` under
  `set -euo pipefail`; `eslint --max-warnings 0` makes warnings fatal.

## Decision — divergences from the standard (with reasons)

### 1. The entire AI-provider layer is skipped (deliberate)

The standard splits into a **universal spine** and an **AI-triggered layer**, and says
explicitly: _"a pure presentation site / marketing page / dashboard that never calls a
model should take the spine in full and skip the AI layer outright — bolting
`MockProvider` or prompt-embedding onto such a project is cargo-culting, not
conformance."_

This site never calls an LLM / embedding / vector store. So we deliberately **omit**:
`packages/domain` (the zero-SDK interface seam), `packages/adapters` + `MockProvider`,
`packages/kernel`'s prompt rendering / `logProvenance`, and the constrain-don't-ask
control-flow discipline. We keep the full spine: strict TS + stricter flags, the
zero-warning gate, type-aware ESLint + Prettier with the escape hatches shut, a
pnpm + Turborepo monorepo, per-package `CLAUDE.md`, `.env.example`, and this ADR.

**Consequence for `check_conformance.py`:** the checker unconditionally requires
`packages/domain/package.json` (and that it be zero-SDK / zero-framework). For a pure
presentation site there is no domain package, so that single check reports a violation.
This is an **expected, documented divergence**, not a defect — the check encodes the
AI-triggered layer, which the standard says to skip here. Every other structural
invariant the checker enforces (workspace + turbo files, strict flags in
`tsconfig.base.json`, escape-hatch ESLint bans, the five `ci.sh` gates, per-package
`CLAUDE.md`, `.env.example`) passes.

### 2. `packages/` directory is empty / absent

A single `apps/web` is sufficient at this size. The standard endorses starting small
("one app plus a couple of packages and grows packages as capabilities split out").
`pnpm-workspace.yaml` still globs `packages/*` so the first extracted package needs no
manifest edit.

### 3. Zod runtime-boundary validation is not added

The standard mandates Zod at every boundary (`fetch`, env, storage, URL params, LLM
output). This static site has **no such runtime boundaries in our own code**: there is
no data fetching, no form input, no client-read env (the one build-time
`NEXT_PUBLIC_SITE_URL` is inlined by Next at build, not parsed at runtime). Fumadocs'
own `source.config.ts` already validates MDX frontmatter with Zod via
`fumadocs-core/source/schema`. Adding a bespoke Zod layer with nothing to parse would
be dead code. If we later add an interactive boundary, Zod goes in at that point.

### 4. tsconfig / ESLint relaxations applied to make the gate green

**None.** Every stricter tsconfig flag and the full type-aware ESLint
(`strictTypeChecked` + `stylisticTypeChecked` + the escape-hatch bans) is **on**.
The two points of friction the strict setup surfaced in the scaffold were both fixed
properly in our own code, with no flag or rule disabled:

- **`exactOptionalPropertyTypes` in `src/components/search.tsx`** — `useI18n()` returns
  `locale: string | undefined`, but `oramaStaticClient`'s `StaticOptions.locale` is
  `string` (optional, so an explicit `undefined` is rejected under this flag). Fixed by
  conditionally spreading `locale` only when defined: `...(locale !== undefined ? { locale } : {})`.
- **`@typescript-eslint/require-await` on `generateStaticParams`** (`src/app/docs/[[...slug]]/page.tsx`)
  — the scaffolded function was `async` but had no `await` (`source.generateParams()` is
  sync). Next allows `generateStaticParams` to be sync; dropped the unnecessary `async`
  (the other two such routes were already sync — now consistent).

### 5. Build-config: pin Turbopack workspace root; one residual Next advisory

- **`turbopack.root` pinned in `next.config.mjs`.** Next 16 inferred the workspace root
  from an ambient `package-lock.json` living _outside_ this repo (in the parent dir) and
  warned. Pinned `turbopack.root` to the monorepo root (`fileURLToPath(new URL('../..',
import.meta.url))`) so the build is deterministic regardless of ambient lockfiles. This
  is a build-config fix, not a relaxation; it silences the warning.
- **Residual `metadataBase` advisory (not fixed, out of scope).** `next build` prints
  `⚠ metadataBase property in metadata export is not set ... using "http://localhost:3000"`,
  affecting only the _absolute URL_ baked into OG-image `<meta>` tags. This is a content/
  metadata concern owned by whoever authors the real site metadata/theme (scaffold work
  must not alter the theme/landing). It is a warning, **not** a gate failure — `next build`
  exits 0 — so the gate stays green. Fix later by setting `metadataBase` to
  `NEXT_PUBLIC_SITE_URL` when site metadata is authored.

## Rejected alternatives

- **Full scaffold with `domain`/`adapters`/`kernel` + `MockProvider`.** Rejected:
  cargo-cult for a site that never calls a model (see divergence 1); the standard
  explicitly says to skip it.
- **Two app shells (`web-vite` + `web-next`).** Rejected: there is exactly one site;
  a second shell is pure overhead.
- **Relaxing strict flags globally to dodge generated-code friction.** Rejected: we
  keep every flag on and relax only the narrowest necessary scope (divergence 4),
  preserving the static guarantee for our own code.
