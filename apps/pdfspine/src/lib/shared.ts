import type { FamilyKey } from './family';

export const appName = 'pdfspine';
// Which Spine-family member this site is, used to highlight it in the navbar switcher.
export const familyKey: FamilyKey = 'pdfspine';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

// Source repository for the pdfspine library (the pure-Rust PyMuPDF reimplementation this site documents).
export const gitConfig = {
  user: 'VoldemortGin',
  repo: 'pdfspine',
  branch: 'main',
};
