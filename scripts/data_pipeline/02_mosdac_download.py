"""
02_mosdac_download.py
──────────────────────────────────────────────────────────────────────────────
Downloads satellite rainfall / weather data from MOSDAC (mosdac.gov.in)
using MOSDAC's official Download API (mdapi approach).

Official API Endpoints:
  Token   : POST https://mosdac.gov.in/download_api/gettoken
  Search  : GET  https://mosdac.gov.in/apios/datasets.json
  Download: GET  https://mosdac.gov.in/download_api/download
  Refresh : POST https://mosdac.gov.in/download_api/refresh-token
  Logout  : POST https://mosdac.gov.in/download_api/logout

Key Datasets for Disaster / Rainfall:
  3RIMG_L2B_IMC  – INSAT-3DR IMSRA Rainfall  (recommended)
  3DIMG_L2B_HEM  – INSAT-3D  Hydro-Estimator Rainfall
  3SIMG_L2B_IMC  – INSAT-3DS IMSRA Rainfall
  3RIMG_L2B_HEM  – INSAT-3DR Hydro-Estimator Rainfall
  3DIMG_L2B_IMC  – INSAT-3D  IMSRA Rainfall

Usage:
  python 02_mosdac_download.py --dataset 3RIMG_L2B_IMC --start 2025-06-01 --end 2025-06-30
  python 02_mosdac_download.py --dataset 3DIMG_L2B_HEM --start 2024-08-01 --end 2024-08-31 --bbox "68,8,97,37" --yes
  python 02_mosdac_download.py --dataset 3RIMG_L2B_IMC --start 2025-01-01 --end 2025-01-07 --list-only

Prerequisites:
  pip install requests tqdm python-dotenv
  Copy .env.example -> .env  and fill MOSDAC_USERNAME / MOSDAC_PASSWORD
"""

import argparse
import logging
import os
import sys
import time
from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv

try:
    from tqdm import tqdm
    HAS_TQDM = True
except ImportError:
    HAS_TQDM = False

load_dotenv()

# ── Official MOSDAC API Endpoints ─────────────────────────────────────────────
TOKEN_URL    = "https://mosdac.gov.in/download_api/gettoken"
SEARCH_URL   = "https://mosdac.gov.in/apios/datasets.json"
DOWNLOAD_URL = "https://mosdac.gov.in/download_api/download"
REFRESH_URL  = "https://mosdac.gov.in/download_api/refresh-token"
LOGOUT_URL   = "https://mosdac.gov.in/download_api/logout"
INET_CHECK   = "https://mosdac.gov.in/download_api/check-internet"

DISASTER_DATASETS = {
    "3RIMG_L2B_IMC": "INSAT-3DR IMSRA Rainfall (recommended)",
    "3DIMG_L2B_HEM": "INSAT-3D Hydro-Estimator Rainfall",
    "3SIMG_L2B_IMC": "INSAT-3DS IMSRA Rainfall",
    "3RIMG_L2B_HEM": "INSAT-3DR Hydro-Estimator Rainfall",
    "3DIMG_L2B_IMC": "INSAT-3D IMSRA Rainfall",
    "3DIMG_L2B_LST": "Land Surface Temperature (INSAT-3D)",
}

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s – %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("mosdac")


# ── Auth ──────────────────────────────────────────────────────────────────────
def get_token(username: str, password: str) -> dict:
    """Authenticate and return access + refresh tokens. Retries on 429."""
    log.info("Authenticating with MOSDAC...")
    retry_delays = [30, 60, 120]   # seconds to wait on rate-limit

    for attempt, delay in enumerate(retry_delays + [None]):
        try:
            r = requests.post(TOKEN_URL, json={"username": username, "password": password}, timeout=30)
        except requests.RequestException as e:
            log.error(f"Network error during login: {e}")
            sys.exit(1)

        if r.status_code == 429:
            if delay is None:
                log.error("Still rate-limited after multiple retries. Try again in a few minutes.")
                sys.exit(1)
            wait = r.headers.get("Retry-After", delay)
            log.warning(f"Login rate-limited (429). Waiting {wait}s before retry {attempt + 1}/{len(retry_delays)}…")
            time.sleep(int(wait))
            continue

        if r.status_code == 401:
            log.error("Invalid username or password. Check MOSDAC_USERNAME/MOSDAC_PASSWORD in .env")
            sys.exit(1)
        if r.status_code == 400:
            log.error(f"Login validation error: {r.json().get('error', r.text)}")
            sys.exit(1)
        if r.status_code == 503:
            log.error("MOSDAC server is under maintenance. Try again later.")
            sys.exit(1)

        r.raise_for_status()
        data = r.json()
        log.info(f"Login successful. Hello, {username}!")
        return {"access_token": data["access_token"], "refresh_token": data["refresh_token"]}


