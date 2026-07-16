import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  collectWorkflowFilterOptions,
  formatObservedDate,
  formatPopularity,
  filterWorkflowCatalog,
  hasWorkflowSource,
  paginateWorkflowCatalog,
  requirementKindLabel,
  WORKFLOW_CATALOG,
  WORKFLOW_CATALOG_SCHEMA_VERSION,
  WORKFLOW_PROVENANCE_NOTICE,
  type WorkflowTemplate,
  workflowDownloadHref,
} from './workflow-catalog';
import { containsWorkflowSecret } from './workflow-secret-scanner';

const workflowDirectory = fileURLToPath(new URL('../../public/workflows/', import.meta.url));
const staticHeaders = readFileSync(
  fileURLToPath(new URL('../../public/_headers', import.meta.url)),
  'utf8',
);
const openAiDependency =
  'langgenius/openai:0.3.8@592c8252795b5f75807de2d609a03196ed02596b409f7642b4a07548c7ff57ef';
const forbiddenNode = /^\s*type:\s*(?:code|tool|http-request|plugin|n8n-passthrough)\s*$/imu;

function templateById(id: string) {
  const template = WORKFLOW_CATALOG.find((candidate) => candidate.id === id);
  if (template === undefined) {
    throw new Error(`Missing workflow fixture: ${id}`);
  }
  return template;
}

function sourceByTemplateId(id: string) {
  const source = templateById(id).source;
  if (source === null) {
    throw new Error(`Missing workflow source fixture: ${id}`);
  }
  return source;
}

