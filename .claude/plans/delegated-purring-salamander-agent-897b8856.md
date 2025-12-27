# PM-Executor와 PM-Reviewer 자동 순환 실행 계획

## 개요

pm-executor와 pm-reviewer를 번갈아가며 자동 실행하는 시스템을 설계합니다. pm-orchestrator에서 사용한 신호 파일 기반 트리거 패턴을 확장하여 구현합니다.

## 현재 상황 분석

### 기존 구조
1. **pm-orchestrator** (Step 6, line 1064-1102):
   - Epic과 티켓 생성 완료 후 `.pm-executor-trigger` 파일 생성
   - 사용자에게 `/anyon:anyon-method:workflows:pm-executor` 실행 안내

2. **pm-executor** (Step 8, line 814-838):
   - Epic 완료 후 사용자에게 `/pm-reviewer` 실행 안내
   - Progress 파일에 진행 상황 저장
   - 다음 Epic이 있으면 `/pm-executor` 재실행 안내

3. **pm-reviewer** (Step 6, line 404-447):
   - 리뷰 및 수정 완료 후 "다음 에픽을 실행하세요!" 메시지만 출력
   - 자동 트리거 없음

### 문제점
- pm-executor와 pm-reviewer 사이에 자동 순환이 없음
- 사용자가 수동으로 워크플로우를 호출해야 함
- 전체 프로젝트 자동화가 중단됨

## 설계 원칙

### 1. 신호 파일 기반 트리거
- pm-orchestrator와 동일한 패턴 사용
- 각 워크플로우 완료 시 신호 파일 생성
- 신호 파일에 메타데이터 포함 (타임스탬프, Epic ID, 상태)

### 2. 무한 루프 방지
- Progress 파일의 Epic 진행 상황 체크
- 모든 Epic 완료 시 순환 종료
- 연속 실패 카운트로 비정상 종료 방지

### 3. 상태 추적
- Progress 파일에 현재 워크플로우 상태 기록
- 어느 워크플로우가 마지막으로 실행되었는지 추적
- 재시작 시 올바른 워크플로우부터 재개

## 구현 계획

### Phase 1: 신호 파일 구조 설계

#### 신호 파일 위치
```
{project-root}/anyon-docs/conversation/.pm-executor-trigger
{project-root}/anyon-docs/conversation/.pm-reviewer-trigger
```

#### 신호 파일 내용 (YAML 형식)
```yaml
trigger: pm-executor  # 또는 pm-reviewer
timestamp: 2024-11-29T10:30:00Z
epic_id: E01
epic_name: "인증 시스템"
status: completed  # 또는 blocked, failed
trigger_source: pm-orchestrator  # 또는 pm-executor, pm-reviewer
metadata:
  completed_tickets: 5
  blocked_tickets: 0
  total_epics: 6
  current_epic_index: 1
```

### Phase 2: pm-executor Step 8 수정

#### 수정 위치
파일: `/Users/cosmos/Documents/npm/anyon_agents/.anyon/anyon-method/workflows/pm-executor/instructions.md`
Step: 8 (Epic 완료 및 컨텍스트 저장)
라인: 813-844

#### 추가할 코드 (Step 8 마지막, line 838 이후)

```xml
<action>신호 파일 생성 및 pm-reviewer 자동 트리거:

1️⃣ **신호 파일 생성**:
```bash
mkdir -p {project-root}/anyon-docs/conversation
cat > {project-root}/anyon-docs/conversation/.pm-reviewer-trigger << EOF
trigger: pm-reviewer
timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
epic_id: {{current_epic}}
epic_name: "{{epic_name}}"
status: completed
trigger_source: pm-executor
metadata:
  completed_tickets: {{completed_count}}
  blocked_tickets: {{blocked_count}}
  total_epics: {{total_epics}}
  current_epic_index: {{current_epic_index}}
  next_epic: {{next_epic}}
