# Running DClaw Migrate

## Prerequisites

Before starting, ensure `.env` exists in the project root. Copy `.env.example` if needed:

```bash
cp .env.example .env
```

Then set your AI API key in `.env`:

```
# Option A — OpenRouter (cloud, recommended)
OPENROUTER_API_KEY=your-key-here

# Option B — Ollama (local, free, no key required)
OLLAMA_URL=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.1
```

Get an OpenRouter key at: https://openrouter.ai/keys

Ollama is optional and serves as a fallback. Install from https://ollama.com/ and pull a model:

```bash
ollama pull llama3.1
```

The AI Copilot, wave planning, containerization, runbook generation, and all other AI features degrade gracefully when no key is set — they return a clear message instead of crashing.

## Start all services

Run from the project root (`dclaw-migrate/`):

```bash
docker compose up --build -d
```

## Run database migrations

Once the backend container is healthy:

```bash
docker compose exec backend alembic upgrade head
```

This runs all four migrations in order:

| Revision | Schema |
|----------|--------|
| `d4a2f8b3c1e7` | connections, migration_jobs |
| `a1b2c3d4e5f6` | schema_mappings, execution_logs |
| `b2c3d4e5f6a7` | validation_reports |
| `c3d4e5f6a7b8` | migration_waves, application_assets, test_cases, cutover_plans, optimization_recs, runbooks |

If the backend isn't ready yet, wait a few seconds and retry.

## Verify everything is running

```bash
docker compose ps
docker compose logs -f
```

## Service URLs

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3035       |
| Backend  | http://localhost:8121       |
| API docs | http://localhost:8121/docs  |
| Postgres | localhost:5432 (db: `dclaw_migrate`) |

## Local development (without Docker)

Backend (port 8033):

```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.api.main:app --port 8033 --reload
```

Frontend (port 3033):

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8033 npm run dev
```

## Run tests

Backend tests (requires Postgres on `localhost:5432/dclaw_migrate_test`):

```bash
cd backend
pytest -q tests/
```

Frontend type check:

```bash
cd frontend
npm run build
```

## Common issues

| Issue | Fix |
|-------|-----|
| `relation does not exist` | Run `docker compose exec backend alembic upgrade head` |
| `alembic upgrade head` fails | Check `DATABASE_URL` in `.env` points to the running Postgres container |
| Frontend can't reach backend | Verify `NEXT_PUBLIC_API_URL` in `.env` matches the backend port (`8121` for Docker, `8033` for local) |
| AI endpoints return 502 | Set `OPENROUTER_API_KEY` in `.env` or start Ollama locally |
| Schema discovery returns 502 | The source connection credentials are unreachable — test the connection first via the Connections page |
| Port 3035 / 8121 already in use | Edit the port mappings in `docker-compose.yml` and update `NEXT_PUBLIC_API_URL` accordingly |
| `pytest` can't connect to DB | Create the test database: `psql -U postgres -c "CREATE DATABASE dclaw_migrate_test;"` |

## Stopping everything

```bash
docker compose down
```

To also wipe all migration data:

```bash
docker compose down -v
```

The `-v` flag removes the Postgres volume. Omit it to keep data across restarts.

---

## Feature overview

| Page | URL | What it does |
|------|-----|-------------|
| Dashboard | `/dashboard` | Job counts, status summary, recent jobs |
| Connections | `/connections` | Manage source/target DB connections, test connectivity |
| Jobs | `/jobs` | Create and run migration jobs |
| Job Detail | `/jobs/[id]` | Schema mapper, execution log, validation, tests, cutover, optimization, runbooks |
| Waves | `/waves` | Group jobs into migration waves with AI wave planning |
| Assets | `/assets` | Track application assets with AI strategy assessment and containerization |
| AI Copilot | `✦` button (all pages) | Context-aware chat — ask anything about the active migration |

## API reference

FastAPI auto-generates interactive docs at **http://localhost:8121/docs** (Docker) or **http://localhost:8033/docs** (local).

All endpoints live under `/api/v1/`. Key groups:

| Prefix | Coverage |
|--------|----------|
| `/api/v1/connections` | Connection CRUD + connectivity test |
| `/api/v1/jobs` | Job CRUD + run/cancel |
| `/api/v1/jobs/{id}/mappings` | Schema mapping CRUD + auto-discovery |
| `/api/v1/jobs/{id}/logs` | Execution log reader |
| `/api/v1/jobs/{id}/validations` | Post-migration row-count validation |
| `/api/v1/jobs/{id}/test-cases` | AI-generated test cases + execution |
| `/api/v1/jobs/{id}/cutover` | Cutover plan + execute/complete/rollback |
| `/api/v1/jobs/{id}/optimizations` | AI cost/performance recommendations |
| `/api/v1/jobs/{id}/runbooks` | AI-generated migration runbooks |
| `/api/v1/waves` | Migration wave planning |
| `/api/v1/assets` | Application asset tracking |
| `/api/v1/ai/*` | Copilot chat, suggest-mappings, assess-risk, plan-waves, containerize, cloud-strategy |
| `/api/v1/dashboard` | Aggregate stats |
