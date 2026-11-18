# SOFTWARE REQUIREMENTS SPECIFICATION (SRS v3.0)
## Multi-Role Analytics & Intelligence Dashboard Suite
### AI-Powered Multimodal Disaster Intelligence Platform (Uttarakhand Testbed)
**Document Ref:** `SRS-DASH-2026-V3`  
**Standard:** IEEE 830 / ISO/IEC/IEEE 29148 Adapted for Mission-Critical Emergency Operations Centers (EOC)  
**Status:** Approved for Implementation  
**Target Platform:** FastAPI Backend + Relational Store + React 18 / Babel SPA Frontend  

---

## Executive Summary & Guiding Rule

> **Guiding Rule (Mandatory Pre-requisite):**  
> *"Define user decisions and data requirements before creating visual designs or coding dashboards."*

This specification defines the extension of the **Disaster Intelligence Multimodal Platform** with three (3) interconnected analytical prototype dashboards built directly on top of the existing deployed frontend without altering or breaking existing core views (`DashboardView.js`, `EventsView.js`, `ModalityEventsView.js`, `MapView.js`, `ReportsView.js`).

The three new analytical dashboards are:
1. **Hazard Monitoring & Analysis Dashboard** (`HM-01`)
2. **Social Media Intelligence Dashboard** (`SMI-01`)
3. **Disaster Event Intelligence & Multimodal Analysis Dashboard** (`MEI-01`)

---

## 1. User Roles, Decision Support, Urgency & Permissions (Step 1)

The platform supports six (6) distinct operational and public user categories. Every dashboard visual component must map directly to a decision supported for one or more of these roles.

### 1.1 Role Definitions & Decision Matrix

| User Category | Key Operational Decisions Supported | Urgency & SLA | System Permissions & Access Level |
|---|---|---|---|
| **Disaster Management Authorities** (SEOC Director, State Relief Commissioner, District Magistrates) | • Declare emergency alert levels (Red/Orange/Yellow)<br>• Issue mandatory evacuation orders for tehsils/villages<br>• Mobilize NDRF/SDRF battallions and heavy machinery<br>• Request IAF air-recon and emergency airdrop sorties | **Immediate**<br>(Real-time, < 5 minutes) | **Executive / Admin**<br>Full read/write, broadcast alert authorization, SITREP release sign-off |
| **Hazard Analysts** (Meteorologists, Hydrologists, Geologists from IMD/CWC/GSI) | • Validate automated rainfall threshold breaches (>64.5 mm/hr)<br>• Confirm river gauge danger-level crossings<br>• Verify SAR coherence loss for landslide reactivation<br>• Tune run-off and catchment predictive risk scores | **High**<br>(Hourly to 6-hour cycles) | **Analyst Read/Write**<br>Access to raw telemetry, sensor calibration, AI threshold tuning |
| **Emergency Response Teams** (SDRF Commanders, BRO Engineers, Police EOC, Fire & Rescue) | • Deploy rescue boats, NDRF quick-response teams<br>• Dispatch bulldozers for national highway roadblock clearing<br>• Select safe transit corridors avoiding blocked ghat roads<br>• Verify live casualty and trap reports | **Critical**<br>(Real-time, < 15 minutes) | **Field Operator / Response**<br>Read-only spatial maps, live incident triage, resource status updates |
| **Researchers** (Disaster Resiliency Scientists, AI/ML Evaluators, Academic Institutions) | • Benchmark multimodal fusion AI models vs. ground truth<br>• Analyze 10-year decadal monsoon anomaly trends<br>• Evaluate false-positive and false-negative alert rates<br>• Export clean multimodal feature datasets for training | **Low / Deliberate**<br>(Post-disaster, Weekly/Batch) | **Research Read & Export**<br>Read-only access to historical archives, benchmark metrics, dataset export |
| **Data Administrators** (System Engineers, IoT Operations, IT Infrastructure Leads) | • Monitor sensor telemetry ingestion health and drop-offs<br>• Verify API latency, database connection pools, queue depths<br>• Quarantine corrupted or out-of-spec sensor streams<br>• Monitor AI inference service latency and uptime | **Medium / Continuous**<br>(24/7 Operations Monitoring) | **System Administrator**<br>Full pipeline control, API keys, broker configuration, audit logs |
| **Common Citizens** (Residents, Pilgrims, Tourists, Community Volunteers) | • Check local road accessibility (e.g. NH-58, Badrinath/Kedarnath)<br>• Locate nearest functional relief camps and medical centers<br>• Access official verified advisories and emergency helplines<br>• Receive localized danger warnings without misinformation | **High (Safety-Critical)**<br>(On-demand / Push Alerts) | **Public Portal (Read-Only)**<br>Anonymized, sanitized public summaries, lightweight mobile-friendly UI |

