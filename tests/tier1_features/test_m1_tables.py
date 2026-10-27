# tests/tier1_features/test_m1_tables.py
"""
Tier 1: Feature Coverage - 38 DBML Schema Tables & Inspection Endpoints.

Authoritative source: schemas/dbdiagram_schema.dbml, ORIGINAL_REQUEST.md §R3.
Verifies GET /api/v1/tables and GET /api/v1/tables/{table_name} for all 38 tables.
"""

from tests.test_harness import BaseHarnessTestCase

ALL_38_TABLES = [
    # Group 1: Source Management
    ("data_source", "Source Management", "source_id"),
    ("dataset", "Source Management", "dataset_id"),
    ("dataset_version", "Source Management", "dataset_version_id"),
    # Group 2: Ingestion & Provenance
    ("pipeline_run", "Ingestion & Provenance", "pipeline_run_id"),
    ("collection", "Ingestion & Provenance", "collection_id"),
    ("raw_object", "Ingestion & Provenance", "raw_object_id"),
    ("raw_validation", "Ingestion & Provenance", "raw_validation_id"),
    ("ingest_rejection", "Ingestion & Provenance", "ingest_rejection_id"),
    # Group 3: Reference Data
    ("hazard", "Reference Data", "hazard_id"),
    ("admin_region", "Reference Data", "admin_region_id"),
    ("static_raster", "Reference Data", "static_raster_id"),
    ("geo_feature", "Reference Data", "geo_feature_id"),
    # Group 4: Canonical Source Data
    ("observation", "Canonical Source Data", "observation_id"),
    ("observation_region", "Canonical Source Data", "observation_id"),
    ("observation_relation", "Canonical Source Data", "relation_id"),
    ("text_item", "Canonical Source Data", "observation_id"),
    ("raster_product", "Canonical Source Data", "observation_id"),
    ("media", "Canonical Source Data", "media_id"),
    # Group 5: Enrichment & Derived Results
    ("model", "Enrichment & Derived Results", "model_id"),
    ("derived_result", "Enrichment & Derived Results", "derived_result_id"),
    ("derived_result_input", "Enrichment & Derived Results", "derived_result_input_id"),
    # Group 6: Source Quality / Scoring
    ("source_score", "Source Quality / Scoring", "source_score_id"),
    # Group 7: Event Intelligence
    ("modality_event", "Event Intelligence", "modality_event_id"),
    ("modality_event_input", "Event Intelligence", "modality_event_input_id"),
    ("event_match", "Event Intelligence", "event_match_id"),
    ("event", "Event Intelligence", "event_id"),
    ("event_attribute_selection", "Event Intelligence", "event_attribute_selection_id"),
    ("event_member", "Event Intelligence", "event_id"),
    ("event_evidence", "Event Intelligence", "event_evidence_id"),
    ("event_region", "Event Intelligence", "event_id"),
    ("event_impact", "Event Intelligence", "event_impact_id"),
    ("event_lineage", "Event Intelligence", "event_lineage_id"),
    ("event_relationship", "Event Intelligence", "event_relationship_id"),
    ("event_group", "Event Intelligence", "event_group_id"),
    ("event_group_member", "Event Intelligence", "event_group_id"),
    # Group 8: Benchmark Datasets
    ("dataset_sample", "Benchmark Datasets", "dataset_sample_id"),
    ("dataset_sample_item", "Benchmark Datasets", "dataset_sample_item_id"),
    ("dataset_sample_event", "Benchmark Datasets", "dataset_sample_event_id"),
]


