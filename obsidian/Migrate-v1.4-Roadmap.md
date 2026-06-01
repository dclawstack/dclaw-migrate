# DClaw Migrate — v1.4 Roadmap

> Source of truth: `PLAN-v1.4.md`
> Architecture rules: `AGENTS.md` · Features: `REVISED-PRD.md` v2.3
> Last updated: 2026-06-01 · **v1.4 — hardening + schema expansion + agentic**

---

## Status Summary

| Phase | Items | Status |
|---|---|---|
| v1.0 Foundation | Connections, Jobs, Schema Discovery, Mappings, Waves, Assets, Logs, Validation | ✅ Done |
| v1.1 P1 Features | Cutover Management, AI Test Generation, Optimization, Runbook Generation | ✅ Done |
| AI Copilot | 8 context-aware AI endpoints (chat, mappings, risk, waves, assessment, cutover, cloud, containerize) | ✅ Done |
| Landing page | Hero, features, lifecycle, AI copilot, 9 screens, tech stack, CTA, **Roadmap section** | ✅ Done |
| Sprint 0 Hardening | CORS fix, rate limiting, JWKS race, Sentry, test auth override, mutation score, PostHog, N+1 audit | 🔲 Next (blocking) |
| P0.4 Schema Expansion | MySQL introspection, MongoDB discovery, CDC groundwork, enhanced type mapping | 🔲 Next |
| P1.3 Agentic | Proactive monitoring agent, SSE streaming, multi-cloud live pricing | 🔲 Backlog |
| P2 | VM→container assessment, training & documentation | 🔲 Backlog |

---

## Failure Analysis Sources

| Source | Date | Score | Findings |
|---|---|---|---|
| TestForge static analysis | 2026-05-31 | 71/100 | 8 validated issues (H-1 to H-8) |

See [[Migrate-TestForge-2026-05-31]] for full findings.

---

## Sprint 0 — Engineering Hardening (Blocking)

All items must be complete before any external user or pilot customer connects.

### H-1 — CORS Wildcard + Credentials [CRITICAL]

**File:** `backend/app/api/main.py:27`
**Root cause:** `allow_origins=["*"]` combined with `allow_credentials=True`. Starlette may reflect the request `Origin` header, allowing any site to read authenticated API responses (OWASP A05).
**Fix:** Replace wildcard with `os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")`. Add `CORS_ALLOWED_ORIGINS` to `.env.example`.

---

### H-2 — Auth Endpoints Not Rate Limited [CRITICAL]

**Files:** `backend/requirements.txt`, `backend/app/api/main.py`
**Root cause:** No rate-limiting library installed. `require_auth` validates JWT on every request with no IP throttling. AI agents retrying on 401 produce 2× load amplification.
**Fix:** Add `slowapi>=0.1.9`. Register `Limiter(key_func=get_remote_address)` as middleware. Apply `@limiter.limit("20/minute")` to high-traffic routes.

---

### H-3 — JWKS Cache Race Condition [HIGH]

**File:** `backend/app/core/auth.py`
**Root cause:** `_jwks_cache: dict = {}` is module-level with no `asyncio.Lock`. Concurrent coroutines race to populate on cold start — redundant external fetches + potential partial-state reads.
**Fix:** Add `_jwks_lock = asyncio.Lock()`. Implement double-checked locking pattern in `_fetch_jwks()`.

---

### H-4 — No Observability Stack [HIGH]

**Files:** `backend/requirements.txt`, `backend/app/api/main.py`, `web/package.json`
**Root cause:** No Sentry, no OpenTelemetry, no structlog. DORA MTTR is "when users report it." Violates AGENTS.md §4.1 `no print()` rule.
**Fix:** Backend: `sentry-sdk[fastapi]>=1.40.0`. Frontend: `@sentry/nextjs` via wizard. Replace all `print()` with `structlog`.

---

### H-5 — Implicit Auth Bypass in Tests [HIGH]

**File:** `backend/tests/conftest.py`
**Root cause:** `require_auth` is not overridden — tests pass only because `LOGTO_ISSUER=""`. Setting it in `.env.test` would silently 401 all 214 tests with no diagnosis.
**Fix:**
```python
from app.core.auth import require_auth
app.dependency_overrides[require_auth] = lambda: {"sub": "test-user", "org": "test-org"}
```
Also add `test_auth.py` covering missing token → 401, invalid token → 401, valid token → 200.

---

### H-6 — Mutation Score 34% [MEDIUM]

**Files:** `backend/tests/test_jobs.py`, `test_connections.py`, `test_waves.py`
**Root cause:** Tests assert HTTP status codes and field *presence* but not value *integrity*. 23,225 of 35,189 mutants survive.
**Fix:** Strengthen assertions — timestamps validated for recency, state transitions asserted exhaustively, error messages checked. Target: ≥60% mutation kill rate.
**Missing edge cases:**
- `completed` job cannot be `run` again
- Malformed DSN strings → 422
- Pagination: `limit=0`, `offset > total`
- Concurrent `run` requests: exactly one 200, one 409

