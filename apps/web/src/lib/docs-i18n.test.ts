import { readFileSync, readdirSync } from 'node:fs';
import { basename, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import GithubSlugger from 'github-slugger';
import { describe, expect, it } from 'vitest';
import { translatedLocales, type Locale } from './i18n';

const docsRoot = fileURLToPath(new URL('../../content/docs', import.meta.url));

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const allFiles = walk(docsRoot);
const englishPages = allFiles
  .filter((path) => extname(path) === '.mdx')
  .filter((path) => !translatedLocales.some((locale) => path.endsWith(`.${locale}.mdx`)))
  .sort();
const englishMeta = allFiles.filter((path) => basename(path) === 'meta.json').sort();

function translatedPath(path: string, locale: string): string {
  const extension = extname(path);
  return `${path.slice(0, -extension.length)}.${locale}${extension}`;
}

function countCodeFences(value: string): number {
  return value.match(/^```/gm)?.length ?? 0;
}

function codeBlocks(value: string): string[] {
  return value.match(/^```[^\n]*\n[\s\S]*?^```$/gm) ?? [];
}

function withoutCodeBlocks(value: string): string {
  return value.replace(/^```[^\n]*\n[\s\S]*?^```$/gm, '');
}

function inlineCode(value: string): string[] {
  const markdown = withoutCodeBlocks(value);
  const spans: string[] = [];

  for (let index = 0; index < markdown.length; index += 1) {
    if (markdown[index] !== '`' || markdown[index - 1] === '\\') continue;
    let openerEnd = index;
    while (markdown[openerEnd] === '`') openerEnd += 1;
    const runLength = openerEnd - index;
    let candidate = openerEnd;
    let closed = false;

    while (candidate < markdown.length) {
      candidate = markdown.indexOf('`', candidate);
      if (candidate < 0) break;
      let closerEnd = candidate;
      while (markdown[closerEnd] === '`') closerEnd += 1;
      if (closerEnd - candidate === runLength) {
        spans.push(markdown.slice(openerEnd, candidate).replace(/\s+/g, ' ').trim());
        index = closerEnd - 1;
        closed = true;
        break;
      }
      candidate = closerEnd;
    }

    if (!closed) index = openerEnd - 1;
  }

  return spans.sort();
}

function mdxComponentSequence(value: string): string[] {
  return Array.from(
    withoutCodeBlocks(value).matchAll(/<\/?([A-Z][A-Za-z0-9.]*)\b/g),
    (match) => match[0],
  );
}

function structuralCounts(value: string) {
  const prose = withoutCodeBlocks(value);
  return {
    links: prose.match(/\[[^\]]+]\([^)]+\)|href=["'][^"']+["']/g)?.length ?? 0,
    listItems: prose.match(/^\s*(?:[-*+] |\d+\. )/gm)?.length ?? 0,
    tableRows: prose.match(/^\s*\|.*\|\s*$/gm)?.length ?? 0,
  };
}

function headingLevels(value: string): string[] {
  return (withoutCodeBlocks(value).match(/^#{1,6}(?= )/gm) ?? []).map((heading) =>
    heading.length.toString(),
  );
}

function pageLocale(path: string): Locale {
  return translatedLocales.find((locale) => path.endsWith(`.${locale}.mdx`)) ?? 'en';
}

function pageRoute(path: string): string {
  const locale = pageLocale(path);
  const suffix = locale === 'en' ? '.mdx' : `.${locale}.mdx`;
  let slug = relative(docsRoot, path).replaceAll('\\', '/').slice(0, -suffix.length);
  if (slug === 'index') slug = '';
  else if (slug.endsWith('/index')) slug = slug.slice(0, -'/index'.length);
  const prefix = locale === 'zh' ? '/docs' : `/${locale}/docs`;
  return slug.length === 0 ? prefix : `${prefix}/${slug}`;
}

function plainHeading(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*~]/g, '')
    .trim();
}

function headingSlugs(content: string): Set<string> {
  const slugger = new GithubSlugger();
  const slugs = new Set<string>();
  for (const match of withoutCodeBlocks(content).matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const heading = match[1];
    if (heading !== undefined) slugs.add(slugger.slug(plainHeading(heading)));
  }
  return slugs;
}

