# DClaw Migrate — Presentation Deck Content

> Source content for slide deck regeneration.
> Version: 1.4 · Updated: 2026-05-31
> Design system: One Convergence Vol. 01 · Amber `#F59E0B` · Manrope display

---

## Slide 1 — Cover

**Title:** DClaw Migrate

**Tagline:** AI-guided cloud & database migration

**Visual:** Amber gradient hero, app screenshot (dashboard + copilot panel) at right  
**Sub-copy:** Plan, execute, validate, and roll back migrations — with an AI copilot at every step.

---

## Slide 2 — The Problem

**Headline:** Cloud migrations fail not because the tech is hard, but because the process is invisible.

**Three pain points (icon + one-liner each):**

- 🗺️ **No plan, just chaos** — migrations are stitched together with scripts, spreadsheets, and Slack threads with no single view of what's in-flight
- 🔁 **Cutover anxiety** — teams have no automated rollback plan, so every cutover is a manual, high-stress event
- 🤷 **No post-migration validation** — row counts are checked manually or not at all; data drift goes undetected for weeks

**Bottom line:** The tools exist to move data. What's missing is the orchestration layer that plans the move, monitors it, validates it, and knows how to undo it.

---

## Slide 3 — The Solution

**Headline:** One platform that manages the entire migration lifecycle

**Visual:** 6-step flow diagram: Connections → Plan → Execute → Validate → Cutover → Optimize

**Three differentiators:**
1. AI that knows your schema, your connections, and your job state — not a generic chatbot
2. Full migration lifecycle from schema discovery to post-cutover optimization in one UI
3. Wave-based planning so large estates migrate in controlled, dependency-ordered batches

---

## Slide 4 — Product Overview

**Layout:** Hub-and-spoke from "Migration Job" at centre

| Module | Key Value |
|--------|-----------|
| Connections | Register, test, and manage source/target endpoints |
| Jobs | Run and monitor full-load, CDC, or schema-only migrations |
| Schema Mapper | Auto-discover tables, edit column mappings, set transform rules |
| Execution Logs | Real-time, filterable log stream per job run |
| Validation | Per-table row count, checksum, and sample diff after migration |
| Wave Planning | Group jobs into ordered, risk-balanced waves |
| Asset Inventory | Track every application being migrated with strategy + effort |
| Cutover | Blue-green / phased cutover with one-click rollback |
| Test Cases | AI-generated tests run against source + target |
| Runbooks | AI-generated step-by-step operational playbooks |
| Optimization | AI right-sizing and cost recommendations post-migration |
| AI Copilot | Context-aware chat from every page |

---

## Slide 5 — AI Feature Showcase

**Headline:** 8 AI endpoints. Every one grounded in real migration context.

| # | Feature | What it knows | When it fires |
|---|---------|--------------|---------------|
| 01 | Migration Chat | Job type, connections, schema, status | Floating copilot panel, always |
| 02 | Schema Mapping Suggestions | Source table + column names, types | "Auto-suggest" in mapper tab |
| 03 | Risk Assessment | Connection types, migration type, table count | Before job run |
| 04 | Wave Planning | All jobs, dependencies, risk levels | Wave planner view |
| 05 | Application Assessment | Asset type, current platform, strategy | Asset detail view |
| 06 | Cutover Planning | Job status, validation results, target | Cutover tab |
| 07 | Cloud Strategy | Asset workload description | Asset → Cloud strategy |
| 08 | Containerization | Application type, current host | Asset → Containerize |

**AI stack:** OpenRouter (Kimi K2, primary) · Ollama llama3 (local fallback)  
**Failure handling:** 502 returned with error detail if no provider is configured. Never silent empty responses.

---

## Slide 6 — Migration Lifecycle Deep Dive

**Headline:** Six phases. One platform. Full visibility end-to-end.

```
Phase 1 — SETUP
  Register connections → Test connectivity → Create job

Phase 2 — PLAN
  Discover schema (live DB introspection) →
  Review + edit mappings → AI risk assessment →
  Assign to wave

Phase 3 — EXECUTE
  Run job (POST /jobs/{id}/run) →
  Monitor execution logs in real-time

Phase 4 — VALIDATE
  Trigger validation (row count + checksum per table) →
  Run AI-generated test cases →
  All green? Proceed. Any fail? Re-run.

Phase 5 — CUTOVER
  AI-generate cutover plan →
  Execute (blue-green / phased / direct) →
  Automatic rollback if checks fail

Phase 6 — POST-MIGRATION
  AI optimization recommendations →
  Auto-generated runbooks (pre, cutover, rollback, post)
```

---

## Slide 7 — Wave Planning

**Headline:** Migrate 1,000 assets safely — in the right order.

**Three-column layout:**

**Without waves:**  
- All jobs triggered simultaneously  
- Blast radius unknown  
- No ordering by dependency  
- One failure blocks everything

**With DClaw Migrate waves:**  
- Jobs grouped into ordered batches  
- Risk level per wave (low / medium / high)  
- Sequence 1 completes before Sequence 2 begins  
- AI suggests grouping based on dependency + risk

**AI Wave Planner input/output:**  
Input: job list, connection types, estimated effort  
Output: wave groupings with rationale + recommended sequence order

---

## Slide 8 — Technical Architecture

**Headline:** Production-grade stack. Nothing exotic.

