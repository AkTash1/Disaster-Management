# PROJECT_CONTEXT — read this first in any new chat

Condensed from the previous chat thread (`f7c82027…`, Aug 25 – Oct 27 2026) and the project folder. Details live in the files linked at the bottom.

## 1. What this is
- Official project: **"Development of an Integrated Intelligent Disaster Management System for Mountain Communities in India"** (DST-funded; PIs at NITK, IIT Patna, IIT Roorkee, UPES, Amrita; collaborators NIDM, TCS). Testbed: **Uttarakhand**.
- User's role: data engineering + dashboard/demo. Data-Engineering PDF (14 Aug 2026) says: fix schemas BEFORE bulk downloading. Target stack: MinIO (immutable raw), PostgreSQL+PostGIS+TimescaleDB (core), OpenSearch (text), Neo4j (knowledge graph), APIs -> WebGIS dashboards.
- Repo: https://github.com/AkTash1/Disaster-Management.git (Vercel auto-deploys from it). Windows, PowerShell, Python 3.13 venv at `.\venv`, **no Node installed**.

## 2. Timeline
| When | What |
|---|---|
| Aug 24-25 | Downloaders for IMD, MOSDAC (login via `.env`), CWC hydrology, Bhuvan WMS/WFS, Bhoonidhi SAR. Dead sources deleted. |
| Sep 7-12 | Inspected every dataset (h5/nc/grd/tif) with Python; wrote `data_catalog.md`; designed rough schema; wrote explanatory PDFs/guides. |
| Sep-Oct | Official 38-table schema (`schemas/dbdiagram_schema.dbml`) adopted; PDFs/DOCX read; dashboard "Ideas" doc + 10 screenshots. |
| Oct 25 | Planned and built the dashboard with a team of agents (`/teamwork-preview`); 367 tests; folder organized; master guide written. |
| Oct 27 | Vercel deploy. Hung on loading, then JSX syntax error found and fixed (see section 6). |

## 3. Data sources downloaded (`data/`, gitignored and in `.vercelignore`)
| Source | Content | Notes |
|---|---|---|
| IMD | Daily 0.25° gridded rain, 2020-22, `.nc` + `.grd` | mm/day, -999 = fill, India-wide |
| MOSDAC | INSAT-3DR IMSRA rain rate (`IMC`), 6 half-hourly granules 2025-08-01 | HDF5, lat/lon scale 0.01, ~4 km |
| CWC | Telemetry hourly rainfall CSV, 47 stations, 13 districts | Negative values = sensor errors, filter them |
| Bhuvan WMS | UK/HP slope + LULC PNGs (2048², RGBA) | HP layers re-downloaded with correct bbox |
| Bhoonidhi | EOS-04 SAR (C-band, HH/HV) scenes 2023-07-08 and 2023-07-28 | Different UTM zones (32644 vs 32643): reproject before comparing |

Scripts: `scripts/data_pipeline/` (01 IMD, 02 MOSDAC, 04 hazard maps, 05 run-all, extractors, DBML parsers). Readable samples: `data/extracted_readable/`. PDF/DOCX text: `data/pdf_extracted_texts/`. Dashboard screenshots: `data/docx_extracted_images/image1-10.png`.

## 4. Schema
38 tables, 28 enums, 92 FKs, in 8 domains: source mgmt, ingestion/provenance, reference data, canonical observations, enrichment/derived, source quality, event intelligence (13 tables), benchmark datasets.
Fusion ladder: **observation/text/raster/media -> modality_event -> event (unified) -> event_group (episode, via event_relationship)**.
CHECK constraints `ck_derived_input_one` and `ck_modality_input_one` require exactly one non-null FK.
Epistemic labels: Observed, Official, Reported, AI Inferred, Predicted, Unverified.
Pending user goal: validate a *different* schema they will supply, using Postgres (+PostGIS) locally.

