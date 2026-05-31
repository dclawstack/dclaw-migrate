# PRODUCT-SPEC: DClaw Migrate

> Sources of truth: `REVISED-PRD.md` (v2.3, authoritative on features), `PLAN-v1.4.md` (roadmap), `AGENTS.md` (architecture rules).  
> When this file conflicts with `AGENTS.md`, `AGENTS.md` wins on architecture. When this file conflicts with `REVISED-PRD.md`, `REVISED-PRD.md` wins on features.

---

## Overview

| Field | Value |
|-------|-------|
| **App Name** | DClaw Migrate |
| **Category** | Infrastructure |
| **Tagline** | AI-guided cloud & database migration platform |
| **Backend Port** | `8121` (Docker) · `8033` (local dev) |
| **Frontend Port** | `3035` (Docker) · `3033` (local dev, `npm run dev`) |
| **Database** | `dclaw_migrate` (PostgreSQL 16) |
| **Base API Path** | `/api/v1` |
| **Health Endpoint** | `GET /health → {"status": "ok"}` |
| **Target Users** | DevOps engineers, DBAs, platform teams running cloud or DB migrations |
| **AI Stack** | OpenRouter (Kimi K2, primary) → Ollama (llama3, fallback) |

---

## Domain Models (12 tables)

### Connection
Represents a source or target database endpoint.

```
Connection
├── id: UUID (PK)
├── name: str (required)
├── connection_type: str — "postgresql" | "mysql" | "mongodb" | "mssql" | "aws_rds" | "gcp_cloudsql" | "azure_sql"
├── role: str — "source" | "target"
├── host: str (required)
├── port: int (required)
├── database_name: str (required)
├── username: str (required)
├── password_secret: str (stored as secret ref — never plaintext)
├── ssl_enabled: bool (default false)
├── status: str — "unchecked" | "ok" | "error" (default: "unchecked")
├── last_tested_at: datetime (nullable)
├── created_at: datetime
└── updated_at: datetime
```

### MigrationJob
A migration task pairing a source and target connection.

```
MigrationJob
├── id: UUID (PK)
├── name: str (required)
├── description: str (nullable)
├── source_connection_id: UUID (FK → Connection, ondelete=SET NULL, nullable)
├── target_connection_id: UUID (FK → Connection, ondelete=SET NULL, nullable)
├── wave_id: UUID (FK → MigrationWave, ondelete=SET NULL, nullable)
├── migration_type: str — "full_load" | "cdc" | "schema_only" (default: "full_load")
├── status: str — "draft" | "ready" | "running" | "paused" | "completed" | "failed" (default: "draft")
├── scheduled_at: datetime (nullable)
├── started_at: datetime (nullable)
├── completed_at: datetime (nullable)
├── created_at: datetime
└── updated_at: datetime
```

**Relationships:** `source_connection` (selectin), `target_connection` (selectin), `wave` (selectin)

### MigrationWave
Groups migration jobs into ordered, sequenced batches.

```
MigrationWave
├── id: UUID (PK)
├── name: str (required)
├── sequence_order: int (default 1)
├── description: str (nullable)
├── status: str — "planned" | "in_progress" | "completed" | "failed" (default: "planned")
├── risk_level: str — "low" | "medium" | "high" (default: "medium")
├── created_at: datetime
└── updated_at: datetime
```

**Relationships:** `jobs` → list[MigrationJob] (selectin)

### SchemaMapping
A single table or column-level mapping between source and target.

```
SchemaMapping
├── id: UUID (PK)
├── job_id: UUID (FK → MigrationJob, ondelete=CASCADE)
├── source_table: str (required)
├── target_table: str (required)
├── source_column: str (nullable — null means table-level mapping)
├── target_column: str (nullable)
├── transform_rule: str (nullable — SQL expression or AI-generated rule)
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
├── level: str — "info" | "warning" | "error" (required)
├── message: str (required)
├── rows_processed: int (nullable)
└── created_at: datetime
```

