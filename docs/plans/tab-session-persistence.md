# 탭별 세션 기록 보존 구현 계획

## 목표
MVP 개발탭과 유지보수탭에서 각각의 채팅 기록을 독립적으로 보존하고, 탭 전환 시에도 이전 대화를 자동으로 복원

## 구현 범위

### 1. SessionPersistenceService 확장
**파일:** `src/services/sessionPersistence.ts`

- `SessionRestoreData` 인터페이스에 `tabType` 필드 추가
- 탭별 마지막 세션 저장/조회 메서드 추가:
  - `saveLastSessionForTab(projectPath, tabType, sessionId)`
  - `getLastSessionForTab(projectPath, tabType)`
- localStorage 키 형식: `anyon_last_session_{projectPath}_{tabType}`

### 2. ClaudeCodeSession 컴포넌트 수정
**파일:** `src/components/ClaudeCodeSession.tsx`

- props에 `tabType?: 'mvp' | 'maintenance'` 추가
- 세션 생성/저장 시 tabType 포함
- `extractedSessionInfo`에 tabType 저장

### 3. MvpWorkspace 수정
**파일:** `src/components/MvpWorkspace.tsx`

- 컴포넌트 마운트 시 마지막 세션 ID 조회
- `ClaudeCodeSession`에 `session` prop과 `tabType="mvp"` 전달
- 세션 변경 시 마지막 세션 ID 업데이트

### 4. MaintenanceWorkspace 수정
**파일:** `src/components/MaintenanceWorkspace.tsx`

- 컴포넌트 마운트 시 마지막 세션 ID 조회
- `ClaudeCodeSession`에 `session` prop과 `tabType="maintenance"` 전달
- 세션 변경 시 마지막 세션 ID 업데이트

## 구현 순서

1. `SessionPersistenceService` 확장 (tabType 지원)
2. `ClaudeCodeSession`에 tabType prop 추가 및 세션 저장 로직 수정
3. `MvpWorkspace` 세션 복원 로직 추가
4. `MaintenanceWorkspace` 세션 복원 로직 추가

## 데이터 흐름

```
[Workspace 마운트]
    ↓
getLastSessionForTab(projectPath, tabType)
    ↓
[세션 ID 있음?] → [api.loadSessionHistory()] → [ClaudeCodeSession에 session prop 전달]
    ↓ (없음)
[새 세션으로 시작]
    ↓
[새 세션 생성 시]
    ↓
saveLastSessionForTab(projectPath, tabType, sessionId)
```

## 예상 변경 파일
- `src/services/sessionPersistence.ts`
- `src/components/ClaudeCodeSession.tsx`
- `src/components/MvpWorkspace.tsx`
- `src/components/MaintenanceWorkspace.tsx`
