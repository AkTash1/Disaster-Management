SOFTWARE REQUIREMENTS SPECIFICATION
Page-wise & Component-wise Checklist
AI-Powered Multimodal Disaster Intelligence Platform
Version 2.0 | Checklist / Point Format Only (Aligned with Implemented Frontend)

Purpose
This document defines the page-wise, component-wise Software Requirements Specification (SRS) based on what the AI-Powered Multimodal Disaster Intelligence Platform frontend and API currently provide. It intentionally uses checklists and bullet points only—no tables. Each requirement has an ID, priority and acceptance check.

Priority legend
[MUST] Required and implemented for the core agreed experience.
[SHOULD] Implemented enrichment or expected operational capability where feasible and appropriate.
[MAYBE] Optional, staged/hidden (such as Event Groups), or future-phase expansion; not shown in primary navigation until approved.

1. Global shell and shared components
• [SRS-01-01] [MUST] Show single-line left sidebar navigation for Overview, Map Explorer, Events, Modality Events, Reports & Evidence, History & Trends, Preparedness & Response, Ask (Q&A), My Area, Settings, and Help & About without secondary description lines under menu labels. (Acceptance check: Sidebar renders all 11 active routes cleanly and supports 256px/64px collapse toggle.)
• [SRS-01-02] [MUST] Hide the Event Groups page from primary sidebar navigation (hidden: true) during current testing while preserving its view and API route for later activation. (Acceptance check: Event Groups is not visible in Sidebar.js.)
• [SRS-01-03] [MUST] Provide a clean 64px top bar (TopBar.js) with platform branding (Disaster Intelligence Platform, without secondary testbed subtitle clutter), global search input (Ctrl+K), region/district selector (Uttarakhand + 13 districts), and timeframe selector (Past 24 Hours, Past 7 Days, Past 30 Days, Monsoon Season 2026). (Acceptance check: Top bar controls render and filter context across views.)
• [SRS-01-04] [MUST] Show live feed status pill (Live Feed Active), active emergency alerts counter (3 Alerts) with clickable warning popover, and duty officer badge (AK — Ashutosh Kanojia, State Response Officer). (Acceptance check: Clicking 3 Alerts opens the urgent warnings popover; clicking an item navigates to Events.)
• [SRS-01-05] [MUST] Enforce clear font size and boldness differentiation between headings (24px extrabold page headings, 15.5px bold panel titles, 14.5px bold card titles) and body/subtext (12px–13.5px regular muted text), with every page displaying its main heading and page description directly below it. (Acceptance check: All views render prominent h1 + p page headers and high-contrast light-theme cards.)
• [SRS-01-06] [MUST] Use consistent event IDs (EV-...), modality event IDs (ME-...), hazard labels, status vocabulary (Active, Monitoring, Resolved, Processed) and severity definitions (Critical, High, Moderate, Low) across all pages. (Acceptance check: SeverityBadge, StatusBadge, and EpistemicBadge render uniform tokens globally.)
• [SRS-01-07] [MUST] Show source agency, timestamp (IST/UTC), freshness, confidence score, and epistemic status (Observed, Official, Reported, AI Inferred, Predicted, Unverified) where relevant. (Acceptance check: Badges and provenance labels appear on all event, modality, report, and Q&A cards.)
• [SRS-01-08] [MUST] Support responsive layout, keyboard navigation (Ctrl+K search, Escape drawer close), and key-free Leaflet maps with ResizeObserver auto-sizing. (Acceptance check: Maps and grids resize cleanly without grey tile gaps or horizontal overflow.)

