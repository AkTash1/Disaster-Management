# Disaster Data Downloader — Data Catalog


---

## Table of Contents

1. [IMD Gridded Rainfall](#1-imd-gridded-rainfall)
2. [MOSDAC — INSAT-3DR Satellite Rainfall](#2-mosdac--insat-3dr-satellite-rainfall)
3. [CWC — Telemetry Hourly Rainfall](#3-cwc--telemetry-hourly-rainfall-hydrology)
4. [Bhuvan/NRSC — WMS Hazard & LULC Maps](#4-bhuvannrsc--wms-hazard--lulc-maps)
5. [Bhoonidhi — EOS-04 SAR Imagery](#5-bhoonidhi--eos-04-sar-c-band-imagery)
6. [Cross-Source Summary](#6-cross-source-summary)

---

## 1. IMD Gridded Rainfall

**Source / Product Name:** India Meteorological Department (IMD) High-Resolution Daily Gridded Rainfall Dataset
**Portal:** `https://imdpune.gov.in/`
**Citation:** Pai et al. (2014), Mausam
**Downloaded via:** `imdlib` Python library → `01_imd_rainfall.py`

### Files

| File | Format | Size | Temporal Coverage |
|---|---|---|---|
| `data/imd/rain/imd_rain_2020_2022.nc` | NetCDF-4 (CF-1.7) | 145.6 MB | 2020-01-01 → 2022-12-31 (1096 days) |
| `data/imd/rain/rain/2020.grd` | Binary IEEE-754 float32 | 24.3 MB | 2020-01-01 → 2020-12-31 (366 days) |
| `data/imd/rain/rain/2021.grd` | Binary IEEE-754 float32 | 24.2 MB | 2021-01-01 → 2021-12-31 (365 days) |
| `data/imd/rain/rain/2022.grd` | Binary IEEE-754 float32 | 24.2 MB | 2022-01-01 → 2022-12-31 (365 days) |

### Attributes

| Attribute | Name | Description | Data Type | Unit | Value / Range |
|---|---|---|---|---|---|
| **Variable** | `rain` | Daily accumulated rainfall | float64 (NC) / float32 (GRD) | mm/day | 0.0 – 979.1 mm/day (max observed); -999.0 = fill/ocean |
| **Valid coverage** | — | Land-covered grid cells only | — | — | 5,440,544 valid / 19,086,840 total = **28.5%** (India land mask) |
| **Coordinate** | `lat` | Geographic latitude (WGS84) | float64 | degrees_north | 6.5° N to 38.5° N |
| **Coordinate** | `lon` | Geographic longitude (WGS84) | float64 | degrees_east | 66.5° E to 100.0° E |
| **Coordinate** | `time` | Date of observation | datetime64[ns] | days | 2020-01-01 to 2022-12-31 |

### Spatial / Temporal Information

| Parameter | Value |
|---|---|
| **Spatial Resolution** | 0.25° × 0.25° (~28 km at equator) |
| **Grid Dimensions** | 129 (lat) × 135 (lon) = 17,415 grid cells/day |
| **CRS** | EPSG:4326 (WGS 84 geographic) |
| **Bounding Box** | W: 66.5°E · E: 100.0°E · S: 6.5°N · N: 38.5°N (covers all of India) |
| **Temporal Resolution** | Daily (24-hour accumulation ending ~08:30 IST / 03:00 UTC) |
| **Temporal Coverage** | 3 years: 2020, 2021, 2022 |
| **Total Records** | 1,096 days × 17,415 cells = 19,086,840 data points |
| **Missing Value** | -999.0 (ocean, outside India boundary, insufficient data) |

### Global Attributes (NetCDF)

```
Conventions: CF-1.7
title:       IMD gridded data
source:      https://imdpune.gov.in/
crs:         epsg:4326
history:     2026-08-24 Python
```

---

## 2. MOSDAC — INSAT-3DR Satellite Rainfall

**Source / Product Name:** INSAT-3DR Imager-based IMSRA (Improved Multi-spectral Satellite-based Rainfall Algorithm), Level-2B IMC (Image Motion Compensation)
**Satellite:** INSAT-3DR (ISRO geostationary)
**Sensor:** IMAGER (IMG)
**Ground Station:** BES, SAC/ISRO, Ahmedabad
**Portal:** `https://mosdac.gov.in/`
**Downloaded via:** `02_mosdac_download.py`

### Files

| File | Size | Acquisition Time (UTC) | Product ID |
|---|---|---|---|
| `3RIMG_01AUG2025_2115_L2B_IMC_V01R00.h5` | 10.2 MB | 2025-08-01 21:15:40 – 21:42:34 | 3RIMG_01AUG2025_2115 |
| `3RIMG_01AUG2025_2145_L2B_IMC_V01R00.h5` | 10.2 MB | 2025-08-01 21:45 | — |
| `3RIMG_01AUG2025_2215_L2B_IMC_V01R00.h5` | 10.2 MB | 2025-08-01 22:15 | — |
| `3RIMG_01AUG2025_2245_L2B_IMC_V01R00.h5` | 10.1 MB | 2025-08-01 22:45 | — |
| `3RIMG_01AUG2025_2315_L2B_IMC_V01R00.h5` | 10.1 MB | 2025-08-01 23:15 | — |
| `3RIMG_01AUG2025_2345_L2B_IMC_V01R00.h5` | 10.1 MB | 2025-08-01 23:45 | — |

**Path structure:** `data/mosdac/YYYY/DDMON/filename.h5`

### HDF5 Datasets (per file)

| Dataset | Description | Shape | Data Type | Unit | Value Range |
|---|---|---|---|---|---|
| **`IMC`** | IMSRA Rainfall Rate (main product) | (1, 2816, 2805) | float32 | **mm/hr** | 0.0 – 60.0 mm/hr; fill=-999.0 |
| `Latitude` | Per-pixel latitude (apply scale_factor × 0.01) | (2816, 2805) | int16 | degrees_north | -81.04° to +81.04°; fill=32767 |
| `Longitude` | Per-pixel longitude (apply scale_factor × 0.01) | (2816, 2805) | int16 | degrees_east | -7.16° to 155.16°; fill=32767 |
| `GeoX` | Column index (pixel coordinate) | (2805,) | int32 | — | 0 – 2804 |
| `GeoY` | Row index (pixel coordinate) | (2816,) | int32 | — | 0 – 2815 |
| `time` | Acquisition time | (1,) | float64 | minutes since 2000-01-01 | 13456635 (= 2025-08-01 21:15 UTC) |

### IMC Dataset Attributes

| Attribute | Value |
|---|---|
| `long_name` | IMSRA (Improved) |
| `standard_name` | Precipitation |
| `units` | mm/hr |
| `_FillValue` | -999.0 |
| `coordinates` | time Latitude Longitude |

### Latitude/Longitude Scaling

```python
actual_lat = Latitude * 0.009999999776  # scale_factor from attrs
actual_lon = Longitude * 0.009999999776
# FillValue for both = 32767 (int16 max → skip)
```

### Spatial / Temporal Information

| Parameter | Value |
|---|---|
| **Satellite orbit** | Geostationary at 74°E longitude |
| **Nominal altitude** | 36,000 km |
| **Full-disk coverage** | Lat: -81.04° to +81.04° · Lon: -7.16° to +155.16° |
| **Grid dimensions** | 2816 rows × 2805 cols (~7.9 million pixels/granule) |
| **Spatial resolution** | ~4 km × 4 km (at nadir) |
| **Temporal resolution** | 30-minute intervals |
| **Test data period** | 2025-08-01 21:15 – 23:45 UTC (6 granules) |
| **Processing level** | L2B (Geophysical) |
| **File format** | HDF5 (CF-1.6 conventions) |

### File Naming Convention

```
3RIMG_DDMMMYYYY_HHMM_L2B_IMC_V01R00.h5
│      │         │    │   │   │
│      │         │    │   │   └─ Version/Revision
│      │         │    │   └───── Product: IMC (Image Motion Compensation)
│      │         │    └───────── Processing Level: L2B
│      │         └────────────── Acquisition time (UTC)
│      └──────────────────────── Acquisition date
└─────────────────────────────── Satellite: 3R = INSAT-3DR
```

### Global File Attributes

```
Satellite_Name:     INSAT-3DR
Sensor_Id:          IMG
Sensor_Name:        IMAGER
Processing_Level:   L2B
Product_Type:       GEOPHY
Acquisition_Date:   01AUG2025
Nominal_Altitude:   36000 km
Sub-satellite Point: 0°N, 74°E
Software_Version:   1.0
conventions:        CF-1.6
```

---

## 3. CWC — Telemetry Hourly Rainfall (Hydrology)

**Source / Product Name:** CWC (Central Water Commission) Telemetry-based Hourly Rainfall — Uttarakhand State
**Agency:** Uttarakhand State Government / CWC
**Downloaded via:** Data portal (telemetry network)
**File:** `data/hydrology/rainfall_tel_hr_uttarakhand_uk_2021_2025.csv`

### File Statistics

| Property | Value |
|---|---|
| **File size** | 4.4 MB |
| **Format** | CSV (comma-separated) |
| **Total rows** | 37,410 records |
| **Total columns** | 20 |
| **Stations** | 47 unique gauging stations |
| **Districts** | 13 (all districts of Uttarakhand) |
| **Time period** | Oct 2022 – (multi-year to 2025) |
| **Null values** | 0 (no null values in any column) |

### Column / Attribute Metadata

| # | Column Name | Description | Data Type | Unit | Example / Value Range |
|---|---|---|---|---|---|
| 1 | `SlNo` | Serial number (row index) | int64 | — | 1 – 37,410 |
| 2 | `Station` | Telemetry rain gauge station name | str | — | 47 unique: Almora_1, Assan_1, Badrinath_1, Bahadarabad, Baijnath (Gomti), Chamoli_1, Dehradun_1, … |
| 3 | `Agency` | Responsible state agency | str | — | "Uttarakhand" (all records) |
| 4 | `State LGD Code` | Government LGD code for state | int64 | — | 5 (Uttarakhand) |
| 5 | `State` | State name | str | — | "Uttarakhand" |
| 6 | `District LGD Code` | Government LGD district code | int64 | — | 45–57 (13 districts) |
| 7 | `District` | District name | str | — | Almora, Bageshwar, Chamoli, Champawat, Dehradun, Haridwar, Nainital, Pauri, Pithoragarh, Rudraprayag, Tehri, Udham Singh Nagar, Uttarkashi |
| 8 | `Tehsil` | Sub-district administrative unit | str | — | 11 unique values; "-" where unknown |
| 9 | `Block` | Block-level unit | str | — | "-" (not filled) |
| 10 | `Village` | Village name | str | — | "-" (not filled) |
| 11 | `River` | River the station is near | str | — | "-" or "Kali" (2 unique) |
| 12 | `Basin` | River basin name | str | — | "-" or "Ganga" (2 unique) |
| 13 | `Tributary` | Tributary name | str | — | "-" (not filled) |
| 14 | `Subtributary` | Sub-tributary name | str | — | "-" (not filled) |
| 15 | `SubSubtributary` | Sub-sub-tributary | str | — | "-" (not filled) |
| 16 | `Local River` | Local river name | str | — | "-" (not filled) |
| 17 | `Latitude` | Station latitude (WGS84) | float64 | degrees_north | 28.93° – 31.02° N |
| 18 | `Longitude` | Station longitude (WGS84) | float64 | degrees_east | 77.67° – 80.54° E |
| 19 | `Data Acquisition Time` | Timestamp of measurement | str (datetime) | — | Format: "DD-MM-YYYY HH:00" · 11,477 unique timestamps |
| 20 | `Telemetry Hourly Rainfall (mm)` | Measured hourly rainfall | float64 | **mm/hour** | Raw: -503.5 to 511.5 mm/hr · **Valid (0–300):** 35,687 / 37,410 records (95.4%) · Mean: 20.3 · Median: 1.5 |

### Spatial / Temporal Information

| Parameter | Value |
|---|---|
| **Spatial coverage** | State of Uttarakhand |
| **Station bounding box** | Lat: 28.93° – 31.02° N · Lon: 77.67° – 80.54° E |
| **Number of stations** | 47 telemetry rain gauges |
| **Temporal resolution** | Hourly |
| **Temporal coverage** | 2023-01-01 00:00 to 2024-12-31 23:00 (2 years, hourly) · 11,477 unique time steps |
| **CRS** | EPSG:4326 (WGS 84) |

> [!NOTE]
> **Data quality note:** The minimum value is -503.5 mm/hr and max is 511.5 mm/hr. Negative values are telemetry anomalies / sensor errors and must be filtered (set to NaN) before analysis. The realistic physical range is 0 – ~150 mm/hr.

### Station List (Sample — District Coverage)

| District | Example Stations |
|---|---|
| Almora | Almora_1 |
| Dehradun | Yamuna Colony (most frequent, 3,277 records), Dehradun_1 |
| Chamoli | Chamoli_1, Badrinath_1 |
| Haridwar | Bahadarabad |
| Pithoragarh | Baijnath (Gomti) |
| Uttarkashi | — |
| (+ 8 more districts) | — |

---

## 4. Bhuvan/NRSC — WMS Hazard & LULC Maps

**Source / Product Name:** Bhuvan Geoportal — WMS raster layers
**Provider:** National Remote Sensing Centre (NRSC), ISRO
**Server:** `https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms`
**Downloaded via:** `04_hazard_maps.py` using OWSLib WMS GetMap
**Format:** PNG (RGBA, 2048 × 2048 px, transparent background)

> [!NOTE]
> HP district layers (Kangra, Mandi, Kullu, Shimla, HP LULC) were initially downloaded with the Uttarakhand bbox. They have been **re-downloaded with the correct Himachal Pradesh bbox** (75.5–79.0°E, 30.4–33.2°N). All files are now correct and verified.

### Complete Layer Inventory

| File | Layer ID | WMS Layer Name | Coverage | BBox Used | Size | Status |
|---|---|---|---|---|---|---|
| `bhuvan_sdv_uk_slope_landslide.png` | `uk_slope` | `sdv:uk_slope` | Uttarakhand | 77.5–81.1°E, 28.7–31.5°N | 4.4 MB | ✅ Correct |
| `bhuvan_sdv_hp_slope_landslide.png` | `hp_slope` | `sdv:hp_slope` | Himachal Pradesh | 75.5–79.0°E, 30.4–33.2°N | 4.8 MB | ✅ Correct |
| `bhuvan_moef_UK_LULC50K_1112_uk_lulc.png` | `uk_lulc` | `moef:UK_LULC50K_1112` | Uttarakhand | 77.5–81.1°E, 28.7–31.5°N | 160 KB | ✅ Correct |
| `bhuvan_moef_HP_LULC50K_1112_GB_hp_lulc.png` | `hp_lulc` | `moef:HP_LULC50K_1112_GB` | Himachal Pradesh | 75.5–79.0°E, 30.4–33.2°N | 101 KB | ✅ Re-downloaded (fixed) |
| `bhuvan_sisdpv2_UK_Chamoli_lulc_v2_uk_chamoli.png` | `uk_chamoli` | `sisdpv2:UK_Chamoli_lulc_v2` | Chamoli, UK | 77.5–81.1°E, 28.7–31.5°N | 452 KB | ✅ Correct |
| `bhuvan_sisdpv2_UK_Rudraprayag_lulc_v2_uk_rudraprayag.png` | `uk_rudraprayag` | `sisdpv2:UK_Rudraprayag_lulc_v2` | Rudraprayag, UK | 77.5–81.1°E, 28.7–31.5°N | 217 KB | ✅ Correct |
| `bhuvan_sisdpv2_UK_Uttarkashi_lulc_v2_uk_uttarkashi.png` | `uk_uttarkashi` | `sisdpv2:UK_Uttarkashi_lulc_v2` | Uttarkashi, UK | 77.5–81.1°E, 28.7–31.5°N | 458 KB | ✅ Correct |
| `bhuvan_sisdpv2_UK_Tehri_lulc_v2_uk_tehri.png` | `uk_tehri` | `sisdpv2:UK_Tehri_lulc_v2` | Tehri, UK | 77.5–81.1°E, 28.7–31.5°N | 352 KB | ✅ Correct |
| `bhuvan_sisdpv2_UK_Pithoragarh_lulc_v2_uk_pithoragarh.png` | `uk_pithoragarh` | `sisdpv2:UK_Pithoragarh_lulc_v2` | Pithoragarh, UK | 77.5–81.1°E, 28.7–31.5°N | 427 KB | ✅ Correct |
| `bhuvan_sisdpv2_HP_Shimla_lulc_v2_hp_shimla.png` | `hp_shimla` | `sisdpv2:HP_Shimla_lulc_v2` | Shimla, HP | 75.5–79.0°E, 30.4–33.2°N | 523 KB | ✅ Re-downloaded (fixed) |
| `bhuvan_sisdpv2_HP_Kullu_lulc_v2_hp_kullu.png` | `hp_kullu` | `sisdpv2:HP_Kullu_lulc_v2` | Kullu, HP | 75.5–79.0°E, 30.4–33.2°N | 449 KB | ✅ Re-downloaded (fixed) |
| `bhuvan_sisdpv2_HP_Kangra_lulc_v2_hp_kangra.png` | `hp_kangra` | `sisdpv2:HP_Kangra_lulc_v2` | Kangra, HP | 75.5–79.0°E, 30.4–33.2°N | 626 KB | ✅ Re-downloaded (fixed) |
| `bhuvan_sisdpv2_HP_Mandi_lulc_v2_hp_mandi.png` | `hp_mandi` | `sisdpv2:HP_Mandi_lulc_v2` | Mandi, HP | 75.5–79.0°E, 30.4–33.2°N | 509 KB | ✅ Re-downloaded (fixed) |

### Layer Attribute Metadata

| Attribute | Value (all layers) |
|---|---|
| **Image dimensions** | 2048 × 2048 pixels |
| **Color mode** | RGBA (4-channel, 8-bit per channel) |
| **Format** | PNG (lossless) |
| **WMS version** | 1.1.1 |
| **SRS** | EPSG:4326 |
| **Image format** | image/png |
| **Transparent** | true |

#### Slope Layer Details (`sdv:uk_slope`, `sdv:hp_slope`)

| Attribute | Value |
|---|---|
| **Physical meaning** | Terrain slope derived from CartoDEM / SRTM digital elevation model |
| **Unit** | Degrees (0° = flat, 90° = vertical) |
| **Disaster relevance** | Primary input for landslide susceptibility; steep slopes (>35°) = high risk |
| **Classification** | Categorical color ramp: flat (green) → moderate → steep (orange/red) |

#### LULC Layer Details (`moef:UK_LULC50K_1112`, `moef:HP_LULC50K_1112_GB`)

| Attribute | Value |
|---|---|
| **Scale** | 1:50,000 |
| **Year** | 2011–2012 |
| **Authority** | MoEF / ISRO LULC mapping |
| **LULC classes** | Agricultural land, Built-up, Forests, Water bodies, Wastelands, Scrubland, Snow/Glaciers |
| **Format** | Thematic color map (polygon fill) |

#### District LULC Layers (`sisdpv2:*_lulc_v2`)

| Attribute | Value |
|---|---|
| **Scale** | 1:10,000 (high resolution urban/peri-urban) |
| **Program** | SISDP (State Infrastructure Spatial Data Programme) Phase-2 |
| **Coverage** | Individual district level |
| **Disaster relevance** | Settlement mapping, exposed elements, flood/landslide vulnerability |

---

## 5. Bhoonidhi — EOS-04 SAR C-Band Imagery

**Source / Product Name:** EOS-04 (RISAT-1A) Synthetic Aperture Radar — Coarse Resolution ScanSAR (CRS), Dual Polarization (DH: HH + HV), Level-2B ARD (Analysis Ready Data — CEOS-ARD Normalized Radar Backscatter)
**Satellite:** EOS-04 (RISAT-1A) · Frequency: C-band, 5.40 GHz
**Portal:** `https://bhoonidhi.nrsc.gov.in/`
**Path:** `data/hazard_maps/Bhoonidhi/<scene_id>/`

### Scene Overview

| Parameter | Scene 1 | Scene 2 |
|---|---|---|
| **Acquisition Date** | **08-Jul-2023** | **28-Jul-2023** |
| **Context** | Pre-peak monsoon SAR baseline | Active monsoon flooding event |
| **Scene Center** | 30.345°N, 78.963°E (Uttarakhand) | 30.461°N, 77.825°E (Himachal/UK border) |

### Full Attribute Metadata (Both Scenes)

| Attribute | Feature Name | Description | Data Type | Unit | Scene 1 | Scene 2 |
|---|---|---|---|---|---|---|
| **Satellite** | `Satellite_Name` | Satellite identifier | str | — | EOS-04 (RISAT-1A) | EOS-04 (RISAT-1A) |
| **Sensor** | `Sensor` | Active microwave radar | str | — | SAR | SAR |
| **Frequency** | `Radar_Frequency` | C-band center frequency | float | GHz | 5.40 | 5.40 |
| **Wavelength** | — | Radar wavelength | float | cm | ~5.55 | ~5.55 |
| **Imaging Mode** | `Imaging_Mode` | CRS = Coarse Resolution ScanSAR | str | — | CRS (12 beams) | CRS (12 beams) |
| **Polarization** | `Polarization` | Dual HH + HV | str | — | DH (HH, HV) | DH (HH, HV) |
| **Acq. Date** | `Acquisition_Date` | UTC acquisition date | date | — | 2023-07-08 | 2023-07-28 |
| **Acq. Start** | `Acquisition_Start_Time` | UTC start time | datetime | — | 12:49:38.371 UTC | 12:16:25.699 UTC |
| **Orbit Number** | `Orbit_Number` | Satellite orbit count | int | — | 7704 | 8006 |
| **Orbit Direction** | `Orbit_Direction` | Pass direction | str | — | ASCENDING | ASCENDING |
| **Look Direction** | `Look_Direction` | Antenna look side | str | — | RIGHT | LEFT |
| **Incidence Angle** | `Incidence_Angle_Center` | Mid-swath local incidence | float | degrees | 49.29° | 36.32° |
| **Incidence Range** | `Incidence_Angle_Range` | Near to far range | float | degrees | 42.10° – 55.10° | 26.20° – 44.66° |
| **Altitude** | `Satellite_Altitude` | Orbital altitude | float | km | 527.25 | 532.39 |
| **Scene Center Lat** | `Scene_Center_Latitude` | Scene centroid latitude | float | degrees_N | 30.3454°N | 30.4606°N |
| **Scene Center Lon** | `Scene_Center_Longitude` | Scene centroid longitude | float | degrees_E | 78.9628°E | 77.8253°E |
| **BBox West** | `footprint_west` | Westernmost longitude | float | degrees_E | 77.6615° | 76.4341° |
| **BBox East** | `footprint_east` | Easternmost longitude | float | degrees_E | 80.2428° | 79.2435° |
| **BBox South** | `footprint_south` | Southernmost latitude | float | degrees_N | 29.4597° | 29.4514° |
| **BBox North** | `footprint_north` | Northernmost latitude | float | degrees_N | 31.2196° | 31.4572° |
| **Pixel Spacing** | `Output_Pixel_Spacing` | Ground sample distance | float | m | 36.0 × 36.0 | 36.0 × 36.0 |
| **Native Resolution** | `SAR_Resolution` | Azimuth × Range SAR resolution | float | m | Az: 44.16, Rg: 9.59 | Az: 44.16, Rg: 9.59 |
| **Image Dimensions** | `Image_Dimensions` | Rows × Cols (per band) | int | pixels | 5,301 × 6,801 | 6,001 × 7,351 |
| **CRS** | `Projection` | UTM coordinate system | str | — | EPSG:32644 (UTM Zone 44N) | EPSG:32643 (UTM Zone 43N) |
| **Data Type** | `Data_Type` | Pixel value encoding | str | — | UInt16 | UInt16 |
| **Nodata Value** | `Nodata` | No-data / border pixel value | int | — | 0 | 0 |
| **Radiometric Qty** | `Radiometric_Quantity` | Backscatter type | str | — | Gamma-0 (γ⁰) linear power | Gamma-0 (γ⁰) linear power |
| **Calibration** | `Calibration_Formula` | DN to dB conversion | str | — | γ⁰(dB) = 20·log₁₀(DN) − 66.55 | γ⁰(dB) = 20·log₁₀(DN) − 66.55 |
| **RTC Applied** | `Terrain_Correction` | Radiometric Terrain Correction | bool | — | Yes (Copernicus 30m DEM) | Yes (Copernicus 30m DEM) |
| **Product Level** | `Processing_Level` | ARD processing level | str | — | L2B (CEOS-ARD NRB) | L2B (CEOS-ARD NRB) |
| **HH Backscatter** | `imagery_HH.tif` | HH-polarization SAR image | UInt16 | DN (linear γ⁰) | Mean=942, Std=392, ~-7.07 dB | Mean=1049, Std=507, ~-6.14 dB |
| **HV Backscatter** | `imagery_HV.tif` | HV-polarization SAR image | UInt16 | DN (linear γ⁰) | Mean=445, Std=180, ~-13.58 dB | Mean=469, Std=206, ~-13.12 dB |
| **Valid DN Range** | — | Physical valid pixel range | int | — | 1 – 65,535 | 1 – 65,535 |

### Auxiliary Datasets (per scene)

| File | Dataset | Description | Data Type | Unit | Value Range |
|---|---|---|---|---|---|
| `*_mask.tif` | Pixel validity mask | 128=Valid; 16=Layover; 64=Shadow; 0=NoData | UInt8 | — | {0, 16, 64, 128} |
| `*_lia.tif` | Local Incidence Angle | Per-pixel terrain-corrected incidence angle | float32 | degrees | -2.0 (nodata) to ~60° |
| `*_area.tif` | Scattering Area | Local contributing scattering area per pixel | float32 | m² | 0.0 (nodata) to ~5000 |
| `*_HH_level_2B_grid.txt` | HH tie-point grid | Radiometric calibration tie points for HH | ASCII | — | — |
| `*_HV_level_2B_grid.txt` | HV tie-point grid | Radiometric calibration tie points for HV | ASCII | — | — |
| `product.xml` | Product metadata | Full CEOS-ARD XML metadata document | XML | — | — |
| `*_browse_rgb.geo.png` | RGB browse image | Quicklook false-color composite (HH/HV/HH) georeferenced | PNG RGBA | — | — |

> [!IMPORTANT]
> **UTM Zone mismatch:** Scene 1 is in EPSG:32644 (Zone 44N) and Scene 2 in EPSG:32643 (Zone 43N). Reproject both to a common CRS before co-registration or change detection analysis.

---

## 6. Cross-Source Summary

| Attribute | IMD | MOSDAC | CWC | Bhuvan WMS | Bhoonidhi SAR |
|---|---|---|---|---|---|
| **Variable** | Daily rainfall | Half-hourly rainfall rate | Hourly rainfall | Slope / LULC maps | C-band radar backscatter |
| **Unit** | mm/day | mm/hr | mm/hr | — (visual/thematic) | DN (γ⁰ linear) |
| **Spatial type** | Gridded raster | Gridded raster (geostationary) | Point (station) | Raster image (WMS) | SAR image raster |
| **Spatial resolution** | 0.25° (~28 km) | ~4 km | Point gauge | 2048×2048 px / bbox | 36 m GSD |
| **Temporal resolution** | Daily | 30-minute | Hourly | Static (snapshot) | Two acquisitions |
| **Coverage** | All India | Full disk (Asia-Africa) | Uttarakhand | UK + HP districts | UK + HP border zone |
| **Time period** | 2020–2022 | 2025-08-01 | 2022–2025 | 2011-12 LULC | 2023-07-08, 2023-07-28 |
| **Format** | NetCDF / Binary | HDF5 | CSV | PNG | GeoTIFF (UInt16) |
| **CRS** | EPSG:4326 | Geostationary / EPSG:4326 | EPSG:4326 (station coords) | EPSG:4326 (WMS) | EPSG:32643/32644 (UTM) |
| **Login required** | No | Yes (MOSDAC) | No | No | Yes (Bhoonidhi) |
| **Source** | imdpune.gov.in | mosdac.gov.in | CWC / State portal | bhuvan-vec1.nrsc.gov.in | bhoonidhi.nrsc.gov.in |

### Disaster Relevance Map

| Data Layer | Landslide | Flood | Rainfall Monitoring | Damage Assessment |
|---|---|---|---|---|
| IMD gridded rainfall | ✅ Antecedent rainfall trigger | ✅ Flood-generating rainfall | ✅ Primary | ⚠️ Historical only |
| MOSDAC IMSRA | ✅ Real-time trigger detection | ✅ Flash flood early warning | ✅ Near-real-time | ✅ Event monitoring |
| CWC telemetry | ✅ Local intensity trigger | ✅ Peak discharge proxy | ✅ Real-time | ✅ Event-level |
| Bhuvan slope maps | ✅✅ Core susceptibility layer | ⚠️ Indirectly | — | — |
| Bhuvan LULC | ✅ Exposure mapping | ✅ Runoff coefficients | — | ✅ Vulnerability |
| EOS-04 SAR HH/HV | ✅ Pre/post landslide detection | ✅✅ Flood extent mapping | — | ✅✅ Damage mapping |
| EOS-04 LIA mask | ✅ Filter geometric distortion | ✅ Valid pixel selection | — | ✅ Quality control |
