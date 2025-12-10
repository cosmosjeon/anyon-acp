import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * GitHub 레포지토리 정보
 */
export interface GitHubRepoInfo {
  name: string;
  fullName: string;
  url: string;
  isPrivate: boolean;
}

/**
 * Vercel 프로젝트 정보
 */
export interface VercelProjectInfo {
  id: string;
  name: string;
  url: string;
}

/**
 * Vercel 배포 정보
 */
export interface VercelDeployment {
  uid: string;
  url: string;
  state: string;
  createdAt: number;
  readyState: 'READY' | 'BUILDING' | 'ERROR' | 'QUEUED' | 'CANCELED';
}

/**
 * 배포 상태 관리 Store
 * 
 * GitHub와 Vercel 연동 상태를 관리합니다.
 * persist 미들웨어를 사용하여 localStorage에 저장합니다.
 */
interface PublishState {
  // GitHub 상태
  githubToken: string | null;
  githubRepo: GitHubRepoInfo | null;
  githubConnected: boolean;
  
  // Vercel 상태
  vercelToken: string | null;
  vercelProject: VercelProjectInfo | null;
  vercelConnected: boolean;
  deployments: VercelDeployment[];
  
  // 로딩 상태
  isLoading: boolean;
  
  // GitHub Actions
  setGithubToken: (token: string | null) => void;
  setGithubRepo: (repo: GitHubRepoInfo | null) => void;
  setGithubConnected: (connected: boolean) => void;
  clearGithub: () => void;
  
  // Vercel Actions
  setVercelToken: (token: string | null) => void;
  setVercelProject: (project: VercelProjectInfo | null) => void;
  setVercelConnected: (connected: boolean) => void;
  setDeployments: (deployments: VercelDeployment[]) => void;
  addDeployment: (deployment: VercelDeployment) => void;
  clearVercel: () => void;
  
  // 공통 Actions
  setIsLoading: (loading: boolean) => void;
  resetAll: () => void;
}

const initialState = {
  githubToken: null,
  githubRepo: null,
  githubConnected: false,
  vercelToken: null,
  vercelProject: null,
  vercelConnected: false,
  deployments: [],
  isLoading: false,
};

export const usePublishStore = create<PublishState>()(
  persist(
    (set) => ({
      ...initialState,

      // GitHub Actions
      setGithubToken: (token) => set({ githubToken: token }),
      
      setGithubRepo: (repo) => set({ githubRepo: repo }),
      
      setGithubConnected: (connected) => set({ githubConnected: connected }),
      
      clearGithub: () => set({
        githubToken: null,
        githubRepo: null,
        githubConnected: false,
      }),

      // Vercel Actions
      setVercelToken: (token) => set({ vercelToken: token }),
      
      setVercelProject: (project) => set({ vercelProject: project }),
      
      setVercelConnected: (connected) => set({ vercelConnected: connected }),
      
      setDeployments: (deployments) => set({ deployments }),
      
      addDeployment: (deployment) => set((state) => ({
        deployments: [deployment, ...state.deployments].slice(0, 10), // 최대 10개 유지
      })),
      
      clearVercel: () => set({
        vercelToken: null,
        vercelProject: null,
        vercelConnected: false,
        deployments: [],
      }),

      // 공통 Actions
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      resetAll: () => set(initialState),
    }),
    {
      name: 'anyon-publish-storage',
      partialize: (state) => ({
        // 민감한 토큰은 저장하지 않음 (보안상 이유로)
        // 토큰은 세션 중에만 유지되며, 앱 재시작 시 다시 입력해야 함
        // connected 상태도 저장하지 않음 - 토큰 없이 connected=true면 API 호출 실패함
        // repo/project 정보만 저장하여 재연결 시 참조 가능하도록 함
        githubRepo: state.githubRepo,
        vercelProject: state.vercelProject,
      }),
    }
  )
);

// 선택자 함수들
export const selectGithubConnected = (state: PublishState) => state.githubConnected;
export const selectVercelConnected = (state: PublishState) => state.vercelConnected;
export const selectDeployments = (state: PublishState) => state.deployments;
export const selectIsFullyDeployed = (state: PublishState) => 
  state.githubConnected && state.vercelConnected;