2. Overview page
Purpose: provide a quick operational picture for the selected region and time period.
• [SRS-02-01] [MUST] Show 7 top KPI cards for Total Events (30d), Active Incidents, Official Warnings, Risk Alerts, People in Watch Zones, Affected Areas, and Reported Casualties with sparklines and non-celebratory severity deltas. (Acceptance check: All 7 KPI cards render tabular numerals and semantic delta badges.)
• [SRS-02-02] [MUST] Show Official Warnings separately from platform-generated Risk Alerts in both the KPI strip and the active warnings feed. (Acceptance check: Official Warnings and Risk Alerts have distinct cards and badges.)
• [SRS-02-03] [MUST] Show quick-action navigation buttons (Open Full Map, Relief Shelters, Ask Assistant) in the page header. (Acceptance check: Buttons navigate directly to Map Explorer, Preparedness & Response, and Ask (Q&A).)
• [SRS-02-04] [MUST] Show a prominent regional Leaflet map (Live Disaster Map — Uttarakhand) with event markers, affected-area polygons, Reset Map View button, Full Map Explorer link, and Light/Topo/Satellite/Dark basemap switcher. (Acceptance check: Map fills its panel height with zero top/bottom whitespace gap and opens marker popups on click.)
• [SRS-02-05] [MUST] Show Active Events and Warnings in a time-ordered priority list alongside the map. (Acceptance check: Clicking any alert centers the Overview map on that incident.)
• [SRS-02-06] [MUST] Show Latest Official Updates & News with publisher, timestamp, verification badge, and View All link to Reports & Evidence. (Acceptance check: Official updates panel lists verified USDMA, IMD, BRO, and CWC dispatches.)
• [SRS-02-07] [SHOULD] Show event breakdown by Hazard Type (Landslide, Flood, Heavy Rainfall, Earthquake) and by Risk Level (Critical, High Risk, Moderate, Normal). (Acceptance check: Horizontal distribution bars render percentages and counts.)
• [SRS-02-08] [SHOULD] Show 30-Day Incident Trend multi-hazard chart for the selected period. (Acceptance check: ChartView renders 30-day temporal curves cleanly.)
• [SRS-02-09] [SHOULD] Show Most Affected Districts, Recent Incidents (Last 24 Hours), and Connected Data Sources (live feed health for IMD, CWC, ISRO, GSI, NCS, USDMA). (Acceptance check: Bottom 3 operational panels render complete district, incident, and source health rows.)

3. Map Explorer page
• [SRS-03-01] [MUST] Provide full-screen map pan, zoom, Reset Uttarakhand View, live cursor coordinates, and selected-area context. (Acceptance check: Map canvas fills viewport height below TopBar and responds to zoom/reset actions.)
• [SRS-03-02] [MUST] Filter map features by Hazard, Severity, and Region/District via a floating top HUD filter bar with Reset action. (Acceptance check: Changing dropdowns filters visible markers and side-panel rows.)
• [SRS-03-03] [MUST] Toggle Disaster Events, Official Warnings, Risk/Forecast Zones, Affected Areas, CWC River Gauges, and Relief Shelters as independent GIS layers. (Acceptance check: Layer toggles show/hide corresponding Leaflet feature groups.)
• [SRS-03-04] [SHOULD] Show platform risk/forecast overlays with explicit AI Inferred / Predicted labels. (Acceptance check: Risk overlays display epistemic badges distinguishing them from observed events.)
• [SRS-03-05] [MUST] Show a selected-feature inspector card with event ID, hazard, severity, status, location, impact summary, and detail link to Events. (Acceptance check: Clicking a map pin or list item opens the feature card.)
• [SRS-03-06] [SHOULD] Provide collapsible right-hand side-panel views for All, Events, Warnings, and Risk Signals as a list/search alternative to map-only interaction. (Acceptance check: Side panel tabs filter the list and pan the map on selection.)
• [SRS-03-07] [SHOULD] Provide a bottom time slider with Play/Pause controls for historical progression across the monsoon episode. (Acceptance check: Time scrubber steps through dates and updates displayed features.)
• [SRS-03-08] [MUST] Show a map legend and source/freshness information for visible layers, plus Light, Topographic, Satellite, and Dark map styles. (Acceptance check: Legend and basemap switcher operate without API key errors.)

