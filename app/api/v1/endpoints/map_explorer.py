"""
Endpoints for View 2: Map Explorer (image6.png).
Provides floating layer controls, GeoJSON hazard features, right-hand events/warnings feed,
timeline playback scrubber data, and location summary card.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query
from app.core.schema_store import schema_store

router = APIRouter()


@router.get("/layers", response_model=Dict[str, Any])
def get_map_layers() -> Dict[str, Any]:
    """Return map layer configurations grouped into Events & Alerts and Environmental."""
    return {
        "categories": ["Events & Alerts", "Environmental"],
        "layers": [
            {
                "id": "active_events",
                "name": "Active Events",
                "category": "Events & Alerts",
                "default_visible": True,
                "opacity": 1.0,
                "color": "#ef4444",
                "icon": "AlertTriangle",
                "count": 14,
            },
            {
                "id": "severe_warnings",
                "name": "Severe Warnings",
                "category": "Events & Alerts",
                "default_visible": True,
                "opacity": 0.85,
                "color": "#f97316",
                "icon": "BellRing",
                "count": 8,
            },
            {
                "id": "cwc_stations",
                "name": "CWC Hydrological Stations",
                "category": "Events & Alerts",
                "default_visible": True,
                "opacity": 0.9,
                "color": "#3b82f6",
                "icon": "Waves",
                "count": 47,
            },
            {
                "id": "rainfall_grid",
                "name": "IMD Rainfall Heatmap",
                "category": "Environmental",
                "default_visible": True,
                "opacity": 0.65,
                "color": "#06b6d4",
                "icon": "CloudRain",
                "count": 142,
            },
            {
                "id": "landslide_inventory",
                "name": "Bhuvan Landslide Inventory",
                "category": "Environmental",
                "default_visible": False,
                "opacity": 0.75,
                "color": "#eab308",
                "icon": "Mountain",
                "count": 892,
            },
            {
                "id": "slope_hazard",
                "name": "Steep Slope Hazard (>35°)",
                "category": "Environmental",
                "default_visible": False,
                "opacity": 0.6,
                "color": "#8b5cf6",
                "icon": "TrendingUp",
                "count": 1,
            },
            {
                "id": "admin_boundaries",
                "name": "District Admin Boundaries",
                "category": "Environmental",
                "default_visible": True,
                "opacity": 0.5,
                "color": "#64748b",
                "icon": "MapPin",
                "count": 13,
            },
        ],
    }


@router.get("/geojson", response_model=Dict[str, Any])
def get_map_geojson(
    hazard: Optional[str] = None,
    severity: Optional[str] = None,
    district: Optional[str] = None,
    min_lat: Optional[float] = None,
    max_lat: Optional[float] = None,
    min_lon: Optional[float] = None,
    max_lon: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Return GeoJSON FeatureCollection of hazard markers, risk zones,
    and monitoring stations filtered by hazard, severity, district, or bounding box.
    """
    if (
        (max_lat is not None and (max_lat < -90.0 or max_lat < 25.0))
        or (min_lat is not None and (min_lat > 90.0 or min_lat > 35.0))
        or (min_lon is not None and (min_lon > 180.0 or min_lon > 85.0))
        or (max_lon is not None and (max_lon < -180.0 or max_lon < 75.0))
    ):
        return {"type": "FeatureCollection", "features": []}

    features = []

    def in_bbox(lon: float, lat: float) -> bool:
        if min_lat is not None and lat < min_lat:
            return False
        if max_lat is not None and lat > max_lat:
            return False
        if min_lon is not None and lon < min_lon:
            return False
        if max_lon is not None and lon > max_lon:
            return False
        return True

    # 1. Event markers
    events = schema_store.get_records("event")
    for ev in events:
        ev_name = ev.get("name", "Event")
        ev_code = ev.get("event_code", "")
        sev = ev.get("severity", "Moderate")

        if "lsd" in ev_code.lower() or "landslide" in ev_name.lower():
            h_str = "Landslide"
        elif "rain" in ev_code.lower() or "rainfall" in ev_name.lower():
            h_str = "Heavy Rainfall"
        elif "fld" in ev_code.lower() or "flood" in ev_name.lower() or "river" in ev_name.lower():
            h_str = "Flash Flood"
        elif "rod" in ev_code.lower() or "road" in ev_name.lower():
            h_str = "Road Blockage"
        else:
            h_str = "Landslide"

        ev_desc = ev.get("description", "")
        ev_dist = "Rudraprayag" if "rudraprayag" in (ev_name + ev_desc).lower() else ("Chamoli" if "chamoli" in (ev_name + ev_desc).lower() else "Rudraprayag")

        if hazard and hazard.lower() not in h_str.lower():
            continue
        if severity and severity.lower() != sev.lower():
            continue
        if district and district.lower() not in ev_dist.lower():
            continue

        c = ev.get("centroid", {})
        if c.get("type") == "Point":
            coords = c.get("coordinates", [])
            if len(coords) >= 2 and not in_bbox(coords[0], coords[1]):
                continue

            features.append({
                "type": "Feature",
                "id": ev.get("event_code"),
                "geometry": c,
                "properties": {
                    "layer": "active_events",
                    "event_code": ev.get("event_code"),
                    "title": ev.get("name"),
                    "hazard": h_str,
                    "hazard_name": h_str,
                    "district": ev_dist,
                    "severity": sev,
                    "epistemic_status": "Observed" if sev == "Critical" else "Official",
                    "status": ev.get("status"),
                    "description": ev.get("description"),
                    "magnitude": ev.get("magnitude"),
                    "magnitude_type": ev.get("magnitude_type"),
                    "color": "#ef4444" if sev == "Critical" else "#f97316",
                },
            })

        # Affected area polygon (only if not strictly filtering a remote point)
        poly = ev.get("affected_area", {})
        if poly.get("type") == "Polygon" and min_lat is None and max_lat is None and min_lon is None and max_lon is None:
            features.append({
                "type": "Feature",
                "id": f"{ev.get('event_code')}_poly",
                "geometry": poly,
                "properties": {
                    "layer": "risk_polygons",
                    "event_code": ev.get("event_code"),
                    "title": f"Risk Zone: {ev.get('name')}",
                    "hazard": h_str,
                    "district": ev_dist,
                    "severity": sev,
                    "color": "#ef4444" if sev == "Critical" else "#f97316",
                    "fillOpacity": 0.25,
                },
            })

    # 2. CWC Stations (Only if no hazard filter or hazard is water/rainfall related)
    include_stations = not hazard or any(w in hazard.lower() for w in ["flood", "rain", "water", "station", "hydro"])
    if include_stations:
        features_geo = schema_store.get_records("geo_feature")
        for gf in features_geo[:30]:
            geom = gf.get("geometry", {})
            coords = geom.get("coordinates", [])
            if len(coords) >= 2 and not in_bbox(coords[0], coords[1]):
                continue

            props = gf.get("properties", {})
            st_dist = props.get("district_name", "")
            if district and district.lower() not in st_dist.lower():
                continue

            features.append({
                "type": "Feature",
                "id": gf.get("external_id"),
                "geometry": geom,
                "properties": {
                    "layer": "cwc_stations",
                    "station_id": gf.get("external_id"),
                    "title": gf.get("name"),
                    "district": st_dist,
                    "agency": props.get("agency", "CWC"),
                    "water_level": "625.8 m (Danger: 624.0 m)" if "Basukedar" in gf.get("name", "") else "Normal",
                    "color": "#3b82f6",
                },
            })

    return {
        "type": "FeatureCollection",
        "features": features,
    }


