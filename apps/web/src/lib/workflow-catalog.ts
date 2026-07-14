import catalogSnapshot from '../data/workflow-catalog.json';

export const WORKFLOW_PROVENANCE_NOTICE =
  'Spine-authored equivalent · upstream reference only · config not redistributed';

export interface WorkflowCompatibility {
  format: string;
  dsl_version: string;
  status: string;
}

export interface WorkflowRequirement {
  kind: string;
  name: string;
  required: boolean;
}

export interface WorkflowSource {
  provider: string;
  title: string;
  author: string;
  upstream_id: string;
  upstream_url: string;
  license_status: string;
  observed_metric: string;
  observed_value: number;
  observed_at: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  categories: readonly string[];
  compatibility: WorkflowCompatibility;
  requirements: readonly WorkflowRequirement[];
  source: WorkflowSource;
  yaml: string;
  sha256: string;
}

interface WorkflowCatalogSnapshot {
  schema_version: number;
  templates: readonly WorkflowTemplate[];
}

const catalog: WorkflowCatalogSnapshot = catalogSnapshot;

export const WORKFLOW_CATALOG_SCHEMA_VERSION = catalog.schema_version;
export const WORKFLOW_CATALOG = catalog.templates;

const countFormatter = new Intl.NumberFormat('en-US');
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});

export function workflowDownloadHref(template: WorkflowTemplate): string {
  return `/workflows/${encodeURIComponent(template.yaml)}`;
}

export function formatPopularity(source: WorkflowSource): string {
  const value = countFormatter.format(source.observed_value);

  switch (source.observed_metric) {
    case 'totalViews':
      return `${value} views`;
    case 'usage_count':
      return `${value} uses`;
    case 'usage_count_rounded':
      return `≈ ${value} uses`;
    default:
      return `${value} ${source.observed_metric}`;
  }
}

export function formatObservedDate(source: WorkflowSource): string {
  return dateFormatter.format(new Date(source.observed_at));
}

export function requirementKindLabel(kind: string): string {
  switch (kind) {
    case 'dataset':
      return 'Dataset';
    case 'llm_provider':
      return 'LLM provider';
    case 'model_capability':
      return 'Model capability';
    default:
      return kind.replaceAll('_', ' ');
  }
}
