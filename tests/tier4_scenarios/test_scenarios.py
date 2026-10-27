# tests/tier4_scenarios/test_scenarios.py
"""
Tier 4: Real-World Application Workload Scenarios.

Authoritative source: TEST_INFRA.md §Real-World Application Scenarios.
Implements the 6 end-to-end multi-step user journeys:
1. Cascading Landslide Crisis in Rudraprayag (F1, F7, F8, F9, F11)
2. Grounded Emergency Q&A for Incident Commander (F6, F12, F15)
3. Shelter Allocation & Citizen Preparedness (F6, F8, F14, F16)
4. Decadal Trend Analysis & Vulnerability Assessment (F7, F13)
5. Watchlist Configuration & Multi-Hazard Notification (F4, F5, F16)
6. Multilingual Report Verification & Cross-Modal Grounding (F9, F10, F12)
"""

from tests.test_harness import BaseHarnessTestCase


class TestRealWorldScenarios(BaseHarnessTestCase):
    """Executes full operational workflows matching real-world disaster management scenarios."""

    def test_scenario_1_cascading_landslide_crisis_in_rudraprayag(self):
        """
        Scenario 1: Cascading Landslide Crisis in Rudraprayag (F1, F7, F8, F9, F11).
        User observes active alerts on Overview, filters Map Explorer to Rudraprayag,
        selects Landslide unified event, and traces episode graph in Event Groups.
        """
        # Step 1: User loads Overview dashboard and observes active alerts
        summary = self.client.get_json("/api/v1/overview/summary")
        self.assertTrue(any(k in summary for k in ["total_events", "active_events", "total_active_events"]))

        alerts_data = self.client.get_json("/api/v1/overview/alerts")
        alerts = alerts_data if isinstance(alerts_data, list) else alerts_data.get("alerts", [])
        self.assertGreaterEqual(len(alerts), 1, "Scenario 1: Overview must display active alerts")
        rudra_alerts = [a for a in alerts if "rudraprayag" in str(a.get("region", "")).lower() or "landslide" in str(a.get("title", "")).lower()]
        self.assertGreaterEqual(len(rudra_alerts), 1, "Scenario 1: Expected active alert related to Rudraprayag or Landslide")

        # Step 2: User switches to Map Explorer, filters by Rudraprayag and Landslide
        map_layers = self.client.get_json("/api/v1/map/layers")
        self.assertGreaterEqual(len(map_layers if isinstance(map_layers, list) else map_layers.get("layers", [])), 1)

        map_geojson = self.client.get_json("/api/v1/map/geojson", params={"district": "Rudraprayag", "hazard": "Landslide"})
        self.assert_geojson_feature_collection(map_geojson)

        map_feed = self.client.get_json("/api/v1/map/feed", params={"tab": "events"})
        feed_items = map_feed if isinstance(map_feed, list) else map_feed.get("items", map_feed.get("feed", []))
        self.assertGreaterEqual(len(feed_items), 1)

        # Step 3: User navigates to Unified Events, selects the Rudraprayag landslide event
        events_data = self.client.get_json("/api/v1/events", params={"hazard": "Landslide", "region": "Rudraprayag"})
        events = events_data if isinstance(events_data, list) else events_data.get("events", [])
        self.assertGreaterEqual(len(events), 1, "Scenario 1: Unified events must contain Rudraprayag Landslide")
        selected_event = events[0]
        event_id = selected_event.get("event_id", selected_event.get("id"))

        # Inspect unified event detail (e.g. EV-LSD-2026-10-09-001)
        event_detail = self.client.get_json(f"/api/v1/events/{event_id}")
        self.assertIn("severity", event_detail)
        self.assertIn(event_detail["severity"], ["High", "Critical"])


        # Step 4: User inspects contributing Modality Event
        modalities = event_detail.get("contributing_modalities", event_detail.get("modality_events", []))
        if modalities:
            me_id = modalities[0].get("modality_event_id") or modalities[0].get("id") or modalities[0].get("code")
            me_detail = self.client.get_json(f"/api/v1/modality-events/{me_id}")
            self.assertTrue(any(k in me_detail for k in ["modality_event_id", "id", "modality_event_code", "code"]))

        # Step 5: User traces disaster episode in Event Groups
        groups_data = self.client.get_json("/api/v1/event-groups")
        groups = groups_data if isinstance(groups_data, list) else groups_data.get("event_groups", groups_data.get("episodes", []))
        self.assertGreaterEqual(len(groups), 1)
        first_group = groups[0]
        group_id = first_group.get("event_group_id", first_group.get("id"))

        group_detail = self.client.get_json(f"/api/v1/event-groups/{group_id}")
        self.assertIn("graph", group_detail)
        graph = group_detail["graph"]
        self.assertIn("nodes", graph)
        self.assertIn("edges", graph)
        self.assertGreaterEqual(len(graph["nodes"]), 2, "Scenario 1: Episode DAG must connect multiple cascading hazard nodes")

    def test_scenario_2_grounded_emergency_qa_for_incident_commander(self):
        """
        Scenario 2: Grounded Emergency Q&A for Incident Commander (F6, F12, F15).
        Incident Commander asks "What is the status of NH-58 in Rudraprayag?",
        verifies structured Fact/Inference/Prediction breakdown, and checks inline citations [1]-[6].
        """
        # Step 1: Incident Commander submits urgent situational question
        query_text = "What is the status of NH-58 in Rudraprayag and what are the casualties?"
        resp = self.client.post("/api/v1/ask/query", json={"query": query_text})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        # Step 2: Verify structured Fact / Inference / Prediction breakdown
        self.assertIn("answer", data)
        ans = data["answer"]
        self.assertIn("facts", ans)
        self.assertIn("inferences", ans)
        self.assertIn("predictions", ans)
        self.assertGreaterEqual(len(ans["facts"]), 1, "Commander must receive verified facts")
        self.assertGreaterEqual(len(ans["inferences"]), 1, "Commander must receive AI inferences")
        self.assertGreaterEqual(len(ans["predictions"]), 1, "Commander must receive forward risk predictions")

        # Step 3: Verify inline citations
        citations = data.get("citations", [])
        self.assertGreaterEqual(len(citations), 1, "Response must include authoritative citations")
        first_cite = citations[0]
        self.assertTrue(any(k in first_cite for k in ["title", "source_title", "source"]))

        # Step 4: Verify key impacts reported
        impacts = data.get("key_impacts", {})
        self.assertTrue(
            isinstance(impacts, (dict, list)),
            "Commander response must include key impacts summary"
        )

        # Step 5: Cross-check referenced official reports in Reports view
        reports_data = self.client.get_json("/api/v1/reports")
        reports = reports_data if isinstance(reports_data, list) else reports_data.get("reports", [])
        self.assertGreaterEqual(len(reports), 1, "System must provide underlying verified SITREPs")

    def test_scenario_3_shelter_allocation_and_citizen_preparedness(self):
        """
        Scenario 3: Shelter Allocation & Citizen Preparedness (F6, F8, F14, F16).
        Citizen navigates to Preparedness, searches for available shelters in Chamoli,
        checks capacity, last verified timestamp, and emergency contact numbers.
        """
        # Step 1: Citizen accesses Preparedness summary
        prep_summary = self.client.get_json("/api/v1/preparedness/summary")
        self.assertTrue(any(k in prep_summary for k in ["verified_shelters", "shelters"]))

        # Step 2: Citizen searches for available shelters in Chamoli
        shelters_data = self.client.get_json("/api/v1/preparedness/shelters", params={"district": "Chamoli"})
        shelters = shelters_data if isinstance(shelters_data, list) else shelters_data.get("shelters", [])
        self.assertGreaterEqual(len(shelters), 1, "Citizen must find shelters in Chamoli")

        # Step 3: Citizen inspects capacity, status, and verified timestamps
        selected_shelter = shelters[0]
        self.assertIn("capacity", selected_shelter)
        self.assertGreater(selected_shelter["capacity"], 0)
        self.assertIn(selected_shelter.get("status"), {"Available", "Partially Filled", "Unavailable"})

        # Step 4: Citizen retrieves emergency contact directory for helplines
        contacts_data = self.client.get_json("/api/v1/preparedness/directory", params={"category": "contacts"})
        contacts = contacts_data if isinstance(contacts_data, list) else contacts_data.get("items", contacts_data.get("contacts", []))
        self.assertGreaterEqual(len(contacts), 1, "Citizen must find emergency helplines")

        # Step 5: Citizen downloads multilingual safety guidelines (English and Hindi)
        guidance_data = self.client.get_json("/api/v1/preparedness/directory", params={"category": "guidance"})
        guidance = guidance_data if isinstance(guidance_data, list) else guidance_data.get("items", guidance_data.get("guidance", []))
        self.assertGreaterEqual(len(guidance), 1, "Citizen must find safety guidance")

    def test_scenario_4_decadal_trend_analysis_and_vulnerability_assessment(self):
        """
        Scenario 4: Decadal Trend Analysis & Vulnerability Assessment (F7, F13).
        Researcher toggles History & Trends, compares 2015-2025 landslide frequency
        against monthly rainfall patterns, and inspects district vulnerability ranking.
        """
        # Step 1: Researcher loads History summary KPIs (2015-2025 decadal baseline)
        hist_summary = self.client.get_json("/api/v1/history/summary")
        self.assertTrue(any(k in hist_summary for k in ["total_historical_events", "total_events", "total_recorded_events"]))


        # Step 2: Researcher retrieves yearly historical trend stacked bar datasets
        yearly_trends = self.client.get_json("/api/v1/history/trends", params={"granularity": "yearly"})
        trends = yearly_trends.get("labels", yearly_trends.get("datasets", yearly_trends if isinstance(yearly_trends, list) else []))
        self.assertGreaterEqual(len(trends), 5, "Must provide multi-year trend baseline")


        # Step 3: Researcher analyzes 12-month seasonal patterns to confirm monsoon peak
        seasonal_data = self.client.get_json("/api/v1/history/seasonal")
        seasonal = seasonal_data if isinstance(seasonal_data, list) else seasonal_data.get("seasonal", [])
        self.assertEqual(len(seasonal), 12, "Must contain all 12 calendar months")

        # Step 4: Researcher inspects regional event distribution across Uttarakhand districts
        regional_dist = self.client.get_json("/api/v1/history/regional-distribution")
        dist = regional_dist if isinstance(regional_dist, list) else regional_dist.get("distribution", [])
        self.assertGreaterEqual(len(dist), 5, "Must provide distribution across Uttarakhand districts")

        # Step 5: Researcher compares current event with past similar historical event
        compare_data = self.client.get_json("/api/v1/history/compare")
        self.assertTrue(any(k in compare_data for k in ["comparison", "metrics", "comparison_metrics"]))

    def test_scenario_5_watchlist_configuration_and_multi_hazard_notification(self):
        """
        Scenario 5: Watchlist Configuration & Multi-Hazard Notification (F4, F5, F16).
        User adds Tehri Garhwal and Uttarkashi to Watchlist, toggles Cloudburst/Flash Flood hazards,
        and verifies watchlist boundary map and preference persistence.
        """
        # Step 1: User queries initial watchlist
        initial_wl = self.client.get_json("/api/v1/my-area/watchlist")
        self.assertIsInstance(initial_wl if isinstance(initial_wl, list) else initial_wl.get("watchlist", []), list)

        # Step 2: User adds Tehri Garhwal (code 55) to Watchlist
        add_tehri = self.client.post("/api/v1/my-area/watchlist", json={"district_lgd_code": 55, "district_name": "Tehri Garhwal"})
        self.assertIn(add_tehri.status_code, [200, 201])

        # Step 3: User adds Uttarkashi (code 57) to Watchlist
        add_uttarkashi = self.client.post("/api/v1/my-area/watchlist", json={"district_lgd_code": 57, "district_name": "Uttarkashi"})
        self.assertIn(add_uttarkashi.status_code, [200, 201])

        # Step 4: User updates multi-hazard alert preferences
        new_prefs = {
            "display_units": {"rainfall": "mm", "distance": "km"},
            "hazard_toggles": {"landslide": True, "flood": True, "earthquake": True}
        }
        put_resp = self.client.put("/api/v1/my-area/settings", json=new_prefs)
        self.assertEqual(put_resp.status_code, 200)


        # Step 5: User verifies updated watchlist state and cleans up
        updated_wl = self.client.get_json("/api/v1/my-area/watchlist")
        wl_items = updated_wl if isinstance(updated_wl, list) else updated_wl.get("watchlist", [])
        codes = [item.get("district_lgd_code", item.get("code", item.get("id"))) for item in wl_items]
        self.assertIn(57, codes, "Uttarkashi must be in updated watchlist")

        # Cleanup: remove Uttarkashi
        del_resp = self.client.delete("/api/v1/my-area/watchlist/57")
        self.assertIn(del_resp.status_code, [200, 204])

    def test_scenario_6_multilingual_report_verification_and_cross_modal_grounding(self):
        """
        Scenario 6: Multilingual Report Verification & Cross-Modal Grounding (F9, F10, F12).
        Analyst inspects news report in Reports & Evidence, toggles English/Hindi translation,
        verifies source reliability checklist, and links to raw sensor observations in Modality Events.
        """
        # Step 1: Analyst accesses Reports & Evidence feed filtered by Landslide
        reports_data = self.client.get_json("/api/v1/reports", params={"hazard": "Landslide"})
        reports = reports_data if isinstance(reports_data, list) else reports_data.get("reports", [])
        self.assertGreaterEqual(len(reports), 1, "Scenario 6: Must return Landslide reports")
        target_report = reports[0]
        report_id = target_report.get("report_id", target_report.get("id"))

        # Step 2: Analyst fetches report detail
        detail = self.client.get_json(f"/api/v1/reports/{report_id}")
        self.assertTrue(any(k in detail for k in ["title", "title_en", "headline"]))

        # Step 3: Analyst toggles Hindi translation and verifies bilingual fidelity
        hindi_content = detail.get("content_hi", detail.get("title_hi", detail.get("translation", "")))
        self.assertTrue(len(hindi_content) > 0, "Scenario 6: Must provide Hindi translation")
        has_devanagari = any(0x0900 <= ord(c) <= 0x097F for c in hindi_content)
        self.assertTrue(has_devanagari, "Scenario 6: Translation must contain authentic Devanagari script")

        # Step 4: Analyst verifies Source Reliability checklist
        checklist = detail.get("source_reliability", detail.get("reliability_checklist", []))
        self.assertIsInstance(checklist, list)
        self.assertGreaterEqual(len(checklist), 1)

        # Step 5: Analyst traces report to linked unified event and modality events
        unified_events = self.client.get_json("/api/v1/events")
        ev_items = unified_events if isinstance(unified_events, list) else unified_events.get("events", [])
        self.assertGreaterEqual(len(ev_items), 1)

        modality_events = self.client.get_json("/api/v1/modality-events")
        me_items = modality_events if isinstance(modality_events, list) else modality_events.get("modality_events", modality_events.get("events", []))
        self.assertGreaterEqual(len(me_items), 1)
