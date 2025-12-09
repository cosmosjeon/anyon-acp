import React, { useEffect, useState, Suspense, lazy, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Wrench,
  Loader2,
  Code,
  Monitor,
  X,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb } from '@/components/Breadcrumb';
import { FileExplorer } from '@/components/FileExplorer';
import { EnhancedPreviewPanel } from '@/components/preview';
import { WorkspaceSidebar } from '@/components/WorkspaceSidebar';
import { Settings } from '@/components/Settings';
import { useProjects, useProjectsNavigation } from '@/components/ProjectRoutes';
import type { Project, Session } from '@/lib/api';
import { api } from '@/lib/api';
import { SessionPersistenceService } from '@/services/sessionPersistence';
import { cn } from '@/lib/utils';

// Lazy load components
const ClaudeCodeSession = lazy(() =>
  import('@/components/ClaudeCodeSession').then(m => ({ default: m.ClaudeCodeSession }))
);
const FileTree = lazy(() => import('@/components/FileTree'));

type MaintenanceTabType = 'code' | 'preview';

interface MaintenanceWorkspaceProps {
  projectId: string;
}

/**
 * MaintenanceWorkspace - Maintenance workspace with Lovable/Bolt style layout
 *
 * Layout:
 * ┌────────┬─────────────────┬──────────────────────┐
 * │Sidebar │     Chat        │   Code/Preview       │
 * │ (56px) │  (flexible)     │   Tabs               │
 * └────────┴─────────────────┴──────────────────────┘
 */
