---
description: 'BMAD 스타일 코드 리팩토링 워크플로우 (감사 결과 기반 자동 수정)'
---

# Code Refactor Workflow

IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @_bmad/bmm/workflows/5-maintenance/code-refactor/workflow.md, READ its entire contents and follow its directions exactly!

## Quick Reference

**전제 조건**: `/code-audit` 실행 완료
**입력**: `sdd-docs/audits/audit-result.json`
**실행 방식**: 3단계 순차 실행 + 병렬 에이전트
**예상 시간**: 5-10분

## 워크플로우 단계

1. **우선순위 선택** - P0/P1/P2 중 처리 범위 선택
2. **병렬 리팩토링** - Frontend/Desktop/Server 동시 처리
3. **검증 및 커밋** - 테스트/빌드 확인 후 커밋

## 자동화 가능 작업

| Action | 설명 | 예시 |
|--------|------|------|
| `delete_file` | 파일 삭제 | Dead Code 제거 |
| `replace_pattern` | 패턴 교체 | JWT 하드코딩 수정 |
| `extract_utility` | 유틸 추출 | 중복 코드 통합 |
| `add_type` | 타입 추가 | any 타입 제거 |
| `remove_log` | 로그 제거 | console.log 정리 |

## 자동화 불가 (별도 워크플로우)

- `split_file` → `/split-widgets`, `/split-api`
- `refactor_function` → 수동 리팩토링

## 안전장치

- 작업 전 롤백 포인트 생성 (`git stash`)
- 각 단계마다 검증 (테스트/빌드)
- 실패 시 자동 롤백

## 워크플로우 시작

→ LOAD: @_bmad/bmm/workflows/5-maintenance/code-refactor/workflow.md
