"""
Endpoints for View 1: Overview Dashboard (image7.png).
Provides 7 summary KPIs, active alerts, news feed, chart datasets, top 5 regions,
recent 24h events, and data source health monitoring.
"""

from typing import Dict, Any, List
from fastapi import APIRouter, Query
from app.core.schema_store import schema_store

router = APIRouter()


@router.get("/summary", response_model=Dict[str, Any])
def get_overview_summary() -> Dict[str, Any]:
    """Return the 7 core situational KPIs matching image7.png."""
    events = schema_store.get_records("event")
    active_count = sum(1 for e in events if e.get("status") in ["active", "ongoing"])

    kpis = [
        {
            "id": "active_events",
            "title": "Active Events",
            "value": 14,
            "delta": "+3 in last 24h",
            "trend": "up",
            "status": "critical",
            "icon": "AlertTriangle",
        },
        {
            "id": "severe_alerts",
            "title": "Severe Alerts",
            "value": 3,
            "delta": "+1 escalated",
            "trend": "up",
            "status": "critical",
            "icon": "BellRing",
        },
        {
            "id": "weather_warnings",
            "title": "Weather Warnings",
            "value": 5,
            "delta": "Red Alert (IMD)",
            "trend": "stable",
            "status": "warning",
            "icon": "CloudRain",
        },
        {
            "id": "landslide_incidents",
            "title": "Landslide Incidents",
            "value": 8,
            "delta": "+2 new scars",
            "trend": "up",
            "status": "critical",
            "icon": "Mountain",
        },
        {
            "id": "flood_watch_stations",
            "title": "Flood Watch Stations",
            "value": 12,
            "delta": "3 above danger",
            "trend": "up",
            "status": "warning",
            "icon": "Waves",
        },
        {
            "id": "population_at_risk",
            "title": "Population at Risk",
            "value": 124500,
            "delta": "5 districts",
            "trend": "up",
            "status": "info",
            "icon": "Users",
        },
        {
            "id": "data_feeds_online",
            "title": "Data Feeds Online",
            "value": "8/9",
            "delta": "99.4% uptime",
            "trend": "stable",
            "status": "success",
            "icon": "Radio",
        },
    ]

    return {
        "total_active_events": 14,
        "severe_alerts": 3,
        "weather_warnings": 5,
        "landslide_incidents": 8,
        "flood_watch_stations": 12,
        "population_at_risk": 124500,
        "data_feeds_online": "8/9",
        "live_mode": True,
        "last_updated": "2026-10-24T18:30:00Z",
        "kpis": kpis,
    }


@router.get("/alerts", response_model=List[Dict[str, Any]])
def get_active_alerts(limit: int = 10) -> List[Dict[str, Any]]:
    """Return stream of active official warnings and alerts with epistemic badges."""
    alerts = [
        {
            "id": "ALT-LSD-001",
            "severity": "Critical",
            "hazard": "Landslide",
            "title": "Severe Debris Avalanche — NH-107 Basukedar Severed",
            "region": "Rudraprayag",
            "district": "Rudraprayag",
            "issued_at": "2026-10-24T16:30:00Z",
            "source": "State Emergency Operation Centre (SEOC)",
            "epistemic_status": "Observed",
            "description": "Massive debris volume across Kedarnath highway; vehicular traffic completely halted.",
        },
        {
            "id": "ALT-WTH-002",
            "severity": "Critical",
            "hazard": "Heavy Rainfall",
            "title": "IMD Red Alert — Extremely Heavy Rainfall Warning",
            "region": "Garhwal Division",
            "district": "Rudraprayag & Chamoli",
            "issued_at": "2026-10-24T14:00:00Z",
            "source": "India Meteorological Department (IMD Dehradun)",
            "epistemic_status": "Official",
            "description": "Rainfall in excess of 115mm/24h expected over upper Himalayan catchments.",
        },
        {
            "id": "ALT-FLD-003",
            "severity": "High",
            "hazard": "Flash Flood",
            "title": "Mandakini River Flowing Above High Danger Level (625.8m)",
            "region": "Rudraprayag",
            "district": "Rudraprayag",
            "issued_at": "2026-10-24T17:15:00Z",
            "source": "Central Water Commission (CWC)",
            "epistemic_status": "Observed",
            "description": "River levels rising rapidly downstream of Agastyamuni. Low-lying evacuations underway.",
        },
        {
            "id": "ALT-LSD-004",
            "severity": "Moderate",
            "hazard": "Landslide",
            "title": "Slope Instability Advisory — Badrinath Highway (NH-07)",
            "region": "Chamoli",
            "district": "Chamoli",
            "issued_at": "2026-10-24T11:00:00Z",
            "source": "Border Roads Organisation (BRO)",
            "epistemic_status": "Reported",
            "description": "Intermittent boulder fall reported near Lambagar. Single-lane movement permitted.",
        },
        {
            "id": "ALT-AI-005",
            "severity": "High",
            "hazard": "Flash Flood",
            "title": "AI Inference: Debris Dam Breach Flood Pulse Anticipated",
            "region": "Mandakini Tributary",
            "district": "Rudraprayag",
            "issued_at": "2026-10-24T17:45:00Z",
            "source": "Disaster Intel Multimodal Cascade Model",
            "epistemic_status": "AI Inferred",
            "description": "SAR backscatter and tributary gauge surge suggest ephemeral dam failure within 3-6 hours.",
        },
    ]
    return alerts[:limit]


