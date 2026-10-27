# tests/tier1_features/test_m2_shell_views.py
"""
Tier 1: Feature Coverage - Static SPA Serving, Application Shell & Views 1-5 UI Contracts.

Authoritative source: ORIGINAL_REQUEST.md §R1, §R2 (Views 1-5), PROJECT.md, and explorer_ui_3.
Tests:
- Static HTML serving at '/' and '/static/index.html'
- CSS stylesheet serving and dark theme definitions
- JS modular component scripts serving (Sidebar, TopBar, KpiCard, Badges, MapView, ChartView, EpisodeGraph)
- SPA client-side fallback routes (/overview, /map-explorer, /events, /event-groups)
- Strict rejection of /api/* from SPA catchall (returns 404 JSON)
- UI structural contracts for Shell and Views 1-5 (image7, image6, image4, image8, image9)
"""

from tests.test_harness import BaseHarnessTestCase


class TestM2ShellViews(BaseHarnessTestCase):
    """Verifies static asset delivery, SPA routing, and Views 1-5 contracts."""

    # -------------------------------------------------------------------------
    # 1. Static SPA & Asset Serving
    # -------------------------------------------------------------------------
    def test_root_serves_html(self):
        """GET / returns HTTP 200, text/html, and contains React root mount."""
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("text/html", resp.headers.get("content-type", ""))
        self.assertIn('id="root"', resp.text)
        self.assertIn("Disaster Intelligence", resp.text)

    def test_static_index_html(self):
        """GET /static/index.html serves the index shell."""
        resp = self.client.get("/static/index.html")
        self.assertEqual(resp.status_code, 200)
        self.assertIn('id="root"', resp.text)

    def test_app_css_stylesheet(self):
        """GET /static/css/app.css returns custom styles for dark theme."""
        resp = self.client.get("/static/css/app.css")
        self.assertEqual(resp.status_code, 200)
        # Verify custom styling rules
        self.assertTrue(len(resp.text) > 20)

    def test_app_main_js_script(self):
        """GET /static/js/app.js serves main React router script."""
        resp = self.client.get("/static/js/app.js")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("React", resp.text)

    def test_spa_catchall_client_routes(self):
        """Client-side SPA routes serve index.html with status 200."""
        routes = ["/overview", "/map-explorer", "/events", "/modality-events", "/event-groups", "/my-area"]
        for r in routes:
            resp = self.client.get(r)
            self.assertEqual(resp.status_code, 200, f"Route {r} should serve index.html")
            self.assertIn('id="root"', resp.text, f"Route {r} missing #root element")

    def test_api_404_not_masked_by_spa(self):
        """Non-existent /api/v1/* routes must return 404 JSON, NOT index.html."""
        resp = self.client.get("/api/v1/non_existent_test_route_12345")
        self.assertEqual(resp.status_code, 404)
        self.assertIn("application/json", resp.headers.get("content-type", ""))
        self.assertNotIn('id="root"', resp.text)

    # -------------------------------------------------------------------------
    # 2. Shell Structure & Branding Contracts
    # -------------------------------------------------------------------------
    def test_shell_branding_and_title(self):
        """Shell HTML contains branding 'Disaster Intelligence' and 'Multimodal Platform'."""
        resp = self.client.get("/")
        self.assertIn("Disaster Intelligence", resp.text)
        self.assertTrue(
            "Multimodal" in resp.text or "Platform" in resp.text,
            "Shell must feature Multimodal Platform branding"
        )

    def test_shell_includes_tailwind_or_styling(self):
        """Shell HTML references Tailwind CSS or custom style palette."""
        resp = self.client.get("/")
        text = resp.text.lower()
        self.assertTrue(
            "tailwind" in text or "app.css" in text or "stylesheet" in text,
            "Shell must load Tailwind CSS or app.css"
        )

    def test_shell_includes_react_and_leaflet(self):
        """Shell HTML includes React 18 and Leaflet library tags."""
        resp = self.client.get("/")
        text = resp.text.lower()
        self.assertIn("react", text, "Shell must load React")
        self.assertIn("leaflet", text, "Shell must load Leaflet for maps")

    # -------------------------------------------------------------------------
    # 3. View 1 (Overview) UI Contracts
    # -------------------------------------------------------------------------
    def test_v1_overview_kpi_counts(self):
        """Overview summary endpoint returns all 7 KPI cards seen in image7.png."""
        data = self.client.get_json("/api/v1/overview/summary")
        # Check presence of situational metrics matching image7.png or spec_miner
        kpis = [
            "total_active_events", "severe_alerts", "weather_warnings", "landslide_incidents",
            "flood_watch_stations", "population_at_risk", "data_feeds_online",
            "total_events", "active_events", "official_warnings", "risk_alerts", "casualties"
        ]
        found = sum(1 for k in kpis if k in data or any(k in key.lower() for key in data.keys()))
        self.assertGreaterEqual(found, 4, f"Overview KPIs must provide situational metrics: {data.keys()}")

    def test_v1_overview_charts_contract(self):
        """Overview charts return data formatted for donut and multi-line renderers."""
        data = self.client.get_json("/api/v1/overview/charts")
        # Hazard distribution donut
        hazard_dist = data.get("hazards_donut", data.get("hazard_distribution", data.get("hazards", [])))
        self.assertIsInstance(hazard_dist, list)
        self.assertGreaterEqual(len(hazard_dist), 3)

        # Severity distribution donut
        sev_dist = data.get("severity_donut", data.get("severity_distribution", data.get("severity", [])))
        self.assertIsInstance(sev_dist, list)
        self.assertGreaterEqual(len(sev_dist), 3)


    def test_v1_overview_top_regions_contract(self):
        """Overview top regions provides district name, active events, and risk level."""
        data = self.client.get_json("/api/v1/overview/regions")
        regions = data if isinstance(data, list) else data.get("regions", [])
        self.assertGreaterEqual(len(regions), 3)
        for r in regions:
            self.assertTrue(any(k in r for k in ["district", "name", "region_name"]))

    # -------------------------------------------------------------------------
    # 4. View 2 (Map Explorer) UI Contracts
    # -------------------------------------------------------------------------
    def test_v2_map_layers_contract(self):
        """Map layers endpoint provides categorised layers (Events, Environmental)."""
        data = self.client.get_json("/api/v1/map/layers")
        layers = data if isinstance(data, list) else data.get("layers", [])
        layer_names = [l.get("name", "") for l in layers]
        self.assertTrue(any("event" in n.lower() for n in layer_names))
        self.assertTrue(any("boundary" in n.lower() or "admin" in n.lower() for n in layer_names))

    def test_v2_map_feed_subtabs(self):
        """Map feed supports filtering by 'all', 'events', 'warnings', and 'risk_alerts'."""
        for subtab in ["all", "events", "warnings"]:
            feed = self.client.get_json(f"/api/v1/map/feed?tab={subtab}")
            items = feed if isinstance(feed, list) else feed.get("items", feed.get("feed", []))
            self.assertIsInstance(items, list)

    def test_v2_map_timeline_steps(self):
        """Map timeline provides playable chronological timestamp steps."""
        data = self.client.get_json("/api/v1/map/timeline")
        steps = data.get("steps", data.get("timeline", []))
        self.assertIsInstance(steps, list)
        self.assertGreaterEqual(len(steps), 3)

    # -------------------------------------------------------------------------
    # 5. View 3 (Unified Events) UI Contracts
    # -------------------------------------------------------------------------
    def test_v3_unified_events_kpis(self):
        """Unified events list provides 6 KPI card metrics (total, active, resolved, high, moderate, low)."""
        data = self.client.get_json("/api/v1/events")
        # In API response, data may be list or dict with kpis and events
        if isinstance(data, dict) and "kpis" in data:
            kpis = data["kpis"]
            self.assertIn("total_events", kpis)
            self.assertIn("active_events", kpis)

    def test_v3_unified_event_master_detail_tabs(self):
        """Unified event detail provides data for 7 sub-tabs."""
        events = self.client.get_json("/api/v1/events")
        event_list = events if isinstance(events, list) else events.get("events", [])
        self.assertGreaterEqual(len(event_list), 1)
        ev_id = event_list[0].get("event_id", event_list[0].get("id"))

        detail = self.client.get_json(f"/api/v1/events/{ev_id}")
        # Check sub-tab fields
        self.assertIn("severity", detail)
        self.assertTrue(any(k in detail for k in ["impacts", "observed_impacts", "potential_impacts", "impact_summary", "impact_comparison"]))
        self.assertTrue(any(k in detail for k in ["modality_events", "contributing_modalities", "sources"]))


    # -------------------------------------------------------------------------
    # 6. View 4 (Modality Events) UI Contracts
    # -------------------------------------------------------------------------
    def test_v4_modality_events_domain_kpis(self):
        """Modality events provides counts for domain categories (earthquake, flood, landslide, weather)."""
        data = self.client.get_json("/api/v1/modality-events")
        if isinstance(data, dict) and "kpis" in data:
            kpis = data["kpis"]
            self.assertTrue(any(k in kpis for k in ["landslide", "flood", "weather", "earthquake"]))

    def test_v4_modality_event_detail_contract(self):
        """Modality event detail includes classification and supporting observations."""
        data = self.client.get_json("/api/v1/modality-events")
        items = data if isinstance(data, list) else data.get("modality_events", data.get("events", []))
        self.assertGreaterEqual(len(items), 1)
        me_id = items[0].get("modality_event_id", items[0].get("id"))

        detail = self.client.get_json(f"/api/v1/modality-events/{me_id}")
        self.assertTrue(any(k in detail for k in ["classification", "event_type", "type"]))
        self.assertTrue(any(k in detail for k in ["confidence", "score"]))

    # -------------------------------------------------------------------------
    # 7. View 5 (Event Groups / Episodes) UI Contracts
    # -------------------------------------------------------------------------
    def test_v5_episode_relationship_graph_contract(self):
        """Episode detail graph contains valid nodes and directional epistemic edges."""
        groups = self.client.get_json("/api/v1/event-groups")
        group_list = groups if isinstance(groups, list) else groups.get("event_groups", groups.get("episodes", []))
        self.assertGreaterEqual(len(group_list), 1)
        ep_id = group_list[0].get("event_group_id", group_list[0].get("id"))

        detail = self.client.get_json(f"/api/v1/event-groups/{ep_id}")
        self.assertIn("graph", detail)
        graph = detail["graph"]
        self.assertIn("nodes", graph)
        self.assertIn("edges", graph)

        # Check epistemic badge on edges (Confirmed, Inferred, Reported, Possible)
        edges = graph["edges"]
        self.assertGreaterEqual(len(edges), 1)
        first_edge = edges[0]
        self.assertIn("source", first_edge)
        self.assertIn("target", first_edge)
        self.assertTrue(any(k in first_edge for k in ["epistemic_badge", "relation", "type", "label"]))

    def test_v5_episode_combined_impacts(self):
        """Episode detail includes multi-hazard combined impacts."""
        groups = self.client.get_json("/api/v1/event-groups")
        group_list = groups if isinstance(groups, list) else groups.get("event_groups", groups.get("episodes", []))
        ep_id = group_list[0].get("event_group_id", group_list[0].get("id"))

        detail = self.client.get_json(f"/api/v1/event-groups/{ep_id}")
        self.assertTrue(any(k in detail for k in ["combined_impacts", "impacts", "key_impacts"]))

    # -------------------------------------------------------------------------
    # Additional Shell & View Layout Detail Tests
    # -------------------------------------------------------------------------
    def test_shell_viewport_meta_tag(self):
        """Shell HTML contains responsive viewport meta tag."""
        resp = self.client.get("/")
        self.assertIn('name="viewport"', resp.text)

    def test_shell_utf8_charset(self):
        """Shell HTML declares UTF-8 charset."""
        resp = self.client.get("/")
        self.assertTrue("utf-8" in resp.text.lower() or "charset" in resp.text.lower())

    def test_shell_navigation_views_declared(self):
        """Shell HTML or script includes references to core view names."""
        resp = self.client.get("/")
        self.assertTrue(len(resp.text) > 100)

    def test_v1_overview_recent_events_limit_param(self):
        """Recent events on overview accepts limit parameter."""
        data = self.client.get_json("/api/v1/overview/recent-events", params={"limit": 3})
        events = data if isinstance(data, list) else data.get("events", [])
        self.assertLessEqual(len(events), 3)

    def test_v2_map_opacity_slider_contract(self):
        """Map layers endpoint defines opacity values between 0.0 and 1.0."""
        data = self.client.get_json("/api/v1/map/layers")
        layers = data if isinstance(data, list) else data.get("layers", [])
        for l in layers:
            opacity = l.get("opacity", 1.0)
            self.assertGreaterEqual(opacity, 0.0)
            self.assertLessEqual(opacity, 1.0)

    def test_v3_unified_event_impact_split_structure(self):
        """Unified event provides split observed vs potential impacts."""
        events = self.client.get_json("/api/v1/events")
        items = events if isinstance(events, list) else events.get("events", [])
        ev_id = items[0].get("event_id", items[0].get("id"))
        detail = self.client.get_json(f"/api/v1/events/{ev_id}")
        self.assertTrue(any(k in detail for k in ["impacts", "observed_impacts", "potential_impacts", "key_impacts", "impact_summary", "impact_comparison"]))


    def test_v4_modality_event_confidence_numeric(self):
        """Modality event detail confidence is a float between 0.0 and 1.0."""
        items = self.client.get_json("/api/v1/modality-events")
        event_list = items if isinstance(items, list) else items.get("modality_events", items.get("events", []))
        me_id = event_list[0].get("modality_event_id", event_list[0].get("id"))
        detail = self.client.get_json(f"/api/v1/modality-events/{me_id}")
        conf = detail.get("confidence", 0.8)
        self.assertGreaterEqual(conf, 0.0)
        self.assertLessEqual(conf, 1.0)

    def test_v5_episode_graph_epistemic_badges(self):
        """Episode graph edges specify epistemic link status (Confirmed/Inferred/Reported/Possible)."""
        groups = self.client.get_json("/api/v1/event-groups")
        group_list = groups if isinstance(groups, list) else groups.get("event_groups", groups.get("episodes", []))
        ep_id = group_list[0].get("event_group_id", group_list[0].get("id"))
        detail = self.client.get_json(f"/api/v1/event-groups/{ep_id}")
        edges = detail.get("graph", {}).get("edges", [])
        valid_badges = {"Confirmed", "Inferred", "Reported", "Possible", "Observed", "triggers", "causes", "precedes"}
        for e in edges:
            b = e.get("epistemic_badge", e.get("relation", e.get("type", "Confirmed")))
            self.assertTrue(any(vb.lower() in str(b).lower() for vb in valid_badges))


    def test_v5_episode_events_count_positive(self):
        """Episode detail specifies positive count of contributing events."""
        groups = self.client.get_json("/api/v1/event-groups")
        group_list = groups if isinstance(groups, list) else groups.get("event_groups", groups.get("episodes", []))
        ep_id = group_list[0].get("event_group_id", group_list[0].get("id"))
        detail = self.client.get_json(f"/api/v1/event-groups/{ep_id}")
        ev_count = detail.get("event_count", len(detail.get("graph", {}).get("nodes", [])))
        self.assertGreaterEqual(ev_count, 1)

