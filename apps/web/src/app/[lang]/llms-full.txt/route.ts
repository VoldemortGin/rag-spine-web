import { isTranslatedLocale, translatedLocales } from '@/lib/i18n';
import { getLLMText, source } from '@/lib/source';
import { notFound } from 'next/navigation';

export const revalidate = false;
export const dynamicParams = false;

export async function GET(_request: Request, { params }: RouteContext<'/[lang]/llms-full.txt'>) {
  const { lang } = await params;
  if (!isTranslatedLocale(lang)) notFound();
  const scanned = await Promise.all(source.getPages(lang).map(getLLMText));
  return new Response(scanned.join('\n\n'));
}

export function generateStaticParams() {
  return translatedLocales.map((lang) => ({ lang }));
}
