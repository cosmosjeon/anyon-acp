# opcode UI 리팩토링 구현 계획 (React Router 기반)

## 목표
new-anyon 스타일의 유저 플로우를 opcode에 적용:
1. 프로젝트 리스트 UI를 그리드 카드 스타일로 변경
2. 프로젝트 선택 후 **MVP 개발** vs **유지보수** 작업 유형 분기
3. **React Router를 도입하여 URL 기반 라우팅 구현**

---

## URL 구조

```
/projects                      → 프로젝트 리스트 (그리드 카드)
/project/:projectId            → 작업 유형 선택 (MVP vs 유지보수)
/project/:projectId/mvp        → MVP 개발 워크스페이스
/project/:projectId/maintenance → 유지보수 워크스페이스

향후 확장:
/project/:projectId/mvp/planning      → 기획 문서
/project/:projectId/mvp/development   → 개발 문서
/project/:projectId/maintenance/diff  → Diff 뷰
/project/:projectId/settings          → 프로젝트 설정
```

---

## Phase 1: React Router 설정

### 1.1 패키지 설치
```bash
bun add react-router-dom
```

### 1.2 라우터 설정 파일 생성
```
새 파일: src/router.tsx

- HashRouter 사용 (Tauri 호환성)
- 프로젝트 관련 라우트 정의
- 기존 탭 시스템과 통합
```

### 1.3 App.tsx 수정
```
수정 파일: src/App.tsx

- RouterProvider 또는 HashRouter로 래핑
- 'projects' 탭 내부에서 라우터 사용
```

---

## Phase 2: 프로젝트 리스트 UI 개선

### 2.1 ProjectList.tsx 리팩토링
**현재**: 리스트 형태의 단순한 프로젝트 목록
**변경**: 그리드 카드 스타일 (4열)

```
수정 파일: src/components/ProjectList.tsx

변경 사항:
- 그리드 레이아웃 (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4)
- 프로젝트 카드 컴포넌트 추가 (ProjectCard)
- 검색 기능 추가
- Empty state 개선
- 삭제 기능 (3점 메뉴)
- useNavigate()로 라우팅: navigate(`/project/${project.id}`)
```

### 2.2 ProjectCard 컴포넌트 생성
```
새 파일: src/components/ProjectCard.tsx

- 카드 UI (호버 효과, 선택 상태)
- 프로젝트 이름, 경로, 업데이트 날짜
- 3점 메뉴 (삭제)
- 로딩 상태 표시
- 클릭 시 navigate 호출
```

---

## Phase 3: 작업 유형 선택 화면

### 3.1 WorkspaceSelector 컴포넌트
```
새 파일: src/components/WorkspaceSelector.tsx

- URL: /project/:projectId
- useParams()로 projectId 추출
- 프로젝트 정보 로드 (api.getProject 또는 projects에서 찾기)

UI:
┌─────────────────────────────────────────────────────────────┐
│  ← Back                        프로젝트 이름                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                "작업 유형을 선택하세요"                      │
│                                                             │
│            ┌───────────────┐  ┌───────────────┐             │
│            │   MVP 개발    │  │   유지보수     │             │
│            │  (Lightbulb)  │  │   (Wrench)    │             │
│            │               │  │               │             │
│            │ AI와 대화하며  │  │ 기존 코드를   │             │
│            │ 기획문서 작성  │  │ 수정하고      │             │
│            │ MVP 설계      │  │ 기능 추가     │             │
│            └───────────────┘  └───────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

클릭 이벤트:
- MVP 클릭 → navigate(`/project/${projectId}/mvp`)
- 유지보수 클릭 → navigate(`/project/${projectId}/maintenance`)
- Back 클릭 → navigate('/projects')
```

### 3.2 SelectionCard 컴포넌트
```
새 파일: src/components/ui/selection-card.tsx

Props:
- icon: LucideIcon
- title: string
- description: string
- onClick: () => void

스타일:
- 호버 시 border 색상 변경
- 클릭 애니메이션 (framer-motion)
- 중앙 정렬된 아이콘과 텍스트
```

---

## Phase 4: 워크스페이스 컴포넌트

### 4.1 MvpWorkspace 컴포넌트
```
새 파일: src/components/MvpWorkspace.tsx

- URL: /project/:projectId/mvp
- useParams()로 projectId 추출
- 프로젝트 경로 조회 후 ClaudeCodeSession에 전달

현재 단계:
- 헤더에 "MVP 개발" 표시 + 뒤로가기 버튼
- 기존 ClaudeCodeSession 재사용

향후 확장:
- 기획 문서 패널
- 개발 문서 패널
- 워크플로우 기능
```

### 4.2 MaintenanceWorkspace 컴포넌트
```
새 파일: src/components/MaintenanceWorkspace.tsx

- URL: /project/:projectId/maintenance
- useParams()로 projectId 추출

현재 단계:
- 헤더에 "유지보수" 표시 + 뒤로가기 버튼
- 기존 ClaudeCodeSession 재사용

향후 확장:
- 코드 Diff 뷰
- 프리뷰 패널
```

