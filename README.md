# rag-spine-web

The documentation website for **RAGSpine** — https://rag-spine.org

A [Fumadocs](https://fumadocs.dev) + Next.js (App Router) site, statically exported
(`output: 'export'`) and deployed to **Cloudflare Pages**. This repo is a pnpm +
Turborepo monorepo following the frontend project standard (strict TypeScript,
type-aware ESLint, Prettier, a single zero-warning gate). It is a pure presentation
site: it calls no LLM / embedding / vector store, so the standard's AI-provider layer
is intentionally skipped (see `docs/adr/0001-stack-and-divergences.md`).

## Layout

```
.
├── apps/web/            # the Fumadocs Next.js app (the only place a framework lives)
├── tsconfig.base.json   # strict baseline, extended by every package
├── eslint.config.mjs    # shared type-aware flat config
├── turbo.json           # typecheck / lint / test / build pipeline
└── ci.sh                # the one-command gate
```

Documentation content lives in `apps/web/content/docs/`.

## Develop

```bash
pnpm install
pnpm --filter @rag-spine/web dev   # http://localhost:3000
```

## Build (static export)

```bash
pnpm --filter @rag-spine/web build
# output: apps/web/out/
```

## Verify (the gate)

```bash
bash ci.sh
# typecheck + lint + format:check + test + build, must exit 0 with zero warnings
```

## Deploy (Cloudflare Pages)

The build produces a fully static site in `apps/web/out/`. Configure the Cloudflare
Pages project with:

- **Build command:** `pnpm --filter @rag-spine/web build`
- **Build output directory:** `apps/web/out`
- **Custom domain:** `rag-spine.org`

No runtime environment / secrets are required (see `.env.example`).
