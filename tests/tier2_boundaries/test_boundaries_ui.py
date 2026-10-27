# tests/tier2_boundaries/test_boundaries_ui.py
"""
Tier 2: Boundary & Corner Cases - UI & Client Request Layer.

Authoritative source: TEST_INFRA.md, UI search specifications, and adversarial boundary testing.
Tests:
- Search strings (empty, whitespace, extreme lengths, regex chars, SQL wildcards, Unicode/Devanagari, emoji)
- Zero-length arrays for unmatched filters (hazard, region, severity, language)
- Missing, unusual, and XML Accept headers
- HTTP Method Not Allowed (405) enforcement on read-only endpoints
- HEAD and OPTIONS CORS preflight support
- Static file 404 and directory traversal protection
"""

from tests.test_harness import BaseHarnessTestCase


class TestBoundariesUI(BaseHarnessTestCase):
    """Verifies edge cases in UI interactions, search inputs, headers, and protocol semantics."""

    # -------------------------------------------------------------------------
    # 1. Search String Edge Cases
    # -------------------------------------------------------------------------
    def test_search_empty_query_string(self):
        """Empty search query returns standard list without error."""
        resp = self.client.get("/api/v1/events", params={"search": ""})
        self.assertEqual(resp.status_code, 200)

    def test_search_whitespace_query(self):
        """Whitespace search query handled gracefully."""
        resp = self.client.get("/api/v1/events", params={"search": "   "})
        self.assertEqual(resp.status_code, 200)

    def test_search_single_char(self):
        """Single character search executes without failure."""
        resp = self.client.get("/api/v1/events", params={"search": "a"})
        self.assertEqual(resp.status_code, 200)

    def test_search_long_string(self):
        """Long search string (300 characters) executes safely."""
        resp = self.client.get("/api/v1/events", params={"search": "landslide " * 30})
        self.assertEqual(resp.status_code, 200)

    def test_search_regex_special_characters(self):
        """Regex meta-characters do not crash backend with regex compilation errors."""
        regex_str = ".*+?^${}()|[]\\"
        resp = self.client.get("/api/v1/events", params={"search": regex_str})
        self.assertEqual(resp.status_code, 200)

    def test_search_sql_wildcards(self):
        """SQL wildcards (%) do not cause database syntax errors."""
        resp = self.client.get("/api/v1/events", params={"search": "%_%"})
        self.assertEqual(resp.status_code, 200)

    def test_search_hindi_devanagari_query(self):
        """Devanagari search query ('भूस्खलन') handled cleanly with UTF-8."""
        resp = self.client.get("/api/v1/events", params={"search": "भूस्खलन"})
        self.assertEqual(resp.status_code, 200)

    def test_search_emoji_query(self):
        """Emoji search query handled gracefully."""
        resp = self.client.get("/api/v1/events", params={"search": "🌧️⚠️"})
        self.assertEqual(resp.status_code, 200)

    def test_reports_search_hindi(self):
        """Reports search with Hindi text ('मौसम') returns 200."""
        resp = self.client.get("/api/v1/reports", params={"search": "मौसम"})
        self.assertEqual(resp.status_code, 200)

    def test_shelters_search_hindi(self):
        """Shelters search with Hindi text ('शिविर') returns 200."""
        resp = self.client.get("/api/v1/preparedness/shelters", params={"search": "शिविर"})
        self.assertEqual(resp.status_code, 200)

    def test_shelters_search_empty(self):
        """Empty search on shelters returns complete shelter list."""
        resp = self.client.get("/api/v1/preparedness/shelters", params={"search": ""})
        self.assertEqual(resp.status_code, 200)

    def test_shelters_search_non_existent_location(self):
        """Searching for non-existent shelter location returns empty list, not 500."""
        resp = self.client.get("/api/v1/preparedness/shelters", params={"search": "xyz_completely_unknown_place_123"})
        self.assertEqual(resp.status_code, 200)
        items = resp.json() if isinstance(resp.json(), list) else resp.json().get("shelters", [])
        self.assertEqual(len(items), 0)

    # -------------------------------------------------------------------------
    # 2. Zero-Length Arrays and Empty Filter States
    # -------------------------------------------------------------------------
    def test_events_filter_non_existent_hazard(self):
        """Filtering by non-existent hazard returns empty list."""
        resp = self.client.get("/api/v1/events", params={"hazard": "volcanic_eruption"})
        self.assertEqual(resp.status_code, 200)
        items = resp.json() if isinstance(resp.json(), list) else resp.json().get("events", [])
        self.assertEqual(len(items), 0)

    def test_events_filter_non_existent_region(self):
        """Filtering by non-existent region returns empty list."""
        resp = self.client.get("/api/v1/events", params={"region": "Antarctica"})
        self.assertEqual(resp.status_code, 200)
        items = resp.json() if isinstance(resp.json(), list) else resp.json().get("events", [])
        self.assertEqual(len(items), 0)

    def test_events_filter_non_existent_severity(self):
        """Filtering by non-existent severity returns empty list."""
        resp = self.client.get("/api/v1/events", params={"severity": "CatastrophicUltra"})
        self.assertEqual(resp.status_code, 200)
        items = resp.json() if isinstance(resp.json(), list) else resp.json().get("events", [])
        self.assertEqual(len(items), 0)

    def test_map_geojson_empty_hazard_match(self):
        """Map GeoJSON for non-existent hazard returns valid FeatureCollection with 0 features."""
        resp = self.client.get("/api/v1/map/geojson", params={"hazard": "tsunami"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get("type"), "FeatureCollection")
        self.assertEqual(len(data.get("features", [])), 0)

    def test_reports_filter_non_existent_hazard(self):
        """Filtering reports by non-existent hazard returns empty list."""
        resp = self.client.get("/api/v1/reports", params={"hazard": "meteor_strike"})
        self.assertEqual(resp.status_code, 200)
        items = resp.json() if isinstance(resp.json(), list) else resp.json().get("reports", [])
        self.assertEqual(len(items), 0)

    def test_reports_filter_unsupported_language(self):
        """Filtering reports by unsupported language returns empty list."""
        resp = self.client.get("/api/v1/reports", params={"language": "esperanto"})
        self.assertEqual(resp.status_code, 200)
        items = resp.json() if isinstance(resp.json(), list) else resp.json().get("reports", [])
        self.assertEqual(len(items), 0)

    def test_preparedness_shelters_non_existent_district(self):
        """Filtering shelters by non-existent district returns empty list."""
        resp = self.client.get("/api/v1/preparedness/shelters", params={"district": "Mars_Crater"})
        self.assertEqual(resp.status_code, 200)
        items = resp.json() if isinstance(resp.json(), list) else resp.json().get("shelters", [])
        self.assertEqual(len(items), 0)

    def test_preparedness_shelters_status_filter(self):
        """Filtering shelters by valid status executes correctly."""
        resp = self.client.get("/api/v1/preparedness/shelters", params={"status": "Unavailable"})
        self.assertEqual(resp.status_code, 200)

    # -------------------------------------------------------------------------
    # 3. HTTP Headers & Content Negotiation
    # -------------------------------------------------------------------------
    def test_request_without_user_agent(self):
        """Request without User-Agent header is served normally."""
        resp = self.client.get("/api/v1/tables", headers={"User-Agent": ""})
        self.assertEqual(resp.status_code, 200)

    def test_request_accept_xml(self):
        """Request with Accept: application/xml handled safely (returns JSON or 406)."""
        resp = self.client.get("/api/v1/tables", headers={"Accept": "application/xml"})
        self.assertIn(resp.status_code, [200, 406])

    def test_request_accept_any(self):
        """Request with Accept: */* returns 200 JSON."""
        resp = self.client.get("/api/v1/tables", headers={"Accept": "*/*"})
        self.assertEqual(resp.status_code, 200)

    def test_request_custom_tracking_headers(self):
        """Custom tracing headers do not cause errors."""
        headers = {
            "X-Request-ID": "test-trace-uuid-12345",
            "X-Forwarded-For": "10.0.0.1",
        }
        resp = self.client.get("/api/v1/overview/summary", headers=headers)
        self.assertEqual(resp.status_code, 200)

    # -------------------------------------------------------------------------
    # 4. HTTP Method Not Allowed (405) Enforcement
    # -------------------------------------------------------------------------
    def test_method_not_allowed_post_on_tables(self):
        """POST on read-only /api/v1/tables returns 405 Method Not Allowed."""
        resp = self.client.post("/api/v1/tables", json={"name": "test"})
        self.assertEqual(resp.status_code, 405)

    def test_method_not_allowed_delete_on_tables(self):
        """DELETE on read-only /api/v1/tables returns 405 Method Not Allowed."""
        resp = self.client.delete("/api/v1/tables")
        self.assertEqual(resp.status_code, 405)

    def test_method_not_allowed_put_on_overview(self):
        """PUT on /api/v1/overview/summary returns 405 Method Not Allowed."""
        resp = self.client.put("/api/v1/overview/summary", json={"fake": 1})
        self.assertEqual(resp.status_code, 405)

    def test_method_not_allowed_post_on_reports_detail(self):
        """POST on read-only report detail returns 405 Method Not Allowed."""
        resp = self.client.post("/api/v1/reports/some-report-id", json={})
        self.assertEqual(resp.status_code, 405)

    def test_method_not_allowed_delete_on_overview(self):
        """DELETE on overview returns 405 Method Not Allowed."""
        resp = self.client.delete("/api/v1/overview/summary")
        self.assertEqual(resp.status_code, 405)

    # -------------------------------------------------------------------------
    # 5. HEAD and OPTIONS CORS Protocol Support
    # -------------------------------------------------------------------------
    def test_head_request_on_root(self):
        """HEAD request on / returns 200 or 405 with empty body."""
        resp = self.client.head("/")
        self.assertIn(resp.status_code, [200, 405])
        self.assertEqual(len(resp.content), 0)

    def test_head_request_on_tables(self):
        """HEAD request on /api/v1/tables returns 200 or 405."""
        resp = self.client.head("/api/v1/tables")
        self.assertIn(resp.status_code, [200, 405])
        self.assertEqual(len(resp.content), 0)

    def test_options_cors_preflight_tables(self):
        """OPTIONS request for CORS preflight returns standard HTTP response."""
        resp = self.client.options("/api/v1/tables")
        self.assertIn(resp.status_code, [200, 204, 405])

    def test_options_cors_preflight_ask(self):
        """OPTIONS request on /api/v1/ask/query returns standard HTTP response."""
        resp = self.client.options("/api/v1/ask/query")
        self.assertIn(resp.status_code, [200, 204, 405])

    # -------------------------------------------------------------------------
    # 6. Static File Boundaries & Security Protection
    # -------------------------------------------------------------------------
    def test_static_file_not_found(self):
        """Requesting non-existent static file returns 404."""
        resp = self.client.get("/static/fake_non_existent_asset_9876.js")
        self.assertEqual(resp.status_code, 404)

    def test_static_directory_traversal(self):
        """Directory traversal attempt on /static does not leak project files."""
        resp = self.client.get("/static/../../PROJECT.md")
        if resp.status_code == 200:
            self.assertNotIn("# Disaster Intelligence Multimodal Platform", resp.text)
        else:
            self.assertIn(resp.status_code, [400, 404])

    def test_static_encoded_traversal(self):
        """URL-encoded directory traversal attempt is prevented."""
        resp = self.client.get("/static/..%2f..%2fPROJECT.md")
        if resp.status_code == 200:
            self.assertNotIn("# Disaster Intelligence Multimodal Platform", resp.text)
        else:
            self.assertIn(resp.status_code, [400, 404])