def refresh_access_token(refresh_tok: str) -> dict | None:
    """Refresh the access token."""
    try:
        r = requests.post(REFRESH_URL, json={"refresh_token": refresh_tok}, timeout=15)
        r.raise_for_status()
        return r.json()
    except requests.RequestException as e:
        log.error(f"Token refresh failed: {e}")
        return None


def logout(username: str) -> None:
    """Log out the user session."""
    try:
        requests.post(LOGOUT_URL, json={"username": username}, timeout=10)
        log.info(f"Logged out. Goodbye, {username}!")
    except requests.RequestException:
        log.warning("Logout request failed (session may have already expired).")


# ── Search ────────────────────────────────────────────────────────────────────
def search_files(
    dataset_id: str,
    start_time: str = "",
    end_time: str = "",
    bounding_box: str = "",
    start_index: int = 1,
    count: str = "",
) -> dict:
    """Query MOSDAC search endpoint. Returns raw JSON response."""
    params = {"datasetId": dataset_id, "startIndex": start_index}
    if start_time:    params["startTime"]   = start_time
    if end_time:      params["endTime"]     = end_time
    if bounding_box:  params["boundingBox"] = bounding_box
    if count:         params["count"]       = count

    try:
        r = requests.get(SEARCH_URL, params=params, timeout=60)
    except requests.RequestException as e:
        log.error(f"Search request failed: {e}")
        sys.exit(1)

    if r.status_code != 200:
        msg = r.json().get("message", [r.text])
        log.error(f"Search error (HTTP {r.status_code}): {msg[0] if isinstance(msg, list) else msg}")
        sys.exit(1)

    return r.json()


def list_all_entries(
    dataset_id: str,
    start_time: str = "",
    end_time: str = "",
    bounding_box: str = "",
    batch: int = 100,
) -> list[dict]:
    """Paginate through all results and return every file entry."""
    first = search_files(dataset_id, start_time, end_time, bounding_box, start_index=1)
    total   = first.get("totalResults", 0)
    size_mb = first.get("totalSizeMB", 0)

    if total == 0:
        log.warning("No files found for the given parameters.")
        return []

    size_str = f"{size_mb / 1024:.2f} GB" if size_mb >= 1024 else f"{size_mb:.2f} MB"
    log.info(f"Found {total:,} file(s)  –  total size: {size_str}")

    entries = first.get("entries", [])
    start_idx = batch + 1

    while len(entries) < total:
        page = search_files(dataset_id, start_time, end_time, bounding_box, start_index=start_idx)
        batch_entries = page.get("entries", [])
        if not batch_entries:
            break
        entries.extend(batch_entries)
        start_idx += batch

    return entries


