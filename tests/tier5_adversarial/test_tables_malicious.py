# tests/tier5_adversarial/test_tables_malicious.py
"""
Tier 5 Adversarial Hardening: Unknown and Malicious Table Names in /api/v1/tables/{table_name}.

Stress tests the schema inspection endpoint against:
- Non-existent table names
- SQL injection vectors in table paths
- Path traversal sequences
- Windows reserved device names (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
- XSS and HTML injection payloads
- Buffer stress (5000+ chars)
- Null byte and encoding manipulations
"""

from typing import List
from tests.test_harness import BaseHarnessTestCase


class TestTablesMalicious(BaseHarnessTestCase):
    """Adversarial stress testing for /api/v1/tables/{table_name}."""

    UNKNOWN_TABLES: List[str] = [
        "secret_admin_table",
        "users_credentials",
        "payments_billing",
        "completely_imaginary_table",
        "table_404_not_found",
        "undefined",
        "null",
        "None",
    ]

    SQLI_TABLES: List[str] = [
        "event;DROP%20TABLE%20event;--",
        "'%20OR%20'1'='1",
        "event'%20UNION%20SELECT%201,2,3--",
        "admin'--",
        "';WAITFOR%20DELAY%20'0:0:1'--",
        "1;%20EXEC%20xp_cmdshell('dir')",
        "event/**/WHERE/**/1=1",
    ]

    PATH_TRAVERSAL_TABLES: List[str] = [
        "..%2f..%2fetc%2fpasswd",
        "..%2f..%2fapp%2fcore%2fconfig.py",
        "%2e%2e%2f%2e%2e%2fWINDOWS%2fsystem32%2fcalc.exe",
        "....//....//secret.txt",
        "..\\..\\windows\\win.ini",
        "%252e%252e%252fetc%252fpasswd",
    ]

    WINDOWS_DEVICE_NAMES: List[str] = [
        "CON",
        "PRN",
        "AUX",
        "NUL",
        "COM1",
        "COM2",
        "COM9",
        "LPT1",
        "LPT2",
        "LPT9",
        "con.txt",
        "aux.db",
    ]

    XSS_TABLES: List[str] = [
        "<script>alert(1)</script>",
        "%3Cscript%3Ealert(1)%3C%2Fscript%3E",
        "<img%20src=x%20onerror=alert(1)>",
        '"><svg/onload=alert(1)>',
        "javascript:alert(1)",
    ]

    UNICODE_TABLES: List[str] = [
        "तालिका_आपदा",
        "灾难数据表",
        "таблица_событий",
        "🌊🏔️🚨",
        "%E0%A4%A4%E0%A4%BE%E0%A4%B2%E0%A4%BF%E0%A4%95%E0%A4%BE",
    ]

    def _assert_safe_table_error(self, resp, identifier: str):
        """Assert that table lookup safely returns 404/400 without 500 crashes or stack traces."""
        self.assertLess(
            resp.status_code,
            500,
            f"Server crashed with {resp.status_code} for table '{identifier}': {resp.text[:300]}"
        )
        self.assertIn(
            resp.status_code,
            [400, 404, 422],
            f"Expected 400/404/422 for malicious table '{identifier}', got {resp.status_code}"
        )
        self.assertNotIn("syntax error", resp.text.lower())
        self.assertNotIn("traceback (most recent call last)", resp.text.lower())

    def test_unknown_table_names(self):
        """Unknown table names return 404 with standard detail message."""
        for tbl in self.UNKNOWN_TABLES:
            with self.subTest(table=tbl):
                resp = self.client.get(f"/api/v1/tables/{tbl}")
                self._assert_safe_table_error(resp, tbl)

    def test_sqli_in_table_name(self):
        """SQL injection vectors in table name return 404 without database syntax errors."""
        for tbl in self.SQLI_TABLES:
            with self.subTest(table=tbl):
                resp = self.client.get(f"/api/v1/tables/{tbl}")
                self._assert_safe_table_error(resp, tbl)

    def test_path_traversal_in_table_name(self):
        """Path traversal vectors in table name are safely rejected."""
        for tbl in self.PATH_TRAVERSAL_TABLES:
            with self.subTest(table=tbl):
                resp = self.client.get(f"/api/v1/tables/{tbl}")
                self._assert_safe_table_error(resp, tbl)

    def test_windows_reserved_device_names(self):
        """Windows device names (CON, NUL, AUX, PRN) do not freeze filesystem or crash server."""
        for tbl in self.WINDOWS_DEVICE_NAMES:
            with self.subTest(table=tbl):
                resp = self.client.get(f"/api/v1/tables/{tbl}")
                self._assert_safe_table_error(resp, tbl)

    def test_xss_in_table_name(self):
        """XSS payloads in table name return 404 without reflected script execution."""
        for tbl in self.XSS_TABLES:
            with self.subTest(table=tbl):
                resp = self.client.get(f"/api/v1/tables/{tbl}")
                self._assert_safe_table_error(resp, tbl)

    def test_unicode_and_devanagari_table_names(self):
        """Non-ASCII / Devanagari table names return 404 safely."""
        for tbl in self.UNICODE_TABLES:
            with self.subTest(table=tbl):
                resp = self.client.get(f"/api/v1/tables/{tbl}")
                self._assert_safe_table_error(resp, tbl)

    def test_massive_buffer_table_name(self):
        """Table name with 5,000 characters is rejected without buffer overflow."""
        long_table = "A" * 5000
        resp = self.client.get(f"/api/v1/tables/{long_table}")
        self._assert_safe_table_error(resp, "5000-char-A")

    def test_whitespace_and_null_bytes_in_table_name(self):
        """Whitespace and null-byte variations in table names return 404/400."""
        variants = ["%20", "%09", "%0a", "event%00secret", "event%20", "%20event"]
        for v in variants:
            with self.subTest(table=v):
                resp = self.client.get(f"/api/v1/tables/{v}")
                self._assert_safe_table_error(resp, v)