### ValidationReport
Post-migration integrity check results at the table level.

```
ValidationReport
├── id: UUID (PK)
├── job_id: UUID (FK → MigrationJob, ondelete=CASCADE)
├── table_name: str (required)
├── source_row_count: int (required)
├── target_row_count: int (required)
├── checksum_match: bool (required)
├── sample_mismatches: int (default 0)
├── status: str — "passed" | "failed" | "partial" (required)
├── detail: str (nullable — JSON blob with sample diffs)
└── created_at: datetime
```

### CutoverPlan
Orchestrates the final traffic-switch for a migration job.

```
CutoverPlan
├── id: UUID (PK)
├── job_id: UUID (FK → MigrationJob, ondelete=CASCADE, unique)
├── strategy: str — "blue-green" | "direct" | "phased" (default: "blue-green")
├── status: str — "planned" | "executing" | "completed" | "rolled_back" (default: "planned")
├── planned_at: datetime (nullable)
├── started_at: datetime (nullable)
├── completed_at: datetime (nullable)
├── rolled_back_at: datetime (nullable)
├── pre_checks: str (nullable — checklist JSON)
├── post_checks: str (nullable — checklist JSON)
├── rollback_procedure: str (nullable — step-by-step text)
├── notes: str (nullable)
├── created_at: datetime
└── updated_at: datetime
```

### ApplicationAsset
Tracks an application or service being migrated.

```
ApplicationAsset
├── id: UUID (PK)
├── name: str (required)
├── asset_type: str (required — e.g. "web_app", "database", "service", "vm")
├── migration_strategy: str — "lift-and-shift" | "re-platform" | "refactor" | "repurchase" | "retire" | "retain" (default: "lift-and-shift")
├── current_host: str (nullable)
├── target_host: str (nullable)
├── status: str — "pending" | "in_progress" | "completed" | "blocked" (default: "pending")
├── effort_estimate_days: int (nullable)
├── risk_level: str — "low" | "medium" | "high" (default: "medium")
├── notes: str (nullable)
├── containerization_plan: str (nullable — AI-generated or manual)
├── cloud_strategy: str (nullable — AI-generated or manual)
├── created_at: datetime
└── updated_at: datetime
```

### OptimizationRec
AI-generated optimization recommendation for a completed migration job.

```
OptimizationRec
├── id: UUID (PK)
├── job_id: UUID (FK → MigrationJob, ondelete=CASCADE)
├── category: str — "cost" | "performance" | "security" | "reliability" (required)
├── title: str (required)
├── description: str (required)
├── estimated_savings: str (nullable — e.g. "~$200/month")
├── priority: str — "low" | "medium" | "high" (default: "medium")
├── status: str — "pending" | "accepted" | "dismissed" (default: "pending")
├── created_at: datetime
└── updated_at: datetime
```

### Runbook
Step-by-step operational playbook for a migration job.

```
Runbook
├── id: UUID (PK)
├── job_id: UUID (FK → MigrationJob, ondelete=CASCADE)
├── title: str (required)
├── runbook_type: str — "pre_migration" | "cutover" | "rollback" | "post_migration" (required)
├── content: str (required — markdown text)
├── created_at: datetime
└── updated_at: datetime
```

### TestCase
Verification test case for a migration job.

```
TestCase
├── id: UUID (PK)
├── job_id: UUID (FK → MigrationJob, ondelete=CASCADE)
├── name: str (required)
├── description: str (nullable)
├── test_type: str — "row_count" | "checksum" | "sample" | "custom" (required)
├── query_source: str (nullable — SQL to run against source)
├── query_target: str (nullable — SQL to run against target)
├── expected_result: str (nullable)
├── actual_result: str (nullable — populated after run)
├── status: str — "pending" | "passed" | "failed" | "error" (default: "pending")
├── error_message: str (nullable)
├── created_at: datetime
└── updated_at: datetime
```

---

## UI Screens