describe('workflow catalog snapshot', () => {
  it('searches workflow metadata across names, tags, and multilingual intents', () => {
    expect(
      filterWorkflowCatalog(WORKFLOW_CATALOG, {
        industry: '',
        query: 'cnn',
        useCase: '',
      }).map((template) => template.id),
    ).toEqual(['rag-paper-qa']);
    expect(
      filterWorkflowCatalog(WORKFLOW_CATALOG, {
        industry: '',
        query: '结构化字段',
        useCase: '',
      }).map((template) => template.id),
    ).toEqual(['structured-information-extraction']);
  });

  it('searches non-null upstream provider, title, and author attribution', () => {
    const difySearchResults = filterWorkflowCatalog(WORKFLOW_CATALOG, {
      industry: '',
      query: 'dify',
      useCase: '',
    }).map((template) => template.id);
    const difySourceIds = WORKFLOW_CATALOG.filter(
      (template) => template.source?.provider === 'dify',
    ).map((template) => template.id);

    expect(difySearchResults).toEqual(expect.arrayContaining(difySourceIds));
    expect(difySearchResults).toEqual(
      expect.arrayContaining([
        'multilingual-translation',
        'batch-content-processing',
        'parallel-perspective-analysis',
        'conditional-response-routing',
      ]),
    );
    expect(
      filterWorkflowCatalog(WORKFLOW_CATALOG, {
        industry: '',
        query: 'Chat with PDF docs',
        useCase: '',
      }).map((template) => template.id),
    ).toEqual(['rag-paper-qa']);
    expect(
      filterWorkflowCatalog(WORKFLOW_CATALOG, {
        industry: '',
        query: 'David Roberts',
        useCase: '',
      }).map((template) => template.id),
    ).toEqual(['rag-paper-qa']);
  });

  it('combines industry and use-case filters and exposes stable options', () => {
    const options = collectWorkflowFilterOptions(WORKFLOW_CATALOG);
    expect(options.industries).toHaveLength(39);
    expect(options.industries).toEqual(expect.arrayContaining(['Cross-industry']));
    expect(options.useCases).toHaveLength(33);
    expect(options.useCases).toEqual(
      expect.arrayContaining([
        'Content operations',
        'Data extraction',
        'Request routing',
        'Research & analysis',
        'Research & knowledge',
        'Summarization',
        'Translation & localization',
      ]),
    );

    const filtered = filterWorkflowCatalog(WORKFLOW_CATALOG, {
      industry: 'Cross-industry',
      query: '',
      useCase: 'Data extraction',
    });
    expect(filtered.map((template) => template.id)).toContain('structured-information-extraction');
    expect(
      filtered.every(
        (template) =>
          template.industries.includes('Cross-industry') &&
          template.use_cases.includes('Data extraction'),
      ),
    ).toBe(true);
  });

  it('renders a 1000-item result set in bounded batches', () => {
    expect(paginateWorkflowCatalog(WORKFLOW_CATALOG, 48)).toMatchObject({
      hasMore: true,
      nextVisibleCount: 96,
      remainingCount: 952,
    });
    expect(paginateWorkflowCatalog(WORKFLOW_CATALOG, 48).visibleTemplates).toHaveLength(48);
    expect(paginateWorkflowCatalog(WORKFLOW_CATALOG, 1000)).toMatchObject({
      hasMore: false,
      nextVisibleCount: 1000,
      remainingCount: 0,
    });
  });

  it('supports Spine-authored templates without upstream attribution', () => {
    const template: WorkflowTemplate = {
      ...templateById('rag-paper-qa'),
      id: 'spine-original',
      source: null,
    };

    expect(hasWorkflowSource(template)).toBe(false);
    expect(
      filterWorkflowCatalog([template], { industry: '', query: 'paper', useCase: '' }),
    ).toEqual([template]);
  });

  it('publishes 1000 unique runnable Dify 0.6 workflows with complete metadata', () => {
    expect(WORKFLOW_CATALOG_SCHEMA_VERSION).toBe(1);
    expect(WORKFLOW_CATALOG).toHaveLength(1000);
    expect(new Set(WORKFLOW_CATALOG.map((template) => template.id))).toHaveProperty('size', 1000);
    expect(new Set(WORKFLOW_CATALOG.map((template) => template.yaml))).toHaveProperty('size', 1000);

    const providerCounts = { dify: 0, n8n: 0 };
    const sourceReferences = new Set<string>();

    for (const template of WORKFLOW_CATALOG) {
      const { source } = template;
      if (source === null) {
        throw new Error(`Expected an upstream source fixture for ${template.id}`);
      }
      expect(template.compatibility).toEqual({
        dsl_version: '0.6.0',
        format: 'dify',
        status: 'runnable',
      });
      expect(template.name.trim().length).toBeGreaterThan(0);
      expect(template.description.trim().length).toBeGreaterThan(0);
      for (const values of [
        template.industries,
        template.use_cases,
        template.categories,
        template.tags,
        template.intents,
        template.examples,
      ]) {
        expect(values.length).toBeGreaterThan(0);
        expect(values.every((value) => value.trim().length > 0)).toBe(true);
      }
      expect(template.requirements.length).toBeGreaterThan(0);
      expect(source.license_status).toBe('unknown-not-redistributed');
      if (source.provider !== 'dify' && source.provider !== 'n8n') {
        throw new Error(`Unexpected source provider for ${template.id}`);
      }
      providerCounts[source.provider] += 1;
      sourceReferences.add(`${source.provider}:${source.upstream_id}`);
    }

    expect(providerCounts).toEqual({ dify: 238, n8n: 762 });
    expect(sourceReferences).toHaveProperty('size', 1000);
  });

  it('ships bounded graph-only previews for every catalog workflow', () => {
    for (const template of WORKFLOW_CATALOG) {
      const { preview } = template;
      expect(preview.preview_schema_version).toBe(1);
      expect(preview.nodes.length).toBeGreaterThan(0);
      expect(preview.nodes.length).toBeLessThanOrEqual(256);
      expect(preview.edges.length).toBeLessThanOrEqual(512);

      const nodeIds = new Set(preview.nodes.map((node) => node.id));
      expect(nodeIds.size).toBe(preview.nodes.length);
      for (const node of preview.nodes) {
        expect(node.title.trim().length).toBeGreaterThan(0);
        expect(node.type.trim().length).toBeGreaterThan(0);
        expect([node.x, node.y, node.width, node.height].every(Number.isFinite)).toBe(true);
        expect(node.width).toBeGreaterThan(0);
        expect(node.height).toBeGreaterThan(0);
        if (node.parent_id !== undefined) expect(nodeIds.has(node.parent_id)).toBe(true);
      }

      const edgeIds = new Set(preview.edges.map((edge) => edge.id));
      expect(edgeIds.size).toBe(preview.edges.length);
      for (const edge of preview.edges) {
        expect(nodeIds.has(edge.source)).toBe(true);
        expect(nodeIds.has(edge.target)).toBe(true);
      }

      const serialized = JSON.stringify(preview);
      expect(serialized).not.toContain('prompt_template');
      expect(serialized).not.toContain('environment_variables');
      expect(serialized).not.toContain('completion_params');
      expect(serialized).not.toContain('marketplace_plugin_unique_identifier');
    }

    const branch = templateById('conditional-response-routing').preview;
    expect(branch.edges.map((edge) => edge.label).filter(Boolean)).toEqual(['IF', 'ELSE']);

    const iteration = templateById('batch-content-processing').preview;
    expect(iteration.nodes.filter((node) => node.parent_id === 'iteration_1')).toHaveLength(2);
    expect(iteration.nodes.find((node) => node.type === 'iteration-start')?.title).toBe(
      'Iteration start',
    );
  });

  it('binds every dated source URL to its declared provider', () => {
    const providerHosts = {
      dify: 'marketplace.dify.ai',
      n8n: 'n8n.io',
    } as const;

    for (const template of WORKFLOW_CATALOG) {
      const { source } = template;
      if (source === null || !(source.provider in providerHosts)) {
        throw new Error(`Invalid source fixture for ${template.id}`);
      }
      const provider = source.provider as keyof typeof providerHosts;
      const upstreamUrl = new URL(source.upstream_url);
      const observedAt = Date.parse(source.observed_at);

      expect(upstreamUrl.protocol).toBe('https:');
      expect(upstreamUrl.hostname).toBe(providerHosts[provider]);
      expect(source.observed_at).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u,
      );
      expect(Number.isFinite(observedAt)).toBe(true);
      expect(source.title.trim().length).toBeGreaterThan(0);
      expect(source.author.trim().length).toBeGreaterThan(0);
      expect(source.upstream_id.trim().length).toBeGreaterThan(0);
      expect(source.observed_metric.trim().length).toBeGreaterThan(0);
      expect(Number.isInteger(source.observed_value)).toBe(true);
      expect(source.observed_value).toBeGreaterThanOrEqual(0);

      if (provider === 'dify') {
        expect(upstreamUrl.pathname).toMatch(/^\/template\//u);
        expect(upstreamUrl.searchParams.get('templateId')).toBe(source.upstream_id);
      } else {
        expect(upstreamUrl.pathname).toMatch(
          new RegExp(`^/workflows/${source.upstream_id}(?:[-/]|$)`, 'u'),
        );
      }
    }
  });

  it('serves integrity-checked Spine-authored YAML without executable or upstream configs', () => {
    expect(readdirSync(workflowDirectory).sort()).toEqual(
      WORKFLOW_CATALOG.map((template) => template.yaml).sort(),
    );

    for (const template of WORKFLOW_CATALOG) {
      const { source } = template;
      if (source === null) {
        throw new Error(`Expected an upstream source fixture for ${template.id}`);
      }
      expect(template.yaml).toMatch(/^[a-z0-9-]+\.ya?ml$/u);
      const yaml = readFileSync(join(workflowDirectory, template.yaml));
      const text = yaml.toString('utf8');

      expect(createHash('sha256').update(yaml).digest('hex')).toBe(template.sha256);
      expect(text).toMatch(/^version:\s*['"]?0\.6\.0['"]?\s*$/mu);
      expect(text).toContain(openAiDependency);
      expect(text).not.toMatch(forbiddenNode);
      expect(containsWorkflowSecret(text)).toBe(false);
      expect(text).not.toContain(source.upstream_url);
      expect(workflowDownloadHref(template)).toBe(`/workflows/${template.yaml}`);
    }
  });

  it('uses one Cloudflare wildcard rule for every workflow download', () => {
    expect(staticHeaders.match(/^\/workflows\/.*$/gmu)).toEqual(['/workflows/*']);
    expect(staticHeaders).toContain(
      [
        '/workflows/*',
        '  Content-Type: application/yaml; charset=utf-8',
        '  Content-Disposition: attachment',
        '  X-Content-Type-Options: nosniff',
      ].join('\n'),
    );
    for (const template of WORKFLOW_CATALOG) {
      expect(staticHeaders).not.toContain(`/workflows/${template.yaml}`);
    }
  });

  it('keeps attribution and display labels explicit', () => {
    expect(WORKFLOW_PROVENANCE_NOTICE).toBe(
      'Spine-authored starter/rewrite · inspired by public listing metadata · no upstream feature-equivalence claim · upstream config not redistributed',
    );
    expect(formatPopularity(sourceByTemplateId('rag-paper-qa'))).toBe('95,385 views');
    expect(formatPopularity(sourceByTemplateId('multilingual-translation'))).toBe('618 uses');
    expect(formatPopularity(sourceByTemplateId('batch-content-processing'))).toBe('≈ 2,100 uses');
    expect(formatObservedDate(sourceByTemplateId('rag-paper-qa'))).toBe('Jul 14, 2026');
    expect(requirementKindLabel('llm_provider')).toBe('LLM provider');
  });
});