4. Events page
• [SRS-04-01] [MUST] Show a 6-card KPI strip (Total Events, Active Events, Resolved, High Severity, Moderate, Low / Advisory) above the event workspace. (Acceptance check: All 6 KPI cards render accurate counts and deltas.)
• [SRS-04-02] [MUST] Show event title, hazard code badge (LSD, FLD, MET, EQK), region/location, timestamp, canonical event code (EV-...), severity badge, and status badge in each master list card. (Acceptance check: Left-hand Event Log renders all event cards with active selection border.)
• [SRS-04-03] [MUST] Filter by Hazard (All Hazards, Landslide, Flood, Heavy Rainfall, Earthquake), Severity (All Severities, Critical, High, Moderate, Low), and Status (All Status, Active, Resolved) with a Reset button. (Acceptance check: Filter bar updates the master list via /api/v1/events.)
• [SRS-04-04] [MUST] Sort by event timestamp descending and provide PREV / NEXT pagination controls. (Acceptance check: Pagination buttons increment/decrement pages cleanly.)
• [SRS-04-05] [MUST] Show event title, canonical event ID, location, timestamp, SeverityBadge, and StatusBadge in the right-hand detail header. (Acceptance check: Detail header updates immediately when an event is clicked.)
• [SRS-04-06] [MUST] Provide 7 fully populated detail tabs: Overview, Timeline (6), Evidence (6), Modality Events (4), Regions (3), Impacts (6), and Related (3). (Acceptance check: Every tab renders structured operational data with zero empty/placeholder tabs.)
• [SRS-04-07] [MUST] Safely normalize string and nested object fields (such as hazard objects { code, name, category } and key_information) so the page never renders blank. (Acceptance check: Selecting any event renders all 7 tabs with zero React exceptions.)

5. Event Detail — component checklist
• [SRS-05-01] [MUST] Overview component: show Epicenter Focus mini-map, Geospatial Attributes (Hazard Type, Confidence, Coordinates, Elevation, Affected Extent), Field Recon Frames (UAV-RECON-NH58-01.TIFF, SAR-01, OPT-02), Operational Situation Summary, Impact Assessment (Observed Ground Truth vs. 24–48h Forecast), Contributing Modality Events, and Related Disasters Happening. (Acceptance check: Overview tab renders all 6 sub-panels with quick links to other tabs.)
• [SRS-05-02] [MUST] Timeline component (Timeline (6)): show chronological milestones (Initial Trigger, Threshold Crossed, Primary Incident, Emergency Response, Evacuation Action, Clearance Underway) with distinct timestamps, phase badges, responsible agency (IMD, CWC & GSI, DDMA, SDRF, SDM Office, BRO), title, and narrative detail. (Acceptance check: Timeline tab renders 6 chronological nodes.)
• [SRS-05-03] [MUST] Evidence component (Evidence (6)): show verified Official Bulletins (USDMA SEOC), Satellite/SAR passes (ISRO EOS-04), Field Engineering reports (BRO), Drone Recon orthomosaics (SDRF UAV), News Coverage (Amar Ujala / DD News in Hindi), and Citizen Media clips with verification badges, external source links (Open Source Portal ↗), and a button to open Reports & Evidence. (Acceptance check: Evidence tab renders 6 cards with clickable links.)
• [SRS-05-04] [MUST] Modality Events component (Modality Events (4)): show linked detections across Weather, Landslide, Flood, and News & Social with modality ID (ME-...), station/source name, measured reading, threshold anomaly status, confidence score, and an Inspect in Modality Events button. (Acceptance check: Modality Events tab renders 4 sensor/channel cards and navigates to Modality Events.)
• [SRS-05-05] [MUST] Regions component (Regions (3)): show affected administrative zones (Rudraprayag Primary Impact Zone, Chamoli Upper Catchment, Pauri & Tehri Garhwal Downstream Corridor) with LGD codes, Tehsils/Blocks, Villages & Gram Panchayats, Population Exposure, Highways & Road Links, and Relief Camps & Critical Facilities. (Acceptance check: Regions tab renders 3 detailed regional breakdown cards.)
• [SRS-05-06] [MUST] Impacts component (Impacts (6)): separate observed ground truth and response metrics across 6 categories—Population & Human Safety, Highways/Bridges & Transport, Housing & Public Buildings, Power/Water & Telecom, Agriculture & Livelihoods, and Active Relief & Rescue Operations—with a button to open Preparedness & Response. (Acceptance check: Impacts tab renders all 6 impact categories.)
• [SRS-05-07] [MUST] Related component (Related (3)): show Upstream Trigger Events, Concurrent Basin Cascades, and Regional Weather System Impacts (clickable to switch event dossier), plus Official Portals, News & Social Media Channels (USDMA State Portal, Amar Ujala Uttarakhand, @SDRFUttarakhand). (Acceptance check: Related tab renders 3 linked disasters and 3 external channel links.)

