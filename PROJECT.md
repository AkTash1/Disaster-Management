# Project: Disaster Intelligence Multimodal Platform (Uttarakhand Testbed)

## Architecture
- **Backend**: FastAPI (`fastapi==0.162.0`, `uvicorn==0.54.0`, `pydantic==2.14.1`) running on Python 3.13 venv at `.\venv\Scripts\python.exe`.
- **Frontend**: Zero-Node React 18 browser architecture.
  - Loads React 18 UMD, ReactDOM 18 UMD, Babel Standalone via local vendored assets in `app/static/vendor/` with CDN fallback.
  - Tailwind CSS Standalone JIT with dark navy palette (`brand-navy: #0d1b2a`, `brand-card: #1e293b`, `brand-dark: #0f172a`, `brand-border: #334155`).
  - Leaflet 1.9.4 with CartoDB Dark Matter tiles, base map switcher, and CSS-animated pulse markers.
  - Chart.js 4.4.2 UMD for Doughnut, Multi-Line, and Stacked Bar charts.
  - Custom SVG DAG component for View 5 Episode Relationship Graph.
  - Custom SVG icons matching Lucide icons dictionary.
- **Data Store**:
  - Full schema-compliant in-memory / JSON mock store representing all 38 tables and 28 enums from `schemas/dbdiagram_schema.dbml`.
  - Referential foreign key integrity anchored by master episode `EP-UTT-2026-10-001` (Rudraprayag cascading landslide disaster).
  - Real Uttarakhand assets integrated from `data/extracted_readable/` (13 districts, 47 CWC stations, IMD/MOSDAC rainfall, EOS-04 SAR backscatter, Bhuvan slope GeoTIFF metadata).

