import { canonicalDocsLocale, htmlLanguages, locales } from '@/lib/i18n';
import { source } from '@/lib/source';
import type { MetadataRoute } from 'next';

const origin = 'https://rag-spine.org';

export const dynamic = 'force-static';

function absolute(pathname: string): string {
  return new URL(pathname, origin).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const result: MetadataRoute.Sitemap = [
    { url: absolute('/'), priority: 1 },
    { url: absolute('/workflows'), priority: 0.8 },
  ];

  for (const page of source.getPages()) {
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      const translated = source.getPage(page.slugs, locale);
      if (translated) languages[htmlLanguages[locale]] = absolute(translated.url);
    }
    languages['x-default'] = languages[htmlLanguages[canonicalDocsLocale]] ?? absolute(page.url);

    result.push({
      url: absolute(page.url),
      alternates: { languages },
      priority: page.slugs.length === 0 ? 0.9 : 0.7,
    });
  }

  return result;
}
