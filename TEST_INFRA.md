# E2E Test Infra: Disaster Intelligence Multimodal Platform

## Test Philosophy
- Opaque-box, requirement-driven. Derived strictly from `ORIGINAL_REQUEST.md` and reference specifications, NOT internal implementation code.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Testing.

## Test Architecture
- **Test Runner**: Standalone Python script executable via `.\venv\Scripts\python.exe tests/test_runner.py`.
- **Server Harness**: Boots the FastAPI app via `uvicorn.Server` on a test port (e.g. `127.0.0.1:8999`), executes HTTP requests using `requests` library, and asserts status codes, JSON schemas, headers, content types, and UI markup.
- **Pass/Fail Semantics**: Returns exit code 0 if 100% of tests pass, exit code 1 if any test fails.
- **Directory Layout**:
  ```
  tests/
  ├── __init__.py
  ├── test_runner.py              # Main CLI runner executing Tiers 1-4
  ├── test_harness.py             # Server launcher & HTTP test client
  ├── tier1_features/             # Tier 1: Feature coverage (≥5 tests per feature)
  │   ├── test_m1_tables.py       # 38 tables & schema inspection endpoints
  │   ├── test_m1_endpoints.py    # Overview, Map, Events, Modality, Episodes API
  │   ├── test_m2_shell_views.py  # Shell, Nav, Overview, Map, Events, Modality, Groups UI
  │   └── test_m3_views_interactivity.py # Reports, History, Preparedness, Ask, My Area UI
  ├── tier2_boundaries/           # Tier 2: Boundary & corner cases
  │   ├── test_boundaries_api.py  # Invalid tables, SQL injection, inverted dates, out-of-bounds
  │   └── test_boundaries_ui.py   # Empty states, zero events, long strings, missing translation
  ├── tier3_combinations/         # Tier 3: Cross-feature combinations
  │   └── test_cross_feature.py   # Filter combinations, master-detail transitions, Q&A citations
  └── tier4_scenarios/            # Tier 4: Real-world application scenarios
      └── test_scenarios.py       # Cascading disaster workflow, citizen shelter search, responder Q&A
  ```

## Feature Inventory & Test Coverage Goals
| # | Feature | Requirement Source | Tier 1 (≥5) | Tier 2 (≥5) | Tier 3 (Pairwise) | Tier 4 (Scenario) |
|---|---------|-------------------|:-----------:|:-----------:|:-----------------:|:-----------------:|
| 1 | Table List (`/api/v1/tables`) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 2 | Table Detail (`/api/v1/tables/{t}`) | ORIGINAL_REQUEST §R3 | 38 | 5 | ✓ | ✓ |
| 3 | Static & SPA Serving | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 4 | Shell & Sidebar Navigation | ORIGINAL_REQUEST §R1, image7 | 5 | 5 | ✓ | ✓ |
| 5 | Top Filter & Utility Bar | ORIGINAL_REQUEST §R1, image7 | 5 | 5 | ✓ | ✓ |
| 6 | Epistemic & Severity Badges | ORIGINAL_REQUEST §R2 | 7 | 5 | ✓ | ✓ |
| 7 | View 1: Overview Dashboard | ORIGINAL_REQUEST §R2, image7 | 8 | 5 | ✓ | ✓ |
| 8 | View 2: Map Explorer | ORIGINAL_REQUEST §R2, image6 | 7 | 5 | ✓ | ✓ |
| 9 | View 3: Events (Unified) | ORIGINAL_REQUEST §R2, image4 | 7 | 5 | ✓ | ✓ |
| 10 | View 4: Modality Events | ORIGINAL_REQUEST §R2, image8 | 7 | 5 | ✓ | ✓ |
| 11 | View 5: Event Groups (Episodes) | ORIGINAL_REQUEST §R2, image9 | 6 | 5 | ✓ | ✓ |
| 12 | View 6: Reports & Evidence | ORIGINAL_REQUEST §R2, image10 | 6 | 5 | ✓ | ✓ |
| 13 | View 7: History & Trends | ORIGINAL_REQUEST §R2, image1 | 6 | 5 | ✓ | ✓ |
| 14 | View 8: Preparedness & Response | ORIGINAL_REQUEST §R2, image2 | 6 | 5 | ✓ | ✓ |
| 15 | View 9: Ask (Evidence-Grounded Q&A) | ORIGINAL_REQUEST §R2, image5 | 7 | 5 | ✓ | ✓ |
| 16 | View 10: My Area & Settings | ORIGINAL_REQUEST §R2, image3 | 6 | 5 | ✓ | ✓ |

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Description |
|---|----------|--------------------|-------------|
| 1 | Cascading Landslide Crisis in Rudraprayag | F1, F7, F8, F9, F11 | User observes active alerts on Overview, filters Map Explorer to Rudraprayag, selects Landslide unified event `EV-LSD-2026-10-09-001`, and traces episode graph in Event Groups. |
| 2 | Grounded Emergency Q&A for Incident Commander | F6, F12, F15 | User asks "What is the status of NH-58 in Rudraprayag?", verifies structured Fact/Inference/Prediction breakdown, and checks inline citations [1]–[6] against official SITREPs. |
| 3 | Shelter Allocation & Citizen Preparedness | F6, F8, F14, F16 | User navigates to Preparedness, searches for available shelters in Chamoli, checks capacity, last verified timestamp, and emergency contact numbers. |
| 4 | Decadal Trend Analysis & Vulnerability Assessment | F7, F13 | User toggles History & Trends, compares 2015–2025 landslide frequency against monthly rainfall patterns, and inspects district vulnerability ranking. |
| 5 | Watchlist Configuration & Multi-Hazard Notification | F4, F5, F16 | User adds Tehri Garhwal and Uttarkashi to Watchlist, toggles Cloudburst/Flash Flood hazards, and verifies watchlist boundary map and preference persistence. |
| 6 | Multilingual Report Verification & Cross-Modal Grounding | F9, F10, F12 | User inspects news report in Reports & Evidence, toggles English/Hindi translation, verifies source reliability checklist, and links to raw sensor observations in Modality Events. |

## Minimum Coverage Thresholds
- **Tier 1 (Feature Coverage)**: ≥125 test cases across all 16 features and 38 tables.
- **Tier 2 (Boundary & Corner Cases)**: ≥80 boundary and edge-case test cases.
- **Tier 3 (Cross-Feature Combinations)**: ≥25 pairwise interaction test cases.
- **Tier 4 (Real-World Scenarios)**: 6 comprehensive end-to-end user journey test cases.
- **Total Minimum**: ≥236 test cases with 100% pass rate.
