import { isLocale, locales } from '@/lib/i18n';
import { source } from '@/lib/source';
import { flexsearchFromSource, type ExportedData } from 'fumadocs-core/search/flexsearch';
import { notFound } from 'next/navigation';

export const revalidate = false;
export const dynamicParams = false;

// Export one language per static file so opening search does not download and
// deserialize all four documentation indexes. Keep the server and browser
// encoders identical: both use FlexSearch's default encoder.
const search = flexsearchFromSource(source);
let exportedIndexes: Promise<ExportedData> | undefined;

function getExportedIndexes(): Promise<ExportedData> {
  exportedIndexes ??= search.export() as Promise<ExportedData>;
  return exportedIndexes;
}

export async function GET(_request: Request, { params }: RouteContext<'/api/search/[lang]'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const exported = await getExportedIndexes();
  if (exported.type !== 'i18n' || exported.raw[lang] === undefined) {
    throw new Error(`Missing static search index for locale: ${lang}`);
  }

  return Response.json({
    type: 'i18n',
    raw: { [lang]: exported.raw[lang] },
  } satisfies ExportedData);
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}
