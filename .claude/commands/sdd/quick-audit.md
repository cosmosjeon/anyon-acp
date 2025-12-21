---
description: '빠른 코드 품질 체크 (Critical 이슈만, ~1분)'
---

# Quick Audit Workflow

IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @_bmad/bmm/workflows/5-maintenance/quick-audit/workflow.md, READ its entire contents and follow its directions exactly!

## Quick Reference

**실행 방식**: 자동 (2단계)
**병렬 분석**: Frontend / Desktop / Server 동시
**예상 시간**: ~1분

## 검사 범위 (Critical만)

- 50줄+ 긴 함수
- console.log / unwrap() / any 개수
- 하드코딩된 시크릿 (API Key, Password)

## 출력

```
sdd-docs/audits/quick-audit-result.md
```

## 워크플로우 시작

→ LOAD: @_bmad/bmm/workflows/5-maintenance/quick-audit/workflow.md
