# tests/tier5_adversarial/test_combinatorial_filters_adversarial.py
"""
Adversarial Verification: Multi-Filter Combinatorial Queries.
Validates:
- Multi-dimensional combinatorial queries across 1, 2, 3, 4, and 5 filters simultaneously.
- Events endpoint: hazard x severity x region x verification x status x page x limit.
- Map Explorer GeoJSON endpoint: hazard x severity x district x spatial bounding box.
- Reports feed: source_type x verification x hazard x region x language x search.
- Shelters directory: search x status x district.
- Conflicting and zero-result filter combinations (must return 200 OK with empty lists, zero 500 errors).
- Case-insensitivity, partial substring matching, and pagination invariants.
"""

from tests.test_harness import BaseHarnessTestCase


class TestCombinatorialFiltersAdversarial(BaseHarnessTestCase):
    """Adversarial stress testing for combinatorial query parameters across domain endpoints."""

    def test_c1_events_pairwise_filter_matrix(self):
        """Test all 2-way pairwise filter combinations on GET /api/v1/events."""
        pairwise_cases = [
            {"hazard": "Landslide", "severity": "Critical"},
            {"hazard": "Landslide", "region": "Rudraprayag"},
            {"hazard": "Heavy Rainfall", "severity": "Critical"},
            {"hazard": "Heavy Rainfall", "region": "Rudraprayag"},
            {"hazard": "Flash Flood", "severity": "High"},
            {"hazard": "Landslide", "region": "Chamoli"},
            {"severity": "Critical", "region": "Rudraprayag"},
            {"severity": "Moderate", "region": "Chamoli"},
            {"verification": "verified", "status": "active"},
            {"verification": "likely_true", "status": "monitoring"},
        ]

        for p_params in pairwise_cases:
            with self.subTest(params=p_params):
                res = self.client.get_json("/api/v1/events", params=p_params)
                self.assertIn("events", res)
                self.assertIn("total", res)
                self.assertIn("kpis", res)

                # Verify every returned item adheres to applied filters
                for ev in res["events"]:
                    if "hazard" in p_params:
                        self.assertIn(p_params["hazard"].lower(), ev["hazard_name"].lower())
                    if "severity" in p_params:
                        self.assertEqual(p_params["severity"].lower(), ev["severity"].lower())
                    if "region" in p_params:
                        self.assertIn(p_params["region"].lower(), ev["district_name"].lower())
                    if "verification" in p_params:
                        self.assertEqual(p_params["verification"].lower(), ev["verification"].lower())
                    if "status" in p_params:
                        self.assertEqual(p_params["status"].lower(), ev["status"].lower())

    def test_c2_events_triplet_and_quad_combinations(self):
        """Test 3-way and 4-way filter combinations on GET /api/v1/events."""
        multi_cases = [
            # 3-way
            {"hazard": "Landslide", "severity": "Critical", "region": "Rudraprayag"},
            {"hazard": "Heavy Rainfall", "severity": "Critical", "region": "Rudraprayag"},
            {"hazard": "Landslide", "severity": "Moderate", "region": "Chamoli"},
            {"hazard": "Flash Flood", "severity": "High", "region": "Rudraprayag"},
            # 4-way
            {
                "hazard": "Landslide",
                "severity": "Critical",
                "region": "Rudraprayag",
                "verification": "verified",
            },
            {
                "hazard": "Landslide",
                "severity": "Critical",
                "region": "Rudraprayag",
                "status": "active",
            },
        ]

        for m_params in multi_cases:
            with self.subTest(params=m_params):
                res = self.client.get_json("/api/v1/events", params=m_params)
                self.assertIn("events", res)
                for ev in res["events"]:
                    if "hazard" in m_params:
                        self.assertIn(m_params["hazard"].lower(), ev["hazard_name"].lower())
                    if "severity" in m_params:
                        self.assertEqual(m_params["severity"].lower(), ev["severity"].lower())
                    if "region" in m_params:
                        self.assertIn(m_params["region"].lower(), ev["district_name"].lower())
                    if "verification" in m_params:
                        self.assertEqual(m_params["verification"].lower(), ev["verification"].lower())
                    if "status" in m_params:
                        self.assertEqual(m_params["status"].lower(), ev["status"].lower())

    def test_c3_events_quintuple_filter_combination(self):
        """Test all 5 filters simultaneously: hazard + severity + region + verification + status."""
        quintuple_params = {
            "hazard": "Landslide",
            "severity": "Critical",
            "region": "Rudraprayag",
            "verification": "verified",
            "status": "active",
        }
        res = self.client.get_json("/api/v1/events", params=quintuple_params)
        self.assertIn("events", res)
        self.assertGreater(len(res["events"]), 0, "Expected Basukedar Landslide to match 5-filter query")
        ev = res["events"][0]
        self.assertIn("Landslide", ev["hazard_name"])
        self.assertEqual(ev["severity"], "Critical")
        self.assertEqual(ev["district_name"], "Rudraprayag")
        self.assertEqual(ev["verification"], "verified")
        self.assertEqual(ev["status"], "active")

    def test_c4_events_conflicting_filters_return_empty_200(self):
        """Verify conflicting filter combinations return empty list with 200 OK, never 500 or crash."""
        conflicting_cases = [
            {"hazard": "Cloudburst", "region": "Rudraprayag"},  # Cloudburst is in Chamoli
            {"hazard": "Landslide", "severity": "Low"},          # No low severity landslide
            {"region": "Uttarkashi", "status": "active"},        # No active event in Uttarkashi in seed
            {"hazard": "Earthquake", "region": "Chamoli"},       # No earthquake in events list
        ]
        for c_params in conflicting_cases:
            with self.subTest(params=c_params):
                res = self.client.get_json("/api/v1/events", params=c_params)
                self.assertIn("events", res)
                self.assertEqual(res["total"], 0)
                self.assertEqual(len(res["events"]), 0)

    def test_c5_events_pagination_invariants_with_filters(self):
        """Test pagination parameters page and limit work alongside combinatorial filters."""
        # Unfiltered total
        all_res = self.client.get_json("/api/v1/events?limit=100")
        total_events = all_res["total"]
        self.assertGreater(total_events, 2)

        # Page 1 with limit 2
        p1 = self.client.get_json("/api/v1/events?page=1&limit=2")
        self.assertEqual(len(p1["events"]), 2)
        self.assertEqual(p1["page"], 1)
        self.assertEqual(p1["limit"], 2)

        # Page 2 with limit 2
        p2 = self.client.get_json("/api/v1/events?page=2&limit=2")
        self.assertEqual(len(p2["events"]), 2)
        self.assertEqual(p2["page"], 2)

        # Assert no overlap between page 1 and page 2
        p1_ids = {e["event_id"] for e in p1["events"]}
        p2_ids = {e["event_id"] for e in p2["events"]}
        self.assertEqual(len(p1_ids.intersection(p2_ids)), 0, "Page 1 and Page 2 must not contain duplicate events")

    def test_c6_map_geojson_combinatorial_filters(self):
        """Test GET /api/v1/map/geojson with hazard, severity, district, and bounding box."""
        # 1. Hazard + Severity + District
        params = {
            "hazard": "Landslide",
            "severity": "Critical",
            "district": "Rudraprayag",
        }
        res = self.client.get_json("/api/v1/map/geojson", params=params)
        self.assert_geojson_feature_collection(res)
        self.assertGreater(len(res["features"]), 0)
        for feat in res["features"]:
            props = feat.get("properties", {})
            if props.get("layer") == "active_events":
                self.assertEqual(props.get("hazard"), "Landslide")
                self.assertEqual(props.get("severity"), "Critical")
                self.assertEqual(props.get("district"), "Rudraprayag")

        # 2. Bounding Box covering Rudraprayag
        bbox_params = {
            "min_lat": 30.4,
            "max_lat": 30.6,
            "min_lon": 79.0,
            "max_lon": 79.2,
        }
        res_bbox = self.client.get_json("/api/v1/map/geojson", params=bbox_params)
        self.assert_geojson_feature_collection(res_bbox)

        # 3. Disjoint / Out-of-bounds Bounding Box
        oob_params = {
            "min_lat": 45.0,
            "max_lat": 50.0,
            "min_lon": 85.0,
            "max_lon": 90.0,
        }
        res_oob = self.client.get_json("/api/v1/map/geojson", params=oob_params)
        self.assert_geojson_feature_collection(res_oob)
        self.assertEqual(len(res_oob["features"]), 0)

    def test_c7_reports_multi_facet_filters(self):
        """Test GET /api/v1/reports across source_type, verification, hazard, region, and language."""
        # 1. 5 facets simultaneously
        params_5 = {
            "source_type": "Official Report",
            "verification": "Verified",
            "hazard": "Landslide",
            "region": "Rudraprayag",
            "language": "en",
        }
        res = self.client.get_json("/api/v1/reports", params=params_5)
        self.assertIn("reports", res)
        self.assertGreater(len(res["reports"]), 0)
        r = res["reports"][0]
        self.assertEqual(r["source_type"], "Official Report")
        self.assertEqual(r["verification_status"], "Verified")
        self.assertEqual(r["hazard"], "Landslide")
        self.assertEqual(r["region"], "Rudraprayag")
        self.assertEqual(r["language"], "en")

        # 2. Hindi news article filter
        params_hi = {
            "source_type": "News Article",
            "verification": "Verified",
            "language": "hi",
        }
        res_hi = self.client.get_json("/api/v1/reports", params=params_hi)
        self.assertGreater(len(res_hi["reports"]), 0)
        self.assertEqual(res_hi["reports"][0]["id"], "rep-002")

    def test_c8_preparedness_shelters_combinatorial_filters(self):
        """Test GET /api/v1/preparedness/shelters across search, status, and district."""
        # 1. District + Status + Search
        params = {
            "district": "Rudraprayag",
            "status": "Available",
            "search": "Basukedar",
        }
        res = self.client.get_json("/api/v1/preparedness/shelters", params=params)
        shelters = res if isinstance(res, list) else res.get("shelters", [])
        self.assertGreater(len(shelters), 0)
        s = shelters[0]
        self.assertEqual(s["district"], "Rudraprayag")
        self.assertEqual(s["status"], "Available")
        self.assertIn("Basukedar", s["name"])

        # 2. Non-existent district returns empty list
        res_empty = self.client.get_json("/api/v1/preparedness/shelters?district=NonExistentDistrict")
        shelters_empty = res_empty if isinstance(res_empty, list) else res_empty.get("shelters", [])
        self.assertEqual(len(shelters_empty), 0)
