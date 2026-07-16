import { describe, expect, it } from 'vitest';
import {
  isLocale,
  isTranslatedLocale,
  localizePath,
  openGraphLocales,
  translatedLocales,
  uiMessages,
} from './i18n';

const fumadocsUiKeys = [
  'Back to Home(404 page)',
  'Choose a language(language switcher)',
  'Choose a language(language switcher)(aria-label)',
  'Close Banner(banner)(aria-label)',
  'Close Search(search dialog)(aria-label)',
  'Collapse Sidebar(sidebar)(aria-label)',
  'Copied Text(code block)(aria-label)',
  'Copy Anchor Link(heading anchor)(aria-label)',
  'Copy Link(accordion)(aria-label)',
  'Copy Markdown(page actions)',
  'Copy Text(code block)(aria-label)',
  'Dark(theme switcher)(aria-label)',
  'Default(type table)',
  'Edit on GitHub(edit page)',
  'Last updated on(page footer)',
  'Light(theme switcher)(aria-label)',
  'Next Page(pagination)',
  'No Headings(table of contents)',
  'No results found(search dialog)',
  'On this page(table of contents)',
  'Open Search(search trigger)(aria-label)',
  'Open Sidebar(sidebar)(aria-label)',
  'Open in ChatGPT(page actions)',
  'Open in Claude(page actions)',
  'Open in Cursor(page actions)',
  'Open in GitHub(page actions)',
  'Open in Scira AI(page actions)',
  'Open(page actions)',
  'Page Not Found(404 page)',
  'Parameters(type table)',
  'Previous Page(pagination)',
  'Prop(type table)',
  'Read {url}, I want to ask questions about it.(page actions)',
  'Returns(type table)',
  'Search(search dialog)',
  'Search(search trigger)',
  'System(theme switcher)(aria-label)',
  'Table of Contents(inline table of contents)',
  'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)',
  'Toggle Menu(mobile menu)(aria-label)',
  'Toggle Theme(theme switcher)(aria-label)',
  'Type(type table)',
  'View as Markdown(page actions)',
] as const;

describe('documentation locale paths', () => {
  it.each([
    ['/docs/guides/workflows', 'en', '/docs/guides/workflows'],
    ['/docs/guides/workflows', 'zh', '/zh/docs/guides/workflows'],
    ['/zh/docs/guides/workflows', 'en', '/docs/guides/workflows'],
    ['/zh/docs/guides/workflows', 'ja', '/ja/docs/guides/workflows'],
    ['/it/docs', 'zh', '/zh/docs'],
  ] as const)('maps %s to %s', (path, locale, expected) => {
    expect(localizePath(path, locale)).toBe(expected);
  });

  it('rejects unsupported dynamic route values', () => {
    expect(isLocale('en')).toBe(true);
    expect(isTranslatedLocale('zh')).toBe(true);
    expect(isTranslatedLocale('en')).toBe(false);
    expect(isLocale('de')).toBe(false);
  });

  it('uses OGP locale identifiers independently from hreflang values', () => {
    expect(openGraphLocales).toEqual({
      en: 'en_US',
      zh: 'zh_CN',
      ja: 'ja_JP',
      it: 'it_IT',
    });
  });

  it('translates every Fumadocs UI key in each non-English locale', () => {
    for (const locale of translatedLocales) {
      for (const key of fumadocsUiKeys) {
        expect(Object.hasOwn(uiMessages[locale], key), `${locale} is missing ${key}`).toBe(true);
      }
    }
  });
});
