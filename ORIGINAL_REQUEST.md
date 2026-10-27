# Original User Request

## 2026-10-24T23:47:52Z

Build the **Disaster Intelligence Multimodal Platform** web application (React 18 frontend + FastAPI mock backend) for the Uttarakhand testbed, replicating the exact UI layout, navigation, and features shown in the 10 reference screenshots (`data/docx_extracted_images/image1.png` through `image10.png`) and backed by schema-compliant mock data and REST endpoints derived from the 38-table production schema (`schemas/dbdiagram_schema.dbml`).

Working directory: `c:\Users\ashut\Projects\disaster_data_downloader`
Integrity mode: demo

## Reference Material & Existing Workspace Assets

- **UI Specification & Text**: `docs/project_specs/Ideas for dashboard.docx` (extracted text at `data/pdf_extracted_texts/Ideas_for_dashboard.txt`)
- **10 High-Resolution Reference UI Screenshots** (located in `data/docx_extracted_images/`):
  1. **Overview** → `data/docx_extracted_images/image7.png`
  2. **Map Explorer** → `data/docx_extracted_images/image6.png`
  3. **Events (Unified Events)** → `data/docx_extracted_images/image4.png`
  4. **Modality Events** → `data/docx_extracted_images/image8.png`
  5. **Event Groups (Episodes)** → `data/docx_extracted_images/image9.png`
  6. **Reports & Evidence** → `data/docx_extracted_images/image10.png`
  7. **History & Trends** → `data/docx_extracted_images/image1.png`
  8. **Preparedness & Response** → `data/docx_extracted_images/image2.png`
  9. **Ask (Evidence-Grounded Q&A)** → `data/docx_extracted_images/image5.png`
  10. **My Area / Settings** → `data/docx_extracted_images/image3.png`
- **Official Database Schema (38 tables, 28 enums, 92 foreign keys)**: `schemas/dbdiagram_schema.dbml` and `docs/project_specs/DB_Tables.pdf` (extracted text at `data/pdf_extracted_texts/DB_Tables.txt`)
- **Extracted Uttarakhand Sample Data**: `data/extracted_readable/` (districts, CWC stations GeoJSON/CSV, IMD/MOSDAC rainfall, EOS-04 SAR backscatter, Bhuvan slope GeoTIFF)
- **Environment**: Python virtual environment at `.\venv\Scripts\python.exe` (with `fastapi` and `uvicorn` installed; Node.js is not installed on the host, so the React 18 frontend must run without requiring a local `node`/`npm` build step, or use self-contained browser/CDN module loading served by FastAPI).

## Requirements

### R1. Global Application Shell & Navigation Matching Reference Screenshots
Provide a responsive web application shell featuring:
- The dark navy left sidebar (`#0d1b2a` / `#0f172a`) with the **Disaster Intelligence — Multimodal Platform** branding and all 10 primary navigation views (`Overview`, `Map Explorer`, `Events`, `Modality Events`, `Event Groups`, `Reports & Evidence`, `History & Trends`, `Preparedness & Response`, `Ask (Q&A)`, `My Area`) plus `Settings` and `Help & About`.
- The top global filter bar with search input, country selector (`India`), state selector (`Uttarakhand`), date-range selector, `Apply` / `Live Mode` indicator, notification badge, and user profile pill (`AS`).

