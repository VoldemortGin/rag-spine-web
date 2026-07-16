import { Provider } from '@/components/provider';
import {
  htmlLanguages,
  isTranslatedLocale,
  translatedLocales,
  type TranslatedLocale,
} from '@/lib/i18n';
import { makeSiteMetadata } from '@/lib/site-metadata';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import '../global.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return translatedLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isTranslatedLocale(lang)) notFound();
  return makeSiteMetadata(lang);
}

export default async function Layout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isTranslatedLocale(lang)) notFound();

  return <LocalizedRoot locale={lang}>{children}</LocalizedRoot>;
}

function LocalizedRoot({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: TranslatedLocale;
}) {
  return (
    <html lang={htmlLanguages[locale]} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider locale={locale}>{children}</Provider>
      </body>
    </html>
  );
}
