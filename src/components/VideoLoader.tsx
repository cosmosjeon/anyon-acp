import React from 'react';
import { cn } from '@/lib/utils';
import loadingVideo from '@/assets/loading.mp4';

interface VideoLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-32 h-32',
  lg: 'w-56 h-56',
  full: 'w-full h-full max-w-md max-h-md',
};

/**
 * VideoLoader - Loading spinner component using custom video
 *
 * Replaces the default Loader2 spinner with a custom loading animation video.
 * Uses radial gradient mask for smooth edge blending with any background.
 */
export const VideoLoader: React.FC<VideoLoaderProps> = ({
  className,
  size = 'md'
}) => {
  return (
    <div className={cn('flex items-center justify-center h-full', className)}>
      <div
        className={cn(sizeClasses[size], 'relative')}
        style={{
          maskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain"
        >
          <source src={loadingVideo} type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

export default VideoLoader;