# ── Download ──────────────────────────────────────────────────────────────────
def download_file(
    record_id: str,
    identifier: str,
    prod_date: str,
    access_token: str,
    out_dir: str,
    by_date: bool = True,
) -> str | None:
    """
    Download a single file. Returns:
      - local file path  on success
      - None             if skipped or unavailable
      - "TOKEN_EXPIRED"  if token needs refresh
      - "DAILY_LIMIT"    if daily quota hit
    """
    # Folder structure
    if by_date and prod_date:
        try:
            dt = datetime.strptime(prod_date, "%Y-%m-%dT%H:%M:%SZ")
            folder = Path(out_dir) / str(dt.year) / f"{dt.day:02d}{dt.strftime('%b').upper()}"
        except ValueError:
            folder = Path(out_dir)
    else:
        folder = Path(out_dir)

    folder.mkdir(parents=True, exist_ok=True)
    dest = folder / identifier

    if dest.exists():
        log.info(f"  [skip] {identifier} already exists.")
        return None

    headers = {"Authorization": f"Bearer {access_token}"}
    params  = {"id": record_id}
    tmp     = dest.with_suffix(dest.suffix + ".part")

    retry_delays = [10, 20, 30, 60, 90, 120]

    for attempt, delay in enumerate(retry_delays + [None]):
        try:
            r = requests.get(DOWNLOAD_URL, headers=headers, params=params,
                             stream=True, timeout=30)

            if r.status_code == 401:
                code = r.json().get("code", "")
                if code in ("INVALID_TOKEN", "NO_ACCESS_TOKEN"):
                    return "TOKEN_EXPIRED"

            if r.status_code == 404:
                if r.json().get("code") == "NOT_RELEASED":
                    log.warning(f"  {identifier}: Not yet released on MOSDAC. Skipping.")
                    return None

            if r.status_code == 429:
                err = r.json()
                log.warning(f"  Rate limited ({err.get('type')}): {err.get('message')}")
                if err.get("type") == "daily_limit":
                    log.error("Daily download limit reached.")
                    return "DAILY_LIMIT"
                time.sleep(20)
                continue

            r.raise_for_status()

            if "filename=" not in r.headers.get("Content-Disposition", ""):
                log.warning(f"  {identifier}: File not available on server. Skipping.")
                return None

            total_size = int(r.headers.get("Content-Length", 0))
            size_str   = f"{total_size / (1024**2):.1f} MB"
            log.info(f"  → {identifier}  [{size_str}]")

            with open(tmp, "wb") as f:
                if HAS_TQDM:
                    with tqdm(total=total_size, unit="B", unit_scale=True,
                              unit_divisor=1024, desc=identifier[:40], ascii=True) as bar:
                        for chunk in r.iter_content(chunk_size=1 << 20):
                            if chunk:
                                f.write(chunk)
                                bar.update(len(chunk))
                else:
                    for chunk in r.iter_content(chunk_size=1 << 20):
                        if chunk:
                            f.write(chunk)

            tmp.rename(dest)
            return str(dest)

        except (requests.ConnectionError, requests.Timeout) as e:
            if delay is None:
                log.error(f"  Network error after {len(retry_delays)} attempts: {e}")
                if tmp.exists():
                    tmp.unlink()
                return None
            log.warning(f"  Network error. Retrying in {delay}s…")
            if tmp.exists():
                tmp.unlink()
            time.sleep(delay)

        except PermissionError:
            log.error(f"  No write permission: {folder}")
            sys.exit(1)


