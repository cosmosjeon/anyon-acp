# 테스트 패턴 레퍼런스

## 기본 구조

```typescript
import { describe, it, expect, beforeEach, afterEach } from "bun:test";

describe('모듈명', () => {
  beforeEach(() => {
    // 각 테스트 전 실행
  });

  afterEach(() => {
    // 각 테스트 후 실행
  });

  it('정상 케이스', () => {
    expect(fn('input')).toBe('expected');
  });

  it('엣지 케이스', () => {
    expect(fn('')).toBe('default');
  });
});
```

## 자주 사용하는 Matcher

```typescript
// 동등성
expect(value).toBe(expected);           // 엄격한 동등 (===)
expect(value).toEqual(expected);        // 깊은 비교

// 참/거짓
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// 숫자
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThan(5);
expect(value).toBeGreaterThanOrEqual(3);

// 문자열
expect(str).toContain('substring');
expect(str).toMatch(/regex/);

// 배열
expect(arr).toContain(item);
expect(arr).toHaveLength(3);

// 예외
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('error message');
expect(() => fn()).not.toThrow();
```

## 비동기 테스트

```typescript
it('async 함수 테스트', async () => {
  const result = await asyncFunction();
  expect(result).toBe('expected');
});

it('Promise reject 테스트', async () => {
  await expect(asyncFunction()).rejects.toThrow('error');
});
```

## Mock 함수

```typescript
import { mock } from "bun:test";

it('mock 함수 사용', () => {
  const mockFn = mock(() => 'mocked value');

  const result = mockFn('arg');

  expect(mockFn).toHaveBeenCalled();
  expect(mockFn).toHaveBeenCalledWith('arg');
  expect(result).toBe('mocked value');
});
```

## 버그 수정 테스트 템플릿

```typescript
describe('버그 수정', () => {
  it('버그 #123 - [버그 설명]', () => {
    // Given: 버그 발생 조건
    const input = '버그를 유발하는 입력';

    // When: 함수 실행
    const result = buggyFunction(input);

    // Then: 기대 결과
    expect(result).toBe('올바른 결과');
  });
});
```

## 순수 함수 테스트 패턴

```typescript
describe('calculateTotal', () => {
  it('빈 배열은 0 반환', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('단일 항목 합계', () => {
    expect(calculateTotal([{ price: 100 }])).toBe(100);
  });

  it('여러 항목 합계', () => {
    expect(calculateTotal([
      { price: 100 },
      { price: 200 },
    ])).toBe(300);
  });

  it('음수 가격 처리', () => {
    expect(calculateTotal([{ price: -100 }])).toBe(0);
  });
});
```

## 해시/포트 함수 테스트 (실제 예시)

```typescript
describe('getPortForProject', () => {
  it('동일 경로는 동일 포트', () => {
    const path = '/Users/test/project';
    expect(getPortForProject(path)).toBe(getPortForProject(path));
  });

  it('포트 범위 32100-42099', () => {
    const port = getPortForProject('/any/path');
    expect(port).toBeGreaterThanOrEqual(32100);
    expect(port).toBeLessThanOrEqual(42099);
  });
});
```
