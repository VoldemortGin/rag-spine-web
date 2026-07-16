import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { Provider } from '@/components/provider';
import { canonicalDocsLocale, htmlLanguages } from '@/lib/i18n';
import { baseOptions } from '@/lib/layout.shared';
import { makeSiteMetadata } from '@/lib/site-metadata';
import '../global.css';

export const metadata = makeSiteMetadata(canonicalDocsLocale);

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <html lang={htmlLanguages[canonicalDocsLocale]} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider locale={canonicalDocsLocale}>
          <DocsLayout
            tree={source.getPageTree(canonicalDocsLocale)}
            {...baseOptions(canonicalDocsLocale)}
          >
            {children}
          </DocsLayout>
        </Provider>
      </body>
    </html>
  );
}
