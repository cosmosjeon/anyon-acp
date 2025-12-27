import React, { useState, useCallback, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { invoke } from '@tauri-apps/api/core';
import { Save, FileCode, Loader2 } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 파일 확장자에 따른 언어 매핑
const getLanguageFromPath = (filePath: string): string => {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const languageMap: Record<string, string> = {
    // JavaScript/TypeScript
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    mjs: 'javascript',
    cjs: 'javascript',
    // Web
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'scss',
    less: 'less',
    // Data
    json: 'json',
    jsonc: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    toml: 'ini',
    // Config
    md: 'markdown',
    mdx: 'markdown',
    // Backend
    py: 'python',
    rs: 'rust',
    go: 'go',
    java: 'java',
    kt: 'kotlin',
    swift: 'swift',
    rb: 'ruby',
    php: 'php',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    cs: 'csharp',
    // Shell
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    fish: 'shell',
    ps1: 'powershell',
    // Database
    sql: 'sql',
    // Other
    graphql: 'graphql',
    gql: 'graphql',
    dockerfile: 'dockerfile',
    prisma: 'prisma',
  };

  // Special filename handling
  const filename = filePath.split(/[/\\]/).pop()?.toLowerCase() || '';
  if (filename === 'dockerfile') return 'dockerfile';
  if (filename === 'makefile') return 'makefile';
  if (filename === '.gitignore') return 'ignore';
  if (filename === '.env' || filename.startsWith('.env.')) return 'dotenv';

  return languageMap[ext] || 'plaintext';
};

interface CodeEditorProps {
  /** 파일 경로 (열려있는 파일) */
  filePath?: string;
  /** 초기 컨텐츠 (filePath가 없을 때 사용) */
  initialContent?: string;
  /** 언어 (자동 감지하지 않을 때) */
  language?: string;
  /** 읽기 전용 모드 */
  readOnly?: boolean;
  /** 높이 */
  height?: string;
  /** 저장 콜백 */
  onSave?: (content: string) => void;
  /** 내용 변경 콜백 */
  onChange?: (content: string) => void;
  /** 파일 선택 콜백 (FileExplorer와 연동용) */
  onFileSelect?: (filePath: string) => void;
  /** 프로젝트 루트 경로 (FileExplorer용) */
  projectPath?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  filePath,
  initialContent = '',
  language,
  readOnly = false,
  height = '100%',
  onSave,
  onChange,
}) => {
  const [content, setContent] = useState(initialContent);
  const [originalContent, setOriginalContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor | null>(null);

  // 파일 로드
  useEffect(() => {
    if (!filePath) {
      setContent(initialContent);
      setOriginalContent(initialContent);
      return;
    }

    const loadFile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fileContent = await invoke<string>('read_file_content', { filePath });
        setContent(fileContent);
        setOriginalContent(fileContent);
      } catch (err) {
        console.error('[CodeEditor] Failed to load file:', err);
        setError(err instanceof Error ? err.message : String(err));
        setContent('');
        setOriginalContent('');
      } finally {
        setIsLoading(false);
      }
    };

    loadFile();
  }, [filePath, initialContent]);

  // 에디터 마운트 핸들러
  const handleEditorMount: OnMount = useCallback((editor) => {
    setEditorRef(editor);

    // Ctrl/Cmd + S 저장 단축키
    editor.addCommand(
      // Monaco KeyMod.CtrlCmd + KeyCode.KeyS
      2048 + 49, // CtrlCmd + S
      () => handleSave()
    );
  }, []);

  // 내용 변경 핸들러
  const handleChange = useCallback((value: string | undefined) => {
    const newValue = value || '';
    setContent(newValue);
    onChange?.(newValue);
  }, [onChange]);

  // 저장 핸들러
  const handleSave = useCallback(async () => {
    if (!filePath || readOnly) return;

    setIsSaving(true);
    try {
      await invoke('write_file_content', { filePath, content });
      setOriginalContent(content);
      onSave?.(content);
    } catch (err) {
      console.error('[CodeEditor] Failed to save file:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  }, [filePath, content, readOnly, onSave]);

  const hasChanges = content !== originalContent;
  const detectedLanguage = language || (filePath ? getLanguageFromPath(filePath) : 'plaintext');
  const fileName = filePath?.split(/[/\\]/).pop() || 'Untitled';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <FileCode className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <p className="font-medium text-destructive">파일을 열 수 없습니다</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      {filePath && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 min-w-0">
            <FileCode className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
            <span className={cn(
              "text-sm truncate",
              hasChanges && "text-amber-600 dark:text-amber-400"
            )}>
              {fileName}
              {hasChanges && ' •'}
            </span>
            <span className="text-xs text-muted-foreground">
              {detectedLanguage}
            </span>
          </div>

          {!readOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="h-7 px-2"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span className="ml-1.5">저장</span>
            </Button>
          )}
        </div>
      )}

      {/* 에디터 */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height={height}
          language={detectedLanguage}
          value={content}
          onChange={handleChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          loading={
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          }
          options={{
            readOnly,
            minimap: { enabled: true, scale: 1 },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Monaco, 'Courier New', monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            lineNumbersMinChars: 4,
            folding: true,
            foldingHighlight: true,
            foldingStrategy: 'auto',
            showFoldingControls: 'mouseover',
            bracketPairColorization: { enabled: true },
            matchBrackets: 'always',
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            wrappingIndent: 'indent',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderWhitespace: 'selection',
            renderLineHighlight: 'line',
            guides: {
              indentation: true,
              bracketPairs: true,
            },
            suggest: {
              showMethods: true,
              showFunctions: true,
              showConstructors: true,
              showFields: true,
              showVariables: true,
              showClasses: true,
              showStructs: true,
              showInterfaces: true,
              showModules: true,
              showProperties: true,
              showEvents: true,
              showOperators: true,
              showUnits: true,
              showValues: true,
              showConstants: true,
              showEnums: true,
              showEnumMembers: true,
              showKeywords: true,
              showWords: true,
              showColors: true,
              showFiles: true,
              showReferences: true,
              showFolders: true,
              showTypeParameters: true,
              showSnippets: true,
            },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: true,
            },
            parameterHints: { enabled: true },
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
