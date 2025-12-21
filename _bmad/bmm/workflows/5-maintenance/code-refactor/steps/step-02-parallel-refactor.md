---
name: 'step-02-parallel-refactor'
description: 'Execute parallel refactoring agents for each area'
thisStepFile: '_bmad/bmm/workflows/5-maintenance/code-refactor/steps/step-02-parallel-refactor.md'
nextStepFile: '_bmad/bmm/workflows/5-maintenance/code-refactor/steps/step-03-validate.md'
---

# Step 2: Parallel Refactoring

**Progress: Step 2 of 3**

---

## STEP GOAL

3개 영역(Frontend/Desktop/Server)에서 동시에 리팩토링을 수행합니다.

---

## PARALLEL AGENT EXECUTION

3개의 Task 에이전트를 **동시에** 실행합니다:

```yaml
Agent 1: Frontend Refactorer
  입력: issuesByArea.frontend
  검증: bun test
  출력: sdd-docs/audits/frontend/refactor-report.md

Agent 2: Desktop Refactorer
  입력: issuesByArea.desktop
  검증: cargo build --release
  출력: sdd-docs/audits/desktop/refactor-report.md

Agent 3: Server Refactorer
  입력: issuesByArea.server
  검증: node --check server/index.js
  출력: sdd-docs/audits/server/refactor-report.md
```

---

## AGENT PROMPT TEMPLATE

각 에이전트에 전달할 프롬프트:

```markdown
# [Area] Refactorer Agent

## 목표
주어진 이슈 목록에 따라 [area] 코드를 리팩토링합니다.

## 입력 이슈
[JSON 형식의 이슈 배열]

## 작업 규칙

### Action 타입별 처리

1. **delete_file**: 파일 삭제
   ```bash
   rm [file_path]
   ```

2. **replace_pattern**: 패턴 교체
   - 파일 읽기
   - fix.target 패턴 찾기
   - fix.replacement로 교체
   - 파일 저장

3. **extract_utility**: 유틸 함수 추출
   - 중복 코드 패턴 분석
   - 유틸 파일 생성 (src/lib/[name].ts)
   - 기존 코드를 유틸 호출로 교체

4. **add_type**: 타입 추가
   - any 타입 위치 확인
   - 문맥 분석하여 적절한 타입 추론
   - 타입 정의 파일에 추가 (필요시)
   - any를 명시적 타입으로 교체

5. **remove_log**: 로그 제거
   - console.log/warn/error 호출 찾기
   - 필수 로그 제외하고 제거

## 검증
각 이슈 처리 후 검증 명령 실행:
- Frontend: `bun test`
- Desktop: `cargo build --release`
- Server: `node --check server/index.js`

검증 실패 시:
1. 변경 롤백 (`git checkout -- [modified_files]`)
2. 실패 원인 기록
3. 다음 이슈로 진행

## 출력
처리 결과를 다음 형식으로 보고:

| Issue ID | Status | Details |
|----------|--------|---------|
| sec-001 | ✅ | JWT 하드코딩 제거 완료 |
| dead-001 | ✅ | 파일 삭제 완료 |
| type-005 | ❌ | 타입 추론 실패 - 수동 처리 필요 |
```

---

## EXECUTION FLOW

### 1. Launch Parallel Agents

```typescript
const agents = await Promise.all([
  Task({
    subagent_type: 'general-purpose',
    description: 'Frontend Refactorer',
    prompt: buildAgentPrompt('frontend', issuesByArea.frontend),
  }),
  Task({
    subagent_type: 'general-purpose',
    description: 'Desktop Refactorer',
    prompt: buildAgentPrompt('desktop', issuesByArea.desktop),
  }),
  Task({
    subagent_type: 'general-purpose',
    description: 'Server Refactorer',
    prompt: buildAgentPrompt('server', issuesByArea.server),
  }),
]);
```

### 2. Monitor Progress

각 에이전트 진행 상황 표시:

```
🔧 Frontend Refactorer 시작...
🔧 Desktop Refactorer 시작...
🔧 Server Refactorer 시작...

[Frontend] ✅ dead-001: 파일 삭제 완료
[Desktop] ✅ sec-001: JWT 하드코딩 제거
[Server] ✅ sec-002: JWT 하드코딩 제거
[Frontend] ✅ dead-002: 파일 삭제 완료
...
```

### 3. Collect Results

모든 에이전트 완료 후 결과 수집:

```typescript
interface AgentResult {
  area: string;
  success: Issue[];
  failed: Issue[];
  skipped: Issue[];
  verificationPassed: boolean;
}
```

---

## VERIFICATION COMMANDS

### Frontend
```bash
bun test
```

### Desktop
```bash
cargo build --release 2>&1 | head -50
```

### Server
```bash
node --check server/index.js
```

---

## ERROR HANDLING

### 이슈별 실패 처리

```typescript
try {
  await processIssue(issue);
  await verify(area);
  results.success.push(issue);
} catch (error) {
  // 변경 롤백
  await exec(`git checkout -- ${issue.file}`);
  results.failed.push({ ...issue, error: error.message });
}
```

### 영역 전체 실패 처리

검증 명령이 계속 실패하면:
1. 해당 영역의 모든 변경 롤백
2. 다른 영역은 계속 진행
3. 실패 원인 상세 기록

---

## OUTPUT

각 에이전트의 결과를 수집하여 다음 단계로 전달:

```typescript
{
  frontend: AgentResult,
  desktop: AgentResult,
  server: AgentResult,
  totalSuccess: number,
  totalFailed: number,
}
```

---

## AREA REPORT TEMPLATE

각 영역별 `refactor-report.md` 생성:

```markdown
# [Area] Refactor Report

**Date:** [현재 날짜]
**Priority:** [선택된 우선순위]

## Summary

| Status | Count |
|--------|-------|
| ✅ Success | N |
| ❌ Failed | N |
| ⏭️ Skipped | N |

## Processed Issues

| ID | Type | Title | Status | Details |
|----|------|-------|--------|---------|
| sec-001 | security | JWT 하드코딩 | ✅ | 환경변수 필수화 |
| dead-001 | dead_code | Orphaned file | ✅ | 삭제됨 |

## Failed Issues (Manual Action Required)

| ID | Type | Title | Reason |
|----|------|-------|--------|
| type-005 | type_safety | any 타입 | 타입 추론 실패 |

## Verification Result

`[검증 명령]` 실행 결과: ✅ PASS / ❌ FAIL
```

---

## DISPLAY

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 Step 2: 병렬 리팩토링 완료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 결과 요약:

| 영역 | 성공 | 실패 | 검증 |
|------|------|------|------|
| Frontend | N | N | ✅/❌ |
| Desktop | N | N | ✅/❌ |
| Server | N | N | ✅/❌ |
| **전체** | **N** | **N** | - |

📁 생성된 파일:
  - sdd-docs/audits/frontend/refactor-report.md
  - sdd-docs/audits/desktop/refactor-report.md
  - sdd-docs/audits/server/refactor-report.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Step 3: 최종 검증 및 보고서 생성...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## NEXT STEP

→ LOAD: `_bmad/bmm/workflows/5-maintenance/code-refactor/steps/step-03-validate.md`
