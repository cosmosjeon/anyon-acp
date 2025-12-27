---
name: 'step-01-parallel-scan'
description: 'Launch 3 parallel agents for quick code scan'
nextStepFile: '_bmad/bmm/workflows/5-maintenance/quick-audit/steps/step-02-summarize.md'
---

# Step 1: Parallel Quick Scan

**Progress: Step 1 of 2**

---

## STEP GOAL

3개 에이전트를 병렬로 실행해서 숫자 기반 빠른 스캔 수행

---

## CRITICAL: PARALLEL EXECUTION

**단일 메시지에서 3개 Task 툴을 동시에 호출하세요.**

---

## AGENT DEFINITIONS

### Agent 1: Frontend Scanner

```yaml
subagent_type: general-purpose
model: haiku
description: "Quick scan Frontend"
prompt: |
  빠른 코드 스캔을 수행하세요. **숫자만 세면 됩니다.**

  **Scope**: src/**/*.{ts,tsx}

  **Count these only**:
  1. console.log 개수
  2. any 타입 개수
  3. 50줄 이상 함수 개수 (함수명 목록)
  4. 500줄 이상 파일 개수 (파일명 목록)

  **Output format** (이 형식 그대로):
  ```
  ## Frontend Quick Scan

  | Metric | Count |
  |--------|-------|
  | console.log | N |
  | any types | N |
  | Large functions (50+) | N |
  | Large files (500+) | N |

  ### Large Functions (50+ lines)
  - file.ts:functionName (N lines)

  ### Large Files (500+ lines)
  - file.ts (N lines)
  ```

  간단히 숫자만 세세요. 상세 분석 불필요.
```

### Agent 2: Desktop Scanner

```yaml
subagent_type: general-purpose
model: haiku
description: "Quick scan Desktop"
prompt: |
  빠른 코드 스캔을 수행하세요. **숫자만 세면 됩니다.**

  **Scope**: src-tauri/src/**/*.rs

  **Count these only**:
  1. unwrap() 개수
  2. expect() 개수
  3. 50줄 이상 함수 개수 (함수명 목록)
  4. 500줄 이상 파일 개수 (파일명 목록)

  **Output format** (이 형식 그대로):
  ```
  ## Desktop Quick Scan

  | Metric | Count |
  |--------|-------|
  | unwrap() | N |
  | expect() | N |
  | Large functions (50+) | N |
  | Large files (500+) | N |

  ### Large Functions (50+ lines)
  - file.rs:function_name (N lines)

  ### Large Files (500+ lines)
  - file.rs (N lines)
  ```

  간단히 숫자만 세세요. 상세 분석 불필요.
```

### Agent 3: Server Scanner

```yaml
subagent_type: general-purpose
model: haiku
description: "Quick scan Server"
prompt: |
  빠른 코드 스캔을 수행하세요. **숫자만 세면 됩니다.**

  **Scope**: server/**/*.{js,ts}

  **Count these only**:
  1. console.log 개수
  2. 하드코딩 시크릿 (API_KEY, PASSWORD, SECRET 패턴)
  3. 50줄 이상 함수 개수 (함수명 목록)
  4. 500줄 이상 파일 개수 (파일명 목록)

  **Output format** (이 형식 그대로):
  ```
  ## Server Quick Scan

  | Metric | Count |
  |--------|-------|
  | console.log | N |
  | Hardcoded secrets | N |
  | Large functions (50+) | N |
  | Large files (500+) | N |

  ### Large Functions (50+ lines)
  - file.ts:functionName (N lines)

  ### Large Files (500+ lines)
  - file.ts (N lines)

  ### Potential Secrets (if any)
  - file.ts:line - pattern found
  ```

  간단히 숫자만 세세요. 상세 분석 불필요.
```

---

## EXECUTION

**Launch all 3 agents NOW in a single message.**

---

## AFTER COMPLETION

모든 에이전트 완료 후:

```
→ LOAD: @_bmad/bmm/workflows/5-maintenance/quick-audit/steps/step-02-summarize.md
```
