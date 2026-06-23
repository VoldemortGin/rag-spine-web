import type { FamilyKey } from './family';

export const appName = 'spineagent';
// Which Spine-family member this site is, used to highlight it in the navbar switcher.
export const familyKey: FamilyKey = 'spineagent';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

// Source repository for the spineagent engine (the library this site documents).
export const gitConfig = {
  user: 'VoldemortGin',
  repo: 'spineagent',
  branch: 'main',
};
