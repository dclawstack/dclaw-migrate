# Architecture

## Overview

DClaw Migrate uses the standard DClaw three-tier architecture with an AI services layer between the API and the database.

```
┌─────────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│  Frontend           │────▶│  Backend             │────▶│  Database        │
│  Next.js 14         │     │  FastAPI · Port 8121 │     │  PostgreSQL 16   │
│  Port 3035          │     │  13 route modules    │     │  12 tables       │
│  TypeScript         │     │  3 service classes   │     │  Alembic managed │
└─────────────────────┘     └─────────────────────┘     └──────────────────┘
                                        │
                              ┌─────────┴─────────┐
                              │  AI Providers      │
                              │  OpenRouter (K2)   │
                              │  Ollama (fallback) │
                              └───────────────────┘
```

## Components

### Frontend

- **Framework:** Next.js 14.2 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **UI Components:** Pre-built design system in `src/components/ui/`
- **Global layout:** `AppShell.tsx` (nav + sidebar wrapper)
- **AI panel:** `CopilotPanel.tsx` (floating, context-aware)
- **State:** React hooks + Context (no external state library)

### Backend

- **Framework:** FastAPI
- **Language:** Python 3.11+
- **ORM:** SQLAlchemy 2.0 (`Mapped`, `mapped_column` style)
- **Driver:** asyncpg (async PostgreSQL)
- **Validation:** Pydantic v2
- **Settings:** pydantic-settings (`.env` file)
- **Auth:** Logto JWT validation via `python-jose` (disabled when `LOGTO_ISSUER=""`)
- **AI HTTP client:** httpx (async)

### Services Layer

| Service | File | Responsibility |
|---------|------|----------------|
| AI Copilot | `ai_copilot.py` | OpenRouter / Ollama gateway; 8 AI endpoint handlers |
| Schema Discovery | `schema_discovery.py` | Live DB introspection (PostgreSQL family via asyncpg) |
| Validation | `validation.py` | Post-migration row count + checksum verification |

### Repository Layer

One repository class per entity in `backend/app/repositories/`. All database access goes through the repository layer — routes do not query SQLAlchemy sessions directly.

### Infrastructure

- **Container:** Docker (multi-stage builds)
- **Orchestration:** Kubernetes via DClaw Operator + Helm
- **Database:** CloudNativePG (K8s) / docker-compose postgres (local)
- **Ingress:** nginx-ingress + cert-manager (K8s)
- **CI:** GitHub Actions (`.github/workflows/`)
