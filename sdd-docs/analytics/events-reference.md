# Analytics Events Reference

## 이벤트 카테고리

### Session Events

| 이벤트명 | 설명 | 주요 속성 |
|----------|------|----------|
| `session_created` | 세션 생성 | `model`, `source`, `resumed` |
| `session_completed` | 세션 완료 | - |
| `session_resumed` | 세션 재개 | `checkpoint_id` |
| `session_stopped` | 세션 중지 | `duration_ms`, `messages_count`, `reason` |
| `prompt_submitted` | 프롬프트 제출 | `prompt_length`, `model`, `word_count` |
| `checkpoint_created` | 체크포인트 생성 | `checkpoint_number` |
| `checkpoint_restored` | 체크포인트 복원 | `checkpoint_id`, `time_since_checkpoint_ms` |
| `tool_executed` | 도구 실행 | `tool_name`, `execution_time_ms`, `success` |

### Feature Events

| 이벤트명 | 설명 | 주요 속성 |
|----------|------|----------|
| `feature_used` | 기능 사용 | `feature`, `subfeature` |
| `model_selected` | 모델 선택 | `new_model`, `previous_model` |
| `tab_created` | 탭 생성 | - |
| `tab_closed` | 탭 닫기 | - |
| `file_opened` | 파일 열기 | - |
| `file_edited` | 파일 편집 | - |
| `file_saved` | 파일 저장 | - |

### Agent Events

| 이벤트명 | 설명 | 주요 속성 |
|----------|------|----------|
| `agent_executed` | 에이전트 실행 완료 | `agent_type`, `success`, `duration_ms` |
| `agent_started` | 에이전트 시작 | `agent_type`, `has_custom_prompt` |
| `agent_progress` | 에이전트 진행 | `step_number`, `step_type` |
| `agent_error` | 에이전트 에러 | `error_type`, `error_stage`, `retry_count` |

### MCP Events

| 이벤트명 | 설명 | 주요 속성 |
|----------|------|----------|
| `mcp_server_connected` | 서버 연결 | `server_name`, `success` |
| `mcp_server_disconnected` | 서버 연결 해제 | `server_name` |
| `mcp_server_added` | 서버 추가 | `server_type`, `configuration_method` |
| `mcp_server_removed` | 서버 제거 | `server_name`, `was_connected` |
| `mcp_tool_invoked` | 도구 호출 | `server_name`, `tool_name`, `invocation_source` |
| `mcp_connection_error` | 연결 에러 | `server_name`, `error_type`, `retry_attempt` |

### Slash Command Events

| 이벤트명 | 설명 | 주요 속성 |
|----------|------|----------|
| `slash_command_used` | 명령어 사용 | `command`, `success` |
| `slash_command_selected` | 명령어 선택 | `command_name`, `selection_method` |
| `slash_command_executed` | 명령어 실행 | `command_name`, `execution_time_ms` |
| `slash_command_created` | 명령어 생성 | `command_type`, `has_parameters` |

### Error & Performance Events

| 이벤트명 | 설명 | 주요 속성 |
|----------|------|----------|
| `error_occurred` | 에러 발생 | `error_type`, `error_code`, `context` |
| `api_error` | API 에러 | `endpoint`, `error_code`, `response_time_ms` |
| `ui_error` | UI 에러 | `component_name`, `error_type` |
| `performance_bottleneck` | 성능 병목 | `operation_type`, `duration_ms` |
| `memory_warning` | 메모리 경고 | `component`, `memory_mb` |

### User Journey Events

| 이벤트명 | 설명 | 주요 속성 |
|----------|------|----------|
| `journey_milestone` | 마일스톤 도달 | `journey_stage`, `milestone_reached` |
| `user_retention` | 사용자 리텐션 | - |

### AI Interaction Events

| 이벤트명 | 설명 | 주요 속성 |
|----------|------|----------|
| `ai_interaction` | AI 상호작용 | `model`, `request_tokens`, `response_tokens` |
| `prompt_pattern` | 프롬프트 패턴 | `prompt_category`, `prompt_effectiveness` |

### Quality Events

| 이벤트명 | 설명 | 주요 속성 |
|----------|------|----------|
| `output_regenerated` | 출력 재생성 | `regeneration_count`, `final_acceptance` |
| `conversation_abandoned` | 대화 포기 | `reason`, `messages_count` |
| `suggestion_accepted` | 제안 수락 | `suggestion_type`, `response_time_ms` |
| `suggestion_rejected` | 제안 거부 | `suggestion_type`, `response_time_ms` |

### Workflow Events

| 이벤트명 | 설명 | 주요 속성 |
|----------|------|----------|
| `workflow_started` | 워크플로우 시작 | `workflow_type`, `total_steps` |
| `workflow_completed` | 워크플로우 완료 | `workflow_type`, `duration_ms` |
| `workflow_abandoned` | 워크플로우 포기 | `workflow_type`, `steps_completed` |

### Feature Adoption Events

| 이벤트명 | 설명 | 주요 속성 |
|----------|------|----------|
| `feature_discovered` | 기능 발견 | `feature_name`, `discovery_method` |
| `feature_adopted` | 기능 채택 | `feature`, `adoption_stage`, `usage_count` |
| `feature_combination` | 기능 조합 사용 | `primary_feature`, `secondary_feature` |

### Resource Usage Events

| 이벤트명 | 설명 | 주요 속성 |
|----------|------|----------|
| `resource_usage_high` | 높은 리소스 사용 | `memory_usage_mb`, `cpu_usage_percent` |
| `resource_usage_sampled` | 리소스 샘플링 | `memory_usage_mb`, `network_requests_count` |

### Network Events

| 이벤트명 | 설명 | 주요 속성 |
|----------|------|----------|
| `network_performance` | 네트워크 성능 | `latency_ms`, `connection_quality` |
| `network_failure` | 네트워크 실패 | `endpoint_type`, `retry_count` |

### Engagement Events

| 이벤트명 | 설명 | 주요 속성 |
|----------|------|----------|
| `session_engagement` | 세션 참여도 | `session_duration_ms`, `engagement_score` |

### System Events

| 이벤트명 | 설명 | 주요 속성 |
|----------|------|----------|
| `app_started` | 앱 시작 | - |
| `app_closed` | 앱 종료 | - |
| `settings_changed` | 설정 변경 | - |

## 이벤트 속성 공통 필드

모든 이벤트에 자동으로 추가되는 필드:

```typescript
{
  screen_name: string;      // 현재 화면
  app_context: 'anyon_desktop';
  $session_id: string;      // 세션 ID
  timestamp: number;        // 타임스탬프
}
```
