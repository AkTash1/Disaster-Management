-- ==============================================================================
-- DISASTER DATA DOWNLOADER - POSTGRESQL + POSTGIS PRODUCTION STAR SCHEMA
-- Target Region: Uttarakhand (Garhwal & Kumaon Divisions)
-- Datasets Integrated:
--   1. IMD High-Resolution Daily Gridded Rainfall (0.25 deg)
--   2. MOSDAC INSAT-3DR IMSRA Half-Hourly Satellite Rainfall Rate (4 km)
--   3. CWC Telemetry Hourly Rain Gauge Station Network (47 stations)
--   4. Bhoonidhi EOS-04 (RISAT-1A) C-Band SAR Dual-Pol Backscatter ARD (36m)
--   5. Bhuvan CartoDEM Terrain Slope & SISDP-v2 District LULC Thematic Rasters
-- ==============================================================================

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Custom Enumeration Types
DO $$ BEGIN
    CREATE TYPE source_type_enum AS ENUM (
        'GROUND_TELEMETRY',
        'GRIDDED_OBSERVATION',
        'SATELLITE_GEOSYNCHRONOUS',
        'SATELLITE_SAR_MICROWAVE',
        'DIGITAL_ELEVATION_THEMATIC'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE temporal_res_enum AS ENUM (
        '30_MINUTES',
        'HOURLY',
        'DAILY',
        'EVENT_PASS',
        'STATIC'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE quality_flag_enum AS ENUM (
        'VALID',
        'SUSPECT_EXTREME',
        'CORRUPT_NEGATIVE',
        'MISSING_TELEMETRY',
        'RADAR_SHADOW',
        'RADAR_LAYOVER'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE disaster_type_enum AS ENUM (
        'LANDSLIDE',
        'FLASH_FLOOD',
        'CLOUD_BURST',
        'RIVERINE_FLOOD',
        'GLOF'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE severity_level_enum AS ENUM (
        'LOW',
        'MODERATE',
        'HIGH',
        'SEVERE',
        'CATASTROPHIC'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE alert_level_enum AS ENUM (
        'WATCH',
        'ALERT',
        'WARNING',
        'EVACUATION'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE risk_level_enum AS ENUM (
        'LOW',
        'MEDIUM',
        'HIGH',
        'VERY_HIGH'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================================================================
-- 3. DIMENSION TABLES
-- ==============================================================================

-- 3.1 Data Product Dimension
CREATE TABLE IF NOT EXISTS dim_dataset (
    dataset_id VARCHAR(64) PRIMARY KEY,
    dataset_name VARCHAR(128) NOT NULL,
    agency VARCHAR(128) NOT NULL,
    source_type source_type_enum NOT NULL,
    temporal_resolution temporal_res_enum NOT NULL,
    spatial_resolution_m NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    crs VARCHAR(32) NOT NULL,
    native_format VARCHAR(64) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3.2 Raster Context Catalog Dimension
CREATE TABLE IF NOT EXISTS dim_raster_layer (
    raster_layer_id VARCHAR(128) PRIMARY KEY,
    file_name VARCHAR(256) NOT NULL,
    layer_type VARCHAR(32) NOT NULL CHECK (layer_type IN ('SLOPE', 'LULC', 'FLOOD_EXTENT', 'SAR_MOSAIC')),
    state_name VARCHAR(64) NOT NULL,
    file_size_kb NUMERIC(10, 1),
    crs VARCHAR(32) DEFAULT 'EPSG:4326',
    bbox_geom GEOMETRY(Polygon, 4326) NOT NULL,
    resolution_px VARCHAR(32) DEFAULT '2048x2048',
    source_agency VARCHAR(128) DEFAULT 'Bhuvan (ISRO / NRSC)',
    file_path TEXT NOT NULL
);

-- 3.3 District Boundary Dimension
CREATE TABLE IF NOT EXISTS dim_district (
    district_lgd_code INT PRIMARY KEY,
    district_name VARCHAR(64) NOT NULL,
    state_lgd_code INT NOT NULL DEFAULT 5,
    state_name VARCHAR(64) NOT NULL DEFAULT 'Uttarakhand',
    station_count INT DEFAULT 0,
    centroid_geom GEOMETRY(Point, 4326) NOT NULL,
    bbox_geom GEOMETRY(Polygon, 4326) NOT NULL,
    boundary_geom GEOMETRY(MultiPolygon, 4326),
    slope_raster_id VARCHAR(128) REFERENCES dim_raster_layer(raster_layer_id),
    lulc_raster_id VARCHAR(128) REFERENCES dim_raster_layer(raster_layer_id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3.4 Ground Station Dimension
CREATE TABLE IF NOT EXISTS dim_station (
    station_id VARCHAR(64) PRIMARY KEY,
    station_name VARCHAR(128) NOT NULL,
    agency VARCHAR(64) NOT NULL,
    district_lgd_code INT NOT NULL REFERENCES dim_district(district_lgd_code),
    tehsil VARCHAR(64),
    river VARCHAR(64),
    basin VARCHAR(64),
    location_geom GEOMETRY(Point, 4326) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3.5 Data Quality Lookup Dimension
CREATE TABLE IF NOT EXISTS dim_quality_flag (
    flag_id quality_flag_enum PRIMARY KEY,
    severity VARCHAR(16) NOT NULL,
    description TEXT NOT NULL,
    recommended_action TEXT NOT NULL
);

-- ==============================================================================
-- 4. FACT TABLES (OBSERVATIONS)
-- ==============================================================================

-- 4.1 Ground Telemetry Observations (CWC Network)
CREATE TABLE IF NOT EXISTS fact_rainfall_telemetry (
    observation_id BIGSERIAL PRIMARY KEY,
    dataset_id VARCHAR(64) NOT NULL REFERENCES dim_dataset(dataset_id),
    station_id VARCHAR(64) NOT NULL REFERENCES dim_station(station_id),
    district_lgd_code INT NOT NULL REFERENCES dim_district(district_lgd_code),
    observed_at TIMESTAMPTZ NOT NULL,
    rainfall_mm_hr NUMERIC(6, 2) CHECK (rainfall_mm_hr >= 0 AND rainfall_mm_hr <= 500),
    raw_value NUMERIC(8, 2),
    quality_flag quality_flag_enum NOT NULL DEFAULT 'VALID' REFERENCES dim_quality_flag(flag_id),
    location_geom GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_telemetry_station_time UNIQUE (station_id, observed_at)
);

-- 4.2 Gridded Satellite & Model Observations (IMD Daily + MOSDAC 30-min)
CREATE TABLE IF NOT EXISTS fact_rainfall_gridded (
    observation_id BIGSERIAL PRIMARY KEY,
    dataset_id VARCHAR(64) NOT NULL REFERENCES dim_dataset(dataset_id),
    district_lgd_code INT REFERENCES dim_district(district_lgd_code),
    observed_at TIMESTAMPTZ NOT NULL,
    granule_file VARCHAR(128),
    cell_point_geom GEOMETRY(Point, 4326) NOT NULL,
    rainfall_rate_mm_hr NUMERIC(6, 2),   -- For MOSDAC (instantaneous rate mm/hr)
    rainfall_accum_mm_day NUMERIC(7, 2), -- For IMD (daily accumulation mm/day)
    temporal_scale VARCHAR(16) NOT NULL CHECK (temporal_scale IN ('30_MINUTES', 'DAILY')),
    quality_flag quality_flag_enum NOT NULL DEFAULT 'VALID' REFERENCES dim_quality_flag(flag_id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4.3 Microwave Synthetic Aperture Radar (SAR) Observations (Bhoonidhi EOS-04)
CREATE TABLE IF NOT EXISTS fact_sar_observations (
    sar_observation_id BIGSERIAL PRIMARY KEY,
    dataset_id VARCHAR(64) NOT NULL REFERENCES dim_dataset(dataset_id),
    scene_id VARCHAR(128) NOT NULL,
    acquisition_timestamp TIMESTAMPTZ NOT NULL,
    utm_easting NUMERIC(12, 2) NOT NULL,
    utm_northing NUMERIC(12, 2) NOT NULL,
    native_crs VARCHAR(32) NOT NULL, -- e.g. 'EPSG:32644' or 'EPSG:32643'
    location_geom GEOMETRY(Point, 4326) NOT NULL, -- Reprojected to WGS84
    dn_hh INT NOT NULL CHECK (dn_hh >= 0),
    gamma0_hh_db NUMERIC(6, 2) NOT NULL,
    dn_hv INT NOT NULL CHECK (dn_hv >= 0),
    gamma0_hv_db NUMERIC(6, 2) NOT NULL,
    cross_pol_ratio_db NUMERIC(6, 2) NOT NULL, -- HV - HH
    local_incidence_angle_deg NUMERIC(5, 2),
    quality_flag quality_flag_enum NOT NULL DEFAULT 'VALID' REFERENCES dim_quality_flag(flag_id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 5. DISASTER OPERATIONS & DECISION SUPPORT TABLES
-- ==============================================================================

-- 5.1 Historical & Real-time Disaster Events
CREATE TABLE IF NOT EXISTS disaster_events (
    event_id VARCHAR(64) PRIMARY KEY,
    event_type disaster_type_enum NOT NULL,
    district_lgd_code INT NOT NULL REFERENCES dim_district(district_lgd_code),
    event_location_geom GEOMETRY(Geometry, 4326) NOT NULL,
    start_timestamp TIMESTAMPTZ NOT NULL,
    end_timestamp TIMESTAMPTZ,
    severity_level severity_level_enum NOT NULL,
    casualty_count INT DEFAULT 0 CHECK (casualty_count >= 0),
    economic_loss_inr_crores NUMERIC(10, 2),
    impact_summary TEXT,
    reported_by VARCHAR(64) DEFAULT 'SDMA_UTTARAKHAND',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5.2 Dynamic Alert Thresholds (Rule-Engine)
CREATE TABLE IF NOT EXISTS alert_thresholds (
    threshold_id SERIAL PRIMARY KEY,
    disaster_type disaster_type_enum NOT NULL,
    district_lgd_code INT REFERENCES dim_district(district_lgd_code), -- NULL applies state-wide
    parameter_name VARCHAR(64) NOT NULL CHECK (parameter_name IN (
        'HOURLY_INTENSITY_MM',
        '24HR_ACCUMULATION_MM',
        '3DAY_ANTECEDENT_MM',
        'TERRAIN_SLOPE_DEG'
    )),
    alert_level alert_level_enum NOT NULL,
    threshold_value NUMERIC(8, 2) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    action_protocol TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5.3 Predictive AI/ML Model Risk Scores
CREATE TABLE IF NOT EXISTS model_predictions (
    prediction_id BIGSERIAL PRIMARY KEY,
    model_name VARCHAR(64) NOT NULL,
    model_version VARCHAR(32) NOT NULL,
    prediction_timestamp TIMESTAMPTZ NOT NULL,
    target_timestamp TIMESTAMPTZ NOT NULL,
    district_lgd_code INT NOT NULL REFERENCES dim_district(district_lgd_code),
    target_geom GEOMETRY(Geometry, 4326) NOT NULL,
    disaster_type disaster_type_enum NOT NULL,
    risk_score NUMERIC(5, 4) NOT NULL CHECK (risk_score >= 0.0 AND risk_score <= 1.0),
    risk_level risk_level_enum NOT NULL,
    input_features_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 6. SPATIAL & TEMPORAL INDEXES
-- ==============================================================================

-- Spatial PostGIS GiST Indexes
CREATE INDEX IF NOT EXISTS idx_district_centroid ON dim_district USING GIST(centroid_geom);
CREATE INDEX IF NOT EXISTS idx_district_bbox ON dim_district USING GIST(bbox_geom);
CREATE INDEX IF NOT EXISTS idx_station_geom ON dim_station USING GIST(location_geom);
CREATE INDEX IF NOT EXISTS idx_raster_bbox ON dim_raster_layer USING GIST(bbox_geom);
CREATE INDEX IF NOT EXISTS idx_telemetry_geom ON fact_rainfall_telemetry USING GIST(location_geom);
CREATE INDEX IF NOT EXISTS idx_gridded_geom ON fact_rainfall_gridded USING GIST(cell_point_geom);
CREATE INDEX IF NOT EXISTS idx_sar_geom ON fact_sar_observations USING GIST(location_geom);
CREATE INDEX IF NOT EXISTS idx_event_geom ON disaster_events USING GIST(event_location_geom);
CREATE INDEX IF NOT EXISTS idx_prediction_geom ON model_predictions USING GIST(target_geom);

-- Temporal B-Tree Indexes for Range Scanning & Dashboard Queries
CREATE INDEX IF NOT EXISTS idx_telemetry_time_st ON fact_rainfall_telemetry(observed_at DESC, station_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_district ON fact_rainfall_telemetry(district_lgd_code, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_gridded_time_dataset ON fact_rainfall_gridded(observed_at DESC, dataset_id);
CREATE INDEX IF NOT EXISTS idx_sar_scene_time ON fact_sar_observations(scene_id, acquisition_timestamp);
CREATE INDEX IF NOT EXISTS idx_predictions_target ON model_predictions(target_timestamp DESC, district_lgd_code);

-- ==============================================================================
-- 7. ANALYTICAL VIEWS
-- ==============================================================================

-- 7.1 Real-time Station Health & Latest Telemetry View
CREATE OR REPLACE VIEW v_station_latest_telemetry AS
SELECT DISTINCT ON (s.station_id)
    s.station_id,
    s.station_name,
    d.district_name,
    s.river,
    s.basin,
    s.location_geom,
    f.observed_at AS latest_reading_time,
    f.rainfall_mm_hr,
    f.quality_flag,
    CASE 
        WHEN f.observed_at >= NOW() - INTERVAL '3 hours' THEN 'LIVE'
        WHEN f.observed_at >= NOW() - INTERVAL '24 hours' THEN 'DELAYED'
        ELSE 'OFFLINE'
    END AS telemetry_status
FROM dim_station s
JOIN dim_district d ON s.district_lgd_code = d.district_lgd_code
LEFT JOIN fact_rainfall_telemetry f ON s.station_id = f.station_id
ORDER BY s.station_id, f.observed_at DESC;

-- 7.2 District 24-Hour Rainfall Aggregation View (Multi-Source Synthesis)
CREATE OR REPLACE VIEW v_district_24hr_rainfall AS
SELECT
    d.district_lgd_code,
    d.district_name,
    COUNT(DISTINCT s.station_id) AS reporting_stations,
    COALESCE(ROUND(AVG(f.rainfall_mm_hr), 2), 0.0) AS avg_hourly_intensity_mm,
    COALESCE(ROUND(MAX(f.rainfall_mm_hr), 2), 0.0) AS max_hourly_intensity_mm,
    COALESCE(ROUND(SUM(f.rainfall_mm_hr), 2), 0.0) AS total_accumulated_mm
FROM dim_district d
LEFT JOIN dim_station s ON d.district_lgd_code = s.district_lgd_code
LEFT JOIN fact_rainfall_telemetry f ON s.station_id = f.station_id 
    AND f.observed_at >= (SELECT MAX(observed_at) - INTERVAL '24 hours' FROM fact_rainfall_telemetry)
    AND f.quality_flag = 'VALID'
GROUP BY d.district_lgd_code, d.district_name;

-- 7.3 Automated Landslide Early Warning Engine View
CREATE OR REPLACE VIEW v_active_landslide_alerts AS
SELECT
    d.district_lgd_code,
    d.district_name,
    agg.max_hourly_intensity_mm,
    thresh.alert_level,
    thresh.threshold_value AS threshold_mm_hr,
    thresh.action_protocol
FROM v_district_24hr_rainfall agg
JOIN dim_district d ON agg.district_lgd_code = d.district_lgd_code
JOIN alert_thresholds thresh ON thresh.disaster_type = 'LANDSLIDE'
    AND thresh.parameter_name = 'HOURLY_INTENSITY_MM'
    AND agg.max_hourly_intensity_mm >= thresh.threshold_value
    AND (thresh.district_lgd_code IS NULL OR thresh.district_lgd_code = d.district_lgd_code)
ORDER BY thresh.threshold_value DESC;

-- ==============================================================================
-- 8. SAMPLE INSERT DATA (DERIVED FROM ACTUAL EXTRACTED DISASTER DATASETS)
-- ==============================================================================

-- 8.1 Populate Quality Flags
INSERT INTO dim_quality_flag (flag_id, severity, description, recommended_action) VALUES
('VALID', 'INFO', 'Sensor reading passes all range and physical consistency checks', 'Use directly in modeling and alerts'),
('SUSPECT_EXTREME', 'WARNING', 'Reading exceeds normal statistical thresholds (>150 mm/hr) but physically possible in cloudbursts', 'Verify against adjacent radar/satellite before triggering red alerts'),
('CORRUPT_NEGATIVE', 'ERROR', 'Telemetry sensor malfunction producing negative rainfall values (e.g. -503 mm)', 'Exclude from aggregate sums; flag station maintenance ticket'),
('MISSING_TELEMETRY', 'WARNING', 'Station failed to transmit at scheduled telemetry window', 'Interpolate using nearest IMD grid cell or MOSDAC pixel'),
('RADAR_SHADOW', 'INFO', 'SAR backscatter occluded by steep mountain face', 'Mask pixel using DEM local incidence angle calculation'),
('RADAR_LAYOVER', 'INFO', 'SAR foreshortening distortion where mountain peak returns echo before base', 'Exclude from flood water extent thresholding')
ON CONFLICT (flag_id) DO NOTHING;

-- 8.2 Populate Datasets
INSERT INTO dim_dataset (dataset_id, dataset_name, agency, source_type, temporal_resolution, spatial_resolution_m, unit, crs, native_format) VALUES
('IMD_GRID_025', 'IMD Daily Gridded Rainfall', 'India Meteorological Department (IMD)', 'GRIDDED_OBSERVATION', 'DAILY', 28000.00, 'mm/day', 'EPSG:4326', 'NetCDF-4 / Binary GRD'),
('MOSDAC_INSAT3DR_IMSRA', 'INSAT-3DR IMSRA Rainfall Rate L2B', 'Space Applications Centre (ISRO / MOSDAC)', 'SATELLITE_GEOSYNCHRONOUS', '30_MINUTES', 4000.00, 'mm/hr', 'GEOS_74E_WGS84', 'HDF5 (CF-1.6)'),
('CWC_TELEMETRY_HOURLY', 'CWC Telemetry Rain Gauge Network', 'Central Water Commission / Uttarakhand State', 'GROUND_TELEMETRY', 'HOURLY', 0.00, 'mm/hr', 'EPSG:4326', 'CSV'),
('BHUVAN_TERRAIN_SLOPE', 'Bhuvan CartoDEM Slope Hazard Classification', 'National Remote Sensing Centre (ISRO / Bhuvan)', 'DIGITAL_ELEVATION_THEMATIC', 'STATIC', 30.00, 'degrees', 'EPSG:4326', 'GeoTIFF'),
('BHOONIDHI_EOS04_SAR_ARD', 'EOS-04 C-Band SAR Normalized Radar Backscatter', 'ISRO / Bhoonidhi (NRSC)', 'SATELLITE_SAR_MICROWAVE', 'EVENT_PASS', 36.00, 'DN_linear_gamma0', 'EPSG:32644', 'GeoTIFF (CEOS-ARD L2B)')
ON CONFLICT (dataset_id) DO NOTHING;

-- 8.3 Populate Bhuvan Raster Catalog
INSERT INTO dim_raster_layer (raster_layer_id, file_name, layer_type, state_name, file_size_kb, crs, bbox_geom, resolution_px, file_path) VALUES
('bhuvan_sdv_uk_slope_landslide', 'bhuvan_sdv_uk_slope_landslide.png', 'SLOPE', 'Uttarakhand', 4493.3, 'EPSG:4326', ST_MakeEnvelope(77.5, 28.7, 81.1, 31.5, 4326), '2048x2048', './data/hazard_maps/wms/bhuvan_sdv_uk_slope_landslide.png'),
('bhuvan_moef_UK_LULC50K_1112_uk_lulc', 'bhuvan_moef_UK_LULC50K_1112_uk_lulc.png', 'LULC', 'Uttarakhand', 160.4, 'EPSG:4326', ST_MakeEnvelope(77.5, 28.7, 81.1, 31.5, 4326), '2048x2048', './data/hazard_maps/wms/bhuvan_moef_UK_LULC50K_1112_uk_lulc.png'),
('bhuvan_sisdpv2_UK_Chamoli_lulc_v2_uk_chamoli', 'bhuvan_sisdpv2_UK_Chamoli_lulc_v2_uk_chamoli.png', 'LULC', 'Uttarakhand', 451.8, 'EPSG:4326', ST_MakeEnvelope(77.5, 28.7, 81.1, 31.5, 4326), '2048x2048', './data/hazard_maps/wms/bhuvan_sisdpv2_UK_Chamoli_lulc_v2_uk_chamoli.png'),
('bhuvan_sisdpv2_UK_Uttarkashi_lulc_v2_uk_uttarkashi', 'bhuvan_sisdpv2_UK_Uttarkashi_lulc_v2_uk_uttarkashi.png', 'LULC', 'Uttarakhand', 458.5, 'EPSG:4326', ST_MakeEnvelope(77.5, 28.7, 81.1, 31.5, 4326), '2048x2048', './data/hazard_maps/wms/bhuvan_sisdpv2_UK_Uttarkashi_lulc_v2_uk_uttarkashi.png')
ON CONFLICT (raster_layer_id) DO NOTHING;

-- 8.4 Populate Districts (All 13 Uttarakhand Districts with PostGIS Envelopes)
INSERT INTO dim_district (district_lgd_code, district_name, state_lgd_code, state_name, station_count, centroid_geom, bbox_geom, slope_raster_id) VALUES
(45, 'Almora', 5, 'Uttarakhand', 3, ST_SetSRID(ST_MakePoint(79.699162, 29.568381), 4326), ST_MakeEnvelope(79.620608, 29.538667, 79.749944, 29.619100, 4326), 'bhuvan_sdv_uk_slope_landslide'),
(46, 'Bageshwar', 5, 'Uttarakhand', 3, ST_SetSRID(ST_MakePoint(79.806515, 29.942912), 4326), ST_MakeEnvelope(79.617694, 29.908222, 79.940558, 30.110197, 4326), 'bhuvan_sdv_uk_slope_landslide'),
(47, 'Chamoli', 5, 'Uttarakhand', 3, ST_SetSRID(ST_MakePoint(79.311921, 30.182502), 4326), ST_MakeEnvelope(79.285500, 30.045000, 79.494361, 30.745139, 4326), 'bhuvan_sdv_uk_slope_landslide'),
(48, 'Champawat', 5, 'Uttarakhand', 4, ST_SetSRID(ST_MakePoint(80.089547, 29.208632), 4326), ST_MakeEnvelope(79.882000, 29.072222, 80.117500, 29.449111, 4326), 'bhuvan_sdv_uk_slope_landslide'),
(49, 'Dehradun', 5, 'Uttarakhand', 5, ST_SetSRID(ST_MakePoint(77.969576, 30.420955), 4326), ST_MakeEnvelope(77.665808, 30.222708, 78.234186, 30.761156, 4326), 'bhuvan_sdv_uk_slope_landslide'),
(50, 'Haridwar', 5, 'Uttarakhand', 5, ST_SetSRID(ST_MakePoint(77.937200, 29.839357), 4326), ST_MakeEnvelope(77.801706, 29.641375, 78.036714, 29.935678, 4326), 'bhuvan_sdv_uk_slope_landslide'),
(51, 'Nainital', 5, 'Uttarakhand', 4, ST_SetSRID(ST_MakePoint(79.582314, 29.352315), 4326), ST_MakeEnvelope(79.462328, 29.214725, 79.651194, 29.474139, 4326), 'bhuvan_sdv_uk_slope_landslide'),
(52, 'Pauri Garhwal', 5, 'Uttarakhand', 4, ST_SetSRID(ST_MakePoint(78.503030, 30.009689), 4326), ST_MakeEnvelope(78.290472, 29.751083, 78.817203, 30.235819, 4326), 'bhuvan_sdv_uk_slope_landslide'),
(53, 'Pithoragarh', 5, 'Uttarakhand', 3, ST_SetSRID(ST_MakePoint(80.368345, 29.771868), 4326), ST_MakeEnvelope(80.160972, 29.579389, 80.540472, 29.905944, 4326), 'bhuvan_sdv_uk_slope_landslide'),
(54, 'Rudraprayag', 5, 'Uttarakhand', 4, ST_SetSRID(ST_MakePoint(79.048545, 30.497755), 4326), ST_MakeEnvelope(78.999417, 30.415417, 79.085083, 30.635472, 4326), 'bhuvan_sdv_uk_slope_landslide'),
(55, 'Tehri Garhwal', 5, 'Uttarakhand', 1, ST_SetSRID(ST_MakePoint(78.047389, 30.490750), 4326), ST_MakeEnvelope(78.047389, 30.490750, 78.047389, 30.490750, 4326), 'bhuvan_sdv_uk_slope_landslide'),
(56, 'Udham Singh Nagar', 5, 'Uttarakhand', 5, ST_SetSRID(ST_MakePoint(79.245107, 29.108180), 4326), ST_MakeEnvelope(78.931331, 28.929714, 79.703000, 29.307047, 4326), 'bhuvan_sdv_uk_slope_landslide'),
(57, 'Uttarkashi', 5, 'Uttarakhand', 3, ST_SetSRID(ST_MakePoint(78.458839, 30.778609), 4326), ST_MakeEnvelope(78.103889, 30.731222, 78.712222, 31.015333, 4326), 'bhuvan_sdv_uk_slope_landslide')
ON CONFLICT (district_lgd_code) DO NOTHING;

-- 8.5 Populate Sample Stations
INSERT INTO dim_station (station_id, station_name, agency, district_lgd_code, tehsil, river, basin, location_geom) VALUES
('CWC_UK_Almora_1', 'Almora_1', 'Uttarakhand', 45, 'Almora', 'Kosi', 'Ganga', ST_SetSRID(ST_MakePoint(79.650639, 29.595758), 4326)),
('CWC_UK_Badrinath_1', 'Badrinath_1', 'Uttarakhand', 47, 'Joshimath', 'Alaknanda', 'Ganga', ST_SetSRID(ST_MakePoint(79.494361, 30.745139), 4326)),
('CWC_UK_Chamoli_1', 'Chamoli_1', 'Uttarakhand', 47, 'Chamoli', 'Alaknanda', 'Ganga', ST_SetSRID(ST_MakePoint(79.317500, 30.407222), 4326)),
('CWC_UK_Yamuna_Colony', 'Yamuna Colony', 'Uttarakhand', 49, 'Dehradun', 'Yamuna', 'Ganga', ST_SetSRID(ST_MakePoint(78.036714, 30.337753), 4326)),
('CWC_UK_Kedarnath_1', 'Kedarnath_1', 'Uttarakhand', 54, 'Ukhimath', 'Mandakini', 'Ganga', ST_SetSRID(ST_MakePoint(79.066944, 30.734444), 4326)),
('CWC_UK_Uttarkashi_1', 'Uttarkashi_1', 'Uttarakhand', 57, 'Bhatwari', 'Bhagirathi', 'Ganga', ST_SetSRID(ST_MakePoint(78.435278, 30.726944), 4326))
ON CONFLICT (station_id) DO NOTHING;

-- 8.6 Populate Threshold Rules
INSERT INTO alert_thresholds (disaster_type, district_lgd_code, parameter_name, alert_level, threshold_value, unit, action_protocol) VALUES
('LANDSLIDE', NULL, 'HOURLY_INTENSITY_MM', 'WATCH', 25.00, 'mm/hr', 'Issue yellow advisory to public works department; monitor vulnerable road slopes'),
('LANDSLIDE', NULL, 'HOURLY_INTENSITY_MM', 'ALERT', 50.00, 'mm/hr', 'Dispatch SDRF slope monitoring units; restrict heavy vehicular traffic on NH-58/NH-107'),
('LANDSLIDE', NULL, 'HOURLY_INTENSITY_MM', 'WARNING', 80.00, 'mm/hr', 'Immediate road closure on Char Dham routes; sound community siren in vulnerable settlements'),
('FLASH_FLOOD', 47, 'HOURLY_INTENSITY_MM', 'WARNING', 65.00, 'mm/hr', 'Alaknanda river corridor red alert; initiate evacuation of low-lying riverside ghaths'),
('FLASH_FLOOD', 54, 'HOURLY_INTENSITY_MM', 'WARNING', 65.00, 'mm/hr', 'Mandakini basin flash flood alert; halt trekking to Kedarnath shrine')
ON CONFLICT DO NOTHING;

-- 8.7 Sample Observation Inserts (CWC Ground Telemetry)
INSERT INTO fact_rainfall_telemetry (dataset_id, station_id, district_lgd_code, observed_at, rainfall_mm_hr, raw_value, quality_flag, location_geom) VALUES
('CWC_TELEMETRY_HOURLY', 'CWC_UK_Yamuna_Colony', 49, '2023-07-08 12:00:00+05:30', 38.50, 38.50, 'VALID', ST_SetSRID(ST_MakePoint(78.036714, 30.337753), 4326)),
('CWC_TELEMETRY_HOURLY', 'CWC_UK_Badrinath_1', 47, '2023-07-08 12:00:00+05:30', 72.00, 72.00, 'VALID', ST_SetSRID(ST_MakePoint(79.494361, 30.745139), 4326)),
('CWC_TELEMETRY_HOURLY', 'CWC_UK_Kedarnath_1', 54, '2023-07-08 12:00:00+05:30', 84.50, 84.50, 'SUSPECT_EXTREME', ST_SetSRID(ST_MakePoint(79.066944, 30.734444), 4326)),
('CWC_TELEMETRY_HOURLY', 'CWC_UK_Almora_1', 45, '2023-07-08 12:00:00+05:30', 14.20, 14.20, 'VALID', ST_SetSRID(ST_MakePoint(79.650639, 29.595758), 4326))
ON CONFLICT DO NOTHING;

-- 8.8 Sample Observation Inserts (MOSDAC Satellite)
INSERT INTO fact_rainfall_gridded (dataset_id, district_lgd_code, observed_at, granule_file, cell_point_geom, rainfall_rate_mm_hr, temporal_scale, quality_flag) VALUES
('MOSDAC_INSAT3DR_IMSRA', 47, '2025-08-01 21:15:00+00', '3RIMG_01AUG2025_2115_L2B_IMC_V01R00.h5', ST_SetSRID(ST_MakePoint(79.35, 30.45), 4326), 18.50, '30_MINUTES', 'VALID'),
('MOSDAC_INSAT3DR_IMSRA', 57, '2025-08-01 21:15:00+00', '3RIMG_01AUG2025_2115_L2B_IMC_V01R00.h5', ST_SetSRID(ST_MakePoint(78.50, 30.80), 4326), 22.10, '30_MINUTES', 'VALID')
ON CONFLICT DO NOTHING;

-- 8.9 Sample Observation Inserts (Bhoonidhi EOS-04 SAR Backscatter)
INSERT INTO fact_sar_observations (dataset_id, scene_id, acquisition_timestamp, utm_easting, utm_northing, native_crs, location_geom, dn_hh, gamma0_hh_db, dn_hv, gamma0_hv_db, cross_pol_ratio_db, local_incidence_angle_deg, quality_flag) VALUES
('BHOONIDHI_EOS04_SAR_ARD', 'E04_SAR_CRS_08JUL2023_189124938037', '2023-07-08 12:49:38+00', 246222.00, 3416022.00, 'EPSG:32644', ST_SetSRID(ST_MakePoint(78.3582, 30.8415), 4326), 1377, -3.77, 566, -11.49, -7.72, 48.50, 'VALID'),
('BHOONIDHI_EOS04_SAR_ARD', 'E04_SAR_CRS_28JUL2023_209121625069', '2023-07-28 12:16:25+00', 764200.00, 3374800.00, 'EPSG:32643', ST_SetSRID(ST_MakePoint(77.7540, 30.4820), 4326), 942, -7.07, 445, -13.58, -6.51, 35.80, 'VALID')
ON CONFLICT DO NOTHING;

-- 8.10 Sample Historical Disaster Event
INSERT INTO disaster_events (event_id, event_type, district_lgd_code, event_location_geom, start_timestamp, end_timestamp, severity_level, casualty_count, economic_loss_inr_crores, impact_summary) VALUES
('EVT_UK_2023_JUL_CHAMOLI', 'LANDSLIDE', 47, ST_SetSRID(ST_MakePoint(79.494361, 30.745139), 4326), '2023-07-08 14:00:00+05:30', '2023-07-09 18:00:00+05:30', 'HIGH', 2, 14.50, 'Massive slope failure along NH-58 near Badrinath following 72 mm/hr convective rainfall. Traffic blocked for 36 hours.')
ON CONFLICT (event_id) DO NOTHING;
