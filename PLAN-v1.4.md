# DClaw Migrate — v1.4 Implementation Plan

> **Source of truth hierarchy:** `REVISED-PRD.md` (v2.3) → `AGENTS.md` → this document  
> **Previous plans:** `PLAN-v1.2.md`  
> **Failure analysis input:** `testforge/test_analysis.md` (TestForge run 2026-05-31, score 71/100)  
> **Updated:** 2026-05-31

---

## Pre-Flight Checklist

- [ ] `web/package-lock.json` committed after any `npm install`
- [ ] `web/next-env.d.ts` committed
- [ ] `docker-compose.yml` healthchecks correct
- [ ] `web/Dockerfile` declares `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`
- [ ] `CORS_ALLOWED_ORIGINS` env var set correctly per environment
- [ ] `SENTRY_DSN` set in production K8s secrets
- [ ] No wildcard CORS + credentials in any environment

---

## What Changed from v1.2

v1.4 inserts a **Sprint 0 — Engineering Hardening** block ahead of the product roadmap. This sprint is mandatory before v1.0 ships to any external user. It addresses the four validated findings from the TestForge analysis:

| # | Finding | Source | Priority |
|---|---------|---------|----------|
| H-1 | CORS wildcard + credentials (OWASP A05) | Manual code review, `main.py:27` | Critical |
| H-2 | Auth endpoints not rate-limited | TestForge Agentic Scale | Critical |
| H-3 | JWKS cache race condition under concurrent load | Code review, `auth.py` | High |
| H-4 | No observability stack (Sentry + OTel) | TestForge Vision | High |
| H-5 | Implicit auth bypass in test suite | TestForge / code review | High |
| H-6 | Mutation score 34% — weak test assertions | TestForge Mutation | Medium |
| H-7 | No product analytics (PostHog) | TestForge Vision | Medium |
| H-8 | N+1 query risk in Python backend (unscanned) | TestForge N+1 (blind spot) | Medium |

**Excluded from this plan (not genuine product issues):**
- Security score 0/100 — all XSS findings are in `web/node_modules/object-hash` (false positives, scanner confidence: `low`)
- Stack score 39/100 — scanner is JS-only; TypeScript, pytest, and SQLAlchemy are present in the Python side
- Load N/A, Kubernetes N/A — correct scanner behavior given current scaffold state

---

## Sprint 0 — Engineering Hardening (Prerequisite for v1.0 External Access)

> Every item here is a blocking prerequisite before any external user, pilot customer, or AI agent connects to this API.

### H-1 · CORS Wildcard + Credentials [CRITICAL]

**Root cause:** `backend/app/api/main.py:27` sets `allow_origins=["*"]` with `allow_credentials=True`. Starlette may silently reflect the requester's `Origin` header, allowing any website to read authenticated API responses via the browser.

**Product impact:** Any authenticated endpoint is exploitable via cross-origin request forgery from a malicious page. Affects all 102 API routes.

**Remediation:**
```python
# backend/app/api/main.py
import os
_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```
Add `CORS_ALLOWED_ORIGINS=http://localhost:3000` to `.env.example`. Set production value in K8s Secret.

**Files:** `backend/app/api/main.py`, `backend/app/core/config.py`, `.env.example`

---

### H-2 · Auth Endpoints Not Rate-Limited [CRITICAL]

**Root cause:** `backend/requirements.txt` has no rate-limiting library. `require_auth` validates JWT tokens on every request with no IP-level throttling. AI agent retries on 401 produce 2× load amplification (failed request + re-auth + retry). Any client can hammer auth validation indefinitely.

**Product impact:** DoS vector on all authenticated endpoints. Brute-force escalation path. Agentic workloads (the primary use case for DClaw Migrate) amplify this risk significantly.

**Remediation:**

1. Add to `backend/requirements.txt`:
   ```
   slowapi>=0.1.9
   ```

2. Register in `backend/app/api/main.py`:
   ```python
   from slowapi import Limiter, _rate_limit_exceeded_handler
   from slowapi.util import get_remote_address
   from slowapi.errors import RateLimitExceeded

   limiter = Limiter(key_func=get_remote_address)
   app.state.limiter = limiter
   app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
   ```

