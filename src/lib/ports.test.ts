/**
 * Port utilities test
 * Run: bun test src/lib/ports.test.ts
 */

import { describe, it, expect } from "bun:test";
import { getAppPort, projectIdToNumber, getPortForProject } from './ports';

describe('getAppPort', () => {
  it('기본 포트 계산', () => {
    expect(getAppPort(0)).toBe(32100);
    expect(getAppPort(1)).toBe(32101);
    expect(getAppPort(100)).toBe(32200);
    expect(getAppPort(9999)).toBe(42099);
  });

  it('모듈러 연산 (10000 이상)', () => {
    expect(getAppPort(10000)).toBe(32100);
    expect(getAppPort(10001)).toBe(32101);
  });

  it('포트 범위 확인 (32100-42099)', () => {
    for (let i = 0; i < 100; i++) {
      const port = getAppPort(Math.floor(Math.random() * 100000));
      expect(port).toBeGreaterThanOrEqual(32100);
      expect(port).toBeLessThanOrEqual(42099);
    }
  });
});

describe('projectIdToNumber', () => {
  it('동일 문자열은 동일 해시 생성', () => {
    const hash1 = projectIdToNumber('test-project');
    const hash2 = projectIdToNumber('test-project');
    expect(hash1).toBe(hash2);
  });

  it('다른 문자열은 다른 해시 생성', () => {
    const hash1 = projectIdToNumber('test-project');
    const hash2 = projectIdToNumber('different-project');
    expect(hash1).not.toBe(hash2);
  });

  it('항상 양수 반환', () => {
    const hash = projectIdToNumber('negative-test-string-with-special-chars-!@#$%');
    expect(hash).toBeGreaterThanOrEqual(0);
  });
});

describe('getPortForProject', () => {
  it('동일 프로젝트 경로는 동일 포트 반환', () => {
    const port1 = getPortForProject('/Users/cosmos/projects/my-app');
    const port2 = getPortForProject('/Users/cosmos/projects/my-app');
    expect(port1).toBe(port2);
  });

  it('포트가 유효 범위 내', () => {
    const port = getPortForProject('/Users/cosmos/projects/my-app');
    expect(port).toBeGreaterThanOrEqual(32100);
    expect(port).toBeLessThanOrEqual(42099);
  });

  it('일관성 테스트 - 여러 번 호출해도 같은 결과', () => {
    const testPaths = [
      '/home/user/projects/react-app',
      '/home/user/projects/next-app',
      '/home/user/projects/vue-app',
      'C:\\Users\\dev\\projects\\my-project',
      '/Users/cosmos/Documents/develop/3/anyon-claude',
    ];

    for (const path of testPaths) {
      const p1 = getPortForProject(path);
      const p2 = getPortForProject(path);
      const p3 = getPortForProject(path);
      expect(p1).toBe(p2);
      expect(p2).toBe(p3);
    }
  });
});
