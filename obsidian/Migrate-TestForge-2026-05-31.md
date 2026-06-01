# DClaw Migrate — TestForge Audit 2026-05-31

> TestForge MCP run: 2026-05-31T12:52:30Z
> Overall score: **71/100** · Tier-2 generated tests: **11/11 passed**
> Full report: `testforge/testforge-dclaw-migrate.json`
> Deep analysis: `testforge/test_analysis.md`

---

## Score Summary

| Dimension | Score | Real issue? |
|---|---|---|
| Security | 0/100 | ❌ False positive — all XSS in `node_modules/object-hash` |
| OWASP | 80/100 | ⚠️ Missing A08 + A10 coverage |
| Supply Chain | 100/100 | ✅ No known vulnerabilities |
| License | 89/100 | ✅ No issues |
| Unit Tests | 67/100 | ⚠️ 67% function coverage, 214 cases |
| **Mutation** | **34/100** | ✅ Real — 34% kill rate (23,225 surviving mutants) |
| Property-Based | 50/100 | No hypothesis usage |
| Edge Cases | 70/100 | Python + JS covered |
| Contract | 98/100 | ✅ All 102 endpoints have response models |
| Predictive Risk | 85/100 | 9 predicted failures in 12 flagged files |
| N+1 Queries | 83/100 | ⚠️ JS-only scan — Python backend unscanned |
| Dead Code | 69/100 | JS-only scan |
| Chaos | 100/100 | ✅ Graceful shutdown, retry, error handlers |
| Agentic Scale | 91/100 | ⚠️ Auth endpoints not rate-limited |
| Accessibility | 57/100 | 45 issues across 24 HTML files |
| Visual Regression | 100/100 | No hardcoded pixels/colors in JSX |
| Vision | 81/100 | ⚠️ No observability, no analytics, no feature flags |
| DORA | 25/100 | ⚠️ MTTR Weak (no observability), change fail rate Weak |
| Stack | 39/100 | ❌ False negative — scanner blind to Python ecosystem |

---

## Validated Findings (H-1 to H-8)

These drove [[Migrate-v1.4-Roadmap]] Sprint 0.

### H-1 — CORS Wildcard + Credentials [CRITICAL] ✅ Real

**Scanner:** Missed (OWASP scan is JS-only). Found via manual code review.
**Evidence:** `backend/app/api/main.py:27` — `allow_origins=["*"]` + `allow_credentials=True`
**Impact:** Starlette may reflect `Origin` header instead of `*` — any website can read authenticated API responses. Affects all 102 endpoints.
**OWASP:** A05:2021 — Security Misconfiguration

---

### H-2 — Auth Endpoints Not Rate Limited [CRITICAL] ✅ Real

**Scanner:** TestForge Agentic Scale (HIGH)
**Evidence:** `backend/requirements.txt` — no `slowapi`, no `fastapi-limiter`. `require_auth` has no IP counter.
**Impact:** DoS/brute-force vector on all authenticated routes. AI agents retrying on 401 create 2× load amplification — particularly dangerous for DClaw Migrate's agentic use case.

---

### H-3 — JWKS Cache Race Condition [HIGH] ✅ Real

**Scanner:** Code review.
**Evidence:** `backend/app/core/auth.py` — `_jwks_cache: dict = {}` with no `asyncio.Lock`.
**Impact:** Concurrent cold-start coroutines race to populate; intermittent 401s under agentic load.

---

### H-4 — No Observability Stack [HIGH] ✅ Real

**Scanner:** TestForge Vision (HIGH × 2)
**Evidence:** Neither `sentry-sdk`, `opentelemetry-*` in `backend/requirements.txt` nor `@sentry/nextjs` in `web/package.json`.
**Impact:** DORA MTTR = "when users report it." 102 backend endpoints have no error aggregation.

---

### H-5 — Implicit Auth Bypass in Tests [HIGH] ✅ Real

