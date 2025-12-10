import React, { useState, useEffect } from 'react';
import { Check, AlertTriangle, ExternalLink, RefreshCw, Unlink, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { usePublishStore } from '@/stores/publishStore';

interface VercelConnectorProps {
  projectName: string;
  githubRepo?: {
    name: string;
    fullName: string;
    url: string;
  } | null;
}

interface VercelProject {
  id: string;
  name: string;
  framework: string | null;
}

interface VercelDeployment {
  uid: string;
  url: string;
  state: string;
  createdAt: number;
  readyState: 'READY' | 'BUILDING' | 'ERROR' | 'QUEUED' | 'CANCELED';
}

/**
 * VercelConnector - Vercel 배포 연동 컴포넌트
 * 
 * 기능:
 * - Vercel 토큰 저장
 * - GitHub 레포와 연결된 Vercel 프로젝트 생성
 * - 배포 상태 확인
 */
export const VercelConnector: React.FC<VercelConnectorProps> = ({
  projectName,
  githubRepo,
}) => {
  const {
    vercelToken,
    vercelProject,
    vercelConnected,
    deployments,
    setVercelToken,
    setVercelProject,
    setVercelConnected,
    setDeployments,
  } = usePublishStore();

  // Token input state
  const [tokenInput, setTokenInput] = useState('');
  const [isSavingToken, setIsSavingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Project setup state
  const [setupMode, setSetupMode] = useState<'create' | 'existing'>('create');
  const [newProjectName, setNewProjectName] = useState(projectName);
  const [availableProjects, setAvailableProjects] = useState<VercelProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Deployments state
  const [isLoadingDeployments, setIsLoadingDeployments] = useState(false);

  // Load projects when token is set
  useEffect(() => {
    const fetchProjects = async () => {
      if (!vercelToken) return;

      setIsLoadingProjects(true);
      try {
        const response = await fetch('https://api.vercel.com/v9/projects', {
          headers: {
            Authorization: `Bearer ${vercelToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        setAvailableProjects(data.projects || []);
      } catch (error) {
        console.error('Failed to load Vercel projects:', error);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    if (vercelToken && setupMode === 'existing') {
      fetchProjects();
    }
  }, [vercelToken, setupMode]);

  // Load deployments when connected
  useEffect(() => {
    const fetchDeployments = async () => {
      if (!vercelToken || !vercelProject) return;

      setIsLoadingDeployments(true);
      try {
        const response = await fetch(
          `https://api.vercel.com/v6/deployments?projectId=${vercelProject.id}&limit=5`,
          {
            headers: {
              Authorization: `Bearer ${vercelToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch deployments');
        }

        const data = await response.json();
        setDeployments(data.deployments || []);
      } catch (error) {
        console.error('Failed to load deployments:', error);
      } finally {
        setIsLoadingDeployments(false);
      }
    };

    if (vercelConnected && vercelProject) {
      fetchDeployments();
    }
  }, [vercelConnected, vercelProject, vercelToken, setDeployments]);

  const loadDeployments = async () => {
    if (!vercelToken || !vercelProject) return;

    setIsLoadingDeployments(true);
    try {
      const response = await fetch(
        `https://api.vercel.com/v6/deployments?projectId=${vercelProject.id}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${vercelToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch deployments');
      }

      const data = await response.json();
      setDeployments(data.deployments || []);
    } catch (error) {
      console.error('Failed to load deployments:', error);
    } finally {
      setIsLoadingDeployments(false);
    }
  };

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsSavingToken(true);
    setTokenError(null);

    try {
      // Verify token
      const response = await fetch('https://api.vercel.com/v2/user', {
        headers: {
          Authorization: `Bearer ${tokenInput.trim()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      setVercelToken(tokenInput.trim());
      setTokenInput('');
    } catch (err: any) {
      setTokenError(err.message || 'Failed to verify token');
    } finally {
      setIsSavingToken(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vercelToken || !newProjectName.trim()) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const projectBody: any = {
        name: newProjectName.trim(),
        framework: 'nextjs', // Default to Next.js
      };

      // If GitHub repo is connected, link it
      if (githubRepo) {
        projectBody.gitRepository = {
          type: 'github',
          repo: githubRepo.fullName,
        };
      }

      const response = await fetch('https://api.vercel.com/v10/projects', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create project');
      }

      const project = await response.json();
      setVercelProject({
        id: project.id,
        name: project.name,
        url: `https://${project.name}.vercel.app`,
      });
      setVercelConnected(true);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnectExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vercelToken || !selectedProjectId) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const response = await fetch(
        `https://api.vercel.com/v9/projects/${selectedProjectId}`,
        {
          headers: {
            Authorization: `Bearer ${vercelToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Project not found');
      }

      const project = await response.json();
      setVercelProject({
        id: project.id,
        name: project.name,
        url: `https://${project.name}.vercel.app`,
      });
      setVercelConnected(true);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to connect to project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDisconnect = () => {
    setVercelProject(null);
    setVercelConnected(false);
    setDeployments([]);
  };

  const openInBrowser = (url: string) => {
    window.open(url, '_blank');
  };

  const getDeploymentStatusColor = (status: string) => {
    switch (status) {
      case 'READY':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'BUILDING':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'ERROR':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'QUEUED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  // GitHub 연결 필요 메시지
  if (!githubRepo) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
              GitHub 연결 필요
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Vercel 배포를 위해서는 먼저 GitHub 레포지토리를 연결해주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Connected view
  if (vercelConnected && vercelProject) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <Check className="w-4 h-4" />
          <span>Vercel에 연결됨</span>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span className="font-medium">{vercelProject.name}</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openInBrowser(vercelProject.url)}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
              >
                <Unlink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <a
            href={vercelProject.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {vercelProject.url}
          </a>

          {/* Deployments */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">최근 배포</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadDeployments}
                disabled={isLoadingDeployments}
              >
                <RefreshCw className={cn("w-4 h-4", isLoadingDeployments && "animate-spin")} />
              </Button>
            </div>

            {deployments.length > 0 ? (
              <div className="space-y-2">
                {deployments.map((deployment: VercelDeployment) => (
                  <div
                    key={deployment.uid}
                    className="flex items-center justify-between p-2 bg-background rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        getDeploymentStatusColor(deployment.readyState)
                      )}>
                        {deployment.readyState}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(deployment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openInBrowser(`https://${deployment.url}`)}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isLoadingDeployments ? '불러오는 중...' : '배포 기록이 없습니다'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Token input
  if (!vercelToken) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
            Vercel에 배포하려면 Access Token이 필요합니다:
          </p>
          <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1 mb-4">
            <li>Vercel 계정이 없다면 가입하세요</li>
            <li>Settings → Tokens에서 새 토큰 생성</li>
            <li>생성된 토큰을 아래에 입력하세요</li>
          </ol>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => openInBrowser('https://vercel.com/signup')}
            >
              Vercel 가입
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => openInBrowser('https://vercel.com/account/tokens')}
            >
              토큰 생성하기
            </Button>
          </div>
        </div>

        <form onSubmit={handleSaveToken} className="space-y-3">
          <div>
            <Label className="text-sm font-medium">Vercel Access Token</Label>
            <Input
              type="password"
              placeholder="Enter your Vercel token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              disabled={isSavingToken}
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            disabled={!tokenInput.trim() || isSavingToken}
            className="w-full"
          >
            {isSavingToken ? '확인 중...' : '토큰 저장'}
          </Button>
        </form>

        {tokenError && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
            {tokenError}
          </div>
        )}
      </div>
    );
  }

  // Project setup
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <Check className="w-4 h-4" />
        <span>Vercel 토큰 연결됨</span>
      </div>

      {/* Mode Toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setSetupMode('create')}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium transition-colors",
            setupMode === 'create'
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          )}
        >
          새 프로젝트 생성
        </button>
        <button
          type="button"
          onClick={() => setSetupMode('existing')}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium transition-colors border-l border-border",
            setupMode === 'existing'
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          )}
        >
          기존 프로젝트 연결
        </button>
      </div>

      {setupMode === 'create' ? (
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">프로젝트 이름</Label>
            <Input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="my-awesome-app"
              disabled={isCreating}
              className="mt-1"
            />
          </div>

          <div className="bg-muted/50 rounded-md p-3 text-sm">
            <p className="text-muted-foreground">
              GitHub 레포지토리 <strong>{githubRepo.fullName}</strong>와 연결됩니다.
              푸시할 때마다 자동으로 배포됩니다.
            </p>
          </div>

          <Button
            type="submit"
            disabled={!newProjectName.trim() || isCreating}
            className="w-full"
          >
            {isCreating ? '생성 중...' : '프로젝트 생성 및 배포'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleConnectExisting} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">프로젝트 선택</Label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={isLoadingProjects || isCreating}
              className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
            >
              <option value="">
                {isLoadingProjects ? '불러오는 중...' : '프로젝트 선택'}
              </option>
              {availableProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} {project.framework && `(${project.framework})`}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            disabled={!selectedProjectId || isCreating}
            className="w-full"
          >
            {isCreating ? '연결 중...' : '프로젝트 연결'}
          </Button>
        </form>
      )}

      {createError && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertTriangle className="w-4 h-4" />
          {createError}
        </div>
      )}
    </div>
  );
};

export default VercelConnector;