EOF
```

2️⃣ **Progress 파일에 트리거 상태 기록**:
```markdown
## Workflow Trigger State
- Last completed workflow: pm-executor
- Triggered workflow: pm-reviewer
- Trigger timestamp: {{timestamp}}
- Trigger file: .pm-reviewer-trigger
```

3️⃣ **pm-reviewer 자동 호출** (SlashCommand 사용):
이 워크플로우 완료 후, 다음 명령으로 pm-reviewer를 자동 실행:
```
/anyon:anyon-method:workflows:pm-reviewer
```

이를 통해:
- Epic 완료 후 즉시 코드 리뷰 시작
- 리뷰 결과에 따라 자동 수정
- 수정 완료 후 다음 Epic으로 진행
</action>

<action>세션 종료 메시지 수정 (기존 line 814-838 대체):
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 {{current_epic}} 완료! 자동으로 리뷰를 시작합니다...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 결과: {{completed_count}} 완료 / {{blocked_count}} blocked

📁 저장 완료:
   • 진행 상황: {progress_file}
   • 프로젝트 컨텍스트: CLAUDE.md
   • 리뷰 트리거: .pm-reviewer-trigger

🔄 다음 단계:
   ✓ 신호 파일 생성 완료
   ▶ pm-reviewer 자동 실행 중...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</action>
```

#### 코드 위치 상세
- **삽입 위치**: Step 8의 `<check if="next_epic exists">` 블록 내부
- **기존 라인 814-838**: 메시지 출력 부분을 위 내용으로 교체
- **중요**: "🎉 {{current_epic}} 완료했습니다!" 메시지는 유지하되, 이후 자동 트리거 로직 추가

### Phase 3: pm-reviewer Step 6 수정

#### 수정 위치
파일: `/Users/cosmos/Documents/npm/anyon_agents/.anyon/anyon-method/workflows/pm-reviewer/instructions.md`
Step: 6 (결과 출력)
라인: 404-447

#### 추가할 코드 (Step 6 마지막, line 447 이후)

```xml
<action>다음 워크플로우 결정 및 신호 파일 생성:

<check if="Progress 파일에서 next_epic 존재">
  1️⃣ **신호 파일 생성 - pm-executor 트리거**:
  ```bash
  cat > {project-root}/anyon-docs/conversation/.pm-executor-trigger << EOF
  trigger: pm-executor
  timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
  epic_id: {{next_epic}}
  epic_name: "{{next_epic_name}}"
  status: ready
  trigger_source: pm-reviewer
  metadata:
    previous_epic: {{current_epic}}
    review_fixed_issues: {{fixed_count}}
    review_manual_issues: {{manual_count}}
    total_epics: {{total_epics}}
    next_epic_index: {{next_epic_index}}
  EOF
  ```

  2️⃣ **Progress 파일에 트리거 상태 기록**:
  ```markdown
  ## Workflow Trigger State
  - Last completed workflow: pm-reviewer
  - Triggered workflow: pm-executor
  - Trigger timestamp: {{timestamp}}
  - Trigger file: .pm-executor-trigger
  - Next Epic: {{next_epic}}
  ```

  3️⃣ **pm-executor 자동 호출**:
  ```
  /anyon:anyon-method:workflows:pm-executor
  ```

  4️⃣ **메시지 출력**:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ {{current_epic}} 리뷰 완료! 다음 에픽을 시작합니다...
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🔧 수정: {{fixed_count}}개
  ✋ 수동 필요: {{manual_count}}개

  📁 저장 완료:
     • 리뷰 결과: {progress_file}
     • 실행 트리거: .pm-executor-trigger

  🔄 다음 단계:
     ✓ 신호 파일 생성 완료
     ▶ {{next_epic}} - {{next_epic_name}} 자동 실행 중...

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```
</check>

