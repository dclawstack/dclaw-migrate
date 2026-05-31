# DClaw Migrate — Architecture Diagrams

> Source diagrams for infographic regeneration. Rendered with Mermaid.
> Version: 1.4 · Updated: 2026-05-31

---

## 1. System Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        B[Browser / App]
    end

    subgraph Frontend["Frontend (Next.js 14 · Port 3035)"]
        LP[Landing /]
        DB[Dashboard /dashboard]
        CN[Connections /connections]
        JB[Jobs /jobs]
        JD[Job Detail /jobs/id]
        WV[Waves /waves]
        AS[Assets /assets]
        CT[Cutover /cutover]
        OP[Optimization /optimization]
        TS[Testing /testing]
        RB[Runbooks /runbooks]
        CP[Copilot Panel — global]
    end

    subgraph Backend["Backend (FastAPI · Port 8121)"]
        API[API Router /api/v1]
        AUTH[Auth Middleware\nLogto JWT]
        subgraph Routes["Route Modules (13)"]
            direction LR
            R1[connections]
            R2[jobs]
            R3[mappings]
            R4[logs]
            R5[validations]
            R6[cutover]
            R7[test_cases]
            R8[optimization]
            R9[runbooks]
            R10[waves]
            R11[assets]
            R12[ai]
            R13[dashboard]
        end
        subgraph Services["Services Layer"]
            SC[ai_copilot.py\nOpenRouter / Ollama]
            SD[schema_discovery.py\nDB introspection]
            SV[validation.py\nChecksum + row counts]
        end
        subgraph Repos["Repository Layer"]
            RP[(repositories/\nper-entity data access)]
        end
    end

    subgraph Data["Data Layer"]
        PG[(PostgreSQL 16\ndclaw_migrate\n12 tables)]
    end

    subgraph AI["AI Providers"]
        OR[OpenRouter\nKimi K2\nPrimary]
        OL[Ollama\nllama3\nLocal fallback]
    end

    B --> Frontend
    Frontend --> API
    API --> AUTH
    AUTH --> Routes
    Routes --> Services
    Routes --> Repos
    Repos --> PG
    SC --> OR
    SC --> OL
    SD --> PG
```

---

## 2. Migration Job State Machine

```mermaid
stateDiagram-v2
    [*] --> draft : POST /api/v1/jobs

    draft --> running : POST /jobs/{id}/run
    draft --> draft : PUT /jobs/{id} (edit allowed)

    running --> failed : POST /jobs/{id}/cancel
    running --> completed : migration engine completes
    running --> failed : migration engine error

    completed --> [*]
    failed --> [*]

    note right of draft
        Can be edited freely.
        Source and target connections
        can be assigned here.
    end note

    note right of running
        Editing blocked — returns 409.
        Execution logs stream in real-time.
    end note
```

---

## 3. Full Migration Workflow

```mermaid
flowchart TD
    START([Engineer starts migration]) --> CONN

    subgraph Setup["Phase 1 — Setup"]
        CONN[Register Source + Target\nConnections]
        TEST[Test Connectivity\nPOST /connections/id/test]
        JOB[Create Migration Job\nPOST /jobs]
        CONN --> TEST --> JOB
    end

    subgraph Plan["Phase 2 — Plan"]
        DISC[Discover Schema\nPOST /jobs/id/discover]
        MAP[Review + Edit Mappings\n/jobs/id/mappings]
        RISK[AI Risk Assessment\nPOST /ai/assess-risk]
        WAVE[Assign to Wave\nPOST /waves/id/jobs]
        JOB --> DISC --> MAP --> RISK --> WAVE
    end

    subgraph Execute["Phase 3 — Execute"]
        RUN[Run Migration\nPOST /jobs/id/run]
        LOGS[Monitor Execution Logs\nGET /jobs/id/logs]
        WAVE --> RUN --> LOGS
    end

    subgraph Validate["Phase 4 — Validate"]
        VAL[Trigger Validation\nPOST /jobs/id/validate]
        TESTS[Run Test Cases\nPOST /jobs/id/run-tests]
        PASS{All checks\npassed?}
        LOGS --> VAL --> TESTS --> PASS
    end

    subgraph Cutover["Phase 5 — Cutover"]
        COP[AI Cutover Plan\nPOST /ai/plan-cutover]
        EXEC[Execute Cutover\nPOST /jobs/id/cutover/execute]
        DONE[Mark Complete\nPOST /jobs/id/cutover/complete]
        PASS -->|Yes| COP --> EXEC --> DONE
        PASS -->|No| RUN
    end

    subgraph PostMigration["Phase 6 — Post-Migration"]
        OPT[Generate Optimizations\nPOST /jobs/id/optimize]
        RBK[Generate Runbook\nPOST /jobs/id/runbooks/generate]
        DONE --> OPT --> RBK
    end

    ROLLBACK([Rollback\nPOST /jobs/id/cutover/rollback])
    EXEC -->|Problem detected| ROLLBACK
