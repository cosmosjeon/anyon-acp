# Analytics System Documentation

## 개요

Anyon 앱의 사용자 행동 분석 시스템. **PostHog** 서비스를 사용하여 익명화된 사용 데이터를 수집합니다.

| 항목 | 내용 |
|------|------|
| **서비스** | PostHog (posthog.com) |
| **서버** | `https://us.i.posthog.com` |
| **저장소** | localStorage (`anyon-analytics-settings`) |
| **기본값** | 수집 활성화 (opt-out 방식) |

## 파일 구조

```
src/lib/analytics/
├── index.ts          # 메인 AnalyticsService (PostHog 연동)
├── consent.ts        # 동의 관리 (ConsentManager)
├── events.ts         # 이벤트 정의 및 빌더
├── types.ts          # TypeScript 타입 정의
└── resourceMonitor.ts # 시스템 리소스 모니터링
```

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        App Components                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     AnalyticsService                         │
│  - track(eventName, properties)                              │
│  - identify(traits)                                          │
│  - setScreen(screenName)                                     │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌──────────┐    ┌──────────┐    ┌──────────┐
       │ Consent  │    │ Sanitize │    │  Queue   │
       │ Manager  │    │   PII    │    │ & Flush  │
       └──────────┘    └──────────┘    └──────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostHog (외부 서비스)                      │
│                 https://us.i.posthog.com                     │
└─────────────────────────────────────────────────────────────┘
```

## 주요 컴포넌트

### 1. AnalyticsService (`index.ts`)

메인 서비스. PostHog SDK 초기화 및 이벤트 전송 담당.

```typescript
import { analytics } from '@/lib/analytics';

// 이벤트 트래킹
analytics.track('feature_used', { feature: 'chat' });

// 활성화/비활성화
await analytics.enable();
await analytics.disable();

// 상태 확인
analytics.isEnabled();
```

### 2. ConsentManager (`consent.ts`)

사용자 동의 관리. localStorage에 설정 저장.

```typescript
interface AnalyticsSettings {
  enabled: boolean;
  hasConsented: boolean;
  consentDate?: string;
  userId?: string;      // 익명 UUID
  sessionId?: string;   // 세션별 ID
}
```

### 3. EventBuilders (`events.ts`)

이벤트 생성 헬퍼. 일관된 이벤트 구조 보장.

```typescript
import { eventBuilders } from '@/lib/analytics';

// 세션 이벤트
eventBuilders.promptSubmitted({ prompt_length: 100, model: 'claude', ... });
eventBuilders.sessionStopped({ duration_ms: 5000, messages_count: 10, ... });

// 기능 사용
eventBuilders.feature('chat', 'send_message');

// 에러
eventBuilders.error('api_error', 'ERR_001', 'Failed to connect');
```

### 4. ResourceMonitor (`resourceMonitor.ts`)

시스템 리소스 모니터링 (메모리, 네트워크 등).

```typescript
import { resourceMonitor } from '@/lib/analytics';

resourceMonitor.startMonitoring(60000); // 1분 간격
resourceMonitor.stopMonitoring();
```

## 수집되는 이벤트

### 세션 이벤트
| 이벤트 | 설명 |
|--------|------|
| `session_created` | 새 세션 시작 |
| `session_stopped` | 세션 종료 |
| `prompt_submitted` | 프롬프트 전송 |
| `checkpoint_created` | 체크포인트 생성 |
| `tool_executed` | 도구 실행 |

### 기능 사용 이벤트
| 이벤트 | 설명 |
|--------|------|
| `feature_used` | 기능 사용 |
| `model_selected` | 모델 변경 |
| `tab_created` / `tab_closed` | 탭 관리 |
| `settings_changed` | 설정 변경 |

### 에러/성능 이벤트
| 이벤트 | 설명 |
|--------|------|
| `error_occurred` | 에러 발생 |
| `api_error` | API 에러 |
| `performance_bottleneck` | 성능 병목 |
| `memory_warning` | 메모리 경고 |

전체 이벤트 목록은 `types.ts`의 `EventName` 타입 참조.

## 개인정보 보호 (PII Sanitization)

모든 이벤트는 전송 전에 자동으로 개인정보가 제거됩니다.

### 제거되는 정보

| 항목 | 처리 방식 |
|------|----------|
| 파일 경로 | `/path/to/file.ts` → `*.ts` |
| 프로젝트 경로 | `/Users/xxx/project` → `project` |
| 이메일 | `user@example.com` → `***@***.***` |
| API 키 | 20자 이상 문자열 → `***` |
| 에이전트 이름 | `custom-agent-xxx` → `custom` |

### Sanitizer 함수

```typescript
import { sanitizers } from '@/lib/analytics';

sanitizers.sanitizeFilePath('/Users/foo/bar.ts');     // "*.ts"
sanitizers.sanitizeErrorMessage('Error at /path/x');  // "Error at /***"
sanitizers.sanitizeAgentName('custom-my-agent');      // "custom"
```

## 설정 UI

설정 > 개인정보 및 데이터 > "앱 개선 도움" 토글에서 on/off 가능.

```typescript
// Settings.tsx에서 사용
await analytics.enable();   // 활성화
await analytics.disable();  // 비활성화
```

## 비활성화 시 동작

- PostHog SDK `opt_out_capturing()` 호출
- 모든 `track()` 호출이 무시됨
- localStorage 설정은 유지 (enabled: false)

## PostHog 설정

```typescript
// index.ts
const config = {
  apiKey: 'phc_6seRe1SJkFckJU2qQWeeIy62kaSoaUbCsdVCm1TQZg8',
  apiHost: 'https://us.i.posthog.com',
  persistence: 'localStorage',
  autocapture: false,                    // 수동 트래킹만
  disable_session_recording: true,       // 세션 녹화 비활성화
};
```

## 관련 Hook

```typescript
// src/hooks/useTrackEvent.ts
const trackEvent = useTrackEvent();

trackEvent.featureUsed('chat', 'send');
trackEvent.sessionStarted('claude');
trackEvent.settingsChanged('theme', 'dark');
```
