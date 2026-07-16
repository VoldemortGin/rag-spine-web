import { DocumentationPage, getDocumentationMetadata } from '@/components/documentation-page';
import { isLocale, locales } from '@/lib/i18n';
import { source } from '@/lib/source';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamicParams = false;

export default async function Page(props: PageProps<'/[lang]/docs/[[...slug]]'>) {
  const { lang, slug } = await props.params;
  if (!isLocale(lang)) notFound();
  const page = source.getPage(slug, lang);
  if (!page) notFound();
  return <DocumentationPage page={page} />;
}

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    source.getPages(lang).map((page) => ({ lang, slug: page.slugs })),
  );
}

export async function generateMetadata(
  props: PageProps<'/[lang]/docs/[[...slug]]'>,
): Promise<Metadata> {
  const { lang, slug } = await props.params;
  if (!isLocale(lang)) notFound();
  const page = source.getPage(slug, lang);
  if (!page) notFound();
  return getDocumentationMetadata(page);
}