@router.get("/feed", response_model=List[Dict[str, Any]])
def get_map_feed(tab: str = Query("all", pattern="^(all|events|warnings|risk_alerts)$")) -> List[Dict[str, Any]]:
    """Return right sidebar events & warnings feed filtered by category."""
    all_feed = [
        {
            "id": "FEED-001",
            "type": "events",
            "title": "Basukedar Landslide & NH-107 Cutoff",
            "location": "Basukedar, Rudraprayag",
            "time": "16:30 IST",
            "severity": "Critical",
            "coordinates": [79.062, 30.485],
            "epistemic_status": "Observed",
            "badge": "Active Event",
            "summary": "340m debris fan across highway carriageway. Pilgrims halted.",
        },
        {
            "id": "FEED-002",
            "type": "warnings",
            "title": "IMD Flash Flood & Inundation Red Warning",
            "location": "Mandakini Basin, Rudraprayag",
            "time": "17:15 IST",
            "severity": "Critical",
            "coordinates": [78.980, 30.285],
            "epistemic_status": "Official",
            "badge": "Severe Warning",
            "summary": "River 1.8m above danger mark; downstream evacuation alert.",
        },
        {
            "id": "FEED-003",
            "type": "risk_alerts",
            "title": "Soil Moisture Critical Threshold Saturation",
            "location": "Upper Kedarnath Catchment",
            "time": "15:00 IST",
            "severity": "High",
            "coordinates": [79.050, 30.520],
            "epistemic_status": "AI Inferred",
            "badge": "Risk Alert",
            "summary": "SAR C-band backscatter detects >94% soil pore water saturation.",
        },
        {
            "id": "FEED-004",
            "type": "events",
            "title": "Intense Rain Surge — 128.4mm / 6h",
            "location": "Basukedar Station CWC",
            "time": "14:00 IST",
            "severity": "High",
            "coordinates": [79.056, 30.439],
            "epistemic_status": "Observed",
            "badge": "Active Event",
            "summary": "Extreme rainfall telemetry trigger exceeded historical 10-year threshold.",
        },
        {
            "id": "FEED-005",
            "type": "warnings",
            "title": "Badrinath Highway Rockfall Precaution",
            "location": "Lambagar, Chamoli",
            "time": "13:30 IST",
            "severity": "Moderate",
            "coordinates": [79.540, 30.600],
            "epistemic_status": "Reported",
            "badge": "Warning",
            "summary": "Intermittent boulder rolling; BRO bulldozer standing by.",
        },
    ]

    if tab == "all":
        return all_feed
    return [item for item in all_feed if item["type"] == tab]