export const MaintenanceWorkspace: React.FC<MaintenanceWorkspaceProps> = ({ projectId }) => {
  const { goToProject, goToProjectList } = useProjectsNavigation();
  const { projects, loading, getProjectById } = useProjects();
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<MaintenanceTabType>('code');
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filePanelOpen, setFilePanelOpen] = useState(false);
  const filePanelWidth = 280;

  // Right panel state
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [rightPanelWidth, setRightPanelWidth] = useState(45); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const found = getProjectById(projectId);
      setProject(found);
    }
  }, [projectId, projects, getProjectById]);

  // Load last session
  useEffect(() => {
    if (project?.path) {
      const lastSessionData = SessionPersistenceService.getLastSessionDataForTab(project.path, 'maintenance');
      if (lastSessionData) {
        const session = SessionPersistenceService.createSessionFromRestoreData(lastSessionData);
        setCurrentSession(session);
      }
    }
  }, [project?.path]);

  // Git repo check
  useEffect(() => {
    const checkGitRepo = async () => {
      if (project?.path) {
        try {
          const isGitRepo = await api.checkIsGitRepo(project.path);
          if (!isGitRepo) {
            const gitResult = await api.initGitRepo(project.path);
            if (gitResult.success) {
              console.log('Git repository initialized successfully');
            }
          }
        } catch (gitErr) {
          console.error('Failed to check/init git repo:', gitErr);
        }
      }
    };
    checkGitRepo();
  }, [project?.path]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey) {
        switch (e.key) {
          case 'b':
          case 'B':
            e.preventDefault();
            setFilePanelOpen(prev => !prev);
            break;
          case '\\':
            e.preventDefault();
            setRightPanelVisible(prev => !prev);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Resize handling
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const sidebarWidth = sidebarCollapsed ? 56 : 256; // Dynamic sidebar width
      const filePanelW = filePanelOpen ? filePanelWidth : 0;
      const availableWidth = rect.width - sidebarWidth - filePanelW;
      const mouseX = e.clientX - rect.left - sidebarWidth - filePanelW;
      const newRightWidth = ((availableWidth - mouseX) / availableWidth) * 100;
      setRightPanelWidth(Math.max(25, Math.min(70, newRightWidth)));
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, filePanelOpen, filePanelWidth, sidebarCollapsed]);

  const handleBack = () => {
    if (projectId) {
      goToProject(projectId);
    } else {
      goToProjectList();
    }
  };

  const handleSessionSelect = useCallback((session: Session | null) => {
    setCurrentSession(session);
    setSessionKey(prev => prev + 1);
    if (session && project?.path) {
      SessionPersistenceService.saveLastSessionForTab(project.path, 'maintenance', session.id);
    }
  }, [project?.path]);

  const handleSessionCreated = useCallback((sessionId: string) => {
    if (project?.path) {
      SessionPersistenceService.saveLastSessionForTab(project.path, 'maintenance', sessionId);
    }
  }, [project?.path]);

  const handleNewSession = useCallback(() => {
    setCurrentSession(null);
    setSessionKey(prev => prev + 1);
  }, []);

  const projectName = project?.path.split('/').pop() || 'Project';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Project not found</p>
        <Button variant="outline" onClick={() => goToProjectList()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>
    );
  }

  // Show settings view
  if (showSettings) {
    return (
      <div className="h-full flex overflow-hidden bg-background">
        <WorkspaceSidebar
          projectPath={project?.path || ''}
          tabType="maintenance"
          currentSessionId={currentSession?.id}
          onNewSession={handleNewSession}
          onSessionSelect={handleSessionSelect}
          filePanelOpen={filePanelOpen}
          onFilePanelToggle={() => setFilePanelOpen(prev => !prev)}
          rightPanelVisible={rightPanelVisible}
          onRightPanelToggle={() => setRightPanelVisible(prev => !prev)}
          onLogoClick={() => setShowSettings(false)}
          onSettingsClick={() => setShowSettings(false)}
          collapsed={sidebarCollapsed}
          onCollapseToggle={() => setSidebarCollapsed(prev => !prev)}
        />
        <div className="flex-1 h-full overflow-y-auto">
          <Settings onBack={() => setShowSettings(false)} />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full flex overflow-hidden bg-background">
      {/* Sidebar with Sessions */}
      <WorkspaceSidebar
        projectPath={project?.path || ''}
        tabType="maintenance"
        currentSessionId={currentSession?.id}
        onNewSession={handleNewSession}
        onSessionSelect={handleSessionSelect}
        filePanelOpen={filePanelOpen}
        onFilePanelToggle={() => setFilePanelOpen(prev => !prev)}
        rightPanelVisible={rightPanelVisible}
        onRightPanelToggle={() => setRightPanelVisible(prev => !prev)}
        onLogoClick={goToProjectList}
        onSettingsClick={() => setShowSettings(true)}
        collapsed={sidebarCollapsed}
        onCollapseToggle={() => setSidebarCollapsed(prev => !prev)}
      />

      {/* File Panel */}
      <AnimatePresence>
        {filePanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: filePanelWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full border-r border-border bg-background flex flex-col overflow-hidden flex-shrink-0"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="text-sm font-medium">Files</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFilePanelOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <Suspense fallback={<div className="p-4"><Loader2 className="w-4 h-4 animate-spin" /></div>}>
                {project?.path && (
                  <FileTree
                    rootPath={project.path}
                    onFileSelect={(file) => console.log('File selected:', file)}
                  />
                )}
              </Suspense>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div
        className="flex-1 h-full overflow-hidden flex flex-col"
        style={{ width: rightPanelVisible ? `${100 - rightPanelWidth}%` : '100%' }}
      >
        {/* Header with Breadcrumb */}
        <div className="flex-shrink-0 h-12 border-b border-border flex items-center px-4 gap-3">
          <Breadcrumb
            items={[
              {
                label: 'Projects',
                onClick: goToProjectList,
                icon: <FolderOpen className="w-4 h-4" />,
              },
              {
                label: projectName,
                onClick: () => goToProject(projectId),
              },
              {
                label: 'Maintenance',
                icon: <Wrench className="w-4 h-4 text-orange-500" />,
              },
            ]}
          />
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">
          <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>}>
            <ClaudeCodeSession
              key={sessionKey}
              session={currentSession || undefined}
              initialProjectPath={project?.path}
              onBack={handleBack}
              onProjectPathChange={() => {}}
              embedded={true}
              tabType="maintenance"
              onSessionCreated={handleSessionCreated}
            />
          </Suspense>
        </div>
      </div>

      {/* Right Panel (Code/Preview) */}
      <AnimatePresence>
        {rightPanelVisible && (
          <>
            {/* Resize Handle */}
            <div
              className={cn(
                'w-1 h-full cursor-col-resize flex-shrink-0 hover:bg-primary/50 transition-colors',
                isDragging && 'bg-primary'
              )}
              onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
            />

            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: `${rightPanelWidth}%`, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full bg-background border-l border-border overflow-hidden flex flex-col"
            >
              {/* Tabs Header */}
              <div className="flex-shrink-0 border-b border-border px-3 py-2">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MaintenanceTabType)}>
                  <TabsList className="bg-muted/50">
                    <TabsTrigger value="code" className="gap-1.5 text-xs">
                      <Code className="w-3.5 h-3.5" />
                      코드
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="gap-1.5 text-xs">
                      <Monitor className="w-3.5 h-3.5" />
                      프리뷰
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'code' && (
                  <FileExplorer rootPath={project?.path} />
                )}
                {activeTab === 'preview' && <EnhancedPreviewPanel projectPath={project?.path} />}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Drag overlay */}
      {isDragging && <div className="fixed inset-0 z-50 cursor-col-resize" />}
    </div>
  );
};

export default MaintenanceWorkspace;