6. Modality Events page
Modality events are individual sensor, satellite, news, or social detections. They provide full operational context and linkage to unified events.
• [SRS-06-01] [MUST] Show an 8-card clickable KPI strip by modality/hazard category: Total (142), Earthquake (4), Flood (28), Landslide (36), Weather (48), News (64), Social (71), and Other (2). (Acceptance check: Clicking any KPI card filters the list by that category.)
• [SRS-06-02] [MUST] List detection title, category code (WTH, FLD, LSD, EQK, NWS, SOC), station/source, detection time, classification badge (DETECTED EVENT, AI INFERRED, REPORTED INCIDENT), processing status (Processed), and confidence score in the left-hand list. (Acceptance check: Left list renders selectable detection cards.)
• [SRS-06-03] [MUST] Filter by Modality category and Status with a Clear Filters button. (Acceptance check: Dropdowns and Clear Filters update the displayed detections.)
• [SRS-06-04] [MUST] Provide a 5-tab detail inspector: Summary (All Info) (displaying all 5 core sections together), The Event Itself, Related Disasters (4), Area Affected, and Official, News & Social Sites. (Acceptance check: All 5 sections are visible on the main Summary view and individually via tabs.)
• [SRS-06-05] [MUST] Summary section (Summary — What is Happening): show a plain-language operational summary of what triggered the event, its severity, and immediate response status. (Acceptance check: Summary panel renders at the top of the detail view with LIVE badge.)
• [SRS-06-06] [MUST] The Event Itself section: show Hazard/Event Type, Measured Intensity/Magnitude (e.g., 112.0 mm / 3 hrs or 628.45 m river stage), Monitoring Station/Feed, Threshold Status, clickable Linked Main Disaster Event (EV-...), and an interactive Event Location Map. (Acceptance check: Parameters and Leaflet mini-map render side-by-side; linked event navigates to Events.)
• [SRS-06-07] [MUST] Related Disasters section (Related Disasters Happening Right Now): show active cascading or concurrent disasters happening alongside this detection (Rudraprayag Cloudburst & Flash Flood, Banswara NH-58 Landslide, Srinagar Alaknanda River Rise, Tehri Dam Inflow Surge) with severity badges, status, and one-click navigation to Events. (Acceptance check: All 4 related disaster cards render and navigate on click.)
• [SRS-06-08] [MUST] Area Affected section: show structured geographic cards for Primary & Adjacent Districts, Tehsils/Blocks Affected, Villages & Gram Panchayats, Highways & Roads Impacted, Population & Evacuations, and River Basins & Terrain. (Acceptance check: All 6 Area Affected cards populate with detailed Uttarakhand data.)
• [SRS-06-09] [MUST] Official Channels, News & Social Media section: show 3 side-by-side columns with clickable external links (↗) and verification tags for Official Government Channels (USDMA, IMD Mausam Dehradun, CWC Flood Portal, BRO Road Status), News Coverage & Portals (Amar Ujala Hindi, Dainik Jagran, The Hindu/PTI, DD News Uttarakhand), and Social Media Updates (@USDMAUk, @SDRFUttarakhand, @RudraprayagPol, Local Citizen Videos). (Acceptance check: All 12 external links render across 3 columns.)

7. Reports & Evidence page
• [SRS-07-01] [MUST] Show a 6-card KPI strip for Total Reports, Official Bulletins, News Articles, Social & Crowd, Geotagged Items, and Recon Media. (Acceptance check: KPI strip renders top-level evidence counts.)
• [SRS-07-02] [MUST] List official bulletins, news articles, social media posts, and field media with publisher, title, publication time, language badge, and verification status. (Acceptance check: Master list renders selectable report rows.)
• [SRS-07-03] [MUST] Filter by keyword search, Source Type (Official Report, News Article, Social Media), Verification Status (Verified, Likely True, Unverified), Hazard Type, and Language (English (EN), हिंदी (HI)) with Reset Filters button. (Acceptance check: Filters update the list dynamically.)
• [SRS-07-04] [MUST] Distinguish Official/Verified, Likely True, Unverified, and AI-Inferred content using epistemic badges. (Acceptance check: Verification badges appear on list items and the detail header.)
• [SRS-07-05] [SHOULD] Provide side-by-side bilingual inspection showing Original Dispatch Text alongside verified English/Hindi translation. (Acceptance check: Bilingual panel displays both English and Devanagari Hindi text.)
• [SRS-07-06] [SHOULD] Show extracted key takeaways, named entities, source reliability audit scores, original URL link, and links to related modality events and unified events. (Acceptance check: Detail panel renders takeaways, reliability checklist, and provenance links.)

