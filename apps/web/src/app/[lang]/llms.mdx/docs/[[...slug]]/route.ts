import { isLocale, locales } from '@/lib/i18n';
import { getLLMText, getPageMarkdownUrl, source } from '@/lib/source';
import { notFound } from 'next/navigation';

export const revalidate = false;
export const dynamicParams = false;

export async function GET(
  _request: Request,
  { params }: RouteContext<'/[lang]/llms.mdx/docs/[[...slug]]'>,
) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const page = source.getPage(slug?.slice(0, -1), lang);
  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: { 'Content-Type': 'text/markdown' },
  });
}

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    source.getPages(lang).map((page) => ({
      lang,
      slug: getPageMarkdownUrl(page).segments,
    })),
  );
}
