# PRODUCT-SPEC: DClaw Migrate

> Sources of truth: `REVISED-PRD.md` (v2.3, authoritative), `PLAN-v1.2.md` (feature roadmap), `AGENTS.md` (architecture rules).
> When this file conflicts with `AGENTS.md`, `AGENTS.md` wins on architecture. When this file conflicts with `REVISED-PRD.md`, `REVISED-PRD.md` wins on features.

---

## Overview

| Field | Value |
|-------|-------|
| **App Name** | DClaw Migrate |
| **Category** | Infrastructure |
| **Tagline** | Cloud & database migration with AI guidance |
| **Backend Port** | `8033` (FastAPI) |
| **Frontend Port** | `3033` (Next.js) |
| **Database** | `dclaw_migrate` (PostgreSQL) |
| **Base API Path** | `/api/v1` |
| **Target Users** | DevOps engineers, DBAs, platform teams running cloud or DB migrations |

---

## Core Entities

### Connection
Represents a source or target endpoint (database or cloud).

```
Connection
├── id: UUID (PK)
├── name: str (required)
├── connection_type: enum ["postgresql", "mysql", "mongodb", "mssql", "aws_rds", "gcp_cloudsql", "azure_sql"] (required)
├── role: enum ["source", "target"] (required)
├── host: str (required)
├── port: int (required)
├── database_name: str (required)
├── username: str (required)
├── password_secret: str (required, stored as secret ref — never plaintext)
├── ssl_enabled: bool (default false)
├── status: enum ["unchecked", "ok", "error"] (default: "unchecked")
├── last_tested_at: datetime (optional)
├── created_at: datetime
└── updated_at: datetime
```

### MigrationJob
A migration task pairing a source and target connection.

```
MigrationJob
├── id: UUID (PK)
├── name: str (required)
├── description: str (optional)
├── source_connection_id: UUID (FK → Connection, ondelete=SET NULL)
├── target_connection_id: UUID (FK → Connection, ondelete=SET NULL)
├── migration_type: enum ["full_load", "cdc", "schema_only"] (default: "full_load")
├── status: enum ["draft", "ready", "running", "paused", "completed", "failed"] (default: "draft")
├── scheduled_at: datetime (optional)
├── started_at: datetime (optional)
├── completed_at: datetime (optional)
├── created_at: datetime
└── updated_at: datetime
```

### SchemaMapping
A single table/column mapping between source and target.

```
SchemaMapping
├── id: UUID (PK)
├── job_id: UUID (FK → MigrationJob, ondelete=CASCADE)
├── source_table: str (required)
├── target_table: str (required)
├── source_column: str (optional — null means table-level mapping)
├── target_column: str (optional)
├── transform_rule: str (optional — SQL expression or AI-generated transform)
├── is_excluded: bool (default false)
├── created_at: datetime
└── updated_at: datetime
```

### ExecutionLog
Append-only log entries for a job run.

```
ExecutionLog
├── id: UUID (PK)
├── job_id: UUID (FK → MigrationJob, ondelete=CASCADE)
├── level: enum ["info", "warning", "error"] (required)
├── message: str (required)
├── rows_processed: int (optional)
├── created_at: datetime
```

### ValidationReport
Post-migration integrity check results.

```
ValidationReport
├── id: UUID (PK)
├── job_id: UUID (FK → MigrationJob, ondelete=CASCADE)
├── table_name: str (required)
├── source_row_count: int (required)
├── target_row_count: int (required)
├── checksum_match: bool (required)
├── sample_mismatches: int (default 0)
├── status: enum ["passed", "failed", "partial"] (required)
├── detail: str (optional — JSON blob with sample diffs)
├── created_at: datetime
```

---

## User Stories / Screens

### Screen 1: Dashboard
- Summary cards: total jobs, running jobs, completed today, failed jobs
- Recent execution log feed (last 20 entries across all jobs)
- Jobs by status bar chart
- Quick actions: New Connection, New Job

### Screen 2: Connections
- Table: name, type, role, status, last tested
- Test connection button (pings the endpoint and updates status)
- "Add Connection" form/modal with all fields
- Edit / delete per row

### Screen 3: Migration Jobs
- Table: name, type, source → target, status, scheduled/started time
- Status badges with colour coding
- "New Job" form (name, type, pick source + target connections)
- Run / pause / cancel actions per row

### Screen 4: Job Detail
- Job info card (editable)
- **Schema Mapper tab:** table/column mappings grid; auto-discover button triggers backend introspection; editable transform rules; exclude toggle per row
- **Execution Log tab:** paginated, filterable by level (info/warning/error); live-updates while job is running
- **Validation tab:** table-level pass/fail grid; row count diff; checksum status

### Screen 5: Schema Discovery (modal/wizard)
- Triggered from Job Detail → "Discover Schema"
- Connects to source, lists tables with row counts
- AI suggests target table/column mappings with type conversions
- User reviews, edits, and confirms before saving SchemaMappings

