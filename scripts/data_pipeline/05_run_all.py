"""
05_run_all.py
──────────────
Master runner — calls all active downloaders in sequence.

Active sources (as of Aug 2026):
  ✅ IMD     — Historical gridded rainfall (01_imd_rainfall.py)
  ✅ MOSDAC  — INSAT-3DR satellite rainfall (02_mosdac_download.py)
  ✅ Bhuvan  — Hazard/landslide maps WMS+PDF (04_hazard_maps.py)

Removed (sites unreachable):
  ❌ India-WRIS  (indiawris.gov.in — timed out)
  ❌ CWC         (cwc.gov.in — timed out)
  ❌ GSI Bhukosh (bhukosh.gsi.gov.in — timed out)

Edit the CONFIG block below to match your requirements,
then run:   python 05_run_all.py
"""

import subprocess
import sys
import os

PYTHON = sys.executable   # uses the same venv/interpreter

# ── Edit these to match your project ─────────────────────────────────────────
CONFIG = {
    # IMD gridded rainfall (historical, no login needed)
    "imd": {
        "start": "2010",
        "end":   "2023",
        "out":   "./data/imd/rain",
        "nc":    True,    # also export merged NetCDF
    },

    # MOSDAC INSAT-3DR rainfall (needs MOSDAC_USERNAME/PASSWORD in .env)
    "mosdac": {
        "dataset":    "3RIMG_L2B_IMC",   # INSAT-3DR IMSRA Rainfall
        "start":      "2023-06-01",
        "end":        "2023-06-30",
        "bbox":       "68,8,97,37",       # India bounding box
        "out":        "./data/mosdac",
    },

    # Bhuvan/NRSC hazard maps (public, no login needed)
    "hazard_bhuvan_wms": {
        "layer":  "landslide",
        "action": "wms",
        "out":    "./data/hazard_maps/bhuvan",
    },
    "hazard_bhuvan_pdf": {
        "action": "pdf",
        "out":    "./data/hazard_maps/bhuvan",
    },
}
# ─────────────────────────────────────────────────────────────────────────────


def run(cmd: list[str], label: str) -> None:
    print(f"\n{'='*60}")
    print(f"  RUNNING: {label}")
    print(f"{'='*60}")
    result = subprocess.run(cmd, check=False)
    if result.returncode != 0:
        print(f"  WARNING: {label} exited with code {result.returncode}")
    else:
        print(f"  DONE: {label}")


if __name__ == "__main__":
    # 1. IMD rainfall
    c = CONFIG["imd"]
    cmd = [PYTHON, "01_imd_rainfall.py",
           "--start", c["start"], "--end", c["end"], "--out", c["out"]]
    if c["nc"]:
        cmd.append("--nc")
    run(cmd, "IMD Gridded Rainfall")

    # 2. MOSDAC satellite rainfall
    c = CONFIG["mosdac"]
    run([PYTHON, "02_mosdac_download.py",
         "--dataset", c["dataset"],
         "--start",   c["start"],
         "--end",     c["end"],
         "--bbox",    c["bbox"],
         "--out",     c["out"],
         "--yes"],
        "MOSDAC INSAT-3DR Rainfall")

    # 3. Bhuvan landslide map image (WMS)
    c = CONFIG["hazard_bhuvan_wms"]
    run([PYTHON, "04_hazard_maps.py",
         "--layer",  c["layer"],
         "--action", c["action"],
         "--out",    c["out"]],
        "Bhuvan Landslide Map (WMS Image)")

    # 4. Bhuvan Landslide Atlas PDF
    c = CONFIG["hazard_bhuvan_pdf"]
    run([PYTHON, "04_hazard_maps.py",
         "--action", c["action"],
         "--out",    c["out"]],
        "Bhuvan Landslide Atlas PDF")

    print("\n✅ All downloads finished.")
    print(f"   Data saved under: {os.path.abspath('./data')}")
