import type { Metadata } from 'next';
import { Provider } from '@/components/provider';
import { mono, sans } from '@/lib/fonts';
import { appName } from '@/lib/shared';
import './global.css';

const tagline = 'The framework-free backbone for backend RAG.';

export const metadata: Metadata = {
  metadataBase: new URL('https://rag-spine.org'),
  title: {
    default: `${appName} — framework-free backend RAG`,
    template: `%s · ${appName}`,
  },
  description: tagline,
  applicationName: appName,
  openGraph: {
    type: 'website',
    siteName: appName,
    title: `${appName} — framework-free backend RAG`,
    description: tagline,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${appName} — framework-free backend RAG`,
    description: tagline,
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
