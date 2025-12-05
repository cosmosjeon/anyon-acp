import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lightbulb, Wrench, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SelectionCard } from '@/components/ui/selection-card';
import { useProjects, useProjectsNavigation } from '@/components/ProjectRoutes';
import type { Project } from '@/lib/api';

interface WorkspaceSelectorProps {
  projectId: string;
}

/**
 * WorkspaceSelector - Choose between MVP development and Maintenance
 *
 * Displays two large cards for selecting the workspace type:
 * - MVP Development: For building new features with AI-assisted planning
 * - Maintenance: For fixing bugs and maintaining existing code
 */
export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({ projectId }) => {
  const { goToProjectList, goToMvp, goToMaintenance } = useProjectsNavigation();
  const { projects, loading, getProjectById } = useProjects();
  const [project, setProject] = useState<Project | undefined>(undefined);

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const found = getProjectById(projectId);
      setProject(found);
    }
  }, [projectId, projects, getProjectById]);

  const handleBack = () => {
    goToProjectList();
  };

  const handleSelectMvp = () => {
    if (projectId) {
      goToMvp(projectId);
    }
  };

  const handleSelectMaintenance = () => {
    if (projectId) {
      goToMaintenance(projectId);
    }
  };

  // Get project name from path
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
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{projectName}</h1>
              <p className="text-sm text-muted-foreground">
                {project?.path}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Selection prompt */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, delay: 0.05 }}
          className="text-center mb-8"
        >
          <h2 className="text-xl font-medium text-muted-foreground">
            What would you like to do?
          </h2>
        </motion.div>

        {/* Selection cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: 0.1 }}
          >
            <SelectionCard
              icon={Lightbulb}
              title="MVP Development"
              description="Build new features with AI-assisted planning and documentation"
              onClick={handleSelectMvp}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: 0.15 }}
          >
            <SelectionCard
              icon={Wrench}
              title="Maintenance"
              description="Fix bugs, refactor code, and maintain existing features"
              onClick={handleSelectMaintenance}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSelector;
