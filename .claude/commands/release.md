---
description: '배포 프로세스 실행 (검증 → 버전 업데이트 → 태그 → 푸시 → 빌드 모니터링)'
allowed-tools: Bash(git:*), Bash(bun:*), Bash(gh:*), Read, Edit
---

# 배포 워크플로우

이 워크플로우는 배포 프로세스를 단계별로 안내합니다.

---

## Step 0: 사전 조건 확인 및 자동 설치

배포를 시작하기 전에 필요한 도구들을 확인하고, 없으면 자동으로 설치합니다.

### 0.1 체크 및 자동 설치

다음 순서로 확인하고, 없으면 **직접 설치 명령을 실행**하세요:

1. **Git 확인** → 없으면 `winget install Git.Git` 실행
2. **Bun 확인** → 없으면 `irm bun.sh/install.ps1 | iex` 실행 (PowerShell)
3. **GitHub CLI 확인** → 없으면 `winget install GitHub.cli` 실행
4. **GitHub CLI 인증 확인** → 인증 안 됐으면 아래 안내 후 **중단**

```bash
git --version
bun --version
gh --version
gh auth status
```

### 0.2 GitHub CLI 인증

`gh auth status`가 실패하면:

1. `gh auth login`을 실행해보세요
2. 에러 메시지를 확인하고 상황에 맞게 안내하세요:

**에러: "command not found" 또는 "gh를 찾을 수 없습니다"**
→ 먼저 설치되어 있는지 경로를 확인하세요:

Windows:
```bash
# 일반적인 설치 경로 확인
dir "C:\Program Files\GitHub CLI\gh.exe"
dir "C:\Program Files (x86)\GitHub CLI\gh.exe"
dir "%LOCALAPPDATA%\Programs\GitHub CLI\gh.exe"
```

macOS/Linux:
```bash
# 일반적인 설치 경로 확인
ls /usr/local/bin/gh
ls /opt/homebrew/bin/gh
which gh
```

**경로에 gh가 있으면** → PATH 문제. 전체 경로로 실행하거나 PATH에 추가:

Windows (PowerShell) - `&` 연산자 필수:
```powershell
& "C:\Program Files\GitHub CLI\gh.exe" auth status
```

Windows (CMD):
```cmd
"C:\Program Files\GitHub CLI\gh.exe" auth status
```

macOS/Linux:
```bash
/usr/local/bin/gh auth status
```

**경로에도 없으면** → 설치 안 됨. 0.1로 돌아가서 설치 먼저.

**에러: "not logged in" 또는 인증 관련 에러**
→ 사용자에게 다음과 같이 안내하세요:

```
🔐 GitHub CLI 인증이 필요합니다

PowerShell 또는 CMD를 열고 다음 명령어를 실행해주세요:

[PowerShell 사용 시]
& "C:\Program Files\GitHub CLI\gh.exe" auth login

[CMD 사용 시]
"C:\Program Files\GitHub CLI\gh.exe" auth login

브라우저가 열리면 GitHub에 로그인해주세요.
로그인 완료 후 다시 /release를 실행해주세요.
```

**중요: PowerShell에서는 반드시 & 연산자를 앞에 붙여야 합니다.**

**에러: 인터랙티브 터미널 관련 에러**
→ 사용자에게 직접 터미널에서 실행하라고 안내. OS에 맞는 터미널을 알려주세요:

Windows:
```
PowerShell 또는 CMD를 열고 실행하세요:
  gh auth login

(시작 메뉴 → "PowerShell" 검색 → 열기)
```

macOS:
```
터미널을 열고 실행하세요:
  gh auth login

(Spotlight → "Terminal" 검색 → 열기)
```

Linux:
```
터미널을 열고 실행하세요:
  gh auth login
```

완료 후 다시 /release를 실행하세요.

3. 인증 완료 후 `gh auth status`로 다시 확인하세요.

모든 체크가 통과하면 Step 1로 진행합니다.

---

## Step 1: 자동 검증

먼저 코드에 문제가 없는지 검사합니다.

### 1.1 타입 검사 실행

```
bun run check
```

타입 에러가 있으면 배포를 중단하고 에러를 보여주세요.

### 1.2 테스트 실행

```
bun test
```

테스트가 실패하면 배포를 중단하고 실패한 테스트를 보여주세요.

검증 통과 시 다음과 같이 표시:
```
✅ 검증 통과
   - 타입 검사: 통과
   - 테스트: 통과
```

---

## Step 2: 현재 상태 표시

검증을 통과하면 현재 배포 상태를 보여줍니다.

### 2.1 마지막 배포 정보 조회

