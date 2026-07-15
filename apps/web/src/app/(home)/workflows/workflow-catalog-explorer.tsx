'use client';

import { useCallback, useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import {
  filterWorkflowCatalog,
  paginateWorkflowCatalog,
  WORKFLOW_BATCH_SIZE,
  type WorkflowFilterOptions,
  type WorkflowTemplate,
} from '../../../lib/workflow-catalog-core';
import { loadWorkflowCatalog } from '../../../lib/workflow-catalog-loader';
import { WorkflowCard } from './workflow-card';

const countFormatter = new Intl.NumberFormat('en-US');

type CatalogLoadState = 'idle' | 'loading' | 'ready' | 'error';

export interface WorkflowCatalogExplorerProps {
  children?: ReactNode;
  filterOptions: WorkflowFilterOptions;
  initialVisibleCount: number;
  totalCount: number;
}

interface WorkflowCatalogLoadPanelProps {
  loadState: Extract<CatalogLoadState, 'loading' | 'error'>;
  onClear: () => void;
  onRetry: () => void;
  totalCount: number;
}

export function WorkflowCatalogLoadPanel({
  loadState,
  onClear,
  onRetry,
  totalCount,
}: WorkflowCatalogLoadPanelProps) {
  if (loadState === 'loading') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="rounded-2xl border border-fd-border bg-fd-card/25 px-6 py-14 text-center"
      >
        <span
          aria-hidden
          className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-fd-border border-t-fd-primary"
        />
        <h3 className="mt-5 text-lg font-bold text-fd-foreground">
          Loading the full workflow catalog
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-fd-muted-foreground">
          Preparing all {countFormatter.format(totalCount)} workflows for local search and
          filtering.
        </p>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="rounded-2xl border border-dashed border-fd-border bg-fd-card/25 px-6 py-14 text-center"
    >
      <h3 className="text-lg font-bold text-fd-foreground">
        The full workflow catalog could not be loaded
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-fd-muted-foreground">
        Retry the catalog download, or return to the first built-in starters already available on
        this page.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 rounded-full bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground"
        >
          Retry catalog
        </button>
        <button
          type="button"
          onClick={onClear}
          className="min-h-11 rounded-full border border-fd-primary/35 px-5 py-2.5 text-sm font-semibold text-fd-primary transition-colors hover:bg-fd-primary/8"
        >
          Back to first starters
        </button>
      </div>
    </div>
  );
}