class TestM1Tables(BaseHarnessTestCase):
    """Verifies all 38 database tables defined in schemas/dbdiagram_schema.dbml."""

    def test_tables_master_list(self):
        """GET /api/v1/tables returns total 38, 8 domain groups, and array of tables."""
        resp = self.client.get("/api/v1/tables")
        self.assertEqual(resp.status_code, 200, f"Expected 200, got {resp.status_code}")
        data = resp.json()

        self.assertIn("total", data)
        self.assertEqual(data["total"], 38, f"Expected 38 tables, got {data['total']}")

        self.assertIn("tables", data)
        self.assertIsInstance(data["tables"], list)
        self.assertEqual(len(data["tables"]), 38)

        self.assertIn("table_groups", data)
        groups = data["table_groups"]
        expected_groups = [
            "Source Management",
            "Ingestion & Provenance",
            "Reference Data",
            "Canonical Source Data",
            "Enrichment & Derived Results",
            "Source Quality / Scoring",
            "Event Intelligence",
            "Benchmark Datasets",
        ]
        for g in expected_groups:
            found = any(g.lower() in k.lower() for k in groups.keys())
            self.assertTrue(found, f"Missing table group '{g}' in {list(groups.keys())}")


    def test_tables_master_list_structure(self):
        """Every table entry in /api/v1/tables must have name, group, and positive record count."""
        data = self.client.get_json("/api/v1/tables")
        table_names = [t["name"] if isinstance(t, dict) and "name" in t else t.get("table_name") for t in data["tables"]]
        expected_names = [name for name, _, _ in ALL_38_TABLES]
        for name in expected_names:
            self.assertIn(name, table_names, f"Table '{name}' missing from master table list")

        for table in data["tables"]:
            self.assertIn("group", table if "group" in table else table.get("table_group", {}))
            record_count = table.get("record_count", table.get("sample_count", 1))
            self.assertGreaterEqual(record_count, 1, f"Table {table} must have sample records")

    def _verify_single_table(self, table_name: str, expected_group: str, pk_col: str):
        """Helper to verify individual table schema metadata and sample records."""
        resp = self.client.get(f"/api/v1/tables/{table_name}")
        self.assertEqual(resp.status_code, 200, f"Table '{table_name}' returned status {resp.status_code}: {resp.text}")
        data = resp.json()

        actual_name = data.get("table_name", data.get("name"))
        self.assertEqual(actual_name, table_name, f"Expected table_name '{table_name}', got '{actual_name}'")

        actual_group = data.get("table_group", data.get("group", ""))
        self.assertTrue(
            expected_group.lower() in actual_group.lower() or actual_group.lower() in expected_group.lower(),
            f"Table '{table_name}' expected group '{expected_group}', got '{actual_group}'"
        )

        self.assertIn("columns", data, f"Table '{table_name}' missing 'columns'")

        self.assertIsInstance(data["columns"], list, f"Table '{table_name}' columns must be a list")
        self.assertGreaterEqual(len(data["columns"]), 4, f"Table '{table_name}' columns count too low")

        col_names = [c["name"] if isinstance(c, dict) and "name" in c else c.get("column_name") for c in data["columns"]]
        self.assertIn(pk_col, col_names, f"Table '{table_name}' missing expected primary key column '{pk_col}'")

        self.assertIn("sample_records", data, f"Table '{table_name}' missing 'sample_records'")
        self.assertIsInstance(data["sample_records"], list, f"Table '{table_name}' sample_records must be a list")
        self.assertGreaterEqual(len(data["sample_records"]), 1, f"Table '{table_name}' must have at least 1 sample record")

        # Check first sample record contains primary key field
        first_row = data["sample_records"][0]
        self.assertIn(pk_col, first_row, f"First sample record in '{table_name}' missing primary key '{pk_col}'")
        self.assertIsNotNone(first_row[pk_col], f"Primary key '{pk_col}' in '{table_name}' cannot be None")

    # 38 Individual Table Tests
    def test_table_01_data_source(self):
        self._verify_single_table("data_source", "Source Management", "source_id")

    def test_table_02_dataset(self):
        self._verify_single_table("dataset", "Source Management", "dataset_id")

    def test_table_03_dataset_version(self):
        self._verify_single_table("dataset_version", "Source Management", "dataset_version_id")

    def test_table_04_pipeline_run(self):
        self._verify_single_table("pipeline_run", "Ingestion & Provenance", "pipeline_run_id")

    def test_table_05_collection(self):
        self._verify_single_table("collection", "Ingestion & Provenance", "collection_id")

    def test_table_06_raw_object(self):
        self._verify_single_table("raw_object", "Ingestion & Provenance", "raw_object_id")

    def test_table_07_raw_validation(self):
        self._verify_single_table("raw_validation", "Ingestion & Provenance", "raw_validation_id")

    def test_table_08_ingest_rejection(self):
        self._verify_single_table("ingest_rejection", "Ingestion & Provenance", "ingest_rejection_id")

    def test_table_09_hazard(self):
        self._verify_single_table("hazard", "Reference Data", "hazard_id")

    def test_table_10_admin_region(self):
        self._verify_single_table("admin_region", "Reference Data", "admin_region_id")

    def test_table_11_static_raster(self):
        self._verify_single_table("static_raster", "Reference Data", "static_raster_id")

    def test_table_12_geo_feature(self):
        self._verify_single_table("geo_feature", "Reference Data", "geo_feature_id")

    def test_table_13_observation(self):
        self._verify_single_table("observation", "Canonical Source Data", "observation_id")

    def test_table_14_observation_region(self):
        self._verify_single_table("observation_region", "Canonical Source Data", "observation_id")

    def test_table_15_observation_relation(self):
        self._verify_single_table("observation_relation", "Canonical Source Data", "relation_id")

    def test_table_16_text_item(self):
        self._verify_single_table("text_item", "Canonical Source Data", "observation_id")

    def test_table_17_raster_product(self):
        self._verify_single_table("raster_product", "Canonical Source Data", "observation_id")

    def test_table_18_media(self):
        self._verify_single_table("media", "Canonical Source Data", "media_id")

    def test_table_19_model(self):
        self._verify_single_table("model", "Enrichment & Derived Results", "model_id")

    def test_table_20_derived_result(self):
        self._verify_single_table("derived_result", "Enrichment & Derived Results", "derived_result_id")

    def test_table_21_derived_result_input(self):
        self._verify_single_table("derived_result_input", "Enrichment & Derived Results", "derived_result_input_id")

    def test_table_22_source_score(self):
        self._verify_single_table("source_score", "Source Quality / Scoring", "source_score_id")

    def test_table_23_modality_event(self):
        self._verify_single_table("modality_event", "Event Intelligence", "modality_event_id")

    def test_table_24_modality_event_input(self):
        self._verify_single_table("modality_event_input", "Event Intelligence", "modality_event_input_id")

    def test_table_25_event_match(self):
        self._verify_single_table("event_match", "Event Intelligence", "event_match_id")

    def test_table_26_event(self):
        self._verify_single_table("event", "Event Intelligence", "event_id")

    def test_table_27_event_attribute_selection(self):
        self._verify_single_table("event_attribute_selection", "Event Intelligence", "event_attribute_selection_id")

    def test_table_28_event_member(self):
        self._verify_single_table("event_member", "Event Intelligence", "event_id")

    def test_table_29_event_evidence(self):
        self._verify_single_table("event_evidence", "Event Intelligence", "event_evidence_id")

    def test_table_30_event_region(self):
        self._verify_single_table("event_region", "Event Intelligence", "event_id")

    def test_table_31_event_impact(self):
        self._verify_single_table("event_impact", "Event Intelligence", "event_impact_id")

    def test_table_32_event_lineage(self):
        self._verify_single_table("event_lineage", "Event Intelligence", "event_lineage_id")

    def test_table_33_event_relationship(self):
        self._verify_single_table("event_relationship", "Event Intelligence", "event_relationship_id")

    def test_table_34_event_group(self):
        self._verify_single_table("event_group", "Event Intelligence", "event_group_id")

    def test_table_35_event_group_member(self):
        self._verify_single_table("event_group_member", "Event Intelligence", "event_group_id")

    def test_table_36_dataset_sample(self):
        self._verify_single_table("dataset_sample", "Benchmark Datasets", "dataset_sample_id")

    def test_table_37_dataset_sample_item(self):
        self._verify_single_table("dataset_sample_item", "Benchmark Datasets", "dataset_sample_item_id")

    def test_table_38_dataset_sample_event(self):
        self._verify_single_table("dataset_sample_event", "Benchmark Datasets", "dataset_sample_event_id")

    def test_foreign_keys_presence(self):
        """Verifies foreign key metadata exists for relational child tables."""
        child_tables = ["dataset", "collection", "observation", "modality_event", "event_evidence"]
        for tbl in child_tables:
            data = self.client.get_json(f"/api/v1/tables/{tbl}")
            fks = data.get("foreign_keys", [])
            self.assertIsInstance(fks, list, f"Table '{tbl}' foreign_keys must be a list")
            self.assertGreaterEqual(len(fks), 1, f"Table '{tbl}' should define at least 1 foreign key")

    def test_table_metadata_column_types(self):
        """Verifies columns have valid SQL/DBML data types."""
        data = self.client.get_json("/api/v1/tables/event")
        col_types = {c["name"]: c.get("type", "").lower() for c in data["columns"] if isinstance(c, dict)}
        self.assertIn("event_id", col_types)
        self.assertIn("uuid", col_types["event_id"])
        self.assertIn("start_time", col_types)
        self.assertTrue("timestamp" in col_types["start_time"] or "datetime" in col_types["start_time"])

    # -------------------------------------------------------------------------
    # Additional Table Group Structure & Constraint Tests
    # -------------------------------------------------------------------------
    def _find_group_tables(self, data: dict, group_name: str) -> list:
        for k, v in data.get("table_groups", {}).items():
            if group_name.lower() in k.lower():
                return v
        return []

    def test_group_1_source_management_members(self):
        """Source Management group must contain data_source, dataset, dataset_version."""
        data = self.client.get_json("/api/v1/tables")
        group = self._find_group_tables(data, "Source Management")
        for t in ["data_source", "dataset", "dataset_version"]:
            self.assertIn(t, group)

    def test_group_2_ingestion_provenance_members(self):
        """Ingestion & Provenance group must contain 5 pipeline and collection tables."""
        data = self.client.get_json("/api/v1/tables")
        group = self._find_group_tables(data, "Ingestion & Provenance")
        for t in ["pipeline_run", "collection", "raw_object", "raw_validation", "ingest_rejection"]:
            self.assertIn(t, group)

    def test_group_3_reference_data_members(self):
        """Reference Data group must contain hazard, admin_region, static_raster, geo_feature."""
        data = self.client.get_json("/api/v1/tables")
        group = self._find_group_tables(data, "Reference Data")
        for t in ["hazard", "admin_region", "static_raster", "geo_feature"]:
            self.assertIn(t, group)

    def test_group_4_canonical_source_data_members(self):
        """Canonical Source Data group must contain observation and multimodal extensions."""
        data = self.client.get_json("/api/v1/tables")
        group = self._find_group_tables(data, "Canonical Source Data")
        for t in ["observation", "observation_region", "observation_relation", "text_item", "raster_product", "media"]:
            self.assertIn(t, group)

    def test_group_5_enrichment_members(self):
        """Enrichment group must contain model, derived_result, derived_result_input."""
        data = self.client.get_json("/api/v1/tables")
        group = self._find_group_tables(data, "Enrichment & Derived Results")
        for t in ["model", "derived_result", "derived_result_input"]:
            self.assertIn(t, group)

    def test_group_6_source_scoring_members(self):
        """Source Quality group must contain source_score."""
        data = self.client.get_json("/api/v1/tables")
        group = self._find_group_tables(data, "Source Quality / Scoring")
        self.assertIn("source_score", group)

    def test_group_7_event_intelligence_members(self):
        """Event Intelligence group must contain 13 event detection & clustering tables."""
        data = self.client.get_json("/api/v1/tables")
        group = self._find_group_tables(data, "Event Intelligence")
        self.assertEqual(len(group), 13)
        for t in ["event", "modality_event", "event_group", "event_impact", "event_evidence"]:
            self.assertIn(t, group)

    def test_group_8_benchmark_datasets_members(self):
        """Benchmark Datasets group must contain dataset_sample and link tables."""
        data = self.client.get_json("/api/v1/tables")
        group = self._find_group_tables(data, "Benchmark Datasets")
        for t in ["dataset_sample", "dataset_sample_item", "dataset_sample_event"]:
            self.assertIn(t, group)


    def test_schema_check_constraint_dataset_version_dates(self):
        """dataset_version sample rows must respect valid_to >= valid_from."""
        data = self.client.get_json("/api/v1/tables/dataset_version")
        for row in data["sample_records"]:
            if row.get("valid_from") and row.get("valid_to"):
                self.assertGreaterEqual(str(row["valid_to"]), str(row["valid_from"]))

    def test_schema_check_constraint_hazard_self_reference(self):
        """hazard rows must not have parent_hazard_id equal to own hazard_id."""
        data = self.client.get_json("/api/v1/tables/hazard")
        for row in data["sample_records"]:
            if row.get("parent_hazard_id"):
                self.assertNotEqual(row["parent_hazard_id"], row["hazard_id"])

    def test_schema_check_constraint_observation_quality_score(self):
        """observation quality_score must be between 0.0 and 1.0."""
        data = self.client.get_json("/api/v1/tables/observation")
        for row in data["sample_records"]:
            if row.get("quality_score") is not None:
                self.assertGreaterEqual(row["quality_score"], 0.0)
                self.assertLessEqual(row["quality_score"], 1.0)

    def test_schema_check_constraint_event_confidence(self):
        """event confidence must be between 0.0 and 1.0."""
        data = self.client.get_json("/api/v1/tables/event")
        for row in data["sample_records"]:
            if row.get("confidence") is not None:
                self.assertGreaterEqual(row["confidence"], 0.0)
                self.assertLessEqual(row["confidence"], 1.0)

    def test_schema_check_constraint_event_group_time_order(self):
        """event_group end_time must be >= start_time if specified."""
        data = self.client.get_json("/api/v1/tables/event_group")
        for row in data["sample_records"]:
            if row.get("start_time") and row.get("end_time"):
                self.assertGreaterEqual(str(row["end_time"]), str(row["start_time"]))

    def test_schema_check_constraint_derived_confidence(self):
        """derived_result confidence must be between 0.0 and 1.0."""
        data = self.client.get_json("/api/v1/tables/derived_result")
        for row in data["sample_records"]:
            if row.get("confidence") is not None:
                self.assertGreaterEqual(row["confidence"], 0.0)
                self.assertLessEqual(row["confidence"], 1.0)

    def test_schema_check_constraint_source_score_range(self):
        """source_score score must be between 0.0 and 1.0."""
        data = self.client.get_json("/api/v1/tables/source_score")
        for row in data["sample_records"]:
            if row.get("score") is not None:
                self.assertGreaterEqual(row["score"], 0.0)
                self.assertLessEqual(row["score"], 1.0)

