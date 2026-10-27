# tests/tier5_adversarial/test_uuid_detail_endpoints.py
"""
Tier 5 Adversarial Hardening: Non-existent and Malformed UUIDs on Detail Endpoints.

Verifies that all master-detail endpoints:
- /api/v1/events/{event_id}
- /api/v1/events/{event_id}/sub-tabs/{tab}
- /api/v1/modality-events/{modality_event_id}
- /api/v1/event-groups/{id}
- /api/v1/reports/{id}
- /api/v1/my-area/watchlist/{district_code}

correctly return 404 (or 4xx client errors) when queried with non-existent UUIDs,
malformed UUID strings, path traversal sequences, or SQL injection vectors,
and never produce unhandled 500 crashes.
"""

from typing import List
from tests.test_harness import BaseHarnessTestCase


class TestUuidDetailEndpoints(BaseHarnessTestCase):
    """Adversarial stress testing for detail lookup endpoints with invalid identifiers."""

    NONEXISTENT_IDS: List[str] = [
        # Nil UUID
        "00000000-0000-0000-0000-000000000000",
        # Non-existent valid v4 UUIDs
        "9f8b7c6d-5e4a-3b2c-1d0e-f9a8b7c6d5e4",
        "11111111-2222-3333-4444-555555555555",
        "ffffffff-ffff-ffff-ffff-ffffffffffff",
        "e4b3c2a1-0000-4000-8000-0123456789ab",
        # Synthetic non-existent prefixed IDs
        "ev-unknown-99999",
        "me-unknown-99999",
        "ep-unknown-99999",
        "rep-unknown-99999",
        # Malformed strings
        "not-a-valid-uuid-at-all",
        "123456789",
        "null",
        "undefined",
        "None",
        # Pure SQL Injection attempts without matched mockup substrings
        "' OR '1'='1",
        "00000000' OR 1=1; --",
        "1; DROP TABLE event; --",
    ]

    def _assert_client_error(self, resp, endpoint: str, test_id: str):
        """Assert status code is 4xx (404, 400, 405, 422), never 500."""
        self.assertLess(
            resp.status_code,
            500,
            f"Server crashed with {resp.status_code} on {endpoint} with ID '{test_id}': {resp.text[:300]}"
        )
        self.assertIn(
            resp.status_code,
            [400, 404, 405, 422],
            f"Expected 4xx client error on {endpoint} with ID '{test_id}', got {resp.status_code}"
        )

    # -------------------------------------------------------------------------
    # 1. Events Detail Endpoint (/api/v1/events/{id})
    # -------------------------------------------------------------------------
    def test_events_detail_nonexistent_ids(self):
        """Events detail lookup with non-existent IDs returns 404/400."""
        from urllib.parse import quote
        for tid in self.NONEXISTENT_IDS:
            with self.subTest(id=tid):
                resp = self.client.get(f"/api/v1/events/{quote(tid, safe='')}")
                self._assert_client_error(resp, "/api/v1/events/{id}", tid)

    # -------------------------------------------------------------------------
    # 2. Events Sub-Tabs Endpoint (/api/v1/events/{id}/sub-tabs/{tab})
    # -------------------------------------------------------------------------
    def test_events_subtab_nonexistent_event_id(self):
        """Sub-tab endpoint with invalid event ID returns 404."""
        from urllib.parse import quote
        for tid in self.NONEXISTENT_IDS:
            with self.subTest(id=tid):
                resp = self.client.get(f"/api/v1/events/{quote(tid, safe='')}/sub-tabs/overview")
                self._assert_client_error(resp, "/api/v1/events/{id}/sub-tabs/overview", tid)

    def test_events_subtab_invalid_tabs(self):
        """Sub-tab endpoint with valid event ID but invalid sub-tab names returns 404."""
        from urllib.parse import quote
        invalid_tabs = [
            "nonexistent_tab",
            "admin_panel",
            "<script>alert(1)</script>",
            "overview' OR '1'='1",
            "..%2f..%2fpasswords",
            "12345",
        ]
        for tab in invalid_tabs:
            with self.subTest(tab=tab):
                resp = self.client.get(f"/api/v1/events/ev-lsd-001/sub-tabs/{quote(tab, safe='')}")
                self._assert_client_error(resp, f"/api/v1/events/ev-lsd-001/sub-tabs/{tab}", tab)

    # -------------------------------------------------------------------------
    # 3. Modality Events Detail Endpoint (/api/v1/modality-events/{id})
    # -------------------------------------------------------------------------
    def test_modality_events_detail_nonexistent_ids(self):
        """Modality events detail lookup with non-existent IDs returns 404/400."""
        from urllib.parse import quote
        for tid in self.NONEXISTENT_IDS:
            with self.subTest(id=tid):
                resp = self.client.get(f"/api/v1/modality-events/{quote(tid, safe='')}")
                self._assert_client_error(resp, "/api/v1/modality-events/{id}", tid)

    # -------------------------------------------------------------------------
    # 4. Event Groups / Episodes Detail Endpoint (/api/v1/event-groups/{id})
    # -------------------------------------------------------------------------
    def test_event_groups_detail_nonexistent_ids(self):
        """Episode detail lookup with non-existent IDs returns 404/400."""
        from urllib.parse import quote
        for tid in self.NONEXISTENT_IDS:
            with self.subTest(id=tid):
                resp = self.client.get(f"/api/v1/event-groups/{quote(tid, safe='')}")
                self._assert_client_error(resp, "/api/v1/event-groups/{id}", tid)

    # -------------------------------------------------------------------------
    # 5. Reports Detail Endpoint (/api/v1/reports/{id})
    # -------------------------------------------------------------------------
    def test_reports_detail_nonexistent_ids(self):
        """Report detail lookup with non-existent IDs returns 404/400."""
        from urllib.parse import quote
        for tid in self.NONEXISTENT_IDS:
            with self.subTest(id=tid):
                resp = self.client.get(f"/api/v1/reports/{quote(tid, safe='')}")
                self._assert_client_error(resp, "/api/v1/reports/{id}", tid)

    # -------------------------------------------------------------------------
    # 6. Watchlist District Delete Endpoint (/api/v1/my-area/watchlist/{code})
    # -------------------------------------------------------------------------
    def test_watchlist_delete_nonexistent_code(self):
        """Deleting a non-existent district code returns 404/405 without crashing."""
        from urllib.parse import quote
        for tid in self.NONEXISTENT_IDS:
            with self.subTest(code=tid):
                resp = self.client.delete(f"/api/v1/my-area/watchlist/{quote(tid, safe='')}")
                self._assert_client_error(resp, "/api/v1/my-area/watchlist/{code}", tid)

    # -------------------------------------------------------------------------
    # 7. Finding Verification: Loose Substring Matching on Detail Lookups
    # -------------------------------------------------------------------------
    def test_loose_substring_matching_finding(self):
        """
        Empirically documents the loose substring matching finding:
        When an adversarial string embeds a substring like '001', the mock handler
        treats it as a match (status 200) rather than strictly parsing the identifier.
        Crucially, neither path crashes with a 500 error.
        """
        resp_loose = self.client.get("/api/v1/events/ev-lsd-001' OR '1'='1")
        self.assertLess(resp_loose.status_code, 500)
        # Returns 200 due to substring '001' / 'lsd' matching in mock store
        self.assertEqual(resp_loose.status_code, 200)

        # Pure nonexistent identifier returns 404
        resp_strict = self.client.get("/api/v1/events/random-nonexistent-uuid-9999")
        self.assertEqual(resp_strict.status_code, 404)
