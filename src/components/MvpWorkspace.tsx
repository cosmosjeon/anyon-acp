import React, { useEffect, useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjects, useProjectsNavigation } from '@/components/ProjectRoutes';
import type { Project } from '@/lib/api';

// Lazy load ClaudeCodeSession for better performance
const ClaudeCodeSession = lazy(() =>
  import('@/components/ClaudeCodeSession').then(m => ({ default: m.ClaudeCodeSession }))
);

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

      {/* Main Content - ClaudeCodeSession */}
      <div className="flex-1 overflow-hidden">
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
          />
        </Suspense>
      </div>
    </div>
  );
};

export default MvpWorkspace;
