# Code Audit 기준

> 이 문서는 ANYON 프로젝트의 코드 품질 검사 기준을 정의합니다.
> AI 드리븐 개발 환경에서 발생할 수 있는 특수 문제를 우선적으로 탐지합니다.

## 배경

### AI 생성 코드의 위험성 (GitClear 연구, 2.11억 줄 분석)

| 지표 | 2021 (AI 이전) | 2024 (AI 이후) | 변화 |
|------|----------------|----------------|------|
| 코드 복사/붙여넣기 | 8.3% | 12.3% | +48% |
| 리팩토링 비율 | 25% | <10% | -60% |
| 코드 Churn (2주 내 수정) | 기준 | 2배 | 2x |

---

## Audit 기준

### 1. AI 생성 코드 특유의 문제 (우선 검사)

| 문제 | 설명 | 탐지 방법 |
|------|------|-----------|
| **Copy/Paste 남발** | DRY 원칙 무시, 기존 함수 재사용 대신 새로 생성 | 중복 코드 탐지 |
| **문맥 무시** | 프로젝트 아키텍처/패턴 고려 없이 생성 | 기존 패턴과 불일치 검사 |
| **이해 없는 수용** | 작동하면 넘어가는 태도 | 복잡한 로직에 주석 부재 |
| **리팩토링 회피** | AI 코드 수정 두려움 | 오래된 TODO, 임시 해결책 |

### 2. Bloaters (비대한 코드)

| 항목 | 기준 | 심각도 |
|------|------|--------|
| Long Method | 50줄 이상 | Critical |
| Long Method | 30-50줄 | Warning |
| Long Parameter List | 3개 이상 | Warning |
| Cyclomatic Complexity | 10개 이상 분기 | Critical |
| Large Class/File | 500줄 이상 | Warning |

### 3. Change Preventers (변경 방해 요소)

| 항목 | 설명 |
|------|------|
| Divergent Change | 하나의 기능 수정에 여러 메서드 변경 필요 |
| Shotgun Surgery | 하나의 변경이 여러 클래스에 영향 |
| Feature Envy | 다른 클래스 데이터를 과도하게 사용 |

### 4. Dispensables (불필요한 코드)

| 항목 | 설명 |
|------|------|
| Dead Code | 실행되지 않는 코드 |
| Duplicated Code | 중복 로직 |
| Speculative Generality | 미래를 위한 과도한 추상화 |

### 5. SOLID 원칙 위반

| 원칙 | 검사 내용 |
|------|-----------|
| **S**ingle Responsibility | 한 모듈이 하나의 책임만 가지는가? |
| **O**pen-Closed | 확장에 열려있고 수정에 닫혀있는가? |
| **L**iskov Substitution | 하위 타입이 상위를 대체 가능한가? |
| **I**nterface Segregation | 불필요한 인터페이스 의존이 없는가? |
| **D**ependency Inversion | 추상화에 의존하는가? |

### 6. 기술 부채

| 항목 | 심각도 |
|------|--------|
| TODO/FIXME/HACK 주석 | Info |
| any 타입 사용 | Warning |
| 하드코딩된 설정값 | Warning |

---

## 심각도 기준

| 등급 | 설명 | Push 차단 |
|------|------|-----------|
| **Critical** | 유지보수 심각하게 저해 | Yes |
| **Warning** | 권장 수정 | No |
| **Info** | 참고 | No |

### Critical 기준

- 50줄 이상 함수
- 심각한 중복 코드
- 단일 책임 원칙 심각 위반
- 10개 이상 분기 (Cyclomatic Complexity)

---

## Maintainability Rating (SonarQube 기준)

| 등급 | Technical Debt Ratio | 의미 |
|------|---------------------|------|
| A | ≤ 5% | 우수 |
| B | 5-10% | 양호 |
| C | 10-20% | 개선 필요 |
| D | 20-50% | 문제 있음 |
| E | ≥ 50% | 심각 |

---

## 참고 자료

### AI 생성 코드 품질 연구
- [GitClear: AI Code Quality 2025](https://www.gitclear.com/ai_assistant_code_quality_2025_research)
- [LeadDev: AI Generated Code Technical Debt](https://leaddev.com/software-quality/how-ai-generated-code-accelerates-technical-debt)

### 공식 문서
- [SonarQube Metrics](https://docs.sonarsource.com/sonarqube-server/latest/user-guide/code-metrics/metrics-definition/)
- [ESLint Complexity Rule](https://eslint.org/docs/latest/rules/complexity)
- [Google Engineering Practices](https://google.github.io/eng-practices/review/)

### 클래식 참고자료
- [Martin Fowler - Code Smell](https://martinfowler.com/bliki/CodeSmell.html)
- [Code Smells Catalog](https://luzkan.github.io/smells/)
