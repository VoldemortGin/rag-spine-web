import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { WORKFLOW_CATALOG, type WorkflowTemplate } from '../../../lib/workflow-catalog';
import type { WorkflowPreview } from '../../../lib/workflow-catalog-core';
import {
  truncatePreviewLabel,
  WorkflowPreviewFlow,
  workflowPreviewBounds,
  workflowPreviewEdgeGeometry,
} from './workflow-preview-flow';

function templateById(id: string): WorkflowTemplate {
  const template = WORKFLOW_CATALOG.find((candidate) => candidate.id === id);
  if (template === undefined) throw new Error(`Missing workflow fixture: ${id}`);
  return template;
}

function renderPreview(id: string): string {
  const template = templateById(id);
  return renderToStaticMarkup(
    createElement(WorkflowPreviewFlow, {
      name: template.name,
      preview: template.preview,
    }),
  );
}

describe('WorkflowPreviewFlow', () => {
  it('fits the actual Dify node geometry and draws directed edges', () => {
    const template = templateById('rag-paper-qa');
    const bounds = workflowPreviewBounds(template.preview);
    const nodesById = new Map(template.preview.nodes.map((node) => [node.id, node] as const));
    const edge = template.preview.edges[0];
    if (edge === undefined) throw new Error('Expected an edge fixture');

    expect(bounds).toEqual({ height: 252, width: 1268, x: -26, y: 164 });
    expect(workflowPreviewEdgeGeometry(edge, nodesById)).toMatchObject({
      labelX: 304,
      labelY: 277.5,
    });

    const markup = renderPreview('rag-paper-qa');
    expect(markup).toContain('Workflow map');
    expect(markup).toContain('4 nodes · 3 connections · read-only preview');
    expect(markup.match(/data-workflow-node=/gu)).toHaveLength(4);
    expect(markup.match(/data-workflow-edge=/gu)).toHaveLength(3);
    expect(markup).toContain('marker-end="url(#workflow-preview-arrow-');
    expect(markup).toContain('aria-label="Zoom in workflow map"');
    expect(markup).toContain('touch-action:pan-y');
    expect(markup).toContain('<div class="sr-only"');
    expect(markup).toContain('Ask about a paper to Retrieve paper evidence');
  });

  it('renders conditional branch labels and iteration containment', () => {
    const branchMarkup = renderPreview('conditional-response-routing');
    expect(branchMarkup).toContain('data-edge-label="IF"');
    expect(branchMarkup).toContain('data-edge-label="ELSE"');
    expect(branchMarkup.match(/data-workflow-node=/gu)).toHaveLength(6);

    const iterationMarkup = renderPreview('batch-content-processing');
    expect(iterationMarkup).toContain('data-workflow-container="iteration_1"');
    expect(iterationMarkup).toContain('data-workflow-node="iteration_start_1"');
    expect(iterationMarkup).toContain('Iteration start, ITERATION START node');
  });

  it('truncates long Unicode labels without splitting code points', () => {
    expect(truncatePreviewLabel('创建一个可以理解论文并回答问题的工作流', 8)).toBe(
      '创建一个可以理…',
    );
    expect(truncatePreviewLabel('Short', 8)).toBe('Short');
  });

  it('escapes untrusted graph labels instead of treating them as markup', () => {
    const preview: WorkflowPreview = {
      preview_schema_version: 1,
      nodes: [
        {
          height: 90,
          id: 'unsafe-source',
          title: '<script>alert(1)</script>',
          type: 'start',
          width: 244,
          x: 0,
          y: 0,
        },
        {
          height: 90,
          id: 'safe-target',
          title: 'Target',
          type: 'end',
          width: 244,
          x: 320,
          y: 0,
        },
      ],
      edges: [
        {
          id: 'unsafe-edge',
          label: '"><script>alert(2)</script>',
          source: 'unsafe-source',
          target: 'safe-target',
        },
      ],
    };
    const markup = renderToStaticMarkup(
      createElement(WorkflowPreviewFlow, { name: 'Unsafe fixture', preview }),
    );

    expect(markup).not.toContain('<script>');
    expect(markup).toContain('&lt;script&gt;');
    expect(markup).toContain('data-edge-label="&quot;&gt;&lt;script&gt;alert(2…"');
  });
});
