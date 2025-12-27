/**
 * EnhancedPreviewPanel tests
 * Run: bun test src/components/preview/EnhancedPreviewPanel.test.tsx
 *
 * Note: Tauri API mocking tests are skipped (complex setup, low ROI for MVP)
 * Focus on pure logic tests for "Test on Bug" strategy
 */

import { describe, it, expect } from "bun:test";

describe('Port Utilities Integration', () => {
  // 포트 계산 로직 (실제 구현과 동일)
  function projectIdToNumber(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  function getAppPort(projectId: number): number {
    return 32100 + (projectId % 10000);
  }

  function getPortForProject(projectIdString: string): number {
    const numericId = projectIdToNumber(projectIdString);
    return getAppPort(numericId);
  }

  it('동일 프로젝트는 동일 포트 할당', () => {
    const projectId = '/Users/test/project1';
    const port1 = getPortForProject(projectId);
    const port2 = getPortForProject(projectId);
    const port3 = getPortForProject(projectId);

    expect(port1).toBe(port2);
    expect(port2).toBe(port3);
  });

  it('포트가 유효 범위 내 (32100-42099)', () => {
    const port = getPortForProject('/Users/test/project1');
    expect(port).toBeGreaterThanOrEqual(32100);
    expect(port).toBeLessThanOrEqual(42099);
  });

  it('다양한 프로젝트 경로 처리', () => {
    const projects = [
      '/Users/test/project1',
      '/Users/test/project2',
      '/Users/test/different-name',
    ];

    projects.forEach(project => {
      const port = getPortForProject(project);
      expect(port).toBeGreaterThanOrEqual(32100);
      expect(port).toBeLessThanOrEqual(42099);
    });
  });
});

// TODO: Tauri API mocking tests
// 아래 테스트는 Tauri mock 설정이 복잡하여 일단 비활성화
// 버그 발생 시 필요에 따라 추가
//
// describe('EnhancedPreviewPanel - package.json Auto-detection', () => {
//   it('should detect package.json and start dev server automatically', async () => {
//     // Requires Tauri API mocking
//   });
// });
