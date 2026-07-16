import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Provider } from '@/components/provider';
import { defaultLocale } from '@/lib/i18n';
import { baseOptions } from '@/lib/layout.shared';
import { makeSiteMetadata } from '@/lib/site-metadata';
import '../global.css';

export const metadata = makeSiteMetadata(defaultLocale);

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider locale={defaultLocale}>
          <HomeLayout {...baseOptions(defaultLocale)}>{children}</HomeLayout>
        </Provider>
      </body>
    </html>
  );
}
