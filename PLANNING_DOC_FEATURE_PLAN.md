# 기획문서 탭 기능 구현 계획

## 📌 개요

MVP Workspace의 **기획문서 탭**에 anyon-mvp의 기획탭과 동일한 워크플로우 자동 실행 기능을 구현합니다.

---

## 🎯 목표

1. 6개 문서(PRD → UX → UI → TRD → Architecture → ERD) 순차 작성 워크플로우
2. 각 단계별 워크플로우 슬래시 커맨드 자동 입력
3. 문서 완료 감지 및 다음 단계 활성화
4. 프로젝트 폴더 내 `anyon-docs/` 경로에 문서 저장/조회

---

## 📁 파일 구조

```
src/
├── components/
│   ├── MvpWorkspace.tsx                    # 수정: 기획문서 탭 컴포넌트 분리
│   └── planning/                           # 신규 폴더
│       ├── PlanningDocsPanel.tsx          # 신규: 기획문서 패널 메인 컴포넌트
│       ├── PlanningDocViewer.tsx          # 신규: 마크다운 문서 뷰어
│       ├── WorkflowProgress.tsx           # 신규: 진행 상태 표시 (Step Dots)
│       └── WorkflowStartButton.tsx        # 신규: 워크플로우 시작 버튼
├── constants/
│   └── planning.ts                         # 신규: 워크플로우 시퀀스 상수
├── hooks/
│   └── usePlanningDocs.ts                 # 신규: 문서 상태 감지 훅
└── lib/
    └── api.ts                              # 수정: 파일 읽기/존재 확인 API 추가
```

---

## 🔧 구현 상세

### Phase 1: 상수 및 타입 정의

**파일: `src/constants/planning.ts`**

```typescript
export interface WorkflowStep {
  id: string;
  title: string;
  filename: string;
  workflow: string;
  nextId: string | null;
}

export const WORKFLOW_SEQUENCE: WorkflowStep[] = [
  {
    id: 'prd',
    title: 'PRD',
    filename: 'prd.md',
    workflow: '/anyon:anyon-method:workflows:startup-prd',
    nextId: 'ux-design',
  },
  {
    id: 'ux-design',
    title: 'UX Design',
    filename: 'ux-design.md',
    workflow: '/anyon:anyon-method:workflows:startup-ux',
    nextId: 'design-guide',
  },
  {
    id: 'design-guide',
    title: 'Design Guide',
    filename: 'ui-design-guide.md',
    workflow: '/anyon:anyon-method:workflows:startup-ui',
    nextId: 'trd',
  },
  {
    id: 'trd',
    title: 'TRD',
    filename: 'trd.md',
    workflow: '/anyon:anyon-method:workflows:startup-trd',
    nextId: 'architecture',
  },
  {
    id: 'architecture',
    title: 'Architecture',
    filename: 'architecture.md',
    workflow: '/anyon:anyon-method:workflows:startup-architecture',
    nextId: 'erd',
  },
  {
    id: 'erd',
    title: 'ERD',
    filename: 'erd.md',
    workflow: '/anyon:anyon-method:workflows:startup-erd',
    nextId: null,
  },
];

export const ANYON_DOCS_DIR = 'anyon-docs';
```

---

### Phase 2: Tauri 백엔드 API 추가

**파일: `src-tauri/src/lib.rs` (또는 commands.rs)**

```rust
// 파일 존재 확인
#[tauri::command]
async fn check_file_exists(path: String) -> Result<bool, String> {
    Ok(std::path::Path::new(&path).exists())
}

// 파일 읽기
#[tauri::command]
async fn read_file_content(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path)
        .map_err(|e| e.to_string())
}

// 디렉토리 내 파일 목록
#[tauri::command]
async fn list_files_in_dir(dir_path: String) -> Result<Vec<String>, String> {
    let path = std::path::Path::new(&dir_path);
    if !path.exists() {
        return Ok(vec![]);
    }

    let entries = std::fs::read_dir(path)
        .map_err(|e| e.to_string())?
        .filter_map(|entry| {
            entry.ok().and_then(|e| {
                e.file_name().to_str().map(|s| s.to_string())
            })
        })
        .collect();

    Ok(entries)
}
```

