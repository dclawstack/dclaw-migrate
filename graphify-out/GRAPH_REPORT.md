# Graph Report - /home/chandraja/AI_white_noise/dclaw/dclaw-migrate  (2026-06-01)

## Corpus Check
- Corpus is ~34,800 words - fits in a single context window (expanded from ~17,570 with new docs/infographics/slides/obsidian).

## Summary
- 412 nodes · 438 edges · 78 communities (42 shown, 36 thin omitted)
- Extraction: 85% EXTRACTED · 13% INFERRED · 2% AMBIGUOUS · INFERRED: 57 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output
- **Last sync:** 2026-06-01 · commits `9265d5d` (docs + infographics) and `2672411` (roadmap section)

## Community Hubs (Navigation)
- [[_COMMUNITY_UI Component Library|UI Component Library]]
- [[_COMMUNITY_FastAPI Application Layer|FastAPI Application Layer]]
- [[_COMMUNITY_Kubernetes  Helm Deployment|Kubernetes / Helm Deployment]]
- [[_COMMUNITY_Frontend Dependencies|Frontend Dependencies]]
- [[_COMMUNITY_Architecture Anti-Patterns|Architecture Anti-Patterns]]
- [[_COMMUNITY_Next.js Frontend Pages|Next.js Frontend Pages]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_K8s Backend Deployment|K8s Backend Deployment]]
- [[_COMMUNITY_Platform Config & Releases|Platform Config & Releases]]
- [[_COMMUNITY_Developer Architecture Guide|Developer Architecture Guide]]
- [[_COMMUNITY_Docker Compose Services|Docker Compose Services]]
- [[_COMMUNITY_Repository  Data Access Layer|Repository / Data Access Layer]]
- [[_COMMUNITY_User Guides & Reference Docs|User Guides & Reference Docs]]
- [[_COMMUNITY_Agent Prompt Templates|Agent Prompt Templates]]
- [[_COMMUNITY_Core Migration Domain Entities|Core Migration Domain Entities]]
- [[_COMMUNITY_AI Migration Copilot Features|AI Migration Copilot Features]]
- [[_COMMUNITY_Alembic Database Migrations|Alembic Database Migrations]]
- [[_COMMUNITY_Migration API & Schemas|Migration API & Schemas]]
- [[_COMMUNITY_Docs Navigation Metadata|Docs Navigation Metadata]]
- [[_COMMUNITY_Coding Guidelines|Coding Guidelines]]
- [[_COMMUNITY_ETL & Data Pipeline Features|ETL & Data Pipeline Features]]
- [[_COMMUNITY_App Metadata|App Metadata]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_Next.js Build Config|Next.js Build Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]
- [[_COMMUNITY_Data Backup Practices|Data Backup Practices]]
- [[_COMMUNITY_Cutover Management|Cutover Management]]
- [[_COMMUNITY_App Settings Config|App Settings Config]]
- [[_COMMUNITY_Frontend Env Config|Frontend Env Config]]
- [[_COMMUNITY_AI Data Transform Feature|AI Data Transform Feature]]
- [[_COMMUNITY_Migration Risk Assessment|Migration Risk Assessment]]
- [[_COMMUNITY_Screen Dashboard|Screen: Dashboard]]
- [[_COMMUNITY_Screen Connections|Screen: Connections]]
- [[_COMMUNITY_Screen Migration Jobs|Screen: Migration Jobs]]
- [[_COMMUNITY_Screen Schema Discovery|Screen: Schema Discovery]]
- [[_COMMUNITY_P1 AI Data Transformation|P1: AI Data Transformation]]
- [[_COMMUNITY_P1 Scheduling & Orchestration|P1: Scheduling & Orchestration]]
- [[_COMMUNITY_P1 Data Quality Profiling|P1: Data Quality Profiling]]
- [[_COMMUNITY_P2 Data Masking & Anonymization|P2: Data Masking & Anonymization]]
- [[_COMMUNITY_P2 Cross-Cloud Data Transfer|P2: Cross-Cloud Data Transfer]]
- [[_COMMUNITY_P2 Migration Cost Estimator|P2: Migration Cost Estimator]]
- [[_COMMUNITY_QA  Code Review Agent|QA / Code Review Agent]]
- [[_COMMUNITY_Feature Developer Agent|Feature Developer Agent]]
- [[_COMMUNITY_P0 Wave Planning|P0: Wave Planning]]
- [[_COMMUNITY_P1 Application Migration|P1: Application Migration]]
- [[_COMMUNITY_P1 Testing & Validation|P1: Testing & Validation]]
- [[_COMMUNITY_P1 Post-Migration Optimization|P1: Post-Migration Optimization]]
- [[_COMMUNITY_P2 Multi-Cloud Strategy|P2: Multi-Cloud Strategy]]
- [[_COMMUNITY_P2 Container Migration|P2: Container Migration]]
- [[_COMMUNITY_P2 Training & Documentation|P2: Training & Documentation]]
- [[_COMMUNITY_Parallelization Performance|Parallelization Performance]]
- [[_COMMUNITY_Claude Code Review Workflow|Claude Code Review Workflow]]
- [[_COMMUNITY_Claude Issue Workflow|Claude Issue Workflow]]
- [[_COMMUNITY_Use Case Team Collaboration|Use Case: Team Collaboration]]
- [[_COMMUNITY_Use Case Reporting & Analytics|Use Case: Reporting & Analytics]]
- [[_COMMUNITY_Helm Replica Count Config|Helm Replica Count Config]]
- [[_COMMUNITY_Sprint 0 Engineering Hardening|Sprint 0: Engineering Hardening]] ← **NEW**
- [[_COMMUNITY_TestForge Security Audit|TestForge Security Audit 2026-05-31]] ← **NEW**
- [[_COMMUNITY_Infographics & Presentation Artifacts|Infographics & Presentation Artifacts]] ← **NEW**
- [[_COMMUNITY_Obsidian Knowledge Vault|Obsidian Knowledge Vault]] ← **NEW**
- [[_COMMUNITY_Landing Page Roadmap Section|Landing Page: Roadmap Section]] ← **NEW**
- [[_COMMUNITY_PLAN v1.4 Implementation Plan|PLAN v1.4: Implementation Plan]] ← **NEW**
- [[_COMMUNITY_OC Purple Design System|OC Purple Design System]] ← **NEW**
- [[_COMMUNITY_Vercel Production Deployment|Vercel Production Deployment]] ← **NEW**