다음 명령어들을 실행해서 정보를 수집하세요:

```bash
# 마지막 태그
git describe --tags --abbrev=0 2>/dev/null || echo "태그 없음"

# 마지막 태그의 커밋
git log -1 --format="%h %s" $(git describe --tags --abbrev=0 2>/dev/null) 2>/dev/null || echo "없음"

# 마지막 태그 이후 커밋들
git log $(git describe --tags --abbrev=0 2>/dev/null)..HEAD --oneline 2>/dev/null || git log --oneline -10

# 마지막 릴리즈 노트
gh release view $(git describe --tags --abbrev=0 2>/dev/null) --json body -q .body 2>/dev/null || echo "(릴리즈 없음)"
```

### 2.2 현재 버전 확인

package.json에서 현재 버전을 읽어주세요.

### 2.3 사용자에게 표시

다음 형식으로 보여주세요:

```
📦 현재 배포 상태
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

마지막 배포 버전: v0.0.1
마지막 배포 커밋: abc1234 - chore: bump version to v0.0.1

📄 마지막 릴리즈 노트:
  - 로그인 기능 추가
  - 버그 수정

📝 마지막 배포 이후 변경사항:
  - def5678 feat: 회원가입 기능 추가
  - ghi9012 fix: 버그 수정
  - jkl3456 refactor: 코드 정리

총 3개의 커밋이 배포 대기 중입니다.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Step 3: 버전 타입 선택

사용자에게 버전 타입을 물어봅니다.

### 질문

```
🔢 버전 타입을 선택하세요:

버전 번호는 v{Major}.{Minor}.{Patch} 형식입니다.
현재 버전: v0.0.1

[P] Patch (0.0.1 → 0.0.2)
    - 버그 수정
    - 작은 개선
    - 하위 호환되는 수정

[M] Minor (0.0.1 → 0.1.0)
    - 새로운 기능 추가
    - 하위 호환되는 변경
    - 정기 배포에 권장

[A] Major (0.0.1 → 1.0.0)
    - 큰 변경
    - 호환성이 깨지는 변경
    - 앱 리뉴얼

어떤 타입으로 배포할까요? [P/M/A]
```

사용자 응답을 기다린 후 새 버전 번호를 계산하세요.

---

## Step 4: 릴리즈 노트 입력

사용자에게 릴리즈 노트를 물어봅니다.

### 질문

```
📝 릴리즈 노트를 작성해주세요:

이 내용은 GitHub Releases에 표시됩니다.
사용자들이 "이번 업데이트에 뭐가 바뀌었지?" 볼 때 읽는 내용입니다.

예시:
- 로그인 기능 추가
- 버그 수정: 앱 크래시 문제 해결
- UI 개선

변경사항을 입력하세요:
```

사용자 응답을 기다리세요.

---

## Step 5: 배포 실행

릴리즈 노트 입력 후 바로 배포를 실행합니다.

### 5.1 버전 파일 업데이트

Edit 도구를 사용해서 3개 파일의 버전을 업데이트하세요:

1. **package.json**: `"version": "X.X.X"` 부분 수정
2. **src-tauri/tauri.conf.json**: `"version": "X.X.X"` 부분 수정
3. **src-tauri/Cargo.toml**: `version = "X.X.X"` 부분 수정

### 5.2 Git 커밋 및 태그

```bash
git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml
git commit -m "chore: bump version to vX.X.X"
git tag vX.X.X
```

### 5.3 현재 브랜치 확인 및 푸시

현재 브랜치를 확인하세요:
```bash
git branch --show-current
```

**dev 브랜치인 경우:**
```bash
git push origin dev
git push origin vX.X.X
```

**main 브랜치인 경우:**
```bash
git push origin main
git push origin vX.X.X
```

### 5.4 진행 메시지

```
✅ 태그 푸시 완료!

버전 vX.X.X 태그가 푸시되었습니다.
GitHub Actions 빌드가 시작됩니다...

Step 6에서 빌드 상태를 모니터링합니다.
```

---

## Step 6: 빌드 모니터링

GitHub Actions 빌드 상태를 실시간으로 확인합니다.

### 6.1 빌드 워크플로우 확인

```bash
# 방금 트리거된 워크플로우 확인
gh run list --workflow=release.yml --limit=1

# 워크플로우 ID 가져오기
gh run list --workflow=release.yml --limit=1 --json databaseId -q '.[0].databaseId'
```

### 6.2 빌드 상태 모니터링

```bash
# 실시간 빌드 상태 확인 (완료될 때까지 대기)
gh run watch <run_id>
```

빌드 진행 상황을 사용자에게 주기적으로 알려주세요:
```
🔄 빌드 진행 중...
   - Linux: 진행 중
   - macOS: 대기 중
   - Windows: 대기 중
