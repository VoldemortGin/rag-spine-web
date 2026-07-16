import { isTranslatedLocale, translatedLocales } from '@/lib/i18n';
import { source } from '@/lib/source';
import { llms } from 'fumadocs-core/source';
import { notFound } from 'next/navigation';

export const revalidate = false;
export const dynamicParams = false;

export async function GET(_request: Request, { params }: RouteContext<'/[lang]/llms.txt'>) {
  const { lang } = await params;
  if (!isTranslatedLocale(lang)) notFound();
  return new Response(llms(source).index(lang));
}

export function generateStaticParams() {
  return translatedLocales.map((lang) => ({ lang }));
}
