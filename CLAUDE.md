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

## Design System - shadcn/ui Maia (Dec 2025 Migration)

### 색상 체계
- **Base**: Maia Neutral Palette (shadcn/ui default)
- **Brand Colors**: `#d97757` (primary), `#ff9a7a` (secondary)
- **Themes**: Dark (기본값), Light (`.light` class)
- **CSS Variables**: `/src/styles.css`의 `@theme` 지시어에서 정의

### 아이콘 라이브러리
- **Library**: `hugeicons-react` v0.3.0
- **Mapping Layer**: `/src/lib/icons.ts` (207개 아이콘 매핑)
- **Import Pattern**: `import { X, Check } from "@/lib/icons"`
- **Custom Sizes**: `sm: 16px`, `md: 20px`, `lg: 24px`, `xl: 32px`

### 새로운 컴포넌트 추가

```bash
# shadcn 컴포넌트 생성
bunx shadcn@latest add [component-name]

# 아이콘 추가 (필요한 경우)
# 1. /src/lib/icons.ts에 매핑 추가
# 2. 컴포넌트에서 import
import { X, Check } from "@/lib/icons"

# 색상 클래스 사용
className="bg-background text-foreground border-border"
```

### 테마 전환 테스트
```bash
# 개발 모드에서 테마 토글 버튼 클릭
# 또는 DevTools Console에서:
document.documentElement.classList.toggle('light')
```

### Tauri 데스크톱 앱 기능
- **Transparency**: `rgba(0, 0, 0, 0)` 배경
- **Drag Regions**: `.tauri-drag` / `.tauri-no-drag` 클래스
- **Platform Styles**: `.is-macos`, `.is-windows`, `.is-linux`
- **Brand Animations**: `/src/assets/shimmer.css` (변경하지 말 것)

### 마이그레이션 참고
전체 마이그레이션 내용은 `/docs/shadcn-maia-migration-summary.md` 참조

---

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
