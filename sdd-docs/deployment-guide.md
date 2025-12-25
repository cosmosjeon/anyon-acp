# ANYON 배포 가이드라인

## 버전 관리 (Semantic Versioning)

```
v{Major}.{Minor}.{Patch}

예: v1.2.3
    │  │  └── Patch: 버그 수정 (하위 호환)
    │  └───── Minor: 새 기능 추가 (하위 호환)
    └──────── Major: 호환성 깨지는 대규모 변경
```

### 버전별 배포 주기

| 버전 타입 | 배포 주기 | 예시 상황 |
|-----------|-----------|-----------|
| **Major** | 6개월 ~ 1년 | UI 전면 개편, 아키텍처 변경, API 호환성 변경 |
| **Minor** | 2 ~ 4주 (정기) | 새 기능 추가, 기존 기능 개선 |
| **Patch** | 정기 배포에 묶어서 | 버그 수정 모음 |
| **Hotfix** | 발생 즉시 | 보안 취약점, 앱 크래시 |

---

## 업데이트 방식

### 종류

| 방식 | 설명 | updateType |
|------|------|------------|
| **자동 업데이트** | 백그라운드 다운로드 → 재시작 시 설치 | `"auto"` |
| **선택적 업데이트** | "업데이트 하시겠습니까?" 팝업 | `"optional"` |
| **강제 업데이트** | 업데이트 전까지 앱 사용 불가 | `"force"` |

### 언제 어떤 방식을 쓰나

```
보안 패치, 심각한 버그    →  "force"
새 기능 홍보하고 싶을 때  →  "optional"
일반 버그 수정           →  "auto"
```

### 서버 응답 형식

```json
{
  "version": "1.3.0",
  "url": "https://github.com/.../app_1.3.0.msi",
  "signature": "...",
  "updateType": "auto"
}
```

### 앱 코드 분기 처리

```typescript
const update = await check();

if (update) {
  const { updateType } = update;

  if (updateType === 'force') {
    // 강제: 화면 막고 업데이트 진행
    showBlockingUpdateScreen();
    await update.downloadAndInstall();

  } else if (updateType === 'optional') {
    // 선택: 팝업으로 물어봄
    const userChoice = await showUpdateDialog();
    if (userChoice === 'yes') {
      await update.downloadAndInstall();
    }

  } else {
    // 자동: 조용히 진행
    await update.downloadAndInstall();
  }
}
```

---

## 업데이트 흐름

### 자동 업데이트

```
앱 실행 → 버전 체크 → 다운로드 (백그라운드) → 재시작하면 적용
                      (조용히, 사용자 모름)
```

### 선택적 업데이트

```
앱 실행 → 버전 체크 → "새 버전 있음" 팝업
                   → [업데이트] or [나중에]
```

### 강제 업데이트

```
앱 실행 → 버전 체크 → "업데이트 필수" 화면
                   → 업데이트 완료 전까지 진입 불가
```

---

## 롤아웃 전략

### 점진적 롤아웃 (권장)

```
Day 1:  10% 사용자에게 배포
Day 3:  문제 없으면 → 50% 확대
Day 5:  문제 없으면 → 100% 전체 배포

⚠️ 문제 발생 시 → 롤아웃 중단, 수정 버전 배포
```

### 롤백 대응

실제 "롤백"은 어려움. 대신:

1. **롤아웃 중단**: 아직 안 받은 사용자는 구버전 유지
2. **빠른 수정 배포**: v1.3.0 버그 → v1.3.1 긴급 배포
3. **서버 측 조치**: `latest.json` 버전 정보 수정

---

## 배포 체크리스트

### 배포 전

- [ ] 모든 테스트 통과
- [ ] 버전 번호 업데이트 (`package.json`, `tauri.conf.json`, `Cargo.toml`)
- [ ] 릴리즈 노트 작성
- [ ] 베타 테스터 그룹에서 검증 완료

### 배포 시

- [ ] 빌드 생성 (Windows, macOS, Linux)
- [ ] 코드 서명
- [ ] GitHub Releases에 업로드
- [ ] `latest.json` 업데이트 (버전, URL, signature, updateType)