3. Apply route-level limits to high-value endpoints (jobs run/cancel, connections create):
   ```python
   @router.post("/run")
   @limiter.limit("20/minute")
   async def run_job(request: Request, ...):
   ```

4. In tests (`conftest.py`), set the limiter storage to in-memory and raise the threshold to avoid flaky test failures under parallel execution.

**Files:** `backend/requirements.txt`, `backend/app/api/main.py`, `backend/tests/conftest.py`, affected v1 route files

---

### H-3 · JWKS Cache Race Condition [HIGH]

**Root cause:** `backend/app/core/auth.py` uses a module-level dict `_jwks_cache: dict = {}` with no lock. Under concurrent cold-start traffic (common in agentic workloads), multiple coroutines race to fetch and write the JWKS — producing redundant external HTTP calls and potential partial-state reads.

**Product impact:** Intermittent 401 errors at startup under load; wasted latency from repeated JWKS fetches. Degrades agent reliability.

**Remediation:**
```python
# backend/app/core/auth.py
import asyncio

_jwks_cache: dict = {}
_jwks_lock = asyncio.Lock()

async def _fetch_jwks(issuer: str) -> dict:
    if issuer in _jwks_cache:
        return _jwks_cache[issuer]
    async with _jwks_lock:
        if issuer not in _jwks_cache:  # double-checked locking
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(f"{issuer.rstrip('/')}/.well-known/jwks.json")
                resp.raise_for_status()
                _jwks_cache[issuer] = resp.json()
    return _jwks_cache[issuer]
```

Consider pre-warming the JWKS cache in the `lifespan` startup event when `settings.logto_issuer` is set.

**Files:** `backend/app/core/auth.py`

---

### H-4 · No Observability Stack [HIGH]

**Root cause:** Neither `backend/requirements.txt` nor `web/package.json` include Sentry, OpenTelemetry, or any error-tracking dependency. The REVISED-PRD.md mandates Prometheus + Grafana for K8s, but application-level error tracking is missing. DORA MTTR is rated Weak as a direct consequence.

**Product impact:** Unhandled exceptions in 102 backend endpoints are silently swallowed by Uvicorn with no aggregation, alerting, or trace context. Incidents are discovered when users report them, not when they occur.

**Remediation:**

Backend:
```
# requirements.txt
sentry-sdk[fastapi]>=1.40.0
structlog>=24.0.0
```
```python
# backend/app/api/main.py — before app creation
import sentry_sdk
if settings.sentry_dsn:
    sentry_sdk.init(dsn=settings.sentry_dsn, traces_sample_rate=0.1,
                    environment=settings.environment)
```
Add `sentry_dsn: str = ""` and `environment: str = "development"` to `backend/app/core/config.py`. Replace all `print()` calls with `structlog` (also required by AGENTS.md §4.1 Python Rules).

Frontend:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Files:** `backend/requirements.txt`, `backend/app/core/config.py`, `backend/app/api/main.py`, `web/package.json`, `web/sentry.client.config.ts`, `web/sentry.server.config.ts`

---

### H-5 · Implicit Auth Bypass in Test Suite [HIGH]

**Root cause:** `backend/tests/conftest.py` overrides `get_db` but never overrides `require_auth`. Tests pass only because `settings.logto_issuer` is empty in the test environment — an invisible contract. Setting `LOGTO_ISSUER` in `.env.test` would silently 401 all 214 tests.

**Product impact:** Test suite is fragile and misleading. Any developer enabling auth locally will see all tests fail with no obvious diagnosis. Integration coverage of auth-protected paths is untested.

**Remediation:**
```python
# backend/tests/conftest.py — add this override
from app.core.auth import require_auth

app.dependency_overrides[require_auth] = lambda: {
    "sub": "test-user-id",
    "org": "test-org",
}
```

Also add a separate `test_auth.py` that tests the `require_auth` dependency directly: missing token → 401, invalid token → 401, valid token → 200.

**Files:** `backend/tests/conftest.py`, `backend/tests/test_auth.py` (new)