### Screen 1: Landing / Home (`/`)
- Product overview hero
- Feature highlights and navigation to key sections

### Screen 2: Dashboard (`/dashboard`)
- Summary cards: total jobs, running, completed, failed
- Recent execution log feed (last entries across all jobs)
- Jobs by status visualization
- Quick actions: New Connection, New Job

### Screen 3: Connections (`/connections`)
- Table: name, type, role, status, last tested date
- Test connection button (updates status + latency)
- Add / edit / delete modal forms
- SSL toggle, connection type selector

### Screen 4: Migration Jobs (`/jobs`)
- Table: name, type, source → target connections, status, start time
- Color-coded status badges
- Run / cancel controls per row
- "New Job" form

### Screen 5: Job Detail (`/jobs/[id]`)
- Job info card (editable name, description, type)
- **Schema Mapper tab:** table/column mapping grid; Auto-discover button; transform rule editor; exclude toggle
- **Execution Log tab:** paginated log stream; filter by level (info / warning / error)
- **Validation tab:** per-table pass/fail grid; row count delta; checksum status
- **Test Cases tab:** list; generate and run test cases
- **Runbooks tab:** list; generate and edit runbooks
- **Cutover tab:** plan status; pre/post checklist; execute / rollback controls
- **Optimization tab:** AI recommendations; accept / dismiss per item

### Screen 6: Wave Planning (`/waves`)
- Wave list with sequence order, status, risk level
- Add/remove jobs from waves
- Create and edit waves

### Screen 7: Asset Inventory (`/assets`)
- Table: name, type, strategy, host, status, effort, risk
- Create/edit asset forms with strategy selector
- Notes and AI-generated plans

### Screen 8: Cutover (`/cutover`)
- Cross-job cutover status overview

### Screen 9: Optimization (`/optimization`)
- Cross-job optimization recommendations

### Screen 10: Testing (`/testing`)
- Cross-job test results overview

### Screen 11: Runbooks (`/runbooks`)
- Cross-job runbook library

### AI Copilot Panel (global, `CopilotPanel.tsx`)
- Floating sidebar accessible from every page
- Chat interface with job-context awareness
- Suggests next actions based on current job state
- Falls back to local Ollama when OpenRouter key absent

---

## API Endpoints (current implementation)

### System

```
GET  /health                              → {"status": "ok"}
GET  /api/v1/dashboard                    → DashboardStats
```

### Connections (6 routes)

```
GET    /api/v1/connections                → ConnectionListResponse
POST   /api/v1/connections                → ConnectionRead (201)
GET    /api/v1/connections/{id}           → ConnectionRead
PUT    /api/v1/connections/{id}           → ConnectionRead
DELETE /api/v1/connections/{id}           → 204
POST   /api/v1/connections/{id}/test      → {"ok": bool, "latency_ms": int}
```

### Migration Jobs (7 routes)

```
GET    /api/v1/jobs                       → MigrationJobListResponse
POST   /api/v1/jobs                       → MigrationJobRead (201)
GET    /api/v1/jobs/{id}                  → MigrationJobRead
PUT    /api/v1/jobs/{id}                  → MigrationJobRead
DELETE /api/v1/jobs/{id}                  → 204
POST   /api/v1/jobs/{id}/run              → MigrationJobRead (status: "running")
POST   /api/v1/jobs/{id}/cancel           → MigrationJobRead (status: "failed")
```

**State machine:** `draft` → `running` (via `/run`); `running` → `failed` (via `/cancel`) or `completed` (engine). Editing a running job returns 409.

### Schema Mappings (5 routes)

```
GET    /api/v1/jobs/{id}/mappings          → list[SchemaMappingRead]
POST   /api/v1/jobs/{id}/mappings          → SchemaMappingRead (201)
PUT    /api/v1/jobs/{id}/mappings/{mid}    → SchemaMappingRead
DELETE /api/v1/jobs/{id}/mappings/{mid}   → 204
POST   /api/v1/jobs/{id}/discover         → DiscoverResponse (draft mappings from live introspection)
```