### 배포 후

- [ ] 10% 롤아웃으로 시작
- [ ] 에러 모니터링
- [ ] 문제 없으면 점진적 확대
- [ ] 100% 도달 후 모니터링 유지

---

## 버전 동기화 위치

배포 시 아래 파일들의 버전을 동일하게 맞춰야 함:

| 파일 | 경로 |
|------|------|
| `package.json` | `/package.json` |
| `tauri.conf.json` | `/src-tauri/tauri.conf.json` |
| `Cargo.toml` | `/src-tauri/Cargo.toml` |

---

## CI/CD 전략

### 도구 선택: GitHub Actions (권장)

| 도구 | 유형 | 특징 | 추천 대상 |
|------|------|------|-----------|
| **GitHub Actions** | 클라우드 | GitHub 통합, 설정 쉬움 | 스타트업, 오픈소스 |
| Jenkins | 셀프호스팅 | 1,800+ 플러그인, 최고 유연성 | 대기업, DevOps 전담팀 |
| GitLab CI/CD | 클라우드 + 셀프 | 올인원 DevOps 플랫폼 | 중소기업 |
| Drone CI | 셀프호스팅 | Docker 네이티브, 경량 | 컨테이너 기반 |

**ANYON 선택: GitHub Actions**
- 이미 GitHub 사용 중
- 설정 쉬움 (YAML)
- 퍼블릭 레포 무료 / 프라이빗 월 2,000분 무료
- Tauri 빌드 액션 이미 존재
- 유지보수 부담 없음

### GitHub Actions 단점 및 주의사항

| 단점 | 영향도 | 대응 |
|------|--------|------|
| GitHub 종속 | 낮음 | 이미 GitHub 사용 중 |
| 비용 (프라이빗) | 중간 | 캐싱, 빌드 최적화 |
| 빌드 시간 | 중간 | 캐싱 활용 |
| 디버깅 불편 | 중간 | 로컬 테스트 후 push |

### 비용 절약 방법

#### 1. 캐싱 적극 활용

매 빌드마다 의존성 다시 다운로드하면 시간 낭비:

```yaml
- uses: actions/cache@v3
  with:
    path: |
      node_modules
      src-tauri/target
    key: ${{ runner.os }}-deps-${{ hashFiles('**/package-lock.json') }}
```

효과: 빌드 시간 50% 감소

#### 2. 릴리즈할 때만 전체 빌드

```yaml
# 테스트는 항상 실행
on: [push, pull_request]
jobs:
  test:
    run: npm test

# 빌드는 태그 붙을 때만
on:
  push:
    tags:
      - 'v*'
jobs:
  build:
    run: npm run tauri build
```

효과: 빌드 횟수 80% 감소

#### 3. PR은 테스트만 돌리기

```
PR 생성 → 테스트만 실행 (5분)
         ↓
병합 후 → 전체 빌드 (30분)
```

- PR 단계에서 빌드까지 하면 비용 낭비
- 어차피 수정될 수 있으므로 테스트만 통과하면 OK

#### 4. 셀프호스팅 러너 (나중에)

```
GitHub 러너 (기본):
└── 무료 2,000분 제한
└── 공유 서버라 느릴 수 있음

셀프호스팅 러너:
└── 우리 컴퓨터에서 빌드
└── 무제한 (전기세만)
└── 우리 전용이라 빠름
```

**도입 시점**: 월 비용이 서버 비용보다 비싸지면 고려

### 비용 절약 요약

| 방법 | 효과 | 난이도 | 도입 시점 |
|------|------|--------|-----------|
| 캐싱 | 시간 50% ↓ | 쉬움 | 지금 |
| 릴리즈만 빌드 | 횟수 80% ↓ | 쉬움 | 지금 |
| PR은 테스트만 | 불필요 빌드 제거 | 쉬움 | 지금 |
| 셀프호스팅 | 무제한 | 중간 | 나중에 |

---

## 참고: Tauri Updater 설정

- 공식 문서: https://v2.tauri.app/plugin/updater/
- 서명 키 생성 필요 (private key는 절대 공유 금지)
- GitHub Releases 또는 자체 서버 사용 가능