export function WorkflowCatalogExplorer({
  children,
  filterOptions,
  initialVisibleCount,
  totalCount,
}: WorkflowCatalogExplorerProps) {
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('');
  const [useCase, setUseCase] = useState('');
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const [templates, setTemplates] = useState<readonly WorkflowTemplate[] | null>(null);
  const [loadState, setLoadState] = useState<CatalogLoadState>('idle');
  const filteredTemplates = useMemo(
    () =>
      templates === null ? [] : filterWorkflowCatalog(templates, { industry, query, useCase }),
    [industry, query, templates, useCase],
  );
  const page = useMemo(
    () => paginateWorkflowCatalog(filteredTemplates, visibleCount),
    [filteredTemplates, visibleCount],
  );

  const requestFullCatalog = useCallback(() => {
    if (templates !== null || loadState === 'loading') {
      return;
    }

    setLoadState('loading');
    void loadWorkflowCatalog().then(
      (loadedTemplates) => {
        setTemplates(loadedTemplates);
        setLoadState('ready');
      },
      () => {
        setLoadState('error');
      },
    );
  }, [loadState, templates]);

  const handleQueryChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
      setVisibleCount(WORKFLOW_BATCH_SIZE);
      requestFullCatalog();
    },
    [requestFullCatalog],
  );
  const handleIndustryChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setIndustry(event.target.value);
      setVisibleCount(WORKFLOW_BATCH_SIZE);
      requestFullCatalog();
    },
    [requestFullCatalog],
  );
  const handleUseCaseChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setUseCase(event.target.value);
      setVisibleCount(WORKFLOW_BATCH_SIZE);
      requestFullCatalog();
    },
    [requestFullCatalog],
  );
  const handleShowMore = useCallback(() => {
    setVisibleCount((currentCount) => Math.min(totalCount, currentCount + WORKFLOW_BATCH_SIZE));
    requestFullCatalog();
  }, [requestFullCatalog, totalCount]);
  const handleClearFilters = useCallback(() => {
    setQuery('');
    setIndustry('');
    setUseCase('');
    setVisibleCount(initialVisibleCount);
    setLoadState(templates === null ? 'idle' : 'ready');
  }, [initialVisibleCount, templates]);

  const showingInitialResults = templates === null;
  const resultTotal = showingInitialResults ? totalCount : filteredTemplates.length;
  const resultCount = countFormatter.format(resultTotal);
  const resultNoun = resultTotal === 1 ? 'workflow' : 'workflows';
  const initialRemainingCount = Math.max(0, totalCount - initialVisibleCount);
  const initialNextCount = Math.min(WORKFLOW_BATCH_SIZE, initialRemainingCount);

  return (
    <div aria-busy={loadState === 'loading'}>
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-fd-border bg-fd-card/40 p-3.5 sm:p-4 lg:grid-cols-[minmax(16rem,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="col-span-2 grid gap-1.5 lg:col-span-1">
          <label htmlFor="workflow-search" className="text-xs font-semibold text-fd-foreground">
            Search workflows
          </label>
          <input
            id="workflow-search"
            type="search"
            value={query}
            onChange={handleQueryChange}
            aria-controls="workflow-results"
            aria-describedby="workflow-result-count"
            placeholder="Try paper Q&A, translation, or 结构化字段"
            className="min-h-11 w-full rounded-xl border border-fd-border bg-fd-background px-3.5 py-2.5 text-sm text-fd-foreground outline-none transition focus:border-fd-primary focus:ring-2 focus:ring-fd-primary/20"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="workflow-industry" className="text-xs font-semibold text-fd-foreground">
            Industry
          </label>
          <select
            id="workflow-industry"
            value={industry}
            onChange={handleIndustryChange}
            aria-controls="workflow-results"
            className="min-h-11 w-full rounded-xl border border-fd-border bg-fd-background px-3.5 py-2.5 text-sm text-fd-foreground outline-none transition focus:border-fd-primary focus:ring-2 focus:ring-fd-primary/20"
          >
            <option value="">All industries</option>
            {filterOptions.industries.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="workflow-use-case" className="text-xs font-semibold text-fd-foreground">
            Use case
          </label>
          <select
            id="workflow-use-case"
            value={useCase}
            onChange={handleUseCaseChange}
            aria-controls="workflow-results"
            className="min-h-11 w-full rounded-xl border border-fd-border bg-fd-background px-3.5 py-2.5 text-sm text-fd-foreground outline-none transition focus:border-fd-primary focus:ring-2 focus:ring-fd-primary/20"
          >
            <option value="">All use cases</option>
            {filterOptions.useCases.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="my-4 flex min-h-7 items-center justify-between gap-4">
        <p
          id="workflow-result-count"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-sm text-fd-muted-foreground"
        >
          {loadState === 'loading' ? (
            <>
              <span className="font-semibold text-fd-foreground">
                Loading the full {countFormatter.format(totalCount)}-workflow catalog…
              </span>{' '}
              · {countFormatter.format(initialVisibleCount)} starters remain available
            </>
          ) : loadState === 'error' ? (
            <>
              <span className="font-semibold text-fd-foreground">Catalog loading failed</span> ·{' '}
              showing {countFormatter.format(initialVisibleCount)} starters
            </>
          ) : (
            <>
              <span className="font-semibold text-fd-foreground">
                {resultCount} {resultNoun} found
              </span>
              {resultTotal > 0 ? (
                <span>
                  {' '}
                  · showing{' '}
                  {countFormatter.format(
                    showingInitialResults ? initialVisibleCount : page.visibleTemplates.length,
                  )}
                </span>
              ) : null}
            </>
          )}
        </p>
      </div>

      {showingInitialResults ? (
        <>
          {children}
          {loadState === 'error' ? (
            <div className="mt-4">
              <WorkflowCatalogLoadPanel
                loadState="error"
                onClear={handleClearFilters}
                onRetry={requestFullCatalog}
                totalCount={totalCount}
              />
            </div>
          ) : initialRemainingCount > 0 ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleShowMore}
                aria-controls="workflow-results"
                disabled={loadState === 'loading'}
                className="min-h-11 rounded-lg border border-fd-primary/35 bg-fd-card/40 px-5 py-2.5 text-sm font-semibold text-fd-primary transition-colors hover:bg-fd-primary/8 disabled:cursor-wait disabled:opacity-60"
              >
                {loadState === 'loading' ? (
                  <>Loading full catalog…</>
                ) : (
                  <>
                    Show {countFormatter.format(initialNextCount)} more (
                    {countFormatter.format(initialRemainingCount)} remaining)
                  </>
                )}
              </button>
            </div>
          ) : null}
        </>
      ) : filteredTemplates.length === 0 ? (
        <div
          id="workflow-results"
          className="rounded-2xl border border-dashed border-fd-border bg-fd-card/25 px-6 py-14 text-center"
        >
          <h3 className="text-lg font-bold text-fd-foreground">No workflows match these filters</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-fd-muted-foreground">
            Try a broader search, choose different filters, or reset the catalog.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="mt-5 min-h-11 rounded-full border border-fd-primary/35 px-5 py-2.5 text-sm font-semibold text-fd-primary transition-colors hover:bg-fd-primary/8"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div
            id="workflow-results"
            className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {page.visibleTemplates.map((template) => (
              <WorkflowCard key={template.id} template={template} />
            ))}
          </div>

          {page.hasMore ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleShowMore}
                aria-controls="workflow-results"
                className="min-h-11 rounded-lg border border-fd-primary/35 bg-fd-card/40 px-5 py-2.5 text-sm font-semibold text-fd-primary transition-colors hover:bg-fd-primary/8"
              >
                Show {countFormatter.format(page.nextVisibleCount - page.visibleTemplates.length)}{' '}
                more ({countFormatter.format(page.remainingCount)} remaining)
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
