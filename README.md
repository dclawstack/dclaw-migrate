# DClaw Migrate

> **AI-guided cloud & database migration platform.**  
> Plan, execute, validate, and roll back database and cloud migrations — with an AI copilot at every step.

---

## What It Does

DClaw Migrate gives engineering teams and DBAs a structured, AI-assisted workflow to move databases and applications to the cloud. Instead of stitching together scripts, spreadsheets, and Slack threads, every migration lives in one place: connections, wave plans, schema mappings, execution logs, validation reports, cutover checklists, and AI-generated runbooks.

**The AI copilot is context-aware** — it knows your source/target connection types, your schema, and your current job status. Ask it to assess risk, suggest column mappings, draft a rollback procedure, or explain a validation failure.

---

## Features

### Core Migration Workflow
- **Connections** — Register source and target databases (PostgreSQL, MySQL, MongoDB, MSSQL, AWS RDS, GCP Cloud SQL, Azure SQL). Test connectivity with one click.
- **Migration Jobs** — Create jobs pairing a source and target connection. Run, monitor, and cancel from the UI or API.
- **Schema Discovery** — Connect to a PostgreSQL-family source DB, introspect tables and columns, and generate draft mappings automatically.
- **Schema Mappings** — Review and edit table/column mappings with transform rules (SQL expressions or AI-generated).
- **Execution Logs** — Paginated, filterable log stream (info / warning / error) per job run.
- **Validation Reports** — Post-migration row-count checks, checksum comparison, and sample diff per table.

### Wave Planning
- **Migration Waves** — Group jobs into ordered migration waves with sequence number, risk level, and status tracking.
- **Dependency-aware ordering** — Add and remove jobs from waves; sequence waves for safe progressive migration.

### Application Asset Inventory
- **Asset Registry** — Track every application being migrated with type, migration strategy (lift-and-shift, re-platform, refactor, repurchase, retire, retain), effort estimate, risk level, and host mapping.
- **Containerization planning** — Store containerization plan and cloud strategy per asset.

### Cutover Management
- **Cutover Plans** — Per-job cutover record with pre/post checks, rollback procedure, and strategy (blue-green / direct / phased).
- **State machine** — `planned → executing → completed` with one-click rollback at any point.

### Testing & Validation
- **AI Test Generation** — Generate test cases from a job's schema and configuration.
- **Test Runner** — Run generated test cases; capture query results, pass/fail, and error messages.

### Post-Migration Optimization
- **Optimization Recommendations** — AI-generated right-sizing, cost, and performance recommendations per job.
- **Recommendation tracking** — Accept or dismiss recommendations with status tracking.

### Runbooks
- **AI Runbook Generation** — Generate step-by-step runbooks (pre-migration, cutover, rollback, post-migration) from job context.
- **CRUD** — Create, edit, and manage runbooks manually.

### AI Copilot (8 endpoints)
| Capability | Trigger |
|------------|---------|
| Migration chat | Ask any migration question with job context |
| Schema mapping suggestions | Get column-level AI mapping recommendations |
| Risk assessment | Identify top risks for a job configuration |
| Wave planning | AI-optimized wave grouping and sequencing |
| Application assessment | Effort estimate + strategy recommendation per asset |
| Cutover planning | Generate cutover checklist and timing recommendations |
| Cloud strategy | Compare cloud options for a workload |
| Containerization | Dockerfile generation from application context |

**AI stack:** OpenRouter (Kimi K2, primary) → Ollama (llama3, local fallback). Falls back gracefully — if no API key is set, the service raises a 502 rather than silently returning empty data.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14.2, React 18, TypeScript, Tailwind CSS |
| Backend | FastAPI, Pydantic v2, SQLAlchemy 2.0, asyncpg |
| Database | PostgreSQL 16 |
| Auth | Logto JWT (optional; disabled when `LOGTO_ISSUER` is empty) |
| AI | OpenRouter → Ollama fallback |
| Container | Docker + Helm |
| Migrations | Alembic |
| Tests | pytest + pytest-asyncio |

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- An OpenRouter API key (or a local Ollama instance)

### 1. Clone and configure

```bash
git clone https://github.com/dclawstack/dclaw-migrate
cd dclaw-migrate
cp .env.example .env
# Edit .env — set OPENROUTER_API_KEY at minimum
```

### 2. Start services

```bash
docker compose up --build -d
```

### 3. Run migrations

```bash
docker compose exec backend alembic upgrade head
```

### 4. Open the app

