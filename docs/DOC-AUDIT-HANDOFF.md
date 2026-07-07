# Handoff — spine-family doc↔code consistency audit (finish D/E, do F)

**Branch:** `doc-audit-wip` (this branch). Base: `main` @ `9f0351e`.
**Why a branch:** it carries **unverified** WIP doc edits (agents D and E were killed
mid-run). Pushing to `main` auto-deploys 4 Cloudflare Pages sites — we do **not** want
unverified doc claims to go live. Verify here, then merge to `main`.

This file is self-contained: assume no chat memory on the new machine.

---

## 1. What this task is

We audited the RAGSpine docs site (`rag-spine-web`, a multi-site Fumadocs monorepo)
against the actual source of the 6 spine code repos, and fixed every **confirmed**
doc↔code drift (docs claiming APIs/behaviors/versions the code doesn't have, and
example code that doesn't run). Method for each doc page:

1. Read the page; extract every factual claim (API name/signature, capability,
   config key / env var, CLI command/flag, version number, example code).
2. Verify each against source (grep/read the repo; **run** example code when possible).
3. Fix only **confirmed** drift; mark uncertain ones instead of guessing.
4. `cd rag-spine-web && npx prettier --check <changed files>` must pass.

## 2. Repo layout (all under `~/workspace/spine/`)

| repo            | what                                                                              |
| --------------- | --------------------------------------------------------------------------------- |
| `pdfspine`      | PDF read/edit/render + `markdown_to_pdf` + the shared `pdf-typeset` layout engine |
| `docspine`      | `.docx` parser + `.docx → PDF` export (`Document.to_pdf`)                         |
| `pptspine`      | `.pptx` parser + `.pptx → PDF` export (`Presentation.to_pdf`)                     |
| `ragspine`      | the RAG engine (Python, v0.8.1)                                                   |
| `corespine`     | thin shared core (Protocols, registry, mock provider, conformance)                |
| `spineagent`    | agent orchestration (Python)                                                      |
| `ocrspine`      | shared OCR core (git dep of the office trio)                                      |
| `rag-spine-web` | the docs site (this repo)                                                         |

**docspine/pptspine** pin **pdfspine's `pdf-typeset` at git rev `7ccee8a…`** for the
PDF-export engine (see their `Cargo.toml` `[workspace.dependencies]`).

## 3. rag-spine-web = 4 sites, one monorepo

| app dir           | Pages project   | live domain         | documents                          |
| ----------------- | --------------- | ------------------- | ---------------------------------- |
| `apps/web`        | rag-spine       | **rag-spine.org**   | ragspine                           |
| `apps/corespine`  | corespine-docs  | core.rag-spine.org  | corespine                          |
| `apps/spineagent` | spineagent-docs | agent.rag-spine.org | spineagent                         |
| `apps/pdfspine`   | pdfspine-docs   | pdf.rag-spine.org   | **pdfspine + docspine + pptspine** |

Deploy: push to `main` → `.github/workflows/deploy.yml` runs the gate
(typecheck·lint·format·test·build all 4) then deploys all 4 sites. **A non-`main`
branch push does NOT deploy.** Content lives in `apps/*/content/docs/`.

Doc-change gate: `cd rag-spine-web && npx prettier --check <files>` (node_modules is
installed). Full local gate: `bash ci.sh`.

## 4. Already DONE + on `main` (do not redo)

Code fixes (in their own repos, committed + pushed):

- docspine `75f3ea0` — **C-8 inline image rendering** (images now draw into the PDF).
- pptspine `b58c91e` — **table cell tcPr borders/margins/anchor parsing** (real table
  borders now render).
- pptspine `f344e2a` — **slide background layout/master inheritance**.
- docspine `508c997` — **`font_map` loads a font file path** (was family-name only) +
  README vAlign wording.

Doc fixes (on `rag-spine-web` `main`):

- `f0ac806` — two broken examples: ragspine quickstart `FactStore(…)` →
  `SqliteFactStore(…)` (FactStore is a `@runtime_checkable` Protocol, can't be
  instantiated); spineagent api `Coordinator(…, resilient=True)` → `resilient` is a
  kwarg of `run_sequential/run_parallel/run_pipeline`, not the constructor.
- `8fe401c` — docspine pdf-export: image "not rendered yet" → renders now.
- `9f0351e` — **A + C**: docspine `pdf-export`/`parsing`/`index` (vAlign top-only,
  `v_merge` returns `"none"` not `None`, drop "As of v0.2.0"); ragspine
  `getting-started/installation` + `cli-and-scripts` extras/CLI/Makefile fixes.

## 5. Remaining work

### D — corespine docs (UNVERIFIED WIP on this branch)

Files edited by an agent killed **during its final self-review** (edits look complete,
prettier-clean, but claims were **not** independently source-verified):
`apps/corespine/content/docs/{api,index,overview,recipes,reference/extending,reference/prd,reference/roadmap}.mdx`

**To finish:** re-verify each edited claim against `corespine` source
(`~/workspace/spine/corespine/src/corespine/` — modules: `seam/registry.py`,
`observability/trace.py`, `llm/provider.py`, `config/env.py`, `queue/task_queue.py`,
`conformance/harness.py`), fix any that are wrong, run example code if a corespine
venv exists, `npx prettier --check` the changed files.

### E — pdfspine guide/reference docs (UNVERIFIED WIP on this branch)

Files edited by an agent killed **while rewriting `migrating-from-pymupdf.mdx`** (that
rewrite landed and matches `COMPAT.toml`'s 21 deferred symbols + OCR-is-implemented;
spot-checked as coherent). Other 4 files edited too:
`apps/pdfspine/content/docs/guide/{cli,index,installation,migrating-from-pymupdf,rendering}.mdx`

**To finish:** re-verify each claim against `pdfspine` source
(`~/workspace/spine/pdfspine/python/pdfspine/*.py` + `*.pyi`, `COMPAT.toml`,
`CHANGELOG.md`), fix drift, `npx prettier --check`. (Scope was guide/reference/
benchmarks/index — NOT the docspine/ or pptspine/ subdirs, already done by A.)

### F — ragspine remaining pages (NOT STARTED)

No edits made yet. Audit these `apps/web/content/docs/` pages vs `ragspine` source
(`~/workspace/spine/ragspine/src/ragspine/`, `pyproject.toml`, `README.md`, current
version **0.8.1**):

- `reference/python-api.mdx`, `reference/http-api.mdx`,
  `reference/configuration.mdx`, `reference/extension-points.mdx`
- `concepts/glossary.mdx`
- `architecture/{overview,channels,package-layout,request-flow}.mdx`
- `decisions/adr-*.mdx`

(Already covered elsewhere — do NOT re-audit: `getting-started/*` = C done;
`concepts/dual-channel.mdx` = audited earlier and mostly-consistent with a few
function-attribution nits worth fixing if you touch it.)

Known-likely findings to check first (from an earlier partial pass):
`reference/python-api.mdx` may have Protocol-instantiation examples like the FactStore
one — construct the concrete class instead. Verify HTTP endpoint paths/fields against
the FastAPI service code; verify env-var/config keys; check ADRs describe decisions the
code actually reflects.

## 6. Environment notes (new machine)

- **Rust builds:** on the original mac the `~/.cargo/bin` rustup shim was broken, so we
  used `export PATH="$HOME/.rustup/toolchains/1.96.0-aarch64-apple-darwin/bin:$PATH"`
  (adjust toolchain/arch for the new machine; a healthy rustup needs no prefix). The
  repos pin toolchain **1.96.0** (`rust-toolchain.toml`).
- **maturin (office trio Python wheels):**
  `env -u CONDA_PREFIX OCRSPINE_MODELS="$(cd ../ocrspine && pwd)/models" VIRTUAL_ENV="$(pwd)/.venv" .venv/bin/maturin develop --release`
  then pytest with the same env prefix. `cargo build -p py-bindings` standalone fails
  to link (extension-module lacks libpython) — use `cargo check -p py-bindings …`.
- **Gates:** Rust — `cargo fmt --all --check`, `cargo clippy --workspace
--all-targets --all-features -- -D warnings`, `cargo test --workspace --exclude
py-bindings`. Docs — `npx prettier --check`.

## 7. Resume on the new machine

```bash
cd ~/workspace/spine/rag-spine-web
git fetch origin
git checkout doc-audit-wip           # D/E WIP + this handoff
# finish D (verify corespine claims), finish E (verify pdfspine claims), do F (ragspine)
# prettier --check each changed file; then:
git checkout main && git merge doc-audit-wip   # deploys all 4 sites via CI
```

## 8. Cross-ref — the larger PDF-export project (separate track)

The `.docx/.pptx → PDF` export effort is tracked in-repo, not here:
`pdfspine/docs/PRD-NEXT.md` §10 (shared `pdf-typeset` engine),
`docspine/docs/PRD-PDF-EXPORT.md`, `pptspine/docs/PRD-PDF-EXPORT.md`. Residuals there
include docspine C-9 tab stops + C-10 CI gate, and a LibreOffice visual-diff harness.
Not part of this doc-audit handoff, but the same repos.
