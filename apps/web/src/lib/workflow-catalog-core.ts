export const WORKFLOW_PROVENANCE_NOTICE =
  'Spine-authored starter/rewrite · inspired by public listing metadata · no upstream feature-equivalence claim · upstream config not redistributed';

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
  industries: readonly string[];
  use_cases: readonly string[];
  categories: readonly string[];
  tags: readonly string[];
  intents: readonly string[];
  examples: readonly string[];
  compatibility: WorkflowCompatibility;
  requirements: readonly WorkflowRequirement[];
  source: WorkflowSource | null;
  yaml: string;
  sha256: string;
}

export interface WorkflowCatalogSnapshot {
  schema_version: number;
  templates: readonly WorkflowTemplate[];
}

export interface WorkflowCatalogFilters {
  query: string;
  industry: string;
  useCase: string;
}

export interface WorkflowFilterOptions {
  industries: readonly string[];
  useCases: readonly string[];
}

export interface WorkflowCatalogPage {
  visibleTemplates: readonly WorkflowTemplate[];
  hasMore: boolean;
  nextVisibleCount: number;
  remainingCount: number;
}

export const WORKFLOW_BATCH_SIZE = 48;

function normalizedSearchText(value: string): string {
  return value.normalize('NFKC').toLowerCase();
}

export function filterWorkflowCatalog(
  templates: readonly WorkflowTemplate[],
  filters: WorkflowCatalogFilters,
): readonly WorkflowTemplate[] {
  const query = normalizedSearchText(filters.query.trim());

  return templates.filter((template) => {
    if (filters.industry.length > 0 && !template.industries.includes(filters.industry)) {
      return false;
    }
    if (filters.useCase.length > 0 && !template.use_cases.includes(filters.useCase)) {
      return false;
    }

    if (query.length === 0) {
      return true;
    }
    const searchable = [
      template.name,
      template.description,
      ...template.industries,
      ...template.use_cases,
      ...template.categories,
      ...template.tags,
      ...template.intents,
      ...template.examples,
      ...(template.source === null
        ? []
        : [template.source.provider, template.source.title, template.source.author]),
    ];
    return normalizedSearchText(searchable.join('\n')).includes(query);
  });
}

export function paginateWorkflowCatalog(
  templates: readonly WorkflowTemplate[],
  requestedVisibleCount: number,
): WorkflowCatalogPage {
  const visibleCount = Math.min(templates.length, Math.max(0, requestedVisibleCount));

  return {
    hasMore: visibleCount < templates.length,
    nextVisibleCount: Math.min(templates.length, visibleCount + WORKFLOW_BATCH_SIZE),
    remainingCount: templates.length - visibleCount,
    visibleTemplates: templates.slice(0, visibleCount),
  };
}

export function hasWorkflowSource(
  template: WorkflowTemplate,
): template is WorkflowTemplate & { source: WorkflowSource } {
  return template.source !== null;
}

export function collectWorkflowFilterOptions(
  templates: readonly WorkflowTemplate[],
): WorkflowFilterOptions {
  return {
    industries: [...new Set(templates.flatMap((template) => template.industries))].sort(),
    useCases: [...new Set(templates.flatMap((template) => template.use_cases))].sort(),
  };
}

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
