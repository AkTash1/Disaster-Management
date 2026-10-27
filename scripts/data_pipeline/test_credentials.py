"""
test_credentials.py
────────────────────
Tests all active credentials before running the main scripts.
Run this after filling in your .env file.

Active checks:
  IMD imdlib  (no credentials needed)
  MOSDAC      (MOSDAC_USERNAME / MOSDAC_PASSWORD in .env)
  Bhuvan WMS  (public — no credentials needed)

Skipped (sites unreachable as of Aug 2026):
  India-WRIS  (indiawris.gov.in)
  CWC         (cwc.gov.in)
  GSI Bhukosh (bhukosh.gsi.gov.in)

Usage:
    python test_credentials.py
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

PASS = "\033[92m PASS \033[0m"
FAIL = "\033[91m FAIL \033[0m"
results = {}


def test(label: str, fn) -> bool:
    try:
        ok, msg = fn()
        status = PASS if ok else FAIL
        print(f"  [{status}] {label}: {msg}")
        results[label] = ok
        return ok
    except Exception as e:
        print(f"  [{FAIL}] {label}: Exception - {e}")
        results[label] = False
        return False


def check_imd():
    try:
        import imdlib  # noqa
        return True, "imdlib installed correctly - no API key needed for gridded data"
    except ImportError:
        return False, "imdlib not installed - run: pip install imdlib"


def check_mosdac():
    username = os.getenv("MOSDAC_USERNAME", "").strip()
    password = os.getenv("MOSDAC_PASSWORD", "").strip()
    if not username or not password:
        return False, "MOSDAC_USERNAME / MOSDAC_PASSWORD not set in .env"
    r = requests.post(
        "https://mosdac.gov.in/download_api/gettoken",
        json={"username": username, "password": password},
        timeout=20,
    )
    if r.status_code == 200 and r.json().get("access_token"):
        requests.post("https://mosdac.gov.in/download_api/logout",
                      json={"username": username}, timeout=10)
        return True, f"Login successful (user: {username})"
    if r.status_code == 401:
        return False, "Invalid credentials - check MOSDAC_USERNAME/MOSDAC_PASSWORD"
    if r.status_code == 429:
        return True, "Rate-limited (429) - credentials likely correct, too many recent logins"
    return False, f"Login failed - HTTP {r.status_code}: {r.text[:120]}"


def check_bhuvan():
    r = requests.get(
        "https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms",
        params={"SERVICE": "WMS", "REQUEST": "GetCapabilities"},
        timeout=20,
    )
    if r.status_code == 200:
        return True, "Bhuvan WMS accessible"
    return False, f"Bhuvan WMS returned HTTP {r.status_code}"


def check_imd_api():
    key = os.getenv("IMD_API_KEY", "")
    if not key:
        return True, "Not set (optional) - only needed for real-time forecasts"
    r = requests.get(
        "https://api.imd.gov.in/users/1.0.0/rainfall/district",
        headers={"x-api-key": key},
        timeout=15,
    )
    if r.status_code == 200:
        return True, "IMD API key is valid"
    return False, f"IMD API key rejected - HTTP {r.status_code}"


if __name__ == "__main__":
    print("\n" + "="*55)
    print("  Disaster Data Downloader - Credential Test")
    print("="*55 + "\n")

    test("IMD imdlib (historical rainfall)",  check_imd)
    test("MOSDAC login",                      check_mosdac)
    test("Bhuvan/NRSC WMS (hazard maps)",     check_bhuvan)
    test("IMD API key (real-time, optional)", check_imd_api)

    print("\n" + "-"*55)
    passed = sum(1 for v in results.values() if v)
    total  = len(results)
    print(f"  Result: {passed}/{total} checks passed")
    if passed == total:
        print("  All good! You can now run the download scripts.")
    else:
        print("  Fix the FAIL items above, then re-run this script.")
    print("="*55 + "\n")
