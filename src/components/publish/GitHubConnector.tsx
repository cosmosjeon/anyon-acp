import React, { useState, useEffect } from 'react';
import { Github, Check, AlertTriangle, ExternalLink, RefreshCw, Unlink } from 'lucide-react';
import { open } from '@tauri-apps/plugin-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { usePublishStore } from '@/stores/publishStore';
import { api } from '@/lib/api';

interface GitHubConnectorProps {
  projectPath?: string;
  projectName: string;
}

interface GitHubRepo {
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
}

/**
 * GitHubConnector - GitHub 연동 컴포넌트
 * 
 * 기능:
 * - GitHub 토큰 저장
 * - 새 레포지토리 생성 또는 기존 레포 연결
 * - 코드 동기화 (push)
 */
export const GitHubConnector: React.FC<GitHubConnectorProps> = ({
  projectPath,
  projectName,
}) => {
  const {
    githubToken,
    githubRepo,
    githubConnected,
    setGithubToken,
    setGithubRepo,
    setGithubConnected,
  } = usePublishStore();

  // Token input state
  const [tokenInput, setTokenInput] = useState('');
  const [isSavingToken, setIsSavingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenSuccess, setTokenSuccess] = useState(false);

  // Repository state
  const [setupMode, setSetupMode] = useState<'create' | 'existing'>('create');
  const [repoName, setRepoName] = useState(projectName);
  const [isPrivate, setIsPrivate] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Available repos for 'existing' mode
  const [availableRepos, setAvailableRepos] = useState<GitHubRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [selectedRepoFullName, setSelectedRepoFullName] = useState('');

  // Load available repos when token is set and mode is 'existing'
  useEffect(() => {
    if (githubToken && setupMode === 'existing') {
      loadAvailableRepos();
    }
  }, [githubToken, setupMode]);

  const loadAvailableRepos = async () => {
    if (!githubToken) return;
    
    setIsLoadingRepos(true);
    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=30', {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      
      const repos = await response.json();
      setAvailableRepos(repos);
    } catch (error) {
      console.error('Failed to load repos:', error);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsSavingToken(true);
    setTokenError(null);
    setTokenSuccess(false);

    try {
      // Verify token by making a test API call
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenInput.trim()}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error('Invalid token or insufficient permissions');
      }

      const user = await response.json();
      
      // Save token to store (and localStorage)
      setGithubToken(tokenInput.trim());
      setTokenSuccess(true);
      setTokenInput('');
      
      console.log('GitHub connected as:', user.login);
    } catch (err: any) {
      setTokenError(err.message || 'Failed to verify token');
    } finally {
      setIsSavingToken(false);
    }
  };

  const handleCreateRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubToken || !repoName.trim()) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: repoName.trim(),
          private: isPrivate,
          auto_init: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create repository');
      }

      const repo = await response.json();
      setGithubRepo({
        name: repo.name,
        fullName: repo.full_name,
        url: repo.html_url,
        isPrivate: repo.private,
      });
      setGithubConnected(true);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create repository');
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnectExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubToken || !selectedRepoFullName) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const response = await fetch(`https://api.github.com/repos/${selectedRepoFullName}`, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error('Repository not found or access denied');
      }

      const repo = await response.json();
      setGithubRepo({
        name: repo.name,
        fullName: repo.full_name,
        url: repo.html_url,
        isPrivate: repo.private,
      });
      setGithubConnected(true);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to connect to repository');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSync = async () => {
    if (!projectPath || !githubRepo || !githubToken) return;

    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccess(false);

    try {
      // 1. Check git status for changes
      const statusResult = await api.gitStatus(projectPath);
      const hasChanges = statusResult.stdout.trim().length > 0;

      if (hasChanges) {
        // 2. git add .
        const addResult = await api.gitAddAll(projectPath);
        if (!addResult.success) {
          throw new Error(`Failed to add files: ${addResult.stderr}`);
        }

        // 3. git commit
        const commitMessage = `Sync from Anyon - ${new Date().toLocaleString()}`;
        const commitResult = await api.gitCommit(projectPath, commitMessage);
        if (!commitResult.success) {
          // Ignore "nothing to commit" error
          if (!commitResult.stderr.includes('nothing to commit')) {
            throw new Error(`Failed to commit: ${commitResult.stderr}`);
          }
        }
      }

      // 4. Set remote origin
      const repoUrl = `https://github.com/${githubRepo.fullName}.git`;
      const setRemoteResult = await api.gitSetRemote(projectPath, repoUrl);
      // Ignore errors if remote already exists
      console.log('Set remote result:', setRemoteResult);

      // 5. Get current branch
      const branchResult = await api.gitCurrentBranch(projectPath);
      const branch = branchResult.stdout.trim() || 'main';

      // 6. git push
      const pushResult = await api.gitPush(projectPath, repoUrl, githubToken, branch);
      if (!pushResult.success) {
        throw new Error(`Failed to push: ${pushResult.stderr}`);
      }

      setSyncSuccess(true);
      setLastSyncTime(new Date().toLocaleString());
    } catch (err: any) {
      console.error('Sync error:', err);
      setSyncError(err.message || 'Failed to sync to GitHub');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = () => {
    setGithubRepo(null);
    setGithubConnected(false);
  };

  const openInBrowser = async (url: string) => {
    try {
      await open(url);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  // Already connected view
  if (githubConnected && githubRepo) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="w-4 h-4 text-green-500" />
          <span>Connected to GitHub</span>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              <span className="font-medium">{githubRepo.fullName}</span>
              {githubRepo.isPrivate && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                  Private
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openInBrowser(githubRepo.url)}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {lastSyncTime && (
            <p className="text-xs text-muted-foreground">
              Last synced: {lastSyncTime}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex-1"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync to GitHub
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDisconnect}
            >
              <Unlink className="w-4 h-4" />
            </Button>
          </div>

          {syncError && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              {syncError}
            </div>
          )}

          {syncSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="w-4 h-4" />
              Successfully synced to GitHub!
            </div>
          )}
        </div>
      </div>
    );
  }

  // Not connected - show token input or repo setup
  if (!githubToken) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
            GitHub에 연결하려면 Personal Access Token이 필요합니다:
          </p>
          <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1 mb-4">
            <li>GitHub 계정이 없다면 먼저 가입하세요</li>
            <li>Settings → Developer settings → Personal access tokens</li>
            <li>Generate new token (repo 권한 필요)</li>
            <li>생성된 토큰을 아래에 입력하세요</li>
          </ol>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => openInBrowser('https://github.com/signup')}
            >
              GitHub 가입
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => openInBrowser('https://github.com/settings/tokens/new?scopes=repo')}
            >
              토큰 생성하기
            </Button>
          </div>
        </div>

        <form onSubmit={handleSaveToken} className="space-y-3">
          <div>
            <Label className="text-sm font-medium">GitHub Personal Access Token</Label>
            <Input
              type="password"
              placeholder="ghp_xxxxxxxxxxxx"
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

        {tokenSuccess && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Check className="w-4 h-4" />
            GitHub 연결 성공!
          </div>
        )}
      </div>
    );
  }

  // Token exists but no repo connected - show repo setup
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <Check className="w-4 h-4" />
        <span>GitHub 토큰 연결됨</span>
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
          새 레포 생성
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
          기존 레포 연결
        </button>
      </div>

      {setupMode === 'create' ? (
        <form onSubmit={handleCreateRepo} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">레포지토리 이름</Label>
            <Input
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="my-awesome-project"
              disabled={isCreating}
              className="mt-1"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="private-repo"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded border-border"
            />
            <Label htmlFor="private-repo" className="text-sm">
              Private 레포지토리
            </Label>
          </div>

          <Button
            type="submit"
            disabled={!repoName.trim() || isCreating}
            className="w-full"
          >
            {isCreating ? '생성 중...' : '레포지토리 생성'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleConnectExisting} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">레포지토리 선택</Label>
            <select
              value={selectedRepoFullName}
              onChange={(e) => setSelectedRepoFullName(e.target.value)}
              disabled={isLoadingRepos || isCreating}
              className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
            >
              <option value="">
                {isLoadingRepos ? '불러오는 중...' : '레포지토리 선택'}
              </option>
              {availableRepos.map((repo) => (
                <option key={repo.full_name} value={repo.full_name}>
                  {repo.full_name} {repo.private ? '(Private)' : ''}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            disabled={!selectedRepoFullName || isCreating}
            className="w-full"
          >
            {isCreating ? '연결 중...' : '레포지토리 연결'}
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

export default GitHubConnector;
