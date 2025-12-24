import React, { useState, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  FileCode,
  PanelRightClose,
  PanelRightOpen,
  Loader2,
  Code,
} from '@/lib/icons';
import { Button } from '@/components/ui/button';

// Lazy load heavy components
const FileTree = lazy(() => import('@/components/FileTree'));
const CodeEditor = lazy(() => import('@/components/CodeEditor'));

interface CodePanelProps {
  /** 프로젝트 루트 경로 */
  projectPath?: string;
  /** 초기 열릴 파일 경로 */
  initialFilePath?: string;
}

/**
 * CodePanel - 파일 탐색기와 코드 에디터 통합 패널
 *
 * Layout:
 * ┌──────────┬──────────────────────────┐
 * │ FileTree │      Code Editor         │
 * │  (250px) │      (flexible)          │
 * └──────────┴──────────────────────────┘
 */
export const CodePanel: React.FC<CodePanelProps> = ({
  projectPath,
  initialFilePath,
}) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(initialFilePath || null);
  const [fileTreeOpen, setFileTreeOpen] = useState(true);
  const fileTreeWidth = 250;

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((filePath: string) => {
    setSelectedFilePath(filePath);
  }, []);

  // 저장 완료 핸들러
  const handleSave = useCallback((content: string) => {
    console.log('[CodePanel] File saved:', selectedFilePath, 'Length:', content.length);
  }, [selectedFilePath]);

  if (!projectPath) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <Code className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-base font-medium mb-2">프로젝트를 선택하세요</h3>
          <p className="text-sm text-muted-foreground">
            프로젝트를 열면 코드를 편집할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden bg-background">
      {/* File Tree Toggle Button (when collapsed) */}
      {!fileTreeOpen && (
        <div className="flex-shrink-0 border-r border-border p-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFileTreeOpen(true)}
            className="h-8 w-8"
            title="파일 탐색기 열기"
          >
            <PanelRightOpen className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* File Tree Panel */}
      <AnimatePresence>
        {fileTreeOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: fileTreeWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full border-r border-border bg-card/50 flex flex-col overflow-hidden flex-shrink-0"
          >
            {/* File Tree Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">파일</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFileTreeOpen(false)}
                className="h-6 w-6"
                title="파일 탐색기 닫기"
              >
                <PanelRightClose className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* File Tree Content */}
            <div className="flex-1 overflow-auto">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                }
              >
                <FileTree
                  rootPath={projectPath}
                  onFileSelect={handleFileSelect}
                />
              </Suspense>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Code Editor Area */}
      <div className="flex-1 h-full overflow-hidden flex flex-col">
        {selectedFilePath ? (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <CodeEditor
              filePath={selectedFilePath}
              onSave={handleSave}
              height="100%"
            />
          </Suspense>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
              <FileCode className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-base font-medium mb-1.5">파일을 선택하세요</h3>
              <p className="text-sm text-muted-foreground">
                {fileTreeOpen
                  ? '왼쪽 파일 탐색기에서 파일을 클릭하여 편집을 시작하세요.'
                  : '파일 탐색기를 열어 파일을 선택하세요.'
                }
              </p>
            </div>
            {!fileTreeOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFileTreeOpen(true)}
                className="gap-2"
              >
                <Folder className="w-4 h-4" />
                파일 탐색기 열기
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePanel;
