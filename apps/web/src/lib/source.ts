import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import { icons } from 'lucide-react';
import { createElement } from 'react';
import { defaultLocale, i18n, isLocale, localizedRoute, type Locale } from './i18n';
import { docsContentRoute, docsImageRoute, docsRoute } from './shared';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  i18n,
  url(slugs, locale) {
    const resolvedLocale = locale !== undefined && isLocale(locale) ? locale : defaultLocale;
    return localizedRoute([docsRoute, ...slugs].join('/'), resolvedLocale);
  },
  plugins: [],
  // Resolve the lucide icon names used in the docs `meta.json` files into
  // rendered components for the sidebar.
  icon(name) {
    if (name && name in icons) {
      return createElement(icons[name as keyof typeof icons]);
    }
    return undefined;
  },
});

function getPageLocale(page: (typeof source)['$inferPage']): Locale {
  return page.locale !== undefined && isLocale(page.locale) ? page.locale : defaultLocale;
}

export function getPageImage(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'image.png'];
  const locale = getPageLocale(page);

  return {
    locale,
    segments,
    url: `${localizedRoute(docsImageRoute, locale)}/${segments.join('/')}`,
  };
}

export function getPageMarkdownUrl(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'content.md'];
  const locale = getPageLocale(page);

  return {
    locale,
    segments,
    url: `${localizedRoute(docsContentRoute, locale)}/${segments.join('/')}`,
  };
}

export async function getLLMText(page: (typeof source)['$inferPage']) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})

${processed}`;
}