```

---

## 4. AI Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as FastAPI
    participant SV as ai_copilot.py
    participant OR as OpenRouter
    participant OL as Ollama

    U->>FE: Ask question or trigger AI action
    FE->>BE: POST /api/v1/ai/migrate-chat\n{message, job_id, history}
    BE->>BE: Load job context (connection types,\nstatus, table list) if job_id provided
    BE->>SV: chat(messages, model)
    alt OPENROUTER_API_KEY set
        SV->>OR: POST /chat/completions\nmodel: moonshotai/kimi-k2
        OR-->>SV: {reply}
    else OLLAMA_BASE_URL set
        SV->>OL: POST /api/chat\nmodel: llama3
        OL-->>SV: {reply}
    else neither set
        SV-->>BE: RuntimeError
        BE-->>FE: HTTP 502
    end
    SV-->>BE: reply string
    BE-->>FE: {"reply": "..."}
    FE->>U: Display in Copilot panel
```

---

## 5. Data Model (Entity Relationships)

```mermaid
erDiagram
    Connection {
        UUID id PK
        string name
        string connection_type
        string role
        string host
        int port
        string database_name
        string username
        string password_secret
        bool ssl_enabled
        string status
        datetime last_tested_at
    }

    MigrationWave {
        UUID id PK
        string name
        int sequence_order
        string status
        string risk_level
    }

    MigrationJob {
        UUID id PK
        string name
        string migration_type
        string status
        UUID source_connection_id FK
        UUID target_connection_id FK
        UUID wave_id FK
        datetime started_at
        datetime completed_at
    }

    SchemaMapping {
        UUID id PK
        UUID job_id FK
        string source_table
        string target_table
        string source_column
        string target_column
        string transform_rule
        bool is_excluded
    }

    ExecutionLog {
        UUID id PK
        UUID job_id FK
        string level
        string message
        int rows_processed
        datetime created_at
    }

    ValidationReport {
        UUID id PK
        UUID job_id FK
        string table_name
        int source_row_count
        int target_row_count
        bool checksum_match
        string status
    }

    CutoverPlan {
        UUID id PK
        UUID job_id FK
        string strategy
        string status
        string pre_checks
        string post_checks
        string rollback_procedure
    }

    TestCase {
        UUID id PK
        UUID job_id FK
        string name
        string test_type
        string query_source
        string query_target
        string status
    }

    OptimizationRec {
        UUID id PK
        UUID job_id FK
        string category
        string title
        string priority
        string status
    }

    Runbook {
        UUID id PK
        UUID job_id FK
        string title
        string runbook_type
        string content
    }

    ApplicationAsset {
        UUID id PK
        string name
        string asset_type
        string migration_strategy
        string status
        int effort_estimate_days
        string risk_level
    }

    Connection ||--o{ MigrationJob : "source_connection"
    Connection ||--o{ MigrationJob : "target_connection"
    MigrationWave ||--o{ MigrationJob : "wave"
    MigrationJob ||--o{ SchemaMapping : "mappings"
    MigrationJob ||--o{ ExecutionLog : "logs"
    MigrationJob ||--o{ ValidationReport : "validations"
    MigrationJob ||--|| CutoverPlan : "cutover"
    MigrationJob ||--o{ TestCase : "test_cases"
    MigrationJob ||--o{ OptimizationRec : "optimizations"
    MigrationJob ||--o{ Runbook : "runbooks"
```

