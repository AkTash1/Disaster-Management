// Disaster Intelligence Platform — 6-Role Authority, Decision & Accessibility Command Center (RAC-01)
// Exposes window.DisasterRoleEngine and window.DisasterViews.RoleWorkspaceView
// All 6 operational & public roles preserve user identity "Ashutosh Kanojia" (AK) with distinct authority,
// executable Uttarakhand disaster decisions, SLA rules, and dashboard accessibility enforcement.

(function() {
  const React = window.React;
  const { useState, useEffect } = React;

  const DASHBOARD_TARGETS = [
    {
      id: 'overview',
      code: 'PUBLIC-MAIN',
      name: 'Overview (Public Main)',
      shortName: 'Overview',
      description: 'Untouched public & SEOC situational summary, active alerts, and Uttarakhand basin status.',
      publicNote: 'Always open for public & inter-agency situational awareness.'
    },
    {
      id: 'role-command',
      code: 'RAC-01',
      name: 'Role Authority & Decision Hub',
      shortName: 'Role Hub (RAC-01)',
      description: 'Multi-role persona switcher, executable decision workbench, and RBAC accessibility matrix.',
      publicNote: 'Interactive role simulation & authority verification center.'
    },
    {
      id: 'hazard-monitoring',
      code: 'HM-01',
      name: 'Hazard Monitoring HM-01',
      shortName: 'Hazard (HM-01)',
      description: 'IMD AWS rainfall, CWC river gauge telemetry, catchment runoff models, and sensor calibration.',
      publicNote: 'Requires Level 3+ SEOC clearance; raw sensor calibration restricted for Citizen role.'
    },
    {
      id: 'social-intelligence',
      code: 'SMI-01',
      name: 'Social Intelligence SMI-01',
      shortName: 'Social (SMI-01)',
      description: 'Multilingual SOS cluster map, citizen distress triage stream, and PIB rumor quarantine.',
      publicNote: 'Public mode shows verified advisories & SOS submission; raw triage requires Response/Authority clearance.'
    },
    {
      id: 'multimodal-intelligence',
      code: 'MEI-01',
      name: 'Multimodal Dossier MEI-01',
      shortName: 'Multimodal (MEI-01)',
      description: '5-stream cross-modality incident correlation (Telemetry, SAR, Social, Drone, Field SITREP).',
      publicNote: 'Executive & analytical synthesis dossier; internal SAR weights gated for Citizen role.'
    }
  ];

  const ROLES = {
    'authority': {
      id: 'authority',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleTitle: 'Disaster Management Authority',
      subTitle: 'SEOC State Relief Commissioner',
      authorityLevel: 'LEVEL 5 · EXECUTIVE COMMAND',
      shortLevel: 'LVL 5',
      clearanceBadge: 'FULL READ/WRITE & BROADCAST',
      sla: 'Immediate (< 5 mins)',
      themeColor: 'red',
      badgeBg: '#FEF2F2',
      badgeText: '#991B1B',
      badgeBorder: '#EF4444',
      summary: 'Supreme executive authority to declare district Red Alerts, authorize mandatory village evacuations, mobilize NDRF/SDRF battalions, and sign off state SITREPs.',
      executableCategories: ['authority', 'executive', 'broadcast', 'evacuation', 'sitrep'],
      accessMap: {
        'overview': 'FULL',
        'role-command': 'PRIMARY',
        'hazard-monitoring': 'FULL',
        'social-intelligence': 'FULL',
        'multimodal-intelligence': 'PRIMARY'
      },
      accessReasons: {
        'overview': 'Full executive visibility into public and state-wide operational summary.',
        'role-command': 'Primary Command Hub for executive sign-off and cross-agency authorization.',
        'hazard-monitoring': 'Full access to inspect catchment red alerts and approve evacuation triggers.',
        'social-intelligence': 'Full access to authorize counter-rumor broadcasts and high-priority SOS escalations.',
        'multimodal-intelligence': 'Primary Executive Dossier for 5-stream ground truth verification and SITREP release.'
      },
      decisions: [
        {
          id: 'DEC-AUTH-01',
          title: 'Authorize Mandatory Evacuation for 14 Mandakini Villages',
          category: 'Executive Evacuation Order',
          lineage: '[OFFICIAL-GROUND-TRUTH]',
          urgency: 'IMMEDIATE · < 5 MINS',
          targetView: 'multimodal-intelligence',
          eventId: 'EV-2026-0814-FLD',
          telemetrySnapshot: 'AWS UK-RUD-04: 82.4 mm/hr · Mandakini Stage: 627.8m (+1.4m above Danger) · Exposed Pop: 12,840',
          description: 'Issue statutory DM/SEOC evacuation order for 14 riverside revenue villages along the Gaurikund–Rudraprayag corridor ahead of projected peak flood wave.',
          paramLabel: 'Evacuation Zone & Transport Protocol',
          paramOptions: [
            'Zone A+B (14 Villages · 12,840 Residents · 42 UTC Buses + SDRF Escort)',
            'Zone A Immediate Bank Only (8 Villages · 7,200 Residents · Rapid Foot + Bus)',
            'Full Valley Precautionary Clearance (22 Villages · 19,500 Residents + Heli Staging)'
          ],
          expectedOutcome: 'Triggers Cell Broadcast + Revenue Police loudspeaker sweep across 14 Mandakini villages; activates 18 relief shelters.'
        },
        {
          id: 'DEC-AUTH-02',
          title: 'Declare Red Alert in Rudraprayag & Chamoli',
          category: 'Statutory State Alert',
          lineage: '[LIVE-SENSOR]',
          urgency: 'IMMEDIATE · < 5 MINS',
          targetView: 'hazard-monitoring',
          eventId: 'EV-2026-0814-FLD',
          telemetrySnapshot: 'IMD Nowcast: Extreme Cloudburst (>80 mm/hr) · Alaknanda & Mandakini Catchments in Critical Breach',
          description: 'Elevate district alert level from Orange Watch to Red Alert across Rudraprayag and Chamoli, halting Char Dham pilgrim vehicular transit at Rishikesh and Srinagar gates.',
          paramLabel: 'Alert Scope & Pilgrim Transit Gate Control',
          paramOptions: [
            'Red Alert: Rudraprayag + Chamoli (Hold Yatra at Srinagar & Gauchar Checkposts)',
            'Red Alert: All Upper Garhwal (Rudraprayag, Chamoli, Uttarkashi · Full NH-58/NH-34 Hold)',
            'Red Alert + School/Institutional Closure for 48 Hours'
          ],
          expectedOutcome: 'Broadcasts CAP Red Alert via SACHET portal; locks pilgrim barrier gates at Bhadrakali, Byasi, and Karnaprayag.'
        },
        {
          id: 'DEC-AUTH-03',
          title: 'Mobilize 3 NDRF & 5 SDRF Battalions to Joshimath',
          category: 'Force Mobilization',
          lineage: '[OFFICIAL-GROUND-TRUTH]',
          urgency: 'CRITICAL · < 10 MINS',
          targetView: 'multimodal-intelligence',
          eventId: 'EV-2026-0814-LSD',
          telemetrySnapshot: 'Available Staging: Jolly Grant (2 NDRF), Gauchar Helipad (3 SDRF), Gopeshwar (2 SDRF) · IAF Mi-17 Ready',
          description: 'Authorize inter-district airlift and road convoy movement of 3 NDRF and 5 SDRF flood/landslide rescue battalions with inflatable boats and concrete cutters to Joshimath-Pipalkoti sector.',
          paramLabel: 'Deployment Mode & Airlift Priority',
          paramOptions: [
            'Combined Air + Green Corridor Convoy (2 Mi-17 Sorties from Gauchar + NH-58 Priority)',
            'Immediate Rotary-Wing Airlift Only (Gauchar & Jolly Grant Heliborne Insertion)',
            'Full Reserve Mobilization (+ITBP Mountaineering Wing Support at Joshimath)'
          ],
          expectedOutcome: 'Dispatches movement order #MO-2026-88; stages 340 rescue personnel and 24 motorized rubber boats within 90 minutes.'
        },
        {
          id: 'DEC-AUTH-04',
          title: 'Sign-Off & Broadcast Official State SITREP #42',
          category: 'Executive SITREP Sign-Off',
          lineage: '[OFFICIAL-GROUND-TRUTH]',
          urgency: 'HIGH · 15 MINS',
          targetView: 'multimodal-intelligence',
          eventId: 'EV-2026-0814-FLD',
          telemetrySnapshot: 'Cross-Modality Verification: 96.4% Confidence · 5/5 Streams Corroborated · NDMA & PMO Copy Ready',
          description: 'Digitally sign and release State Emergency Operations Center Situation Report #42 to NDMA New Delhi, Chief Secretary Office, District Magistrates, and Public Information Bureau.',
          paramLabel: 'Distribution Tier & Classification',
          paramOptions: [
            'Tier-1 Statutory Release (NDMA, PMO, Chief Secretary, All 13 DMs + Public Bulletin)',
            'Internal Command Release Only (SEOC, NDRF, SDRF, BRO, IMD, CWC Directors)',
            'Public Press & Media Briefing Package (Hindi + English Verified Summary)'
          ],
          expectedOutcome: 'Publishes cryptographically signed SITREP #42; updates public portal metrics and archives official ground truth.'
        }
      ]
    },
    'analyst': {
      id: 'analyst',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleTitle: 'Hazard Analyst',
      subTitle: 'Lead Hydro-Met & SAR Scientist (IMD/CWC/GSI)',
      authorityLevel: 'LEVEL 4 · SCIENTIFIC CALIBRATION',
      shortLevel: 'LVL 4',
      clearanceBadge: 'TELEMETRY & MODEL WRITE',
      sla: 'High (Hourly Cycles)',
      themeColor: 'blue',
      badgeBg: '#EFF6FF',
      badgeText: '#1E40AF',
      badgeBorder: '#3B82F6',
      summary: 'Scientific authority to validate cloudburst telemetry thresholds, confirm CWC river gauge danger breaches, publish SAR coherence loss polygons, and recalibrate catchment runoff models.',
      executableCategories: ['analyst', 'calibration', 'telemetry', 'hydrology', 'sar'],
      accessMap: {
        'overview': 'PUBLIC',
        'role-command': 'FULL',
        'hazard-monitoring': 'PRIMARY',
        'social-intelligence': 'READ_ONLY',
        'multimodal-intelligence': 'FULL'
      },
      accessReasons: {
        'overview': 'Public situational view open for baseline cross-checking.',
        'role-command': 'Full access to execute scientific calibration and threshold validation decisions.',
        'hazard-monitoring': 'Primary analytical workbench for hydro-meteorological telemetry and runoff models.',
        'social-intelligence': 'Read-only access to correlate citizen visual reports against sensor anomalies (no SDRF dispatch).',
        'multimodal-intelligence': 'Full access to attach SAR interferometry and hydrological evidence to event dossiers.'
      },
      decisions: [
        {
          id: 'DEC-ANL-01',
          title: 'Validate UK-RUD-04 Cloudburst Threshold >82.4 mm/hr',
          category: 'Meteorological Validation',
          lineage: '[LIVE-SENSOR]',
          urgency: 'HIGH · < 15 MINS',
          targetView: 'hazard-monitoring',
          eventId: 'EV-2026-0814-FLD',
          telemetrySnapshot: 'Station UK-RUD-04 (Kedarnath Upper): 82.4 mm/hr · Doppler Radar Reflectivity: 58.5 dBZ · Dual-Tipping Bucket Sync: 99.2%',
          description: 'Cross-validate automated tipping-bucket rain gauge spike at UK-RUD-04 against Mukteshwar/Surkanda Doppler radar reflectivity to rule out sensor false-positive and lock confirmed Cloudburst status.',
          paramLabel: 'Validation Method & Threshold Lock',
          paramOptions: [
            'Confirm Extreme Cloudburst (>82.4 mm/hr · Radar + INSAT-3DR Corroborated)',
            'Apply Orographic Bias Correction (-4.2% Wind-Drift Adjustment -> 78.9 mm/hr)',
            'Escalate to Flash-Flood Trigger Level 3 (Mandakini Upper Sub-Basin)'
          ],
          expectedOutcome: 'Marks UK-RUD-04 observation as [SENSOR-VERIFIED]; promotes anomaly to MEI-01 master dossier trigger.'
        },
        {
          id: 'DEC-ANL-02',
          title: 'Confirm Alaknanda CWC Gauge Danger Breach 627.8m',
          category: 'Hydrological Stage Confirmation',
          lineage: '[LIVE-SENSOR]',
          urgency: 'HIGH · < 20 MINS',
          targetView: 'hazard-monitoring',
          eventId: 'EV-2026-0814-FLD',
          telemetrySnapshot: 'Rudraprayag CWC Gauge: 627.80m (Danger Level: 626.40m) · Rising Rate: +0.38 m/hr · Discharge: 3,420 cumecs',
          description: 'Verify CWC bubbler & radar stage telemetry at Rudraprayag confluence and propagate 6-hour downstream flood hydrograph wave forecast to Srinagar Dam and Devprayag.',
          paramLabel: 'Downstream Routing & Dam Gate Advisory',
          paramOptions: [
            'Confirm 627.8m Breach + Issue Srinagar Hydro-Electric Barrage Pre-Release Advisory',
            'Confirm Breach + Propagate 4-Hour Flood Wave Arrival to Devprayag Confluence',
            'Lock Rating Curve Extrapolation (High-Sediment Manning n = 0.048)'
          ],
          expectedOutcome: 'Updates CWC basin hydrograph to Danger Breach; sends automated discharge forecast to dam operators.'
        },
        {
          id: 'DEC-ANL-03',
          title: 'Publish EOS-04 SAR Coherence Loss Landslide Polygon',
          category: 'SAR Remote Sensing Release',
          lineage: '[REMOTE-SENSED]',
          urgency: 'MEDIUM · HOURLY CYCLE',
          targetView: 'multimodal-intelligence',
          eventId: 'EV-2026-0814-LSD',
          telemetrySnapshot: 'ISRO EOS-04 C-Band SAR Pass: 18:12 UTC · InSAR Coherence Drop: 0.74 -> 0.21 · Slope Scarp Area: 1.42 sq km (Joshimath-Pagal Nala)',
          description: 'Publish georeferenced InSAR phase decorrelation polygon identifying active deep-seated slope deformation above NH-58 at Pagal Nala and Tangni.',
          paramLabel: 'Polygon Confidence Tier & Buffer Radius',
          paramOptions: [
            'High-Confidence Scarp Polygon + 500m Highway Runout Buffer (GeoJSON to GIS & MEI-01)',
            'Full Catchment Susceptibility Raster Overlay (30m DEM + GSI Lithology Mask)',
            'Immediate Slope Failure Watch for BRO Road Clearance Crew Safety'
          ],
          expectedOutcome: 'Publishes SAR deformation polygon #SAR-UK-2026-19 to MEI-01 and GIS Map Explorer layers.'
        },
        {
          id: 'DEC-ANL-04',
          title: 'Recalibrate Mandakini Flash-Flood Runoff Model Weights',
          category: 'AI / Hydrological Model Tuning',
          lineage: '[AI-ESTIMATED]',
          urgency: 'HIGH · HOURLY CYCLE',
          targetView: 'hazard-monitoring',
          eventId: 'EV-2026-0814-FLD',
          telemetrySnapshot: 'Antecedent Soil Moisture (ASM): 91.4% · CN-III Curve Number: 88 · Current Runoff Risk Score: 89% -> 94%',
          description: 'Update HEC-HMS / AI ensemble runoff model weights to account for 91.4% saturated glacial moraine soils and steep slope runoff acceleration in the Mandakini valley.',
          paramLabel: 'Ensemble Weighting & Soil Saturation Regime',
          paramOptions: [
            'Saturated Monsoon Regime (ASM 0.45 · Radar QPE 0.35 · CWC Stage 0.20 -> Risk 94%)',
            'Extreme Cloudburst Convective Mode (Radar QPE 0.55 · AWS 0.30 · Slope 0.15)',
            'Conservative Baseline Ensemble (Equal Modality Weighting 0.25x4)'
          ],
          expectedOutcome: 'Updates catchment runoff probability gauges across HM-01 and recalculates 90-minute flood lead times.'
        }
      ]
    },
    'response': {
      id: 'response',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleTitle: 'Emergency Response Team',
      subTitle: 'State Response Officer & SDRF Field Commander',
      authorityLevel: 'LEVEL 4 · TACTICAL DISPATCH',
      shortLevel: 'LVL 4',
      clearanceBadge: 'FIELD DISPATCH & TRIAGE WRITE',
      sla: 'Critical (< 15 mins)',
      themeColor: 'orange',
      badgeBg: '#FFF7ED',
      badgeText: '#9A3412',
      badgeBorder: '#EA580C',
      summary: 'Tactical field command authority to dispatch SDRF rescue teams, deploy BRO heavy highway clearance bulldozers, triage citizen SOS distress clusters, and allocate shelter beds.',
      executableCategories: ['response', 'tactical', 'dispatch', 'triage', 'shelter'],
      accessMap: {
        'overview': 'PUBLIC',
        'role-command': 'FULL',
        'hazard-monitoring': 'READ_ONLY',
        'social-intelligence': 'PRIMARY',
        'multimodal-intelligence': 'FULL'
      },
      accessReasons: {
        'overview': 'Public & baseline situational awareness for field staging.',
        'role-command': 'Full tactical command access to execute field dispatches and resource allocations.',
        'hazard-monitoring': 'Read-only access to view live river/rainfall weather windows (sensor calibration locked).',
        'social-intelligence': 'Primary tactical triage console for verifying citizen SOS clusters and dispatching rescue units.',
        'multimodal-intelligence': 'Full operational access to link field SITREPs and road clearance updates to incidents.'
      },
      decisions: [
        {
          id: 'DEC-RSP-01',
          title: 'Dispatch SDRF Rescue Team #4 to Byasi NH-58 Trapped Bus',
          category: 'Tactical Rescue Dispatch',
          lineage: '[OFFICIAL-GROUND-TRUTH]',
          urgency: 'CRITICAL · < 15 MINS',
          targetView: 'social-intelligence',
          eventId: 'EV-2026-0814-LSD',
          telemetrySnapshot: 'Location: NH-58 Byasi-Devprayag Stretch (30.0812°N, 78.4931°E) · 32 Pilgrims Reported Trapped · Verification: 94%',
          description: 'Deploy SDRF Quick Response Team #4 from Dhalwala/Rishikesh post with high-clearance 4x4 rescue tender, rope-rescue rigging, and trauma paramedics to extract stranded passengers.',
          paramLabel: 'Response Unit & Transit Corridor',
          paramOptions: [
            'SDRF Team #4 (28 Personnel + 2 Rope Rescue Rigs + 3 Advanced Life Support Ambulances)',
            'SDRF Team #4 + River Raft Backup Unit via Kaudiyala Staging Point',
            'Joint SDRF + Tehri District Police Night-Vision Extraction Squad'
          ],
          expectedOutcome: 'Dispatches tactical unit #SDRF-UK-04; ETA 22 minutes to Byasi blockage coordinates; updates SMI-01 SOS status.'
        },
        {
          id: 'DEC-RSP-02',
          title: 'Deploy 3 BRO Heavy Bulldozers to Pagal Nala Landslide',
          category: 'Highway Clearance Ops',
          lineage: '[OFFICIAL-GROUND-TRUTH]',
          urgency: 'CRITICAL · < 15 MINS',
          targetView: 'multimodal-intelligence',
          eventId: 'EV-2026-0814-LSD',
          telemetrySnapshot: 'BRO Project Shivalik Task Force 66 · Debris Volume: ~14,500 cu.m on NH-58 · 180 Vehicles Halted at Pipalkoti',
          description: 'Task Border Roads Organisation (BRO) 66 RCC to mobilize 3 BD-80 heavy bulldozers and 2 hydraulic rock-breakers from Joshimath and Chamoli depots to reopen single-lane emergency passage.',
          paramLabel: 'Excavation Equipment & Rockfall Safety Watch',
          paramOptions: [
            '3 BRO BD-80 Bulldozers + 2 Hydraulic Breakers (Dual-End Clearance from Pipalkoti & Joshimath)',
            'Daylight + Spotter-Guarded Clearance Only (Active GSI Slope Monitor Link)',
            'Controlled Blasting + Heavy Excavator Convoy (Priority Medical Corridor)'
          ],
          expectedOutcome: 'Logs BRO Task Order #SHIVALIK-66-09; initiates debris clearance with estimated 3.5-hour single-lane opening.'
        },
        {
          id: 'DEC-RSP-03',
          title: 'Verify & Escalate 18 Citizen SOS Calls in Kedarnath Valley',
          category: 'SOS Intelligence Triage',
          lineage: '[AI-ESTIMATED]',
          urgency: 'CRITICAL · < 10 MINS',
          targetView: 'social-intelligence',
          eventId: 'EV-2026-0814-FLD',
          telemetrySnapshot: 'Cluster: Sonprayag–Gaurikund Footpath · 18 Corroborated SOS Posts (Hindi/Garhwali) · NLP Confidence: 92.8%',
          description: 'Batch-verify 18 geolocated citizen distress signals reporting washed-out footbridge approach near Sonprayag and escalate directly to the MEI-01 Incident Commander dossier.',
          paramLabel: 'Verification Action & Escalation Target',
          paramOptions: [
            'Mark All 18 Signals [VERIFIED-HIGH-PRIORITY] & Attach to Dossier EV-2026-0814-FLD',
            'Cross-Verify Top 10 Geotagged Photo SOS via Sonprayag Sector Police Wireless',
            'Escalate Medical/Elderly Pilgrim SOS Subset (7 Signals) for Heli-Evac Triage'
          ],
          expectedOutcome: 'Promotes 18 SOS records from unverified stream to official incident evidence chain in SMI-01 and MEI-01.'
        },
        {
          id: 'DEC-RSP-04',
          title: 'Allocate 450 Relief Beds & Medical Kits at Gopeshwar Shelter',
          category: 'Relief & Shelter Logistics',
          lineage: '[OFFICIAL-GROUND-TRUTH]',
          urgency: 'HIGH · < 15 MINS',
          targetView: 'multimodal-intelligence',
          eventId: 'EV-2026-0814-FLD',
          telemetrySnapshot: 'Gopeshwar Sports Stadium & GMVN Shelters: 620 Total Capacity · Current Occupancy: 170 · Medical Kits: 800 in Stock',
          description: 'Release 450 emergency shelter beds, blankets, hot ration packets, and 250 trauma/water-borne illness medical kits at Gopeshwar and Tilwara relief camps for incoming evacuees.',
          paramLabel: 'Resource Allocation Package',
          paramOptions: [
            '450 Beds + 500 Ration Kits + 2 CMO Mobile Medical Teams at Gopeshwar & Tilwara',
            '300 Beds at Gopeshwar + 150 Beds at Augustmuni Degree College Camp',
            'Full District Reserve Activation (+DG Set Backup Power & Chlorine Tablets)'
          ],
          expectedOutcome: 'Reserves 450 beds in SEOC shelter inventory; dispatches CMO medical staff and food supply trucks.'
        }
      ]
    },
    'researcher': {
      id: 'researcher',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleTitle: 'Disaster Researcher',
      subTitle: 'Principal Multimodal AI & Climate Researcher',
      authorityLevel: 'LEVEL 3 · RESEARCH SANDBOX',
      shortLevel: 'LVL 3',
      clearanceBadge: 'READ-ONLY & DATASET EXPORT',
      sla: 'Batch / Deliberate',
      themeColor: 'indigo',
      badgeBg: '#EEF2FF',
      badgeText: '#3730A3',
      badgeBorder: '#6366F1',
      summary: 'Scientific research sandbox access to evaluate multimodal AI fusion F1 benchmarks, export anonymized Bronze/Silver NetCDF & GeoJSON datasets, run 10-year return-period analyses, and audit NLP bias.',
      executableCategories: ['researcher', 'research', 'export', 'benchmark', 'evaluation'],
      accessMap: {
        'overview': 'PUBLIC',
        'role-command': 'FULL',
        'hazard-monitoring': 'READ_ONLY',
        'social-intelligence': 'READ_ONLY',
        'multimodal-intelligence': 'READ_ONLY'
      },
      accessReasons: {
        'overview': 'Public situational overview available for baseline reference.',
        'role-command': 'Full access to execute research benchmarks, statistical return-period runs, and dataset exports.',
        'hazard-monitoring': 'Read-only access to inspect historical and live hydro-met series (sensor calibration locked).',
        'social-intelligence': 'Read-only access to study crisis NLP clustering and export anonymized corpora (triage dispatch locked).',
        'multimodal-intelligence': 'Read-only access to inspect 5-stream multimodal correlation weights (executive sign-off locked).'
      },
      decisions: [
        {
          id: 'DEC-RES-01',
          title: 'Run Multimodal Fusion Model F1 Evaluation vs Ground Truth',
          category: 'AI Benchmark Evaluation',
          lineage: '[AI-ESTIMATED]',
          urgency: 'BATCH · DELIBERATE',
          targetView: 'multimodal-intelligence',
          eventId: 'EV-2026-0814-FLD',
          telemetrySnapshot: 'Test Corpus: 48 Uttarakhand Events (2020–2026) · Late-Fusion F1: 0.914 · Precision: 0.931 · Recall: 0.898',
          description: 'Execute cross-validation benchmark comparing the 5-modality transformer fusion model (AWS + CWC + SAR + Social NLP + Drone) against GSI/USDMA verified post-disaster field ground truth.',
          paramLabel: 'Evaluation Split & Ablation Configuration',
          paramOptions: [
            'Full 5-Modality Late Fusion vs. Single-Sensor Baseline (48 Verified Events)',
            'Leave-One-Basin-Out Cross-Validation (Holdout: Mandakini & Alaknanda 2026)',
            'SAR + Hydrology Ablation Study (Cloud-Cover Resilience Test)'
          ],
          expectedOutcome: 'Generates confusion matrix & ROC-AUC report (F1 = 0.914, +14.2% over single-sensor baseline).'
        },
        {
          id: 'DEC-RES-02',
          title: 'Export 2020-2026 Uttarakhand Bronze/Silver NetCDF & GeoJSON Dataset',
          category: 'Reproducible Dataset Export',
          lineage: '[HISTORICAL-ARCHIVE]',
          urgency: 'BATCH · EXPORT',
          targetView: 'hazard-monitoring',
          eventId: 'EV-2026-0814-FLD',
          telemetrySnapshot: 'Archive Size: 184,200 Observations · 38 Relational Tables · PII Anonymized: 100% · CRS: EPSG:4326',
          description: 'Package and export harmonized Bronze raw telemetry and Silver quality-controlled spatiotemporal disaster slices (NetCDF-4 hydro-met grids + GeoJSON event polygons) with DOI provenance manifest.',
          paramLabel: 'Export Format & Medallion Tier',
          paramOptions: [
            'Silver Harmonized Bundle (NetCDF-4 Gridded Rain/Stage + GeoJSON Polygons + CSV Metadata)',
            'Bronze + Silver Full Lineage Package (With SHA-256 Checksums & Schema v3 Manifest)',
            'Multimodal ML Training Tensor Shard (Parquet + Cropped SAR GeoTIFF Patches)'
          ],
          expectedOutcome: 'Compiles downloadable research bundle #EXP-UK-2026-SILV with full PII scrubbing and citation manifest.'
        },
        {
          id: 'DEC-RES-03',
          title: 'Execute 10-Year Monsoon Extreme Rainfall Return-Period Analysis',
          category: 'Climatological GEV Analysis',
          lineage: '[HISTORICAL-ARCHIVE]',
          urgency: 'BATCH · DELIBERATE',
          targetView: 'hazard-monitoring',
          eventId: 'EV-2026-0814-FLD',
          telemetrySnapshot: '2016–2026 IMD + GPM IMERG Series · 82.4 mm/hr Event = 1-in-38 Year Return Period (GEV Shape ξ = 0.24)',
          description: 'Fit Generalized Extreme Value (GEV) non-stationary intensity-duration-frequency (IDF) curves across 13 Uttarakhand districts to quantify climate-change amplification of sub-hourly cloudbursts.',
          paramLabel: 'Return-Period Model & Elevation Band',
          paramOptions: [
            'Non-Stationary GEV (2,000m–4,000m Middle-to-High Himalayan Orographic Belt)',
            '10-Year Gumbel / POT Return Period (All 13 Uttarakhand Districts · 1h / 6h / 24h)',
            'Glacial-Periglacial Transition Zone Shift Analysis (Kedarnath–Badrinath Transect)'
          ],
          expectedOutcome: 'Computes updated IDF curves showing +18.6% shift in 25-year 1-hour extreme rainfall intensity above 2,500m.'
        },
        {
          id: 'DEC-RES-04',
          title: 'Audit False-Positive Rate on Social NLP Geolocation',
          category: 'Algorithmic Fairness & Precision Audit',
          lineage: '[AI-ESTIMATED]',
          urgency: 'BATCH · AUDIT',
          targetView: 'social-intelligence',
          eventId: 'EV-2026-0814-LSD',
          telemetrySnapshot: 'Sampled Posts: 4,280 (Hindi/Garhwali/English) · Toponym Disambiguation Accuracy: 91.2% · FPR: 4.6%',
          description: 'Audit multilingual Named Entity Recognition (NER) and toponym disambiguation errors (e.g., homonymous village names across Garhwal and Kumaon) and evaluate rumor quarantine recall.',
          paramLabel: 'Language Stratum & Error Taxonomy',
          paramOptions: [
            'Full Multilingual Audit (Hindi + Garhwali + Kumaoni + English Code-Switched Posts)',
            'Homonym Toponym Stress Test (Rampur / Ganeshpur / Pipalkoti Gazetteer Resolver)',
            'Recycled Old Disaster Video / Deepfake Detection Precision Audit'
          ],
          expectedOutcome: 'Produces NLP audit report identifying 4.6% false-positive rate and recommends gazetteer prior boost.'
        }
      ]
    },
    'data-admin': {
      id: 'data-admin',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleTitle: 'Data Administrator',
      subTitle: 'SEOC Telemetry Pipeline & Infrastructure Lead',
      authorityLevel: 'LEVEL 5 · SYSTEM & PIPELINE ADMIN',
      shortLevel: 'LVL 5',
      clearanceBadge: 'INGESTION & SENSOR CONTROL',
      sla: 'Continuous (24/7 Ops)',
      themeColor: 'teal',
      badgeBg: '#E0F2FE',
      badgeText: '#075985',
      badgeBorder: '#0284C7',
      summary: 'System infrastructure authority to quarantine drifting IoT telemetry packets, restart MOSDAC/CWC MQTT ingestion workers, re-index the 38-table spatial store, and flush NLP tokenizer queues.',
      executableCategories: ['data-admin', 'pipeline', 'ingestion', 'database', 'system'],
      accessMap: {
        'overview': 'PUBLIC',
        'role-command': 'PRIMARY',
        'hazard-monitoring': 'FULL',
        'social-intelligence': 'FULL',
        'multimodal-intelligence': 'READ_ONLY'
      },
      accessReasons: {
        'overview': 'Public dashboard monitored for uptime and API response latency.',
        'role-command': 'Primary System Administration console for ingestion pipelines and schema operations.',
        'hazard-monitoring': 'Full access to sensor health diagnostics, packet quarantine, and MQTT worker controls.',
        'social-intelligence': 'Full access to social crawler rate-limiters, bot quarantine, and tokenizer queues.',
        'multimodal-intelligence': 'Read-only access to verify relational evidence joins (executive tactical sign-off locked).'
      },
      decisions: [
        {
          id: 'DEC-ADM-01',
          title: 'Quarantine Drifting Telemetry Packet on Station UK-utt-09',
          category: 'Sensor Stream Quarantine',
          lineage: '[LIVE-SENSOR]',
          urgency: 'CONTINUOUS · < 5 MINS',
          targetView: 'hazard-monitoring',
          eventId: 'EV-2026-0814-FLD',
          telemetrySnapshot: 'Node UK-utt-09 (Bhatwari AWS): Voltage Drop 9.1V · Spurious Spike: 412.0 mm/hr (Z-Score: +14.8σ) · Packet Loss: 18%',
          description: 'Isolate malfunctioning tipping-bucket telemetry stream from station UK-utt-09 into the Bronze quarantine bucket to prevent corrupting Silver catchment kriging and false flood alarms.',
          paramLabel: 'Quarantine Policy & Fallback Imputation',
          paramOptions: [
            'Quarantine UK-utt-09 Raw Stream + Enable Spatial Kriging Fallback from UK-UTT-04/07',
            'Hard-Mute Node for 6 Hours + Dispatch Field IoT Maintenance Ticket',
            'Route to Shadow Sandbox Only (Exclude from Production AI Runoff Inference)'
          ],
          expectedOutcome: 'Quarantines node UK-utt-09 in sensor registry; switches Bhatwari grid cell to neighbor-interpolated telemetry.'
        },
        {
          id: 'DEC-ADM-02',
          title: 'Restart MOSDAC INSAT-3D & CWC MQTT Ingestion Workers',
          category: 'Ingestion Worker Orchestration',
          lineage: '[LIVE-SENSOR]',
          urgency: 'HIGH · 24/7 OPS',
          targetView: 'hazard-monitoring',
          eventId: 'EV-2026-0814-FLD',
          telemetrySnapshot: 'MOSDAC SFTP Poll Lag: 142s · CWC MQTT Broker Pool: 14/16 Active · Throughput: 1,280 msg/sec · Drop Rate: 0.04%',
          description: 'Perform zero-downtime rolling restart of the MOSDAC satellite L2 hydro-estimator worker and CWC river telemetry MQTT consumer pool to clear socket backpressure.',
          paramLabel: 'Worker Pool & Checkpointing Mode',
          paramOptions: [
            'Rolling Restart (MOSDAC INSAT-3DR Poller + CWC MQTT 16-Worker Pool · Offset Preserved)',
            'Scale CWC Telemetry Consumers 16 -> 32 Threads (Monsoon Peak Burst Mode)',
            'Force Immediate Satellite Tile Sync + Clear Stale WMS Tile Cache'
          ],
          expectedOutcome: 'Restarts ingestion workers in 1.8s with zero dropped messages; poll latency drops from 142s to 8s.'
        },
        {
          id: 'DEC-ADM-03',
          title: 'Re-index 38-Table Schema Store & Spatial R-Tree Cache',
          category: 'Database & Spatial Optimization',
          lineage: '[OFFICIAL-GROUND-TRUTH]',
          urgency: 'MEDIUM · MAINTENANCE',
          targetView: 'multimodal-intelligence',
          eventId: 'EV-2026-0814-LSD',
          telemetrySnapshot: 'Relational Store: 38 Tables · BBox Query P95 Latency: 48ms -> 11ms · WAL Checkpoint: Clean',
          description: 'Rebuild spatial bounding-box indices (`event_region`, `observation`, `raster_product`, `modality_event`) and refresh materialized dashboard summary views.',
          paramLabel: 'Index Target & Vacuum Strategy',
          paramOptions: [
            'Online Re-Index All 38 Tables + Refresh Spatial R-Tree & Materialized KPI Views',
            'Fast Spatial Index Rebuild Only (`event_region`, `observation`, `satellite_scene`)',
            'Full ANALYZE + Connection Pool Reset (Max Connections: 64)'
          ],
          expectedOutcome: 'Re-indexes all 38 schema tables; reduces `/api/v1/events` and spatial bbox query P95 latency to 11ms.'
        },
        {
          id: 'DEC-ADM-04',
          title: 'Flush Social Media Hindi/Garhwali Tokenizer Queue',
          category: 'NLP Pipeline Administration',
          lineage: '[AI-ESTIMATED]',
          urgency: 'HIGH · 24/7 OPS',
          targetView: 'social-intelligence',
          eventId: 'EV-2026-0814-LSD',
          telemetrySnapshot: 'Queue Depth: 1,840 Pending Posts · Devanagari/Garhwali Tokenizer GPU Util: 78% · Spam Bot Filter: Active',
          description: 'Drain backlogged multilingual social ingestion queue, purge duplicate retweet bot storms, and re-allocate inference batch workers to prioritize `[SOS]` tagged Devanagari posts.',
          paramLabel: 'Queue Drain & Priority Scheduling',
          paramOptions: [
            'Priority Drain (Process SOS & Geotagged Hindi/Garhwali Posts First + Dedup Retweets)',
            'Flush Entire 1,840 Post Backlog Across 4 Parallel NLP Inference Workers',
            'Quarantine Suspected Bot/Spam Burst (312 Accounts) + Reset Rate Limiter'
          ],
          expectedOutcome: 'Drains 1,840 queued posts in 6.4 seconds; quarantines 312 duplicate bot posts; updates SMI-01 feed.'
        }
      ]
    },
    'citizen': {
      id: 'citizen',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleTitle: 'Common Citizen',
      subTitle: 'Verified Resident / Pilgrim Portal (Uttarakhand)',
      authorityLevel: 'LEVEL 1 · PUBLIC ACCESS',
      shortLevel: 'LVL 1',
      clearanceBadge: 'PUBLIC ADVISORIES & SOS ONLY',
      sla: 'On-Demand Safety',
      themeColor: 'green',
      badgeBg: '#ECFDF5',
      badgeText: '#065F46',
      badgeBorder: '#10B981',
      summary: 'Public citizen & pilgrim safety access to check live NH-58 / Char Dham highway status, locate nearest open relief camps, submit geotagged SOS reports, and subscribe to verified SMS alerts.',
      executableCategories: ['citizen', 'public', 'safety', 'sos-submit'],
      accessMap: {
        'overview': 'PRIMARY',
        'role-command': 'PUBLIC',
        'hazard-monitoring': 'RESTRICTED',
        'social-intelligence': 'PUBLIC',
        'multimodal-intelligence': 'RESTRICTED'
      },
      accessReasons: {
        'overview': 'Primary Public Dashboard — untouched, clean, and always open for all citizens and pilgrims.',
        'role-command': 'Public Citizen Safety & Self-Service Action Portal.',
        'hazard-monitoring': 'Restricted (Level 3+ SEOC Clearance Required) — raw sensor calibration and unvalidated telemetry are gated to prevent public panic.',
        'social-intelligence': 'Public Mode — shows verified official advisories, debunked rumors, and Citizen SOS submission form (raw triage locked).',
        'multimodal-intelligence': 'Restricted (Level 3+ SEOC Clearance Required) — internal SAR coherence matrices and command sign-off panels are gated; public summary banner provided.'
      },
      decisions: [
        {
          id: 'DEC-CIT-01',
          title: 'Check Live NH-58 / Char Dham Road Accessibility & Safe Detours',
          category: 'Public Route Safety Check',
          lineage: '[OFFICIAL-GROUND-TRUTH]',
          urgency: 'ON-DEMAND · SAFETY',
          targetView: 'overview',
          eventId: 'EV-2026-0814-LSD',
          telemetrySnapshot: 'NH-58 Status: Blocked at Pagal Nala & Byasi · Safe Detour: Tehri–Chamba–Ghansali Open for Light Vehicles',
          description: 'Query official Police EOC and BRO verified highway corridor status along Rishikesh–Devprayag–Srinagar–Rudraprayag–Joshimath before starting travel.',
          paramLabel: 'Travel Corridor & Vehicle Type',
          paramOptions: [
            'Rishikesh -> Rudraprayag -> Kedarnath Approach (NH-58 / NH-107 · Light Vehicle)',
            'Rishikesh -> Joshimath -> Badrinath Corridor (NH-58 · Pilgrim Bus / Heavy)',
            'Alternative Tehri Dam -> Chamba -> Srinagar Bypass Route'
          ],
          expectedOutcome: 'Displays verified Police/BRO route clearance advisory and safe holding shelters along selected corridor.'
        },
        {
          id: 'DEC-CIT-02',
          title: 'Locate Nearest Open Relief Shelter & Medical Camp in Rudraprayag',
          category: 'Relief Shelter Locator',
          lineage: '[OFFICIAL-GROUND-TRUTH]',
          urgency: 'ON-DEMAND · SAFETY',
          targetView: 'overview',
          eventId: 'EV-2026-0814-FLD',
          telemetrySnapshot: 'Nearest Open Camps: Augustmuni Indoor Stadium (1.8 km · 140 Beds Free) · GMVN Tilwara (3.4 km · Medical Doctor On-Site)',
          description: 'Find nearest district-verified relief shelters with drinking water, power backup, hot meals, and emergency medical staff in Rudraprayag and Chamoli.',
          paramLabel: 'Current Location & Assistance Needed',
          paramOptions: [
            'Rudraprayag / Tilwara Sector (Family Shelter + Medical First Aid + Drinking Water)',
            'Sonprayag / Guptkashi Pilgrim Holding Zone (Overnight Stay + Oxygen Support)',
            'Joshimath / Pipalkoti Highway Transit Relief Camp'
          ],
          expectedOutcome: 'Provides turn-by-turn safe walking/driving directions and nodal magistrate helpline (1070 / 112).'
        },
        {
          id: 'DEC-CIT-03',
          title: 'Submit Verified Geotagged Citizen SOS / Roadblock Report',
          category: 'Citizen SOS Submission',
          lineage: '[UNVERIFIED-CITIZEN]',
          urgency: 'HIGH · IMMEDIATE TRIAGE',
          targetView: 'social-intelligence',
          eventId: 'EV-2026-0814-LSD',
          telemetrySnapshot: 'GPS Lock: 30.2849°N, 78.9811°E (±6m Accuracy) · Routed To: SEOC SMI-01 Triage & District Control Room 1077',
          description: 'Submit a geotagged emergency assistance request or roadblock observation as citizen Ashutosh Kanojia directly into the SEOC Response Team triage queue.',
          paramLabel: 'Incident Report Type & Headcount',
          paramOptions: [
            'Highway Landslide / Boulder Blockade (12 Vehicles Stranded · No Injuries)',
            'Urgent Medical / Elderly Pilgrim Assistance Needed at Holding Point (4 Persons)',
            'Rising River Water Near Residential Ghat / Footbridge Submerged'
          ],
          expectedOutcome: 'Transmits geotagged report #SOS-CIT-2026-904 to SMI-01 Response Team queue with SMS tracking receipt.'
        },
        {
          id: 'DEC-CIT-04',
          title: 'Subscribe to District SMS / WhatsApp Emergency Advisories',
          category: 'Public Alert Subscription',
          lineage: '[OFFICIAL-GROUND-TRUTH]',
          urgency: 'ON-DEMAND · PREVENTIVE',
          targetView: 'overview',
          eventId: 'EV-2026-0814-FLD',
          telemetrySnapshot: 'SACHET / USDMA Broadcast Gateway: Active · Languages: Hindi, Garhwali & English · Zero-Rumor Verified Feed',
          description: 'Register Ashutosh Kanojia (Citizen Profile) for instant bilingual IMD Red/Orange weather warnings, CWC flood alerts, and verified NH-58 road opening notifications.',
          paramLabel: 'Districts & Language Preference',
          paramOptions: [
            'Rudraprayag, Chamoli & Tehri Garhwal (Bilingual Hindi + English SMS & WhatsApp)',
            'All Char Dham Yatra Corridors (Uttarkashi, Rudraprayag, Chamoli · Voice + SMS)',
            'Statewide Uttarakhand USDMA Official Bulletins Only'
          ],
          expectedOutcome: 'Activates SACHET/USDMA verified push subscription for Ashutosh Kanojia (AK).'
        }
      ]
    }
  };

  const ROLE_LIST = [
    ROLES['authority'],
    ROLES['analyst'],
    ROLES['response'],
    ROLES['researcher'],
    ROLES['data-admin'],
    ROLES['citizen']
  ];

  const getRoleById = (roleId) => {
    if (!roleId) return ROLES['authority'];
    return ROLES[roleId] || ROLES['authority'];
  };

  const canAccessView = (roleId, viewId) => {
    const role = getRoleById(roleId);
    if (!viewId || viewId === 'overview' || viewId === 'role-command') return true;
    const access = (role.accessMap && role.accessMap[viewId]) || 'PUBLIC';
    return access !== 'RESTRICTED';
  };

  const canExecuteCategory = (roleId, category) => {
    const role = getRoleById(roleId);
    if (!category) return false;
    const norm = String(category).trim().toLowerCase();
    if (role.id === norm) return true;
    if (Array.isArray(role.executableCategories) && role.executableCategories.includes(norm)) {
      return true;
    }
    if (role.accessMap && (role.accessMap[norm] === 'PRIMARY' || role.accessMap[norm] === 'FULL')) {
      return true;
    }
    return false;
  };

  const getAccessLevel = (roleId, viewId) => {
    const role = getRoleById(roleId);
    return (role.accessMap && role.accessMap[viewId]) || 'PUBLIC';
  };

  // Expose Role Engine globally for TopBar, Sidebar, App, HM-01, SMI-01, MEI-01
  window.DisasterRoleEngine = {
    ROLES,
    ROLE_LIST,
    DASHBOARD_TARGETS,
    getRoleById,
    canAccessView,
    canExecuteCategory,
    getAccessLevel
  };

  const ACCESS_BADGE_STYLES = {
    'PRIMARY': {
      label: 'PRIMARY WORKSPACE',
      short: 'PRIMARY',
      bg: '#EFF6FF',
      text: '#1D4ED8',
      border: '#3B82F6',
      canOpen: true
    },
    'FULL': {
      label: 'FULL READ / WRITE',
      short: 'FULL',
      bg: '#ECFDF5',
      text: '#047857',
      border: '#10B981',
      canOpen: true
    },
    'PUBLIC': {
      label: 'PUBLIC OPEN ACCESS',
      short: 'PUBLIC',
      bg: '#F0FDFA',
      text: '#0F766E',
      border: '#14B8A6',
      canOpen: true
    },
    'READ_ONLY': {
      label: 'READ-ONLY SANDBOX',
      short: 'READ-ONLY',
      bg: '#FFFBEB',
      text: '#B45309',
      border: '#F59E0B',
      canOpen: true
    },
    'RESTRICTED': {
      label: 'RESTRICTED · GATED',
      short: 'RESTRICTED',
      bg: '#FEF2F2',
      text: '#B91C1C',
      border: '#EF4444',
      canOpen: false
    }
  };

  const LINEAGE_BADGE_STYLES = {
    '[LIVE-SENSOR]': { bg: '#ECFDF5', text: '#065F46', border: '#10B981' },
    '[OFFICIAL-GROUND-TRUTH]': { bg: '#EFF6FF', text: '#1E40AF', border: '#3B82F6' },
    '[REMOTE-SENSED]': { bg: '#F5F3FF', text: '#5B21B6', border: '#8B5CF6' },
    '[AI-ESTIMATED]': { bg: '#FFFBEB', text: '#92400E', border: '#F59E0B' },
    '[HISTORICAL-ARCHIVE]': { bg: '#F1F5F9', text: '#334155', border: '#64748B' },
    '[UNVERIFIED-CITIZEN]': { bg: '#FEF2F2', text: '#991B1B', border: '#EF4444' }
  };

  const INITIAL_AUDIT_LOG = [
    {
      logId: 'LOG-2026-0904',
      timestamp: '2026-11-12 23:24:18 IST',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleId: 'authority',
      roleTitle: 'Disaster Management Authority',
      authorityLevel: 'LEVEL 5 · EXECUTIVE COMMAND',
      decisionId: 'DEC-AUTH-02',
      decisionTitle: 'Declare Red Alert in Rudraprayag & Chamoli',
      selectedParam: 'Red Alert: Rudraprayag + Chamoli (Hold Yatra at Srinagar & Gauchar Checkposts)',
      targetView: 'hazard-monitoring',
      status: 'EXECUTED & BROADCAST',
      signature: 'A. Kanojia'
    },
    {
      logId: 'LOG-2026-0903',
      timestamp: '2026-11-12 23:19:05 IST',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleId: 'analyst',
      roleTitle: 'Hazard Analyst',
      authorityLevel: 'LEVEL 4 · SCIENTIFIC CALIBRATION',
      decisionId: 'DEC-ANL-01',
      decisionTitle: 'Validate UK-RUD-04 Cloudburst Threshold >82.4 mm/hr',
      selectedParam: 'Confirm Extreme Cloudburst (>82.4 mm/hr · Radar + INSAT-3DR Corroborated)',
      targetView: 'hazard-monitoring',
      status: 'TELEMETRY CALIBRATED',
      signature: 'A. Kanojia'
    },
    {
      logId: 'LOG-2026-0902',
      timestamp: '2026-11-12 23:12:44 IST',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleId: 'response',
      roleTitle: 'Emergency Response Team',
      authorityLevel: 'LEVEL 4 · TACTICAL DISPATCH',
      decisionId: 'DEC-RSP-01',
      decisionTitle: 'Dispatch SDRF Rescue Team #4 to Byasi NH-58 Trapped Bus',
      selectedParam: 'SDRF Team #4 (28 Personnel + 2 Rope Rescue Rigs + 3 Advanced Life Support Ambulances)',
      targetView: 'social-intelligence',
      status: 'UNIT DISPATCHED',
      signature: 'A. Kanojia'
    }
  ];

  const levelOf = (role) => String(role.authorityLevel || '').split('·')[0].trim();
  const shortFigures = (text) => String(text || '').split('·').slice(0, 2).map((s) => s.trim()).join(' · ');
  const navLabel = (dash) => dash.shortName.replace(/\s*\(.*\)\s*$/, '');

  const RoleWorkspaceView = ({
    activeRoleId = 'authority',
    onNavigate = null,
    drillContext = null
  }) => {
    const currentRoleId = activeRoleId && ROLES[activeRoleId] ? activeRoleId : 'authority';
    const [selectedParams, setSelectedParams] = useState({});
    const [executedMap, setExecutedMap] = useState({
      'DEC-AUTH-02': true,
      'DEC-ANL-01': true,
      'DEC-RSP-01': true
    });
    const [auditLog, setAuditLog] = useState(INITIAL_AUDIT_LOG);

    const activeRole = getRoleById(currentRoleId);
    const isAdmin = activeRole.id === 'data-admin';

    const getDecisionParam = (decision) => {
      if (selectedParams[decision.id]) return selectedParams[decision.id];
      return (decision.paramOptions && decision.paramOptions[0]) || 'Standard protocol';
    };

    const handleExecuteDecision = (decision) => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const timeStr = `2026-11-12 ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      const newEntry = {
        logId: `LOG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: timeStr,
        roleId: activeRole.id,
        decisionId: decision.id,
        decisionTitle: decision.title,
        selectedParam: getDecisionParam(decision),
        targetView: decision.targetView,
        status: 'EXECUTED',
        signature: 'A. Kanojia'
      };
      setExecutedMap((prev) => ({ ...prev, [decision.id]: true }));
      setAuditLog((prev) => [newEntry, ...prev]);
    };

    const handleNav = (dash) => {
      if (onNavigate && dash.id !== 'role-command') {
        onNavigate(dash.id, { fromScreen: 'RAC-01', roleId: activeRole.id, roleTitle: activeRole.roleTitle });
      }
    };

    const navTargets = DASHBOARD_TARGETS.filter(
      (d) => d.id !== 'role-command' && canAccessView(activeRole.id, d.id)
    );
    const roleLog = auditLog.filter((item) => item.roleId === activeRole.id).slice(0, 8);
    const decisions = activeRole.decisions || [];

    return (
      <div className="p-5 space-y-4 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-ink tracking-tight">
              {isAdmin ? 'Pipeline Console' : 'Command Hub'}
            </h1>
            <span
              className="px-2 py-0.5 rounded-md text-[11px] font-bold border"
              style={{
                backgroundColor: activeRole.badgeBg,
                color: activeRole.badgeText,
                borderColor: activeRole.badgeBorder
              }}
            >
              {levelOf(activeRole)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {navTargets.map((dash) => (
              <button
                key={dash.id}
                type="button"
                onClick={() => handleNav(dash)}
                className="px-3 py-1.5 rounded-lg bg-surface border border-line text-[12px] font-semibold text-ink hover:border-accent hover:text-accent transition-colors"
              >
                {navLabel(dash)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {decisions.map((decision) => {
            const done = !!executedMap[decision.id];
            const options = decision.paramOptions || [];
            return (
              <div
                key={decision.id}
                className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[13.5px] font-bold text-ink leading-snug">{decision.title}</h3>
                  {done && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded bg-ok-soft text-ok text-[10.5px] font-bold">
                      DONE
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-muted truncate" title={decision.telemetrySnapshot}>
                  {shortFigures(decision.telemetrySnapshot)}
                </div>
                {!isAdmin && options.length > 1 && (
                  <select
                    value={getDecisionParam(decision)}
                    onChange={(e) => setSelectedParams((prev) => ({ ...prev, [decision.id]: e.target.value }))}
                    className="w-full text-[12px] bg-surface border border-line rounded-lg px-2 py-1.5 text-ink truncate"
                  >
                    {options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                  <span className="text-[11px] font-semibold text-muted">{decision.urgency}</span>
                  <button
                    type="button"
                    onClick={() => handleExecuteDecision(decision)}
                    className="px-3 py-1.5 rounded-lg bg-accent text-white text-[12px] font-bold hover:opacity-90"
                  >
                    {done ? 'Run again' : 'Execute'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-surface border border-line rounded-xl p-4">
          <h2 className="text-[13px] font-bold text-ink mb-2">Decision Log</h2>
          {roleLog.length === 0 ? (
            <div className="text-[12px] text-muted">No decisions yet.</div>
          ) : (
            <div className="divide-y divide-line">
              {roleLog.map((item) => (
                <div key={item.logId} className="flex items-center gap-3 py-2 text-[12px]">
                  <span className="text-muted tabular-nums shrink-0">{item.timestamp}</span>
                  <span className="flex-1 min-w-0 truncate text-ink font-semibold">{item.decisionTitle}</span>
                  <span className="text-muted shrink-0 hidden sm:inline">{item.signature}</span>
                  <span className="px-1.5 py-0.5 rounded bg-ok-soft text-ok text-[10.5px] font-bold shrink-0">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  window.DisasterViews = window.DisasterViews || {};
  window.DisasterViews.RoleWorkspaceView = RoleWorkspaceView;
  window.RoleWorkspaceView = RoleWorkspaceView;
})();