---

### H-6 · Mutation Score 34% — Weak Test Assertions [MEDIUM]

**Root cause:** Tests assert HTTP status codes and field *presence* but not value *integrity*. 23,225 of 35,189 mutants survive. The pattern is consistent across `test_jobs.py`, `test_connections.py`, `test_waves.py`.

**Product impact:** Business-rule regressions (wrong state transitions, incorrect timestamps, wrong counts) can be silently introduced and pass CI. Latent bug risk compounds with each feature added.

**Remediation — assertion hardening pattern:**
```python
# BEFORE (survives mutations on field values)
assert data["completed_at"] is not None

# AFTER (kills mutations on timestamp logic)
from datetime import datetime, timezone
completed = datetime.fromisoformat(data["completed_at"].replace("Z", "+00:00"))
assert (datetime.now(timezone.utc) - completed).total_seconds() < 5
```

Priority files to harden (highest mutation exposure):
1. `test_jobs.py` — state machine: draft → running → failed/completed transitions
2. `test_connections.py` — connection state and field completeness
3. `test_waves.py` — wave ordering and dependency invariants

Add missing edge case tests:
- `completed` job cannot be `run` again (state machine exhaustiveness)
- Malformed connection DSN strings → 422
- Pagination: `limit=0`, `offset > total`
- Concurrent `run` requests on the same job: exactly one 200, one 409

Target mutation kill rate: ≥60% (from current 34%).

**Files:** `backend/tests/test_jobs.py`, `backend/tests/test_connections.py`, `backend/tests/test_waves.py`

---

### H-7 · No Product Analytics [MEDIUM]

**Root cause:** No PostHog, Mixpanel, Amplitude, or equivalent in `web/package.json`. Feature adoption and user journey data is unavailable.

**Product impact:** Cannot measure which P0 features are used, where users drop off in the migration wizard flow, or validate that shipped features deliver value. Blocks data-driven prioritization for P1.

**Remediation:** Add PostHog (open-source, generous free tier):
```bash
npm install posthog-js posthog-node
```
Instrument the five key lifecycle events: `migration_started`, `wave_created`, `cutover_initiated`, `validation_passed`, `migration_completed`. Wire up to a PostHog project keyed off `NEXT_PUBLIC_POSTHOG_KEY`.

**Files:** `web/package.json`, `web/src/app/layout.tsx` (provider), `web/src/lib/analytics.ts` (new)

---

### H-8 · N+1 Query Risk in Python Backend [MEDIUM]

**Root cause:** TestForge's N+1 analyzer is JS/TS only — the FastAPI backend received zero coverage. SQLAlchemy async lazy-loading in a loop is the canonical N+1 pattern and is undetected by the scanner.

**Product impact:** Routes returning lists with nested relationships (e.g., jobs with connections, waves with assets) will issue one SELECT per related object under default lazy-load. At 1000+ assets (P0.2 acceptance criterion: "Discover 1000 assets"), this becomes a production bottleneck.

**Remediation:** Audit all list-returning routes in `backend/app/api/v1/`. Apply `selectinload` or `joinedload` explicitly wherever a route serialises a relationship. Do not rely on SQLAlchemy's lazy-load default in async contexts (it raises `MissingGreenlet` under asyncpg without explicit loading).

High-priority routes to audit:
- `GET /api/v1/jobs` — jobs with source/target connections
- `GET /api/v1/waves` — waves with assets list
- `GET /api/v1/assets` — assets with dependency graph

**Files:** `backend/app/api/v1/jobs.py`, `backend/app/api/v1/waves.py`, `backend/app/api/v1/assets.py`

---

## v1.0 Feature Inventory (Current State)

