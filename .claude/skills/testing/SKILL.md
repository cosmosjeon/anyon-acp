---
name: testing
description: 버그 수정 시 테스트 기반 개발 워크플로우. 사용자가 (1) 버그 수정을 요청하거나, (2) "버그", "fix", "수정" 키워드를 사용하거나, (3) 테스트 작성을 요청할 때 활성화.
---

# Testing Skill - Test on Bug 워크플로우

이 프로젝트는 **Test on Bug** 전략을 사용합니다.

## 핵심 원칙

| 상황 | 테스트 | 이유 |
|------|--------|------|
| 버그 수정 | ✅ 필수 | 재발 방지 |
| 복잡한 순수 함수 | ✅ 권장 | 신뢰성 확보 |
| 인증/보안 로직 | ✅ 필수 | 보안 이슈 방지 |
| UI 컴포넌트 | ❌ 스킵 | 수동 테스트가 효율적 |
| 빠르게 바뀌는 기능 | ❌ 스킵 | 유지보수 비용 |

## 버그 수정 워크플로우

### 1. 테스트 먼저 작성
```typescript
import { describe, it, expect } from "bun:test";

describe('버그 수정', () => {
  it('버그 #123 - 빈 입력 처리', () => {
    // 버그를 재현하는 코드
    expect(buggyFunction('')).not.toThrow();
  });
});
```

### 2. 테스트 실패 확인
```bash
bun test  # 빨간불 확인
```

### 3. 버그 수정
최소한의 코드로 버그만 수정

### 4. 테스트 통과 확인
```bash
bun test  # 초록불 확인
```

### 5. 커밋
```bash
git add . && git commit -m "fix: 버그 #123 수정"
```

## 테스트 파일 위치

소스 파일 옆에 `*.test.ts` 형식으로 배치:

```
src/
├── lib/
│   ├── ports.ts
│   └── ports.test.ts      ← 여기
├── utils/
│   ├── hash.ts
│   └── hash.test.ts       ← 여기
```

## 테스트 명령어

```bash
bun test              # 전체 테스트
bun test --watch      # 파일 변경 감지
bun test src/lib      # 특정 폴더만
```

## 참조

- `references/test-patterns.md` - 자주 사용하는 테스트 패턴
