'use client';
import SearchDialog from '@/components/search';
import { i18nUI, isLocale, localizePath, type Locale } from '@/lib/i18n';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useCallback } from 'react';

export function Provider({ children, locale }: { children: ReactNode; locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const onLocaleChange = useCallback(
    (nextLocale: string) => {
      if (isLocale(nextLocale)) {
        // Query state is language-neutral. Heading slugs are translated, so
        // carrying a fragment across locales can point at the wrong heading.
        const suffix = window.location.search;
        router.push(`${localizePath(pathname, nextLocale)}${suffix}`);
      }
    },
    [pathname, router],
  );

  return (
    <RootProvider
      i18n={{ ...i18nUI.provider(locale), onLocaleChange }}
      search={{ SearchDialog }}
      theme={{ defaultTheme: 'dark', enableSystem: true }}
    >
      {children}
    </RootProvider>
  );
}