<check if="Progress 파일에서 next_epic 없음 (모든 Epic 완료)">
  1️⃣ **최종 완료 메시지**:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎊 전체 프로젝트 구현 완료!
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📊 최종 결과:
     • 완료된 Epic: {{total_epics}}개
     • 완료된 티켓: {{total_completed_tickets}}개
     • 성공률: {{success_rate}}%

  🔧 리뷰 수정: {{total_fixed_issues}}개

  ✅ 모든 Epic이 완료되었습니다!

  🚀 다음 단계:
     1. 전체 테스트 실행
     2. 프로덕션 빌드 검증
     3. 배포 준비

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

  2️⃣ **신호 파일 삭제 (순환 종료)**:
  ```bash
  rm -f {project-root}/anyon-docs/conversation/.pm-executor-trigger
  rm -f {project-root}/anyon-docs/conversation/.pm-reviewer-trigger
  ```

  3️⃣ **Progress 파일 최종 마크**:
  ```markdown
  ## Final Status
  - Status: ✅ PROJECT COMPLETED
  - Completion timestamp: {{timestamp}}
  - All workflows terminated: true
  ```
</check>
</action>
```

#### 코드 위치 상세
- **삽입 위치**: Step 6의 마지막, line 447 이후
- **기존 "이제 다음 에픽을 실행하세요!" 메시지**: 삭제하고 위 로직으로 교체
- **중요**: Progress 파일에서 next_epic 유무를 반드시 체크

### Phase 4: Progress 파일 구조 확장

#### Progress 파일 위치
`{project-root}/anyon-docs/conversation/execution-progress.md`

#### 추가할 섹션 (기존 Progress 파일에 추가)

```markdown
## Workflow Orchestration State

### Current Workflow
- Active workflow: pm-executor | pm-reviewer | none
- Last completed: {{workflow_name}}
- Next scheduled: {{next_workflow_name}}

### Trigger Chain
- Chain status: active | paused | completed
- Total cycles: {{cycle_count}}
- Current cycle: {{current_cycle}}

### Epic Progress
- Total Epics: {{total_epics}}
- Completed Epics: {{completed_epics_count}}
- Current Epic: {{current_epic}} ({{current_epic_index}}/{{total_epics}})
- Next Epic: {{next_epic}}
- Remaining Epics: {{remaining_epics}}

### Safety Checks
- Consecutive failures: {{consecutive_failures}} / 5
- Last success timestamp: {{last_success_timestamp}}
- Emergency stop triggered: false

### Trigger Files
- .pm-executor-trigger: {{exists_or_not}}
- .pm-reviewer-trigger: {{exists_or_not}}
- Last trigger source: {{trigger_source}}
- Last trigger timestamp: {{trigger_timestamp}}
```

### Phase 5: 무한 루프 방지 메커니즘

#### pm-executor Step 1 수정 (안전 체크)

파일: `/Users/cosmos/Documents/npm/anyon_agents/.anyon/anyon-method/workflows/pm-executor/instructions.md`
Step: 1 (실행 환경 검증 및 자율 실행 준비)
라인: 205-277

**추가할 코드 (Step 1 시작 부분, line 236 이후):**

```xml
<action>무한 루프 방지 안전 체크:

1. **Progress 파일에서 Epic 진행 상황 확인**:
```yaml
total_epics: 6
completed_epics: ["E01", "E02", "E03"]
current_epic: "E04"
next_epic: "E05"
```

2. **모든 Epic 완료 여부 체크**:
```
if completed_epics.length >= total_epics:
  → 모든 Epic 완료
  → 워크플로우 종료
  → 신호 파일 삭제
  → 최종 완료 메시지 출력
  → STOP
```

3. **연속 실패 카운트 체크**:
```
if consecutive_failures >= 5:
  → 비정상 상황 감지
  → 긴급 중단
  → 사용자에게 수동 개입 요청
  → STOP
```