```

### 6.3 결과에 따른 처리

#### 빌드 성공 시:

현재 브랜치를 확인하세요:
```bash
git branch --show-current
```

**dev 브랜치에서 빌드 성공한 경우** → Step 8로 진행 (main 머지)

**main 브랜치에서 빌드 성공한 경우:**
```
✅ 빌드 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

버전 vX.X.X 빌드가 성공적으로 완료되었습니다.

📦 빌드 결과:
   - Linux (.deb, .AppImage): ✅
   - macOS (.dmg): ✅
   - Windows (.msi, .exe): ✅

🔗 GitHub Releases (Draft):
   https://github.com/SL-IT-AMAZING/anyon-claude/releases

Draft를 확인하고 Publish하면 사용자에게 배포됩니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 빌드 실패 시:

Step 7로 진행합니다.

---

## Step 7: 빌드 실패 시 자동 수정

빌드가 실패하면 로그를 분석하고 자동 수정을 시도합니다.

### 7.1 실패 로그 가져오기

```bash
# 실패한 워크플로우의 로그 확인
gh run view <run_id> --log-failed
```

### 7.2 에러 분석

실패 로그를 분석해서 에러 원인을 파악하세요:

- **타입 에러**: TypeScript 컴파일 에러
- **의존성 에러**: 패키지 설치 실패
- **빌드 에러**: Rust/Tauri 빌드 실패
- **서명 에러**: 코드 서명 관련 문제

### 7.3 자동 수정 가능 여부 판단

**자동 수정 가능한 경우:**
- 타입 에러 (간단한 수정)
- import 경로 오류
- 의존성 버전 문제

**자동 수정 불가능한 경우:**
- 환경 변수/시크릿 문제
- 코드 서명 인증서 문제
- 복잡한 로직 버그

### 7.4 자동 수정 시도

자동 수정이 가능하면:

1. 에러 내용을 사용자에게 보여주기
2. 수정 내용 설명
3. 코드 수정 적용
4. 다시 커밋 & 태그 생성

```bash
git add .
git commit -m "fix: resolve build error for vX.X.X"
git tag -d vX.X.X  # 기존 태그 삭제
git push origin :refs/tags/vX.X.X  # 원격 태그 삭제
git tag vX.X.X  # 새 태그 생성
git push origin main
git push origin vX.X.X
```

5. Step 6으로 돌아가서 다시 빌드 모니터링
6. 또 실패하면 Step 7 반복 (성공할 때까지)

### 7.5 자동 수정 불가능한 경우 (이 경우에만 중단)

```
❌ 빌드 실패 - 수동 수정 필요
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

에러 내용:
  [에러 로그 요약]

이 에러는 자동으로 수정할 수 없습니다.

수동 조치 필요:
  1. 위 에러 내용을 확인하세요
  2. 로컬에서 문제를 수정하세요
  3. 다시 /release를 실행하세요

🔗 전체 로그 확인:
   https://github.com/SL-IT-AMAZING/anyon-claude/actions/runs/<run_id>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Step 8: main 브랜치로 머지 (dev에서 빌드 성공 시)

dev 브랜치에서 빌드가 성공하면 main으로 머지합니다.

### 8.1 main 브랜치로 이동 및 머지

```bash
git checkout main
git pull origin main
git merge dev --no-ff -m "Merge dev: release vX.X.X"
git push origin main
```

### 8.2 완료 메시지

```
✅ 릴리즈 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

버전 vX.X.X가 main 브랜치에 머지되었습니다.

📦 빌드 결과:
   - Linux (.deb, .AppImage): ✅
   - macOS (.dmg): ✅
   - Windows (.msi, .exe): ✅

🔗 GitHub Releases (Draft):
   https://github.com/SL-IT-AMAZING/anyon-claude/releases

Draft를 확인하고 Publish하면 사용자에게 배포됩니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 중요 규칙

1. **각 Step에서 사용자 입력을 기다리세요** - 자동으로 다음 단계로 넘어가지 마세요
2. **검증 실패 시 즉시 중단하세요** - 에러 내용을 보여주고 종료
3. **버전 3개 파일 모두 동일하게 수정하세요** - 불일치 방지
4. **빌드 실패 시 성공할 때까지 반복하세요** - Step 6 ↔ Step 7 반복
5. **자동 수정 불가능한 에러만 수동 수정 안내하세요** - 환경변수, 시크릿, 인증서 문제 등
