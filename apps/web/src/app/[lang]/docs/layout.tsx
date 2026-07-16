import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { isTranslatedLocale } from '@/lib/i18n';
import { baseOptions } from '@/lib/layout.shared';
import { notFound } from 'next/navigation';

export default async function Layout({ children, params }: LayoutProps<'/[lang]/docs'>) {
  const { lang } = await params;
  if (!isTranslatedLocale(lang)) notFound();

  return (
    <DocsLayout tree={source.getPageTree(lang)} {...baseOptions(lang, { languageSwitcher: true })}>
      {children}
    </DocsLayout>
  );
}