8. History & Trends page
• [SRS-08-01] [MUST] Show 10-year historical event KPIs (Total Historical Events 2015–2025, Peak Hazard Category, Most Impacted District, Monsoon Concentration, Verified Landslide Scars, Historical Casualties). (Acceptance check: 6 KPI cards render historical metrics.)
• [SRS-08-02] [SHOULD] Show Multi-Year Hazard Trend (2015–2025) and Monthly Monsoon Seasonality Profile (Jan–Dec) charts using Chart.js. (Acceptance check: Both charts render cleanly inside ChartView containers.)
• [SRS-08-03] [SHOULD] Compare districts/regions, GSI historical landslide scar inventories, and historical analog episodes (e.g., Oct 2026 vs. Aug 2021). (Acceptance check: District vulnerability breakdown and analog comparison cards populate.)
• [SRS-08-04] [MUST] Filter charts and lists by District, Hazard Type, and Time Horizon (10 Years, 5 Years, Last 12 Months) and show source coverage caveats. (Acceptance check: Filter controls update historical views.)

9. Preparedness & Response page
• [SRS-09-01] [MUST] Show KPI cards for Active Relief Shelters, Total Bed Capacity, Current Occupancy, SDRF/NDRF Teams Deployed, Medical Facilities Ready, and 24x7 Helplines Active. (Acceptance check: All 6 preparedness KPI cards render.)
• [SRS-09-02] [SHOULD] Show verified shelters/relief centres in a searchable, filterable list and interactive map with capacity, occupancy percentage, medical/food status, and contact officer. (Acceptance check: Shelter table and map pins filter by district and status.)
• [SRS-09-03] [SHOULD] Show official emergency contacts and authority links for Uttarakhand (1070 SEOC, 1077 DDMA, 112 ERSS, SDRF, BRO, Medical Helpline). (Acceptance check: Emergency helpline directory displays verified numbers.)
• [SRS-09-04] [SHOULD] Show verified safety SOPs and citizen guidance checklists for Landslides, Flash Floods, Cloudbursts, and Earthquakes, along with last-verified time and dynamic availability notice. (Acceptance check: SOP cards render actionable steps and timestamps.)

10. Ask (Q&A) page
• [SRS-10-01] [SHOULD] Accept natural-language questions about events, highways, rainfall, rivers, and shelters in Uttarakhand, and provide clickable common-question prompt chips. (Acceptance check: Prompt chips and text input submit queries to POST /api/v1/ask.)
• [SRS-10-02] [MUST] Strictly separate every answer into three distinct sections: Verified Empirical Facts (observed/official), Derived Inferences (AI/geotechnical models), and Forward Projections (24–48h forecasts). (Acceptance check: Response UI renders 3 separate colour-coded epistemic panels.)
• [SRS-10-03] [MUST] Show clickable inline citations ([REF-01] to [REF-06]) linked to a right-hand Source Provenance Inspector showing agency, timestamp, confidence, and source link. (Acceptance check: Clicking a citation highlights the matching source record on the right.)
• [SRS-10-04] [MUST] Display confidence score, model version, and explicit disclaimer that Q&A outputs are decision-support summaries and never replace official authority evacuation warnings. (Acceptance check: Safety disclaimer banner is visible on the Ask page.)

11. My Area, Settings & Help pages
• [SRS-11-01] [MUST] My Area page (MyAreaView.js): allow duty officers (Ashutosh Kanojia, State Response Officer) to pin/unpin Uttarakhand districts, inspect a geofenced district watchlist map, and configure hazard-specific watchlist triggers (Landslide, Flood, Heavy Rainfall, Earthquake). (Acceptance check: Pinned districts and triggers update via /api/v1/my-area/watchlist.)
• [SRS-11-02] [MUST] Settings page (SettingsView.js): allow configuration of telemetry auto-refresh frequency (15s, 30s, 60s, Manual), coordinate format (Decimal Degrees vs. DMS), default basemap style, measurement units, interface language (English/Hindi), and webhook/SMS notification channels. (Acceptance check: Settings form saves preferences via /api/v1/my-area/settings.)
• [SRS-11-03] [MUST] Help & About page (HelpView.js): display in-app documentation covering the 4-level intelligence hierarchy, epistemic badge glossary, agency feed latencies, keyboard shortcuts, and SEOC contact protocols. (Acceptance check: Help & About view renders all guide panels.)

