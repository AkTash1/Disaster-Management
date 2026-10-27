# Disaster Data Downloader

Python scripts to programmatically download **weather/rainfall**, **hydrology**, and **hazard map** data from Indian government portals for disaster management projects.

---

## Project Structure

```
disaster_data_downloader/
├── .env.example              ← Copy to .env and fill credentials
├── requirements.txt
├── 01_imd_rainfall.py        ← IMD gridded rainfall (imdlib, no key needed)
├── 02_mosdac_download.py     ← MOSDAC satellite data (login required)
├── 03_wris_hydrology.py      ← India-WRIS + NWIC hydrology data
├── 04_hazard_maps.py         ← GSI Bhukosh + Bhuvan WMS/WFS hazard maps
├── 05_run_all.py             ← Run everything at once
└── data/
    ├── imd/
    ├── mosdac/
    ├── hydrology/
    └── hazard_maps/
```

---

## Setup

```bash
# 1. Create a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up credentials
copy .env.example .env
# Edit .env with your portal credentials
```

---

## Script Reference

### 01 — IMD Gridded Rainfall *(No API key needed)*

Downloads daily gridded rainfall at 0.25° × 0.25° resolution (1901–2024).

```bash
# Download 2015-2023 rainfall + export as NetCDF
python 01_imd_rainfall.py --start 2015 --end 2023 --out ./data/imd/rain --nc

# Also download Tmin/Tmax
python 01_imd_rainfall.py --start 2015 --end 2023 --temp
```

| Flag | Description |
|---|---|
| `--start` | Start year (≥1901) |
| `--end` | End year (≤2024) |
| `--out` | Output directory |
| `--nc` | Export merged NetCDF after download |
| `--temp` | Also download Tmin / Tmax |

---

### 02 — MOSDAC Satellite Data *(Login required)*

Downloads INSAT satellite products (rainfall estimates, cloud imagery, etc.)

```bash
# List available datasets
python 02_mosdac_download.py --list

# Download a specific dataset
python 02_mosdac_download.py \
  --dataset INSAT3D_L1C_HDF \
  --start-date 2023-06-01 \
  --end-date   2023-09-30 \
  --out ./data/mosdac
```

**Credential setup:** Add `MOSDAC_USERNAME` and `MOSDAC_PASSWORD` to `.env`.

---

### 03 — Hydrology: WRIS + NWIC *(NWIC is free; WRIS needs token)*

```bash
# Download NWIC public river discharge (no login needed)
python 03_wris_hydrology.py --source nwic --action discharge --out ./data/hydrology

# List all WRIS gauge stations in Kerala
python 03_wris_hydrology.py --source wris --action list-stations --state "Kerala"

# Download discharge for a specific WRIS station
python 03_wris_hydrology.py \
  --source wris --action discharge \
  --station-id 12345 \
  --start 2020-01-01 --end 2023-12-31 \
  --out ./data/hydrology

# Download reservoir storage levels
python 03_wris_hydrology.py --source wris --action reservoir --out ./data/hydrology
```

**WRIS Token:** After logging in at indiawris.gov.in, open browser DevTools → Network tab → copy the `Authorization: Bearer ...` token → paste into `.env` as `WRIS_AUTH_TOKEN`.

---

### 04 — Hazard Maps: GSI Bhukosh + Bhuvan *(Registration required)*

```bash
# List all available layers on GSI and Bhuvan
python 04_hazard_maps.py --source gsi    --action list
python 04_hazard_maps.py --source bhuvan --action list

# Download GSI Landslide Susceptibility as GeoJSON + Shapefile (WFS)
python 04_hazard_maps.py --source gsi --layer landslide --action wfs --out ./data/hazard_maps/gsi

# Download Bhuvan Landslide map as PNG (WMS)
python 04_hazard_maps.py --source bhuvan --layer landslide --action wms --out ./data/hazard_maps/bhuvan

# Download Landslide Atlas of India PDF
python 04_hazard_maps.py --source bhuvan --action pdf --out ./data/hazard_maps/bhuvan

# Other hazard layers
python 04_hazard_maps.py --source gsi --layer seismic   --action wfs --out ./data/hazard_maps/gsi
python 04_hazard_maps.py --source gsi --layer flood     --action wfs --out ./data/hazard_maps/gsi
python 04_hazard_maps.py --source bhuvan --layer flood  --action wms --out ./data/hazard_maps/bhuvan
```

---

### 05 — Run All

Edit the `CONFIG` block inside `05_run_all.py`, then:

```bash
python 05_run_all.py
```

---

## What Requires Registration / Credentials?

| Source | Access | What to do |
|---|---|---|
| **IMD Gridded Rainfall** | **Free, no login** | Just run the script |
| **IMD API** (real-time) | API key | Register at api.imd.gov.in |
| **MOSDAC** | Username + Password | Register at mosdac.gov.in |
| **NWIC** (public CSVs) | **Free, no login** | Just run the script |
| **India-WRIS** | Bearer token | Login → copy token from browser DevTools |
| **GSI Bhukosh** | Registration | Register at bhukosh.gsi.gov.in |
| **Bhuvan/NRSC** | Registration | Register at bhuvan.nrsc.gov.in |

---

## Tips

- **CWC restricted data** (sub-daily discharge, rating curves) cannot be scripted — submit a formal Data Request Form to CWC with a Secrecy Undertaking.
- Run `--action list` on `04_hazard_maps.py` first to confirm exact layer names before downloading.
- For large WFS downloads, use `--bbox` chunking or download pre-packaged shapefiles from Bhukosh's "Unified Download" section.
- If WRIS blocks requests from outside India, route through an Indian IP (cloud VM or VPN).