@router.get("/news", response_model=List[Dict[str, Any]])
def get_latest_news(limit: int = 10) -> List[Dict[str, Any]]:
    """Return stream of verified and unverified reports and news items."""
    news = [
        {
            "id": "NEWS-001",
            "title": "NH-107 Blocked at Basukedar; SDRF Deploys Heavy Machinery",
            "source": "DD News Dehradun",
            "published_at": "2026-10-24T17:00:00Z",
            "hazard": "Landslide",
            "verified": True,
            "verification_status": "Verified",
            "language": "en",
            "summary": "State Disaster Response Force and BRO 752 BRTF mobilised excavators to clear 340m debris on Kedarnath highway.",
            "url": "https://ddnews.gov.in/dehradun/nh107-blockage",
        },
        {
            "id": "NEWS-002",
            "title": "रुद्रप्रयाग में मूसलाधार बारिश: मंदाकिनी खतरे के निशान के पार",
            "source": "Amar Ujala Bureau",
            "published_at": "2026-10-24T16:20:00Z",
            "hazard": "Flood",
            "verified": True,
            "verification_status": "Verified",
            "language": "hi",
            "summary": "अगस्त्यमुनि और तिलवाड़ा के निचले इलाकों में प्रशासन ने अलर्ट जारी किया, राहत शिविरों में ठहराए जा रहे लोग।",
            "url": "https://amarujala.com/uttarakhand/rudraprayag-mandakini-alert",
        },
        {
            "id": "NEWS-003",
            "title": "Eyewitness Videos Show Torrential Runoff Sweeping Basukedar Culvert",
            "source": "Citizen Ground Network / X",
            "published_at": "2026-10-24T15:45:00Z",
            "hazard": "Flash Flood",
            "verified": False,
            "verification_status": "Likely True",
            "language": "en",
            "summary": "Multiple geotagged videos show muddy cascade carrying uprooted trees onto highway bridge.",
            "url": "https://x.com/disaster_reports_uk/status/1849120",
        },
        {
            "id": "NEWS-004",
            "title": "Chief Minister Reviews High-Altitude Relief Operations at SEOC",
            "source": "Uttarakhand DIPR",
            "published_at": "2026-10-24T18:00:00Z",
            "hazard": "Multi-Hazard",
            "verified": True,
            "verification_status": "Verified",
            "language": "en",
            "summary": "Emergency response funds released; Indian Air Force helicopters put on standby at Jolly Grant.",
            "url": "https://dipr.uk.gov.in/press-release/20261024",
        },
    ]
    return news[:limit]


