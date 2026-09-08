# rag-spine-web

The documentation websites for the **Spine family** of framework-free backend engines.
Each package gets its own [Fumadocs](https://fumadocs.dev) + Next.js (App Router) site,
statically exported (`output: 'export'`) and deployed to its own **Cloudflare Pages**
project:

| App               | Package                      | Documents  | Pages project     | Domain                 |
| ----------------- | ---------------------------- | ---------- | ----------------- | ---------------------- |
| `apps/web`        | `@rag-spine/web`             | RAGSpine   | `rag-spine`       | `rag-spine.org` (apex) |
| `apps/corespine`  | `@rag-spine/corespine-docs`  | corespine  | `corespine-docs`  | `core.rag-spine.org`   |
| `apps/spineagent` | `@rag-spine/spineagent-docs` | spineagent | `spineagent-docs` | `agent.rag-spine.org`  |
| `apps/pdfspine`   | `@rag-spine/pdfspine-docs`   | pdfspine   | `pdfspine-docs`   | `pdf.rag-spine.org`    |

This repo is a pnpm + Turborepo monorepo following the frontend project standard (strict
TypeScript, type-aware ESLint, Prettier, a single zero-warning gate). The sites are pure
presentation: they call no LLM / embedding / vector store, so the standard's AI-provider
layer is intentionally skipped (see `docs/adr/0001-stack-and-divergences.md`).

## Spine 家族 / Spine family

本仓库是 Spine 家族的成员之一（角色：旁路：文档站）。家族全部成员、分层、依赖方向、依赖形式与当前差距见 [`docs/spine-family.md`](docs/spine-family.md)；该文件在每个家族仓库中的副本内容相同，真源在家族根目录 `~/startup/spine/docs/spine-family.md`，用根目录 `make family-doc-sync` 同步。

## Layout

```
.
├── apps/web/            # RAGSpine docs (the original site)
├── apps/corespine/      # corespine docs
├── apps/spineagent/     # spineagent docs
├── apps/pdfspine/       # pdfspine docs
├── tsconfig.base.json   # strict baseline, extended by every package
├── eslint.config.mjs    # shared type-aware flat config
├── turbo.json           # typecheck / lint / test / build pipeline
└── ci.sh                # the one-command gate
```

Each app's documentation content lives in `apps/<name>/content/docs/`.

## Develop

```bash
pnpm install
pnpm --filter @rag-spine/web dev             # http://localhost:3000
pnpm --filter @rag-spine/corespine-docs dev  # the corespine site, etc.
```

## Build (static export)

```bash
pnpm -w run build                            # build all four sites
pnpm --filter @rag-spine/corespine-docs build # or just one
# output: apps/<name>/out/
```

## Verify (the gate)

```bash
bash ci.sh
# typecheck + lint + format:check + test + build, must exit 0 with zero warnings
```

## Deploy (Cloudflare Pages)

`pnpm -w run build` produces a fully static site under each `apps/<name>/out/`.
`.github/workflows/deploy.yml` runs the gate, then deploys each `out/` to its own Pages
project (see the table above for the project ↔ domain mapping). The first deploy to a
new project auto-creates it from the shared `CLOUDFLARE_API_TOKEN` /
`CLOUDFLARE_ACCOUNT_ID` secrets.

**One-time, in the Cloudflare dashboard:** bind each subdomain as a _custom domain_ on its
matching Pages project and add the corresponding `CNAME` record (e.g. `core` →
`corespine-docs.pages.dev`). The workflow only deploys to the Pages projects; it does not
manage DNS. No runtime environment / secrets are required by the sites themselves (see
`.env.example`).