---

## 2. Modules, Use Cases & End-to-End User Journeys (Step 2)

### 2.1 Core Modules & Principal Use Cases

1. **Hazard Monitoring Module**: Continuous environmental sensor telemetry ingestion (IMD AWS rainfall, CWC river discharge, GSI tiltmeters, MOSDAC cloud-burst imagery), spatial isoline generation, threshold monitoring, and warning generation.
2. **Social Media Intelligence Module**: Multilingual ingestion (Hindi, Garhwali, Kumaoni, English) of social feeds (X/Twitter, Telegram, YouTube news streams), NLP geolocation extraction, urgency/need classification, cluster detection, and rumor/misinformation filtering.
3. **Situational Awareness Module**: Real-time operational ground picture combining active hazards, closed transport routes, lifeline utility outages, and critical infrastructure vulnerability.
4. **Risk & Resource Management Module**: Spatial tracking of relief shelters, medical bed availability, SDRF boat/personnel staging, heavy excavation equipment (BRO/PWD), and consumable supply inventories.
5. **Knowledge Base & Multimodal Intelligence Module**: Unified cross-modality correlation linking sensor anomalies, satellite SAR/optical passes, news reports, drone reconnaissance, and field telemetry into an integrated disaster dossier.
6. **AI Research & Data Administration Module**: Data lineage tracking, pipeline health monitoring, ingestion throughput tracking, AI model accuracy auditing, and benchmark evaluation.

### 2.2 Representative User Journeys

#### Journey A: Hazard Analyst Investigates Cloudburst & Escalates Warning
* **User**: Senior Meteorologist / SEOC Hazard Analyst
* **Goal**: Detect extreme precipitation in Rudraprayag and alert the Incident Commander.
1. Analyst opens **Hazard Monitoring Dashboard** (`HM-01`) filtered to Uttarakhand -> Mandakini Catchment.
2. The **Rainfall Trend Line** shows AWS station `UK-RUD-04` recording 82 mm/hr (Extreme Intensity).
3. Analyst checks the **Catchment Runoff Prediction Panel**; AI runoff model indicates 89% flood probability within 90 minutes.
4. Analyst clicks **"Investigate Trigger"** on the anomaly card. The UI seamlessly transitions to **Multimodal Event Intelligence** (`MEI-01`), opening linked incident `EV-2026-0814-FLD`.
5. In `MEI-01`, the analyst reviews optical/SAR satellite footprints and clicks **"Issue Flash Warning"**, dispatching an automated alert to Response Teams.

#### Journey B: Response Officer Triages Trapped Citizen Reports via Social Media
* **User**: SDRF Incident Response Dispatcher
* **Goal**: Identify emerging landslide entrapment reports on NH-58 and verify authenticity.
1. Officer opens **Social Media Intelligence Dashboard** (`SMI-01`).
2. The **Urgency Cluster Map** highlights a high-density cluster of distress posts near *Byasi / Devprayag*.
3. Officer clicks the cluster; the **Post Feed** filters to posts containing keywords: `चट्टान गिरी`, `गाड़ियां फंसी`, `SOS`.
4. Officer reviews the **Misinformation & Verification Score**; NLP verification score is 94% (multi-user corroborated, geolocated photo attached).
5. Officer clicks **"Link to Event Dossier"**, which navigates directly to `MEI-01` with road disruption impact populated, allowing one-click dispatch of the nearest BRO clearance bulldozer.