## God Nodes (most connected - your core abstractions)
1. `cn()` - 24 edges
2. `compilerOptions` - 15 edges
3. `dependencies` - 12 edges
4. `Anti-Patterns Table (AGENTS.md)` - 11 edges
5. `Helm Chart: dclaw-migrate/dclaw-migrate (v0.1.0)` - 11 edges
6. `BaseRepository` - 10 edges
7. `Base` - 7 edges
8. `shadcn/ui component pattern` - 7 edges
9. `Configuration Guide` - 7 edges
10. `Helm Chart: dclaw-migrate (v1.0.0)` - 7 edges
11. `PLAN-v1.4.md` - 6 edges ← **NEW**
12. `TestForge Audit 2026-05-31` - 6 edges ← **NEW**

## Surprising Connections (you probably didn't know these)
- `Input UI Component` --conceptually_related_to--> `Anti-Patterns Table (AGENTS.md)`  [INFERRED]
  frontend/src/components/ui/input.tsx → AGENTS.md
- `P0.2: Discovery & Assessment` --semantically_similar_to--> `P0.2: Schema Discovery & Auto-Mapping`  [INFERRED] [semantically similar]
  REVISED-PRD.md → PLAN-v1.2.md
- `P0.4: Data Migration` --semantically_similar_to--> `P0.4: Data Validation & Reconciliation`  [INFERRED] [semantically similar]
  REVISED-PRD.md → PLAN-v1.2.md
- `P1.3: Cutover Management` --semantically_similar_to--> `P2.9: Zero-Downtime Cutover`  [INFERRED] [semantically similar]
  REVISED-PRD.md → PLAN-v1.2.md
- `Sacred Tech Stack (REVISED-PRD §4)` --semantically_similar_to--> `Architecture Lock (AGENTS.md)`  [INFERRED] [semantically similar]
  REVISED-PRD.md → AGENTS.md
- `Sprint 0 CORS Fix (H-1)` --directly_addresses--> `OWASP A05 violation in main.py`  [EXTRACTED] ← **NEW**
  testforge/test_analysis.md → backend/app/api/main.py
