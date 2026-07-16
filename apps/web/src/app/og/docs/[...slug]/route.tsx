import { getPageImage, source } from '@/lib/source';
import { canonicalDocsLocale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { generate as DefaultImage } from 'fumadocs-ui/og';
import { appName } from '@/lib/shared';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/og/docs/[...slug]'>) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1), canonicalDocsLocale);
  if (!page) notFound();

  return new ImageResponse(
    // The built-in OG font is Latin-only. Keep this deterministic instead of
    // making one external font request for every Chinese documentation page.
    <DefaultImage title={appName} description="Chinese documentation" site="Documentation" />,
    {
      width: 1200,
      height: 630,
    },
  );
}

export function generateStaticParams() {
  return source.getPages(canonicalDocsLocale).map((page) => ({
    slug: getPageImage(page).segments,
  }));
}
