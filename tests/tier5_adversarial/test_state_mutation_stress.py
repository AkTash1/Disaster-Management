# tests/tier5_adversarial/test_state_mutation_stress.py
"""
Tier 5 Adversarial Hardening: State Mutation Stress on Watchlist and Settings.

Stress tests:
- /api/v1/my-area/watchlist (GET, POST, DELETE)
  - Duplicate additions (idempotency)
  - Invalid district codes and names (400)
  - Empty and type-mismatched payloads
  - Deletions of non-existent districts (404)
  - Rapid churn cycles
- /api/v1/my-area/settings (GET, PUT)
  - Type pollution attacks (replacing dict configs with strings, lists, nulls)
  - Arbitrary unexpected keys and deep nesting
  - Large payload injections
  - State integrity verification
"""

import copy
from typing import Dict, Any
from tests.test_harness import BaseHarnessTestCase


class TestStateMutationStress(BaseHarnessTestCase):
    """Adversarial stress testing for state mutation endpoints in My Area."""

    # -------------------------------------------------------------------------
    # 1. Watchlist Mutation Stress
    # -------------------------------------------------------------------------
    def test_watchlist_duplicate_addition_idempotency(self):
        """Adding an existing district repeatedly is idempotent and does not duplicate items."""
        # Baseline check
        initial_resp = self.client.get("/api/v1/my-area/watchlist")
        self.assertEqual(initial_resp.status_code, 200)
        initial_watchlist = initial_resp.json()["watchlist"]
        initial_count = len(initial_watchlist)

        # Post an existing district (Rudraprayag code 54)
        for _ in range(5):
            resp = self.client.post("/api/v1/my-area/watchlist", json={"district_lgd_code": 54})
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data.get("success"))
            self.assertEqual(len(data.get("watchlist", [])), initial_count)

    def test_watchlist_invalid_district_additions(self):
        """Invalid district codes and names return 400 without corrupting watchlist."""
        invalid_payloads = [
            {"district_lgd_code": 99999},
            {"district_lgd_code": -1},
            {"district_name": "NonExistentDistrictName"},
            {"district_name": "<script>alert(1)</script>"},
            {"district_name": "' OR '1'='1"},
            {},
            {"district_lgd_code": None, "district_name": None},
        ]
        for payload in invalid_payloads:
            with self.subTest(payload=payload):
                resp = self.client.post("/api/v1/my-area/watchlist", json=payload)
                self.assertLess(resp.status_code, 500)
                self.assertEqual(resp.status_code, 400)

    def test_watchlist_malformed_type_payloads(self):
        """Type mismatches (e.g. string for integer code) return 422."""
        bad_types = [
            {"district_lgd_code": "fifty_four"},
            {"district_lgd_code": [54]},
            {"district_name": {"nested": "name"}},
        ]
        for payload in bad_types:
            with self.subTest(payload=payload):
                resp = self.client.post("/api/v1/my-area/watchlist", json=payload)
                self.assertLess(resp.status_code, 500)
                self.assertEqual(resp.status_code, 422)

    def test_watchlist_add_delete_rapid_churn(self):
        """Rapid sequential addition and deletion of a valid district (Almora code 45)."""
        district_code = 45  # Almora
        for cycle in range(5):
            # Add Almora
            add_resp = self.client.post("/api/v1/my-area/watchlist", json={"district_lgd_code": district_code})
            self.assertIn(add_resp.status_code, [200, 400])

            # Delete Almora by code
            del_resp = self.client.delete(f"/api/v1/my-area/watchlist/{district_code}")
            self.assertEqual(del_resp.status_code, 200)

            # Deleting again immediately must return 404
            del_repeat = self.client.delete(f"/api/v1/my-area/watchlist/{district_code}")
            self.assertEqual(del_repeat.status_code, 404)

    def test_watchlist_delete_nonexistent_districts(self):
        """Deleting non-existent district codes or names returns 404."""
        bad_identifiers = ["99999", "RandomTown", "12345", "<script>", "-1"]
        for identifier in bad_identifiers:
            with self.subTest(id=identifier):
                resp = self.client.delete(f"/api/v1/my-area/watchlist/{identifier}")
                self.assertLess(resp.status_code, 500)
                self.assertIn(resp.status_code, [400, 404])

    # -------------------------------------------------------------------------
    # 2. Settings Mutation Stress
    # -------------------------------------------------------------------------
    def test_settings_type_pollution_defense(self):
        """
        Attempts to overwrite nested setting dictionaries with primitives
        are safely handled without corrupting the configuration or crashing.
        """
        # Baseline
        initial = self.client.get("/api/v1/my-area/settings").json()
        self.assertIsInstance(initial.get("notifications"), dict)

        malicious_updates = [
            {"notifications": "corrupt_string_override"},
            {"notifications": 12345},
            {"notifications": [1, 2, 3]},
            {"notifications": None},
            {"display_units": "not_a_dict"},
            {"map_settings": False},
        ]
        for update in malicious_updates:
            with self.subTest(update=update):
                resp = self.client.put("/api/v1/my-area/settings", json=update)
                self.assertLess(resp.status_code, 500)
                self.assertEqual(resp.status_code, 200)
                settings = resp.json()["settings"]
                # Must still be a dictionary
                self.assertIsInstance(settings.get("notifications"), dict)
                self.assertIsInstance(settings.get("display_units"), dict)

    def test_settings_arbitrary_keys_and_large_payload(self):
        """Settings accept arbitrary custom extensions and large strings safely."""
        large_payload = {
            "custom_webhook": "https://emergency.uk.gov.in/telemetry/hook",
            "deeply_nested": {"tier1": {"tier2": {"tier3": "active"}}},
            "large_text_blob": "A" * 10000,
            "unicode_note": "उत्तराखंड राज्य आपदा प्रबंधन प्राधिकरण देहरादून",
        }
        resp = self.client.put("/api/v1/my-area/settings", json=large_payload)
        self.assertLess(resp.status_code, 500)
        self.assertEqual(resp.status_code, 200)

        # Verify GET returns intact structure
        get_resp = self.client.get("/api/v1/my-area/settings")
        self.assertEqual(get_resp.status_code, 200)
        data = get_resp.json()
        self.assertIn("notifications", data)
        self.assertIn("account", data)
        self.assertEqual(data.get("custom_webhook"), large_payload["custom_webhook"])

    def test_settings_empty_and_partial_update(self):
        """Empty payload and valid partial updates succeed without side-effects."""
        # Empty PUT
        resp_empty = self.client.put("/api/v1/my-area/settings", json={})
        self.assertEqual(resp_empty.status_code, 200)

        # Valid partial notification toggle
        resp_partial = self.client.put("/api/v1/my-area/settings", json={
            "notifications": {"critical_alerts_sms": True, "push_notifications": True}
        })
        self.assertEqual(resp_partial.status_code, 200)
        settings = resp_partial.json()["settings"]
        self.assertTrue(settings["notifications"]["critical_alerts_sms"])