- `Roadmap Section (landing page)` --references--> `PLAN-v1.4.md Sprint 0 + P1.3`  [EXTRACTED] ← **NEW**
  web/src/app/page.tsx → PLAN-v1.4.md
- `Infographic Purple palette` --semantically_identical_to--> `OC Design Tokens in dclaw-finance`  [INFERRED] ← **NEW**
  Infographics/dclaw-migrate-infograph.html → dclaw-finance/infographics/dclaw-finance-infograph.html

## Hyperedges (group relationships)
- **Database lifecycle: init_db on startup, get_db per request, Base for schema** — core_database_init_db, core_database_get_db, core_database_engine, models_base_base, core_config_settings [INFERRED 0.90]
- **Test infrastructure: override DI, drop/create tables, async HTTP client** — tests_conftest_override_get_db, tests_conftest_setup_db, tests_conftest_client, api_main_app, models_base_base [EXTRACTED 0.95]
- **All UI components consume cn() utility** — ui_label_label, ui_avatar_avatar, ui_avatar_avatarimage, ui_avatar_avatarfallback, ui_card_card, ui_button_button, ui_select_select, ui_table_table, ui_badge_badge, ui_tabs_tabs, ui_dialog_dialog, lib_utils_cn [EXTRACTED 1.00]
- **Custom shadcn-style UI component system** — ui_label_label, ui_button_button, ui_badge_badge, ui_card_card, ui_tabs_tabs, ui_dialog_dialog, ui_select_select, ui_table_table, ui_avatar_avatar, concept_shadcn_ui_pattern, concept_tailwind_design_tokens, lib_utils_cn [INFERRED 0.95]
- **Parallel Agent Build Roles (Backend + Frontend + DevOps)** — team_onboarding_backend_agent_tab, team_onboarding_frontend_agent_tab, team_onboarding_devops_agent_tab, scaling_playbook_parallel_agent_workflow [EXTRACTED 1.00]
- **P0 Must-Have Features (PLAN-v1.2)** — plan_p0_ai_migration_copilot, plan_p0_schema_discovery, plan_p0_etl_pipeline_builder, plan_p0_data_validation [EXTRACTED 1.00]
- **P0 Foundation Features (REVISED-PRD v2.3)** — revised_prd_ai_migration_copilot, revised_prd_discovery_assessment, revised_prd_wave_planning, revised_prd_data_migration [EXTRACTED 1.00]
- **Core Domain Entities** — product_spec_md_connection, product_spec_md_migrationjob, product_spec_md_schemamapping, product_spec_md_executionlog, product_spec_md_validationreport [EXTRACTED 1.00]
- **Docker Compose Services Stack** — docker_compose_postgres_service, docker_compose_backend_service, docker_compose_frontend_service [EXTRACTED 1.00]
- **CI Workflow Jobs** — ci_yml_backend_tests_job, ci_yml_frontend_build_job, ci_yml_postgres_service [EXTRACTED 1.00]
- **All Agent Anti-Patterns** — agents_md_antipattern_declarative_base, agents_md_antipattern_curl_healthcheck, agents_md_antipattern_mock_data, agents_md_antipattern_shadcn_v4, agents_md_antipattern_mapped_as_dataclass, agents_md_antipattern_default_factory, agents_md_antipattern_timezone_aware_datetime [EXTRACTED 1.00]
- **Authoritative Specification Documents** — revised_prd_document, agents_md_document, plan_v12_md_document, product_spec_md_document [EXTRACTED 1.00]
- **Helm Chart K8s Components (Deployment, Service, Ingress, ServiceAccount)** — templates_deployment_k8s_deployment, templates_service_k8s_service, templates_ingress_k8s_ingress, templates_serviceaccount_k8s_serviceaccount, dclaw_migrate_chart_yaml_helm_chart [EXTRACTED 1.00]
- **Getting Started Documentation Set** — getting_started_index_index, getting_started_installation_dpanel, getting_started_installation_kubectl, getting_started_quickstart_quickstart, getting_started_configuration_configuration [EXTRACTED 1.00]
- **Troubleshooting Documentation Set** — troubleshooting_index_troubleshooting, troubleshooting_common_issues_app_wont_start, troubleshooting_common_issues_db_connection_error, troubleshooting_common_issues_frontend_backend, troubleshooting_faq_update_dclawapp, troubleshooting_faq_backup, troubleshooting_faq_scale, troubleshooting_faq_local_dev [EXTRACTED 1.00]
- **Releases Documentation Set** — releases_index_releases, releases_changelog_v010, releases_roadmap_short_term, releases_roadmap_medium_term, releases_roadmap_long_term [EXTRACTED 1.00]
- **Sprint 0 Hardening Items (H-1 to H-8)** — plan_v14_h1_cors, plan_v14_h2_rate_limit, plan_v14_h3_jwks_race, plan_v14_h4_sentry, plan_v14_h5_auth_test, plan_v14_h6_mutation, plan_v14_h7_posthog, plan_v14_h8_n1_audit [EXTRACTED 1.00] ← **NEW**
- **TestForge Validated Findings** — testforge_h1_cors, testforge_h2_rate_limit, testforge_h3_jwks, testforge_h4_observability, testforge_h5_auth_bypass, testforge_h6_mutation [EXTRACTED 0.95] ← **NEW**
- **Presentation Artifacts (Infographic + Deck)** — infographics_architecture_diagram_md, infographics_html, slides_deck_content_md, slides_html [EXTRACTED 1.00] ← **NEW**
- **Obsidian Knowledge Vault Notes** — obsidian_migrate_architecture, obsidian_migrate_design_system, obsidian_migrate_v14_roadmap, obsidian_migrate_testforge [EXTRACTED 1.00] ← **NEW**
- **PLAN-v1.4 Source Documents** — plan_v14_md, testforge_analysis_md, testforge_json, revised_prd_document [EXTRACTED 0.90] ← **NEW**
- **Landing Page Roadmap Data** — page_tsx_roadmap_live, page_tsx_roadmap_next, plan_v14_sprint0, plan_v14_p04 [EXTRACTED 0.95] ← **NEW**
- **Vercel Production Stack** — web_vercel_project_json, dclaw_migrate_deck_html, dclaw_migrate_infograph_html, page_tsx_landing [EXTRACTED 0.85] ← **NEW**

