"""
Endpoints for View 10: My Area / Settings (image3.png).
Provides pinned regions watchlist management (GET, POST, DELETE) and customizable
settings for notification channels, display units, map defaults, and user profile.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# In-memory stores for session
WATCHLIST = [
    {
        "district_lgd_code": 54,
        "district_name": "Rudraprayag",
        "active_hazards": ["Landslide", "Flash Flood"],
        "alert_level": "Critical",
        "monitored_since": "2026-10-01",
        "pinned": True,
        "centroid": [79.049, 30.498],
    },
    {
        "district_lgd_code": 47,
        "district_name": "Chamoli",
        "active_hazards": ["Flash Flood", "Glacial Lake"],
        "alert_level": "High",
        "monitored_since": "2026-10-05",
        "pinned": True,
        "centroid": [79.312, 30.183],
    },
    {
        "district_lgd_code": 57,
        "district_name": "Uttarkashi",
        "active_hazards": ["Heavy Rainfall"],
        "alert_level": "Moderate",
        "monitored_since": "2026-10-10",
        "pinned": True,
        "centroid": [78.459, 30.779],
    },
]

ALL_DISTRICTS = [
    {"district_lgd_code": 45, "district_name": "Almora", "centroid": [79.65, 29.60]},
    {"district_lgd_code": 46, "district_name": "Bageshwar", "centroid": [79.77, 29.84]},
    {"district_lgd_code": 47, "district_name": "Chamoli", "centroid": [79.31, 30.18]},
    {"district_lgd_code": 48, "district_name": "Champawat", "centroid": [80.10, 29.33]},
    {"district_lgd_code": 49, "district_name": "Dehradun", "centroid": [77.97, 30.42]},
    {"district_lgd_code": 50, "district_name": "Haridwar", "centroid": [78.16, 29.94]},
    {"district_lgd_code": 51, "district_name": "Nainital", "centroid": [79.46, 29.39]},
    {"district_lgd_code": 52, "district_name": "Pauri Garhwal", "centroid": [78.78, 30.15]},
    {"district_lgd_code": 53, "district_name": "Pithoragarh", "centroid": [80.37, 29.77]},
    {"district_lgd_code": 54, "district_name": "Rudraprayag", "centroid": [79.05, 30.50]},
    {"district_lgd_code": 55, "district_name": "Tehri Garhwal", "centroid": [78.05, 30.49]},
    {"district_lgd_code": 56, "district_name": "Udham Singh Nagar", "centroid": [79.45, 28.98]},
    {"district_lgd_code": 57, "district_name": "Uttarkashi", "centroid": [78.46, 30.78]},
]

USER_SETTINGS = {
    "notifications": {
        "critical_alerts_sms": True,
        "push_notifications": True,
        "daily_summary_email": False,
        "severe_weather_warning": True,
        "landslide_early_warning": True,
        "flash_flood_threshold": True,
    },
    "display_units": {
        "rainfall": "mm",
        "distance": "km",
        "elevation": "m",
        "temperature": "celsius",
        "pressure": "hPa",
    },
    "map_settings": {
        "default_basemap": "dark",
        "show_station_markers": True,
        "show_risk_polygons": True,
        "auto_refresh_sec": 30,
        "default_zoom": 8,
    },
    "account": {
        "name": "Ashutosh Sharma",
        "role": "State Disaster Response Officer",
        "state": "Uttarakhand",
        "badge": "AS",
        "organization": "Uttarakhand State Disaster Management Authority",
    },
}


class AddRegionRequest(BaseModel):
    district_lgd_code: Optional[int] = None
    district_name: Optional[str] = None


@router.get("/watchlist", response_model=Dict[str, Any])
def get_watchlist() -> Dict[str, Any]:
    """Return pinned districts in watchlist and list of available districts."""
    return {
        "watchlist": WATCHLIST,
        "available_districts": ALL_DISTRICTS,
    }


@router.post("/watchlist", response_model=Dict[str, Any])
def add_to_watchlist(req: AddRegionRequest) -> Dict[str, Any]:
    """Add a district to the user's pinned watchlist."""
    target_code = req.district_lgd_code
    target_name = req.district_name

    # Find in ALL_DISTRICTS
    found = None
    for d in ALL_DISTRICTS:
        if (target_code and d["district_lgd_code"] == target_code) or (
            target_name and d["district_name"].lower() == target_name.lower()
        ):
            found = d
            break

    if not found:
        raise HTTPException(status_code=400, detail="Invalid district code or name.")

    # Check if already in watchlist
    for w in WATCHLIST:
        if w["district_lgd_code"] == found["district_lgd_code"]:
            return {"success": True, "message": "District already in watchlist.", "watchlist": WATCHLIST}

    new_item = {
        "district_lgd_code": found["district_lgd_code"],
        "district_name": found["district_name"],
        "active_hazards": ["Heavy Rainfall"],
        "alert_level": "Moderate",
        "monitored_since": "2026-10-24",
        "pinned": True,
        "centroid": found["centroid"],
    }
    WATCHLIST.append(new_item)

    return {"success": True, "message": f"Added {found['district_name']} to watchlist.", "watchlist": WATCHLIST}


@router.delete("/watchlist/{district_code}", response_model=Dict[str, Any])
def remove_from_watchlist(district_code: str) -> Dict[str, Any]:
    """Remove a district from the user's pinned watchlist by code or name."""
    global WATCHLIST
    initial_len = len(WATCHLIST)

    # Check if integer code or string name
    try:
        code_int = int(district_code)
        WATCHLIST = [w for w in WATCHLIST if w["district_lgd_code"] != code_int]
    except ValueError:
        WATCHLIST = [w for w in WATCHLIST if w["district_name"].lower() != district_code.lower()]

    if len(WATCHLIST) == initial_len:
        raise HTTPException(status_code=404, detail=f"District '{district_code}' not found in watchlist.")

    return {"success": True, "message": "Removed from watchlist.", "watchlist": WATCHLIST}


@router.get("/settings", response_model=Dict[str, Any])
def get_settings() -> Dict[str, Any]:
    """Return user configuration preferences (notifications, display, map, account)."""
    return USER_SETTINGS


@router.put("/settings", response_model=Dict[str, Any])
def update_settings(updates: Dict[str, Any]) -> Dict[str, Any]:
    """Update user configuration preferences safely without corrupting nested dictionaries."""
    for key, val in updates.items():
        if key in USER_SETTINGS:
            if isinstance(USER_SETTINGS[key], dict):
                if isinstance(val, dict):
                    USER_SETTINGS[key].update(val)
                # Ignore non-dict values that would overwrite existing dictionary configuration
            else:
                USER_SETTINGS[key] = val
        else:
            USER_SETTINGS[key] = val
    return {"success": True, "settings": USER_SETTINGS}
