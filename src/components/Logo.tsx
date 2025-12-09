import React from 'react';
import { cn } from '@/lib/utils';
import logoAnyon from '@/assets/logo-anyon.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  alt?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-16 h-16',
};

/**
 * Logo - Anyon logo component with dark mode support
 *
 * Uses CSS class 'logo-invert' which inverts colors in dark mode.
 * Add the CSS rule in styles.css for theme-based inversion.
 */
export const Logo: React.FC<LogoProps> = ({
  className,
  size = 'md',
  alt = 'ANYON'
}) => {
  return (
    <img
      src={logoAnyon}
      alt={alt}
      className={cn(sizeClasses[size], 'object-contain logo-invert', className)}
    />
  );
};

export default Logo;
