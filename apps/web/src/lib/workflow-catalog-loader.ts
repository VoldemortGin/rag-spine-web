import type { WorkflowTemplate } from './workflow-catalog-core';

let pendingCatalog: Promise<readonly WorkflowTemplate[]> | undefined;

export function loadWorkflowCatalog(): Promise<readonly WorkflowTemplate[]> {
  if (pendingCatalog !== undefined) {
    return pendingCatalog;
  }

  const catalogImport = import('./workflow-catalog').then((module) => module.WORKFLOW_CATALOG);
  pendingCatalog = catalogImport.catch((error: unknown) => {
    pendingCatalog = undefined;
    throw error;
  });
  return pendingCatalog;
}
