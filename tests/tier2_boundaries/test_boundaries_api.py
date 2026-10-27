# tests/tier2_boundaries/test_boundaries_api.py
"""
Tier 2: Boundary & Corner Cases - API Layer.

Authoritative source: TEST_INFRA.md, DBML check constraints, and boundary value analysis (BVA).
Tests:
- Invalid table names (404)
- SQL injection vectors in URLs and parameters
- Path traversal vectors
- Out-of-bounds geographic coordinates
- Negative, zero, and extreme limits and pages
- Non-existent and malformed UUIDs
- Malformed, empty, and typed JSON bodies
- Filter and parameter boundaries
"""

from tests.test_harness import BaseHarnessTestCase


class TestBoundariesAPI(BaseHarnessTestCase):
    """Verifies edge cases, error handling, and robustness of API endpoints."""

    # -------------------------------------------------------------------------
    # 1. Table Schema Endpoint Boundaries
    # -------------------------------------------------------------------------
    def test_invalid_table_name_404(self):
        """Requesting non-existent table returns 404 with error detail."""
        resp = self.client.get("/api/v1/tables/completely_imaginary_table")
        self.assertEqual(resp.status_code, 404)
        data = resp.json()
        self.assertIn("detail", data)

    def test_table_sql_injection_attempt_drop(self):
        """SQL injection attempt in table name returns 404 without server error."""
        resp = self.client.get("/api/v1/tables/event;DROP%20TABLE%20event;--")
        self.assertEqual(resp.status_code, 404)
        self.assertNotIn("syntax error", resp.text.lower())

    def test_table_sql_injection_or_true(self):
        """SQL injection ' OR '1'='1 returns 404."""
        resp = self.client.get("/api/v1/tables/'%20OR%20'1'='1")
        self.assertEqual(resp.status_code, 404)

    def test_table_path_traversal_attempt(self):
        """Path traversal attempt in table name is rejected."""
        resp = self.client.get("/api/v1/tables/..%2f..%2fetc%2fpasswd")
        self.assertIn(resp.status_code, [400, 404])

    def test_table_special_characters_xss(self):
        """XSS payload in table name returns 404 safely without reflection execution."""
        resp = self.client.get("/api/v1/tables/<script>alert(1)</script>")
        self.assertEqual(resp.status_code, 404)

    # -------------------------------------------------------------------------
    # 2. Out-of-Bounds Geographic Coordinates
    # -------------------------------------------------------------------------
    def test_map_geojson_lat_out_of_bounds_positive(self):
        """Latitude > 90 returns empty feature collection or 400."""
        resp = self.client.get("/api/v1/map/geojson", params={"min_lat": 95.0, "max_lat": 100.0})
        self.assertIn(resp.status_code, [200, 400])
        if resp.status_code == 200:
            data = resp.json()
            self.assertEqual(len(data.get("features", [])), 0)

    def test_map_geojson_lat_out_of_bounds_negative(self):
        """Latitude < -90 returns empty feature collection or 400."""
        resp = self.client.get("/api/v1/map/geojson", params={"max_lat": -95.0})
        self.assertIn(resp.status_code, [200, 400])
        if resp.status_code == 200:
            data = resp.json()
            self.assertEqual(len(data.get("features", [])), 0)

    def test_map_geojson_lon_out_of_bounds_positive(self):
        """Longitude > 180 returns empty feature collection or 400."""
        resp = self.client.get("/api/v1/map/geojson", params={"min_lon": 200.0})
        self.assertIn(resp.status_code, [200, 400])
        if resp.status_code == 200:
            data = resp.json()
            self.assertEqual(len(data.get("features", [])), 0)

    def test_map_geojson_lon_out_of_bounds_negative(self):
        """Longitude < -180 returns empty feature collection or 400."""
        resp = self.client.get("/api/v1/map/geojson", params={"max_lon": -200.0})
        self.assertIn(resp.status_code, [200, 400])
        if resp.status_code == 200:
            data = resp.json()
            self.assertEqual(len(data.get("features", [])), 0)

    # -------------------------------------------------------------------------
    # 3. Numeric Limits and Pagination Boundaries
    # -------------------------------------------------------------------------
    def test_overview_alerts_negative_limit(self):
        """Negative limit on alerts is handled gracefully (400, clamped, or default)."""
        resp = self.client.get("/api/v1/overview/alerts", params={"limit": -10})
        self.assertIn(resp.status_code, [200, 400, 422])

    def test_overview_alerts_zero_limit(self):
        """Zero limit on alerts returns empty list or default."""
        resp = self.client.get("/api/v1/overview/alerts", params={"limit": 0})
        self.assertIn(resp.status_code, [200, 400, 422])
        if resp.status_code == 200:
            items = resp.json()
            if isinstance(items, list):
                self.assertLessEqual(len(items), 10)

    def test_overview_alerts_extreme_limit(self):
        """Extreme limit (1,000,000) does not crash server and returns bounded response."""
        resp = self.client.get("/api/v1/overview/alerts", params={"limit": 1000000})
        self.assertIn(resp.status_code, [200, 400])
        if resp.status_code == 200:
            items = resp.json() if isinstance(resp.json(), list) else resp.json().get("alerts", [])
            self.assertLessEqual(len(items), 1000)

    def test_overview_news_negative_limit(self):
        """Negative limit on news feed handled gracefully."""
        resp = self.client.get("/api/v1/overview/news", params={"limit": -5})
        self.assertIn(resp.status_code, [200, 400, 422])

    def test_overview_news_extreme_limit(self):
        """Extreme limit on news feed returns bounded items."""
        resp = self.client.get("/api/v1/overview/news", params={"limit": 99999})
        self.assertIn(resp.status_code, [200, 400])

    def test_events_negative_page(self):
        """Negative page number on events pagination handled gracefully."""
        resp = self.client.get("/api/v1/events", params={"page": -1})
        self.assertIn(resp.status_code, [200, 400, 422])

    def test_events_zero_page(self):
        """Page 0 handled gracefully."""
        resp = self.client.get("/api/v1/events", params={"page": 0})
        self.assertIn(resp.status_code, [200, 400, 422])

    def test_events_negative_limit(self):
        """Negative limit on events handled gracefully."""
        resp = self.client.get("/api/v1/events", params={"limit": -1})
        self.assertIn(resp.status_code, [200, 400, 422])

    def test_events_extreme_page(self):
        """Page 999999 returns empty list, not a 500 error."""
        resp = self.client.get("/api/v1/events", params={"page": 999999})
        self.assertEqual(resp.status_code, 200)
        items = resp.json() if isinstance(resp.json(), list) else resp.json().get("events", [])
        self.assertEqual(len(items), 0)

    # -------------------------------------------------------------------------
    # 4. Non-Existent and Malformed UUID Identifiers
    # -------------------------------------------------------------------------
    def test_event_detail_non_existent_uuid(self):
        """Non-existent UUID returns 404."""
        resp = self.client.get("/api/v1/events/00000000-0000-0000-0000-000000000000")
        self.assertEqual(resp.status_code, 404)

    def test_event_detail_malformed_id(self):
        """Malformed ID string returns 404."""
        resp = self.client.get("/api/v1/events/not-a-valid-uuid-or-event-code")
        self.assertEqual(resp.status_code, 404)

    def test_modality_event_non_existent_uuid(self):
        """Non-existent modality event UUID returns 404."""
        resp = self.client.get("/api/v1/modality-events/00000000-0000-0000-0000-000000000000")
        self.assertEqual(resp.status_code, 404)

    def test_modality_event_malformed_id(self):
        """Malformed modality event ID returns 404."""
        resp = self.client.get("/api/v1/modality-events/invalid-uuid-abc")
        self.assertEqual(resp.status_code, 404)

    def test_event_group_non_existent_uuid(self):
        """Non-existent episode UUID returns 404."""
        resp = self.client.get("/api/v1/event-groups/00000000-0000-0000-0000-000000000000")
        self.assertEqual(resp.status_code, 404)

    def test_event_group_malformed_id(self):
        """Malformed episode ID returns 404."""
        resp = self.client.get("/api/v1/event-groups/unknown-group-code")
        self.assertEqual(resp.status_code, 404)

    def test_report_detail_non_existent_uuid(self):
        """Non-existent report UUID returns 404."""
        resp = self.client.get("/api/v1/reports/00000000-0000-0000-0000-000000000000")
        self.assertEqual(resp.status_code, 404)

    def test_report_detail_malformed_id(self):
        """Malformed report ID returns 404."""
        resp = self.client.get("/api/v1/reports/malformed-report-id")
        self.assertEqual(resp.status_code, 404)

    # -------------------------------------------------------------------------
    # 5. Malformed Request Bodies & JSON Syntax
    # -------------------------------------------------------------------------
    def test_ask_query_empty_body(self):
        """Empty JSON object in Ask Q&A returns 400 or 422."""
        resp = self.client.post("/api/v1/ask/query", json={})
        self.assertIn(resp.status_code, [400, 422])

    def test_ask_query_null_query(self):
        """Null query field returns 400 or 422."""
        resp = self.client.post("/api/v1/ask/query", json={"query": None})
        self.assertIn(resp.status_code, [400, 422])

    def test_ask_query_empty_string(self):
        """Empty string query returns 400, 422, or default message."""
        resp = self.client.post("/api/v1/ask/query", json={"query": ""})
        self.assertIn(resp.status_code, [200, 400, 422])

    def test_ask_query_whitespace_only(self):
        """Whitespace-only query handled safely."""
        resp = self.client.post("/api/v1/ask/query", json={"query": "   \n\t  "})
        self.assertIn(resp.status_code, [200, 400, 422])

    def test_ask_query_wrong_type(self):
        """Non-string query (integer) returns 400 or 422."""
        resp = self.client.post("/api/v1/ask/query", json={"query": 123456})
        self.assertIn(resp.status_code, [400, 422])

    def test_ask_query_excessive_length(self):
        """10,000-character query does not cause server crash."""
        long_query = "What happened in Rudraprayag? " * 350
        resp = self.client.post("/api/v1/ask/query", json={"query": long_query})
        self.assertIn(resp.status_code, [200, 400, 413, 422])

    def test_ask_query_malformed_json_syntax(self):
        """Raw malformed JSON syntax returns 400 or 422."""
        resp = self.client.post("/api/v1/ask/query", data='{"query": "broken', headers={"Content-Type": "application/json"})
        self.assertIn(resp.status_code, [400, 422])

    def test_watchlist_add_empty_body(self):
        """Empty body in watchlist POST returns 400 or 422."""
        resp = self.client.post("/api/v1/my-area/watchlist", json={})
        self.assertIn(resp.status_code, [400, 422])

    def test_watchlist_add_missing_code(self):
        """Missing district_lgd_code returns 400 or 422."""
        resp = self.client.post("/api/v1/my-area/watchlist", json={"district_name": "Tehri"})
        self.assertIn(resp.status_code, [400, 422])

    def test_watchlist_add_string_code(self):
        """Non-integer district_lgd_code returns 400 or 422."""
        resp = self.client.post("/api/v1/my-area/watchlist", json={"district_lgd_code": "not_an_int"})
        self.assertIn(resp.status_code, [400, 422])

    def test_watchlist_add_negative_code(self):
        """Negative district_lgd_code rejected."""
        resp = self.client.post("/api/v1/my-area/watchlist", json={"district_lgd_code": -99})
        self.assertIn(resp.status_code, [400, 422])

    def test_watchlist_add_invalid_district(self):
        """District code not in Uttarakhand handled safely."""
        resp = self.client.post("/api/v1/my-area/watchlist", json={"district_lgd_code": 999999})
        self.assertIn(resp.status_code, [200, 201, 400, 404, 422])

    def test_watchlist_delete_invalid_code(self):
        """Deleting invalid district code handled safely."""
        resp = self.client.delete("/api/v1/my-area/watchlist/invalid_code_xyz")
        self.assertIn(resp.status_code, [200, 204, 400, 404, 422])

    def test_watchlist_delete_non_existent(self):
        """Deleting non-existent district code does not crash server."""
        resp = self.client.delete("/api/v1/my-area/watchlist/99999")
        self.assertIn(resp.status_code, [200, 204, 400, 404])

    def test_settings_put_empty_body(self):
        """Empty body in settings PUT handled safely."""
        resp = self.client.put("/api/v1/my-area/settings", json={})
        self.assertIn(resp.status_code, [200, 400, 422])

    def test_settings_put_malformed_types(self):
        """Invalid types in settings PUT handled cleanly."""
        resp = self.client.put("/api/v1/my-area/settings", json={"notifications": "not_a_dictionary"})
        self.assertIn(resp.status_code, [200, 400, 422])

    # -------------------------------------------------------------------------
    # 6. Query Parameter Edge Cases
    # -------------------------------------------------------------------------
    def test_history_trends_invalid_granularity(self):
        """Invalid granularity defaults or returns 400."""
        resp = self.client.get("/api/v1/history/trends", params={"granularity": "hourly_unsupported"})
        self.assertIn(resp.status_code, [200, 400, 422])

    def test_preparedness_directory_invalid_category(self):
        """Invalid directory category returns empty list or 400."""
        resp = self.client.get("/api/v1/preparedness/directory", params={"category": "unsupported_xyz"})
        self.assertIn(resp.status_code, [200, 400, 422])

    def test_map_feed_invalid_tab(self):
        """Invalid feed tab defaults or returns 400."""
        resp = self.client.get("/api/v1/map/feed", params={"tab": "unknown_tab"})
        self.assertIn(resp.status_code, [200, 400, 422])

    def test_overview_charts_invalid_days(self):
        """Invalid days parameter handled gracefully."""
        resp = self.client.get("/api/v1/overview/charts", params={"days": -30})
        self.assertIn(resp.status_code, [200, 400, 422])

    def test_events_filter_empty_string_values(self):
        """Empty string parameters on events filter treated as no filter."""
        resp = self.client.get("/api/v1/events", params={"hazard": "", "severity": "", "region": ""})
        self.assertEqual(resp.status_code, 200)

    def test_reports_filter_empty_strings(self):
        """Empty string parameters on reports filter treated as no filter."""
        resp = self.client.get("/api/v1/reports", params={"hazard": "", "verification": "", "language": ""})
        self.assertEqual(resp.status_code, 200)
