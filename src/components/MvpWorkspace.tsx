import React, { useEffect, useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lightbulb, Loader2, FileText, Code, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SplitPane } from '@/components/ui/split-pane';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjects, useProjectsNavigation } from '@/components/ProjectRoutes';
import type { Project } from '@/lib/api';

// Lazy load ClaudeCodeSession for better performance
const ClaudeCodeSession = lazy(() =>
  import('@/components/ClaudeCodeSession').then(m => ({ default: m.ClaudeCodeSession }))
);

type MvpTabType = 'planning' | 'development' | 'preview';
type PlanningDocType = 'prd' | 'ux-design' | 'design-guide' | 'trd' | 'architecture' | 'erd';

const PLANNING_DOCS: { id: PlanningDocType; label: string }[] = [
  { id: 'prd', label: 'PRD' },
  { id: 'ux-design', label: 'UX Design' },
  { id: 'design-guide', label: 'Design Guide' },
  { id: 'trd', label: 'TRD' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'erd', label: 'ERD' },
];

interface MvpWorkspaceProps {
  projectId: string;
}

/**
 * MvpWorkspace - MVP Development workspace
 *
 * Currently: Displays ClaudeCodeSession with MVP header
 * Future: Will include planning documents, development docs, etc.
 */
export const MvpWorkspace: React.FC<MvpWorkspaceProps> = ({ projectId }) => {
  const { goToProject, goToProjectList } = useProjectsNavigation();
  const { projects, loading, getProjectById } = useProjects();
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<MvpTabType>('planning');
  const [activePlanningDoc, setActivePlanningDoc] = useState<PlanningDocType>('prd');

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const found = getProjectById(projectId);
      setProject(found);
    }
  }, [projectId, projects, getProjectById]);

  const handleBack = () => {
    if (projectId) {
      goToProject(projectId);
    } else {
      goToProjectList();
    }
  };

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

  return (
    <div className="h-full flex flex-col">
      {/* Workspace Header */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">{projectName}</h1>
              <p className="text-xs text-muted-foreground">MVP Development</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content - SplitPane with Chat and Tabs */}
      <div className="flex-1 overflow-hidden">
        <SplitPane
          initialSplit={50}
          minLeftWidth={350}
          minRightWidth={400}
          left={
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              }
            >
              <ClaudeCodeSession
                initialProjectPath={project?.path}
                onBack={handleBack}
                onProjectPathChange={() => {}}
                embedded={true}
              />
            </Suspense>
          }
          right={
            <div className="h-full flex flex-col bg-background">
              {/* Tab Header */}
              <div className="flex-shrink-0 border-b px-4 py-2">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MvpTabType)}>
                  <TabsList className="bg-muted/50">
                    <TabsTrigger value="planning" className="gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      기획문서
                    </TabsTrigger>
                    <TabsTrigger value="development" className="gap-1.5">
                      <Code className="w-3.5 h-3.5" />
                      개발문서
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      프리뷰
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'planning' && (
                  <div className="h-full flex">
                    {/* Vertical Sub-tabs (Sidebar) */}
                    <div className="w-36 flex-shrink-0 border-r bg-muted/30 py-2">
                      {PLANNING_DOCS.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => setActivePlanningDoc(doc.id)}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            activePlanningDoc === doc.id
                              ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          }`}
                        >
                          {doc.label}
                        </button>
                      ))}
                    </div>

                    {/* Document Content Area */}
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-medium">
                          {PLANNING_DOCS.find(d => d.id === activePlanningDoc)?.label}
                        </p>
                        <p className="text-xs mt-1 opacity-70">문서 내용이 여기에 표시됩니다</p>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'development' && (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">개발문서 패널</p>
                      <p className="text-xs mt-1 opacity-70">코드 에디터가 여기에 추가됩니다</p>
                    </div>
                  </div>
                )}
                {activeTab === 'preview' && (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">프리뷰 패널</p>
                      <p className="text-xs mt-1 opacity-70">웹뷰 프리뷰가 여기에 추가됩니다</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default MvpWorkspace;
