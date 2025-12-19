# ANYON - Claude Code Context

## 프로젝트 개요

AI-Powered Development Platform (Tauri + React + Node.js)

- **Desktop App**: Tauri 2.x + Rust
- **Frontend**: React 18 + TypeScript + Vite
- **Auth Server**: Node.js + Express

## 빠른 상태 파악

세션 시작 시 자동으로 `sdd-docs/CURRENT-STATUS.md`가 로드됩니다.

더 자세한 정보가 필요하면:
```
sdd-docs/README.md             # SDD 프로세스 가이드
sdd-docs/index.md              # 마스터 문서 인덱스
sdd-docs/specs/                # 기술 스펙 (아키텍처, API, 컴포넌트)
sdd-docs/audits/               # 코드 감사 보고서
sdd-docs/features/             # 기능별 구현 설명
```

## 문서 구조

| 경로 | 용도 | 자동화 |
|------|------|--------|
| `sdd-docs/specs/` | 기술 스펙 | ✅ CI/CD |
| `sdd-docs/audits/` | 코드 감사 | ✅ CI/CD |
| `sdd-docs/features/` | 기능별 구현 설명 | ❌ 수동 |

### 주요 문서

| 파일 | 설명 |
|------|------|
| `sdd-docs/index.md` | 마스터 문서 인덱스 |
| `sdd-docs/specs/project-overview.md` | 프로젝트 개요 |
| `sdd-docs/specs/architecture-*.md` | 아키텍처 문서 |
| `sdd-docs/specs/component-inventory.md` | 컴포넌트 목록 |
| `sdd-docs/audits/code-audit-report.md` | 코드 감사 보고서 |
| `sdd-docs/features/template/` | 앱 워크플로우 문서 (planning/, development/) |

## 동기화 시스템

- `/sync-docs` - 문서 동기화 슬래시 커맨드
- `/audit-codebase` - 코드 품질 감사
- CI/CD: dev 브랜치 push 시 자동 동기화 (`.github/workflows/sync-docs.yml`)

## 슬래시 커맨드

| 명령어 | 설명 |
|--------|------|
| `/sync-docs` | 문서 동기화 |
| `/audit-codebase` | 코드 감사 |
| `/bmad/*` | BMAD 워크플로우 |

## 테스트 전략 (Test on Bug)

### 필수 규칙
- **버그 수정 시**: 반드시 테스트 먼저 작성 (TDD)
- **복잡한 순수 함수**: 테스트 권장
- **UI 컴포넌트**: 테스트 스킵 (수동 테스트)

### 테스트 작성 위치
- 소스 파일 옆에 `*.test.ts` 형식으로 배치
- 예: `src/lib/ports.ts` → `src/lib/ports.test.ts`

### 테스트 실행
```bash
bun test              # 전체 테스트
bun test --watch      # 파일 변경 감지
```

### 버그 수정 워크플로우
1. 버그 재현하는 테스트 작성 (실패)
2. 버그 수정
3. 테스트 통과 확인
4. 커밋

## 개발 가이드

```bash
# 의존성 설치
npm install
cd server && npm install

# 개발 서버 시작
npm run dev

# 빌드
npm run build
npm run tauri build
```