4. **트리거 파일 유효성 검증**:
```bash
# .pm-executor-trigger 파일이 있는지 확인
if [ -f {project-root}/anyon-docs/conversation/.pm-executor-trigger ]; then
  # 파일 내용 파싱
  trigger_epic=$(grep 'epic_id:' .pm-executor-trigger | cut -d' ' -f2)
  
  # Epic ID가 유효한지 확인
  if [ "$trigger_epic" != "{{current_epic}}" ]; then
    echo "⚠️ Warning: Trigger file Epic mismatch"
    echo "Expected: {{current_epic}}, Got: $trigger_epic"
  fi
fi
```

5. **안전 체크 통과 메시지**:
```
✅ 안전 체크 통과:
   • Epic 진행 상황 정상
   • 연속 실패 카운트: {{consecutive_failures}}/5
   • 트리거 파일 유효
   • 실행 재개 가능
```
</action>
```

#### pm-reviewer Step 1 수정 (동일한 안전 체크)

파일: `/Users/cosmos/Documents/npm/anyon_agents/.anyon/anyon-method/workflows/pm-reviewer/instructions.md`
Step: 1 (리뷰 대상 파악)
라인: 38-88

**추가할 코드 (Step 1 시작 부분, line 40 이후):**

```xml
<action>무한 루프 방지 안전 체크:

(pm-executor Step 1과 동일한 안전 체크 로직)

추가 체크:
1. **트리거 파일 검증**:
```bash
# .pm-reviewer-trigger 파일이 있는지 확인
if [ ! -f {project-root}/anyon-docs/conversation/.pm-reviewer-trigger ]; then
  echo "❌ 트리거 파일이 없습니다."
  echo "이 워크플로우는 pm-executor 완료 후 자동으로 실행되어야 합니다."
  exit 1
fi
```

2. **Epic 완료 상태 확인**:
```
# Progress 파일에서 마지막 완료 Epic 확인
last_completed_epic=$(grep 'current_epic:' {progress_file} | cut -d':' -f2)

# pm-executor가 실제로 Epic을 완료했는지 확인
if [ -z "$last_completed_epic" ]; then
  echo "❌ 완료된 Epic이 없습니다."
  echo "먼저 pm-executor를 실행하세요."
  exit 1
fi
```
</action>
```

### Phase 6: 워크플로우 실행 흐름도

```
┌─────────────────────────────────────────────────────────┐
│                    pm-orchestrator                      │
│  (Epic 및 티켓 생성)                                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
         생성: .pm-executor-trigger
         자동 호출: /pm-executor
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│                     pm-executor                        │
│  (Epic 구현: E01)                                      │
│  - 티켓 실행                                           │
│  - TDD 개발                                            │
│  - 자동 수정                                           │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
         생성: .pm-reviewer-trigger
         자동 호출: /pm-reviewer
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│                    pm-reviewer                         │
│  (E01 리뷰 및 수정)                                    │
│  - 코드 품질 리뷰                                      │
│  - 보안 리뷰                                           │
│  - 자동 수정                                           │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
        Progress 파일 체크:
        next_epic 있음?
                 │
         ┌───────┴───────┐
         │               │
        YES              NO
         │               │
         ▼               ▼
  생성: .pm-executor-trigger    최종 완료 메시지
  자동 호출: /pm-executor       신호 파일 삭제
         │                      종료
         ▼
┌────────────────────────────────────────────────────────┐
│                  pm-executor                           │
│  (다음 Epic: E02)                                      │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
              (반복)
                 │
                 ▼
        E01 → E02 → E03 → ... → E06
         ↓     ↓     ↓          ↓
      리뷰   리뷰   리뷰   ...  리뷰
                                 │
                                 ▼
                            프로젝트 완료
```

### Phase 7: 에러 처리 및 복구

#### pm-executor 에러 처리

```xml
<action>에러 발생 시 처리:

1. **Epic 실행 중 에러**:
   - blocked 티켓 카운트 증가
   - Progress 파일에 에러 기록
   - 여전히 pm-reviewer 트리거 생성 (리뷰는 진행)