- [x] Migration job CRUD (`/api/v1/jobs`)
- [x] Source/target connection config (`/api/v1/connections`)
- [x] Schema mapping (`/api/v1/jobs/{id}/mappings`)
- [x] Execution log (`/api/v1/jobs/{id}/logs`)
- [x] Real backend CRUD (no mocks)
- [x] Docker + Helm deployment scaffold
- [x] Alembic migrations (4 versions)
- [x] Backend integration tests (44 files, 214 cases, pytest)
- [x] Wave planning (`/api/v1/waves`)
- [x] Asset inventory (`/api/v1/assets`)
- [x] Cutover plan (`/api/v1/jobs/{id}/cutover`)
- [x] Validation reports (`/api/v1/jobs/{id}/validations`)
- [x] AI copilot endpoint (`/api/v1/ai`)
- [x] Test cases (`/api/v1/jobs/{id}/test-cases`)
- [x] Runbooks (`/api/v1/jobs/{id}/runbooks`)
- [ ] Rate limiting
- [ ] Observability (Sentry + structlog)
- [ ] Product analytics (PostHog)
- [ ] Explicit auth bypass in tests
- [ ] `dclaw-manifest.json`

---

## v1.4 Product Roadmap

> Feature definitions and acceptance criteria are authoritative from `REVISED-PRD.md`. This plan adds implementation detail and scheduling only.

### Sprint 0 — Engineering Hardening (Week 1)

Blocking. All items must be complete before any external user or pilot customer connects.

| Task | Owner area | Effort |
|------|-----------|--------|
| H-1: Fix CORS wildcard | Backend | 1h |
| H-2: Add rate limiting (slowapi) | Backend | 3h |
| H-3: Fix JWKS cache race | Backend | 1h |
| H-4: Add Sentry (backend + frontend) | Full-stack | 4h |
| H-5: Explicit auth bypass in conftest | Backend/Test | 1h |
| H-6: Harden test assertions (top 3 files) | Backend/Test | 4h |
| H-7: Add PostHog | Frontend | 3h |
| H-8: Audit N+1 in list routes | Backend | 3h |

---

### P0 — Must Have (Weeks 2–5, demo-ready)

Features sourced from `REVISED-PRD.md §5`.

#### P0.1 · AI Migration Copilot
- `/api/v1/ai/migrate-chat` with streaming response
- RAG over migration patterns (schema → migration-type classification)
- Frontend: floating chat panel accessible from all pages
- Ollama fallback when `OPENROUTER_API_KEY` absent
- **Acceptance:** Generate migration plan in <10 min; surface ≥10 risk items
- **Files:** `backend/app/services/ai_copilot.py` (extend), `web/src/components/migrate-copilot.tsx`

#### P0.2 · Discovery & Assessment
- DB introspection: connect to source, discover schema, score migration readiness
- AI dependency-mapping for app assets
- Frontend: asset inventory table with readiness heatmap
- **Acceptance:** Discover ≥1000 assets; map dependencies; score readiness
- **Files:** `backend/app/services/schema_discovery.py` (extend), `web/src/app/assets/page.tsx`

#### P0.3 · Wave Planning
- Group assets into migration waves with dependency ordering
- AI wave-optimization: minimize blast radius, balance risk across waves
- Frontend: wave editor with drag-reorder and dependency validation
- **Acceptance:** Generate ≥5 waves; minimize downtime; balance risk
- **Files:** `backend/app/api/v1/waves.py` (extend), `web/src/app/waves/page.tsx`

#### P0.4 · Data Migration
- Schema comparison view with editable column-level mappings
- Type conversion rules (MySQL → PostgreSQL, etc.)
- Post-migration validation: row counts, checksums, sample comparison
- AI rollback-planning: identify rollback trigger conditions
- **Acceptance:** Downtime <1hr; checksum validation; automated rollback
- **Files:** `backend/app/api/v1/mappings.py`, `backend/app/services/validation.py`, `web/src/app/jobs/page.tsx`

---

### P1 — Should Have (Weeks 6–9)

Features sourced from `REVISED-PRD.md §6`.

#### P1.1 · Application Migration
- Six migration strategies: rehost, replatform, refactor, repurchase, retire, retain
- AI effort estimation per strategy
- Code conversion hints for re-platform paths
- **Acceptance:** 6 strategies implemented; effort estimate generated; basic code conversion

#### P1.2 · Testing & Validation
- AI test-case generation from migration spec
- Parallel test execution against source and target
- Regression detection: structural diff of pre/post migration state
- **Acceptance:** ≥100 test cases generated; parallel run; side-by-side comparison
- **Files:** `backend/app/api/v1/test_cases.py` (extend), `web/src/app/testing/page.tsx`

