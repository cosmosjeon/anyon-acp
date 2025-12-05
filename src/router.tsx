/**
 * Route constants for type-safe navigation
 *
 * URL Structure:
 * - /projects                      → Project list (grid cards)
 * - /project/:projectId            → Workspace type selection (MVP vs Maintenance)
 * - /project/:projectId/mvp        → MVP development workspace
 * - /project/:projectId/maintenance → Maintenance workspace
 */
export const ROUTES = {
  PROJECTS: '/projects',
  PROJECT: (projectId: string) => `/project/${projectId}`,
  MVP_WORKSPACE: (projectId: string) => `/project/${projectId}/mvp`,
  MAINTENANCE_WORKSPACE: (projectId: string) => `/project/${projectId}/maintenance`,
} as const;