**파일: `src/lib/api.ts` 추가**

```typescript
export const planningApi = {
  // 파일 존재 확인
  checkFileExists: async (filePath: string): Promise<boolean> => {
    return apiCall('check_file_exists', { path: filePath });
  },

  // 파일 내용 읽기
  readFileContent: async (filePath: string): Promise<string> => {
    return apiCall('read_file_content', { path: filePath });
  },

  // 디렉토리 내 파일 목록
  listFilesInDir: async (dirPath: string): Promise<string[]> => {
    return apiCall('list_files_in_dir', { dirPath });
  },
};
```

---

### Phase 3: 문서 상태 감지 훅

**파일: `src/hooks/usePlanningDocs.ts`**

```typescript
import { useState, useEffect, useCallback, useMemo } from 'react';
import { planningApi } from '@/lib/api';
import { WORKFLOW_SEQUENCE, ANYON_DOCS_DIR, type WorkflowStep } from '@/constants/planning';

interface PlanningDoc {
  id: string;
  title: string;
  filename: string;
  exists: boolean;
  content?: string;
}

interface UsePlanningDocsReturn {
  documents: PlanningDoc[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  progress: {
    completed: number;
    total: number;
    completedSteps: WorkflowStep[];
    nextStep: WorkflowStep | undefined;
    isAllComplete: boolean;
  };
}

export function usePlanningDocs(projectPath: string): UsePlanningDocsReturn {
  const [documents, setDocuments] = useState<PlanningDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const docsDir = `${projectPath}/${ANYON_DOCS_DIR}`;

  const checkDocuments = useCallback(async () => {
    if (!projectPath) return;

    setIsLoading(true);
    setError(null);

    try {
      const docs: PlanningDoc[] = await Promise.all(
        WORKFLOW_SEQUENCE.map(async (step) => {
          const filePath = `${docsDir}/${step.filename}`;
          const exists = await planningApi.checkFileExists(filePath);
          let content: string | undefined;

          if (exists) {
            try {
              content = await planningApi.readFileContent(filePath);
            } catch (e) {
              console.warn(`Failed to read ${step.filename}:`, e);
            }
          }

          return {
            id: step.id,
            title: step.title,
            filename: step.filename,
            exists,
            content,
          };
        })
      );

      setDocuments(docs);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [projectPath, docsDir]);

  // 초기 로드 및 폴링 (3초 간격)
  useEffect(() => {
    checkDocuments();
    const interval = setInterval(checkDocuments, 3000);
    return () => clearInterval(interval);
  }, [checkDocuments]);

  // 진행 상태 계산
  const progress = useMemo(() => {
    const completedSteps = WORKFLOW_SEQUENCE.filter(step =>
      documents.some(doc => doc.id === step.id && doc.exists)
    );

    const nextStep = WORKFLOW_SEQUENCE.find(step =>
      !documents.some(doc => doc.id === step.id && doc.exists)
    );

    return {
      completed: completedSteps.length,
      total: WORKFLOW_SEQUENCE.length,
      completedSteps,
      nextStep,
      isAllComplete: completedSteps.length === WORKFLOW_SEQUENCE.length,
    };
  }, [documents]);

  return {
    documents,
    isLoading,
    error,
    refresh: checkDocuments,
    progress,
  };
}
```

---

### Phase 4: 기획문서 패널 컴포넌트

**파일: `src/components/planning/PlanningDocsPanel.tsx`**

