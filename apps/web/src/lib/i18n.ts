import { defineI18n } from 'fumadocs-core/i18n';
import { defineI18nUI } from 'fumadocs-ui/i18n';

export const locales = ['en', 'zh', 'ja', 'it'] as const;
export type Locale = (typeof locales)[number];

export const translatedLocales = ['zh', 'ja', 'it'] as const;
export type TranslatedLocale = (typeof translatedLocales)[number];

export const defaultLocale: Locale = 'en';

// Source files without a locale suffix are English, but the public unprefixed
// documentation URL is Chinese. Keep these concepts separate: changing
// `defaultLocale` would make Fumadocs parse the English files as Chinese.
export const canonicalDocsLocale: Locale = 'zh';

export const i18n = defineI18n({
  languages: [...locales],
  defaultLanguage: defaultLocale,
  parser: 'dot',
  hideLocale: 'default-locale',
  // A missing translation must be visible in CI, never silently replaced by English.
  fallbackLanguage: null,
});

export const uiMessages = {
  en: {
    displayName: 'English',
  },
  zh: {
    displayName: '简体中文',
    'Back to Home(404 page)': '返回首页',
    'Choose a language(language switcher)': '选择语言',
    'Choose a language(language switcher)(aria-label)': '选择语言',
    'Close Banner(banner)(aria-label)': '关闭横幅',
    'Close Search(search dialog)(aria-label)': '关闭搜索',
    'Collapse Sidebar(sidebar)(aria-label)': '收起侧边栏',
    'Copied Text(code block)(aria-label)': '已复制',
    'Copy Anchor Link(heading anchor)(aria-label)': '复制标题链接',
    'Copy Link(accordion)(aria-label)': '复制链接',
    'Copy Markdown(page actions)': '复制 Markdown',
    'Copy Text(code block)(aria-label)': '复制文本',
    'Dark(theme switcher)(aria-label)': '深色',
    'Default(type table)': '默认值',
    'Edit on GitHub(edit page)': '在 GitHub 上编辑',
    'Last updated on(page footer)': '最后更新于',
    'Light(theme switcher)(aria-label)': '浅色',
    'Next Page(pagination)': '下一页',
    'No Headings(table of contents)': '没有标题',
    'No results found(search dialog)': '未找到结果',
    'On this page(table of contents)': '本页目录',
    'Open Search(search trigger)(aria-label)': '打开搜索',
    'Open Sidebar(sidebar)(aria-label)': '打开侧边栏',
    'Open in ChatGPT(page actions)': '在 ChatGPT 中打开',
    'Open in Claude(page actions)': '在 Claude 中打开',
    'Open in Cursor(page actions)': '在 Cursor 中打开',
    'Open in GitHub(page actions)': '在 GitHub 中打开',
    'Open in Scira AI(page actions)': '在 Scira AI 中打开',
    'Open(page actions)': '打开',
    'Page Not Found(404 page)': '页面未找到',
    'Parameters(type table)': '参数',
    'Previous Page(pagination)': '上一页',
    'Prop(type table)': '属性',
    'Read {url}, I want to ask questions about it.(page actions)':
      '请阅读 {url}，我想就其中的内容提问。',
    'Returns(type table)': '返回值',
    'Search(search dialog)': '搜索文档',
    'Search(search trigger)': '搜索',
    'System(theme switcher)(aria-label)': '跟随系统',
    'Table of Contents(inline table of contents)': '目录',
    'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)':
      '你要查找的页面可能已被删除、重命名或暂时不可用。',
    'Toggle Menu(mobile menu)(aria-label)': '切换菜单',
    'Toggle Theme(theme switcher)(aria-label)': '切换主题',
    'Type(type table)': '类型',
    'View as Markdown(page actions)': '查看 Markdown',
  },
  ja: {
    displayName: '日本語',
    'Back to Home(404 page)': 'ホームに戻る',
    'Choose a language(language switcher)': '言語を選択',
    'Choose a language(language switcher)(aria-label)': '言語を選択',
    'Close Banner(banner)(aria-label)': 'バナーを閉じる',
    'Close Search(search dialog)(aria-label)': '検索を閉じる',
    'Collapse Sidebar(sidebar)(aria-label)': 'サイドバーを折りたたむ',
    'Copied Text(code block)(aria-label)': 'コピーしました',
    'Copy Anchor Link(heading anchor)(aria-label)': '見出しリンクをコピー',
    'Copy Link(accordion)(aria-label)': 'リンクをコピー',
    'Copy Markdown(page actions)': 'Markdown をコピー',
    'Copy Text(code block)(aria-label)': 'テキストをコピー',
    'Dark(theme switcher)(aria-label)': 'ダーク',
    'Default(type table)': 'デフォルト',
    'Edit on GitHub(edit page)': 'GitHub で編集',
    'Last updated on(page footer)': '最終更新',
    'Light(theme switcher)(aria-label)': 'ライト',
    'Next Page(pagination)': '次のページ',
    'No Headings(table of contents)': '見出しはありません',
    'No results found(search dialog)': '結果が見つかりません',
    'On this page(table of contents)': 'このページ',
    'Open Search(search trigger)(aria-label)': '検索を開く',
    'Open Sidebar(sidebar)(aria-label)': 'サイドバーを開く',
    'Open in ChatGPT(page actions)': 'ChatGPT で開く',
    'Open in Claude(page actions)': 'Claude で開く',
    'Open in Cursor(page actions)': 'Cursor で開く',
    'Open in GitHub(page actions)': 'GitHub で開く',
    'Open in Scira AI(page actions)': 'Scira AI で開く',
    'Open(page actions)': '開く',
    'Page Not Found(404 page)': 'ページが見つかりません',
    'Parameters(type table)': 'パラメーター',
    'Previous Page(pagination)': '前のページ',
    'Prop(type table)': 'プロパティ',
    'Read {url}, I want to ask questions about it.(page actions)':
      '{url} を読んで、その内容について質問したいです。',
    'Returns(type table)': '戻り値',
    'Search(search dialog)': 'ドキュメントを検索',
    'Search(search trigger)': '検索',
    'System(theme switcher)(aria-label)': 'システム',
    'Table of Contents(inline table of contents)': '目次',
    'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)':
      'お探しのページは削除されたか、名前が変更されたか、一時的に利用できない可能性があります。',
    'Toggle Menu(mobile menu)(aria-label)': 'メニューを切り替え',
    'Toggle Theme(theme switcher)(aria-label)': 'テーマを切り替え',
    'Type(type table)': '型',
    'View as Markdown(page actions)': 'Markdown で表示',
  },
  it: {
    displayName: 'Italiano',
    'Back to Home(404 page)': 'Torna alla home',
    'Choose a language(language switcher)': 'Scegli una lingua',
    'Choose a language(language switcher)(aria-label)': 'Scegli una lingua',
    'Close Banner(banner)(aria-label)': 'Chiudi il banner',
    'Close Search(search dialog)(aria-label)': 'Chiudi la ricerca',
    'Collapse Sidebar(sidebar)(aria-label)': 'Comprimi la barra laterale',
    'Copied Text(code block)(aria-label)': 'Copiato',
    'Copy Anchor Link(heading anchor)(aria-label)': 'Copia il link del titolo',
    'Copy Link(accordion)(aria-label)': 'Copia il collegamento',
    'Copy Markdown(page actions)': 'Copia Markdown',
    'Copy Text(code block)(aria-label)': 'Copia il testo',
    'Dark(theme switcher)(aria-label)': 'Scuro',
    'Default(type table)': 'Predefinito',
    'Edit on GitHub(edit page)': 'Modifica su GitHub',
    'Last updated on(page footer)': 'Ultimo aggiornamento',
    'Light(theme switcher)(aria-label)': 'Chiaro',
    'Next Page(pagination)': 'Pagina successiva',
    'No Headings(table of contents)': 'Nessun titolo',
    'No results found(search dialog)': 'Nessun risultato',
    'On this page(table of contents)': 'In questa pagina',
    'Open Search(search trigger)(aria-label)': 'Apri la ricerca',
    'Open Sidebar(sidebar)(aria-label)': 'Apri la barra laterale',
    'Open in ChatGPT(page actions)': 'Apri in ChatGPT',
    'Open in Claude(page actions)': 'Apri in Claude',
    'Open in Cursor(page actions)': 'Apri in Cursor',
    'Open in GitHub(page actions)': 'Apri in GitHub',
    'Open in Scira AI(page actions)': 'Apri in Scira AI',
    'Open(page actions)': 'Apri',
    'Page Not Found(404 page)': 'Pagina non trovata',
    'Parameters(type table)': 'Parametri',
    'Previous Page(pagination)': 'Pagina precedente',
    'Prop(type table)': 'Proprietà',
    'Read {url}, I want to ask questions about it.(page actions)':
      'Leggi {url}; vorrei fare alcune domande sul suo contenuto.',
    'Returns(type table)': 'Restituisce',
    'Search(search dialog)': 'Cerca nella documentazione',
    'Search(search trigger)': 'Cerca',
    'System(theme switcher)(aria-label)': 'Sistema',
    'Table of Contents(inline table of contents)': 'Indice',
    'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)':
      'La pagina cercata potrebbe essere stata rimossa, rinominata o essere temporaneamente non disponibile.',
    'Toggle Menu(mobile menu)(aria-label)': 'Mostra o nascondi il menu',
    'Toggle Theme(theme switcher)(aria-label)': 'Cambia tema',
    'Type(type table)': 'Tipo',
    'View as Markdown(page actions)': 'Visualizza come Markdown',
  },
} as const;

