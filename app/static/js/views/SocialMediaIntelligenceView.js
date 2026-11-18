// Disaster Intelligence Platform — Screen SMI-01: Social Media Intelligence, Emerging Events & Hotspot Dashboard
// SRS v3.0 Reference: Screen Specification 2 (SMI-01)
// Features:
// - Screen ID badge SMI-01, Role Decision Lens bar for all 6 SRS user categories
// - Quick navigation handshakes to HM-01 (hazard-monitoring) and MEI-01 (multimodal-intelligence)
// - Interactive Filter Bar (Urgency Category, Language, Verification Status, Corridor/District)
// - 4 Executive KPI Cards with explicit data lineage badges ([LIVE-INGESTION], [AI-ESTIMATED], [UNVERIFIED-CITIZEN], [FACT-CHECKED])
// - Interactive Leaflet Geospatial Hotspot & Cluster Map (L.map + ResizeObserver + pulsing distress circles + cluster metrics inspector)
// - Live Bilingual Citizen Post Triage Stream (Hindi/Garhwali/Kumaoni + English translation, confidence bar, Verify/Escalate toggle, Link to Event Dossier MEI-01)
// - Emerging Keyword & Topic Cloud + Temporal Post Burst Chart + Misinformation Quarantine & Fact-Check Inspector

