'use client';

import { ArrowUpRight, Check, Download, X } from 'lucide-react';
import { useCallback, useEffect, useRef, type MouseEvent } from 'react';
import {
  formatObservedDate,
  formatPopularity,
  hasWorkflowSource,
  requirementKindLabel,
  WORKFLOW_PROVENANCE_NOTICE,
  workflowDownloadHref,
  type WorkflowTemplate,
} from '../../../lib/workflow-catalog-core';

export interface WorkflowDetailDialogProps {
  onClose: () => void;
  open: boolean;
  template: WorkflowTemplate;
}

export function WorkflowDetailDialog({ onClose, open, template }: WorkflowDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const hasSource = hasWorkflowSource(template);
  const titleId = `workflow-detail-${template.id}`;
  const closeDialog = useCallback(() => {
    dialogRef.current?.close();
  }, []);
  const closeFromBackdrop = useCallback((event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onMouseDown={closeFromBackdrop}
      className="m-auto max-h-[min(88dvh,52rem)] w-[min(92vw,46rem)] overflow-hidden rounded-2xl border border-fd-border bg-fd-background p-0 text-fd-foreground shadow-2xl backdrop:bg-black/65 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[min(88dvh,52rem)] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-fd-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-fd-primary/20 bg-fd-primary/8 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-fd-primary">
                <Check className="h-3 w-3" strokeWidth={2.4} aria-hidden />
                Runnable Dify {template.compatibility.dsl_version}
              </span>
              <span className="text-xs text-fd-muted-foreground">
                {hasSource ? `${formatPopularity(template.source)} at discovery` : 'Spine original'}
              </span>
            </div>
            <h2 id={titleId} className="text-xl font-bold tracking-tight sm:text-2xl">
              {template.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDialog}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-fd-border text-fd-muted-foreground transition-colors hover:bg-fd-card hover:text-fd-foreground"
            aria-label="Close workflow details"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <p className="text-sm leading-relaxed text-fd-muted-foreground">{template.description}</p>

          <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${template.name} classifications`}>
            {[...template.industries, ...template.use_cases, ...template.categories].map(
              (label) => (
                <li
                  key={label}
                  className="rounded-md border border-fd-border bg-fd-card px-2.5 py-1 text-xs text-fd-muted-foreground"
                >
                  {label}
                </li>
              ),
            )}
          </ul>

          <div className="mt-6 grid gap-5 border-t border-fd-border pt-5 sm:grid-cols-2">
            <section aria-labelledby={`${titleId}-requirements`}>
              <h3
                id={`${titleId}-requirements`}
                className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-fd-muted-foreground"
              >
                Requirements
              </h3>
              <ul className="mt-3 grid gap-3">
                {template.requirements.map((requirement) => (
                  <li key={`${requirement.kind}-${requirement.name}`} className="text-sm">
                    <span className="block text-xs text-fd-muted-foreground">
                      {requirementKindLabel(requirement.kind)} ·{' '}
                      {requirement.required ? 'required' : 'optional'}
                    </span>
                    <code className="mt-1 block break-all text-xs text-fd-foreground">
                      {requirement.name}
                    </code>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby={`${titleId}-source`}>
              <h3
                id={`${titleId}-source`}
                className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-fd-muted-foreground"
              >
                Inspiration metadata
              </h3>
              {hasSource ? (
                <div className="mt-3 text-sm leading-relaxed">
                  <p className="font-medium">
                    {template.source.provider.toUpperCase()} · {template.source.title}
                  </p>
                  <p className="text-fd-muted-foreground">Reference by {template.source.author}</p>
                  <p className="text-fd-muted-foreground">
                    Observed {formatObservedDate(template.source)}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-fd-muted-foreground">
                  No upstream attribution supplied.
                </p>
              )}
            </section>
          </div>

          <p className="mt-6 border-t border-fd-border pt-4 text-xs leading-relaxed text-fd-muted-foreground">
            {hasSource
              ? WORKFLOW_PROVENANCE_NOTICE
              : 'Spine-authored original · no upstream configuration redistributed'}
          </p>
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-fd-border bg-fd-card/35 px-5 py-4 sm:px-6">
          {hasSource ? (
            <a
              href={template.source.upstream_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-fd-border px-4 py-2 text-sm font-medium transition-colors hover:bg-fd-card"
            >
              Inspiration listing
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          ) : null}
          <a
            href={workflowDownloadHref(template)}
            download={template.yaml}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-fd-primary px-4 py-2 text-sm font-semibold text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
          >
            <Download className="h-4 w-4" aria-hidden />
            Download YAML
          </a>
        </footer>
      </div>
    </dialog>
  );
}
