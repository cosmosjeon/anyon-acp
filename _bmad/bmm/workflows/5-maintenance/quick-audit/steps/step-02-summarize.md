---
name: 'step-02-summarize'
description: 'Combine results into single summary file'
---

# Step 2: Summarize Results

**Progress: Step 2 of 2 (Final)**

---

## STEP GOAL

3개 에이전트 결과를 하나의 요약 파일로 통합

---

## OUTPUT FILE

Create: `sdd-docs/audits/quick-audit-result.md`

---

## OUTPUT FORMAT

```markdown
# Quick Audit Result

**Generated**: [timestamp]
**Branch**: [current branch]

---

## Summary

| Area | console.log | any/unwrap | Large Funcs | Large Files |
|------|-------------|------------|-------------|-------------|
| Frontend | N | N | N | N |
| Desktop | N | N | N | N |
| Server | N | N | N | N |
| **Total** | **N** | **N** | **N** | **N** |

---

## Frontend Quick Scan
[Agent 1 output]

---

## Desktop Quick Scan
[Agent 2 output]

---

## Server Quick Scan
[Agent 3 output]

---

## Action Items

1. [ ] console.log 정리 (N개)
2. [ ] any 타입 제거 (N개)
3. [ ] 긴 함수 리팩토링 (N개)

---

> Full audit: `/audit-codebase`
```

---

## EXECUTE NOW

1. 3개 에이전트 결과 수집
2. Summary 테이블 계산
3. `sdd-docs/audits/quick-audit-result.md` 파일 작성
4. 사용자에게 완료 알림

---

## WORKFLOW COMPLETE

워크플로우 완료. 결과 파일 경로를 사용자에게 알려주세요.