@router.get("/timeline", response_model=Dict[str, Any])
def get_map_timeline(interval: str = "hourly") -> Dict[str, Any]:
    """Return timeline intervals and hazard incident frequency for bottom scrubber."""
    steps = [
        {"timestamp": "2026-10-24T08:00:00Z", "label": "08:00 IST", "event_count": 1, "active_hazards": {"Weather": 1}},
        {"timestamp": "2026-10-24T10:00:00Z", "label": "10:00 IST", "event_count": 2, "active_hazards": {"Weather": 1, "Flood": 1}},
        {"timestamp": "2026-10-24T12:00:00Z", "label": "12:00 IST", "event_count": 4, "active_hazards": {"Weather": 2, "Flood": 1, "Landslide": 1}},
        {"timestamp": "2026-10-24T14:00:00Z", "label": "14:00 IST", "event_count": 7, "active_hazards": {"Weather": 2, "Landslide": 3, "Flood": 2}},
        {"timestamp": "2026-10-24T16:00:00Z", "label": "16:00 IST", "event_count": 11, "active_hazards": {"Weather": 3, "Landslide": 5, "Flood": 3}},
        {"timestamp": "2026-10-24T18:00:00Z", "label": "18:00 IST", "event_count": 14, "active_hazards": {"Weather": 3, "Landslide": 6, "Flood": 4, "Infrastructure": 1}},
    ]
    return {
        "start_time": "2026-10-24T08:00:00Z",
        "end_time": "2026-10-24T18:00:00Z",
        "current_step": "2026-10-24T18:00:00Z",
        "interval": interval,
        "steps": steps,
    }


@router.get("/summary", response_model=Dict[str, Any])
def get_location_summary(
    lat: float = 30.498,
    lon: float = 79.049,
    district: Optional[str] = "Rudraprayag",
) -> Dict[str, Any]:
    """Return detailed situational summary card for the selected point or administrative zone."""
    return {
        "name": f"{district} High-Risk Sector",
        "district": district,
        "coordinates": [lon, lat],
        "risk_score": 8.4,
        "risk_level": "Critical",
        "dominant_hazard": "Landslide & Flash Flood",
        "active_events_in_vicinity": 3,
        "weather": {
            "rainfall_last_24h_mm": 128.4,
            "current_rain_rate_mm_hr": 24.5,
            "temp_c": 14.2,
            "humidity_pct": 98,
        },
        "soil_saturation_pct": 94.2,
        "nearest_shelter": {
            "name": "Basukedar Community Relief Camp",
            "distance_km": 1.8,
            "capacity": 250,
            "occupancy": 84,
            "status": "Available",
        },
        "nearest_cwc_station": {
            "name": "CWC_UK_Basukedar",
            "distance_km": 2.1,
            "status": "Exceeding Flood Stage",
        },
    }
