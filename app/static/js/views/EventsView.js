// Disaster Intelligence Multimodal Platform - View 3: Events / Unified Events (image4.png)
// Specifications: 6 KPI Cards, Left Master Event List with Thumbnails,
// Right Master-Detail Panel with 7 Sub-tabs (Overview, Timeline, Evidence, Modality Events, Affected Regions, Impacts, Related Events),
// Split Impact Comparison (Observed vs Predicted), Photo Carousel, Mini-Map

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { KpiCard, MapView, SeverityBadge, EpistemicBadge, StatusBadge } = window.DisasterComponents || window;

  const EventsView = () => {
    // KPI metrics
    const [kpiData, setKpiData] = useState({
      total_events: 127,
      active_events: 34,
      resolved_events: 78,
      high_severity: 32,
      moderate_severity: 46,
      low_severity: 31
    });

    // Master Event List state
    const [eventsList, setEventsList] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [selectedEventDetail, setSelectedEventDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Detail panel sub-tab
    const [activeTab, setActiveTab] = useState("overview");

    // Filters
    const [hazardFilter, setHazardFilter] = useState("All Hazards");
    const [severityFilter, setSeverityFilter] = useState("All Severities");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [page, setPage] = useState(1);

    // Fetch Events list
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

          // Select first item by default if none selected
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

    // Fetch single event detail when selection changes
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

    // Format detail fields
    const ev = selectedEventDetail || eventsList.find(e => (e.event_id || e.id) === selectedEventId) || {
      event_id: "EV-LSD-2026-10-09-001",
      title: "Landslide in Rudraprayag",
      hazard_name: "Landslide",
      location: "Rudraprayag, Uttarakhand",
      timestamp: "Oct 09, 2026 08:15 IST",
      severity: "High",
      status: "Active",
      confidence: 0.82,
      coordinates: [30.2849, 78.9867],
      elevation: "1,245 m",
      affected_area: "~ 25 km²",
      description: "Severe rainfall trigger caused slope failure along NH-58 near Banswara, blocking highway access and stranding transit vehicles. District disaster authorities and SDRF are actively engaged."
    };

    return (
      <div className="p-6 space-y-5 max-w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Events</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                Unified Multimodal Record
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Explore unified disaster events detected and corroborated across multiple sensing modalities.
            </p>
          </div>
        </div>

        {/* 6 KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard title="Total Events" value={kpiData.total_events || 127} trend="↑ 12%" subtitle="Detected" icon="pulse" />
          <KpiCard title="Active Events" value={kpiData.active_events || 34} trend="↑ 21%" subtitle="Ongoing response" icon="warning" iconColor="#ef4444" />
          <KpiCard title="Resolved Events" value={kpiData.resolved_events || 78} trend="↑ 8%" subtitle="Closed operations" icon="activity" iconColor="#10b981" />
          <KpiCard title="High Severity" value={kpiData.high_severity || 32} delta="25%" subtitle="Priority Level 1" icon="alert" iconColor="#f97316" />
          <KpiCard title="Moderate" value={kpiData.moderate_severity || 46} delta="36%" subtitle="Level 2 Watch" icon="cloud" iconColor="#eab308" />
          <KpiCard title="Low" value={kpiData.low_severity || 31} delta="24%" subtitle="Advisory / Minor" icon="waves" iconColor="#38bdf8" />
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={hazardFilter}
              onChange={(e) => setHazardFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
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
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
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
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
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
              className="text-slate-400 hover:text-slate-200 px-2 py-1"
            >
              Clear Filters
            </button>
          </div>
          <div className="text-slate-400">
            Sort: <span className="text-slate-200 font-medium">Newest First ▾</span>
          </div>
        </div>

        {/* Main Grid: Master List (Left 38%) + Detail Panel (Right 62%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: MASTER EVENT LIST */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Event Records ({eventsList.length})
              </h2>
              <span className="text-[11px] text-slate-400">Page {page}</span>
            </div>

            <div className="divide-y divide-slate-800/80 max-h-[750px] overflow-y-auto">
              {eventsList.map((item) => {
                const id = item.event_id || item.id;
                const isSelected = id === selectedEventId;
                const hazard = item.hazard_name || item.hazard || "Hazard";

                return (
                  <div
                    key={id}
                    onClick={() => setSelectedEventId(id)}
                    className={`p-3 cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-slate-800/90 border-l-4 border-blue-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Thumbnail / Icon container */}
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-lg">
                      {hazard.includes("Landslide") ? "⛰" : (hazard.includes("Rain") ? "🌧" : (hazard.includes("Flood") ? "🌊" : "⚠️"))}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-semibold text-xs text-slate-200 truncate">
                          {item.title || item.event_title || `${hazard} in ${item.district || 'Uttarakhand'}`}
                        </h3>
                        <SeverityBadge severity={item.severity || "Moderate"} />
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                        <span className="truncate">📍 {item.location || item.district || "Uttarakhand"}</span>
                        <span className="shrink-0">{item.time || item.timestamp || "Recent"}</span>
                      </div>

                      <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-800/60">
                        <span className="text-[10px] font-mono text-slate-500 truncate">{id}</span>
                        <StatusBadge status={item.status || "Active"} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-900/60">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <span>Page {page} of 9</span>
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
              >
                Next
              </button>
            </div>
          </div>

          {/* RIGHT: UNIFIED EVENT MASTER-DETAIL PANEL */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow space-y-4 p-5">
            {/* Detail Header */}
            <div className="border-b border-slate-800 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⛰</span>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      {ev.title || "Landslide in Rudraprayag"}
                    </h2>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-blue-400">{ev.event_id || "EV-LSD-2026-10-09-001"}</span>
                      <span>•</span>
                      <span>{ev.location || "Rudraprayag, Uttarakhand"}</span>
                      <span>•</span>
                      <span>{ev.timestamp || "Oct 09, 2026 08:15 IST"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <SeverityBadge severity={ev.severity || "High"} />
                  <StatusBadge status={ev.status || "Active"} />
                  <button className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
                    Share
                  </button>
                </div>
              </div>

              {/* 7 Sub-tabs Navigation */}
              <div className="flex flex-wrap border-b border-slate-800/80 mt-4 text-xs font-semibold gap-1">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'timeline', label: 'Timeline' },
                  { id: 'evidence', label: 'Evidence (12)' },
                  { id: 'modality', label: 'Modality Events (4)' },
                  { id: 'regions', label: 'Affected Regions (3)' },
                  { id: 'impacts', label: 'Impacts (6)' },
                  { id: 'related', label: 'Related Events (3)' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4 text-xs">
                {/* Top Row: Mini-Map + Key Information + Photo Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Mini-Map */}
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/60">
                    <div className="font-semibold text-slate-300 mb-2">Location Focus</div>
                    <div className="h-32 rounded-lg overflow-hidden border border-slate-700">
                      <MapView
                        center={ev.coordinates || [30.2849, 78.9867]}
                        zoom={9}
                        markers={[{
                          lat: (ev.coordinates && ev.coordinates[0]) || 30.2849,
                          lon: (ev.coordinates && ev.coordinates[1]) || 78.9867,
                          title: ev.title,
                          hazard: ev.hazard_name,
                          severity: ev.severity
                        }]}
                        showBasemapSwitcher={false}
                      />
                    </div>
                  </div>

                  {/* Key Information */}
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/60 space-y-1.5">
                    <div className="font-semibold text-slate-300 mb-1">Key Metrics</div>
                    <div className="flex justify-between py-0.5 border-b border-slate-700/40">
                      <span className="text-slate-400">Hazard Type:</span>
                      <span className="text-slate-200 font-medium">{ev.hazard_name || "Landslide"}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-700/40">
                      <span className="text-slate-400">Confidence:</span>
                      <span className="text-emerald-400 font-mono font-bold">{(ev.confidence || 0.82) * 100}%</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-700/40">
                      <span className="text-slate-400">Coordinates:</span>
                      <span className="text-slate-300 font-mono text-[10px]">30.28° N, 78.98° E</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-700/40">
                      <span className="text-slate-400">Elevation:</span>
                      <span className="text-slate-300">1,245 m</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Affected Area:</span>
                      <span className="text-slate-300">~ 25 km²</span>
                    </div>
                  </div>

                  {/* Photo Gallery Thumbnail Strip */}
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-300">Photo Evidence</span>
                        <span className="text-[10px] text-slate-400">📷 1 of 6</span>
                      </div>
                      <div className="h-24 rounded-lg bg-slate-900 border border-slate-700 flex flex-col items-center justify-center p-2 text-center text-slate-400">
                        <span className="text-2xl mb-1">📸</span>
                        <span className="text-[10px]">Slope debris failure on NH-58</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <div className="w-8 h-8 rounded bg-slate-700 border border-slate-600 flex items-center justify-center text-xs">🏞</div>
                      <div className="w-8 h-8 rounded bg-slate-700 border border-slate-600 flex items-center justify-center text-xs">🛰</div>
                      <div className="w-8 h-8 rounded bg-slate-700 border border-slate-600 flex items-center justify-center text-[10px] text-blue-400 font-bold">+4</div>
                    </div>
                  </div>
                </div>

                {/* Narrative Description */}
                <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/60">
                  <div className="font-semibold text-slate-300 mb-1">Event Narrative</div>
                  <p className="text-slate-300 leading-relaxed">
                    {ev.description || "Severe rainfall trigger caused slope failure along NH-58 near Banswara, blocking highway access and stranding transit vehicles. District disaster authorities and SDRF are actively engaged."}
                  </p>
                </div>

                {/* Split Impact Comparison (Observed vs Potential/Predicted) */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60">
                  <div className="font-bold text-slate-200 mb-3 text-xs uppercase tracking-wider">
                    Observed vs. Predicted Impacts (Split Comparison)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Observed Impacts */}
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <span>✔</span>
                        <span>Observed Impacts (Verified Ground Reports)</span>
                      </div>
                      <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                        <li><b>3,500</b> Population directly affected</li>
                        <li><b>12 km</b> Roads blocked (NH-58 stretch)</li>
                        <li><b>3</b> Reported minor casualties / stranded buses</li>
                        <li><b>5</b> Hamlets without direct vehicular access</li>
                      </ul>
                    </div>

                    {/* Right: Potential / Predicted Impacts */}
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-purple-500/30 space-y-2">
                      <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
                        <span>📊</span>
                        <span>Potential & Predicted Impacts (Model Forecast)</span>
                      </div>
                      <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                        <li><b>High Risk</b> of secondary landslides within 24h</li>
                        <li><b>Moderate Risk</b> of river impoundment & flash flood</li>
                        <li><b>~ 5,000</b> Additional downstream residents at risk</li>
                        <li><b>24-48h</b> Expected clearance time by BRO / SDRF</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Contributing Modality Events & Related Events */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                    <div className="font-semibold text-slate-300 mb-2">Contributing Modality Events</div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between py-1 border-b border-slate-700/30">
                        <span>🌧 IMD Heavy Rainfall Detection</span>
                        <span className="text-emerald-400 font-mono">0.82</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-700/30">
                        <span>📰 PIB Media Incident Report</span>
                        <span className="text-emerald-400 font-mono">0.78</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>⛰ GSI Landslide Susceptibility Match</span>
                        <span className="text-emerald-400 font-mono">0.71</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                    <div className="font-semibold text-slate-300 mb-2">Related Unified Events</div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between py-1 border-b border-slate-700/30">
                        <span>🌊 Alaknanda River Level Rise</span>
                        <SeverityBadge severity="High" />
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-700/30">
                        <span>🌧 Heavy Rain in Tehri Garhwal</span>
                        <SeverityBadge severity="Moderate" />
                      </div>
                      <div className="flex justify-between py-1">
                        <span>🚧 NH-58 Road Disruption</span>
                        <SeverityBadge severity="Moderate" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other sub-tabs fallbacks */}
            {activeTab !== 'overview' && (
              <div className="p-8 text-center bg-slate-800/30 rounded-xl border border-slate-700/40 text-slate-400 text-xs">
                <span className="text-2xl block mb-2">📋</span>
                <span className="font-semibold text-slate-200 block mb-1">
                  Sub-Tab: {activeTab.toUpperCase()}
                </span>
                Displaying detailed multi-source evidence, telemetry logs, and geospatial attributes for {ev.event_id || "this event"}.
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