### Screen 6: AI Migration Copilot (global panel)
- Floating sidebar or drawer, accessible from every page
- Chat interface: "How do I migrate MySQL → PostgreSQL with zero downtime?"
- Context-aware: knows the active job, source/target connection types, and schema
- Suggests next actions: run validation, fix mapping for `user_id`, schedule cutover
- Falls back to local Ollama when cloud LLM is unavailable

---

## AI Features

From `PLAN-v1.2.md` (P0) and `REVISED-PRD.md` §5:

| Feature | Description | Backend endpoint |
|---------|-------------|-----------------|
| **AI Migration Copilot** | Chat that plans migrations, suggests mappings, troubleshoots failures. RAG over migration patterns. | `POST /api/v1/ai/migrate-chat` |
| **Schema Auto-Mapping** | LLM suggests target column/type from source schema context. | `POST /api/v1/ai/suggest-mappings` |
| **AI Data Transform** | Generate transform rules (normalization, enrichment) from examples. | `POST /api/v1/ai/suggest-transforms` |
| **Migration Risk Assessment** | Given a job config, identify top risks and mitigation steps. | `POST /api/v1/ai/assess-risk` |

AI stack: OpenRouter + Kimi K2.5 (cloud), Ollama fallback (local). See `REVISED-PRD.md` §4.

---

## API Endpoints (v1.0)

```
# Connections
GET    /api/v1/connections              → List connections
POST   /api/v1/connections              → Create connection
GET    /api/v1/connections/{id}         → Get connection
PUT    /api/v1/connections/{id}         → Update connection
DELETE /api/v1/connections/{id}         → Delete connection
POST   /api/v1/connections/{id}/test    → Test connectivity → { "ok": bool, "latency_ms": int }

# Migration Jobs
GET    /api/v1/jobs                     → List jobs
POST   /api/v1/jobs                     → Create job
GET    /api/v1/jobs/{id}                → Get job
PUT    /api/v1/jobs/{id}                → Update job
DELETE /api/v1/jobs/{id}                → Delete job
POST   /api/v1/jobs/{id}/run            → Start migration
POST   /api/v1/jobs/{id}/pause          → Pause migration
POST   /api/v1/jobs/{id}/cancel         → Cancel migration

# Schema Mappings
GET    /api/v1/jobs/{id}/mappings       → List mappings for job
POST   /api/v1/jobs/{id}/mappings       → Create/bulk-upsert mappings
DELETE /api/v1/jobs/{id}/mappings/{mid} → Delete mapping
POST   /api/v1/jobs/{id}/discover       → Introspect source schema → create draft mappings

# Execution Logs
GET    /api/v1/jobs/{id}/logs           → List logs (paginated, filter by level)

# Validation Reports
GET    /api/v1/jobs/{id}/validations    → List validation reports for job
POST   /api/v1/jobs/{id}/validate       → Trigger post-migration validation

# AI
POST   /api/v1/ai/migrate-chat          → Chat with migration copilot
POST   /api/v1/ai/suggest-mappings      → Get AI mapping suggestions for a job
POST   /api/v1/ai/suggest-transforms    → Get AI transform rule suggestions
POST   /api/v1/ai/assess-risk           → Risk assessment for a job config

# Health
GET    /health                          → { "status": "ok" }
GET    /api/v1/dashboard                → Aggregate stats for Dashboard screen
```

---

## Non-Functional Requirements

- **Tests:** 70%+ coverage; every endpoint covered; `pytest-asyncio==0.24.0` pinned
- **No mock data:** all state persisted to PostgreSQL
- **Docker:** `docker compose up -d` starts all services healthy; healthcheck uses `python urllib.request.urlopen()` — never `curl`
- **Frontend build:** `npm run build` must pass; `package-lock.json` committed
- **Styling:** Tailwind + pre-built `src/components/ui/` — do NOT install shadcn CLI or `@base-ui/react`
- **Env vars:** `NEXT_PUBLIC_API_URL` baked at build time; Dockerfile MUST declare `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`
- **Secrets:** passwords stored as secret references (K8s Secrets / `.env`); never persisted as plaintext in DB
- **Alembic:** every new model gets a migration; no schema drift

---

## Implementation Order

Follows `PLAN-v1.2.md` priority, adapted for this entity model:

| Week | Task |
|------|------|
| 1–2 | Connections CRUD + test endpoint; MigrationJobs CRUD; Dashboard stats |
| 3–4 | Schema Discovery (introspection engine); SchemaMapping CRUD; ExecutionLog |
| 5–6 | AI Migration Copilot (`/ai/migrate-chat`); AI suggest-mappings |
| 7–8 | Validation engine + ValidationReport; AI risk assessment; CDC groundwork |