---

### H-7 — No Product Analytics [MEDIUM]

**Files:** `web/package.json`, `web/src/app/layout.tsx`
**Root cause:** No PostHog, Mixpanel, or equivalent. Cannot measure P0 feature adoption.
**Fix:** `npm install posthog-js`. Track 5 lifecycle events: `migration_started`, `wave_created`, `cutover_initiated`, `validation_passed`, `migration_completed`.

---

### H-8 — N+1 Query Risk in Python Backend [MEDIUM]

**Files:** `backend/app/api/v1/jobs.py`, `waves.py`, `assets.py`
**Root cause:** TestForge's N+1 scanner is JS-only — Python backend has zero coverage. SQLAlchemy async lazy-loading in list routes causes N+1 under asyncpg.
**Fix:** Audit all list-returning routes. Apply `selectinload` or `joinedload` explicitly. Priority: `GET /jobs` (jobs + connections), `GET /waves` (waves + assets), `GET /assets`.

---

## P0.4 — Schema Expansion

| Feature | Detail | Tag |
|---|---|---|
| MySQL source introspection | asyncmy driver | P0.4 |
| MongoDB collection discovery | — | P0.4 |
| CDC groundwork | binlog + WAL position tracking | P0.4 |
| Enhanced type mapping | JSON→JSONB · enum inference · VARCHAR length | P0.4 |

---

## P1 — Platform Features

| # | Feature | Status |
|---|---|---|
| P1.1 | Cutover Management (blue-green, 1-click rollback) | ✅ Shipped |
| P1.2 | AI Testing + Validation (generate + run-all) | ✅ Shipped |
| P1.3 | Post-Migration Optimization (AI recommendations) | ✅ Shipped |
| P1.4 | Runbook Generation (5 types, AI-authored) | ✅ Shipped |

---

## P1.3 — Agentic (Backlog)

| Feature | Detail |
|---|---|
| Proactive monitoring agent | Pre-cutover health checks · replication lag alerts |
| SSE streaming for AI | Long-running analysis without timeout |
| Multi-cloud live pricing | Real-time cost comparison across AWS/GCP/Azure |

---

## P2 — Scale Features (Backlog)

| # | Feature |
|---|---|
| P2.1 | Multi-Cloud Strategy (workload placement optimization) |
| P2.2 | Container Migration (Dockerfile generation from VMs) |
| P2.3 | Database Migration (10 source/target DB pairs) |
| P2.4 | Training & Documentation (SOP generation + runbook AI) |

---

## Implementation Order

```
Sprint 0   H-1 CORS fix                         ← 1h
Sprint 0   H-2 Rate limiting (slowapi)           ← 3h
Sprint 0   H-3 JWKS race fix                     ← 1h
Sprint 0   H-4 Sentry (backend + frontend)       ← 4h
Sprint 0   H-5 Auth override in conftest         ← 1h
Sprint 0   H-6 Test assertion hardening          ← 4h
Sprint 0   H-7 PostHog analytics                 ← 3h
Sprint 0   H-8 N+1 audit in list routes          ← 3h
─────────────────────────────────────────────────
P0.4       MySQL introspection (asyncmy)
P0.4       MongoDB collection discovery
P0.4       CDC groundwork
P0.4       Enhanced type mapping
─────────────────────────────────────────────────
P1.3       Proactive monitoring agent
P1.3       SSE streaming
P2.1–P2.4  Scale features
```

---

## Deliverables Shipped in This Session (2026-05-31 → 2026-06-01)

| Artifact | Description |
|---|---|
| `PLAN-v1.4.md` | Implementation plan with Sprint 0 hardening from TestForge |
| `PRODUCT-SPEC.md` | Corrected ports, 12 models, 64 endpoints, 8 AI routes, implementation matrix |
| `README.md` | Full rewrite — quickstart, env vars, API overview, deployment |
| `docs/reference/api.md` | Complete endpoint reference with state machine rules |
| `docs/reference/architecture.md` | Updated stack, services layer |
| `docs/getting-started/quickstart.md` | Real 7-step migration walkthrough |
| `docs/getting-started/configuration.md` | Corrected env vars, K8s secrets example |
| `Infographics/architecture-diagram.md` | 9 Mermaid diagrams |
| `Infographics/dclaw-migrate-infograph.html` | Vertical infographic, OC purple `#7030A0` |
| `slides/deck-content.md` | 14-slide deck source content |
| `slides/dclaw-migrate-deck.html` | 14-slide HTML deck (1280×720, print-ready) |
| `testforge/test_analysis.md` | Deep TestForge analysis with code fixes |
| Landing page roadmap section | `web/src/app/page.tsx` — Live + Next segments |
| Vercel production deploy | https://dclaw-migrate-web.vercel.app (commit `2672411`) |

---

## Related Notes

- [[Migrate-Architecture]] — stack, ports, models, API surface, anti-patterns
- [[Migrate-Design-System]] — OC purple palette, status badges, components
- [[Migrate-TestForge-2026-05-31]] — TestForge findings that drove Sprint 0
