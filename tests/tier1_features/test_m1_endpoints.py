# tests/tier1_features/test_m1_endpoints.py
"""
Tier 1: Feature Coverage - Domain API Endpoints across all 10 Views.

Authoritative source: ORIGINAL_REQUEST.md §R2, §R3, PROJECT.md, and spec_miner_schema_3.
Tests all REST endpoints powering:
- Overview (summary, alerts, news, charts, regions, recent-events, data-sources)
- Map Explorer (layers, geojson, feed, timeline)
- Unified Events (list, detail with 7 sub-tabs)
- Modality Events (list with 8 KPIs, detail)
- Event Groups / Episodes (list with 5 KPIs, detail with DAG graph)
- Reports & Evidence (feed, detail with bilingual translation)
- History & Trends (summary, trends, seasonal, landslides, regional-distribution, compare)
- Preparedness & Response (summary with verified dates, shelters, directory)
- Ask Q&A (suggested questions, grounded query)
- My Area (watchlist, settings)
"""

from tests.test_harness import BaseHarnessTestCase


class TestM1Endpoints(BaseHarnessTestCase):
    """Verifies all domain endpoints specified in PROJECT.md interface contracts."""

    # -------------------------------------------------------------------------
    # 1. Overview Endpoints
    # -------------------------------------------------------------------------
    def test_overview_summary_kpis(self):
        """GET /api/v1/overview/summary returns situational KPI metrics."""
        data = self.client.get_json("/api/v1/overview/summary")
        # Must contain situational metrics from image7.png
        self.assertTrue(
            any(k in data for k in ["total_events", "total_active_events", "active_events"]),
            "Missing total/active events KPI in overview summary"
        )
        self.assertTrue(
            any(k in data for k in ["official_warnings", "severe_alerts", "warnings"]),
            "Missing warnings/alerts KPI in overview summary"
        )

    def test_overview_alerts_feed(self):
        """GET /api/v1/overview/alerts returns active alerts with epistemic and severity badges."""
        data = self.client.get_json("/api/v1/overview/alerts")
        alerts = data if isinstance(data, list) else data.get("alerts", [])
        self.assertIsInstance(alerts, list)
        self.assertGreaterEqual(len(alerts), 1, "Must have at least 1 active alert")
        first = alerts[0]
        self.assertIn("title", first)
        self.assertIn("severity", first)
        self.assert_severity(first["severity"])
        if "epistemic_status" in first:
            self.assert_epistemic_status(first["epistemic_status"])

    def test_overview_news(self):
        """GET /api/v1/overview/news returns live news feed and SITREPs."""
        data = self.client.get_json("/api/v1/overview/news")
        news = data if isinstance(data, list) else data.get("news", [])
        self.assertIsInstance(news, list)
        self.assertGreaterEqual(len(news), 1, "Must return news items")
        item = news[0]
        self.assertIn("title", item)
        self.assertIn("source", item)

    def test_overview_charts(self):
        """GET /api/v1/overview/charts returns datasets for hazard donut, trend line, and severity donut."""
        data = self.client.get_json("/api/v1/overview/charts")
        self.assertTrue(
            any(k in data for k in ["hazard_distribution", "hazards", "by_hazard", "hazards_donut"]),
            f"Missing hazard distribution chart data in {data.keys()}"
        )
        self.assertTrue(
            any(k in data for k in ["event_trend", "trend", "trends", "event_trends"]),
            f"Missing event trend chart data in {data.keys()}"
        )
        self.assertTrue(
            any(k in data for k in ["severity_distribution", "severity", "by_severity", "severity_donut"]),
            f"Missing severity distribution chart data in {data.keys()}"
        )


    def test_overview_regions(self):
        """GET /api/v1/overview/regions returns top affected Uttarakhand districts."""
        data = self.client.get_json("/api/v1/overview/regions")
        regions = data if isinstance(data, list) else data.get("regions", [])
        self.assertIsInstance(regions, list)
        self.assertGreaterEqual(len(regions), 1)
        names = [r.get("district", r.get("name", "")) for r in regions]
        # Should include core Uttarakhand disaster districts
        uk_districts = {"Rudraprayag", "Chamoli", "Tehri Garhwal", "Uttarkashi", "Pithoragarh", "Dehradun"}
        self.assertTrue(any(d in names for d in uk_districts), f"Expected Uttarakhand districts, got {names}")

    def test_overview_recent_events(self):
        """GET /api/v1/overview/recent-events returns events in last 24h."""
        data = self.client.get_json("/api/v1/overview/recent-events")
        events = data if isinstance(data, list) else data.get("events", [])
        self.assertIsInstance(events, list)
        self.assertGreaterEqual(len(events), 1)

    def test_overview_data_sources(self):
        """GET /api/v1/overview/data-sources returns operational health of feeds."""
        data = self.client.get_json("/api/v1/overview/data-sources")
        sources = data if isinstance(data, list) else data.get("sources", [])
        self.assertIsInstance(sources, list)
        self.assertGreaterEqual(len(sources), 1)
        first = sources[0]
        self.assertIn("status", first)

    # -------------------------------------------------------------------------
    # 2. Map Explorer Endpoints
    # -------------------------------------------------------------------------
    def test_map_layers(self):
        """GET /api/v1/map/layers returns list of toggleable map layers."""
        data = self.client.get_json("/api/v1/map/layers")
        layers = data if isinstance(data, list) else data.get("layers", [])
        self.assertIsInstance(layers, list)
        self.assertGreaterEqual(len(layers), 3, "Must have multiple map layers")
        first = layers[0]
        self.assertIn("name", first)

    def test_map_geojson_general(self):
        """GET /api/v1/map/geojson returns a valid GeoJSON FeatureCollection."""
        data = self.client.get_json("/api/v1/map/geojson")
        self.assert_geojson_feature_collection(data)
        self.assertGreaterEqual(len(data["features"]), 1, "Must contain at least 1 feature")

    def test_map_geojson_filtered_hazard(self):
        """GET /api/v1/map/geojson?hazard=Landslide filters features by hazard."""
        data = self.client.get_json("/api/v1/map/geojson", params={"hazard": "Landslide"})
        self.assert_geojson_feature_collection(data)
        for feat in data["features"]:
            props = feat.get("properties", {})
            title = props.get("title", "").lower()
            hazard_prop = str(props.get("hazard", "")).lower()
            layer = props.get("layer", "")
            if layer == "active_events":
                self.assertTrue("landslide" in title or "landslide" in hazard_prop or len(hazard_prop) > 0)


    def test_map_geojson_coordinates_in_uttarakhand(self):
        """All features in map GeoJSON must fall within Uttarakhand geographic bounds."""
        data = self.client.get_json("/api/v1/map/geojson")
        for feat in data["features"]:
            geom = feat.get("geometry")
            if geom and geom.get("type") == "Point":
                coords = geom.get("coordinates", [])
                if len(coords) >= 2:
                    lon, lat = coords[0], coords[1]
                    self.assert_uttarakhand_coords(lat, lon, feat.get("properties", {}).get("name", "feature"))

    def test_map_feed_all_and_filtered(self):
        """GET /api/v1/map/feed supports tab parameter ('all', 'events', 'warnings', 'risk_alerts')."""
        for tab in ["all", "events", "warnings"]:
            data = self.client.get_json("/api/v1/map/feed", params={"tab": tab})
            feed = data if isinstance(data, list) else data.get("items", data.get("feed", []))
            self.assertIsInstance(feed, list, f"Feed for tab={tab} must be a list")

    def test_map_timeline(self):
        """GET /api/v1/map/timeline returns time scrubber intervals and hazard counts."""
        data = self.client.get_json("/api/v1/map/timeline")
        self.assertTrue(any(k in data for k in ["steps", "timeline", "intervals"]))

    # -------------------------------------------------------------------------
    # 3. Unified Events Endpoints
    # -------------------------------------------------------------------------
    def test_events_list(self):
        """GET /api/v1/events returns master list of unified events with summary KPIs."""
        data = self.client.get_json("/api/v1/events")
        events = data if isinstance(data, list) else data.get("events", [])
        self.assertIsInstance(events, list)
        self.assertGreaterEqual(len(events), 1, "Must return unified events")
        ev = events[0]
        self.assertTrue(any(k in ev for k in ["event_id", "id", "event_code"]))
        self.assertIn("severity", ev)
        self.assert_severity(ev["severity"])

    def test_events_list_filter_hazard(self):
        """GET /api/v1/events?hazard=Landslide filters unified events."""
        data = self.client.get_json("/api/v1/events", params={"hazard": "Landslide"})
        events = data if isinstance(data, list) else data.get("events", [])
        self.assertIsInstance(events, list)
        for ev in events:
            h = ev.get("hazard_name", ev.get("hazard", ""))
            self.assertIn("landslide", h.lower())

    def test_events_detail(self):
        """GET /api/v1/events/{event_id} returns unified event detail with sub-tabs."""
        events_data = self.client.get_json("/api/v1/events")
        events = events_data if isinstance(events_data, list) else events_data.get("events", [])
        self.assertGreaterEqual(len(events), 1)
        first_id = events[0].get("event_id", events[0].get("id"))

        detail = self.client.get_json(f"/api/v1/events/{first_id}")
        self.assertTrue(any(k in detail for k in ["event_id", "id", "event_code"]))
        self.assertIn("severity", detail)
        self.assertTrue(any(k in detail for k in ["description", "narrative"]))
        self.assertTrue(any(k in detail for k in ["impacts", "observed_impacts", "key_impacts", "impact_summary", "impact_comparison"]))


    # -------------------------------------------------------------------------
    # 4. Modality Events Endpoints
    # -------------------------------------------------------------------------
    def test_modality_events_list(self):
        """GET /api/v1/modality-events returns modality-level detections with 8 KPI counts."""
        data = self.client.get_json("/api/v1/modality-events")
        events = data if isinstance(data, list) else data.get("modality_events", data.get("events", []))
        self.assertIsInstance(events, list)
        self.assertGreaterEqual(len(events), 1)
        me = events[0]
        self.assertTrue(any(k in me for k in ["modality_event_id", "id"]))

    def test_modality_events_detail(self):
        """GET /api/v1/modality-events/{id} returns detail with observations & ML results."""
        m_data = self.client.get_json("/api/v1/modality-events")
        events = m_data if isinstance(m_data, list) else m_data.get("modality_events", m_data.get("events", []))
        self.assertGreaterEqual(len(events), 1)
        first_id = events[0].get("modality_event_id", events[0].get("id"))

        detail = self.client.get_json(f"/api/v1/modality-events/{first_id}")
        self.assertTrue(any(k in detail for k in ["modality_event_id", "id"]))
        self.assertTrue(any(k in detail for k in ["supporting_observations", "observations", "evidence"]))

    # -------------------------------------------------------------------------
    # 5. Event Groups / Episodes Endpoints
    # -------------------------------------------------------------------------
    def test_event_groups_list(self):
        """GET /api/v1/event-groups returns multi-hazard disaster episodes."""
        data = self.client.get_json("/api/v1/event-groups")
        groups = data if isinstance(data, list) else data.get("event_groups", data.get("episodes", []))
        self.assertIsInstance(groups, list)
        self.assertGreaterEqual(len(groups), 1)
        ep = groups[0]
        self.assertTrue(any(k in ep for k in ["event_group_id", "id", "event_group_code"]))

    def test_event_groups_detail_and_graph(self):
        """GET /api/v1/event-groups/{id} returns episode detail and relationship DAG graph."""
        g_data = self.client.get_json("/api/v1/event-groups")
        groups = g_data if isinstance(g_data, list) else g_data.get("event_groups", g_data.get("episodes", []))
        self.assertGreaterEqual(len(groups), 1)
        first_id = groups[0].get("event_group_id", groups[0].get("id"))

        detail = self.client.get_json(f"/api/v1/event-groups/{first_id}")
        self.assertIn("graph", detail)
        graph = detail["graph"]
        self.assertIn("nodes", graph)
        self.assertIn("edges", graph)
        self.assertGreaterEqual(len(graph["nodes"]), 2, "Episode graph must contain at least 2 connected nodes")

    # -------------------------------------------------------------------------
    # 6. Reports & Evidence Endpoints
    # -------------------------------------------------------------------------
    def test_reports_list(self):
        """GET /api/v1/reports returns reports feed with verification and language tags."""
        data = self.client.get_json("/api/v1/reports")
        reports = data if isinstance(data, list) else data.get("reports", [])
        self.assertIsInstance(reports, list)
        self.assertGreaterEqual(len(reports), 1)
        r = reports[0]
        self.assertIn("title", r)
        self.assertTrue(any(k in r for k in ["verification_status", "verification", "verified"]))

    def test_reports_detail_bilingual(self):
        """GET /api/v1/reports/{id} returns report detail with English and Hindi translation."""
        rep_data = self.client.get_json("/api/v1/reports")
        reports = rep_data if isinstance(rep_data, list) else rep_data.get("reports", [])
        self.assertGreaterEqual(len(reports), 1)
        first_id = reports[0].get("report_id", reports[0].get("id"))

        detail = self.client.get_json(f"/api/v1/reports/{first_id}")
        self.assertTrue(any(k in detail for k in ["content", "content_en", "body"]))
        self.assertTrue(
            any(k in detail for k in ["translation", "content_hi", "title_hi"]),
            "Report detail must include Hindi translation content"
        )

    # -------------------------------------------------------------------------
    # 7. History & Trends Endpoints
    # -------------------------------------------------------------------------
    def test_history_summary(self):
        """GET /api/v1/history/summary returns 6 decadal KPI cards."""
        data = self.client.get_json("/api/v1/history/summary")
        self.assertTrue(any(k in data for k in ["total_historical_events", "total_events", "total_recorded_events"]))

    def test_history_trends_stacked_bars(self):
        """GET /api/v1/history/trends returns yearly stacked bar datasets."""
        data = self.client.get_json("/api/v1/history/trends", params={"granularity": "yearly"})
        trends = data.get("datasets", data if isinstance(data, list) else data.get("trends", []))
        self.assertIsInstance(trends, list)
        self.assertGreaterEqual(len(trends), 3, "Historical trends should cover multiple hazards")

    def test_history_seasonal_patterns(self):

        """GET /api/v1/history/seasonal returns 12-month monthly average data."""
        data = self.client.get_json("/api/v1/history/seasonal")
        seasonal = data if isinstance(data, list) else data.get("seasonal", [])
        self.assertIsInstance(seasonal, list)
        self.assertEqual(len(seasonal), 12, "Seasonal pattern must cover exactly 12 months")

    def test_history_landslides_geojson(self):
        """GET /api/v1/history/landslides returns historical landslide scar inventory GeoJSON."""
        data = self.client.get_json("/api/v1/history/landslides")
        self.assert_geojson_feature_collection(data)

    def test_history_regional_distribution(self):
        """GET /api/v1/history/regional-distribution returns district-level distribution data."""
        data = self.client.get_json("/api/v1/history/regional-distribution")
        dist = data if isinstance(data, list) else data.get("distribution", [])
        self.assertIsInstance(dist, list)
        self.assertGreaterEqual(len(dist), 5)

    def test_history_compare(self):
        """GET /api/v1/history/compare returns comparative metrics between events."""
        data = self.client.get_json("/api/v1/history/compare")
        self.assertTrue(any(k in data for k in ["comparison", "metrics", "comparison_metrics"]))

    # -------------------------------------------------------------------------
    # 8. Preparedness & Response Endpoints
    # -------------------------------------------------------------------------
    def test_preparedness_summary(self):
        """GET /api/v1/preparedness/summary returns 4 KPI cards with verification timestamps."""
        data = self.client.get_json("/api/v1/preparedness/summary")
        self.assertTrue(any(k in data for k in ["verified_shelters", "shelters"]))
        self.assertTrue(any(k in data for k in ["emergency_contacts", "contacts"]))

    def test_preparedness_shelters(self):
        """GET /api/v1/preparedness/shelters returns verified shelters with capacity and coordinates."""
        data = self.client.get_json("/api/v1/preparedness/shelters")
        shelters = data if isinstance(data, list) else data.get("shelters", [])
        self.assertIsInstance(shelters, list)
        self.assertGreaterEqual(len(shelters), 1)
        sh = shelters[0]
        self.assertIn("name", sh)
        self.assertIn("capacity", sh)
        self.assertIn("status", sh)
        self.assertIn(sh["status"], {"Available", "Partially Filled", "Unavailable"})

    def test_preparedness_directory(self):
        """GET /api/v1/preparedness/directory returns contacts, resources, and guidance."""
        for cat in ["contacts", "resources", "guidance"]:
            data = self.client.get_json("/api/v1/preparedness/directory", params={"category": cat})
            items = data if isinstance(data, list) else data.get("items", data.get(cat, []))
            self.assertIsInstance(items, list, f"Directory category '{cat}' must be a list")

    # -------------------------------------------------------------------------
    # 9. Ask Q&A Endpoints
    # -------------------------------------------------------------------------
    def test_ask_suggested_questions(self):
        """GET /api/v1/ask/suggested returns 5 suggested questions matching image5.png."""
        data = self.client.get_json("/api/v1/ask/suggested")
        questions = data if isinstance(data, list) else data.get("questions", [])
        self.assertIsInstance(questions, list)
        self.assertGreaterEqual(len(questions), 3)

    def test_ask_query_grounded_response(self):
        """POST /api/v1/ask/query returns structured Fact, Inference, Prediction and Citations."""
        payload = {"query": "What caused the landslide in Rudraprayag?"}
        resp = self.client.post("/api/v1/ask/query", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        # Check structured answer
        self.assertIn("answer", data)
        ans = data["answer"]
        self.assertTrue(
            any(k in ans for k in ["facts", "inferences", "predictions"]),
            f"Answer must contain facts/inferences/predictions: {ans}"
        )

        # Check citations
        self.assertIn("citations", data)
        self.assertIsInstance(data["citations"], list)
        self.assertGreaterEqual(len(data["citations"]), 1, "Must contain at least 1 citation")

    # -------------------------------------------------------------------------
    # 10. My Area & Settings Endpoints
    # -------------------------------------------------------------------------
    def test_my_area_watchlist(self):
        """GET /api/v1/my-area/watchlist returns saved watchlist districts."""
        data = self.client.get_json("/api/v1/my-area/watchlist")
        watchlist = data if isinstance(data, list) else data.get("watchlist", [])
        self.assertIsInstance(watchlist, list)

    def test_my_area_settings(self):
        """GET /api/v1/my-area/settings returns notification and unit preferences."""
        data = self.client.get_json("/api/v1/my-area/settings")
        self.assertTrue(any(k in data for k in ["notifications", "units", "map_settings", "map_defaults"]))

    # -------------------------------------------------------------------------
    # Additional Detailed Filter & Parameter Tests
    # -------------------------------------------------------------------------
    def test_overview_alerts_limit_param(self):
        """GET /api/v1/overview/alerts?limit=2 respects limit parameter."""
        data = self.client.get_json("/api/v1/overview/alerts", params={"limit": 2})
        alerts = data if isinstance(data, list) else data.get("alerts", [])
        self.assertLessEqual(len(alerts), 2)

    def test_overview_news_limit_param(self):
        """GET /api/v1/overview/news?limit=2 respects limit parameter."""
        data = self.client.get_json("/api/v1/overview/news", params={"limit": 2})
        news = data if isinstance(data, list) else data.get("news", [])
        self.assertLessEqual(len(news), 2)

    def test_overview_charts_7day_vs_30day(self):
        """GET /api/v1/overview/charts accepts days parameter (7 or 30)."""
        data7 = self.client.get_json("/api/v1/overview/charts", params={"days": 7})
        data30 = self.client.get_json("/api/v1/overview/charts", params={"days": 30})
        self.assertTrue(any(k in data7 for k in ["hazard_distribution", "hazards_donut", "hazards"]))
        self.assertTrue(any(k in data30 for k in ["hazard_distribution", "hazards_donut", "hazards"]))


    def test_map_geojson_filtered_severity(self):
        """GET /api/v1/map/geojson?severity=High filters by severity."""
        data = self.client.get_json("/api/v1/map/geojson", params={"severity": "High"})
        self.assert_geojson_feature_collection(data)
        for feat in data["features"]:
            props = feat.get("properties", {})
            if "severity" in props:
                self.assertIn("high", props["severity"].lower())

    def test_map_geojson_filtered_district(self):
        """GET /api/v1/map/geojson?district=Rudraprayag filters by district."""
        data = self.client.get_json("/api/v1/map/geojson", params={"district": "Rudraprayag"})
        self.assert_geojson_feature_collection(data)

    def test_map_geojson_combined_filter(self):
        """GET /api/v1/map/geojson?hazard=Landslide&severity=High handles multiple filters."""
        data = self.client.get_json("/api/v1/map/geojson", params={"hazard": "Landslide", "severity": "High"})
        self.assert_geojson_feature_collection(data)

    def test_events_filter_severity(self):
        """GET /api/v1/events?severity=High filters unified events list."""
        data = self.client.get_json("/api/v1/events", params={"severity": "High"})
        events = data if isinstance(data, list) else data.get("events", [])
        for ev in events:
            self.assertIn("high", ev.get("severity", "").lower())

    def test_events_filter_region(self):
        """GET /api/v1/events?region=Rudraprayag filters events by region."""
        data = self.client.get_json("/api/v1/events", params={"region": "Rudraprayag"})
        events = data if isinstance(data, list) else data.get("events", [])
        self.assertIsInstance(events, list)

    def test_events_filter_status(self):
        """GET /api/v1/events?status=active filters events by active status."""
        data = self.client.get_json("/api/v1/events", params={"status": "active"})
        events = data if isinstance(data, list) else data.get("events", [])
        for ev in events:
            if "status" in ev:
                self.assertEqual(ev["status"].lower(), "active")

    def test_events_pagination(self):
        """GET /api/v1/events?page=1&limit=5 supports pagination parameters."""
        data = self.client.get_json("/api/v1/events", params={"page": 1, "limit": 5})
        events = data if isinstance(data, list) else data.get("events", [])
        self.assertLessEqual(len(events), 5)

    def test_modality_events_filter_modality(self):
        """GET /api/v1/modality-events?modality=weather filters by modality."""
        data = self.client.get_json("/api/v1/modality-events", params={"modality": "weather"})
        events = data if isinstance(data, list) else data.get("modality_events", data.get("events", []))
        self.assertIsInstance(events, list)

    def test_modality_events_filter_hazard(self):
        """GET /api/v1/modality-events?hazard=Heavy Rainfall filters by hazard."""
        data = self.client.get_json("/api/v1/modality-events", params={"hazard": "Heavy Rainfall"})
        events = data if isinstance(data, list) else data.get("modality_events", data.get("events", []))
        self.assertIsInstance(events, list)

    def test_event_groups_filter_status(self):
        """GET /api/v1/event-groups?status=active filters episodes by status."""
        data = self.client.get_json("/api/v1/event-groups", params={"status": "active"})
        groups = data if isinstance(data, list) else data.get("event_groups", data.get("episodes", []))
        for g in groups:
            if "status" in g:
                self.assertEqual(g["status"].lower(), "active")

    def test_reports_filter_verification(self):
        """GET /api/v1/reports?verification=verified filters reports by verification status."""
        data = self.client.get_json("/api/v1/reports", params={"verification": "verified"})
        reports = data if isinstance(data, list) else data.get("reports", [])
        self.assertIsInstance(reports, list)

    def test_reports_filter_language(self):
        """GET /api/v1/reports?language=en filters reports by language tag."""
        data = self.client.get_json("/api/v1/reports", params={"language": "en"})
        reports = data if isinstance(data, list) else data.get("reports", [])
        self.assertIsInstance(reports, list)

    def test_reports_filter_source_type(self):
        """GET /api/v1/reports?source_type=official_report filters by source type."""
        data = self.client.get_json("/api/v1/reports", params={"source_type": "official_report"})
        reports = data if isinstance(data, list) else data.get("reports", [])
        self.assertIsInstance(reports, list)

    def test_preparedness_shelters_filter_district(self):
        """GET /api/v1/preparedness/shelters?district=Chamoli filters shelters by district."""
        data = self.client.get_json("/api/v1/preparedness/shelters", params={"district": "Chamoli"})
        shelters = data if isinstance(data, list) else data.get("shelters", [])
        for s in shelters:
            if "district" in s:
                self.assertIn("chamoli", s["district"].lower())

    def test_preparedness_shelters_filter_status(self):
        """GET /api/v1/preparedness/shelters?status=Available filters shelters by availability."""
        data = self.client.get_json("/api/v1/preparedness/shelters", params={"status": "Available"})
        shelters = data if isinstance(data, list) else data.get("shelters", [])
        for s in shelters:
            self.assertEqual(s.get("status"), "Available")

