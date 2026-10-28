// Disaster Intelligence Platform — View 5: Event Groups / Episodes (Multi-Hazard Cascades)
// Light Operational Theme: 5-Cell Hairline Strip, Master Episode List, Rectangular Causal Cascade Graph & Impact Matrix

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { KpiCard, MapView, EpisodeGraph, SeverityBadge, EpistemicBadge, StatusBadge } = window.DisasterComponents || window;

  const EventGroupsView = () => {
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

    const [hazardFilter, setHazardFilter] = useState("All Hazards");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [page, setPage] = useState(1);

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
      title: "Rudraprayag Heavy Rainfall Cascade Episode",
      dates: "2026-10-08 – 2026-10-10",
      locations: "Rudraprayag, Chamoli, Tehri Garhwal",
      primary_hazard: "Heavy Rainfall",
      impact_level: "High Impact",
      status: "Active",
      confidence: 0.82,
      combined_impact: "High",
      total_events_count: 5,
      graph: null
    };

    return (
      <div className="p-4 space-y-4 max-w-full">
        {/* Header */}
        <div className="bg-surface border border-line rounded-[2px] p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-ink tracking-tight">
                Event Groups (Multi-Hazard Cascade Episodes)
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded-[2px] font-mono uppercase tracking-wider bg-info-soft text-info border-l-2 border-info font-semibold">
                CAUSAL DAG CLUSTERS
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Compound disaster episodes linking primary meteorological triggers to downstream hydrological, geotechnical, and infrastructure cascades.
            </p>
          </div>
          <div className="text-[11px] font-mono text-muted tabular-nums">
            TRACKED CASCADES: <strong className="text-ink">{kpis.total_episodes || 28}</strong>
          </div>
        </div>

        {/* 5-Column Hairline KPI Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-line border border-line rounded-[2px] overflow-hidden">
          <KpiCard title="Total Episodes" value={kpis.total_episodes || 28} delta="+4 vs 30d avg" deltaTone="neutral" subtitle="Tracked cascades" />
          <KpiCard title="Active Episodes" value={kpis.active_episodes || 9} delta="32.1% active" deltaTone="crit" subtitle="Ongoing response" />
          <KpiCard title="Multi-Hazard" value={kpis.multi_hazard || 16} delta="57.1% compound" deltaTone="warn" subtitle="2+ linked hazards" />
          <KpiCard title="High Impact" value={kpis.high_impact || 7} delta="25.0% severe" deltaTone="crit" subtitle="Major disruption" />
          <KpiCard title="Resolved" value={kpis.resolved_episodes || 19} delta="67.9% closed" deltaTone="ok" subtitle="Archived cascades" />
        </div>

        {/* Filter Bar */}
        <div className="bg-surface border border-line rounded-[2px] px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-muted pr-1">
              EPISODE FILTER:
            </span>
            <select
              value={hazardFilter}
              onChange={(e) => setHazardFilter(e.target.value)}
              className="bg-surface2 text-ink border border-line rounded-[2px] px-2.5 py-1 text-xs focus:outline-none focus:border-accent"
            >
              <option value="All Hazards">All Primary Triggers</option>
              <option value="Heavy Rainfall">Heavy Rainfall</option>
              <option value="Landslide">Landslide</option>
              <option value="Flash Flood">Flash Flood</option>
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
                setStatusFilter("All Status");
              }}
              className="text-[11px] font-mono uppercase tracking-wider text-muted hover:text-ink px-2 py-1 rounded-[2px] hover:bg-surface2"
            >
              Reset
            </button>
          </div>
          <div className="text-[11px] font-mono text-muted">
            SORT: <span className="text-ink font-semibold">CHRONOLOGICAL DESC</span>
          </div>
        </div>

        {/* Main Grid: Left Episode List (4 cols) + Right Detail Panel (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT: MASTER EPISODE LIST */}
          <div className="lg:col-span-4 bg-surface border border-line rounded-[2px] overflow-hidden">
            <div className="px-3.5 py-2.5 bg-surface2 border-b border-line flex items-center justify-between">
              <span className="panel-title">Cascade Episodes</span>
              <span className="text-[10px] font-mono text-muted tabular-nums">{episodeList.length} ITEMS</span>
            </div>

            <div className="divide-y divide-line max-h-[700px] overflow-y-auto">
              {episodeList.map((item) => {
                const id = item.event_group_id || item.id;
                const isSelected = id === selectedEpisodeId;

                return (
                  <div
                    key={id}
                    onClick={() => setSelectedEpisodeId(id)}
                    className={`p-3 cursor-pointer transition-colors border-l-[3px] ${
                      isSelected
                        ? 'bg-accent-soft/50 border-l-accent'
                        : 'bg-surface hover:bg-surface2 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-xs text-ink leading-snug">
                        {item.title || item.name || "Uttarakhand Episode"}
                      </h3>
                      <SeverityBadge severity={item.impact_level || "High"} />
                    </div>

                    <div className="text-[10px] font-mono text-muted mt-1 tabular-nums">
                      WINDOW: {item.dates || item.timeframe || "2026-10-08 – 2026-10-10"}
                    </div>

                    <div className="text-[11px] text-ink2 mt-1 pt-1 border-t border-line flex items-center justify-between">
                      <span className="truncate font-mono text-[10px]">{item.locations || item.region || "Rudraprayag"}</span>
                      <StatusBadge status={item.status || "Active"} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="px-3 py-2 border-t border-line flex items-center justify-between text-[11px] font-mono text-muted bg-surface2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-[2px] bg-surface border border-line hover:border-line-strong text-ink disabled:opacity-40"
              >
                &larr; PREV
              </button>
              <span className="tabular-nums">PAGE {page} OF 4</span>
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-2.5 py-1 rounded-[2px] bg-surface border border-line hover:border-line-strong text-ink"
              >
                NEXT &rarr;
              </button>
            </div>
          </div>

          {/* RIGHT: EPISODE DETAIL PANEL */}
          <div className="lg:col-span-8 bg-surface border border-line rounded-[2px] overflow-hidden">
            {/* Detail Header */}
            <div className="p-4 bg-surface2 border-b border-line">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded-[2px] bg-ink text-white font-mono text-[10px] font-semibold">
                      {episode.event_group_id || "EP-UTT-2026-10-001"}
                    </span>
                    <span className="text-[11px] font-mono text-muted tabular-nums">
                      {episode.dates || "2026-10-08 – 2026-10-10"}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-ink tracking-tight mt-1">
                    {episode.title || "Rudraprayag Heavy Rainfall Episode"}
                  </h2>
                  <div className="text-xs text-muted mt-0.5">
                    Affected Sectors: <strong className="text-ink2">{episode.locations || "Rudraprayag, Chamoli, Tehri Garhwal"}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <SeverityBadge severity="High" />
                  <StatusBadge status={episode.status || "Active"} />
                </div>
              </div>

              {/* 7 Sub-tabs */}
              <div className="flex flex-wrap border-b border-line mt-3 -mb-4 text-[11px] font-mono uppercase tracking-wider gap-1">
                {[
                  { id: 'overview', label: 'Overview & DAG' },
                  { id: 'graph', label: 'Full Event Graph' },
                  { id: 'timeline', label: 'Timeline' },
                  { id: 'affected', label: 'Affected Areas' },
                  { id: 'impacts', label: 'Impacts' },
                  { id: 'contributing', label: 'Contributing (5)' },
                  { id: 'related', label: 'Related (3)' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2.5 py-2 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-accent text-accent bg-surface font-semibold'
                        : 'border-transparent text-muted hover:text-ink'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-tab Content: Overview */}
            {activeTab === 'overview' && (
              <div className="p-4 space-y-4 text-xs">
                {/* Horizontal Episode Relationship Graph (SVG DAG) */}
                <div>
                  <EpisodeGraph graph={episode.graph} />
                </div>

                {/* Middle Row: Map of Episode Events + Episode Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-surface2 rounded-[2px] p-2.5 border border-line">
                    <div className="panel-title mb-2">Episode Perimeter &amp; Event Nodes</div>
                    <div className="h-36 rounded-[2px] overflow-hidden border border-line">
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

                  <div className="bg-surface2 rounded-[2px] p-2.5 border border-line space-y-1.5 font-mono text-[11px] tabular-nums">
                    <div className="panel-title mb-1">Episode Telemetry Summary</div>
                    <div className="flex justify-between py-0.5 border-b border-line">
                      <span className="text-muted">PRIMARY TRIGGER:</span>
                      <span className="text-ink font-semibold">Heavy Rainfall</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-line">
                      <span className="text-muted">CASCADING HAZARDS:</span>
                      <span className="text-high font-semibold">Landslide, Flood, Road Cutoff</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-line">
                      <span className="text-muted">LINKED EVENTS:</span>
                      <span className="text-ink font-semibold">5 Canonical Nodes</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-line">
                      <span className="text-muted">CONFIDENCE SCORE:</span>
                      <span className="text-ok font-semibold">0.82 (HIGH)</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-muted">EST. CLEARANCE:</span>
                      <span className="text-ink2">2026-10-10 23:59 IST</span>
                    </div>
                  </div>
                </div>

                {/* Combined Multi-Hazard Impacts (6 Hairline Cells) */}
                <div>
                  <div className="panel-title mb-2">
                    Combined Multi-Hazard Impact Telemetry
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-px bg-line border border-line rounded-[2px] overflow-hidden">
                    {[
                      { title: "POPULATION AFFECTED", value: "3,500", code: "POP" },
                      { title: "HIGHWAY BLOCKED", value: "12.0 km", code: "INF" },
                      { title: "AFFECTED EXTENT", value: "65.0 sq km", code: "GEO" },
                      { title: "HABITATIONS HIT", value: "5", code: "HAB" },
                      { title: "REPORTED INJURIES", value: "2", code: "MED" },
                      { title: "SECONDARY RISK", value: "HIGH", code: "RSK" },
                    ].map((card, i) => (
                      <div key={i} className="p-2.5 bg-surface2">
                        <div className="flex items-center justify-between text-[9px] font-mono text-muted">
                          <span className="truncate">{card.title}</span>
                          <span className="text-faint">{card.code}</span>
                        </div>
                        <div className="text-sm font-mono font-semibold text-ink mt-1 tabular-nums">{card.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Contributing Events (5 Rows) */}
                <div className="bg-surface2 rounded-[2px] p-3 border border-line">
                  <div className="panel-title mb-2">Chronological Contributing Events in Cascade</div>
                  <div className="divide-y divide-line border border-line rounded-[2px] bg-surface">
                    {[
                      { code: "EV-RAIN-001", name: "Heavy Rainfall Ingestion (IMD AWS)", time: "2026-10-08 06:00", status: "Observed", impact: "TRIGGER" },
                      { code: "EV-HYD-002", name: "Alaknanda River Level Surge (CWC)", time: "2026-10-08 12:00", status: "Observed", impact: "HYDROLOGICAL" },
                      { code: "EV-LSD-003", name: "Slope Failure near Banswara (USDMA)", time: "2026-10-08 18:30", status: "Reported", impact: "DEBRIS FLOW" },
                      { code: "EV-INF-004", name: "NH-58 Highway Corridor Cutoff (BRO)", time: "2026-10-09 07:45", status: "Observed", impact: "INFRASTRUCTURE" },
                      { code: "EV-SIM-005", name: "Downstream Flash Flood Projection", time: "2026-10-09 12:00", status: "Predicted", impact: "PROJECTION" },
                    ].map((row, idx) => (
                      <div key={idx} className="flex flex-wrap items-center justify-between p-2.5 text-[11px] hover:bg-surface2 transition-colors gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-accent font-semibold">{row.code}</span>
                          <span className="font-medium text-ink">{row.name}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[10px] tabular-nums">
                          <span className="text-muted">{row.time}</span>
                          <EpistemicBadge status={row.status} />
                          <span className="px-1.5 py-0.5 rounded-[2px] bg-surface2 border border-line text-ink2">{row.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Other Sub-tabs fallback */}
            {activeTab !== 'overview' && (
              <div className="p-6 bg-surface2 m-4 rounded-[2px] border border-line text-xs space-y-2">
                <div className="panel-title">
                  CASCADE SUB-MODULE // {activeTab.toUpperCase()}
                </div>
                <p className="text-ink2">
                  Displaying multi-modal cascade logs, temporal propagation graphs, and spatial watershed extents for episode <strong className="font-mono text-ink">{episode.event_group_id}</strong>.
                </p>
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
