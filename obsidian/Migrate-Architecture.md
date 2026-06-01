# DClaw Migrate — Architecture Reference

> Source of truth: `AGENTS.md` (architecture rules) · `PRODUCT-SPEC.md` (data models + API)
> Last updated: 2026-06-01 · **v1.4**

---

## Ports & Identity

| Item | Value |
|---|---|
| Backend (Docker) | FastAPI on port **8121** |
| Backend (local dev) | FastAPI on port **8033** (`uvicorn ... --port 8033`) |
| Frontend (Docker) | Next.js `web/` on port **3035** |
| Frontend (local dev) | Next.js `web/` on port **3033** (`npm run dev`) |
| Database | PostgreSQL `dclaw_migrate` · port **5432** |
| Base API path | `/api/v1` |
| Health endpoint | `GET /health → {"status": "ok"}` |
| API docs (Docker) | http://localhost:8121/docs |
| API docs (local) | http://localhost:8033/docs |
| Vercel prod URL | https://dclaw-migrate-web.vercel.app |

---

## Stack (Locked)

**Backend**
- FastAPI with `lifespan` handler
- SQLAlchemy 2.0 — `DeclarativeBase` from `app.models.base`, `Mapped`/`mapped_column()` style
- Pydantic v2 — schemas in `app/repositories/`, `ConfigDict(from_attributes=True)`
- Async: `create_async_engine` + `AsyncSession` + `asyncpg` driver
- Repository pattern — all DB access in `app/repositories/`
- DI: `Depends(get_db)` — never manual `AsyncSession`
- Auth: Logto JWT via `python-jose` — `require_auth` dependency on all `/api/v1/*` routes; disabled when `LOGTO_ISSUER=""`
- AI HTTP client: `httpx` async (60s timeout)

**Frontend**
- Next.js 14.2 App Router — TypeScript strict mode
- Tailwind CSS + pre-built design system in `web/src/components/ui/`
- `NEXT_PUBLIC_API_URL` baked at Docker build time via `ARG`
- `CopilotPanel.tsx` — global floating AI sidebar, mounts in `AppShell.tsx`
- `AppShell.tsx` — nav + layout wrapper for all app pages

**Docker**
- Backend: `python:3.11-slim`, non-root user, `pip install -r requirements.txt`
- Frontend: `node:20-alpine`, multi-stage, `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`
- Postgres: `postgres:16-alpine`
- Backend healthcheck: `python urllib.request.urlopen()` (never `curl` — not installed in slim)
- Frontend healthcheck: `wget -q --spider`

---

## AI Layer

All LLM calls go through `backend/app/services/ai_copilot.py`.

**Provider selection (checked in order):**
1. `OPENROUTER_API_KEY` set → `POST https://openrouter.ai/api/v1/chat/completions` · model: `moonshotai/kimi-k2`
2. `OLLAMA_BASE_URL` set → `POST {OLLAMA_BASE_URL}/api/chat` · model: `OLLAMA_MODEL` (default: `llama3`)
3. Neither set → `RuntimeError` at call time → surfaces as HTTP 502

**Settings:** 60s timeout · 2048 max tokens · temperature 0.3 · stream: false

**AI endpoints (8 total):**

| Endpoint | Context injected | Primary use |
|---|---|---|
| `POST /api/v1/ai/migrate-chat` | Job name, type, status, connections, tables | General migration Q&A |
| `POST /api/v1/ai/suggest-mappings` | Job + schema mappings | Column type mapping |
| `POST /api/v1/ai/assess-risk` | Job + connection types + migration type | Pre-migration risk report |
| `POST /api/v1/ai/plan-waves` | Wave list + job list | Wave grouping + sequencing |
| `POST /api/v1/ai/assess-application` | Asset type, current platform, strategy | Effort estimate |
| `POST /api/v1/ai/plan-cutover` | Job status + validation results | Cutover checklist |
| `POST /api/v1/ai/cloud-strategy` | Asset workload description | Cloud provider comparison |
| `POST /api/v1/ai/containerize` | Application type + current host | Dockerfile + K8s guidance |

All AI endpoints: `{"message": str, "job_id"?: UUID, "history"?: list[dict]}` → `{"reply": str}`

---

## Data Models (12 tables — v1.0)

