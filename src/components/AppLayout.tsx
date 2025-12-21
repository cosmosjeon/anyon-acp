import React, { Suspense } from 'react';
import { Loader2 } from "@/lib/icons";
import { cn } from '@/lib/utils';
import { ProjectRoutes } from '@/components/ProjectRoutes';
import { useTabContext } from '@/contexts/TabContext';

interface AppLayoutProps {
  className?: string;
}

/**
 * AppLayout - Main application layout
 *
 * Uses ProjectRoutes for navigation:
 * - ProjectListView: Grid of projects
 * - WorkspaceSelector: MVP vs Maintenance selection
 * - MvpWorkspace: MVP development with chat + planning/dev/preview tabs
 * - MaintenanceWorkspace: Maintenance with chat + code/preview tabs
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ className }) => {
  const { activeTabId } = useTabContext();

  return (
    <div className={cn('h-full w-full overflow-hidden bg-background', className)}>
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
        <ProjectRoutes tabId={activeTabId || 'default'} />
      </Suspense>
    </div>
  );
};

export default AppLayout;
