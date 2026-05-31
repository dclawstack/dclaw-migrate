# API Reference

## Base URL

```
http://localhost:8121          (local Docker)
https://migrate.yourdomain.com (production)
```

## Interactive Docs

```
http://localhost:8121/docs      (Swagger UI)
http://localhost:8121/redoc     (ReDoc)
http://localhost:8121/openapi.json
```

## Authentication

When `LOGTO_ISSUER` is configured, all `/api/v1/` routes require a Bearer token:

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8121/api/v1/jobs
```

The `/health` endpoint is always unauthenticated.

When `LOGTO_ISSUER` is empty (default in local dev), authentication is disabled and all routes are open.

## Response Format

Successful responses return JSON. Errors follow FastAPI's default format:

```json
{
  "detail": "Migration job not found"
}
```

HTTP status codes:
- `200` — OK
- `201` — Created
- `204` — No Content (delete)
- `400` — Bad Request (e.g. unsupported connection type for schema discovery)
- `401` — Unauthorized (missing or invalid token)
- `404` — Not Found
- `409` — Conflict (e.g. running job cannot be edited)
- `422` — Validation Error (Pydantic schema mismatch)
- `502` — Bad Gateway (AI provider unreachable or not configured)

## Endpoints

### Health

```http
GET /health
```
Response: `{"status": "ok"}`

---

### Dashboard

```http
GET /api/v1/dashboard
```
Returns aggregate counts: total jobs, running, completed, failed, recent log entries.

---

### Connections

```http
GET    /api/v1/connections
POST   /api/v1/connections
GET    /api/v1/connections/{id}
PUT    /api/v1/connections/{id}
DELETE /api/v1/connections/{id}
POST   /api/v1/connections/{id}/test
```

`POST /connections/{id}/test` returns `{"ok": bool, "latency_ms": int}` and updates `status` + `last_tested_at`.

Connection types: `postgresql`, `mysql`, `mongodb`, `mssql`, `aws_rds`, `gcp_cloudsql`, `azure_sql`  
Roles: `source`, `target`

---

### Migration Jobs

```http
GET    /api/v1/jobs
POST   /api/v1/jobs
GET    /api/v1/jobs/{id}
PUT    /api/v1/jobs/{id}
DELETE /api/v1/jobs/{id}
POST   /api/v1/jobs/{id}/run
POST   /api/v1/jobs/{id}/cancel
```

**Status state machine:**  
`draft` → `running` (via `/run`) → `completed` | `failed`  
→ `failed` also reachable via `/cancel` from `running`  
Editing a `running` job returns `409 Conflict`.

---

### Schema Mappings

```http
GET    /api/v1/jobs/{id}/mappings
POST   /api/v1/jobs/{id}/mappings
PUT    /api/v1/jobs/{id}/mappings/{mapping_id}
DELETE /api/v1/jobs/{id}/mappings/{mapping_id}
POST   /api/v1/jobs/{id}/discover
```

`POST /discover` introspects the job's source connection live and creates draft `SchemaMapping` rows.  
**Supported source types for discovery:** `postgresql`, `aws_rds`, `gcp_cloudsql`, `azure_sql`. Other types return `400`.

---

### Execution Logs

```http
GET /api/v1/jobs/{id}/logs
```

Query params: `?level=info|warning|error`, `?limit=50`, `?offset=0`

---

### Validation

```http
GET  /api/v1/jobs/{id}/validations
POST /api/v1/jobs/{id}/validate
```

`POST /validate` triggers a validation run: row count comparison + checksum per mapped table. Returns `ValidationRunResponse` with per-table status.

---

### Cutover

```http
GET  /api/v1/jobs/{id}/cutover
POST /api/v1/jobs/{id}/cutover
PUT  /api/v1/jobs/{id}/cutover
POST /api/v1/jobs/{id}/cutover/execute
POST /api/v1/jobs/{id}/cutover/complete
POST /api/v1/jobs/{id}/cutover/rollback
```

**Status state machine:** `planned` → `executing` → `completed` | `rolled_back`

---

### Test Cases

```http
GET  /api/v1/jobs/{id}/test-cases
POST /api/v1/jobs/{id}/generate-tests
POST /api/v1/jobs/{id}/run-tests
```

`POST /generate-tests` — AI generates test cases from job schema context.  
`POST /run-tests` — Executes all `pending` test cases; returns pass/fail per case.

---

### Optimization

```http
GET  /api/v1/jobs/{id}/optimizations
POST /api/v1/jobs/{id}/optimize
POST /api/v1/jobs/{id}/optimizations/{rec_id}
```

`POST /optimize` — AI generates right-sizing / cost / performance recommendations.  
`POST /optimizations/{rec_id}` — Accept or dismiss a recommendation (pass `{"status": "accepted"}` or `{"status": "dismissed"}`).

---

### Runbooks

```http
GET    /api/v1/jobs/{id}/runbooks
POST   /api/v1/jobs/{id}/runbooks
PUT    /api/v1/jobs/{id}/runbooks/{runbook_id}
DELETE /api/v1/jobs/{id}/runbooks/{runbook_id}
POST   /api/v1/jobs/{id}/runbooks/generate
```

`POST /runbooks/generate` — AI generates a runbook from job context. Pass `{"runbook_type": "pre_migration"|"cutover"|"rollback"|"post_migration"}` in the request body.

---

### Waves

```http
GET    /api/v1/waves
POST   /api/v1/waves
GET    /api/v1/waves/{id}
PUT    /api/v1/waves/{id}
DELETE /api/v1/waves/{id}
POST   /api/v1/waves/{id}/jobs
DELETE /api/v1/waves/{id}/jobs/{job_id}
```

`POST /waves/{id}/jobs` — Add a job to a wave. Body: `{"job_id": "<uuid>"}`.

---

### Application Assets

```http
GET    /api/v1/assets
POST   /api/v1/assets
GET    /api/v1/assets/{id}
PUT    /api/v1/assets/{id}
DELETE /api/v1/assets/{id}
```

Migration strategies: `lift-and-shift`, `re-platform`, `refactor`, `repurchase`, `retire`, `retain`

---

### AI Copilot

All AI endpoints accept:

```json
{
  "message": "string",
  "job_id": "uuid (optional)",
  "history": [{"role": "user|assistant", "content": "string"}]
}
```

And return: `{"reply": "string"}`

```http
POST /api/v1/ai/migrate-chat        General migration chat (job-context-aware)
POST /api/v1/ai/suggest-mappings    Column mapping suggestions for a job
POST /api/v1/ai/assess-risk         Risk assessment with mitigation steps
POST /api/v1/ai/plan-waves          Wave grouping and sequencing optimization
POST /api/v1/ai/assess-application  Effort estimate + strategy per asset
POST /api/v1/ai/plan-cutover        Cutover checklist and timing
POST /api/v1/ai/cloud-strategy      Cloud provider comparison
POST /api/v1/ai/containerize        Containerization and Dockerfile guidance
```

Returns `502` if no AI provider (OpenRouter or Ollama) is configured.
