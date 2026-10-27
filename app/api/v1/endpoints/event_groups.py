"""
Endpoints for View 5: Event Groups / Episodes (image9.png).
Provides 5 episode KPI cards, cascading episode list, and detailed master episode panel
featuring the horizontal Episode Relationship Graph (SVG DAG) with epistemic link badges.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from app.core.schema_store import schema_store

router = APIRouter()

RAW_EPISODES: List[Dict[str, Any]] = [
    {
        "id": "ep-utt-001",
        "event_group_code": "EP-UTT-2026-10-001",
        "name": "Rudraprayag Heavy Rainfall & Cascading Landslide Episode",
        "start_time": "2026-10-24T12:00:00Z",
        "status": "active",
        "severity": "Critical",
        "event_count": 5,
        "primary_hazard": "Landslide / Cloudburst",
        "districts_affected": ["Rudraprayag", "Tehri Garhwal"],
        "summary": "Multi-hazard cascade: Intense cloudburst -> river surge -> NH-107 slope failure -> highway blockage -> flood threat.",
        "is_master": True,
    },
    {
        "id": "ep-cha-002",
        "event_group_code": "EP-CHA-2026-10-002",
        "name": "Chamoli Glacial Stream Surge & River Warning",
        "start_time": "2026-10-23T06:00:00Z",
        "status": "active",
        "severity": "High",
        "event_count": 3,
        "primary_hazard": "Flash Flood",
        "districts_affected": ["Chamoli"],
        "summary": "Glacial lake runoff and sudden discharge in Dhauliganga sub-basin.",
        "is_master": False,
    },
    {
        "id": "ep-uth-003",
        "event_group_code": "EP-UTH-2026-10-003",
        "name": "Uttarkashi Monsoon High-Elevation Storm Series",
        "start_time": "2026-10-21T18:00:00Z",
        "status": "active",
        "severity": "Moderate",
        "event_count": 2,
        "primary_hazard": "Severe Weather",
        "districts_affected": ["Uttarkashi"],
        "summary": "Continuous torrential winds and snow accumulation above 3800m.",
        "is_master": False,
    },
    {
        "id": "ep-res-004",
        "event_group_code": "EP-RES-2026-10-004",
        "name": "Pauri Garhwal Road Subsidence Episode",
        "start_time": "2026-10-18T10:00:00Z",
        "status": "resolved",
        "severity": "Moderate",
        "event_count": 2,
        "primary_hazard": "Landslide",
        "districts_affected": ["Pauri Garhwal"],
        "summary": "Embankment sliding along state highway 34; restored by PWD.",
        "is_master": False,
    },
]

# Canonical lookup map
EPISODES_BY_ID: Dict[str, Dict[str, Any]] = {}
for ep in RAW_EPISODES:
    EPISODES_BY_ID[ep["id"].lower()] = ep
    EPISODES_BY_ID[ep["event_group_code"].lower()] = ep

# Populate from schema store seed records
for g in schema_store.get_records("event_group"):
    gid = g.get("event_group_id")
    gcode = g.get("event_group_code")
    if gid:
        EPISODES_BY_ID[str(gid).lower()] = g
    if gcode:
        EPISODES_BY_ID[str(gcode).lower()] = g


EPISODE_DETAILS: Dict[str, Dict[str, Any]] = {
    "ep-utt-001": {
        "event_group_code": "EP-UTT-2026-10-001",
        "name": "Rudraprayag Heavy Rainfall Episode (Cascading Multi-Hazard)",
        "start_time": "2026-10-24T12:00:00Z",
        "end_time": None,
        "status": "active",
        "severity": "Critical",
        "confidence": 0.98,
        "primary_hazard": "Landslide / Flash Flood",
        "districts_affected": ["Rudraprayag", "Tehri Garhwal"],
        "description": (
            "A cascading multi-hazard disaster episode triggered by 128.4mm rainfall in the upper Mandakini basin, "
            "leading to river stage elevation, devastating slope failure at Basukedar along NH-107, full highway "
            "severance, and downstream inundation hazards."
        ),
        "combined_impacts": {
            "total_displaced": 420,
            "population_at_risk": 42000,
            "road_severed_meters": 340,
            "stranded_vehicles": 65,
            "economic_impact_est": "₹16.7 Crore",
            "response_level": "State Level Emergency (SEOC Level-3)",
        },
        "graph": {
            "nodes": [
                {
                    "id": "EV-RAIN-01",
                    "label": "Heavy Rainfall",
                    "hazard": "Weather",
                    "code": "EV-RAIN-2026-10-08-002",
                    "status": "Active",
                    "time": "12:00 IST",
                    "metric": "128.4 mm",
                    "color": "#3b82f6",
                },
                {
                    "id": "EV-RIV-02",
                    "label": "River Level Rise",
                    "hazard": "Flood",
                    "code": "EV-RIV-2026-10-09-002",
                    "status": "Active",
                    "time": "14:30 IST",
                    "metric": "625.8 MASL",
                    "color": "#06b6d4",
                },
                {
                    "id": "EV-LSD-03",
                    "label": "Basukedar Landslide",
                    "hazard": "Landslide",
                    "code": "EV-LSD-2026-10-09-001",
                    "status": "Critical",
                    "time": "16:30 IST",
                    "metric": "18,500 m³",
                    "color": "#ef4444",
                },
                {
                    "id": "EV-ROD-04",
                    "label": "NH-107 Road Blockage",
                    "hazard": "Infrastructure",
                    "code": "EV-ROD-2026-10-09-004",
                    "status": "Critical",
                    "time": "16:45 IST",
                    "metric": "340 m blocked",
                    "color": "#f97316",
                },
                {
                    "id": "EV-FLD-05",
                    "label": "Downstream Inundation",
                    "hazard": "Flood",
                    "code": "EV-FLD-2026-10-09-005",
                    "status": "Warning",
                    "time": "17:15 IST",
                    "metric": "1,420 m³/s",
                    "color": "#eab308",
                },
            ],
            "edges": [
                {
                    "source": "EV-RAIN-01",
                    "target": "EV-RIV-02",
                    "relation": "triggers",
                    "epistemic_badge": "Confirmed",
                    "confidence": 0.98,
                },
                {
                    "source": "EV-RAIN-01",
                    "target": "EV-LSD-03",
                    "relation": "causes",
                    "epistemic_badge": "Confirmed",
                    "confidence": 0.95,
                },
                {
                    "source": "EV-LSD-03",
                    "target": "EV-ROD-04",
                    "relation": "results_in",
                    "epistemic_badge": "Observed",
                    "confidence": 0.99,
                },
                {
                    "source": "EV-RIV-02",
                    "target": "EV-FLD-05",
                    "relation": "escalates_to",
                    "epistemic_badge": "Inferred",
                    "confidence": 0.88,
                },
                {
                    "source": "EV-LSD-03",
                    "target": "EV-FLD-05",
                    "relation": "debris_dam_overflow",
                    "epistemic_badge": "Possible",
                    "confidence": 0.82,
                },
            ],
        },
        "contributing_events": [
            {
                "event_code": "EV-RAIN-2026-10-08-002",
                "name": "Heavy Rainfall in Mandakini Catchment",
                "role": "Initial Trigger",
                "time": "2026-10-24 12:00 IST",
                "status": "Active",
            },
            {
                "event_code": "EV-LSD-2026-10-09-001",
                "name": "Basukedar Landslide",
                "role": "Primary Catastrophic Event",
                "time": "2026-10-24 16:30 IST",
                "status": "Critical",
            },
            {
                "event_code": "EV-ROD-2026-10-09-004",
                "name": "NH-107 Severance",
                "role": "Infrastructural Impact",
                "time": "2026-10-24 16:45 IST",
                "status": "Critical",
            },
            {
                "event_code": "EV-FLD-2026-10-09-005",
                "name": "Downstream Mandakini Inundation Threat",
                "role": "Cascading Threat",
                "time": "2026-10-24 17:15 IST",
                "status": "Warning",
            },
        ],
    },
    "ep-cha-002": {
        "event_group_code": "EP-CHA-2026-10-002",
        "name": "Chamoli Glacial Stream Surge & River Warning",
        "start_time": "2026-10-23T06:00:00Z",
        "end_time": None,
        "status": "active",
        "severity": "High",
        "confidence": 0.96,
        "primary_hazard": "Flash Flood / Glacial Runoff",
        "districts_affected": ["Chamoli"],
        "description": (
            "Glacial lake runoff and sudden discharge in Dhauliganga sub-basin triggering river flow alerts "
            "and barrage water management protocols."
        ),
        "combined_impacts": {
            "total_displaced": 85,
            "population_at_risk": 12500,
            "road_severed_meters": 120,
            "stranded_vehicles": 18,
            "economic_impact_est": "₹6.2 Crore",
            "response_level": "District Level Emergency (DEOC Chamoli Level-2)",
        },
        "graph": {
            "nodes": [
                {
                    "id": "EV-GLOF-01",
                    "label": "Glacial Lake Runoff",
                    "hazard": "Weather",
                    "code": "EV-GLF-2026-10-23-001",
                    "status": "Active",
                    "time": "06:00 IST",
                    "metric": "42.5 m³/s",
                    "color": "#3b82f6",
                },
                {
                    "id": "EV-FL-02",
                    "label": "Dhauliganga River Surge",
                    "hazard": "Flood",
                    "code": "EV-RIV-2026-10-23-002",
                    "status": "Active",
                    "time": "08:30 IST",
                    "metric": "1,320 MASL",
                    "color": "#06b6d4",
                },
                {
                    "id": "EV-BR-03",
                    "label": "Tapovan Barrage Sluice Flow",
                    "hazard": "Infrastructure",
                    "code": "EV-BAR-2026-10-23-003",
                    "status": "Warning",
                    "time": "09:15 IST",
                    "metric": "Gate Opened",
                    "color": "#ef4444",
                },
            ],
            "edges": [
                {
                    "source": "EV-GLOF-01",
                    "target": "EV-FL-02",
                    "relation": "triggers",
                    "epistemic_badge": "Confirmed",
                    "confidence": 0.96,
                },
                {
                    "source": "EV-FL-02",
                    "target": "EV-BR-03",
                    "relation": "causes",
                    "epistemic_badge": "Observed",
                    "confidence": 0.94,
                },
            ],
        },
        "contributing_events": [
            {
                "event_code": "EV-GLF-2026-10-23-001",
                "name": "Glacial Runoff Inflow",
                "role": "Initial Trigger",
                "time": "2026-10-23 06:00 IST",
                "status": "Active",
            },
            {
                "event_code": "EV-RIV-2026-10-23-002",
                "name": "Dhauliganga River Surge",
                "role": "River Hydrology Surge",
                "time": "2026-10-23 08:30 IST",
                "status": "Active",
            },
            {
                "event_code": "EV-BAR-2026-10-23-003",
                "name": "Barrage Precautionary Discharge",
                "role": "Infrastructure Response",
                "time": "2026-10-23 09:15 IST",
                "status": "Warning",
            },
        ],
    },
    "ep-uth-003": {
        "event_group_code": "EP-UTH-2026-10-003",
        "name": "Uttarkashi Monsoon High-Elevation Storm Series",
        "start_time": "2026-10-21T18:00:00Z",
        "end_time": None,
        "status": "active",
        "severity": "Moderate",
        "confidence": 0.92,
        "primary_hazard": "Severe Weather",
        "districts_affected": ["Uttarkashi"],
        "description": "Continuous torrential winds and snow accumulation above 3800m.",
        "combined_impacts": {
            "total_displaced": 32,
            "population_at_risk": 6800,
            "road_severed_meters": 45,
            "stranded_vehicles": 8,
            "economic_impact_est": "₹2.1 Crore",
            "response_level": "Tehsil Level Advisory (Bhatwari)",
        },
        "graph": {
            "nodes": [
                {
                    "id": "EV-STM-01",
                    "label": "High-Altitude Gale",
                    "hazard": "Weather",
                    "code": "EV-STM-2026-10-21-001",
                    "status": "Active",
                    "time": "18:00 IST",
                    "metric": "68 km/h",
                    "color": "#3b82f6",
                },
                {
                    "id": "EV-SNW-02",
                    "label": "Snowpack Accumulation",
                    "hazard": "Severe Weather",
                    "code": "EV-SNW-2026-10-22-002",
                    "status": "Warning",
                    "time": "04:00 IST",
                    "metric": "45 cm",
                    "color": "#06b6d4",
                },
            ],
            "edges": [
                {
                    "source": "EV-STM-01",
                    "target": "EV-SNW-02",
                    "relation": "causes",
                    "epistemic_badge": "Confirmed",
                    "confidence": 0.92,
                },
            ],
        },
        "contributing_events": [
            {
                "event_code": "EV-STM-2026-10-21-001",
                "name": "High-Altitude Gale",
                "role": "Initial Trigger",
                "time": "2026-10-21 18:00 IST",
                "status": "Active",
            },
            {
                "event_code": "EV-SNW-2026-10-22-002",
                "name": "Pass Blizzard & Snow Accumulation",
                "role": "Secondary Impact",
                "time": "2026-10-22 04:00 IST",
                "status": "Warning",
            },
        ],
    },
    "ep-res-004": {
        "event_group_code": "EP-RES-2026-10-004",
        "name": "Pauri Garhwal Road Subsidence Episode",
        "start_time": "2026-10-18T10:00:00Z",
        "end_time": "2026-10-20T16:00:00Z",
        "status": "resolved",
        "severity": "Moderate",
        "confidence": 0.95,
        "primary_hazard": "Landslide",
        "districts_affected": ["Pauri Garhwal"],
        "description": "Embankment sliding along state highway 34; restored by PWD.",
        "combined_impacts": {
            "total_displaced": 0,
            "population_at_risk": 2400,
            "road_severed_meters": 80,
            "stranded_vehicles": 5,
            "economic_impact_est": "₹0.8 Crore",
            "response_level": "PWD Division Kotdwar (Restored)",
        },
        "graph": {
            "nodes": [
                {
                    "id": "EV-SUB-01",
                    "label": "Embankment Soil Creep",
                    "hazard": "Landslide",
                    "code": "EV-SUB-2026-10-18-001",
                    "status": "Resolved",
                    "time": "10:00 IST",
                    "metric": "80 m crack",
                    "color": "#f97316",
                },
                {
                    "id": "EV-RD-02",
                    "label": "SH-34 Traffic Closure",
                    "hazard": "Infrastructure",
                    "code": "EV-ROD-2026-10-18-002",
                    "status": "Resolved",
                    "time": "11:30 IST",
                    "metric": "Restored",
                    "color": "#10b981",
                },
            ],
            "edges": [
                {
                    "source": "EV-SUB-01",
                    "target": "EV-RD-02",
                    "relation": "results_in",
                    "epistemic_badge": "Observed",
                    "confidence": 0.97,
                },
            ],
        },
        "contributing_events": [
            {
                "event_code": "EV-SUB-2026-10-18-001",
                "name": "Embankment Subsidence",
                "role": "Primary Cause",
                "time": "2026-10-18 10:00 IST",
                "status": "Resolved",
            },
            {
                "event_code": "EV-ROD-2026-10-18-002",
                "name": "SH-34 Traffic Halt",
                "role": "Road Blockage",
                "time": "2026-10-18 11:30 IST",
                "status": "Resolved",
            },
        ],
    },
}


@router.get("", response_model=Dict[str, Any])
def list_event_groups(status: Optional[str] = None) -> Dict[str, Any]:
    """Return 5 episode KPI cards and list of cascading disaster episodes."""
    kpis = {
        "total_episodes": 8,
        "active_episodes": 3,
        "multi_hazard": 6,
        "high_impact": 4,
        "resolved": 5,
    }

    episodes = RAW_EPISODES
    if status:
        episodes = [e for e in episodes if e["status"].lower() == status.lower()]

    return {
        "kpis": kpis,
        "total": len(episodes),
        "event_groups": episodes,
    }


@router.get("/{id}", response_model=Dict[str, Any])
def get_event_group_detail(id: str) -> Dict[str, Any]:
    """
    Return full episode detail + horizontal relationship graph nodes & edges
    for SVG DAG matching image9.png (dynamically returned for the requested episode).
    """
    clean_id = id.strip().lower()
    target = EPISODES_BY_ID.get(clean_id)

    if not target:
        raise HTTPException(status_code=404, detail=f"Episode '{id}' not found")

    target_code = target.get("event_group_code") or "EP-UTT-2026-10-001"
    slug = target.get("id") or ("ep-utt-001" if "utt" in target_code.lower() else "ep-cha-002")

    detail = EPISODE_DETAILS.get(slug)
    if not detail:
        detail = EPISODE_DETAILS["ep-utt-001"]

    result = dict(detail)
    result["id"] = id
    result["event_group_code"] = target_code
    return result

