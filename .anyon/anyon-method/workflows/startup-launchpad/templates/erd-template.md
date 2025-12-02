# {{project_name}} - Entity Relationship Diagram (ERD)

**Created:** {{date}}
**Generated:** Automatically from PRD, UX, TRD, and Architecture
**Version:** 1.0

---

## Database Overview

**Database System:** {{database}} (from TRD)
**ORM/Client:** {{orm}} (from TRD)

---

## Entity Definitions

### Entity 1: {{entity_1_name}}

**Purpose:** {{entity_1_purpose}}

**Attributes:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| {{entity_1_col_1}} | {{entity_1_type_1}} | {{entity_1_constraint_1}} | {{entity_1_desc_1}} |
| {{entity_1_col_2}} | {{entity_1_type_2}} | {{entity_1_constraint_2}} | {{entity_1_desc_2}} |
| {{entity_1_col_3}} | {{entity_1_type_3}} | {{entity_1_constraint_3}} | {{entity_1_desc_3}} |

**Indexes:**
- {{entity_1_index_1}}
- {{entity_1_index_2}}

**Relationships:**
- {{entity_1_relationship_1}}
- {{entity_1_relationship_2}}

---

### Entity 2: {{entity_2_name}}

**Purpose:** {{entity_2_purpose}}

**Attributes:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| {{entity_2_col_1}} | {{entity_2_type_1}} | {{entity_2_constraint_1}} | {{entity_2_desc_1}} |
| {{entity_2_col_2}} | {{entity_2_type_2}} | {{entity_2_constraint_2}} | {{entity_2_desc_2}} |
| {{entity_2_col_3}} | {{entity_2_type_3}} | {{entity_2_constraint_3}} | {{entity_2_desc_3}} |

**Indexes:**
- {{entity_2_index_1}}

**Relationships:**
- {{entity_2_relationship_1}}

---

_[Additional entities follow same pattern]_

---

## Relationships

### One-to-Many Relationships

```
{{one_to_many_relationships}}
```

### Many-to-Many Relationships

```
{{many_to_many_relationships}}
```

**Junction Tables:**
{{junction_tables}}

---

## ERD Diagram

```
{{erd_diagram}}
```

---

## Database Schema (SQL)

### Create Tables

```sql
{{create_table_statements}}
```

### Create Indexes

```sql
{{create_index_statements}}
```

### Create Foreign Keys

```sql
{{create_foreign_key_statements}}
```

---

## Migration Strategy

### Initial Migration

```{{migration_language}}
{{initial_migration_code}}
```

### Migration Tools

**Tool:** {{migration_tool}}
**Command:** {{migration_command}}

---

## Indexes and Optimization

### Performance Indexes

{{performance_indexes}}

**Rationale:** {{index_rationale}}

### Query Optimization

{{query_optimization_notes}}

---

## Sample Queries

### Query 1: {{query_1_purpose}}

```sql
{{query_1_sql}}
```

---

### Query 2: {{query_2_purpose}}

```sql
{{query_2_sql}}
```

---

### Query 3: {{query_3_purpose}}

```sql
{{query_3_sql}}
```

---

## Data Constraints

### Business Rules

{{business_rules}}

### Data Validation

{{data_validation_rules}}

### Referential Integrity

{{referential_integrity}}

---

## Seed Data (Development)

```{{seed_language}}
{{seed_data}}
```

---

## Backup and Maintenance

### Backup Strategy

{{backup_strategy}}

### Maintenance Tasks

{{maintenance_tasks}}

---

## Feature-to-Entity Mapping

| PRD Feature | Primary Entities | Related Tables | Queries |
|-------------|-----------------|----------------|---------|
| {{feature_1}} | {{feature_1_entities}} | {{feature_1_tables}} | {{feature_1_queries}} |
| {{feature_2}} | {{feature_2_entities}} | {{feature_2_tables}} | {{feature_2_queries}} |
| {{feature_3}} | {{feature_3_entities}} | {{feature_3_tables}} | {{feature_3_queries}} |

---

## Scalability Considerations

### Partitioning Strategy

{{partitioning_strategy}}

### Sharding (if applicable)

{{sharding_approach}}

### Read Replicas

{{read_replica_strategy}}

---

## References

- PRD: Data requirements from features
- UX Design: Data needs from user flows
- TRD: Database selection and technology
- Architecture: Data access patterns