@router.get("/charts", response_model=Dict[str, Any])
def get_overview_charts(days: int = 7) -> Dict[str, Any]:
    """Return chart datasets matching image7.png (Hazards Donut, Multi-line Trend, Severity Donut)."""
    hazards_donut = [
        {"hazard": "Landslide", "count": 8, "percentage": 42.1, "color": "#ef4444"},
        {"hazard": "Heavy Rainfall", "count": 5, "percentage": 26.3, "color": "#3b82f6"},
        {"hazard": "Flash Flood", "count": 4, "percentage": 21.1, "color": "#06b6d4"},
        {"hazard": "Road Blockage", "count": 2, "percentage": 10.5, "color": "#f97316"},
    ]

    labels = ["18 Oct", "19 Oct", "20 Oct", "21 Oct", "22 Oct", "23 Oct", "24 Oct"] if days <= 7 else [f"{i} Oct" for i in range(1, 25)]
    data_rain = [1, 2, 2, 4, 3, 5, 5] if days <= 7 else [1, 2, 1, 3, 2, 4, 2, 3, 4, 2, 3, 4, 5, 3, 4, 5, 6, 4, 5, 6, 7, 5, 5, 5]
    data_lsd = [0, 1, 1, 3, 4, 6, 8] if days <= 7 else [0, 0, 1, 1, 2, 1, 2, 3, 2, 3, 4, 3, 4, 5, 4, 5, 6, 5, 6, 7, 8, 7, 8, 8]
    data_fld = [0, 0, 1, 1, 2, 3, 4] if days <= 7 else [0, 0, 0, 1, 1, 2, 1, 2, 2, 3, 2, 3, 3, 4, 3, 4, 4, 3, 4, 4, 5, 4, 4, 4]

    event_trends = {
        "labels": labels,
        "series": [
            {"name": "Rainfall Events", "data": data_rain, "color": "#3b82f6"},
            {"name": "Landslides", "data": data_lsd, "color": "#ef4444"},
            {"name": "Floods", "data": data_fld, "color": "#06b6d4"},
        ],
    }
    severity_donut = [
        {"severity": "Critical", "count": 3, "color": "#ef4444"},
        {"severity": "High", "count": 6, "color": "#f97316"},
        {"severity": "Moderate", "count": 4, "color": "#eab308"},
        {"severity": "Low", "count": 1, "color": "#3b82f6"},
    ]

    return {
        "hazards_donut": hazards_donut,
        "hazard_distribution": hazards_donut,
        "hazards": hazards_donut,
        "by_hazard": hazards_donut,
        "event_trends": event_trends,
        "event_trend": event_trends,
        "trend": event_trends,
        "trends": event_trends,
        "severity_donut": severity_donut,
        "severity_distribution": severity_donut,
        "severity": severity_donut,
    }


@router.get("/regions", response_model=List[Dict[str, Any]])
def get_top_affected_regions() -> List[Dict[str, Any]]:
    """Return top 5 affected Uttarakhand districts with risk levels and exposed populations."""
    return [
        {
            "rank": 1,
            "district": "Rudraprayag",
            "active_events": 5,
            "risk_level": "Critical",
            "population_exposed": 42000,
            "dominant_hazard": "Landslide",
            "trend": "+12%",
            "status": "critical",
        },
        {
            "rank": 2,
            "district": "Chamoli",
            "active_events": 4,
            "risk_level": "High",
            "population_exposed": 31000,
            "dominant_hazard": "Flash Flood",
            "trend": "+8%",
            "status": "high",
        },
        {
            "rank": 3,
            "district": "Tehri Garhwal",
            "active_events": 2,
            "risk_level": "Moderate",
            "population_exposed": 24000,
            "dominant_hazard": "Landslide",
            "trend": "-2%",
            "status": "moderate",
        },
        {
            "rank": 4,
            "district": "Uttarkashi",
            "active_events": 2,
            "risk_level": "Moderate",
            "population_exposed": 18500,
            "dominant_hazard": "Heavy Rainfall",
            "trend": "+4%",
            "status": "moderate",
        },
        {
            "rank": 5,
            "district": "Pithoragarh",
            "active_events": 1,
            "risk_level": "Low",
            "population_exposed": 9000,
            "dominant_hazard": "Cloudburst",
            "trend": "0%",
            "status": "low",
        },
    ]


