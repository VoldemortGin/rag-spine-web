import type { Metadata } from 'next';
import { WORKFLOW_CATALOG } from '@/lib/workflow-catalog';
import {
  collectWorkflowFilterOptions,
  WORKFLOW_BATCH_SIZE,
  WORKFLOW_PROVENANCE_NOTICE,
} from '@/lib/workflow-catalog-core';
import { WorkflowCard } from './workflow-card';
import { WorkflowCatalogExplorer } from './workflow-catalog-explorer';

export const metadata: Metadata = {
  title: 'Workflow Catalog',
  description:
    'Browse release-validated, Spine-authored Dify starter workflows available as static YAML downloads.',
  alternates: { canonical: '/workflows' },
};

const countFormatter = new Intl.NumberFormat('en-US');

export default function WorkflowsPage() {
  const workflowCount = countFormatter.format(WORKFLOW_CATALOG.length);
  const initialTemplates = WORKFLOW_CATALOG.slice(0, WORKFLOW_BATCH_SIZE);
  const filterOptions = collectWorkflowFilterOptions(WORKFLOW_CATALOG);

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden border-b border-fd-border">
        <div aria-hidden className="rs-grid-bg absolute inset-0 opacity-50" />
        <div aria-hidden className="rs-hero-glow absolute inset-0" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-5 px-5 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-fd-primary">
              Workflow library / {String(WORKFLOW_CATALOG.length).padStart(4, '0')}
            </span>
            <h1 className="mt-2.5 max-w-3xl text-balance text-3xl font-extrabold leading-tight tracking-tight text-fd-foreground sm:text-4xl">
              A thousand ways to skip the blank canvas.
            </h1>
            <p className="mt-3 max-w-3xl text-pretty text-sm leading-relaxed text-fd-muted-foreground sm:text-base">
              Search {workflowCount} release-validated, Spine-authored Dify starters across real
              industries and use cases. Download a static YAML, bind your model, and customize it on
              your own infrastructure.
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-fd-border bg-fd-border lg:w-[26rem]">
            {[
              [workflowCount, 'workflows'],
              [countFormatter.format(filterOptions.industries.length), 'industries'],
              [countFormatter.format(filterOptions.useCases.length), 'use cases'],
            ].map(([value, label]) => (
              <div key={label} className="bg-fd-card/80 px-3 py-2.5 text-center backdrop-blur-sm">
                <dt className="font-mono text-lg font-semibold text-fd-foreground">{value}</dt>
                <dd className="mt-0.5 text-[0.68rem] uppercase tracking-[0.1em] text-fd-muted-foreground">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-6 sm:py-8"
        aria-labelledby="catalog-title"
      >
        <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <h2
            id="catalog-title"
            className="text-lg font-bold tracking-tight text-fd-foreground sm:text-xl"
          >
            Browse {workflowCount} workflows
          </h2>
          <p className="max-w-xl text-xs leading-relaxed text-fd-muted-foreground sm:text-right">
            Open Details for requirements and attribution, or download the Dify 0.6 YAML directly.
          </p>
        </div>

        <WorkflowCatalogExplorer
          filterOptions={filterOptions}
          initialVisibleCount={initialTemplates.length}
          totalCount={WORKFLOW_CATALOG.length}
        >
          <div
            id="workflow-results"
            className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {initialTemplates.map((template) => (
              <WorkflowCard key={template.id} template={template} />
            ))}
          </div>
        </WorkflowCatalogExplorer>
      </section>

      <section className="border-t border-fd-border bg-fd-card/20">
        <div className="mx-auto grid w-full max-w-7xl gap-3 px-5 py-8 sm:grid-cols-[auto_1fr] sm:gap-8 sm:px-6">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-fd-primary">
            Source policy
          </span>
          <p className="max-w-4xl text-xs leading-relaxed text-fd-muted-foreground">
            {WORKFLOW_PROVENANCE_NOTICE}. Public Dify Marketplace and n8n listings inform topic
            discovery only; no upstream workflow configuration or prompt is redistributed, and no
            upstream feature parity is claimed.
          </p>
        </div>
      </section>
    </main>
  );
}