| Model | Table | Status field values |
|---|---|---|
| `Connection` | `connections` | `unchecked · ok · error` |
| `MigrationJob` | `migration_jobs` | `draft · running · completed · failed` |
| `MigrationWave` | `migration_waves` | `planned · in_progress · completed · failed` |
| `SchemaMapping` | `schema_mappings` | — (is_excluded bool) |
| `ExecutionLog` | `execution_logs` | `info · warning · error` |
| `ValidationReport` | `validation_reports` | `passed · failed · partial` |
| `CutoverPlan` | `cutover_plans` | `planned · executing · completed · rolled_back` |
| `ApplicationAsset` | `application_assets` | `pending · in_progress · completed · blocked` |
| `OptimizationRec` | `optimization_recs` | `pending · accepted · dismissed` |
| `Runbook` | `runbooks` | `pre_migration · cutover · rollback · post_migration` |
| `TestCase` | `test_cases` | `pending · passed · failed · error` |

**Alembic migration versions (4):**
- `d4a2f8b3c1e7` — initial schema (Connection, MigrationJob, SchemaMapping, ExecutionLog)
- `a1b2c3d4e5f6` — schema mappings and logs
- `b2c3d4e5f6a7` — validation reports
- `c3d4e5f6a7b8` — P1/P2 features (CutoverPlan, MigrationWave, ApplicationAsset, OptimizationRec, Runbook, TestCase)

**Model rules:**
- Inherit from `Base` in `app.models.base`
- `Mapped[...]` + `mapped_column()` — never `Column()`
- `default=` not `default_factory=` in `mapped_column()`
- Relationships: `lazy="selectin"`
- Child FK: `ondelete="CASCADE"` — parent FK: `ondelete="SET NULL"`
- `utc_now` from `app.core.utils` for timestamp defaults

---

## MigrationJob State Machine

```
draft ──[POST /jobs/{id}/run]──▶ running ──[engine OK]──▶ completed
                                    │
                                    └──[POST /jobs/{id}/cancel]──▶ failed
                                    └──[engine error]──▶ failed

Constraint: editing a running job → 409 Conflict
```

---

## API Surface (v1.0 — 64 endpoints)

```
GET  /health
GET  /api/v1/dashboard

# Connections (6)
GET|POST /api/v1/connections
GET|PUT|DELETE /api/v1/connections/{id}
POST /api/v1/connections/{id}/test

# Jobs (7)
GET|POST /api/v1/jobs
GET|PUT|DELETE /api/v1/jobs/{id}
POST /api/v1/jobs/{id}/run
POST /api/v1/jobs/{id}/cancel

# Mappings (5)
GET|POST /api/v1/jobs/{id}/mappings
PUT|DELETE /api/v1/jobs/{id}/mappings/{mid}
POST /api/v1/jobs/{id}/discover          ← live DB introspection

# Logs (1)
GET /api/v1/jobs/{id}/logs               ← paginated, ?level=

# Validations (2)
GET /api/v1/jobs/{id}/validations
POST /api/v1/jobs/{id}/validate

# Cutover (6)
GET|POST|PUT /api/v1/jobs/{id}/cutover
POST /api/v1/jobs/{id}/cutover/execute
POST /api/v1/jobs/{id}/cutover/complete
POST /api/v1/jobs/{id}/cutover/rollback

# Test Cases (3)
GET /api/v1/jobs/{id}/test-cases
POST /api/v1/jobs/{id}/generate-tests    ← AI
POST /api/v1/jobs/{id}/run-tests

# Optimization (3)
GET /api/v1/jobs/{id}/optimizations
POST /api/v1/jobs/{id}/optimize          ← AI
POST /api/v1/jobs/{id}/optimizations/{rid}

# Runbooks (5)
GET|POST /api/v1/jobs/{id}/runbooks
PUT|DELETE /api/v1/jobs/{id}/runbooks/{rid}
POST /api/v1/jobs/{id}/runbooks/generate  ← AI

# Waves (7)
GET|POST /api/v1/waves
GET|PUT|DELETE /api/v1/waves/{id}
POST /api/v1/waves/{id}/jobs
DELETE /api/v1/waves/{id}/jobs/{job_id}

# Assets (5)
GET|POST /api/v1/assets
GET|PUT|DELETE /api/v1/assets/{id}

# AI (8)
POST /api/v1/ai/migrate-chat
POST /api/v1/ai/suggest-mappings
POST /api/v1/ai/assess-risk
POST /api/v1/ai/plan-waves
POST /api/v1/ai/assess-application
POST /api/v1/ai/plan-cutover
POST /api/v1/ai/cloud-strategy
POST /api/v1/ai/containerize
```