| Service | Docker URL | Local dev URL |
|---------|-----------|---------------|
| Frontend | http://localhost:3035 | http://localhost:3033 |
| Backend API | http://localhost:8121 | http://localhost:8033 |
| OpenAPI docs | http://localhost:8121/docs | http://localhost:8033/docs |
| Health check | http://localhost:8121/health | http://localhost:8033/health |

---

## Environment Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_migrate` | Yes | PostgreSQL connection string (asyncpg driver) |
| `APP_ENV` | `dev` | No | `dev` / `production` |
| `SECRET_KEY` | `change-me-in-production` | Yes (prod) | JWT signing key |
| `OPENROUTER_API_KEY` | `""` | AI features | OpenRouter API key for Kimi K2 |
| `OLLAMA_BASE_URL` | `""` | AI (local) | e.g. `http://localhost:11434` |
| `OLLAMA_MODEL` | `llama3` | No | Ollama model name |
| `LOGTO_ISSUER` | `""` | Auth (prod) | Logto OIDC issuer URL; leave empty to disable auth |
| `LOGTO_AUDIENCE` | `dclaw-migrate` | No | Expected JWT audience |
| `NEXT_PUBLIC_API_URL` | *(build arg)* | Yes | Backend URL baked into the Next.js build |

---

## Development Setup

### Backend (without Docker)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Start local Postgres (or use Docker)
docker compose up postgres -d

# Apply migrations
alembic upgrade head

# Run dev server
uvicorn app.api.main:app --reload --port 8121
```

### Frontend (without Docker)

```bash
cd web
npm install
NEXT_PUBLIC_API_URL=http://localhost:8121 npm run dev
# → http://localhost:3035
```

### Run Tests

```bash
cd backend

# Start test database
docker compose up postgres -d

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=term-missing
```

---

## API Overview

All routes are under `/api/v1` and require `Authorization: Bearer <token>` when `LOGTO_ISSUER` is configured.

```
GET  /health                              Health check

# Connections
GET  /api/v1/connections                  List
POST /api/v1/connections                  Create
GET  /api/v1/connections/{id}             Get
PUT  /api/v1/connections/{id}             Update
DELETE /api/v1/connections/{id}           Delete
POST /api/v1/connections/{id}/test        Test connectivity

# Migration Jobs
GET  /api/v1/jobs                         List
POST /api/v1/jobs                         Create
GET  /api/v1/jobs/{id}                    Get
PUT  /api/v1/jobs/{id}                    Update
DELETE /api/v1/jobs/{id}                  Delete
POST /api/v1/jobs/{id}/run                Start
POST /api/v1/jobs/{id}/cancel             Cancel

# Schema Mappings (per job)
GET  /api/v1/jobs/{id}/mappings           List
POST /api/v1/jobs/{id}/mappings           Create
PUT  /api/v1/jobs/{id}/mappings/{mid}     Update
DELETE /api/v1/jobs/{id}/mappings/{mid}   Delete
POST /api/v1/jobs/{id}/discover           Introspect source schema

# Execution Logs (per job)
GET  /api/v1/jobs/{id}/logs               List (paginated, filter by level)

# Validation (per job)
GET  /api/v1/jobs/{id}/validations        List reports
POST /api/v1/jobs/{id}/validate           Trigger validation run

# Cutover (per job)
GET  /api/v1/jobs/{id}/cutover            Get plan
POST /api/v1/jobs/{id}/cutover            Create plan
PUT  /api/v1/jobs/{id}/cutover            Update plan
POST /api/v1/jobs/{id}/cutover/execute    Begin cutover
POST /api/v1/jobs/{id}/cutover/complete   Mark complete
POST /api/v1/jobs/{id}/cutover/rollback   Roll back

# Test Cases (per job)
GET  /api/v1/jobs/{id}/test-cases         List
POST /api/v1/jobs/{id}/generate-tests     AI-generate test cases
POST /api/v1/jobs/{id}/run-tests          Execute test cases

# Optimization (per job)
GET  /api/v1/jobs/{id}/optimizations      List recommendations
POST /api/v1/jobs/{id}/optimize           Generate recommendations
POST /api/v1/jobs/{id}/optimizations/{rid} Accept/dismiss recommendation

# Runbooks (per job)
GET  /api/v1/jobs/{id}/runbooks           List
POST /api/v1/jobs/{id}/runbooks           Create
PUT  /api/v1/jobs/{id}/runbooks/{rid}     Update
DELETE /api/v1/jobs/{id}/runbooks/{rid}   Delete
POST /api/v1/jobs/{id}/runbooks/generate  AI-generate runbook

