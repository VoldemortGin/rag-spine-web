import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { Provider } from '@/components/provider';
import { defaultLocale } from '@/lib/i18n';
import { baseOptions } from '@/lib/layout.shared';
import { makeSiteMetadata } from '@/lib/site-metadata';
import '../global.css';

export const metadata = makeSiteMetadata(defaultLocale);

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider locale={defaultLocale}>
          <DocsLayout
            tree={source.getPageTree(defaultLocale)}
            {...baseOptions(defaultLocale, { languageSwitcher: true })}
          >
            {children}
          </DocsLayout>
        </Provider>
      </body>
    </html>
  );
}