## 5. The app (demo only, mock data)
- **Backend**: FastAPI `app/main.py`; 11 routers in `app/api/v1/endpoints/` (tables, overview, map_explorer, events, modality_events, event_groups, reports, history, preparedness, ask, my_area); in-memory store from `app/core/parsed_schema.json` + `app/mock_data/seed_data.json` (generator: `app/mock_data/generator.py`). Master mock episode `EP-UTT-2026-10-001` (Rudraprayag).
- **Frontend**: zero-build React 18; Babel compiles JSX in the browser. Scripts in `app/static/index.html` load vendored libs (`app/static/vendor/`) then components, views, `app.js`. Components register on `window.DisasterComponents` / `window.DisasterViews`. 10 views match the screenshots; plus Settings and Help.
- **Tests**: `tests/test_runner.py --tier all` (367 tests, 5 tiers, claimed passing; not re-run this session).
- Run locally: `.\venv\Scripts\uvicorn.exe app.main:app --port 8000`.

## 6. Vercel deployment: lessons (important)
- `vercel.json`: single `@vercel/python` build of `app/main.py` with `includeFiles: ["app/**"]`; ONE route `/(.*)` -> `app/main.py`. **Do NOT add a `/static/*` route** (it 404'd every asset).
- **JSX text cannot contain a raw `>`** (use `&gt;`). A `>80%` in `MyAreaView.js` broke Babel and left the page on the spinner. If the page hangs, check the browser Console for `SyntaxError` first.
- `app.js` polls (150 ms) until components register because Babel (2.3 MB) compiles scripts asynchronously.
- Recent commits already pushed: `89550c6` routing, `e11e078` mount race, `1aba564` JSX fix. Deployed page not yet confirmed working after these.
- `requirements.txt` is slim (fastapi, pydantic, uvicorn); downloader deps are in `requirements-pipeline.txt`.

## 7. Working preferences (from the transcripts)
- User gets annoyed if code is written when they only asked for docs/plan edits ("i didnt ask u to code"). **Do exactly what's asked; ask before building.**
- Uses `/plan`, `/compact`, `/teamwork-preview`. Likes comprehensive explanations of data and schema.
- **Context limit trap**: the old chat reached 29.3 MB (about 20 MB of screenshots) and could no longer send or `/compact`. Keep one task per chat, avoid many large screenshots, cap command output.
- Backup of the old chat folder: `C:\Users\ashut\Documents\f7c82027_backup` (original was restored; screenshots untouched).

## 8. Open items / likely next steps
1. Confirm Vercel page loads after the latest push (check Console if not).
2. Validate the user's supplied schema in PostgreSQL + PostGIS.
3. Optional: move off in-browser Babel and Tailwind CDN build for production (both warn in console, and the page loads slowly).
4. Replace the in-memory mock store with real Postgres; API contracts stay unchanged.

## 9. Key files
- `PROJECT.md` (architecture + API contracts), `ORIGINAL_REQUEST.md` (requirements R1+), `README.md` (downloaders), `TEST_INFRA.md`, `TEST_READY.md`
- `docs/guides/codebase_master_guide.md`, `data_catalog.md`, `disaster_data_and_schema_master_guide.md`
- `docs/project_specs/` (official PDFs, DB_Tables, Ideas for dashboard.docx)

---

## 10. Detail from `docs/project_specs/` (all files read; added Oct 27)

### Brief-Summary-Project.pdf (13 pp) and Detailed-Technical-Details.pdf (34 pp): the official DST proposal
- **Budget / timeline:** Rs 3,43,29,660 total (DST 2,99,99,660 + external 43,30,000; SGES Pvt Ltd pledges Rs 15 lakh). 36 months. TRL 4 now. Mode: technology development with an industry/user agency.
- **PIs:** Sreevalsa Kolathayar (NITK, civil/seismic/landslide flume), Joydeep Chandra (IIT Patna, CSE: data collection, benchmarks, multimodal AI, evaluation), Ram Sateesh Pasupuleti (IIT Roorkee, architecture: traditional knowledge, cultural risk maps), Anil Kumar (UPES Dehradun: satellite, landslide ML), Maneesha Vinodini Ramesh (Amrita: IoT/WSN sensors, 150+ sensors at Munnar, 250+ at Gangtok).
- **Partners:** NIDM, TCS (NLP/event extraction/timeline generation, paid interns), IIT Indore, FRI, IIRS, VARISHT (NGO), ESRI India, Sikkim/Kerala SDMAs, CWRDM, SGES.
- **Six main objectives:** multimodal collection (sensors, lab tests, community/traditional knowledge, GIS, web/news/social) -> hazard **data lake**; Intelligent Wireless Sensor Probe (IWSP: rain gauges (max 2), moisture, pore-pressure, movement, geophones); fusion; AI/ML models (hazard mapping, susceptibility, early-warning thresholds, situational awareness, event identification, timeline generation); **unified evaluation platform** (leaderboard for AI models on benchmark data); lab replication of rainfall + earthquake triggered landslides.
- **Work packages:** WP0 management; WP1 collection/ingestion; WP2 refinement, labelling, alignment, fusion (data lake); WP3 AI models; WP4 disaster management and services (WebGIS, APIs, warning dissemination, reports): **this dashboard belongs to WP4 (D4.1 WebGIS portal, D4.2 visualization, D4.4 APIs)**; WP5 benchmarking and evaluation; WP6 use cases and proof of concept, IPR.
- **Milestones (months):** 12 vulnerable-site selection (Amrita); 18 hazard mapping (NITK), prototype (UPES), prototype/visualization (IITP+TCS); 24 cultural risk maps (IITR), sensors deployed (Amrita); 30 flume tests, reports, **Web GIS portal**, use case deployment; 32 comms protocol; 36 thresholds, final evaluation, training.
- **Quantified benchmarks:** store/collect >= 5 years of data; handle streaming; filtering/retrieval F1 at least 2% above best SOTA baseline; labelled text <= 1% duplicates; >= 10 social-media events in last 5 years; annotation Cohen's kappa >= 85%.
- **Language scope:** English, with Bengali and Hindi targeted (the app mocks EN/HI). Data must be anonymized; separate repositories per modality.
- **Geo/geotechnical items:** deterministic + probabilistic earthquake hazard; landslide vulnerability from 12 geological parameters + rainfall + earthquake acceleration (Frequency Ratio, Newmark); lab flume on shake table.
- **UPES prior work:** hybrid ML landslide model for Uttarkashi (373 landslide / 181 non-landslide points, 15 conditioning factors, GSI data).

### Data-Engineering-Tasks_V1.pdf (14 Aug 2026): the instructions the user works from
- Check availability/format of 14 source groups (IMD/MOSDAC; Sentinel-1/2, Landsat, MODIS, VIIRS, ASTER, ALOS PALSAR, NISAR, SAOCOM; CartoDEM/SRTM/Copernicus DEM; landcover/soil; GSI/Bhuvan/NRSC/NDMA hazard maps; earthquake catalogs NCS/IRIS/ISC/USGS; landslide inventories; India-WRIS/CWC; Crisis-MMD, Twitter/Reddit/YouTube/Flickr/Telegram; Google News RSS/PIB/NDMA bulletins; historical reports; PM Gati Shakti/Census/Landscan; OSM/MS Buildings/Google Open Buildings; UAV sets xBD, FloodNet, LoveDA, VisDrone, DOTA, AID).
- **Do not start large-scale downloading** before fixing: (1) canonical multimodal schema, (2) ontology/knowledge-graph schema, (3) spatio-temporal event-linking strategy.
- Step 1 MinIO in Docker, immutable `/raw/{weather,satellite,social,news,sensors,earthquake,landslide,gis}`. Step 2 PostgreSQL+PostGIS core metadata; TimescaleDB for sensor time series (layer 1 common linking schema, layer 2 weather/social/satellite/sensor schemas; simulated sensor data OK); shared ontology (Hazard / Impact / Need trees). Step 3 Neo4j relations (OCCURRED_AT, TRIGGERED_BY, REPORTS, DAMAGED, EXPOSED_TO, SERVES...), OpenSearch (keyword + vector). Step 4 AI fusion models, WebGIS + REST APIs (dashboards only call GET APIs).

### DB_Tables.pdf / .docx (25 pp): the official schema spec
- dbdiagram link: https://dbdiagram.io/d/6aad6b426d586d617e6bd187. Each table has a description, sample JSON and notes. PDF text is one token per line, so it is awkward to read; use `schemas/dbdiagram_schema.dbml` (1,277 lines) instead.
- Sections: 1 Source Mgmt; 2 Ingestion/provenance (pipeline_run, collection, raw_object immutable MinIO URI, raw_validation, ingest_rejection); 3 Reference (hazard, admin_region, static_raster, geo_feature); 4 Canonical observations (observation is the main source-truth entity; text_item, raster_product, media attach 1:1; observation_region, observation_relation: duplicate/supersede/correct/retract/corroborate); 5 Enrichment (model, derived_result, derived_result_input); 6 source_score; 7 Event intelligence (7a-7l); 8 Benchmark (dataset_sample, _item, _event; samples assemble existing canonical rows, no duplication); 9 "Final Expected Dataset" shape.
- Sample IDs in the spec: `EQ-2026-09-29-001` (event_code), `EP-2026-MONSOON-000205` (event_group_code), `EV-FLOOD-0001`, roles primary/trigger/related/consequence/impact.
- **NOTE (user, Oct 27):** a separate, older **water-only database schema** exists. It is NOT relevant, so ignore it. The DB_Tables PDF/docx and `dbdiagram_schema.dbml` are both current.
- **Open discrepancy, checked Oct 27 (PDF vs DBML; both current, DBML is behind or simplified):**
  - Table sets: PDF headings give 34 tables (my parser missed pipeline_run, collection and the dataset_sample group, which are in the DBML); DBML has 38. **Only in PDF: `source_endpoint`**. Every other table exists in both.
  - **Structural differences:** PDF `dataset_version` hangs off `endpoint_id` and carries `schema_version`, `schema_hash`, `schema_definition`; DBML `dataset_version` hangs off `dataset_id` (unique `(dataset_id, version)`) with only a `metadata jsonb`. PDF `raw_validation` also references `dataset_version_id` (validation against a schema version) plus a validator version; DBML `raw_validation` has only `raw_object_id` + `validator_version`.
  - **Fields shown in PDF sample JSON but with no named column in DBML** (may be inside jsonb/geometry; unverified): `data_source` retry/timeout/rate-limit config, `admin_region.country_code/state_code`, `static_raster` min/max lat/lon, `source_score.agreement_rate`, `event_match` spatial/temporal/semantic similarity, `event_relationship.spatial_distance_km/time_gap_minutes`, `model.input_modalities`, `raster_product.ndvi/ndwi`. Fields like `magnitude`/`depth_km` exist in the DBML only as a few mentions.
  - Next step if the user wants it: decide whether to add `source_endpoint` (and re-point `dataset_version`) in the DBML, then regenerate `parsed_schema.json`, the generator and tests.

### Ideas for dashboard.docx and WhatsApp image
- The docx text is the 10-view spec (Overview, Map Explorer, Events, Modality Events, Event Groups, Reports and Evidence, History and Trends, Preparedness and Response, Ask Q&A, My Area/Settings). It also lists extra "user assistance" ideas: relief camps and shelters, safe routes and evacuation points, location-based alerts, nearby warnings, emergency contacts and helplines, help requests. Rules: every item labelled by epistemic status; "Last verified" on preparedness items; nothing shown as safe or available unless confirmed. The docx is 22 MB because it embeds the 10 screenshots, already extracted to `data/docx_extracted_images/`.
- `WhatsApp Image 2026-08-13 at 12.21.24.jpeg`: a reference mock of a **Social Media Intelligence Dashboard** (Cyclone Remal, 27-29 May 2024, West Bengal): KPIs (total mentions 128,547, informative 74,621, need/help 15,342, damage reports 9,875, policy/official 4,389, non-informative 24,526), geographic post-cluster map, top-topics donut, sentiment over time, needs and requests (water, food, shelter, medical, rescue), platform breakdown (Twitter, Reddit, YouTube, Facebook, Instagram), live feed. It is the IIT Patna social-media component and a sidebar of Live Feed / Map / Analytics / Topics / Needs / Media Gallery / Influencers / Reports. **Not implemented in the current app.**