# Waves
GET  /api/v1/waves                        List
POST /api/v1/waves                        Create
GET  /api/v1/waves/{id}                   Get
PUT  /api/v1/waves/{id}                   Update
DELETE /api/v1/waves/{id}                 Delete
POST /api/v1/waves/{id}/jobs              Add job to wave
DELETE /api/v1/waves/{id}/jobs/{job_id}   Remove job from wave

# Application Assets
GET  /api/v1/assets                       List
POST /api/v1/assets                       Create
GET  /api/v1/assets/{id}                  Get
PUT  /api/v1/assets/{id}                  Update
DELETE /api/v1/assets/{id}                Delete

# AI Copilot
POST /api/v1/ai/migrate-chat              Context-aware migration chat
POST /api/v1/ai/suggest-mappings          Column mapping suggestions
POST /api/v1/ai/assess-risk               Risk assessment for a job
POST /api/v1/ai/plan-waves                Wave grouping optimization
POST /api/v1/ai/assess-application        Application migration assessment
POST /api/v1/ai/plan-cutover              Cutover checklist generation
POST /api/v1/ai/cloud-strategy            Cloud provider comparison
POST /api/v1/ai/containerize              Containerization guidance

# Dashboard
GET  /api/v1/dashboard                    Aggregate stats
```

Full interactive docs: `http://localhost:8121/docs`

---

## Project Structure

```
dclaw-migrate/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── main.py          # FastAPI app, middleware, router registration
│   │   │   ├── routes/health.py
│   │   │   └── v1/              # One module per resource group
│   │   ├── core/
│   │   │   ├── auth.py          # Logto JWT validation
│   │   │   ├── config.py        # pydantic-settings
│   │   │   └── database.py      # Async engine + session factory
│   │   ├── models/              # SQLAlchemy 2.0 ORM models (12 tables)
│   │   ├── repositories/        # Data access layer
│   │   └── services/
│   │       ├── ai_copilot.py    # OpenRouter / Ollama gateway
│   │       ├── schema_discovery.py  # DB introspection (PostgreSQL family)
│   │       └── validation.py    # Post-migration row/checksum checks
│   ├── alembic/                 # Database migration scripts
│   ├── tests/                   # pytest integration tests (44 files, 214 cases)
│   └── requirements.txt
├── web/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   │   ├── page.tsx         # Landing / home
│   │   │   ├── dashboard/
│   │   │   ├── connections/
│   │   │   ├── jobs/            # List + [id] detail with tabs
│   │   │   ├── waves/
│   │   │   ├── assets/
│   │   │   ├── cutover/
│   │   │   ├── optimization/
│   │   │   ├── runbooks/
│   │   │   └── testing/
│   │   └── components/
│   │       ├── AppShell.tsx     # Nav + layout wrapper
│   │       ├── CopilotPanel.tsx # Floating AI sidebar
│   │       └── ui/              # Pre-built design system components
│   └── package.json
├── helm/                        # Kubernetes Helm chart
├── docs/                        # User-facing documentation
├── Infographics/                # Architecture and workflow diagrams
├── slides/                      # Presentation deck content
├── testforge/                   # TestForge static analysis reports
├── docker-compose.yml
└── PLAN-v1.4.md                 # Implementation roadmap
```

---

## Deployment

### Docker Compose (local / staging)

```bash
docker compose up --build -d
docker compose exec backend alembic upgrade head
```

### Kubernetes (Helm)

```bash
helm install dclaw-migrate ./helm \
  --set image.backend=ghcr.io/dclawstack/dclaw-migrate-backend:latest \
  --set image.frontend=ghcr.io/dclawstack/dclaw-migrate:latest \
  -f helm/values.yaml
```

### DPanel

1. Open DPanel → Find **DClaw Migrate** → **Install**
2. The DClaw Operator provisions the namespace, deployments, CloudNativePG database, and TLS ingress automatically.

---

## Documentation

| Resource | Location |
|----------|----------|
| Product spec & data models | `PRODUCT-SPEC.md` |
| Implementation roadmap | `PLAN-v1.4.md` |
| Architecture diagrams | `Infographics/architecture-diagram.md` |
| Presentation deck | `slides/deck-content.md` |
| Getting started | `docs/getting-started/` |
| API reference | `docs/reference/api.md` |
| Troubleshooting | `docs/troubleshooting/` |

---

*DClaw Migrate · Part of the DClaw Stack · [github.com/dclawstack](https://github.com/dclawstack)*
