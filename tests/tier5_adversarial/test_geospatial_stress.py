# tests/tier5_adversarial/test_geospatial_stress.py
"""
Tier 5 Adversarial Hardening: Geospatial Boundary and Stress Testing.

Stress tests the map explorer and spatial query endpoints with:
- Inverted bounding boxes (min_lat > max_lat, min_lon > max_lon)
- Extreme out-of-bounds latitude and longitude values
- Floating-point edge cases (subnormals, extreme exponents, point bboxes)
- Non-numeric and corrupted coordinate strings
- Partial bounding box definitions
"""

from tests.test_harness import BaseHarnessTestCase


class TestGeospatialStress(BaseHarnessTestCase):
    """Adversarial stress testing for spatial coordinate handling and bounding boxes."""

    def _assert_safe_geojson(self, resp, context_msg: str):
        """Assert response is not 500 and, if 200, returns a valid GeoJSON structure."""
        self.assertLess(
            resp.status_code,
            500,
            f"Geospatial query crashed with {resp.status_code} for {context_msg}: {resp.text[:300]}"
        )
        if resp.status_code == 200:
            data = resp.json()
            self.assertEqual(data.get("type"), "FeatureCollection", f"Expected FeatureCollection in {context_msg}")
            self.assertIn("features", data, f"Missing features list in {context_msg}")
            self.assertIsInstance(data["features"], list)

    # -------------------------------------------------------------------------
    # Inverted Bounding Boxes
    # -------------------------------------------------------------------------
    def test_inverted_latitude_bbox(self):
        """Inverted latitude (min_lat > max_lat) returns empty feature collection or 400 without crashing."""
        resp = self.client.get("/api/v1/map/geojson", params={"min_lat": 31.5, "max_lat": 29.0})
        self._assert_safe_geojson(resp, "min_lat=31.5, max_lat=29.0")
        if resp.status_code == 200:
            self.assertEqual(len(resp.json()["features"]), 0)

    def test_inverted_longitude_bbox(self):
        """Inverted longitude (min_lon > max_lon) returns empty feature collection or 400 without crashing."""
        resp = self.client.get("/api/v1/map/geojson", params={"min_lon": 81.0, "max_lon": 78.0})
        self._assert_safe_geojson(resp, "min_lon=81.0, max_lon=78.0")
        if resp.status_code == 200:
            self.assertEqual(len(resp.json()["features"]), 0)

    def test_doubly_inverted_bbox(self):
        """Both latitude and longitude inverted concurrently."""
        resp = self.client.get("/api/v1/map/geojson", params={
            "min_lat": 32.0,
            "max_lat": 28.0,
            "min_lon": 82.0,
            "max_lon": 76.0,
        })
        self._assert_safe_geojson(resp, "both lat and lon inverted")
        if resp.status_code == 200:
            self.assertEqual(len(resp.json()["features"]), 0)

    # -------------------------------------------------------------------------
    # Extreme and Out-of-Bounds Coordinates
    # -------------------------------------------------------------------------
    def test_extreme_latitude_values(self):
        """Extreme latitude coordinates (+/- 999999, +/- 1e300) handled gracefully without 500 crash."""
        extreme_lats = [91.0, -91.0, 1000.0, -1000.0, 9999999.0, -9999999.0, 1e20, -1e20]
        for lat in extreme_lats:
            with self.subTest(lat=lat):
                # When latitude bounds are entirely outside Uttarakhand, should either return empty features or safe collection
                resp = self.client.get("/api/v1/map/geojson", params={"min_lat": lat, "max_lat": lat + 1.0 if lat < 0 else lat + 10.0})
                self._assert_safe_geojson(resp, f"lat={lat}")
                if resp.status_code == 200:
                    self.assertEqual(len(resp.json()["features"]), 0)

    def test_extreme_longitude_values(self):
        """Extreme longitude coordinates (+/- 181, +/- 999999) handled gracefully without 500 crash."""
        extreme_lons = [181.0, -181.0, 360.0, -360.0, 9999999.0, -9999999.0]
        for lon in extreme_lons:
            with self.subTest(lon=lon):
                resp = self.client.get("/api/v1/map/geojson", params={"min_lon": lon, "max_lon": lon + 1.0})
                self._assert_safe_geojson(resp, f"lon={lon}")
                if resp.status_code == 200:
                    self.assertEqual(len(resp.json()["features"]), 0)

    def test_point_bounding_box(self):
        """Zero-area point bounding box (min == max) executes safely."""
        # Exact point around Rudraprayag
        resp = self.client.get("/api/v1/map/geojson", params={
            "min_lat": 30.485,
            "max_lat": 30.485,
            "min_lon": 79.062,
            "max_lon": 79.062,
        })
        self._assert_safe_geojson(resp, "point bbox min==max")

    def test_high_precision_floating_point(self):
        """Coordinates with 40+ decimal places do not cause parsing overflows."""
        resp = self.client.get("/api/v1/map/geojson", params={
            "min_lat": "30.48501234567890123456789012345678901234",
            "max_lat": "30.48509876543210987654321098765432109876",
            "min_lon": "79.06201234567890123456789012345678901234",
            "max_lon": "79.06209876543210987654321098765432109876",
        })
        self._assert_safe_geojson(resp, "high precision floats")

    def test_non_numeric_coordinates(self):
        """Non-numeric string inputs in coordinate params return 400, 422 or graceful 200 without 500 crash."""
        bad_coords = ["not_a_float", "NaN", "Infinity", "-Infinity", "true", "null", "30.5;DROP"]
        for bad in bad_coords:
            with self.subTest(bad=bad):
                resp = self.client.get("/api/v1/map/geojson", params={"min_lat": bad})
                self.assertLess(resp.status_code, 500, f"Server crashed with {resp.status_code} for bad coord '{bad}'")
                self.assertIn(resp.status_code, [200, 400, 422])
                if resp.status_code == 200:
                    self._assert_safe_geojson(resp, f"min_lat={bad}")

    def test_partial_bbox_combinations(self):
        """Testing subsets of bbox parameters (e.g., only min_lat or only max_lon)."""
        combinations = [
            {"min_lat": 30.0},
            {"max_lat": 31.0},
            {"min_lon": 78.0},
            {"max_lon": 80.0},
            {"min_lat": 30.0, "max_lon": 80.0},
        ]
        for combo in combinations:
            with self.subTest(combo=combo):
                resp = self.client.get("/api/v1/map/geojson", params=combo)
                self._assert_safe_geojson(resp, f"partial bbox: {combo}")
