import type { Metadata } from 'next';
import { Provider } from '@/components/provider';
import { appName } from '@/lib/shared';
import './global.css';

const tagline = 'The thin shared core of the Spine family.';

export const metadata: Metadata = {
  metadataBase: new URL('https://core.rag-spine.org'),
  title: {
    default: `${appName} — the thin shared core of the Spine family`,
    template: `%s · ${appName}`,
  },
  description: tagline,
  applicationName: appName,
  openGraph: {
    type: 'website',
    siteName: appName,
    title: `${appName} — the thin shared core of the Spine family`,
    description: tagline,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${appName} — the thin shared core of the Spine family`,
    description: tagline,
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