# ── Orchestration ─────────────────────────────────────────────────────────────
def run_download(
    dataset_id: str,
    username: str,
    password: str,
    start_time: str = "",
    end_time: str = "",
    bounding_box: str = "",
    out_dir: str = "./data/mosdac",
    by_date: bool = True,
    list_only: bool = False,
    auto_yes: bool = False,
) -> None:
    log.info(f"Dataset     : {dataset_id}  — {DISASTER_DATASETS.get(dataset_id, 'custom dataset')}")
    if start_time:    log.info(f"Start       : {start_time}")
    if end_time:      log.info(f"End         : {end_time}")
    if bounding_box:  log.info(f"Bounding box: {bounding_box}")
    log.info(f"Output dir  : {out_dir}")
    print()

    entries = list_all_entries(dataset_id, start_time, end_time, bounding_box)
    if not entries:
        return

    if list_only:
        print("\nFiles available (--list-only, not downloading):")
        for e in entries:
            print(f"  {e.get('identifier', '?')}  ({e.get('updated', '?')})")
        return

    if not auto_yes:
        resp = input(f"\nDownload {len(entries):,} file(s)? [Y/N]: ").strip().lower()
        if resp not in ("y", "yes"):
            log.info("Download cancelled.")
            return

    tokens  = get_token(username, password)
    acc_tok = tokens["access_token"]
    ref_tok = tokens["refresh_token"]

    downloaded, skipped = 0, 0
    t_start = time.time()

    for i, entry in enumerate(entries, 1):
        record_id  = entry.get("id", "")
        identifier = entry.get("identifier", f"file_{i}")
        prod_date  = entry.get("updated", "")

        print(f"\n[{i}/{len(entries)}]", end=" ")
        result = download_file(record_id, identifier, prod_date, acc_tok, out_dir, by_date)

        if result == "TOKEN_EXPIRED":
            log.info("Token expired. Refreshing…")
            new_tokens = refresh_access_token(ref_tok)
            if not new_tokens:
                log.error("Could not refresh token. Stopping.")
                break
            acc_tok = new_tokens["access_token"]
            ref_tok = new_tokens["refresh_token"]
            result  = download_file(record_id, identifier, prod_date, acc_tok, out_dir, by_date)

        if result == "DAILY_LIMIT":
            break

        if result:
            downloaded += 1
        else:
            skipped += 1

    elapsed = time.time() - t_start
    print()
    log.info(f"Complete — {downloaded} downloaded, {skipped} skipped in {elapsed/60:.1f} min")
    logout(username)


# ── CLI ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Download rainfall/weather data from MOSDAC",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Disaster-relevant dataset IDs:
  3RIMG_L2B_IMC  — INSAT-3DR IMSRA Rainfall          (recommended)
  3DIMG_L2B_HEM  — INSAT-3D  Hydro-Estimator Rainfall
  3SIMG_L2B_IMC  — INSAT-3DS IMSRA Rainfall
  3RIMG_L2B_HEM  — INSAT-3DR Hydro-Estimator Rainfall
  3DIMG_L2B_IMC  — INSAT-3D  IMSRA Rainfall

Examples:
  python 02_mosdac_download.py --dataset 3RIMG_L2B_IMC --start 2025-06-01 --end 2025-06-30
  python 02_mosdac_download.py --dataset 3DIMG_L2B_HEM --start 2024-08-01 --end 2024-08-31 --bbox "68,8,97,37" --yes
  python 02_mosdac_download.py --dataset 3RIMG_L2B_IMC --start 2025-01-01 --end 2025-01-07 --list-only
        """,
    )
    parser.add_argument("--dataset",      required=True,
                        help="MOSDAC datasetId (see list above)")
    parser.add_argument("--start",        default="", help="Start date YYYY-MM-DD")
    parser.add_argument("--end",          default="", help="End date YYYY-MM-DD")
    parser.add_argument("--bbox",         default="",
                        help="Bounding box: minLon,minLat,maxLon,maxLat (e.g. '68,8,97,37' for India)")
    parser.add_argument("--out",          default="./data/mosdac", help="Output directory")
    parser.add_argument("--no-date-dirs", action="store_true",
                        help="Don't organise downloads into YYYY/DDMON subfolders")
    parser.add_argument("--list-only",    action="store_true",
                        help="List files without downloading")
    parser.add_argument("--yes", "-y",    action="store_true",
                        help="Auto-confirm download")
    args = parser.parse_args()

    USERNAME = os.getenv("MOSDAC_USERNAME", "").strip()
    PASSWORD = os.getenv("MOSDAC_PASSWORD", "").strip()

    if not USERNAME or not PASSWORD:
        print("ERROR: Set MOSDAC_USERNAME and MOSDAC_PASSWORD in your .env file.")
        print("       Copy .env.example -> .env and fill in your credentials.")
        sys.exit(1)

    run_download(
        dataset_id   = args.dataset,
        username     = USERNAME,
        password     = PASSWORD,
        start_time   = args.start,
        end_time     = args.end,
        bounding_box = args.bbox,
        out_dir      = args.out,
        by_date      = not args.no_date_dirs,
        list_only    = args.list_only,
        auto_yes     = args.yes,
    )
