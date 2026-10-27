"""
Endpoints for View 8: Preparedness & Response (image2.png).
Provides 4 preparedness KPI cards with "Last verified" timestamps, searchable shelters
with occupancy and availability status, and a 3-column directory of emergency contacts,
relief resources, and multilingual safety guidance.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/summary", response_model=Dict[str, Any])
def get_preparedness_summary() -> Dict[str, Any]:
    """Return 4 KPI cards with 'Last verified' dates matching image2.png."""
    return {
        "verified_shelters": {
            "title": "Verified Shelters",
            "count": 48,
            "last_verified": "2026-10-24 16:00 IST",
            "occupancy_rate": "34% Occupied",
            "status": "Available",
        },
        "emergency_contacts": {
            "title": "Emergency Contacts",
            "count": 32,
            "last_verified": "2026-10-24 18:00 IST",
            "hotlines_active": "100% Operational",
            "status": "Available",
        },
        "relief_resources": {
            "title": "Relief Resources",
            "count": 124,
            "last_verified": "2026-10-24 15:30 IST",
            "stock_status": "Adequate Reserves",
            "status": "Available",
        },
        "safety_guidance": {
            "title": "Safety Guidance",
            "count": 18,
            "last_verified": "2026-10-20 12:00 IST",
            "languages": "English & Hindi (Bilingual)",
            "status": "Available",
        },
    }


@router.get("/shelters", response_model=List[Dict[str, Any]])
def list_shelters(
    search: Optional[str] = None,
    status: Optional[str] = None,
    district: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Return searchable list of relief shelters with capacity, occupancy, and coordinates."""
    shelters = [
        {
            "shelter_id": "sh-001",
            "name": "Basukedar Community Relief Centre",
            "district": "Rudraprayag",
            "tehsil": "Jakholi",
            "capacity": 250,
            "current_occupancy": 84,
            "status": "Available",
            "distance_km": 1.8,
            "facilities": ["Medical Station", "Emergency Food Rations", "Backup Generator", "Sanitation Blocks"],
            "contact_person": "Inspector B. S. Negi",
            "phone": "+91-1364-233100",
            "coordinates": [79.052, 30.435],
            "last_verified": "2026-10-24 16:00 IST",
        },
        {
            "shelter_id": "sh-002",
            "name": "Tilwara Inter College Transit Camp",
            "district": "Rudraprayag",
            "tehsil": "Rudraprayag",
            "capacity": 400,
            "current_occupancy": 320,
            "status": "Partially Filled",
            "distance_km": 8.5,
            "facilities": ["Ambulance Bay", "Community Kitchen", "Purified Water Tanker", "Helipad Vicinity"],
            "contact_person": "Tehsildar P. K. Bhatt",
            "phone": "+91-1364-233105",
            "coordinates": [78.995, 30.340],
            "last_verified": "2026-10-24 17:30 IST",
        },
        {
            "shelter_id": "sh-003",
            "name": "Agastyamuni Sports Complex Relief Hub",
            "district": "Rudraprayag",
            "tehsil": "Agastyamuni",
            "capacity": 600,
            "current_occupancy": 150,
            "status": "Available",
            "distance_km": 12.0,
            "facilities": ["Field Hospital (SDRF)", "Helipad", "Satellite Telecom", "Emergency Bedding"],
            "contact_person": "Dy. SP M. S. Chauhan",
            "phone": "+91-1364-234200",
            "coordinates": [79.020, 30.380],
            "last_verified": "2026-10-24 18:00 IST",
        },
        {
            "shelter_id": "sh-004",
            "name": "Joshimath Town Hall Emergency Shelter",
            "district": "Chamoli",
            "tehsil": "Joshimath",
            "capacity": 200,
            "current_occupancy": 195,
            "status": "Unavailable",
            "distance_km": 42.0,
            "facilities": ["Heated Dormitories", "First Aid", "Drinking Water"],
            "contact_person": "SDM Joshimath",
            "phone": "+91-1372-222120",
            "coordinates": [79.565, 30.555],
            "last_verified": "2026-10-24 15:00 IST",
        },
        {
            "shelter_id": "sh-005",
            "name": "Gopeshwar Poly-Clinic Relief Shelter",
            "district": "Chamoli",
            "tehsil": "Chamoli",
            "capacity": 350,
            "current_occupancy": 90,
            "status": "Available",
            "distance_km": 35.0,
            "facilities": ["Surgical Ward", "Child Care", "Food Storage"],
            "contact_person": "Chief Medical Officer",
            "phone": "+91-1372-252200",
            "coordinates": [79.320, 30.410],
            "last_verified": "2026-10-24 16:30 IST",
        },
    ]

    filtered = []
    for s in shelters:
        if status and status.lower() != s["status"].lower():
            continue
        if district and district.lower() not in s["district"].lower():
            continue
        if search:
            q = search.lower()
            if q not in s["name"].lower() and q not in s["tehsil"].lower() and q not in s["contact_person"].lower():
                continue
        filtered.append(s)

    return filtered


