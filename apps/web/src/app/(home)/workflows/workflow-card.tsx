'use client';

import {
  BookOpen,
  Check,
  Download,
  FileText,
  GitBranch,
  Info,
  Languages,
  ListChecks,
  ScanText,
  Scale,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import {
  formatPopularity,
  hasWorkflowSource,
  workflowDownloadHref,
  type WorkflowTemplate,
} from '../../../lib/workflow-catalog-core';
import { WorkflowDetailDialog } from './workflow-detail-dialog';

function TemplateIcon({ template }: { template: WorkflowTemplate }) {
  const iconProps = {
    'aria-hidden': true,
    className: 'h-[1.125rem] w-[1.125rem]',
    strokeWidth: 1.8,
  } as const;
  const useCase = template.use_cases[0]?.toLowerCase() ?? '';

  if (useCase.includes('research') || useCase.includes('knowledge')) {
    return <BookOpen {...iconProps} />;
  }
  if (useCase.includes('translation')) {
    return <Languages {...iconProps} />;
  }
  if (useCase.includes('content')) {
    return <ListChecks {...iconProps} />;
  }
  if (useCase.includes('analysis') || useCase.includes('summar')) {
    return <Scale {...iconProps} />;
  }
  if (useCase.includes('extract') || useCase.includes('document')) {
    return <ScanText {...iconProps} />;
  }
  if (useCase.includes('rout') || useCase.includes('classif')) {
    return <GitBranch {...iconProps} />;
  }
  return <FileText {...iconProps} />;
}

function requirementLabel(template: WorkflowTemplate): string {
  const count = template.requirements.length;
  return `${String(count)} ${count === 1 ? 'requirement' : 'requirements'}`;
}

export function WorkflowCard({ template }: { template: WorkflowTemplate }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const hasSource = hasWorkflowSource(template);
  const sourceLabel = hasSource
    ? `${template.source.provider.toUpperCase()} reference`
    : 'Spine original';
  const sourceTitle = hasSource
    ? `Inspired by public ${template.source.provider.toUpperCase()} listing metadata`
    : 'No upstream attribution supplied · Spine-authored original';
  const requirements = template.requirements.map((item) => item.name).join(', ');
  const openDetails = useCallback(() => {
    setDetailsOpen(true);
  }, []);
  const closeDetails = useCallback(() => {
    setDetailsOpen(false);
    window.setTimeout(() => {
      detailsTriggerRef.current?.focus();
    }, 0);
  }, []);

  return (
    <>
      <article
        id={template.id}
        className="group flex min-h-[17rem] flex-col rounded-xl border border-fd-border bg-fd-card/45 p-4 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-fd-primary/35 hover:bg-fd-card/70"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-fd-primary/20 bg-fd-primary/8 text-fd-primary">
            <TemplateIcon template={template} />
          </span>
          <div className="flex min-w-0 flex-wrap justify-end gap-1.5">
            <span
              title={sourceTitle}
              className="max-w-32 truncate rounded-md border border-fd-border bg-fd-background/55 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-fd-muted-foreground"
            >
              {sourceLabel}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-fd-primary/20 bg-fd-primary/8 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-fd-primary">
              <Check className="h-3 w-3" strokeWidth={2.4} aria-hidden />
              Runnable
            </span>
          </div>
        </div>

        <div className="mt-3.5">
          <h3
            title={template.name}
            className="line-clamp-2 min-h-11 text-[1.02rem] font-bold leading-snug tracking-tight text-fd-foreground"
          >
            {template.name}
          </h3>
          <p
            title={template.description}
            className="mt-2 line-clamp-2 min-h-10 text-xs leading-relaxed text-fd-muted-foreground"
          >
            {template.description}
          </p>
        </div>

        <ul className="mt-3 flex min-w-0 gap-1.5" aria-label={`${template.name} classification`}>
          {template.industries.slice(0, 1).map((industry) => (
            <li
              key={`industry-${industry}`}
              className="max-w-[45%] truncate rounded-md bg-fd-primary/8 px-2 py-1 text-[0.67rem] font-medium text-fd-primary"
              title={`Industry: ${industry}`}
            >
              {industry}
            </li>
          ))}
          {template.use_cases.slice(0, 1).map((useCase) => (
            <li
              key={`use-case-${useCase}`}
              className="max-w-[55%] truncate rounded-md bg-fd-background/70 px-2 py-1 text-[0.67rem] text-fd-muted-foreground"
              title={`Use case: ${useCase}`}
            >
              {useCase}
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-fd-border pt-3 text-[0.68rem] text-fd-muted-foreground">
          <span className="font-mono uppercase tracking-[0.08em]">
            Dify {template.compatibility.dsl_version}
          </span>
          <span
            className="truncate text-right"
            title={requirements}
            aria-label={`Requirements: ${requirements}`}
          >
            {requirementLabel(template)}
            {hasSource ? ` · ${formatPopularity(template.source)}` : ''}
          </span>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-3.5">
          <button
            ref={detailsTriggerRef}
            type="button"
            onClick={openDetails}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-fd-border px-3 py-2 text-sm font-medium text-fd-foreground transition-colors hover:border-fd-primary/35 hover:bg-fd-background/70"
            aria-label={`View details for ${template.name}`}
          >
            <Info className="h-4 w-4" aria-hidden />
            Details
          </button>
          <a
            href={workflowDownloadHref(template)}
            download={template.yaml}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-fd-primary px-3 py-2 text-sm font-semibold text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
            aria-label={`Download ${template.name} as Dify YAML`}
          >
            <Download className="h-4 w-4" aria-hidden />
            Download
          </a>
        </div>
      </article>
      {detailsOpen ? (
        <WorkflowDetailDialog open template={template} onClose={closeDetails} />
      ) : null}
    </>
  );
}
