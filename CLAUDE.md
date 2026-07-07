# CLAUDE.md — rag-spine-web

Routing table for the **RAGSpine documentation website** (https://rag-spine.org).
A pnpm + Turborepo monorepo following the frontend project standard.

## What this is

A static **documentation site**: Fumadocs + Next.js App Router, `output: 'export'`,
deployed to Cloudflare Pages. It is a **pure presentation site** — it never calls an
LLM / embedding / vector store. Per the standard's "scale to project size": take the
spine in full, skip the AI-provider layer entirely. Do **not** add `packages/domain`,
`MockProvider`, provider seams, or LLM-output parsing here — that would be cargo-cult.

## Layout (find the file by folder first)

```
.
├── apps/                # four independent Fumadocs sites, one per spine package
│   ├── web/             # ragspine docs      → rag-spine.org       (Pages: rag-spine)
│   ├── corespine/       # corespine docs     → core.rag-spine.org  (Pages: corespine-docs)
│   ├── spineagent/      # spineagent docs    → agent.rag-spine.org (Pages: spineagent-docs)
│   └── pdfspine/        # pdfspine+docspine+pptspine docs → pdf.rag-spine.org (pdfspine-docs)
│                        #   each app is its own Next/React/Tailwind root; MDX in content/docs/
├── tsconfig.base.json   # strict baseline (extended by every app)
├── eslint.config.mjs    # shared type-aware flat config (composed by every app)
├── turbo.json           # typecheck / lint / test / build (fanned out across all apps)
└── ci.sh                # the one-command zero-warning gate
```

`pnpm-workspace.yaml` globs `apps/*` and `packages/*`, so the four sibling docs sites
under `apps/*` are picked up with no manifest edit. No shared `packages/*` exists yet —
each site is self-contained pure presentation, needing no shared domain layer.

## The gate (the only "done" judge)

```bash
bash ci.sh    # typecheck + lint + format:check + test + build, exit 0, zero warnings
```

Run it after every change; fix until green. `lint` runs `eslint --max-warnings 0`
(warnings are fatal). Never weaken the gate to make it pass.

## Hard constraints

- **Strict TypeScript + stricter flags** in `tsconfig.base.json`; keep the escape
  hatches shut (no `any` / `!` / `@ts-ignore` — use justified `@ts-expect-error`).
- **Static export only.** `next.config.mjs` has `output: 'export'`; don't add
  server-only features that break the static build.
- **Don't touch the theme/CSS/landing page** for scaffold work. Content authors own
  `content/docs/`; leave the demo `index.mdx` / `test.mdx` building.
- Any relaxed tsconfig/eslint flag must be narrowly scoped, commented, and recorded
  in `docs/adr/0001-stack-and-divergences.md`.

## Docs map

- This file — the always-on routing table for the whole monorepo.
- `apps/*/content/docs/` — each site's MDX content (`web` = ragspine, plus `corespine`,
  `spineagent`, and `pdfspine` = pdfspine + docspine + pptspine).
- `apps/web/CLAUDE.md` — the web app's local contract; the sibling docs apps follow the
  same shape.
- `docs/adr/` — numbered, immutable decision records.
