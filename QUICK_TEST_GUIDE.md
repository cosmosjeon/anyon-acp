# Quick Test Guide - Phase 8B

**프로젝트:** ANYON Claude
**테스트 환경:** http://localhost:1420
**소요 시간:** 약 10-15분

---

## 빠른 시작

```bash
cd /Users/cosmos/Documents/1/anyon-claude
npm run dev
# 브라우저에서 http://localhost:1420 열기
```

---

## 1단계: 서버 확인 (1분)

### 확인 사항
- [ ] Frontend: http://localhost:1420 접속 가능
- [ ] Backend: 콘솔에 "Auth Server running on http://localhost:4000" 표시
- [ ] 페이지가 정상적으로 로드됨
- [ ] 로그인 화면 또는 메인 화면 표시

**문제 발생 시:**
```bash
# 포트가 이미 사용중이면
lsof -ti:1420 | xargs kill -9
lsof -ti:4000 | xargs kill -9

# 다시 시작
npm run dev
```

---

## 2단계: 주요 기능 테스트 (5분)

### 2.1 MVP Workspace
- [ ] 사이드바에서 "MVP Workspace" 클릭
- [ ] 페이지가 로드되고 UI가 표시됨
- [ ] 에러 없음

### 2.2 Agent Execution
- [ ] "Agent Execution" 메뉴 클릭
- [ ] 페이지가 렌더링됨
- [ ] 실행 버튼 표시됨

### 2.3 Claude Code Session
- [ ] Claude Code 세션 열기
- [ ] 세션 출력 표시됨
- [ ] 채팅 인터페이스 작동

### 2.4 Widgets (최소 3개)
- [ ] 위젯 패널 확인
- [ ] 아이콘이 정확히 표시됨
- [ ] 데이터가 표시됨 (또는 placeholder)

### 2.5 Settings
- [ ] 설정 아이콘 클릭
- [ ] 설정 페이지 열림
- [ ] 좌측 네비게이션 작동

---

## 3단계: 테마 전환 테스트 (5분)

### 3.1 초기 상태 확인

**개발자 도구 열기:** F12 또는 Cmd+Option+I

**Console에서 확인:**
```javascript
// 현재 테마 확인 (dark여야 함)
document.documentElement.classList.contains('light') // false

// color-scheme 확인
document.documentElement.style.colorScheme // "dark"
```

- [ ] 초기 테마가 Dark mode임
- [ ] 콘솔에 빨간 에러 없음

### 3.2 Dark → Light 전환

**Settings → Appearance 섹션에서:**

1. [ ] 현재 Dark mode 확인 (검은 배경)
2. [ ] Theme toggle 스위치 클릭
3. [ ] 즉시 Light mode로 전환 (흰 배경)
4. [ ] 텍스트 색상 어두워짐
5. [ ] 모든 UI 컴포넌트 색상 업데이트
6. [ ] 부드러운 전환 (깜박임 없음)

**Console 확인:**
```javascript
document.documentElement.classList.contains('light') // true
localStorage.getItem('app_setting:theme_preference') // "light"
```

### 3.3 Light → Dark 전환

1. [ ] Light mode에서 toggle 다시 클릭
2. [ ] Dark mode로 전환
3. [ ] 배경색이 검은색으로
4. [ ] 텍스트가 밝아짐
5. [ ] 부드러운 전환

**Console 확인:**
```javascript
document.documentElement.classList.contains('light') // false
localStorage.getItem('app_setting:theme_preference') // "dark"
```

### 3.4 Persistence 테스트

**Light mode 테스트:**
1. [ ] Light mode 선택
2. [ ] 페이지 새로고침 (F5 또는 Cmd+R)
3. [ ] Light mode 유지됨
4. [ ] 로딩 중 Dark mode로 깜박이지 않음

**Dark mode 테스트:**
1. [ ] Dark mode 선택
2. [ ] 페이지 새로고침
3. [ ] Dark mode 유지됨

---

## 4단계: 콘솔 에러 확인 (2분)

### DevTools Console 체크

**정상 출력 예시:**
```
[PostHog] Skipping PostHogProvider... (정상 - 무시해도 됨)
[Analytics] Initialized
Auth check result: { isAuthenticated: true, ... }
```

