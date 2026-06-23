import type { FamilyKey } from './family';

export const appName = 'corespine';
// Which Spine-family member this site is, used to highlight it in the navbar switcher.
export const familyKey: FamilyKey = 'corespine';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

// Source repository for the corespine library (the thin shared core this site documents).
export const gitConfig = {
  user: 'VoldemortGin',
  repo: 'corespine',
  branch: 'main',
};
