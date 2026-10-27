"""
Endpoints for View 9: Ask (Evidence-Grounded Q&A) (image5.png).
Provides 5 suggested questions and evidence-grounded conversational Q&A endpoint
returning structured responses categorized into Fact (green), Inference (orange),
and Prediction (purple) sections with inline citations [1]–[6].
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class AskQueryRequest(BaseModel):
    query: str
    context_event_id: Optional[str] = None


@router.get("/suggested", response_model=Dict[str, Any])
def get_suggested_questions() -> Dict[str, Any]:
    """Return the 5 default suggested questions matching image5.png."""
    return {
        "questions": [
            {
                "id": 1,
                "question": "What caused the landslide in Rudraprayag and what is the current road status?",
                "hazard": "Landslide",
                "region": "Rudraprayag (NH-107)",
            },
            {
                "id": 2,
                "question": "Which CWC hydrological stations are reporting water levels above danger mark?",
                "hazard": "Flood",
                "region": "Alaknanda & Mandakini Basins",
            },
            {
                "id": 3,
                "question": "What is the 48-hour rainfall forecast and satellite outlook for Chamoli and Uttarkashi?",
                "hazard": "Weather",
                "region": "Chamoli / Uttarkashi",
            },
            {
                "id": 4,
                "question": "Are relief camps and emergency shelters available near Basukedar?",
                "hazard": "Preparedness",
                "region": "Basukedar / Jakholi",
            },
            {
                "id": 5,
                "question": "How does the current October 2026 episode compare with the 2023 monsoon impacts?",
                "hazard": "Comparison",
                "region": "Garhwal Division",
            },
        ]
    }


@router.post("/query", response_model=Dict[str, Any])
def submit_ask_query(req: AskQueryRequest) -> Dict[str, Any]:
    """
    Execute evidence-grounded Q&A returning structured response categorized into:
    Fact (green), Inference (orange), and Prediction (purple) sections with inline citations [1]–[6].
    """
    q = req.query.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Query string cannot be empty.")

    # Tailor response based on query semantics (landslide, flood, shelter, comparison, general)
    q_lower = q.lower()

    if "cwc" in q_lower or "danger" in q_lower or "station" in q_lower or "water" in q_lower:
        facts = [
            "Central Water Commission (CWC) station Basukedar (CWC_UK_Basukedar) and Rudraprayag Sangam gauge recorded water levels reaching 625.8 MASL, exceeding the High Flood Danger level of 624.0 MASL by 1.8 meters [1].",
            "Telemetry records 128.4 mm of cumulative precipitation over 6 hours in the Mandakini sub-basin [2].",
            "Downstream station Devprayag (Alaknanda confluence) is currently flowing 0.8 meters below warning stage [3].",
        ]
        inferences = [
            "Continuous tributary inflow will maintain river discharge above critical flood thresholds through midnight [4].",
            "Runoff coefficient has reached 0.88 due to saturated mountain slopes, accelerating flood wave transit to Devprayag [5].",
        ]
        predictions = [
            "Mandakini flood crest is projected to reach Tilwara within 90 minutes and Rudraprayag confluence in 3 hours [6].",
            "Low-lying riverside ghats and bridges in Agastyamuni require precautionary evacuation over the next 12 hours.",
        ]
        citations = [
            {"id": 1, "source_title": "CWC Telemetry Station Basukedar & Rudraprayag Sangam Water Level Stream", "source_type": "Sensor Data", "reliability": "Verified", "url": "https://cwc.gov.in/stations/CWC_UK_Basukedar"},
            {"id": 2, "source_title": "CWC Hydrological Automated Telemetry Gauge Bulletin", "source_type": "Sensor Data", "reliability": "Verified", "url": "https://cwc.gov.in/telemetry/uk"},
            {"id": 3, "source_title": "Alaknanda River Basin Control Telemetry Dispatch", "source_type": "Official Report", "reliability": "Verified", "url": "https://cwc.gov.in/alaknanda/devprayag"},
            {"id": 4, "source_title": "State Emergency Operation Centre (SEOC) Flood Advisory #14", "source_type": "Official Report", "reliability": "Official", "url": "https://usdma.uk.gov.in/advisories"},
            {"id": 5, "source_title": "Disaster Intel Hydrological Routing Model (Model ID: ML-HYDRO-2026)", "source_type": "AI Model", "reliability": "Inferred", "url": "#model-ml-hydro"},
            {"id": 6, "source_title": "CWC Hydrodynamic Inundation Forecast Model", "source_type": "Forecast", "reliability": "Predicted", "url": "https://cwc.gov.in/forecast"},
        ]
        key_impacts = [
            {"metric": "River Elevation", "value": "625.8 MASL", "status": "Critical (+1.8m)"},
            {"metric": "Discharge Rate", "value": "1,420 m³/s", "status": "High Alert"},
            {"metric": "Ghats Submerged", "value": "12 Ghats", "status": "Inundated"},
            {"metric": "Downstream Lead Time", "value": "90–180 Mins", "status": "Evacuation Underway"},
        ]
    elif "shelter" in q_lower or "camp" in q_lower or "relief" in q_lower:
        facts = [
            "Basukedar Community Relief Centre (sh-001) is operational at 1.8 km distance, with 84 out of 250 capacity occupied [1].",
            "Tilwara Inter College Transit Camp (sh-002) is hosting 320 pilgrims with 80 slots remaining [2].",
            "Mobile water purification units (RO + UV) are operational providing 4,000 L/hr drinking water at Basukedar [3].",
        ]
        inferences = [
            "Available shelter capacity across Rudraprayag district (890 remaining beds) is sufficient for expected evacuees [4].",
            "Transit camps along the Kund-Tilwara sector may experience capacity constraints if NH-107 closure extends past 48 hours [5].",
        ]
        predictions = [
            "Additional community halls in Agastyamuni Sports Complex (capacity 600) are being mobilized for activation by 21:00 IST [6].",
        ]
        citations = [
            {"id": 1, "source_title": "District Emergency Ops Centre Rudraprayag Shelter Roster", "source_type": "Official Report", "reliability": "Verified", "url": "https://rudraprayag.nic.in/shelters"},
            {"id": 2, "source_title": "Tilwara Inter College Transit Camp Administration Log", "source_type": "Field SITREP", "reliability": "Verified", "url": "https://usdma.uk.gov.in/camps"},
            {"id": 3, "source_title": "SDRF Water & Logistics Dispatch Inventory", "source_type": "Official Report", "reliability": "Verified", "url": "https://sdrf.uk.gov.in/logistics"},
            {"id": 4, "source_title": "USDMA Humanitarian Relief Capacity Assessment", "source_type": "AI Inferred", "reliability": "Inferred", "url": "#capacity-assessment"},
            {"id": 5, "source_title": "SEOC Pilgrim Traffic Diversion Modeling", "source_type": "Official Report", "reliability": "Inferred", "url": "https://usdma.uk.gov.in/traffic"},
            {"id": 6, "source_title": "District Magistrate Rudraprayag Contingency Order", "source_type": "Official Order", "reliability": "Predicted", "url": "https://rudraprayag.nic.in/orders"},
        ]
        key_impacts = [
            {"metric": "Active Shelters", "value": "48 Camps", "status": "Operational"},
            {"metric": "Remaining Capacity", "value": "890 Beds", "status": "Available"},
            {"metric": "Meal Packs Dispatched", "value": "2,500 Kits", "status": "Delivered"},
            {"metric": "Medical Stations", "value": "6 Units", "status": "24x7 Staffed"},
        ]
    else:
        # Default: Basukedar NH-107 Landslide matching image5.png
        facts = [
            "On October 24, 2026 at 16:30 IST, a major debris avalanche occurred at Basukedar along the NH-107 (Kedarnath Highway) in Rudraprayag district [1].",
            "The Central Water Commission Basukedar station (CWC_UK_Basukedar) recorded 128.4 mm of precipitation over 6 hours preceding the slope failure [2].",
            "State Disaster Response Force (SDRF) confirmed 340 meters of highway carriageway is entirely blocked with debris volume estimated at 18,500 m³ [3].",
        ]
        inferences = [
            "EOS-04 SAR C-band backscatter decrease (-4.2 dB cross-pol ratio) indicates critical soil saturation and pore-water pressure along the shear plane [4].",
            "A temporary debris dam formed in the Basukedar tributary stream creates an acute flash flood hazard downstream if breached under ongoing runoff [5].",
        ]
        predictions = [
            "IMD radar projections and MOSDAC INSAT-3DR satellite imagery predict continued moderate-to-heavy rainfall (25–40 mm/hr) through the next 18 hours [6].",
            "Highway clearance operations by Border Roads Organisation (752 BRTF) are projected to require at least 36 to 48 hours for single-lane emergency vehicular opening.",
        ]
        citations = [
            {"id": 1, "source_title": "SDRF Incident SITREP #04 — NH-107 Basukedar Blockage", "source_type": "Official Report", "reliability": "Verified", "url": "https://sdrf.uk.gov.in/sitrep/2026/10/04"},
            {"id": 2, "source_title": "CWC Hydrological Monitoring Station Basukedar Hourly Telemetry", "source_type": "Sensor Data", "reliability": "Verified", "url": "https://cwc.gov.in/stations/CWC_UK_Basukedar"},
            {"id": 3, "source_title": "Border Roads Organisation (BRO) 752 BRTF Road Status Advisory", "source_type": "Official Report", "reliability": "Verified", "url": "https://bro.gov.in/advisories/nh107"},
            {"id": 4, "source_title": "ISRO EOS-04 SAR C-Band Microwave Soil Saturation Analysis", "source_type": "Satellite Derived", "reliability": "Inferred", "url": "https://bhuvan.nrsc.gov.in/disaster/sar/eos04"},
            {"id": 5, "source_title": "Disaster Intelligence AI Causal Cascade Model (Model ID: ML-CAS-2026-v2)", "source_type": "AI Model", "reliability": "Inferred", "url": "#model-ml-cas-2026"},
            {"id": 6, "source_title": "IMD Dehradun Doppler Weather Radar Nowcast Bulletin", "source_type": "Weather Forecast", "reliability": "Predicted", "url": "https://mausam.imd.gov.in/dehradun"},
        ]
        key_impacts = [
            {"metric": "Road Blocked", "value": "340 m", "status": "Critical"},
            {"metric": "Stranded Pilgrims/Vehicles", "value": "420 / 65", "status": "Evacuated to Shelter"},
            {"metric": "Downstream Risk", "value": "Mandakini Basin", "status": "High Alert"},
            {"metric": "Estimated Clearance", "value": "36–48 Hrs", "status": "Machinery Deployed"},
        ]

    return {
        "query": q,
        "answer": {
            "facts": facts,
            "inferences": inferences,
            "predictions": predictions,
        },
        "citations": citations,
        "key_impacts": key_impacts,
        "sources": citations,
        "context": {
            "bounds": [78.95, 30.40, 79.15, 30.55],
            "related_events": ["EV-LSD-2026-10-09-001", "EV-RAIN-2026-10-08-002", "EV-ROD-2026-10-09-004"],
            "related_district": "Rudraprayag",
            "active_shelter": "Basukedar Community Relief Camp (1.8 km)",
        },
    }
