"""
Endpoints for View 6: Reports & Evidence (image10.png).
Provides 5 KPI cards, multi-faceted reports feed with verification & language tags,
and comprehensive report detail with bilingual English/Hindi translation and source reliability checklist.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

RAW_REPORTS: List[Dict[str, Any]] = [
    {
        "id": "rep-001",
        "report_code": "REP-SEOC-2026-10-04",
        "title": "USDMA Incident SITREP #04: NH-107 Severed at Basukedar",
        "source_type": "Official Report",
        "publisher": "Uttarakhand State Emergency Operation Centre",
        "verification_status": "Verified",
        "language": "en",
        "published_at": "2026-10-24T17:00:00Z",
        "hazard": "Landslide",
        "region": "Rudraprayag",
        "has_media": True,
        "summary": "State emergency bulletin confirming 340m debris fan across NH-107. SDRF deployed.",
    },
    {
        "id": "rep-002",
        "report_code": "REP-AU-2026-10-09",
        "title": "रुद्रप्रयाग में भूस्खलन से केदारनाथ हाईवे बंद, सैकड़ों यात्री सुरक्षित स्थानों पर भेजे गए",
        "source_type": "News Article",
        "publisher": "Amar Ujala Dehradun Bureau",
        "verification_status": "Verified",
        "language": "hi",
        "published_at": "2026-10-24T16:30:00Z",
        "hazard": "Landslide",
        "region": "Rudraprayag",
        "has_media": True,
        "summary": "बसुकेदार के पास भारी मलबा आने से यातायात ठप, प्रशासन ने राहत शिविर सक्रिय किए।",
    },
    {
        "id": "rep-003",
        "report_code": "REP-BRO-2026-10-08",
        "title": "Border Roads Organisation (BRO) Road Clearance Advisory",
        "source_type": "Official Report",
        "publisher": "752 Border Roads Task Force (BRTF)",
        "verification_status": "Verified",
        "language": "en",
        "published_at": "2026-10-24T17:30:00Z",
        "hazard": "Road Blockage",
        "region": "Rudraprayag",
        "has_media": False,
        "summary": "Machinery deployed on both flanks of Basukedar slide; clearance estimated 36-48 hours.",
    },
    {
        "id": "rep-004",
        "report_code": "REP-CIT-2026-10-12",
        "title": "Geotagged Video: Rapid Mudflow Inundating Highway Drain",
        "source_type": "Social Media",
        "publisher": "Kedarnath Yatra Live Updates (X / Twitter)",
        "verification_status": "Likely True",
        "language": "en",
        "published_at": "2026-10-24T15:45:00Z",
        "hazard": "Flash Flood",
        "region": "Rudraprayag",
        "has_media": True,
        "summary": "Cell phone footage corroborated with CWC telemetry showing sudden drainage surge.",
    },
    {
        "id": "rep-005",
        "report_code": "REP-UNV-2026-10-15",
        "title": "Unconfirmed Report of Bridge Structural Cracking Near Kund",
        "source_type": "Social Media",
        "publisher": "WhatsApp Local Group Forward",
        "verification_status": "Unverified",
        "language": "en",
        "published_at": "2026-10-24T18:10:00Z",
        "hazard": "Infrastructure",
        "region": "Rudraprayag",
        "has_media": False,
        "summary": "Rumor alleging Kund suspension bridge damage; PWD engineering inspection dispatched.",
    },
]

# Canonical lookup mapping by lowercase id and lowercase report_code
REPORTS_BY_ID: Dict[str, Dict[str, Any]] = {}
for r in RAW_REPORTS:
    REPORTS_BY_ID[r["id"].lower()] = r
    REPORTS_BY_ID[r["report_code"].lower()] = r


REPORT_DETAILS: Dict[str, Dict[str, Any]] = {
    "rep-001": {
        "report_id": "rep-001",
        "report_code": "REP-SEOC-2026-10-04",
        "title_en": "USDMA Incident SITREP #04: NH-107 Severed at Basukedar Due to Massive Debris Flow",
        "title_hi": "यूएसडीएमए घटना सिटरैप #04: भारी मलबे के कारण बसुकेदार में एनएच-107 केदारनाथ हाईवे पूरी तरह बंद",
        "source_type": "Official Report",
        "publisher": "Uttarakhand State Emergency Operation Centre (USDMA)",
        "author": "Dr. V. K. Negi, In-Charge SEOC Dehradun",
        "published_at": "2026-10-24T17:00:00Z",
        "verification_status": "Verified",
        "epistemic_badge": "Official",
        "language_primary": "en",
        "content_en": (
            "Following unprecedented precipitation recorded at CWC Basukedar (128.4 mm in 6 hours), "
            "a massive debris avalanche occurred along National Highway 107 (Kedarnath Highway) at kilometer 48+200. "
            "A 340-meter section of the road is heavily obstructed by an estimated 18,500 m³ of rock, mud, and timber. "
            "SDRF Quick Response Teams from Agastyamuni and BRO 752 BRTF personnel are actively mobilized on site. "
            "420 pilgrims stranded in 65 vehicles have been successfully moved to Basukedar Community Relief Camp. "
            "No casualties have been reported. All pilgrimage traffic is halted at Tilwara and Kund."
        ),
        "content_hi": (
            "सीडब्ल्यूसी बसुकेदार स्टेशन पर दर्ज अभूतपूर्व वर्षा (6 घंटे में 128.4 मिमी) के बाद, राष्ट्रीय राजमार्ग 107 "
            "(केदारनाथ मार्ग) पर किलोमीटर 48+200 पर भीषण भूस्खलन हुआ। सड़क का 340 मीटर का हिस्सा लगभग 18,500 घन मीटर "
            "मलबे और चट्टानों से पूरी तरह अवरुद्ध हो गया है। अगस्त्यमुनि से एसडीआरएफ और बीआरओ की 752 बीआरटीएफ टीमें "
            "भारी मशीनरी के साथ मौके पर तैनात हैं। 65 वाहनों में फंसे 420 तीर्थयात्रियों को सुरक्षित रूप से बसुकेदार "
            "राहत शिविर में स्थानांतरित कर दिया गया है। किसी के हताहत होने की खबर नहीं है। सभी यातायात को तिलवाड़ा "
            "और कुंड में रोक दिया गया है।"
        ),
        "key_points_en": [
            "340 meters of Kedarnath Highway (NH-107) severed near Basukedar.",
            "Debris mass estimated at 18,500 m³; clearance duration projected at 36–48 hours.",
            "420 stranded pilgrims evacuated safely to designated community shelters; zero casualties.",
            "BRO and SDRF operating hydraulic excavators from both northern and southern flanks.",
        ],
        "key_points_hi": [
            "बसुकेदार के पास केदारनाथ हाईवे (एनएच-107) का 340 मीटर हिस्सा पूरी तरह अवरुद्ध।",
            "लगभग 18,500 घन मीटर मलबा; मार्ग सुचारू होने में 36 से 48 घंटे लगने का अनुमान।",
            "फंसे 420 तीर्थयात्रियों को सुरक्षित शिविरों में पहुंचाया गया; कोई जनहानि नहीं।",
            "बीआरओ और एसडीआरएफ की टीमें दोनों तरफ से मलबा हटाने में जुटीं।"
        ],
        "reliability_checklist": [
            {"criterion": "Official Government Agency Confirmation", "passed": True, "notes": "Issued by USDMA SEOC Control Room"},
            {"criterion": "Geotagged Coordinates & Aerial Verification", "passed": True, "notes": "Drone recon confirmed 30.4850° N, 79.0620° E"},
            {"criterion": "Multiple Corroborating Telemetry Feeds", "passed": True, "notes": "CWC Basukedar gauge & IMD AWS telemetry match"},
            {"criterion": "Temporal Consistency Check", "passed": True, "notes": "Timestamps match road closure logs within 15 minutes"},
            {"criterion": "Tamper-Free Image & Video Perceptual Hash", "passed": True, "notes": "Zero synthetic manipulation detected (pHash: a8f0...)"},
        ],
        "media_gallery": [
            {
                "url": "/static/images/reports/basukedar_obstruction_wide.jpg",
                "caption": "Wide-angle view of 340m rockfall on NH-107 approach",
                "type": "image",
            },
            {
                "url": "/static/images/reports/sdrf_relief_camp.jpg",
                "caption": "Pilgrim transit registration at Basukedar community hall",
                "type": "image",
            },
        ],
        "related_events": ["EV-LSD-2026-10-09-001", "EV-RAIN-2026-10-08-002", "EV-ROD-2026-10-09-004"],
        "coordinates": [79.062, 30.485],
    },
    "rep-002": {
        "report_id": "rep-002",
        "report_code": "REP-AU-2026-10-09",
        "title_en": "Kedarnath Highway Closed Due to Landslide in Rudraprayag, Hundreds of Pilgrims Moved to Safe Locations",
        "title_hi": "रुद्रप्रयाग में भूस्खलन से केदारनाथ हाईवे बंद, सैकड़ों यात्री सुरक्षित स्थानों पर भेजे गए",
        "source_type": "News Article",
        "publisher": "Amar Ujala Dehradun Bureau",
        "author": "S. K. Bhatt, Bureau Chief",
        "published_at": "2026-10-24T16:30:00Z",
        "verification_status": "Verified",
        "epistemic_badge": "Reported",
        "language_primary": "hi",
        "content_en": (
            "Vehicular traffic on the Rishikesh-Kedarnath National Highway (NH-107) came to a grinding halt "
            "on Friday afternoon following a massive landslide near Basukedar. Debris spread across hundreds "
            "of meters of carriageway. District administration immediately activated community relief shelters."
        ),
        "content_hi": (
            "बसुकेदार के पास शुक्रवार दोपहर भारी मलबा आने से ऋषिकेश-केदारनाथ राष्ट्रीय राजमार्ग (एनएच-107) पर "
            "यातायात पूरी तरह ठप हो गया। सैकड़ों मीटर तक सड़क पर मलबा फैल गया। जिला प्रशासन ने तुरंत बसुकेदार "
            "और तिलवाड़ा में राहत शिविर सक्रिय कर दिए हैं।"
        ),
        "key_points_en": [
            "Kedarnath Highway blocked near Basukedar due to landslide.",
            "Administration activated relief camps for stranded pilgrims.",
            "Machinery deployed for clearing debris.",
        ],
        "key_points_hi": [
            "बसुकेदार के पास भूस्खलन से केदारनाथ हाईवे पूरी तरह बंद।",
            "यात्रियों के लिए राहत शिविरों की तत्काल व्यवस्था।",
            "मलबा हटाने हेतु भारी मशीनें तैनात की गईं।"
        ],
        "reliability_checklist": [
            {"criterion": "Accredited News Bureau Reporting", "passed": True, "notes": "Amar Ujala Dehradun Desk verified"},
            {"criterion": "Field Reporter Corroboration", "passed": True, "notes": "Staff reporter present on ground"},
            {"criterion": "Administrative Cross-Check", "passed": True, "notes": "Matches SEOC advisory timing"},
        ],
        "media_gallery": [],
        "related_events": ["EV-LSD-2026-10-09-001"],
        "coordinates": [79.062, 30.485],
    },
    "rep-003": {
        "report_id": "rep-003",
        "report_code": "REP-BRO-2026-10-08",
        "title_en": "Border Roads Organisation (BRO) Road Clearance Advisory",
        "title_hi": "सीमा सड़क संगठन (बीआरओ) मार्ग निकासी परामर्श",
        "source_type": "Official Report",
        "publisher": "752 Border Roads Task Force (BRTF)",
        "author": "Officer Commanding, 752 BRTF",
        "published_at": "2026-10-24T17:30:00Z",
        "verification_status": "Verified",
        "epistemic_badge": "Official",
        "language_primary": "en",
        "content_en": (
            "Heavy machinery deployed on both northern and southern flanks of the Basukedar slide. "
            "Carriageway clearance estimated at 36-48 hours subject to weather conditions."
        ),
        "content_hi": (
            "बसुकेदार भूस्खलन स्थल के दोनों छोरों पर भारी मशीनरी तैनात की गई है। "
            "मौसम अनुकूल रहने पर 36-48 घंटों में मार्ग सुचारू होने का अनुमान है।"
        ),
        "key_points_en": [
            "Heavy earthmovers deployed from both sides.",
            "Estimated clearance window 36-48 hours.",
        ],
        "key_points_hi": [
            "दोनों तरफ से भारी मशीनरी तैनात।",
            "36-48 घंटे में मार्ग खुलने की संभावना।"
        ],
        "reliability_checklist": [
            {"criterion": "Defense Agency Official Advisory", "passed": True, "notes": "Issued directly by BRO Project Shivalik"},
        ],
        "media_gallery": [],
        "related_events": ["EV-ROD-2026-10-09-004"],
        "coordinates": [79.062, 30.485],
    },
    "rep-004": {
        "report_id": "rep-004",
        "report_code": "REP-CIT-2026-10-12",
        "title_en": "Geotagged Video: Rapid Mudflow Inundating Highway Drain",
        "title_hi": "भू-चिह्नित वीडियो: राजमार्ग नाले में अचानक आया मलबायुक्त जलप्रवाह",
        "source_type": "Social Media",
        "publisher": "Kedarnath Yatra Live Updates (X / Twitter)",
        "author": "Verified Citizen Dispatch",
        "published_at": "2026-10-24T15:45:00Z",
        "verification_status": "Likely True",
        "epistemic_badge": "Reported",
        "language_primary": "en",
        "content_en": (
            "Cell phone footage corroborated with CWC telemetry showing sudden drainage surge and muddy runoff "
            "crossing NH-107 near Basukedar prior to main slope collapse."
        ),
        "content_hi": (
            "सीडब्ल्यूसी टेलीमेट्री के साथ सत्यापित वीडियो जिसमें मुख्य भूस्खलन से पूर्व नाले में तेज मलबे का बहाव दिख रहा है।"
        ),
        "key_points_en": [
            "Early warning footage captured 45 minutes prior to collapse.",
            "Corroborated by upstream rain gauge surge.",
        ],
        "key_points_hi": [
            "भूस्खलन से 45 मिनट पूर्व का दृश्य।",
            "वर्षामापी आंकड़ों से पुष्टि।"
        ],
        "reliability_checklist": [
            {"criterion": "Metadata & Geotag Verification", "passed": True, "notes": "EXIF GPS matches NH-107 KM 48"},
        ],
        "media_gallery": [],
        "related_events": ["EV-RAIN-2026-10-08-002"],
        "coordinates": [79.058, 30.478],
    },
    "rep-005": {
        "report_id": "rep-005",
        "report_code": "REP-UNV-2026-10-15",
        "title_en": "Unconfirmed Report of Bridge Structural Cracking Near Kund",
        "title_hi": "कुंड के पास पुल में दरार की अपुष्ट सूचना",
        "source_type": "Social Media",
        "publisher": "WhatsApp Local Group Forward",
        "author": "Anonymous Citizen Post",
        "published_at": "2026-10-24T18:10:00Z",
        "verification_status": "Unverified",
        "epistemic_badge": "Reported",
        "language_primary": "en",
        "content_en": (
            "Rumor alleging Kund suspension bridge damage circulating on social media; PWD engineering "
            "inspection team dispatched to verify structural integrity."
        ),
        "content_hi": (
            "सोशल मीडिया पर कुंड सस्पेंशन ब्रिज में दरार की अफवाह; लोक निर्माण विभाग की टीम जांच के लिए रवाना।"
        ),
        "key_points_en": [
            "Unconfirmed citizen rumor under official inspection.",
            "PWD bridge team dispatched.",
        ],
        "key_points_hi": [
            "अपुष्ट सूचना, जांच जारी।",
            "पीडब्ल्यूडी टीम मौके पर भेजी गई।"
        ],
        "reliability_checklist": [
            {"criterion": "Source Identification", "passed": False, "notes": "Anonymous WhatsApp forward without verification"},
        ],
        "media_gallery": [],
        "related_events": ["EV-ROD-2026-10-09-004"],
        "coordinates": [79.082, 30.512],
    },
}


@router.get("", response_model=Dict[str, Any])
def list_reports(
    source_type: Optional[str] = None,
    verification: Optional[str] = None,
    hazard: Optional[str] = None,
    region: Optional[str] = None,
    language: Optional[str] = None,
    search: Optional[str] = None,
) -> Dict[str, Any]:
    """Return 5 KPI cards and filterable list of reports with verification badges and language tags."""
    kpis = {
        "total_reports": 86,
        "official_reports": 24,
        "news_articles": 38,
        "social_media_posts": 16,
        "multimedia": 8,
    }

    filtered = []
    for r in RAW_REPORTS:
        if source_type and source_type.lower() not in r["source_type"].lower():
            continue
        if verification and verification.lower() != r["verification_status"].lower():
            continue
        if hazard and hazard.lower() not in r["hazard"].lower():
            continue
        if region and region.lower() not in r["region"].lower():
            continue
        if language and language.lower() != r["language"].lower():
            continue
        if search:
            q = search.lower()
            if q not in r["title"].lower() and q not in r["summary"].lower():
                continue
        filtered.append(r)

    return {
        "kpis": kpis,
        "total": len(filtered),
        "reports": filtered,
    }


@router.get("/{id}", response_model=Dict[str, Any])
def get_report_detail(id: str) -> Dict[str, Any]:
    """
    Return report detail panel with dual-language toggle (English + Hindi),
    key points, photo gallery, and source reliability checklist matching image10.png.
    """
    clean_id = id.strip().lower()
    report = REPORTS_BY_ID.get(clean_id)

    if not report:
        raise HTTPException(status_code=404, detail=f"Report '{id}' not found")

    detail = REPORT_DETAILS.get(report["id"])
    if not detail:
        # Fallback to structured detail based on report record
        return {
            "report_id": report["id"],
            "report_code": report["report_code"],
            "title_en": report["title"],
            "title_hi": report["title"],
            "source_type": report["source_type"],
            "publisher": report["publisher"],
            "author": report["publisher"],
            "published_at": report["published_at"],
            "verification_status": report["verification_status"],
            "epistemic_badge": "Official" if report["source_type"] == "Official Report" else "Reported",
            "language_primary": report["language"],
            "content_en": report["summary"],
            "content_hi": report["summary"],
            "key_points_en": [report["summary"]],
            "key_points_hi": [report["summary"]],
            "reliability_checklist": [
                {"criterion": "Source Consistency", "passed": True, "notes": f"Published by {report['publisher']}"}
            ],
            "media_gallery": [],
            "related_events": ["EV-LSD-2026-10-09-001"],
            "coordinates": [79.062, 30.485],
        }

    return detail

