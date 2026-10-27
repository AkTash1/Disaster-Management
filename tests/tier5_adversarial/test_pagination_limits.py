# tests/tier5_adversarial/test_pagination_limits.py
"""
Tier 5 Adversarial Hardening: Negative, Zero, and Huge Limit/Page Parameters.

Stress tests pagination and result-limiting parameters across:
- /api/v1/events (page, limit)
- /api/v1/overview/alerts (limit)
- /api/v1/overview/news (limit)
- /api/v1/overview/recent-events (limit with ge=1 constraint)
- /api/v1/history/trends (granularity regex constraint)

Verifies that out-of-range, negative, zero, and huge parameters return valid
responses, 400, or 422, and never trigger unhandled 500 crashes.
"""

from tests.test_harness import BaseHarnessTestCase


class TestPaginationLimits(BaseHarnessTestCase):
    """Adversarial stress testing for pagination and numeric query parameters."""

    def _assert_safe(self, resp, msg: str):
        """Assert status code is less than 500."""
        self.assertLess(
            resp.status_code,
            500,
            f"Server crashed with {resp.status_code} on {msg}: {resp.text[:300]}"
        )

    # -------------------------------------------------------------------------
    # 1. Events List Pagination (/api/v1/events)
    # -------------------------------------------------------------------------
    def test_events_negative_and_zero_pagination(self):
        """Events list with negative/zero page and limit executes without 500."""
        cases = [
            {"page": -1, "limit": -10},
            {"page": 0, "limit": 0},
            {"page": -5, "limit": 20},
            {"page": 1, "limit": -1},
            {"page": 0, "limit": 10},
        ]
        for c in cases:
            with self.subTest(case=c):
                resp = self.client.get("/api/v1/events", params=c)
                self._assert_safe(resp, f"events pagination {c}")
                if resp.status_code == 200:
                    data = resp.json()
                    self.assertIn("events", data)
                    self.assertIn("total", data)

    def test_events_huge_pagination(self):
        """Events list with extreme integers does not trigger memory exhaustion or overflow."""
        cases = [
            {"page": 999999, "limit": 20},
            {"page": 1, "limit": 1000000},
            {"page": 2147483647, "limit": 2147483647},
        ]
        for c in cases:
            with self.subTest(case=c):
                resp = self.client.get("/api/v1/events", params=c)
                self._assert_safe(resp, f"events pagination {c}")
                if resp.status_code == 200:
                    data = resp.json()
                    self.assertIn("events", data)

    def test_events_type_mismatched_pagination(self):
        """Type mismatches in page/limit query params return 422."""
        cases = [
            {"page": "first_page"},
            {"limit": "all"},
            {"page": "1.5"},
            {"limit": "NaN"},
            {"limit": "null"},
        ]
        for c in cases:
            with self.subTest(case=c):
                resp = self.client.get("/api/v1/events", params=c)
                self._assert_safe(resp, f"events pagination {c}")
                self.assertIn(resp.status_code, [400, 422])

    # -------------------------------------------------------------------------
    # 2. Overview Alerts Limit (/api/v1/overview/alerts)
    # -------------------------------------------------------------------------
    def test_overview_alerts_limit_boundaries(self):
        """Overview alerts handles negative, zero, and huge limits gracefully without 500 crashes."""
        cases = [-100, -1, 0, 1, 10, 10000, 1000000]
        for lim in cases:
            with self.subTest(limit=lim):
                resp = self.client.get("/api/v1/overview/alerts", params={"limit": lim})
                self._assert_safe(resp, f"alerts limit={lim}")
                self.assertEqual(resp.status_code, 200)
                data = resp.json()
                self.assertIsInstance(data, list)
                # Note: negative limit uses Python slice alerts[:lim] which omits abs(lim) items
                if lim == 0 or lim <= -5:
                    self.assertEqual(len(data), 0)

    # -------------------------------------------------------------------------
    # 3. Overview News Limit (/api/v1/overview/news)
    # -------------------------------------------------------------------------
    def test_overview_news_limit_boundaries(self):
        """Overview news handles negative, zero, and huge limits gracefully."""
        cases = [-50, -1, 0, 1, 5, 5000, 1000000]
        for lim in cases:
            with self.subTest(limit=lim):
                resp = self.client.get("/api/v1/overview/news", params={"limit": lim})
                self._assert_safe(resp, f"news limit={lim}")
                if resp.status_code == 200:
                    data = resp.json()
                    self.assertIsInstance(data, list)

    # -------------------------------------------------------------------------
    # 4. Overview Recent Events Limit Constraint (/api/v1/overview/recent-events)
    # -------------------------------------------------------------------------
    def test_overview_recent_events_limit_ge1_validation(self):
        """
        /api/v1/overview/recent-events specifies Query(ge=1).
        Non-positive limits (<=0) must return 422 Unprocessable Entity,
        positive limits return 200.
        """
        for bad_lim in [-10, -1, 0]:
            with self.subTest(limit=bad_lim):
                resp = self.client.get("/api/v1/overview/recent-events", params={"limit": bad_lim})
                self._assert_safe(resp, f"recent-events limit={bad_lim}")
                self.assertEqual(resp.status_code, 422)

        for good_lim in [1, 5, 100, 10000]:
            with self.subTest(limit=good_lim):
                resp = self.client.get("/api/v1/overview/recent-events", params={"limit": good_lim})
                self._assert_safe(resp, f"recent-events limit={good_lim}")
                self.assertEqual(resp.status_code, 200)

    # -------------------------------------------------------------------------
    # 5. History Trends Granularity Regex Constraint (/api/v1/history/trends)
    # -------------------------------------------------------------------------
    def test_history_trends_granularity_regex(self):
        """
        /api/v1/history/trends enforces pattern='^(yearly|monthly)$'.
        Invalid values must return 422, valid values return 200.
        """
        invalid_granularities = [
            "daily",
            "weekly",
            "hourly",
            "yearly ",
            " monthly",
            "<script>",
            "' OR 1=1 --",
            "123",
        ]
        for gran in invalid_granularities:
            with self.subTest(granularity=gran):
                resp = self.client.get("/api/v1/history/trends", params={"granularity": gran})
                self._assert_safe(resp, f"history trends granularity={gran}")
                self.assertEqual(resp.status_code, 422)

        for valid_gran in ["yearly", "monthly"]:
            with self.subTest(granularity=valid_gran):
                resp = self.client.get("/api/v1/history/trends", params={"granularity": valid_gran})
                self._assert_safe(resp, f"history trends granularity={valid_gran}")
                self.assertEqual(resp.status_code, 200)