---

## 3. Screen Specifications (Step 3)

### Screen Specification 1: Hazard Monitoring & Analysis (`HM-01`)
* **Screen ID**: `HM-01`
* **Screen Name**: Hazard Monitoring & Environmental Analysis Overview
* **Target User**: Hazard Analyst, Hydrologist, Meteorologist, SEOC Duty Officer
* **Objective**: Provide continuous situational tracking of meteorological and hydrological telemetry across Uttarakhand catchments to identify hazard thresholds and forecast triggers.
* **Information Required**: 
  - Real-time rainfall values (IMD AWS, GPM IMERG)
  - River water levels and discharge rates vs. Danger Levels (CWC)
  - Soil saturation index and slope stability indices (GSI/MOSDAC)
  - Active meteorological alerts and forecast polygons (Nowcast / 24h / 48h)
* **Visual Components**:
  1. *Executive KPI Strip*: Active Stations, Catchments in Alert, Peak 1h Rainfall (mm), Rivers Above Danger Level.
  2. *Interactive Geospatial Basin Map*: Leaflet map with catchment boundaries, colored sensor markers (Green = Normal, Amber = Watch, Red = Danger), and WMS radar rainfall overlays.
  3. *Temporal Multi-Station Trend Chart*: Synchronized dual-axis time series (Rainfall Bar + River Level Line) with threshold markers.
  4. *Catchment Anomaly Feed*: Live tabular feed of telemetry threshold crossings with drill-down buttons.
  5. *Predictive Risk Gauges*: AI run-off risk and landslide susceptibility scores.
* **Filters**:
  - District / River Catchment (Alaknanda, Bhagirathi, Mandakini, Yamuna, Kali)
  - Hazard Type (Cloudburst, Flash Flood, Riverine Flood, Landslide)
  - Time Range (Last 6h, 12h, 24h, 48h, 7 Days)
  - Data Source (IMD AWS, CWC Telemetry, MOSDAC, GPM, Simulated Telemetry)
* **User Interactions**:
  - *Click Sensor Pin*: Opens station modal with 24-hour hydrograph and station metadata.
  - *Brush Time Range*: Updates basin map layer to render the selected timestamp snapshot.
  - *Drill Down*: Clicking any threshold breach card transitions to `MEI-01` with pre-filtered disaster context.
* **Data Sources**: IMD AWS API, CWC Hydrology Service, MOSDAC INSAT-3D, Bhoonidhi SAR.
* **Database / API Mapping**:
  - `GET /api/v1/observations?modality=weather&limit=100`
  - `GET /api/v1/observations?modality=hydrology&limit=100`
  - `GET /api/v1/modalities/hazards/summary`
* **Update Frequency**: Live polling (every 60s) or manual Refresh.
* **Data Lineage Tagging**: Every card explicitly labeled `[LIVE]`, `[HISTORICAL]`, `[FORECAST]`, or `[SIMULATED]`.
* **Validation Criteria**:
  - Sensor pins render at exact lat/long coordinates.
  - Danger-level river heights (> Warning Level) immediately render in pulse-red styling.
  - Drill-down correctly passes event correlation parameters to `MEI-01`.

---

