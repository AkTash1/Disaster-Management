"""
Schema Store for Disaster Intelligence Multimodal Platform.
Loads, parses, and provides table metadata, columns, constraints, foreign keys,
and sample records for all 38 tables defined in schemas/dbdiagram_schema.dbml.
"""

import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


class SchemaStore:
    """In-memory metadata provider for all 38 database tables, 28 enums, and sample mock data."""

    def __init__(self):
        self._enums: Dict[str, List[str]] = {}
        self._table_groups: Dict[str, List[str]] = {}
        self._tables: Dict[str, Dict[str, Any]] = {}
        self._refs: List[Dict[str, Any]] = []
        self._sample_records: Dict[str, List[Dict[str, Any]]] = {}
        self._initialized = False

    def initialize(self) -> None:
        """Load schema metadata and seed records."""
        if self._initialized:
            return

        self._load_schema()
        self._load_seed_data()
        self._initialized = True
        logger.info(
            f"SchemaStore initialized: {len(self._tables)} tables, "
            f"{len(self._enums)} enums, {len(self._table_groups)} groups."
        )

    def _load_schema(self) -> None:
        """Load schema from parsed_schema.json or fallback paths."""
        candidates = [
            settings.BASE_DIR / "app" / "core" / "parsed_schema.json",
            settings.PARSED_SCHEMA_PATH,
        ]

        loaded = False
        for path in candidates:
            if path.exists():
                try:
                    with open(path, mode="r", encoding="utf-8") as f:
                        data = json.load(f)
                    self._enums = data.get("enums", {})
                    self._table_groups = data.get("table_groups", {})
                    self._tables = data.get("tables", {})
                    self._refs = data.get("refs", [])
                    loaded = True
                    break
                except Exception as e:
                    logger.warning(f"Failed to read schema from {path}: {e}")

        if not loaded:
            logger.warning("Could not load parsed_schema.json. Using minimal baseline schema.")

    def _load_seed_data(self) -> None:
        """Load sample records from seed_data.json or generator."""
        seed_path = settings.SEED_DATA_PATH
        if seed_path.exists():
            try:
                with open(seed_path, mode="r", encoding="utf-8") as f:
                    self._sample_records = json.load(f)
                return
            except Exception as e:
                logger.warning(f"Error reading seed_data.json: {e}")

        # Fallback to generator
        try:
            from app.mock_data.generator import generate_all_tables
            self._sample_records = generate_all_tables()
        except Exception as e:
            logger.error(f"Failed to generate mock records: {e}")
            self._sample_records = {}

    @staticmethod
    def _clean_group_name(group: str) -> str:
        import re
        if not group:
            return "Uncategorized"
        return re.sub(r"^\d+\.\s*", "", group).strip()

    def get_all_tables(self) -> Dict[str, Any]:
        """Return all 38 tables grouped by domain with record counts."""
        self.initialize()
        clean_groups = {self._clean_group_name(k): v for k, v in self._table_groups.items()}
        tables_list = []
        for name, info in self._tables.items():
            records = self._sample_records.get(name, [])
            grp = self._clean_group_name(info.get("group", ""))
            tables_list.append({
                "name": name,
                "table_name": name,
                "group": grp,
                "table_group": grp,
                "record_count": len(records),
                "sample_count": len(records),
            })

        return {
            "total": len(self._tables),
            "table_groups": clean_groups,
            "tables": tables_list,
        }

    def get_table(self, table_name: str) -> Optional[Dict[str, Any]]:
        """Return columns, foreign keys, constraints, and sample records for table_name."""
        self.initialize()
        if table_name not in self._tables:
            return None

        t_info = self._tables[table_name]
        fks = [
            {
                "from_col": r["from_col"],
                "to_table": r["to_table"],
                "to_col": r["to_col"],
                "rel": r.get("rel", ">"),
            }
            for r in self._refs
            if r.get("from_table") == table_name
        ]

        grp = self._clean_group_name(t_info.get("group", ""))
        return {
            "name": table_name,
            "table_name": table_name,
            "group": grp,
            "table_group": grp,
            "columns": t_info.get("columns", []),
            "foreign_keys": fks,
            "indexes": t_info.get("indexes", []),
            "checks": t_info.get("checks", []),
            "sample_records": self._sample_records.get(table_name, []),
        }

    def get_enums(self) -> Dict[str, List[str]]:
        self.initialize()
        return self._enums

    def get_table_groups(self) -> Dict[str, List[str]]:
        self.initialize()
        return self._table_groups

    def get_table_names(self) -> List[str]:
        self.initialize()
        return list(self._tables.keys())

    def get_records(self, table_name: str) -> List[Dict[str, Any]]:
        self.initialize()
        return self._sample_records.get(table_name, [])


schema_store = SchemaStore()