**Scanner:** Code review.
**Evidence:** `backend/tests/conftest.py` — `require_auth` not overridden. Tests pass only because `LOGTO_ISSUER=""` in test env.
**Impact:** Silent fragility — one env var away from all 214 tests returning 401 with no diagnosis.

---

### H-6 — Mutation Score 34% [MEDIUM] ✅ Real

**Scanner:** TestForge Mutation (34/100)
**Evidence:** 35,189 mutants; 11,964 killed; 23,225 surviving. `test_jobs.py` uses status-code-only assertions.
**Example surviving mutant:** Setting `completed_at` to a fixed past date passes because tests only check `is not None`.

---

### H-7 — No Product Analytics [MEDIUM] ✅ Real

**Scanner:** TestForge Vision (HIGH)
**Evidence:** No PostHog/Mixpanel/Amplitude in either `requirements.txt` or `package.json`.
**Impact:** Cannot measure P0 feature adoption. Blocks data-driven P1 prioritization.

---

### H-8 — N+1 Query Risk (Python backend unscanned) [MEDIUM] ✅ Real

**Scanner:** TestForge N+1 (83/100 — but JS-only)
**Evidence:** N+1 scanner is Babel AST only — FastAPI backend has zero N+1 detection coverage.
**Direct conflict with REVISED-PRD acceptance criterion:** P0.2 "Discover 1000 assets" requires `GET /assets` to not issue N queries.

---

## False Positives (Excluded from Roadmap)

### Security 0/100 — XSS in `object-hash` ❌ False Positive

**Scanner verdict:** 10 HIGH XSS findings in `web/node_modules/object-hash/index.js`
**Reality:** `write()` in object-hash serialises to a Node.js `PassThrough` stream for cache-key hashing — not the DOM. Confidence: `low` in the JSON payload confirms uncertainty.
**Action:** Configure TestForge to exclude `node_modules/` and `.next/` from taint analysis.

### Stack 39/100 — "Missing TypeScript, ORM, testing framework" ❌ False Negative

**Scanner verdict:** Reports missing TypeScript, no ORM, no testing framework.
**Reality:** TypeScript is present (`web/tsconfig.json`), SQLAlchemy is the ORM (`requirements.txt`), pytest is present. Scanner is JS-only — blind to Python ecosystem.
**Action:** No code changes needed. Scores from this dimension are non-actionable.

---

## Tier-2 Generated Tests (All Passed)

TestForge generated and ran 11 behavioral tests targeting the 3 findings:

| Test file | Finding | Result |
|---|---|---|
| `no-observability-stack-detected-src-l0.test.ts` | No observability stack | ✅ 4/4 |
| `no-product-analytics-dependency-src-l0.test.ts` | No product analytics | ✅ 4/4 |
| `auth-endpoints-not-rate-limited-src-l0.test.ts` | Auth not rate limited | ✅ 3/3 |

These are **synthetic behavioral tests** — they verify the pattern in isolation, not against live application code. The passing tests confirm the test logic is correct; the underlying issue in production code remains unresolved until Sprint 0 is implemented.

---

## Predictive Risk (High-Priority Files)

TestForge Predictive Risk (85/100) flagged 9 predicted failures across 12 files. Highest risk:

1. `web/src/app/jobs/[id]/page.tsx` — 211 lines, highest complexity
2. `web/src/app/page.tsx` — 692 lines (landing page), largest file
3. `web/src/app/cutover/page.tsx` — 185 lines

These are frontend files — complexity scores are based on LOC + TODO density (Python complexity not analyzed).

---

## Codebase Stats (at scan time)

| Metric | Value |
|---|---|
| Total files | 8,000 |
| Total lines | 1,118,981 |
| Endpoints | 102 |
| Test files | 44 |
| Test cases | 214 |
| Estimated function coverage | 67% |
| Test framework | pytest |

---

## Related Notes

- [[Migrate-Architecture]] — stack, ports, models, anti-patterns
- [[Migrate-v1.4-Roadmap]] — Sprint 0 hardening derived from this report
- [[Migrate-Design-System]] — OC purple palette, components