### Screen Specification 2: Social Media Intelligence (`SMI-01`)
* **Screen ID**: `SMI-01`
* **Screen Name**: Social Media Intelligence, Emerging Events & Hotspot Map
* **Target User**: SEOC Response Officer, Public Relations Officer, Situation Analyst
* **Objective**: Aggregate, geolocate, and classify citizen social media posts to detect unfolding incidents, identify trapped populations, and quarantine misinformation.
* **Information Required**:
  - Social media posts with text, author, timestamp, extracted location, and platform source
  - NLP urgency classification (Rescue Needed, Road Blocked, Infrastructure Damage, General Inquiry)
  - Credibility / Verification Confidence Score (0–100%) and Fact-Check Quarantine Flag
  - Cluster density metrics by tehsil and road stretch
* **Visual Components**:
  1. *Intelligence KPI Strip*: Total Monitored Posts (24h), Verified SOS Signals, Road Closure Mentions, Quarantined Rumors.
  2. *Geospatial Cluster Hotspot Map*: Interactive heatmap/cluster map displaying density of distress posts with sentiment/urgency colors.
  3. *Live Post Triage Stream*: Real-time feed of ingested citizen posts with bilingual translation (Hindi -> English), urgency tag, and confidence score.
  4. *Emerging Keyword & Topic Cloud*: Trending localized hashtags and disaster terms (e.g., `#ChamoliCloudburst`, `NH58`, `धरासू_लैंडस्लाइड`).
  5. *Misinformation Quarantine Inspector*: Dedicated tab showing debunked or unverified claims flagged by cross-referencing official bulletins.
* **Filters**:
  - Urgency Category (All, Urgent SOS, Road Block, Medical/Shelter, Damage Report, Rumor)
  - Language (All, Hindi, Garhwali/Kumaoni, English)
  - Verification Status (Verified Official, High Corroboration, Unverified, Debunked)
  - District / Corridor (Rudraprayag, Chamoli, Uttarkashi, Rishikesh-Badrinath)
* **User Interactions**:
  - *Click Hotspot Cluster*: Zooms map and filters post stream to matching geographic bounding box.
  - *Mark as Verified / Escalate*: Dispatcher can mark a post as high-priority intelligence.
  - *Link to Incident*: Button to attach social post as evidence in `MEI-01`.
* **Data Sources**: Ingested social media bronze datasets, synthetic crawler streams, official PIB/SEOC fact-checks.
* **Database / API Mapping**:
  - `GET /api/v1/observations?modality=social&limit=100`
  - `GET /api/v1/observations?modality=news&limit=50`
  - `GET /api/v1/events/{id}/evidence`
* **Update Frequency**: Live stream simulation (30s polling).
* **Data Lineage Tagging**: Explicit badges: `[LIVE-INGESTION]`, `[AI-ESTIMATED]`, `[UNVERIFIED-CITIZEN]`.
* **Validation Criteria**:
  - SOS posts render prominent red badges.
  - Posts with negative verification scores (<40%) automatically display a caution banner.
  - One-click navigation attaches the post ID to the active event dossier.

---

### Screen Specification 3: Disaster Event Intelligence & Multimodal Analysis (`MEI-01`)
* **Screen ID**: `MEI-01`
* **Screen Name**: Unified Disaster Event Intelligence & Multimodal Analysis Dossier
* **Target User**: SEOC Incident Commander, Disaster Management Authority, Lead Hazard Analyst
* **Objective**: Synthesize all disparate data modalities (weather sensors, satellite SAR imagery, social media SOS, drone feeds, and field SITREPs) into a single operational ground truth dossier.
* **Information Required**:
  - Master incident metadata (Event ID, Hazard Type, Severity, Status, Timeline)
  - Cross-modality evidence chain (IMD rainfall spike + CWC water surge + Bhoonidhi SAR footprint + Social SOS + BRO field report)
  - Spatial affected area polygons with population and critical infrastructure exposure
  - AI synthesized situational narrative and 24-hour cascade forecast