2. **연속 Epic 실패**:
   - consecutive_failures 카운트 증가
   - 5회 연속 실패 시:
     * 신호 파일 삭제
     * 긴급 중단 메시지
     * 사용자 개입 요청

3. **복구 메커니즘**:
   - Progress 파일 읽어서 마지막 성공 Epic 확인
   - 실패한 Epic부터 재시작
   - blocked 티켓 재시도 큐에 추가
```

#### pm-reviewer 에러 처리

```xml
<action>에러 발생 시 처리:

1. **리뷰 중 에러**:
   - 수정 가능한 이슈만 수정
   - 수정 실패 이슈는 manual_required로 분류
   - 여전히 pm-executor 트리거 생성 (다음 Epic 진행)

2. **수정 실패**:
   - failed_issues에 기록
   - Progress 파일에 수동 확인 필요 표시
   - 다음 Epic으로 진행 (FAIL_FORWARD)

3. **복구 메커니즘**:
   - 다음 Epic에서 이전 Epic의 failed_issues 체크
   - 재시도 가능한 수정 재시도
```

### Phase 8: 테스트 시나리오

#### 시나리오 1: 정상 실행 (6개 Epic)
```
pm-orchestrator
  → .pm-executor-trigger 생성
  → pm-executor (E01) 실행
    → .pm-reviewer-trigger 생성
    → pm-reviewer (E01) 실행
      → .pm-executor-trigger 생성
      → pm-executor (E02) 실행
        → .pm-reviewer-trigger 생성
        → pm-reviewer (E02) 실행
          → ... (E03, E04, E05)
            → pm-executor (E06) 실행
              → .pm-reviewer-trigger 생성
              → pm-reviewer (E06) 실행
                → 모든 Epic 완료
                → 신호 파일 삭제
                → 프로젝트 완료 메시지
                → 종료
```

#### 시나리오 2: 중간 에러 발생
```
pm-executor (E03) 실행
  → 5개 티켓 중 2개 blocked
  → .pm-reviewer-trigger 생성
  → pm-reviewer (E03) 실행
    → 리뷰 완료
    → .pm-executor-trigger 생성
    → pm-executor (E04) 실행
      → 정상 진행
      → E03의 blocked 티켓은 나중에 재시도
```

#### 시나리오 3: 연속 실패 (긴급 중단)
```
pm-executor (E01) 실행 → 전체 실패
pm-reviewer (E01) 실행 → 수정 불가
pm-executor (E02) 실행 → 전체 실패
pm-reviewer (E02) 실행 → 수정 불가
pm-executor (E03) 실행 → 전체 실패
pm-reviewer (E03) 실행 → 수정 불가
pm-executor (E04) 실행 → 전체 실패
pm-reviewer (E04) 실행 → 수정 불가
pm-executor (E05) 실행 → 전체 실패
  → consecutive_failures = 5
  → 긴급 중단
  → 신호 파일 삭제
  → 사용자 개입 요청
  → 종료
