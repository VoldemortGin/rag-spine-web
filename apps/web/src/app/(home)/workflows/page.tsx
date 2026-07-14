import {
  ArrowUpRight,
  BookOpen,
  Check,
  Download,
  FileText,
  GitBranch,
  Languages,
  ListChecks,
  ScanText,
  Scale,
} from 'lucide-react';
import type { Metadata } from 'next';
import {
  formatObservedDate,
  formatPopularity,
  requirementKindLabel,
  WORKFLOW_CATALOG,
  WORKFLOW_PROVENANCE_NOTICE,
  workflowDownloadHref,
  type WorkflowTemplate,
} from '@/lib/workflow-catalog';

export const metadata: Metadata = {
  title: 'Workflow Catalog',
  description:
    'Seven release-validated, Spine-authored Dify 0.6 workflow templates available as static YAML downloads.',
  alternates: { canonical: '/workflows' },
};

function TemplateIcon({ id }: { id: string }) {
  const iconProps = {
    'aria-hidden': true,
    className: 'h-5 w-5',
    strokeWidth: 1.7,
  } as const;

  switch (id) {
    case 'rag-paper-qa':
      return <BookOpen {...iconProps} />;
    case 'executive-summary':
      return <FileText {...iconProps} />;
    case 'multilingual-translation':
      return <Languages {...iconProps} />;
    case 'batch-content-processing':
      return <ListChecks {...iconProps} />;
    case 'parallel-perspective-analysis':
      return <Scale {...iconProps} />;
    case 'structured-information-extraction':
      return <ScanText {...iconProps} />;
    case 'conditional-response-routing':
      return <GitBranch {...iconProps} />;
    default:
      return <FileText {...iconProps} />;
  }
}

