import React from 'react';
import { Github, Globe, Rocket } from 'lucide-react';
import { GitHubConnector } from './GitHubConnector';
import { VercelConnector } from './VercelConnector';
import { usePublishStore } from '@/stores/publishStore';

interface PublishPanelProps {
  projectPath?: string;
}

/**
 * PublishPanel - 배포 패널 메인 컴포넌트
 * 
 * MvpWorkspace와 MaintenanceWorkspace의 탭 콘텐츠로 사용
 * GitHub 연동 → Vercel 배포 순서로 진행
 */
export const PublishPanel: React.FC<PublishPanelProps> = ({ projectPath }) => {
  const { githubRepo, githubConnected, vercelConnected, vercelProject } = usePublishStore();

  // 프로젝트 이름 추출
  const projectName = projectPath?.split('/').pop() || 'my-project';

  if (!projectPath) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Rocket className="w-6 h-6 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          프로젝트를 선택하세요
        </h2>
        <p className="text-muted-foreground max-w-md">
          배포 옵션을 보려면 프로젝트를 먼저 선택해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            앱 배포
          </h1>
          <p className="text-muted-foreground">
            GitHub와 Vercel을 연결하여 앱을 배포하세요.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              githubConnected 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                : 'bg-primary/10 text-primary'
            }`}>
              {githubConnected ? '✓' : '1'}
            </div>
            <span className={`text-sm font-medium ${githubConnected ? 'text-green-600 dark:text-green-400' : ''}`}>
              GitHub
            </span>
          </div>
          
          <div className="flex-1 h-0.5 bg-border" />
          
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              vercelConnected 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                : githubConnected
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {vercelConnected ? '✓' : '2'}
            </div>
            <span className={`text-sm font-medium ${
              vercelConnected 
                ? 'text-green-600 dark:text-green-400' 
                : !githubConnected 
                  ? 'text-muted-foreground' 
                  : ''
            }`}>
              Vercel
            </span>
          </div>
        </div>

        {/* GitHub Section */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
            <Github className="w-5 h-5" />
            <h2 className="font-semibold">GitHub</h2>
            {githubConnected && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                연결됨
              </span>
            )}
          </div>
          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              코드를 GitHub에 동기화하여 버전 관리와 협업을 시작하세요.
            </p>
            <GitHubConnector
              projectPath={projectPath}
              projectName={projectName}
            />
          </div>
        </div>

        {/* Vercel Section */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
            <Globe className="w-5 h-5" />
            <h2 className="font-semibold">Vercel</h2>
            {vercelConnected && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                배포됨
              </span>
            )}
          </div>
          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              Vercel에 배포하여 전 세계에서 접근 가능한 URL을 받으세요.
            </p>
            <VercelConnector
              projectName={projectName}
              githubRepo={githubRepo}
            />
          </div>
        </div>

        {/* Success State */}
        {vercelConnected && vercelProject && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-green-800 dark:text-green-200">
                  배포 완료!
                </h3>
                <a
                  href={vercelProject.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 dark:text-green-400 hover:underline"
                >
                  {vercelProject.url}
                </a>
              </div>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-3">
              GitHub에 코드를 푸시하면 자동으로 배포됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublishPanel;