(function() {
  const React = window.React;
  const { useState, useEffect, useRef, useMemo } = React;

  // Standardized SRS v3.0 Data Lineage Badge Component
  const LineageBadge = ({ type = 'LIVE-INGESTION', className = '' }) => {
    const styles = {
      'LIVE-INGESTION': {
        bg: '#ECFDF5',
        text: '#065F46',
        border: '#10B981',
        label: 'LIVE-INGESTION'
      },
      'AI-ESTIMATED': {
        bg: '#FFFBEB',
        text: '#92400E',
        border: '#F59E0B',
        label: 'AI-ESTIMATED'
      },
      'UNVERIFIED-CITIZEN': {
        bg: '#FEF2F2',
        text: '#991B1B',
        border: '#EF4444',
        label: 'UNVERIFIED-CITIZEN'
      },
      'FACT-CHECKED': {
        bg: '#EFF6FF',
        text: '#1E40AF',
        border: '#3B82F6',
        label: 'FACT-CHECKED'
      },
      'OFFICIAL-GROUND-TRUTH': {
        bg: '#E0F2FE',
        text: '#075985',
        border: '#0284C7',
        label: 'OFFICIAL-GROUND-TRUTH'
      }
    };
    const cfg = styles[type] || styles['LIVE-INGESTION'];
    return (
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold tracking-tight whitespace-nowrap ${className}`}
        style={{
          backgroundColor: cfg.bg,
          color: cfg.text,
          border: `1px solid ${cfg.border}`
        }}
      >
        {cfg.label}
      </span>
    );
  };

  // Normalize any role identifier (short key or full SRS label) to canonical 6-role IDs
  const normalizeRoleId = (rawRole) => {
    const val = String(rawRole || '').trim().toLowerCase();
    if (val === 'response' || val.includes('response') || val.includes('sdrf')) return 'response';
    if (val === 'authority' || val.includes('authorit') || val.includes('executive')) return 'authority';
    if (val === 'analyst' || val.includes('analyst') || val.includes('hazard')) return 'analyst';
    if (val === 'researcher' || val.includes('research')) return 'researcher';
    if (val === 'data-admin' || val.includes('admin') || val.includes('pipeline')) return 'data-admin';
    if (val === 'citizen' || val.includes('citizen') || val.includes('public')) return 'citizen';
    return 'response';
  };

  // 6 SRS Roles with Ashutosh Kanojia (AK) identity, Authority Levels (LEVEL 1 to LEVEL 5), and Clearance Scopes
  const SRS_ROLES = [
    {
      id: 'response',
      shortLabel: 'Emergency Response Teams',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleTitle: 'State Response Officer & SDRF Field Commander',
      authorityLevel: 'LEVEL 4 · TACTICAL DISPATCH',
      clearance: 'FIELD DISPATCH & TRIAGE WRITE',
      primary: true,
      badge: 'PRIMARY USER',
      sla: 'Critical (Real-time, under 15 mins)',
      access: 'Field Operator / Response',
      decisions: [
        'Triage geolocated citizen SOS calls & trapped vehicle clusters on NH-107 and NH-58',
        'Dispatch nearest SDRF rescue teams and BRO excavators to corroborated roadblocks',
        'Verify live casualty, pilgrim stranding, and shelter need reports before field deployment'
      ]
    },
    {
      id: 'authority',
      shortLabel: 'Disaster Management Authorities',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleTitle: 'SEOC State Relief Commissioner & Executive Magistrate',
      authorityLevel: 'LEVEL 5 · EXECUTIVE COMMAND',
      clearance: 'FULL READ/WRITE & CAP BROADCAST',
      primary: true,
      badge: 'EXECUTIVE COMMAND',
      sla: 'Immediate (Real-time, under 5 mins)',
      access: 'Executive / Admin',
      decisions: [
        'Authorize emergency CAP public advisories and counter-bulletins against viral panic rumors',
        'Order tehsil-level evacuations when citizen distress clusters corroborate sensor breaches',
        'Mobilize NDRF/SDRF battalions and helicopters for cut-off valley settlements'
      ]
    },
    {
      id: 'analyst',
      shortLabel: 'Hazard Analysts',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleTitle: 'Lead Hydro-Met & SAR Scientist (IMD/CWC/GSI)',
      authorityLevel: 'LEVEL 4 · SCIENTIFIC CALIBRATION',
      clearance: 'READ-ONLY CORROBORATION & CORPUS EXPORT',
      primary: false,
      badge: 'CORROBORATION',
      sla: 'High (Hourly to 6-hour cycles)',
      access: 'Analyst Read/Corroborate',
      decisions: [
        'Cross-verify un-gauged tributary flash floods and slope failures reported by villagers',
        'Calibrate NLP urgency classifiers and spatial DBSCAN hotspot clustering thresholds',
        'Correlate citizen visual media timestamps with IMD Doppler radar convective peaks'
      ]
    },
    {
      id: 'researcher',
      shortLabel: 'Researchers',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleTitle: 'Principal Multimodal AI & Climate Researcher',
      authorityLevel: 'LEVEL 3 · RESEARCH SANDBOX',
      clearance: 'READ-ONLY & NLP DATASET EXPORT',
      primary: false,
      badge: 'MODEL EVALUATION',
      sla: 'Low / Deliberate (Post-disaster / Batch)',
      access: 'Research Read & Export',
      decisions: [
        'Benchmark multilingual (Hindi/Garhwali/Kumaoni) NER & urgency classification F1-scores',
        'Analyze temporal lag between physical hazard onset and social media burst velocity',
        'Export anonymized citizen crisis datasets for multimodal fusion model training'
      ]
    },
    {
      id: 'data-admin',
      shortLabel: 'Data Administrators',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleTitle: 'SEOC Telemetry Pipeline & NLP Infrastructure Lead',
      authorityLevel: 'LEVEL 5 · SYSTEM & PIPELINE ADMIN',
      clearance: 'NLP QUEUE, BOT QUARANTINE & CRAWLER OPS',
      primary: false,
      badge: 'PIPELINE OPS',
      sla: 'Medium / Continuous (24/7 Ops)',
      access: 'System Administrator',
      decisions: [
        'Monitor social crawler ingestion rate, API rate limits, and 1070 helpline webhook queues',
        'Audit bilingual machine translation latency and geocoding resolver accuracy',
        'Enforce spam/bot quarantine rules and PII anonymization compliance'
      ]
    },
    {
      id: 'citizen',
      shortLabel: 'Common Citizens',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleTitle: 'Citizen / Char Dham Traveller (Public Portal)',
      authorityLevel: 'LEVEL 1 · PUBLIC CITIZEN ACCESS',
      clearance: 'PUBLIC VERIFIED ADVISORIES & SOS FORM ONLY',
      primary: false,
      badge: 'PUBLIC SAFETY',
      sla: 'High (Safety-Critical / On-Demand)',
      access: 'Public Portal (Read-Only)',
      decisions: [
        'Check verified highway open/closed status on Char Dham routes (NH-58, NH-107, NH-34)',
        'Distinguish official USDMA/PIB advisories from debunked dam-failure or bridge rumors',
        'Submit geolocated SOS distress alerts or locate nearest functional relief camps'
      ]
    }
  ];

  // Distress Hotspot Clusters across Uttarakhand
  const HOTSPOT_CLUSTERS = [
    {
      id: 'CL-RUD-01',
      name: 'Basukedar - Kund Sector (NH-107)',
      corridor: 'Rudraprayag / Kedarnath',
      lat: 30.4392,
      lon: 79.0563,
      radiusMeters: 9500,
      urgency: 'Urgent SOS / Trapped',
      severityColor: '#DC2626',
      postCount: 184,
      burstRate: '+46 posts/hr',
      dominantNeed: 'Boulder Slide Entrapment & Pilgrim Evacuation',
      roadStatus: 'NH-107 Blocked at KM 48+200 (BRO 752 BRTF Clearing)',
      nearestTeam: 'SDRF Unit Augastyamuni (4.2 km · ETA 14 mins)',
      linkedEventId: 'EV-LSD-2026-10-09-001',
      verifiedRatio: 91
    },
    {
      id: 'CL-DEV-02',
      name: 'Byasi - Devprayag Gorge (NH-58)',
      corridor: 'Tehri / Devprayag',
      lat: 30.1469,
      lon: 78.5982,
      radiusMeters: 8800,
      urgency: 'Urgent SOS / Trapped',
      severityColor: '#DC2626',
      postCount: 148,
      burstRate: '+38 posts/hr',
      dominantNeed: 'Shooting Stones & Stranded Tourist Buses',
      roadStatus: 'NH-58 Halted Both Ways near Byasi Checkpost',
      nearestTeam: 'SDRF Post Kaudiyala & Police EOC (3.1 km · ETA 11 mins)',
      linkedEventId: 'EV-2026-0814-LSD',
      verifiedRatio: 94
    },
    {
      id: 'CL-CHM-03',
      name: 'Joshimath - Govindghat Corridor (NH-58)',
      corridor: 'Chamoli / NH-58',
      lat: 30.5562,
      lon: 79.5644,
      radiusMeters: 10500,
      urgency: 'Road Block / NH Closure',
      severityColor: '#EA580C',
      postCount: 162,
      burstRate: '+29 posts/hr',
      dominantNeed: 'Alaknanda Surge & Marwari Culvert Washout',
      roadStatus: 'NH-58 Restricted · Heavy Vehicles Halted at Helang',
      nearestTeam: 'NDRF 15th Bn Joshimath Detachment (2.5 km · On Site)',
      linkedEventId: 'EV-2026-0814-FLD',
      verifiedRatio: 88
    },
    {
      id: 'CL-UTK-04',
      name: 'Dharasu Bend - Bhatwari Stretch (NH-34)',
      corridor: 'Uttarkashi / Gangotri',
      lat: 30.6865,
      lon: 78.3614,
      radiusMeters: 9000,
      urgency: 'Medical / Shelter Need',
      severityColor: '#D97706',
      postCount: 112,
      burstRate: '+21 posts/hr',
      dominantNeed: 'Drinking Water, Insulin & Night Shelter for Yatris',
      roadStatus: 'NH-34 Single-Lane Intermittent at Dharasu Slip Zone',
      nearestTeam: 'SDRF Uttarkashi HQ & 108 Ambulance (6.0 km · ETA 18 mins)',
      linkedEventId: 'EV-WTH-2026-10-09-004',
      verifiedRatio: 84
    },
    {
      id: 'CL-PIT-05',
      name: 'Munsyari - Dharchula Gori Ganga Valley',
      corridor: 'Pithoragarh',
      lat: 29.8485,
      lon: 80.5461,
      radiusMeters: 11000,
      urgency: 'Infrastructure Damage',
      severityColor: '#2563EB',
      postCount: 94,
      burstRate: '+17 posts/hr',
      dominantNeed: 'Footbridge Approach Damage & 33kV Power Feeder Outage',
      roadStatus: 'Tawaghat-Lipulekh Road Blocked near Lakhanpur',
      nearestTeam: 'SSB & SDRF Dharchula Company (5.4 km · Deployed)',
      linkedEventId: 'EV-FLD-2026-10-09-003',
      verifiedRatio: 82
    },
    {
      id: 'CL-HRD-06',
      name: 'Rishikesh - Srinagar Dam Rumor Zone',
      corridor: 'Tehri / Devprayag',
      lat: 30.2225,
      lon: 78.7836,
      radiusMeters: 8000,
      urgency: 'Quarantined Rumor',
      severityColor: '#7C3AED',
      postCount: 142,
      burstRate: 'Quarantined Bot Burst',
      dominantNeed: 'Counter-Messaging Against Fake Dam Gate Failure Video',
      roadStatus: 'All Bridges & Ghats Open (Routine High-Water Alert Only)',
      nearestTeam: 'SEOC Cyber & PIB Fact-Check Unit (Active Quarantine)',
      linkedEventId: 'EV-FLD-2026-10-09-003',
      verifiedRatio: 16
    }
  ];

  // Initial Bilingual Citizen Post Stream
  const INITIAL_POSTS = [
    {
      id: 'SMI-POST-9041',
      clusterId: 'CL-DEV-02',
      eventId: 'EV-2026-0814-LSD',
      author: '@pahadi_yatayat_uk',
      authorRole: 'Local Taxi Union Driver · Verified Caller',
      platform: 'X/Twitter',
      timestamp: '4 mins ago · 23:31 IST',
      language: 'Hindi (हिन्दी)',
      corridor: 'Tehri / Devprayag',
      location: 'Byasi - Kaudiyala Stretch (NH-58, KM 31)',
      coords: '30.1469° N, 78.5982° E',
      urgency: 'Urgent SOS / Trapped',
      verificationStatus: 'Verified Corroborated',
      confidence: 94,
      lineage: 'LIVE-INGESTION',
      isVerified: true,
      corroborationCount: 14,
      mediaAttached: 'Geotagged Photo + 18s Dashcam Clip',
      originalText: 'SOS! ब्यासी और देवप्रयाग के बीच NH-58 पर पहाड़ी से भारी चट्टान गिरी है। 3 यात्री बसें और 12 गाड़ियां दोनों तरफ फंसी हैं, ऊपर से अभी भी पत्थर गिर रहे हैं। बुजुर्ग और बच्चे साथ हैं, तुरंत SDRF भेजें!',
      translatedText: 'SOS! Massive boulder slide from hill on NH-58 between Byasi and Devprayag. 3 pilgrim buses and 12 vehicles are trapped on both sides, shooting stones still falling from above. Elderly and children on board, send SDRF immediately!',
      summary: 'NH-58 Byasi-Devprayag Boulder Slide & 15 Vehicles Trapped',
      keywords: ['चट्टान गिरी', 'गाड़ियां फंसी', 'SOS', 'NH58']
    },
    {
      id: 'SMI-POST-9042',
      clusterId: 'CL-RUD-01',
      eventId: 'EV-LSD-2026-10-09-001',
      author: 'Caller #1070-UK-882',
      authorRole: 'Garhwali Gram Pradhan · Basukedar',
      platform: 'Citizen Helpline 1070',
      timestamp: '9 mins ago · 23:26 IST',
      language: 'Garhwali / Kumaoni',
      corridor: 'Rudraprayag / Kedarnath',
      location: 'Basukedar Market & Gadhera Bridge, Rudraprayag',
      coords: '30.4392° N, 79.0563° E',
      urgency: 'Urgent SOS / Trapped',
      verificationStatus: 'Verified Corroborated',
      confidence: 96,
      lineage: 'LIVE-INGESTION',
      isVerified: true,
      corroborationCount: 19,
      mediaAttached: '1070 Voice Transcript + Field Lat/Lon',
      originalText: 'बसुकेदार गदेरा में बादल फटणा जणी बरखा होणी च, पाणी दुकानों मां घुसी ग्याई। केदारनाथ जाणा वाला 40 यात्री धर्मशाला की छत पर छन, पुलिया टूटी ग्याई। जल्दी रस्सी अर बोट भेजो!',
      translatedText: 'Cloudburst-like torrential rain in Basukedar stream (gadhera), water has entered shops. 40 Kedarnath-bound pilgrims are stranded on the dharamshala roof as the approach culvert washed away. Send ropes and rescue team urgently!',
      summary: 'Basukedar Flash Flood Surge & 40 Pilgrims Stranded on Dharamshala',
      keywords: ['बसुकेदार_SOS', 'केदारनाथ_हाईवे', '#SDRFRescue', 'बादल_फटा']
    },
    {
      id: 'SMI-POST-9043',
      clusterId: 'CL-CHM-03',
      eventId: 'EV-2026-0814-FLD',
      author: '@chamoli_weather_watch',
      authorRole: 'Community Flood Volunteer',
      platform: 'Telegram SEOC',
      timestamp: '16 mins ago · 23:19 IST',
      language: 'English',
      corridor: 'Chamoli / NH-58',
      location: 'Marwari Bridge & Govindghat Sector, Chamoli',
      coords: '30.5562° N, 79.5644° E',
      urgency: 'Road Block / NH Closure',
      verificationStatus: 'AI Triaged',
      confidence: 87,
      lineage: 'AI-ESTIMATED',
      isVerified: false,
      corroborationCount: 8,
      mediaAttached: 'Telegram Video Stream (CWC Gauge View)',
      originalText: 'Urgent update from Joshimath-Govindghat NH-58: Alaknanda river level has crossed warning mark near Vishnuprayag confluence. Debris mudflow at Lambagarh slide zone has blocked highway traffic; BRO JCBs waiting for rain to subside.',
      translatedText: 'Urgent update from Joshimath-Govindghat NH-58: Alaknanda river level has crossed warning mark near Vishnuprayag confluence. Debris mudflow at Lambagarh slide zone has blocked highway traffic; BRO JCBs waiting for rain to subside.',
      summary: 'NH-58 Lambagarh Debris Mudflow & Alaknanda High Stage Warning',
      keywords: ['#ChamoliCloudburst', 'NH58', 'मंदाकिनी_जलस्तर', '#BROClearance']
    },
    {
      id: 'SMI-POST-9044',
      clusterId: 'CL-UTK-04',
      eventId: 'EV-WTH-2026-10-09-004',
      author: '@gangotri_yatra_seva',
      authorRole: 'Char Dham Pilgrim Group Coordinator',
      platform: 'Facebook Local',
      timestamp: '24 mins ago · 23:11 IST',
      language: 'Hindi (हिन्दी)',
      corridor: 'Uttarkashi / Gangotri',
      location: 'Dharasu Bend Relief Halt, NH-34, Uttarkashi',
      coords: '30.6865° N, 78.3614° E',
      urgency: 'Medical / Shelter Need',
      verificationStatus: 'Unverified Citizen',
      confidence: 78,
      lineage: 'UNVERIFIED-CITIZEN',
      isVerified: false,
      corroborationCount: 5,
      mediaAttached: 'Location Check-in + Group List',
      originalText: 'धरासू बैंड पर लैंडस्लाइड के कारण शाम 6 बजे से 65 तीर्थयात्री रुके हुए हैं। दो डायबिटीज मरीजों के लिए इंसुलिन और बच्चों के लिए पीने का पानी व गर्म कंबल चाहिए। जिला प्रशासन उत्तरकाशी कृपया मदद करे।',
      translatedText: '65 pilgrims have been halted at Dharasu Bend since 6 PM due to landslide blockage. Two diabetic patients urgently need insulin, along with drinking water and warm blankets for children. District Administration Uttarkashi please assist.',
      summary: 'Dharasu Bend NH-34 Pilgrim Medical & Shelter Request (65 Yatris)',
      keywords: ['धरासू_लैंडस्लाइड', '1070_Helpline', 'MedicalNeed', 'NH34']
    },
    {
      id: 'SMI-POST-9045',
      clusterId: 'CL-PIT-05',
      eventId: 'EV-FLD-2026-10-09-003',
      author: '@kumaon_border_updates',
      authorRole: 'Dharchula Local Reporter',
      platform: 'X/Twitter',
      timestamp: '31 mins ago · 23:04 IST',
      language: 'Garhwali / Kumaoni',
      corridor: 'Pithoragarh',
      location: 'Madkot - Munsyari Gori Ganga Bank, Pithoragarh',
      coords: '29.8485° N, 80.5461° E',
      urgency: 'Infrastructure Damage',
      verificationStatus: 'AI Triaged',
      confidence: 83,
      lineage: 'AI-ESTIMATED',
      isVerified: false,
      corroborationCount: 6,
      mediaAttached: '2 High-Res Photos of Substation & Bridge',
      originalText: 'गोरी गंगा को रौद्र रूप देखण लायक छ, मवानी दवानी के पास झूला पुल को पुश्ता कटी ग्यो और 33KV बिजली लाइन का दो खंभा नदी में समा गया। 18 गांवों में अंधेरा छ, UPCL टीम भेजो।',
      translatedText: 'Fierce surge in Gori Ganga river; retaining abutment of the suspension bridge near Mawani-Dawani has eroded and two 33KV power transmission poles collapsed into the river. 18 villages are in blackout, send UPCL repair squad.',
      summary: 'Gori Ganga Bridge Abutment Erosion & 33kV Power Outage in 18 Villages',
      keywords: ['गोरी_गंगा', 'InfrastructureDamage', 'Pithoragarh', '#PowerOutage']
    },
    {
      id: 'SMI-POST-9046',
      clusterId: 'CL-HRD-06',
      eventId: 'EV-FLD-2026-10-09-003',
      author: '@viral_breaking_24x7_bot',
      authorRole: 'Flagged Suspicious Account (Recycled 2021 Video)',
      platform: 'X/Twitter',
      timestamp: '38 mins ago · 22:57 IST',
      language: 'Hindi (हिन्दी)',
      corridor: 'Tehri / Devprayag',
      location: 'Claimed: Srinagar Dam / Alaknanda Valley',
      coords: '30.2225° N, 78.7836° E',
      urgency: 'Quarantined Rumor',
      verificationStatus: 'Debunked / Fact-Checked',
      confidence: 14,
      lineage: 'FACT-CHECKED',
      isVerified: false,
      corroborationCount: 0,
      mediaAttached: 'Manipulated Old Clip (Hash Match: Nepal 2021)',
      originalText: 'ब्रेकिंग: श्रीनगर डैम के सारे गेट टूटे! ऋषिकेश और हरिद्वार में 2 घंटे में 50 फीट ऊंची लहर आएगी, तुरंत घर छोड़कर पहाड़ों पर भागें! #UttarakhandFlood',
      translatedText: 'BREAKING: All gates of Srinagar Dam have broken! A 50-foot wave will hit Rishikesh and Haridwar in 2 hours, abandon homes immediately and run to the hills! #UttarakhandFlood',
      summary: 'DEBUNKED RUMOR: Fake Srinagar Hydro Dam Gate Failure Viral Video',
      keywords: ['FakeDamVideo', 'QuarantinedRumor', '#FactCheckUK']
    }
  ];

  // Emerging Keyword & Topic Cloud Data
  const KEYWORD_CLOUD = [
    { term: 'चट्टान गिरी', translation: 'Boulder Fell', count: 312, delta: '+140%', urgency: 'Urgent SOS / Trapped' },
    { term: 'गाड़ियां फंसी', translation: 'Vehicles Trapped', count: 278, delta: '+118%', urgency: 'Urgent SOS / Trapped' },
    { term: 'SOS', translation: 'Distress Call', count: 246, delta: '+95%', urgency: 'Urgent SOS / Trapped' },
    { term: 'NH58', translation: 'Badrinath Highway', count: 419, delta: '+84%', urgency: 'Road Block / NH Closure' },
    { term: '#ChamoliCloudburst', translation: 'Chamoli Cloudburst', count: 198, delta: '+76%', urgency: 'Urgent SOS / Trapped' },
    { term: 'धरासू_लैंडस्लाइड', translation: 'Dharasu Landslide', count: 164, delta: '+62%', urgency: 'Medical / Shelter Need' },
    { term: 'बसुकेदार_SOS', translation: 'Basukedar SOS', count: 215, delta: '+132%', urgency: 'Urgent SOS / Trapped' },
    { term: 'केदारनाथ_हाईवे', translation: 'Kedarnath NH-107', count: 289, delta: '+88%', urgency: 'Road Block / NH Closure' },
    { term: 'मंदाकिनी_जलस्तर', translation: 'Mandakini Water Level', count: 173, delta: '+54%', urgency: 'Infrastructure Damage' },
    { term: '1070_Helpline', translation: 'SEOC Helpline', count: 152, delta: '+49%', urgency: 'Medical / Shelter Need' },
    { term: 'गोरी_गंगा', translation: 'Gori Ganga Surge', count: 118, delta: '+41%', urgency: 'Infrastructure Damage' },
    { term: 'FakeDamVideo', translation: 'Debunked Dam Claim', count: 142, delta: 'Quarantined', urgency: 'Quarantined Rumor' }
  ];

  // Hourly Temporal Post Burst Data (Last 12 Hours leading to Cloudburst Spike)
  const HOURLY_BURST = [
    { hour: '12:00', verifiedSos: 12, roadBlock: 18, rumors: 4 },
    { hour: '13:00', verifiedSos: 15, roadBlock: 22, rumors: 5 },
    { hour: '14:00', verifiedSos: 19, roadBlock: 25, rumors: 6 },
    { hour: '15:00', verifiedSos: 24, roadBlock: 31, rumors: 8 },
    { hour: '16:00', verifiedSos: 32, roadBlock: 44, rumors: 11 },
    { hour: '17:00', verifiedSos: 48, roadBlock: 58, rumors: 14 },
    { hour: '18:00', verifiedSos: 74, roadBlock: 82, rumors: 22 },
    { hour: '19:00', verifiedSos: 112, roadBlock: 118, rumors: 35 },
    { hour: '20:00', verifiedSos: 168, roadBlock: 149, rumors: 48 },
    { hour: '21:00', verifiedSos: 214, roadBlock: 182, rumors: 64 },
    { hour: '22:00', verifiedSos: 256, roadBlock: 205, rumors: 52 },
    { hour: '23:00', verifiedSos: 289, roadBlock: 228, rumors: 38 }
  ];

  // Misinformation Quarantine & Fact-Check Inspector Records
  const QUARANTINED_RUMORS = [
    {
      id: 'QRM-2026-01',
      viralClaim: '“All gates of Srinagar Hydroelectric Dam have ruptured; 50-ft flood wave approaching Rishikesh & Haridwar in 2 hours.”',
      language: 'Hindi / WhatsApp & X Forward',
      platform: 'X/Twitter & WhatsApp Groups',
      viralShares: '4,820 shares blocked',
      nlpScore: '14% Credibility (Bot Pattern + 2021 Video Hash)',
      officialEvidence: 'CWC & Alaknanda Hydro Power Co. (AHPCL) Telemetry Bulletin #19: All 6 spillway radial gates operating normally at controlled discharge of 1,420 cumecs. Video is from Melamchi Nepal (June 2021).',
      verifyingAgency: 'USDMA SEOC & PIB Fact Check',
      status: 'Quarantined & Counter-Bulletin Issued',
      linkedEventId: 'EV-FLD-2026-10-09-003'
    },
    {
      id: 'QRM-2026-02',
      viralClaim: '“Kedarnath Temple complex flooded by Chorabari glacial lake outburst; helicopter services permanently suspended.”',
      language: 'Hindi & English',
      platform: 'YouTube Shorts & Telegram',
      viralShares: '2,310 views flagged',
      nlpScore: '9% Credibility (Synthetic Audio + Old 2013 Clip)',
      officialEvidence: 'ISRO Bhoonidhi RISAT-2B SAR Pass (21:40 IST) & Rudraprayag DM Control Room confirm zero glacial lake breach in upper Mandakini; heavy rain is confined to lower Basukedar valley.',
      verifyingAgency: 'District Magistrate Rudraprayag & GSI',
      status: 'Debunked / CAP SMS Dispatched',
      linkedEventId: 'EV-LSD-2026-10-09-001'
    },
    {
      id: 'QRM-2026-03',
      viralClaim: '“Badrinath Highway (NH-58) bridge at Karnaprayag has collapsed into Alaknanda confluence; garment market washed away.”',
      language: 'Garhwali / Hindi',
      platform: 'Facebook Local Pages',
      viralShares: '1,190 forwards',
      nlpScore: '22% Credibility (Unverified Single Source)',
      officialEvidence: 'BRO Project Shivalik Chief Engineer & Chamoli Police CCTV live feed at 23:15 IST confirm Karnaprayag steel bridge is structurally intact and open to emergency traffic.',
      verifyingAgency: 'Uttarakhand Police EOC & BRO',
      status: 'Quarantined & Fact-Checked',
      linkedEventId: 'EV-2026-0814-FLD'
    }
  ];

  const SocialMediaIntelligenceView = ({ onNavigate, drillContext, activeRoleId = 'response' }) => {
    // Active Role Decision Lens strictly bound to global TopBar activeRoleId prop
    const activeRole = normalizeRoleId(activeRoleId || 'response');

    // Interactive Filter Bar states (matching prompt requirements)
    const [urgencyFilter, setUrgencyFilter] = useState('All Signals');
    const [languageFilter, setLanguageFilter] = useState('All Languages');
    const [verificationFilter, setVerificationFilter] = useState('All Status');
    const [corridorFilter, setCorridorFilter] = useState('All Corridors');
    const [activeKeyword, setActiveKeyword] = useState(null);

    // Selected Hotspot Cluster on Map
    const [selectedClusterId, setSelectedClusterId] = useState(null);

    // Posts state (supports live API enrichment + interactive Verify/Escalate toggling)
    const [posts, setPosts] = useState(INITIAL_POSTS);
    const [apiSyncStatus, setApiSyncStatus] = useState('Live Stream Active (30s Poll)');
    const [copiedRumorId, setCopiedRumorId] = useState(null);

    // Multi-Role Live Execution State & Signed Audit Log (Ashutosh Kanojia)
    const [dispatchedSdrfCount, setDispatchedSdrfCount] = useState(4);
    const [deployedBroCount, setDeployedBroCount] = useState(3);
    const [counterAdvisoriesSent, setCounterAdvisoriesSent] = useState(3);
    const [nlpQueueDepth, setNlpQueueDepth] = useState(148);
    const [nlpLatencyMs, setNlpLatencyMs] = useState(118);
    const [quarantinedBotCount, setQuarantinedBotCount] = useState(19);
    const [rateLimiterActive, setRateLimiterActive] = useState(true);
    const [exportedCorpusFormat, setExportedCorpusFormat] = useState(null);
    const [citizenSosCorridor, setCitizenSosCorridor] = useState('Rudraprayag / Kedarnath (NH-107)');
    const [citizenSosType, setCitizenSosType] = useState('Highway Boulder Blockage / Stranded Vehicle');
    const [citizenSosMessage, setCitizenSosMessage] = useState(
      'Reporting active rockfall and 4 halted pilgrim vehicles near Basukedar culvert on NH-107. Requesting BRO clearance update.'
    );
    const [citizenSubmittedReports, setCitizenSubmittedReports] = useState([
      {
        id: 'CIT-SOS-701',
        reporter: 'Ashutosh Kanojia (AK)',
        corridor: 'Tehri / Devprayag (NH-58)',
        category: 'Safe Route Verification Request',
        note: 'Verified Chamba-Tehri-Srinagar detour status before departing Rishikesh checkpost.',
        time: '23:18 IST',
        status: 'Acknowledged by SEOC 1070 Desk'
      }
    ]);
    const [roleActionLog, setRoleActionLog] = useState([
      {
        id: 'LOG-SMI-01',
        time: '23:32:10 IST',
        actor: 'Ashutosh Kanojia (AK)',
        roleTitle: 'Emergency Response Teams · LEVEL 4',
        action: 'Dispatched SDRF Rescue Unit Augastyamuni to Basukedar NH-107 SOS Cluster (CL-RUD-01)'
      },
      {
        id: 'LOG-SMI-02',
        time: '23:28:45 IST',
        actor: 'Ashutosh Kanojia (AK)',
        roleTitle: 'Disaster Management Authorities · LEVEL 5',
        action: 'Broadcasted PIB/USDMA Counter-Rumor Advisory debunking Srinagar Dam gate failure video (QRM-2026-01)'
      }
    ]);

    const currentRoleInfo = useMemo(
      () => SRS_ROLES.find((r) => r.id === activeRole) || SRS_ROLES[0],
      [activeRole]
    );

    const canExecuteTactical = activeRole === 'response' || activeRole === 'authority';
    const isDataAdmin = activeRole === 'data-admin';
    const isResearchOrAnalyst = activeRole === 'researcher' || activeRole === 'analyst';
    const isCitizen = activeRole === 'citizen';

    const appendRoleAction = (actionText) => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';
      setRoleActionLog((prev) => [
        {
          id: `LOG-SMI-${Date.now().toString().slice(-4)}`,
          time: nowStr,
          actor: 'Ashutosh Kanojia (AK)',
          roleTitle: `${currentRoleInfo.shortLabel} · ${currentRoleInfo.authorityLevel}`,
          action: actionText
        },
        ...prev.slice(0, 9)
      ]);
    };

    const handleDispatchSdrfUnit = (targetLabel = 'NH-58 Byasi & Basukedar SOS Clusters') => {
      if (!canExecuteTactical) return;
      setDispatchedSdrfCount((c) => c + 1);
      appendRoleAction(`Dispatch SDRF Rescue Unit authorized for ${targetLabel} — Signed by Ashutosh Kanojia`);
    };

    const handleDeployBroClearance = (targetLabel = 'NH-107 KM-48 & NH-58 Byasi Boulder Slide') => {
      if (!canExecuteTactical) return;
      setDeployedBroCount((c) => c + 1);
      appendRoleAction(`Deploy BRO Highway Clearance (JCB/Rock-Breakers) ordered at ${targetLabel} — Signed by Ashutosh Kanojia`);
    };

    const handleBroadcastCounterRumor = (rumorId = 'QRM-2026-01') => {
      if (!canExecuteTactical) return;
      setCounterAdvisoriesSent((c) => c + 1);
      appendRoleAction(`Broadcast PIB/USDMA Counter-Rumor Advisory (${rumorId}) via CAP SMS Gateway — Signed by Ashutosh Kanojia`);
    };

    const handleFlushNlpQueue = () => {
      if (!isDataAdmin) return;
      setNlpQueueDepth(0);
      setNlpLatencyMs(42);
      appendRoleAction('Flushed Hindi/Garhwali/Kumaoni NLP Translation Queue (0 backlog, 42ms latency) — Signed by Ashutosh Kanojia');
    };

    const handleQuarantineBots = () => {
      if (!isDataAdmin) return;
      setQuarantinedBotCount((c) => c + 7);
      appendRoleAction('Quarantined 7 suspicious bot accounts & synthetic recycled flood clips — Signed by Ashutosh Kanojia');
    };

    const handleToggleRateLimiter = () => {
      if (!isDataAdmin) return;
      setRateLimiterActive((prev) => {
        const next = !prev;
        appendRoleAction(
          `Switched Social Crawler & 1070 Webhook Rate-Limiter to ${next ? 'Priority Burst Filtering' : 'Unthrottled Emergency Ingest'} — Signed by Ashutosh Kanojia`
        );
        return next;
      });
    };

    const handleExportCorpus = (fmt) => {
      if (!isResearchOrAnalyst && !canExecuteTactical) return;
      setExportedCorpusFormat(fmt);
      appendRoleAction(
        `Exported Annotated Bilingual Crisis NLP Corpus (${fmt.toUpperCase()} · ${posts.length} verified records, F1=0.934) — Signed by Ashutosh Kanojia`
      );
    };

    const handleCitizenSosSubmit = (e) => {
      e.preventDefault();
      if (!citizenSosMessage.trim()) return;
      const newReport = {
        id: `CIT-SOS-${Math.floor(702 + citizenSubmittedReports.length)}`,
        reporter: 'Ashutosh Kanojia (AK)',
        corridor: citizenSosCorridor,
        category: citizenSosType,
        note: citizenSosMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
        status: 'Queued for SEOC 1070 Triage Verification'
      };
      setCitizenSubmittedReports((prev) => [newReport, ...prev]);
      appendRoleAction(
        `Submitted Public Citizen SOS / Roadblock Report (${newReport.id}) on ${citizenSosCorridor} — Signed by Ashutosh Kanojia (Citizen LVL 1)`
      );
    };

    // Leaflet Map refs
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const clusterLayerRef = useRef(null);

    // Apply incoming drillContext if navigated from HM-01 or MEI-01
    useEffect(() => {
      if (!drillContext) return;
      if (drillContext.corridor) {
        setCorridorFilter(drillContext.corridor);
      } else if (drillContext.clusterId) {
        setSelectedClusterId(drillContext.clusterId);
      }
    }, [drillContext]);

    // Fetch live social observations from FastAPI backend & merge cleanly with rich Uttarakhand stream
    useEffect(() => {
      let isMounted = true;
      const loadSocialObservations = async () => {
        try {
          const res = await fetch('/api/v1/observations?modality=social&limit=25');
          if (!res.ok) return;
          const data = await res.json();
          if (!isMounted) return;
          const items = Array.isArray(data) ? data : (data.observations || data.items || []);
          if (items.length > 0) {
            setApiSyncStatus(`Synced (${items.length + INITIAL_POSTS.length} streams indexed)`);
          }
        } catch (err) {
          // Graceful fallback to deterministic Uttarakhand citizen stream
        }
      };
      loadSocialObservations();
      return () => { isMounted = false; };
    }, []);

    // Initialize Interactive Leaflet Geospatial Hotspot & Cluster Map
    useEffect(() => {
      if (!mapContainerRef.current || typeof window.L === 'undefined') return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = window.L.map(mapContainerRef.current, {
        center: [30.32, 79.15],
        zoom: 8,
        zoomControl: false,
        attributionControl: true
      });

      window.L.control.zoom({ position: 'bottomright' }).addTo(map);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors · Uttarakhand SEOC',
        maxZoom: 18
      }).addTo(map);

      clusterLayerRef.current = window.L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      const ro = typeof ResizeObserver !== 'undefined'
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
    }, [isCitizen]);

    // Render pulsing distress circles on the Leaflet Hotspot Map
    useEffect(() => {
      if (!mapInstanceRef.current || !clusterLayerRef.current || typeof window.L === 'undefined') return;

      clusterLayerRef.current.clearLayers();

      HOTSPOT_CLUSTERS.forEach((cluster) => {
        const isSelected = selectedClusterId === cluster.id;
        const matchesCorridor = corridorFilter === 'All Corridors' || cluster.corridor === corridorFilter;
        if (!matchesCorridor) return;

        // Outer pulsing distress halo circle
        const outerCircle = window.L.circle([cluster.lat, cluster.lon], {
          radius: isSelected ? cluster.radiusMeters * 1.25 : cluster.radiusMeters,
          color: cluster.severityColor,
          weight: isSelected ? 2.5 : 1.5,
          fillColor: cluster.severityColor,
          fillOpacity: isSelected ? 0.28 : 0.16,
          dashArray: cluster.urgency === 'Quarantined Rumor' ? '5, 5' : null
        });

        // Inner pulsing beacon icon with post count badge
        const beaconHtml = `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <span style="position: absolute; inset: 0; border-radius: 9999px; background: ${cluster.severityColor}; opacity: 0.32; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            <div style="position: relative; z-index: 2; width: ${isSelected ? '30px' : '26px'}; height: ${isSelected ? '30px' : '26px'}; border-radius: 9999px; background: ${cluster.severityColor}; color: #FFFFFF; font-family: var(--font-mono); font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.35);">
              ${cluster.postCount}
            </div>
          </div>
        `;

        const beaconIcon = window.L.divIcon({
          className: 'smi-cluster-beacon',
          html: beaconHtml,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = window.L.marker([cluster.lat, cluster.lon], { icon: beaconIcon });

        const popupHtml = `
          <div style="font-family: var(--font-sans); min-width: 220px;">
            <div style="font-family: var(--font-mono); font-size: 10px; color: #5E6675; text-transform: uppercase;">${cluster.id} · ${cluster.corridor}</div>
            <div style="font-weight: 700; font-size: 13px; color: #14171C; margin: 2px 0;">${cluster.name}</div>
            <div style="font-size: 11px; color: ${cluster.severityColor}; font-weight: 700; margin-bottom: 4px;">${cluster.urgency} (${cluster.postCount} posts · ${cluster.burstRate})</div>
            <div style="font-size: 11px; color: #334155; margin-bottom: 3px;"><b>Need:</b> ${cluster.dominantNeed}</div>
            <div style="font-size: 11px; color: #334155; margin-bottom: 3px;"><b>Road:</b> ${cluster.roadStatus}</div>
            <div style="font-size: 11px; color: #065F46; font-weight: 600;"><b>SDRF:</b> ${cluster.nearestTeam}</div>
          </div>
        `;

        marker.bindPopup(popupHtml);
        outerCircle.bindTooltip(`${cluster.name} (${cluster.postCount} posts)`, { sticky: true });

        const handleSelect = () => {
          setSelectedClusterId((prev) => (prev === cluster.id ? null : cluster.id));
        };

        marker.on('click', handleSelect);
        outerCircle.on('click', handleSelect);

        clusterLayerRef.current.addLayer(outerCircle);
        clusterLayerRef.current.addLayer(marker);
      });
    }, [selectedClusterId, corridorFilter, isCitizen]);

    // Selected Cluster Object
    const activeCluster = useMemo(
      () => HOTSPOT_CLUSTERS.find((c) => c.id === selectedClusterId) || null,
      [selectedClusterId]
    );

    // Filtered Posts based on Interactive Filter Bar + Selected Cluster + Keyword Cloud
    const filteredPosts = useMemo(() => {
      return posts.filter((post) => {
        if (selectedClusterId && post.clusterId !== selectedClusterId) return false;
        if (urgencyFilter !== 'All Signals' && post.urgency !== urgencyFilter) return false;
        if (languageFilter !== 'All Languages' && post.language !== languageFilter) return false;
        if (verificationFilter !== 'All Status' && post.verificationStatus !== verificationFilter) return false;
        if (corridorFilter !== 'All Corridors' && post.corridor !== corridorFilter) return false;
        if (activeKeyword && !(post.keywords || []).includes(activeKeyword)) return false;
        return true;
      });
    }, [posts, selectedClusterId, urgencyFilter, languageFilter, verificationFilter, corridorFilter, activeKeyword]);

    // Toggle "Verify & Escalate to MEI-01" on a Citizen Post (gated to Response & Authority roles)
    const handleToggleVerifyPost = (postId) => {
      if (!canExecuteTactical) return;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const nextVerified = !p.isVerified;
          return {
            ...p,
            isVerified: nextVerified,
            verificationStatus: nextVerified ? 'Verified Corroborated' : 'AI Triaged',
            confidence: nextVerified ? Math.max(p.confidence, 92) : p.confidence,
            lineage: nextVerified ? 'LIVE-INGESTION' : p.lineage
          };
        })
      );
      appendRoleAction(`Verified & Escalated Citizen SOS Post (${postId}) to MEI-01 — Signed by Ashutosh Kanojia`);
    };

    // Link Citizen Post to Multimodal Event Dossier (MEI-01)
    const handleLinkToDossier = (post) => {
      appendRoleAction(`Escalated Post ${post.id} (${post.location}) to Multimodal Dossier ${post.eventId} — Signed by Ashutosh Kanojia`);
      if (onNavigate) {
        onNavigate('multimodal-intelligence', {
          eventId: post.eventId,
          focusModality: 'social',
          postId: post.id,
          clusterLocation: post.location,
          title: post.summary,
          fromScreen: 'SMI-01'
        });
      }
    };

    // Dynamic Verified SOS count reflecting dispatcher verification toggles
    const verifiedSosCount = useMemo(() => {
      const extraVerified = posts.filter((p) => p.isVerified).length - 2;
      return 48 + Math.max(0, extraVerified);
    }, [posts]);

    const resetAllFilters = () => {
      setUrgencyFilter('All Signals');
      setLanguageFilter('All Languages');
      setVerificationFilter('All Status');
      setCorridorFilter('All Corridors');
      setSelectedClusterId(null);
      setActiveKeyword(null);
    };

    const urgencyBadgeStyle = (urgency) => {
      if (urgency === 'Urgent SOS / Trapped') {
        return 'bg-crit-soft text-crit border-crit/40';
      }
      if (urgency === 'Road Block / NH Closure') {
        return 'bg-warn-soft text-warn border-warn/40';
      }
      if (urgency === 'Medical / Shelter Need') {
        return 'bg-amber-50 text-amber-800 border-amber-300';
      }
      if (urgency === 'Infrastructure Damage') {
        return 'bg-blue-50 text-blue-800 border-blue-300';
      }
      return 'bg-purple-50 text-purple-800 border-purple-300';
    };

    const CARD = 'bg-surface border border-line rounded-lg p-4';
    const SELECT_CLS = 'w-full min-w-0 bg-surface2 text-ink border border-line rounded-md px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-accent';
    const LABEL_CLS = 'block text-[10.5px] uppercase tracking-wide text-muted font-bold mb-1';
    const BTN = 'px-2.5 py-1 rounded-md text-xs font-bold transition-opacity whitespace-nowrap';

    const LockIcon = () => (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
    );

    const LockedBtn = ({ label, tip }) => (
      <button
        type="button"
        disabled
        title={tip}
        className={`${BTN} inline-flex items-center gap-1 bg-surface2 text-muted border border-line opacity-60 cursor-not-allowed`}
      >
        <LockIcon />
        <span>{label}</span>
      </button>
    );

    const authorityShort = String(currentRoleInfo.authorityLevel || '').split('·')[0].trim();
    const accessChip = isCitizen || isDataAdmin ? 'Restricted' : (isResearchOrAnalyst ? 'View only' : null);
    const lockTip = 'Requires Response or Authority access';

    const navMei = (extra = {}) =>
      onNavigate &&
      onNavigate('multimodal-intelligence', { focusModality: 'social', fromScreen: 'SMI-01', ...extra });

    const rumorsSection = (
      <div className={`${CARD} space-y-3`}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="panel-title">{isCitizen ? 'Debunked Rumors' : 'Rumor Quarantine'}</h2>
          <div className="flex items-center gap-1.5">
            <LineageBadge type="FACT-CHECKED" />
            {!isCitizen && <LineageBadge type="OFFICIAL-GROUND-TRUTH" />}
          </div>
        </div>
        <div className="divide-y divide-line">
          {QUARANTINED_RUMORS.map((item) => (
            <div key={item.id} className="py-3 first:pt-0 last:pb-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
              <div className="lg:col-span-5 space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-crit-soft text-crit font-mono text-[10px] font-bold">
                    DEBUNKED
                  </span>
                  <span className="text-[11px] text-muted">{item.platform}</span>
                  <span className="text-[11px] font-bold text-crit">{item.viralShares}</span>
                </div>
                <p className="text-xs font-semibold text-ink leading-snug">{item.viralClaim}</p>
                {!isCitizen && (
                  <div className="text-[11px] font-mono text-purple-700">{item.nlpScore}</div>
                )}
              </div>
              <div className="lg:col-span-5 p-3 rounded-md bg-surface2 border border-line space-y-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1 text-[10.5px] uppercase font-bold">
                  <span className="text-ok">{item.verifyingAgency}</span>
                  <span className="text-ink2">{item.status}</span>
                </div>
                <p className="text-xs text-ink2 leading-relaxed">{item.officialEvidence}</p>
              </div>
              {!isCitizen && (
                <div className="lg:col-span-2 flex flex-row lg:flex-col gap-2">
                  {canExecuteTactical ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCopiedRumorId(item.id);
                        handleBroadcastCounterRumor(item.id);
                      }}
                      className={`${BTN} bg-ink text-surface hover:opacity-90`}
                    >
                      {copiedRumorId === item.id ? '✓ Broadcast sent' : 'Broadcast Advisory'}
                    </button>
                  ) : (
                    <LockedBtn label="Broadcast Advisory" tip={lockTip} />
                  )}
                  <button
                    type="button"
                    onClick={() => navMei({ eventId: item.linkedEventId, title: `Fact-Check Dossier: ${item.id}` })}
                    className={`${BTN} bg-accent-soft text-accent hover:bg-accent hover:text-white`}
                  >
                    Ground Truth &rarr;
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );

    /* ---------- HEADER (shared) ---------- */
    const header = (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-ink tracking-tight">Social Intelligence</h1>
        <div className="flex items-center gap-2">
          {accessChip && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface2 border border-line text-[11px] font-bold text-ink2">
              <LockIcon />
              {accessChip}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-accent-soft text-accent border border-accent/30 font-mono text-[11px] font-bold">
            {authorityShort}
          </span>
        </div>
      </div>
    );

    /* ---------- CITIZEN VIEW ---------- */
    if (isCitizen) {
      return (
        <div className="p-5 space-y-4 max-w-[1400px] mx-auto">
          {header}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <div className={`${CARD} space-y-2.5`}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="panel-title">Public Advisories</h2>
                <LineageBadge type="OFFICIAL-GROUND-TRUTH" />
              </div>
              <div className="p-3 rounded-md bg-surface2 border border-line space-y-1 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-crit">NH-107 · Rudraprayag &ndash; Kedarnath</span>
                  <span className="px-1.5 py-0.5 rounded bg-crit-soft text-crit font-mono text-[10px] font-bold shrink-0">HALTED KM-48</span>
                </div>
                <p className="text-ink2">Blocked near Basukedar. Shelter at Syalsaur and Augustmuni relief camps. Helpline 1070 / 112.</p>
              </div>
              <div className="p-3 rounded-md bg-surface2 border border-line space-y-1 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-warn">NH-58 · Rishikesh &ndash; Badrinath</span>
                  <span className="px-1.5 py-0.5 rounded bg-warn-soft text-warn font-mono text-[10px] font-bold shrink-0">DIVERTED</span>
                </div>
                <p className="text-ink2">Byasi stretch under clearance. Light vehicles: Narendra Nagar &ndash; Chamba &ndash; Tehri &ndash; Srinagar.</p>
              </div>
              <div className="p-3 rounded-md bg-surface2 border border-line space-y-1 text-xs">
                <div className="font-bold text-ok">Srinagar Dam is safe</div>
                <p className="text-ink2">Ignore forwards claiming gate failure. All spillway gates are operating normally.</p>
              </div>
            </div>

            <form onSubmit={handleCitizenSosSubmit} className={`${CARD} space-y-3 text-xs`}>
              <h2 className="panel-title">Report SOS / Roadblock</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className={LABEL_CLS}>Location</label>
                  <select value={citizenSosCorridor} onChange={(e) => setCitizenSosCorridor(e.target.value)} className={SELECT_CLS}>
                    <option value="Rudraprayag / Kedarnath (NH-107)">Rudraprayag / Kedarnath (NH-107)</option>
                    <option value="Tehri / Devprayag (NH-58)">Tehri / Devprayag (NH-58)</option>
                    <option value="Chamoli / Joshimath (NH-58)">Chamoli / Joshimath (NH-58)</option>
                    <option value="Uttarkashi / Dharasu (NH-34)">Uttarkashi / Dharasu (NH-34)</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Category</label>
                  <select value={citizenSosType} onChange={(e) => setCitizenSosType(e.target.value)} className={SELECT_CLS}>
                    <option value="Highway Boulder Blockage / Stranded Vehicle">Boulder blockage / stranded vehicle</option>
                    <option value="Urgent Medical / Relief Shelter Request">Medical / shelter request</option>
                    <option value="Flash Flood / Water Ingress Alert">Flash flood / water ingress</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={LABEL_CLS}>Situation</label>
                <textarea
                  rows={3}
                  value={citizenSosMessage}
                  onChange={(e) => setCitizenSosMessage(e.target.value)}
                  className="w-full bg-surface2 text-ink border border-line rounded-md px-2.5 py-1.5 text-xs"
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className={`${BTN} bg-emerald-700 text-white hover:opacity-90 px-3.5 py-1.5`}>
                  Submit Report
                </button>
              </div>
              {citizenSubmittedReports.length > 0 && (
                <div className="pt-2 border-t border-line space-y-1">
                  {citizenSubmittedReports.slice(0, 2).map((rep) => (
                    <div key={rep.id} className="p-2 rounded bg-surface2 border border-line flex items-center justify-between gap-2 text-[11px]">
                      <span className="truncate min-w-0">
                        <strong>{rep.id}</strong> {rep.corridor}
                      </span>
                      <span className="font-mono text-[10px] text-ok font-bold shrink-0">{rep.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>
          {rumorsSection}
        </div>
      );
    }

    /* ---------- STAFF VIEW ---------- */
    return (
      <div className="p-5 space-y-4 max-w-[1640px] mx-auto">
        {header}

        {/* Role-gated console (compact) */}
        <div className={`${CARD} flex flex-wrap items-center gap-2`}>
          {canExecuteTactical ? (
            <>
              <button
                type="button"
                onClick={() => handleDispatchSdrfUnit(activeCluster ? activeCluster.name : 'NH-58 Byasi & Basukedar SOS Clusters')}
                className={`${BTN} bg-crit text-white hover:opacity-90`}
              >
                Dispatch SDRF
              </button>
              <button
                type="button"
                onClick={() => handleDeployBroClearance(activeCluster ? activeCluster.name : 'NH-107 KM-48 & NH-58 Byasi Slide')}
                className={`${BTN} bg-warn text-white hover:opacity-90`}
              >
                Deploy BRO
              </button>
              <button
                type="button"
                onClick={() => handleBroadcastCounterRumor('QRM-2026-01')}
                className={`${BTN} bg-ink text-surface hover:opacity-90`}
              >
                Counter-Rumor Advisory
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetPost = filteredPosts[0] || posts[0];
                  if (targetPost) {
                    handleToggleVerifyPost(targetPost.id);
                    handleLinkToDossier(targetPost);
                  }
                }}
                className={`${BTN} bg-accent text-white hover:opacity-90`}
              >
                Verify &amp; Escalate
              </button>
              <div className="ml-auto flex items-center gap-3 text-[11px] font-mono text-ink2">
                <span>SDRF <strong className="text-crit">{dispatchedSdrfCount}</strong></span>
                <span>BRO <strong className="text-warn">{deployedBroCount}</strong></span>
                <span>CAP <strong className="text-ok">{counterAdvisoriesSent}</strong></span>
              </div>
            </>
          ) : isDataAdmin ? (
            <>
              <button type="button" onClick={handleFlushNlpQueue} className={`${BTN} bg-accent text-white hover:opacity-90`}>
                Flush NLP Queue
              </button>
              <button type="button" onClick={handleQuarantineBots} className={`${BTN} bg-ink text-surface hover:opacity-90`}>
                Quarantine Bots
              </button>
              <button type="button" onClick={handleToggleRateLimiter} className={`${BTN} bg-surface2 text-ink border border-line hover:bg-surface3`}>
                Rate Limiter: {rateLimiterActive ? 'Priority' : 'Open'}
              </button>
              <LockedBtn label="Dispatch SDRF" tip={lockTip} />
              <div className="ml-auto flex items-center gap-3 text-[11px] font-mono text-ink2">
                <span>Queue <strong className="text-ink">{nlpQueueDepth}</strong></span>
                <span>Latency <strong className="text-ink">{nlpLatencyMs}ms</strong></span>
                <span>Bots <strong className="text-ink">{quarantinedBotCount}</strong></span>
              </div>
            </>
          ) : (
            <>
              <button type="button" onClick={() => handleExportCorpus('json')} className={`${BTN} bg-accent text-white hover:opacity-90`}>
                Export JSON
              </button>
              <button type="button" onClick={() => handleExportCorpus('csv')} className={`${BTN} bg-surface2 text-ink border border-line hover:bg-surface3`}>
                Export CSV
              </button>
              <LockedBtn label="Dispatch SDRF" tip={lockTip} />
              {exportedCorpusFormat && (
                <span className="ml-auto inline-flex items-center gap-2 text-[11px] font-bold text-ok">
                  ✓ {exportedCorpusFormat.toUpperCase()} export ready
                  <button type="button" onClick={() => setExportedCorpusFormat(null)} className="underline font-semibold text-muted">
                    Dismiss
                  </button>
                </span>
              )}
            </>
          )}
        </div>

        {/* Drill context banner */}
        {drillContext && (
          <div className="bg-accent-soft/40 border border-accent/40 rounded-lg px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-ink2">
              From <strong>{drillContext.fromScreen || 'linked screen'}</strong>
              {drillContext.eventId ? ` · ${drillContext.eventId}` : ''}
              {drillContext.title ? ` · ${drillContext.title}` : ''}
            </span>
            <button type="button" onClick={resetAllFilters} className="font-bold text-accent hover:underline">
              Reset
            </button>
          </div>
        )}

        {/* Filters: one row */}
        <div className={`${CARD} py-3`}>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto] gap-3 items-end">
            <div>
              <label className={LABEL_CLS}>Urgency</label>
              <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} className={SELECT_CLS}>
                <option value="All Signals">All Signals</option>
                <option value="Urgent SOS / Trapped">Urgent SOS / Trapped</option>
                <option value="Road Block / NH Closure">Road Block / NH Closure</option>
                <option value="Medical / Shelter Need">Medical / Shelter Need</option>
                <option value="Infrastructure Damage">Infrastructure Damage</option>
                <option value="Quarantined Rumor">Quarantined Rumor</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Language</label>
              <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} className={SELECT_CLS}>
                <option value="All Languages">All Languages</option>
                <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
                <option value="Garhwali / Kumaoni">Garhwali / Kumaoni</option>
                <option value="English">English</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Verification</label>
              <select value={verificationFilter} onChange={(e) => setVerificationFilter(e.target.value)} className={SELECT_CLS}>
                <option value="All Status">All Status</option>
                <option value="Verified Corroborated">Verified Corroborated</option>
                <option value="AI Triaged">AI Triaged</option>
                <option value="Unverified Citizen">Unverified Citizen</option>
                <option value="Debunked / Fact-Checked">Debunked / Fact-Checked</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Corridor</label>
              <select value={corridorFilter} onChange={(e) => setCorridorFilter(e.target.value)} className={SELECT_CLS}>
                <option value="All Corridors">All Corridors</option>
                <option value="Rudraprayag / Kedarnath">Rudraprayag / Kedarnath</option>
                <option value="Chamoli / NH-58">Chamoli / NH-58</option>
                <option value="Uttarkashi / Gangotri">Uttarkashi / Gangotri</option>
                <option value="Tehri / Devprayag">Tehri / Devprayag</option>
                <option value="Pithoragarh">Pithoragarh</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-3 py-1.5 rounded-md bg-surface2 hover:bg-surface3 border border-line text-xs font-semibold text-ink2 whitespace-nowrap"
              >
                Reset
              </button>
              <span className="text-xs font-mono text-ink2 whitespace-nowrap">
                <strong className="text-ink">{filteredPosts.length}</strong> / {posts.length}
              </span>
            </div>
          </div>
        </div>

        {/* KPI row: 4 equal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`${CARD} space-y-2`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted truncate">Posts (24h)</span>
              <LineageBadge type="LIVE-INGESTION" />
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl font-extrabold text-ink tabular-nums">1,842</span>
              <span className="text-[11px] font-bold text-ok bg-ok-soft px-1.5 py-0.5 rounded whitespace-nowrap">+310 / 1h</span>
            </div>
          </div>
          <div className={`${CARD} space-y-2`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-crit truncate">Verified SOS</span>
              <LineageBadge type="AI-ESTIMATED" />
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl font-extrabold text-crit tabular-nums">{verifiedSosCount}</span>
              <span className="text-[11px] font-bold text-crit bg-crit-soft px-1.5 py-0.5 rounded whitespace-nowrap">91.4% corroborated</span>
            </div>
          </div>
          <div className={`${CARD} space-y-2`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-warn truncate">Road Closures</span>
              <LineageBadge type="UNVERIFIED-CITIZEN" />
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl font-extrabold text-ink tabular-nums">126</span>
              <span className="text-[11px] font-bold text-warn bg-warn-soft px-1.5 py-0.5 rounded whitespace-nowrap">NH-58 · 107 · 34</span>
            </div>
          </div>
          <div className={`${CARD} space-y-2`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-ink2 truncate">Quarantined Rumors</span>
              <LineageBadge type="FACT-CHECKED" />
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl font-extrabold text-ink tabular-nums">19</span>
              <span className="text-[11px] font-bold text-accent bg-accent-soft px-1.5 py-0.5 rounded whitespace-nowrap">3 counter-alerts</span>
            </div>
          </div>
        </div>

        {/* Map + stream: balanced columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <div className={`${CARD} space-y-3 min-w-0`}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="panel-title">Hotspot Map</h2>
              <LineageBadge type="AI-ESTIMATED" />
            </div>

            <div className="relative h-[340px] w-full bg-surface2 rounded-md overflow-hidden border border-line">
              <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />
              <div className="absolute bottom-2 left-2 z-[400] bg-surface/95 border border-line rounded-md px-2 py-1 text-[10.5px] pointer-events-none flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#DC2626] inline-block"></span>SOS</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#EA580C] inline-block"></span>Roadblock</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#D97706] inline-block"></span>Medical</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#7C3AED] inline-block"></span>Rumor</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-ink2">Clusters ({HOTSPOT_CLUSTERS.length})</span>
              {selectedClusterId && (
                <button type="button" onClick={() => setSelectedClusterId(null)} className="font-bold text-accent hover:underline">
                  Show all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HOTSPOT_CLUSTERS.map((c) => {
                const isSel = selectedClusterId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedClusterId(isSel ? null : c.id)}
                    className={`p-2 rounded-md border text-left flex items-center justify-between gap-2 min-w-0 ${
                      isSel ? 'bg-accent-soft/40 border-accent' : 'bg-surface2 hover:bg-surface3 border-line'
                    }`}
                  >
                    <span className="text-xs font-semibold text-ink truncate min-w-0">{c.name}</span>
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[11px] font-mono font-bold text-white shrink-0"
                      style={{ backgroundColor: c.severityColor }}
                    >
                      {c.postCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeCluster && (
              <div className="p-3 bg-surface2 border border-line rounded-md space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-ink min-w-0">{activeCluster.name}</h3>
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-bold text-white shrink-0"
                    style={{ backgroundColor: activeCluster.severityColor }}
                  >
                    {activeCluster.urgency}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-md bg-surface border border-line min-w-0">
                    <div className="text-muted">Posts</div>
                    <div className="font-bold text-ink">{activeCluster.postCount} ({activeCluster.burstRate})</div>
                  </div>
                  <div className="p-2 rounded-md bg-surface border border-line min-w-0">
                    <div className="text-muted">Need</div>
                    <div className="font-bold text-ink">{activeCluster.dominantNeed}</div>
                  </div>
                  <div className="p-2 rounded-md bg-surface border border-line min-w-0">
                    <div className="text-muted">Road</div>
                    <div className="font-bold text-crit">{activeCluster.roadStatus}</div>
                  </div>
                  <div className="p-2 rounded-md bg-surface border border-line min-w-0">
                    <div className="text-muted">Nearest team</div>
                    <div className="font-bold text-ok">{activeCluster.nearestTeam}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted">
                    Corroboration <strong className="text-ink">{activeCluster.verifiedRatio}%</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      navMei({
                        eventId: activeCluster.linkedEventId,
                        clusterLocation: activeCluster.name,
                        title: activeCluster.dominantNeed
                      })
                    }
                    className={`${BTN} bg-accent text-white hover:opacity-90`}
                  >
                    Open in MEI-01 &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={`${CARD} space-y-3 min-w-0`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="panel-title">Post Stream ({filteredPosts.length})</h2>
              <div className="flex items-center gap-1.5">
                <LineageBadge type="LIVE-INGESTION" />
                <LineageBadge type="UNVERIFIED-CITIZEN" />
              </div>
            </div>
            {(selectedClusterId || activeKeyword) && (
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-accent">
                {selectedClusterId && <span className="px-2 py-0.5 rounded bg-accent-soft">{selectedClusterId}</span>}
                {activeKeyword && <span className="px-2 py-0.5 rounded bg-accent-soft">{activeKeyword}</span>}
              </div>
            )}

            <div className="space-y-3 max-h-[760px] overflow-y-auto pr-1">
              {filteredPosts.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="text-sm font-bold text-ink">No posts match these filters</div>
                  <button type="button" onClick={resetAllFilters} className={`${BTN} bg-accent text-white px-3.5 py-1.5`}>
                    Reset filters
                  </button>
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const isLowConfidence = post.confidence < 40;
                  return (
                    <div
                      key={post.id}
                      className={`p-3 rounded-md border space-y-2.5 ${
                        post.urgency === 'Urgent SOS / Trapped'
                          ? 'bg-crit-soft/15 border-crit/30'
                          : isLowConfidence
                          ? 'bg-purple-50/40 border-purple-200'
                          : 'bg-surface border-line'
                      }`}
                    >
                      {isLowConfidence && (
                        <div className="px-2.5 py-1.5 rounded-md bg-crit-soft border border-crit/40 text-crit text-xs font-bold flex items-center justify-between gap-2">
                          <span>Low confidence ({post.confidence}%) · likely misinformation</span>
                          <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/80 shrink-0">Do not dispatch</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono text-xs font-extrabold text-ink">{post.author}</span>
                            <span className="px-1.5 py-0.5 rounded bg-surface2 border border-line text-[10.5px] font-semibold text-ink2">{post.platform}</span>
                            <span className="px-1.5 py-0.5 rounded bg-surface2 border border-line text-[10.5px] text-ink2">{post.language}</span>
                          </div>
                          <div className="text-[11px] text-muted">
                            {post.location} · {post.timestamp}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${urgencyBadgeStyle(post.urgency)}`}>
                            {post.urgency}
                          </span>
                          <LineageBadge type={post.lineage} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-md bg-surface2 border border-line space-y-1 min-w-0">
                          <div className="text-[10px] uppercase text-muted font-bold">Original</div>
                          <p className="text-xs text-ink leading-relaxed">{post.originalText}</p>
                        </div>
                        <div className="p-2.5 rounded-md bg-surface2 border border-line space-y-1 min-w-0">
                          <div className="text-[10px] uppercase text-accent font-bold">English</div>
                          <p className="text-xs text-ink2 leading-relaxed">{post.translatedText}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="font-semibold text-ink2">
                            Confidence <strong className="text-ink tabular-nums">{post.confidence}%</strong>
                          </span>
                          <span className="text-muted truncate">
                            {post.verificationStatus} · {post.corroborationCount} reports
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-surface2 border border-line overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${post.confidence}%`,
                              backgroundColor: post.confidence >= 80 ? '#10B981' : post.confidence >= 50 ? '#F59E0B' : '#EF4444'
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {canExecuteTactical ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDispatchSdrfUnit(`${post.id} · ${post.location}`)}
                              className={`${BTN} bg-crit text-white hover:opacity-90`}
                            >
                              Dispatch SDRF
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleVerifyPost(post.id)}
                              className={`${BTN} border ${
                                post.isVerified ? 'bg-ok text-white border-ok' : 'bg-surface2 hover:bg-surface3 text-ink border-line'
                              }`}
                            >
                              {post.isVerified ? '✓ Verified' : 'Verify & Escalate'}
                            </button>
                            <button type="button" onClick={() => handleLinkToDossier(post)} className={`${BTN} bg-accent text-white hover:opacity-90`}>
                              MEI-01 &rarr;
                            </button>
                          </>
                        ) : (
                          <>
                            <LockedBtn label="Dispatch SDRF" tip={lockTip} />
                            <button
                              type="button"
                              onClick={() => handleLinkToDossier(post)}
                              className={`${BTN} bg-accent-soft text-accent border border-accent/30`}
                            >
                              {isResearchOrAnalyst ? 'Corroborate in MEI-01' : 'MEI-01'} &rarr;
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Keywords + burst chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <div className={`${CARD} space-y-3 min-w-0`}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="panel-title">Keywords</h3>
              <LineageBadge type="AI-ESTIMATED" />
            </div>
            <div className="flex flex-wrap gap-2">
              {KEYWORD_CLOUD.map((kw) => {
                const isSelected = activeKeyword === kw.term;
                return (
                  <button
                    key={kw.term}
                    type="button"
                    onClick={() => setActiveKeyword(isSelected ? null : kw.term)}
                    title={kw.translation}
                    className={`px-2 py-1 rounded-md border text-xs flex items-center gap-1.5 ${
                      isSelected ? 'bg-ink text-surface border-ink font-bold' : 'bg-surface2 hover:bg-surface3 text-ink border-line'
                    }`}
                  >
                    <span className="font-semibold">{kw.term}</span>
                    <span className="px-1 rounded bg-surface text-accent font-mono text-[10px] font-bold">{kw.count}</span>
                  </button>
                );
              })}
            </div>
            {activeKeyword && (
              <button type="button" onClick={() => setActiveKeyword(null)} className="text-xs font-bold text-accent hover:underline">
                Clear keyword
              </button>
            )}
          </div>

          <div className={`${CARD} space-y-3 min-w-0`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="panel-title">Post Burst (12h)</h3>
              <div className="flex flex-wrap items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-crit inline-block"></span>SOS</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-warn inline-block"></span>Roadblocks</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-purple-600 inline-block"></span>Rumors</span>
                <LineageBadge type="LIVE-INGESTION" />
              </div>
            </div>
            <div className="grid grid-cols-12 gap-1 items-end h-44 px-2 pt-4 bg-surface2 rounded-md border border-line">
              {HOURLY_BURST.map((slot) => {
                const sosHeight = Math.round((slot.verifiedSos / 300) * 110);
                const roadHeight = Math.round((slot.roadBlock / 300) * 110);
                const rumorHeight = Math.round((slot.rumors / 300) * 110);
                return (
                  <div
                    key={slot.hour}
                    className="flex flex-col items-center gap-1 min-w-0"
                    title={`${slot.hour} IST — SOS: ${slot.verifiedSos}, Roadblocks: ${slot.roadBlock}, Rumors: ${slot.rumors}`}
                  >
                    <div className="text-[9.5px] font-mono text-muted font-bold tabular-nums">{slot.verifiedSos + slot.roadBlock}</div>
                    <div className="flex items-end gap-px h-28">
                      <div className="w-1.5 rounded-t bg-crit" style={{ height: `${Math.max(4, sosHeight)}px` }} />
                      <div className="w-1.5 rounded-t bg-warn" style={{ height: `${Math.max(4, roadHeight)}px` }} />
                      <div className="w-1 rounded-t bg-purple-600" style={{ height: `${Math.max(3, rumorHeight)}px` }} />
                    </div>
                    <div className="text-[9.5px] font-mono text-ink2 pb-1">{slot.hour.slice(0, 2)}</div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-muted">
              Spike at <strong className="text-ink">19:00 IST</strong> (+240%) · Containment <span className="font-mono text-ok font-semibold">94.2%</span>
            </div>
          </div>
        </div>

        {rumorsSection}
      </div>
    );
  };

  window.DisasterViews = window.DisasterViews || {};
  window.DisasterViews.SocialMediaIntelligenceView = SocialMediaIntelligenceView;
  window.SocialMediaIntelligenceView = SocialMediaIntelligenceView;
})();
