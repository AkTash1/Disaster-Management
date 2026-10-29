// Disaster Intelligence Platform — View 3: Unified Events (Master-Detail Command Workbench)
// Light Operational Theme: 6-Cell KPI Strip, High-Density Master List, Full 7-Tab Detail Inspector

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { KpiCard, MapView, SeverityBadge, EpistemicBadge, StatusBadge } = window.DisasterComponents || window;

  const EventsView = ({ onNavigate }) => {
    const [kpiData, setKpiData] = useState({
      total_events: 127,
      active_events: 34,
      resolved_events: 78,
      high_severity: 32,
      moderate_severity: 46,
      low_severity: 31
    });

    const [eventsList, setEventsList] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [selectedEventDetail, setSelectedEventDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [activeTab, setActiveTab] = useState("overview");

    const [hazardFilter, setHazardFilter] = useState("All Hazards");
    const [severityFilter, setSeverityFilter] = useState("All Severities");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [page, setPage] = useState(1);

    useEffect(() => {
      let isSubscribed = true;

      const fetchEvents = async () => {
        try {
          let url = `/api/v1/events?page=${page}&limit=15`;
          if (hazardFilter !== "All Hazards") url += `&hazard=${encodeURIComponent(hazardFilter)}`;
          if (severityFilter !== "All Severities") url += `&severity=${encodeURIComponent(severityFilter)}`;
          if (statusFilter !== "All Status") url += `&status=${encodeURIComponent(statusFilter.toLowerCase())}`;

          const res = await fetch(url);
          if (!res.ok) return;
          const data = await res.json();

          if (!isSubscribed) return;

          const items = Array.isArray(data) ? data : (data.events || []);
          setEventsList(items);

          if (data.kpis) {
            setKpiData(prev => ({ ...prev, ...data.kpis }));
          }

          if (items.length > 0 && !selectedEventId) {
            setSelectedEventId(items[0].event_id || items[0].id);
          }
        } catch (err) {
          console.error("Error loading events list:", err);
        }
      };

      fetchEvents();
      return () => { isSubscribed = false; };
    }, [page, hazardFilter, severityFilter, statusFilter]);

    useEffect(() => {
      if (!selectedEventId) return;
      let isSubscribed = true;
      setLoadingDetail(true);

      const fetchDetail = async () => {
        try {
          const res = await fetch(`/api/v1/events/${selectedEventId}`);
          if (!res.ok) throw new Error("Failed to load event detail");
          const detail = await res.json();
          if (isSubscribed) {
            setSelectedEventDetail(detail);
            setLoadingDetail(false);
          }
        } catch (err) {
          console.error("Error loading event detail:", err);
          if (isSubscribed) setLoadingDetail(false);
        }
      };

      fetchDetail();
      return () => { isSubscribed = false; };
    }, [selectedEventId]);

    const ev = selectedEventDetail || eventsList.find(e => (e.event_id || e.id) === selectedEventId) || {
      event_id: "EV-LSD-2026-10-09-001",
      title: "Landslide in Rudraprayag",
      hazard_name: "Landslide",
      location: "Rudraprayag, Uttarakhand",
      timestamp: "2026-10-09 08:15 IST",
      severity: "High",
      status: "Active",
      confidence: 0.82,
      coordinates: [30.2849, 78.9867],
      elevation: "1,245 m",
      affected_area: "25.0 sq km",
      description: "Sustained monsoon precipitation triggered slope failure along NH-107 / NH-58 corridor near Rudraprayag, obstructing highway access and stranding transit vehicles. District Disaster Management Authority (DDMA) and SDRF units are deployed on site."
    };

    const asText = (val, fallback = "") => {
      if (!val) return fallback;
      if (typeof val === "string") return val;
      if (typeof val === "number") return String(val);
      if (typeof val === "object") {
        return val.name || val.title || val.label || val.code || fallback;
      }
      return fallback;
    };

    const evTitle = asText(ev.title || ev.event_title || ev.name, "Landslide in Rudraprayag");
    const evId = asText(ev.event_code || ev.event_id || ev.id, "EV-LSD-2026-10-09-001");
    const evLocation = asText(
      ev.location || ev.location_name || ev.district_name || ev.district || (ev.key_information && ev.key_information.district),
      "Rudraprayag, Uttarakhand"
    );
    const evHazard = asText(ev.hazard_name || ev.hazard, "Landslide");
    const evTime = asText(ev.timestamp || ev.time || ev.start_time, "2026-10-09 08:15 IST");

    const hazardCode = (h) => {
      const s = asText(h, "").toLowerCase();
      if (s.includes("landslide")) return "LSD";
      if (s.includes("flood")) return "FLD";
      if (s.includes("rain") || s.includes("cloud")) return "MET";
      if (s.includes("earth") || s.includes("seis")) return "EQK";
      return "HZD";
    };

    // Detailed structured datasets for the 7 tabs
    const timelineSteps = [
      {
        time: "05:40 IST",
        date: "Oct 09, 2026",
        phase: "Initial Trigger",
        tone: "info",
        agency: "IMD Doppler Radar (Surkanda Devi)",
        title: "Intense Convective Cloudband Enters Mandakini Valley",
        detail: "Automated weather stations recorded rainfall intensity crossing 38 mm/hr across Ukhimath and Basukedar ridges, saturating steep upper catchment slopes."
      },
      {
        time: "07:15 IST",
        date: "Oct 09, 2026",
        phase: "Threshold Crossed",
        tone: "warn",
        agency: "CWC & GSI Early Warning System",
        title: "Soil Moisture & River Stage Warning Threshold Exceeded",
        detail: "Cumulative 3-hour precipitation reached 112.0 mm. EOS-04 SAR soil moisture index hit 94.2% saturation along the NH-107 / NH-58 cut-slope corridor."
      },
      {
        time: "08:15 IST",
        date: "Oct 09, 2026",
        phase: "Primary Incident",
        tone: "crit",
        agency: "District Control Room (DDMA Rudraprayag)",
        title: `${evTitle} Confirmed on Main Corridor`,
        detail: `Heavy boulder and mud debris (~14,500 cubic meters) sheared off the hillside at ${evLocation}, completely blocking roughly 140 meters of highway carriageway.`
      },
      {
        time: "08:30 IST",
        date: "Oct 09, 2026",
        phase: "Emergency Response",
        tone: "crit",
        agency: "SDRF Uttarakhand & Police",
        title: "2 SDRF Rescue Teams Deployed & Traffic Halted at Checkposts",
        detail: "Police established traffic barriers at Sonprayag and Kund. 42 stranded passenger vehicles and 3 transit buses were guided to safe holding zones."
      },
      {
        time: "09:10 IST",
        date: "Oct 09, 2026",
        phase: "Evacuation Action",
        tone: "warn",
        agency: "Sub-Divisional Magistrate (SDM) Office",
        title: "420 Residents Evacuated from Riverbank & Toe-Slope Hamlets",
        detail: "Families living in low-lying riverbank houses and beneath unstable slope scarps were shifted to GMVN Tourist Rest House and Government Inter College relief camps."
      },
      {
        time: "10:05 IST",
        date: "Oct 09, 2026",
        phase: "Clearance Underway",
        tone: "ok",
        agency: "Border Roads Organisation (BRO Project Shivalik)",
        title: "6 Heavy Excavators & Rock Breakers Operating on Site",
        detail: "Debris clearance is 45% complete from both north and south ends. Single-lane emergency vehicle passage expected within 8 to 12 hours if rainfall subsides."
      }
    ];

    const evidenceItems = [
      {
        id: "EVD-01",
        type: "Official Bulletin",
        source: "USDMA State Emergency Operations Center",
        time: "08:45 IST",
        verified: "Verified",
        lang: "EN / HI",
        title: "SEOC Dehradun Situation Report (SITREP #4) — High Alert",
        summary: `Confirmed ${evHazard.toLowerCase()} incident in ${evLocation}. District administration directed to keep relief shelters operational and halt hillside transit during red alert hours.`,
        url: "https://usdma.uk.gov.in"
      },
      {
        id: "EVD-02",
        type: "Satellite / SAR",
        source: "ISRO EOS-04 C-Band Radar & Sentinel-2",
        time: "07:50 IST",
        verified: "Verified",
        lang: "GeoTIFF",
        title: "SAR Backscatter Moisture & Debris Scarp Delineation",
        summary: "High-resolution radar pass delineated a 25.0 sq km high-saturation zone and a 140m fresh debris fan intersecting the primary highway alignment.",
        url: "https://bhuvan.nrsc.gov.in"
      },
      {
        id: "EVD-03",
        type: "Field Engineering",
        source: "Border Roads Organisation (BRO) Task Force",
        time: "09:15 IST",
        verified: "Verified",
        lang: "EN",
        title: "Highway Obstruction & Rockfall Stability Inspection",
        summary: "Geotechnical inspection identified overhanging fractured quartzite boulders requiring controlled blasting and JCB benching before civilian vehicles can pass.",
        url: "https://bro.gov.in"
      },
      {
        id: "EVD-04",
        type: "Drone Recon",
        source: "SDRF UAV Unit (Frame UAV-RECON-NH58-01)",
        time: "08:55 IST",
        verified: "Verified",
        lang: "4K Ortho",
        title: "Aerial Drone Orthomosaic of Blocked Corridor & River Toe",
        summary: "6 aerial frames captured at 80m altitude confirm no river impoundment dam formation, though toe erosion remains active along the left bank.",
        url: "https://sdrf.uk.gov.in"
      },
      {
        id: "EVD-05",
        type: "News Coverage",
        source: "Amar Ujala & DD News Uttarakhand",
        time: "09:30 IST",
        verified: "Verified",
        lang: "Hindi",
        title: "रुद्रप्रयाग-गौरीकुंड हाईवे पर भारी भूस्खलन, राहत कार्य जारी",
        summary: "On-ground video dispatch showing BRO machinery clearing boulders near Banswara and SDRF personnel assisting elderly pilgrims to safe shelters.",
        url: "https://www.amarujala.com/uttarakhand"
      },
      {
        id: "EVD-06",
        type: "Citizen Media",
        source: "Verified Gram Pradhan & Local Drivers Feed",
        time: "08:20 IST",
        verified: "Corroborated",
        lang: "Hindi",
        title: "Dashcam & Mobile Footage of Initial Slope Failure",
        summary: "3 geotagged citizen clips cross-checked via perceptual hash (pHash) and landmark matching confirm exact time of road blockage at 08:15 IST.",
        url: "https://x.com/RudraprayagPol"
      }
    ];

    const modalityFeeds = [
      {
        id: "ME-WTH-2026-10-09-001",
        category: "Weather",
        station: "IMD AWS Basukedar & Surkanda Doppler Radar",
        reading: "112.0 mm in 3 hours (Peak 44 mm/hr)",
        threshold: "+62% above Cloudburst / Flash Flood Trigger",
        confidence: 0.98,
        time: "08:25 IST",
        status: "Critical Trigger",
        note: "Sustained extreme precipitation over steep catchment directly triggered surface runoff and pore-water pressure surge."
      },
      {
        id: "ME-LSD-2026-10-09-002",
        category: "Landslide",
        station: "GSI Inclinometer & EOS-04 SAR Slope Monitor",
        reading: "140m Highway Debris • 94.2% Soil Saturation",
        threshold: "Factor of Safety dropped below 0.92 (Critical)",
        confidence: 0.95,
        time: "08:15 IST",
        status: "Active Failure",
        note: "Shear displacement detected along weathered phyllite/quartzite bedding planes above NH-107 / NH-58."
      },
      {
        id: "ME-FLD-2026-10-09-003",
        category: "Flood",
        station: "CWC Hydrological Station — Sonprayag / Rudraprayag",
        reading: "628.45 m MSL (+0.95 m above Danger Mark)",
        threshold: "Rising at +0.35 m/hr • High Turbidity",
        confidence: 0.96,
        time: "08:30 IST",
        status: "Above Danger",
        note: "High sediment load and rapid discharge surge recorded downstream in the Mandakini-Alaknanda confluence."
      },
      {
        id: "ME-NWS-2026-10-09-004",
        category: "News & Social",
        station: "USDMA Bulletin, PTI, Amar Ujala & @SDRFUttarakhand",
        reading: "18 Verified Bulletins & 42 Geotagged Field Posts",
        threshold: "Cross-Source Consensus Score: 0.94",
        confidence: 0.94,
        time: "08:40 IST",
        status: "Corroborated",
        note: "Multi-lingual NLP pipeline verified location, highway number, and zero-fatality status across Hindi and English feeds."
      }
    ];

    const affectedRegions = [
      {
        name: "Rudraprayag District (Primary Impact Zone)",
        lgd: "LGD-058",
        level: "District",
        severity: "Critical",
        blocks: "Ukhimath, Augustmuni, Jakholi",
        villages: "Banswara, Syalsaur, Chandrapuri, Kund, Guptkashi, Phata, Sonprayag",
        population: "18,400 residents in watch zone (3,500 directly affected)",
        corridors: "NH-107 (Rudraprayag–Gaurikund) blocked at KM 24; 4 rural PMGSY link roads closed",
        facilities: "2 Primary Health Centers on backup power, 3 Relief Camps active (420 occupants)"
      },
      {
        name: "Chamoli District (Adjacent Upper Catchment)",
        lgd: "LGD-057",
        level: "District",
        severity: "High",
        blocks: "Joshimath, Dasholi, Karnaprayag",
        villages: "Pipalkhoti, Tangni, Gauchar, Nandprayag, Lambagad",
        population: "9,200 residents under orange advisory",
        corridors: "NH-58 (Badrinath Highway) single-lane restricted movement near Pipalkhoti",
        facilities: "SDRF post at Gauchar on standby; Alaknanda riverbank ghats closed to public"
      },
      {
        name: "Pauri & Tehri Garhwal (Downstream Confluence Corridor)",
        lgd: "LGD-061 / 059",
        level: "Downstream Basin",
        severity: "Moderate",
        blocks: "Srinagar, Kirtinagar, Devprayag",
        villages: "Srinagar Bazar, Dhari Devi, Kirtinagar, Bagwan, Devprayag Sangam",
        population: "14,500 riverbank residents alerted via public address sirens",
        corridors: "NH-58 Srinagar–Rishikesh open with police patrol at low-lying bridges",
        facilities: "Srinagar Hydroelectric Dam regulating spillway gates to absorb flood peak"
      }
    ];

    const impactCategories = [
      {
        category: "Population & Human Safety",
        status: "420 Evacuated • 0 Fatalities",
        tone: "crit",
        metrics: [
          { label: "Directly Affected Population", value: "3,500 people (5 Gram Panchayats)" },
          { label: "Evacuated to Safe Shelters", value: "420 residents across 3 relief camps" },
          { label: "Injuries / Medical Aid", value: "3 minor injuries treated on-site by mobile medical team" },
          { label: "Stranded Travelers / Pilgrims", value: "185 passengers assisted with food, water & shelter" }
        ]
      },
      {
        category: "Highways, Bridges & Transport",
        status: "12.0 km Corridor Obstructed",
        tone: "crit",
        metrics: [
          { label: "Primary Highway Status", value: "NH-107 / NH-58 blocked near Banswara (140m debris span)" },
          { label: "Rural Link Roads", value: "4 PMGSY village roads blocked by minor mudslides" },
          { label: "Bridges Inspected", value: "2 suspension bridges closed for safety; main motor bridge safe" },
          { label: "Estimated Clearance Time", value: "8–12 hours for single-lane emergency passage (BRO on site)" }
        ]
      },
      {
        category: "Housing & Public Buildings",
        status: "14 Structures Impacted",
        tone: "warn",
        metrics: [
          { label: "Residential Houses", value: "2 pucca houses partially damaged by rolling boulders; 9 mud-wall sheds affected" },
          { label: "Commercial Roadside Shops", value: "3 roadside kiosks buried under slope debris (vacated prior)" },
          { label: "Schools & Anganwadis", value: "All schools in Ukhimath & Augustmuni blocks closed for 24h precautionary holiday" },
          { label: "Hospitals & PHCs", value: "District Hospital Rudraprayag & PHC Ukhimath 100% operational" }
        ]
      },
      {
        category: "Power, Water & Telecom",
        status: "Restoration Underway",
        tone: "warn",
        metrics: [
          { label: "Electricity (UPCL)", value: "11kV feeder line snapped (4 poles damaged); 5 villages on DG backup, restoration by 18:00 IST" },
          { label: "Drinking Water (Jal Sansthan)", value: "2 gravity pipeline sections washed out; 6 water tankers deployed to villages" },
          { label: "Telecom & Mobile Towers", value: "BSNL & Jio towers active (94% uptime); 1 tower running on battery backup" },
          { label: "Emergency Comms", value: "Police VHF & SDRF satellite phones operating normally" }
        ]
      },
      {
        category: "Agriculture & Livelihoods",
        status: "Assessment in Progress",
        tone: "info",
        metrics: [
          { label: "Terraced Farmland Affected", value: "~18.5 hectares of hillside agricultural terraces covered in silt/debris" },
          { label: "Livestock Safety", value: "68 cattle shifted to higher ground; 0 livestock loss reported" },
          { label: "Horticulture / Orchards", value: "Minor damage to Malta citrus & vegetable plots in Banswara belt" },
          { label: "Revenue Dept Survey", value: "Patwari field teams scheduled for compensation assessment within 48h" }
        ]
      },
      {
        category: "Active Relief & Rescue Operations",
        status: "Full Deployment",
        tone: "ok",
        metrics: [
          { label: "Rescue Personnel", value: "2 SDRF teams (48 jawans), 1 NDRF team on standby, 35 District Police personnel" },
          { label: "Heavy Machinery", value: "6 BRO JCB/Hitachi excavators, 2 rock breakers, 4 dumpers working continuously" },
          { label: "Relief Camps Active", value: "3 centres (GMVN Syalsaur, GIC Augustmuni, Community Hall Kund) with 1,200 meal packets" },
          { label: "Helpline Status", value: "1070 (State) & 1077 (District Control Room) active 24x7" }
        ]
      }
    ];

    const relatedEvents = [
      {
        id: "EV-WTH-2026-10-09-002",
        title: "Extreme Cloudburst & Heavy Rainfall — Ukhimath Catchment",
        relation: "Upstream Trigger Event",
        location: "Ukhimath, Rudraprayag",
        time: "05:40 IST (2h 35m prior)",
        severity: "Critical",
        status: "Active",
        summary: "Primary meteorological trigger delivering 112.0 mm of rainfall in 3 hours, saturating the hillside and initiating the landslide and river surge."
      },
      {
        id: "EV-FLD-2026-10-09-003",
        title: "Mandakini & Alaknanda River Flash Flood Surge",
        relation: "Concurrent Basin Cascade",
        location: "Sonprayag to Srinagar Corridor",
        time: "08:30 IST (Ongoing)",
        severity: "High",
        status: "Active",
        summary: "Rapid runoff and landslide debris input raised Mandakini river stage 0.95m above danger mark, triggering riverbank evacuations."
      },
      {
        id: "EV-LSD-2026-10-09-004",
        title: "NH-58 Pipalkhoti Rockfall & Corridor Disruption",
        relation: "Regional Weather System Impact",
        location: "Pipalkhoti, Chamoli District",
        time: "07:45 IST (Same frontal cell)",
        severity: "Moderate",
        status: "Active",
        summary: "Triggered by the same intense monsoon cloudband moving across adjacent Chamoli district, restricting Badrinath highway traffic to a single lane."
      }
    ];

    return (
      <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
        {/* Page Header (Prominent Heading + Description Below It) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-ink tracking-tight">
                Events
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent-soft text-accent border border-accent/30 font-semibold">
                Multi-Modal Verified
              </span>
            </div>
            <p className="text-sm font-normal text-muted mt-1">
              Unified real-world disaster events corroborated across weather stations, river gauges, satellite imagery, and field reports.
            </p>
          </div>
        </div>

        {/* 6-Column KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <KpiCard title="Total Events" value={kpiData.total_events || 127} delta="+14 vs 30d avg" deltaTone="neutral" />
          <KpiCard title="Active Events" value={kpiData.active_events || 34} delta="+3 in 24h" deltaTone="crit" />
          <KpiCard title="Resolved" value={kpiData.resolved_events || 78} delta="61.4% cleared" deltaTone="ok" />
          <KpiCard title="High Severity" value={kpiData.high_severity || 32} delta="25.2% share" deltaTone="crit" />
          <KpiCard title="Moderate" value={kpiData.moderate_severity || 46} delta="36.2% share" deltaTone="warn" />
          <KpiCard title="Low / Advisory" value={kpiData.low_severity || 31} delta="24.4% share" deltaTone="neutral" />
        </div>

        {/* Filter Bar */}
        <div className="bg-surface border border-line rounded-[2px] px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-muted pr-1">
              FILTER:
            </span>
            <select
              value={hazardFilter}
              onChange={(e) => setHazardFilter(e.target.value)}
              className="bg-surface2 text-ink border border-line rounded-[2px] px-2.5 py-1 text-xs focus:outline-none focus:border-accent"
            >
              <option value="All Hazards">All Hazards</option>
              <option value="Landslide">Landslide</option>
              <option value="Flood">Flood</option>
              <option value="Heavy Rainfall">Heavy Rainfall</option>
              <option value="Earthquake">Earthquake</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-surface2 text-ink border border-line rounded-[2px] px-2.5 py-1 text-xs focus:outline-none focus:border-accent"
            >
              <option value="All Severities">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface2 text-ink border border-line rounded-[2px] px-2.5 py-1 text-xs focus:outline-none focus:border-accent"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Resolved">Resolved</option>
            </select>

            <button
              onClick={() => {
                setHazardFilter("All Hazards");
                setSeverityFilter("All Severities");
                setStatusFilter("All Status");
              }}
              className="text-[11px] font-mono uppercase tracking-wider text-muted hover:text-ink px-2 py-1 rounded-[2px] hover:bg-surface2"
            >
              Reset
            </button>
          </div>
          <div className="text-[11px] font-mono text-muted">
            SORT: <span className="text-ink font-semibold">TIMESTAMP DESC</span>
          </div>
        </div>

        {/* Main Split Pane: Master List (Left 5 cols) + Detail Inspector (Right 7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT: MASTER EVENT LIST */}
          <div className="lg:col-span-5 bg-surface border border-line rounded-[2px] overflow-hidden">
            <div className="px-3.5 py-2.5 bg-surface2 border-b border-line flex items-center justify-between">
              <span className="panel-title">Event Log ({eventsList.length})</span>
              <span className="text-[10px] font-mono text-muted tabular-nums">PAGE {page}</span>
            </div>

            <div className="divide-y divide-line max-h-[760px] overflow-y-auto">
              {eventsList.map((item) => {
                const id = item.event_id || item.id;
                const isSelected = id === selectedEventId;
                const hazard = asText(item.hazard_name || item.hazard, "Hazard");
                const itemTitle = asText(item.title || item.event_title || item.name, `${hazard} in ${asText(item.district_name || item.district, 'Uttarakhand')}`);
                const itemLoc = asText(item.location_name || item.location || item.district_name || item.district, "Uttarakhand");
                const itemTime = asText(item.time || item.timestamp || item.start_time, "08:15 IST");
                const itemCode = asText(item.event_code || id, "EV-001");

                return (
                  <div
                    key={id}
                    onClick={() => setSelectedEventId(id)}
                    className={`p-3 cursor-pointer transition-colors flex items-start gap-2.5 border-l-[3px] ${
                      isSelected
                        ? 'bg-accent-soft/50 border-l-accent'
                        : 'bg-surface hover:bg-surface2 border-l-transparent'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-[2px] bg-surface2 border border-line flex items-center justify-center shrink-0 font-mono text-[10px] font-bold text-ink2 uppercase">
                      {hazardCode(hazard)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-bold text-[14.5px] text-ink truncate">
                          {itemTitle}
                        </h3>
                        <SeverityBadge severity={item.severity || "Moderate"} />
                      </div>

                      <div className="text-xs font-normal text-muted mt-1 flex items-center justify-between tabular-nums">
                        <span className="truncate">{itemLoc}</span>
                        <span className="shrink-0">{itemTime}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-line">
                        <span className="text-xs font-normal text-muted truncate">{itemCode}</span>
                        <StatusBadge status={item.status || "Active"} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="px-3 py-2 border-t border-line flex items-center justify-between text-[11px] font-mono text-muted bg-surface2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-[2px] bg-surface border border-line hover:border-line-strong text-ink disabled:opacity-40"
              >
                &larr; PREV
              </button>
              <span className="tabular-nums">PAGE {page} OF 9</span>
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-2.5 py-1 rounded-[2px] bg-surface border border-line hover:border-line-strong text-ink"
              >
                NEXT &rarr;
              </button>
            </div>
          </div>

          {/* RIGHT: UNIFIED EVENT MASTER-DETAIL PANEL */}
          <div className="lg:col-span-7 bg-surface border border-line rounded-[2px] overflow-hidden">
            {/* Detail Header */}
            <div className="p-5 bg-surface2 border-b border-line">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-extrabold text-ink tracking-tight">
                    {evTitle}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-normal text-muted">
                    <span className="px-1.5 py-0.5 rounded bg-surface border border-line text-ink2 font-semibold text-[11px]">
                      {evId}
                    </span>
                    <span>&bull;</span>
                    <span>{evLocation}</span>
                    <span>&bull;</span>
                    <span className="tabular-nums">{evTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <SeverityBadge severity={ev.severity || "High"} />
                  <StatusBadge status={ev.status || "Active"} />
                </div>
              </div>

              {/* 7 Sub-tabs Navigation */}
              <div className="flex flex-wrap border-b border-line mt-4 -mb-5 text-xs font-semibold gap-1">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'timeline', label: `Timeline (${timelineSteps.length})` },
                  { id: 'evidence', label: `Evidence (${evidenceItems.length})` },
                  { id: 'modality', label: `Modality Events (${modalityFeeds.length})` },
                  { id: 'regions', label: `Regions (${affectedRegions.length})` },
                  { id: 'impacts', label: `Impacts (${impactCategories.length})` },
                  { id: 'related', label: `Related (${relatedEvents.length})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2.5 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-accent text-accent bg-surface font-bold'
                        : 'border-transparent text-muted hover:text-ink'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: OVERVIEW                                                           */}
            {/* ========================================================================= */}
            {activeTab === 'overview' && (
              <div className="p-4 space-y-4 text-xs">
                {/* Top Row: Mini-Map + Key Information + Field Imagery */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Mini-Map */}
                  <div className="bg-surface2 rounded-[2px] p-2.5 border border-line">
                    <div className="panel-title mb-2">Epicenter Focus</div>
                    <div className="h-32 rounded-[2px] overflow-hidden border border-line">
                      <MapView
                        center={ev.coordinates || [30.2849, 78.9867]}
                        zoom={9}
                        markers={[{
                          lat: (ev.coordinates && ev.coordinates[0]) || 30.2849,
                          lon: (ev.coordinates && ev.coordinates[1]) || 78.9867,
                          title: evTitle,
                          hazard: evHazard,
                          severity: ev.severity || "High"
                        }]}
                        showBasemapSwitcher={false}
                      />
                    </div>
                  </div>

                  {/* Key Information */}
                  <div className="bg-surface2 rounded-[2px] p-2.5 border border-line space-y-1.5 text-xs tabular-nums">
                    <div className="panel-title mb-1">Geospatial Attributes</div>
                    <div className="flex justify-between py-0.5 border-b border-line">
                      <span className="text-muted">Hazard Type:</span>
                      <span className="text-ink font-bold">{evHazard}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-line">
                      <span className="text-muted">Confidence:</span>
                      <span className="text-ok font-bold">{Math.round((ev.confidence || 0.82) * 100)}% Verified</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-line">
                      <span className="text-muted">Coordinates:</span>
                      <span className="text-ink2 font-medium">30.2849°N, 78.9867°E</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-line">
                      <span className="text-muted">Elevation:</span>
                      <span className="text-ink2 font-medium">1,245 m MSL</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-muted">Affected Extent:</span>
                      <span className="text-ink2 font-medium">25.0 sq km</span>
                    </div>
                  </div>

                  {/* Field Recon Imagery Metadata */}
                  <div className="bg-surface2 rounded-[2px] p-2.5 border border-line flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="panel-title">Field Recon Frames</span>
                        <span className="text-[11px] text-muted font-medium">6 Frames</span>
                      </div>
                      <div className="h-24 rounded-[2px] bg-surface border border-line flex flex-col items-center justify-center p-2 text-center">
                        <span className="text-xs font-bold text-accent">UAV-RECON-NH58-01.TIFF</span>
                        <span className="text-[11px] text-muted mt-1">Slope debris obstruction on NH-58 corridor</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 mt-2 text-[10px] text-center">
                      <button onClick={() => setActiveTab('evidence')} className="py-1 rounded-[2px] bg-surface border border-line text-ink2 hover:border-accent">SAR-01</button>
                      <button onClick={() => setActiveTab('evidence')} className="py-1 rounded-[2px] bg-surface border border-line text-ink2 hover:border-accent">OPT-02</button>
                      <button onClick={() => setActiveTab('evidence')} className="py-1 rounded-[2px] bg-accent-soft border border-accent/30 text-accent font-semibold">+4 MORE</button>
                    </div>
                  </div>
                </div>

                {/* Narrative Description */}
                <div className="bg-surface2 rounded-[2px] p-3.5 border border-line">
                  <div className="panel-title mb-1.5">Operational Situation Summary</div>
                  <p className="text-ink2 text-[13px] leading-relaxed font-normal">
                    {ev.description || "Sustained monsoon precipitation triggered slope failure along NH-107 / NH-58 corridor near Rudraprayag, obstructing highway access and stranding transit vehicles. District Disaster Management Authority (DDMA) and SDRF units are deployed on site."}
                  </p>
                </div>

                {/* Split Impact Comparison (Observed vs Predicted) */}
                <div className="bg-surface2 rounded-[2px] p-3.5 border border-line">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="panel-title">
                      Impact Assessment (Observed Ground Truth vs. 24–48h Forecast)
                    </span>
                    <button
                      onClick={() => setActiveTab('impacts')}
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      Full Impact Breakdown &rarr;
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Left: Observed Impacts */}
                    <div className="p-3 rounded-[2px] bg-surface border border-line border-l-2 border-l-ok space-y-1.5">
                      <div className="text-xs font-bold text-ok">
                        Observed Impacts (Verified Field SITREPs)
                      </div>
                      <ul className="space-y-1 text-ink2 text-xs list-disc list-inside font-normal">
                        <li><strong className="text-ink">3,500</strong> people directly affected across 5 Gram Panchayats</li>
                        <li><strong className="text-ink">420</strong> residents evacuated to 3 relief camps</li>
                        <li><strong className="text-ink">12.0 km</strong> highway corridor obstructed (140m debris span)</li>
                        <li><strong className="text-ink">3</strong> minor injuries treated; <strong className="text-ink">0</strong> fatalities</li>
                      </ul>
                    </div>

                    {/* Right: Potential / Predicted Impacts */}
                    <div className="p-3 rounded-[2px] bg-surface border border-line border-l-2 border-l-info space-y-1.5">
                      <div className="text-xs font-bold text-info">
                        Projected Cascade Risks (Next 24–48 Hours)
                      </div>
                      <ul className="space-y-1 text-ink2 text-xs list-disc list-inside font-normal">
                        <li><strong className="text-ink">High Risk</strong> of secondary rockfall if rainfall exceeds 30 mm</li>
                        <li><strong className="text-ink">Moderate</strong> river toe-erosion hazard along Mandakini bank</li>
                        <li><strong className="text-ink">~5,000</strong> downstream residents in flood watch zone</li>
                        <li><strong className="text-ink">8–12 hrs</strong> estimated BRO single-lane clearance window</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Contributing Modality Events & Related Events */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-[2px] bg-surface2 border border-line">
                    <div className="flex items-center justify-between mb-2">
                      <span className="panel-title">Contributing Modality Events</span>
                      <button onClick={() => setActiveTab('modality')} className="text-xs font-semibold text-accent hover:underline">
                        View All (4) &rarr;
                      </button>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-line">
                        <span className="text-ink font-semibold">IMD AWS Heavy Rainfall Trigger (112 mm)</span>
                        <span className="text-ok font-bold tabular-nums">98% Conf</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-line">
                        <span className="text-ink font-semibold">GSI &amp; EOS-04 SAR Slope Failure Match</span>
                        <span className="text-ok font-bold tabular-nums">95% Conf</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-ink font-semibold">CWC River Gauge Surge (+0.95m Danger)</span>
                        <span className="text-ok font-bold tabular-nums">96% Conf</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[2px] bg-surface2 border border-line">
                    <div className="flex items-center justify-between mb-2">
                      <span className="panel-title">Related Disasters Happening</span>
                      <button onClick={() => setActiveTab('related')} className="text-xs font-semibold text-accent hover:underline">
                        View All (3) &rarr;
                      </button>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center py-1.5 border-b border-line">
                        <span className="text-ink font-semibold">Ukhimath Cloudburst &amp; Heavy Rainfall</span>
                        <SeverityBadge severity="Critical" />
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-line">
                        <span className="text-ink font-semibold">Mandakini &amp; Alaknanda River Surge</span>
                        <SeverityBadge severity="High" />
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-ink font-semibold">NH-58 Pipalkhoti Corridor Disruption</span>
                        <SeverityBadge severity="Moderate" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: TIMELINE                                                           */}
            {/* ========================================================================= */}
            {activeTab === 'timeline' && (
              <div className="p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-surface2 p-3 rounded-[2px] border border-line">
                  <div>
                    <h3 className="panel-title">Chronological Event Progression</h3>
                    <p className="text-xs text-muted mt-0.5">
                      Step-by-step sequence from initial weather anomaly to field verification, evacuation, and road clearance.
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-surface border border-line font-semibold text-ink2">
                    {timelineSteps.length} Logged Milestones
                  </span>
                </div>

                <div className="relative pl-6 space-y-3 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
                  {timelineSteps.map((step, idx) => (
                    <div key={idx} className="relative bg-surface2 border border-line rounded-[2px] p-3.5 hover:border-accent transition-colors">
                      {/* Timeline Node Dot */}
                      <span
                        className={`absolute -left-[19px] top-4 w-3 h-3 rounded-full border-2 border-surface ${
                          step.tone === 'crit' ? 'bg-crit' :
                          step.tone === 'warn' ? 'bg-warn' :
                          step.tone === 'ok' ? 'bg-ok' : 'bg-accent'
                        }`}
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-ink tabular-nums px-2 py-0.5 rounded bg-surface border border-line">
                            {step.time}
                          </span>
                          <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                            step.tone === 'crit' ? 'bg-crit-soft text-crit' :
                            step.tone === 'warn' ? 'bg-warn-soft text-warn' :
                            step.tone === 'ok' ? 'bg-ok-soft text-ok' : 'bg-accent-soft text-accent'
                          }`}>
                            {step.phase}
                          </span>
                        </div>
                        <span className="text-xs text-muted font-medium">{step.agency}</span>
                      </div>

                      <h4 className="font-bold text-[14.5px] text-ink mt-2">
                        {step.title}
                      </h4>
                      <p className="text-xs text-muted font-normal mt-1 leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: EVIDENCE                                                           */}
            {/* ========================================================================= */}
            {activeTab === 'evidence' && (
              <div className="p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-surface2 p-3 rounded-[2px] border border-line">
                  <div>
                    <h3 className="panel-title">Verified Evidence, Bulletins &amp; Field Media</h3>
                    <p className="text-xs text-muted mt-0.5">
                      Official government SITREPs, satellite radar passes, drone orthomosaics, and verified news dispatches.
                    </p>
                  </div>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('reports')}
                      className="text-xs px-3 py-1.5 rounded bg-accent text-white font-semibold hover:opacity-90 transition-opacity"
                    >
                      Open Reports &amp; Evidence Page &rarr;
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {evidenceItems.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-[2px] bg-surface2 border border-line flex flex-col justify-between hover:border-accent transition-colors">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-surface border border-line font-semibold text-ink2">
                            {item.type}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] px-2 py-0.5 rounded bg-ok-soft text-ok font-semibold">
                              {item.verified}
                            </span>
                            <span className="text-[11px] text-muted tabular-nums">{item.time}</span>
                          </div>
                        </div>

                        <h4 className="font-bold text-[14px] text-ink mt-2">
                          {item.title}
                        </h4>
                        <div className="text-xs text-accent font-medium mt-0.5">
                          Source: {item.source} ({item.lang})
                        </div>
                        <p className="text-xs text-muted font-normal mt-1.5 leading-relaxed">
                          {item.summary}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-line flex items-center justify-between text-xs">
                        <span className="text-muted font-mono text-[11px]">ID: {item.id}</span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-accent hover:underline"
                        >
                          Open Source Portal &nearr;
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: MODALITY EVENTS                                                    */}
            {/* ========================================================================= */}
            {activeTab === 'modality' && (
              <div className="p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-surface2 p-3 rounded-[2px] border border-line">
                  <div>
                    <h3 className="panel-title">Linked Modality Events (Sensor &amp; Channel Detections)</h3>
                    <p className="text-xs text-muted mt-0.5">
                      Individual detections across Weather, Landslide, Flood, News, and Social Media fused into this event.
                    </p>
                  </div>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('modality-events')}
                      className="text-xs px-3 py-1.5 rounded bg-accent text-white font-semibold hover:opacity-90 transition-opacity"
                    >
                      Inspect in Modality Events &rarr;
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {modalityFeeds.map((feed) => (
                    <div key={feed.id} className="p-3.5 rounded-[2px] bg-surface2 border border-line hover:border-accent transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-accent-soft text-accent font-bold text-xs">
                            {feed.category}
                          </span>
                          <span className="text-xs font-semibold text-ink2 px-2 py-0.5 rounded bg-surface border border-line">
                            {feed.id}
                          </span>
                          <span className="text-xs text-muted tabular-nums">{feed.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-crit-soft text-crit font-semibold">
                            {feed.status}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-ok-soft text-ok font-bold tabular-nums">
                            {Math.round(feed.confidence * 100)}% Conf
                          </span>
                        </div>
                      </div>

                      <h4 className="font-bold text-[14.5px] text-ink mt-2">
                        {feed.station}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2 p-2.5 rounded bg-surface border border-line text-xs">
                        <div>
                          <span className="text-muted block text-[11px]">Measured Reading:</span>
                          <span className="text-ink font-bold">{feed.reading}</span>
                        </div>
                        <div>
                          <span className="text-muted block text-[11px]">Threshold / Anomaly Status:</span>
                          <span className="text-crit font-semibold">{feed.threshold}</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted font-normal mt-2 leading-relaxed">
                        {feed.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 5: REGIONS & AREAS AFFECTED                                           */}
            {/* ========================================================================= */}
            {activeTab === 'regions' && (
              <div className="p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-surface2 p-3 rounded-[2px] border border-line">
                  <div>
                    <h3 className="panel-title">Affected Districts, Tehsils, Villages &amp; Corridors</h3>
                    <p className="text-xs text-muted mt-0.5">
                      Administrative boundaries, Gram Panchayats, highways, and emergency shelters intersecting the hazard zone.
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-surface border border-line font-semibold text-ink2">
                    3 Administrative Zones
                  </span>
                </div>

                <div className="space-y-3">
                  {affectedRegions.map((reg, idx) => (
                    <div key={idx} className="p-4 rounded-[2px] bg-surface2 border border-line space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
                        <div>
                          <h4 className="font-bold text-[15px] text-ink">{reg.name}</h4>
                          <span className="text-xs text-muted">
                            {reg.level} &bull; Code: {reg.lgd} &bull; Tehsils / Blocks: <strong className="text-ink2">{reg.blocks}</strong>
                          </span>
                        </div>
                        <SeverityBadge severity={reg.severity} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                        <div className="p-2.5 rounded bg-surface border border-line">
                          <div className="font-bold text-ink mb-0.5">Villages &amp; Gram Panchayats</div>
                          <p className="text-muted font-normal leading-relaxed">{reg.villages}</p>
                        </div>
                        <div className="p-2.5 rounded bg-surface border border-line">
                          <div className="font-bold text-ink mb-0.5">Population Exposure</div>
                          <p className="text-muted font-normal leading-relaxed">{reg.population}</p>
                        </div>
                        <div className="p-2.5 rounded bg-surface border border-line">
                          <div className="font-bold text-ink mb-0.5">Highways &amp; Road Links</div>
                          <p className="text-muted font-normal leading-relaxed">{reg.corridors}</p>
                        </div>
                        <div className="p-2.5 rounded bg-surface border border-line">
                          <div className="font-bold text-ink mb-0.5">Relief Camps &amp; Critical Facilities</div>
                          <p className="text-muted font-normal leading-relaxed">{reg.facilities}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 6: IMPACTS & DAMAGE ASSESSMENT                                        */}
            {/* ========================================================================= */}
            {activeTab === 'impacts' && (
              <div className="p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-surface2 p-3 rounded-[2px] border border-line">
                  <div>
                    <h3 className="panel-title">Detailed Impact &amp; Relief Assessment</h3>
                    <p className="text-xs text-muted mt-0.5">
                      Verified ground-truth damage metrics across population, roads, housing, utilities, and rescue operations.
                    </p>
                  </div>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('preparedness')}
                      className="text-xs px-3 py-1.5 rounded bg-accent text-white font-semibold hover:opacity-90 transition-opacity"
                    >
                      Preparedness &amp; Response &rarr;
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {impactCategories.map((cat, idx) => (
                    <div key={idx} className="p-3.5 rounded-[2px] bg-surface2 border border-line flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-line">
                          <h4 className="font-bold text-[14.5px] text-ink">{cat.category}</h4>
                          <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                            cat.tone === 'crit' ? 'bg-crit-soft text-crit' :
                            cat.tone === 'warn' ? 'bg-warn-soft text-warn' :
                            cat.tone === 'ok' ? 'bg-ok-soft text-ok' : 'bg-accent-soft text-accent'
                          }`}>
                            {cat.status}
                          </span>
                        </div>

                        <div className="space-y-2 mt-2.5 text-xs">
                          {cat.metrics.map((m, mIdx) => (
                            <div key={mIdx} className="p-2 rounded bg-surface border border-line">
                              <div className="text-[11px] text-muted">{m.label}</div>
                              <div className="text-ink font-semibold mt-0.5">{m.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 7: RELATED EVENTS & EXTERNAL CHANNELS                                 */}
            {/* ========================================================================= */}
            {activeTab === 'related' && (
              <div className="p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-surface2 p-3 rounded-[2px] border border-line">
                  <div>
                    <h3 className="panel-title">Related &amp; Cascading Disasters</h3>
                    <p className="text-xs text-muted mt-0.5">
                      Upstream triggers, concurrent river basin surges, and adjacent highway disruptions linked to this event.
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-surface border border-line font-semibold text-ink2">
                    {relatedEvents.length} Linked Disasters
                  </span>
                </div>

                <div className="space-y-3">
                  {relatedEvents.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => setSelectedEventId(rel.id)}
                      className="p-3.5 rounded-[2px] bg-surface2 border border-line hover:border-accent cursor-pointer transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-accent-soft text-accent font-bold">
                            {rel.relation}
                          </span>
                          <span className="text-xs font-semibold text-ink2 px-2 py-0.5 rounded bg-surface border border-line">
                            {rel.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <SeverityBadge severity={rel.severity} />
                          <StatusBadge status={rel.status} />
                        </div>
                      </div>

                      <h4 className="font-bold text-[15px] text-ink mt-2">
                        {rel.title}
                      </h4>
                      <div className="text-xs text-muted mt-0.5">
                        {rel.location} &bull; {rel.time}
                      </div>
                      <p className="text-xs text-muted font-normal mt-1.5 leading-relaxed">
                        {rel.summary}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Official Channels, News & Social Media Links */}
                <div className="p-3.5 rounded-[2px] bg-surface2 border border-line">
                  <div className="panel-title mb-2.5">Official Portals, News &amp; Social Media Channels</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                    <a
                      href="https://usdma.uk.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded bg-surface border border-line hover:border-accent block"
                    >
                      <div className="font-bold text-ink flex justify-between">
                        <span>USDMA State Portal</span>
                        <span className="text-accent">&nearr;</span>
                      </div>
                      <div className="text-muted text-[11px] mt-0.5">Official Uttarakhand SEOC Bulletins</div>
                    </a>
                    <a
                      href="https://www.amarujala.com/uttarakhand"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded bg-surface border border-line hover:border-accent block"
                    >
                      <div className="font-bold text-ink flex justify-between">
                        <span>Amar Ujala Uttarakhand</span>
                        <span className="text-accent">&nearr;</span>
                      </div>
                      <div className="text-muted text-[11px] mt-0.5">Live Hindi Ground News &amp; Videos</div>
                    </a>
                    <a
                      href="https://x.com/SDRFUttarakhand"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded bg-surface border border-line hover:border-accent block"
                    >
                      <div className="font-bold text-ink flex justify-between">
                        <span>@SDRFUttarakhand (X)</span>
                        <span className="text-accent">&nearr;</span>
                      </div>
                      <div className="text-muted text-[11px] mt-0.5">Live Rescue &amp; Highway Clearance Feed</div>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  window.DisasterViews = window.DisasterViews || {};
  window.DisasterViews.EventsView = EventsView;
  window.EventsView = EventsView;
})();