12. AI layer checklist
• [SRS-12-01] [MUST] Preserve immutable raw source records (raw_object, raw_validation) and full relational provenance across 38 tables, 28 enums, and 92 foreign keys. (Acceptance check: /api/v1/tables validates all 38 tables and 92 FKs.)
• [SRS-12-02] [MUST] Keep event time, observation time, publication time, and ingestion time distinct. (Acceptance check: Distinct timestamp columns exist in canonical schema and API responses.)
• [SRS-12-03] [MUST] Normalize source-specific records into canonical observations (observation, text_item, raster_product, media). (Acceptance check: All 4 canonical input tables are populated and linked.)
• [SRS-12-04] [MUST] Detect modality-specific candidate events (modality_event) before cross-source fusion into unified events (event). (Acceptance check: Modality Events and Events operate as distinct, linked stages.)
• [SRS-12-05] [MUST] Enforce single-target exclusivity constraints (ck_derived_input_one and ck_modality_input_one) for polymorphic lineage. (Acceptance check: Verified by automated Tier-1 and Tier-3 relational integrity tests.)
• [SRS-12-06] [MUST] Attach model version, timestamp, threshold rule, and confidence score to AI-derived outputs and separate official claims from AI interpretations. (Acceptance check: Derived results and modality detections expose model metadata.)

13. Frontend-to-AI/API data contracts (Implemented Routes)
• [SRS-13-01] [MUST] Overview summary — used by Overview. Implemented endpoint: GET /api/v1/overview/summary. Response: 7 KPIs, active warnings, 30-day trends, hazard/severity splits, top districts, recent incidents, and source health. (Acceptance check: HTTP 200 JSON verified.)
• [SRS-13-02] [MUST] Unified event search — used by Overview, Events, and Map Explorer. Implemented endpoint: GET /api/v1/events. Inputs: hazard, severity, status, page, limit. Response: event summaries, KPIs, IDs, coordinates, timestamps, and status. (Acceptance check: HTTP 200 JSON verified.)
• [SRS-13-03] [MUST] Event detail — used by Events 7-tab inspector. Implemented endpoint: GET /api/v1/events/{event_id}. Response: canonical event, key_information, centroid, affected_area, impact_comparison (observed vs. predicted), contributing_modalities, gallery, and related_events. (Acceptance check: HTTP 200 for valid ID, HTTP 404 for unknown ID.)
• [SRS-13-04] [MUST] Modality events — used by Modality Events. Implemented endpoints: GET /api/v1/modality-events and GET /api/v1/modality-events/{modality_event_id}. Inputs: domain, modality, classification, hazard. Response: category KPIs, candidate detections, supporting_observations, derived_results, and matched unified event. (Acceptance check: HTTP 200 JSON verified.)
• [SRS-13-05] [MUST] Map features — used by Map Explorer. Implemented endpoint: GET /api/v1/map/features. Inputs: hazard, severity, district, layer, bbox. Response: GeoJSON FeatureCollection with layer type, severity, status, and timeline steps. (Acceptance check: Valid GeoJSON returned.)
• [SRS-13-06] [MUST] Reports search & detail — used by Reports & Evidence. Implemented endpoints: GET /api/v1/reports and GET /api/v1/reports/{report_id}. Inputs: search, source_type, verification, hazard, language. Response: bilingual report metadata, Hindi/English text, takeaways, original URL, and reliability scores. (Acceptance check: HTTP 200 JSON verified.)
• [SRS-13-07] [MUST] Historical trends — used by History & Trends. Implemented endpoint: GET /api/v1/history/trends. Inputs: district, hazard, years. Response: 10-year trend series, seasonality curve, district vulnerability, and GSI landslide scars. (Acceptance check: HTTP 200 JSON verified.)
• [SRS-13-08] [MUST] Preparedness resources — used by Preparedness & Response. Implemented endpoint: GET /api/v1/preparedness/resources. Inputs: district, type. Response: verified shelters, capacities, occupancy, helplines, and SOPs. (Acceptance check: HTTP 200 JSON verified.)
• [SRS-13-09] [MUST] Grounded Q&A — used by Ask (Q&A). Implemented endpoint: POST /api/v1/ask. Inputs: query, district. Response: partitioned facts, inferences, projections, citations ([REF-01]–[REF-06]), and confidence. (Acceptance check: HTTP 200 for valid query, HTTP 422 for blank query.)
• [SRS-13-10] [MUST] My Area & Settings — used by My Area and Settings. Implemented endpoints: GET/POST/DELETE /api/v1/my-area/watchlist and GET/PUT /api/v1/my-area/settings. Response: pinned LGD districts, hazard thresholds, and duty officer profile (Ashutosh Kanojia). (Acceptance check: CRUD operations persist in state.)

