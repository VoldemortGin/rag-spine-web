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

### D — corespine docs (DONE on this branch — verified & fixed)

**Status: DONE.** All 7 pages re-verified against `corespine` source (`src/corespine/`
@ `12249df`):
`apps/corespine/content/docs/{api,index,overview,recipes,reference/extending,reference/prd,reference/roadmap}.mdx`.
Every export signature, error string, and the `__all__` count (30) match source; all 8
recipe snippets (R1–R8) were run offline (`PYTHONPATH=src`) and their printed outputs —
including the MockProvider hash digests `e761052af1bb` / `3ce59d0eaa4c` — reproduce
exactly. Confirmed fix:

- `reference/prd.mdx` — the `make ci` gate was described as "(ruff + pytest)" →
  "(ruff + mypy + pytest)" (`Makefile:22` `ci: lint typecheck test`; `typecheck` runs
  `mypy --strict` at line 34).

Verified consistent (no edits): `api`, `index`, `overview`, `recipes`,
`reference/extending`, `reference/roadmap`. `npx prettier --check` clean.

### E — pdfspine guide/reference docs (DONE on this branch — verified & fixed)

**Status: DONE.** The 4 guide pages re-verified against `pdfspine` source
(`python/pdfspine/*.pyi` + `crates/py-bindings` @ `9c725fd`; pdfspine now **0.3.0** on
PyPI): `apps/pdfspine/content/docs/guide/{cli,index,installation,rendering}.mdx`.
Checked: CLI subcommands / flags / `--format` choices + `pdfspine: <msg>` error shape
(`cli.py`); `get_pixmap` / `Pixmap` / `DisplayList` API + `extract_image` dict keys +
`convert_to_pdf() -> bytes` (`_core.pyi`, `crates/py-bindings/src/lib.rs:3220`); PyPI
install, abi3, `ocrspine-models` runtime dep, `pdfspine.version` tuple,
`fitz.pymupdf_version` — all match (imported the built `_core.abi3.so` to confirm
`version`, raster `open()`, and `convert_to_pdf` at runtime). Confirmed fix:

- `guide/index.mdx` — installation-row "(not yet on PyPI)" → "Installing from PyPI, or
  building the wheel from source" (`installation.mdx` already said on PyPI; 0.3.0 live).

`migrating-from-pymupdf.mdx` left untouched (already verified — matches `COMPAT.toml`'s
682/769 = 88.7%, 21 deferred, 66 out-of-scope). `npx prettier --check` clean.

### F — ragspine remaining pages (DONE on this branch — audited & fixed)

**Status: DONE.** All pages below audited vs `ragspine` 0.8.1 source and fixed where
confirmed-drifted (prettier-clean). Confirmed fixes:

- `reference/python-api.mdx` — `FactStore` reframed as the `@runtime_checkable` Protocol
  seam; instantiation code + runnable example now use the concrete `SqliteFactStore`
  (Protocol has no constructor — `storage/fact_store.py:187,234,241`).
- `reference/extension-points.mdx` — inject example → `SqliteFactStore`; `TaskQueue.enqueue`
  first param corrected `func_path: str` → `func: JobFunc | str`
  (`service/tasks/task_queue.py:71`).
- `reference/configuration.mdx` — CompanyProfile Step env var `RAGSPINE_COMPANY_PROFILE` →
  `RAGSPINE_COMPANY_CONFIG` (the var `load_company_profile()` actually reads —
  `common/company_profile.py:29`; `RAGSPINE_COMPANY_PROFILE` only maps to the unused
  `ServiceConfig.company_profile_path` field).
- `architecture/package-layout.mdx` — `observability.py` → `observability/` (it is a package
  dir `common/observability/{sink,trace}.py`, not a module).

Verified consistent (no edits): `reference/http-api.mdx` (all 6 `service/api` routes + schemas
match), `concepts/glossary.mdx`, `architecture/{overview,channels,request-flow}.mdx`.

ADRs 0001–0012 + index — **no edits** (immutable). Notable reported divergence: web `adr-0012`
documents the corespine LLM seam, but ragspine's in-repo `0012` is a different decision
(onboarding-budget); the corespine-seam decision is a family-level ADR, and ragspine's real
0012/0013/0014 are unrepresented. Renumbering is out of scope for a minimal audit — reported,
not changed. Minor immutable-prose staleness: `corespine>=0.1.0` (now pinned `>=0.1.1`).

Original scope (for reference) — audit these `apps/web/content/docs/` pages vs `ragspine`
source (`~/workspace/spine/ragspine/src/ragspine/`, `pyproject.toml`, `README.md`, current
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