### R2. Complete Implementation of All 10 Dashboard Views
Implement all 10 views faithfully matching the visual design, cards, maps, charts, tables, epistemic status badges (`Observed`, `Official`, `Reported`, `AI Inferred`, `Predicted`), and master-detail interactions depicted in `data/docx_extracted_images/image1.png`–`image10.png`:
1. **Overview (`image7.png`)**: 7 KPI summary cards, interactive `Active Events and Warnings` map with layer pills (`Events`, `Warnings`, `Rainfall`, `Landslide Inv.`, `Admin Boundaries`), `Active Alerts & Warnings` list, `Latest News & Reports` list, `Events by Hazard Type` donut chart, `Event Trend` multi-line chart, `Severity Distribution` donut chart, `Top 5 Affected Regions` table, `Recent Events (Last 24 Hours)` table, and `Data Source Status` live health table.
2. **Map Explorer (`image6.png`)**: Multi-filter bar, floating `Map Layers` control (`Events & Alerts` / `Environmental` tabs, checkboxes, `Layer Opacity` slider), interactive Uttarakhand map with hazard markers and colored risk polygons, right-hand `Events & Warnings` filterable feed (`All`, `Events`, `Warnings`, `Risk Alerts`), bottom `Timeline` playback scrubber with play/pause button, `Legend`, `Selected Location` summary card, and `Base Map` switcher (`Satellite`, `Terrain`, `Light`).
3. **Events (`image4.png`)**: 6 KPI cards (`Total Events`, `Active Events`, `Resolved Events`, `High Severity`, `Moderate`, `Low`), filter bar, left-hand selectable `Events` list with thumbnails and severity/status badges, and right-hand event detail view (e.g., `Landslide in Rudraprayag EV-LSD-2026-10-09-001`) with sub-tabs (`Overview`, `Timeline`, `Evidence`, `Modality Events`, `Affected Regions`, `Impacts`, `Related Events`), localized map, `Key Information` metadata, image gallery carousel, `Observed and Predicted Impacts` split comparison, `Contributing Modality Events` table, and `Related Events` table.
4. **Modality Events (`image8.png`)**: 8 modality KPI cards (`Total`, `Earthquake`, `Flood`, `Landslide`, `Weather`, `News Reports`, `Social Media`, `Other`), filterable left list, and right detail panel (`Heavy Rainfall Detection ME-WTH-2026-10-09-001`) with sub-tabs (`Overview`, `Observations`, `Derived Results`, `Related Unified Event`, `Processing Info`), rainfall heatmap, `Key Information` with link to matched unified event, `Event Classification` selector (`Detected Event`, `Reported Incident`, `AI Inference`, `Predicted Event`), `Supporting Observations`, `Derived Results`, and `Related Evidence`.
5. **Event Groups / Episodes (`image9.png`)**: 5 KPI cards (`Total Episodes`, `Active Episodes`, `Multi-Hazard`, `High Impact`, `Resolved`), left episode list, and right detail panel (`Rudraprayag Heavy Rainfall Episode EP-UTT-2026-10-001`) featuring the horizontal **Episode Relationship Graph** (`Heavy Rainfall` → `River Level Rise` → `Landslide` → `Road Blockage` → `Flooding`) with epistemic link badges (`Confirmed`, `Inferred`, `Reported`, `Possible`), episode map, `Episode Information`, `Combined Impacts` cards, and `Key Contributing Events`.
6. **Reports & Evidence (`image10.png`)**: 5 KPI cards (`Total Reports`, `Official Reports`, `News Articles`, `Social Media Posts`, `Multimedia`), filter bar (source type, verification status, hazard, region, language), left list of reports with verification badges (`Verified`, `Likely True`, `Unverified`) and language tags (`en`, `hi`), and right detail panel with sub-tabs (`Overview`, `Content & Translation`, `Related Events`, `Related Reports`, `Media`, `Metadata`), photo gallery, `Key Information`, mini-map, original English content + Hindi translation toggle, `Key Points`, `Related Hazards`, `Associated Locations`, and `Source Reliability` checklist.
7. **History & Trends (`image1.png`)**: `Events Trends` / `Landslide Inventory` view toggle, 6 historical KPI cards, filter bar, `Event Trends Over Time` stacked bar chart (`Yearly` / `Monthly`), `Seasonal Pattern (Monthly Average)` multi-line chart, side-by-side `Historical Events Map (2015 - 2025)` and `Landslide Inventory (Historical)` map, `Regional Event Distribution` horizontal stacked bar chart by Uttarakhand district, `Historical Events` table with export action, and `Compare with Past Events` side-by-side comparison widget.
8. **Preparedness & Response (`image2.png`)**: 4 KPI cards (`Verified Shelters`, `Emergency Contacts`, `Relief Resources`, `Safety Guidance` with `Last verified` dates), sub-tab pills, `Shelters` searchable table with distance, capacity, availability status (`Available`, `Partially Filled`, `Unavailable`), `Last Verified` date, interactive shelter/resource map with legend, and bottom 3-column directory for `Emergency Contacts`, `Relief Resources`, and `Safety Guidance` (with `English`, `Hindi`, `PDF`/`Video`/`PPT` tags).
9. **Ask — Evidence-Grounded Q&A (`image5.png`)**: 5 clickable suggested question cards, conversational Q&A panel displaying structured responses explicitly categorized into green **Fact**, orange **Inference**, and purple **Prediction** bullet points with clickable `[1]–[6]` inline citations, `Key Impacts (reported so far)` summary cards, numbered `Sources` list, follow-up input box, and right-hand context column with `Related Map`, `Cited Evidence` cards (tagged with `Official`/`News`/`Social` and `Fact`/`Inference`/`Unverified`), `Related Events`, `Related Area`, and `Related Resources`.
10. **My Area / Settings (`image3.png`)**: Sub-tabs (`My Area`, `Notifications`, `Display & Units`, `Map Settings`, `Account & Privacy`), `Pinned Regions (Watchlist)` with per-district hazard icons and `+ Add Region`, interactive watchlist boundary map, `Watchlist Hazards` toggle switches, `Notification Preferences` checkboxes and channels, `Display & Units` selectors, `Map Settings`, and `Account & Privacy` / `Manage Watchlist` controls.

