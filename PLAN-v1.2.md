# DClaw Migrate — v1.2 Feature Roadmap

> Based on: Y Combinator vertical SaaS principles, trending GitHub repos (flyway, liquibase), AI product research (Fivetran, Airbyte, Stitch, Matillion)

## Pre-Flight Checklist

- [ ] `frontend/package-lock.json` committed after any `npm install` / dependency change
- [ ] `frontend/next-env.d.ts` exists and is committed
- [ ] `docker-compose.yml` healthchecks correct
- [ ] `frontend/Dockerfile` declares `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`

## v1.0 Feature Inventory (Current)

- [ ] Migration job CRUD
- [ ] Source/target connection config
- [ ] Schema mapping
- [ ] Basic execution log
- [ ] Real backend CRUD (no mocks)
- [ ] Docker + Helm deployment
- [ ] Alembic migrations
- [ ] Backend tests

---

## v1.2 Roadmap

### P0 — Must Have (Ship in v1.0, demo-ready)

#### 1. AI Migration Copilot (Data Architect)
**Description:** AI assistant that plans migrations, suggests mappings, and troubleshoots failures. "How do I migrate from MySQL to PostgreSQL with zero downtime?"
- **AI Angle:** Schema analysis + RAG over migration patterns. LLM mapping suggestions.
- **Backend:** `/api/v1/ai/migrate-chat` endpoint. Schema analyzer.
- **Frontend:** AI panel with migration plan preview.
- **Files:** `backend/app/services/migrate_ai.py`, `frontend/src/components/migrate-copilot.tsx`

#### 2. Schema Discovery & Auto-Mapping
**Description:** Connect to source DB, discover schema, suggest target mappings with type conversions.
- **Backend:** Schema introspection engine. Type mapping rules.
- **Frontend:** Schema comparison view with editable mappings.
- **Files:** `backend/app/services/schema_discovery.py`

#### 3. ETL Pipeline Builder
**Description:** Visual pipeline builder for extract, transform, load with pre-built connectors.
- **Backend:** Pipeline execution engine. Connector framework.
- **Frontend:** Drag-and-drop pipeline canvas with live preview.
- **Files:** `backend/app/services/pipeline_builder.py`, `frontend/src/app/pipelines/builder.tsx`

#### 4. Data Validation & Reconciliation
**Description:** Post-migration validation: row counts, checksums, sample comparisons.
- **Backend:** Validation engine with configurable rules.
- **Frontend:** Validation report with pass/fail details.
- **Files:** `backend/app/services/validation.py`

### P1 — Should Have (v1.1–1.2)

#### 5. Change Data Capture (CDC)
**Description:** Real-time sync with CDC (Debezium-style). Continuous replication.
- **Backend:** CDC adapter framework. Binlog/wal parsing.
- **Frontend:** Replication lag monitor. Event stream view.

#### 6. AI Data Transformation
**Description:** AI suggests and generates transformation rules (data cleaning, normalization, enrichment).
- **AI Angle:** LLM transformation rule generation from examples.
- **Backend:** `/api/v1/ai/suggest-transforms` endpoint.
- **Frontend:** Transformation editor with AI suggest.

#### 7. Migration Scheduling & Orchestration
**Description:** Schedule migrations, manage dependencies, rollback on failure.
- **Backend:** Orchestrator with DAG support. Rollback engine.
- **Frontend:** Migration timeline with dependency graph.

#### 8. Data Quality Profiling
**Description:** Auto-profile source data: nulls, duplicates, outliers, distributions.
- **Backend:** Profiling engine with statistical analysis.
- **Frontend:** Data quality report with visualizations.

### P2 — Could Have (v1.3+)

#### 9. Zero-Downtime Cutover
**Description:** Dual-write pattern with automatic validation and traffic cutover.

#### 10. Data Masking & Anonymization
**Description:** PII detection and anonymization for non-prod migrations.

#### 11. Cross-Cloud Data Transfer
**Description:** Optimized large-scale data transfer between cloud providers.

#### 12. Migration Cost Estimator
**Description:** AI estimates migration duration, cost, and resource requirements.

---

## Implementation Priority

1. **Week 1–2:** AI Migration Copilot (P0.1) + Schema Discovery (P0.2)
2. **Week 3–4:** ETL Pipeline Builder (P0.3) + Data Validation (P0.4)
3. **Week 5–6:** CDC (P1.5) + AI Transformation (P1.6)
4. **Week 7–8:** Scheduling (P1.7) + Data Quality (P1.8)
