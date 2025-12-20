/**
 * API Module - Backward compatibility re-export
 *
 * This file re-exports from the new modular API structure.
 * Import directly from '@/lib/api' as before.
 *
 * For granular imports, use:
 * - import { projectsApi } from '@/lib/api/projects'
 * - import { agentsApi } from '@/lib/api/agents'
 * - etc.
 */

export * from './api/index';
