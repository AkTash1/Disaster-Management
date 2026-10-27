"""
Endpoints for View 4: Modality Events (image8.png).
Provides 8 modality KPI cards, filterable modality events list, and rich detail panel with 5 sub-tabs:
Overview, Observations, Derived Results, Related Unified Event, Processing Info.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.core.schema_store import schema_store

router = APIRouter()

RAW_MODALITY_ITEMS: List[Dict[str, Any]] = [
    {
        "id": "me-wth-001",
        "modality_event_code": "ME-WTH-2026-10-09-001",
        "title": "Extreme Precipitation Surge at Basukedar Gauge",
        "domain": "weather",
        "modality": "tabular",
        "hazard_name": "Heavy Rainfall",
        "start_time": "2026-10-24T14:00:00Z",
        "severity": "Critical",
        "confidence": 0.98,
        "classification": "Detected Event",
        "station_or_source": "CWC_UK_Basukedar",
        "matched_event_id": "ev-rain-002",
        "matched_event_code": "EV-RAIN-2026-10-08-002",
        "matched_event_name": "Heavy Rainfall in Mandakini Catchment",
        "magnitude": "128.4 mm / 6h",
    },
    {
        "id": "me-sar-002",
        "modality_event_code": "ME-SAR-2026-10-09-002",
        "title": "EOS-04 SAR Backscatter Soil Saturation Anomaly",
        "domain": "sar_satellite",
        "modality": "raster",
        "hazard_name": "Landslide",
        "start_time": "2026-10-24T08:00:00Z",
        "severity": "High",
        "confidence": 0.95,
        "classification": "AI Inference",
        "station_or_source": "EOS-04 C-SAR Orbit 189",
        "matched_event_id": "ev-lsd-001",
        "matched_event_code": "EV-LSD-2026-10-09-001",
        "matched_event_name": "Basukedar Major Landslide on NH-107",
        "magnitude": "94.2% Saturation",
    },
    {
        "id": "me-sns-003",
        "modality_event_code": "ME-SNS-2026-10-09-003",
        "title": "Mandakini Hydrographic Stage Telemetry Surge",
        "domain": "hydrological",
        "modality": "tabular",
        "hazard_name": "Flood",
        "start_time": "2026-10-24T15:30:00Z",
        "severity": "High",
        "confidence": 0.96,
        "classification": "Detected Event",
        "station_or_source": "CWC_UK_Rudraprayag_1",
        "matched_event_id": "ev-fld-003",
        "matched_event_code": "EV-FLD-2026-10-09-003",
        "matched_event_name": "Mandakini River Flow Surge",
        "magnitude": "625.8 MASL (+1.8m)",
    },
    {
        "id": "me-rep-004",
        "modality_event_code": "ME-REP-2026-10-09-004",
        "title": "SDRF Official Incident SITREP: Highway Severed",
        "domain": "official_report",
        "modality": "text",
        "hazard_name": "Landslide",
        "start_time": "2026-10-24T16:30:00Z",
        "severity": "Critical",
        "confidence": 1.0,
        "classification": "Reported Incident",
        "station_or_source": "State Emergency Ops Centre",
        "matched_event_id": "ev-lsd-001",
        "matched_event_code": "EV-LSD-2026-10-09-001",
        "matched_event_name": "Basukedar Major Landslide on NH-107",
        "magnitude": "18,500 m³ volume",
    },
    {
        "id": "me-opt-005",
        "modality_event_code": "ME-OPT-2026-10-08-005",
        "title": "Sentinel-2 Multi-Spectral Turbidity Plume",
        "domain": "optical_satellite",
        "modality": "raster",
        "hazard_name": "Flood",
        "start_time": "2026-10-24T11:00:00Z",
        "severity": "Moderate",
        "confidence": 0.91,
        "classification": "Detected Event",
        "station_or_source": "Sentinel-2 MSI Level-2A",
        "matched_event_id": "ev-fld-003",
        "matched_event_code": "EV-FLD-2026-10-09-003",
        "matched_event_name": "Mandakini River Flow Surge",
        "magnitude": "High Turbidity Index",
    },
    {
        "id": "me-soc-006",
        "modality_event_code": "ME-SOC-2026-10-09-006",
        "title": "Social Media Crowd Video: Basukedar Bridge Runoff",
        "domain": "social_media",
        "modality": "video",
        "hazard_name": "Flash Flood",
        "start_time": "2026-10-24T15:50:00Z",
        "severity": "High",
        "confidence": 0.82,
        "classification": "Reported Incident",
        "station_or_source": "Verified Citizen Dispatch / X",
        "matched_event_id": "ev-lsd-001",
        "matched_event_code": "EV-LSD-2026-10-09-001",
        "matched_event_name": "Basukedar Major Landslide on NH-107",
        "magnitude": "4 Posts Corroborated",
    },
]

# Build canonical lookup map
MODALITY_EVENTS_BY_ID: Dict[str, Dict[str, Any]] = {}
for item in RAW_MODALITY_ITEMS:
    MODALITY_EVENTS_BY_ID[item["id"].lower()] = item
    MODALITY_EVENTS_BY_ID[item["modality_event_code"].lower()] = item

# Populate from schema store seed records
for m in schema_store.get_records("modality_event"):
    mid = m.get("modality_event_id")
    mcode = m.get("modality_event_code")
    if mid:
        MODALITY_EVENTS_BY_ID[str(mid).lower()] = m
    if mcode:
        MODALITY_EVENTS_BY_ID[str(mcode).lower()] = m


@router.get("", response_model=Dict[str, Any])
def list_modality_events(
    modality: Optional[str] = None,
    hazard: Optional[str] = None,
    classification: Optional[str] = None,
    search: Optional[str] = None,
) -> Dict[str, Any]:
    """Return 8 modality KPI cards and filterable list of modality-level detections."""
    kpis = {
        "total": 142,
        "earthquake": 4,
        "flood": 28,
        "landslide": 36,
        "weather": 48,
        "news_reports": 18,
        "social_media": 6,
        "other": 2,
    }

    filtered = []
    for item in RAW_MODALITY_ITEMS:
        if modality and modality.lower() not in item["domain"].lower():
            continue
        if hazard and hazard.lower() not in item["hazard_name"].lower():
            continue
        if classification and classification.lower() not in item["classification"].lower():
            continue
        if search:
            q = search.lower()
            if q not in item["title"].lower() and q not in item["modality_event_code"].lower():
                continue
        filtered.append(item)

    return {
        "kpis": kpis,
        "total": len(filtered),
        "modality_events": filtered,
    }


@router.get("/{modality_event_id}", response_model=Dict[str, Any])
def get_modality_event_detail(modality_event_id: str) -> Dict[str, Any]:
    """
    Return comprehensive modality event detail matching image8.png
    (e.g. Heavy Rainfall Detection ME-WTH-2026-10-09-001).
    """
    clean_id = modality_event_id.strip().lower()
    target = MODALITY_EVENTS_BY_ID.get(clean_id)

    if not target:
        raise HTTPException(status_code=404, detail=f"Modality event '{modality_event_id}' not found")

    target_code = target.get("modality_event_code") or "ME-WTH-2026-10-09-001"
    is_weather = target_code == "ME-WTH-2026-10-09-001" or target.get("id") == "me-wth-001"

    if is_weather:
        return {
            "modality_event_id": modality_event_id,
            "modality_event_code": "ME-WTH-2026-10-09-001",
            "title": "Heavy Rainfall Detection ME-WTH-2026-10-09-001",
            "domain": "weather",
            "modality": "tabular",
            "hazard_name": "Heavy Rainfall",
            "start_time": "2026-10-24T14:00:00Z",
            "end_time": "2026-10-24T18:00:00Z",
            "severity": "Critical",
            "confidence": 0.98,
            "classification": "Detected Event",
            "available_classifications": ["Detected Event", "Reported Incident", "AI Inference", "Predicted Event"],
            "key_information": {
                "monitoring_station": "CWC_UK_Basukedar (Basukedar, Rudraprayag)",
                "telemetry_agency": "Central Water Commission (CWC) & IMD AWS",
                "matched_unified_event": "EV-RAIN-2026-10-08-002 (Heavy Rainfall in Mandakini Basin)",
                "latitude": 30.439194,
                "longitude": 79.056333,
                "peak_intensity": "32.1 mm/hr at 15:00 IST",
                "cumulative_6h": "128.4 mm",
                "threshold_exceeded": "High Disaster Warning Threshold (>90 mm/6h)",
            },
            "rainfall_heatmap": {
                "time_series_hours": ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
                "hourly_precipitation_mm": [8.2, 14.5, 26.8, 32.1, 24.3, 14.2, 8.3],
                "cumulative_curve_mm": [8.2, 22.7, 49.5, 81.6, 105.9, 120.1, 128.4],
                "radar_reflectivity_dbz": [28, 36, 44, 52, 48, 41, 33],
            },
            "supporting_observations": [
                {
                    "observation_id": "OBS-CWC-01",
                    "type": "precipitation_gauge",
                    "source": "CWC Basukedar Tipping Bucket Sensor #1",
                    "reading": "128.4 mm total",
                    "quality_status": "Verified (score: 0.98)",
                    "observed_at": "2026-10-24T16:00:00Z",
                },
                {
                    "observation_id": "OBS-IMD-02",
                    "type": "radar_reflectivity",
                    "source": "IMD Dehradun Doppler Weather Radar",
                    "reading": "Peak core 52 dBZ convective cloud cell over Jakholi",
                    "quality_status": "Verified (score: 0.96)",
                    "observed_at": "2026-10-24T15:15:00Z",
                },
                {
                    "observation_id": "OBS-MOSDAC-03",
                    "type": "satellite_imsra",
                    "source": "ISRO MOSDAC INSAT-3DR",
                    "reading": "Brightness Temperature 198 K (Deep Convection)",
                    "quality_status": "Verified (score: 0.94)",
                    "observed_at": "2026-10-24T14:45:00Z",
                },
            ],
            "derived_results": [
                {
                    "model": "RandomForest_LandslideTrigger_v2",
                    "task": "Slope Failure Probability",
                    "prediction": "94.2% failure probability on slopes > 35°",
                    "confidence": 0.94,
                    "status": "Warning Emitted",
                },
                {
                    "model": "CausalCascadeEstimator_v1",
                    "task": "Secondary Inundation Prediction",
                    "prediction": "Mandakini stage rise to exceed +1.8m danger level within 90 minutes",
                    "confidence": 0.89,
                    "status": "Validated by CWC Sangam Gauge",
                },
            ],
            "processing_info": {
                "pipeline_name": "modality_event_detector v3.1.0",
                "pipeline_run_id": "run_event_003",
                "ingestion_latency_ms": 142,
                "validation_status": "passed",
                "schema_check": "passed",
                "processed_at": "2026-10-24T16:05:12Z",
            },
        }

    # Modality-specific detail for non-weather items
    title = target.get("title") or f"Modality Event {target_code}"
    domain = target.get("domain") or "sensor"
    modality = target.get("modality") or "tabular"
    hazard_name = target.get("hazard_name") or "Natural Hazard"
    source = target.get("station_or_source") or "Ground Station"
    matched_code = target.get("matched_event_code") or "EV-LSD-2026-10-09-001"
    matched_name = target.get("matched_event_name") or "Disaster Event"

    return {
        "modality_event_id": modality_event_id,
        "modality_event_code": target_code,
        "title": title,
        "domain": domain,
        "modality": modality,
        "hazard_name": hazard_name,
        "start_time": target.get("start_time", "2026-10-24T12:00:00Z"),
        "end_time": "2026-10-24T18:00:00Z",
        "severity": target.get("severity", "High"),
        "confidence": target.get("confidence", 0.95),
        "classification": target.get("classification", "Detected Event"),
        "available_classifications": ["Detected Event", "Reported Incident", "AI Inference", "Predicted Event"],
        "key_information": {
            "monitoring_station": source,
            "telemetry_agency": "State Monitoring Agency",
            "matched_unified_event": f"{matched_code} ({matched_name})",
            "latitude": 30.439194,
            "longitude": 79.056333,
            "magnitude": target.get("magnitude", "Detected Signal"),
        },
        "rainfall_heatmap": {
            "time_series_hours": ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
            "hourly_precipitation_mm": [5.0, 10.0, 20.0, 25.0, 18.0, 10.0, 5.0],
            "cumulative_curve_mm": [5.0, 15.0, 35.0, 60.0, 78.0, 88.0, 93.0],
            "radar_reflectivity_dbz": [25, 30, 40, 48, 42, 35, 28],
        },
        "supporting_observations": [
            {
                "observation_id": f"OBS-{domain[:3].upper()}-01",
                "type": modality,
                "source": source,
                "reading": target.get("magnitude", "Signal telemetry confirmed"),
                "quality_status": "Verified (score: 0.95)",
                "observed_at": target.get("start_time", "2026-10-24T14:00:00Z"),
            }
        ],
        "derived_results": [
            {
                "model": "DomainInferenceEngine_v1",
                "task": f"{hazard_name} Risk Evaluation",
                "prediction": f"Telemetry consistent with {hazard_name} impact threshold",
                "confidence": target.get("confidence", 0.95),
                "status": "Verified",
            }
        ],
        "processing_info": {
            "pipeline_name": f"{domain}_pipeline v2.0",
            "pipeline_run_id": f"run_{clean_id}",
            "ingestion_latency_ms": 115,
            "validation_status": "passed",
            "schema_check": "passed",
            "processed_at": "2026-10-24T16:00:00Z",
        },
    }