## Communities (78 total, 36 thin omitted)

### Community 0 - "UI Component Library"
Cohesion: 0.07
Nodes (36): shadcn/ui component pattern, Tailwind CSS design tokens via CSS vars, cn(), Avatar, AvatarFallback, AvatarImage, Badge(), BadgeProps (+28 more)

### Community 1 - "FastAPI Application Layer"
Cohesion: 0.08
Nodes (22): app (FastAPI application instance), lifespan(), BaseSettings, Config, get_settings(), Settings, engine (async SQLAlchemy engine from settings.database_url) (+14 more)

### Community 2 - "Kubernetes / Helm Deployment"
Cohesion: 0.09
Nodes (29): Helm Chart: dclaw-migrate/dclaw-migrate (v0.1.0), Helm Value: image, Helm Value: ingress, Helm Value: postgresql, Helm Value: resources, Helm Value: service, Configuration Guide (+21 more)

### Community 3 - "Frontend Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, autoprefixer, class-variance-authority, clsx, lucide-react, next, postcss, react (+17 more)

### Community 4 - "Architecture Anti-Patterns"
Cohesion: 0.1
Nodes (18): Anti-Patterns Table (AGENTS.md), Anti-Pattern: curl in healthcheck, Anti-Pattern: MappedAsDataclass in Base, Anti-Pattern: In-memory MOCK_* dicts, Anti-Pattern: shadcn CLI v4, Anti-Pattern: timezone-aware datetime, Pinned: pytest-asyncio==0.24.0, backend/requirements.txt (+10 more)

### Community 5 - "Next.js Frontend Pages"
Cohesion: 0.13
Nodes (14): DashboardPage component, inter, metadata, RootLayout(), Home(), API base URL configuration, MigrationPlan domain concept, **Roadmap section (Live + Next)** (+6 more) ← updated

### Community 6 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 7 - "K8s Backend Deployment"
Cohesion: 0.12
Nodes (18): Backend ContainerSpec, Backend Deployment (Kubernetes), Backend Liveness Probe, Replica Count (.Values.replicaCount) (+14 more)

