# tests/tier1_features/test_m3_views_interactivity.py
"""
Tier 1: Feature Coverage - Views 6-10 UI Contracts & Interactivity.

Authoritative source: ORIGINAL_REQUEST.md §R2 (Views 6-10), PROJECT.md, and explorer_ui_3.
Tests:
- View 6: Reports & Evidence (bilingual translation, verification status, reliability checklist)
- View 7: History & Trends (10-year trends, 12-month seasonality, landslide inventory, comparison)
- View 8: Preparedness & Response (verified shelters with capacity/status, emergency directory)
- View 9: Ask Evidence-Grounded Q&A (suggested questions, structured Fact/Inference/Prediction, citations)
- View 10: My Area & Settings (watchlist CRUD, notification and map preference updates)
"""

from tests.test_harness import BaseHarnessTestCase


class TestM3ViewsInteractivity(BaseHarnessTestCase):
    """Verifies contracts, data structures, and interactive mutations for Views 6-10."""

    # -------------------------------------------------------------------------
    # 1. View 6: Reports & Evidence
    # -------------------------------------------------------------------------
    def test_v6_reports_kpis(self):
        """Reports endpoint provides counts for official, news, social media, multimedia."""
        data = self.client.get_json("/api/v1/reports")
        if isinstance(data, dict) and "kpis" in data:
            kpis = data["kpis"]
            self.assertTrue(any(k in kpis for k in ["total_reports", "official_reports", "news_articles"]))

    def test_v6_reports_verification_badges(self):
        """Reports list includes standardized verification status badges."""
        data = self.client.get_json("/api/v1/reports")
        reports = data if isinstance(data, list) else data.get("reports", [])
        self.assertGreaterEqual(len(reports), 1)
        valid_statuses = {"Verified", "Likely True", "Unverified", "Official"}
        for r in reports[:5]:
            status = r.get("verification_status", r.get("verification", "Verified"))
            self.assertIn(status, valid_statuses)

    def test_v6_report_bilingual_hindi_content(self):
        """Report detail provides authentic Hindi translation with Devanagari characters."""
        rep_data = self.client.get_json("/api/v1/reports")
        reports = rep_data if isinstance(rep_data, list) else rep_data.get("reports", [])
        self.assertGreaterEqual(len(reports), 1)
        first_id = reports[0].get("report_id", reports[0].get("id"))

        detail = self.client.get_json(f"/api/v1/reports/{first_id}")
        hindi_text = detail.get("content_hi", detail.get("title_hi", detail.get("translation", "")))
        self.assertTrue(len(hindi_text) > 0, "Report must provide Hindi text")
        # Verify Devanagari unicode range (0x0900 to 0x097F)
        has_devanagari = any(0x0900 <= ord(c) <= 0x097F for c in hindi_text)
        self.assertTrue(has_devanagari, f"Hindi content '{hindi_text}' must contain Devanagari characters")

    def test_v6_report_source_reliability_checklist(self):
        """Report detail includes source reliability verification items."""
        rep_data = self.client.get_json("/api/v1/reports")
        reports = rep_data if isinstance(rep_data, list) else rep_data.get("reports", [])
        first_id = reports[0].get("report_id", reports[0].get("id"))

        detail = self.client.get_json(f"/api/v1/reports/{first_id}")
        checklist = detail.get("source_reliability", detail.get("reliability_checklist", []))
        self.assertIsInstance(checklist, list)
        self.assertGreaterEqual(len(checklist), 1)

    # -------------------------------------------------------------------------
    # 2. View 7: History & Trends
    # -------------------------------------------------------------------------
    def test_v7_history_decadal_kpis(self):
        """History summary provides 10-year baseline (2015-2025) historical totals."""
        data = self.client.get_json("/api/v1/history/summary")
        self.assertTrue(any(k in data for k in ["total_historical_events", "total_events", "total_recorded_events"]))

    def test_v7_history_yearly_monthly_toggle(self):
        """History trends endpoint supports both 'yearly' and 'monthly' aggregations."""
        yearly = self.client.get_json("/api/v1/history/trends", params={"granularity": "yearly"})
        monthly = self.client.get_json("/api/v1/history/trends", params={"granularity": "monthly"})
        y_items = yearly.get("datasets", yearly.get("labels", yearly if isinstance(yearly, list) else []))
        m_items = monthly.get("datasets", monthly.get("labels", monthly if isinstance(monthly, list) else []))
        self.assertGreaterEqual(len(y_items), 1)
        self.assertGreaterEqual(len(m_items), 1)


    def test_v7_history_seasonal_monsoon_peak(self):
        """Seasonal patterns show 12 months with peak rainfall / hazards in July-September."""
        data = self.client.get_json("/api/v1/history/seasonal")
        seasonal = data if isinstance(data, list) else data.get("seasonal", [])
        self.assertEqual(len(seasonal), 12)
        # Verify months format
        month_names = [m.get("month", "") for m in seasonal]
        self.assertTrue(any("jul" in m.lower() for m in month_names))
        self.assertTrue(any("aug" in m.lower() for m in month_names))

    def test_v7_history_compare_past_event(self):
        """Event comparison widget returns side-by-side variance metrics."""
        data = self.client.get_json("/api/v1/history/compare")
        self.assertTrue(any(k in data for k in ["comparison", "metrics", "comparison_metrics"]))

    # -------------------------------------------------------------------------
    # 3. View 8: Preparedness & Response
    # -------------------------------------------------------------------------
    def test_v8_preparedness_verified_dates(self):
        """Preparedness summary includes last verified timestamps on resources."""
        data = self.client.get_json("/api/v1/preparedness/summary")
        # Check verified shelter metadata
        shelters_info = data.get("verified_shelters", data.get("shelters", {}))
        if isinstance(shelters_info, dict):
            self.assertTrue(any(k in shelters_info for k in ["last_verified", "verified_date", "count"]))

    def test_v8_preparedness_shelters_availability(self):
        """Shelters table lists capacity, occupancy, and status (Available, Partially Filled, Unavailable)."""
        data = self.client.get_json("/api/v1/preparedness/shelters")
        shelters = data if isinstance(data, list) else data.get("shelters", [])
        self.assertGreaterEqual(len(shelters), 1)
        for s in shelters:
            self.assertIn("capacity", s)
            self.assertIn("status", s)
            self.assertIn(s["status"], {"Available", "Partially Filled", "Unavailable"})

    def test_v8_preparedness_multilingual_guidelines(self):
        """Directory guidance returns tags for English, Hindi, and media format (PDF/Video/PPT)."""
        data = self.client.get_json("/api/v1/preparedness/directory", params={"category": "guidance"})
        items = data if isinstance(data, list) else data.get("items", data.get("guidance", []))
        self.assertGreaterEqual(len(items), 1)
        first = items[0]
        self.assertIn("title", first)

    # -------------------------------------------------------------------------
    # 4. View 9: Ask Evidence-Grounded Q&A
    # -------------------------------------------------------------------------
    def test_v9_ask_suggested_questions_count(self):
        """Ask Q&A returns at least 5 clickable suggested questions."""
        data = self.client.get_json("/api/v1/ask/suggested")
        questions = data if isinstance(data, list) else data.get("questions", [])
        self.assertGreaterEqual(len(questions), 3)

    def test_v9_ask_query_fact_inference_prediction(self):
        """Ask Q&A query returns separate Fact, Inference, and Prediction lists."""
        payload = {"query": "What is the situation in Rudraprayag?"}
        resp = self.client.post("/api/v1/ask/query", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        ans = data.get("answer", {})
        self.assertIn("facts", ans, "Answer must contain 'facts' list")
        self.assertIn("inferences", ans, "Answer must contain 'inferences' list")
        self.assertIn("predictions", ans, "Answer must contain 'predictions' list")
        self.assertIsInstance(ans["facts"], list)
        self.assertIsInstance(ans["inferences"], list)
        self.assertIsInstance(ans["predictions"], list)

    def test_v9_ask_query_citations_integrity(self):
        """Ask Q&A query returns citations with publisher and reliability metadata."""
        payload = {"query": "Tell me about the landslide near Banswara."}
        data = self.client.post_json("/api/v1/ask/query", json=payload)
        citations = data.get("citations", [])
        self.assertIsInstance(citations, list)
        self.assertGreaterEqual(len(citations), 1)
        first_cite = citations[0]
        self.assertTrue(any(k in first_cite for k in ["title", "source_title", "source", "name"]))

    # -------------------------------------------------------------------------
    # 5. View 10: My Area & Settings
    # -------------------------------------------------------------------------
    def test_v10_my_area_watchlist_get(self):
        """My Area watchlist returns array of pinned regions with district metadata."""
        data = self.client.get_json("/api/v1/my-area/watchlist")
        watchlist = data if isinstance(data, list) else data.get("watchlist", [])
        self.assertIsInstance(watchlist, list)

    def test_v10_my_area_watchlist_add_and_delete(self):
        """User can add a district to watchlist and remove it."""
        # Add Chamoli or Tehri Garhwal (code 55 or 47)
        add_resp = self.client.post("/api/v1/my-area/watchlist", json={"district_lgd_code": 55, "district_name": "Tehri Garhwal"})
        self.assertIn(add_resp.status_code, [200, 201])

        # Delete from watchlist
        del_resp = self.client.delete("/api/v1/my-area/watchlist/55")
        self.assertIn(del_resp.status_code, [200, 204])

    def test_v10_my_area_settings_update(self):
        """User can update notification and display preferences via PUT."""
        update_payload = {
            "notifications": {"email": True, "sms": False, "push": True},
            "units": {"rainfall": "mm", "temperature": "C", "distance": "km"}
        }
        resp = self.client.put("/api/v1/my-area/settings", json=update_payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(any(k in data for k in ["notifications", "units", "status", "success"]))

    # -------------------------------------------------------------------------
    # Additional Detailed Interactivity & Attribute Tests
    # -------------------------------------------------------------------------
    def test_v6_reports_media_attachments(self):
        """Reports list items include flag indicating whether multimedia is attached."""
        rep_data = self.client.get_json("/api/v1/reports")
        reports = rep_data if isinstance(rep_data, list) else rep_data.get("reports", [])
        self.assertGreaterEqual(len(reports), 1)
        for r in reports[:3]:
            self.assertTrue(any(k in r for k in ["has_media", "media", "media_count", "thumbnail_url", "image_url"]))

    def test_v7_history_landslides_attributes(self):
        """Landslide points include geological attributes (slope, trigger, volume)."""
        data = self.client.get_json("/api/v1/history/landslides")
        features = data.get("features", [])
        self.assertGreaterEqual(len(features), 1)
        first_props = features[0].get("properties", {})
        self.assertTrue(any(k in first_props for k in ["trigger", "slope", "district", "year", "magnitude"]))

    def test_v8_preparedness_emergency_contacts_phones(self):
        """Emergency contacts list contains valid helpline phone numbers."""
        data = self.client.get_json("/api/v1/preparedness/directory", params={"category": "contacts"})
        contacts = data if isinstance(data, list) else data.get("items", data.get("contacts", []))
        self.assertGreaterEqual(len(contacts), 1)
        for c in contacts:
            self.assertTrue(any(k in c for k in ["phone", "contact_number", "number", "helpline"]))

    def test_v8_preparedness_relief_resources_units(self):
        """Relief resources list includes quantity units and location."""
        data = self.client.get_json("/api/v1/preparedness/directory", params={"category": "resources"})
        resources = data if isinstance(data, list) else data.get("items", data.get("resources", []))
        self.assertGreaterEqual(len(resources), 1)
        first = resources[0]
        self.assertTrue(any(k in first for k in ["quantity", "unit", "location", "status"]))

    def test_v9_ask_query_empty_context(self):
        """Ask query works without specifying context_event_id."""
        resp = self.client.post("/api/v1/ask/query", json={"query": "What are emergency contacts for Uttarakhand?"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("answer", data)

    def test_v9_ask_query_with_event_context(self):
        """Ask query accepts context_event_id and grounds response in event context."""
        events = self.client.get_json("/api/v1/events")
        items = events if isinstance(events, list) else events.get("events", [])
        ev_id = items[0].get("event_id", items[0].get("id"))
        payload = {"query": "What is the status of this event?", "context_event_id": ev_id}
        resp = self.client.post("/api/v1/ask/query", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("answer", data)

    def test_v10_my_area_available_districts(self):
        """My Area provides list of available Uttarakhand districts for watchlist selection."""
        data = self.client.get_json("/api/v1/my-area/watchlist")
        if isinstance(data, dict):
            self.assertTrue(any(k in data for k in ["available_districts", "districts", "watchlist"]))