> **Schema discovery limitation:** Only PostgreSQL-family sources supported (`postgresql`, `aws_rds`, `gcp_cloudsql`, `azure_sql`). Other types return 400.

### Execution Logs (1 route)

```
GET    /api/v1/jobs/{id}/logs             → ExecutionLogListResponse (paginated, ?level=info|warning|error)
```

### Validation (2 routes)

```
GET    /api/v1/jobs/{id}/validations      → list[ValidationReportRead]
POST   /api/v1/jobs/{id}/validate         → ValidationRunResponse
```

### Cutover (6 routes)

```
GET    /api/v1/jobs/{id}/cutover          → CutoverPlanRead
POST   /api/v1/jobs/{id}/cutover          → CutoverPlanRead (201)
PUT    /api/v1/jobs/{id}/cutover          → CutoverPlanRead
POST   /api/v1/jobs/{id}/cutover/execute  → CutoverPlanRead (status: "executing")
POST   /api/v1/jobs/{id}/cutover/complete → CutoverPlanRead (status: "completed")
POST   /api/v1/jobs/{id}/cutover/rollback → CutoverPlanRead (status: "rolled_back")
```

### Test Cases (3 routes)

```
GET    /api/v1/jobs/{id}/test-cases       → list[TestCaseRead]
POST   /api/v1/jobs/{id}/generate-tests   → list[TestCaseRead] (AI-generated)
POST   /api/v1/jobs/{id}/run-tests        → TestRunResponse
```

### Optimization (3 routes)

```
GET    /api/v1/jobs/{id}/optimizations        → list[OptimizationRecRead]
POST   /api/v1/jobs/{id}/optimize             → OptimizationRunResponse (AI-generated)
POST   /api/v1/jobs/{id}/optimizations/{rid}  → OptimizationRecRead (accept/dismiss)
```

### Runbooks (5 routes)

```
GET    /api/v1/jobs/{id}/runbooks              → list[RunbookRead]
POST   /api/v1/jobs/{id}/runbooks              → RunbookRead (201)
PUT    /api/v1/jobs/{id}/runbooks/{rid}        → RunbookRead
DELETE /api/v1/jobs/{id}/runbooks/{rid}        → 204
POST   /api/v1/jobs/{id}/runbooks/generate     → RunbookRead (AI-generated, 201)
```

### Waves (7 routes)

```
GET    /api/v1/waves                      → list[MigrationWaveRead]
POST   /api/v1/waves                      → MigrationWaveRead (201)
GET    /api/v1/waves/{id}                 → MigrationWaveRead
PUT    /api/v1/waves/{id}                 → MigrationWaveRead
DELETE /api/v1/waves/{id}                 → 204
POST   /api/v1/waves/{id}/jobs            → MigrationWaveRead (adds job_id to wave)
DELETE /api/v1/waves/{id}/jobs/{job_id}   → MigrationWaveRead (removes job from wave)
```

### Application Assets (5 routes)

```
GET    /api/v1/assets                     → ApplicationAssetListResponse
POST   /api/v1/assets                     → ApplicationAssetRead (201)
GET    /api/v1/assets/{id}                → ApplicationAssetRead
PUT    /api/v1/assets/{id}                → ApplicationAssetRead
DELETE /api/v1/assets/{id}                → 204
```

### AI Copilot (8 routes)

All AI endpoints accept `{"message": str, "job_id"?: UUID, "history"?: list[dict]}` and return `{"reply": str}`.

```
POST   /api/v1/ai/migrate-chat        Context-aware migration Q&A (uses job schema + connection context)
POST   /api/v1/ai/suggest-mappings    Column-level mapping suggestions for a job
POST   /api/v1/ai/assess-risk         Risk assessment with mitigation steps for a job
POST   /api/v1/ai/plan-waves          AI wave grouping and sequencing optimization
POST   /api/v1/ai/assess-application  Effort estimate + strategy recommendation per asset
POST   /api/v1/ai/plan-cutover        Cutover checklist and timing recommendations
POST   /api/v1/ai/cloud-strategy      Cloud provider comparison for a workload
POST   /api/v1/ai/containerize        Containerization guidance and Dockerfile suggestions
```

