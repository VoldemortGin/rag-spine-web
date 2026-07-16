import { getMDXComponents } from '@/components/mdx';
import {
  canonicalDocsLocale,
  htmlLanguages,
  isLocale,
  locales,
  openGraphLocales,
} from '@/lib/i18n';
import { getPageImage, getPageMarkdownUrl, source } from '@/lib/source';
import { appName, docsGitConfig } from '@/lib/shared';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';

type DocumentationSourcePage = (typeof source)['$inferPage'];

export function DocumentationPage({ page }: { page: DocumentationSourcePage }) {
  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const githubUrl =
    `https://github.com/${docsGitConfig.user}/${docsGitConfig.repo}/blob/` +
    `${docsGitConfig.branch}/${docsGitConfig.contentRoot}/${page.path}`;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={githubUrl} />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function getDocumentationMetadata(page: DocumentationSourcePage): Metadata {
  const languageAlternates: Record<string, string> = {};
  for (const locale of locales) {
    const translated = source.getPage(page.slugs, locale);
    if (translated) languageAlternates[htmlLanguages[locale]] = translated.url;
  }
  languageAlternates['x-default'] =
    source.getPage(page.slugs, canonicalDocsLocale)?.url ?? page.url;

  const locale = page.locale !== undefined && isLocale(page.locale) ? page.locale : 'en';
  const image = new URL(getPageImage(page).url, 'https://rag-spine.org').toString();
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: page.url,
      languages: languageAlternates,
    },
    openGraph: {
      type: 'website',
      siteName: appName,
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      locale: openGraphLocales[locale],
      alternateLocale: locales
        .filter((candidate) => candidate !== locale)
        .map((candidate) => openGraphLocales[candidate]),
      images: [{ url: image, alt: page.data.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.data.title,
      description: page.data.description,
      images: [{ url: image, alt: page.data.title }],
    },
  };
}