```typescript
import React, { useState, useCallback } from 'react';
import { CheckCircle2, Circle, ArrowRight, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePlanningDocs } from '@/hooks/usePlanningDocs';
import { WORKFLOW_SEQUENCE, type WorkflowStep } from '@/constants/planning';
import { PlanningDocViewer } from './PlanningDocViewer';

interface PlanningDocsPanelProps {
  projectPath: string;
  onSendPrompt: (prompt: string) => void;
  isLoading?: boolean;
}

export const PlanningDocsPanel: React.FC<PlanningDocsPanelProps> = ({
  projectPath,
  onSendPrompt,
  isLoading: isSessionLoading = false,
}) => {
  const { documents, isLoading, progress } = usePlanningDocs(projectPath);
  const [activeDocId, setActiveDocId] = useState<string>('prd');

  const activeDoc = documents.find(d => d.id === activeDocId);

  // 탭 클릭 핸들러 (순서 잠금 체크)
  const handleTabClick = useCallback((stepId: string) => {
    const stepIndex = WORKFLOW_SEQUENCE.findIndex(s => s.id === stepId);
    if (stepIndex === 0) {
      setActiveDocId(stepId);
      return;
    }

    // 이전 문서가 존재하는지 확인
    const prevStep = WORKFLOW_SEQUENCE[stepIndex - 1];
    const prevDoc = documents.find(d => d.id === prevStep.id);

    if (!prevDoc?.exists) {
      // 이전 문서가 없으면 이동 불가
      return;
    }

    setActiveDocId(stepId);
  }, [documents]);

  // 워크플로우 시작 버튼 클릭
  const handleStartWorkflow = useCallback((step: WorkflowStep) => {
    onSendPrompt(step.workflow);
    setActiveDocId(step.id);
  }, [onSendPrompt]);

  // 탭 활성화 여부 확인
  const isTabEnabled = (index: number) => {
    if (index === 0) return true;
    const prevStep = WORKFLOW_SEQUENCE[index - 1];
    return documents.some(d => d.id === prevStep.id && d.exists);
  };

  if (isLoading && documents.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 진행 상태 표시 */}
      <div className="flex-shrink-0 border-b px-4 py-3 bg-muted/30">
        <div className="flex items-center gap-1 justify-center mb-2">
          {WORKFLOW_SEQUENCE.map((step, index) => {
            const doc = documents.find(d => d.id === step.id);
            const isCompleted = doc?.exists;
            const isNext = progress.nextStep?.id === step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-1">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className={cn(
                      "h-5 w-5",
                      isNext ? "text-amber-500" : "text-muted-foreground/40"
                    )} />
                  )}
                  <span className={cn(
                    "text-[10px] font-medium",
                    isCompleted && "text-primary",
                    isNext && "text-amber-600",
                    !isCompleted && !isNext && "text-muted-foreground/60"
                  )}>
                    {step.title}
                  </span>
                </div>
                {index < WORKFLOW_SEQUENCE.length - 1 && (
                  <div className={cn(
                    "w-4 h-px mt-[-12px]",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="text-center text-xs text-muted-foreground">
          {progress.completed}/{progress.total} 문서 완료
        </div>
      </div>

      {/* 탭 목록 (사이드바) + 문서 내용 */}
      <div className="flex-1 flex min-h-0">
        {/* 사이드바 탭 */}
        <div className="w-36 flex-shrink-0 border-r bg-muted/20 py-2 overflow-y-auto">
          {WORKFLOW_SEQUENCE.map((step, index) => {
            const doc = documents.find(d => d.id === step.id);
            const isEnabled = isTabEnabled(index);
            const isActive = activeDocId === step.id;

            return (
              <button
                key={step.id}
                onClick={() => handleTabClick(step.id)}
                disabled={!isEnabled}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium border-r-2 border-primary"
                    : isEnabled
                      ? "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      : "text-muted-foreground/40 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2">
                  {doc?.exists ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                  {step.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* 문서 내용 영역 */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeDoc?.exists && activeDoc.content ? (
            <PlanningDocViewer content={activeDoc.content} />
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center mb-4 mx-auto">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>

                {progress.nextStep?.id === activeDocId ? (
                  <>
                    <p className="text-lg font-medium mb-2">
                      {activeDoc?.title || progress.nextStep.title} 문서 작성
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      버튼을 클릭하여 AI와 함께 문서를 작성하세요
                    </p>
                    <Button
                      onClick={() => handleStartWorkflow(progress.nextStep!)}
                      disabled={isSessionLoading}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      {progress.nextStep.title} 작성 시작
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium mb-1">
                      {WORKFLOW_SEQUENCE.find(s => s.id === activeDocId)?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      이전 문서를 먼저 작성해주세요
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 다음 단계 버튼 (현재 문서 완료 시) */}
      {activeDoc?.exists && progress.nextStep && (
        <div className="flex-shrink-0 border-t p-4 bg-muted/30">
          <Button
            className="w-full"
            onClick={() => handleStartWorkflow(progress.nextStep!)}
            disabled={isSessionLoading}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            다음: {progress.nextStep.title} 작성하기
          </Button>
        </div>
      )}

      {/* 모든 문서 완료 시 */}
      {progress.isAllComplete && (
        <div className="flex-shrink-0 border-t p-4 bg-primary/5">
          <div className="text-center">
            <p className="text-sm font-medium text-primary mb-1">
              🎉 모든 기획 문서가 완료되었습니다!
            </p>
            <p className="text-xs text-muted-foreground">
              이제 개발문서 탭에서 개발을 시작할 수 있습니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

### Phase 5: 마크다운 문서 뷰어

**파일: `src/components/planning/PlanningDocViewer.tsx`**

```typescript
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PlanningDocViewerProps {
  content: string;
}

