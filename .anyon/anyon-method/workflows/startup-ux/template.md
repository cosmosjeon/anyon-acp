---
document_type: UX Design Specification
project_name: {{project_name}}
created_date: {{date}}
author: {{user_name}}
based_on_prd: prd.md

# Quick Reference - 빠른 검색을 위한 메타데이터
service_type: {{service_type}}
platform: {{platform}}
total_screens: {{total_screens}}
total_user_flows: {{total_user_flows}}

primary_screens:
{{primary_screens_list}}

key_user_flows:
{{key_user_flows_list}}

interaction_patterns:
{{interaction_patterns_list}}
---

# {{project_name}} - UX Design Specification

**작성일**: {{date}}
**작성자**: {{user_name}}
**기반 문서**: PRD (prd.md)

---

## 📋 문서 개요

이 문서는 {{project_name}}의 사용자 경험(UX)을 정의합니다. PRD에서 정의한 기능들을 실제 화면과 사용자 플로우로 구체화합니다.

**PRD 핵심 정보:**
- 서비스 유형: {{service_type}}
- 플랫폼: {{platform}}
- 타겟 사용자: {{target_users_summary}}

---

## 🎯 UX 설계 원칙

{{ux_design_principles}}

---

## 📱 화면 구조 (Screen Structure)

### 전체 화면 목록

{{screen_inventory}}

### 화면 계층 구조

{{screen_hierarchy}}

### 화면별 상세 정의

{{screen_details}}

---

## 🔄 사용자 플로우 (User Flows)

<critical>
이 섹션은 UX 설계의 핵심입니다. 모든 사용자 플로우가 단계별로, 예외 케이스까지 포함하여 병적으로 구체적으로 정의되어 있습니다.

플로우는 두 가지로 구분됩니다:
1. **표준 플로우**: 대부분의 서비스에 공통적으로 필요한 플로우 (자동 생성)
2. **커스텀 플로우**: 이 서비스만의 독특한 핵심 기능 플로우 (상세 작성)
</critical>

{{user_flows}}

---

### 📊 플로우 통계

- **총 플로우 수**: {{total_user_flows}}개
  - 표준 플로우: {{total_standard_flows}}개
  - 커스텀 플로우: {{total_custom_flows}}개

---

## 🎨 인터랙션 패턴 (Interaction Patterns)

### 기본 인터랙션

{{basic_interactions}}

### 제스처 및 입력 방식

{{gesture_inputs}}

### 피드백 및 애니메이션

{{feedback_animations}}

---

## 🧩 주요 컴포넌트 (Key Components)

{{key_components}}

---

## 📊 상태 관리 (State Management)

{{state_management}}

---

## ⚡ 엣지 케이스 및 에러 처리

{{edge_cases}}

---

## 📐 레이아웃 및 그리드

{{layout_grid}}

---

## 🔔 알림 및 권한 (해당시)

{{notifications_permissions}}

---

## ♿ 접근성 고려사항

{{accessibility_considerations}}

---

## 📱 반응형 디자인 (해당시)

{{responsive_design}}

---

## 🔄 다음 단계

이 UX Design을 기반으로 다음 문서들이 생성됩니다:

1. **UI Design Guide** (`ui-design-guide.md`) - 디자인 시스템 및 UI 컴포넌트 라이브러리
2. **TRD** (`trd.md`) - 각 플로우와 인터랙션 구현을 위한 기술 스택
3. **Architecture** (`architecture.md`) - UX 플로우를 지원하는 시스템 아키텍처
4. **ERD** (`erd.md`) - 화면에 표시될 데이터 구조

---

**문서 버전**: 1.0
**최종 수정일**: {{date}}
