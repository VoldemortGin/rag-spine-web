import { isLocale, locales } from '@/lib/i18n';
import { getPageImage, source } from '@/lib/source';
import { appName } from '@/lib/shared';
import { generate as DefaultImage } from 'fumadocs-ui/og';
import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';

export const revalidate = false;
export const dynamicParams = false;

const editionLabels = {
  en: 'English documentation',
  zh: 'Chinese documentation',
  ja: 'Japanese documentation',
  it: 'Documentazione italiana',
} as const;

export async function GET(
  _request: Request,
  { params }: RouteContext<'/[lang]/og/docs/[...slug]'>,
) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const page = source.getPage(slug.slice(0, -1), lang);
  if (!page) notFound();

  return new ImageResponse(
    // The built-in OG font is Latin-only. Keeping the card copy Latin avoids
    // a hidden Google Fonts request during deterministic static builds.
    <DefaultImage title={appName} description={editionLabels[lang]} site="Documentation" />,
    { width: 1200, height: 630 },
  );
}

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    source.getPages(lang).map((page) => ({
      lang,
      slug: getPageImage(page).segments,
    })),
  );
}
