import { Provider } from '@/components/provider';
import { defaultLocale, htmlLanguages } from '@/lib/i18n';
import { baseOptions } from '@/lib/layout.shared';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { DefaultNotFound } from 'fumadocs-ui/layouts/home/not-found';
import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://rag-spine.org'),
  title: 'Page not found',
  description: 'The requested RAGSpine page does not exist.',
};

export default function GlobalNotFound() {
  return (
    <html lang={htmlLanguages[defaultLocale]} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Provider locale={defaultLocale}>
          <HomeLayout {...baseOptions(defaultLocale)}>
            <DefaultNotFound />
          </HomeLayout>
        </Provider>
      </body>
    </html>
  );
}
