// Disaster Intelligence Platform — Screen MEI-01: Unified Disaster Event Intelligence & Multimodal Analysis Dossier
// Implements SRS v3.0 Step 1–6: 6-Role Decision & Governance Matrix, Cross-Dashboard Handshake (HM-01 / SMI-01 -> MEI-01),
// 5-Stream Multimodal Fusion Matrix, Multi-Layer Leaflet Geospatial Explorer, Knowledge Graph,
// Multi-Stream Chronological Timeline, AI Cascade Risk Forecast, and Exportable JSON/Markdown SitRep Modal.

(function() {
  const React = window.React;
  const { useState, useEffect, useRef, useMemo } = React;
  const { SeverityBadge, StatusBadge, EpistemicBadge } = window.DisasterComponents || window;

  // Safe polymorphic text normalizer so nested objects (e.g. ev.hazard, ev.location) never crash React
  const asText = (val, fallback = "") => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === "string") return val;
    if (typeof val === "number" || typeof val === "boolean") return String(val);
    if (Array.isArray(val)) {
      return val.map(item => asText(item, "")).filter(Boolean).join(", ") || fallback;
    }
    if (typeof val === "object") {
      return (
        val.name ||
        val.title ||
        val.label ||
        val.code ||
        val.hazard_name ||
        val.district_name ||
        val.summary ||
        val.id ||
        fallback
      );
    }
    return fallback;
  };

  // Standardized SRS Section 6.6 Data Lineage Badge component
  const LineageBadge = ({ type = "OFFICIAL-GROUND-TRUTH", className = "" }) => {
    const clean = String(type).replace(/^\[|\]$/g, "").toUpperCase();
    const styles = {
      "LIVE-SENSOR": "bg-emerald-50 text-emerald-800 border-emerald-500",
      "LIVE": "bg-emerald-50 text-emerald-800 border-emerald-500",
      "OFFICIAL-GROUND-TRUTH": "bg-blue-50 text-blue-800 border-blue-500",
      "OFFICIAL-SYNTHESIS": "bg-blue-50 text-blue-800 border-blue-500",
      "VERIFIED-RECORD": "bg-blue-50 text-blue-800 border-blue-500",
      "REMOTE-SENSED": "bg-purple-50 text-purple-800 border-purple-500",
      "HISTORICAL-ISRO": "bg-purple-50 text-purple-800 border-purple-500",
      "AI-SYNTHESIS": "bg-amber-50 text-amber-800 border-amber-500",
      "AI-ESTIMATED": "bg-amber-50 text-amber-800 border-amber-500",
      "AI-PREDICTED": "bg-amber-50 text-amber-800 border-amber-500",
      "FORECAST": "bg-amber-50 text-amber-800 border-amber-500",
      "HISTORICAL-ARCHIVE": "bg-slate-100 text-slate-700 border-slate-400",
      "HISTORICAL": "bg-slate-100 text-slate-700 border-slate-400",
      "SIMULATED": "bg-indigo-50 text-indigo-800 border-indigo-400",
      "UNVERIFIED-CITIZEN": "bg-red-50 text-red-800 border-red-500"
    };
    const toneClass = styles[clean] || styles["OFFICIAL-GROUND-TRUTH"];
    return (
      <span
        className={`inline-flex items-center px-1.5 py-px rounded-full border text-[9px] font-mono font-semibold tracking-tight whitespace-nowrap ${toneClass} ${className}`}
      >
        {clean}
      </span>
    );
  };

  // Normalize any role identifier (short key or full SRS label) to canonical 6-role IDs
  const normalizeRoleId = (rawRole) => {
    const val = String(rawRole || "").trim().toLowerCase();
    if (val === "authority" || val.includes("authorit") || val.includes("executive")) return "authority";
    if (val === "analyst" || val.includes("analyst") || val.includes("hazard")) return "analyst";
    if (val === "response" || val.includes("response") || val.includes("sdrf")) return "response";
    if (val === "researcher" || val.includes("research")) return "researcher";
    if (val === "data-admin" || val.includes("admin") || val.includes("pipeline")) return "data-admin";
    if (val === "citizen" || val.includes("citizen") || val.includes("public")) return "citizen";
    return "authority";
  };

  // Step 1 of SRS: 6 User Categories & Decision Governance Definitions (All signed by Ashutosh Kanojia · AK)
  const ROLE_MATRIX = [
    {
      id: "authority",
      displayTitle: "Disaster Management Authorities",
      shortLabel: "Authorities (SEOC / DM)",
      officerName: "Ashutosh Kanojia",
      initials: "AK",
      roleTitle: "SEOC State Relief Commissioner & Executive Magistrate",
      authorityLevel: "LEVEL 5 · EXECUTIVE COMMAND",
      clearanceBadge: "FULL COMMAND SIGN-OFF & CAP BROADCAST",
      persona: "SEOC Director, State Relief Commissioner, District Magistrates",
      sla: "Immediate (Real-time, under 5 minutes)",
      slaTone: "crit",
      permission: "Executive / Admin — Full read/write, broadcast alert authorization, SITREP release sign-off",
      primaryFocusModality: "sitrep",
      streamAccess: {
        hydrology: "FULL COMMAND",
        satellite: "FULL COMMAND",
        social: "FULL COMMAND",
        sitrep: "EXECUTIVE SIGN-OFF",
        infrastructure: "FULL COMMAND"
      },
      decisions: [
        {
          id: "ACT-AUTH-01",
          label: "Authorize Red Alert & Tehsil Evacuation Order",
          target: "Ukhimath, Sonprayag & Low-Lying Mandakini Hamlets (420+ residents)",
          lineage: "OFFICIAL-GROUND-TRUTH",
          impact: "Broadcasts CAP alert via SEOC sirens, SMS gateway & DDMA control rooms"
        },
        {
          id: "ACT-AUTH-02",
          label: "Sign Off SDRF / NDRF Battalion Mobilization",
          target: "2 SDRF Flood Rescue Companies + 1 NDRF Air-Lifted Team to Rudraprayag",
          lineage: "OFFICIAL-GROUND-TRUTH",
          impact: "Deploys 68 rescue personnel with inflatable motorboats & satellite comms"
        },
        {
          id: "ACT-AUTH-03",
          label: "Request IAF Mi-17 Air-Recon & Relief Airdrop Sortie",
          target: "Cut-off Upper Valley Gram Panchayats above KM-24 Blockage",
          lineage: "AI-SYNTHESIS",
          impact: "Stages 1,500 emergency ration & medical trauma kits at Jolly Grant Airbase"
        }
      ]
    },
    {
      id: "analyst",
      displayTitle: "Hazard Analysts",
      shortLabel: "Hazard Analysts (IMD/CWC/GSI)",
      officerName: "Ashutosh Kanojia",
      initials: "AK",
      roleTitle: "Lead Hydro-Met & SAR Scientist (IMD/CWC/GSI)",
      authorityLevel: "LEVEL 4 · SCIENTIFIC CALIBRATION",
      clearanceBadge: "SAR COHERENCE WEIGHTS & SENSOR CALIBRATION",
      persona: "Meteorologists, Hydrologists, Geologists from IMD, CWC & GSI",
      sla: "High (Hourly to 6-hour cycles)",
      slaTone: "warn",
      permission: "Analyst Read/Write — Raw telemetry access, sensor calibration, AI threshold tuning",
      primaryFocusModality: "hydrology",
      streamAccess: {
        hydrology: "CALIBRATION WRITE",
        satellite: "SAR WEIGHTS WRITE",
        social: "CORROBORATION READ",
        sitrep: "READ-ONLY",
        infrastructure: "READ-ONLY"
      },
      decisions: [
        {
          id: "ACT-ANA-01",
          label: "Validate Extreme Rainfall Threshold Breach (above 64.5 mm/hr)",
          target: "Station UK-RUD-04 (82.4 mm/hr observed vs 64.5 mm/hr cloudburst trigger)",
          lineage: "LIVE-SENSOR",
          impact: "Locks meteorological trigger timestamp T-0 in canonical event dossier"
        },
        {
          id: "ACT-ANA-02",
          label: "Verify EOS-04 SAR Coherence Loss for Slope Reactivation",
          target: "NH-58 / NH-107 Banswara Cut-Slope Scarp (InSAR Δγ = -0.41)",
          lineage: "REMOTE-SENSED",
          impact: "Updates GSI Factor-of-Safety contour to 0.89 (Critical Shear Risk)"
        },
        {
          id: "ACT-ANA-03",
          label: "Calibrate Catchment Runoff & 24h Flood Peak Model",
          target: "Mandakini-Alaknanda Confluence Hydrodynamic Ensemble",
          lineage: "FORECAST",
          impact: "Refines Srinagar Dam inflow surge arrival window (+0.95m above Danger Mark)"
        }
      ]
    },
    {
      id: "response",
      displayTitle: "Emergency Response Teams",
      shortLabel: "Response Teams (SDRF/BRO)",
      officerName: "Ashutosh Kanojia",
      initials: "AK",
      roleTitle: "State Response Officer & SDRF Field Commander",
      authorityLevel: "LEVEL 4 · TACTICAL DISPATCH",
      clearanceBadge: "FIELD DISPATCH, CORRIDOR & SHELTER OPS",
      persona: "SDRF Commanders, BRO Project Shivalik Engineers, Police EOC, Fire & Rescue",
      sla: "Critical (Real-time, under 15 minutes)",
      slaTone: "crit",
      permission: "Field Operator / Response — Spatial maps, live incident triage, resource status updates",
      primaryFocusModality: "infrastructure",
      streamAccess: {
        hydrology: "READ-ONLY",
        satellite: "READ-ONLY",
        social: "SOS TRIAGE WRITE",
        sitrep: "FIELD RECON WRITE",
        infrastructure: "DISPATCH WRITE"
      },
      decisions: [
        {
          id: "ACT-RES-01",
          label: "Dispatch BRO Heavy Excavators & Rock Breakers to Highway Block",
          target: "NH-107 KM-24 Banswara & NH-58 Byasi (140m Boulder Debris Span)",
          lineage: "OFFICIAL-GROUND-TRUTH",
          impact: "Assigns 6 JCB/Hitachi excavators for 8–12h single-lane emergency clearance"
        },
        {
          id: "ACT-RES-02",
          label: "Deploy SDRF Rope-Rescue & Medical Triage Unit to SOS Cluster",
          target: "Corroborated Citizen SOS Cluster (185 Stranded Pilgrims / 42 Vehicles)",
          lineage: "AI-ESTIMATED",
          impact: "Establishes safe green corridor to GMVN Syalsaur & GIC Augustmuni shelters"
        },
        {
          id: "ACT-RES-03",
          label: "Enforce Police Checkpost Traffic Halt & Alternate Route Diversion",
          target: "Sonprayag, Kund & Devprayag Sangam Checkpoints",
          lineage: "LIVE-SENSOR",
          impact: "Diverts civilian convoy via Chamba-Tehri-Srinagar bypass corridor"
        }
      ]
    },
    {
      id: "researcher",
      displayTitle: "Researchers",
      shortLabel: "Researchers (AI / Climate)",
      officerName: "Ashutosh Kanojia",
      initials: "AK",
      roleTitle: "Principal Multimodal AI & Climate Researcher",
      authorityLevel: "LEVEL 3 · RESEARCH SANDBOX",
      clearanceBadge: "READ-ONLY & MULTIMODAL TENSOR EXPORT",
      persona: "Disaster Resiliency Scientists, AI/ML Evaluators, Academic Institutions",
      sla: "Low / Deliberate (Post-disaster, Weekly/Batch)",
      slaTone: "info",
      permission: "Research Read & Export — Historical archives, benchmark metrics, dataset export",
      primaryFocusModality: "satellite",
      streamAccess: {
        hydrology: "READ & EXPORT",
        satellite: "SAR TENSOR EXPORT",
        social: "ANONYMIZED READ",
        sitrep: "READ-ONLY",
        infrastructure: "READ-ONLY"
      },
      decisions: [
        {
          id: "ACT-RSH-01",
          label: "Benchmark Multimodal Fusion Model vs. Field Ground Truth",
          target: "5-Stream Cross-Modal Alignment (F1 = 0.942, Lead Time +75 mins)",
          lineage: "AI-SYNTHESIS",
          impact: "Logs precision/recall audit against USDMA post-incident verification"
        },
        {
          id: "ACT-RSH-02",
          label: "Compare 10-Year Decadal Monsoon Return Period Anomaly",
          target: "Mandakini Basin 2016–2026 Extreme Precipitation Distribution",
          lineage: "HISTORICAL-ARCHIVE",
          impact: "Identifies +34% intensification in sub-3-hour convective cloudburst cells"
        },
        {
          id: "ACT-RSH-03",
          label: "Export Clean Multimodal Feature Tensor & GeoJSON Package",
          target: "Aligned AWS + CWC + EOS-04 SAR + Verified Hindi NLP Corpus",
          lineage: "OFFICIAL-GROUND-TRUTH",
          impact: "Generates reproducible training snapshot with full provenance metadata"
        }
      ]
    },
    {
      id: "data-admin",
      displayTitle: "Data Administrators",
      shortLabel: "Data Admins (IoT / MLOps)",
      officerName: "Ashutosh Kanojia",
      initials: "AK",
      roleTitle: "SEOC Telemetry Pipeline & Infrastructure Lead",
      authorityLevel: "LEVEL 5 · SYSTEM & PIPELINE ADMIN",
      clearanceBadge: "INGESTION BROKER, SAR PIPELINE & BOT QUARANTINE",
      persona: "System Engineers, IoT Telemetry Operations, IT Infrastructure Leads",
      sla: "Medium / Continuous (24/7 Operations Monitoring)",
      slaTone: "warn",
      permission: "System Administrator — Full pipeline control, API keys, broker config, audit logs",
      primaryFocusModality: "hydrology",
      streamAccess: {
        hydrology: "PIPELINE ADMIN",
        satellite: "INGESTION ADMIN",
        social: "BOT QUARANTINE",
        sitrep: "AUDIT LOG READ",
        infrastructure: "SYNC ADMIN"
      },
      decisions: [
        {
          id: "ACT-ADM-01",
          label: "Verify Telemetry Ingestion Health & Station Drop-Offs",
          target: "142/146 Active IMD/CWC Gauges (97.3% Uptime • 180ms API Latency)",
          lineage: "LIVE-SENSOR",
          impact: "Switches 2VSAT-degraded mountain stations to GSM fallback relay"
        },
        {
          id: "ACT-ADM-02",
          label: "Quarantine Unverified / Synthetic Rumor Streams",
          target: "Social Media NLP Ingestion Queue (3 Viral Recycled Videos Flagged)",
          lineage: "UNVERIFIED-CITIZEN",
          impact: "Blocks low-credibility posts (score below 40%) from triggering false EOC alerts"
        },
        {
          id: "ACT-ADM-03",
          label: "Audit Relational Store & Multimodal Inference Queue Latency",
          target: "FastAPI Event Fusion Worker & Spatial Index Cache",
          lineage: "SIMULATED",
          impact: "Confirms zero deadlocks and sub-second GeoJSON serialization across 5 streams"
        }
      ]
    },
    {
      id: "citizen",
      displayTitle: "Common Citizens",
      shortLabel: "Common Citizens (Public)",
      officerName: "Ashutosh Kanojia",
      initials: "AK",
      roleTitle: "Citizen / Char Dham Traveller (Public Portal)",
      authorityLevel: "LEVEL 1 · PUBLIC CITIZEN ACCESS",
      clearanceBadge: "PUBLIC SUMMARY, SAFE CORRIDORS & SHELTER LOCATOR",
      persona: "Residents, Char Dham Pilgrims, Tourists, Community Volunteers (Apda Mitra)",
      sla: "High / Safety-Critical (On-demand / Push Alerts)",
      slaTone: "ok",
      permission: "Public Portal (Read-Only) — Sanitized public advisories, open routes, shelter locator",
      primaryFocusModality: "social",
      streamAccess: {
        hydrology: "PUBLIC SUMMARY",
        satellite: "LOCKED (RAW SAR WEIGHTS)",
        social: "VERIFIED ADVISORIES",
        sitrep: "LOCKED (COMMAND SIGN-OFF)",
        infrastructure: "SAFE ROUTES & SHELTERS"
      },
      decisions: [
        {
          id: "ACT-CIT-01",
          label: "Check Verified Highway Accessibility & Safe Detours",
          target: "NH-107 Blocked at Banswara • Use Chamba–Tehri–Srinagar Alternate Route",
          lineage: "OFFICIAL-GROUND-TRUTH",
          impact: "Prevents travellers from entering active rockfall zones during Red Alert"
        },
        {
          id: "ACT-CIT-02",
          label: "Locate Nearest Operational Relief Camp & Medical Center",
          target: "GMVN Syalsaur, GIC Augustmuni & Community Hall Kund (Food, Water, Power)",
          lineage: "OFFICIAL-GROUND-TRUTH",
          impact: "Provides turn-by-turn safe distance and bed capacity (780 beds available)"
        },
        {
          id: "ACT-CIT-03",
          label: "Access Official Emergency Helplines & Debunked Rumor Notice",
          target: "SEOC Toll-Free 1070 / District EOC 1077 • Ignore Fake Dam-Breach Audio",
          lineage: "OFFICIAL-GROUND-TRUTH",
          impact: "Delivers bilingual Hindi/English verified safety instructions"
        }
      ]
    }
  ];

  // Canonical Multimodal Uttarakhand Disaster Dossiers (supports HM-01 & SMI-01 handshakes + live API merge)
  const CANONICAL_DOSSIERS = [
    {
      id: "EV-2026-0814-FLD",
      code: "EV-2026-0814-FLD",
      title: "Mandakini Catchment Cloudburst & Flash Flood Surge",
      hazard: "Flash Flood / Cloudburst",
      severity: "Critical",
      status: "Active",
      epistemic: "OBSERVED GROUND TRUTH",
      confidence: 0.96,
      catchment: "Mandakini Basin (Rudraprayag – Sonprayag – Gaurikund)",
      district: "Rudraprayag, Uttarakhand",
      timestamp: "2026-08-14 14:30 IST",
      coordinates: [30.2849, 78.9867],
      zoom: 10,
      elevation: "1,380 m MSL",
      affectedArea: "38.5 sq km",
      triggerSensorId: "UK-RUD-04",
      triggerPostId: "SOS-RUD-104",
      lineageBadges: ["OFFICIAL-GROUND-TRUTH", "LIVE-SENSOR", "REMOTE-SENSED", "AI-SYNTHESIS", "FORECAST"],
      executiveSummary:
        "Extreme convective cloudburst recorded at IMD AWS UK-RUD-04 (82.4 mm/hr peak; 134.0 mm in 3h) triggered rapid Mandakini river surge (+0.95m above Danger Mark at Sonprayag/Rudraprayag) and toe-slope instability along NH-107. ISRO EOS-04 C-Band SAR confirms 38.5 sq km valley inundation and soil saturation exceeding 94.2%. 420 riverbank residents evacuated across 3 active relief camps.",
      streams: {
        hydrology: {
          title: "1. Environmental Sensors (IMD / CWC / GSI)",
          badge: "LIVE-SENSOR",
          status: "CRITICAL BREACH",
          tone: "crit",
          confidence: "98%",
          primaryMetric: "82.4 mm/hr Peak Rain • 628.45m River Stage (+0.95m Danger)",
          stationId: "UK-RUD-04 / CWC-SON-01",
          updatedAt: "14:30 IST (Live 60s Poll)",
          highlights: [
            "IMD AWS UK-RUD-04 (Ukhimath/Basukedar): 82.4 mm/hr (+27.8% above cloudburst threshold)",
            "CWC Sonprayag & Rudraprayag Gauge: 628.45 m MSL (+0.95 m above Danger Level 627.50 m)",
            "Discharge Velocity: 1,480 cumecs (rising +0.35 m/hr) • GSI Pore-Water Index: 0.94 (Critical)"
          ]
        },
        satellite: {
          title: "2. Satellite Remote Sensing (ISRO EOS-04 SAR & Sentinel-2)",
          badge: "REMOTE-SENSED",
          status: "SWATH ACQUIRED",
          tone: "warn",
          confidence: "95%",
          primaryMetric: "38.5 sq km Flood Mask • InSAR Δγ = -0.41 Slope Scarp",
          stationId: "EOS04-C-SAR-20260814-0750Z",
          updatedAt: "13:50 IST Pass",
          highlights: [
            "ISRO Bhoonidhi EOS-04 C-Band SAR (HH/HV Dual-Pol, 8m resolution): Penetrated dense monsoon cloud cover",
            "Flooded Riparian Buffer: 4.8 km river stretch widened by 35–60m across Syalsaur & Chandrapuri",
            "Sentinel-2 MSI Pre/Post NDWI Delta: +0.52 moisture surge across 5 Gram Panchayats"
          ]
        },
        social: {
          title: "3. Social & Citizen Intelligence (Verified SOS Clusters)",
          badge: "AI-ESTIMATED",
          secondaryBadge: "UNVERIFIED-CITIZEN",
          status: "3 SOS CLUSTERS",
          tone: "crit",
          confidence: "94%",
          primaryMetric: "42 Verified SOS Posts • 3 Rumors Quarantined",
          stationId: "CLUSTER-RUD-NH107",
          updatedAt: "14:28 IST Stream",
          highlights: [
            "Hindi/Garhwali NLP Triage: 'सोनप्रयाग और बांसवाड़ा में मंदाकिनी नदी खतरे के निशान से ऊपर, यात्री फंसे'",
            "pHash & EXIF Geolocation Verification: 94% corroboration across 14 independent citizen videos",
            "Misinformation Quarantine: Debunked recycled 2021 video claiming Srinagar Dam gate collapse"
          ]
        },
        sitrep: {
          title: "4. Official SITREPs & Drone Recon (USDMA / SDRF UAV)",
          badge: "OFFICIAL-GROUND-TRUTH",
          status: "SITREP #4 VERIFIED",
          tone: "ok",
          confidence: "99%",
          primaryMetric: "USDMA Bulletin #4 • 6 SDRF 4K UAV Ortho Frames",
          stationId: "USDMA-SEOC-SITREP-04",
          updatedAt: "14:25 IST Signed",
          highlights: [
            "USDMA State EOC Bulletin #4 confirms zero fatalities and 420 preventive riverbank evacuations",
            "SDRF UAV Recon (Frame UAV-MANDAKINI-04 at 80m AGL): Confirms free river channel without artificial damming",
            "BRO Project Shivalik Field Report: 6 excavators staged at Banswara & Kund checkposts"
          ]
        },
        infrastructure: {
          title: "5. Infrastructure & Human Impacts (Roads / Shelters / Grid)",
          badge: "OFFICIAL-GROUND-TRUTH",
          status: "CORRIDOR IMPACTED",
          tone: "warn",
          confidence: "97%",
          primaryMetric: "3,500 Exposed • 420 Evacuated • NH-107 KM-24 Halted",
          stationId: "INFRA-LGD-058",
          updatedAt: "14:32 IST Sync",
          highlights: [
            "Transport: NH-107 obstructed at KM-24 Banswara (140m toe-erosion & boulder fan); 2 suspension bridges closed",
            "Relief Shelters: GMVN Syalsaur (180/250), GIC Augustmuni (150/300), Kund Hall (90/200) — 100% stocked",
            "Lifelines: UPCL 11kV feeder on DG backup in 5 villages; District Hospital Rudraprayag 100% operational"
          ]
        }
      },
      mapLayers: {
        epicenter: { lat: 30.2849, lon: 78.9867, radiusKm: 6.5, label: "Mandakini Cloudburst & Surge Core (EV-2026-0814-FLD)" },
        sarPolygon: [
          [30.36, 78.92],
          [30.39, 79.06],
          [30.24, 79.09],
          [30.20, 78.94]
        ],
        sensors: [
          { id: "UK-RUD-04", name: "IMD AWS Ukhimath / Basukedar", lat: 30.331, lon: 79.025, reading: "82.4 mm/hr (Extreme)", status: "Danger Breach", color: "#B42318" },
          { id: "CWC-SON-01", name: "CWC River Gauge Sonprayag", lat: 30.308, lon: 78.998, reading: "628.45 m (+0.95m Danger)", status: "Danger Breach", color: "#B42318" },
          { id: "CWC-RUD-02", name: "CWC Sangam Gauge Rudraprayag", lat: 30.284, lon: 78.981, reading: "619.20 m (+0.40m Watch)", status: "Warning Watch", color: "#D97706" }
        ],
        sosClusters: [
          { id: "SOS-RUD-104", name: "Banswara Pilgrim Transit SOS (28 Posts)", lat: 30.312, lon: 79.012, verified: "94% Corroborated", count: 28 },
          { id: "SOS-RUD-108", name: "Syalsaur Riverbank Water Ingress (14 Posts)", lat: 30.295, lon: 78.992, verified: "91% Corroborated", count: 14 }
        ],
        sheltersAndBlocks: [
          { id: "BLK-NH107-24", kind: "roadblock", name: "NH-107 KM-24 Banswara Slope & Toe Blockage", lat: 30.316, lon: 79.015, detail: "6 BRO Excavators Active • Est. 8h Clearance" },
          { id: "SHL-GMVN-01", kind: "shelter", name: "GMVN Syalsaur Relief Camp", lat: 30.291, lon: 78.989, detail: "180 / 250 Occupants • Medical Team On-Site" },
          { id: "SHL-GIC-02", kind: "shelter", name: "GIC Augustmuni Relief Shelter", lat: 30.302, lon: 79.005, detail: "150 / 300 Occupants • 1,200 Meal Packets" }
        ]
      }
    },
    {
      id: "EV-2026-0814-LSD",
      code: "EV-2026-0814-LSD",
      title: "NH-58 Devprayag–Byasi Landslide & Corridor Entrapment",
      hazard: "Landslide / Slope Failure",
      severity: "Critical",
      status: "Active",
      epistemic: "OBSERVED GROUND TRUTH",
      confidence: 0.94,
      catchment: "Alaknanda–Bhagirathi Confluence Corridor (Devprayag – Byasi)",
      district: "Tehri / Pauri Garhwal, Uttarakhand",
      timestamp: "2026-08-14 15:10 IST",
      coordinates: [30.146, 78.598],
      zoom: 10,
      elevation: "895 m MSL",
      affectedArea: "18.2 sq km",
      triggerSensorId: "GSI-DEV-02",
      triggerPostId: "SOS-BYA-201",
      lineageBadges: ["OFFICIAL-GROUND-TRUTH", "REMOTE-SENSED", "AI-ESTIMATED", "LIVE-SENSOR", "FORECAST"],
      executiveSummary:
        "Fractured quartzite and phyllite wedge failure along NH-58 between Byasi and Devprayag deposited ~14,500 cubic meters of boulder debris across 140 meters of the Rishikesh–Badrinath national highway. Triggered after 3-hour intense monsoon downpour and corroborated by 38 geotagged citizen SOS posts ('चट्टान गिरी, गाड़ियां फंसी'). BRO Project Shivalik and SDRF units have secured all 42 stranded vehicles with zero casualties.",
      streams: {
        hydrology: {
          title: "1. Environmental Sensors (GSI Inclinometer / IMD AWS)",
          badge: "LIVE-SENSOR",
          status: "SLOPE FAILURE",
          tone: "crit",
          confidence: "96%",
          primaryMetric: "18.4 mm/hr Pore Surge • FoS Dropped to 0.88",
          stationId: "GSI-DEV-02 / UK-TEH-07",
          updatedAt: "15:10 IST (Live 60s Poll)",
          highlights: [
            "GSI Borehole Inclinometer GSI-DEV-02: Recorded 14.2 mm shear displacement at 6.5m depth prior to failure",
            "IMD AWS Devprayag (UK-TEH-07): 96.5 mm cumulative 6h rainfall saturated weathered phyllite joints",
            "CWC Devprayag Sangam Gauge: Bhagirathi-Alaknanda stage normal-watch (+0.25m below danger mark)"
          ]
        },
        satellite: {
          title: "2. Satellite Remote Sensing (EOS-04 SAR & Cartosat-3)",
          badge: "REMOTE-SENSED",
          status: "SCARP MAPPED",
          tone: "crit",
          confidence: "95%",
          primaryMetric: "140m Highway Debris Fan • 1.8 Ha Crown Scarp",
          stationId: "EOS04-INSAR-20260814-0810Z",
          updatedAt: "14:40 IST Pass",
          highlights: [
            "EOS-04 C-Band SAR Backscatter Change Detection delineated a 140m x 45m debris cone across NH-58",
            "Crown Scarp Instability: 2 overhanging fractured rock blocks identified 65m above highway bench",
            "No river blockade detected in Alaknanda gorge below the highway retaining wall"
          ]
        },
        social: {
          title: "3. Social & Citizen Intelligence (NH-58 SOS Cluster)",
          badge: "AI-ESTIMATED",
          secondaryBadge: "UNVERIFIED-CITIZEN",
          status: "HIGH CORROBORATION",
          tone: "crit",
          confidence: "94%",
          primaryMetric: "38 Distress Posts • 94% NLP Verification Score",
          stationId: "CLUSTER-NH58-BYASI",
          updatedAt: "15:08 IST Stream",
          highlights: [
            "Cluster Keywords: 'चट्टान गिरी', 'गाड़ियां फंसी', 'NH-58 Byasi Devprayag Blocked', 'SOS Pilgrims'",
            "Multi-user visual corroboration: 6 dashcam & mobile videos matched landmark milepost KM-118",
            "SDRF Dispatcher linked cluster directly to MEI-01 dossier for immediate BRO bulldozer dispatch"
          ]
        },
        sitrep: {
          title: "4. Official SITREPs & Drone Recon (BRO / SDRF / Police)",
          badge: "OFFICIAL-GROUND-TRUTH",
          status: "CLEARANCE ACTIVE",
          tone: "ok",
          confidence: "99%",
          primaryMetric: "BRO Task Force On-Site • 42 Vehicles Escorted",
          stationId: "BRO-SHIVALIK-SITREP-09",
          updatedAt: "15:05 IST Signed",
          highlights: [
            "BRO Geotechnical Inspection: Controlled rock-breaking underway from both Rishikesh and Devprayag ends",
            "SDRF & Tehri Police escorted 185 stranded passengers to Byasi GMVN & Kaudiyala safe holding camps",
            "UAV Thermal & Optical Sweep confirmed zero vehicles trapped underneath the debris fan"
          ]
        },
        infrastructure: {
          title: "5. Infrastructure & Human Impacts (Corridors & Utilities)",
          badge: "OFFICIAL-GROUND-TRUTH",
          status: "NH-58 DIVERTED",
          tone: "warn",
          confidence: "98%",
          primaryMetric: "NH-58 Closed (8–10h) • Chamba–Tehri Bypass Open",
          stationId: "INFRA-LGD-059",
          updatedAt: "15:12 IST Sync",
          highlights: [
            "Primary Corridor: NH-58 blocked at Byasi–Kaudiyala bend; traffic diverted via Narendra Nagar–Chamba–Srinagar",
            "Telecom & Optical Fiber: BSNL duct intact; 1 roadside LT power pole replaced by UPCL line crew",
            "Relief Holding Zones: Kaudiyala Camp (110 pilgrims), Devprayag Rest House (75 pilgrims) supplied with meals"
          ]
        }
      },
      mapLayers: {
        epicenter: { lat: 30.146, lon: 78.598, radiusKm: 4.5, label: "NH-58 Devprayag-Byasi Landslide Scarp (EV-2026-0814-LSD)" },
        sarPolygon: [
          [30.18, 78.55],
          [30.19, 78.64],
          [30.11, 78.65],
          [30.10, 78.56]
        ],
        sensors: [
          { id: "GSI-DEV-02", name: "GSI Slope Inclinometer Byasi-Devprayag", lat: 30.148, lon: 78.595, reading: "14.2mm Shear (FoS 0.88)", status: "Danger Breach", color: "#B42318" },
          { id: "UK-TEH-07", name: "IMD AWS Devprayag Ridge", lat: 30.155, lon: 78.608, reading: "96.5 mm / 6h", status: "Warning Watch", color: "#D97706" }
        ],
        sosClusters: [
          { id: "SOS-BYA-201", name: "Devprayag-Byasi NH-58 SOS Cluster (38 Posts)", lat: 30.143, lon: 78.592, verified: "94% Corroborated", count: 38 }
        ],
        sheltersAndBlocks: [
          { id: "BLK-NH58-118", kind: "roadblock", name: "NH-58 KM-118 Byasi Boulder Failure", lat: 30.146, lon: 78.598, detail: "140m Debris Span • 4 BRO Rock Breakers Active" },
          { id: "SHL-DEV-01", kind: "shelter", name: "GMVN Devprayag Transit Shelter", lat: 30.149, lon: 78.604, detail: "75 Pilgrims Sheltered • Medical & Food Active" },
          { id: "SHL-KAU-02", kind: "shelter", name: "Kaudiyala Holding Relief Camp", lat: 30.132, lon: 78.575, detail: "110 Passengers Assisted • Police Escort" }
        ]
      }
    },
    {
      id: "EV-2026-0815-GLF",
      code: "EV-2026-0815-GLF",
      title: "Alaknanda Upper Basin Glacial Moraine & Debris Watch",
      hazard: "Glacial / High-Altitude Flood Watch",
      severity: "High",
      status: "Active",
      epistemic: "MULTI-SENSOR CORROBORATED",
      confidence: 0.91,
      catchment: "Upper Alaknanda & Dhauliganga Basin (Joshimath – Tapovan – Pipalkhoti)",
      district: "Chamoli, Uttarakhand",
      timestamp: "2026-08-15 09:20 IST",
      coordinates: [30.5506, 79.566],
      zoom: 10,
      elevation: "1,890 m MSL",
      affectedArea: "29.0 sq km",
      triggerSensorId: "CWC-JOS-03",
      triggerPostId: "SOS-CHM-302",
      lineageBadges: ["REMOTE-SENSED", "LIVE-SENSOR", "AI-SYNTHESIS", "FORECAST", "SIMULATED"],
      executiveSummary:
        "High-altitude rainfall combined with accelerated snowmelt in the Dhauliganga–Alaknanda catchment elevated river turbidity and stage at Joshimath (CWC-JOS-03). ISRO EOS-04 SAR and Sentinel-2 optical passes confirm moraine lake stability (no breach) while flagging localized debris-flow susceptibility at Pipalkhoti and Tangni along NH-58.",
      streams: {
        hydrology: {
          title: "1. Environmental Sensors (CWC / DGRE / IMD AWS)",
          badge: "LIVE-SENSOR",
          status: "HIGH TURBIDITY WATCH",
          tone: "warn",
          confidence: "95%",
          primaryMetric: "54.2 mm/hr Rain • +0.42m Above Warning Mark",
          stationId: "CWC-JOS-03 / AWS-TAP-01",
          updatedAt: "09:20 IST (Live 60s Poll)",
          highlights: [
            "CWC Joshimath Gauge (CWC-JOS-03): River stage 0.42m above Warning Mark, 0.65m below Danger Mark",
            "Suspended Sediment & Turbidity Sensor: 1,850 NTU spike indicating upper gully debris wash",
            "DGRE High-Altitude AWS Tapovan: Zero-degree isotherm rose to 4,850m MSL"
          ]
        },
        satellite: {
          title: "2. Satellite Remote Sensing (EOS-04 SAR & Resourcesat-2A)",
          badge: "REMOTE-SENSED",
          status: "MORAINE INTACT",
          tone: "ok",
          confidence: "96%",
          primaryMetric: "0 Glacial Lake Breaches • 2 Active Debris Gullies",
          stationId: "RS2A-LISS4-20260815-0530Z",
          updatedAt: "08:45 IST Pass",
          highlights: [
            "Resourcesat-2A LISS-IV (5.8m) & EOS-04 SAR confirm Rishiganga/Dhauliganga moraine lakes are intact",
            "InSAR localized slope creep detected at Tangni and Pipalkhoti chute along NH-58",
            "Automated NDWI water surface area change within normal seasonal bounds (+2.1%)"
          ]
        },
        social: {
          title: "3. Social & Citizen Intelligence (Chamoli Corridor Feed)",
          badge: "AI-ESTIMATED",
          secondaryBadge: "UNVERIFIED-CITIZEN",
          status: "RUMOR QUARANTINED",
          tone: "warn",
          confidence: "89%",
          primaryMetric: "19 Field Reports • 4 Glacial Breach Rumors Debunked",
          stationId: "CLUSTER-CHM-JOSHIMATH",
          updatedAt: "09:15 IST Stream",
          highlights: [
            "Citizen reports confirm muddy water surge at Vishnuprayag sangam and single-lane traffic at Pipalkhoti",
            "Misinformation Quarantine: AI Fact-Checker flagged & quarantined 4 panic posts falsely claiming a GLOF burst",
            "Chamoli District Police & DDMA issued verified bilingual clarification within 8 minutes"
          ]
        },
        sitrep: {
          title: "4. Official SITREPs & Drone Recon (DDMA Chamoli / ITBP)",
          badge: "OFFICIAL-GROUND-TRUTH",
          status: "ORANGE ADVISORY",
          tone: "ok",
          confidence: "98%",
          primaryMetric: "ITBP Forward Post Verified • Riverbank Ghats Closed",
          stationId: "DDMA-CHM-SITREP-02",
          updatedAt: "09:10 IST Signed",
          highlights: [
            "ITBP & SDRF high-altitude patrol confirmed normal channel flow at Raini and Tapovan barrage",
            "Precautionary closure of Alaknanda riverbank ghats from Vishnuprayag to Karnaprayag",
            "2 BRO loaders stationed at Pipalkhoti and Lambagad chronic slide zones"
          ]
        },
        infrastructure: {
          title: "5. Infrastructure & Human Impacts (Hydropower & NH-58)",
          badge: "OFFICIAL-GROUND-TRUTH",
          status: "PRECAUTIONARY OPS",
          tone: "ok",
          confidence: "96%",
          primaryMetric: "NH-58 Single-Lane Open • Hydropower Sluices Open",
          stationId: "INFRA-LGD-057",
          updatedAt: "09:18 IST Sync",
          highlights: [
            "Hydropower: Vishnuprayag & Tapovan projects opened desilting flushing gates per SOP",
            "Highway: NH-58 open with regulated single-lane convoy movement through Pipalkhoti",
            "Preparedness: SDRF Gauchar base and Joshimath Community Shelter on standby readiness"
          ]
        }
      },
      mapLayers: {
        epicenter: { lat: 30.5506, lon: 79.566, radiusKm: 5.5, label: "Upper Alaknanda / Joshimath Watch Zone (EV-2026-0815-GLF)" },
        sarPolygon: [
          [30.61, 79.48],
          [30.62, 79.64],
          [30.48, 79.65],
          [30.47, 79.49]
        ],
        sensors: [
          { id: "CWC-JOS-03", name: "CWC Gauge Joshimath / Vishnuprayag", lat: 30.558, lon: 79.572, reading: "+0.42m Warning Mark", status: "Warning Watch", color: "#D97706" },
          { id: "AWS-TAP-01", name: "IMD/DGRE AWS Tapovan", lat: 30.492, lon: 79.625, reading: "54.2 mm/hr • 1,850 NTU", status: "Warning Watch", color: "#D97706" }
        ],
        sosClusters: [
          { id: "SOS-CHM-302", name: "Pipalkhoti NH-58 Slowdown & Turbidity Reports (19 Posts)", lat: 30.432, lon: 79.428, verified: "89% Corroborated", count: 19 }
        ],
        sheltersAndBlocks: [
          { id: "BLK-NH58-PIP", kind: "roadblock", name: "NH-58 Pipalkhoti Regulated Single-Lane", lat: 30.435, lon: 79.431, detail: "2 BRO Loaders Staged • Convoy Movement Active" },
          { id: "SHL-JOS-01", kind: "shelter", name: "Joshimath Municipal Relief Center", lat: 30.552, lon: 79.561, detail: "Standby Capacity 350 Beds • SDRF Unit Ready" }
        ]
      }
    }
  ];

  // Knowledge Graph Entities & Connected Relationships per event
  const buildKnowledgeGraph = (dossier) => {
    const evCode = dossier.code;
    const isLsd = evCode.includes("LSD");
    const isGlf = evCode.includes("GLF");
    return {
      nodes: [
        {
          id: "KG-EVENT",
          type: "Disaster Event",
          label: dossier.code,
          subtitle: dossier.title,
          lineage: "OFFICIAL-GROUND-TRUTH",
          tone: "crit",
          metrics: `Severity: ${dossier.severity} • Confidence: ${Math.round(dossier.confidence * 100)}% • Extent: ${dossier.affectedArea}`,
          connections: ["KG-CATCHMENT", "KG-SENSOR", "KG-SAR", "KG-SOCIAL", "KG-HIGHWAY", "KG-SHELTER"]
        },
        {
          id: "KG-CATCHMENT",
          type: "Hydrological Basin",
          label: isLsd ? "Alaknanda-Bhagirathi Gorge" : isGlf ? "Upper Alaknanda / Dhauliganga" : "Mandakini River Catchment",
          subtitle: dossier.district,
          lineage: "OFFICIAL-GROUND-TRUTH",
          tone: "info",
          metrics: `Elevation: ${dossier.elevation} • Soil Saturation: 94.2% • Runoff Coeff: 0.84`,
          connections: ["KG-EVENT", "KG-SENSOR", "KG-SAR"]
        },
        {
          id: "KG-SENSOR",
          type: "Telemetry Station",
          label: dossier.triggerSensorId,
          subtitle: dossier.streams.hydrology.stationId,
          lineage: "LIVE-SENSOR",
          tone: "crit",
          metrics: dossier.streams.hydrology.primaryMetric,
          connections: ["KG-EVENT", "KG-CATCHMENT", "KG-HIGHWAY"]
        },
        {
          id: "KG-SAR",
          type: "Satellite Pass",
          label: dossier.streams.satellite.stationId,
          subtitle: "ISRO EOS-04 C-Band SAR & Sentinel-2",
          lineage: "REMOTE-SENSED",
          tone: "warn",
          metrics: dossier.streams.satellite.primaryMetric,
          connections: ["KG-EVENT", "KG-CATCHMENT", "KG-HIGHWAY"]
        },
        {
          id: "KG-SOCIAL",
          type: "Citizen SOS Cluster",
          label: dossier.triggerPostId,
          subtitle: dossier.streams.social.stationId,
          lineage: "AI-ESTIMATED",
          tone: "crit",
          metrics: dossier.streams.social.primaryMetric,
          connections: ["KG-EVENT", "KG-HIGHWAY", "KG-SHELTER"]
        },
        {
          id: "KG-HIGHWAY",
          type: "Critical Corridor",
          label: isLsd ? "NH-58 Byasi KM-118" : isGlf ? "NH-58 Pipalkhoti Chute" : "NH-107 Banswara KM-24",
          subtitle: "Border Roads Organisation (BRO Project Shivalik)",
          lineage: "OFFICIAL-GROUND-TRUTH",
          tone: "warn",
          metrics: dossier.streams.infrastructure.primaryMetric,
          connections: ["KG-EVENT", "KG-SENSOR", "KG-SAR", "KG-SOCIAL", "KG-SHELTER"]
        },
        {
          id: "KG-SHELTER",
          type: "Relief & Staging Camp",
          label: isLsd ? "GMVN Devprayag & Kaudiyala" : isGlf ? "Joshimath & Gauchar Base" : "GMVN Syalsaur & GIC Augustmuni",
          subtitle: "District Administration & SDRF Relief Ops",
          lineage: "OFFICIAL-GROUND-TRUTH",
          tone: "ok",
          metrics: "750+ Safe Shelter Beds • Medical & Food Packets Active • 0 Fatalities",
          connections: ["KG-EVENT", "KG-SOCIAL", "KG-HIGHWAY"]
        }
      ],
      edges: [
        { from: "KG-SENSOR", to: "KG-EVENT", relation: "Triggered threshold breach in" },
        { from: "KG-CATCHMENT", to: "KG-SENSOR", relation: "Drains runoff into gauge" },
        { from: "KG-SAR", to: "KG-EVENT", relation: "Delineated spatial scarp & flood polygon for" },
        { from: "KG-SOCIAL", to: "KG-HIGHWAY", relation: "Geolocated vehicle entrapment along" },
        { from: "KG-HIGHWAY", to: "KG-SHELTER", relation: "Evacuated stranded passengers to" },
        { from: "KG-EVENT", to: "KG-SHELTER", relation: "Activated emergency relief operations at" }
      ]
    };
  };

  // Multi-Stream Chronological Timeline per dossier
  const buildTimeline = (dossier) => [
    {
      id: "TL-01",
      window: "T-24h",
      time: "05:40 IST",
      stream: "hydrology",
      streamLabel: "Sensor Telemetry",
      agency: "IMD Doppler Radar (Surkanda Devi) & AWS Network",
      lineage: "LIVE-SENSOR",
      tone: "info",
      title: `Convective Monsoon Cell Enters ${dossier.district}`,
      detail: `Automated weather station ${dossier.triggerSensorId} logged initial precipitation surge crossing 42 mm/hr, saturating steep upper catchment slopes.`,
      rawPayload: {
        station_id: dossier.triggerSensorId,
        rainfall_1h_mm: 82.4,
        rainfall_3h_mm: 134.0,
        soil_moisture_pct: 94.2,
        qa_flag: "VALIDATED_TELEMETRY"
      }
    },
    {
      id: "TL-02",
      window: "T-6h",
      time: "07:50 IST",
      stream: "satellite",
      streamLabel: "Satellite SAR",
      agency: "ISRO NRSC Bhoonidhi (EOS-04 C-Band Radar)",
      lineage: "REMOTE-SENSED",
      tone: "warn",
      title: `EOS-04 SAR Pass (${dossier.streams.satellite.stationId}) Acquired`,
      detail: `Cloud-penetrating C-band radar delineated ${dossier.affectedArea} high-moisture hazard footprint and InSAR coherence loss along the highway cut-slope.`,
      rawPayload: {
        scene_id: dossier.streams.satellite.stationId,
        sensor: "EOS-04 SAR HH/HV",
        resolution_m: 8.0,
        insar_coherence_delta: -0.41,
        inundation_sq_km: dossier.affectedArea
      }
    },
    {
      id: "TL-03",
      window: "T-0",
      time: "08:20 IST",
      stream: "social",
      streamLabel: "Citizen SOS",
      agency: "Multilingual Social NLP & Citizen Triage Engine",
      lineage: "AI-ESTIMATED",
      tone: "crit",
      title: `Verified SOS Cluster (${dossier.triggerPostId}) Detected on Corridor`,
      detail: `High-density cluster of geotagged Hindi/English distress posts verified via perceptual hash (pHash) and landmark matching (94% confidence score).`,
      rawPayload: {
        cluster_id: dossier.triggerPostId,
        verified_posts: 38,
        quarantined_rumors: 3,
        corroboration_score: 0.94,
        sample_keywords: ["चट्टान गिरी", "गाड़ियां फंसी", "SOS", "NH58"]
      }
    },
    {
      id: "TL-04",
      window: "T+12h",
      time: "08:55 IST",
      stream: "sitrep",
      streamLabel: "Official SITREP & UAV",
      agency: "USDMA State EOC & SDRF Drone Reconnaissance Unit",
      lineage: "OFFICIAL-GROUND-TRUTH",
      tone: "ok",
      title: "USDMA SITREP #4 Signed & UAV Orthomosaic Confirmed",
      detail: "SDRF 4K UAV flight confirmed zero river impoundment damming. 2 SDRF rescue companies and 6 BRO heavy excavators deployed on site.",
      rawPayload: {
        bulletin_id: dossier.streams.sitrep.stationId,
        uav_frames: 6,
        evacuated_count: 420,
        fatalities: 0,
        commander_signoff: "SEOC_DUTY_MAGISTRATE"
      }
    },
    {
      id: "TL-05",
      window: "T+24h",
      time: "Next 24h",
      stream: "infrastructure",
      streamLabel: "Cascade Forecast",
      agency: "Multimodal AI Cascade Risk Engine (SEOC Analytics)",
      lineage: "FORECAST",
      tone: "warn",
      title: "24–48h Secondary Slope & Downstream Surge Projection",
      detail: "89% probability of secondary rockfall if nocturnal rainfall exceeds 25 mm/hr; BRO single-lane highway clearance projected within 8 to 12 hours.",
      rawPayload: {
        model_run: "MEI-CASCADE-V3.2",
        secondary_landslide_prob: 0.89,
        downstream_flood_watch_pop: 5000,
        estimated_clearance_hours: "8-12h"
      }
    }
  ];

  const MultimodalEventView = ({ onNavigate, drillContext, activeRoleId = 'authority' }) => {
    // Normalize incoming drillContext (supports direct properties or nested params from HM-01 / SMI-01)
    const normalizedDrill = useMemo(() => {
      if (!drillContext) return null;
      const p = drillContext.params || drillContext;
      return {
        fromScreen: p.fromScreen || drillContext.fromScreen || (p.sensorId ? "HM-01" : p.postId || p.evidenceSource === "social" ? "SMI-01" : "HM-01"),
        eventId: p.eventId || drillContext.eventId || "EV-2026-0814-FLD",
        focusModality: p.focusModality || p.evidenceSource || drillContext.focusModality || "hydrology",
        sensorId: p.sensorId || drillContext.sensorId || null,
        postId: p.postId || p.clusterLocation || drillContext.postId || null,
        title: p.title || p.clusterLocation || drillContext.title || "Correlated Multimodal Trigger Anomaly",
        highlightTimestamp: p.highlightTimestamp || "2026-08-14T14:30:00Z"
      };
    }, [drillContext]);

    const [handshakeBanner, setHandshakeBanner] = useState(normalizedDrill);
    const selectedRoleId = normalizeRoleId(activeRoleId || "authority");
    const [selectedEventId, setSelectedEventId] = useState(
      (normalizedDrill && normalizedDrill.eventId) || "EV-2026-0814-FLD"
    );
    const [focusedStream, setFocusedStream] = useState("all");
    const [scrubberWindow, setScrubberWindow] = useState("ALL");
    const [selectedKgNodeId, setSelectedKgNodeId] = useState("KG-EVENT");
    const [executedActions, setExecutedActions] = useState({});
    const [alertBroadcasted, setAlertBroadcasted] = useState(false);
    const [showSitRepModal, setShowSitRepModal] = useState(false);
    const [sitRepFormat, setSitRepFormat] = useState("markdown");
    const [inspectedEvidence, setInspectedEvidence] = useState(null);
    const [sarCoherenceWeight, setSarCoherenceWeight] = useState(0.41);
    const [executionAuditLog, setExecutionAuditLog] = useState([
      {
        id: "AUDIT-MEI-01",
        time: "14:31:12 IST",
        signer: "A. Kanojia",
        authorityLevel: "LEVEL 5 · EXECUTIVE COMMAND",
        action: "Authorized Red Alert & Tehsil Evacuation Order for Mandakini Hamlets (EV-2026-0814-FLD)"
      },
      {
        id: "AUDIT-MEI-02",
        time: "14:28:40 IST",
        signer: "A. Kanojia",
        authorityLevel: "LEVEL 4 · SCIENTIFIC CALIBRATION",
        action: "Validated EOS-04 SAR Coherence Loss (InSAR Δγ = -0.41) & UK-RUD-04 Cloudburst Trigger"
      }
    ]);

    // Role strictly bound to global TopBar activeRoleId prop (no local override)

    // Live API events merged safely with canonical dossiers
    const [liveApiEvents, setLiveApiEvents] = useState([]);
    const [apiSyncStatus, setApiSyncStatus] = useState("SYNCED");

    // Leaflet Map state & refs
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const layerGroupRef = useRef(null);
    const tileLayerRef = useRef(null);
    const [basemapKey, setBasemapKey] = useState("topo");
    const [mapLayersVisible, setMapLayersVisible] = useState({
      epicenter: true,
      sensors: true,
      sarFootprint: true,
      socialClusters: true,
      sheltersAndBlocks: true
    });

    // React to incoming drillContext changes from HM-01 or SMI-01
    useEffect(() => {
      if (normalizedDrill) {
        setHandshakeBanner(normalizedDrill);
        if (normalizedDrill.eventId) {
          setSelectedEventId(normalizedDrill.eventId);
        }
        const mod = String(normalizedDrill.focusModality || "").toLowerCase();
        if (mod.includes("hydro") || mod.includes("weather") || mod.includes("sensor")) {
          setFocusedStream("hydrology");
          setSelectedKgNodeId("KG-SENSOR");
        } else if (mod.includes("social") || mod.includes("news") || mod.includes("citizen")) {
          setFocusedStream("social");
          setSelectedKgNodeId("KG-SOCIAL");
        } else if (mod.includes("sat") || mod.includes("sar")) {
          setFocusedStream("satellite");
          setSelectedKgNodeId("KG-SAR");
        }
      }
    }, [normalizedDrill]);

    // Fetch live events from /api/v1/events and /api/v1/modalities/events safely
    useEffect(() => {
      let isMounted = true;
      const loadBackendEvents = async () => {
        try {
          const res = await fetch("/api/v1/events?limit=15");
          if (!res.ok) return;
          const data = await res.json();
          if (!isMounted) return;
          const items = Array.isArray(data) ? data : data.events || [];
          const normalized = items.slice(0, 6).map((item, idx) => {
            const rawId = asText(item.event_code || item.event_id || item.id, `EV-API-${idx + 1}`);
            const titleStr = asText(item.title || item.event_title || item.name, "Uttarakhand Multimodal Event");
            const hazardStr = asText(item.hazard_name || item.hazard, "Landslide / Flood");
            const locStr = asText(
              item.location || item.location_name || item.district_name || item.district,
              "Rudraprayag, Uttarakhand"
            );
            const sevStr = asText(item.severity, "High");
            const statusStr = asText(item.status, "Active");
            // Inherit rich multimodal streams from matching canonical template so 5 streams are always 100% populated
            const template =
              CANONICAL_DOSSIERS.find(d => d.id === rawId) ||
              (hazardStr.toLowerCase().includes("landslide") ? CANONICAL_DOSSIERS[1] : CANONICAL_DOSSIERS[0]);
            return {
              ...template,
              id: rawId,
              code: rawId,
              title: titleStr,
              hazard: hazardStr,
              severity: sevStr,
              status: statusStr,
              district: locStr
            };
          });
          setLiveApiEvents(normalized);
          setApiSyncStatus("LIVE-API-CONNECTED");
        } catch (err) {
          if (isMounted) setApiSyncStatus("FALLBACK-READY");
        }
      };
      loadBackendEvents();
      return () => {
        isMounted = false;
      };
    }, []);

    // Combined list of selectable disaster dossiers
    const allDossiers = useMemo(() => {
      const map = new Map();
      CANONICAL_DOSSIERS.forEach(d => map.set(d.id, d));
      liveApiEvents.forEach(d => {
        if (!map.has(d.id)) {
          map.set(d.id, d);
        }
      });
      return Array.from(map.values());
    }, [liveApiEvents]);

    const activeDossier = useMemo(() => {
      return (
        allDossiers.find(d => d.id === selectedEventId || d.code === selectedEventId) ||
        CANONICAL_DOSSIERS[0]
      );
    }, [allDossiers, selectedEventId]);

    const activeRole = useMemo(() => {
      return ROLE_MATRIX.find(r => r.id === selectedRoleId) || ROLE_MATRIX[0];
    }, [selectedRoleId]);

    const knowledgeGraph = useMemo(() => buildKnowledgeGraph(activeDossier), [activeDossier]);
    const selectedKgNode = useMemo(() => {
      return knowledgeGraph.nodes.find(n => n.id === selectedKgNodeId) || knowledgeGraph.nodes[0];
    }, [knowledgeGraph, selectedKgNodeId]);

    const timelineItems = useMemo(() => {
      const all = buildTimeline(activeDossier);
      return all.filter(item => {
        const matchStream = focusedStream === "all" || item.stream === focusedStream;
        const matchWindow = scrubberWindow === "ALL" || item.window === scrubberWindow;
        return matchStream && matchWindow;
      });
    }, [activeDossier, focusedStream, scrubberWindow]);

    // Initialize & Update Unified Multi-Layer Leaflet Map
    useEffect(() => {
      if (!mapContainerRef.current || typeof window.L === "undefined") return;

      if (!mapInstanceRef.current) {
        const map = window.L.map(mapContainerRef.current, {
          center: activeDossier.coordinates || [30.2849, 78.9867],
          zoom: activeDossier.zoom || 10,
          zoomControl: false
        });
        window.L.control.zoom({ position: "bottomright" }).addTo(map);
        layerGroupRef.current = window.L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
      }

      const ro =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(() => {
              if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
            })
          : null;
      if (ro && mapContainerRef.current) ro.observe(mapContainerRef.current);

      return () => {
        if (ro) ro.disconnect();
      };
    }, []);

    // Cleanup Leaflet instance on unmount
    useEffect(() => {
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }, []);

    // Update Basemap Tile Layer
    useEffect(() => {
      if (!mapInstanceRef.current || typeof window.L === "undefined") return;
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
      const urls = {
        light: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        topo: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      };
      const tile = window.L.tileLayer(urls[basemapKey] || urls.topo, {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap / Esri / ISRO Bhuvan"
      }).addTo(mapInstanceRef.current);
      if (tile.bringToBack) tile.bringToBack();
      tileLayerRef.current = tile;
    }, [basemapKey]);

    // Render Synchronized Multi-Layer Map Features when activeDossier or layer toggles change
    useEffect(() => {
      if (!mapInstanceRef.current || !layerGroupRef.current || typeof window.L === "undefined") return;
      const L = window.L;
      const group = layerGroupRef.current;
      group.clearLayers();

      const ml = activeDossier.mapLayers;
      if (!ml) return;

      mapInstanceRef.current.setView(activeDossier.coordinates || [30.2849, 78.9867], activeDossier.zoom || 10);

      // Layer 1: SAR Footprint Polygon
      if (mapLayersVisible.sarFootprint && ml.sarPolygon) {
        const poly = L.polygon(ml.sarPolygon, {
          color: "#7C3AED",
          weight: 2,
          dashArray: "5, 5",
          fillColor: "#8B5CF6",
          fillOpacity: 0.14
        });
        poly.bindPopup(
          `<div style="font-size:11px;"><b>[REMOTE-SENSED] ISRO EOS-04 SAR Swath</b><br/>Scene: ${activeDossier.streams.satellite.stationId}<br/>Extent: ${activeDossier.affectedArea}</div>`
        );
        group.addLayer(poly);
      }

      // Layer 2: Epicenter & Impact Buffer Zone
      if (mapLayersVisible.epicenter && ml.epicenter) {
        const circle = L.circle([ml.epicenter.lat, ml.epicenter.lon], {
          radius: (ml.epicenter.radiusKm || 5) * 1000,
          color: "#B42318",
          weight: 2,
          fillColor: "#EF4444",
          fillOpacity: 0.16
        });
        circle.bindPopup(
          `<div style="font-size:11px;"><b>[OFFICIAL-GROUND-TRUTH] Impact Zone</b><br/>${ml.epicenter.label}<br/>Affected Area: ${activeDossier.affectedArea}</div>`
        );
        group.addLayer(circle);

        const epiIcon = L.divIcon({
          className: "",
          html: `<div style="width:16px;height:16px;border-radius:50%;background:#B42318;border:2.5px solid #fff;box-shadow:0 0 0 3px rgba(180,35,24,0.35);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        const epiMarker = L.marker([ml.epicenter.lat, ml.epicenter.lon], { icon: epiIcon });
        epiMarker.bindPopup(
          `<div style="font-size:11px;"><b>EPICENTER: ${activeDossier.code}</b><br/>${activeDossier.title}</div>`
        );
        group.addLayer(epiMarker);
      }

      // Layer 3: Environmental Sensor Stations (IMD / CWC / GSI)
      if (mapLayersVisible.sensors && ml.sensors) {
        ml.sensors.forEach(s => {
          const sensorIcon = L.divIcon({
            className: "",
            html: `<div style="width:13px;height:13px;border-radius:2px;background:${s.color || "#0284C7"};border:2px solid #fff;box-shadow:0 0 0 1px #111;"></div>`,
            iconSize: [13, 13],
            iconAnchor: [6, 6]
          });
          const m = L.marker([s.lat, s.lon], { icon: sensorIcon });
          m.bindPopup(
            `<div style="font-size:11px;"><b>[LIVE-SENSOR] ${s.id}</b><br/>${s.name}<br/>Reading: <b>${s.reading}</b><br/>Status: ${s.status}</div>`
          );
          group.addLayer(m);
        });
      }

      // Layer 4: Social SOS Clusters
      if (mapLayersVisible.socialClusters && ml.sosClusters) {
        ml.sosClusters.forEach(c => {
          const sosIcon = L.divIcon({
            className: "",
            html: `<div style="padding:1px 5px;border-radius:10px;background:#DC2626;color:#fff;font-size:9px;font-weight:800;border:1.5px solid #fff;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.3);">SOS (${c.count})</div>`,
            iconSize: [54, 18],
            iconAnchor: [27, 9]
          });
          const m = L.marker([c.lat, c.lon], { icon: sosIcon });
          m.bindPopup(
            `<div style="font-size:11px;"><b>[AI-ESTIMATED] ${c.id}</b><br/>${c.name}<br/>Verification: <b>${c.verified}</b></div>`
          );
          group.addLayer(m);
        });
      }

      // Layer 5: Relief Shelters & Highway Roadblocks
      if (mapLayersVisible.sheltersAndBlocks && ml.sheltersAndBlocks) {
        ml.sheltersAndBlocks.forEach(item => {
          const isBlock = item.kind === "roadblock";
          const badgeHtml = isBlock
            ? `<div style="width:14px;height:14px;transform:rotate(45deg);background:#EA580C;border:2px solid #fff;box-shadow:0 0 0 1px #111;"></div>`
            : `<div style="width:14px;height:14px;border-radius:50%;background:#059669;border:2px solid #fff;box-shadow:0 0 0 1px #111;"></div>`;
          const icon = L.divIcon({
            className: "",
            html: badgeHtml,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });
          const m = L.marker([item.lat, item.lon], { icon });
          m.bindPopup(
            `<div style="font-size:11px;"><b>[${isBlock ? "HIGHWAY BLOCK" : "RELIEF SHELTER"}] ${item.id}</b><br/>${item.name}<br/>${item.detail}</div>`
          );
          group.addLayer(m);
        });
      }
    }, [activeDossier, mapLayersVisible]);

    const toggleMapLayer = (key) => {
      setMapLayersVisible(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleExecuteDecision = (decision) => {
      const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const signedBy = "A. Kanojia";
      setExecutedActions(prev => ({
        ...prev,
        [decision.id]: {
          time: nowTime,
          role: activeRole.shortLabel,
          signer: signedBy
        }
      }));
      setExecutionAuditLog(prev => [
        {
          id: `AUDIT-${decision.id}-${Date.now().toString().slice(-4)}`,
          time: `${nowTime} IST`,
          signer: signedBy,
          authorityLevel: activeRole.authorityLevel,
          action: `${decision.label} — ${decision.target}`
        },
        ...prev.slice(0, 9)
      ]);
    };

    const isCitizenRole = selectedRoleId === "citizen";
    const canBroadcastFlashAlert = selectedRoleId === "authority" || selectedRoleId === "response";
    const canTuneSarWeights = selectedRoleId === "analyst" || selectedRoleId === "authority" || selectedRoleId === "data-admin";

    // Generate SitRep Markdown / JSON content for export modal
    const sitRepContent = useMemo(() => {
      if (sitRepFormat === "json") {
        return JSON.stringify(
          {
            document_ref: `SITREP-${activeDossier.code}`,
            generated_at: "2026-11-12T18:15:00Z",
            signed_by: "A. Kanojia",
            authorizing_role: activeRole.displayTitle,
            authority_level: activeRole.authorityLevel,
            event: {
              event_id: activeDossier.code,
              title: activeDossier.title,
              hazard: activeDossier.hazard,
              severity: activeDossier.severity,
              epistemic_status: activeDossier.epistemic,
              confidence: activeDossier.confidence,
              district: activeDossier.district,
              affected_area: activeDossier.affectedArea,
              coordinates: activeDossier.coordinates
            },
            multimodal_streams: activeDossier.streams,
            cascade_forecast_24_48h: {
              secondary_slope_failure_prob: 0.89,
              downstream_flood_watch_population: 5000,
              highway_clearance_eta: "8-12 hours"
            }
          },
          null,
          2
        );
      }
      return [
        `# UTTARAKHAND SEOC — MULTIMODAL OPERATIONAL SITREP (${activeDossier.code})`,
        `**Epistemic Status:** ${activeDossier.epistemic} | **Severity:** ${activeDossier.severity.toUpperCase()}`,
        `**Signed By:** A. Kanojia (${activeRole.authorityLevel})`,
        `**Role:** ${activeRole.displayTitle}`,
        `**Location:** ${activeDossier.district} (${activeDossier.catchment})`,
        ``,
        `## 1. Executive AI Synthesis [AI-SYNTHESIS]`,
        activeDossier.executiveSummary,
        ``,
        `## 2. 5-Stream Multimodal Evidence Matrix`,
        `- **Environmental Sensors [LIVE-SENSOR]:** ${activeDossier.streams.hydrology.primaryMetric} (${activeDossier.streams.hydrology.stationId})`,
        `- **Satellite Remote Sensing [REMOTE-SENSED]:** ${activeDossier.streams.satellite.primaryMetric} (${activeDossier.streams.satellite.stationId})`,
        `- **Citizen & Social Triage [AI-ESTIMATED]:** ${activeDossier.streams.social.primaryMetric} (${activeDossier.streams.social.stationId})`,
        `- **Official SITREPs & UAV [OFFICIAL-GROUND-TRUTH]:** ${activeDossier.streams.sitrep.primaryMetric}`,
        `- **Infrastructure & Human Impact [OFFICIAL-GROUND-TRUTH]:** ${activeDossier.streams.infrastructure.primaryMetric}`,
        ``,
        `## 3. 24–48h Cascade Risk Forecast [FORECAST]`,
        `- Secondary Landslide / Slope Failure Probability: **89% (Critical)**`,
        `- Downstream Riverbank Flood Watch Exposure: **~5,000 residents**`,
        `- BRO Single-Lane Highway Clearance Window: **8–12 hours**`
      ].join("\n");
    }, [activeDossier, activeRole, sitRepFormat]);

    const streamEntries = [
      { key: "hydrology", data: activeDossier.streams.hydrology },
      { key: "satellite", data: activeDossier.streams.satellite },
      { key: "social", data: activeDossier.streams.social },
      { key: "sitrep", data: activeDossier.streams.sitrep },
      { key: "infrastructure", data: activeDossier.streams.infrastructure }
    ];

    const levelShort = String(activeRole.authorityLevel || "").split(" · ")[0];
    const accessChip = isCitizenRole ? "Restricted" : selectedRoleId === "researcher" ? "View only" : null;
    const cardCls = "bg-surface border border-line rounded-lg p-4";
    const chipCls = "px-2 py-0.5 rounded-md bg-surface2 border border-line text-[11px] font-semibold text-ink2";

    const headerRow = (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-extrabold text-ink tracking-tight">Event Intelligence</h1>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-ink text-surface font-mono text-[11px] font-bold">{levelShort}</span>
          {accessChip && (
            <span className="px-2 py-0.5 rounded-md bg-warn-soft text-warn border border-warn/30 text-[11px] font-bold">
              {accessChip}
            </span>
          )}
        </div>
      </div>
    );

    const eventSelectorRow = (
      <div className={`${cardCls} flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeDossier.id}
            onChange={e => setSelectedEventId(e.target.value)}
            aria-label="Event"
            className="bg-surface2 text-ink border border-line-strong rounded-md px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-accent w-full sm:w-auto sm:min-w-[280px] max-w-full"
          >
            {allDossiers.map(d => (
              <option key={d.id} value={d.id}>
                {`${d.code} — ${asText(d.title)}`}
              </option>
            ))}
          </select>
          <span className="px-2 py-0.5 rounded-md bg-surface2 border border-line font-mono text-xs font-bold text-ink">
            {activeDossier.code}
          </span>
          <SeverityBadge severity={activeDossier.severity} />
          <StatusBadge status={activeDossier.status} />
          <span className="text-[11px] font-mono font-semibold text-muted">
            {Math.round(activeDossier.confidence * 100)}% conf
          </span>
        </div>
        {!isCitizenRole && (
          <div className="flex flex-wrap items-center gap-2">
            {onNavigate && (
              <button type="button" onClick={() => onNavigate("hazard-monitoring", { eventId: activeDossier.code, sensorId: activeDossier.triggerSensorId, fromScreen: "MEI-01" })} className="px-2.5 py-1 rounded-md bg-surface2 border border-line hover:border-accent text-xs font-semibold text-ink">Hazards</button>
            )}
            {onNavigate && (
              <button type="button" onClick={() => onNavigate("social-intelligence", { eventId: activeDossier.code, postId: activeDossier.triggerPostId, fromScreen: "MEI-01" })} className="px-2.5 py-1 rounded-md bg-surface2 border border-line hover:border-accent text-xs font-semibold text-ink">Social</button>
            )}
            <button type="button" onClick={() => setShowSitRepModal(true)} className="px-2.5 py-1 rounded-md bg-surface2 border border-line-strong hover:border-accent text-xs font-bold text-ink">
              Export SitRep
            </button>
            {canBroadcastFlashAlert ? (
              <button
                type="button"
                onClick={() => {
                  setAlertBroadcasted(true);
                  handleExecuteDecision({
                    id: "ACT-FLASH-CAP",
                    label: `Broadcast CAP Flash Warning (${activeDossier.code})`,
                    target: activeDossier.district,
                    lineage: "OFFICIAL-GROUND-TRUTH"
                  });
                }}
                className="px-2.5 py-1 rounded-md bg-crit text-white text-xs font-bold hover:opacity-95"
              >
                {alertBroadcasted ? "Flash Alert Sent ✓" : "Flash Warning"}
              </button>
            ) : (
              <button type="button" disabled title="Locked" className="px-2.5 py-1 rounded-md bg-surface2 border border-line text-xs font-bold text-muted opacity-60 cursor-not-allowed">
                🔒 Flash Warning
              </button>
            )}
          </div>
        )}
      </div>
    );

    const alertStrip = alertBroadcasted && (
      <div className="px-3 py-2 rounded-lg bg-crit-soft border border-crit/40 flex items-center justify-between text-xs text-crit font-semibold">
        <span>Flash warning sent for {activeDossier.code} · A. Kanojia</span>
        <button type="button" onClick={() => setAlertBroadcasted(false)} className="text-[11px] underline ml-3">Dismiss</button>
      </div>
    );

    const handshakeBar = handshakeBanner && (
      <div className="px-3 py-1.5 rounded-lg bg-accent-soft/70 border border-accent/40 flex items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className="px-1.5 py-0.5 rounded-md bg-accent text-white font-mono text-[10px] font-bold">{handshakeBanner.fromScreen}</span>
          <span className="px-1.5 py-0.5 rounded-md bg-surface border border-line font-mono text-[11px] font-semibold text-ink">
            {handshakeBanner.sensorId || handshakeBanner.postId || activeDossier.triggerSensorId}
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-surface border border-line text-[11px] font-semibold text-ink2 capitalize">{focusedStream}</span>
          <span className="px-1.5 py-0.5 rounded-md bg-surface border border-line font-mono text-[11px] text-muted">{handshakeBanner.highlightTimestamp}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {onNavigate && (
            <button
              type="button"
              onClick={() =>
                onNavigate(
                  handshakeBanner.fromScreen === "SMI-01" ? "social-intelligence" : "hazard-monitoring",
                  { eventId: activeDossier.code, fromScreen: "MEI-01" }
                )
              }
              className="px-2 py-0.5 rounded-md bg-surface border border-line text-[11px] font-semibold text-ink hover:border-accent"
            >
              &larr; Back
            </button>
          )}
          <button type="button" onClick={() => setHandshakeBanner(null)} aria-label="Dismiss" className="px-1.5 py-0.5 rounded-md bg-surface border border-line text-[11px] text-muted hover:text-ink">
            &times;
          </button>
        </div>
      </div>
    );

    // Citizen: public summary, safe routes and shelter locator only
    if (isCitizenRole) {
      return (
        <div className="p-5 space-y-3 max-w-[1640px] mx-auto text-ink">
          {headerRow}
          {eventSelectorRow}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className={`${cardCls} space-y-1`}>
              <div className="text-[11px] uppercase font-bold text-emerald-800">Public summary</div>
              <div className="font-bold text-sm text-ink">{activeDossier.title}</div>
              <div className="text-ink2">{activeDossier.district}. Avoid riverbanks and follow police guidance.</div>
            </div>
            <div className={`${cardCls} space-y-1`}>
              <div className="text-[11px] uppercase font-bold text-warn">Safe routes</div>
              <div className="font-bold text-sm text-ink">{activeDossier.streams.infrastructure.primaryMetric}</div>
              <div className="text-ink2">Use the Chamba – Tehri – Srinagar alternate route.</div>
            </div>
            <div className={`${cardCls} space-y-1`}>
              <div className="text-[11px] uppercase font-bold text-ok">Shelters</div>
              <div className="font-bold text-sm text-ink">GMVN Syalsaur, GIC Augustmuni, Devprayag</div>
              <div className="text-ink2">750+ beds. Helpline <strong>1070</strong> / <strong>112</strong>.</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-5 space-y-3 max-w-[1640px] mx-auto text-ink">
        {headerRow}
        {handshakeBar}
        {eventSelectorRow}
        {alertStrip}

        {/* Decisions + audit trail */}
        <div className={`${cardCls} space-y-3`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {activeRole.decisions.map(dec => {
              const executed = executedActions[dec.id];
              return (
                <div key={dec.id} className="p-2.5 rounded-lg bg-surface2 border border-line flex items-center justify-between gap-2" title={dec.target}>
                  <span className="text-xs font-semibold text-ink truncate">{dec.label}</span>
                  <button
                    type="button"
                    onClick={() => handleExecuteDecision(dec)}
                    className="px-2.5 py-1 rounded-md bg-accent text-white text-[11px] font-semibold hover:opacity-90 shrink-0"
                  >
                    {executed ? "Done ✓" : "Execute"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Command sign-off", ok: selectedRoleId === "authority" },
              { label: "SAR weights", ok: canTuneSarWeights },
              { label: "Field dispatch", ok: selectedRoleId === "response" || selectedRoleId === "authority" },
              { label: "Data export", ok: !isCitizenRole }
            ].map(c => (
              <button
                key={c.label}
                type="button"
                disabled={!c.ok}
                title={c.ok ? "Available" : "Locked"}
                className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${
                  c.ok ? "bg-ok-soft text-ok border-ok/30" : "bg-surface2 text-muted border-line opacity-60 cursor-not-allowed"
                }`}
              >
                {c.ok ? "✓" : "🔒"} {c.label}
              </button>
            ))}
            {canTuneSarWeights && (
              <div className="flex items-center gap-2 text-[11px] ml-auto">
                <span className="font-mono text-ink2">Δγ -{sarCoherenceWeight}</span>
                <input
                  type="range"
                  min="0.20"
                  max="0.65"
                  step="0.01"
                  value={sarCoherenceWeight}
                  onChange={e => setSarCoherenceWeight(Number(e.target.value))}
                  className="w-24 accent-blue-600"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleExecuteDecision({
                      id: "ACT-SAR-TUNE",
                      label: `Calibrated InSAR Coherence Weight (Δγ = -${sarCoherenceWeight})`,
                      target: activeDossier.streams.satellite.stationId,
                      lineage: "REMOTE-SENSED"
                    })
                  }
                  className="px-2 py-0.5 rounded-md bg-ink text-surface text-[11px] font-bold"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto border-t border-line pt-2">
            <table className="w-full text-[11px] text-left">
              <thead>
                <tr className="text-muted uppercase text-[10px]">
                  <th className="py-1 pr-3 font-bold">Time</th>
                  <th className="py-1 pr-3 font-bold">Action</th>
                  <th className="py-1 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {executionAuditLog.slice(0, 4).map(item => (
                  <tr key={item.id} className="border-t border-line">
                    <td className="py-1 pr-3 font-mono text-accent font-bold whitespace-nowrap">{item.time}</td>
                    <td className="py-1 pr-3 text-ink max-w-[560px] truncate" title={item.action}>{item.action}</td>
                    <td className="py-1 whitespace-nowrap text-ok font-semibold">Signed · {item.signer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. 5-STREAM MULTIMODAL FUSION MATRIX                                      */}
        {/* ========================================================================= */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="panel-title">Evidence Streams</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              
              {[
                { id: "all", label: "All 5 Streams" },
                { id: "hydrology", label: "1. Sensors (IMD/CWC)" },
                { id: "satellite", label: "2. Satellite SAR" },
                { id: "social", label: "3. Citizen SOS" },
                { id: "sitrep", label: "4. SITREP & UAV" },
                { id: "infrastructure", label: "5. Infrastructure" }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFocusedStream(tab.id)}
                  className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold ${
                    focusedStream === tab.id
                      ? "bg-ink text-surface border-ink"
                      : "bg-surface border-line text-ink2 hover:border-accent"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 items-stretch">
            {streamEntries.map(({ key, data }) => {
              const isFocused = focusedStream === key;
              const roleAccessLabel =
                (activeRole.streamAccess && activeRole.streamAccess[key]) || "READ-ONLY";

              return (
                <div
                  key={key}
                  onClick={() => setFocusedStream(isFocused ? "all" : key)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between h-full ${
                    isFocused
                      ? "bg-accent-soft/40 border-accent"
                      : "bg-surface border-line hover:border-accent"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <LineageBadge type={data.badge} />
                      <span className="px-1.5 py-px rounded-full bg-surface2 text-ink2 border border-line text-[9px] font-mono font-semibold">
                        {roleAccessLabel}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs text-ink">{String(data.title).replace(/^\d+\.\s*/, "").replace(/\s*\(.*\)\s*$/, "")}</h3>
                    <div className="p-2 rounded-md bg-surface2 border border-line">
                      <div className="font-mono text-[10px] text-muted truncate">{data.stationId}</div>
                      <div className="font-bold text-xs text-ink mt-0.5">{data.primaryMetric}</div>
                    </div>
                    <ul className="space-y-1 text-[11px] text-ink2 list-disc list-inside leading-snug">
                      {data.highlights.slice(0, 2).map((h, idx) => (
                        <li key={idx}>{h}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-2 pt-2 border-t border-line flex items-center justify-between text-[10px] font-mono">
                    <span className="text-muted truncate">{data.updatedAt}</span>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setInspectedEvidence({
                          streamKey: key,
                          ...data,
                          eventCode: activeDossier.code,
                          coordinates: activeDossier.coordinates
                        });
                      }}
                      className="text-accent font-bold hover:underline shrink-0 ml-2"
                    >
                      Details &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. UNIFIED MULTI-LAYER LEAFLET EXPLORER + KNOWLEDGE GRAPH ENTITY EXPLORER */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* LEFT 7 COLS: UNIFIED MULTI-LAYER GEOSPATIAL EXPLORER */}
          <div className="lg:col-span-7 bg-surface border border-line rounded-lg flex flex-col overflow-hidden">
            <div className="px-3.5 py-2.5 bg-surface2 border-b border-line flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="panel-title">Map</span>
                <span className="text-[11px] text-muted ml-2 font-mono">{activeDossier.elevation}</span>
              </div>
              <div className="flex items-center gap-1">
                {["light", "topo", "satellite"].map(bm => (
                  <button
                    key={bm}
                    type="button"
                    onClick={() => setBasemapKey(bm)}
                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] uppercase border ${
                      basemapKey === bm
                        ? "bg-ink text-surface border-ink font-bold"
                        : "bg-surface text-muted border-line hover:text-ink"
                    }`}
                  >
                    {bm}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Layer Toggle Bar */}
            <div className="px-3.5 py-2 bg-surface border-b border-line flex flex-wrap items-center gap-2 text-[11px]">
              
              {[
                { key: "epicenter", label: "Epicenter", dot: "bg-crit" },
                { key: "sensors", label: "Sensors", dot: "bg-sky-600" },
                { key: "sarFootprint", label: "SAR", dot: "bg-purple-600" },
                { key: "socialClusters", label: "SOS", dot: "bg-red-600" },
                { key: "sheltersAndBlocks", label: "Shelters / Blocks", dot: "bg-emerald-600" }
              ].map(layer => (
                <button
                  key={layer.key}
                  type="button"
                  onClick={() => toggleMapLayer(layer.key)}
                  className={`px-2 py-1 rounded-md border flex items-center gap-1.5 font-medium ${
                    mapLayersVisible[layer.key]
                      ? "bg-surface2 border-line-strong text-ink font-semibold"
                      : "bg-surface border-line text-muted opacity-60"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${layer.dot}`} />
                  <span>{layer.label}</span>
                </button>
              ))}
            </div>

            {/* Leaflet Container */}
            <div className="relative flex-1 min-h-[420px] w-full bg-surface2">
              <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />
            </div>

            <div className="px-3.5 py-2 bg-surface2 border-t border-line flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-muted">
              <span>
                {activeDossier.affectedArea} • {activeDossier.triggerSensorId}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView(
                      activeDossier.coordinates || [30.2849, 78.9867],
                      activeDossier.zoom || 10
                    );
                  }
                }}
                className="text-accent font-bold hover:underline"
              >
                Recenter
              </button>
            </div>
          </div>

          {/* RIGHT 5 COLS: KNOWLEDGE GRAPH ENTITY EXPLORER */}
          <div className="lg:col-span-5 bg-surface border border-line rounded-lg flex flex-col justify-between overflow-hidden">
            <div className="px-3.5 py-2.5 bg-surface2 border-b border-line flex items-center justify-between">
              <div>
                <span className="panel-title">Knowledge Graph Entity Explorer</span>
              </div>
              <LineageBadge type="OFFICIAL-SYNTHESIS" />
            </div>

            <div className="p-3.5 space-y-3 flex-1">
              {/* Interactive Connected Graph Nodes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {knowledgeGraph.nodes.map(node => {
                  const isSelected = node.id === selectedKgNode.id;
                  const isConnected = selectedKgNode.connections.includes(node.id);
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setSelectedKgNodeId(node.id)}
                      className={`p-2.5 rounded-md border text-left transition-all ${
                        isSelected
                          ? "bg-accent-soft border-2 border-accent shadow-sm"
                          : isConnected
                          ? "bg-surface2 border-accent/50 hover:border-accent"
                          : "bg-surface border-line opacity-75 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[9px] uppercase font-bold text-muted">{node.type}</span>
                        {isConnected && !isSelected && (
                          <span className="text-[9px] font-mono text-accent font-bold">LINKED</span>
                        )}
                      </div>
                      <div className="font-bold text-xs text-ink truncate mt-0.5">{node.label}</div>
                      <div className="text-[10px] text-muted truncate">{node.subtitle}</div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Entity Detail Card */}
              <div className="p-3 rounded-md bg-surface2 border border-line space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-muted">{selectedKgNode.type}</span>
                    <h4 className="font-extrabold text-sm text-ink">{selectedKgNode.label}</h4>
                  </div>
                  <LineageBadge type={selectedKgNode.lineage} />
                </div>
                <div className="text-xs text-ink2">{selectedKgNode.subtitle}</div>
                <div className="p-2 rounded-md bg-surface border border-line font-mono text-[11px] text-ink">
                  {selectedKgNode.metrics}
                </div>
              </div>

              {/* Relational Edges List */}
              <div className="space-y-1.5">
                <div className="font-mono text-[10px] uppercase font-bold text-muted">
                  Relations ({knowledgeGraph.edges.length})
                </div>
                {knowledgeGraph.edges.map((edge, idx) => (
                  <div
                    key={idx}
                    className="px-2.5 py-1.5 rounded-md bg-surface2 border border-line flex items-center justify-between text-[11px]"
                  >
                    <span className="font-mono font-bold text-ink">{edge.from.replace("KG-", "")}</span>
                    <span className="text-muted italic px-2">&mdash; {edge.relation} &rarr;</span>
                    <span className="font-mono font-bold text-accent">{edge.to.replace("KG-", "")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. MULTI-STREAM CHRONOLOGICAL TIMELINE + AI CASCADE RISK FORECAST         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* LEFT 7 COLS: MULTI-STREAM CHRONOLOGICAL TIMELINE */}
          <div className="lg:col-span-7 bg-surface border border-line rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5">
              <div>
                <span className="panel-title">Timeline</span>
              </div>
              {/* Chronological Scrubber */}
              <div className="flex flex-wrap items-center gap-1">
                {["ALL", "T-24h", "T-6h", "T-0", "T+12h", "T+24h"].map(win => (
                  <button
                    key={win}
                    type="button"
                    onClick={() => setScrubberWindow(win)}
                    className={`px-2 py-1 rounded-md font-mono text-[10px] border ${
                      scrubberWindow === win
                        ? "bg-accent text-white border-accent font-bold"
                        : "bg-surface2 text-ink2 border-line hover:border-accent"
                    }`}
                  >
                    {win}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {timelineItems.map(step => (
                <div
                  key={step.id}
                  className="p-3 rounded-md bg-surface2 border border-line hover:border-accent transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-ink text-surface font-mono text-[10px] font-bold">
                        {step.window}
                      </span>
                      <span className="font-mono text-xs font-bold text-ink">{step.time}</span>
                      <span className="px-2 py-0.5 rounded-md bg-accent-soft text-accent font-semibold text-[11px]">
                        {step.streamLabel}
                      </span>
                      <LineageBadge type={step.lineage} />
                    </div>
                    <span className="text-[11px] text-muted font-medium">{step.agency}</span>
                  </div>

                  <h4 className="font-bold text-sm text-ink mt-1.5">{step.title}</h4>
                  <p className="text-xs text-ink2 mt-1 leading-relaxed">{step.detail}</p>

                  <div className="mt-2 pt-2 border-t border-line flex items-center justify-between text-[11px]">
                    <span className="font-mono text-muted">{step.id}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setInspectedEvidence({
                          title: step.title,
                          badge: step.lineage,
                          stationId: step.id,
                          primaryMetric: `${step.window} (${step.time}) — ${step.agency}`,
                          highlights: [step.detail, JSON.stringify(step.rawPayload)],
                          updatedAt: step.time,
                          confidence: "96%"
                        })
                      }
                      className="font-semibold text-accent hover:underline"
                    >
                      Details &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT 5 COLS: AI SYNTHESIS & 24-48H CASCADE RISK FORECAST */}
          <div className="lg:col-span-5 bg-surface border border-line rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <div>
                <span className="panel-title">AI Forecast (24–48h)</span>
              </div>
              <div className="flex items-center gap-1">
                <LineageBadge type="AI-SYNTHESIS" />
                <LineageBadge type="FORECAST" />
              </div>
            </div>

            {/* Executive AI Narrative */}
            <div className="p-3 rounded-md bg-surface2 border border-line border-l-4 border-l-accent space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase font-bold text-accent">
                  Synthesis
                </span>
                <span className="font-mono text-[10px] font-bold text-ok">
                  Confidence {Math.round(activeDossier.confidence * 100)}%
                </span>
              </div>
              <p className="text-xs text-ink leading-relaxed">{activeDossier.executiveSummary}</p>
              <div className="pt-1 flex flex-wrap gap-1.5 text-[10px] font-mono text-muted">
                
                <span className="px-1.5 bg-surface border border-line rounded text-ink2">
                  {activeDossier.triggerSensorId}
                </span>
                <span className="px-1.5 bg-surface border border-line rounded text-ink2">
                  {activeDossier.streams.satellite.stationId}
                </span>
                <span className="px-1.5 bg-surface border border-line rounded text-ink2">
                  {activeDossier.triggerPostId}
                </span>
                <span className="px-1.5 bg-surface border border-line rounded text-ink2">
                  {activeDossier.streams.sitrep.stationId}
                </span>
              </div>
            </div>

            {/* Cascade Probability Bars */}
            <div className="space-y-2.5">
              {[
                {
                  label: "Secondary Slope / Wedge Failure Risk (Next 24h)",
                  prob: 89,
                  tone: "bg-crit",
                  note: "High pore-water pressure (94.2%) along NH-107 / NH-58 cut-slopes"
                },
                {
                  label: "Downstream Riverbank Inundation Surge",
                  prob: 76,
                  tone: "bg-warn",
                  note: "~5,000 residents in watch corridor; Srinagar Dam spillway regulating peak"
                },
                {
                  label: "Extended Highway Corridor Isolation (above 12h)",
                  prob: 64,
                  tone: "bg-amber-500",
                  note: "6 BRO excavators clearing 14,500 m³ boulder fan; Chamba bypass active"
                },
                {
                  label: "Rural 11kV Power & Telecom Micro-Outage Cascade",
                  prob: 42,
                  tone: "bg-sky-600",
                  note: "DG backup running in 5 Gram Panchayats; BSNL/Jio towers at 94% uptime"
                }
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-md bg-surface2 border border-line">
                  <div className="flex items-center justify-between text-xs font-bold text-ink">
                    <span>{item.label}</span>
                    <span className="font-mono">{item.prob}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface rounded-full overflow-hidden mt-1.5 border border-line">
                    <div className={`h-full ${item.tone}`} style={{ width: `${item.prob}%` }} />
                  </div>
                  <div className="text-[11px] text-muted mt-1">{item.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 7. RAW EVIDENCE / SATELLITE SCENE INSPECTOR MODAL                         */}
        {/* ========================================================================= */}
        {inspectedEvidence && (
          <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-surface border border-line-strong rounded-md max-w-xl w-full p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-line pb-2.5">
                <div className="flex items-center gap-2">
                  <LineageBadge type={inspectedEvidence.badge || "OFFICIAL-GROUND-TRUTH"} />
                  <h3 className="font-extrabold text-sm text-ink">{inspectedEvidence.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedEvidence(null)}
                  className="px-2 py-0.5 rounded bg-surface2 border border-line text-xs font-mono"
                >
                  Close [X]
                </button>
              </div>
              <div className="p-3 rounded bg-surface2 border border-line font-mono text-xs space-y-1">
                <div>
                  <span className="text-muted">Source:</span>{" "}
                  <strong className="text-ink">{inspectedEvidence.stationId}</strong>
                </div>
                <div>
                  <span className="text-muted">Metric:</span>{" "}
                  <strong className="text-accent">{inspectedEvidence.primaryMetric}</strong>
                </div>
                <div>
                  <span className="text-muted">Confidence:</span>{" "}
                  <strong className="text-ok">{inspectedEvidence.confidence}</strong>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-ink2">
                {(inspectedEvidence.highlights || []).map((line, i) => (
                  <div key={i} className="p-2 rounded bg-surface2 border border-line">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 8. EXPORTABLE JSON / MARKDOWN OPERATIONAL SITREP MODAL                    */}
        {/* ========================================================================= */}
        {showSitRepModal && (
          <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-surface border border-line-strong rounded-md max-w-2xl w-full p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-line pb-2.5">
                <div>
                  <h3 className="font-extrabold text-base text-ink">
                    SitRep — {activeDossier.code}
                  </h3>
                  <p className="text-xs text-muted">
                    {activeRole.authorityLevel} &bull; A. Kanojia
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSitRepFormat("markdown")}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                      sitRepFormat === "markdown"
                        ? "bg-ink text-surface border-ink"
                        : "bg-surface2 text-ink border-line"
                    }`}
                  >
                    Markdown (.md)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSitRepFormat("json")}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                      sitRepFormat === "json"
                        ? "bg-ink text-surface border-ink"
                        : "bg-surface2 text-ink border-line"
                    }`}
                  >
                    JSON Dossier (.json)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSitRepModal(false)}
                    className="px-2.5 py-1 rounded bg-surface2 border border-line text-xs font-mono"
                  >
                    Close
                  </button>
                </div>
              </div>

              <pre className="p-3 rounded bg-surface2 border border-line font-mono text-[11px] text-ink overflow-x-auto max-h-[380px] whitespace-pre-wrap">
                {sitRepContent}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  window.DisasterViews = window.DisasterViews || {};
  window.DisasterViews.MultimodalEventView = MultimodalEventView;
  window.MultimodalEventView = MultimodalEventView;
})();
