# Refactor Tasks Reference

> 이슈 타입별 리팩토링 작업 처리 방법 정의

---

## Action Type Handlers

### 1. delete_file

**설명**: 불필요한 파일 삭제 (Dead Code, Orphaned Files)

**처리 방법**:
```bash
rm [file_path]
```

**예시**:
```json
{
  "action": "delete_file",
  "file": "src/components/ClaudeCodeSession.refactored.tsx"
}
```

**검증**: 파일이 삭제되었는지 확인

---

### 2. replace_pattern

**설명**: 코드 내 특정 패턴을 다른 패턴으로 교체

**처리 방법**:
1. 파일 읽기
2. `fix.target` 패턴 검색
3. `fix.replacement`로 교체
4. 파일 저장

**예시**:
```json
{
  "action": "replace_pattern",
  "file": "src-tauri/src/main.rs",
  "line": 262,
  "fix": {
    "type": "replace",
    "target": "unwrap_or_else(|_| \"dev-secret-key-change-in-production\".to_string())",
    "replacement": "expect(\"JWT_SECRET environment variable must be set\")"
  }
}
```

**주의사항**:
- 라인 번호가 있으면 해당 라인 근처에서 검색
- 정확한 매칭 필요 (공백 포함)
- 교체 전 백업 권장

---

### 3. extract_utility

**설명**: 중복 코드를 유틸리티 함수로 추출

**처리 방법**:
1. 중복 코드 패턴 분석
2. 유틸 파일 생성 또는 기존 파일에 추가
3. 함수 정의 작성
4. 원본 코드를 함수 호출로 교체

**예시**:
```json
{
  "action": "extract_utility",
  "type": "duplication",
  "description": "content 추출 로직 중복",
  "fix": {
    "type": "create",
    "target": "src/lib/contentUtils.ts",
    "replacement": "extractResultContent 함수 생성"
  },
  "locations": [
    "src/components/Widget1.tsx:45",
    "src/components/Widget2.tsx:78",
    "src/components/Widget3.tsx:123"
  ]
}
```

**TypeScript 유틸 템플릿**:
```typescript
// src/lib/[utilName].ts

/**
 * [함수 설명]
 */
export function [functionName]([params]): [returnType] {
  // 추출된 로직
}
```

**교체 패턴**:
```typescript
// Before
const content = result.text_content || result.tool_result || JSON.stringify(result);

// After
import { extractResultContent } from '@/lib/contentUtils';
const content = extractResultContent(result);
```

---

### 4. add_type

**설명**: any 타입을 명시적 타입으로 교체

**처리 방법**:
1. any 타입 위치 확인
2. 변수/매개변수 사용 패턴 분석
3. 적절한 타입 추론
4. 타입 정의 추가 (필요시)
5. any를 명시적 타입으로 교체

**예시**:
```json
{
  "action": "add_type",
  "file": "src/components/ToolWidgets.tsx",
  "line": 156,
  "description": "result 매개변수 any 타입",
  "fix": {
    "type": "replace",
    "target": "result: any",
    "replacement": "result: ToolResult"
  }
}
```

**타입 추론 전략**:

| 패턴 | 추론 타입 |
|------|----------|
| `data.id`, `data.name` | Object with known keys |
| `items.map()` | Array type |
| `async function` return | Promise type |
| Event handler | React event types |

**타입 정의 파일 템플릿**:
```typescript
// src/types/[domain].ts

export interface [TypeName] {
  [property]: [type];
}
```

---

### 5. remove_log

**설명**: 불필요한 console.log 호출 제거

**처리 방법**:
1. console.log/warn/error/debug 호출 검색
2. 필수 로그 여부 판단
3. 불필요한 로그 제거

**제거 대상**:
```typescript
console.log('debug');
console.log('test');
console.log(variable);
console.log('Processing:', data);
```

**유지 대상**:
```typescript
console.error('Critical error:', error); // 에러 로깅
console.warn('Deprecation warning');      // 경고
```

**예시**:
```json
{
  "action": "remove_log",
  "file": "src/components/Session.tsx",
  "description": "650개 console.log 호출 중 불필요한 것 제거"
}
```

**판단 기준**:
- 디버그 목적 로그 → 제거
- 에러 핸들링 로그 → 유지
- 사용자 피드백 로그 → 유지

---

## Non-Automatable Actions

다음 액션들은 자동화하지 않고 별도 워크플로우나 수동 처리가 필요합니다.

### split_file

**설명**: 큰 파일을 여러 파일로 분할

**별도 워크플로우**: `/split-widgets`, `/split-api`

**이유**:
- 파일 구조 변경이 광범위함
- import/export 관계 재정립 필요
- 사용자 검토 필수

### refactor_function

**설명**: 긴 함수를 여러 함수로 분할

**처리**: 수동 리팩토링

**이유**:
- 로직 분리 기준이 문맥 의존적
- 변수 스코프 관리 복잡
- 테스트 케이스 재작성 필요

---

## Priority Guidelines

| Priority | 자동화 권장 | 수동 권장 |
|----------|------------|----------|
| P0 | delete_file, replace_pattern | - |
| P1 | add_type, remove_log, extract_utility | split_file |
| P2 | - | refactor_function, 구조 변경 |

---

## Error Handling

### 패턴 매칭 실패
```
❌ 패턴을 찾을 수 없음: [target]
   파일: [file]
   라인: [line]

💡 가능한 원인:
   - 코드가 이미 수정됨
   - 라인 번호가 변경됨
   - 공백/포맷팅 차이

→ 수동 처리 필요
```

### 타입 추론 실패
```
❌ 타입 추론 실패: [variable]
   파일: [file]
   라인: [line]

💡 가능한 원인:
   - 복잡한 제네릭 타입
   - 외부 라이브러리 타입
   - 동적 타입 패턴

→ 수동 타입 정의 필요
```

### 검증 실패
```
❌ 검증 실패: [command]
   에러: [error message]

💡 조치:
   1. 변경 롤백됨
   2. 다음 이슈로 진행
   3. 실패 이슈 수동 처리 필요
```
