---
description: 'BMAD 스타일 React 컴포넌트 분할 워크플로우'
---

# Split Component Workflow

IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @_bmad/bmm/workflows/5-maintenance/split-component/workflow.md, READ its entire contents and follow its directions exactly!

## Quick Reference

**전제 조건**: `/sdd:code-audit` 실행 완료
**입력**: `sdd-docs/audits/audit-result.json` (action: "split_file", area: "frontend")
**실행 방식**: Semi-automatic (사용자 확인 후 진행)
**예상 시간**: 10-30분 (컴포넌트 크기에 따라)

## 대상 이슈 예시

| 파일 | 현재 줄 수 | 분할 결과 |
|------|-----------|----------|
| ToolWidgets.tsx | 3,273 | widgets/ 폴더 (21개 파일) |
| Settings.tsx | 1,279 | settings/ 폴더 (8개 파일) |

## 워크플로우 단계

1. **Analyze** - 컴포넌트 분석 및 분할 계획 수립
2. **Split** - 실제 파일 분할 실행
3. **Verify** - 빌드/테스트 검증 및 정리

## 분할 전략

```
Before:
src/components/ToolWidgets.tsx (3,273 lines)

After:
src/components/widgets/
├── index.ts              (re-exports)
├── TodoWidget.tsx
├── ReadWidget.tsx
├── WriteWidget.tsx
├── EditWidget.tsx
├── BashWidget.tsx
├── GrepWidget.tsx
├── GlobWidget.tsx
├── LSWidget.tsx
├── MCPWidget.tsx
└── ... (기타 위젯들)
```

## 안전장치

- 작업 전 `git stash`로 롤백 포인트 생성
- 각 단계마다 TypeScript 컴파일 검증
- 실패 시 `git stash pop`으로 자동 롤백

## 워크플로우 시작

→ LOAD: @_bmad/bmm/workflows/5-maintenance/split-component/workflow.md
