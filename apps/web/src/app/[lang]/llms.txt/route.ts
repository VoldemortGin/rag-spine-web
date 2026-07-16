import { isLocale, locales } from '@/lib/i18n';
import { source } from '@/lib/source';
import { llms } from 'fumadocs-core/source';
import { notFound } from 'next/navigation';

export const revalidate = false;
export const dynamicParams = false;

export async function GET(_request: Request, { params }: RouteContext<'/[lang]/llms.txt'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return new Response(llms(source).index(lang));
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}