* **Visual Components**:
  1. *Incident Command Header*: Canonical Event ID (`EV-2026-0814-LSD`), Severity Badge (`CRITICAL`), Epistemic Status (`OBSERVED GROUND TRUTH`), Action Buttons (`Export SitRep`, `Issue Alert`).
  2. *Multimodal Fusion Matrix*: 5-stream correlation view showing status across (1) Environmental Telemetry, (2) Satellite Remote Sensing, (3) Social & News Intelligence, (4) Drone/Ground Recon, (5) Field Infrastructure.
  3. *Unified Multi-Layer Geospatial Explorer*: Synchronized map displaying epicenters, affected buffer zones, radar overlays, road closures, and shelter locations.
  4. *Multi-Stream Chronological Timeline*: Interactive chronological rail showing every alert, sensor spike, satellite pass, and rescue milestone.
  5. *AI Synthesis & Cascade Risk Forecast*: Natural language summary generated from multimodal inputs with confidence indicators and cited evidence IDs.
* **Filters**:
  - Primary Event Selector dropdown
  - Modality Filter (Show/Hide: Sensor Data, Satellite, Social Media, Field Reports)
  - Chronological Scrubber (T-24h to T+48h forecast)
* **User Interactions**:
  - *Click Evidence Node*: Opens detailed raw inspector modal (e.g. view raw SAR GeoTIFF or full Hindi news SITREP).
  - *Toggle Cascade Layers*: Overlay downstream flood risk or secondary landslide susceptibility.
  - *Export Operational Brief*: One-click PDF/Markdown SitRep generation.
* **Data Sources**: Relational store (`events`, `hazards`, `event_evidence`, `event_region`, `observations`).
* **Database / API Mapping**:
  - `GET /api/v1/events`
  - `GET /api/v1/events/{id}`
  - `GET /api/v1/events/{id}/evidence`
  - `GET /api/v1/modalities/events`
* **Update Frequency**: On-demand + auto-refresh on incoming event updates.
* **Data Lineage Tagging**: Badges for `[OFFICIAL-GROUND-TRUTH]`, `[AI-SYNTHESIS]`, `[REMOTE-SENSED]`.
* **Validation Criteria**:
  - Every listed evidence item has a resolvable source link or modal.
  - Map perfectly centers on the selected event's bounding box.
  - Seamless back-and-forth linking with `HM-01` and `SMI-01`.

---

## 4. Visualization-to-Data Mapping Matrix (Step 4)

This matrix maps every visual element on the three prototype dashboards to its database entity, processing logic, API endpoint, and data lineage status.

