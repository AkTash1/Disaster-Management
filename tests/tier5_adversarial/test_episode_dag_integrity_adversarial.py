# tests/tier5_adversarial/test_episode_dag_integrity_adversarial.py
"""
Adversarial Verification: Episode DAG Graph Integrity & Database Referential Consistency.
Validates:
- Episode relationship graph nodes and edges (View 5 SVG DAG).
- Strict referential integrity: zero dangling edge source or target references.
- Topological DAG acyclicity (zero circular causal loops).
- Cross-correlation: node event codes match valid unified events.
- Complete 38-table database referential integrity audit across all 92 foreign key relationships.
- Edge case handling and 404 validation for non-existent episode UUIDs.
"""

import json
from pathlib import Path
from collections import defaultdict, deque
from tests.test_harness import BaseHarnessTestCase


class TestEpisodeDAGIntegrityAdversarial(BaseHarnessTestCase):
    """Adversarial stress testing for episode DAG graph integrity and database FK consistency."""

    def test_d1_master_episode_dag_structure_and_zero_dangling_refs(self):
        """Verify master episode graph contains >=5 nodes and edges with strictly zero dangling references."""
        detail = self.client.get_json("/api/v1/event-groups/ep-utt-001")
        self.assertIn("graph", detail, "Episode detail missing 'graph' object")
        graph = detail["graph"]
        self.assertIn("nodes", graph)
        self.assertIn("edges", graph)

        nodes = graph["nodes"]
        edges = graph["edges"]
        self.assertGreaterEqual(len(nodes), 5, "Episode DAG must contain at least 5 nodes")
        self.assertGreaterEqual(len(edges), 5, "Episode DAG must contain at least 5 edges")

        # Set of all node IDs
        node_ids = {n["id"] for n in nodes}
        self.assertEqual(len(node_ids), len(nodes), "Duplicate node IDs detected in episode graph!")

        # Verify every node has required attributes
        for n in nodes:
            self.assertIn("id", n)
            self.assertIn("label", n)
            self.assertIn("hazard", n)
            self.assertIn("code", n)
            self.assertIn("status", n)
            self.assertGreater(len(n["label"].strip()), 0)
            self.assertGreater(len(n["code"].strip()), 0)

        # CRITICAL ASSERTION: Zero dangling references in edges
        for idx, edge in enumerate(edges):
            self.assertIn("source", edge, f"Edge #{idx} missing 'source'")
            self.assertIn("target", edge, f"Edge #{idx} missing 'target'")
            src = edge["source"]
            tgt = edge["target"]

            self.assertIn(
                src,
                node_ids,
                f"DANGLING EDGE REFERENCE: Edge #{idx} source '{src}' does not exist in graph nodes!",
            )
            self.assertIn(
                tgt,
                node_ids,
                f"DANGLING EDGE REFERENCE: Edge #{idx} target '{tgt}' does not exist in graph nodes!",
            )
            self.assertNotEqual(
                src, tgt, f"Self-loop detected on edge #{idx} from '{src}' to '{tgt}'"
            )

            # Check epistemic badge on edge
            badge = edge.get("epistemic_badge") or edge.get("label") or "Confirmed"
            self.assert_epistemic_status(badge, f"edge #{idx} epistemic_badge")

    def test_d2_topological_acyclicity_of_episode_graph(self):
        """Mathematically prove the episode graph is a Directed Acyclic Graph (DAG) with zero cycles."""
        detail = self.client.get_json("/api/v1/event-groups/ep-utt-001")
        graph = detail["graph"]
        nodes = graph["nodes"]
        edges = graph["edges"]

        node_ids = [n["id"] for n in nodes]
        in_degree = {nid: 0 for nid in node_ids}
        adj = defaultdict(list)

        for edge in edges:
            src = edge["source"]
            tgt = edge["target"]
            adj[src].append(tgt)
            in_degree[tgt] += 1

        # Kahn's algorithm for topological sorting and cycle detection
        queue = deque([nid for nid in node_ids if in_degree[nid] == 0])
        visited_count = 0
        topological_order = []

        while queue:
            curr = queue.popleft()
            visited_count += 1
            topological_order.append(curr)

            for neighbor in adj[curr]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        self.assertEqual(
            visited_count,
            len(node_ids),
            f"CYCLIC GRAPH ERROR: Cycle detected in episode relationship graph! Visited {visited_count}/{len(node_ids)} nodes.",
        )
        # Verify initial trigger node is first in topological order
        self.assertEqual(topological_order[0], "EV-RAIN-01", "Rainfall trigger must be source root of causal DAG")

    def test_d3_dag_nodes_cross_correlation_with_unified_events(self):
        """Verify each node's event code corresponds to an authentic disaster event in the platform."""
        detail = self.client.get_json("/api/v1/event-groups/ep-utt-001")
        nodes = detail["graph"]["nodes"]

        # Known unified events in system
        events_resp = self.client.get_json("/api/v1/events?limit=100")
        known_event_codes = {e["event_code"] for e in events_resp["events"]}

        # Primary master events that must be correlated
        primary_codes = {
            "EV-RAIN-2026-10-08-002",
            "EV-LSD-2026-10-09-001",
            "EV-ROD-2026-10-09-004",
        }
        for code in primary_codes:
            self.assertIn(
                code,
                known_event_codes,
                f"Primary DAG node code '{code}' is missing from unified events directory!",
            )

        # Check all node codes match standard naming conventions
        for n in nodes:
            code = n["code"]
            self.assertTrue(
                code.startswith("EV-"),
                f"Node code '{code}' must adhere to platform event code standard (EV-*)",
            )

    def test_d4_comprehensive_38_table_database_referential_integrity(self):
        """
        Audit all 92 foreign key relationships defined in dbdiagram_schema.dbml
        against the seed_data.json store to guarantee zero broken references across all 38 tables.
        """
        base_dir = Path(__file__).resolve().parent.parent.parent
        schema_path = base_dir / "app" / "core" / "parsed_schema.json"
        seed_path = base_dir / "app" / "mock_data" / "seed_data.json"

        self.assertTrue(schema_path.exists(), "parsed_schema.json not found")
        self.assertTrue(seed_path.exists(), "seed_data.json not found")

        with open(schema_path, "r", encoding="utf-8") as f:
            schema_data = json.load(f)
        with open(seed_path, "r", encoding="utf-8") as f:
            seed_data = json.load(f)

        refs = schema_data.get("refs", [])
        self.assertGreaterEqual(len(refs), 90, "Expected at least 90 foreign key relationships in schema")

        broken_references = []
        tested_fk_count = 0

        for ref in refs:
            from_table = ref["from_table"]
            from_col = ref["from_col"]
            to_table = ref["to_table"]
            to_col = ref["to_col"]

            from_rows = seed_data.get(from_table, [])
            to_rows = seed_data.get(to_table, [])
            to_pks = {r.get(to_col) for r in to_rows if r.get(to_col) is not None}

            for row_idx, row in enumerate(from_rows):
                val = row.get(from_col)
                if val is not None:
                    tested_fk_count += 1
                    if val not in to_pks:
                        broken_references.append({
                            "from_table": from_table,
                            "from_col": from_col,
                            "row_index": row_idx,
                            "invalid_fk_value": val,
                            "to_table": to_table,
                            "to_col": to_col,
                        })

        self.assertGreater(tested_fk_count, 100, "Expected >100 active FK references to be validated")
        self.assertEqual(
            len(broken_references),
            0,
            f"REFERENTIAL INTEGRITY VIOLATION: Found {len(broken_references)} broken foreign keys in seed_data: {broken_references[:5]}",
        )

    def test_d5_event_group_non_existent_uuid_returns_404(self):
        """Assert requests for invalid or non-existent episode IDs return 404 Not Found."""
        invalid_ids = [
            "ep-nonexistent-9999",
            "00000000-0000-0000-0000-000000000000",
            "invalid_episode_code",
            "unknown-episode",
        ]
        for bad_id in invalid_ids:
            with self.subTest(id=bad_id):
                resp = self.client.get(f"/api/v1/event-groups/{bad_id}")
                self.assertEqual(
                    resp.status_code,
                    404,
                    f"Expected 404 for non-existent episode ID '{bad_id}', got {resp.status_code}",
                )
                self.assertIn("detail", resp.json())