```
Browser / Next.js 14 App Router (Port 3035)
        ↓ REST JSON
FastAPI backend (Port 8121)
├── Logto JWT middleware (optional)
├── /api/v1 routes (13 modules, 64 endpoints)
│   ├── Services layer
│   │   ├── ai_copilot.py  ← unified AI gateway
│   │   │   ├── OpenRouter / Kimi K2 (primary)
│   │   │   └── Ollama / llama3 (local fallback)
│   │   ├── schema_discovery.py  ← live DB introspection
│   │   └── validation.py  ← row count + checksum
│   └── Repository layer
│       └── per-entity data access
└── PostgreSQL 16 (dclaw_migrate, 12 tables)
```

**Stack badges:**
Row 1: Next.js 14 · FastAPI · PostgreSQL 16 · SQLAlchemy 2.0  
Row 2: Tailwind CSS · Pydantic v2 · Alembic · pytest · Docker · Helm

---

## Slide 9 — Schema Discovery

**Headline:** Connect to the source DB. Get a mapping draft in seconds.

**Flow:**

```
1. User clicks "Discover Schema" on Job Detail
2. POST /api/v1/jobs/{id}/discover
3. Backend connects to source DB via asyncpg
4. Introspects information_schema.tables + columns
5. Returns: table list with row counts + column types
6. Draft SchemaMappings created for each table
7. User reviews, edits transform rules, excludes tables
8. POST /api/v1/ai/suggest-mappings → AI refines types
```

**Supported sources (live introspection):**  
`postgresql` · `aws_rds` · `gcp_cloudsql` · `azure_sql`

**Coming soon:** MySQL, MongoDB, MSSQL

---

## Slide 10 — Deployment Options

**Headline:** Local in 3 commands. Kubernetes in one Helm install.

**Option A — Docker (local / staging):**
```bash
cp .env.example .env            # add OPENROUTER_API_KEY
docker compose up --build -d
docker compose exec backend alembic upgrade head
# → http://localhost:3035
```

**Option B — Kubernetes:**
```bash
helm install dclaw-migrate ./helm \
  --set image.backend=ghcr.io/dclawstack/dclaw-migrate-backend:latest \
  --set image.frontend=ghcr.io/dclawstack/dclaw-migrate:latest \
  -f helm/values.yaml
# CloudNativePG + K8s Secrets for API keys
```

**Option C — DPanel:**
```
DPanel → Find DClaw Migrate → Install
```
Operator provisions: namespace, deployments, CloudNativePG, TLS ingress automatically.

---

## Slide 11 — Roadmap

**Headline:** Shipped: full migration lifecycle. Next: hardening → schema expansion → agentic.

**Phase 1 — Hardening (Sprint 0, in progress)**
- Security: CORS hardening, auth rate limiting (slowapi), JWKS race fix
- Observability: Sentry (backend + frontend), structlog, PostHog analytics
- Tests: explicit auth override in conftest, stronger assertions (target 60%+ mutation kill)

**Phase 2 — Schema Expansion (P0.4 / P1.2)**
- MySQL introspection (add asyncmy driver)
- MongoDB collection discovery
- Enhanced type mapping: JSON → JSONB, TEXT → VARCHAR with length inference
- CDC groundwork: binlog/WAL position tracking

**Phase 3 — Agentic Migration (P1.3 / P2)**
- Proactive monitoring agent: detect replication lag, alert before cutover
- Streaming AI responses (SSE) for long-running analysis
- Multi-cloud deployment comparisons with live pricing
- Automated test generation from production query logs

---

## Slide 12 — Call to Action / Links

**Headline:** Run a migration in under 10 minutes.

| Resource | Link |
|----------|------|
| GitHub | https://github.com/dclawstack/dclaw-migrate |
| API docs | http://localhost:8121/docs |
| Architecture diagrams | `Infographics/architecture-diagram.md` |
| Roadmap | `PLAN-v1.4.md` |
| Product spec | `PRODUCT-SPEC.md` |

**Quick start:**
```bash
git clone https://github.com/dclawstack/dclaw-migrate
cp .env.example .env   # add your OpenRouter key
docker compose up --build -d
docker compose exec backend alembic upgrade head
# Open http://localhost:3035
```

---

## Design Notes (for deck builder)

**Colours:**
- Primary: `#F59E0B` (amber — DClaw Migrate brand)
- Background: `#FFFFFF`
- Accent dark: `#1a1a2e`
- Positive: `#10B981` (emerald — validation passed)
- Negative: `#EF4444` (red — validation failed / error)
- Warning: `#F59E0B` (amber — running / in-progress)
- Neutral: `#6B7280` (gray — draft / pending)

**Status badge palette:**
- `draft` → `#6B7280` gray
- `running` → `#F59E0B` amber
- `completed` → `#10B981` emerald
- `failed` → `#EF4444` red
- `planned` → `#3B82F6` blue
- `rolled_back` → `#8B5CF6` purple

**Fonts:**
- Display headings: Manrope 700
- Body: Inter 400/500
- Code snippets: JetBrains Mono

**Corner radius:** 2px (sharp — One Convergence design system)

**Screenshot recommendations:**
- Slide 3: Dashboard overview + Copilot panel open
- Slide 4: Job detail page showing Schema Mapper tab
- Slide 6: Execution log tab mid-run
- Slide 7: Wave planner with 3 waves configured
- Slide 9: Schema discovery modal with table list