---

## AI Provider Configuration

```
if OPENROUTER_API_KEY is set:
    → POST https://openrouter.ai/api/v1/chat/completions
    → model: moonshotai/kimi-k2 (default)
    → timeout: 60s, max_tokens: 2048, temperature: 0.3

elif OLLAMA_BASE_URL is set:
    → POST {OLLAMA_BASE_URL}/api/chat
    → model: OLLAMA_MODEL (default: llama3)
    → stream: false

else:
    → raise RuntimeError at call time (surfaced as HTTP 502)
```

The system prompt is injected per-endpoint with domain context. For `/migrate-chat`, the job's connection types, migration type, status, and table list are appended to the context when `job_id` is provided.

---

## Non-Functional Requirements

- **Tests:** 44 test files, 214 test cases via pytest + pytest-asyncio; integration tests hit a real PostgreSQL (not mocked)
- **No mock data:** All state persisted to PostgreSQL; `NullPool` used in tests to prevent connection reuse across test isolation drops
- **Docker healthchecks:** Backend uses `python urllib.request.urlopen()`; never `curl` (not present in slim image)
- **Frontend build:** `npm run build` must pass; `package-lock.json` committed; `ARG NEXT_PUBLIC_API_URL` declared before `RUN npm run build` in Dockerfile
- **Styling:** Tailwind CSS + pre-built `src/components/ui/` — do NOT install shadcn CLI or `@base-ui/react`
- **Secrets:** `password_secret` stored as secret reference (K8s Secret / `.env`); never plaintext in DB
- **Alembic:** Every new model gets a migration; 4 versions currently applied (`initial_schema`, `schema_mappings_and_logs`, `validation_reports`, `p1_p2_features`)
- **Auth:** Logto JWT via `require_auth` dependency on all `/api/v1/` routes; disabled when `LOGTO_ISSUER=""` (local dev default)
- **CORS:** `allow_origins` must be an explicit list in production — never `["*"]` with `allow_credentials=True`

---

## Implementation Status

| Feature | Backend | Frontend | AI |
|---------|---------|----------|-----|
| Connections CRUD + test | ✅ | ✅ | — |
| Migration Jobs CRUD + run/cancel | ✅ | ✅ | — |
| Schema Discovery (PostgreSQL family) | ✅ | ✅ | — |
| Schema Mappings CRUD | ✅ | ✅ | — |
| Execution Logs | ✅ | ✅ | — |
| Validation Reports | ✅ | ✅ | — |
| Migration Waves | ✅ | ✅ | — |
| Application Asset Inventory | ✅ | ✅ | — |
| Cutover Management | ✅ | ✅ | — |
| Test Cases (generate + run) | ✅ | ✅ | ✅ |
| Optimization Recommendations | ✅ | ✅ | ✅ |
| Runbook Generation | ✅ | ✅ | ✅ |
| AI Migration Chat | ✅ | ✅ | ✅ |
| AI Mapping Suggestions | ✅ | ✅ | ✅ |
| AI Risk Assessment | ✅ | ✅ | ✅ |
| AI Wave Planning | ✅ | — | ✅ |
| AI App Assessment | ✅ | — | ✅ |
| AI Cutover Planning | ✅ | — | ✅ |
| AI Cloud Strategy | ✅ | — | ✅ |
| AI Containerization | ✅ | — | ✅ |
| Dashboard stats | ✅ | ✅ | — |
| Rate limiting | ❌ | — | — |
| Observability (Sentry) | ❌ | ❌ | — |
| Product analytics | ❌ | ❌ | — |

---

*Last updated: 2026-05-31 · Aligned with REVISED-PRD.md v2.3 and PLAN-v1.4.md*
