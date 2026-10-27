"""
Endpoints for database schema inspection (38 tables, columns, constraints, sample records).
"""

from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from app.core.schema_store import schema_store

router = APIRouter()


@router.get("", response_model=Dict[str, Any])
def list_tables() -> Dict[str, Any]:
    """
    List all 38 database tables defined in schemas/dbdiagram_schema.dbml,
    grouped by their 8 architectural domains, with live mock record counts.
    """
    return schema_store.get_all_tables()


@router.get("/{table_name}", response_model=Dict[str, Any])
def get_table_details(table_name: str) -> Dict[str, Any]:
    """
    Get full column definitions, primary keys, foreign keys, constraints,
    and schema-valid sample records for a specific table.
    Returns 404 if the table does not exist in the 38 DBML tables.
    """
    table = schema_store.get_table(table_name)
    if not table:
        raise HTTPException(
            status_code=404,
            detail=f"Table '{table_name}' not found in 38 DBML tables",
        )
    return table
