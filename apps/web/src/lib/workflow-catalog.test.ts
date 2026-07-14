import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  formatObservedDate,
  formatPopularity,
  requirementKindLabel,
  WORKFLOW_CATALOG,
  WORKFLOW_CATALOG_SCHEMA_VERSION,
  WORKFLOW_PROVENANCE_NOTICE,
  workflowDownloadHref,
} from './workflow-catalog';

const workflowDirectory = fileURLToPath(new URL('../../public/workflows/', import.meta.url));
const staticHeaders = readFileSync(
  fileURLToPath(new URL('../../public/_headers', import.meta.url)),
  'utf8',
);
const openAiDependency =
  'langgenius/openai:0.3.8@592c8252795b5f75807de2d609a03196ed02596b409f7642b4a07548c7ff57ef';
const forbiddenNode = /^\s*type:\s*(?:code|tool|http-request|plugin|n8n-passthrough)\s*$/imu;
const suspiciousSecret =
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bAKIA[0-9A-Z]{16}\b|\b(?:sk|ghp|github_pat)_[A-Za-z0-9_-]{16,}\b/iu;

function templateById(id: string) {
  const template = WORKFLOW_CATALOG.find((candidate) => candidate.id === id);
  if (template === undefined) {
    throw new Error(`Missing workflow fixture: ${id}`);
  }
  return template;
}

describe('workflow catalog snapshot', () => {
  it('publishes seven unique runnable Dify 0.6 workflows', () => {
    expect(WORKFLOW_CATALOG_SCHEMA_VERSION).toBe(1);
    expect(WORKFLOW_CATALOG).toHaveLength(7);
    expect(new Set(WORKFLOW_CATALOG.map((template) => template.id))).toHaveProperty('size', 7);

    for (const template of WORKFLOW_CATALOG) {
      expect(template.compatibility).toEqual({
        dsl_version: '0.6.0',
        format: 'dify',
        status: 'runnable',
      });
      expect(template.categories.length).toBeGreaterThan(0);
      expect(template.requirements.length).toBeGreaterThan(0);
      expect(template.source.license_status).toBe('unknown-not-redistributed');
      expect(['dify', 'n8n']).toContain(template.source.provider);
    }
  });

  it('serves integrity-checked Spine-authored YAML without executable or upstream configs', () => {
    expect(readdirSync(workflowDirectory).sort()).toEqual(
      WORKFLOW_CATALOG.map((template) => template.yaml).sort(),
    );

    for (const template of WORKFLOW_CATALOG) {
      expect(template.yaml).toMatch(/^[a-z0-9-]+\.ya?ml$/u);
      const yaml = readFileSync(join(workflowDirectory, template.yaml));
      const text = yaml.toString('utf8');

      expect(createHash('sha256').update(yaml).digest('hex')).toBe(template.sha256);
      expect(text).toMatch(/^version:\s*['"]?0\.6\.0['"]?\s*$/mu);
      expect(text).toContain(openAiDependency);
      expect(text).not.toMatch(forbiddenNode);
      expect(text).not.toMatch(suspiciousSecret);
      expect(text).not.toContain(template.source.upstream_url);
      expect(workflowDownloadHref(template)).toBe(`/workflows/${template.yaml}`);
      expect(staticHeaders).toContain(
        [
          `/workflows/${template.yaml}`,
          '  Content-Type: application/yaml; charset=utf-8',
          `  Content-Disposition: attachment; filename="${template.yaml}"`,
          '  X-Content-Type-Options: nosniff',
        ].join('\n'),
      );
    }
  });

  it('keeps attribution and display labels explicit', () => {
    expect(WORKFLOW_PROVENANCE_NOTICE).toBe(
      'Spine-authored equivalent · upstream reference only · config not redistributed',
    );
    expect(formatPopularity(templateById('rag-paper-qa').source)).toBe('95,385 views');
    expect(formatPopularity(templateById('multilingual-translation').source)).toBe('618 uses');
    expect(formatPopularity(templateById('batch-content-processing').source)).toBe('≈ 2,100 uses');
    expect(formatObservedDate(templateById('rag-paper-qa').source)).toBe('Jul 14, 2026');
    expect(requirementKindLabel('llm_provider')).toBe('LLM provider');
  });
});
