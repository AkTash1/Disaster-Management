# The Master Guide: From Raw Heterogeneous Earth Observation Data to a Production PostGIS Disaster Schema

> **Document Version**: 1.0  
> **Target Audience**: Data Engineers, GIS Analysts, ML Researchers, Disaster Management Authorities (SDMA/NDMA)  
> **Region of Focus**: Uttarakhand, India (Garhwal & Kumaon Himalayan Basins)  

---

## Table of Contents

1. [The Foundational Problem: Why Disaster Data is Difficult](#1-the-foundational-problem-why-disaster-data-is-difficult)
2. [Deep Dive into the 5 Datasets: Physics, Formats, and Anomalies](#2-deep-dive-into-the-5-datasets-physics-formats-and-anomalies)
   - [2.1 IMD Daily Gridded Rainfall (Atmospheric Modeling)](#21-imd-daily-gridded-rainfall-atmospheric-modeling)
   - [2.2 MOSDAC INSAT-3DR IMSRA (Geostationary Satellite Remote Sensing)](#22-mosdac-insat-3dr-imsra-geostationary-satellite-remote-sensing)
   - [2.3 CWC Hourly Telemetry Rain Gauge Network (In-Situ Ground Hydrology)](#23-cwc-hourly-telemetry-rain-gauge-network-in-situ-ground-hydrology)
   - [2.4 Bhoonidhi EOS-04 / RISAT-1A SAR (Active Microwave Radar)](#24-bhoonidhi-eos-04--risat-1a-sar-active-microwave-radar)
   - [2.5 Bhuvan CartoDEM & SISDP-v2 (Topographic & Thematic Rasters)](#25-bhuvan-cartodem--sisdp-v2-topographic--thematic-rasters)
3. [The Transformation Journey: Making Binary Files Usable](#3-the-transformation-journey-making-binary-files-usable)
4. [Schema Architecture: Why It Was Designed This Way](#4-schema-architecture-why-it-was-designed-this-way)
   - [4.1 Why a Star Schema?](#41-why-a-star-schema)
   - [4.2 Why Separate Fact Tables Instead of One "Mega-Table"?](#42-why-separate-fact-tables-instead-of-one-mega-table)
   - [4.3 PostGIS Integration: Vector Meets Raster](#43-postgis-integration-vector-meets-raster)
5. [Complete Table-by-Table Data Dictionary](#5-complete-table-by-table-data-dictionary)
6. [Real-World Operational Scenarios (SQL Walkthroughs)](#6-real-world-operational-scenarios-sql-walkthroughs)
   - [Scenario A: Real-Time Landslide Early Warning](#scenario-a-real-time-landslide-early-warning)
   - [Scenario B: AI/ML Feature Store Extraction](#scenario-b-aiml-feature-store-extraction)
   - [Scenario C: Satellite Radar Flood Water Extent Delineation](#scenario-c-satellite-radar-flood-water-extent-delineation)
7. [Glossary & Scientific Units Cheat Sheet](#7-glossary--scientific-units-cheat-sheet)

---

## 1. The Foundational Problem: Why Disaster Data is Difficult

In environmental disaster management (specifically landslides and flash floods in mountainous regions like Uttarakhand), decision-makers face the **Multi-Resolution Multi-Sensor Paradox**:

| Observation Platform | Spatial Resolution | Temporal Frequency | What It Measures Best | Weakness |
| :--- | :--- | :--- | :--- | :--- |
| **Ground Gauges (CWC)** | Single point ($0\text{ m}$) | Hourly ($1\text{ hr}$) | Ground-truth local rain intensity | Sparse network; missing valleys; sensor failures |
| **Geostationary Sat (MOSDAC)** | $\sim 4\text{ km}$ at nadir | $30\text{ minutes}$ | Rapid convective cloud development & track | Indirect cloud-top IR estimation; calibration offset |
| **Climatological Grids (IMD)** | $0.25^\circ$ ($\sim 28\text{ km}$) | Daily ($24\text{ hr}$) | Long-term antecedent moisture trends | Cannot resolve sudden localized cloudbursts |
| **Active Radar SAR (EOS-04)** | $36\text{ m}$ pixel | Irregular ($\sim 12\text{ days}$) | Standing water, soil saturation, slope scars | Orbital revisit gap; mountain layover & shadow |
| **Terrain / LULC (Bhuvan)** | $30\text{ m}$ | Static snapshot | Physical terrain vulnerability & slope angle | Does not change with rainfall dynamics |

If you attempt to jam all this into a single database table (e.g., `rainfall(date, location, rain)`), the system breaks down:
- An hourly reading cannot join a daily grid cell without causing massive row duplication ($24\times$).
- A 36-meter SAR radar pixel cannot share the same geometry column as an entire $28\text{ km}$ IMD grid cell without severe spatial distortion.
- Telemetry sensors malfunction (negative values), while satellite data has missing ocean points.

Our solution is a **Multi-Fact PostGIS Star Schema** that standardizes time, location, and data quality across all sources while preserving the native physical integrity of each measurement.

---

## 2. Deep Dive into the 5 Datasets: Physics, Formats, and Anomalies

### 2.1 IMD Daily Gridded Rainfall (Atmospheric Modeling)
- **Scientific Role**: Provides long-term background rainfall (e.g., 3-day or 7-day **antecedent rainfall**), which saturates the soil before a landslide triggers.
- **Raw File Types**: 
  - NetCDF-4 (`imd_rain_2020_2022.nc` — 145.6 MB)
  - Direct Binary IEEE-754 Single Precision (`.grd` — 24.3 MB each)
- **The Physics**: IMD interpolates thousands of rain gauges across India onto a uniform $0.25^\circ \times 0.25^\circ$ spatial grid ($129 \text{ lat} \times 135 \text{ lon} = 17,415$ cells/day) using directional Shepard's interpolation.
- **Why It Was "Unreadable"**:
  - The `.grd` files are raw unstructured byte streams (no headers, no text). Without knowing that each day consists of exactly $17,415 \times 4$ bytes of IEEE-754 `float32` in row-major order, standard text editors see pure gibberish.
  - The NetCDF file stores an unmasked multi-dimensional cube `(1096, 129, 135)`.
- **Anomalies & Masking**:
  - `rain = -999.0`: This is the sentinel fill value. It appears over the Arabian Sea, Bay of Bengal, and neighboring countries outside India's borders. In Uttarakhand, valid land values range from $0.0\text{ mm}$ (dry days) up to localized extreme values ($979.1\text{ mm/day}$ peak).

---

### 2.2 MOSDAC INSAT-3DR IMSRA (Geostationary Satellite Remote Sensing)
- **Scientific Role**: Early warning for convective cloudbursts. INSAT-3DR sits in geostationary orbit at $74^\circ\text{E}$ longitude ($36,000\text{ km}$ above the equator), imaging South Asia every 30 minutes.
- **Raw File Type**: Hierarchical Data Format version 5 (`.h5` — ~10.5 MB per half-hour granule).
- **The Physics**: The algorithm is **IMSRA** (INSAT Multispectral Rainfall Algorithm). It uses thermal infrared (TIR-1: $10.8\text{ }\mu\text{m}$) and water vapor ($6.8\text{ }\mu\text{m}$) channels to measure cloud-top brightness temperatures. Cold, high cloud tops indicate deep convective updrafts and heavy rainfall rate in $\text{mm/hr}$.
- **Why It Was "Unreadable"**:
  - HDF5 files are internal tree structures (like a compressed virtual operating system) containing datasets, attributes, and dimension scales.
  - The rainfall array `IMC` is shape `(1, 2816, 2805)`.
  - **The Coordinate Trap**: Coordinates are stored as separate 2D integer arrays (`Latitude` and `Longitude`, both `int16`). They cannot be read as literal values! They require the file attribute formula:
    $$\text{Actual Coordinate (degrees)} = \text{Raw Value} \times 0.01$$
    Pixels outside the Earth disk or invalid scan areas have the value `32767` (the maximum value of signed 16-bit integers).
- **Extracted Range**: Valid rainfall rates in Uttarakhand range from $0.0\text{ mm/hr}$ up to $60.0\text{ mm/hr}$. Fill value is `-999.0`.

---

### 2.3 CWC Hourly Telemetry Rain Gauge Network (In-Situ Ground Hydrology)
- **Scientific Role**: Tactical real-time rainfall monitoring along sensitive river corridors (Alaknanda, Mandakini, Bhagirathi, Kosi, Yamuna) across all 13 districts of Uttarakhand.
- **Raw File Type**: CSV text file (`rainfall_tel_hr_uttarakhand_uk_2021_2025.csv` — 37,410 rows, 4.4 MB).
- **The Physics**: Tipping-bucket rain gauges automated with GSM/satellite telemetry transmitters. Each tip records $0.5\text{ mm}$ of precipitation.
- **Why It Was Misleading / Problematic**:
  - Although readable in Excel or Notepad, the raw data contains **severe hardware telemetry artifacts**.
  - `min = -503.5 mm/hr` and `max = 511.5 mm/hr`! Negative rainfall is physically impossible; it occurs when battery voltages drop or telemetry encoders transmit bit-inversion errors.
  - Timestamps were strings in non-standard format: `"05-10-2022 10:00"`.
- **The Cleaning Solution**:
  - We engineered a `quality_flag_enum`:
    - Values between $0.0$ and $150.0\text{ mm/hr}$ $\rightarrow$ `VALID` ($95.4\%$ of data).
    - Values $> 150.0\text{ mm/hr}$ $\rightarrow$ `SUSPECT_EXTREME` (retained for human review, flagged for automated algorithms).
    - Values $< 0.0\text{ mm/hr}$ $\rightarrow$ `CORRUPT_NEGATIVE` (sanitized to `NULL` in the analytical observation column).

---

### 2.4 Bhoonidhi EOS-04 / RISAT-1A SAR (Active Microwave Radar)
- **Scientific Role**: Post-event flood inundation mapping and landslide scar detection through cloud cover and during night-time.
- **Raw File Type**: CEOS-ARD Level-2B package containing 16-bit GeoTIFFs (`imagery_HH.tif`, `imagery_HV.tif`), auxiliary angles (`_lia.tif`), and XML schemas.
- **The Physics**: EOS-04 transmits C-band microwave pulses at $5.40\text{ GHz}$ ($\lambda \approx 5.55\text{ cm}$).
  - **HH (Horizontal Transmit, Horizontal Receive)**: High sensitivity to surface roughness and water bodies (specular reflection from calm water reflects pulses away from the sensor, appearing pitch black / very low backscatter).
  - **HV (Horizontal Transmit, Vertical Receive)**: High sensitivity to volume scattering from forest canopies and debris.
- **Why It Was "Unreadable"**:
  - GeoTIFF files contain raw uncalibrated 16-bit unsigned integers ($\text{DN} \in [1, 65535]$). An image viewer just shows high-contrast gray pixels with no physical units.
  - To convert raw sensor DN into physical **Normalized Radar Backscatter** ($\gamma^0$ in decibels), you must compute:
    $$\gamma^0\text{ (dB)} = 20 \cdot \log_{10}(\text{DN}) - 66.55$$
  - **The Projection Mismatch**: Scene 1 (08-Jul-2023) is projected in **UTM Zone 44N (`EPSG:32644`)**, whereas Scene 2 (28-Jul-2023) is in **UTM Zone 43N (`EPSG:32643`)**. Joining them without CRS reprojection yields spatial displacement of hundreds of kilometers!

---

### 2.5 Bhuvan CartoDEM & SISDP-v2 (Topographic & Thematic Rasters)
- **Scientific Role**: Provides the physical susceptibility basemap. Rainfall alone does not cause landslides—steep slopes ($> 30^\circ$) composed of fragile lithology do.
- **Raw File Type**: 2048 × 2048 PNG images captured via OGC Web Map Service (WMS).
- **Why It Was "Unreadable" as GIS Data**:
  - A PNG is just an RGB picture. It has **no spatial header**, no projection tag, no tie-points, and no pixel-to-geographic resolution mapping. If dropped into PostGIS or QGIS, it lands at coordinates $(0, 0)$.
- **The Georeferencing Fix**:
  - In our extraction pipeline, we attached the exact WMS bounding envelope `(77.5°E, 28.7°N, 81.1°E, 31.5°N)` to the image matrix and wrote it out as a proper **GeoTIFF (`bhuvan_uk_slope_georeferenced.tif`)** with affine transformation matrix:
    $$\text{Transform} = \left[ \frac{\Delta \text{lon}}{2048}, 0, \text{min\_lon}, 0, -\frac{\Delta \text{lat}}{2048}, \text{max\_lat} \right]$$

---

## 3. The Transformation Journey: Making Binary Files Usable

Our Python ETL pipeline ([`extract_readable_samples.py`](file:///c:/Users/ashut/Projects/disaster_data_downloader/extract_readable_samples.py)) performed the following conversions:

```
[IMD NetCDF / Binary GRD] ─────► xarray clip (UK BBox) ────────► fact_rainfall_imd_grid_sample.csv
                                                               └► fact_rainfall_imd_daily_aggregate.csv

[MOSDAC INSAT-3DR HDF5]  ─────► h5py + Coordinate Rescaling ──► fact_rainfall_mosdac_sample.csv

[CWC Hydrology CSV]      ─────► pandas Clean + Quality Flag ──► fact_rainfall_cwc_cleaned_sample.csv
                                                               ├► dim_district.csv
                                                               ├► dim_station.csv
                                                               └► dim_station.geojson

[Bhoonidhi EOS-04 SAR]   ─────► rasterio Calibrate (DN->dB) ──► fact_sar_backscatter_sample.csv

[Bhuvan WMS PNGs]        ─────► PIL + Affine Geotransform ────► bhuvan_uk_slope_georeferenced.tif
                                                               └► dim_raster_layer.csv
```

---

## 4. Schema Architecture: Why It Was Designed This Way

The schema in [`schema.sql`](file:///c:/Users/ashut/Projects/disaster_data_downloader/schema.sql) is organized into three distinct tiers:

### 4.1 Why a Star Schema?
In data warehousing, a **Star Schema** isolates slow-changing descriptive attributes into **Dimensions** and high-volume, timestamped numerical measurements into **Facts**:
- **Dimensions (`dim_*`)**: Describe the *Who*, *Where*, and *What*. 
  - `dim_district`: The 13 administrative units of Uttarakhand.
  - `dim_station`: The 47 telemetry rain gauge towers.
  - `dim_dataset`: The 5 data products, their agencies, native formats, and units.
  - `dim_raster_layer`: The catalog of static imagery (slopes and land use).
- **Facts (`fact_*`)**: Contain the *Measurements* with timestamps and coordinates.

### 4.2 Why Separate Fact Tables Instead of One "Mega-Table"?
We intentionally separated:
1. `fact_rainfall_telemetry` (Station-level, irregular point measurements, hourly frequency).
2. `fact_rainfall_gridded` (Cell-level, continuous geographic raster centroids, 30-min and daily frequencies).
3. `fact_sar_observations` (Satellite swath-level, dual-polarimetric microwave backscatter in decibels).

**Why?**
- **Null Pollution Prevention**: If placed in one table, every single telemetry row would have empty columns for `gamma0_hh_db`, `gamma0_hv_db`, `utm_easting`, `granule_file`, etc. Over millions of rows, $80\%$ of table storage would be wasted on `NULL` pointers.
- **Index Efficiency**: Spatial queries on station points benefit from high-density clustering on 47 coordinates, whereas satellite grids require R-Tree indexing across thousands of moving cell points.
- **Query Performance**: Dashboards aggregating district rainfall only scan the lightweight telemetry table without reading gigabytes of SAR backscatter data.

### 4.3 PostGIS Integration: Vector Meets Raster
Every spatial entity uses standardized **PostGIS Geometry types (`EPSG:4326`)**:
- `location_geom GEOMETRY(Point, 4326)` on stations and fact rows allows instant spatial queries:
  ```sql
  -- Find all rain gauges within 15 km of a landslide incident:
  ST_DWithin(station.location_geom::geography, event.event_location_geom::geography, 15000);
  ```
- `bbox_geom GEOMETRY(Polygon, 4326)` on districts and raster layers enables fast spatial overlap indexing using PostGIS bounding box operators (`&&`).

---

## 5. Complete Table-by-Table Data Dictionary

### Tier 1: Dimensions

#### `dim_dataset`
Catalogs every data feed entering the disaster platform.
- `dataset_id` (`VARCHAR(64)` PK): e.g., `IMD_GRID_025`, `MOSDAC_INSAT3DR_IMSRA`, `CWC_TELEMETRY_HOURLY`.
- `dataset_name` (`VARCHAR(128)`): Official name.
- `agency` (`VARCHAR(128)`): IMD, ISRO/MOSDAC, CWC, NRSC.
- `source_type` (`source_type_enum`): `GROUND_TELEMETRY`, `GRIDDED_OBSERVATION`, `SATELLITE_GEOSYNCHRONOUS`, `SATELLITE_SAR_MICROWAVE`, `DIGITAL_ELEVATION_THEMATIC`.
- `temporal_resolution` (`temporal_res_enum`): `30_MINUTES`, `HOURLY`, `DAILY`, `EVENT_PASS`, `STATIC`.
- `spatial_resolution_m` (`NUMERIC`): Nominal ground resolution in meters ($0$ for stations, $30$ for CartoDEM, $36$ for SAR, $4000$ for MOSDAC, $28000$ for IMD).
- `unit` (`VARCHAR(32)`): Measurement unit (`mm/hr`, `mm/day`, `degrees`, `dB`).

#### `dim_district`
The core spatial grouping for Uttarakhand disaster management.
- `district_lgd_code` (`INT` PK): Official Census/LGD ID (45 to 57).
- `district_name` (`VARCHAR(64)`): Almora, Bageshwar, Chamoli, Champawat, Dehradun, Haridwar, Nainital, Pauri Garhwal, Pithoragarh, Rudraprayag, Tehri Garhwal, Udham Singh Nagar, Uttarkashi.
- `centroid_geom` (`GEOMETRY(Point, 4326)`): Geographic center of the district.
- `bbox_geom` (`GEOMETRY(Polygon, 4326)`): Minimum bounding box envelope.
- `slope_raster_id` (`VARCHAR(128)` FK): References the CartoDEM slope layer covering this district.
- `lulc_raster_id` (`VARCHAR(128)` FK): References the SISDP-v2 Land Use / Land Cover layer.

#### `dim_station`
The 47 automated telemetry stations in Uttarakhand.
- `station_id` (`VARCHAR(64)` PK): e.g., `CWC_UK_Badrinath_1`, `CWC_UK_Yamuna_Colony`.
- `station_name` (`VARCHAR(128)`): Original name.
- `district_lgd_code` (`INT` FK): Parent district.
- `river` (`VARCHAR(64)`): Nearest major drainage (Alaknanda, Mandakini, Kosi, etc.).
- `basin` (`VARCHAR(64)`): Primary catchment (e.g. Ganga).
- `location_geom` (`GEOMETRY(Point, 4326)`): Precise coordinates of the gauge mast.

#### `dim_raster_layer`
Spatial metadata bridge for Bhuvan CartoDEM slope and LULC thematic rasters.
- `raster_layer_id` (`VARCHAR(128)` PK): e.g., `bhuvan_sdv_uk_slope_landslide`.
- `layer_type` (`VARCHAR(32)`): `SLOPE` or `LULC`.
- `bbox_geom` (`GEOMETRY(Polygon, 4326)`): Spatial coverage.
- `file_path` (`TEXT`): Filesystem or S3/Cloud Storage path to GeoTIFF/COG file.

#### `dim_quality_flag`
Auditing dimension defining data anomalies and handling rules.
- `flag_id` (`quality_flag_enum` PK): `VALID`, `SUSPECT_EXTREME`, `CORRUPT_NEGATIVE`, `MISSING_TELEMETRY`, `RADAR_SHADOW`, `RADAR_LAYOVER`.
- `severity` (`VARCHAR(16)`): `INFO`, `WARNING`, `ERROR`.
- `recommended_action` (`TEXT`): Guidance for downstream data scientists.

---

### Tier 2: Observations (Facts)

#### `fact_rainfall_telemetry`
High-frequency ground-truth rainfall from CWC rain gauges.
- `observation_id` (`BIGSERIAL` PK)
- `station_id` (`VARCHAR(64)` FK): Gauge reporting the event.
- `district_lgd_code` (`INT` FK): District identifier for fast aggregation.
- `observed_at` (`TIMESTAMPTZ`): Observation timestamp.
- `rainfall_mm_hr` (`NUMERIC(6, 2)`): Validated physical value in $\text{mm/hr}$ ($0.0 \text{ to } 500.0$).
- `raw_value` (`NUMERIC(8, 2)`): Preserves raw sensor payload (including negative anomalies).
- `quality_flag` (`quality_flag_enum` FK): Validity tag.
- `location_geom` (`GEOMETRY(Point, 4326)`): Denormalized station point for GIS performance.

#### `fact_rainfall_gridded`
Satellite (MOSDAC) and gridded reanalysis (IMD) values.
- `observation_id` (`BIGSERIAL` PK)
- `dataset_id` (`VARCHAR(64)` FK): `IMD_GRID_025` or `MOSDAC_INSAT3DR_IMSRA`.
- `district_lgd_code` (`INT` FK): District intersected by grid cell centroid.
- `observed_at` (`TIMESTAMPTZ`): Timestamp.
- `cell_point_geom` (`GEOMETRY(Point, 4326)`): Grid cell centroid.
- `rainfall_rate_mm_hr` (`NUMERIC(6, 2)`): Instantaneous rain rate (used by MOSDAC).
- `rainfall_accum_mm_day` (`NUMERIC(7, 2)`): 24-hr cumulative rainfall (used by IMD).
- `temporal_scale` (`VARCHAR(16)`): `30_MINUTES` or `DAILY`.

#### `fact_sar_observations`
Calibrated microwave radar backscatter from EOS-04 satellite passes.
- `sar_observation_id` (`BIGSERIAL` PK)
- `scene_id` (`VARCHAR(128)`): Original acquisition granule.
- `acquisition_timestamp` (`TIMESTAMPTZ`): Radar antenna pulse time.
- `utm_easting`, `utm_northing` (`NUMERIC`): Ground coordinates in native UTM projection.
- `location_geom` (`GEOMETRY(Point, 4326)`): Reprojected WGS84 point.
- `dn_hh`, `dn_hv` (`INT`): Raw 16-bit digital numbers.
- `gamma0_hh_db`, `gamma0_hv_db` (`NUMERIC`): Radiometrically calibrated backscatter in $\text{dB}$.
- `cross_pol_ratio_db` (`NUMERIC`): $\gamma^0_{\text{HV}} - \gamma^0_{\text{HH}}$ ratio.
- `local_incidence_angle_deg` (`NUMERIC`): Angle between terrain slope normal and radar wave.

---

### Tier 3: Operational Decision Support

#### `disaster_events`
Historical and active disaster records logged by State Disaster Management Authorities (SDMA / SDRF).
- `event_id` (`VARCHAR(64)` PK): e.g. `EVT_UK_2023_JUL_CHAMOLI`.
- `event_type` (`disaster_type_enum`): `LANDSLIDE`, `FLASH_FLOOD`, `CLOUD_BURST`, `RIVERINE_FLOOD`, `GLOF`.
- `district_lgd_code` (`INT` FK): District where incident occurred.
- `event_location_geom` (`GEOMETRY(Geometry, 4326)`): Incident epicenter point or hazard polygon.
- `start_timestamp`, `end_timestamp` (`TIMESTAMPTZ`): Incident duration.
- `severity_level` (`severity_level_enum`): `LOW`, `MODERATE`, `HIGH`, `SEVERE`, `CATASTROPHIC`.
- `casualty_count` (`INT`), `economic_loss_inr_crores` (`NUMERIC`), `impact_summary` (`TEXT`).

#### `alert_thresholds`
The dynamic rule engine driving automated alarms.
- `threshold_id` (`SERIAL` PK)
- `disaster_type` (`disaster_type_enum`): `LANDSLIDE` or `FLASH_FLOOD`.
- `district_lgd_code` (`INT` FK): Specific district override, or `NULL` for state-wide baseline.
- `parameter_name` (`VARCHAR(64)`): `HOURLY_INTENSITY_MM`, `24HR_ACCUMULATION_MM`, `3DAY_ANTECEDENT_MM`, `TERRAIN_SLOPE_DEG`.
- `alert_level` (`alert_level_enum`): `WATCH` (Yellow), `ALERT` (Orange), `WARNING` (Red), `EVACUATION`.
- `threshold_value` (`NUMERIC`): The trigger boundary (e.g. $80.00\text{ mm/hr}$).
- `action_protocol` (`TEXT`): SOP dispatched to authorities upon breach.

#### `model_predictions`
The interface for predictive AI/ML models.
- `prediction_id` (`BIGSERIAL` PK)
- `model_name` (`VARCHAR(64)`): e.g., `XGBOOST_LANDSLIDE_PROB_V2`.
- `prediction_timestamp` (`TIMESTAMPTZ`): Execution time.
- `target_timestamp` (`TIMESTAMPTZ`): Forecast horizon (e.g., $+6\text{ hours}$).
- `district_lgd_code` (`INT` FK): Target district.
- `target_geom` (`GEOMETRY`): Catchment basin or road corridor polygon.
- `risk_score` (`NUMERIC(5, 4)`): Normalized probability ($0.0000 \text{ to } 1.0000$).
- `risk_level` (`risk_level_enum`): `LOW`, `MEDIUM`, `HIGH`, `VERY_HIGH`.
- `input_features_json` (`JSONB`): Explanatory feature payload for model interpretability (SHAP values, antecedent rain inputs, slope values).

---

## 6. Real-World Operational Scenarios (SQL Walkthroughs)

### Scenario A: Real-Time Landslide Early Warning
**Goal**: A monsoon cloudburst hits Chamoli district. The system must automatically detect when rainfall intensity breaches safety levels and trigger emergency road closures.

```sql
SELECT
    d.district_name,
    s.station_name,
    s.river,
    f.rainfall_mm_hr AS live_rain_intensity,
    t.alert_level,
    t.action_protocol
FROM fact_rainfall_telemetry f
JOIN dim_station s ON f.station_id = s.station_id
JOIN dim_district d ON f.district_lgd_code = d.district_lgd_code
JOIN alert_thresholds t ON t.disaster_type = 'LANDSLIDE'
    AND t.parameter_name = 'HOURLY_INTENSITY_MM'
    AND f.rainfall_mm_hr >= t.threshold_value
    AND (t.district_lgd_code IS NULL OR t.district_lgd_code = d.district_lgd_code)
WHERE f.observed_at >= NOW() - INTERVAL '2 hours'
  AND f.quality_flag = 'VALID'
ORDER BY t.threshold_value DESC;
```
*Output*: Dispatches warning when Badrinath station records $72.0\text{ mm/hr}$, triggering: *"Immediate road closure on Char Dham routes (NH-58)"*.

---

### Scenario B: AI/ML Feature Store Extraction
**Goal**: Train an ML classifier (e.g. XGBoost, Random Forest) to predict landslide occurrence based on rainfall history and terrain factors.

```sql
WITH daily_ground_truth AS (
    SELECT 
        district_lgd_code,
        DATE(observed_at) AS feature_date,
        SUM(rainfall_mm_hr) AS ground_daily_rain_mm,
        MAX(rainfall_mm_hr) AS ground_peak_intensity_mm_hr
    FROM fact_rainfall_telemetry
    WHERE quality_flag = 'VALID'
    GROUP BY district_lgd_code, DATE(observed_at)
)
SELECT 
    d.district_name,
    g.feature_date,
    g.ground_daily_rain_mm,
    g.ground_peak_intensity_mm_hr,
    -- Feature: 3-Day Cumulative Antecedent Rainfall (Soil Saturation Proxy)
    SUM(g.ground_daily_rain_mm) OVER (
        PARTITION BY d.district_lgd_code 
        ORDER BY g.feature_date 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS antecedent_3day_rainfall_mm,
    -- Feature: 7-Day Cumulative Antecedent Rainfall
    SUM(g.ground_daily_rain_mm) OVER (
        PARTITION BY d.district_lgd_code 
        ORDER BY g.feature_date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS antecedent_7day_rainfall_mm,
    -- Target Label: Did a landslide disaster occur on this date?
    CASE WHEN e.event_id IS NOT NULL THEN 1 ELSE 0 END AS label_landslide_occurred
FROM daily_ground_truth g
JOIN dim_district d ON g.district_lgd_code = d.district_lgd_code
LEFT JOIN disaster_events e ON g.district_lgd_code = e.district_lgd_code 
    AND g.feature_date = DATE(e.start_timestamp)
ORDER BY d.district_name, g.feature_date;
```

---

### Scenario C: Satellite Radar Flood Water Extent Delineation
**Goal**: Identify newly inundated agricultural valleys following a river breach in Haridwar or Udham Singh Nagar using C-band SAR backscatter.

```sql
SELECT 
    s.scene_id,
    s.acquisition_timestamp,
    s.gamma0_hh_db,
    s.gamma0_hv_db,
    s.cross_pol_ratio_db,
    ST_AsGeoJSON(s.location_geom) AS geojson_geometry
FROM fact_sar_observations s
WHERE s.quality_flag = 'VALID'
  -- Water produces specular reflection: very low co-polarized backscatter
  AND s.gamma0_hh_db < -14.00
  -- Non-vegetated surface: low cross-polarized backscatter
  AND s.gamma0_hv_db < -20.00
  -- Discard steep mountain slopes with geometric layover/shadow
  AND s.local_incidence_angle_deg BETWEEN 28.0 AND 45.0;
```

---

## 7. Glossary & Scientific Units Cheat Sheet

| Symbol / Term | Full Name | Standard Unit | Physical Range in Nature | Disaster Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **`rainfall_mm_hr`** | Hourly Rainfall Intensity | $\text{mm/hr}$ | $0.0 - 150.0\text{ mm/hr}$ | $> 50\text{ mm/hr}$ = torrential; flash flood & debris flow risk |
| **`rainfall_mm_day`**| Daily Rainfall Accumulation | $\text{mm/day}$ | $0.0 - 980.0\text{ mm/day}$ | Antecedent saturation index |
| **$\gamma^0$ (Gamma-Nought)**| Normalized Radar Backscatter | Decibels ($\text{dB}$) | $-30\text{ dB to } +5\text{ dB}$ | High ($>-5\text{ dB}$) = urban/boulders; Low ($<-14\text{ dB}$) = water |
| **$\text{DN}$** | Digital Number | Integer counts | $1 - 65,535$ | Raw uncalibrated sensor pulse magnitude |
| **$\text{LIA}$** | Local Incidence Angle | Degrees ($^\circ$) | $0^\circ - 90^\circ$ | Angle between radar beam and mountain slope face |
| **`LGD Code`** | Local Government Directory | Integer | Unique identifier | National standardized district & state codes |
| **`COG`** | Cloud-Optimized GeoTIFF | Binary TIFF | File container | GeoTIFF formatted for streaming reads without downloading whole file |
| **`GiST`** | Generalized Search Tree | Database index | Index structure | PostGIS R-Tree spatial index for fast 2D boundary intersections |
