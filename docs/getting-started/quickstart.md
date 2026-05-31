# Quickstart

Get a migration running in under 10 minutes.

## Step 1: Start the Stack

```bash
git clone https://github.com/dclawstack/dclaw-migrate
cd dclaw-migrate
cp .env.example .env
# Edit .env — set OPENROUTER_API_KEY (or OLLAMA_BASE_URL for local AI)
docker compose up --build -d
docker compose exec backend alembic upgrade head
```

Open **http://localhost:3035**

## Step 2: Register Connections

1. Go to **Connections** → **Add Connection**
2. Fill in source database details (host, port, credentials)
3. Click **Test** — status turns green when connectivity is confirmed
4. Repeat for your target database

## Step 3: Create a Migration Job

1. Go to **Jobs** → **New Job**
2. Name the job, select migration type (`full_load` / `schema_only` / `cdc`)
3. Assign source and target connections
4. Save

## Step 4: Discover Schema

1. Open the job → **Schema Mapper** tab
2. Click **Discover Schema** — DClaw connects to the source DB and generates draft mappings
3. Review each table mapping, edit transform rules as needed, exclude tables you don't need

> Schema discovery requires a PostgreSQL-family source (postgresql, aws_rds, gcp_cloudsql, azure_sql).

## Step 5: Run and Monitor

1. Click **Run** on the job
2. Switch to the **Execution Log** tab — entries stream as the migration progresses
3. When complete, click **Validate** → DClaw compares row counts and checksums per table

## Step 6: Cutover

1. Open the **Cutover** tab on the job
2. Use **AI: Plan Cutover** to generate a checklist and timing recommendations
3. Click **Execute Cutover** when ready
4. If anything goes wrong, click **Rollback**

## Step 7: Post-Migration

1. Click **Optimize** → AI generates right-sizing and cost recommendations
2. Click **Generate Runbook** → get step-by-step playbooks for each phase

## Next Steps

- [API Reference](../reference/api.md)
- [Architecture](../reference/architecture.md)
- [Configuration](configuration.md)
- [Guides](../guides/)