### Community 8 - "Platform Config & Releases"
Cohesion: 0.12
Nodes (17): Config: NEXT_PUBLIC_API_URL, DClawApp CRD, Installation via kubectl, Best Practice: Upgrades, Release v0.1.0, Roadmap: Long Term, Roadmap: Medium Term (+9 more)

### Community 9 - "Developer Architecture Guide"
Cohesion: 0.29
Nodes (6): Architecture Lock (AGENTS.md), Port Registry (AGENTS.md), docs/reference/stack.md, Rationale: Patch not scaffold edit, REVISED-PRD.md v2.3, Sacred Tech Stack (REVISED-PRD §4)

### Community 10 - "Docker Compose Services"
Cohesion: 0.18
Nodes (11): backend service, frontend service, postgres service, RFC 7807 Error Format, Architecture: Frontend→Backend→Database, docs/reference/api.md, docs/reference/architecture.md (+4 more)

### Community 11 - "Repository / Data Access Layer"
Cohesion: 0.27
Nodes (3): BaseRepository, Generic async CRUD repository, Select

### Community 12 - "User Guides & Reference Docs"
Cohesion: 0.22
Nodes (9): Quickstart Guide, Best Practice: Security, Guides Index, Use Case: Infrastructure Workflows, API (Reference), Architecture (Reference), Reference Index, Stack (Reference) (+1 more)

### Community 13 - "Agent Prompt Templates"
Cohesion: 0.22
Nodes (9): Prompt 1: Backend Architect, Prompt 3: DevOps Engineer, Prompt 2: Frontend Builder, DClaw Scaffold Template, Parallel Agent Build Workflow, Backend Architect Agent Tab, DevOps Engineer Agent Tab (+2 more)

### Community 14 - "Core Migration Domain Entities"
Cohesion: 0.32
Nodes (8): Connection, ExecutionLog, MigrationJob, Schema Auto-Mapping, SchemaMapping, Screen: Job Detail, ValidationReport, P2.3: Database Migration

### Community 15 - "AI Migration Copilot Features"
Cohesion: 0.29
Nodes (7): P0.1: AI Migration Copilot, P0.2: Schema Discovery & Auto-Mapping, AI Migration Copilot (PRODUCT-SPEC), Screen: AI Migration Copilot Panel, AI Copilot Mandate (YC S25/W26), P0.1: AI Migration Copilot (REVISED-PRD), P0.2: Discovery & Assessment

### Community 16 - "Alembic Database Migrations"
Cohesion: 0.53
Nodes (5): Alembic async migration config, do_run_migrations(), run_async_migrations(), run_migrations_offline(), run_migrations_online()

### Community 17 - "Migration API & Schemas"
Cohesion: 0.53
Nodes (4): BaseModel, create_plan(), MigrationPlan, PlanIn

### Community 18 - "Docs Navigation Metadata"
Cohesion: 0.4
Nodes (4): app_id, nav, title, version

### Community 19 - "Coding Guidelines"
Cohesion: 0.5
Nodes (3): Guideline: Simplicity First, Guideline: Surgical Changes, Guideline: Think Before Coding

### Community 20 - "ETL & Data Pipeline Features"
Cohesion: 0.5
Nodes (4): P0.4: Data Validation & Reconciliation, P0.3: ETL Pipeline Builder, P1.5: Change Data Capture (CDC), P0.4: Data Migration

### Community 57 - "Sprint 0: Engineering Hardening" ← **NEW**
Cohesion: 0.85
Nodes (8): H-1 CORS wildcard fix, H-2 Auth rate limiting (slowapi), H-3 JWKS cache race (asyncio.Lock), H-4 Sentry observability, H-5 Auth bypass in tests, H-6 Mutation score ≥60%, H-7 PostHog analytics, H-8 N+1 query audit
Source: PLAN-v1.4.md Sprint 0 block

### Community 58 - "TestForge Security Audit 2026-05-31" ← **NEW**
Cohesion: 0.88
Nodes (10): TestForge run 71/100, Security 0/100 (false positive), Mutation 34/100, Auth not rate limited (real), No observability (real), Implicit auth bypass (real), CORS violation (real), N+1 unscanned backend, Tier-2 tests 11/11 passed, Stack 39/100 (false negative)
Source: testforge/testforge-dclaw-migrate.json + testforge/test_analysis.md

