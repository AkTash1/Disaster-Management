"""
Endpoints for View 7: History & Trends (image1.png).
Provides 6 historical KPIs, decadal stacked bar trends, 12-month seasonal patterns,
historical landslide inventory GeoJSON, regional district distribution, and side-by-side event comparison.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/summary", response_model=Dict[str, Any])
def get_history_summary() -> Dict[str, Any]:
    """Return 6 historical KPI summary cards matching image1.png."""
    return {
        "total_recorded_events": 1420,
        "decadal_trend_pct": 24.8,
        "major_disasters": 16,
        "historical_landslides": 892,
        "most_vulnerable_district": "Rudraprayag",
        "total_economic_impact_cr": 4850.0,
        "period": "2015 - 2025",
        "kpis": [
            {"title": "Total Recorded Events", "value": "1,420", "subtitle": "2015–2025 decadal archive"},
            {"title": "Decadal Frequency Shift", "value": "+24.8%", "subtitle": "Accelerating frequency"},
            {"title": "Major Disasters (State Level)", "value": "16", "subtitle": "USDMA Level-3 emergencies"},
            {"title": "Mapped Landslide Scars", "value": "892", "subtitle": "Bhuvan NRSC inventory"},
            {"title": "Most Vulnerable District", "value": "Rudraprayag", "subtitle": "134 events in 10 yrs"},
            {"title": "Total Economic Impact", "value": "₹4,850 Cr", "subtitle": "Infrastructure & relief"},
        ],
    }


@router.get("/trends", response_model=Dict[str, Any])
def get_historical_trends(granularity: str = Query("yearly", pattern="^(yearly|monthly)$")) -> Dict[str, Any]:
    """Return stacked bar chart dataset over 10 years or 12 months for 4 major hazards."""
    if granularity == "yearly":
        years = ["2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"]
        datasets = [
            {"name": "Landslide", "data": [45, 52, 64, 71, 78, 89, 95, 124, 110, 142], "color": "#ef4444"},
            {"name": "Flash Flood", "data": [18, 22, 28, 30, 35, 42, 48, 62, 54, 70], "color": "#06b6d4"},
            {"name": "Cloudburst", "data": [12, 15, 18, 22, 25, 31, 38, 45, 41, 52], "color": "#3b82f6"},
            {"name": "Earthquake", "data": [4, 6, 5, 8, 7, 9, 8, 12, 10, 14], "color": "#a855f7"},
        ]
        trends_list = [
            {
                "period": years[i],
                "year": years[i],
                "landslide": datasets[0]["data"][i],
                "flash_flood": datasets[1]["data"][i],
                "cloudburst": datasets[2]["data"][i],
                "earthquake": datasets[3]["data"][i],
                "total": sum(ds["data"][i] for ds in datasets),
            }
            for i in range(len(years))
        ]
        return {
            "granularity": "yearly",
            "labels": years,
            "datasets": datasets,
            "trends": trends_list,
        }

    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    datasets = [
        {"name": "Landslide", "data": [8, 10, 14, 18, 32, 95, 280, 245, 110, 38, 14, 9], "color": "#ef4444"},
        {"name": "Flash Flood", "data": [2, 4, 6, 8, 15, 48, 142, 130, 55, 18, 6, 3], "color": "#06b6d4"},
        {"name": "Cloudburst", "data": [1, 2, 3, 5, 12, 34, 88, 76, 32, 10, 3, 1], "color": "#3b82f6"},
        {"name": "Earthquake", "data": [3, 2, 4, 3, 2, 4, 3, 4, 2, 3, 2, 3], "color": "#a855f7"},
    ]
    trends_list = [
        {
            "period": months[i],
            "month": months[i],
            "landslide": datasets[0]["data"][i],
            "flash_flood": datasets[1]["data"][i],
            "cloudburst": datasets[2]["data"][i],
            "earthquake": datasets[3]["data"][i],
            "total": sum(ds["data"][i] for ds in datasets),
        }
        for i in range(len(months))
    ]
    return {
        "granularity": "monthly",
        "labels": months,
        "datasets": datasets,
        "trends": trends_list,
    }


@router.get("/seasonal", response_model=List[Dict[str, Any]])
def get_seasonal_patterns() -> List[Dict[str, Any]]:
    """Return 12-month multi-line seasonal pattern across rainfall and hazard frequency."""
    return [
        {"month": "Jan", "rainfall_mm": 42.1, "landslide_events": 8, "flood_events": 2},
        {"month": "Feb", "rainfall_mm": 54.3, "landslide_events": 10, "flood_events": 4},
        {"month": "Mar", "rainfall_mm": 61.8, "landslide_events": 14, "flood_events": 6},
        {"month": "Apr", "rainfall_mm": 48.2, "landslide_events": 18, "flood_events": 8},
        {"month": "May", "rainfall_mm": 78.5, "landslide_events": 32, "flood_events": 15},
        {"month": "Jun", "rainfall_mm": 185.4, "landslide_events": 95, "flood_events": 48},
        {"month": "Jul", "rainfall_mm": 412.8, "landslide_events": 280, "flood_events": 142},
        {"month": "Aug", "rainfall_mm": 384.6, "landslide_events": 245, "flood_events": 130},
        {"month": "Sep", "rainfall_mm": 192.3, "landslide_events": 110, "flood_events": 55},
        {"month": "Oct", "rainfall_mm": 68.4, "landslide_events": 38, "flood_events": 18},
        {"month": "Nov", "rainfall_mm": 18.2, "landslide_events": 14, "flood_events": 6},
        {"month": "Dec", "rainfall_mm": 24.5, "landslide_events": 9, "flood_events": 3},
    ]


@router.get("/landslides", response_model=Dict[str, Any])
def get_landslide_inventory(district: Optional[str] = None) -> Dict[str, Any]:
    """Return GeoJSON FeatureCollection of historical landslide scars from Bhuvan/GSI inventory."""
    scars = [
        {"id": "LSD-HIST-001", "name": "Basukedar Scar 2013", "year": 2013, "district": "Rudraprayag", "coords": [79.064, 30.482], "trigger": "Monsoon Deluge", "volume_m3": 45000},
        {"id": "LSD-HIST-002", "name": "Kund Bridge Slide 2017", "year": 2017, "district": "Rudraprayag", "coords": [79.080, 30.510], "trigger": "Cloudburst", "volume_m3": 12000},
        {"id": "LSD-HIST-003", "name": "Lambagar Rock Avalanche 2021", "year": 2021, "district": "Chamoli", "coords": [79.542, 30.605], "trigger": "Slope Undercutting", "volume_m3": 28000},
        {"id": "LSD-HIST-004", "name": "Bhatwari Debris Slide 2018", "year": 2018, "district": "Uttarkashi", "coords": [78.615, 30.812], "trigger": "Heavy Rainfall", "volume_m3": 34000},
        {"id": "LSD-HIST-005", "name": "Kaliasaur Landslide Zone 2020", "year": 2020, "district": "Pauri Garhwal", "coords": [78.852, 30.220], "trigger": "Toe Erosion", "volume_m3": 52000},
        {"id": "LSD-HIST-006", "name": "Malpa Rockfall 2019", "year": 2019, "district": "Pithoragarh", "coords": [80.750, 29.980], "trigger": "Seismic Shaking", "volume_m3": 19000},
    ]

    features = []
    for s in scars:
        if district and district.lower() not in s["district"].lower():
            continue
        features.append({
            "type": "Feature",
            "id": s["id"],
            "geometry": {"type": "Point", "coordinates": s["coords"]},
            "properties": {
                "scar_id": s["id"],
                "name": s["name"],
                "year": s["year"],
                "district": s["district"],
                "trigger": s["trigger"],
                "volume_m3": s["volume_m3"],
                "color": "#eab308",
            },
        })

    return {"type": "FeatureCollection", "features": features}


@router.get("/regional-distribution", response_model=List[Dict[str, Any]])
def get_regional_distribution() -> List[Dict[str, Any]]:
    """Return horizontal stacked bar chart by Uttarakhand district for all 13 districts."""
    return [
        {"district": "Rudraprayag", "high": 42, "moderate": 68, "low": 24, "total": 134},
        {"district": "Chamoli", "high": 38, "moderate": 62, "low": 28, "total": 128},
        {"district": "Uttarkashi", "high": 32, "moderate": 54, "low": 22, "total": 108},
        {"district": "Pithoragarh", "high": 28, "moderate": 48, "low": 26, "total": 102},
        {"district": "Tehri Garhwal", "high": 24, "moderate": 44, "low": 20, "total": 88},
        {"district": "Pauri Garhwal", "high": 20, "moderate": 42, "low": 22, "total": 84},
        {"district": "Bageshwar", "high": 16, "moderate": 34, "low": 18, "total": 68},
        {"district": "Nainital", "high": 18, "moderate": 32, "low": 16, "total": 66},
        {"district": "Almora", "high": 12, "moderate": 28, "low": 18, "total": 58},
        {"district": "Dehradun", "high": 14, "moderate": 26, "low": 16, "total": 56},
        {"district": "Champawat", "high": 10, "moderate": 24, "low": 14, "total": 48},
        {"district": "Haridwar", "high": 8, "moderate": 18, "low": 14, "total": 40},
        {"district": "Udham Singh Nagar", "high": 6, "moderate": 16, "low": 12, "total": 34},
    ]


@router.get("/compare", response_model=Dict[str, Any])
def compare_past_events(
    event_a: str = "2023_Rudraprayag",
    event_b: str = "2026_Basukedar",
) -> Dict[str, Any]:
    """Return side-by-side comparison widget of past vs current disaster episode."""
    return {
        "event_a": {
            "name": "July 2023 Rudraprayag Flood & Slide Episode",
            "date": "July 12–16, 2023",
            "type": "Monsoon Multi-Hazard Cascade",
            "severity": "Critical",
        },
        "event_b": {
            "name": "October 2026 Basukedar NH-107 Landslide Episode",
            "date": "October 24, 2026",
            "type": "Cloudburst Induced Slope Severance",
            "severity": "Critical",
        },
        "metrics": [
            {"metric": "Peak 24h Rainfall", "event_a": "164.2 mm", "event_b": "128.4 mm", "comparison": "-21.8% in 2026"},
            {"metric": "Road Carriageway Severed", "event_a": "180 meters", "event_b": "340 meters", "comparison": "+88.9% in 2026"},
            {"metric": "Debris Mass Displaced", "event_a": "11,200 m³", "event_b": "18,500 m³", "comparison": "+65.2% in 2026"},
            {"metric": "Stranded Pilgrims / Evacuated", "event_a": "1,200 persons", "event_b": "420 persons", "comparison": "-65.0% (Earlier Warning)"},
            {"metric": "Sensor Lead Time Warning", "event_a": "45 mins", "event_b": "140 mins", "comparison": "+211% Improvement"},
            {"metric": "Casualties Recorded", "event_a": "3 fatalities", "event_b": "0 fatalities", "comparison": "100% Zero Casualties"},
            {"metric": "Clearance Time Required", "event_a": "72 Hours", "event_b": "36–48 Hours", "comparison": "Accelerated Restoration"},
        ],
    }
