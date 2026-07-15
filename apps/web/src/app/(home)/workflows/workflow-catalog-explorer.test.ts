import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { WORKFLOW_CATALOG, type WorkflowTemplate } from '../../../lib/workflow-catalog';
import {
  collectWorkflowFilterOptions,
  WORKFLOW_BATCH_SIZE,
} from '../../../lib/workflow-catalog-core';
import { loadWorkflowCatalog } from '../../../lib/workflow-catalog-loader';
import { WorkflowCard } from './workflow-card';
import { WorkflowCatalogExplorer, WorkflowCatalogLoadPanel } from './workflow-catalog-explorer';

const pageSource = readFileSync(fileURLToPath(new URL('./page.tsx', import.meta.url)), 'utf8');
const normalizedPageSource = pageSource.replace(/\s+/gu, ' ');

function syntheticCatalog(length: number): readonly WorkflowTemplate[] {
  const seed = WORKFLOW_CATALOG[0];
  if (seed === undefined) {
    throw new Error('Expected a workflow catalog fixture');
  }

  return Array.from({ length }, (_, index) => ({
    ...seed,
    id: `workflow-${String(index).padStart(4, '0')}`,
    name: `Workflow ${String(index + 1)}`,
    yaml: `workflow-${String(index).padStart(4, '0')}.yml`,
  }));
}

function renderExplorer(templates: readonly WorkflowTemplate[]): string {
  const initialTemplates = templates.slice(0, WORKFLOW_BATCH_SIZE);
  const initialResults = createElement(
    'div',
    { id: 'workflow-results' },
    initialTemplates.map((template) =>
      createElement(WorkflowCard, {
        key: template.id,
        template,
      }),
    ),
  );

  return renderToStaticMarkup(
    createElement(
      WorkflowCatalogExplorer,
      {
        filterOptions: collectWorkflowFilterOptions(templates),
        initialVisibleCount: initialTemplates.length,
        totalCount: templates.length,
      },
      initialResults,
    ),
  );
}

describe('WorkflowCatalogExplorer', () => {
  it('positions the catalog as original starters without claiming upstream equivalence', () => {
    expect(normalizedPageSource).toContain('A thousand ways to skip the blank canvas.');
    expect(normalizedPageSource).toContain('Public Dify Marketplace and n8n listings');
    expect(normalizedPageSource).toContain('no upstream workflow configuration or prompt');
    expect(normalizedPageSource).toContain('no upstream feature parity is claimed');
    expect(normalizedPageSource).not.toContain('Proven flows');
    expect(normalizedPageSource).not.toContain('Spine-authored equivalent');
  });

  it('keeps only the first 48 cards in the server-rendered client boundary', () => {
    const markup = renderExplorer(syntheticCatalog(1000));

    expect(normalizedPageSource).toContain(
      'const initialTemplates = WORKFLOW_CATALOG.slice(0, WORKFLOW_BATCH_SIZE);',
    );
    expect(normalizedPageSource).not.toContain('templates={WORKFLOW_CATALOG}');
    expect(markup).toContain('<label for="workflow-search"');
    expect(markup).toContain('id="workflow-search"');
    expect(markup).toContain('type="search"');
    expect(markup).toContain('<label for="workflow-industry"');
    expect(markup).toContain('<label for="workflow-use-case"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('1,000 workflows found');
    expect(markup).toContain('Show 48 more (952 remaining)');
    expect(markup.match(/<article\b/gu)).toHaveLength(48);
    expect(markup).not.toContain('Workflow 49</h');
  });

  it('uses compact equal-width cards and defers long metadata to details', () => {
    const seed = WORKFLOW_CATALOG[0];
    if (seed === undefined) {
      throw new Error('Expected a workflow catalog fixture');
    }
    const markup = renderToStaticMarkup(createElement(WorkflowCard, { template: seed }));

    expect(normalizedPageSource).toContain('lg:grid-cols-3 xl:grid-cols-4');
    expect(normalizedPageSource).not.toContain('featured={index === 0}');
    expect(markup).toContain('line-clamp-2');
    expect(markup).toContain('Details');
    expect(markup).not.toContain('Inspiration metadata');
  });

  it('loads the complete catalog through the deferred loader', async () => {
    const templates = await loadWorkflowCatalog();

    expect(templates).toHaveLength(1000);
    expect(templates).toBe(WORKFLOW_CATALOG);
  });

  it('renders accessible loading and retryable error states', () => {
    const onClear = vi.fn();
    const onRetry = vi.fn();
    const loadingMarkup = renderToStaticMarkup(
      createElement(WorkflowCatalogLoadPanel, {
        loadState: 'loading',
        onClear,
        onRetry,
        totalCount: 1000,
      }),
    );
    const errorMarkup = renderToStaticMarkup(
      createElement(WorkflowCatalogLoadPanel, {
        loadState: 'error',
        onClear,
        onRetry,
        totalCount: 1000,
      }),
    );

    expect(loadingMarkup).toContain('role="status"');
    expect(loadingMarkup).toContain('aria-busy="true"');
    expect(loadingMarkup).toContain('Loading the full workflow catalog');
    expect(errorMarkup).toContain('role="alert"');
    expect(errorMarkup).toContain('Retry catalog');
    expect(errorMarkup).toContain('Back to first starters');
  });

  it('labels a template without an upstream source as a Spine original', () => {
    const seed = WORKFLOW_CATALOG[0];
    if (seed === undefined) {
      throw new Error('Expected a workflow catalog fixture');
    }
    const template: WorkflowTemplate = { ...seed, source: null };
    const markup = renderExplorer([template]);

    expect(markup).toContain('Spine original');
    expect(markup).toContain('No upstream attribution supplied');
    expect(markup).not.toContain('View inspiration listing');
  });
});
