import type { FamilyKey } from './family';

export const appName = 'RAGSpine';
// Which Spine-family member this site is, used to highlight it in the navbar switcher.
export const familyKey: FamilyKey = 'ragspine';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

// Source repository for the RAGSpine engine (the library this site documents).
export const gitConfig = {
  user: 'VoldemortGin',
  repo: 'ragspine',
  branch: 'main',
};
