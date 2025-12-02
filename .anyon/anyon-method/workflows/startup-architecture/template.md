---
document_type: System Architecture Document
project_name: {{project_name}}
created_date: {{date}}
author: {{user_name}}
based_on_documents:
  - prd.md
  - ux-design.md
  - ui-design-guide.md
  - trd.md

# Quick Reference - 빠른 검색을 위한 메타데이터
service_type: {{service_type}}
platform: {{platform}}
architecture_pattern: {{architecture_pattern}}

tech_stack:
  frontend: {{frontend_framework}}
  backend: {{backend_framework}}
  database: {{database}}
  hosting: {{hosting_platform}}

key_components:
{{key_components_list}}

data_flow_paths:
{{data_flow_paths_list}}
---

# {{project_name}} - System Architecture

**작성일**: {{date}}
**작성자**: {{user_name}}
**기반 문서**: PRD, UX Design, UI Design Guide, TRD

---

## 📋 문서 개요

이 문서는 {{project_name}}의 시스템 아키텍처를 정의합니다. TRD에서 선정된 기술 스택을 활용하여 실제로 어떻게 시스템을 구성할지 설명합니다.

**비개발자를 위한 설명:**
{{non_technical_explanation}}

**참조 정보:**
- 서비스 유형: {{service_type}}
- 플랫폼: {{platform}}
- 핵심 기능: {{core_features_from_prd}}
- 기술 스택: {{tech_stack_summary}}

---

## 🎯 아키텍처 목표

{{architecture_goals}}

---

## 🏗️ 전체 시스템 구조

### 비개발자를 위한 설명
{{system_overview_for_non_tech}}

### 아키텍처 패턴
{{architecture_pattern_explanation}}

### 시스템 구성도
{{system_diagram}}

---

## 🔍 유사 서비스 아키텍처 분석

{{similar_services_analysis}}

---

## 📦 주요 컴포넌트

### Frontend Layer
{{frontend_architecture}}

### Backend Layer
{{backend_architecture}}

### Database Layer
{{database_architecture}}

### Infrastructure Layer
{{infrastructure_architecture}}

---

## 🔄 데이터 흐름

### 비개발자를 위한 설명
{{data_flow_for_non_tech}}

### 주요 데이터 흐름 패턴
{{data_flow_patterns}}

---

## 🔐 인증 및 권한 관리 흐름

{{auth_flow}}

---

## 📱 기능별 아키텍처

{{feature_by_feature_architecture}}

---

## 🌐 API 아키텍처

{{api_architecture}}

---

## 💾 데이터 저장 전략

{{data_storage_architecture}}

---

## 📤 파일 저장 아키텍처

{{file_storage_architecture}}

---

## 🔄 상태 관리 아키텍처

{{state_management_architecture}}

---

## 🚀 배포 아키텍처

### 비개발자를 위한 설명
{{deployment_for_non_tech}}

### 배포 구조
{{deployment_architecture}}

### CI/CD 파이프라인
{{cicd_pipeline}}

---

## 📊 확장성 전략

### 비개발자를 위한 설명
{{scalability_for_non_tech}}

### 확장성 설계
{{scalability_architecture}}

---

## 🔒 보안 아키텍처

{{security_architecture}}

---

## 📈 모니터링 및 로깅

{{monitoring_architecture}}

---

## ⚡ 성능 최적화 전략

{{performance_optimization}}

---

## 💰 비용 최적화 아키텍처

### 비개발자를 위한 설명
{{cost_for_non_tech}}

### 비용 최적화 전략
{{cost_optimization}}

---

## 🔧 개발 환경 아키텍처

{{dev_environment_architecture}}

---

## 📱 플랫폼별 아키텍처 (해당시)

{{platform_specific_architecture}}

---

## 🔄 다음 단계

이 Architecture 문서를 기반으로 다음 문서가 생성됩니다:

1. **ERD** (`erd.md`) - 데이터베이스 스키마 상세 설계

---

**문서 버전**: 1.0
**최종 수정일**: {{date}}