---

## Frontend Pages (11 pages + landing)

| Route | Screen | Key tab/feature |
|---|---|---|
| `/` | Landing page | Hero, features, lifecycle, AI copilot, Roadmap section |
| `/dashboard` | Dashboard | KPI cards, recent log feed, jobs by status |
| `/connections` | Connections | Table, test button, add/edit modal |
| `/jobs` | Jobs list | Run/cancel controls, status badges |
| `/jobs/[id]` | Job detail | Schema Mapper, Execution Logs, Validation, Test Cases, Runbooks, Cutover, Optimization tabs |
| `/waves` | Wave planning | Wave list, sequence order, add/remove jobs |
| `/assets` | Asset inventory | Strategy selector, effort estimate, AI cloud/containerize |
| `/cutover` | Cutover overview | Cross-job cutover status |
| `/optimization` | Optimization | Cross-job recommendations |
| `/testing` | Testing | Cross-job test results |
| `/runbooks` | Runbooks | Cross-job runbook library |

---

## Schema Discovery Limitation

`POST /jobs/{id}/discover` (live DB introspection) is supported only for PostgreSQL-family sources:
- `postgresql` · `aws_rds` · `gcp_cloudsql` · `azure_sql`

MySQL and MongoDB discovery are on the roadmap (P0.4). Other types return HTTP 400.

---

## Key Anti-Patterns (Never Do)

| Bad | Good | Why |
|---|---|---|
| `declarative_base()` in database.py | `from app.models.base import Base` | Separate metadata → no tables |
| `curl` in healthcheck | `python urllib.request.urlopen()` | curl not in slim image |
| `MOCK_*` in-memory dicts | Real repository + DB | Data lost on restart |
| Missing `ARG NEXT_PUBLIC_API_URL` before build | Add before `RUN npm run build` | Wrong URL baked in |
| `shadcn` CLI install | Use pre-built `src/components/ui/` | Breaks Tailwind v3 build |
| `default_factory=` in `mapped_column()` | `default=` | SA2 incompatibility |
| `allow_origins=["*"]` + `allow_credentials=True` | Explicit origin list | OWASP A05 violation |
| No `asyncio.Lock` on `_jwks_cache` | Double-checked locking with `asyncio.Lock` | Race condition under concurrent cold-start |
| Lazy-loading relationships in async context | `selectinload` / `joinedload` | MissingGreenlet under asyncpg |

---

## Testing

- 44 test files · 214 test cases · pytest + pytest-asyncio
- `conftest.py`: overrides `get_db` with `NullPool` test engine; drops/creates tables per test
- Auth bypass: `require_auth` is NOT overridden — relies on `LOGTO_ISSUER=""` (known fragility — see [[Migrate-TestForge-2026-05-31]])
- Integration tests hit real PostgreSQL — no mocking

---

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_migrate` | Async PG connection |
| `APP_ENV` | `dev` | `dev` / `production` |
| `SECRET_KEY` | `change-me-in-production` | JWT signing |
| `OPENROUTER_API_KEY` | `""` | AI primary (Kimi K2) |
| `OLLAMA_BASE_URL` | `""` | AI local fallback |
| `OLLAMA_MODEL` | `llama3` | Ollama model name |
| `LOGTO_ISSUER` | `""` | Logto OIDC issuer — empty disables auth |
| `LOGTO_AUDIENCE` | `dclaw-migrate` | JWT audience |
| `NEXT_PUBLIC_API_URL` | *(build arg)* | Backend URL baked into Next.js bundle |

---

## Related Notes

- [[Migrate-Design-System]] — OC purple palette, components, status badges
- [[Migrate-v1.4-Roadmap]] — current status, Sprint 0, implementation plan
- [[Migrate-TestForge-2026-05-31]] — TestForge security/reliability audit
