#!/bin/bash

# Pre-push hook for Claude Code
# [1단계] 코드 품질 검사 - Critical 이슈 발견 시 push 차단
# [2단계] 문서 동기화 - 변경된 코드 관련 sdd-docs/specs 업데이트
#
# 환경변수:
#   SKIP_AUDIT=1  - 코드 검사 스킵
#   SKIP_SYNC=1   - 문서 동기화만 스킵

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
AUDIT_RESULT="$PROJECT_ROOT/sdd-docs/audits/audit-result.json"

# 스킵 옵션
if [ "$SKIP_AUDIT" = "1" ]; then
    echo "Skipping audit (SKIP_AUDIT=1)"
    exit 0
fi

# Claude CLI 확인
if ! command -v claude &> /dev/null; then
    echo "Warning: Claude Code CLI not found, skipping audit"
    exit 0
fi

# 변경된 파일 목록 추출 (마지막 커밋만)
CHANGED_FILES=$(git diff --name-only HEAD~1 -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.rs' 2>/dev/null || echo "")

if [ -z "$CHANGED_FILES" ]; then
    echo "✅ 변경된 코드 파일이 없습니다."
    exit 0
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 코드 검사 중..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "검사 대상 파일:"
echo "$CHANGED_FILES" | sed 's/^/  📁 /'
echo ""

# Claude에게 변경 파일 분석 요청
AUDIT_PROMPT="아래 파일들의 보안 이슈를 분석하세요:

$CHANGED_FILES

분석 기준:
- SQL Injection, XSS, Hardcoded Secrets
- 빈 catch 블록, 미처리 Promise
- 불필요한 any 타입

출력 형식 (반드시 이 형식으로):
1. 먼저 비개발자도 이해할 수 있는 설명
2. 마지막 줄에 반드시 다음 중 하나만 출력:
   - Critical 이슈가 있으면: AUDIT_RESULT:FAIL
   - 이슈가 없으면: AUDIT_RESULT:PASS"

# Claude 실행 및 결과 캡처
CLAUDE_OUTPUT=$(claude -p "$AUDIT_PROMPT" 2>&1)
echo "$CLAUDE_OUTPUT"

# 결과 확인 (마지막 줄에서 AUDIT_RESULT 찾기)
if echo "$CLAUDE_OUTPUT" | grep -q "AUDIT_RESULT:PASS"; then
    PASS="true"
elif echo "$CLAUDE_OUTPUT" | grep -q "AUDIT_RESULT:FAIL"; then
    PASS="false"
else
    echo ""
    echo "⚠️ 검사 결과를 판단할 수 없습니다. push를 진행합니다."
    exit 0
fi

if [ "$PASS" = "true" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ 코드 검사 통과!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # [2단계] 문서 동기화
    if [ "$SKIP_SYNC" = "1" ]; then
        echo ""
        echo "⏭️ 문서 동기화 스킵 (SKIP_SYNC=1)"
    else
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📝 문서 동기화 중..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        # 변경 영역 → 문서 매핑 프롬프트
        SYNC_PROMPT="변경된 파일들을 분석하고 관련 문서를 업데이트하세요:

변경 파일:
$CHANGED_FILES

문서 매핑 규칙:
- src/components/ 변경 → sdd-docs/specs/component-inventory.md 업데이트
- src/hooks/, src/stores/ 변경 → sdd-docs/specs/architecture-frontend.md 업데이트
- src-tauri/ 변경 → sdd-docs/specs/architecture-desktop.md 업데이트
- server/ 변경 → sdd-docs/specs/architecture-server.md 업데이트
- 타입 변경 → sdd-docs/specs/data-models.md 업데이트

작업:
1. 변경 영역 파악
2. 해당 문서만 업데이트 (새 컴포넌트/함수 추가, 삭제된 항목 제거)
3. 업데이트한 파일 목록 출력

마지막 줄에 반드시: SYNC_DONE"

        SYNC_OUTPUT=$(claude -p "$SYNC_PROMPT" 2>&1)
        echo "$SYNC_OUTPUT"

        # 변경된 문서 스테이징
        if git diff --name-only sdd-docs/specs/ | grep -q .; then
            echo ""
            echo "📄 변경된 문서를 커밋에 추가합니다..."
            git add sdd-docs/specs/
            git commit --amend --no-edit
            echo "✅ 문서 업데이트 완료!"
        fi
    fi

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ push를 진행합니다."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 0
fi

# 이슈 발견 - 터미널/GUI 분기
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔴 Push가 차단되었어요"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -t 0 ]; then
    # 터미널 - 인터랙티브 모드
    read -p "지금 바로 수정할까요? (y/n): " answer

    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        echo ""
        echo "🔧 수정 중..."
        claude -p "방금 audit-result.json에 저장된 이슈들을 수정해주세요. 수정 후 결과를 알려주세요."
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ 수정 완료!"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "변경사항을 확인하고 다시 commit & push 해주세요:"
        echo ""
        echo "   git add ."
        echo "   git commit --amend --no-edit"
        echo "   git push"
        echo ""
        exit 1
    else
        echo ""
        echo "push가 차단되었습니다."
        echo "이슈를 수정한 후 다시 시도해주세요."
        exit 1
    fi
else
    # GUI - 비인터랙티브 모드
    echo "✅ 해결 방법:"
    echo "   터미널에서 아래 명령어를 실행하세요:"
    echo ""
    echo "   claude \"발견된 보안 이슈를 수정해줘\""
    echo ""
    exit 1
fi