export const PlanningDocViewer: React.FC<PlanningDocViewerProps> = ({ content }) => {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
```

---

### Phase 6: MvpWorkspace.tsx 수정

**변경 사항:**
1. 기존 기획문서 탭 placeholder를 `PlanningDocsPanel`로 교체
2. `ClaudeCodeSession`에 프롬프트 전송 함수 노출 (ref 또는 콜백)

```typescript
// MvpWorkspace.tsx 수정 부분

import { PlanningDocsPanel } from '@/components/planning/PlanningDocsPanel';

// ...

// ClaudeCodeSession에 프롬프트 전송 기능 추가
const claudeSessionRef = useRef<{ sendPrompt: (prompt: string) => void } | null>(null);

const handleSendPlanningPrompt = useCallback((prompt: string) => {
  // ClaudeCodeSession의 sendPrompt 호출
  claudeSessionRef.current?.sendPrompt(prompt);
}, []);

// ...

// 기획문서 탭 내용 변경
{activeTab === 'planning' && (
  <PlanningDocsPanel
    projectPath={project?.path || ''}
    onSendPrompt={handleSendPlanningPrompt}
    isLoading={/* session loading state */}
  />
)}
```

---

## 📋 구현 순서 (우선순위)

| 순서 | 작업 | 예상 시간 |
|------|------|----------|
| 1 | `src/constants/planning.ts` 생성 | 10분 |
| 2 | Tauri 백엔드 파일 API 추가 | 20분 |
| 3 | `src/lib/api.ts`에 planningApi 추가 | 10분 |
| 4 | `src/hooks/usePlanningDocs.ts` 생성 | 30분 |
| 5 | `src/components/planning/PlanningDocViewer.tsx` 생성 | 15분 |
| 6 | `src/components/planning/PlanningDocsPanel.tsx` 생성 | 45분 |
| 7 | `MvpWorkspace.tsx` 수정 (통합) | 30분 |
| 8 | `ClaudeCodeSession.tsx` 수정 (프롬프트 전송 노출) | 20분 |
| 9 | 테스트 및 디버깅 | 30분 |

**총 예상 시간: 약 3-4시간**

---

## 🔗 의존성

### 필요한 패키지 (이미 설치되어 있을 가능성 높음)
- `react-markdown`: 마크다운 렌더링
- `remark-gfm`: GitHub Flavored Markdown 지원

```bash
bun add react-markdown remark-gfm
```

---

## ⚠️ 주의사항

1. **ClaudeCodeSession 수정**: 현재 `handleSendPrompt`가 내부 함수이므로, 외부에서 호출할 수 있도록 `useImperativeHandle` 또는 콜백 prop 추가 필요

2. **폴링 주기**: 3초 간격으로 파일 존재 확인 - 필요시 조절 가능

3. **에러 핸들링**: 파일 시스템 접근 실패 시 graceful fallback 필요

---

## 질문 있으시면 말씀해주세요!
