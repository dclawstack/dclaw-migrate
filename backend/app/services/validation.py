import asyncio

import asyncpg

from app.models.connection import Connection
from app.models.schema_mapping import SchemaMapping

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


async def validate_tables(
    source_conn: Connection,
    target_conn: Connection,
    mappings: list[SchemaMapping],
) -> list[dict]:
    """Compare row counts for each non-excluded table-level mapping.

    Returns a list of result dicts ready to be saved as ValidationReport rows.
    """
    if source_conn.connection_type not in _POSTGRES_TYPES:
        raise ValueError(f"Validation not supported for source type '{source_conn.connection_type}'")
    if target_conn.connection_type not in _POSTGRES_TYPES:
        raise ValueError(f"Validation not supported for target type '{target_conn.connection_type}'")

    table_mappings = [
        m for m in mappings if not m.is_excluded and m.source_column is None
    ]
    if not table_mappings:
        return []

    src = await _pg_connect(source_conn)
    tgt = await _pg_connect(target_conn)

    results = []
    try:
        for mapping in table_mappings:
            src_count = 0
            tgt_count = 0
            detail = None

            try:
                src_count = await src.fetchval(f'SELECT COUNT(*) FROM "{mapping.source_table}"') or 0
            except Exception as e:
                detail = f"Source query failed: {e}"

            try:
                tgt_count = await tgt.fetchval(f'SELECT COUNT(*) FROM "{mapping.target_table}"') or 0
            except Exception as e:
                detail = (detail or "") + f" Target query failed: {e}"

            checksum_match = src_count == tgt_count
            status = "passed" if checksum_match and not detail else "failed"
            if checksum_match and detail:
                status = "partial"

            results.append(
                {
                    "table_name": mapping.source_table,
                    "source_row_count": src_count,
                    "target_row_count": tgt_count,
                    "checksum_match": checksum_match,
                    "sample_mismatches": 0,
                    "status": status,
                    "detail": detail,
                }
            )
    finally:
        await src.close()
        await tgt.close()

    return results
