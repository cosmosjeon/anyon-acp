---
description: 'BMAD 스타일 코드 품질/유지보수성 심층 분석 워크플로우 (자동 실행 + 병렬 에이전트)'
---

# Code Audit Workflow

IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @_bmad/bmm/workflows/5-maintenance/code-audit/workflow.md, READ its entire contents and follow its directions exactly!

## Quick Reference

**실행 방식**: 자동 (3단계 순차 실행)
**병렬 분석**: Frontend / Desktop / Server 동시 분석
**예상 시간**: ~3분

## 분석 기준

`sdd-docs/audits/README.md` 참조:

1. **AI 생성 코드 문제** (우선)
   - 중복 코드, 문맥 무시, 과도한 복잡성

2. **Bloaters**
   - Long Method (50줄+), Complexity (10+)

3. **Dispensables**
   - Dead Code, Duplication

4. **SOLID 위반**
   - Single Responsibility 위반

5. **기술 부채**
   - TODO, any 타입, 하드코딩

## 출력 파일

```
sdd-docs/audits/
├── code-audit-report.md  # 전체 요약
├── audit-result.json     # JSON 결과
├── frontend/
│   └── audit-report.md
├── desktop/
│   └── audit-report.md
└── server/
    └── audit-report.md
```

## 워크플로우 시작

→ LOAD: @_bmad/bmm/workflows/5-maintenance/code-audit/workflow.md
