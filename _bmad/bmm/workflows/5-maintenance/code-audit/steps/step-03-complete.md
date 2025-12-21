---
name: 'step-03-complete'
description: 'Aggregate results and generate final summary report'
thisStepFile: '_bmad/bmm/workflows/5-maintenance/code-audit/steps/step-03-complete.md'
nextStepFile: null
---

# Step 3: Complete Audit

**Progress: Step 3 of 3** - Final Step

---

## STEP GOAL

3개 영역의 감사 결과를 통합하여 전체 요약 보고서를 생성합니다.

---

## AUTOMATIC EXECUTION SEQUENCE

### 1. Read All Area Reports

다음 파일들을 읽어 결과 수집:
```
sdd-docs/audits/frontend/audit-report.md
sdd-docs/audits/desktop/audit-report.md
sdd-docs/audits/server/audit-report.md
```

### 2. Aggregate Counts

각 영역에서 Critical/Warning/Info 개수 추출하여 합산.

### 3. Generate Overall Summary

**파일**: `sdd-docs/audits/code-audit-report.md`

다음 형식으로 작성:

```markdown
# ANYON 코드 감사 보고서

**Audit Date:** [현재 날짜]
**Audit Type:** Maintainability-focused (AI 드리븐 개발 대응)

---

## 전체 요약

| 영역 | Critical | Warning | Info | 등급 |
|------|----------|---------|------|------|
| Frontend | N | N | N | ? |
| Desktop | N | N | N | ? |
| Server | N | N | N | ? |
| **전체** | **N** | **N** | **N** | **?** |

## 🔴 Critical 이슈 (즉시 조치 필요)

[각 영역에서 Critical 이슈 목록]

## ⚠️ 주요 Warning 이슈

[주요 Warning 요약]

## 권장 조치 우선순위

### P0: 즉시 (이번 주)
1. ...
2. ...

### P1: 이번 스프린트
1. ...
2. ...

## 영역별 상세 보고서

- [Frontend Audit Report](./frontend/audit-report.md)
- [Desktop Audit Report](./desktop/audit-report.md)
- [Server Audit Report](./server/audit-report.md)
```

### 4. Generate JSON Result with Actionable Issues

**파일**: `sdd-docs/audits/audit-result.json`

JSON 결과에는 두 가지 핵심 섹션이 포함되어야 합니다:
1. **summary/areas**: 통계 요약 (기존)
2. **issues[]**: 액션 가능한 이슈 목록 (신규)

#### 4.1 Issues 배열 생성 규칙

각 영역 보고서에서 Critical/Warning 이슈를 파싱하여 다음 형식으로 변환:

```json
{
  "issues": [
    {
      "id": "[area]-[type]-[number]",
      "priority": "P0|P1|P2",
      "area": "frontend|desktop|server",
      "type": "security|dead_code|duplication|bloater|type_safety|tech_debt",
      "title": "이슈 제목",
      "file": "상대 경로",
      "line": 라인번호 또는 null,
      "action": "delete_file|replace_pattern|extract_utility|split_file|add_type",
      "description": "이슈 설명",
      "fix": {
        "type": "delete|replace|create|refactor",
        "target": "대상 패턴 또는 파일",
        "replacement": "교체할 내용 (replace 타입일 때)"
      }
    }
  ]
}
```

#### 4.2 Priority 분류 기준

| Priority | 기준 | 예시 |
|----------|------|------|
| P0 | 보안 취약점, Dead Code, 중복 코드 통합 | JWT 하드코딩, orphaned 파일 |
| P1 | 타입 안전성, 코드 정리 (단순) | any 타입, console.log 제거 |
| P2 | 구조적 변경, 테스트 추가 | 파일 분할, 테스트 커버리지 |

#### 4.3 Action 타입 정의

| Action | 설명 | 자동화 |
|--------|------|--------|
| `delete_file` | 파일 삭제 | ✅ |
| `replace_pattern` | 패턴 교체 | ✅ |
| `extract_utility` | 유틸 함수 추출 | ✅ |
| `add_type` | 타입 추가 | ✅ |
| `remove_log` | 로그 제거 | ✅ |
| `split_file` | 파일 분할 | ❌ (별도 워크플로우) |
| `refactor_function` | 함수 리팩토링 | ❌ (별도 워크플로우) |

#### 4.4 전체 JSON 구조

```json
{
  "timestamp": "[ISO8601]",
  "summary": {
    "critical": N,
    "warning": N,
    "info": N,
    "total": N,
    "pass": true/false,
    "grade": "A-E"
  },
  "areas": {
    "frontend": { "critical": N, "warning": N, "info": N, "grade": "?" },
    "desktop": { "critical": N, "warning": N, "info": N, "grade": "?" },
    "server": { "critical": N, "warning": N, "info": N, "grade": "?" }
  },
  "issues": [
    {
      "id": "sec-001",
      "priority": "P0",
      "area": "desktop",
      "type": "security",
      "title": "Hardcoded JWT Secret",
      "file": "src-tauri/src/main.rs",
      "line": 262,
      "action": "replace_pattern",
      "description": "JWT_SECRET 하드코딩 제거, 환경변수 필수화",
      "fix": {
        "type": "replace",
        "target": "unwrap_or_else(|_| \"dev-secret-key-change-in-production\".to_string())",
        "replacement": "expect(\"JWT_SECRET environment variable must be set\")"
      }
    }
  ],
  "recommendations": {
    "P0": ["설명1", "설명2"],
    "P1": ["설명3", "설명4"],
    "P2": ["설명5", "설명6"]
  },
  "metadata": {
    "workflow": "BMAD Code Audit v1.0",
    "agents": ["Frontend Auditor", "Desktop Auditor", "Server Auditor"],
    "parallelExecution": true
  }
}
```

**pass 기준**: Critical이 0개이면 true

---

## OUTPUT

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Code Audit Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Summary:
  Critical: N
  Warning: N
  Info: N

  Overall Grade: [A-E]

📁 Generated Files:
  - sdd-docs/audits/code-audit-report.md
  - sdd-docs/audits/audit-result.json
  - sdd-docs/audits/frontend/audit-report.md
  - sdd-docs/audits/desktop/audit-report.md
  - sdd-docs/audits/server/audit-report.md

🔴 Critical Issues Requiring Immediate Action:
  [List top 3 critical issues]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## WORKFLOW COMPLETE

감사가 완료되었습니다. 사용자에게 결과 요약을 표시합니다.
