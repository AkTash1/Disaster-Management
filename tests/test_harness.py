# tests/test_harness.py
"""
Test Harness for Disaster Intelligence Multimodal Platform E2E Testing.

Provides:
- In-process / background Uvicorn server launcher.
- Robust HTTP client with JSON parsing, error handling, and timeout protection.
- BaseTestCase class with domain-specific assertions (epistemic status, coordinates, GeoJSON).
"""

import os
import sys
import time
import socket
import logging
import threading
import unittest
from typing import Any, Dict, List, Optional, Union
import requests

logger = logging.getLogger("test_harness")


def find_free_port(default_port: int = 8999) -> int:
    """Check if default_port is free, otherwise find an available ephemeral port."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", default_port))
            return default_port
        except OSError:
            s.bind(("127.0.0.1", 0))
            return s.getsockname()[1]


class TestHarness:
    """HTTP client and server manager for E2E tests."""

    _instance: Optional["TestHarness"] = None
    _lock = threading.Lock()

    def __init__(self, base_url: Optional[str] = None, port: int = 8999):
        self.port = port
        self.host = "127.0.0.1"
        self.base_url = base_url or os.environ.get("TEST_BASE_URL", f"http://{self.host}:{self.port}")
        self.server_thread: Optional[threading.Thread] = None
        self.uvicorn_server = None
        self.session = requests.Session()
        self._server_started_by_us = False
        self._server_unavailable = False

    @classmethod
    def get_instance(cls, port: int = 8999) -> "TestHarness":
        with cls._lock:
            if cls._instance is None:
                cls._instance = TestHarness(port=port)
            return cls._instance

    def is_server_alive(self, timeout: float = 0.5) -> bool:
        """Check if server responds at base_url."""
        if self._server_unavailable:
            return False
        try:
            resp = self.session.get(f"{self.base_url}/", timeout=timeout)
            self._server_unavailable = False
            return resp.status_code in (200, 404)
        except Exception:
            return False

    def start_server(self, max_wait_sec: float = 10.0) -> bool:
        """Start FastAPI in background thread if not already alive."""
        if self.is_server_alive(timeout=0.2):
            logger.info("Server is already running at %s", self.base_url)
            return True

        # Check if app module is importable
        try:
            import uvicorn
            from app.main import app
        except ImportError as e:
            if not self._server_unavailable:
                logger.debug("Could not import app.main: %s. Assuming server will be started externally.", e)
            self._server_unavailable = True
            return False



        # Allocate port
        actual_port = find_free_port(self.port)
        self.port = actual_port
        self.base_url = f"http://{self.host}:{self.port}"

        config = uvicorn.Config(
            app=app,
            host=self.host,
            port=self.port,
            log_level="warning",
            access_log=False,
            lifespan="on",
        )
        self.uvicorn_server = uvicorn.Server(config)

        def run_server():
            try:
                self.uvicorn_server.run()
            except Exception as e:
                logger.error("Uvicorn server crashed: %s", e)

        self.server_thread = threading.Thread(target=run_server, daemon=True, name="uvicorn-test-server")
        self.server_thread.start()
        self._server_started_by_us = True

        start_time = time.time()
        while time.time() - start_time < max_wait_sec:
            if self.is_server_alive(timeout=0.5):
                logger.info("Test server successfully booted at %s", self.base_url)
                return True
            time.sleep(0.1)

        raise TimeoutError(f"Server at {self.base_url} failed to respond within {max_wait_sec} seconds")

    def stop_server(self):
        """Stop background uvicorn server if started by us."""
        if self._server_started_by_us and self.uvicorn_server:
            self.uvicorn_server.should_exit = True
            if self.server_thread and self.server_thread.is_alive():
                self.server_thread.join(timeout=3.0)
            self._server_started_by_us = False

    def _url(self, path: str) -> str:
        if path.startswith("http://") or path.startswith("https://"):
            return path
        if not path.startswith("/"):
            path = "/" + path
        return f"{self.base_url}{path}"

    def get(self, path: str, params: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None, timeout: float = 10.0) -> requests.Response:
        return self.session.get(self._url(path), params=params, headers=headers, timeout=timeout)

    def post(self, path: str, json: Optional[Any] = None, data: Optional[Any] = None, headers: Optional[Dict[str, str]] = None, timeout: float = 10.0) -> requests.Response:
        return self.session.post(self._url(path), json=json, data=data, headers=headers, timeout=timeout)

    def put(self, path: str, json: Optional[Any] = None, data: Optional[Any] = None, headers: Optional[Dict[str, str]] = None, timeout: float = 10.0) -> requests.Response:
        return self.session.put(self._url(path), json=json, data=data, headers=headers, timeout=timeout)

    def delete(self, path: str, params: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None, timeout: float = 10.0) -> requests.Response:
        return self.session.delete(self._url(path), params=params, headers=headers, timeout=timeout)

    def head(self, path: str, headers: Optional[Dict[str, str]] = None, timeout: float = 10.0) -> requests.Response:
        return self.session.head(self._url(path), headers=headers, timeout=timeout)

    def options(self, path: str, headers: Optional[Dict[str, str]] = None, timeout: float = 10.0) -> requests.Response:
        return self.session.options(self._url(path), headers=headers, timeout=timeout)

    def get_json(self, path: str, params: Optional[Dict[str, Any]] = None, expected_status: int = 200, timeout: float = 10.0) -> Any:
        resp = self.get(path, params=params, timeout=timeout)
        if resp.status_code != expected_status:
            raise AssertionError(f"Expected status {expected_status} for GET {path}, got {resp.status_code}: {resp.text[:300]}")
        return resp.json()

    def post_json(self, path: str, json: Optional[Any] = None, expected_status: int = 200, timeout: float = 10.0) -> Any:
        resp = self.post(path, json=json, timeout=timeout)
        if resp.status_code != expected_status:
            raise AssertionError(f"Expected status {expected_status} for POST {path}, got {resp.status_code}: {resp.text[:300]}")
        return resp.json()

    def put_json(self, path: str, json: Optional[Any] = None, expected_status: int = 200, timeout: float = 10.0) -> Any:
        resp = self.put(path, json=json, timeout=timeout)
        if resp.status_code != expected_status:
            raise AssertionError(f"Expected status {expected_status} for PUT {path}, got {resp.status_code}: {resp.text[:300]}")
        return resp.json()

    def delete_json(self, path: str, params: Optional[Dict[str, Any]] = None, expected_status: int = 200, timeout: float = 10.0) -> Any:
        resp = self.delete(path, params=params, timeout=timeout)
        if resp.status_code != expected_status:
            raise AssertionError(f"Expected status {expected_status} for DELETE {path}, got {resp.status_code}: {resp.text[:300]}")
        return resp.json()


class BaseHarnessTestCase(unittest.TestCase):
    """Base class for all opaque-box tests across Tiers 1-4."""

    client: TestHarness

    @classmethod
    def setUpClass(cls):
        cls.client = TestHarness.get_instance()
        if not cls.client.is_server_alive():
            started = cls.client.start_server()
            if not started and not cls.client.is_server_alive():
                raise unittest.SkipTest(
                    f"Test server at {cls.client.base_url} is not running and app.main is not yet available."
                )


    def assert_epistemic_status(self, status: str, field_name: str = "epistemic_status"):
        valid_statuses = {
            "Observed", "Official", "Reported", "AI Inferred", "Predicted",
            "Unverified", "Likely True", "Confirmed", "Inferred", "Possible"
        }
        self.assertIn(
            status,
            valid_statuses,
            f"Invalid {field_name} '{status}'. Expected one of {sorted(valid_statuses)}"
        )

    def assert_severity(self, severity: str, field_name: str = "severity"):
        valid_severities = {"Critical", "High", "Moderate", "Low", "Advisory", "Warning"}
        self.assertIn(
            severity,
            valid_severities,
            f"Invalid {field_name} '{severity}'. Expected one of {sorted(valid_severities)}"
        )

    def assert_uttarakhand_coords(self, lat: float, lon: float, location_name: str = ""):
        """Verify coordinates fall within realistic Uttarakhand bounding box [28.5, 77.4, 31.6, 81.2]."""
        self.assertGreaterEqual(lat, 28.5, f"Latitude {lat} for {location_name} is below Uttarakhand min (28.5)")
        self.assertLessEqual(lat, 31.6, f"Latitude {lat} for {location_name} is above Uttarakhand max (31.6)")
        self.assertGreaterEqual(lon, 77.4, f"Longitude {lon} for {location_name} is below Uttarakhand min (77.4)")
        self.assertLessEqual(lon, 81.2, f"Longitude {lon} for {location_name} is above Uttarakhand max (81.2)")

    def assert_geojson_feature_collection(self, data: Dict[str, Any]):
        self.assertIsInstance(data, dict, "GeoJSON must be a JSON object")
        self.assertEqual(data.get("type"), "FeatureCollection", "GeoJSON type must be FeatureCollection")
        self.assertIn("features", data, "GeoJSON must contain 'features' list")
        self.assertIsInstance(data["features"], list, "'features' must be a list")
        for idx, feat in enumerate(data["features"]):
            self.assertEqual(feat.get("type"), "Feature", f"Feature #{idx} type must be 'Feature'")
            self.assertIn("geometry", feat, f"Feature #{idx} must have 'geometry'")
            self.assertIn("properties", feat, f"Feature #{idx} must have 'properties'")
            geom = feat["geometry"]
            if geom is not None:
                self.assertIn("type", geom, f"Geometry #{idx} must specify 'type'")
                self.assertIn("coordinates", geom, f"Geometry #{idx} must specify 'coordinates'")
