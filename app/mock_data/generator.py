"""
Seed Data Generator for Disaster Intelligence Multimodal Platform.
Generates authentic, schema-valid mock records for all 38 tables in schemas/dbdiagram_schema.dbml,
with strict foreign key referential integrity anchored on master episode EP-UTT-2026-10-001
(Rudraprayag cascading landslide disaster), incorporating real Uttarakhand data from data/extracted_readable/.
"""

import csv
import json
import uuid
import datetime
from pathlib import Path
from typing import Dict, Any, List

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data" / "extracted_readable"
OUTPUT_FILE = BASE_DIR / "app" / "mock_data" / "seed_data.json"

NAMESPACE = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")

def make_uuid(name: str) -> str:
    """Generate a stable, deterministic UUID from a string seed."""
    return str(uuid.uuid5(NAMESPACE, name))


def generate_all_tables() -> Dict[str, List[Dict[str, Any]]]:
    """Generate authentic mock data for all 38 tables with foreign key integrity."""
    tables: Dict[str, List[Dict[str, Any]]] = {}

    # Base timestamps
    now = datetime.datetime(2026, 10, 24, 18, 30, 0, tzinfo=datetime.timezone.utc)
    t_minus_1h = (now - datetime.timedelta(hours=1)).isoformat()
    t_minus_2h = (now - datetime.timedelta(hours=2)).isoformat()
    t_minus_3h = (now - datetime.timedelta(hours=3)).isoformat()
    t_minus_4h = (now - datetime.timedelta(hours=4)).isoformat()
    t_minus_6h = (now - datetime.timedelta(hours=6)).isoformat()
    t_minus_12h = (now - datetime.timedelta(hours=12)).isoformat()
    t_minus_24h = (now - datetime.timedelta(hours=24)).isoformat()
    t_minus_48h = (now - datetime.timedelta(hours=48)).isoformat()
    t_now = now.isoformat()
    t_plus_24h = (now + datetime.timedelta(hours=24)).isoformat()
    t_plus_48h = (now + datetime.timedelta(hours=48)).isoformat()

    # ---------------------------------------------------------
    # Group 1: Source Management
    # ---------------------------------------------------------
    # 1. data_source
    src_cwc_id = make_uuid("source_cwc")
    src_imd_id = make_uuid("source_imd")
    src_mosdac_id = make_uuid("source_mosdac")
    src_bhuvan_id = make_uuid("source_bhuvan")
    src_seoc_id = make_uuid("source_seoc")
    src_copernicus_id = make_uuid("source_copernicus")

    tables["data_source"] = [
        {
            "source_id": src_cwc_id,
            "source_code": "SRC_CWC_HYDRO",
            "name": "Central Water Commission Telemetry Feed",
            "source_type": "api",
            "provider": "Central Water Commission (CWC), Ministry of Jal Shakti",
            "base_url": "https://cwc.gov.in/api/v2/telemetry",
            "license": "Government Open Data License - India (GODL)",
            "config": {"refresh_rate_sec": 300, "protocol": "REST_JSON"},
            "is_active": True,
            "last_success_at": t_minus_1h,
            "last_failure_at": None,
            "created_at": t_minus_48h,
        },
        {
            "source_id": src_imd_id,
            "source_code": "SRC_IMD_RADAR_GRID",
            "name": "India Meteorological Department Radar & Gridded Rainfall",
            "source_type": "api",
            "provider": "India Meteorological Department (IMD)",
            "base_url": "https://mausam.imd.gov.in/api/gridded",
            "license": "GODL-India",
            "config": {"resolution_deg": 0.25, "interval_hours": 3},
            "is_active": True,
            "last_success_at": t_minus_1h,
            "last_failure_at": None,
            "created_at": t_minus_48h,
        },
        {
            "source_id": src_mosdac_id,
            "source_code": "SRC_MOSDAC_INSAT3DR",
            "name": "ISRO MOSDAC INSAT-3DR IMSRA Precipitation Feed",
            "source_type": "satellite",
            "provider": "Meteorological & Oceanographic Satellite Data Archival Centre (MOSDAC/ISRO)",
            "base_url": "https://mosdac.gov.in/satellite/insat3dr",
            "license": "ISRO Data Policy",
            "config": {"sensor": "IMSRA", "orbit": "Geostationary"},
            "is_active": True,
            "last_success_at": t_minus_2h,
            "last_failure_at": None,
            "created_at": t_minus_48h,
        },
        {
            "source_id": src_bhuvan_id,
            "source_code": "SRC_BHUVAN_NRSC",
            "name": "ISRO Bhuvan Disaster Services & Landslide Inventory",
            "source_type": "catalogue",
            "provider": "National Remote Sensing Centre (NRSC / ISRO)",
            "base_url": "https://bhuvan.nrsc.gov.in/disaster",
            "license": "ISRO Academic & Disaster Response License",
            "config": {"layers": ["slope", "lulc", "landslide_inventory"]},
            "is_active": True,
            "last_success_at": t_minus_1h,
            "last_failure_at": None,
            "created_at": t_minus_48h,
        },
        {
            "source_id": src_seoc_id,
            "source_code": "SRC_UK_SEOC",
            "name": "Uttarakhand State Emergency Operation Centre Dispatch",
            "source_type": "official_report",
            "provider": "Uttarakhand State Disaster Management Authority (USDMA)",
            "base_url": "https://usdma.uk.gov.in/dispatch",
            "license": "USDMA Official Dissemination",
            "config": {"verification_required": True},
            "is_active": True,
            "last_success_at": t_minus_1h,
            "last_failure_at": None,
            "created_at": t_minus_48h,
        },
        {
            "source_id": src_copernicus_id,
            "source_code": "SRC_COPERNICUS_SENTINEL1",
            "name": "Copernicus Sentinel-1 SAR & EOS-04 C-Band Feed",
            "source_type": "satellite",
            "provider": "European Space Agency / ISRO EOS-04",
            "base_url": "https://dataspace.copernicus.eu/api",
            "license": "Copernicus Open Access",
            "config": {"polarization": "VV+VH", "mode": "IW"},
            "is_active": True,
            "last_success_at": t_minus_4h,
            "last_failure_at": None,
            "created_at": t_minus_48h,
        },
    ]

    # 2. dataset
    ds_cwc_id = make_uuid("dataset_cwc")
    ds_imd_id = make_uuid("dataset_imd")
    ds_sar_id = make_uuid("dataset_sar")
    ds_slope_id = make_uuid("dataset_slope")
    ds_sitrep_id = make_uuid("dataset_sitrep")

    tables["dataset"] = [
        {
            "dataset_id": ds_cwc_id,
            "source_id": src_cwc_id,
            "dataset_code": "DS_CWC_TELEMETRY",
            "name": "CWC Uttarakhand Real-Time Stream Gauge & Rainfall",
            "kind": "feed",
            "modality": "tabular",
            "task": "Hydrological Monitoring",
            "description": "Hourly river discharge, gauge water levels, and precipitation across 47 CWC monitoring stations in Uttarakhand basins.",
            "is_active": True,
            "created_at": t_minus_48h,
        },
        {
            "dataset_id": ds_imd_id,
            "source_id": src_imd_id,
            "dataset_code": "DS_IMD_GRID_025",
            "name": "IMD High-Resolution Gridded Daily Precipitation",
            "kind": "feed",
            "modality": "raster",
            "task": "Precipitation Estimation",
            "description": "0.25-degree daily gridded precipitation dataset interpolated over the Himalayan catchment.",
            "is_active": True,
            "created_at": t_minus_48h,
        },
        {
            "dataset_id": ds_sar_id,
            "source_id": src_copernicus_id,
            "dataset_code": "DS_EOS04_SAR_BACKSCATTER",
            "name": "EOS-04 / Sentinel-1 SAR Backscatter & Soil Moisture",
            "kind": "feed",
            "modality": "raster",
            "task": "Soil Moisture & Flood Mapping",
            "description": "C-band microwave radar backscatter (gamma0 HH/HV) capturing surface saturation and landslide scars.",
            "is_active": True,
            "created_at": t_minus_48h,
        },
        {
            "dataset_id": ds_slope_id,
            "source_id": src_bhuvan_id,
            "dataset_code": "DS_BHUVAN_SLOPE_LULC",
            "name": "ISRO Bhuvan Uttarakhand Slope & Geomorphology Layers",
            "kind": "static_reference",
            "modality": "raster",
            "task": "Susceptibility Modeling",
            "description": "Georeferenced terrain slope raster and Land Use Land Cover (LULC) baseline at 50k scale.",
            "is_active": True,
            "created_at": t_minus_48h,
        },
        {
            "dataset_id": ds_sitrep_id,
            "source_id": src_seoc_id,
            "dataset_code": "DS_USDMA_SITREPS",
            "name": "State Emergency Disaster Situation Reports & Incident Logs",
            "kind": "feed",
            "modality": "text",
            "task": "Disaster Intelligence & Verification",
            "description": "Official bilingual incident bulletins, road closure notices, and evacuation orders.",
            "is_active": True,
            "created_at": t_minus_48h,
        },
    ]

    # 4. pipeline_run (Needed by dataset_version and others)
    run_ingest_id = make_uuid("run_ingest_001")
    run_enrich_id = make_uuid("run_enrich_002")
    run_event_id = make_uuid("run_event_003")
    run_fusion_id = make_uuid("run_fusion_004")

    tables["pipeline_run"] = [
        {
            "pipeline_run_id": run_ingest_id,
            "pipeline_name": "cwc_imd_ingestion_pipeline",
            "pipeline_version": "v2.4.0",
            "stage": "collection",
            "run_type": "scheduled",
            "status": "completed",
            "started_at": t_minus_2h,
            "completed_at": t_minus_1h,
            "records_read": 1850,
            "records_written": 1845,
            "records_rejected": 5,
            "config": {"batch_size": 500, "source": "CWC+IMD"},
            "config_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "error_message": None,
            "created_at": t_minus_2h,
        },
        {
            "pipeline_run_id": run_enrich_id,
            "pipeline_name": "multimodal_enrichment_pipeline",
            "pipeline_version": "v1.8.2",
            "stage": "enrichment",
            "run_type": "scheduled",
            "status": "completed",
            "started_at": t_minus_1h,
            "completed_at": t_minus_1h,
            "records_read": 1845,
            "records_written": 1840,
            "records_rejected": 5,
            "config": {"models": ["RandomForest_LandslideTrigger_v2", "NER_Extractor"]},
            "config_hash": "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
            "error_message": None,
            "created_at": t_minus_1h,
        },
        {
            "pipeline_run_id": run_event_id,
            "pipeline_name": "modality_event_detector",
            "pipeline_version": "v3.1.0",
            "stage": "event_detection",
            "run_type": "scheduled",
            "status": "completed",
            "started_at": t_minus_1h,
            "completed_at": t_minus_1h,
            "records_read": 140,
            "records_written": 140,
            "records_rejected": 0,
            "config": {"confidence_threshold": 0.70},
            "config_hash": "b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01",
            "error_message": None,
            "created_at": t_minus_1h,
        },
        {
            "pipeline_run_id": run_fusion_id,
            "pipeline_name": "unified_event_fusion_engine",
            "pipeline_version": "v2.0.1",
            "stage": "fusion",
            "run_type": "scheduled",
            "status": "completed",
            "started_at": t_minus_1h,
            "completed_at": t_now,
            "records_read": 48,
            "records_written": 24,
            "records_rejected": 0,
            "config": {"temporal_window_hours": 6, "spatial_radius_km": 15},
            "config_hash": "c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012",
            "error_message": None,
            "created_at": t_minus_1h,
        },
    ]

    # 3. dataset_version
    dsv_cwc_id = make_uuid("dsv_cwc_v1")
    dsv_imd_id = make_uuid("dsv_imd_v1")
    dsv_sar_id = make_uuid("dsv_sar_v1")
    dsv_slope_id = make_uuid("dsv_slope_v1")
    dsv_sitrep_id = make_uuid("dsv_sitrep_v1")

    tables["dataset_version"] = [
        {
            "dataset_version_id": dsv_cwc_id,
            "dataset_id": ds_cwc_id,
            "load_run_id": run_ingest_id,
            "version": "v2026.10",
            "released_at": t_minus_12h,
            "valid_from": "2026-10-01",
            "valid_to": "2026-10-31",
            "sample_count": 1767,
            "metadata": {"stations": 47, "parameters": ["rainfall_mm", "discharge_cumec", "water_level_m"]},
            "created_at": t_minus_12h,
        },
        {
            "dataset_version_id": dsv_imd_id,
            "dataset_id": ds_imd_id,
            "load_run_id": run_ingest_id,
            "version": "v2026.10",
            "released_at": t_minus_12h,
            "valid_from": "2026-10-01",
            "valid_to": "2026-10-31",
            "sample_count": 2000,
            "metadata": {"grid_cells": 142, "unit": "mm/day"},
            "created_at": t_minus_12h,
        },
        {
            "dataset_version_id": dsv_sar_id,
            "dataset_id": ds_sar_id,
            "load_run_id": run_ingest_id,
            "version": "v1.0",
            "released_at": t_minus_24h,
            "valid_from": "2026-10-01",
            "valid_to": "2026-10-31",
            "sample_count": 797,
            "metadata": {"polarizations": ["HH", "HV"], "crs": "EPSG:32644"},
            "created_at": t_minus_24h,
        },
        {
            "dataset_version_id": dsv_slope_id,
            "dataset_id": ds_slope_id,
            "load_run_id": run_ingest_id,
            "version": "v2023.1",
            "released_at": "2023-01-01T00:00:00Z",
            "valid_from": "2023-01-01",
            "valid_to": "2030-12-31",
            "sample_count": 13,
            "metadata": {"raster_format": "GeoTIFF", "crs": "EPSG:4326"},
            "created_at": t_minus_48h,
        },
        {
            "dataset_version_id": dsv_sitrep_id,
            "dataset_id": ds_sitrep_id,
            "load_run_id": run_ingest_id,
            "version": "v2026.10.24",
            "released_at": t_minus_6h,
            "valid_from": "2026-10-24",
            "valid_to": "2026-10-25",
            "sample_count": 86,
            "metadata": {"source_types": ["official_bulletin", "field_sitrep", "news_report"]},
            "created_at": t_minus_6h,
        },
    ]

    # ---------------------------------------------------------
    # Group 2: Ingestion & Provenance
    # ---------------------------------------------------------
    # 5. collection
    coll_cwc_id = make_uuid("coll_cwc_001")
    coll_imd_id = make_uuid("coll_imd_002")
    coll_sar_id = make_uuid("coll_sar_003")

    tables["collection"] = [
        {
            "collection_id": coll_cwc_id,
            "pipeline_run_id": run_ingest_id,
            "source_id": src_cwc_id,
            "dataset_id": ds_cwc_id,
            "method": "GET",
            "request_uri": "https://cwc.gov.in/api/v2/telemetry?state=Uttarakhand&format=json",
            "http_status": 200,
            "started_at": t_minus_2h,
            "completed_at": t_minus_2h,
            "records_received": 47,
            "status": "success",
            "error_message": None,
            "created_at": t_minus_2h,
        },
        {
            "collection_id": coll_imd_id,
            "pipeline_run_id": run_ingest_id,
            "source_id": src_imd_id,
            "dataset_id": ds_imd_id,
            "method": "GET",
            "request_uri": "https://mausam.imd.gov.in/api/gridded/uk_grid_025.nc",
            "http_status": 200,
            "started_at": t_minus_2h,
            "completed_at": t_minus_2h,
            "records_received": 142,
            "status": "success",
            "error_message": None,
            "created_at": t_minus_2h,
        },
        {
            "collection_id": coll_sar_id,
            "pipeline_run_id": run_ingest_id,
            "source_id": src_copernicus_id,
            "dataset_id": ds_sar_id,
            "method": "GET",
            "request_uri": "https://dataspace.copernicus.eu/api/sar/eos04/E04_SAR_CRS_08JUL2023.tif",
            "http_status": 200,
            "started_at": t_minus_2h,
            "completed_at": t_minus_2h,
            "records_received": 1,
            "status": "success",
            "error_message": None,
            "created_at": t_minus_2h,
        },
    ]

    # 6. raw_object
    raw_cwc_id = make_uuid("raw_cwc_001")
    raw_imd_id = make_uuid("raw_imd_002")
    raw_sar_id = make_uuid("raw_sar_003")
    raw_sitrep_id = make_uuid("raw_sitrep_004")

    tables["raw_object"] = [
        {
            "raw_object_id": raw_cwc_id,
            "collection_id": coll_cwc_id,
            "storage_uri": "s3://disaster-lake/raw/cwc/20261024_1600_telemetry.json",
            "content_type": "application/json",
            "size_bytes": 135167,
            "sha256": "3a8c1f0b9e8d7a6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a109876543210abcdef01",
            "captured_at": t_minus_2h,
            "metadata": {"station_count": 47},
            "created_at": t_minus_2h,
        },
        {
            "raw_object_id": raw_imd_id,
            "collection_id": coll_imd_id,
            "storage_uri": "s3://disaster-lake/raw/imd/20261024_grid025.nc",
            "content_type": "application/x-netcdf",
            "size_bytes": 91897,
            "sha256": "4b9d2e1c0f9e8b7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a109876543210abcdef02",
            "captured_at": t_minus_2h,
            "metadata": {"variables": ["rain_daily"]},
            "created_at": t_minus_2h,
        },
        {
            "raw_object_id": raw_sar_id,
            "collection_id": coll_sar_id,
            "storage_uri": "s3://disaster-lake/raw/sar/E04_SAR_CRS_08JUL2023.tif",
            "content_type": "image/tiff",
            "size_bytes": 86358,
            "sha256": "5c0e3f2d1a0f9c8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a109876543210abcdef03",
            "captured_at": t_minus_2h,
            "metadata": {"sensor": "EOS-04 C-SAR"},
            "created_at": t_minus_2h,
        },
        {
            "raw_object_id": raw_sitrep_id,
            "collection_id": coll_cwc_id,
            "storage_uri": "s3://disaster-lake/raw/usdma/sitrep_20261024_04.pdf",
            "content_type": "application/pdf",
            "size_bytes": 245000,
            "sha256": "6d1f4a3e2b1a0d9f8e7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2109876543210abcdef04",
            "captured_at": t_minus_4h,
            "metadata": {"title": "SEOC Rudraprayag Landslide Incident Bulletin"},
            "created_at": t_minus_4h,
        },
    ]

    # 7. raw_validation
    tables["raw_validation"] = [
        {
            "raw_validation_id": make_uuid("val_cwc_001"),
            "raw_object_id": raw_cwc_id,
            "status": "passed",
            "schema_valid": True,
            "checksum_valid": True,
            "content_valid": True,
            "validation_errors": {},
            "validator_version": "v1.2.0",
            "validated_at": t_minus_2h,
        },
        {
            "raw_validation_id": make_uuid("val_imd_002"),
            "raw_object_id": raw_imd_id,
            "status": "passed",
            "schema_valid": True,
            "checksum_valid": True,
            "content_valid": True,
            "validation_errors": {},
            "validator_version": "v1.2.0",
            "validated_at": t_minus_2h,
        },
        {
            "raw_validation_id": make_uuid("val_sar_003"),
            "raw_object_id": raw_sar_id,
            "status": "passed",
            "schema_valid": True,
            "checksum_valid": True,
            "content_valid": True,
            "validation_errors": {},
            "validator_version": "v1.2.0",
            "validated_at": t_minus_2h,
        },
    ]

    # 8. ingest_rejection
    tables["ingest_rejection"] = [
        {
            "ingest_rejection_id": make_uuid("rej_001"),
            "pipeline_run_id": run_ingest_id,
            "raw_object_id": raw_cwc_id,
            "record_identifier": "CWC_UK_Assan_Anomaly_999",
            "stage": "validation",
            "rejection_code": "TELEMETRY_SPIKE_EXCEEDED",
            "reason": "Water level telemetry value 89.4m exceeds physical embankment height (22.0m)",
            "details": {"sensor_id": "Assan_1", "reported_value": 89.4, "max_threshold": 22.0},
            "created_at": t_minus_2h,
        },
        {
            "ingest_rejection_id": make_uuid("rej_002"),
            "pipeline_run_id": run_ingest_id,
            "raw_object_id": raw_imd_id,
            "record_identifier": "GRID_UK_OUT_OF_BOUNDS",
            "stage": "normalization",
            "rejection_code": "COORDINATES_OUT_OF_STATE_BBOX",
            "reason": "Grid centroid falls outside Uttarakhand administrative boundary polygon",
            "details": {"latitude": 32.45, "longitude": 82.10},
            "created_at": t_minus_2h,
        },
    ]

    # ---------------------------------------------------------
    # Group 3: Reference Data
    # ---------------------------------------------------------
    # 9. hazard
    haz_weather_id = make_uuid("hazard_weather")
    haz_rain_id = make_uuid("hazard_rain")
    haz_flood_id = make_uuid("hazard_flood")
    haz_landslide_id = make_uuid("hazard_landslide")
    haz_blockage_id = make_uuid("hazard_road_block")
    haz_quake_id = make_uuid("hazard_earthquake")

    tables["hazard"] = [
        {
            "hazard_id": haz_weather_id,
            "parent_hazard_id": None,
            "code": "HAZ_METEOROLOGICAL",
            "name": "Severe Weather",
            "category": "Meteorological",
            "description": "Atmospheric conditions posing immediate risk including high winds, hail, and convective storm activity.",
            "is_active": True,
            "created_at": t_minus_48h,
        },
        {
            "hazard_id": haz_rain_id,
            "parent_hazard_id": haz_weather_id,
            "code": "HAZ_HEAVY_RAINFALL",
            "name": "Heavy Rainfall & Cloudburst",
            "category": "Hydrometeorological",
            "description": "Precipitation exceeding 64.5 mm/day or intense convective cloudburst exceeding 100 mm/hour.",
            "is_active": True,
            "created_at": t_minus_48h,
        },
        {
            "hazard_id": haz_flood_id,
            "parent_hazard_id": None,
            "code": "HAZ_FLASH_FLOOD",
            "name": "Flash Flood & River Inundation",
            "category": "Hydrological",
            "description": "Rapid surge in river water volume and sudden breach of natural or artificial channel banks.",
            "is_active": True,
            "created_at": t_minus_48h,
        },
        {
            "hazard_id": haz_landslide_id,
            "parent_hazard_id": None,
            "code": "HAZ_LANDSLIDE",
            "name": "Landslide & Slope Failure",
            "category": "Geological",
            "description": "Downward movement of rock, debris, or earth mass triggered by intense precipitation or seismic shaking.",
            "is_active": True,
            "created_at": t_minus_48h,
        },
        {
            "hazard_id": haz_blockage_id,
            "parent_hazard_id": haz_landslide_id,
            "code": "HAZ_ROAD_BLOCKAGE",
            "name": "Infrastructure & Road Blockage",
            "category": "Anthropogenic/Infrastructure",
            "description": "Complete obstruction of critical highway corridors and vehicular access routes due to debris or road collapse.",
            "is_active": True,
            "created_at": t_minus_48h,
        },
        {
            "hazard_id": haz_quake_id,
            "parent_hazard_id": None,
            "code": "HAZ_EARTHQUAKE",
            "name": "Earthquake & Seismic Event",
            "category": "Geophysical",
            "description": "Seismic ground shaking along Himalayan fault lines.",
            "is_active": True,
            "created_at": t_minus_48h,
        },
    ]

    # 10. admin_region (Real 13 districts from dim_district.csv)
    admin_regions: List[Dict[str, Any]] = []
    district_region_map: Dict[str, str] = {}
    district_csv_path = DATA_DIR / "dim_district.csv"

    if district_csv_path.exists():
        with open(district_csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                d_name = row["district_name"]
                lgd = int(row["district_lgd_code"])
                reg_id = make_uuid(f"admin_reg_{lgd}")
                district_region_map[d_name] = reg_id
                c_lat = float(row["centroid_lat"])
                c_lon = float(row["centroid_lon"])
                min_lat = float(row["bbox_min_lat"])
                max_lat = float(row["bbox_max_lat"])
                min_lon = float(row["bbox_min_lon"])
                max_lon = float(row["bbox_max_lon"])

                # GeoJSON polygon bbox
                poly_coords = [
                    [
                        [min_lon, min_lat],
                        [max_lon, min_lat],
                        [max_lon, max_lat],
                        [min_lon, max_lat],
                        [min_lon, min_lat],
                    ]
                ]

                admin_regions.append({
                    "admin_region_id": reg_id,
                    "dataset_version_id": dsv_slope_id,
                    "parent_region_id": None,
                    "region_type": "district",
                    "region_code": str(lgd),
                    "name": d_name,
                    "geometry": {"type": "Polygon", "coordinates": poly_coords},
                    "centroid": {"type": "Point", "coordinates": [c_lon, c_lat]},
                    "properties": {
                        "state": "Uttarakhand",
                        "lgd_code": lgd,
                        "station_count": int(row.get("station_count", 0)),
                    },
                    "created_at": t_minus_48h,
                })
    else:
        # Fallback districts
        for lgd, d_name, c_lat, c_lon in [
            (54, "Rudraprayag", 30.498, 79.049),
            (47, "Chamoli", 30.183, 79.312),
            (55, "Tehri Garhwal", 30.491, 78.047),
            (57, "Uttarkashi", 30.779, 78.459),
            (53, "Pithoragarh", 29.772, 80.368),
        ]:
            reg_id = make_uuid(f"admin_reg_{lgd}")
            district_region_map[d_name] = reg_id
            admin_regions.append({
                "admin_region_id": reg_id,
                "dataset_version_id": dsv_slope_id,
                "parent_region_id": None,
                "region_type": "district",
                "region_code": str(lgd),
                "name": d_name,
                "geometry": {"type": "Polygon", "coordinates": [[[c_lon-0.2, c_lat-0.2], [c_lon+0.2, c_lat-0.2], [c_lon+0.2, c_lat+0.2], [c_lon-0.2, c_lat+0.2], [c_lon-0.2, c_lat-0.2]]]},
                "centroid": {"type": "Point", "coordinates": [c_lon, c_lat]},
                "properties": {"state": "Uttarakhand", "lgd_code": lgd},
                "created_at": t_minus_48h,
            })

    tables["admin_region"] = admin_regions

    # 11. static_raster
    raster_slope_id = make_uuid("raster_slope_uk")
    raster_lulc_id = make_uuid("raster_lulc_uk")
    tables["static_raster"] = [
        {
            "static_raster_id": raster_slope_id,
            "dataset_version_id": dsv_slope_id,
            "name": "bhuvan_uk_slope_georeferenced.tif",
            "raster_type": "terrain_slope",
            "storage_uri": "s3://disaster-lake/static_rasters/bhuvan_uk_slope_georeferenced.tif",
            "crs": "EPSG:4326",
            "resolution": 0.000277,
            "width": 3600,
            "height": 2800,
            "bounds": {"min_lon": 77.5, "min_lat": 28.7, "max_lon": 81.1, "max_lat": 31.5},
            "nodata_value": -9999.0,
            "metadata": {"unit": "degrees", "slope_classes": ["0-15", "15-30", "30-45", ">45"]},
            "created_at": t_minus_48h,
        },
        {
            "static_raster_id": raster_lulc_id,
            "dataset_version_id": dsv_slope_id,
            "name": "bhuvan_moef_UK_LULC50K_1112_uk_lulc.tif",
            "raster_type": "land_use_land_cover",
            "storage_uri": "s3://disaster-lake/static_rasters/bhuvan_uk_lulc.tif",
            "crs": "EPSG:4326",
            "resolution": 0.0005,
            "width": 2400,
            "height": 1800,
            "bounds": {"min_lon": 77.5, "min_lat": 28.7, "max_lon": 81.1, "max_lat": 31.5},
            "nodata_value": 255.0,
            "metadata": {"source": "ISRO / NRSC"},
            "created_at": t_minus_48h,
        },
    ]

    # 12. geo_feature (CWC stations from dim_station.geojson or CSV)
    geo_features: List[Dict[str, Any]] = []
    station_feature_map: Dict[str, str] = {}
    station_geojson_path = DATA_DIR / "dim_station.geojson"

    if station_geojson_path.exists():
        with open(station_geojson_path, mode="r", encoding="utf-8") as f:
            st_data = json.load(f)
            for feat in st_data.get("features", []):
                props = feat.get("properties", {})
                st_id = props.get("station_id", "station")
                fid = make_uuid(f"geo_feature_{st_id}")
                station_feature_map[st_id] = fid
                geo_features.append({
                    "geo_feature_id": fid,
                    "source_id": src_cwc_id,
                    "feature_type": "hydrological_station",
                    "name": props.get("station_name", st_id),
                    "external_id": st_id,
                    "geometry": feat.get("geometry", {"type": "Point", "coordinates": [79.0, 30.0]}),
                    "properties": props,
                    "created_at": t_minus_48h,
                })
    else:
        # Fallback key stations
        for st_id, st_name, lon, lat, dist in [
            ("CWC_UK_Basukedar", "Basukedar", 79.0563, 30.4391, "Rudraprayag"),
            ("CWC_UK_Rudraprayag_1", "Rudraprayag Sangam", 78.9800, 30.2850, "Rudraprayag"),
            ("CWC_UK_Joshimath", "Joshimath", 79.5600, 30.5500, "Chamoli"),
            ("CWC_UK_Devprayag", "Devprayag", 78.6000, 30.1460, "Tehri Garhwal"),
        ]:
            fid = make_uuid(f"geo_feature_{st_id}")
            station_feature_map[st_id] = fid
            geo_features.append({
                "geo_feature_id": fid,
                "source_id": src_cwc_id,
                "feature_type": "hydrological_station",
                "name": st_name,
                "external_id": st_id,
                "geometry": {"type": "Point", "coordinates": [lon, lat]},
                "properties": {"station_id": st_id, "district_name": dist},
                "created_at": t_minus_48h,
            })

    tables["geo_feature"] = geo_features

    # ---------------------------------------------------------
    # Group 4: Canonical Source Data
    # ---------------------------------------------------------
    # 13. observation
    obs_rain_cwc_id = make_uuid("obs_rain_basukedar")
    obs_sar_id = make_uuid("obs_sar_eos04")
    obs_text_sitrep_id = make_uuid("obs_text_sitrep_04")
    obs_media_photo_id = make_uuid("obs_media_photo_01")
    obs_stream_surge_id = make_uuid("obs_stream_surge_mandakini")

    tables["observation"] = [
        {
            "observation_id": obs_rain_cwc_id,
            "dataset_version_id": dsv_cwc_id,
            "raw_object_id": raw_cwc_id,
            "hazard_id": haz_rain_id,
            "source_record_id": "REC_CWC_BASUKEDAR_20261024_1400",
            "observed_at": t_minus_4h,
            "observed_start": t_minus_6h,
            "observed_end": t_minus_4h,
            "published_at": t_minus_4h,
            "time_precision": "hour",
            "latitude": 30.439194,
            "longitude": 79.056333,
            "geometry": {"type": "Point", "coordinates": [79.056333, 30.439194]},
            "location_uncertainty_km": 0.05,
            "modality": "tabular",
            "observation_type": "precipitation_gauge",
            "value": {"rainfall_6h_mm": 128.4, "hourly_rate_mm": 32.1, "sensor": "TippingBucket_P1"},
            "quality_status": "verified",
            "quality_score": 0.98,
            "language": "en",
            "source_updated_at": t_minus_4h,
            "source_revision": "rev1",
            "record_hash": "hash_cwc_rain_basukedar_001",
            "status": "active",
            "created_at": t_minus_4h,
        },
        {
            "observation_id": obs_sar_id,
            "dataset_version_id": dsv_sar_id,
            "raw_object_id": raw_sar_id,
            "hazard_id": haz_landslide_id,
            "source_record_id": "REC_EOS04_SAR_20261024_0800",
            "observed_at": t_minus_12h,
            "observed_start": t_minus_12h,
            "observed_end": t_minus_12h,
            "published_at": t_minus_6h,
            "time_precision": "second",
            "latitude": 30.498,
            "longitude": 79.049,
            "geometry": {"type": "Point", "coordinates": [79.049, 30.498]},
            "location_uncertainty_km": 0.02,
            "modality": "raster",
            "observation_type": "sar_backscatter",
            "value": {"gamma0_hh_db": -12.4, "gamma0_hv_db": -18.6, "cross_pol_ratio_db": -4.2, "saturation_pct": 94.2},
            "quality_status": "verified",
            "quality_score": 0.95,
            "language": None,
            "source_updated_at": t_minus_6h,
            "source_revision": "L1B_GRD",
            "record_hash": "hash_sar_backscatter_002",
            "status": "active",
            "created_at": t_minus_6h,
        },
        {
            "observation_id": obs_text_sitrep_id,
            "dataset_version_id": dsv_sitrep_id,
            "raw_object_id": raw_sitrep_id,
            "hazard_id": haz_landslide_id,
            "source_record_id": "REC_USDMA_SITREP_04",
            "observed_at": t_minus_2h,
            "observed_start": t_minus_4h,
            "observed_end": t_minus_2h,
            "published_at": t_minus_2h,
            "time_precision": "minute",
            "latitude": 30.485,
            "longitude": 79.062,
            "geometry": {"type": "Point", "coordinates": [79.062, 30.485]},
            "location_uncertainty_km": 0.2,
            "modality": "text",
            "observation_type": "official_sitrep",
            "value": {"title": "NH-107 Kedarnath Highway Road Blockage at Basukedar", "blocked_km": 340, "stranded_vehicles": 420},
            "quality_status": "verified",
            "quality_score": 0.99,
            "language": "en",
            "source_updated_at": t_minus_2h,
            "source_revision": "v1",
            "record_hash": "hash_text_sitrep_003",
            "status": "active",
            "created_at": t_minus_2h,
        },
        {
            "observation_id": obs_media_photo_id,
            "dataset_version_id": dsv_sitrep_id,
            "raw_object_id": raw_sitrep_id,
            "hazard_id": haz_landslide_id,
            "source_record_id": "REC_SDRF_PHOTO_LSD_01",
            "observed_at": t_minus_2h,
            "observed_start": t_minus_2h,
            "observed_end": t_minus_2h,
            "published_at": t_minus_2h,
            "time_precision": "second",
            "latitude": 30.4852,
            "longitude": 79.0623,
            "geometry": {"type": "Point", "coordinates": [79.0623, 30.4852]},
            "location_uncertainty_km": 0.01,
            "modality": "image",
            "observation_type": "geotagged_field_photo",
            "value": {"caption": "Massive debris mass spanning NH-107 near Basukedar bridge", "width": 1920, "height": 1080},
            "quality_status": "verified",
            "quality_score": 0.97,
            "language": "en",
            "source_updated_at": t_minus_2h,
            "source_revision": "orig",
            "record_hash": "hash_photo_lsd_004",
            "status": "active",
            "created_at": t_minus_2h,
        },
        {
            "observation_id": obs_stream_surge_id,
            "dataset_version_id": dsv_cwc_id,
            "raw_object_id": raw_cwc_id,
            "hazard_id": haz_flood_id,
            "source_record_id": "REC_CWC_MANDAKINI_SURGE",
            "observed_at": t_minus_1h,
            "observed_start": t_minus_2h,
            "observed_end": t_minus_1h,
            "published_at": t_minus_1h,
            "time_precision": "hour",
            "latitude": 30.285,
            "longitude": 78.980,
            "geometry": {"type": "Point", "coordinates": [78.980, 30.285]},
            "location_uncertainty_km": 0.05,
            "modality": "tabular",
            "observation_type": "water_level_gauge",
            "value": {"gauge_reading_m": 625.8, "danger_level_m": 624.0, "discharge_cumec": 1420.0},
            "quality_status": "verified",
            "quality_score": 0.96,
            "language": "en",
            "source_updated_at": t_minus_1h,
            "source_revision": "rev1",
            "record_hash": "hash_stream_surge_005",
            "status": "active",
            "created_at": t_minus_1h,
        },
    ]

    # 14. observation_region
    rudraprayag_reg_id = district_region_map.get("Rudraprayag", admin_regions[0]["admin_region_id"])
    chamoli_reg_id = district_region_map.get("Chamoli", admin_regions[1]["admin_region_id"])

    tables["observation_region"] = [
        {
            "observation_id": obs_rain_cwc_id,
            "admin_region_id": rudraprayag_reg_id,
            "relation": "within",
            "is_primary": True,
            "method": "point_in_polygon",
            "confidence": 1.0,
            "created_at": t_minus_4h,
            "derived_result_id": None,
            "pipeline_run_id": run_enrich_id,
        },
        {
            "observation_id": obs_sar_id,
            "admin_region_id": rudraprayag_reg_id,
            "relation": "within",
            "is_primary": True,
            "method": "raster_boundary_intersect",
            "confidence": 0.95,
            "created_at": t_minus_6h,
            "derived_result_id": None,
            "pipeline_run_id": run_enrich_id,
        },
        {
            "observation_id": obs_text_sitrep_id,
            "admin_region_id": rudraprayag_reg_id,
            "relation": "within",
            "is_primary": True,
            "method": "gazetteer_named_entity",
            "confidence": 0.99,
            "created_at": t_minus_2h,
            "derived_result_id": None,
            "pipeline_run_id": run_enrich_id,
        },
    ]

    # 15. observation_relation
    tables["observation_relation"] = [
        {
            "relation_id": make_uuid("obs_rel_01"),
            "observation_id": obs_rain_cwc_id,
            "related_observation_id": obs_stream_surge_id,
            "pipeline_run_id": run_enrich_id,
            "relation_type": "corroborates",
            "method": "hydrological_causal_correlation",
            "score": 0.94,
            "created_at": t_minus_1h,
        },
        {
            "relation_id": make_uuid("obs_rel_02"),
            "observation_id": obs_sar_id,
            "related_observation_id": obs_rain_cwc_id,
            "pipeline_run_id": run_enrich_id,
            "relation_type": "supports",
            "method": "soil_saturation_precipitation_crossmatch",
            "score": 0.88,
            "created_at": t_minus_1h,
        },
    ]

    # 16. text_item (1-to-1 extension of observation_id=obs_text_sitrep_id)
    tables["text_item"] = [
        {
            "observation_id": obs_text_sitrep_id,
            "parent_observation_id": None,
            "text_kind": "official_sitrep",
            "title": "USDMA Incident SITREP #04: NH-107 Kedarnath Highway Road Blockage at Basukedar",
            "body": (
                "Massive debris slide triggered by 128.4mm rainfall at Basukedar along NH-107. "
                "Road completely severed over 340 meters. SDRF teams dispatched from Agastyamuni. "
                "420 pilgrims and 65 vehicles safely rerouted to designated transit shelters."
            ),
            "content_hash": "a5e8c1d2e3f405162738495a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c",
            "url": "https://usdma.uk.gov.in/sitrep/20261024_04",
            "author": "Dr. V. K. Negi, SEOC In-Charge",
            "publisher": "Uttarakhand State Emergency Operation Centre",
            "platform": "SEOC Official Portal",
            "is_official": True,
            "engagement": {"views": 1420, "shares": 380},
            "entities_raw": {
                "locations": ["Basukedar", "Rudraprayag", "NH-107", "Agastyamuni"],
                "hazards": ["Landslide", "Road Blockage"],
                "agencies": ["SDRF", "USDMA", "BRO"],
            },
        }
    ]

    # 17. raster_product (1-to-1 extension of observation_id=obs_sar_id)
    tables["raster_product"] = [
        {
            "observation_id": obs_sar_id,
            "platform": "EOS-04",
            "sensor": "C-SAR",
            "product_id": "E04_SAR_CRS_08JUL2023_189124938037",
            "processing_level": "Level-1B GRD",
            "acquisition_start": t_minus_12h,
            "acquisition_end": t_minus_12h,
            "resolution_m": 10.0,
            "crs": "EPSG:32644",
            "cloud_cover_pct": 0.0,
            "polarization": "VV+VH",
            "orbit_pass": "Descending",
            "variables": {"gamma0_hh": "dB", "gamma0_hv": "dB", "cross_pol_ratio": "dB"},
            "bands": ["gamma0_hh", "gamma0_hv"],
            "is_pre_event": False,
            "storage_uri": "s3://disaster-lake/rasters/sar/eos04_rudraprayag_20261024.tif",
        }
    ]

    # 18. media
    media_01_id = make_uuid("media_lsd_photo_01")
    tables["media"] = [
        {
            "media_id": media_01_id,
            "observation_id": obs_media_photo_id,
            "raw_object_id": raw_sitrep_id,
            "media_type": "image/jpeg",
            "source_url": "https://usdma.uk.gov.in/media/photos/20261024_nh107_debris.jpg",
            "raw_locator": "$.photos[0]",
            "perceptual_hash": "a8f0c2d3e4b51627",
            "width": 1920,
            "height": 1080,
            "duration_sec": None,
            "geometry": {"type": "Point", "coordinates": [79.0623, 30.4852]},
            "captured_at": t_minus_2h,
        }
    ]

    # ---------------------------------------------------------
    # Group 5: Enrichment & Derived Results
    # ---------------------------------------------------------
    # 19. model
    model_rf_id = make_uuid("model_rf_landslide")
    model_cascade_id = make_uuid("model_cascade_dag")
    tables["model"] = [
        {
            "model_id": model_rf_id,
            "training_dataset_version_id": dsv_slope_id,
            "name": "RandomForest_LandslideTrigger_v2",
            "version": "v2.1.0",
            "task": "Landslide Probability Estimation",
            "framework": "scikit-learn / XGBoost",
            "architecture": "Gradient Boosted Ensembled Trees",
            "model_uri": "s3://disaster-lake/models/rf_landslide_trigger_v2.pkl",
            "config": {"features": ["slope_deg", "accum_rainfall_48h", "sar_cross_pol_db", "distance_to_fault_m"]},
            "is_active": True,
            "created_at": t_minus_48h,
        },
        {
            "model_id": model_cascade_id,
            "training_dataset_version_id": dsv_cwc_id,
            "name": "CausalCascadeEstimator_v1",
            "version": "v1.4.0",
            "task": "Cascading Hazard Graph Inference",
            "framework": "PyTorch Geometric",
            "architecture": "Spatio-Temporal Graph Neural Network",
            "model_uri": "s3://disaster-lake/models/gnn_cascade_v1.pt",
            "config": {"node_types": ["rain", "river", "landslide", "road", "flood"]},
            "is_active": True,
            "created_at": t_minus_48h,
        },
    ]

    # 20. derived_result
    derived_res_lsd_prob_id = make_uuid("derived_lsd_prob_01")
    derived_res_flood_mask_id = make_uuid("derived_flood_mask_02")

    tables["derived_result"] = [
        {
            "derived_result_id": derived_res_lsd_prob_id,
            "observation_id": obs_rain_cwc_id,
            "model_id": model_rf_id,
            "supersedes_result_id": None,
            "result_type": "slope_failure_probability",
            "status": "completed",
            "result": {
                "predicted_hazard": "Landslide",
                "failure_probability": 0.942,
                "critical_trigger": "Rainfall threshold exceeded (128.4mm vs 90mm capacity)",
                "susceptible_slope_deg": 38.5,
            },
            "confidence": 0.94,
            "output_uri": "s3://disaster-lake/derived/landslide_prob_basukedar.json",
            "created_at": t_minus_2h,
        },
        {
            "derived_result_id": derived_res_flood_mask_id,
            "observation_id": obs_stream_surge_id,
            "model_id": model_cascade_id,
            "supersedes_result_id": None,
            "result_type": "inundation_risk_polygon",
            "status": "completed",
            "result": {
                "river_basin": "Mandakini",
                "inundation_area_sqkm": 4.8,
                "downstream_warning_time_min": 45,
            },
            "confidence": 0.89,
            "output_uri": "s3://disaster-lake/derived/inundation_mandakini.geojson",
            "created_at": t_minus_1h,
        },
    ]

    # 21. derived_result_input
    # Constraint ck_derived_input_one: exactly one non-null of observation_id, media_id,
    # static_raster_id, geo_feature_id, input_result_id, modality_event_id, event_id
    tables["derived_result_input"] = [
        {
            "derived_result_input_id": make_uuid("d_input_01"),
            "derived_result_id": derived_res_lsd_prob_id,
            "input_role": "primary_precipitation_telemetry",
            "observation_id": obs_rain_cwc_id,
            "media_id": None,
            "static_raster_id": None,
            "geo_feature_id": None,
            "input_result_id": None,
            "modality_event_id": None,
            "event_id": None,
            "created_at": t_minus_2h,
        },
        {
            "derived_result_input_id": make_uuid("d_input_02"),
            "derived_result_id": derived_res_lsd_prob_id,
            "input_role": "terrain_slope_raster",
            "observation_id": None,
            "media_id": None,
            "static_raster_id": raster_slope_id,
            "geo_feature_id": None,
            "input_result_id": None,
            "modality_event_id": None,
            "event_id": None,
            "created_at": t_minus_2h,
        },
    ]

    # ---------------------------------------------------------
    # Group 6: Source Quality / Scoring
    # ---------------------------------------------------------
    # 22. source_score
    tables["source_score"] = [
        {
            "source_score_id": make_uuid("score_cwc_01"),
            "source_id": src_cwc_id,
            "hazard_id": haz_rain_id,
            "task": "precipitation_telemetry_accuracy",
            "score_type": "accuracy",
            "score": 0.985,
            "methodology": "Cross-validation with IMD automated weather stations",
            "methodology_version": "v1.0",
            "evidence": {"paired_samples": 420, "r2_score": 0.97},
            "valid_from": t_minus_48h,
            "valid_to": t_plus_48h,
            "created_at": t_minus_48h,
        },
        {
            "source_score_id": make_uuid("score_bhuvan_02"),
            "source_id": src_bhuvan_id,
            "hazard_id": haz_landslide_id,
            "task": "landslide_susceptibility_reliability",
            "score_type": "reliability",
            "score": 0.942,
            "methodology": "NRSC Field Audits in Garhwal Himalaya",
            "methodology_version": "v2.0",
            "evidence": {"verified_historical_scars": 892, "true_positive_rate": 0.93},
            "valid_from": t_minus_48h,
            "valid_to": t_plus_48h,
            "created_at": t_minus_48h,
        },
    ]

    # ---------------------------------------------------------
    # Group 7: Event Intelligence
    # ---------------------------------------------------------
    # 23. modality_event
    mod_rain_id = make_uuid("mod_rain_001")
    mod_sar_id = make_uuid("mod_sar_002")
    mod_stream_id = make_uuid("mod_stream_003")
    mod_report_id = make_uuid("mod_report_004")
    mod_road_id = make_uuid("mod_road_005")

    tables["modality_event"] = [
        {
            "modality_event_id": mod_rain_id,
            "hazard_id": haz_rain_id,
            "pipeline_run_id": run_event_id,
            "supersedes_modality_event_id": None,
            "origin": "sensor",
            "evidence_domain": "weather",
            "start_time": t_minus_6h,
            "end_time": t_minus_4h,
            "time_precision": "hour",
            "published_at": t_minus_4h,
            "geometry": {"type": "Point", "coordinates": [79.056333, 30.439194]},
            "location_uncertainty_km": 0.1,
            "magnitude": 128.4,
            "magnitude_type": "precipitation_mm_6h",
            "depth_km": None,
            "severity": "Critical",
            "confidence": 0.98,
            "status": "active",
            "attributes": {"station_id": "CWC_UK_Basukedar", "sensor_reading": "128.4mm"},
            "created_at": t_minus_4h,
        },
        {
            "modality_event_id": mod_sar_id,
            "hazard_id": haz_landslide_id,
            "pipeline_run_id": run_event_id,
            "supersedes_modality_event_id": None,
            "origin": "satellite",
            "evidence_domain": "sar_satellite",
            "start_time": t_minus_12h,
            "end_time": t_minus_6h,
            "time_precision": "hour",
            "published_at": t_minus_6h,
            "geometry": {"type": "Point", "coordinates": [79.049, 30.498]},
            "location_uncertainty_km": 0.05,
            "magnitude": 94.2,
            "magnitude_type": "soil_saturation_pct",
            "depth_km": None,
            "severity": "High",
            "confidence": 0.95,
            "status": "active",
            "attributes": {"sensor": "EOS-04 C-SAR", "cross_pol_db": -4.2},
            "created_at": t_minus_6h,
        },
        {
            "modality_event_id": mod_stream_id,
            "hazard_id": haz_flood_id,
            "pipeline_run_id": run_event_id,
            "supersedes_modality_event_id": None,
            "origin": "sensor",
            "evidence_domain": "hydrological",
            "start_time": t_minus_2h,
            "end_time": t_now,
            "time_precision": "minute",
            "published_at": t_minus_1h,
            "geometry": {"type": "Point", "coordinates": [78.980, 30.285]},
            "location_uncertainty_km": 0.05,
            "magnitude": 625.8,
            "magnitude_type": "water_level_masl",
            "depth_km": None,
            "severity": "High",
            "confidence": 0.96,
            "status": "active",
            "attributes": {"river": "Mandakini", "danger_level": 624.0, "status": "Above Danger Level"},
            "created_at": t_minus_1h,
        },
        {
            "modality_event_id": mod_report_id,
            "hazard_id": haz_landslide_id,
            "pipeline_run_id": run_event_id,
            "supersedes_modality_event_id": None,
            "origin": "human_curated",
            "evidence_domain": "official_report",
            "start_time": t_minus_2h,
            "end_time": t_now,
            "time_precision": "minute",
            "published_at": t_minus_2h,
            "geometry": {"type": "Point", "coordinates": [79.062, 30.485]},
            "location_uncertainty_km": 0.1,
            "magnitude": 18500.0,
            "magnitude_type": "debris_volume_m3",
            "depth_km": None,
            "severity": "Critical",
            "confidence": 0.99,
            "status": "active",
            "attributes": {"road": "NH-107", "location": "Basukedar"},
            "created_at": t_minus_2h,
        },
        {
            "modality_event_id": mod_road_id,
            "hazard_id": haz_blockage_id,
            "pipeline_run_id": run_event_id,
            "supersedes_modality_event_id": None,
            "origin": "human_curated",
            "evidence_domain": "infrastructure",
            "start_time": t_minus_2h,
            "end_time": t_now,
            "time_precision": "minute",
            "published_at": t_minus_2h,
            "geometry": {"type": "Point", "coordinates": [79.062, 30.485]},
            "location_uncertainty_km": 0.05,
            "magnitude": 340.0,
            "magnitude_type": "carriageway_blocked_m",
            "depth_km": None,
            "severity": "Critical",
            "confidence": 1.0,
            "status": "active",
            "attributes": {"route": "Kedarnath Highway NH-107", "traffic": "Suspended"},
            "created_at": t_minus_2h,
        },
    ]

    # 24. modality_event_input
    # Constraint ck_modality_input_one: exactly one non-null of observation_id, derived_result_id
    tables["modality_event_input"] = [
        {
            "modality_event_input_id": make_uuid("m_input_01"),
            "modality_event_id": mod_rain_id,
            "observation_id": obs_rain_cwc_id,
            "derived_result_id": None,
            "input_role": "primary_rainfall_telemetry",
            "weight": 1.0,
            "created_at": t_minus_4h,
        },
        {
            "modality_event_input_id": make_uuid("m_input_02"),
            "modality_event_id": mod_sar_id,
            "observation_id": obs_sar_id,
            "derived_result_id": None,
            "input_role": "sar_backscatter_raster",
            "weight": 0.95,
            "created_at": t_minus_6h,
        },
        {
            "modality_event_input_id": make_uuid("m_input_03"),
            "modality_event_id": mod_stream_id,
            "observation_id": obs_stream_surge_id,
            "derived_result_id": None,
            "input_role": "water_level_sensor_reading",
            "weight": 1.0,
            "created_at": t_minus_1h,
        },
        {
            "modality_event_input_id": make_uuid("m_input_04"),
            "modality_event_id": mod_report_id,
            "observation_id": obs_text_sitrep_id,
            "derived_result_id": None,
            "input_role": "official_sitrep_text",
            "weight": 1.0,
            "created_at": t_minus_2h,
        },
        {
            "modality_event_input_id": make_uuid("m_input_05"),
            "modality_event_id": mod_road_id,
            "observation_id": None,
            "derived_result_id": derived_res_lsd_prob_id,
            "input_role": "model_predicted_highway_severance",
            "weight": 0.92,
            "created_at": t_minus_2h,
        },
    ]

    # 25. event_match
    tables["event_match"] = [
        {
            "event_match_id": make_uuid("match_01"),
            "pipeline_run_id": run_fusion_id,
            "modality_event_a_id": mod_rain_id,
            "modality_event_b_id": mod_sar_id,
            "overall_score": 0.93,
            "decision": "match",
            "method": "rule_based",
            "signals": {"spatial_overlap_pct": 92.4, "temporal_lag_hours": 2.0},
            "created_at": t_minus_1h,
        },
        {
            "event_match_id": make_uuid("match_02"),
            "pipeline_run_id": run_fusion_id,
            "modality_event_a_id": mod_report_id,
            "modality_event_b_id": mod_road_id,
            "overall_score": 0.99,
            "decision": "match",
            "method": "rule_based",
            "signals": {"road_id_match": True, "geotag_distance_meters": 15.0},
            "created_at": t_minus_1h,
        },
    ]

    # 26. event (Unified Events)
    ev_rain_id = make_uuid("ev_rain_001")
    ev_stream_id = make_uuid("ev_stream_002")
    ev_lsd_id = make_uuid("ev_lsd_003")
    ev_road_id = make_uuid("ev_road_004")
    ev_flood_id = make_uuid("ev_flood_005")

    tables["event"] = [
        {
            "event_id": ev_rain_id,
            "hazard_id": haz_rain_id,
            "pipeline_run_id": run_fusion_id,
            "event_code": "EV-RAIN-2026-10-08-002",
            "name": "Heavy Rainfall in Mandakini Catchment",
            "start_time": t_minus_6h,
            "end_time": t_now,
            "time_precision": "hour",
            "centroid": {"type": "Point", "coordinates": [79.056333, 30.439194]},
            "affected_area": {"type": "Polygon", "coordinates": [[[78.95, 30.35], [79.15, 30.35], [79.15, 30.55], [78.95, 30.55], [78.95, 30.35]]]},
            "magnitude": 128.4,
            "magnitude_type": "precipitation_mm",
            "severity": "Critical",
            "confidence": 0.98,
            "confidence_method": "Multi-station telemetry corroborated with IMD Doppler radar",
            "status": "ongoing",
            "verification": "verified",
            "verification_notes": "Corroborated by CWC Basukedar, CWC Rudraprayag, and IMD AWS",
            "description": "Continuous cloudburst-induced heavy precipitation across Rudraprayag upper catchment reaching 128.4 mm in 6 hours.",
            "created_at": t_minus_4h,
            "updated_at": t_now,
        },
        {
            "event_id": ev_stream_id,
            "hazard_id": haz_flood_id,
            "pipeline_run_id": run_fusion_id,
            "event_code": "EV-RIV-2026-10-09-002",
            "name": "Mandakini River Surging Above Warning Mark",
            "start_time": t_minus_3h,
            "end_time": t_now,
            "time_precision": "hour",
            "centroid": {"type": "Point", "coordinates": [78.9800, 30.2850]},
            "affected_area": {"type": "Polygon", "coordinates": [[[78.92, 30.25], [79.05, 30.25], [79.05, 30.35], [78.92, 30.35], [78.92, 30.25]]]},
            "magnitude": 625.8,
            "magnitude_type": "water_level_masl",
            "severity": "High",
            "confidence": 0.96,
            "confidence_method": "CWC Rudraprayag Sangam gauge telemetry",
            "status": "ongoing",
            "verification": "verified",
            "verification_notes": "Exceeds danger level by 1.8 meters.",
            "description": "Rapid water surge in Mandakini River threatening low-lying ghats and settlements downstream of Agastyamuni.",
            "created_at": t_minus_3h,
            "updated_at": t_now,
        },
        {
            "event_id": ev_lsd_id,
            "hazard_id": haz_landslide_id,
            "pipeline_run_id": run_fusion_id,
            "event_code": "EV-LSD-2026-10-09-001",
            "name": "Basukedar Major Landslide on NH-107",
            "start_time": t_minus_2h,
            "end_time": t_now,
            "time_precision": "minute",
            "centroid": {"type": "Point", "coordinates": [79.0620, 30.4850]},
            "affected_area": {"type": "Polygon", "coordinates": [[[79.04, 30.46], [79.08, 30.46], [79.08, 30.50], [79.04, 30.50], [79.04, 30.46]]]},
            "magnitude": 18500.0,
            "magnitude_type": "debris_volume_m3",
            "severity": "Critical",
            "confidence": 0.99,
            "confidence_method": "SDRF SITREP + Geotagged Drone Imagery + BRO On-site Survey",
            "status": "active",
            "verification": "verified",
            "verification_notes": "SDRF Quick Response Team on site; BRO Task Force 752 deployed with excavators",
            "description": "Major slope failure triggering rockfall and debris avalanche across Kedarnath Highway (NH-107) near Basukedar.",
            "created_at": t_minus_2h,
            "updated_at": t_now,
        },
        {
            "event_id": ev_road_id,
            "hazard_id": haz_blockage_id,
            "pipeline_run_id": run_fusion_id,
            "event_code": "EV-ROD-2026-10-09-004",
            "name": "NH-107 Kedarnath Highway Road Blockage",
            "start_time": t_minus_2h,
            "end_time": t_now,
            "time_precision": "minute",
            "centroid": {"type": "Point", "coordinates": [79.0620, 30.4850]},
            "affected_area": {"type": "Polygon", "coordinates": [[[79.05, 30.47], [79.07, 30.47], [79.07, 30.49], [79.05, 30.49], [79.05, 30.47]]]},
            "magnitude": 340.0,
            "magnitude_type": "road_length_m",
            "severity": "Critical",
            "confidence": 1.0,
            "confidence_method": "District Police Dispatch + BRO Ground Confirmation",
            "status": "active",
            "verification": "verified",
            "verification_notes": "Vehicular movement suspended between Agastyamuni and Kund",
            "description": "Complete vehicular cutoff along 340m stretch of National Highway 107. Traffic diverted via Tehri bypass.",
            "created_at": t_minus_2h,
            "updated_at": t_now,
        },
        {
            "event_id": ev_flood_id,
            "hazard_id": haz_flood_id,
            "pipeline_run_id": run_fusion_id,
            "event_code": "EV-FLD-2026-10-09-005",
            "name": "Mandakini Flash Flood Downstream Warning",
            "start_time": t_minus_1h,
            "end_time": t_now,
            "time_precision": "minute",
            "centroid": {"type": "Point", "coordinates": [78.9800, 30.2850]},
            "affected_area": {"type": "Polygon", "coordinates": [[[78.90, 30.20], [79.05, 30.20], [79.05, 30.35], [78.90, 30.35], [78.90, 30.20]]]},
            "magnitude": 1420.0,
            "magnitude_type": "discharge_cumec",
            "severity": "High",
            "confidence": 0.88,
            "confidence_method": "Causal Cascade GNN Prediction + Gauge Inflow Model",
            "status": "active",
            "verification": "likely_true",
            "verification_notes": "Debris dam impoundment breach warning issued by SEOC",
            "description": "Secondary flash flood wave generated by potential debris dam breach in Basukedar tributary stream.",
            "created_at": t_minus_1h,
            "updated_at": t_now,
        },
    ]

    # 27. event_attribute_selection
    tables["event_attribute_selection"] = [
        {
            "event_attribute_selection_id": make_uuid("att_sel_01"),
            "event_id": ev_lsd_id,
            "modality_event_id": mod_report_id,
            "pipeline_run_id": run_fusion_id,
            "attribute_name": "debris_volume_m3",
            "value": {"value": 18500.0, "unit": "m3", "source": "SDRF SITREP #04"},
            "method": "authoritative_agency_priority",
            "created_at": t_minus_2h,
        },
        {
            "event_attribute_selection_id": make_uuid("att_sel_02"),
            "event_id": ev_rain_id,
            "modality_event_id": mod_rain_id,
            "pipeline_run_id": run_fusion_id,
            "attribute_name": "cumulative_rainfall_mm",
            "value": {"value": 128.4, "unit": "mm", "source": "CWC_UK_Basukedar"},
            "method": "highest_sensor_accuracy",
            "created_at": t_minus_4h,
        },
    ]

    # 28. event_member
    tables["event_member"] = [
        {
            "event_id": ev_rain_id,
            "modality_event_id": mod_rain_id,
            "pipeline_run_id": run_fusion_id,
            "membership_score": 1.0,
            "is_primary": True,
            "created_at": t_minus_4h,
        },
        {
            "event_id": ev_lsd_id,
            "modality_event_id": mod_sar_id,
            "pipeline_run_id": run_fusion_id,
            "membership_score": 0.94,
            "is_primary": False,
            "created_at": t_minus_2h,
        },
        {
            "event_id": ev_lsd_id,
            "modality_event_id": mod_report_id,
            "pipeline_run_id": run_fusion_id,
            "membership_score": 1.0,
            "is_primary": True,
            "created_at": t_minus_2h,
        },
        {
            "event_id": ev_stream_id,
            "modality_event_id": mod_stream_id,
            "pipeline_run_id": run_fusion_id,
            "membership_score": 1.0,
            "is_primary": True,
            "created_at": t_minus_1h,
        },
        {
            "event_id": ev_road_id,
            "modality_event_id": mod_road_id,
            "pipeline_run_id": run_fusion_id,
            "membership_score": 1.0,
            "is_primary": True,
            "created_at": t_minus_2h,
        },
    ]

    # 29. event_evidence
    # Constraint ck_event_evidence_one: exactly one non-null of observation_id, derived_result_id
    tables["event_evidence"] = [
        {
            "event_evidence_id": make_uuid("ev_evidence_01"),
            "event_id": ev_lsd_id,
            "observation_id": obs_text_sitrep_id,
            "derived_result_id": None,
            "pipeline_run_id": run_fusion_id,
            "stance": "supports",
            "confidence": 0.99,
            "is_primary": True,
            "created_at": t_minus_2h,
        },
        {
            "event_evidence_id": make_uuid("ev_evidence_02"),
            "event_id": ev_lsd_id,
            "observation_id": obs_sar_id,
            "derived_result_id": None,
            "pipeline_run_id": run_fusion_id,
            "stance": "supports",
            "confidence": 0.95,
            "is_primary": False,
            "created_at": t_minus_2h,
        },
        {
            "event_evidence_id": make_uuid("ev_evidence_03"),
            "event_id": ev_lsd_id,
            "observation_id": None,
            "derived_result_id": derived_res_lsd_prob_id,
            "pipeline_run_id": run_fusion_id,
            "stance": "supports",
            "confidence": 0.94,
            "is_primary": False,
            "created_at": t_minus_2h,
        },
    ]

    # 30. event_region
    tables["event_region"] = [
        {
            "event_id": ev_lsd_id,
            "admin_region_id": rudraprayag_reg_id,
            "relation": "within",
            "overlap_fraction": 1.0,
            "is_primary": True,
            "method": "point_in_polygon",
            "created_at": t_minus_2h,
            "pipeline_run_id": run_fusion_id,
        },
        {
            "event_id": ev_rain_id,
            "admin_region_id": rudraprayag_reg_id,
            "relation": "overlaps",
            "overlap_fraction": 0.85,
            "is_primary": True,
            "method": "grid_intersection",
            "created_at": t_minus_4h,
            "pipeline_run_id": run_fusion_id,
        },
        {
            "event_id": ev_stream_id,
            "admin_region_id": rudraprayag_reg_id,
            "relation": "within",
            "overlap_fraction": 1.0,
            "is_primary": True,
            "method": "river_reach_intersection",
            "created_at": t_minus_1h,
            "pipeline_run_id": run_fusion_id,
        },
    ]

    # 31. event_impact
    tables["event_impact"] = [
        {
            "event_impact_id": make_uuid("impact_01"),
            "event_id": ev_road_id,
            "admin_region_id": rudraprayag_reg_id,
            "geo_feature_id": None,
            "source_observation_id": obs_text_sitrep_id,
            "source_derived_result_id": None,
            "pipeline_run_id": run_fusion_id,
            "kind": "infrastructure_damaged",
            "category": "transportation",
            "origin": "reported",
            "metric_value": 340.0,
            "unit": "meters",
            "geometry": {"type": "Point", "coordinates": [79.062, 30.485]},
            "confidence": 0.99,
            "is_canonical": True,
            "method": "sdrf_ground_survey",
            "created_at": t_minus_2h,
        },
        {
            "event_impact_id": make_uuid("impact_02"),
            "event_id": ev_road_id,
            "admin_region_id": rudraprayag_reg_id,
            "geo_feature_id": None,
            "source_observation_id": obs_text_sitrep_id,
            "source_derived_result_id": None,
            "pipeline_run_id": run_fusion_id,
            "kind": "population_displaced",
            "category": "humanitarian",
            "origin": "reported",
            "metric_value": 420.0,
            "unit": "persons",
            "geometry": {"type": "Point", "coordinates": [79.062, 30.485]},
            "confidence": 0.95,
            "is_canonical": True,
            "method": "district_shelter_registration",
            "created_at": t_minus_2h,
        },
        {
            "event_impact_id": make_uuid("impact_03"),
            "event_id": ev_flood_id,
            "admin_region_id": rudraprayag_reg_id,
            "geo_feature_id": None,
            "source_observation_id": None,
            "source_derived_result_id": derived_res_flood_mask_id,
            "pipeline_run_id": run_fusion_id,
            "kind": "economic_loss",
            "category": "infrastructure_risk",
            "origin": "predicted",
            "metric_value": 12.5,
            "unit": "crore_inr",
            "geometry": {"type": "Point", "coordinates": [78.980, 30.285]},
            "confidence": 0.85,
            "is_canonical": False,
            "method": "hydrodynamic_inundation_model",
            "created_at": t_minus_1h,
        },
    ]

    # 32. event_lineage
    tables["event_lineage"] = [
        {
            "event_lineage_id": make_uuid("lineage_01"),
            "from_event_id": ev_rain_id,
            "to_event_id": ev_lsd_id,
            "pipeline_run_id": run_fusion_id,
            "relation": "escalates_to",
            "reason": "Rainfall saturation triggered critical slope shear failure",
            "created_at": t_minus_2h,
        },
        {
            "event_lineage_id": make_uuid("lineage_02"),
            "from_event_id": ev_lsd_id,
            "to_event_id": ev_road_id,
            "pipeline_run_id": run_fusion_id,
            "relation": "splits_into",
            "reason": "Debris mass completely severed the highway corridor",
            "created_at": t_minus_2h,
        },
    ]

    # 33. event_relationship (Horizontal Episode Relationship Graph)
    tables["event_relationship"] = [
        {
            "event_relationship_id": make_uuid("rel_rain_stream"),
            "parent_event_id": ev_rain_id,
            "child_event_id": ev_stream_id,
            "pipeline_run_id": run_fusion_id,
            "relationship_type": "causes",
            "confidence": 0.98,
            "evidence": {"epistemic_badge": "Confirmed", "notes": "Runoff generated direct river surge"},
            "created_at": t_minus_3h,
        },
        {
            "event_relationship_id": make_uuid("rel_rain_lsd"),
            "parent_event_id": ev_rain_id,
            "child_event_id": ev_lsd_id,
            "pipeline_run_id": run_fusion_id,
            "relationship_type": "triggers",
            "confidence": 0.95,
            "evidence": {"epistemic_badge": "Confirmed", "notes": "Slope failure triggered by 128.4mm rainfall"},
            "created_at": t_minus_2h,
        },
        {
            "event_relationship_id": make_uuid("rel_lsd_road"),
            "parent_event_id": ev_lsd_id,
            "child_event_id": ev_road_id,
            "pipeline_run_id": run_fusion_id,
            "relationship_type": "results_in",
            "confidence": 0.99,
            "evidence": {"epistemic_badge": "Observed", "notes": "Debris deposited directly on carriageway"},
            "created_at": t_minus_2h,
        },
        {
            "event_relationship_id": make_uuid("rel_stream_flood"),
            "parent_event_id": ev_stream_id,
            "child_event_id": ev_flood_id,
            "pipeline_run_id": run_fusion_id,
            "relationship_type": "escalates_to",
            "confidence": 0.88,
            "evidence": {"epistemic_badge": "Inferred", "notes": "River surge approaching flood threshold"},
            "created_at": t_minus_1h,
        },
        {
            "event_relationship_id": make_uuid("rel_lsd_flood"),
            "parent_event_id": ev_lsd_id,
            "child_event_id": ev_flood_id,
            "pipeline_run_id": run_fusion_id,
            "relationship_type": "debris_dam_overflow",
            "confidence": 0.82,
            "evidence": {"epistemic_badge": "Possible", "notes": "Tributary blockage could release sudden flood surge"},
            "created_at": t_minus_1h,
        },
    ]

    # 34. event_group (Master Episode EP-UTT-2026-10-001)
    ep_master_id = make_uuid("ep_master_rudraprayag")
    ep_chamoli_id = make_uuid("ep_chamoli_stream")

    tables["event_group"] = [
        {
            "event_group_id": ep_master_id,
            "pipeline_run_id": run_fusion_id,
            "event_group_code": "EP-UTT-2026-10-001",
            "name": "Rudraprayag Heavy Rainfall & Cascading Landslide Episode",
            "description": (
                "A severe hydrometeorological cascading disaster episode initiated by localized cloudburst "
                "in upper Mandakini basin, inducing steep slope failure at Basukedar, catastrophic blockage "
                "of Kedarnath Highway (NH-107), and downstream river inundation threat."
            ),
            "start_time": t_minus_6h,
            "end_time": None,
            "centroid": {"type": "Point", "coordinates": [79.056, 30.439]},
            "affected_area": {"type": "Polygon", "coordinates": [[[78.90, 30.20], [79.20, 30.20], [79.20, 30.60], [78.90, 30.60], [78.90, 30.20]]]},
            "severity": "Critical",
            "confidence": 0.98,
            "status": "active",
            "created_at": t_minus_6h,
            "updated_at": t_now,
        },
        {
            "event_group_id": ep_chamoli_id,
            "pipeline_run_id": run_fusion_id,
            "event_group_code": "EP-CHA-2026-10-002",
            "name": "Chamoli Glacial Stream Surge & Catchment Alert",
            "description": "High glacial melt and localized precipitation surge triggering high alert along Dhauliganga river banks.",
            "start_time": t_minus_24h,
            "end_time": t_minus_4h,
            "centroid": {"type": "Point", "coordinates": [79.560, 30.550]},
            "affected_area": {"type": "Polygon", "coordinates": [[[79.40, 30.40], [79.70, 30.40], [79.70, 30.70], [79.40, 30.70], [79.40, 30.40]]]},
            "severity": "Moderate",
            "confidence": 0.91,
            "status": "resolved",
            "created_at": t_minus_24h,
            "updated_at": t_minus_4h,
        },
    ]

    # 35. event_group_member
    tables["event_group_member"] = [
        {
            "event_group_id": ep_master_id,
            "event_id": ev_rain_id,
            "pipeline_run_id": run_fusion_id,
            "role": "trigger",
            "is_primary": True,
            "confidence": 0.98,
            "created_at": t_minus_4h,
        },
        {
            "event_group_id": ep_master_id,
            "event_id": ev_stream_id,
            "pipeline_run_id": run_fusion_id,
            "role": "consequence",
            "is_primary": False,
            "confidence": 0.95,
            "created_at": t_minus_3h,
        },
        {
            "event_group_id": ep_master_id,
            "event_id": ev_lsd_id,
            "pipeline_run_id": run_fusion_id,
            "role": "primary",
            "is_primary": True,
            "confidence": 0.99,
            "created_at": t_minus_2h,
        },
        {
            "event_group_id": ep_master_id,
            "event_id": ev_road_id,
            "pipeline_run_id": run_fusion_id,
            "role": "consequence",
            "is_primary": False,
            "confidence": 0.99,
            "created_at": t_minus_2h,
        },
        {
            "event_group_id": ep_master_id,
            "event_id": ev_flood_id,
            "pipeline_run_id": run_fusion_id,
            "role": "consequence",
            "is_primary": False,
            "confidence": 0.88,
            "created_at": t_minus_1h,
        },
    ]

    # ---------------------------------------------------------
    # Group 8: Benchmark Datasets
    # ---------------------------------------------------------
    # 36. dataset_sample
    sample_single_id = make_uuid("sample_single_001")
    sample_multi_id = make_uuid("sample_multi_002")

    tables["dataset_sample"] = [
        {
            "dataset_sample_id": sample_single_id,
            "dataset_version_id": dsv_slope_id,
            "event_group_id": None,
            "external_sample_id": "BENCH_LSD_SINGLE_2026_01",
            "sample_type": "single_event",
            "split": "test",
            "label": {"hazard_class": "landslide", "volume_class": "large (>10,000 m3)", "triggered": True},
            "weight": 1.0,
            "created_at": t_minus_12h,
        },
        {
            "dataset_sample_id": sample_multi_id,
            "dataset_version_id": dsv_cwc_id,
            "event_group_id": ep_master_id,
            "external_sample_id": "BENCH_CASCADE_MULTI_2026_02",
            "sample_type": "multi_event",
            "split": "validation",
            "label": {
                "cascade_pattern": "rain_to_landslide_to_dam_breach",
                "total_events_in_chain": 5,
                "critical_bottleneck": "NH-107",
            },
            "weight": 1.5,
            "created_at": t_minus_6h,
        },
    ]

    # 37. dataset_sample_item
    # Constraint ck_sample_item_one: exactly one non-null of observation_id, media_id, derived_result_id
    tables["dataset_sample_item"] = [
        {
            "dataset_sample_item_id": make_uuid("s_item_01"),
            "dataset_sample_id": sample_single_id,
            "observation_id": obs_sar_id,
            "media_id": None,
            "derived_result_id": None,
            "role": "radar_backscatter_feature",
            "created_at": t_minus_12h,
        },
        {
            "dataset_sample_item_id": make_uuid("s_item_02"),
            "dataset_sample_id": sample_multi_id,
            "observation_id": obs_rain_cwc_id,
            "media_id": None,
            "derived_result_id": None,
            "role": "trigger_rainfall_series",
            "created_at": t_minus_6h,
        },
        {
            "dataset_sample_item_id": make_uuid("s_item_03"),
            "dataset_sample_id": sample_multi_id,
            "observation_id": None,
            "media_id": None,
            "derived_result_id": derived_res_lsd_prob_id,
            "role": "derived_susceptibility_prior",
            "created_at": t_minus_6h,
        },
    ]

    # 38. dataset_sample_event
    tables["dataset_sample_event"] = [
        {
            "dataset_sample_event_id": make_uuid("s_event_01"),
            "dataset_sample_id": sample_single_id,
            "event_id": ev_lsd_id,
            "role": "primary",
            "is_primary": True,
            "relationship_to_primary": None,
            "confidence": 1.0,
            "created_at": t_minus_12h,
        },
        {
            "dataset_sample_event_id": make_uuid("s_event_02"),
            "dataset_sample_id": sample_multi_id,
            "event_id": ev_rain_id,
            "role": "trigger",
            "is_primary": False,
            "relationship_to_primary": "triggers",
            "confidence": 0.98,
            "created_at": t_minus_6h,
        },
        {
            "dataset_sample_event_id": make_uuid("s_event_03"),
            "dataset_sample_id": sample_multi_id,
            "event_id": ev_lsd_id,
            "role": "primary",
            "is_primary": True,
            "relationship_to_primary": None,
            "confidence": 1.0,
            "created_at": t_minus_6h,
        },
        {
            "dataset_sample_event_id": make_uuid("s_event_04"),
            "dataset_sample_id": sample_multi_id,
            "event_id": ev_road_id,
            "role": "impact",
            "is_primary": False,
            "relationship_to_primary": "results_in",
            "confidence": 0.99,
            "created_at": t_minus_6h,
        },
    ]

    return tables


def write_seed_data_file() -> None:
    """Generate and write seed_data.json."""
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    tables = generate_all_tables()
    with open(OUTPUT_FILE, mode="w", encoding="utf-8") as f:
        json.dump(tables, f, indent=2)
    print(f"Successfully generated seed data for {len(tables)} tables -> {OUTPUT_FILE}")


if __name__ == "__main__":
    write_seed_data_file()