@router.get("/directory", response_model=Dict[str, Any])
def get_preparedness_directory(category: str = Query("all", pattern="^(all|contacts|resources|guidance)$")) -> Dict[str, Any]:
    """Return categorized 3-column directory: Emergency Contacts, Relief Resources, and Multilingual Guidance."""
    contacts = [
        {"agency": "State Emergency Operation Centre (SEOC)", "role": "State Disaster Command", "phone": "1070 / 0135-2710334", "availability": "24x7 Active", "verified": True},
        {"agency": "District Emergency Ops Centre Rudraprayag", "role": "District Incident Command", "phone": "1077 / 01364-233727", "availability": "24x7 Active", "verified": True},
        {"agency": "SDRF Uttarakhand (Jolly Grant HQ)", "role": "Search & Rescue Force", "phone": "+91-9456596190", "availability": "Rapid Deployment", "verified": True},
        {"agency": "Border Roads Organisation (752 BRTF)", "role": "Highway Heavy Machinery", "phone": "01364-233150", "availability": "On-Site Clearing", "verified": True},
        {"agency": "National Disaster Response Force (NDRF 14 Bn)", "role": "Federal Rescue Wing", "phone": "+91-9412051999", "availability": "Standby Alert", "verified": True},
        {"agency": "District Hospital Rudraprayag Emergency", "role": "Trauma & Medical Care", "phone": "01364-233215", "availability": "24x7 Medical", "verified": True},
    ]

    resources = [
        {"item": "Heavy Hydraulic Excavators (Poclain / JCB)", "quantity": "8 units", "location": "Basukedar & Tilwara Sectors", "status": "Deployed / Clearing"},
        {"item": "Mobile Water Purification Plant (RO + UV)", "quantity": "4 units", "location": "Basukedar Community Camp", "status": "Operational (4,000 L/hr)"},
        {"item": "ISRO / BSNL Satellite Phones", "quantity": "12 handsets", "location": "SDRF Ground Commander Units", "status": "Active Comm Link"},
        {"item": "Emergency Rations & High-Calorie Meal Packs", "quantity": "2,500 kits", "location": "Agastyamuni Central Depot", "status": "Dispatched to Camp"},
        {"item": "Inflatable Rescue Boats & Life Vests", "quantity": "6 boats / 120 vests", "location": "Rudraprayag Sangam Post", "status": "Positioned on River"},
        {"item": "Emergency Power Diesel Generators (25 kVA)", "quantity": "6 units", "location": "Designated Relief Shelters", "status": "Fuel Stocked"},
    ]

    guidance = [
        {
            "title": "Landslide Immediate Action Protocol (SOP #12)",
            "languages": ["English", "Hindi"],
            "formats": ["PDF", "PPT"],
            "summary": "Evacuation guidelines, warning sign detection, and barrier retreat procedures.",
            "download_url": "/static/docs/sop_landslide_action.pdf",
        },
        {
            "title": "Flash Flood Rapid Evacuation Route Guide",
            "languages": ["English", "Hindi"],
            "formats": ["PDF", "Video"],
            "summary": "Designated high-ground routes in Mandakini & Alaknanda river corridors.",
            "download_url": "/static/docs/mandakini_evacuation_routes.pdf",
        },
        {
            "title": "First Aid & Mountain Hypothermia Treatment Guide",
            "languages": ["English", "Hindi"],
            "formats": ["PDF"],
            "summary": "Treatment protocols for altitude shock, hypothermia, and blunt trauma injuries.",
            "download_url": "/static/docs/first_aid_mountain_disaster.pdf",
        },
    ]

    if category == "contacts":
        return {"contacts": contacts}
    if category == "resources":
        return {"resources": resources}
    if category == "guidance":
        return {"guidance": guidance}

    return {
        "contacts": contacts,
        "resources": resources,
        "guidance": guidance,
    }
