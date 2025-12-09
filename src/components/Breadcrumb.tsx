import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb - Navigation breadcrumb component
 *
 * Usage:
 * <Breadcrumb
 *   items={[
 *     { label: 'Projects', onClick: () => goToProjectList(), icon: <Home /> },
 *     { label: 'my-project', onClick: () => goToProject(id) },
 *     { label: 'MVP' }
 *   ]}
 * />
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav className={cn('flex items-center gap-1 text-sm', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isClickable = !!item.onClick;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
            )}
            <button
              onClick={item.onClick}
              disabled={!isClickable}
              className={cn(
                'flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-colors max-w-[200px]',
                isClickable
                  ? 'hover:bg-muted/50 text-muted-foreground hover:text-foreground cursor-pointer'
                  : 'text-foreground cursor-default',
                isLast && 'font-medium'
              )}
            >
              {item.icon && (
                <span className="flex-shrink-0">{item.icon}</span>
              )}
              <span className="truncate">{item.label}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
