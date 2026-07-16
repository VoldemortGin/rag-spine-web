import { flexsearchStaticClient } from 'fumadocs-core/search/client/flexsearch-static';
import { flexsearchI18n, type IndexWithLocale } from 'fumadocs-core/search/flexsearch';
import { afterEach, describe, expect, it, vi } from 'vitest';

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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('static localized search', () => {
  it.each([
    ['zh', '工作流程', '/zh/docs/workflows'],
    ['zh', '流程', '/zh/docs/workflows'],
    ['ja', 'ワークフロー', '/ja/docs/workflows'],
  ] as const)('survives export and browser import for %s queries', async (locale, query, url) => {
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
  });
});
