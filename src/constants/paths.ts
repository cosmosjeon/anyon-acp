/**
 * Path constants for anyon-docs directory structure
 * Centralized path management for planning and development workflows
 */

export const ANYON_DOCS = {
  ROOT: 'anyon-docs',
  PLANNING: 'anyon-docs/planning',
  DEV_PLAN: 'anyon-docs/dev-plan',
  PLANNING_FILES: {
    PRD: 'prd.md',
    UX: 'ui-ux.html',
    DESIGN: 'design-guide.md',
    TRD: 'trd.md',
    ARCHITECTURE: 'architecture.md',
    ERD: 'erd.md',
  },
  DEV_FILES: {
    COMPLETE_MARKER: 'DEVELOPMENT_COMPLETE.md',
    EXECUTION_PLAN: 'execution-plan.md',
  },
} as const;

/**
 * Build full path for planning document
 */
export const getPlanningFilePath = (projectPath: string, filename: string): string => {
  return `${projectPath}/${ANYON_DOCS.PLANNING}/${filename}`;
};

/**
 * Build full path for development document
 */
export const getDevFilePath = (projectPath: string, filename: string): string => {
  return `${projectPath}/${ANYON_DOCS.DEV_PLAN}/${filename}`;
};
