import { fileURLToPath } from 'node:url';
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// Pin the workspace root so Next/Turbopack doesn't infer it from an ambient
// lockfile outside the repo (monorepo root is one level up from apps/web).
const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url));

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  reactStrictMode: true,
  experimental: {
    globalNotFound: true,
  },
  turbopack: {
    root: workspaceRoot,
  },
};

export default withMDX(config);