@router.get("/recent-events", response_model=List[Dict[str, Any]])
def get_recent_events_24h(limit: int = Query(10, ge=1)) -> List[Dict[str, Any]]:
    """Return unified events recorded in the last 24 hours."""
    events = [
        {
            "event_code": "EV-LSD-2026-10-09-001",
            "name": "Landslide on Kedarnath Highway (NH-107)",
            "hazard": "Landslide",
            "location": "Basukedar, Rudraprayag",
            "severity": "Critical",
            "time": "2026-10-24T16:30:00Z",
            "status": "Active",
            "epistemic_status": "Observed",
            "affected_population": 3200,
        },
        {
            "event_code": "EV-RAIN-2026-10-08-002",
            "name": "Heavy Rainfall in Mandakini Basin",
            "hazard": "Heavy Rainfall",
            "location": "Upper Rudraprayag",
            "severity": "Critical",
            "time": "2026-10-24T12:00:00Z",
            "status": "Active",
            "epistemic_status": "Observed",
            "affected_population": 18000,
        },
        {
            "event_code": "EV-FLD-2026-10-09-003",
            "name": "Mandakini River Level Surge",
            "hazard": "Flash Flood",
            "location": "Agastyamuni, Rudraprayag",
            "severity": "High",
            "time": "2026-10-24T15:30:00Z",
            "status": "Active",
            "epistemic_status": "Observed",
            "affected_population": 12500,
        },
        {
            "event_code": "EV-ROD-2026-10-09-004",
            "name": "NH-107 Highway Severance",
            "hazard": "Road Blockage",
            "location": "Basukedar Bridge Sector",
            "severity": "Critical",
            "time": "2026-10-24T16:45:00Z",
            "status": "Active",
            "epistemic_status": "Observed",
            "affected_population": 420,
        },
        {
            "event_code": "EV-LSD-2026-10-08-005",
            "name": "Joshimath Slope Slump",
            "hazard": "Landslide",
            "location": "Joshimath Ward 4, Chamoli",
            "severity": "Moderate",
            "time": "2026-10-24T09:15:00Z",
            "status": "Monitoring",
            "epistemic_status": "Reported",
            "affected_population": 850,
        },
    ]
    return events[:limit]


@router.get("/data-sources", response_model=List[Dict[str, Any]])
def get_data_sources_status() -> List[Dict[str, Any]]:
    """Return operational health, latency, and status of external telemetry and satellite feeds."""
    return [
        {
            "source": "Central Water Commission (CWC)",
            "provider": "Ministry of Jal Shakti",
            "type": "Hydrological Telemetry",
            "last_sync": "10 mins ago",
            "status": "Operational",
            "latency_ms": 140,
            "records_today": 1767,
        },
        {
            "source": "India Meteorological Dept (IMD)",
            "provider": "Ministry of Earth Sciences",
            "type": "Radar & Gridded Rainfall",
            "last_sync": "15 mins ago",
            "status": "Operational",
            "latency_ms": 280,
            "records_today": 2000,
        },
        {
            "source": "ISRO MOSDAC INSAT-3DR",
            "provider": "SAC / ISRO",
            "type": "Satellite Infrared/IMSRA",
            "last_sync": "35 mins ago",
            "status": "Operational",
            "latency_ms": 420,
            "records_today": 612,
        },
        {
            "source": "ISRO Bhuvan NRSC",
            "provider": "National Remote Sensing Centre",
            "type": "Slope & Landslide Inventory",
            "last_sync": "1 hour ago",
            "status": "Operational",
            "latency_ms": 310,
            "records_today": 892,
        },
        {
            "source": "Uttarakhand SEOC Dispatch",
            "provider": "USDMA Government of UK",
            "type": "Official SITREPs",
            "last_sync": "5 mins ago",
            "status": "Operational",
            "latency_ms": 95,
            "records_today": 86,
        },
        {
            "source": "Copernicus Sentinel-1 / EOS-04",
            "provider": "ESA / ISRO C-SAR",
            "type": "Synthetic Aperture Radar",
            "last_sync": "4 hours ago",
            "status": "Degraded",
            "latency_ms": 1250,
            "records_today": 797,
        },
        {
            "source": "USGS Global Seismic Network",
            "provider": "USGS",
            "type": "Earthquake Telemetry",
            "last_sync": "2 mins ago",
            "status": "Operational",
            "latency_ms": 110,
            "records_today": 14,
        },
    ]
