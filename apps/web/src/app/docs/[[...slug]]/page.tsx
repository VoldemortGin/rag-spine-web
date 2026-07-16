import { DocumentationPage, getDocumentationMetadata } from '@/components/documentation-page';
import { canonicalDocsLocale } from '@/lib/i18n';
import { source } from '@/lib/source';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug, canonicalDocsLocale);
  if (!page) notFound();
  return <DocumentationPage page={page} />;
}

export function generateStaticParams() {
  return source.getPages(canonicalDocsLocale).map((page) => ({ slug: page.slugs }));
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug, canonicalDocsLocale);
  if (!page) notFound();
  return getDocumentationMetadata(page);
}
