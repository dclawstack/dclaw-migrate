import asyncio

import asyncpg

from app.models.connection import Connection

_POSTGRES_TYPES = {"postgresql", "aws_rds", "gcp_cloudsql", "azure_sql"}


async def _pg_connect(conn: Connection) -> asyncpg.Connection:
    return await asyncio.wait_for(
        asyncpg.connect(
            host=conn.host,
            port=conn.port,
            user=conn.username,
            password=conn.password_secret,
            database=conn.database_name,
            ssl="require" if conn.ssl_enabled else None,
        ),
        timeout=10.0,
    )


async def discover_schema(connection: Connection) -> list[dict]:
    """Return a list of {table, row_count, columns[]} dicts from the source DB.

    Only PostgreSQL-family connections are supported today.
    """
    if connection.connection_type not in _POSTGRES_TYPES:
        raise ValueError(
            f"Schema discovery is not yet supported for '{connection.connection_type}'. "
            "Supported types: postgresql, aws_rds, gcp_cloudsql, azure_sql."
        )

    pg = await _pg_connect(connection)
    try:
        tables = await pg.fetch(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name
            """
        )

        result = []
        for row in tables:
            table_name = row["table_name"]
            columns = await pg.fetch(
                """
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = $1
                ORDER BY ordinal_position
                """,
                table_name,
            )
            try:
                row_count = await pg.fetchval(f'SELECT COUNT(*) FROM "{table_name}"')
            except Exception:
                row_count = None

            result.append(
                {
                    "table": table_name,
                    "row_count": row_count,
                    "columns": [
                        {
                            "name": c["column_name"],
                            "data_type": c["data_type"],
                            "nullable": c["is_nullable"] == "YES",
                        }
                        for c in columns
                    ],
                }
            )
        return result
    finally:
        await pg.close()
