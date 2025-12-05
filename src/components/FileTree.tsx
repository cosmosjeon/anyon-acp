import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api, type FileEntry } from '@/lib/api';

interface FileTreeProps {
  /**
   * Root path for the file tree
   */
  rootPath: string;
  /**
   * Callback when a file is selected
   */
  onFileSelect?: (filePath: string) => void;
  /**
   * Currently selected file path
   */
  selectedFile?: string;
  /**
   * Optional className
   */
  className?: string;
}

interface TreeNode {
  entry: FileEntry;
  depth: number;
  isExpanded: boolean;
  isLoading: boolean;
  children?: TreeNode[];
}

interface FlatNode {
  entry: FileEntry;
  depth: number;
  isExpanded: boolean;
  isLoading: boolean;
  hasChildren: boolean;
}

const NODE_HEIGHT = 28;
const INDENT_SIZE = 16;

/**
 * Get file icon based on extension
 */
const getFileIcon = (extension?: string) => {
  const iconMap: Record<string, string> = {
    ts: 'text-blue-400',
    tsx: 'text-blue-400',
    js: 'text-yellow-400',
    jsx: 'text-yellow-400',
    json: 'text-yellow-600',
    md: 'text-gray-400',
    css: 'text-purple-400',
    scss: 'text-pink-400',
    html: 'text-orange-400',
    py: 'text-green-400',
    rs: 'text-orange-500',
    go: 'text-cyan-400',
  };
  return iconMap[extension?.toLowerCase() || ''] || 'text-muted-foreground';
};

/**
 * FileTree - VSCode-style file tree with virtualization
 */
export const FileTree: React.FC<FileTreeProps> = ({
  rootPath,
  onFileSelect,
  selectedFile,
  className,
}) => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [loadingPaths, setLoadingPaths] = useState<Set<string>>(new Set());

  const parentRef = useRef<HTMLDivElement>(null);

  // Load root directory
  useEffect(() => {
    const loadRoot = async () => {
      if (!rootPath) {
        setTreeData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const entries = await api.listDirectoryContents(rootPath);
        const nodes: TreeNode[] = entries.map((entry) => ({
          entry,
          depth: 0,
          isExpanded: false,
          isLoading: false,
          children: entry.is_directory ? undefined : undefined,
        }));
        setTreeData(nodes);
        // Auto-expand first level
        const firstLevelDirs = entries.filter((e) => e.is_directory).map((e) => e.path);
        setExpandedPaths(new Set(firstLevelDirs));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load directory');
      } finally {
        setIsLoading(false);
      }
    };

    loadRoot();
  }, [rootPath]);

  // Load children when a folder is expanded
  const loadChildren = useCallback(async (path: string) => {
    setLoadingPaths((prev) => new Set(prev).add(path));

    try {
      const entries = await api.listDirectoryContents(path);
      return entries;
    } catch (err) {
      console.error('Failed to load children:', err);
      return [];
    } finally {
      setLoadingPaths((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    }
  }, []);

  // Toggle folder expansion
  const toggleFolder = useCallback(
    async (path: string) => {
      const isExpanded = expandedPaths.has(path);

      if (isExpanded) {
        // Collapse
        setExpandedPaths((prev) => {
          const next = new Set(prev);
          next.delete(path);
          return next;
        });
      } else {
        // Expand - load children if needed
        setExpandedPaths((prev) => new Set(prev).add(path));
        await loadChildren(path);
      }
    },
    [expandedPaths, loadChildren]
  );


  // Load children for expanded folders
  useEffect(() => {
    const loadExpandedFolders = async () => {
      const updateTreeWithChildren = async (nodes: TreeNode[]): Promise<TreeNode[]> => {
        const updated: TreeNode[] = [];

        for (const node of nodes) {
          if (node.entry.is_directory && expandedPaths.has(node.entry.path)) {
            if (!node.children) {
              const entries = await api.listDirectoryContents(node.entry.path);
              const children: TreeNode[] = entries.map((entry) => ({
                entry,
                depth: node.depth + 1,
                isExpanded: false,
                isLoading: false,
              }));
              updated.push({ ...node, children: await updateTreeWithChildren(children) });
            } else {
              updated.push({ ...node, children: await updateTreeWithChildren(node.children) });
            }
          } else {
            updated.push(node);
          }
        }

        return updated;
      };

      const updatedTree = await updateTreeWithChildren(treeData);
      setTreeData(updatedTree);
    };

    loadExpandedFolders();
  }, [expandedPaths]);

  // Rebuild flat list when tree changes
  const finalFlatList = useMemo(() => {
    const result: FlatNode[] = [];

    const traverse = (nodes: TreeNode[], depth: number) => {
      for (const node of nodes) {
        const isExpanded = expandedPaths.has(node.entry.path);
        const isLoading = loadingPaths.has(node.entry.path);

        result.push({
          entry: node.entry,
          depth,
          isExpanded,
          isLoading,
          hasChildren: node.entry.is_directory,
        });

        if (isExpanded && node.children) {
          traverse(node.children, depth + 1);
        }
      }
    };

    traverse(treeData, 0);
    return result;
  }, [treeData, expandedPaths, loadingPaths]);

  const virtualizer = useVirtualizer({
    count: finalFlatList.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => NODE_HEIGHT,
    overscan: 10,
  });

  const handleClick = useCallback(
    (node: FlatNode) => {
      if (node.hasChildren) {
        toggleFolder(node.entry.path);
      } else {
        onFileSelect?.(node.entry.path);
      }
    },
    [toggleFolder, onFileSelect]
  );

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center h-full p-4', className)}>
        <p className="text-sm text-destructive text-center">{error}</p>
      </div>
    );
  }

  if (finalFlatList.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-full p-4', className)}>
        <p className="text-sm text-muted-foreground text-center">No files found</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn('h-full overflow-auto', className)}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const node = finalFlatList[virtualRow.index];
          const isSelected = selectedFile === node.entry.path;

          return (
            <div
              key={node.entry.path}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <button
                onClick={() => handleClick(node)}
                className={cn(
                  'w-full h-full flex items-center gap-1 px-2 text-left text-sm transition-colors',
                  'hover:bg-accent/50',
                  isSelected && 'bg-accent text-accent-foreground'
                )}
                style={{ paddingLeft: `${8 + node.depth * INDENT_SIZE}px` }}
              >
                {/* Expand/Collapse Icon */}
                {node.hasChildren ? (
                  node.isLoading ? (
                    <Loader2 className="w-4 h-4 shrink-0 animate-spin text-muted-foreground" />
                  ) : node.isExpanded ? (
                    <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                  )
                ) : (
                  <span className="w-4 h-4 shrink-0" />
                )}

                {/* File/Folder Icon */}
                {node.hasChildren ? (
                  node.isExpanded ? (
                    <FolderOpen className="w-4 h-4 shrink-0 text-yellow-500" />
                  ) : (
                    <Folder className="w-4 h-4 shrink-0 text-yellow-500" />
                  )
                ) : (
                  <File className={cn('w-4 h-4 shrink-0', getFileIcon(node.entry.extension))} />
                )}

                {/* Name */}
                <span className="truncate">{node.entry.name}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileTree;
