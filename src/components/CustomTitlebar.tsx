import React, { useState } from 'react';
import { Minus, Square, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface CustomTitlebarProps {
  className?: string;
}

export const CustomTitlebar: React.FC<CustomTitlebarProps> = ({ className }) => {
  const [isHovered, setIsHovered] = useState(false);

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
      const isMaximized = await window.isMaximized();
      if (isMaximized) {
        await window.unmaximize();
      } else {
        await window.maximize();
      }
    } catch (error) {
      console.error('Failed to maximize/unmaximize window:', error);
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

  return (
    <div
      className={`relative z-[200] h-9 bg-background/95 backdrop-blur-sm flex items-center select-none border-b border-border/50 tauri-drag ${className || ''}`}
      data-tauri-drag-region
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left side - macOS Traffic Light buttons */}
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

        {/* Maximize button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleMaximize();
          }}
          className="group relative w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-all duration-200 flex items-center justify-center"
          title="Maximize"
        >
          {isHovered && (
            <Square size={6} className="text-green-900 opacity-60 group-hover:opacity-100" />
          )}
        </button>
      </div>

      {/* Center - Drag area (entire remaining space) */}
      <div className="flex-1 h-full" data-tauri-drag-region />
    </div>
  );
};

export default CustomTitlebar;
