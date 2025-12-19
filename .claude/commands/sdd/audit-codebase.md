---
description: 'Claude AI 기반 코드 품질/보안/아키텍처 심층 분석'
---

# Intelligent Code Audit

프로젝트를 심층 분석하고 `sdd-docs/audits/code-audit-report.md`를 업데이트합니다.

## 분석 항목

### 1. 보안 (Security) - Critical/High

**필수 검사:**
- Hardcoded Secrets: API 키, 비밀번호, 토큰이 코드에 직접 포함되어 있는지
- SQL Injection: 사용자 입력이 쿼리에 직접 삽입되는지
- XSS: 사용자 입력이 검증 없이 렌더링되는지 (dangerouslySetInnerHTML 등)
- CORS 설정: 무제한 origin 허용 여부
- JWT 검증: 토큰 검증 누락 여부

### 2. 코드 복잡도 (Complexity)

**함수별 분석:**
- Cyclomatic Complexity: 분기문(if/switch/loop) 수 계산, 10 초과 시 경고
- Function Length: 50줄 초과 함수 식별
- Nesting Depth: 4단계 이상 중첩 식별
- File Length: 500줄 초과 파일 식별 및 분리 제안

### 3. 아키텍처 품질 (Architecture)

**구조 분석:**
- Cyclic Dependencies: A→B→C→A 같은 순환 import 탐지
- Layer Violations: UI에서 직접 DB 접근 등 계층 위반
- Coupling: 하나의 모듈이 너무 많은 다른 모듈에 의존하는지
- Cohesion: 하나의 파일/클래스가 관련 없는 기능을 포함하는지

### 4. 에러 처리 (Error Handling)

**패턴 분석:**
- Empty Catch: `catch (e) {}` 빈 블록
- Unhandled Promise: `.catch()` 없는 Promise
- unwrap() 위험 사용: 사용자 입력, 외부 API, 파일 I/O에서 unwrap (Rust)
- expect() 부적절 사용: 프로덕션 코드에서 panic 가능성 (Rust)

### 5. 타입 안전성 (Type Safety)

**TypeScript 분석:**
- 불필요한 any: 타입 추론 가능한데 any 사용
- Type Assertion 남용: `as` 키워드 과다 사용
- Unsafe Cast: 런타임 에러 가능한 타입 변환

### 6. 코드 품질 (Code Quality)

**품질 검사:**
- Debug Code: console.log (로깅 라이브러리 사용 제외)
- Dead Code: import 되었지만 사용 안 되는 코드
- Code Duplication: 유사한 로직 반복

## 분석 대상

- `src/` - Frontend (React + TypeScript)
- `src-tauri/src/` - Desktop Backend (Rust)
- `server/` - Auth Server (Node.js)

## 위험도 분류

| 등급 | 설명 | Push 차단 |
|------|------|-----------|
| **Critical** | 보안 취약점, 데이터 손실 위험 | ✅ 차단 |
| **High** | 심각한 버그, 아키텍처 문제 | ⚠️ 경고 |
| **Medium** | 유지보수성 저하, 코드 품질 | ℹ️ 정보 |
| **Low** | 스타일, 권장사항 | ℹ️ 정보 |

## 결과 파일

분석 완료 후 다음 파일들을 업데이트하세요:

### 1. sdd-docs/audits/code-audit-report.md

```markdown
# Code Audit Report

**Last Updated:** [YYYY-MM-DDTHH:MM:SS.000Z]
**Audit Type:** AI-Powered Analysis

## Summary

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Security | X | X | - | - | X |
| Complexity | - | X | X | - | X |
| Architecture | - | X | X | - | X |
| Error Handling | - | X | X | - | X |
| Type Safety | - | - | X | X | X |
| Code Quality | - | - | X | X | X |
| **Total** | **X** | **X** | **X** | **X** | **X** |

## Critical Issues (Push 차단)

### [Issue Title]
- **위치:** `파일경로:라인번호`
- **위험도:** Critical
- **카테고리:** Security/Complexity/Architecture/Error Handling/Type Safety/Code Quality
- **설명:** [문제 설명]
- **수정 제안:**
```코드 예시```

## High Issues (경고)

[동일 형식]

## Medium Issues (정보)

[동일 형식]

## Low Issues (권장사항)

[동일 형식]
```

### 2. sdd-docs/audits/audit-result.json

```json
{
  "timestamp": "[ISO8601 형식]",
  "summary": {
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0,
    "total": 0,
    "pass": true
  },
  "categories": {
    "security": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
    "complexity": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
    "architecture": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
    "errorHandling": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
    "typeSafety": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
    "codeQuality": { "critical": 0, "high": 0, "medium": 0, "low": 0 }
  },
  "issues": [
    {
      "id": "SEC-001",
      "category": "security",
      "severity": "critical",
      "title": "Issue Title",
      "location": "파일:라인",
      "description": "설명",
      "suggestion": "수정 제안"
    }
  ]
}
```

### 3. sdd-docs/sync-status.json

`audit_tracking` 섹션만 업데이트:
```json
"audit_tracking": {
  "audits/code-audit-report.md": {
    "total_issues": N,
    "critical": N,
    "high": N,
    "medium": N,
    "low": N,
    "pass": true/false,
    "last_updated": "[타임스탬프]"
  }
}
```

## 실행 순서

1. `src/`, `src-tauri/src/`, `server/` 폴더의 코드 분석
2. 6개 카테고리별로 이슈 식별
3. 위험도 분류 (Critical/High/Medium/Low)
4. `code-audit-report.md` 작성
5. `audit-result.json` 생성
6. `sync-status.json` 업데이트
7. 결과 요약 출력

## 참고

- Critical 이슈가 있으면 `pass: false`
- Critical 이슈가 없으면 `pass: true`
- Git pre-push hook에서 `audit-result.json`의 `pass` 값을 확인하여 push 차단 여부 결정
