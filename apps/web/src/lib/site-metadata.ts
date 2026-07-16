import type { Metadata } from 'next';
import { appName } from './shared';
import { openGraphLocales, type Locale } from './i18n';

const descriptions: Record<Locale, string> = {
  en: 'The framework-free backbone for backend RAG.',
  zh: '不绑定框架的后端 RAG 核心底座。',
  ja: 'バックエンド RAG のためのフレームワーク非依存バックボーン。',
  it: 'La base indipendente dai framework per il RAG backend.',
};

const titles: Record<Locale, string> = {
  en: `${appName} — framework-free backend RAG`,
  zh: `${appName} — 不绑定框架的后端 RAG`,
  ja: `${appName} — フレームワーク非依存のバックエンド RAG`,
  it: `${appName} — RAG backend indipendente dai framework`,
};

export function makeSiteMetadata(locale: Locale): Metadata {
  const title = titles[locale];
  const description = descriptions[locale];

  return {
    metadataBase: new URL('https://rag-spine.org'),
    title: {
      default: title,
      template: `%s · ${appName}`,
    },
    description,
    applicationName: appName,
    openGraph: {
      type: 'website',
      siteName: appName,
      title,
      description,
      url: '/',
      locale: openGraphLocales[locale],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    icons: {
      icon: '/icon.svg',
      apple: '/apple-icon',
    },
  };
}