#### P1.3 · Cutover Management
- Blue-green cutover orchestration with health-check gating
- Automated validation checkpoints before traffic switch
- 1-click rollback with confirmation
- **Acceptance:** Blue-green cutover; automated validation; 1-click rollback
- **Files:** `backend/app/api/v1/cutover.py` (extend), `web/src/app/cutover/page.tsx`

#### P1.4 · Post-Migration Optimization
- Right-sizing recommendations (AI-generated from usage metrics)
- Cost delta: pre vs. post migration
- Performance baseline comparison
- **Acceptance:** 30% cost reduction recommendation; performance baseline
- **Files:** `backend/app/api/v1/optimization.py` (extend)

---

### P2 — Could Have (v1.5+, Weeks 10+)

Features sourced from `REVISED-PRD.md §7`.

| # | Feature | Key AI component |
|---|---------|-----------------|
| P2.1 | Multi-Cloud Strategy | Workload placement optimization |
| P2.2 | Container Migration | Dockerfile generation from VM analysis |
| P2.3 | Database Migration | Schema-mapping across 10 source/target DB pairs |
| P2.4 | Training & Documentation | SOP generation + runbook AI authoring |

---

## Implementation Timeline

| Week | Sprint | Deliverables | Exit Criteria |
|------|--------|-------------|---------------|
| 1 | Sprint 0 — Hardening | H-1 through H-8 complete | CORS fixed, rate limiter live, Sentry reporting, tests green |
| 2–3 | P0.1 + P0.2 | AI Copilot chat + Discovery/Assessment | Chat streams plan; assets discovered |
| 4–5 | P0.3 + P0.4 | Wave Planning + Data Migration | Waves generated; validation passing |
| 6–7 | P1.1 + P1.2 | App Migration + Testing/Validation | Strategies shown; test cases generated |
| 8–9 | P1.3 + P1.4 | Cutover Mgmt + Post-Migration Opt | Blue-green cutover demo; cost delta shown |
| 10+ | P2 features | Per-feature milestones | Per-feature acceptance criteria |

---

## Scaffold Gaps to Close (from REVISED-PRD.md §8)

These were present in v1.2 and remain open:

- [ ] `web/public/dclaw-manifest.json` — required for DPanel registration (🔴 blocks platform integration)
- [ ] Non-root containers in `Dockerfile`
- [ ] `docs/` subdirectories: troubleshooting, releases
- [ ] Port registry entry (Frontend: 3060, Backend: 18130)

---

## Engineering Standards Enforcement (REVISED-PRD.md §4)

The following stack rules must be validated during Sprint 0 code review:

- `structlog` replaces all `print()` — enforced by ruff rule `T201`
- Type hints on ALL public APIs (ruff `ANN` rules)
- SQLAlchemy 2.0 style only (`Mapped`, `mapped_column`) — no legacy `Column`
- `strictNullChecks: true` in `web/tsconfig.json`
- No `any` without explicit `// @ts-ignore` comment
- Functions < 50 lines (flag in review, not automated)

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Rate limiter fires during integration tests | High | Medium | Configure in-memory storage + high threshold for test env |
| CORS origin list breaks existing frontend dev setup | Medium | Medium | Ship with `localhost:3000` as default; document in `.env.example` |
| Sentry DSN misconfiguration silently disables error tracking | Low | High | Add startup health log: `"sentry initialized"` vs `"sentry disabled"` |
| SQLAlchemy N+1 under 1000-asset load (P0.2 acceptance criterion) | High | High | Audit and fix list routes before P0.2 demo |
| AI agent token-refresh amplification before rate limiter is deployed | High | High | Sprint 0 H-2 is blocking — do not expose endpoints to agents before complete |

---

*DClaw Migrate — PLAN-v1.4 · Supersedes PLAN-v1.2 · Aligned with REVISED-PRD.md v2.3*  
*Analysis source: `testforge/test_analysis.md` · TestForge run 2026-05-31*
