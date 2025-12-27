# Spec-Driven Development (SDD) Guide

> 코드베이스 관리를 위한 내부 SDD 시스템

---

## 폴더 구조

| 폴더 | 내용 | 자동화 |
|------|------|--------|
| `specs/` | 기술 스펙 (아키텍처, 컴포넌트, API 등) | ✅ CI/CD |
| `audits/` | 코드 품질 감사 | ✅ CI/CD |
| `features/` | 앱 기능별 구현 설명 (UI 기반) | ❌ 수동 |

---

## 코드 품질 관리

### Claude AI 기반 심층 분석

```
/audit-codebase
    ↓
Claude AI 코드 분석 (6개 카테고리)
    ↓
audits/code-audit-report.md 업데이트
audits/audit-result.json 생성
```

**분석 카테고리:**
- Security: 보안 취약점 (Critical)
- Complexity: 코드 복잡도
- Architecture: 아키텍처 품질
- Error Handling: 에러 처리
- Type Safety: 타입 안전성
- Code Quality: 코드 품질

### Git Hook 자동화

```
git push
    ↓
pre-push hook
    ↓
Claude audit 실행
    ↓
Critical 이슈 → push 차단
```

**스킵 방법:**
```bash
git push --no-verify
# 또는
SKIP_AUDIT=1 git push
```

---

## 문서 동기화

```
코드 변경 → dev 브랜치 머지
    ↓
CI/CD (sync-docs.yml)
    ↓
specs/, CURRENT-STATUS.md 자동 업데이트
```

---

## 관련 명령어

| 명령어 | 설명 |
|--------|------|
| `/sync-docs` | 문서 동기화 |
| `/audit-codebase` | 코드 품질 감사 |

---

## AI 컨텍스트

세션 시작 시 `CURRENT-STATUS.md`가 자동 로드됩니다.

상세 정보가 필요하면:
- **기술 스펙**: `specs/` 참조
- **코드 품질**: `audits/` 참조
- **기능 구현**: `features/` 참조

---

## 주요 파일

| 파일 | 설명 |
|------|------|
| `CURRENT-STATUS.md` | AI 컨텍스트 브리프 (세션 시작 시 자동 로드) |
| `index.md` | 마스터 인덱스 (모든 문서 링크) |
| `sync-status.json` | 문서 동기화 상태 (CI/CD 관리) |

---

## 앱 기능 문서

ANYON 앱이 사용자에게 제공하는 워크플로우는 `features/template/` 참조:

| 문서 | 설명 |
|------|------|
| [MVP Tab Overview](features/template/basic/mvp-workspace/planning/00-mvp-tab-overview.md) | MVP 탭 전체 구조 |
| [PRD Workflow](features/template/basic/mvp-workspace/planning/01-prd-workflow.md) | PRD 워크플로우 |
| [UX Design Workflow](features/template/basic/mvp-workspace/planning/02-ux-design-workflow.md) | UX 디자인 워크플로우 |
| [Development Workflow](features/template/basic/mvp-workspace/planning/07-development-workflow.md) | 개발 워크플로우 |