function localFragmentTargets(content: string): string[] {
  const targets: string[] = [];
  const prose = withoutCodeBlocks(content);
  const pattern = /href=["']([^"']+)["']|\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  for (const match of prose.matchAll(pattern)) {
    const target = match[1] ?? match[2];
    if (target?.includes('#') === true && !/^https?:\/\//.test(target)) targets.push(target);
  }
  return targets;
}

describe('localized documentation content', () => {
  it('keeps a complete 48-page tree for every language', () => {
    expect(englishPages).toHaveLength(48);
    expect(englishMeta).toHaveLength(7);

    for (const locale of translatedLocales) {
      expect(allFiles.filter((path) => path.endsWith(`.${locale}.mdx`))).toHaveLength(48);
      expect(allFiles.filter((path) => basename(path) === `meta.${locale}.json`)).toHaveLength(7);
    }

    for (const page of englishPages) {
      const english = readFileSync(page, 'utf8');
      for (const locale of translatedLocales) {
        const localized = translatedPath(page, locale);
        expect(allFiles, `${relative(docsRoot, localized)} is missing`).toContain(localized);
        const content = readFileSync(localized, 'utf8');
        expect(/^title:\s*.+$/m.exec(content)?.[0]).toBeTruthy();
        expect(/^description:\s*.+$/m.exec(content)?.[0]).toBeTruthy();
        expect(countCodeFences(content)).toBe(countCodeFences(english));
        expect(codeBlocks(content)).toEqual(codeBlocks(english));
        expect(inlineCode(content)).toEqual(inlineCode(english));
        expect(mdxComponentSequence(content)).toEqual(mdxComponentSequence(english));
        expect(structuralCounts(content)).toEqual(structuralCounts(english));
        expect(headingLevels(content)).toEqual(headingLevels(english));
        expect(content).not.toBe(english);
        expect(content.length).toBeGreaterThan(english.length * 0.3);
        if (locale === 'zh') expect(content).not.toContain('/zh/docs');
        else expect(content).not.toMatch(/(?:href=["']|\]\()\/docs(?:\/|["')])/);
      }

      expect(english).not.toMatch(/(?:href=["']|\]\()\/docs(?:\/|["')])/);
    }
  });

  it('keeps localized navigation structurally identical to English', () => {
    for (const metaPath of englishMeta) {
      const base = JSON.parse(readFileSync(metaPath, 'utf8')) as {
        icon?: unknown;
        pages?: unknown;
        title?: unknown;
      };
      for (const locale of translatedLocales) {
        const localizedPath = translatedPath(metaPath, locale);
        expect(allFiles, `${relative(docsRoot, localizedPath)} is missing`).toContain(
          localizedPath,
        );
        const localized = JSON.parse(readFileSync(localizedPath, 'utf8')) as typeof base;
        expect(localized.icon).toEqual(base.icon);
        expect(localized.pages).toEqual(base.pages);
        if (base.title !== undefined) {
          expect(typeof localized.title).toBe('string');
          expect(localized.title).not.toBe('');
          expect(localized.title).not.toBe(base.title);
        }
      }
    }
  });

  it('keeps every local fragment pointed at a real localized heading', () => {
    const pages = allFiles.filter((path) => extname(path) === '.mdx');
    const routeMap = new Map(
      pages.map((path) => [pageRoute(path), headingSlugs(readFileSync(path, 'utf8'))]),
    );
    const broken: string[] = [];

    for (const path of pages) {
      const route = pageRoute(path);
      const content = readFileSync(path, 'utf8');
      for (const target of localFragmentTargets(content)) {
        const [targetPath = '', encodedFragment = ''] = target.split('#', 2);
        const targetRoute = targetPath === '' ? route : targetPath;
        const fragment = decodeURIComponent(encodedFragment);
        const headings = routeMap.get(targetRoute);
        if (!headings) broken.push(`${route} links to missing page ${targetRoute}`);
        else if (!headings.has(fragment)) {
          broken.push(`${route} links to missing heading ${targetRoute}#${fragment}`);
        }
      }
    }

    expect(broken).toEqual([]);
  });
});