| Visual Element | Dashboard Screen | Required Information | Database Entities / Schema Tables | Processing & Transformation Required | API Endpoint Mapping | Lineage Badge Tag | Implementation Status |
|---|---|---|---|---|---|---|---|
| **Basin Hazard Map** | `HM-01` | Hazard centroids, severity, geometry, catchment bounds | `event`, `hazard`, `event_region`, `spatial_ref` | GeoJSON serialization, spatial bbox filtering | `GET /api/v1/events?hazard_type=all` | `[LIVE]` / `[HISTORICAL]` | Fully Available |
| **Rainfall Hydrograph** | `HM-01` | Hourly precipitation, cumulative depth, station coords | `observation`, `measurement`, `sensor_station` | Temporal aggregation, moving average calculation | `GET /api/v1/observations?modality=weather` | `[LIVE-SENSOR]` | Fully Available |
| **River Gauge Watch** | `HM-01` | River stage (m), danger mark (m), discharge (cumecs) | `observation`, `measurement` | Comparison against static danger thresholds | `GET /api/v1/observations?modality=hydrology` | `[LIVE-SENSOR]` | Fully Available |
| **Satellite Scene Viewer** | `HM-01`, `MEI-01` | Acquisition timestamp, footprint polygon, imagery URI | `raster_product`, `satellite_scene`, `modality_event` | Bounding box intersection, WMS tile layer binding | `GET /api/v1/modalities/sar/scenes` | `[HISTORICAL-ISRO]` | Fully Available |
| **Social Media Hotspot Map** | `SMI-01` | Post lat/long, density, sentiment, category | `text_item`, `observation`, `social_post` | Spatial clustering (DBSCAN/Grid), coordinate extraction | `GET /api/v1/observations?modality=social` | `[AI-ESTIMATED]` | Available (Enriched) |
| **Citizen Post Stream** | `SMI-01` | Raw text, author, timestamp, urgency class, verified tag | `text_item`, `observation` | Bilingual translation tokenization, urgency regex/NLP | `GET /api/v1/observations?modality=social` | `[UNVERIFIED-CITIZEN]` | Available |
| **Rumor Quarantine List** | `SMI-01` | Debunked claim, debunking source, counter-evidence | `text_item`, `event_evidence`, `fact_check` | Text similarity matching against official press releases | `GET /api/v1/events/{id}/evidence` | `[FACT-CHECKED]` | Available |
| **Multimodal Matrix** | `MEI-01` | Linked sensor, satellite, social, and field counts | `event`, `modality_event`, `event_evidence` | Relational join by `canonical_event_code` | `GET /api/v1/events/{id}` | `[OFFICIAL-SYNTHESIS]` | Fully Available |
| **Event Chronology Rail** | `MEI-01` | Milestone timestamp, phase, agency, description | `event`, `event_timeline`, `event_evidence` | Chronological sorting ascending/descending | `GET /api/v1/events/{id}` (timeline) | `[VERIFIED-RECORD]` | Fully Available |
| **AI Cascade Forecast** | `MEI-01` | Susceptibility score, predicted secondary impacts | `derived_result`, `ai_model_run` | AI inference synthesis, probability weighting | `GET /api/v1/events/{id}/forecast` | `[AI-PREDICTED]` | Simulated / Rule-based |

---

## 5. Wireframes & Interaction Contracts (Step 5)

### 5.1 System Wireframe & Layout Architecture

```
+----------------------------------------------------------------------------------------------------+
| TOPBAR: Disaster Intelligence Platform | Uttarakhand SEOC | Time: 2026-11-12 23:30 IST | Officer: AK   |
+---------------------+------------------------------------------------------------------------------+
| SIDEBAR NAVIGATION  | BREADCRUMBS: Analytics Suite > Hazard Monitoring & Analysis (HM-01)          |
| - Overview          +------------------------------------------------------------------------------+
| - Map Explorer      | FILTER BAR: [Catchment: Mandakini v] [Hazard: All v] [Time: 24h v] [Refresh] |
| - Disasters/Events  +------------------------------------------------------------------------------+
| - Modality Events   | KPI STRIP:                                                                   |
| - Raw Modalities    | [ 142 Active Sensors ] [ 3 Above Danger ] [ Peak: 82mm/hr ] [ 2 Risk Alerts] |
| ------------------- +----------------------------------------------+-------------------------------+
| ANALYTICS SUITE:    | CATCHMENT SENSOR MAP (Leaflet.js)            | HYDROLOGICAL TREND CHART      |
| [HM] Hazard Monitor | - WMS Rainfall Isohyets                      | - Dual-axis Rainfall vs Water |
| [SMI] Social Intel  | - Colored Sensor Pins (Red/Amber/Green)      | - Danger Mark Threshold Line  |
| [MEI] Multimodal    | - Click Pin -> Load Sensor Hydrograph        | - Hover for exact readings    |
| ------------------- +----------------------------------------------+-------------------------------+
| - GIS Maps          | ACTIVE TELEMETRY THRESHOLD BREACHES          | PREDICTIVE RUN-OFF GAUGES     |
| - Reports & SITREP  | [ALERT] UK-RUD-04: Rainfall 82 mm/hr         | - Flash Flood Risk: 89% (High)|
| - Settings          |  --> [Investigate Trigger in MEI-01]         | - Landslide Vulnerability: 74%|
+---------------------+------------------------------------------------------------------------------+
```

### 5.2 Interaction Contracts & Navigation Handshakes

