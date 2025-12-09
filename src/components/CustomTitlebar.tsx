import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Copy, Maximize2 } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { platform } from '@/lib/utils';

interface CustomTitlebarProps {
  className?: string;
}

export const CustomTitlebar: React.FC<CustomTitlebarProps> = ({ className }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if window is maximized/fullscreen on mount and listen for changes
  useEffect(() => {
    const checkWindowState = async () => {
      try {
        const window = getCurrentWindow();
        const maximized = await window.isMaximized();
        const fullscreen = await window.isFullscreen();
        setIsMaximized(maximized);
        setIsFullscreen(fullscreen);
      } catch (error) {
        // Ignore errors in non-Tauri environment
      }
    };

    checkWindowState();

    // Listen for resize events to update state
    const handleResize = () => {
      checkWindowState();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMinimize = async () => {
    try {
      const window = getCurrentWindow();
      await window.minimize();
    } catch (error) {
      console.error('Failed to minimize window:', error);
    }
  };

  const handleMaximize = async () => {
    try {
      const window = getCurrentWindow();
      const maximized = await window.isMaximized();
      if (maximized) {
        await window.unmaximize();
        setIsMaximized(false);
      } else {
        await window.maximize();
        setIsMaximized(true);
      }
    } catch (error) {
      console.error('Failed to maximize/unmaximize window:', error);
    }
  };

  // macOS uses native fullscreen (green button behavior)
  const handleMacOSGreenButton = async () => {
    try {
      const window = getCurrentWindow();
      const fullscreen = await window.isFullscreen();
      await window.setFullscreen(!fullscreen);
      setIsFullscreen(!fullscreen);
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error);
    }
  };

  const handleClose = async () => {
    try {
      const window = getCurrentWindow();
      await window.close();
    } catch (error) {
      console.error('Failed to close window:', error);
    }
  };

  // Render macOS-style traffic lights
  const renderMacOSControls = () => (
    <div className="flex items-center space-x-2 pl-4 tauri-no-drag">
      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="group relative w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200 flex items-center justify-center"
        title="Close"
      >
        {isHovered && (
          <X size={8} className="text-red-900 opacity-60 group-hover:opacity-100" />
        )}
      </button>

      {/* Minimize button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleMinimize();
        }}
        className="group relative w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-all duration-200 flex items-center justify-center"
        title="Minimize"
      >
        {isHovered && (
          <Minus size={8} className="text-yellow-900 opacity-60 group-hover:opacity-100" />
        )}
      </button>

      {/* Fullscreen button (macOS green button) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleMacOSGreenButton();
        }}
        className="group relative w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-all duration-200 flex items-center justify-center"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isHovered && (
          <Maximize2 size={6} className="text-green-900 opacity-60 group-hover:opacity-100" />
        )}
      </button>
    </div>
  );

  // Render Windows-style controls (right-aligned, rectangular buttons)
  const renderWindowsControls = () => (
    <div className="flex items-center h-full tauri-no-drag ml-auto">
      {/* Minimize button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleMinimize();
        }}
        className="h-full px-4 hover:bg-muted/80 transition-colors duration-150 flex items-center justify-center"
        title="Minimize"
      >
        <Minus size={16} className="text-foreground/70" />
      </button>

      {/* Maximize/Restore button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleMaximize();
        }}
        className="h-full px-4 hover:bg-muted/80 transition-colors duration-150 flex items-center justify-center"
        title={isMaximized ? "Restore" : "Maximize"}
      >
        {isMaximized ? (
          <Copy size={14} className="text-foreground/70" />
        ) : (
          <Square size={14} className="text-foreground/70" />
        )}
      </button>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="h-full px-4 hover:bg-red-500 hover:text-white transition-colors duration-150 flex items-center justify-center group"
        title="Close"
      >
        <X size={16} className="text-foreground/70 group-hover:text-white" />
      </button>
    </div>
  );

  // Render Linux-style controls (similar to Windows, but can be left or right aligned)
  const renderLinuxControls = () => (
    <div className="flex items-center h-full tauri-no-drag ml-auto">
      {/* Minimize button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleMinimize();
        }}
        className="h-full px-3 hover:bg-muted/80 transition-colors duration-150 flex items-center justify-center"
        title="Minimize"
      >
        <Minus size={16} className="text-foreground/70" />
      </button>

      {/* Maximize/Restore button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleMaximize();
        }}
        className="h-full px-3 hover:bg-muted/80 transition-colors duration-150 flex items-center justify-center"
        title={isMaximized ? "Restore" : "Maximize"}
      >
        {isMaximized ? (
          <Copy size={14} className="text-foreground/70" />
        ) : (
          <Square size={14} className="text-foreground/70" />
        )}
      </button>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="h-full px-3 hover:bg-red-500 hover:text-white transition-colors duration-150 flex items-center justify-center group"
        title="Close"
      >
        <X size={16} className="text-foreground/70 group-hover:text-white" />
      </button>
    </div>
  );

  const platformName = platform.getName();

  // Don't render titlebar in fullscreen mode on macOS
  if (platformName === 'mac' && isFullscreen) {
    return null;
  }

  return (
    <div
      className={`relative z-[200] h-9 bg-background/95 backdrop-blur-sm flex items-center select-none border-b border-border/50 tauri-drag ${className || ''}`}
      data-tauri-drag-region
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {platformName === 'mac' && renderMacOSControls()}
      
      {/* Center - Drag area (entire remaining space) */}
      <div className="flex-1 h-full" data-tauri-drag-region />
      
      {platformName === 'windows' && renderWindowsControls()}
      {platformName === 'linux' && renderLinuxControls()}
      {platformName === 'unknown' && renderWindowsControls()}
    </div>
  );
};

export default CustomTitlebar;
