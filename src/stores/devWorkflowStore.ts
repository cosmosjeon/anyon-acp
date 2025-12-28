import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { StateCreator } from 'zustand';

export interface BlockedTicket {
  id: string;
  title: string;
  reason: string;
}

export type ExecutionLogStatus = 'running' | 'completed' | 'error';

export interface ExecutionLogEntry {
  stepId: string;
  stepTitle: string;
  status: ExecutionLogStatus;
  timestamp: number;
  waveInfo?: string;
  duration?: number;
  ticketsCompleted?: number;
  ticketsTotal?: number;
  ticketsBlocked?: number;
  generatedFiles?: string[];
  blockedTickets?: BlockedTicket[];
  startTime?: number;
}

interface DevWorkflowState {
  executionLogs: Record<string, ExecutionLogEntry[]>;
  currentRunningSteps: Record<string, string | null>;
  expandedLogs: Record<string, Set<number>>;
  isDevComplete: Record<string, boolean>;
  isOrchestratorComplete: Record<string, boolean>;

  appendLogEntry: (projectPath: string, entry: ExecutionLogEntry) => void;
  clearLogs: (projectPath: string) => void;
  setCurrentRunningStep: (projectPath: string, stepId: string | null) => void;
  toggleExpandedLog: (projectPath: string, timestamp: number) => void;
  setIsDevComplete: (projectPath: string, value: boolean) => void;
  setIsOrchestratorComplete: (projectPath: string, value: boolean) => void;
}

const devWorkflowStore: StateCreator<
  DevWorkflowState,
  [],
  [['zustand/subscribeWithSelector', never]],
  DevWorkflowState
> = (set) => ({
  executionLogs: {},
  currentRunningSteps: {},
  expandedLogs: {},
  isDevComplete: {},
  isOrchestratorComplete: {},

  appendLogEntry: (projectPath, entry) =>
    set((state) => ({
      executionLogs: {
        ...state.executionLogs,
        [projectPath]: [...(state.executionLogs[projectPath] ?? []), entry],
      },
    })),

  clearLogs: (projectPath) =>
    set((state) => ({
      executionLogs: {
        ...state.executionLogs,
        [projectPath]: [],
      },
    })),

  setCurrentRunningStep: (projectPath, stepId) =>
    set((state) => ({
      currentRunningSteps: {
        ...state.currentRunningSteps,
        [projectPath]: stepId,
      },
    })),

  toggleExpandedLog: (projectPath, timestamp) =>
    set((state) => {
      const existing = state.expandedLogs[projectPath] ?? new Set<number>();
      const next = new Set(existing);
      if (next.has(timestamp)) {
        next.delete(timestamp);
      } else {
        next.add(timestamp);
      }
      return {
        expandedLogs: {
          ...state.expandedLogs,
          [projectPath]: next,
        },
      };
    }),

  setIsDevComplete: (projectPath, value) =>
    set((state) => ({
      isDevComplete: {
        ...state.isDevComplete,
        [projectPath]: value,
      },
    })),

  setIsOrchestratorComplete: (projectPath, value) =>
    set((state) => ({
      isOrchestratorComplete: {
        ...state.isOrchestratorComplete,
        [projectPath]: value,
      },
    })),
});

export const useDevWorkflowStore = create<DevWorkflowState>()(
  subscribeWithSelector(devWorkflowStore)
);
