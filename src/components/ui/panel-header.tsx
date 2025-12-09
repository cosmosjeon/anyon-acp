import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'muted';
  children: React.ReactNode;
  pulse?: boolean;
}

/**
 * 상태 배지 컴포넌트
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ variant, children, pulse }) => {
  const variants = {
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    muted: 'bg-muted text-muted-foreground',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium',
      variants[variant]
    )}>
      {pulse && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full animate-pulse',
          variant === 'success' && 'bg-green-500',
          variant === 'warning' && 'bg-amber-500',
          variant === 'error' && 'bg-red-500',
          variant === 'info' && 'bg-blue-500',
          variant === 'muted' && 'bg-muted-foreground'
        )} />
      )}
      {children}
    </span>
  );
};

interface PanelHeaderProps {
  /** 패널 아이콘 */
  icon?: React.ReactNode;
  /** 패널 제목 */
  title: string;
  /** 부제목 또는 추가 정보 */
  subtitle?: string;
  /** 상태 배지 */
  badge?: React.ReactNode;
  /** 오른쪽 액션 버튼들 */
  actions?: React.ReactNode;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 통일된 패널 헤더 컴포넌트
 * 
 * 레이아웃:
 * ┌─────────────────────────────────────────────────┐
 * │ [아이콘] 제목 (부제목)  [배지]      [액션버튼] │
 * └─────────────────────────────────────────────────┘
 */
export const PanelHeader: React.FC<PanelHeaderProps> = ({
  icon,
  title,
  subtitle,
  badge,
  actions,
  className,
}) => {
  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30',
      className
    )}>
      {/* 왼쪽: 아이콘 + 제목 + 배지 */}
      <div className="flex items-center gap-2 min-w-0">
        {icon && (
          <span className="flex-shrink-0 text-muted-foreground">
            {icon}
          </span>
        )}
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-medium text-sm truncate">{title}</h3>
          {subtitle && (
            <span className="text-xs text-muted-foreground truncate">
              {subtitle}
            </span>
          )}
        </div>
        {badge && (
          <div className="flex-shrink-0">
            {badge}
          </div>
        )}
      </div>

      {/* 오른쪽: 액션 버튼들 */}
      {actions && (
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PanelHeader;