### Community 59 - "Infographics & Presentation Artifacts" ← **NEW**
Cohesion: 0.80
Nodes (4): Infographics/architecture-diagram.md (9 Mermaid diagrams), Infographics/dclaw-migrate-infograph.html (OC purple 1200px), slides/deck-content.md (14-slide source), slides/dclaw-migrate-deck.html (1280×720 print-ready)
Source: Infographics/ + slides/ folders

### Community 60 - "Obsidian Knowledge Vault" ← **NEW**
Cohesion: 0.90
Nodes (4): Migrate-Architecture.md, Migrate-Design-System.md, Migrate-v1.4-Roadmap.md, Migrate-TestForge-2026-05-31.md
Source: obsidian/ folder (new, created 2026-06-01)

### Community 61 - "Landing Page: Roadmap Section" ← **NEW**
Cohesion: 0.82
Nodes (5): roadmapLive[] (14 items, v1.0 shipped), roadmapNext[] (10 items, Sprint 0→P1.3), FadeUp scroll animation, ibtf.app layout reference, Vercel prod deploy commit 2672411
Source: web/src/app/page.tsx (section id="roadmap")

### Community 62 - "PLAN v1.4: Implementation Plan" ← **NEW**
Cohesion: 0.85
Nodes (6): Sprint 0 Hardening (blocking), P0.4 Schema Expansion, P1.3 Agentic, P2 Scale Features, TestForge failure analysis input, Supersedes PLAN-v1.2.md
Source: PLAN-v1.4.md

### Community 63 - "OC Purple Design System" ← **NEW**
Cohesion: 0.88
Nodes (8): Purple #7030A0 (primary), #4A1F6C (dark), #B180F8 (light), #E7D8F4 (100), #F5EEFB (50), #FAF6FD (25), Manrope display font, JetBrains Mono labels
Source: obsidian/Migrate-Design-System.md + HTML files

### Community 64 - "Vercel Production Deployment" ← **NEW**
Cohesion: 0.82
Nodes (4): dclaw-migrate-web Vercel project, https://dclaw-migrate-web.vercel.app, web/.vercel/project.json, commit 2672411 (roadmap section)
Source: web/.vercel/project.json + deploy logs

## Knowledge Gaps
- **172 isolated node(s):** `# TODO: Wire v1 routers here after creating them`, `Config`, `Return a naive UTC datetime (no tzinfo)`, `Base class for all SQLAlchemy models`, `Generic async CRUD repository` (+167 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.
- **New gap (2026-06-01):** `obsidian/` vault notes are not yet cross-linked to graph nodes — Migrate-Architecture.md, Migrate-Design-System.md etc. are new corpus additions not yet wired to existing entity nodes.
- **New gap:** Sprint 0 items (H-1 to H-8) are documented but not yet implemented — no corresponding code nodes exist for `slowapi`, `sentry-sdk`, `asyncio.Lock` in `_fetch_jwks`.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Component Library` to `Repository / Data Access Layer`, `Frontend Dependencies`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `BaseRepository` connect `Repository / Data Access Layer` to `FastAPI Application Layer`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Anti-Patterns Table (AGENTS.md)` actually correct?**
  _`Anti-Patterns Table (AGENTS.md)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Sprint 0 Engineering Hardening` to the `FastAPI Application Layer`?** ← **NEW**
  _H-1 (CORS in main.py), H-2 (slowapi middleware in main.py), H-3 (asyncio.Lock in auth.py) — all target the application entry layer._
- **Why does `Roadmap Section (landing page)` reference both `PLAN-v1.4.md` and `testforge/test_analysis.md`?** ← **NEW**
  _The Live/Next data in `roadmapLive[]` and `roadmapNext[]` arrays is directly derived from PLAN-v1.4 Sprint 0 and feature roadmap._
- **What is the relationship between `TestForge Security 0/100` and `CORS violation in main.py`?** ← **NEW**
  _The CORS issue was NOT detected by TestForge (scanner is JS-only for OWASP) — it was found via manual code review prompted by the TestForge report. This is a blind spot in the scanner._
- **Should `UI Component Library` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `FastAPI Application Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
