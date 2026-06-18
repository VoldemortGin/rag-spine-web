#!/usr/bin/env bash
# The single source of truth for "done": one zero-warning gate.
# Fast -> slow, so feedback arrives early. Any non-zero step fails the build.
set -euo pipefail

pnpm install --frozen-lockfile
pnpm -w run typecheck       # tsc --noEmit (per package, all branches)
pnpm -w run lint            # eslint --max-warnings 0 (type-aware)
pnpm -w run format:check    # prettier --check .
pnpm -w run test            # vitest run
pnpm -w run build           # next build -> static export

echo "ALL CHECKS PASSED"