#### Contract 1: Sensor Anomaly Drill-Down (`HM-01` -> `MEI-01`)
* **Trigger**: User clicks `[Investigate Trigger]` on any threshold breach item in `HazardMonitoringView.js`.
* **Payload**:
  ```json
  {
    "targetTab": "multimodal-intelligence",
    "params": {
      "eventId": "EV-2026-0814-FLD",
      "focusModality": "hydrology",
      "sensorId": "UK-RUD-04",
      "highlightTimestamp": "2026-08-14T14:30:00Z"
    }
  }
  ```
* **Result**:
  1. Window location hash changes to `#multimodal-intelligence?event=EV-2026-0814-FLD`.
  2. `MultimodalEventView.js` mounts, automatically selects event `EV-2026-0814-FLD`, opens the Hydrology evidence tab, and centers the map on the trigger sensor coordinates.

#### Contract 2: Social Media SOS Cluster Drill-Down (`SMI-01` -> `MEI-01`)
* **Trigger**: User clicks `[Link to Disaster Dossier]` on an SOS post cluster in `SocialMediaIntelligenceView.js`.
* **Payload**:
  ```json
  {
    "targetTab": "multimodal-intelligence",
    "params": {
      "eventId": "EV-2026-0814-LSD",
      "evidenceSource": "social",
      "clusterLocation": "Devprayag-Byasi NH-58"
    }
  }
  ```
* **Result**:
  1. Application switches route to `#multimodal-intelligence`.
  2. The unified event view loads incident `EV-2026-0814-LSD`, highlights the Road Closure impact category, and appends the citizen post to the evidence stream.

#### Contract 3: Synchronized Basemap & Time Window Filtering
* When user changes the global timeframe dropdown in the top bar (e.g. `Past 24 Hours` to `Monsoon Season 2026`), all three analytical dashboards immediately re-query their respective API endpoints with matching `start_time` and `end_time` parameters without requiring a page reload.

---

## 6. Prototype Implementation & Architecture Extensions (Step 6)

