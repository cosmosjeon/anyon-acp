# [Area] Codebase Audit Report

**Audit Date:** {{DATE}}
**Scope:** {{SCOPE}}
**Total Files Analyzed:** {{FILE_COUNT}}

---

## Executive Summary

| Severity | Count | Impact |
|----------|-------|--------|
| **Critical** | {{CRITICAL}} | High - Immediate attention required |
| **Warning** | {{WARNING}} | Medium - Should be addressed soon |
| **Info** | {{INFO}} | Low - Future improvement opportunities |

### Maintainability Score: {{SCORE}}/10

---

## 1. AI-Generated Code Issues (Priority)

### 1.1 Duplicated Code Patterns

**Issue**: {{ISSUE_DESCRIPTION}}
**Locations**: {{LOCATIONS}}
**Recommendation**: {{RECOMMENDATION}}

### 1.2 Context Ignorance

**Issue**: {{ISSUE_DESCRIPTION}}
**Locations**: {{LOCATIONS}}
**Recommendation**: {{RECOMMENDATION}}

---

## 2. Bloaters

### 2.1 Long Files (>500 lines)

| File | Lines | Severity |
|------|-------|----------|
| {{FILE}} | {{LINES}} | {{SEVERITY}} |

### 2.2 Long Functions (>50 lines)

| File | Function | Lines | Severity |
|------|----------|-------|----------|
| {{FILE}} | {{FUNCTION}} | {{LINES}} | {{SEVERITY}} |

---

## 3. Dispensables

### 3.1 Dead Code

{{DEAD_CODE_LIST}}

### 3.2 Duplicated Code

{{DUPLICATED_CODE_LIST}}

---

## 4. SOLID Violations

### Single Responsibility Principle

{{SRP_VIOLATIONS}}

---

## 5. Technical Debt

### 5.1 TODO/FIXME Comments

| File | Line | Comment |
|------|------|---------|
| {{FILE}} | {{LINE}} | {{COMMENT}} |

### 5.2 Type Safety Issues

{{TYPE_ISSUES}}

### 5.3 Hardcoded Values

{{HARDCODED_VALUES}}

---

## File-by-File Issue List

| File | Critical | Warning | Info | Issues |
|------|----------|---------|------|--------|
| {{FILE}} | {{CRITICAL}} | {{WARNING}} | {{INFO}} | {{ISSUES}} |

---

## Recommendations Priority

### P0 (Immediate)
1. {{RECOMMENDATION_1}}
2. {{RECOMMENDATION_2}}

### P1 (This Sprint)
1. {{RECOMMENDATION_3}}
2. {{RECOMMENDATION_4}}

### P2 (Next Sprint)
1. {{RECOMMENDATION_5}}
2. {{RECOMMENDATION_6}}

---

**Report Generated:** {{TIMESTAMP}}
**Auditor:** Claude Code Analysis
