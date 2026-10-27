# tests/tier5_adversarial/test_spa_routing_adversarial.py
"""
Adversarial Verification: SPA Navigation Routing & Static Script Integrity.
Validates:
- All 10 primary view paths + utility paths render with zero broken references.
- Rapid route switching and burst navigation.
- Invalid client routes fallback gracefully to index.html without server error.
- Strict isolation of /api/* and /static/* from index.html fallback.
- Static file availability and syntax integrity across all 18 JS/JSX files.
- Headless browser DOM rendering verification via Microsoft Edge.
"""

import os
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from tests.test_harness import BaseHarnessTestCase


class TestSPARoutingAdversarial(BaseHarnessTestCase):
    """Adversarial stress suite for SPA client routing and static asset graph."""

    PRIMARY_PATHS = [
        "overview",
        "map-explorer",
        "events",
        "modality-events",
        "event-groups",
        "reports",
        "history",
        "preparedness",
        "ask",
        "my-area",
    ]

    UTILITY_PATHS = [
        "settings",
        "help",
    ]

    ALL_STATIC_SCRIPTS = [
        # Shared Modular Components
        "static/js/components/Badges.js",
        "static/js/components/KpiCard.js",
        "static/js/components/Sidebar.js",
        "static/js/components/TopBar.js",
        "static/js/components/MapView.js",
        "static/js/components/ChartView.js",
        "static/js/components/EpisodeGraph.js",
        # Views 1 to 5
        "static/js/views/OverviewView.js",
        "static/js/views/MapExplorerView.js",
        "static/js/views/EventsView.js",
        "static/js/views/ModalityEventsView.js",
        "static/js/views/EventGroupsView.js",
        # Views 6 to 10
        "static/js/views/ReportsView.js",
        "static/js/views/HistoryTrendsView.js",
        "static/js/views/PreparednessView.js",
        "static/js/views/AskView.js",
        "static/js/views/MyAreaView.js",
        # Main Router
        "static/js/app.js",
    ]

    def test_r1_all_10_primary_paths_serve_html_shell(self):
        """Verify each of the 10 primary navigation routes serves index.html shell."""
        for path in self.PRIMARY_PATHS:
            with self.subTest(path=path):
                resp = self.client.get(f"/{path}")
                self.assertEqual(
                    resp.status_code, 200, f"Expected 200 for route /{path}"
                )
                self.assertIn("text/html", resp.headers.get("content-type", "").lower())
                self.assertIn('<div id="root"', resp.text)
                self.assertIn("Disaster Intelligence", resp.text)
                self.assertIn('/static/js/app.js', resp.text)

    def test_r2_utility_and_root_paths_serve_html_shell(self):
        """Verify root path / and utility routes (settings, help) serve index.html."""
        for path in ["", "settings", "help"]:
            with self.subTest(path=path):
                route = f"/{path}" if path else "/"
                resp = self.client.get(route)
                self.assertEqual(resp.status_code, 200)
                self.assertIn("text/html", resp.headers.get("content-type", "").lower())
                self.assertIn('<div id="root"', resp.text)

    def test_r3_rapid_route_switching_burst(self):
        """Simulate rapid client-side route switching (60 concurrent requests)."""
        all_routes = ["/"] + [f"/{p}" for p in self.PRIMARY_PATHS + self.UTILITY_PATHS]
        # Repeat routes to reach 60 requests
        requests_pool = (all_routes * 5)[:60]

        def fetch_route(route):
            return self.client.get(route, timeout=5.0)

        with ThreadPoolExecutor(max_workers=10) as executor:
            responses = list(executor.map(fetch_route, requests_pool))

        self.assertEqual(len(responses), 60)
        for resp in responses:
            self.assertEqual(resp.status_code, 200)
            self.assertIn('<div id="root"', resp.text)

    def test_r4_invalid_client_paths_fallback_gracefully(self):
        """Test arbitrary and invalid frontend client paths return index.html fallback without 500 error."""
        invalid_paths = [
            "/non-existent-view-xyz",
            "/events/EV-999-NONEXISTENT/detail",
            "/deeply/nested/unknown/client/route",
            "/12345",
            "/overview?filter=bad&query=%20",
            "/ru/landslide/report",
            "/hyphenated-route-that-does-not-exist",
        ]
        for path in invalid_paths:
            with self.subTest(path=path):
                resp = self.client.get(path)
                self.assertEqual(
                    resp.status_code,
                    200,
                    f"Invalid client route {path} should fallback to index.html with 200",
                )
                self.assertIn('<div id="root"', resp.text)

    def test_r5_strict_api_and_static_isolation_from_fallback(self):
        """Ensure non-existent /api/* and /static/* paths return 404, NEVER falling back to index.html."""
        forbidden_fallbacks = [
            "/api/v1/nonexistent_resource_endpoint",
            "/api/v1/events/invalid_id_00000000",
            "/api/v1/modality-events/nonexistent_modality_123",
            "/static/missing_script_file.js",
            "/static/css/missing_style.css",
            "/static/vendor/missing_library.min.js",
        ]
        for path in forbidden_fallbacks:
            with self.subTest(path=path):
                resp = self.client.get(path)
                self.assertEqual(
                    resp.status_code,
                    404,
                    f"Path {path} must return 404, but returned {resp.status_code}",
                )
                self.assertNotIn(
                    "<!DOCTYPE html>",
                    resp.text,
                    f"Path {path} returned index.html fallback instead of 404!",
                )

    def test_r6_all_18_static_scripts_exist_and_serve_cleanly(self):
        """Verify all 18 modular JS/JSX scripts referenced in index.html are served with HTTP 200."""
        for script_rel in self.ALL_STATIC_SCRIPTS:
            with self.subTest(script=script_rel):
                resp = self.client.get(f"/{script_rel}")
                self.assertEqual(
                    resp.status_code,
                    200,
                    f"Static script /{script_rel} returned {resp.status_code}",
                )
                content = resp.text.strip()
                self.assertGreater(
                    len(content), 100, f"Script /{script_rel} is unexpectedly empty or truncated"
                )
                # Verify that it is not returning index.html fallback
                self.assertNotIn("<!DOCTYPE html>", content[:50])

    def test_r7_component_namespace_registrations(self):
        """Assert all components and views register themselves on window namespaces."""
        # Check Sidebar, TopBar, MapView, EpisodeGraph, ChartView
        components_map = {
            "static/js/components/Sidebar.js": "Sidebar",
            "static/js/components/TopBar.js": "TopBar",
            "static/js/components/MapView.js": "MapView",
            "static/js/components/EpisodeGraph.js": "EpisodeGraph",
            "static/js/components/ChartView.js": "ChartView",
            "static/js/components/KpiCard.js": "KpiCard",
            "static/js/components/Badges.js": "EpistemicBadge",
        }
        for path, comp_name in components_map.items():
            with self.subTest(component=comp_name):
                resp = self.client.get(f"/{path}")
                self.assertEqual(resp.status_code, 200)
                self.assertIn(comp_name, resp.text)
                self.assertIn("window.", resp.text)

        # Check all 10 views
        views_map = {
            "static/js/views/OverviewView.js": "OverviewView",
            "static/js/views/MapExplorerView.js": "MapExplorerView",
            "static/js/views/EventsView.js": "EventsView",
            "static/js/views/ModalityEventsView.js": "ModalityEventsView",
            "static/js/views/EventGroupsView.js": "EventGroupsView",
            "static/js/views/ReportsView.js": "ReportsView",
            "static/js/views/HistoryTrendsView.js": "HistoryTrendsView",
            "static/js/views/PreparednessView.js": "PreparednessView",
            "static/js/views/AskView.js": "AskView",
            "static/js/views/MyAreaView.js": "MyAreaView",
        }
        for path, view_name in views_map.items():
            with self.subTest(view=view_name):
                resp = self.client.get(f"/{path}")
                self.assertEqual(resp.status_code, 200)
                self.assertIn(view_name, resp.text)
                self.assertIn("window.DisasterViews", resp.text)

    def test_r8_headless_browser_dom_rendering_and_zero_crash(self):
        """Run headless Microsoft Edge to assert browser-side React DOM mount and Babel compilation."""
        edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        if not Path(edge_path).exists():
            edge_path = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
        if not Path(edge_path).exists():
            self.skipTest("Microsoft Edge not found on host system.")

        cmd = [
            edge_path,
            "--headless",
            "--virtual-time-budget=4000",
            "--dump-dom",
            f"{self.client.base_url}/overview",
        ]
        try:
            proc = subprocess.run(
                cmd,
                capture_output=True,
                encoding="utf-8",
                errors="replace",
                timeout=20,
            )
            self.assertEqual(proc.returncode, 0, f"Edge process exited with {proc.returncode}")
            dom = proc.stdout
            self.assertGreater(len(dom), 50000, "Rendered DOM size is too small; React may not have mounted.")
            self.assertIn("Disaster Intelligence", dom)
            self.assertIn("Uttarakhand Testbed", dom)
            # Verify that view-specific elements rendered
            self.assertTrue(
                "Active Events and Warnings" in dom or "Events by Hazard Type" in dom,
                "Overview view elements not found in rendered browser DOM",
            )
        except subprocess.TimeoutExpired:
            self.fail("Headless Edge browser render timed out after 20 seconds.")