14. Implemented event response example
{ "event_id": "ev-lsd-001", "event_code": "EV-LSD-2026-10-09-001", "name": "Landslide in Rudraprayag (Basukedar NH-107)", "hazard": {"code": "HAZ_LANDSLIDE", "name": "Landslide & Slope Failure", "category": "Geological"}, "severity": "Critical", "confidence": 0.99, "verification": "verified", "epistemic_status": "Observed", "status": "active", "start_time": "2026-10-24T16:30:00Z", "centroid": {"type": "Point", "coordinates": [79.062, 30.485]}, "key_information": {"district": "Rudraprayag", "tehsil": "Basukedar / Jakholi", "highway": "NH-107 (Kedarnath Highway, KM 48+200)", "lead_agency": "SDRF & BRO 752 BRTF"}, "impact_comparison": {"observed": [{"metric": "Road Carriageway Severed", "value": "340 meters", "epistemic_status": "Observed"}], "predicted": [{"metric": "Estimated Clearance Duration", "value": "36-48 hours", "epistemic_status": "Predicted"}]}, "contributing_modalities": [{"code": "ME-WTH-2026-10-09-001", "domain": "Weather Telemetry", "source": "CWC Basukedar Gauge", "reading": "128.4 mm precipitation / 6h", "confidence": 0.98}], "related_events": [{"code": "EV-RAIN-2026-10-08-002", "name": "Heavy Rainfall in Mandakini Basin", "relation": "Trigger Event"}] }

15. Trust, safety and error states
• [SRS-15-01] [MUST] Show loading, empty-filter, stale, and fallback states cleanly so no page ever renders blank. (Acceptance check: Safe asText() normalization and default fallbacks verified across all views.)
• [SRS-15-02] [MUST] Never imply an area is safe merely because no event matches active filters. (Acceptance check: Empty filter states advise checking official USDMA/IMD channels.)
• [SRS-15-03] [MUST] Separate official warnings from platform-generated AI/model risk signals. (Acceptance check: Distinct KPIs, layer toggles, and badges separate Official from AI Inferred/Predicted.)
• [SRS-15-04] [MUST] Label Observed, Official, Reported, AI Inferred, Predicted, and Unverified information consistently. (Acceptance check: EpistemicBadge used across all views.)
• [SRS-15-05] [MUST] Sanitize dynamic inputs and external links (rel="noopener noreferrer"), and never use raw unescaped > in JSX text nodes. (Acceptance check: Verified by 85 Tier-5 adversarial XSS/SQLi and headless Edge DOM tests.)
• [SRS-15-06] [SHOULD] Support English and Hindi (हिंदी) side-by-side display for field reports and official bulletins. (Acceptance check: Verified on Reports & Evidence and Modality Events news links.)