---

## Phase 5: TabContent 통합

### 5.1 프로젝트 탭에 라우터 통합
```
수정 파일: src/components/TabContent.tsx

case 'projects':
  return (
    <ProjectRoutes />  // 내부에서 React Router 사용
  );

새 파일: src/components/ProjectRoutes.tsx

import { Routes, Route, Navigate } from 'react-router-dom';

export const ProjectRoutes = () => {
  return (
    <Routes>
      <Route path="/projects" element={<ProjectList />} />
      <Route path="/project/:projectId" element={<WorkspaceSelector />} />
      <Route path="/project/:projectId/mvp" element={<MvpWorkspace />} />
      <Route path="/project/:projectId/maintenance" element={<MaintenanceWorkspace />} />
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
};
```

---

## 파일 변경 요약

### 새로 설치할 패키지
```bash
bun add react-router-dom
```

### 수정할 파일
1. `src/App.tsx` - HashRouter 래핑
2. `src/components/ProjectList.tsx` - 그리드 카드 UI + navigate
3. `src/components/TabContent.tsx` - ProjectRoutes 통합

### 새로 생성할 파일
1. `src/router.tsx` - 라우터 설정
2. `src/components/ProjectRoutes.tsx` - 프로젝트 라우트 정의
3. `src/components/ProjectCard.tsx` - 프로젝트 카드 컴포넌트
4. `src/components/WorkspaceSelector.tsx` - 작업 유형 선택
5. `src/components/ui/selection-card.tsx` - 선택 카드 UI
6. `src/components/MvpWorkspace.tsx` - MVP 워크스페이스
7. `src/components/MaintenanceWorkspace.tsx` - 유지보수 워크스페이스

---

## 구현 순서

1. **Phase 1**: React Router 설치 및 기본 설정
2. **Phase 2**: ProjectList 그리드 카드 UI 리팩토링
3. **Phase 3**: WorkspaceSelector 컴포넌트 생성
4. **Phase 4**: MvpWorkspace, MaintenanceWorkspace 생성
5. **Phase 5**: TabContent에서 ProjectRoutes 통합
6. **테스트**: 전체 플로우 테스트

---

## 유저 플로우 (구현 후)

```
[앱 시작]
    │
    ▼
[/projects] ◄───────────────────────────────────────────────┐
    │ 프로젝트 리스트 (그리드 카드 UI)                        │
    │                                                        │
    ├─ [Open Folder] → 폴더 선택 → 프로젝트 생성              │
    │                                                        │
    ▼                                                        │
[프로젝트 카드 클릭]                                          │
    │ navigate(`/project/${id}`)                             │
    ▼                                                        │
[/project/:id] ─────────────────────────────────────────────┤
    │ WorkspaceSelector                                      │
    │                                                        │
    ├── [MVP 개발 클릭] ────────────────┐                    │
    │   navigate(`/project/${id}/mvp`)  │                    │
    │                                   │                    │
    │   ┌────────────────────────────┐  │                    │
    │   │ /project/:id/mvp           │  │                    │
    │   │ MvpWorkspace               │  │                    │
    │   │ (현재: ClaudeCodeSession)  │  │                    │
    │   └────────────────────────────┘  │                    │
    │                                   │                    │
    └── [유지보수 클릭] ────────────────┤                    │
        navigate(`/project/${id}/maintenance`)               │
                                        │                    │
        ┌────────────────────────────┐  │                    │
        │ /project/:id/maintenance   │  │                    │
        │ MaintenanceWorkspace       │  │                    │
        │ (현재: ClaudeCodeSession)  │  │                    │
        └────────────────────────────┘  │                    │
                                        │                    │
                                        ▼                    │
                      [뒤로가기] navigate(-1) ────────────────┘
                      또는 navigate('/projects')
```

---

## 장점

1. **명확한 URL 구조**: `/project/abc123/mvp` vs `/project/abc123/maintenance`
2. **브라우저 히스토리**: 뒤로가기/앞으로가기 자연스럽게 동작
3. **딥링크 가능**: 나중에 특정 워크스페이스로 바로 이동 가능
4. **확장성**: 서브 라우트 추가 용이 (`/mvp/planning`, `/maintenance/diff` 등)
5. **기존 탭 시스템 유지**: chat, agents 등 다른 탭은 그대로

---

## 예상 작업 시간
- Phase 1: ~15분 (React Router 설치 및 설정)
- Phase 2: ~30분 (ProjectList 리팩토링)
- Phase 3: ~25분 (WorkspaceSelector)
- Phase 4: ~20분 (워크스페이스 컴포넌트)
- Phase 5: ~15분 (TabContent 통합)
- 테스트: ~20분

**총 예상 시간: ~2시간**