### R3. Schema-Grounded Mock REST API & Demo Data
Build a FastAPI backend serving realistic Uttarakhand disaster intelligence mock data aligned with the 38-table schema in `schemas/dbdiagram_schema.dbml`:
- Provide clean REST endpoints powering all 10 dashboard views (including filtering, detail lookups, interactive Q&A responses, and timeline filtering).
- Expose schema-inspection endpoints (`/api/v1/tables` and `/api/v1/tables/{table_name}`) returning representative mock rows for all 38 tables defined in `schemas/dbdiagram_schema.dbml`.

## Acceptance Criteria

### Backend & Schema Compliance
- [ ] The FastAPI server starts cleanly using `.\venv\Scripts\python.exe` without requiring Node.js or external database servers.
- [ ] `GET /api/v1/tables` returns all 38 table names matching `schemas/dbdiagram_schema.dbml`, and `GET /api/v1/tables/{table_name}` returns non-empty, schema-valid sample records for every table.
- [ ] All dashboard API endpoints return HTTP 200 with realistic Uttarakhand disaster data (Rudraprayag, Chamoli, Tehri Garhwal, Uttarkashi, Pithoragarh, etc.) matching the statistics, IDs, and narratives in the reference screenshots.

### Frontend & Visual Fidelity (Verified Against `data/docx_extracted_images/image1.png`–`image10.png`)
- [ ] Loading the root URL `/` in a browser renders the React 18 application with zero console errors or uncaught exceptions.
- [ ] All 10 sidebar views (`Overview`, `Map Explorer`, `Events`, `Modality Events`, `Event Groups`, `Reports & Evidence`, `History & Trends`, `Preparedness & Response`, `Ask (Q&A)`, `My Area`) are navigable and render their complete layouts, KPI cards, interactive maps, charts, tables, and detail panels matching the corresponding reference screenshot (`image1.png`–`image10.png`).
- [ ] Interactive elements function end-to-end: clicking rows in `Events`, `Modality Events`, `Event Groups`, and `Reports & Evidence` updates the right-hand detail panel; toggling map layers and filters updates the displayed items; clicking suggested questions or submitting a query in `Ask (Q&A)` renders a structured Fact/Inference/Prediction response with cited evidence.
