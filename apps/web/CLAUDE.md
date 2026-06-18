# CLAUDE.md — @rag-spine/web

The RAGSpine documentation site (Fumadocs + Next.js App Router). This is the **only**
package in the monorepo and the **composition root**: the single place where a
framework (Next / React / Tailwind) lives. The root core stays framework-free.

## Responsibility

Render the docs site and statically export it. Content (MDX) is authored in
`content/docs/`; this package turns it into a static site under `out/`.

## Layout

```
apps/web/
├── content/docs/        # MDX content (authors own this; demo files must keep building)
├── src/
│   ├── app/             # Next App Router: layouts, routes, OG images, llms.txt, search API
│   ├── components/      # shared UI (mdx, search, provider)
│   └── lib/             # source loader, layout config, cn util (+ cn.test.ts smoke)
├── source.config.ts     # Fumadocs MDX collections (Zod frontmatter schema)
├── next.config.mjs      # output: 'export' (static), MDX plugin
├── tsconfig.json        # extends ../../tsconfig.base.json
├── eslint.config.mjs    # composes the root shared config + eslint-config-next
└── vitest.config.ts
```

## Local contract

- **Static export only** — `next.config.mjs` has `output: 'export'`. Don't introduce
  server-only runtime features (route handlers that need a server, dynamic SSR) that
  break the static build. The `app/api/search` + `og` + `llms*` routes are pre-rendered.
- **`typecheck` order matters:** `fumadocs-mdx && next typegen && tsc --noEmit` — the
  two typegen steps regenerate `.source/` and `.next/types` that `tsc` then checks.
  Don't reorder.
- **`lint` is `eslint --max-warnings 0`** — warnings are fatal.
- **Tests stay robust:** the smoke test (`src/lib/cn.test.ts`) imports a pure util only.
  Do not import `@/lib/source` in tests — it needs generated `.source/` + path aliases.
- **Strict flags inherited from the base tsconfig.** Keep escape hatches shut (no
  `any` / `!` / `@ts-ignore`); any relaxation is recorded in `docs/adr/0001`.
- This is a **pure presentation site** — no LLM/provider code belongs here.