## Code Layout
```
c:\Users\ashut\Projects\disaster_data_downloader\
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI application factory, CORS, SPA static mounts
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py               # Application settings
│   │   └── schema_store.py         # 38 tables metadata & sample data provider
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── api.py              # APIRouter aggregating all sub-routers
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── tables.py       # /api/v1/tables and /api/v1/tables/{table_name}
│   │           ├── overview.py     # /api/v1/overview/*
│   │           ├── map_explorer.py # /api/v1/map/*
│   │           ├── events.py       # /api/v1/events/*
│   │           ├── modality_events.py # /api/v1/modality-events/*
│   │           ├── event_groups.py # /api/v1/event-groups/*
│   │           ├── reports.py      # /api/v1/reports/*
│   │           ├── history.py      # /api/v1/history/*
│   │           ├── preparedness.py # /api/v1/preparedness/*
│   │           ├── ask.py          # /api/v1/ask/*
│   │           └── my_area.py      # /api/v1/my-area/*
│   ├── mock_data/
│   │   ├── __init__.py
│   │   ├── generator.py            # Generates all 38 table rows with foreign key links
│   │   └── seed_data.json          # Pre-built seed data for instant startup
│   └── static/
│       ├── index.html              # Shell HTML with vendor scripts, navbar, and root mount
│       ├── css/
│       │   └── app.css             # Dark theme scrollbars, map resets, animations
│       ├── vendor/                 # Vendored offline scripts (React, ReactDOM, Babel, Leaflet, Chart.js)
│       └── js/
│           ├── app.js              # Main React App component, state, router
│           ├── components/
│           │   ├── Sidebar.js      # Dark navy sidebar with 10 views + Settings + Help
│           │   ├── TopBar.js       # Search, Country/State selectors, DateRange, Live Pill, User Avatar
│           │   ├── KpiCard.js      # Standardized metric card with trend delta
│           │   ├── Badges.js       # Epistemic status & Severity badge components
│           │   ├── MapView.js      # Leaflet map wrapper with layers, legend, basemap switcher
│           │   ├── ChartView.js    # Chart.js wrapper for donuts, lines, stacked bars
│           │   └── EpisodeGraph.js # SVG DAG for horizontal episode relationship graph
│           └── views/
│               ├── OverviewView.js     # View 1 (image7.png)
│               ├── MapExplorerView.js  # View 2 (image6.png)
│               ├── EventsView.js       # View 3 (image4.png)
│               ├── ModalityEventsView.js # View 4 (image8.png)
│               ├── EventGroupsView.js  # View 5 (image9.png)
│               ├── ReportsView.js      # View 6 (image10.png)
│               ├── HistoryTrendsView.js# View 7 (image1.png)
│               ├── PreparednessView.js # View 8 (image2.png)
│               ├── AskView.js          # View 9 (image5.png)
│               └── MyAreaView.js       # View 10 (image3.png)
├── tests/
│   ├── __init__.py
│   ├── test_runner.py              # Standalone Python test runner for E2E suite
│   ├── tier1_features/             # Tier 1: Feature coverage (≥5 tests per feature)
│   ├── tier2_boundaries/           # Tier 2: Boundary & corner cases
│   ├── tier3_combinations/         # Tier 3: Cross-feature combinations
│   └── tier4_scenarios/            # Tier 4: Real-world application scenarios
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | List All Tables | `GET /api/v1/tables` returns all 38 DBML tables grouped into 8 domains | M1 | DBML Schema |
| 2 | Table Schema & Mock Data | `GET /api/v1/tables/{table_name}` returns columns, PKs, FKs, constraints, and valid sample rows | M1 | DBML Schema |
| 3 | FastApi Static & SPA Serving | Static file mount at `/static/`, `/` serves `index.html`, SPA catchall excluding `/api/*` | M1 | Runtime Survey |
| 4 | Global Application Shell & Sidebar | Dark navy (`#0d1b2a`) sidebar with branding, 10 primary navigation views, Settings, Help | M2 | image7.png & UI Survey |
| 5 | Top Filter & Utility Bar | Global search input, Country selector (India), State selector (Uttarakhand), Date Range picker, Live Mode pill, User avatar | M2 | image7.png & UI Survey |
| 6 | Standardized Epistemic & Severity Badges | Badges for Observed, Official, Reported, AI Inferred, Predicted, and Critical/High/Moderate/Low | M2 | UI Survey |
| 7 | View 1: Overview Dashboard | 7 KPI cards, interactive Active Events map, alerts list, news list, 3 charts, top 5 regions, 24h events table, data source status | M2 | image7.png |
| 8 | View 2: Map Explorer | Floating map layers, Uttarakhand hazard markers/risk polygons, right-hand feed (All/Events/Warnings/Alerts), timeline playback scrubber, basemap switcher | M2 | image6.png |
| 9 | View 3: Events (Unified Events) | 6 KPI cards, left selectable event list with thumbnails, right master-detail with 7 sub-tabs, gallery, split impact comparison, contributing modality table | M2 | image4.png |
| 10 | View 4: Modality Events | 8 modality KPI cards, left list, right detail panel with 5 sub-tabs, rainfall heatmap, event classification selector, supporting observations, derived ML results | M2 | image8.png |
| 11 | View 5: Event Groups / Episodes | 5 KPI cards, left episode list, right detail with horizontal Episode Relationship Graph (SVG DAG), causal link badges, combined impacts, contributing events | M2 | image9.png |
| 12 | View 6: Reports & Evidence | 5 KPI cards, multi-facet filter bar, left list with verification badges and language tags, right detail with English/Hindi translation toggle, key points, reliability checklist, media | M3 | image10.png |
| 13 | View 7: History & Trends | Events Trends / Landslide Inventory toggle, 6 KPI cards, yearly/monthly stacked bar chart, seasonal pattern multi-line, side-by-side maps, regional distribution, past event comparison widget | M3 | image1.png |
| 14 | View 8: Preparedness & Response | 4 KPI cards with "Last verified" dates, shelters searchable table & map with availability status, bottom 3-column directory for emergency contacts, relief resources, safety guidance (EN/HI/PDF) | M3 | image2.png |
| 15 | View 9: Ask (Evidence-Grounded Q&A) | 5 suggested question cards, structured conversational response with Fact (green), Inference (orange), Prediction (purple) sections, inline citations `[1]–[6]`, cited evidence cards, context column | M3 | image5.png |
| 16 | View 10: My Area & Settings | Pinned regions watchlist with per-district hazard icons, watchlist boundary map, hazard toggles, notification channel settings, display units, map settings | M3 | image3.png |
| 17 | E2E Testing Suite (Tiers 1–4) | Requirement-driven opaque-box test runner validating all endpoints, schema tables, UI rendering, and user workflows | E2E-Track | ORIGINAL_REQUEST.md |
| 18 | Tier 5 Adversarial Coverage Hardening | Challenger generated stress tests, edge case injection, boundary verification | M5 | Integrity Forensics |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Suite Track | Design and implement complete opaque-box test runner and Tiers 1–4 test cases | None | IN_PROGRESS |
| M1 | Backend Foundation & 38-Table Mock REST API | FastAPI app, CORS, static mounting, 38-table mock data generator, `/api/v1/tables`, and domain REST endpoints | None | IN_PROGRESS |
| M2 | Frontend Shell & Views 1–5 | Zero-Node React 18 shell, sidebar, top bar, shared components, and Views 1 (Overview), 2 (Map Explorer), 3 (Events), 4 (Modality Events), 5 (Event Groups) | M1 | PLANNED |
| M3 | Frontend Views 6–10 & Full Interactivity | Views 6 (Reports), 7 (History), 8 (Preparedness), 9 (Ask Q&A), 10 (My Area), master-detail interactivity, and global filters | M1, M2 | PLANNED |
| M4 | Final Integration & 100% E2E Pass | Run E2E test suite against implementation, fix discrepancies until all Tier 1–4 tests pass | E2E, M1, M2, M3 | PLANNED |
| M5 | Adversarial Hardening & Forensic Audit | Challenger Tier 5 adversarial stress testing, Forensic Integrity Audit (`teamwork_preview_auditor`) | M4 | PLANNED |

## Interface Contracts

### Backend API ↔ Frontend Client
1. **Schema Inspection**:
   - `GET /api/v1/tables` -> `{"total": 38, "table_groups": {group_name: [table_names]}, "tables": [{"name": str, "group": str, "record_count": int}]}`
   - `GET /api/v1/tables/{table_name}` -> `{"table_name": str, "group": str, "columns": [{"name": str, "type": str, "pk": bool, "not_null": bool}], "foreign_keys": [...], "sample_records": [{...}]}`
2. **Overview**:
   - `GET /api/v1/overview/summary` -> 7 KPI metrics + live status
   - `GET /api/v1/overview/alerts` -> list of active alerts with epistemic badge
   - `GET /api/v1/overview/news` -> list of verified/unverified news items
   - `GET /api/v1/overview/charts` -> donut and trend chart datasets
   - `GET /api/v1/overview/regions` -> top 5 affected districts
   - `GET /api/v1/overview/recent-events` -> events in last 24h
   - `GET /api/v1/overview/data-sources` -> data source operational statuses
3. **Map Explorer**:
   - `GET /api/v1/map/layers` -> layer list with visibility & opacity
   - `GET /api/v1/map/geojson` -> GeoJSON FeatureCollection filtered by hazard, severity, bounds
   - `GET /api/v1/map/feed` -> right sidebar events & warnings feed
   - `GET /api/v1/map/timeline` -> timeline scrubber intervals and event counts
4. **Unified Events**:
   - `GET /api/v1/events` -> list of unified events with filters
   - `GET /api/v1/events/{event_id}` -> complete event detail with 7 sub-tabs
5. **Modality Events**:
   - `GET /api/v1/modality-events` -> list of modality events with 8 KPI counts
   - `GET /api/v1/modality-events/{id}` -> modality event detail with linked sensors and ML results
6. **Event Groups / Episodes**:
   - `GET /api/v1/event-groups` -> list of disaster episodes with 5 KPI counts
   - `GET /api/v1/event-groups/{id}` -> episode detail + horizontal relationship graph nodes & edges
7. **Reports & Evidence**:
   - `GET /api/v1/reports` -> reports feed with verification and language tags
   - `GET /api/v1/reports/{id}` -> report detail with English/Hindi translation, key points, checklist
8. **History & Trends**:
   - `GET /api/v1/history/summary` -> 6 historical KPI cards
   - `GET /api/v1/history/trends` -> yearly/monthly stacked bar chart data
   - `GET /api/v1/history/seasonal` -> 12-month multi-line seasonal pattern
   - `GET /api/v1/history/landslides` -> GeoJSON of historical landslide points
   - `GET /api/v1/history/regional-distribution` -> district distribution bar data
   - `GET /api/v1/history/compare` -> side-by-side event comparison
9. **Preparedness & Response**:
   - `GET /api/v1/preparedness/summary` -> 4 KPI cards with "Last verified" timestamps
   - `GET /api/v1/preparedness/shelters` -> searchable shelters with capacity and coordinates
   - `GET /api/v1/preparedness/directory` -> emergency contacts, relief resources, safety guidance
10. **Ask Q&A**:
    - `GET /api/v1/ask/suggested` -> 5 suggested questions
    - `POST /api/v1/ask/query` -> structured response: `{"answer": {"facts": [...], "inferences": [...], "predictions": [...]}, "citations": [...], "key_impacts": [...], "context": {...}}`
11. **My Area & Settings**:
    - `GET /api/v1/my-area/watchlist` -> saved districts and active hazards
    - `POST /api/v1/my-area/watchlist` -> add district
    - `DELETE /api/v1/my-area/watchlist/{district_code}` -> remove district
    - `GET /api/v1/my-area/settings` -> notification and display preferences
    - `PUT /api/v1/my-area/settings` -> update preferences