export const i18nUI = defineI18nUI(i18n, uiMessages);

export const htmlLanguages: Record<Locale, string> = {
  en: 'en',
  zh: 'zh-CN',
  ja: 'ja',
  it: 'it',
};

export const openGraphLocales: Record<Locale, string> = {
  en: 'en_US',
  zh: 'zh_CN',
  ja: 'ja_JP',
  it: 'it_IT',
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function isTranslatedLocale(value: string): value is TranslatedLocale {
  return (translatedLocales as readonly string[]).includes(value);
}

const routeLocalePrefixes: Record<Locale, string | undefined> = {
  en: 'en',
  zh: undefined,
  ja: 'ja',
  it: 'it',
};

function withoutLocalePrefix(pathname: string): string[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0] ?? '')) segments.shift();
  return segments;
}

/** Build the canonical public URL for a route in one documentation locale. */
export function localizedRoute(route: string, locale: Locale): string {
  const segments = withoutLocalePrefix(route);
  const prefix = routeLocalePrefixes[locale];
  if (prefix !== undefined) segments.unshift(prefix);
  return `/${segments.join('/')}`;
}

/**
 * Resolve a language-switch action.
 *
 * Documentation pages keep their slug. The home and workflow gallery are
 * language-neutral, so switching there opens the selected documentation root
 * instead of inventing an untranslated route such as `/ja/workflows`.
 */
export function localizePath(pathname: string, locale: Locale): string {
  const segments = withoutLocalePrefix(pathname);
  const route = segments[0] === 'docs' ? `/${segments.join('/')}` : '/docs';
  return localizedRoute(route, locale);
}

export function localeLabel(locale: Locale): string {
  return uiMessages[locale].displayName;
}
