# tests/tier5_adversarial/test_fuzz_concurrency.py
"""
Tier 5 Adversarial Hardening: Concurrent Burst Fuzzing & Server Resilience.

Executes rapid multithreaded bursts of diverse adversarial requests against the
running FastAPI application to ensure thread safety, memory stability, and
zero unhandled 500 crashes under concurrent stress.
"""

import random
import concurrent.futures
from typing import List, Tuple
from tests.test_harness import BaseHarnessTestCase


class TestFuzzConcurrency(BaseHarnessTestCase):
    """Concurrent stress testing and multithreaded fuzzing harness."""

    ADVERSARIAL_REQUESTS = [
        # (method, path, params, json)
        ("GET", "/api/v1/events", {"search": "' OR 1=1 --", "limit": -5}, None),
        ("GET", "/api/v1/events", {"hazard": "<script>alert(1)</script>", "page": 0}, None),
        ("GET", "/api/v1/events/00000000-0000-0000-0000-000000000000", None, None),
        ("GET", "/api/v1/events/ev-lsd-001/sub-tabs/invalid_tab_name", None, None),
        ("GET", "/api/v1/map/geojson", {"min_lat": 35.0, "max_lat": 25.0}, None),
        ("GET", "/api/v1/map/geojson", {"min_lon": 85.0, "max_lon": 75.0}, None),
        ("GET", "/api/v1/map/geojson", {"min_lat": 1e20, "max_lat": 1e21}, None),
        ("GET", "/api/v1/tables/CON", None, None),
        ("GET", "/api/v1/tables/event;DROP%20TABLE%20event;--", None, None),
        ("GET", "/api/v1/tables/imaginary_table_404", None, None),
        ("GET", "/api/v1/modality-events", {"classification": "'; SELECT * --"}, None),
        ("GET", "/api/v1/modality-events/9f8b7c6d-5e4a-3b2c-1d0e-f9a8b7c6d5e4", None, None),
        ("GET", "/api/v1/event-groups/ffffffff-ffff-ffff-ffff-ffffffffffff", None, None),
        ("GET", "/api/v1/reports/11111111-2222-3333-4444-555555555555", None, None),
        ("GET", "/api/v1/overview/alerts", {"limit": -10}, None),
        ("GET", "/api/v1/overview/alerts", {"limit": 100000}, None),
        ("GET", "/api/v1/overview/recent-events", {"limit": 0}, None),
        ("GET", "/api/v1/overview/recent-events", {"limit": -1}, None),
        ("GET", "/api/v1/history/trends", {"granularity": "invalid_granularity"}, None),
        ("POST", "/api/v1/ask/query", None, {"query": "   \n\t  "}),
        ("POST", "/api/v1/ask/query", None, {"query": "<script>alert('xss')</script>"}),
        ("POST", "/api/v1/ask/query", None, {"query": "' OR '1'='1"}),
        ("POST", "/api/v1/my-area/watchlist", None, {"district_lgd_code": 99999}),
        ("POST", "/api/v1/my-area/watchlist", None, {"district_name": "Atlantis"}),
        ("DELETE", "/api/v1/my-area/watchlist/nonexistent_code_9999", None, None),
        ("PUT", "/api/v1/my-area/settings", None, {"notifications": "corrupt_type"}),
        ("PUT", "/api/v1/my-area/settings", None, {"test_thread_stress": random.randint(1, 10000)}),
    ]

    def _execute_request(self, req: Tuple) -> Tuple[int, str]:
        import requests
        method, path, params, json_body = req
        url = self.client._url(path)
        with requests.Session() as s:
            if method == "GET":
                resp = s.get(url, params=params, timeout=5.0)
            elif method == "POST":
                resp = s.post(url, json=json_body, timeout=5.0)
            elif method == "PUT":
                resp = s.put(url, json=json_body, timeout=5.0)
            elif method == "DELETE":
                resp = s.delete(url, timeout=5.0)
            else:
                raise ValueError(f"Unknown method {method}")
            return resp.status_code, f"{method} {path}"

    def test_concurrent_fuzz_burst(self):
        """
        Fires 150 concurrent mixed adversarial requests across 8 worker threads.
        Asserts that no request generates an unhandled 500 error.
        """
        num_requests = 150
        tasks = [random.choice(self.ADVERSARIAL_REQUESTS) for _ in range(num_requests)]

        results = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            futures = [executor.submit(self._execute_request, t) for t in tasks]
            for f in concurrent.futures.as_completed(futures):
                try:
                    status_code, desc = f.result()
                    results.append((status_code, desc))
                except Exception as e:
                    self.fail(f"Request threw unexpected client exception: {e}")

        # Assert no 500 server crashes occurred
        crashes = [r for r in results if r[0] >= 500]
        self.assertEqual(
            len(crashes),
            0,
            f"Observed {len(crashes)} server crashes (500) during concurrent fuzz burst: {crashes[:5]}"
        )

        # Confirm server remains healthy after burst
        health_resp = self.client.get("/health")
        self.assertEqual(health_resp.status_code, 200)
        self.assertEqual(health_resp.json().get("status"), "ok")
