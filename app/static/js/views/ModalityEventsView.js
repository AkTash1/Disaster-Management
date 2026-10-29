// Disaster Intelligence Platform — View 4: Modality Events
// Features:
// - 8 Modality KPI Cards (Total, Earthquake, Flood, Landslide, Weather, News, Social, Other)
// - Selectable Modality Events List
// - Comprehensive Detail Panel covering:
//   1. Summary
//   2. The Event Itself
//   3. Related Disasters (Whatever is Happening)
//   4. Area Affected
//   5. Sites of Official Channels, News & Social Media

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { KpiCard, MapView, SeverityBadge, EpistemicBadge, StatusBadge } = window.DisasterComponents || window;

  const ModalityEventsView = ({ onNavigate = null }) => {
    const [kpis, setKpis] = useState({
      total: 142,
      earthquake: 4,
      flood: 28,
      landslide: 36,
      weather: 48,
      news: 64,
      social: 71,
      other: 2
    });

    const [modalityList, setModalityList] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [activeTab, setActiveTab] = useState("summary");

    const [modalityFilter, setModalityFilter] = useState("All Modalities");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [page, setPage] = useState(1);

    useEffect(() => {
      let isSubscribed = true;

      const fetchModalityEvents = async () => {
        try {
          let url = `/api/v1/modality-events?page=${page}&limit=15`;
          if (modalityFilter !== "All Modalities") url += `&modality=${encodeURIComponent(modalityFilter)}`;
          if (statusFilter !== "All Status") url += `&status=${encodeURIComponent(statusFilter.toLowerCase())}`;

          const res = await fetch(url);
          if (!res.ok) return;
          const data = await res.json();

          if (!isSubscribed) return;

          const items = Array.isArray(data) ? data : (data.modality_events || data.events || []);
          setModalityList(items);

          if (data.kpis) {
            setKpis(prev => ({ ...prev, ...data.kpis }));
          }

          if (items.length > 0 && !selectedId) {
            setSelectedId(items[0].modality_event_id || items[0].id);
          }
        } catch (err) {
          console.error("Error loading modality events:", err);
        }
      };

      fetchModalityEvents();
      return () => { isSubscribed = false; };
    }, [page, modalityFilter, statusFilter]);

    useEffect(() => {
      if (!selectedId) return;
      let isSubscribed = true;

      const fetchDetail = async () => {
        try {
          const res = await fetch(`/api/v1/modality-events/${selectedId}`);
          if (!res.ok) throw new Error("Failed to load modality event detail");
          const detail = await res.json();
          if (isSubscribed) {
            setSelectedDetail(detail);
          }
        } catch (err) {
          console.error("Error loading modality detail:", err);
        }
      };

      fetchDetail();
      return () => { isSubscribed = false; };
    }, [selectedId]);

    const currentItem = selectedDetail || modalityList.find(m => (m.modality_event_id || m.id) === selectedId) || {
      modality_event_id: "ME-WTH-2026-10-09-001",
      title: "Heavy Rainfall Detection ME-WTH-2026-10-09-001",
      modality: "Weather",
      source: "IMD AWS & CWC Basukedar Station",
      hazard_name: "Heavy Rainfall",
      location: "Basukedar, Rudraprayag, Uttarakhand",
      timestamp: "2026-10-09 08:25 IST",
      confidence: 0.98,
      classification: "Detected Event",
      status: "Processed",
      severity: "Critical",
      matched_unified_event_id: "EV-RAIN-2026-10-08-002",
      description: "Automated weather and river gauge stations recorded 128.4 mm of intense rainfall within 6 hours (peaking at 32.1 mm/hr), crossing the critical flash flood and landslide trigger threshold across the Mandakini river basin."
    };

    const keyInfo = currentItem.key_information || {};
    const lat = keyInfo.latitude || 30.4392;
    const lon = keyInfo.longitude || 79.0563;

    // 1. Event Itself Details
    const eventItself = {
      name: currentItem.title || "Heavy Rainfall Detection",
      code: currentItem.modality_event_code || currentItem.modality_event_id || "ME-WTH-2026-10-09-001",
      hazard: currentItem.hazard_name || currentItem.hazard_type || "Heavy Rainfall",
      modality: currentItem.domain || currentItem.modality || "Weather Station",
      severity: currentItem.severity || "Critical",
      magnitude: keyInfo.cumulative_6h || keyInfo.magnitude || "128.4 mm in 6 hrs (Peak: 32.1 mm/hr)",
      station: keyInfo.monitoring_station || currentItem.station_or_source || "CWC_UK_Basukedar (Rudraprayag)",
      agency: keyInfo.telemetry_agency || "India Meteorological Department (IMD) & CWC",
      startTime: currentItem.start_time || "Oct 09, 2026 · 08:25 IST",
      threshold: keyInfo.threshold_exceeded || "Red Alert Threshold Exceeded (>90 mm / 6h)",
      unifiedEvent: keyInfo.matched_unified_event || "EV-RAIN-2026-10-08-002 (Heavy Rainfall in Mandakini Basin)"
    };

    // 2. Related Disasters Happening Right Now
    const relatedDisasters = [
      {
        id: "EV-LSD-2026-10-09-001",
        title: "Major Landslide & Highway Blockage at Basukedar (NH-107)",
        hazard: "Landslide",
        severity: "Critical",
        status: "Active",
        location: "Basukedar, Rudraprayag (KM 48+200)",
        impact: "340m of Kedarnath Highway blocked; 420 pilgrims moved to relief camp",
        relation: "Triggered by this heavy rainfall surge"
      },
      {
        id: "EV-FLD-2026-10-09-003",
        title: "Mandakini & Alaknanda River Water Level Surge",
        hazard: "Flood",
        severity: "High",
        status: "Active",
        location: "Rudraprayag & Srinagar River Front",
        impact: "Water level at 626.4m (+1.8m above warning mark); low-lying ghats evacuated",
        relation: "Downstream runoff from catchment rain"
      },
      {
        id: "EV-WTH-2026-10-09-004",
        title: "Cloudburst & Flash Flood Watch in Chamoli-Joshimath",
        hazard: "Heavy Rainfall",
        severity: "High",
        status: "Active",
        location: "Chamoli & Gopeshwar Sector",
        impact: " intense spell of 25–40 mm/hr continuing across adjacent valley",
        relation: "Same monsoon convective storm system"
      },
      {
        id: "EV-ROD-2026-10-09-005",
        title: "NH-58 Badrinath Highway Debris Fall near Banswara",
        hazard: "Landslide",
        severity: "Moderate",
        status: "Active",
        location: "Banswara, Rudraprayag",
        impact: "Single-lane clearance underway by BRO 752 BRTF excavators",
        relation: "Secondary slope failure along corridor"
      }
    ];

    // 3. Area Affected Details
    const areaAffected = {
      primaryDistrict: "Rudraprayag",
      adjacentDistricts: "Chamoli, Tehri Garhwal",
      tehsils: "Ukhimath, Jakholi, Rudraprayag Sadar, Karnaprayag",
      villages: "Basukedar, Agastyamuni, Tilwara, Silli, Chandrapuri (14 villages under watch)",
      roadsAffected: "NH-107 (Kedarnath Highway blocked at Basukedar), NH-58 (Badrinath Highway slow traffic)",
      riversAffected: "Mandakini River & Alaknanda Confluence",
      exposedPopulation: "42,500 residents across 14 gram panchayats",
      evacuatedCount: "420 people sheltered at Basukedar Community Relief Centre",
      radiusKm: "15 km impact radius around 30.4392° N, 79.0563° E",
      elevationRange: "850 m – 2,400 m ASL (Steep Himalayan valley slopes)"
    };

    // 4. Sites of Official Channels, News & Social Media
    const officialChannels = [
      {
        agency: "IMD Mausam (India Meteorological Dept)",
        role: "Official Weather Radar, Red Alerts & District Nowcasts",
        siteName: "mausam.imd.gov.in/dehradun",
        url: "https://mausam.imd.gov.in",
        update: "Bulletin #42: Red Alert issued for Rudraprayag & Chamoli"
      },
      {
        agency: "Central Water Commission (CWC Flood Portal)",
        role: "Live River Gauge Water Levels & Flood Forecasts",
        siteName: "ffs.india-water.gov.in",
        url: "https://ffs.india-water.gov.in",
        update: "Basukedar & Rudraprayag gauges reporting hourly stage rise"
      },
      {
        agency: "USDMA (Uttarakhand State Disaster Management)",
        role: "State Emergency Control Room (SEOC) Daily SITREPs",
        siteName: "usdma.uk.gov.in",
        url: "https://usdma.uk.gov.in",
        update: "SDRF teams & BRO machinery deployed on NH-107 & NH-58"
      },
      {
        agency: "NDMA SACHET (National Early Warning Portal)",
        role: "CAP Geo-Targeted Citizen SMS & Public Advisories",
        siteName: "sachet.ndma.gov.in",
        url: "https://sachet.ndma.gov.in",
        update: "Active CAP alert broadcast to mobile subscribers in Rudraprayag"
      }
    ];

    const newsSites = [
      {
        outlet: "PIB India (Press Information Bureau)",
        headline: "NDRF & SDRF teams pre-positioned across Garhwal division amid heavy rainfall",
        siteName: "pib.gov.in",
        url: "https://pib.gov.in",
        time: "25 mins ago",
        lang: "English"
      },
      {
        outlet: "Amar Ujala (उत्तराखंड ब्यूरो)",
        headline: "रुद्रप्रयाग: बसुकेदार में भारी बारिश से केदारनाथ हाईवे बंद, 420 यात्री सुरक्षित निकाले गए",
        siteName: "amarujala.com/uttarakhand",
        url: "https://www.amarujala.com/uttarakhand",
        time: "40 mins ago",
        lang: "Hindi"
      },
      {
        outlet: "Dainik Jagran Uttarakhand",
        headline: "मंदाकिनी और अलकनंदा का जलस्तर बढ़ा, नदी किनारे रहने वाले लोगों को अलर्ट",
        siteName: "jagran.com/uttarakhand",
        url: "https://www.jagran.com/uttarakhand",
        time: "1 hr ago",
        lang: "Hindi"
      },
      {
        outlet: "PTI / Hindustan Times",
        headline: "IMD issues red alert for Uttarakhand hills; BRO clearing debris on NH-107",
        siteName: "hindustantimes.com",
        url: "https://www.hindustantimes.com",
        time: "1.5 hrs ago",
        lang: "English"
      }
    ];

    const socialMediaSites = [
      {
        platform: "X (Twitter) · Official Handle",
        handle: "@USDMAUk",
        post: "SEOC Dehradun Update: NH-107 blocked near Basukedar due to debris slide. Travellers advised to halt at safe shelters in Agastyamuni & Tilwara.",
        url: "https://x.com/USDMAUk",
        time: "18 mins ago",
        verified: true
      },
      {
        platform: "X (Twitter) · Weather Handle",
        handle: "@Indiametdept",
        post: "Doppler Radar Dehradun shows intense convective clouds (52 dBZ) over Rudraprayag & Chamoli. Moderate to heavy spells likely for next 6 hours.",
        url: "https://x.com/Indiametdept",
        time: "32 mins ago",
        verified: true
      },
      {
        platform: "X (Twitter) · Uttarakhand Police",
        handle: "@uttarakhandcops",
        post: "Traffic Advisory: Police & SDRF personnel assisting commuters at Basukedar checkpost. Dial 112 or 1070 for emergency assistance.",
        url: "https://x.com/uttarakhandcops",
        time: "45 mins ago",
        verified: true
      },
      {
        platform: "YouTube / Telegram Field Clip",
        handle: "SDRF Uttarakhand Official",
        post: "Ground video from Basukedar bridge showing high water velocity in Mandakini tributary and ongoing JCB clearance.",
        url: "https://www.youtube.com",
        time: "50 mins ago",
        verified: true
      }
    ];

    const modTag = (mod) => {
      const s = String(mod || "").toLowerCase();
      if (s.includes("weather")) return "WTH";
      if (s.includes("seismic") || s.includes("earth")) return "EQK";
      if (s.includes("hydro") || s.includes("flood")) return "FLD";
      if (s.includes("news")) return "NWS";
      if (s.includes("social")) return "SOC";
      return "SEN";
    };

    return (
      <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-ink tracking-tight">
                Modality Events
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-ok-soft text-ok border border-ok/30 font-semibold">
                Individual Sensor Feeds
              </span>
            </div>
            <p className="text-sm font-normal text-muted mt-1">
              Events detected within individual modalities such as earthquake, weather, news, and social media.
            </p>
          </div>
        </div>

        {/* 8-Column Modality KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
          <KpiCard title="Total" value={kpis.total || 142} delta="100% indexed" deltaTone="neutral" />
          <KpiCard title="Earthquake" value={kpis.earthquake || 4} delta="7.5% share" deltaTone="neutral" />
          <KpiCard title="Flood" value={kpis.flood || 28} delta="19.1% share" deltaTone="warn" />
          <KpiCard title="Landslide" value={kpis.landslide || 36} delta="15.4% share" deltaTone="crit" />
          <KpiCard title="Weather" value={kpis.weather || 48} delta="24.5% share" deltaTone="neutral" />
          <KpiCard title="News" value={kpis.news || 64} delta="13.3% share" deltaTone="neutral" />
          <KpiCard title="Social" value={kpis.social || 71} delta="14.7% share" deltaTone="neutral" />
          <KpiCard title="Other" value={kpis.other || 2} delta="5.6% share" deltaTone="neutral" />
        </div>

        {/* Filter Bar */}
        <div className="bg-surface border border-line rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              className="bg-surface2 text-ink border border-line rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-accent"
            >
              <option value="All Modalities">All Modalities</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Flood">Flood</option>
              <option value="Landslide">Landslide</option>
              <option value="Weather">Weather</option>
              <option value="News">News</option>
              <option value="Social Media">Social Media</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface2 text-ink border border-line rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-accent"
            >
              <option value="All Status">All Status</option>
              <option value="Processed">Processed</option>
              <option value="Pending">Pending</option>
            </select>

            <button
              onClick={() => {
                setModalityFilter("All Modalities");
                setStatusFilter("All Status");
              }}
              className="text-xs font-medium text-muted hover:text-ink px-2.5 py-1.5 rounded-lg hover:bg-surface2"
            >
              Clear Filters
            </button>
          </div>
          <div className="text-xs text-muted tabular-nums">
            Showing <strong className="font-bold text-ink">{modalityList.length}</strong> events
          </div>
        </div>

        {/* Main Grid: Left Modality List (4 cols) + Right Comprehensive Detail Panel (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: MODALITY EVENT LIST */}
          <div className="lg:col-span-4 bg-surface border border-line rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-surface2 border-b border-line flex items-center justify-between">
              <span className="panel-title">Modality Events ({modalityList.length})</span>
              <span className="text-xs text-muted tabular-nums">Page {page}</span>
            </div>

            <div className="divide-y divide-line max-h-[780px] overflow-y-auto">
              {modalityList.map((item) => {
                const id = item.modality_event_id || item.id;
                const isSelected = id === selectedId;
                const conf = item.confidence || 0.95;

                return (
                  <div
                    key={id}
                    onClick={() => setSelectedId(id)}
                    className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 border-l-4 ${
                      isSelected
                        ? 'bg-accent-soft/40 border-l-accent'
                        : 'bg-surface hover:bg-surface2 border-l-transparent'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-surface2 border border-line flex items-center justify-center shrink-0 text-xs font-bold text-ink2">
                      {modTag(item.domain || item.modality)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-bold text-[14.5px] text-ink truncate">
                          {item.title || item.event_name || `${item.hazard_name || 'Hazard'} Detection`}
                        </h3>
                        <span className="text-xs font-bold text-accent tabular-nums">
                          {conf.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-xs font-normal text-muted mt-0.5 flex items-center justify-between tabular-nums">
                        <span className="truncate">{item.station_or_source || item.modality || "Sensor Feed"}</span>
                        <span>{item.hazard_name || "Active"}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-line">
                        <EpistemicBadge status={item.classification || "Detected"} />
                        <SeverityBadge severity={item.severity || "High"} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: COMPREHENSIVE DETAIL PANEL */}
          <div className="lg:col-span-8 bg-surface border border-line rounded-xl overflow-hidden shadow-xs">
            {/* Top Event Banner */}
            <div className="p-5 bg-surface2 border-b border-line">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-ink tracking-tight">
                    {eventItself.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-normal text-muted">
                    <span className="px-2 py-0.5 rounded bg-surface border border-line text-ink2 font-semibold">
                      {eventItself.code}
                    </span>
                    <span>&bull;</span>
                    <span>{eventItself.station}</span>
                    <span>&bull;</span>
                    <span className="tabular-nums">{eventItself.startTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <SeverityBadge severity={eventItself.severity} />
                  <EpistemicBadge status={currentItem.classification || "Detected"} />
                  <StatusBadge status={currentItem.status || "Processed"} />
                </div>
              </div>

              {/* Navigation Sub-tabs for the 5 Requested Sections */}
              <div className="flex flex-wrap border-b border-line mt-4 -mb-5 text-xs font-semibold gap-1">
                {[
                  { id: 'summary', label: 'Summary (All Info)' },
                  { id: 'event', label: 'The Event Itself' },
                  { id: 'related', label: `Related Disasters (${relatedDisasters.length})` },
                  { id: 'area', label: 'Area Affected' },
                  { id: 'sources', label: 'Official, News & Social Sites' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-2.5 border-b-2 transition-colors ${
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

            <div className="p-5 space-y-6">
              {/* 1. SUMMARY SECTION */}
              {(activeTab === 'summary' || activeTab === 'event') && (
                <div className="bg-surface2 rounded-xl p-4 border border-line">
                  <h3 className="panel-title mb-1.5">Summary — What is Happening</h3>
                  <p className="text-sm font-normal text-ink2 leading-relaxed">
                    {currentItem.description || "Automated weather and river gauge stations recorded 128.4 mm of intense rainfall within 6 hours (peaking at 32.1 mm/hr), crossing the critical flash flood and landslide trigger threshold across the Mandakini river basin in Rudraprayag."}
                  </p>
                </div>
              )}

              {/* 2. THE EVENT ITSELF + AREA MAP */}
              {(activeTab === 'summary' || activeTab === 'event') && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Left: The Event Itself */}
                  <div className="md:col-span-7 bg-surface rounded-xl p-4 border border-line space-y-2.5">
                    <div className="flex items-center justify-between border-b border-line pb-2">
                      <div>
                        <h3 className="panel-title">The Event Itself</h3>
                        <p className="text-xs text-muted">Primary parameters of this modality event</p>
                      </div>
                      <SeverityBadge severity={eventItself.severity} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-2.5 rounded-lg bg-surface2 border border-line">
                        <div className="text-muted font-normal">Hazard Type</div>
                        <div className="text-sm font-bold text-ink mt-0.5">{eventItself.hazard}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-surface2 border border-line">
                        <div className="text-muted font-normal">Measured Intensity / Magnitude</div>
                        <div className="text-sm font-bold text-accent mt-0.5">{eventItself.magnitude}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-surface2 border border-line">
                        <div className="text-muted font-normal">Monitoring Station / Feed</div>
                        <div className="text-xs font-bold text-ink mt-0.5">{eventItself.station}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-surface2 border border-line">
                        <div className="text-muted font-normal">Threshold Status</div>
                        <div className="text-xs font-bold text-crit mt-0.5">{eventItself.threshold}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
                      <span className="text-muted">Linked Main Disaster Event:</span>
                      <button
                        type="button"
                        onClick={() => onNavigate && onNavigate('events')}
                        className="font-bold text-accent hover:underline"
                      >
                        {eventItself.unifiedEvent} &rarr;
                      </button>
                    </div>
                  </div>

                  {/* Right: Event Map Footprint */}
                  <div className="md:col-span-5 bg-surface rounded-xl p-4 border border-line flex flex-col justify-between">
                    <div className="mb-2">
                      <h3 className="panel-title">Event Location Map</h3>
                      <p className="text-xs text-muted">{areaAffected.primaryDistrict} ({lat.toFixed(3)}°N, {lon.toFixed(3)}°E)</p>
                    </div>
                    <div className="h-44 rounded-lg overflow-hidden border border-line relative">
                      <MapView
                        center={[lat, lon]}
                        zoom={10}
                        markers={[{
                          lat: lat,
                          lon: lon,
                          title: eventItself.name,
                          hazard: eventItself.hazard,
                          severity: eventItself.severity
                        }]}
                        showBasemapSwitcher={false}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. RELATED DISASTERS (WHATEVER IS HAPPENING) */}
              {(activeTab === 'summary' || activeTab === 'related') && (
                <div className="bg-surface rounded-xl p-4 border border-line space-y-3">
                  <div className="flex items-center justify-between border-b border-line pb-2.5">
                    <div>
                      <h3 className="panel-title">Related Disasters Happening Right Now</h3>
                      <p className="text-xs text-muted">Active cascading incidents and hazards connected to this event</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('events')}
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      View All Active Events &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {relatedDisasters.map((dis) => (
                      <div
                        key={dis.id}
                        onClick={() => onNavigate && onNavigate('events')}
                        className="p-3.5 rounded-lg bg-surface2 hover:bg-surface3 border border-line cursor-pointer transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-accent">{dis.hazard} &bull; {dis.id}</span>
                          <div className="flex items-center gap-1.5">
                            <SeverityBadge severity={dis.severity} />
                            <StatusBadge status={dis.status} />
                          </div>
                        </div>
                        <h4 className="text-[14px] font-bold text-ink leading-snug">{dis.title}</h4>
                        <p className="text-xs font-normal text-ink2">{dis.impact}</p>
                        <div className="flex items-center justify-between text-[11.5px] text-muted pt-1 border-t border-line">
                          <span>Location: <strong className="text-ink2">{dis.location}</strong></span>
                          <span className="italic">{dis.relation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. AREA AFFECTED */}
              {(activeTab === 'summary' || activeTab === 'area') && (
                <div className="bg-surface rounded-xl p-4 border border-line space-y-3">
                  <div className="flex items-center justify-between border-b border-line pb-2.5">
                    <div>
                      <h3 className="panel-title">Area Affected</h3>
                      <p className="text-xs text-muted">Districts, blocks, villages, roads, and residents impacted by this event</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warn-soft text-warn border border-warn/30">
                      {areaAffected.radiusKm}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-surface2 border border-line">
                      <div className="text-muted font-normal">Primary &amp; Adjacent Districts</div>
                      <div className="text-sm font-bold text-ink mt-0.5">{areaAffected.primaryDistrict}</div>
                      <div className="text-xs text-muted mt-0.5">Adjacent: {areaAffected.adjacentDistricts}</div>
                    </div>

                    <div className="p-3 rounded-lg bg-surface2 border border-line">
                      <div className="text-muted font-normal">Tehsils / Blocks Affected</div>
                      <div className="text-sm font-bold text-ink mt-0.5">{areaAffected.tehsils}</div>
                    </div>

                    <div className="p-3 rounded-lg bg-surface2 border border-line">
                      <div className="text-muted font-normal">Villages &amp; Gram Panchayats</div>
                      <div className="text-xs font-bold text-ink mt-0.5">{areaAffected.villages}</div>
                    </div>

                    <div className="p-3 rounded-lg bg-surface2 border border-line">
                      <div className="text-muted font-normal">Highways &amp; Roads Impacted</div>
                      <div className="text-xs font-bold text-crit mt-0.5">{areaAffected.roadsAffected}</div>
                    </div>

                    <div className="p-3 rounded-lg bg-surface2 border border-line">
                      <div className="text-muted font-normal">Population &amp; Evacuations</div>
                      <div className="text-xs font-bold text-ink mt-0.5">{areaAffected.exposedPopulation}</div>
                      <div className="text-xs text-ok font-semibold mt-0.5">{areaAffected.evacuatedCount}</div>
                    </div>

                    <div className="p-3 rounded-lg bg-surface2 border border-line">
                      <div className="text-muted font-normal">River Basins &amp; Terrain</div>
                      <div className="text-xs font-bold text-ink mt-0.5">{areaAffected.riversAffected}</div>
                      <div className="text-xs text-muted mt-0.5">{areaAffected.elevationRange}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. SITES OF OFFICIAL CHANNELS, NEWS & SOCIAL MEDIA */}
              {(activeTab === 'summary' || activeTab === 'sources') && (
                <div className="bg-surface rounded-xl p-4 border border-line space-y-4">
                  <div className="border-b border-line pb-2.5">
                    <h3 className="panel-title">Official Channels, News &amp; Social Media</h3>
                    <p className="text-xs text-muted">Direct links to official government portals, news coverage, and verified social media dispatches for this event</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Column A: Official Channel Sites */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-ink">Official Government Sites</h4>
                        <EpistemicBadge status="Official" />
                      </div>
                      {officialChannels.map((ch, i) => (
                        <div key={i} className="p-3 rounded-lg bg-surface2 border border-line space-y-1">
                          <div className="text-xs font-bold text-ink">{ch.agency}</div>
                          <p className="text-xs font-normal text-muted">{ch.update}</p>
                          <div className="pt-1 flex items-center justify-between text-xs">
                            <span className="text-muted truncate">{ch.siteName}</span>
                            <a
                              href={ch.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-accent hover:underline shrink-0"
                            >
                              Visit Site &rarr;
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Column B: News Sites */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-ink">News Coverage &amp; Portals</h4>
                        <EpistemicBadge status="Reported" />
                      </div>
                      {newsSites.map((nw, i) => (
                        <div key={i} className="p-3 rounded-lg bg-surface2 border border-line space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-ink2">{nw.outlet}</span>
                            <span className="text-muted">{nw.lang} &bull; {nw.time}</span>
                          </div>
                          <p className="text-xs font-semibold text-ink leading-snug">{nw.headline}</p>
                          <div className="pt-1 flex items-center justify-between text-xs">
                            <span className="text-muted truncate">{nw.siteName}</span>
                            <a
                              href={nw.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-accent hover:underline shrink-0"
                            >
                              Read Article &rarr;
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Column C: Social Media Sites & Feeds */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-ink">Social Media Updates</h4>
                        <EpistemicBadge status="Verified" />
                      </div>
                      {socialMediaSites.map((sm, i) => (
                        <div key={i} className="p-3 rounded-lg bg-surface2 border border-line space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-accent">{sm.handle}</span>
                            <span className="text-muted">{sm.time}</span>
                          </div>
                          <p className="text-xs font-normal text-ink2 leading-snug">{sm.post}</p>
                          <div className="pt-1 flex items-center justify-between text-xs">
                            <span className="text-muted truncate">{sm.platform}</span>
                            <a
                              href={sm.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-accent hover:underline shrink-0"
                            >
                              Open Post &rarr;
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  window.DisasterViews = window.DisasterViews || {};
  window.DisasterViews.ModalityEventsView = ModalityEventsView;
  window.ModalityEventsView = ModalityEventsView;
})();
