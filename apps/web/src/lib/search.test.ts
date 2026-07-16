import { flexsearchStaticClient } from 'fumadocs-core/search/client/flexsearch-static';
import { flexsearchI18n, type IndexWithLocale } from 'fumadocs-core/search/flexsearch';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { chunkedFlexsearchStaticClient } from './chunked-flexsearch-client';
import { i18n } from './i18n';

const indexes: IndexWithLocale[] = [
  {
    locale: 'zh',
    id: '/zh/docs/workflows',
    title: '工作流程指南',
    url: '/zh/docs/workflows',
    structuredData: {
      headings: [],
      contents: [{ content: '创建并预览工作流程', heading: undefined }],
    },
  },
  {
    locale: 'ja',
    id: '/ja/docs/workflows',
    title: 'ワークフローガイド',
    url: '/ja/docs/workflows',
    structuredData: {
      headings: [],
      contents: [{ content: 'ワークフローを作成してプレビューします', heading: undefined }],
    },
  },
];

const searchCases = [
  ['zh', '工作流程', '/zh/docs/workflows'],
  ['zh', '流程', '/zh/docs/workflows'],
  ['ja', 'ワークフロー', '/ja/docs/workflows'],
] as const;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('static localized search', () => {
  it.each(searchCases)(
    'survives export and browser import for %s queries',
    async (locale, query, url) => {
      const server = flexsearchI18n({ i18n, indexes: [...indexes] });
      const exported = await server.staticGET();
      const database: unknown = await exported.json();
      const endpoint = `/api/search-${locale}-${String(query.length)}`;

      vi.stubGlobal('window', {});
      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.resolve(Response.json(database))),
      );

      const client = flexsearchStaticClient({ from: endpoint, locale });
      await expect(client.search(query)).resolves.toEqual(
        expect.arrayContaining([expect.objectContaining({ url })]),
      );
    },
  );

  it.each(searchCases)(
    'survives transport chunking and browser import for %s queries',
    async (locale, query, url) => {
      const server = flexsearchI18n({ i18n, indexes: [...indexes] });
      const exported = await server.staticGET();
      const payload = new TextEncoder().encode(await exported.text());
      const splitAt = Math.ceil(payload.byteLength / 2);
      const chunks = [payload.slice(0, splitAt), payload.slice(splitAt)];
      const endpoint = `/api/search/${locale}-${String(query.length)}`;
      const partsBase = `/api/search-parts/${locale}-${String(query.length)}`;
      const files = chunks.map((_, index) => `0000000000000000-${String(index)}`);
      const nativeFetch = globalThis.fetch;

      vi.stubGlobal('window', {});
      vi.stubGlobal(
        'fetch',
        vi.fn((input: string | URL | Request, init?: RequestInit) => {
          const requestUrl =
            typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
          if (requestUrl === endpoint) {
            return Promise.resolve(
              Response.json({
                type: 'chunked-flexsearch',
                version: 1,
                byteLength: payload.byteLength,
                partsBase,
                parts: chunks.map((chunk, index) => ({
                  file: files[index],
                  byteLength: chunk.byteLength,
                })),
              }),
            );
          }
          if (requestUrl.startsWith(`${partsBase}/`)) {
            const index = files.indexOf(requestUrl.slice(partsBase.length + 1));
            return Promise.resolve(
              index === -1 ? new Response(null, { status: 404 }) : new Response(chunks[index]),
            );
          }
          if (requestUrl.startsWith('blob:')) return nativeFetch(input, init);
          return Promise.resolve(new Response(null, { status: 404 }));
        }),
      );

      const client = chunkedFlexsearchStaticClient({ from: endpoint, locale });
      await expect(client.search(query)).resolves.toEqual(
        expect.arrayContaining([expect.objectContaining({ url })]),
      );
    },
  );
});
