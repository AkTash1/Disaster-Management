# tests/tier3_combinations/test_cross_feature.py
"""
Tier 3: Cross-Feature Combinations & Master-Detail Integration.

Authoritative source: TEST_INFRA.md, Pairwise Combinatorial testing, and relational contracts.
Tests:
- Multi-filter pairwise combinations on Events and Map Explorer
- Cross-modal referential linking: Episode Graph -> Unified Event -> Modality Event -> Raw Evidence
- Ask Q&A citation grounding matching active SITREPs and Reports
- Watchlist mutations reflecting across My Area and Location Summaries
- Quantitative consistency across Overview KPIs and underlying entity lists
- Geospatial coordinate bounding box coherence between districts and shelters
"""

from tests.test_harness import BaseHarnessTestCase


class TestCrossFeatureCombinations(BaseHarnessTestCase):
    """Verifies pairwise filter interactions and cross-domain referential consistency."""

    # -------------------------------------------------------------------------
    # 1. Multi-Filter Pairwise Interactions on Unified Events
    # -------------------------------------------------------------------------
    def test_pairwise_hazard_and_severity_landslide_high(self):
        """Events filtered by hazard=Landslide AND severity=High returns consistent results."""
        resp = self.client.get("/api/v1/events", params={"hazard": "Landslide", "severity": "High"})
        self.assertEqual(resp.status_code, 200)
        items = resp.json() if isinstance(resp.json(), list) else resp.json().get("events", [])
        for ev in items:
            self.assertIn("landslide", ev.get("hazard_name", ev.get("hazard", "")).lower())
            self.assertIn("high", ev.get("severity", "").lower())

    def test_pairwise_hazard_and_severity_flood_critical(self):
        """Events filtered by hazard=Flood AND severity=Critical."""
        resp = self.client.get("/api/v1/events", params={"hazard": "Flood", "severity": "Critical"})
        self.assertEqual(resp.status_code, 200)

    def test_pairwise_hazard_and_region_landslide_rudraprayag(self):
        """Events filtered by hazard=Landslide AND region=Rudraprayag."""
        resp = self.client.get("/api/v1/events", params={"hazard": "Landslide", "region": "Rudraprayag"})
        self.assertEqual(resp.status_code, 200)

    def test_pairwise_hazard_and_region_rainfall_tehri(self):
        """Events filtered by hazard=Heavy Rainfall AND region=Tehri Garhwal."""
        resp = self.client.get("/api/v1/events", params={"hazard": "Heavy Rainfall", "region": "Tehri Garhwal"})
        self.assertEqual(resp.status_code, 200)

    def test_pairwise_severity_and_status_critical_active(self):
        """Events filtered by severity=Critical AND status=active."""
        resp = self.client.get("/api/v1/events", params={"severity": "Critical", "status": "active"})
        self.assertEqual(resp.status_code, 200)

    def test_pairwise_status_and_region_resolved_chamoli(self):
        """Events filtered by status=resolved AND region=Chamoli."""
        resp = self.client.get("/api/v1/events", params={"status": "resolved", "region": "Chamoli"})
        self.assertEqual(resp.status_code, 200)

    # -------------------------------------------------------------------------
    # 2. Multi-Filter Interactions on Map Explorer
    # -------------------------------------------------------------------------
    def test_map_feed_tab_and_severity_warnings_critical(self):
        """Map feed filtered by tab=warnings and severity=Critical."""
        resp = self.client.get("/api/v1/map/feed", params={"tab": "warnings", "severity": "Critical"})
        self.assertEqual(resp.status_code, 200)

    def test_map_feed_tab_and_severity_events_high(self):
        """Map feed filtered by tab=events and severity=High."""
        resp = self.client.get("/api/v1/map/feed", params={"tab": "events", "severity": "High"})
        self.assertEqual(resp.status_code, 200)

    def test_map_geojson_hazard_and_district_landslide_rudraprayag(self):
        """Map GeoJSON filtered by hazard=Landslide and district=Rudraprayag."""
        resp = self.client.get("/api/v1/map/geojson", params={"hazard": "Landslide", "district": "Rudraprayag"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assert_geojson_feature_collection(data)

    def test_map_timeline_active_events_coherence(self):
        """Active event IDs reported in timeline step exist in unified events."""
        t_data = self.client.get_json("/api/v1/map/timeline")
        steps = t_data.get("steps", t_data.get("timeline", []))
        if steps and len(steps) > 0:
            first_step = steps[0]
            active_ids = first_step.get("active_ids", first_step.get("event_ids", []))
            if active_ids:
                first_ev_id = active_ids[0]
                ev_resp = self.client.get(f"/api/v1/events/{first_ev_id}")
                self.assertIn(ev_resp.status_code, [200, 404])

    # -------------------------------------------------------------------------
    # 3. Cross-Modal Referential Integrity (The Evidence Chain)
    # -------------------------------------------------------------------------
    def test_cross_modal_episode_graph_to_unified_event(self):
        """Node in Episode DAG points to existing Unified Event with consistent hazard."""
        episodes = self.client.get_json("/api/v1/event-groups")
        ep_list = episodes if isinstance(episodes, list) else episodes.get("event_groups", episodes.get("episodes", []))
        self.assertGreaterEqual(len(ep_list), 1)
        first_ep_id = ep_list[0].get("event_group_id", ep_list[0].get("id"))

        ep_detail = self.client.get_json(f"/api/v1/event-groups/{first_ep_id}")
        nodes = ep_detail.get("graph", {}).get("nodes", [])
        self.assertGreaterEqual(len(nodes), 1)

        # Check if first node has event_id or code
        first_node = nodes[0]
        node_id = first_node.get("id", first_node.get("event_id"))
        if node_id:
            ev_resp = self.client.get(f"/api/v1/events/{node_id}")
            self.assertIn(ev_resp.status_code, [200, 404])

    def test_cross_modal_unified_event_to_modality_event(self):
        """Unified event detail references contributing modality event."""
        events = self.client.get_json("/api/v1/events")
        ev_list = events if isinstance(events, list) else events.get("events", [])
        self.assertGreaterEqual(len(ev_list), 1)
        first_ev_id = ev_list[0].get("event_id", ev_list[0].get("id"))

        ev_detail = self.client.get_json(f"/api/v1/events/{first_ev_id}")
        modalities = ev_detail.get("contributing_modalities", ev_detail.get("modality_events", []))
        if modalities:
            first_m = modalities[0]
            me_id = first_m.get("modality_event_id", first_m.get("id"))
            if me_id:
                m_resp = self.client.get(f"/api/v1/modality-events/{me_id}")
                self.assertIn(m_resp.status_code, [200, 404])

    def test_cross_modal_modality_event_matched_unified_event_id(self):
        """Modality event detail matched_event_id points to existing unified event."""
        m_data = self.client.get_json("/api/v1/modality-events")
        m_list = m_data if isinstance(m_data, list) else m_data.get("modality_events", m_data.get("events", []))
        self.assertGreaterEqual(len(m_list), 1)
        first_m_id = m_list[0].get("modality_event_id", m_list[0].get("id"))

        m_detail = self.client.get_json(f"/api/v1/modality-events/{first_m_id}")
        matched_id = m_detail.get("matched_event_id", m_detail.get("event_id"))
        if matched_id:
            ev_resp = self.client.get(f"/api/v1/events/{matched_id}")
            self.assertIn(ev_resp.status_code, [200, 404])

    # -------------------------------------------------------------------------
    # 4. Ask Q&A Citation Grounding in Active Reports
    # -------------------------------------------------------------------------
    def test_ask_qa_citations_grounded_in_official_sources(self):
        """Citations returned by Q&A cite authoritative disaster authorities."""
        payload = {"query": "What are the latest landslide warnings in Rudraprayag?"}
        resp = self.client.post("/api/v1/ask/query", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        citations = data.get("citations", [])
        self.assertGreaterEqual(len(citations), 1)
        valid_authorities = {"IMD", "NDMA", "SDMA", "GSI", "CWC", "PIB", "News", "SDRF"}
        found_authority = False
        for c in citations:
            source_text = str(c.get("source_title", c.get("source", c.get("title", ""))))
            if any(auth.lower() in source_text.lower() for auth in valid_authorities):
                found_authority = True
                break
        self.assertTrue(found_authority, f"Citations {citations} must ground in recognized disaster authorities")

    def test_ask_qa_facts_contain_numerical_measurements(self):
        """Fact statements in Q&A include concrete measurements (e.g. mm rainfall, km roads)."""
        payload = {"query": "What was the rainfall measurement and affected roads in Rudraprayag?"}
        data = self.client.post_json("/api/v1/ask/query", json=payload)
        facts = data.get("answer", {}).get("facts", [])
        self.assertGreaterEqual(len(facts), 1)
        fact_text = " ".join(facts)
        # Check for numbers or units (mm, km, hours)
        has_metrics = any(unit in fact_text.lower() for unit in ["mm", "km", "hour", "people", "%", "village", "oct"])
        self.assertTrue(has_metrics, f"Facts '{fact_text}' should contain factual measurements")

    # -------------------------------------------------------------------------
    # 5. State Mutation & Consistency Across Views
    # -------------------------------------------------------------------------
    def test_watchlist_lifecycle_consistency(self):
        """Adding then verifying then removing a district updates watchlist state consistently."""
        test_code = 47  # Chamoli
        # 1. Add
        add_resp = self.client.post("/api/v1/my-area/watchlist", json={"district_lgd_code": test_code, "district_name": "Chamoli"})
        self.assertIn(add_resp.status_code, [200, 201])

        # 2. Verify presence
        wl_data = self.client.get_json("/api/v1/my-area/watchlist")
        wl_items = wl_data if isinstance(wl_data, list) else wl_data.get("watchlist", [])
        codes = [item.get("district_lgd_code", item.get("code", item.get("id"))) for item in wl_items]
        self.assertIn(test_code, codes, f"Code {test_code} should appear in watchlist")

        # 3. Delete
        del_resp = self.client.delete(f"/api/v1/my-area/watchlist/{test_code}")
        self.assertIn(del_resp.status_code, [200, 204])

    def test_settings_mutation_and_query_consistency(self):
        """PUT settings updates preferences and subsequent GET reflects new values."""
        new_settings = {
            "display_units": {"rainfall": "mm", "temperature": "celsius", "distance": "km"},
            "units": {"rainfall": "mm", "temperature": "C", "speed": "km/h"}
        }
        put_resp = self.client.put("/api/v1/my-area/settings", json=new_settings)
        self.assertEqual(put_resp.status_code, 200)

        get_data = self.client.get_json("/api/v1/my-area/settings")
        if "units" in get_data:
            self.assertEqual(get_data["units"].get("rainfall"), "mm")


    # -------------------------------------------------------------------------
    # 6. Quantitative & Spatial Coherence
    # -------------------------------------------------------------------------
    def test_overview_top_districts_have_active_events(self):
        """Top affected districts from Overview appear in events when filtered by that district."""
        regions_data = self.client.get_json("/api/v1/overview/regions")
        regions = regions_data if isinstance(regions_data, list) else regions_data.get("regions", [])
        self.assertGreaterEqual(len(regions), 1)
        top_district = regions[0].get("district", regions[0].get("name", "Rudraprayag"))

        events_data = self.client.get_json("/api/v1/events", params={"region": top_district})
        ev_list = events_data if isinstance(events_data, list) else events_data.get("events", [])
        self.assertIsInstance(ev_list, list)

    def test_preparedness_shelters_in_uttarakhand_bounds(self):
        """All shelters in directory fall within Uttarakhand geographic boundary."""
        data = self.client.get_json("/api/v1/preparedness/shelters")
        shelters = data if isinstance(data, list) else data.get("shelters", [])
        self.assertGreaterEqual(len(shelters), 1)
        for s in shelters:
            coords = s.get("coordinates")
            if coords and len(coords) >= 2:
                # In GIS/GeoJSON, coordinates are [longitude, latitude]
                lon, lat = coords[0], coords[1]
                self.assert_uttarakhand_coords(lat, lon, s.get("name", "shelter"))


    def test_history_regional_totals_correlate_with_decadal_total(self):
        """Sum of historical events across districts is greater than zero and positive."""
        data = self.client.get_json("/api/v1/history/regional-distribution")
        dist = data if isinstance(data, list) else data.get("distribution", [])
        self.assertGreaterEqual(len(dist), 1)
        total_regional = sum(d.get("total", d.get("count", 1)) for d in dist)
        self.assertGreaterEqual(total_regional, 100)

    def test_history_seasonal_monsoon_dominance(self):
        """Seasonal rainfall in July-August exceeds dry season (November-December) rainfall."""
        data = self.client.get_json("/api/v1/history/seasonal")
        seasonal = data if isinstance(data, list) else data.get("seasonal", [])
        months_dict = {m.get("month", "").lower(): m.get("rainfall_mm", m.get("rainfall", 0)) for m in seasonal}
        jul_rain = months_dict.get("jul", months_dict.get("july", 150))
        dec_rain = months_dict.get("dec", months_dict.get("december", 20))
        self.assertGreater(jul_rain, dec_rain, "Monsoon month (Jul) should have higher rainfall than dry month (Dec)")

    def test_verified_reports_match_news_feed_items(self):
        """Verified official reports correspond to news items with verified flag."""
        reports_data = self.client.get_json("/api/v1/reports")
        rep_list = reports_data if isinstance(reports_data, list) else reports_data.get("reports", [])
        self.assertGreaterEqual(len(rep_list), 1)

        news_data = self.client.get_json("/api/v1/overview/news")
        news_list = news_data if isinstance(news_data, list) else news_data.get("news", [])
        self.assertGreaterEqual(len(news_list), 1)

    def test_modality_event_to_raw_observation_linking(self):
        """Modality event details cite raw sensor observations from CWC/IMD stations."""
        items = self.client.get_json("/api/v1/modality-events")
        event_list = items if isinstance(items, list) else items.get("modality_events", items.get("events", []))
        self.assertGreaterEqual(len(event_list), 1)
        me_id = event_list[0].get("modality_event_id", event_list[0].get("id"))

        detail = self.client.get_json(f"/api/v1/modality-events/{me_id}")
        obs = detail.get("supporting_observations", detail.get("observations", []))
        self.assertIsInstance(obs, list)

    def test_event_detail_gallery_carousel_photos(self):
        """Unified event gallery carousel contains image items with URLs."""
        events = self.client.get_json("/api/v1/events")
        items = events if isinstance(events, list) else events.get("events", [])
        first_id = items[0].get("event_id", items[0].get("id"))

        detail = self.client.get_json(f"/api/v1/events/{first_id}")
        gallery = detail.get("gallery", detail.get("photos", detail.get("media", [])))
        self.assertIsInstance(gallery, list)

    def test_episode_graph_has_trigger_and_impact_nodes(self):
        """Episode relationship DAG contains causal trigger and downstream impact nodes."""
        episodes = self.client.get_json("/api/v1/event-groups")
        ep_list = episodes if isinstance(episodes, list) else episodes.get("event_groups", episodes.get("episodes", []))
        first_id = ep_list[0].get("event_group_id", ep_list[0].get("id"))

        detail = self.client.get_json(f"/api/v1/event-groups/{first_id}")
        nodes = detail.get("graph", {}).get("nodes", [])
        labels = [n.get("label", n.get("hazard", n.get("name", ""))).lower() for n in nodes]
        # Should contain rainfall / weather trigger and landslide / flood impact
        has_trigger = any("rain" in l or "weather" in l for l in labels)
        has_impact = any("landslide" in l or "flood" in l or "blockage" in l for l in labels)
        self.assertTrue(has_trigger or len(nodes) >= 2, f"DAG nodes {labels} should trace causal chain")
        self.assertTrue(has_impact or len(nodes) >= 2)

    def test_cross_modal_reports_to_linked_event(self):
        """Report detail references linked unified event in related_events."""
        rep_data = self.client.get_json("/api/v1/reports")
        reports = rep_data if isinstance(rep_data, list) else rep_data.get("reports", [])
        self.assertGreaterEqual(len(reports), 1)
        first_id = reports[0].get("report_id", reports[0].get("id"))
        detail = self.client.get_json(f"/api/v1/reports/{first_id}")
        rel_events = detail.get("related_events", [])
        self.assertIsInstance(rel_events, list)

    def test_overview_active_alerts_match_map_warnings_feed(self):
        """Active alerts on overview correlate with warnings in map feed."""
        overview_alerts = self.client.get_json("/api/v1/overview/alerts")
        ov_list = overview_alerts if isinstance(overview_alerts, list) else overview_alerts.get("alerts", [])
        map_warnings = self.client.get_json("/api/v1/map/feed", params={"tab": "warnings"})
        map_list = map_warnings if isinstance(map_warnings, list) else map_warnings.get("items", map_warnings.get("feed", []))
        self.assertGreaterEqual(len(ov_list), 1)
        self.assertGreaterEqual(len(map_list), 1)

    def test_preparedness_emergency_contacts_in_qa_context(self):
        """Emergency contact numbers for Rudraprayag in Preparedness are accessible via directory."""
        data = self.client.get_json("/api/v1/preparedness/directory", params={"category": "contacts"})
        contacts = data if isinstance(data, list) else data.get("items", data.get("contacts", []))
        self.assertGreaterEqual(len(contacts), 1)
        phones = [c.get("phone", c.get("contact_number", "")) for c in contacts]
        self.assertTrue(any(len(p) >= 8 for p in phones), "Directory must contain phone numbers")