```

## 구현 우선순위

### Priority 1: 핵심 순환 로직
1. pm-executor Step 8 수정 (신호 파일 생성 + pm-reviewer 호출)
2. pm-reviewer Step 6 수정 (신호 파일 생성 + pm-executor 호출)
3. Progress 파일 구조 확장

### Priority 2: 안전 메커니즘
1. pm-executor Step 1 안전 체크
2. pm-reviewer Step 1 안전 체크
3. 무한 루프 방지 로직

### Priority 3: 에러 처리
1. Epic 완료 체크 로직
2. 연속 실패 카운트
3. 긴급 중단 메커니즘

## 검증 계획

### 검증 항목
1. 신호 파일이 올바르게 생성되는가?
2. 신호 파일 내용이 정확한가? (Epic ID, 타임스탬프 등)
3. Progress 파일이 실시간으로 업데이트되는가?
4. 모든 Epic 완료 시 순환이 종료되는가?
5. 에러 발생 시 복구가 되는가?
6. 연속 실패 시 긴급 중단이 작동하는가?

### 테스트 방법
1. 작은 프로젝트로 전체 순환 테스트 (Epic 2-3개)
2. 의도적으로 에러 발생시켜 복구 테스트
3. 연속 실패 시나리오 테스트
4. Progress 파일 수동 조작하여 재시작 테스트

## 주의사항

1. **신호 파일 타이밍**:
   - 신호 파일은 Progress 파일 업데이트 직후 생성
   - 워크플로우 호출은 신호 파일 생성 직후

2. **Progress 파일 동기화**:
   - 여러 워크플로우가 동시에 수정하지 않도록 주의
   - 읽기-수정-쓰기를 atomic하게 처리

3. **SlashCommand 호출**:
   - Claude Code의 SlashCommand tool 사용
   - 정확한 경로: `/anyon:anyon-method:workflows:pm-executor`

4. **디렉토리 생성**:
   - `anyon-docs/conversation/` 디렉토리가 없을 수 있음
   - 신호 파일 생성 전 `mkdir -p` 실행

## 향후 개선 사항

1. **병렬 Epic 실행**:
   - 독립적인 Epic은 동시 실행 가능
   - 현재는 순차 실행만 지원

2. **리뷰 스킵 옵션**:
   - 간단한 Epic은 리뷰 생략 가능
   - 설정 파일에서 리뷰 정책 정의

3. **웹 대시보드**:
   - Progress 파일 시각화
   - 실시간 진행 상황 모니터링

4. **슬랙/이메일 알림**:
   - Epic 완료 시 알림
   - 에러 발생 시 알림
   - 프로젝트 완료 시 알림

---

## Critical Files for Implementation

### 1. pm-executor instructions.md
- **경로**: `/Users/cosmos/Documents/npm/anyon_agents/.anyon/anyon-method/workflows/pm-executor/instructions.md`
- **수정 위치**: Step 8 (line 662-844)
- **변경 내용**: Epic 완료 후 `.pm-reviewer-trigger` 생성 및 pm-reviewer 자동 호출 코드 추가

### 2. pm-reviewer instructions.md
- **경로**: `/Users/cosmos/Documents/npm/anyon_agents/.anyon/anyon-method/workflows/pm-reviewer/instructions.md`
- **수정 위치**: Step 6 (line 404-449)
- **변경 내용**: 리뷰 완료 후 `.pm-executor-trigger` 생성 및 pm-executor 자동 호출 코드 추가 (또는 모든 Epic 완료 시 종료 로직)

### 3. pm-executor instructions.md (안전 체크)
- **경로**: `/Users/cosmos/Documents/npm/anyon_agents/.anyon/anyon-method/workflows/pm-executor/instructions.md`
- **수정 위치**: Step 1 (line 205-277)
- **변경 내용**: 무한 루프 방지 안전 체크 로직 추가 (Epic 진행 상황 확인, 연속 실패 카운트)

### 4. pm-reviewer instructions.md (안전 체크)
- **경로**: `/Users/cosmos/Documents/npm/anyon_agents/.anyon/anyon-method/workflows/pm-reviewer/instructions.md`
- **수정 위치**: Step 1 (line 38-88)
- **변경 내용**: 무한 루프 방지 안전 체크 로직 추가 (트리거 파일 검증, Epic 완료 상태 확인)

### 5. Progress 파일 템플릿 (신규 생성 필요)
- **경로**: `/Users/cosmos/Documents/npm/anyon_agents/.anyon/anyon-method/workflows/pm-executor/templates/progress-template.md` (추천)
- **용도**: Progress 파일에 "Workflow Orchestration State" 섹션 구조 정의
- **이유**: pm-executor가 처음 실행될 때 Progress 파일에 워크플로우 오케스트레이션 상태 섹션 초기화