### 6.1 Architectural Rules & Constraints
1. **Zero Node / Zero Build**: All new views must execute within the current **React 18 + Babel Standalone** architecture loaded directly in [`app/static/index.html`](file:///c:/Users/ashut/Projects/disaster_data_downloader/app/static/index.html).
2. **Preserve Existing Structure**: Do NOT alter [`DashboardView.js`](file:///c:/Users/ashut/Projects/disaster_data_downloader/app/static/js/views/DashboardView.js) or [`EventsView.js`](file:///c:/Users/ashut/Projects/disaster_data_downloader/app/static/js/views/EventsView.js).
3. **Dedicated View Files**:
   * [`app/static/js/views/HazardMonitoringView.js`](file:///c:/Users/ashut/Projects/disaster_data_downloader/app/static/js/views/HazardMonitoringView.js)
   * [`app/static/js/views/SocialMediaIntelligenceView.js`](file:///c:/Users/ashut/Projects/disaster_data_downloader/app/static/js/views/SocialMediaIntelligenceView.js)
   * [`app/static/js/views/MultimodalEventView.js`](file:///c:/Users/ashut/Projects/disaster_data_downloader/app/static/js/views/MultimodalEventView.js)
4. **Sidebar Integration**:
   Add a distinct navigation group in [`app/static/js/components/Sidebar.js`](file:///c:/Users/ashut/Projects/disaster_data_downloader/app/static/js/components/Sidebar.js) titled **"INTELLIGENCE SUITE"** with items:
   - `Hazard Monitoring` (ID: `hazard-monitoring`, Icon: CloudRain / Waves)
   - `Social Intelligence` (ID: `social-intelligence`, Icon: MessageCircle / Radio)
   - `Multimodal Dossier` (ID: `multimodal-intelligence`, Icon: Layers / ShieldAlert)
5. **Route Management in `App.js`**:
   Extend `activeTab` switch logic to render the three new components when their respective tab or hash is triggered.
6. **Data Lineage Display Rule**:
   Every analytical card, chart, and map layer must display a standardized badge indicating data source reliability:
   * `[LIVE-SENSOR]` (Green border, green text)
   * `[OFFICIAL-GROUND-TRUTH]` (Blue border, blue text)
   * `[REMOTE-SENSED]` (Purple border, purple text)
   * `[AI-ESTIMATED]` (Amber border, amber text)
   * `[HISTORICAL-ARCHIVE]` (Slate border, slate text)
   * `[UNVERIFIED-CITIZEN]` (Red border, red text)

---

## 7. Component Checklist & Acceptance Tests

* **[SRS-HM-01]** **[MUST]** Provide `HazardMonitoringView.js` featuring 4 KPI cards, interactive Leaflet basin map with sensor pins, dual-axis rainfall/water level chart, and live anomaly feed. (Acceptance check: View loads cleanly with zero console errors and renders all 4 sections.)
* **[SRS-HM-02]** **[MUST]** Display standardized status badges (`[LIVE-SENSOR]`, `[AI-ESTIMATED]`) on all hydro-meteorological cards. (Acceptance check: Badges render with correct semantic CSS classes.)
* **[SRS-HM-03]** **[MUST]** Implement drill-down button on each anomaly card that switches the active tab to `multimodal-intelligence` with the correlated event loaded. (Acceptance check: Clicking "Investigate" transitions directly to the unified event dossier.)
* **[SRS-SMI-01]** **[MUST]** Provide `SocialMediaIntelligenceView.js` featuring 4 intelligence KPIs, geospatial hotspot cluster map, bilingual post triage stream, keyword cloud, and misinformation quarantine table. (Acceptance check: View renders all 5 components with responsive grid alignment.)
* **[SRS-SMI-02]** **[MUST]** Provide urgency filtering (`SOS Rescue`, `Road Block`, `Medical`, `Damage`, `Rumor`) and Hindi/English bilingual text rendering. (Acceptance check: Selecting urgency filters updates the post list instantaneously.)
* **[SRS-SMI-03]** **[MUST]** Support one-click escalation from a social post to `multimodal-intelligence` as supporting evidence. (Acceptance check: Clicking "Link to Event" transfers context cleanly.)
* **[SRS-MEI-01]** **[MUST]** Provide `MultimodalEventView.js` featuring an incident command header, 5-stream cross-modality matrix, synchronized multi-layer map, and chronological multi-agency timeline. (Acceptance check: Event selection populates all 5 modality channels simultaneously.)
* **[SRS-MEI-02]** **[MUST]** Safely handle polymorphic data objects without throwing React child exceptions. (Acceptance check: Switching events never produces a blank screen.)
* **[SRS-NAV-01]** **[MUST]** Keep the main Dashboard and all existing views completely intact and operational. (Acceptance check: Dashboard, Events, Modality Events, Raw Modalities, GIS, Reports, and Settings continue to function normally.)
* **[SRS-NAV-02]** **[MUST]** Add the 3 new views to `Sidebar.js` under an "INTELLIGENCE SUITE" section heading with live count badges. (Acceptance check: Clicking any new sidebar item routes to the corresponding analytical view.)

---

## 8. Definition of Done (DoD)

A dashboard prototype is deemed **Done** only when:
1. The view component file exists in `app/static/js/views/`.
2. It is imported and declared in `app/static/index.html` via `<script type="text/babel">`.
3. It is linked in `Sidebar.js` and wired in `App.js`.
4. It connects to the live FastAPI backend endpoints and falls back gracefully to structured simulated data if an endpoint returns empty.
5. All interaction contracts (map clicks, filters, drill-downs between HM -> MEI and SMI -> MEI) function smoothly in a headless browser test.
6. The entire automated test suite (`tests/test_runner.py --tier all`) passes with 100% success.
