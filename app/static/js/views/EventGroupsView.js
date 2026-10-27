// Disaster Intelligence Multimodal Platform - View 5: Event Groups / Episodes (image9.png)
// Specifications: 5 KPI Cards, Left Episode List, Right Detail Panel with
// Horizontal Episode Relationship Graph (SVG DAG), Causal Link Badges, Combined Impacts (6 mini-cards), Contributing Events List

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { KpiCard, MapView, EpisodeGraph, SeverityBadge, EpistemicBadge, StatusBadge } = window.DisasterComponents || window;

  const EventGroupsView = () => {
    // 5 KPI counts
    const [kpis, setKpis] = useState({
      total_episodes: 28,
      active_episodes: 9,
      multi_hazard: 16,
      high_impact: 7,
      resolved_episodes: 19
    });

    const [episodeList, setEpisodeList] = useState([]);
    const [selectedEpisodeId, setSelectedEpisodeId] = useState(null);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");

    // Filters
    const [hazardFilter, setHazardFilter] = useState("All Hazards");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [page, setPage] = useState(1);

    // Fetch episodes list
    useEffect(() => {
      let isSubscribed = true;

      const fetchEpisodes = async () => {
        try {
          let url = `/api/v1/event-groups?page=${page}&limit=10`;
          if (hazardFilter !== "All Hazards") url += `&hazard=${encodeURIComponent(hazardFilter)}`;
          if (statusFilter !== "All Status") url += `&status=${encodeURIComponent(statusFilter.toLowerCase())}`;

          const res = await fetch(url);
          if (!res.ok) return;
          const data = await res.json();

          if (!isSubscribed) return;

          const items = Array.isArray(data) ? data : (data.event_groups || data.episodes || []);
          setEpisodeList(items);

          if (data.kpis) {
            setKpis(prev => ({ ...prev, ...data.kpis }));
          }

          if (items.length > 0 && !selectedEpisodeId) {
            setSelectedEpisodeId(items[0].event_group_id || items[0].id);
          }
        } catch (err) {
          console.error("Error loading event groups:", err);
        }
      };

      fetchEpisodes();
      return () => { isSubscribed = false; };
    }, [page, hazardFilter, statusFilter]);

    // Fetch episode detail
    useEffect(() => {
      if (!selectedEpisodeId) return;
      let isSubscribed = true;

      const fetchDetail = async () => {
        try {
          const res = await fetch(`/api/v1/event-groups/${selectedEpisodeId}`);
          if (!res.ok) throw new Error("Failed to load episode detail");
          const detail = await res.json();
          if (isSubscribed) {
            setSelectedDetail(detail);
          }
        } catch (err) {
          console.error("Error loading episode detail:", err);
        }
      };

      fetchDetail();
      return () => { isSubscribed = false; };
    }, [selectedEpisodeId]);

    const episode = selectedDetail || episodeList.find(e => (e.event_group_id || e.id) === selectedEpisodeId) || {
      event_group_id: "EP-UTT-2026-10-001",
      title: "Rudraprayag Heavy Rainfall Episode",
      dates: "Oct 08, 2026 – Oct 10, 2026",
      locations: "Rudraprayag, Chamoli, Tehri Garhwal",
      primary_hazard: "Heavy Rainfall",
      impact_level: "High Impact",
      status: "Active",
      confidence: 0.82,
      combined_impact: "High",
      total_events_count: 5,
      graph: null,
      combined_impacts: [
        { label: "People Affected", value: "3,500" },
        { label: "Roads Blocked", value: "12 km" },
        { label: "Affected Area", value: "~ 65 km²" },
        { label: "Villages Affected", value: "5" },
        { label: "Reported Casualties", value: "2" },
        { label: "Secondary Risk", value: "High (Flood)" }
      ]
    };

    return (
      <div className="p-6 space-y-5 max-w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Event Groups (Episodes)</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                Multi-Hazard Cascades
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Explore multi-hazard event episodes and their causal relationships across time and space.
            </p>
          </div>
        </div>

        {/* 5 KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard title="Total Episodes" value={kpis.total_episodes || 28} trend="↑ 17%" subtitle="Tracked Cascades" icon="pulse" />
          <KpiCard title="Active Episodes" value={kpis.active_episodes || 9} trend="↑ 29%" subtitle="Current Incidents" icon="warning" iconColor="#ef4444" />
          <KpiCard title="Multi-Hazard" value={kpis.multi_hazard || 16} trend="↑ 45%" subtitle="Compound Threats" icon="alert" iconColor="#f97316" />
          <KpiCard title="High Impact" value={kpis.high_impact || 7} delta="27%" subtitle="Severe Disruption" icon="mountain" iconColor="#a855f7" />
          <KpiCard title="Resolved" value={kpis.resolved_episodes || 19} trend="↑ 12%" subtitle="Closed Cascades" icon="activity" iconColor="#10b981" />
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
              <option value="Heavy Rainfall">Heavy Rainfall</option>
              <option value="Landslide">Landslide</option>
              <option value="Flash Flood">Flash Flood</option>
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

        {/* Main Grid: Left Episode List + Right Detail Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: MASTER EPISODE LIST */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Multi-Hazard Episodes
              </h2>
              <span className="text-[11px] text-slate-400">{episodeList.length} total</span>
            </div>

            <div className="divide-y divide-slate-800/80 max-h-[700px] overflow-y-auto">
              {episodeList.map((item) => {
                const id = item.event_group_id || item.id;
                const isSelected = id === selectedEpisodeId;

                return (
                  <div
                    key={id}
                    onClick={() => setSelectedEpisodeId(id)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-l-4 border-blue-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-semibold text-xs text-slate-200 leading-snug">
                        {item.title || item.name || "Uttarakhand Episode"}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 shrink-0">
                        {item.impact_level || "High Impact"}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1">
                      📅 {item.dates || item.timeframe || "Oct 08 – 10, 2026"}
                    </div>

                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                      <span className="truncate">📍 {item.locations || item.region || "Rudraprayag"}</span>
                      <StatusBadge status={item.status || "Active"} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-900/60">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <span>Page {page} of 4</span>
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
              >
                Next
              </button>
            </div>
          </div>

          {/* RIGHT: EPISODE DETAIL PANEL */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow space-y-4 p-5">
            {/* Detail Header */}
            <div className="border-b border-slate-800 pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    {episode.title || "Rudraprayag Heavy Rainfall Episode"}
                  </h2>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-blue-400">{episode.event_group_id || "EP-UTT-2026-10-001"}</span>
                    <span>•</span>
                    <span>{episode.locations || "Rudraprayag, Chamoli, Tehri Garhwal"}</span>
                    <span>•</span>
                    <span>{episode.dates || "Oct 08 – 10, 2026"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    ⚠ High Impact
                  </span>
                  <StatusBadge status={episode.status || "Active"} />
                </div>
              </div>

              {/* 7 Sub-tabs */}
              <div className="flex flex-wrap border-b border-slate-800/80 mt-4 text-xs font-semibold gap-1">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'graph', label: 'Event Graph' },
                  { id: 'timeline', label: 'Timeline' },
                  { id: 'affected', label: 'Affected Areas' },
                  { id: 'impacts', label: 'Impacts' },
                  { id: 'contributing', label: 'Contributing Events (5)' },
                  { id: 'related', label: 'Related Episodes (3)' }
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

            {/* Sub-tab Content: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4 text-xs">
                {/* Horizontal Episode Relationship Graph (SVG DAG) */}
                <div>
                  <EpisodeGraph graph={episode.graph} />
                </div>

                {/* Middle Row: Map of Episode Events + Episode Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Map of Episode Events */}
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/60">
                    <div className="font-semibold text-slate-300 mb-2">Episode Perimeter & Event Nodes</div>
                    <div className="h-36 rounded-lg overflow-hidden border border-slate-700">
                      <MapView
                        center={[30.35, 78.95]}
                        zoom={8}
                        markers={[
                          { lat: 30.28, lon: 78.98, title: "Landslide", hazard: "Landslide", severity: "High" },
                          { lat: 30.45, lon: 79.05, title: "Rainfall", hazard: "Heavy Rainfall", severity: "High" },
                          { lat: 30.15, lon: 78.85, title: "River Rise", hazard: "Flood", severity: "Moderate" }
                        ]}
                        showBasemapSwitcher={false}
                      />
                    </div>
                  </div>

                  {/* Episode Information */}
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/60 space-y-1.5">
                    <div className="font-semibold text-slate-300 mb-1">Episode Summary</div>
                    <div className="flex justify-between py-0.5 border-b border-slate-700/40">
                      <span className="text-slate-400">Primary Hazard:</span>
                      <span className="text-slate-200 font-medium">Heavy Rainfall</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-700/40">
                      <span className="text-slate-400">Cascading Hazards:</span>
                      <span className="text-orange-400 font-medium">Landslide, Flood, Road Cutoff</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-700/40">
                      <span className="text-slate-400">Total Contributing:</span>
                      <span className="text-slate-200 font-bold">5 Events</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-700/40">
                      <span className="text-slate-400">Confidence Score:</span>
                      <span className="text-emerald-400 font-mono font-bold">0.82 (High)</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Expected Resolution:</span>
                      <span className="text-slate-300">Oct 10, 2026 23:59 IST</span>
                    </div>
                  </div>
                </div>

                {/* Combined Multi-Hazard Impacts (6 Mini-Cards) */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60">
                  <div className="font-bold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">
                    Combined Multi-Hazard Impacts
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    {[
                      { title: "People Affected", value: "3,500", icon: "👥" },
                      { title: "Roads Blocked", value: "12 km", icon: "🚧" },
                      { title: "Affected Area", value: "~ 65 km²", icon: "🗺" },
                      { title: "Villages Hit", value: "5", icon: "🏘" },
                      { title: "Injuries", value: "2", icon: "🏥" },
                      { title: "Secondary Risk", value: "High", icon: "⚠️" },
                    ].map((card, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50 text-center">
                        <span className="text-lg block mb-0.5">{card.icon}</span>
                        <div className="text-xs font-bold text-slate-100">{card.value}</div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">{card.title}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Contributing Events (5 Rows) */}
                <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/60">
                  <div className="font-semibold text-slate-300 mb-2">Key Contributing Events in Cascade</div>
                  <div className="space-y-2">
                    {[
                      { name: "Heavy Rainfall Ingestion (IMD)", time: "Oct 08, 06:00", status: "Observed", impact: "Trigger" },
                      { name: "Alaknanda River Level Rise (CWC)", time: "Oct 08, 12:00", status: "Observed", impact: "Hydrological" },
                      { name: "Landslide Incident near Banswara (PIB)", time: "Oct 08, 18:30", status: "Reported", impact: "Debris Flow" },
                      { name: "NH-58 Highway Disruption (Social Media)", time: "Oct 09, 07:45", status: "Observed", impact: "Infrastructure" },
                      { name: "Flash Flood Forecast Simulation (Model)", time: "Oct 09, 12:00", status: "Predicted", impact: "Projection" },
                    ].map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800 text-[11px]">
                        <span className="font-medium text-slate-200">{row.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">{row.time}</span>
                          <EpistemicBadge status={row.status} />
                          <span className="text-blue-400 font-mono text-[10px]">[{row.impact}]</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Other Sub-tabs fallback */}
            {activeTab !== 'overview' && (
              <div className="p-8 text-center bg-slate-800/30 rounded-xl border border-slate-700/40 text-slate-400 text-xs">
                <span className="text-2xl block mb-2">⚡</span>
                <span className="font-semibold text-slate-200 block mb-1">
                  Sub-Tab: {activeTab.toUpperCase()}
                </span>
                Displaying multi-modal cascade logs, temporal timelines, and spatial extents for {episode.event_group_id}.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  window.DisasterViews = window.DisasterViews || {};
  window.DisasterViews.EventGroupsView = EventGroupsView;
  window.EventGroupsView = EventGroupsView;
})();
