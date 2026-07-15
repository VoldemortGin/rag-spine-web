import catalogSnapshot from '../data/workflow-catalog.json';
import type { WorkflowCatalogSnapshot } from './workflow-catalog-core';

export * from './workflow-catalog-core';

const catalog: WorkflowCatalogSnapshot = catalogSnapshot;

export const WORKFLOW_CATALOG_SCHEMA_VERSION = catalog.schema_version;
export const WORKFLOW_CATALOG = catalog.templates;
