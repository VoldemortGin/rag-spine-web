// Reuse the OpenGraph image for the Twitter/X card (summary_large_image).
// Next.js requires route-segment config (`dynamic`, `size`, …) to be declared
// directly in the route file, so it can't be re-exported — only the default
// image handler is reused.
export { default } from './opengraph-image';

export const dynamic = 'force-static';
export const alt = 'spineagent — a framework-free multi-agent collaboration framework.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
