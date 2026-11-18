// Disaster Intelligence Multimodal Platform â€” Screen HM-01: Hazard Monitoring & Analysis Dashboard
// Implements SRS-DASH-2026-V3 Screen Specification 1 (HM-01):
// - 6 SRS Role Decision & SLA Selector Bar (Hazard Analysts default)
// - Interactive Catchment, Hazard Type, Time Window & Data Source Filter Bar
// - 4 Executive KPI Cards with explicit lineage tags ([LIVE-SENSOR], [HISTORICAL], [FORECAST], [AI-ESTIMATED])
// - Interactive Leaflet Basin & Sensor Map with Catchment Polygons + Clickable Telemetry Pins
// - Synchronized Dual-Axis Hydrological Trend Chart (Rainfall mm/hr Bars + River Stage m Line + Warning/Danger Thresholds)
// - Predictive Runoff Risk Gauges (Flash Flood Probability, Slope Saturation / Landslide Susceptibility, Glacial Lake Outburst Risk)
// - Live Catchment Threshold Breaches with one-click drill-down to MEI-01 ('multimodal-intelligence')

(function() {
  const React = window.React;
  const { useState, useEffect, useRef, useMemo } = React;
  const { SeverityBadge, EpistemicBadge, StatusBadge } = window.DisasterComponents || window;

  // Standardized SRS Lineage Badge component
  const LineageBadge = ({ type = "LIVE-SENSOR" }) => {
    const styles = {
      "LIVE-SENSOR": "bg-ok-soft text-ok border-ok/40",
      "HISTORICAL": "bg-surface2 text-ink2 border-line-strong",
      "FORECAST": "bg-accent-soft text-accent border-accent/40",
      "AI-ESTIMATED": "bg-warn-soft text-warn border-warn/40",
      "REMOTE-SENSED": "bg-info-soft text-info border-info/40",
      "SIMULATED": "bg-surface3 text-muted border-line"
    };
    const cls = styles[type] || styles["LIVE-SENSOR"];
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${cls}`}>
        {({ "LIVE-SENSOR": "LIVE", "HISTORICAL": "HISTORY", "AI-ESTIMATED": "AI", "REMOTE-SENSED": "SATELLITE" })[type] || type}
      </span>
    );
  };

  // 6 SRS User Roles & Decision Matrix for HM-01 (Officer: Ashutosh Kanojia [AK] across all 6 roles)
  const SRS_ROLES = [
    {
      roleId: "analyst",
      id: "Hazard Analysts",
      roleTitle: "Hazard Analyst",
      shortLabel: "Hazard Analysts",
      officerName: "Ashutosh Kanojia",
      initials: "AK",
      authorityLevel: "LEVEL 4 Â· SCIENTIFIC CALIBRATION",
      clearanceBadge: "ANALYST READ/WRITE & CALIBRATION",
      agency: "IMD / CWC / GSI",
      sla: "High (1h - 6h Cycles)",
      access: "Analyst Read/Write & Calibration",
      decisions: [
        "Validate automated rainfall threshold breaches (&gt; 64.5 mm/hr extreme intensity)",
        "Confirm river gauge danger-level crossings across Alaknanda &amp; Mandakini",
        "Verify Bhoonidhi SAR coherence loss for landslide slope reactivation",
        "Tune catchment runoff and flash-flood predictive model thresholds"
      ],
      focusMetric: "Peak 1h Rainfall &amp; Stage Hydrograph"
    },
    {
      roleId: "authority",
      id: "Disaster Management Authorities",
      roleTitle: "Disaster Management Authority",
      shortLabel: "Disaster Management Authorities",
      officerName: "Ashutosh Kanojia",
      initials: "AK",
      authorityLevel: "LEVEL 5 Â· EXECUTIVE",
      clearanceBadge: "EXECUTIVE / BROADCAST SIGN-OFF",
      agency: "SEOC Director / District Magistrates",
      sla: "Immediate (&lt; 5 Minutes)",
      access: "Executive / Broadcast Sign-Off",
      decisions: [
        "Declare district-wide Red/Orange alert levels based on basin breaches",
        "Authorize mandatory evacuation orders for downstream riverfront tehsils",
        "Mobilize NDRF/SDRF battalions to high-risk catchments in Rudraprayag &amp; Chamoli",
        "Approve official CAP early warning broadcasts via NDMA SACHET"
      ],
      focusMetric: "Catchments in Alert &amp; Rivers Above Danger Mark"
    },
    {
      roleId: "response",
      id: "Emergency Response Teams",
      roleTitle: "Emergency Response Team",
      shortLabel: "Emergency Response Teams",
      officerName: "Ashutosh Kanojia",
      initials: "AK",
      authorityLevel: "LEVEL 4 Â· TACTICAL DISPATCH",
      clearanceBadge: "FIELD OPERATOR / TACTICAL DISPATCH",
      agency: "SDRF / BRO / Police EOC",
      sla: "Critical (&lt; 15 Minutes)",
      access: "Field Operator / Tactical Dispatch",
      decisions: [
        "Pre-position flood rescue boats at Srinagar and Devprayag confluences",
        "Dispatch BRO heavy excavators to NH-107 and NH-58 slope saturation hotspots",
        "Select safe transit corridors avoiding inundated bridges and active slide zones",
        "Verify ground water rise reports against CWC automated gauge telemetry"
      ],
      focusMetric: "Danger Breach Pins &amp; Slope Saturation Index"
    },
    {
      roleId: "researcher",
      id: "Researchers",
      roleTitle: "Disaster Researcher",
      shortLabel: "Researchers",
      officerName: "Ashutosh Kanojia",
      initials: "AK",
      authorityLevel: "LEVEL 3 Â· RESEARCH SANDBOX",
      clearanceBadge: "RESEARCH READ & DATASET EXPORT",
      agency: "NIH Roorkee / IIT / AI Evaluators",
      sla: "Deliberate (Post-Event / Batch)",
      access: "Research Read & Feature Export",
      decisions: [
        "Benchmark AI flash-flood runoff predictions against observed CWC stage peaks",
        "Analyze decadal monsoon anomaly return periods across Garhwal &amp; Kumaon basins",
        "Evaluate false-positive vs. false-negative rates of cloudburst triggers",
        "Export calibrated multi-sensor hydro-meteorological time series"
      ],
      focusMetric: "AI Runoff Forecast vs. Historical Baselines"
    },
    {
      roleId: "data-admin",
      id: "Data Administrators",
      roleTitle: "Data Administrator",
      shortLabel: "Data Administrators",
      officerName: "Ashutosh Kanojia",
      initials: "AK",
      authorityLevel: "LEVEL 5 Â· PIPELINE ADMIN",
      clearanceBadge: "SYSTEM ADMIN / PIPELINE CONTROL",
      agency: "SEOC IT / IoT Telemetry Ops",
      sla: "Continuous (24/7 Monitoring)",
      access: "System Admin / Pipeline Control",
      decisions: [
        "Monitor 142 AWS &amp; CWC telemetry station heartbeats and packet drop-offs",
        "Verify API ingestion latency from IMD Mausam, CWC FFS, and MOSDAC",
        "Quarantine out-of-spec ultrasonic river gauge spikes before AI fusion",
        "Audit provenance and lineage tagging across live and fallback streams"
      ],
      focusMetric: "Active Telemetry Stations (142/146 Online)"
    },
    {
      roleId: "citizen",
      id: "Common Citizens",
      roleTitle: "Common Citizen",
      shortLabel: "Common Citizens",
      officerName: "Ashutosh Kanojia",
      initials: "AK",
      authorityLevel: "LEVEL 1 Â· PUBLIC CITIZEN",
      clearanceBadge: "PUBLIC ADVISORY PORTAL (READ-ONLY)",
      agency: "Residents / Pilgrims / Volunteers",
      sla: "High (Safety-Critical Push Alerts)",
      access: "Public Advisory Portal (Read-Only)",
      decisions: [
        "Check pilgrimage corridor weather safety along Kedarnath (NH-107) &amp; Badrinath (NH-58)",
        "Heed riverfront distance advisories when gauges cross Warning Level",
        "Locate nearest elevated relief shelters in Ukhimath, Joshimath, and Tilwara",
        "Access verified IMD/USDMA weather bulletins without social media rumors"
      ],
      focusMetric: "Public Basin Safety Status &amp; Highway Weather"
    }
  ];

  // Role ID normalizer supporting both short role IDs ('analyst') and display labels ('Hazard Analysts')
  const ROLE_ID_LOOKUP = {
    "analyst": "analyst",
    "Hazard Analysts": "analyst",
    "Hazard Analyst": "analyst",
    "authority": "authority",
    "Disaster Management Authorities": "authority",
    "Disaster Management Authority": "authority",
    "response": "response",
    "Emergency Response Teams": "response",
    "Emergency Response Team": "response",
    "researcher": "researcher",
    "Researchers": "researcher",
    "Disaster Researcher": "researcher",
    "data-admin": "data-admin",
    "Data Administrators": "data-admin",
    "Data Administrator": "data-admin",
    "citizen": "citizen",
    "Common Citizens": "citizen",
    "Common Citizen": "citizen"
  };

  const normalizeRoleId = (val) => ROLE_ID_LOOKUP[val] || "analyst";

  // Deterministic Uttarakhand Telemetry Stations & Hydrographs
  const TELEMETRY_STATIONS = [
    {
      stationId: "UK-RUD-04",
      name: "Basukedar / Kedarnath AWS-CWC",
      district: "Rudraprayag",
      catchment: "Mandakini",
      hazardType: "Cloudburst",
      source: "IMD AWS",
      lat: 30.4392,
      lon: 79.0563,
      elevationM: 1420,
      status: "Danger Breach",
      pinColor: "red",
      rainfall1h: 82.4,
      rainfall24h: 214.6,
      waterLevelM: 628.2,
      warningLevelM: 625.0,
      dangerLevelM: 626.0,
      dischargeCumecs: 1840,
      trendDelta: "+1.85m / 3h",
      lineage: "LIVE-SENSOR",
      eventId: "EV-2026-0814-FLD",
      lastUpdated: "2 mins ago",
      hourlyLabels: ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00"],
      hourlyRain: [18.2, 26.5, 42.0, 68.4, 82.4, 64.0, 48.5, 36.2],
      hourlyStage: [623.8, 624.3, 625.1, 626.4, 627.6, 628.2, 627.9, 627.4]
    },
    {
      stationId: "UK-CHM-02",
      name: "Joshimath / Vishnuprayag Barrage Gauge",
      district: "Chamoli",
      catchment: "Alaknanda",
      hazardType: "Flash Flood",
      source: "CWC Telemetry",
      lat: 30.5565,
      lon: 79.5660,
      elevationM: 1890,
      status: "Danger Breach",
      pinColor: "red",
      rainfall1h: 68.5,
      rainfall24h: 178.2,
      waterLevelM: 1384.6,
      warningLevelM: 1382.0,
      dangerLevelM: 1383.5,
      dischargeCumecs: 2190,
      trendDelta: "+1.42m / 3h",
      lineage: "LIVE-SENSOR",
      eventId: "EV-2026-0814-LSD",
      lastUpdated: "1 min ago",
      hourlyLabels: ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00"],
      hourlyRain: [14.0, 22.8, 39.5, 58.0, 68.5, 52.4, 41.0, 29.5],
      hourlyStage: [1381.1, 1381.6, 1382.3, 1383.2, 1384.1, 1384.6, 1384.4, 1384.0]
    },
    {
      stationId: "UK-TEH-07",
      name: "Devprayag Sangam CWC Master Gauge",
      district: "Tehri Garhwal",
      catchment: "Alaknanda",
      hazardType: "Riverine Flood",
      source: "CWC Telemetry",
      lat: 30.1469,
      lon: 78.5992,
      elevationM: 472,
      status: "Danger Breach",
      pinColor: "red",
      rainfall1h: 54.8,
      rainfall24h: 146.0,
      waterLevelM: 463.9,
      warningLevelM: 462.0,
      dangerLevelM: 463.0,
      dischargeCumecs: 3420,
      trendDelta: "+1.15m / 3h",
      lineage: "LIVE-SENSOR",
      eventId: "EV-2026-0814-FLD",
      lastUpdated: "3 mins ago",
      hourlyLabels: ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00"],
      hourlyRain: [12.5, 19.0, 31.2, 44.6, 54.8, 49.2, 38.0, 27.4],
      hourlyStage: [460.8, 461.4, 462.1, 462.8, 463.4, 463.9, 463.8, 463.5]
    },
    {
      stationId: "UK-UTK-01",
      name: "Bhatwari / Uttarkashi Gorge Sensor",
      district: "Uttarkashi",
      catchment: "Bhagirathi",
      hazardType: "Landslide",
      source: "MOSDAC INSAT-3D",
      lat: 30.8081,
      lon: 78.6186,
      elevationM: 1580,
      status: "Watch",
      pinColor: "amber",
      rainfall1h: 52.0,
      rainfall24h: 132.4,
      waterLevelM: 1121.8,
      warningLevelM: 1121.0,
      dangerLevelM: 1122.5,
      dischargeCumecs: 1190,
      trendDelta: "+0.65m / 3h",
      lineage: "FORECAST",
      eventId: "EV-2026-0814-LSD",
      lastUpdated: "4 mins ago",
      hourlyLabels: ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00"],
      hourlyRain: [10.0, 18.4, 29.0, 41.2, 52.0, 44.8, 33.0, 24.0],
      hourlyStage: [1119.9, 1120.3, 1120.8, 1121.2, 1121.6, 1121.8, 1121.7, 1121.4]
    },
    {
      stationId: "UK-PIT-03",
      name: "Dharchula / Jauljibi Border Gauge",
      district: "Pithoragarh",
      catchment: "Kali / Sharda",
      hazardType: "Flash Flood",
      source: "GPM / ERA5",
      lat: 29.8475,
      lon: 80.5453,
      elevationM: 915,
      status: "Watch",
      pinColor: "amber",
      rainfall1h: 49.6,
      rainfall24h: 124.8,
      waterLevelM: 890.4,
      warningLevelM: 889.8,
      dangerLevelM: 891.5,
      dischargeCumecs: 1510,
      trendDelta: "+0.54m / 3h",
      lineage: "AI-ESTIMATED",
      eventId: "EV-2026-0814-FLD",
      lastUpdated: "5 mins ago",
      hourlyLabels: ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00"],
      hourlyRain: [9.5, 16.0, 27.4, 38.2, 49.6, 42.0, 31.5, 22.8],
      hourlyStage: [888.9, 889.2, 889.6, 890.0, 890.3, 890.4, 890.2, 889.9]
    },
    {
      stationId: "UK-HRD-09",
      name: "Haridwar Bhimgoda Barrage Telemetry",
      district: "Haridwar",
      catchment: "Alaknanda",
      hazardType: "Riverine Flood",
      source: "CWC Telemetry",
      lat: 29.9560,
      lon: 78.1790,
      elevationM: 296,
      status: "Normal",
      pinColor: "green",
      rainfall1h: 24.8,
      rainfall24h: 68.0,
      waterLevelM: 292.7,
      warningLevelM: 293.0,
      dangerLevelM: 294.0,
      dischargeCumecs: 2890,
      trendDelta: "+0.22m / 3h",
      lineage: "LIVE-SENSOR",
      eventId: "EV-2026-0814-FLD",
      lastUpdated: "2 mins ago",
      hourlyLabels: ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00"],
      hourlyRain: [6.0, 9.2, 14.5, 19.8, 24.8, 21.0, 16.4, 12.0],
      hourlyStage: [291.8, 292.0, 292.2, 292.4, 292.6, 292.7, 292.7, 292.6]
    },
    {
      stationId: "UK-DDN-05",
      name: "Dakpathar / Barkot Yamuna Basin AWS",
      district: "Dehradun / Uttarkashi",
      catchment: "Yamuna",
      hazardType: "Landslide",
      source: "Bhoonidhi SAR",
      lat: 30.5112,
      lon: 77.7950,
      elevationM: 510,
      status: "Normal",
      pinColor: "green",
      rainfall1h: 19.4,
      rainfall24h: 54.2,
      waterLevelM: 454.2,
      warningLevelM: 455.0,
      dangerLevelM: 456.0,
      dischargeCumecs: 640,
      trendDelta: "+0.10m / 3h",
      lineage: "HISTORICAL",
      eventId: "EV-2026-0814-LSD",
      lastUpdated: "6 mins ago",
      hourlyLabels: ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00"],
      hourlyRain: [4.2, 7.0, 11.4, 15.8, 19.4, 16.2, 12.5, 9.0],
      hourlyStage: [453.6, 453.7, 453.9, 454.0, 454.1, 454.2, 454.1, 454.0]
    }
  ];

  // Catchment Basin Polygons for Leaflet Map
  const CATCHMENT_POLYGONS = [
    {
      id: "Mandakini",
      name: "Mandakini River Catchment (Rudraprayag / Kedarnath)",
      status: "CRITICAL ALERT",
      color: "#DC2626",
      fillOpacity: 0.18,
      coords: [
        [30.78, 78.90],
        [30.80, 79.22],
        [30.35, 79.20],
        [30.26, 78.92]
      ]
    },
    {
      id: "Alaknanda",
      name: "Alaknanda Basin (Chamoli / Joshimath / Devprayag)",
      status: "DANGER BREACH",
      color: "#EA580C",
      fillOpacity: 0.16,
      coords: [
        [30.76, 79.24],
        [30.82, 79.85],
        [30.18, 79.48],
        [30.10, 78.55],
        [30.32, 78.88]
      ]
    },
    {
      id: "Bhagirathi",
      name: "Bhagirathi Basin (Uttarkashi / Tehri Dam Sector)",
      status: "ORANGE WATCH",
      color: "#D97706",
      fillOpacity: 0.14,
      coords: [
        [31.05, 78.35],
        [31.08, 79.05],
        [30.42, 78.88],
        [30.30, 78.32]
      ]
    },
    {
      id: "Kali / Sharda",
      name: "Kali / Sharda Basin (Pithoragarh / Dharchula)",
      status: "ORANGE WATCH",
      color: "#D97706",
      fillOpacity: 0.14,
      coords: [
        [30.30, 80.05],
        [30.35, 80.75],
        [29.45, 80.45],
        [29.50, 79.90]
      ]
    },
    {
      id: "Yamuna",
      name: "Upper Yamuna & Tons Catchment (Barkot / Dakpathar)",
      status: "NORMAL / ADVISORY",
      color: "#059669",
      fillOpacity: 0.12,
      coords: [
        [31.02, 77.75],
        [31.00, 78.32],
        [30.42, 78.28],
        [30.40, 77.70]
      ]
    }
  ];

  // Live Catchment Threshold Breaches & Anomalies
  const DEFAULT_ANOMALIES = [
    {
      id: "ANOM-HM-01",
      stationId: "UK-RUD-04",
      stationName: "Basukedar / Kedarnath AWS",
      catchment: "Mandakini",
      hazardType: "Cloudburst",
      source: "IMD AWS",
      title: "Extreme Cloudburst Intensity (82.4 mm/hr vs 64.5 mm/hr IMD Red Threshold)",
      metricReading: "82.4 mm/hr Â· Stage 628.2m (+2.2m above Danger)",
      severity: "Critical",
      lineage: "LIVE-SENSOR",
      eventId: "EV-2026-0814-FLD",
      timestamp: "23:32 IST",
      impactSummary: "Rapid flash-flood wave propagating toward Agastyamuni &amp; Rudraprayag Sangam within 75 mins."
    },
    {
      id: "ANOM-HM-02",
      stationId: "UK-CHM-02",
      stationName: "Joshimath / Vishnuprayag CWC",
      catchment: "Alaknanda",
      hazardType: "Flash Flood",
      source: "CWC Telemetry",
      title: "Alaknanda River Danger Level Breach (1384.6m vs 1383.5m Danger Mark)",
      metricReading: "1,384.6m Â· Discharge 2,190 cumecs",
      severity: "Critical",
      lineage: "LIVE-SENSOR",
      eventId: "EV-2026-0814-LSD",
      timestamp: "23:28 IST",
      impactSummary: "Toe erosion along NH-58 Badrinath corridor near Lambagarh; debris slide risk elevated."
    },
    {
      id: "ANOM-HM-03",
      stationId: "UK-TEH-07",
      stationName: "Devprayag Sangam Master Gauge",
      catchment: "Alaknanda",
      hazardType: "Riverine Flood",
      source: "CWC Telemetry",
      title: "Confluence Surge Above Danger Mark (463.9m vs 463.0m Danger Mark)",
      metricReading: "463.9m Â· Discharge 3,420 cumecs",
      severity: "High",
      lineage: "LIVE-SENSOR",
      eventId: "EV-2026-0814-FLD",
      timestamp: "23:20 IST",
      impactSummary: "Combined Alaknanda-Bhagirathi inflow surging; Rishikesh &amp; Haridwar barrages placed on high alert."
    },
    {
      id: "ANOM-HM-04",
      stationId: "UK-UTK-01",
      stationName: "Bhatwari / Uttarkashi Gorge",
      catchment: "Bhagirathi",
      hazardType: "Landslide",
      source: "Bhoonidhi SAR",
      title: "SAR Interferometric Coherence Loss &amp; Slope Saturation (91% Soil Moisture)",
      metricReading: "52.0 mm/hr Â· Stage 1,121.8m (Above Warning)",
      severity: "High",
      lineage: "AI-ESTIMATED",
      eventId: "EV-2026-0814-LSD",
      timestamp: "23:12 IST",
      impactSummary: "Bhoonidhi Sentinel-1/RISAT-1A pass detects 18mm slope creep on Gangotri highway (NH-34)."
    },
    {
      id: "ANOM-HM-05",
      stationId: "UK-PIT-03",
      stationName: "Dharchula / Kali River Gauge",
      catchment: "Kali / Sharda",
      hazardType: "Flash Flood",
      source: "GPM / ERA5",
      title: "Upper Kali Catchment Convective Cell &amp; Warning Stage Crossing",
      metricReading: "49.6 mm/hr Â· Stage 890.4m (+0.6m above Warning)",
      severity: "Moderate",
      lineage: "FORECAST",
      eventId: "EV-2026-0814-FLD",
      timestamp: "22:55 IST",
      impactSummary: "GPM IMERG + MOSDAC nowcast projects +1.1m additional river rise over next 4 hours."
    }
  ];

  // Predictive Runoff & Geohazard Risk Gauges
  const PREDICTIVE_GAUGES = [
    {
      id: "flash-flood-prob",
      label: "Flash Flood Probability",
      catchmentFocus: "Mandakini & Alaknanda",
      score: 89,
      level: "Critical Risk",
      color: "#DC2626",
      lineage: "AI-ESTIMATED",
      modelInfo: "HEC-HMS + LSTM Catchment Runoff Model (Lead time: 90 mins)",
      detail: "89% probability of overbank inundation at Tilwara, Agastyamuni, and Srinagar ghats."
    },
    {
      id: "slope-saturation",
      label: "Slope Saturation / Landslide Susceptibility",
      catchmentFocus: "NH-107 & NH-58 Corridors",
      score: 78,
      level: "High Vulnerability",
      color: "#EA580C",
      lineage: "AI-ESTIMATED",
      modelInfo: "GSI Antecedent Rainfall + Bhoonidhi SAR Coherence Fusion",
      detail: "Antecedent 24h rainfall exceeds 180mm on 38-degree fractured phyllite slopes."
    },
    {
      id: "glof-risk",
      label: "Glacial Lake Outburst Risk",
      catchmentFocus: "Upper Mandakini / Vasudhara",
      score: 42,
      level: "Moderate Watch",
      color: "#D97706",
      lineage: "FORECAST",
      modelInfo: "ISRO NRSC Moraine Dam Thermal & SAR Backscatter Monitor",
      detail: "High-altitude warm rain spell (0-degree isotherm at 4,600m); moraine freeboard stable."
    }
  ];

  const HazardMonitoringView = ({ onNavigate, drillContext, activeRoleId = 'analyst' }) => {
    // Active SRS Role Lens strictly bound to global TopBar activeRoleId
    const activeRole = normalizeRoleId(activeRoleId);

    // Interactive Multi-Role Authority, Calibration & Decision Execution States
    const [rainfallDangerThreshold, setRainfallDangerThreshold] = useState(65);
    const [sensorCalibrationOffsetM, setSensorCalibrationOffsetM] = useState(0.0);
    const [quarantinedSensors, setQuarantinedSensors] = useState([]);
    const [workerLatencyMs, setWorkerLatencyMs] = useState(240);
    const [packetDropRate, setPacketDropRate] = useState("0.04%");
    const [activeBiasComparison, setActiveBiasComparison] = useState("IMD_VS_GPM");
    const [exportedDatasetFormat, setExportedDatasetFormat] = useState(null);
    const [catchmentRedAlertDeclared, setCatchmentRedAlertDeclared] = useState(false);
    const [evacuationOrdered, setEvacuationOrdered] = useState(false);
    const [sdrfBoatsStaged, setSdrfBoatsStaged] = useState(false);
    const [actionFeedbackBanner, setActionFeedbackBanner] = useState(null);
    const [decisionExecutionLog, setDecisionExecutionLog] = useState([
      {
        id: "DEC-HM-INIT-01",
        timestamp: "23:34 IST",
        officer: "Ashutosh Kanojia (Hazard Analyst)",
        initials: "AK",
        roleId: "analyst",
        authorityLevel: "LEVEL 4 Â· SCIENTIFIC CALIBRATION",
        actionTitle: "Validated Extreme Cloudburst Threshold Crossing (82.4 mm/hr at UK-RUD-04)",
        target: "Mandakini Basin Â· Station UK-RUD-04",
        status: "VERIFIED & LOGGED"
      },
      {
        id: "DEC-HM-INIT-02",
        timestamp: "23:36 IST",
        officer: "Ashutosh Kanojia (Disaster Management Authority)",
        initials: "AK",
        roleId: "authority",
        authorityLevel: "LEVEL 5 Â· EXECUTIVE",
        actionTitle: "Placed Rudraprayag & Chamoli Downstream Tehsils on Pre-Evacuation Standby",
        target: "Mandakini & Alaknanda Catchments",
        status: "SIGNED OFF"
      }
    ]);

    // Interactive Filter Bar States
    const [catchmentFilter, setCatchmentFilter] = useState("All Catchments");
    const [hazardFilter, setHazardFilter] = useState("All Hazards");
    const [timeRange, setTimeRange] = useState("Last 24h");
    const [sourceFilter, setSourceFilter] = useState("All Sources");

    // Selected Station for Inspector & Dual-Axis Hydrograph
    const [selectedStationId, setSelectedStationId] = useState("UK-RUD-04");
    const [basemapStyle, setBasemapStyle] = useState("terrain");
    const [showCatchmentPolygons, setShowCatchmentPolygons] = useState(true);
    const [showIsohyetOverlay, setShowIsohyetOverlay] = useState(true);

    // Live API Data + Deterministic Fallback State
    const [liveEventsCount, setLiveEventsCount] = useState(34);
    const [liveModalityCount, setLiveModalityCount] = useState(142);
    const [lastSyncTime, setLastSyncTime] = useState("23:38 IST");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Refs for Leaflet Map & Chart.js Canvas
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const tileLayerRef = useRef(null);
    const polygonsLayerRef = useRef(null);
    const stationsLayerRef = useRef(null);
    const hydroChartCanvasRef = useRef(null);
    const hydroChartInstanceRef = useRef(null);

    // Apply incoming drillContext if navigated from another screen
    useEffect(() => {
      if (drillContext && drillContext.sensorId) {
        const found = TELEMETRY_STATIONS.find(s => s.stationId === drillContext.sensorId);
        if (found) {
          setSelectedStationId(found.stationId);
        }
      }
      if (drillContext && drillContext.catchment) {
        setCatchmentFilter(drillContext.catchment);
      }
    }, [drillContext]);

    // Fetch live data from /api/v1/events and /api/v1/modalities/events with fallback
    const fetchLiveTelemetry = async () => {
      setIsRefreshing(true);
      try {
        const [evRes, modRes] = await Promise.all([
          fetch('/api/v1/events?limit=25').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/v1/modalities/events?limit=25').then(r => r.ok ? r.json() : null).catch(() => null)
        ]);

        if (evRes) {
          const evArr = Array.isArray(evRes) ? evRes : (evRes.events || []);
          if (evArr.length > 0) setLiveEventsCount(evArr.length);
        }
        if (modRes) {
          const modArr = Array.isArray(modRes) ? modRes : (modRes.modality_events || modRes.events || []);
          if (modRes.kpis && modRes.kpis.total) {
            setLiveModalityCount(modRes.kpis.total);
          } else if (modArr.length > 0) {
            setLiveModalityCount(Math.max(142, modArr.length));
          }
        }
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        setLastSyncTime(`${hh}:${mm} IST`);
      } catch (err) {
        console.warn("Using deterministic Uttarakhand telemetry fallback:", err);
      } finally {
        setIsRefreshing(false);
      }
    };

    useEffect(() => {
      fetchLiveTelemetry();
    }, [timeRange]);

    // Filtered Stations & Anomalies
    const filteredStations = useMemo(() => {
      return TELEMETRY_STATIONS.filter(st => {
        if (catchmentFilter !== "All Catchments" && st.catchment !== catchmentFilter) return false;
        if (hazardFilter !== "All Hazards" && st.hazardType !== hazardFilter) return false;
        if (sourceFilter !== "All Sources" && st.source !== sourceFilter) return false;
        return true;
      });
    }, [catchmentFilter, hazardFilter, sourceFilter]);

    const activeStation = useMemo(() => {
      const fromFiltered = filteredStations.find(s => s.stationId === selectedStationId);
      if (fromFiltered) return fromFiltered;
      if (filteredStations.length > 0) return filteredStations[0];
      return TELEMETRY_STATIONS[0];
    }, [filteredStations, selectedStationId]);

    const filteredAnomalies = useMemo(() => {
      return DEFAULT_ANOMALIES.filter(anom => {
        if (catchmentFilter !== "All Catchments" && anom.catchment !== catchmentFilter) return false;
        if (hazardFilter !== "All Hazards" && anom.hazardType !== hazardFilter) return false;
        if (sourceFilter !== "All Sources" && anom.source !== sourceFilter) return false;
        return true;
      });
    }, [catchmentFilter, hazardFilter, sourceFilter]);

    const currentRoleObj = useMemo(() => {
      return SRS_ROLES.find(r => r.roleId === activeRole || r.id === activeRole) || SRS_ROLES[0];
    }, [activeRole]);

    // Execute and log a role-specific decision ([Role Title])
    const handleExecuteRoleDecision = (actionTitle, target, customExtraFn) => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      const signedBy = `Ashutosh Kanojia (${currentRoleObj.roleTitle})`;
      const newEntry = {
        id: `DEC-HM-${Date.now()}`,
        timestamp: `${hh}:${mm}:${ss} IST`,
        officer: signedBy,
        initials: "AK",
        roleId: currentRoleObj.roleId,
        authorityLevel: currentRoleObj.authorityLevel,
        actionTitle,
        target: target || `${activeStation.catchment} Basin Â· ${activeStation.stationId}`,
        status: "EXECUTED & VERIFIED"
      };
      if (typeof customExtraFn === "function") {
        customExtraFn();
      }
      setDecisionExecutionLog(prev => [newEntry, ...prev.slice(0, 9)]);
      setActionFeedbackBanner({
        signedBy,
        authorityLevel: currentRoleObj.authorityLevel,
        actionTitle,
        target: newEntry.target,
        timestamp: newEntry.timestamp
      });
    };

    // Initialize Leaflet Map with ResizeObserver & Unmount Cleanup
    useEffect(() => {
      if (!mapContainerRef.current || typeof window.L === "undefined") return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = window.L.map(mapContainerRef.current, {
        center: [30.38, 79.12],
        zoom: 8,
        zoomControl: false,
        attributionControl: true
      });

      window.L.control.zoom({ position: "bottomright" }).addTo(map);

      const tileUrl = basemapStyle === "terrain"
        ? "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        : basemapStyle === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

      const tiles = window.L.tileLayer(tileUrl, {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap / OpenTopoMap / Esri"
      }).addTo(map);

      tileLayerRef.current = tiles;
      polygonsLayerRef.current = window.L.layerGroup().addTo(map);
      stationsLayerRef.current = window.L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      const ro = typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          })
        : null;

      if (ro && mapContainerRef.current) {
        ro.observe(mapContainerRef.current);
      }

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      return () => {
        if (ro) ro.disconnect();
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }, []);

    // Update Basemap Tiles
    useEffect(() => {
      if (!mapInstanceRef.current || typeof window.L === "undefined") return;
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
      const tileUrl = basemapStyle === "terrain"
        ? "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        : basemapStyle === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

      const tiles = window.L.tileLayer(tileUrl, {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap / OpenTopoMap / Esri"
      }).addTo(mapInstanceRef.current);
      if (tiles.bringToBack) tiles.bringToBack();
      tileLayerRef.current = tiles;
    }, [basemapStyle]);

    // Render Catchment Polygons & Sensor Pins on Leaflet Map
    useEffect(() => {
      if (!mapInstanceRef.current || typeof window.L === "undefined") return;

      if (polygonsLayerRef.current) {
        polygonsLayerRef.current.clearLayers();
        if (showCatchmentPolygons) {
          CATCHMENT_POLYGONS.forEach(poly => {
            if (catchmentFilter !== "All Catchments" && poly.id !== catchmentFilter) return;
            const leafletPoly = window.L.polygon(poly.coords, {
              color: poly.color,
              weight: 2,
              fillColor: poly.color,
              fillOpacity: poly.fillOpacity,
              dashArray: poly.status.includes("WATCH") ? "4, 4" : null
            });
            leafletPoly.bindTooltip(
              `<strong>${poly.name}</strong><br/>Status: ${poly.status}`,
              { sticky: true }
            );
            leafletPoly.on("click", () => {
              setCatchmentFilter(poly.id);
            });
            polygonsLayerRef.current.addLayer(leafletPoly);
          });
        }

        // Isohyet radar precipitation core circles when enabled
        if (showIsohyetOverlay) {
          filteredStations.forEach(st => {
            if (st.rainfall1h >= 45) {
              const isoCircle = window.L.circle([st.lat, st.lon], {
                radius: st.rainfall1h * 160,
                color: st.pinColor === "red" ? "#DC2626" : "#0284C7",
                weight: 1,
                fillColor: st.pinColor === "red" ? "#DC2626" : "#0284C7",
                fillOpacity: 0.12
              });
              polygonsLayerRef.current.addLayer(isoCircle);
            }
          });
        }
      }

      if (stationsLayerRef.current) {
        stationsLayerRef.current.clearLayers();
        filteredStations.forEach(st => {
          const isSelected = st.stationId === activeStation.stationId;
          const bgHex = st.pinColor === "red"
            ? "#DC2626"
            : st.pinColor === "amber"
            ? "#D97706"
            : "#059669";

          const sizePx = isSelected ? 18 : 14;
          const ringStyle = isSelected
            ? "box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.45), 0 0 10px rgba(220, 38, 38, 0.7);"
            : st.pinColor === "red"
            ? "box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.35);"
            : "box-shadow: 0 1px 3px rgba(15, 23, 42, 0.35);";

          const pinHtml = `
            <div style="
              width: ${sizePx}px;
              height: ${sizePx}px;
              border-radius: 9999px;
              background-color: ${bgHex};
              border: 2px solid #FFFFFF;
              ${ringStyle}
              cursor: pointer;
            "></div>
          `;

          const icon = window.L.divIcon({
            className: "hm-sensor-pin",
            html: pinHtml,
            iconSize: [sizePx, sizePx],
            iconAnchor: [sizePx / 2, sizePx / 2]
          });

          const marker = window.L.marker([st.lat, st.lon], { icon });

          marker.bindTooltip(
            `<div style="font-size:11px;">
              <strong>${st.stationId} Â· ${st.name}</strong><br/>
              Rain: <b>${st.rainfall1h} mm/hr</b> | Stage: <b>${st.waterLevelM}m</b> (${st.status})
            </div>`,
            { direction: "top", offset: [0, -8] }
          );

          marker.on("click", () => {
            setSelectedStationId(st.stationId);
          });

          stationsLayerRef.current.addLayer(marker);
        });
      }
    }, [filteredStations, activeStation, catchmentFilter, showCatchmentPolygons, showIsohyetOverlay]);

    // Render Synchronized Dual-Axis Hydrological Trend Chart (Chart.js)
    useEffect(() => {
      if (!hydroChartCanvasRef.current || typeof window.Chart === "undefined" || !activeStation) return;

      if (hydroChartInstanceRef.current) {
        hydroChartInstanceRef.current.destroy();
        hydroChartInstanceRef.current = null;
      }

      const ctx = hydroChartCanvasRef.current.getContext("2d");
      const labels = activeStation.hourlyLabels;
      const dangerLine = labels.map(() => activeStation.dangerLevelM);
      const warningLine = labels.map(() => activeStation.warningLevelM);

      try {
        hydroChartInstanceRef.current = new window.Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                type: "bar",
                label: "Hourly Rainfall (mm/hr)",
                data: activeStation.hourlyRain,
                backgroundColor: "rgba(2, 132, 199, 0.72)",
                borderColor: "#0284C7",
                borderWidth: 1,
                borderRadius: 4,
                yAxisID: "yRain",
                order: 3
              },
              {
                type: "line",
                label: "River Water Level (m)",
                data: activeStation.hourlyStage,
                borderColor: "#0F172A",
                backgroundColor: "#0F172A",
                borderWidth: 2.5,
                pointRadius: 3.5,
                pointBackgroundColor: "#0F172A",
                tension: 0.25,
                yAxisID: "yStage",
                order: 1
              },
              {
                type: "line",
                label: `Danger Level (${activeStation.dangerLevelM}m)`,
                data: dangerLine,
                borderColor: "#DC2626",
                borderWidth: 1.8,
                borderDash: [6, 4],
                pointRadius: 0,
                fill: false,
                yAxisID: "yStage",
                order: 2
              },
              {
                type: "line",
                label: `Warning Level (${activeStation.warningLevelM}m)`,
                data: warningLine,
                borderColor: "#D97706",
                borderWidth: 1.5,
                borderDash: [4, 4],
                pointRadius: 0,
                fill: false,
                yAxisID: "yStage",
                order: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: "index",
              intersect: false
            },
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  color: "#334155",
                  font: { size: 11, weight: "600" },
                  boxWidth: 12,
                  padding: 12
                }
              },
              tooltip: {
                backgroundColor: "#0F172A",
                titleColor: "#FFFFFF",
                bodyColor: "#F8FAFC",
                padding: 10,
                cornerRadius: 6
              }
            },
            scales: {
              x: {
                grid: { color: "#E2E8F0", borderDash: [2, 2] },
                ticks: { color: "#64748B", font: { size: 11 } }
              },
              yRain: {
                type: "linear",
                position: "left",
                beginAtZero: true,
                suggestedMax: 100,
                title: {
                  display: true,
                  text: "Rainfall Intensity (mm/hr)",
                  color: "#0284C7",
                  font: { size: 11, weight: "700" }
                },
                grid: { color: "#E2E8F0", borderDash: [2, 2] },
                ticks: { color: "#0284C7", font: { size: 11 } }
              },
              yStage: {
                type: "linear",
                position: "right",
                min: Math.floor(activeStation.warningLevelM - 2.5),
                max: Math.ceil(activeStation.dangerLevelM + 3.0),
                title: {
                  display: true,
                  text: "River Stage (m ASL)",
                  color: "#0F172A",
                  font: { size: 11, weight: "700" }
                },
                grid: { drawOnChartArea: false },
                ticks: { color: "#0F172A", font: { size: 11 } }
              }
            }
          }
        });
      } catch (err) {
        console.error("Error rendering HM-01 dual-axis hydrograph:", err);
      }

      return () => {
        if (hydroChartInstanceRef.current) {
          hydroChartInstanceRef.current.destroy();
          hydroChartInstanceRef.current = null;
        }
      };
    }, [activeStation]);

    const handleResetFilters = () => {
      setCatchmentFilter("All Catchments");
      setHazardFilter("All Hazards");
      setTimeRange("Last 24h");
      setSourceFilter("All Sources");
      setSelectedStationId("UK-RUD-04");
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([30.38, 79.12], 8);
      }
    };

    const handleInvestigateTrigger = (anomaly) => {
      if (onNavigate) {
        onNavigate('multimodal-intelligence', {
          eventId: anomaly.eventId,
          focusModality: 'hydrology',
          sensorId: anomaly.stationId,
          title: anomaly.title,
          fromScreen: 'HM-01'
        });
      }
    };

    // 4 Executive KPI Cards with explicit lineage badges
    const executiveKpis = [
      {
        title: "Active Telemetry Stations",
        value: `${liveModalityCount}`,
        subtitle: "98.6% Uptime Â· IMD AWS & CWC Gauges",
        delta: "142 / 144 reporting live",
        tone: "border-l-ok",
        lineage: "LIVE-SENSOR"
      },
      {
        title: "Catchments in Alert",
        value: "4",
        subtitle: "Mandakini & Alaknanda Red Â· 2 Orange",
        delta: `${liveEventsCount} active basin warnings`,
        tone: "border-l-crit",
        lineage: "FORECAST"
      },
      {
        title: "Peak 1h Rainfall",
        value: "82.4 mm/hr",
        subtitle: "Station UK-RUD-04 (Basukedar / Kedarnath)",
        delta: "Exceeds 64.5 mm/hr Cloudburst Mark",
        tone: "border-l-crit",
        lineage: "LIVE-SENSOR"
      },
      {
        title: "Rivers Above Danger Mark",
        value: "3 Gauges",
        subtitle: "Basukedar, Joshimath & Devprayag Sangam",
        delta: "AI 90m Runoff Surge: +1.8m",
        tone: "border-l-high",
        lineage: "AI-ESTIMATED"
      }
    ];

    return (
      <div className="p-6 max-w-[1600px] mx-auto space-y-4">
        {/* 1. HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-ink tracking-tight">Hazard Monitoring</h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('role-command', { fromScreen: 'HM-01', roleId: activeRole })}
              className="px-3 py-1.5 rounded-lg bg-surface2 hover:bg-surface3 text-ink border border-line text-xs font-semibold transition-colors"
            >
              Role Hub
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('social-intelligence', { fromScreen: 'HM-01', catchment: catchmentFilter })}
              className="px-3 py-1.5 rounded-lg bg-surface2 hover:bg-surface3 text-ink border border-line text-xs font-semibold transition-colors"
            >
              Social Intelligence
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('multimodal-intelligence', {
                eventId: activeStation.eventId,
                focusModality: 'hydrology',
                sensorId: activeStation.stationId,
                title: `${activeStation.name} Telemetry Trigger`,
                fromScreen: 'HM-01'
              })}
              className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-colors"
            >
              Open Dossier
            </button>
            <span className="px-2.5 py-1 rounded-md bg-ink text-white text-[11px] font-bold tracking-wider uppercase">
              {String(currentRoleObj.authorityLevel).split(' ')[0]} {String(currentRoleObj.authorityLevel).split(' ')[1]}
            </span>
            {(activeRole === "citizen" || activeRole === "researcher") && (
              <span className="px-2 py-0.5 rounded bg-surface2 text-muted border border-line text-[11px] font-bold">
                {activeRole === "citizen" ? "View only" : "Restricted"}
              </span>
            )}
          </div>
        </div>

        {/* 2B. ROLE-BASED ACCESSIBILITY, VIEW GATING & INTERACTIVE DECISION EXECUTION WORKSPACE */}
        {actionFeedbackBanner && (
          <div className="bg-ok-soft border border-ok/40 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="px-2 py-0.5 rounded bg-ok text-white font-extrabold uppercase tracking-wider text-[10px]">
                DECISION EXECUTED
              </span>
              <strong className="text-ink font-extrabold">{actionFeedbackBanner.actionTitle}</strong>
              <span className="text-ink2">
                &bull; Signed by: <strong>{actionFeedbackBanner.signedBy}</strong> [{actionFeedbackBanner.authorityLevel}]
              </span>
              <span className="text-muted">
                &bull; Target: {actionFeedbackBanner.target} ({actionFeedbackBanner.timestamp})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActionFeedbackBanner(null)}
              className="text-xs font-bold text-ink2 hover:text-ink px-2 py-0.5 rounded bg-surface/80 border border-line"
            >
              Dismiss
            </button>
          </div>
        )}

        {activeRole === "citizen" && (
          <div className="bg-surface border border-line rounded-lg p-4 space-y-3">
            <h2 className="panel-title">Public Safety</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-crit-soft/40 border border-crit/30 space-y-1">
                <div className="text-xs font-bold text-crit uppercase tracking-wider">River &amp; Rain</div>
                <div className="font-bold text-ink">Mandakini &amp; Alaknanda: Red alert</div>
                <div className="text-ink2 text-xs">Stay away from riverbanks and ghats.</div>
              </div>
              <div className="p-4 rounded-lg bg-warn-soft/40 border border-warn/30 space-y-1">
                <div className="text-xs font-bold text-warn uppercase tracking-wider">Roads</div>
                <ul className="space-y-0.5 text-ink2 text-xs">
                  <li><strong className="text-crit">NH-107:</strong> Closed near Sonprayag</li>
                  <li><strong className="text-crit">NH-58:</strong> Restricted at Lambagarh</li>
                  <li><strong className="text-warn">NH-34:</strong> Caution near Bhatwari</li>
                  <li><strong className="text-ok">Dehradun&ndash;Haridwar:</strong> Open</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-surface2 border border-line space-y-1">
                <div className="text-xs font-bold text-ink uppercase tracking-wider">Helplines</div>
                <div className="text-ink2 text-xs">State Emergency: <strong className="text-crit text-sm">1070</strong></div>
                <div className="text-ink2 text-xs">National Emergency: <strong className="text-crit text-sm">112</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* RESEARCHER ROLE CONSOLE (LEVEL 3 Â· RESEARCH SANDBOX) */}
        {activeRole === "researcher" && (
          <div className="bg-surface border border-accent/50 rounded-lg p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="panel-title">Research Tools</h2>
              <span className="px-2 py-0.5 rounded bg-surface2 text-muted border border-line text-[11px] font-bold">Alert broadcast locked</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-surface2 border border-line space-y-2">
                <div className="font-bold text-muted uppercase tracking-wider text-[11px]">
                  Hydrological Model Efficiency Metrics
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-extrabold text-ink">Nash-Sutcliffe (NSE = 0.88)</span>
                  <span className="text-ok font-bold">KGE = 0.85 &bull; R2 = 0.93</span>
                </div>
                <p className="text-ink2">
                  90-minute flash-flood peak stage RMSE: <strong>0.21m</strong> across 14 historical Mandakini &amp; Alaknanda cloudburst episodes.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-surface2 border border-line space-y-2">
                <div className="font-bold text-muted uppercase tracking-wider text-[11px]">
                  IMD AWS vs. GPM / ERA5 Bias Comparison
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveBiasComparison("IMD_VS_GPM");
                      handleExecuteRoleDecision(
                        "Evaluated IMD AWS vs GPM IMERG Orographic Bias (+6.4% at 1420m ASL)",
                        `${activeStation.stationId} Â· ${activeStation.catchment}`
                      );
                    }}
                    className={`px-2.5 py-1 rounded border font-bold ${
                      activeBiasComparison === "IMD_VS_GPM"
                        ? "bg-accent text-white border-accent"
                        : "bg-surface text-ink border-line"
                    }`}
                  >
                    Compare IMD vs GPM/ERA5 Bias
                  </button>
                  <span className="font-bold text-accent">+6.4% Orographic Bias</span>
                </div>
                <p className="text-ink2">
                  GPM IMERG underestimates narrow valley cloudburst cores by 6.4% relative to ground IMD AWS tipping buckets at Basukedar.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-surface2 border border-line space-y-2">
                <div className="font-bold text-muted uppercase tracking-wider text-[11px]">
                  Calibrated Hydrograph Dataset Export
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExportedDatasetFormat("CSV");
                      handleExecuteRoleDecision(
                        `Exported Synthetic CSV Hydrograph & Stage Series (${activeStation.stationId})`,
                        `${activeStation.name} (24h Calibrated CSV)`
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-ink hover:bg-accent text-white font-bold transition-colors"
                  >
                    Download Synthetic CSV Hydrograph
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExportedDatasetFormat("JSON");
                      handleExecuteRoleDecision(
                        `Exported Multi-Sensor JSON Hydrograph Bundle (${activeStation.stationId})`,
                        `${activeStation.name} (GeoJSON/JSON)`
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface3 text-ink border border-line font-bold transition-colors"
                  >
                    Export JSON Series
                  </button>
                </div>
                {exportedDatasetFormat && (
                  <div className="text-[11px] font-bold text-ok">
                    Ready: {activeStation.stationId}_hydrograph_2026.{exportedDatasetFormat.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DATA ADMINISTRATOR ROLE CONSOLE (LEVEL 5 Â· PIPELINE ADMIN) */}
        {activeRole === "data-admin" && (
          <div className="bg-surface border border-info/50 rounded-lg p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="panel-title">Pipeline Controls</h2>
              <span className="px-2 py-0.5 rounded bg-surface2 text-muted border border-line text-[11px] font-bold">Evacuation orders locked</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-surface2 border border-line space-y-2">
                <div className="font-bold text-muted uppercase tracking-wider text-[11px]">
                  Sensor Drift Quarantine Control (UK-RUD-04)
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-ink">
                    Status: {quarantinedSensors.includes("UK-RUD-04") ? "QUARANTINED (FALLBACK ACTIVE)" : "LIVE STREAMING"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const isQ = quarantinedSensors.includes("UK-RUD-04");
                    const nextQ = isQ
                      ? quarantinedSensors.filter(id => id !== "UK-RUD-04")
                      : [...quarantinedSensors, "UK-RUD-04"];
                    setQuarantinedSensors(nextQ);
                    handleExecuteRoleDecision(
                      isQ
                        ? "Restored Sensor UK-RUD-04 to Live Telemetry Fusion Pool"
                        : "Quarantined Drifting Sensor UK-RUD-04 & Switched to CWC Redundant Ultrasonic Channel",
                      "Station UK-RUD-04 (Basukedar AWS)"
                    );
                  }}
                  className="px-3 py-1.5 rounded-lg bg-warn hover:bg-crit text-white font-bold transition-colors"
                >
                  {quarantinedSensors.includes("UK-RUD-04")
                    ? "Restore Sensor UK-RUD-04 to Live Pool"
                    : "Quarantine Drifting Sensor UK-RUD-04"}
                </button>
              </div>

              <div className="p-4 rounded-lg bg-surface2 border border-line space-y-2">
                <div className="font-bold text-muted uppercase tracking-wider text-[11px]">
                  CWC / MOSDAC Ingestion Worker Pool
                </div>
                <div className="text-ink2">
                  Ingestion Latency: <strong className="text-ok">{workerLatencyMs} ms</strong> &bull; Workers: <strong className="text-ink">8/8 Healthy</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setWorkerLatencyMs(148);
                    handleExecuteRoleDecision(
                      "Restarted CWC FFS & MOSDAC INSAT-3D Ingestion Workers (Latency 148ms)",
                      "SEOC Telemetry Broker Cluster"
                    );
                  }}
                  className="px-3 py-1.5 rounded-lg bg-ink hover:bg-accent text-white font-bold transition-colors"
                >
                  Restart CWC/MOSDAC Ingestion Workers
                </button>
              </div>

              <div className="p-4 rounded-lg bg-surface2 border border-line space-y-2">
                <div className="font-bold text-muted uppercase tracking-wider text-[11px]">
                  Telemetry Packet Integrity &amp; Drop Rate
                </div>
                <div className="text-sm font-extrabold text-ok">
                  Packet Drop Rate: {packetDropRate} (142/144 Online)
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPacketDropRate("0.02%");
                    handleExecuteRoleDecision(
                      "Audited Telemetry Packet Drop Rate (0.04% to 0.02%) & Verified Lineage Checksums",
                      "All 142 Uttarakhand AWS & CWC Stations"
                    );
                  }}
                  className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface3 text-ink border border-line font-bold transition-colors"
                >
                  Inspect Packet Drop Rate (0.04%) &amp; Verify Checksums
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OPERATIONAL COMMAND & SCIENTIFIC CALIBRATION CONSOLE (ANALYST, AUTHORITY, RESPONSE) */}
        {(activeRole === "analyst" || activeRole === "authority" || activeRole === "response") && (
          <div className="bg-surface border border-line-strong rounded-lg p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="panel-title">Actions</h2>
            </div>

            {activeRole === "analyst" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-surface2 border border-line space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-muted uppercase tracking-wider text-[11px]">
                      Rainfall Danger Threshold Slider (50&ndash;100 mm/hr)
                    </span>
                    <span className="font-extrabold text-crit text-sm">{rainfallDangerThreshold} mm/hr</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="1"
                    value={rainfallDangerThreshold}
                    onChange={(e) => setRainfallDangerThreshold(Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-muted">
                      Stations breaching {rainfallDangerThreshold} mm/hr: <strong className="text-crit">{TELEMETRY_STATIONS.filter(s => s.rainfall1h >= rainfallDangerThreshold).length}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleExecuteRoleDecision(
                        `Calibrated Cloudburst Danger Threshold to ${rainfallDangerThreshold} mm/hr`,
                        `${catchmentFilter} Â· IMD AWS Network`
                      )}
                      className="px-2.5 py-1 rounded bg-ink hover:bg-accent text-white font-bold"
                    >
                      Apply Threshold
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-surface2 border border-line space-y-2">
                  <div className="font-bold text-muted uppercase tracking-wider text-[11px]">
                    Ultrasonic River Gauge Offset Calibration
                  </div>
                  <div className="text-ink2">
                    Station <strong>{activeStation.stationId}</strong> Offset: <strong className="text-accent">+{sensorCalibrationOffsetM.toFixed(2)}m</strong>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const nextOffset = Number((sensorCalibrationOffsetM + 0.15).toFixed(2));
                        setSensorCalibrationOffsetM(nextOffset);
                        handleExecuteRoleDecision(
                          `Calibrated Ultrasonic Gauge Datum Offset (+${nextOffset}m) on ${activeStation.stationId}`,
                          `${activeStation.name} (${activeStation.catchment})`
                        );
                      }}
                      className="px-3 py-1.5 rounded-lg bg-ink hover:bg-accent text-white font-bold transition-colors"
                    >
                      Calibrate Sensor Offset (+0.15m)
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-surface2 border border-line space-y-2">
                  <div className="font-bold text-muted uppercase tracking-wider text-[11px]">
                    Technical Flash-Flood Trigger Sign-Off
                  </div>
                  <div className="text-ink2">
                    Confirm 82.4 mm/hr cloudburst &amp; +1.85m/3h stage surge for SEOC escalation.
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExecuteRoleDecision(
                      `Issued Verified Technical Flash-Flood Trigger for ${activeStation.stationId} (${activeStation.rainfall1h} mm/hr)`,
                      `${activeStation.catchment} Basin Â· Event ${activeStation.eventId}`
                    )}
                    className="px-3 py-1.5 rounded-lg bg-crit hover:bg-crit/90 text-white font-bold transition-colors"
                  >
                    Issue Technical Flash-Flood Trigger
                  </button>
                </div>
              </div>
            )}

            {activeRole === "authority" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-crit-soft/30 border border-crit/30 space-y-2">
                  <div className="font-bold text-crit uppercase tracking-wider text-[11px]">
                    District &amp; Basin Alert Declaration
                  </div>
                  <div className="text-ink2">
                    Status: <strong>{catchmentRedAlertDeclared ? "RED ALERT DECLARED (MANDAKINI & ALAKNANDA)" : "ORANGE WATCH / PENDING SIGN-OFF"}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCatchmentRedAlertDeclared(true);
                      handleExecuteRoleDecision(
                        "Declared District-Wide Catchment RED ALERT across Mandakini & Alaknanda Basins",
                        "Rudraprayag, Chamoli & Tehri Garhwal Districts"
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-crit text-white font-extrabold transition-colors"
                  >
                    Declare Catchment Red Alert
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-warn-soft/30 border border-warn/30 space-y-2">
                  <div className="font-bold text-warn uppercase tracking-wider text-[11px]">
                    Downstream Riverfront Evacuation Order
                  </div>
                  <div className="text-ink2">
                    Status: <strong>{evacuationOrdered ? "MANDATORY EVACUATION ACTIVE (14 VILLAGES)" : "PRE-EVACUATION STANDBY"}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEvacuationOrdered(true);
                      handleExecuteRoleDecision(
                        "Authorized Mandatory Evacuation Order for 14 Downstream Riverfront Villages (Tilwara, Agastyamuni & Srinagar)",
                        "Mandakini & Alaknanda Floodplain Tehsils"
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-ink hover:bg-crit text-white font-extrabold transition-colors"
                  >
                    Order Mandatory Evacuation
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-surface2 border border-line space-y-2">
                  <div className="font-bold text-muted uppercase tracking-wider text-[11px]">
                    CAP Early Warning Broadcast (NDMA SACHET)
                  </div>
                  <div className="text-ink2">
                    Push bilingual Hindi/English cell-broadcast alert to 1.48 Lakh citizens in flood zones.
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExecuteRoleDecision(
                      "Approved & Broadcast Official CAP Early Warning via NDMA SACHET (1.48L Recipients)",
                      "Rudraprayag, Joshimath & Devprayag Corridors"
                    )}
                    className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-extrabold transition-colors"
                  >
                    Approve CAP SACHET Broadcast
                  </button>
                </div>
              </div>
            )}

            {activeRole === "response" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-surface2 border border-line space-y-2">
                  <div className="font-bold text-muted uppercase tracking-wider text-[11px]">
                    Flood Rescue Boat Staging (SDRF)
                  </div>
                  <div className="text-ink2">
                    Status: <strong>{sdrfBoatsStaged ? "6 SDRF INFLATABLE BOATS STAGED AT TILWARA & SRINAGAR" : "AT BATTALION HQ"}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSdrfBoatsStaged(true);
                      handleExecuteRoleDecision(
                        "Staged 6 SDRF Flood Rescue Boats & Dive Teams at Tilwara & Srinagar Ghats",
                        "Mandakini-Alaknanda Confluence Sector"
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-ink hover:bg-accent text-white font-extrabold transition-colors"
                  >
                    Stage SDRF Flood Boats at Tilwara &amp; Srinagar Ghats
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-surface2 border border-line space-y-2">
                  <div className="font-bold text-muted uppercase tracking-wider text-[11px]">
                    BRO Heavy Excavator Dispatch
                  </div>
                  <div className="text-ink2">
                    Slope saturation at 78% on NH-107 &amp; NH-58; pre-position loaders for debris clearance.
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExecuteRoleDecision(
                      "Dispatched 4 BRO Heavy Excavators to NH-107 (Sonprayag) & NH-58 (Lambagarh) Slope Hotspots",
                      "NH-107 & NH-58 Pilgrimage Corridors"
                    )}
                    className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-extrabold transition-colors"
                  >
                    Dispatch BRO Excavators to NH-107 &amp; NH-58
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-surface2 border border-line space-y-2">
                  <div className="font-bold text-muted uppercase tracking-wider text-[11px]">
                    Ground Gauge &amp; Bridge Cordon Verification
                  </div>
                  <div className="text-ink2">
                    Cordon low-lying suspension bridges and verify physical staff gauge at {activeStation.stationId}.
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExecuteRoleDecision(
                      `Verified Ground Water-Rise & Cordoned Low-Lying Bridges near ${activeStation.stationId}`,
                      `${activeStation.name} (${activeStation.catchment})`
                    )}
                    className="px-3 py-1.5 rounded-lg bg-warn hover:bg-crit text-white font-extrabold transition-colors"
                  >
                    Confirm Ground Gauge &amp; Cordon Bridges
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Decision log */}
        <div className="bg-surface border border-line rounded-lg p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="panel-title">Decision Log</h2>
            <span className="text-xs text-muted font-semibold">{decisionExecutionLog.length} this session</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            {decisionExecutionLog.slice(0, 3).map(entry => (
              <div key={entry.id} className="p-2.5 rounded-lg bg-surface2 border border-line flex flex-col justify-between space-y-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[11px] font-semibold text-muted tabular-nums">{entry.timestamp}</span>
                  <span className="px-1.5 py-0.5 rounded bg-ok-soft text-ok text-[10px] font-bold">{entry.status}</span>
                </div>
                <div className="font-bold text-ink leading-snug">{entry.actionTitle}</div>
                <div className="flex items-center justify-between text-[10px] text-muted pt-1 border-t border-line">
                  <span>{entry.target}</span>
                  <span className="tabular-nums font-semibold">{entry.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. INTERACTIVE FILTER BAR */}
        <div className="bg-surface border border-line rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* River Catchment */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-muted">Catchment:</label>
              <select
                value={catchmentFilter}
                onChange={(e) => setCatchmentFilter(e.target.value)}
                className="bg-surface2 text-ink border border-line rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-accent"
              >
                <option value="All Catchments">All Catchments</option>
                <option value="Mandakini">Mandakini</option>
                <option value="Alaknanda">Alaknanda</option>
                <option value="Bhagirathi">Bhagirathi</option>
                <option value="Kali / Sharda">Kali / Sharda</option>
                <option value="Yamuna">Yamuna</option>
              </select>
            </div>

            {/* Hazard Type */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-muted">Hazard Type:</label>
              <select
                value={hazardFilter}
                onChange={(e) => setHazardFilter(e.target.value)}
                className="bg-surface2 text-ink border border-line rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-accent"
              >
                <option value="All Hazards">All Hazards</option>
                <option value="Cloudburst">Cloudburst</option>
                <option value="Flash Flood">Flash Flood</option>
                <option value="Riverine Flood">Riverine Flood</option>
                <option value="Landslide">Landslide</option>
              </select>
            </div>

            {/* Time Range */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-muted">Time Range:</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-surface2 text-ink border border-line rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-accent"
              >
                <option value="Last 6h">Last 6h</option>
                <option value="Last 24h">Last 24h</option>
                <option value="Last 48h">Last 48h</option>
                <option value="7 Days">7 Days</option>
              </select>
            </div>

            {/* Data Source */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-muted">Data Source:</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-surface2 text-ink border border-line rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-accent"
              >
                <option value="All Sources">All Sources</option>
                <option value="IMD AWS">IMD AWS</option>
                <option value="CWC Telemetry">CWC Telemetry</option>
                <option value="MOSDAC INSAT-3D">MOSDAC INSAT-3D</option>
                <option value="GPM / ERA5">GPM / ERA5</option>
                <option value="Bhoonidhi SAR">Bhoonidhi SAR</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-1.5 rounded-lg bg-surface2 hover:bg-surface3 text-ink2 border border-line text-xs font-semibold transition-colors"
            >
              Reset Filters
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted">
              Showing <strong className="text-ink">{filteredStations.length}</strong> stations &bull; <strong className="text-crit">{filteredAnomalies.length}</strong> active breaches
            </span>
            <button
              type="button"
              onClick={fetchLiveTelemetry}
              className="px-3 py-1.5 rounded-lg bg-accent-soft text-accent hover:bg-accent hover:text-white font-bold transition-colors"
            >
              {isRefreshing ? "Syncing..." : "Refresh Telemetry"}
            </button>
          </div>
        </div>

        {/* 4. 4 EXECUTIVE KPI CARDS WITH EXPLICIT LINEAGE BADGES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {executiveKpis.map((kpi, idx) => (
            <div
              key={idx}
              className={`bg-surface border border-line border-l-4 ${kpi.tone} rounded-lg p-4 flex flex-col justify-between space-y-2`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-muted uppercase tracking-wider">{kpi.title}</span>
                <LineageBadge type={kpi.lineage} />
              </div>
              <div className="text-2xl font-extrabold text-ink tabular-nums tracking-tight">
                {kpi.value}
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-line">
                <span className="text-ink2 font-medium truncate">{kpi.subtitle}</span>
                <span className="font-bold text-crit shrink-0 ml-2">{kpi.delta}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 5 & 6. MAIN ANALYTICAL ROW: Interactive Leaflet Basin Map (7 cols) + Dual-Axis Hydrograph & Station Inspector (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* LEFT 7 COLS: Interactive Leaflet Basin & Sensor Map */}
          <div className="lg:col-span-6 bg-surface border border-line rounded-lg p-4 flex flex-col justify-between space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-line">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="panel-title">Geospatial River Catchment &amp; Telemetry Sensor Map</h2>
                  <LineageBadge type="LIVE-SENSOR" />
                </div>
              </div>

              {/* Layer & Basemap Controls */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setShowCatchmentPolygons(!showCatchmentPolygons)}
                  className={`px-2.5 py-1 rounded border font-semibold ${
                    showCatchmentPolygons
                      ? "bg-accent-soft text-accent border-accent/40"
                      : "bg-surface2 text-muted border-line"
                  }`}
                >
                  Basin Polygons
                </button>
                <button
                  type="button"
                  onClick={() => setShowIsohyetOverlay(!showIsohyetOverlay)}
                  className={`px-2.5 py-1 rounded border font-semibold ${
                    showIsohyetOverlay
                      ? "bg-accent-soft text-accent border-accent/40"
                      : "bg-surface2 text-muted border-line"
                  }`}
                >
                  Radar Isohyets
                </button>
                <select
                  value={basemapStyle}
                  onChange={(e) => setBasemapStyle(e.target.value)}
                  className="bg-surface2 text-ink border border-line rounded px-2 py-1 text-xs font-semibold"
                >
                  <option value="terrain">Topo Map</option>
                  <option value="light">Light OSM</option>
                  <option value="satellite">Satellite Esri</option>
                </select>
              </div>
            </div>

            {/* Leaflet Container */}
            <div className="relative w-full h-[430px] rounded-lg overflow-hidden border border-line bg-surface2">
              <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

              {/* Map Legend Overlay */}
              <div className="absolute bottom-3 left-3 z-[400] bg-surface/95 border border-line-strong rounded-lg px-3 py-2 text-[11px] shadow-sm space-y-1">
                <div className="font-bold text-ink uppercase tracking-wider text-[10px]">Telemetry Pin Status</div>
                <div className="flex flex-wrap items-center gap-3 text-ink2 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-crit inline-block border border-white" />
                    <span>Danger Breach (3)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-warn inline-block border border-white" />
                    <span>Warning Watch (2)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-ok inline-block border border-white" />
                    <span>Normal Stage (2)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Station Selector Strip Below Map */}
            <div className="pt-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
                Select Telemetry Station to Inspect Hydrograph:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {TELEMETRY_STATIONS.map(st => {
                  const isSel = st.stationId === activeStation.stationId;
                  const dotColor = st.pinColor === "red"
                    ? "bg-crit"
                    : st.pinColor === "amber"
                    ? "bg-warn"
                    : "bg-ok";
                  return (
                    <button
                      key={st.stationId}
                      type="button"
                      onClick={() => {
                        setSelectedStationId(st.stationId);
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.setView([st.lat, st.lon], 10);
                        }
                      }}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        isSel
                          ? "bg-accent-soft/60 border-accent"
                          : "bg-surface2 hover:bg-surface3 border-line"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-extrabold text-ink">{st.stationId}</span>
                        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      </div>
                      <div className="text-[10px] text-muted truncate mt-0.5">{st.catchment}</div>
                      <div className="text-[11px] font-bold text-ink2 tabular-nums mt-0.5">{st.rainfall1h} mm/h</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: Selected Station Inspector + Synchronized Dual-Axis Hydrological Trend Chart */}
          <div className="lg:col-span-6 bg-surface border border-line rounded-lg p-4 flex flex-col justify-between space-y-4">
            {/* Selected Station Metadata Header */}
            <div className="pb-3 border-b border-line space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-ink text-white text-xs font-extrabold">
                      {activeStation.stationId}
                    </span>
                    <h2 className="panel-title">{activeStation.name}</h2>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Catchment: <strong className="text-ink2">{activeStation.catchment}</strong> &bull; District: <strong className="text-ink2">{activeStation.district}</strong> &bull; Source: <strong className="text-ink2">{activeStation.source}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <LineageBadge type={activeStation.lineage} />
                  <SeverityBadge severity={activeStation.pinColor === "red" ? "Critical" : activeStation.pinColor === "amber" ? "Moderate" : "Low"} />
                </div>
              </div>

              {/* Station Key Telemetry Readout */}
              <div className="grid grid-cols-4 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-lg bg-surface2 border border-line">
                  <div className="text-muted text-[11px]">1h Rainfall</div>
                  <div className="text-sm font-extrabold text-accent tabular-nums mt-0.5">
                    {activeStation.rainfall1h} mm/hr
                  </div>
                  <div className="text-[10px] text-muted">24h: {activeStation.rainfall24h} mm</div>
                </div>
                <div className="p-2.5 rounded-lg bg-surface2 border border-line">
                  <div className="text-muted text-[11px]">River Level</div>
                  <div className="text-sm font-extrabold text-ink tabular-nums mt-0.5">
                    {activeStation.waterLevelM} m
                  </div>
                  <div className="text-[10px] text-crit font-semibold">{activeStation.trendDelta}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-surface2 border border-line">
                  <div className="text-muted text-[11px]">Danger Mark</div>
                  <div className="text-sm font-extrabold text-crit tabular-nums mt-0.5">
                    {activeStation.dangerLevelM} m
                  </div>
                  <div className="text-[10px] text-muted">Warn: {activeStation.warningLevelM} m</div>
                </div>
                <div className="p-2.5 rounded-lg bg-surface2 border border-line">
                  <div className="text-muted text-[11px]">Discharge</div>
                  <div className="text-sm font-extrabold text-ink tabular-nums mt-0.5">
                    {activeStation.dischargeCumecs}
                  </div>
                  <div className="text-[10px] text-muted">cumecs (m3/s)</div>
                </div>
              </div>
            </div>

            {/* Dual-Axis Hydrological Trend Chart */}
            <div className="flex-1 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink">
                    Synchronized Multi-Station Hydrological Trend ({timeRange})
                  </h3>
                  <p className="text-[11px] text-muted">
                    Dual-axis Hourly Rainfall (mm/hr bars) vs. River Stage (m line) against Warning &amp; Danger Thresholds
                  </p>
                </div>
                <LineageBadge type="LIVE-SENSOR" />
              </div>

              <div className="relative w-full h-[270px] bg-surface2 rounded-lg p-3 border border-line">
                <canvas ref={hydroChartCanvasRef} />
              </div>

              {/* Station Drill-Down Action Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-line text-xs">
                <span className="text-muted">
                  Correlated Incident: <strong className="text-ink">{activeStation.eventId}</strong> ({activeStation.hazardType})
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('multimodal-intelligence', {
                    eventId: activeStation.eventId,
                    focusModality: 'hydrology',
                    sensorId: activeStation.stationId,
                    title: `${activeStation.name} Hydrograph Breach`,
                    fromScreen: 'HM-01'
                  })}
                  className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-bold transition-colors"
                >
                  Investigate Station in MEI-01 &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 7. BOTTOM ROW: Live Catchment Threshold Breaches (7 cols) + Predictive Runoff Risk Gauges (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* LEFT 7 COLS: Live Catchment Threshold Breaches Feed */}
          <div className="lg:col-span-6 bg-surface border border-line rounded-lg p-4 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-line">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="panel-title">Live Catchment Threshold Breaches &amp; Telemetry Anomalies</h2>
                  <LineageBadge type="LIVE-SENSOR" />
                </div>
                <p className="text-xs text-muted mt-0.5">
                  Automated threshold crossings across IMD AWS, CWC gauges, and Bhoonidhi SAR â€” click Investigate Trigger to open MEI-01
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-crit-soft text-crit">
                {filteredAnomalies.length} Active Triggers
              </span>
            </div>

            <div className="space-y-3">
              {filteredAnomalies.map(anomaly => (
                <div
                  key={anomaly.id}
                  onClick={() => setSelectedStationId(anomaly.stationId)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    activeStation.stationId === anomaly.stationId
                      ? "bg-accent-soft/25 border-accent"
                      : "bg-surface2 hover:bg-surface3 border-line"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-ink text-white text-xs font-extrabold">
                        {anomaly.stationId}
                      </span>
                      <span className="text-xs font-bold text-ink2">
                        {anomaly.stationName} &bull; {anomaly.catchment} Basin
                      </span>
                      <LineageBadge type={anomaly.lineage} />
                      <SeverityBadge severity={anomaly.severity} />
                    </div>
                    <span className="text-xs text-muted tabular-nums font-semibold">
                      {anomaly.timestamp} &bull; {anomaly.source}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-ink mt-2">
                    {anomaly.title}
                  </h3>

                  <p
                    className="text-xs text-ink2 mt-1"
                    dangerouslySetInnerHTML={{ __html: anomaly.impactSummary }}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2.5 border-t border-line">
                    <div className="text-xs">
                      <span className="text-muted">Measured Reading: </span>
                      <strong className="text-crit font-bold tabular-nums">{anomaly.metricReading}</strong>
                      <span className="text-muted ml-2">(&bull; Event {anomaly.eventId})</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInvestigateTrigger(anomaly);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-colors"
                    >
                      Investigate Trigger in MEI-01 &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT 5 COLS: Predictive Runoff Risk Gauges */}
          <div className="lg:col-span-6 bg-surface border border-line rounded-lg p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-line">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="panel-title">Predictive Catchment Runoff &amp; Risk Gauges</h2>
                    <LineageBadge type="AI-ESTIMATED" />
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    AI hydro-geomorphological ensemble scores for the next 90â€“180 minutes
                  </p>
                </div>
                <LineageBadge type="FORECAST" />
              </div>

              <div className="space-y-4">
                {PREDICTIVE_GAUGES.map(gauge => (
                  <div key={gauge.id} className="p-4 rounded-lg bg-surface2 border border-line space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-extrabold text-ink">{gauge.label}</div>
                        <div className="text-xs text-muted">{gauge.catchmentFocus}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <LineageBadge type={gauge.lineage} />
                        <span
                          className="text-lg font-extrabold tabular-nums"
                          style={{ color: gauge.color }}
                        >
                          {gauge.score}%
                        </span>
                      </div>
                    </div>

                    {/* Gauge Progress Bar */}
                    <div className="w-full h-3 rounded-full bg-surface border border-line overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${gauge.score}%`, backgroundColor: gauge.color }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold" style={{ color: gauge.color }}>
                        {gauge.level}
                      </span>
                      <span className="text-muted">{gauge.modelInfo}</span>
                    </div>

                    <p className="text-xs text-ink2 leading-relaxed pt-1 border-t border-line">
                      {gauge.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  window.DisasterViews = window.DisasterViews || {};
  window.DisasterViews.HazardMonitoringView = HazardMonitoringView;
  window.HazardMonitoringView = HazardMonitoringView;
})();
