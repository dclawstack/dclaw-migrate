# Configuration

## Environment Variables

### Backend (`backend/app/core/config.py`)

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_migrate` | Yes | Async PostgreSQL connection string (must use `asyncpg` driver) |
| `APP_ENV` | `dev` | No | `dev` or `production` |
| `DEBUG` | `true` | No | Enable FastAPI debug mode |
| `SECRET_KEY` | `change-me-in-production` | Yes (prod) | JWT signing key |
| `OPENROUTER_API_KEY` | `""` | AI features | OpenRouter API key (Kimi K2 primary AI model) |
| `OLLAMA_BASE_URL` | `""` | Local AI | Ollama base URL, e.g. `http://localhost:11434` |
| `OLLAMA_MODEL` | `llama3` | No | Ollama model name |
| `LOGTO_ISSUER` | `""` | Auth (prod) | Logto OIDC issuer URL — leave empty to disable auth |
| `LOGTO_AUDIENCE` | `dclaw-migrate` | No | Expected JWT audience claim |

### Frontend (baked at build time)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL, e.g. `http://localhost:8121` |

> `NEXT_PUBLIC_API_URL` is baked into the Next.js build via `ARG NEXT_PUBLIC_API_URL` in the Dockerfile. It cannot be changed at runtime without rebuilding.

## Local `.env` Example

```bash
# .env (copy from .env.example)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_migrate
APP_ENV=dev
SECRET_KEY=your-local-secret-key

# AI — pick one
OPENROUTER_API_KEY=sk-or-...
# OR
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# Auth — leave empty for local dev (disables JWT requirement)
LOGTO_ISSUER=
LOGTO_AUDIENCE=dclaw-migrate
```

## Ports

| Service | Docker port | Local dev port (`npm run dev` / `uvicorn`) |
|---------|------------|------------------------------------------|
| Backend (FastAPI) | 8121 | 8033 |
| Frontend (Next.js) | 3035 | 3033 |
| PostgreSQL | 5432 | 5432 |

## Production Configuration

In Kubernetes, all secrets are stored in K8s Secrets and injected as environment variables:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: dclaw-migrate-secrets
  namespace: dclaw-migrate
stringData:
  DATABASE_URL: "postgresql+asyncpg://..."
  SECRET_KEY: "..."
  OPENROUTER_API_KEY: "..."
  LOGTO_ISSUER: "https://your-logto-issuer.logto.app/oidc"
```

## CORS Configuration (Production)

Set `CORS_ALLOWED_ORIGINS` to your frontend domain(s). Wildcard origins with credentials are not permitted:

```bash
CORS_ALLOWED_ORIGINS=https://migrate.yourdomain.com
```

Multiple origins (comma-separated):
```bash
CORS_ALLOWED_ORIGINS=https://migrate.yourdomain.com,https://admin.yourdomain.com
```

## Kubernetes Resources

Adjust resource limits in the DClawApp CRD or Helm values:

```yaml
spec:
  resources:
    limits:
      cpu: 1000m
      memory: 2Gi
    requests:
      cpu: 250m
      memory: 512Mi
```