16. Non-functional targets — achieved baseline
• [SRS-16-01] [MUST] Provide instant-boot Zero-Node frontend architecture using locally vendored React 18, Babel Standalone, Tailwind CSS, Leaflet 1.9.4, and Chart.js 4.4.2. (Acceptance check: All /static/vendor/* assets load locally with HTTP 200.)
• [SRS-16-02] [SHOULD] Achieve sub-100ms p95 response time for cached list/detail APIs under local testbed load. (Acceptance check: 367 automated tests execute in ~6 seconds.)
• [SRS-16-03] [SHOULD] Achieve initial interactive page load under 2 seconds in headless Edge browser verification. (Acceptance check: Headless Edge DOM mount test passes in Tier 5.)
• [SRS-16-04] [MUST] Enforce strict HTTP 404 on unknown API/static routes so missing API endpoints never fall back to index.html. (Acceptance check: Verified by Tier-2 and Tier-5 boundary/adversarial tests.)

17. User acceptance checklist
• A user can find and filter events consistently across Overview, Map Explorer, Events, and Modality Events.
• A user can inspect all 7 populated tabs on the Events page (Overview, Timeline, Evidence, Modality Events, Regions, Impacts, Related) with zero empty tabs.
• A user can inspect all 5 sections on the Modality Events page (Summary, The Event Itself, Related Disasters, Area Affected, and Sites of Official Channels, News & Social Media).
• A user can distinguish Official sources, Reported claims, AI Inferred detections, and Predicted forecasts.
• A user can trace a modality detection (ME-...) to its station reading, location map, related disasters, affected areas, and linked unified event (EV-...).
• A user can open original external links for official portals (USDMA, IMD, CWC, BRO), Hindi/English news sites (Amar Ujala, Dainik Jagran, DD News, PTI), and official social feeds (@USDMAUk, @SDRFUttarakhand, @RudraprayagPol).
• Duty officer identity (Ashutosh Kanojia, AK, State Response Officer) and clean typography hierarchy are displayed consistently across the platform.

18. Scope assumptions and decisions
• Core implemented testbed scope: Uttarakhand State Emergency Operations Centre (SEOC Dehradun) covering 13 districts and mountain hazards (Earthquake, Flood, Landslide, Heavy Rainfall/Weather, News, Social Media).
• Event Groups (cascading episode DAG view) is implemented in code but hidden in the sidebar (hidden: true) per current user test configuration; it can be re-enabled at any time.
• Map tiles use key-free OpenStreetMap, OpenTopoMap, and Esri World Imagery basemaps so no external API key is required.
• Seed dataset contains 177 relational records across all 38 DBML tables representing realistic October 2026 Uttarakhand monsoon/landslide/flood operations.

19. Release grouping
• Implemented & Active (MUST / SHOULD): Global shell (TopBar, Sidebar); Overview; Map Explorer; Events (with all 7 tabs filled); Modality Events (with Summary, Event Itself, Related Disasters, Area Affected, Official/News/Social Sites); Reports & Evidence (bilingual EN/HI); History & Trends; Preparedness & Response; Ask (Q&A); My Area; Settings; Help & About.
• Staged / Hidden for Later Test (MAYBE): Event Groups (EventGroupsView.js — hidden in sidebar via hidden: true, ready to unhide when needed).

20. Definition of done
• Every MUST and SHOULD requirement is implemented in the active frontend and backed by a working /api/v1 endpoint.
• All 367 automated tests across Tier 1 (164 Feature), Tier 2 (84 Boundary), Tier 3 (28 Combination), Tier 4 (6 Scenario), and Tier 5 (85 Adversarial + Headless Edge DOM) pass at 100%.
• Zero blank screens, zero placeholder tabs on Events or Modality Events, and zero broken map tiles.
• Observed impacts are clearly separated from model predictions and forecasts.

Appendix — Official & Reference URLs Used in Platform
• USDMA State Emergency Portal: https://usdma.uk.gov.in
• IMD Mausam Dehradun Radar & Bulletins: https://mausam.imd.gov.in/dehradun
• Central Water Commission (CWC) Flood Forecast Portal: https://ffs.india-water.gov.in
• Border Roads Organisation (BRO) Road Status: https://bro.gov.in
• ISRO Bhuvan / NRSC Geo-Portal: https://bhuvan.nrsc.gov.in
• Amar Ujala Uttarakhand (Hindi News): https://www.amarujala.com/uttarakhand
• Dainik Jagran Uttarakhand Bureau: https://www.jagran.com/uttarakhand
• DD News Regional Bulletins: https://ddnews.gov.in
• SDRF Uttarakhand Official Handle: https://x.com/SDRFUttarakhand
• USDMA Official Handle: https://x.com/USDMAUk
• Rudraprayag Police Traffic & Highway Alerts: https://x.com/RudraprayagPol