function WorkflowCard({
  template,
  index,
  featured,
}: {
  template: WorkflowTemplate;
  index: number;
  featured: boolean;
}) {
  return (
    <article
      id={template.id}
      className={`group relative overflow-hidden rounded-2xl border border-fd-border bg-fd-card/45 transition-colors hover:border-fd-primary/35 hover:bg-fd-card/70 ${featured ? 'lg:col-span-2' : ''}`}
    >
      <div
        aria-hidden
        className="absolute inset-x-8 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-fd-primary to-transparent opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100"
      />

      <div className={`grid h-full gap-0 ${featured ? 'lg:grid-cols-[1.15fr_0.85fr]' : ''}`}>
        <div className="flex flex-col p-6 sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-fd-primary/25 bg-fd-primary/8 text-fd-primary">
                <TemplateIcon id={template.id} />
              </span>
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-fd-muted-foreground">
                Flow {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-fd-primary/25 bg-fd-primary/8 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.13em] text-fd-primary">
              <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
              Runnable
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-fd-foreground sm:text-2xl">
            {template.name}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fd-muted-foreground">
            {template.description}
          </p>

          <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${template.name} categories`}>
            {template.categories.map((category) => (
              <li
                key={category}
                className="rounded-md border border-fd-border bg-fd-background/60 px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-fd-muted-foreground"
              >
                {category}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-wrap gap-3 pt-7">
            <a
              href={workflowDownloadHref(template)}
              download={template.yaml}
              className="inline-flex items-center gap-2 rounded-full bg-fd-primary px-4 py-2.5 text-sm font-semibold text-fd-primary-foreground transition-transform hover:-translate-y-0.5"
              aria-label={`Download ${template.name} as Dify YAML`}
            >
              <Download className="h-4 w-4" aria-hidden />
              Download YAML
            </a>
            <a
              href={template.source.upstream_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-fd-border px-4 py-2.5 text-sm font-medium text-fd-foreground transition-colors hover:border-fd-primary/35 hover:bg-fd-background/70"
              aria-label={`View the upstream reference for ${template.name} in a new tab`}
            >
              Upstream reference
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>

        <div
          className={`border-t border-fd-border bg-fd-background/35 p-6 sm:p-7 ${featured ? 'lg:border-l lg:border-t-0' : ''}`}
        >
          <dl className="grid gap-5">
            <div>
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-fd-muted-foreground">
                Compatibility
              </dt>
              <dd className="mt-1.5 text-sm font-medium text-fd-foreground">
                Dify DSL {template.compatibility.dsl_version} · {template.compatibility.status}
              </dd>
            </div>

            <div>
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-fd-muted-foreground">
                Requirements
              </dt>
              <dd className="mt-2">
                <ul className="grid gap-2.5">
                  {template.requirements.map((requirement) => (
                    <li key={`${requirement.kind}-${requirement.name}`} className="text-sm">
                      <span className="text-fd-muted-foreground">
                        {requirementKindLabel(requirement.kind)} ·{' '}
                        {requirement.required ? 'required' : 'optional'}
                      </span>
                      <code className="mt-0.5 block break-all text-xs text-fd-foreground">
                        {requirement.name}
                      </code>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>

            <div>
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-fd-muted-foreground">
                Reference signal
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-fd-foreground">
                <span className="font-medium">
                  {template.source.provider.toUpperCase()} · {template.source.title}
                </span>
                <span className="block text-fd-muted-foreground">
                  Reference by {template.source.author}
                </span>
                <span className="block text-fd-muted-foreground">
                  {formatPopularity(template.source)} · observed{' '}
                  <time dateTime={template.source.observed_at}>
                    {formatObservedDate(template.source)}
                  </time>
                </span>
              </dd>
            </div>
          </dl>

          <p className="mt-6 border-t border-fd-border pt-5 font-mono text-[0.68rem] leading-relaxed text-fd-muted-foreground">
            {WORKFLOW_PROVENANCE_NOTICE}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function WorkflowsPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden border-b border-fd-border">
        <div aria-hidden className="rs-grid-bg absolute inset-0 opacity-60" />
        <div aria-hidden className="rs-hero-glow absolute inset-0" />

        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:py-24">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-fd-primary">
              Workflow catalog / 07
            </span>
            <h1 className="mt-5 max-w-3xl text-balance text-4xl font-extrabold leading-[1.06] tracking-tight text-fd-foreground sm:text-5xl lg:text-6xl">
              Proven flows. Static files. Your infrastructure.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-fd-muted-foreground sm:text-lg">
              Seven release-validated Dify workflows, authored by Spine and ready to import. No
              catalog API, account, or running RAGSpine server is required to browse or download
              them.
            </p>
          </div>

          <div className="rounded-2xl border border-fd-border bg-fd-card/55 p-5 shadow-2xl shadow-black/5 backdrop-blur-sm sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-fd-border pb-4">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-fd-muted-foreground">
                Import sequence
              </span>
              <span className="rounded-full border border-fd-primary/30 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-fd-primary">
                Dify 0.6
              </span>
            </div>
            <ol className="mt-5 grid gap-4">
              {[
                ['01', 'Download', 'Choose a Spine-authored YAML below.'],
                ['02', 'Import', 'Open the file in your Dify workspace.'],
                ['03', 'Bind', 'Select the listed model and dataset requirements.'],
              ].map(([step, title, body]) => (
                <li key={step} className="grid grid-cols-[2rem_1fr] gap-3">
                  <span className="font-mono text-xs text-fd-primary">{step}</span>
                  <div>
                    <p className="text-sm font-semibold text-fd-foreground">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-fd-muted-foreground">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20"
        aria-labelledby="catalog-title"
      >
        <div className="mb-9 grid gap-5 border-b border-fd-border pb-8 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-fd-primary">
              Built-in library
            </span>
            <h2
              id="catalog-title"
              className="mt-3 text-2xl font-bold tracking-tight text-fd-foreground sm:text-3xl"
            >
              Seven ways to start closer to done.
            </h2>
          </div>
          <p className="max-w-xl text-xs leading-relaxed text-fd-muted-foreground sm:text-right">
            Upstream popularity is a dated discovery signal, not an endorsement. Only original Spine
            YAML is distributed here.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {WORKFLOW_CATALOG.map((template, index) => (
            <WorkflowCard
              key={template.id}
              template={template}
              index={index}
              featured={index === 0}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-fd-border bg-fd-card/20">
        <div className="mx-auto grid w-full max-w-6xl gap-5 px-6 py-10 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-fd-primary">
            Source policy
          </span>
          <p className="max-w-3xl text-sm leading-relaxed text-fd-muted-foreground">
            {WORKFLOW_PROVENANCE_NOTICE}. Reference links acknowledge the public ideas used during
            discovery; no Dify Marketplace or n8n workflow configuration is copied into these
            downloads.
          </p>
        </div>
      </section>
    </main>
  );
}