---

## 6. Docker Compose Service Map

```mermaid
graph LR
    subgraph dc["docker compose up"]
        PG[(postgres:16-alpine\nPort 5432:5432\ndclaw_migrate DB)]
        BE[backend\nFastAPI\nPort 8121:8121\nhealthcheck: urllib]
        FE[frontend\nNext.js 14\nPort 3035:3035\nhealthcheck: wget]
    end

    FE -->|NEXT_PUBLIC_API_URL=http://localhost:8121| BE
    BE -->|DATABASE_URL=postgresql+asyncpg://...| PG
    PG -.->|service_healthy| BE
    BE -.->|depends_on| FE
```

---

## 7. Screen Navigation Map

```mermaid
graph TD
    LAND[Landing /]
    DASH[Dashboard /dashboard]
    CONN[Connections /connections]
    JOBS[Jobs /jobs]
    JOB[Job Detail /jobs/id]
    WAVE[Waves /waves]
    ASSET[Assets /assets]
    CUT[Cutover /cutover]
    OPT[Optimization /optimization]
    TEST[Testing /testing]
    RBK[Runbooks /runbooks]

    LAND --> DASH
    LAND --> CONN
    LAND --> JOBS
    LAND --> WAVE
    LAND --> ASSET

    JOBS --> JOB

    JOB -->|Schema Mapper tab| JOB
    JOB -->|Execution Log tab| JOB
    JOB -->|Validation tab| JOB
    JOB -->|Test Cases tab| JOB
    JOB -->|Runbooks tab| JOB
    JOB -->|Cutover tab| JOB
    JOB -->|Optimization tab| JOB

    DASH --> JOBS
    DASH --> CONN

    JOB -->|AI: Risk Assessment| JOB
    JOB -->|AI: Mapping Suggestions| JOB
    JOB -->|AI: Generate Tests| JOB
    JOB -->|AI: Generate Runbook| JOB
    JOB -->|AI: Plan Cutover| JOB
    JOB -->|AI: Optimize| JOB
    ASSET -->|AI: Assess Application| ASSET
    ASSET -->|AI: Cloud Strategy| ASSET
    ASSET -->|AI: Containerize| ASSET
    WAVE -->|AI: Plan Waves| WAVE
```

---

## 8. AI Endpoint Map

| Endpoint | Context Used | Primary Use |
|----------|-------------|-------------|
| `/ai/migrate-chat` | Job: name, type, status, connections, tables | General migration Q&A |
| `/ai/suggest-mappings` | Job + schema mappings | Column type mapping suggestions |
| `/ai/assess-risk` | Job + connection types + migration type | Pre-migration risk report |
| `/ai/plan-waves` | Wave list + job list | Optimal wave sequencing |
| `/ai/assess-application` | Asset: type, current host, strategy | Effort estimate + strategy |
| `/ai/plan-cutover` | Job + cutover plan | Checklist + timing |
| `/ai/cloud-strategy` | Asset: type, workload description | Cloud provider comparison |
| `/ai/containerize` | Asset: type, current platform | Dockerfile + K8s manifest guidance |

---

## 9. Kubernetes Deployment Architecture

```mermaid
graph TB
    subgraph k8s["Kubernetes Namespace: dclaw-migrate"]
        subgraph Ingress["Ingress Layer"]
            ING[nginx-ingress\nmigrate.yourdomain.com\nTLS via cert-manager]
        end

        subgraph App["Application Tier"]
            FE[Frontend Deployment\nNext.js\n2 replicas]
            BE[Backend Deployment\nFastAPI/Uvicorn\n2 replicas]
        end

        subgraph DB["Data Tier"]
            PG[(CloudNativePG\nPostgreSQL 16\nHA + backup)]
        end

        subgraph Secrets["K8s Secrets"]
            SEC[database-secret\nopenrouter-secret\nlogto-secret]
        end
    end

    Internet --> ING
    ING --> FE
    ING --> BE
    BE --> PG
    BE --> SEC
```