**테마 변경 시:**
```
[storageApi] saveSetting called: theme_preference value length: 5
[storageApi] Saved to localStorage
[storageApi] Row exists: true
[storageApi] Trying updateRow...
[storageApi] saveSetting completed successfully
```

### 확인 사항
- [ ] 빨간 에러 메시지 없음
- [ ] "Uncaught" 에러 없음
- [ ] TypeScript 에러 없음
- [ ] 노란 경고는 있어도 됨 (PostHog 등)

---

## 5단계: 성능 확인 (2분)

### 페이지 로드 시간

**DevTools → Performance:**
1. [ ] Performance 탭 열기
2. [ ] 녹화 시작 (Cmd+E)
3. [ ] 페이지 새로고침
4. [ ] 녹화 중지
5. [ ] 로드 시간 확인: < 5초

### 테마 전환 속도

**체감 확인:**
- [ ] 테마 toggle 클릭 시 즉각 반응
- [ ] 지연 없음
- [ ] 애니메이션 부드러움

---

## 6단계: 데이터베이스 확인 (선택사항, 2분)

### SQLite 데이터베이스 체크

```bash
cd /Users/cosmos/Documents/1/anyon-claude/server/data
sqlite3 anyon.db
```

**SQL 쿼리:**
```sql
-- 테마 설정 확인
SELECT * FROM app_settings WHERE key = 'theme_preference';

-- 모든 설정 보기
SELECT * FROM app_settings;

-- 종료
.quit
```

**예상 출력:**
```
key                 value
------------------  -----
theme_preference    light  (또는 dark)
```

---

## 체크리스트 요약

### Phase 8B - 주요 기능
- [ ] MVP Workspace 작동
- [ ] Agent Execution 작동
- [ ] Claude Code Session 작동
- [ ] Widgets 렌더링 (최소 3개)
- [ ] Settings 페이지 작동

### Phase 8 - 테마 전환
- [ ] 초기 로드: Dark mode 기본값
- [ ] Dark → Light 전환 작동
- [ ] Light → Dark 전환 작동
- [ ] 부드러운 전환 (깜박임 없음)
- [ ] localStorage 저장 확인
- [ ] 페이지 새로고침 후 테마 유지
- [ ] 콘솔 에러 없음
- [ ] 성능 양호 (로드 < 5초, 전환 즉각)

---

## 문제 해결

### 테마가 저장되지 않음

**확인:**
```javascript
// Console에서
localStorage.getItem('app_setting:theme_preference')
```

**해결:**
```javascript
// 수동으로 저장
localStorage.setItem('app_setting:theme_preference', 'light')
// 페이지 새로고침
```

### 테마 전환 시 일부 컴포넌트가 업데이트 안됨

**확인:**
```javascript
// HTML element에 클래스가 있는지
document.documentElement.className
```

**해결:**
- 페이지 새로고침
- Settings에서 다시 toggle

### 콘솔에 에러가 표시됨

**PostHog 관련 경고:**
```
[PostHog] Skipping PostHogProvider...
```
→ **정상입니다.** 개발 환경에서 PostHog가 설정되지 않아서 나오는 메시지입니다.

**기타 빨간 에러:**
→ **스크린샷 찍어서 보고해주세요.**

---

## 테스트 완료 후

### 보고 사항

1. **모든 기능 정상 작동** - ✅ / ❌
2. **테마 전환 정상** - ✅ / ❌
3. **localStorage 동기화 확인** - ✅ / ❌
4. **성능 측정 결과:**
   - 초기 로드: ___ 초
   - 테마 전환: 즉각 / 지연있음
5. **발견된 문제:**
   - (있으면 나열)

### Phase 9 준비 가능 여부

- [ ] Phase 8B 완료 (모든 기능 작동)
- [ ] Phase 8 완료 (테마 전환 작동)
- [ ] 콘솔 에러 없음
- [ ] 성능 양호

**Phase 9 진행 가능:** ✅ / ❌

---

**작성일:** 2025-12-21
**버전:** 1.0
**소요 시간:** 약 10-15분
