// Disaster Intelligence Platform — View 3: Unified Events (Master-Detail Command Workbench)
// Light Operational Theme: 6-Cell Hairline Telemetry Strip, High-Density Master List, 7-Tab Detail Inspector

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { KpiCard, MapView, SeverityBadge, EpistemicBadge, StatusBadge } = window.DisasterComponents || window;

  const EventsView = () => {
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

    const hazardCode = (h) => {
      const s = String(h || "").toLowerCase();
      if (s.includes("landslide")) return "LSD";
      if (s.includes("flood")) return "FLD";
      if (s.includes("rain") || s.includes("cloud")) return "met";
      if (s.includes("earth") || s.includes("seis")) return "EQK";
      return "HZD";
    };

    return (
      <div className="p-4 space-y-4 max-w-full">
        {/* Header */}
        <div className="bg-surface border border-line rounded-[2px] p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-ink tracking-tight">
                Unified Disaster Events
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded-[2px] font-mono uppercase tracking-wider bg-accent-soft text-accent border-l-2 border-accent font-semibold">
                MULTI-SENSOR CORROBORATED
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Canonical incident records fused across IMD weather stations, CWC river gauges, satellite SAR, and verified field SITREPs.
            </p>
          </div>
          <div className="text-[11px] font-mono text-muted tabular-nums">
            ACTIVE FILTER: <strong className="text-ink">{eventsList.length} RECORDS</strong>
          </div>
        </div>

        {/* 6-Column Hairline KPI Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-line border border-line rounded-[2px] overflow-hidden">
          <KpiCard title="Total Events (30d)" value={kpiData.total_events || 127} delta="+14 vs 30d avg" deltaTone="neutral" subtitle="Canonical incidents" />
          <KpiCard title="Active Events" value={kpiData.active_events || 34} delta="+3 in 24h" deltaTone="crit" subtitle="Ongoing response" />
          <KpiCard title="Resolved Events" value={kpiData.resolved_events || 78} delta="61.4% clearance" deltaTone="ok" subtitle="Closed operations" />
          <KpiCard title="High Severity" value={kpiData.high_severity || 32} delta="25.2% share" deltaTone="crit" subtitle="Priority Level 1" />
          <KpiCard title="Moderate Watch" value={kpiData.moderate_severity || 46} delta="36.2% share" deltaTone="warn" subtitle="Level 2 Watch" />
          <KpiCard title="Low / Advisory" value={kpiData.low_severity || 31} delta="24.4% share" deltaTone="neutral" subtitle="Routine monitoring" />
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

            <div className="divide-y divide-line max-h-[720px] overflow-y-auto">
              {eventsList.map((item) => {
                const id = item.event_id || item.id;
                const isSelected = id === selectedEventId;
                const hazard = item.hazard_name || item.hazard || "Hazard";

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
                        <h3 className="font-semibold text-xs text-ink truncate">
                          {item.title || item.event_title || `${hazard} in ${item.district || 'Uttarakhand'}`}
                        </h3>
                        <SeverityBadge severity={item.severity || "Moderate"} />
                      </div>

                      <div className="text-[11px] text-muted mt-1 flex items-center justify-between font-mono tabular-nums">
                        <span className="truncate">{item.location || item.district || "Uttarakhand"}</span>
                        <span className="shrink-0">{item.time || item.timestamp || "08:15 IST"}</span>
                      </div>

                      <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-line">
                        <span className="text-[10px] font-mono text-muted truncate">{id}</span>
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
            <div className="p-4 bg-surface2 border-b border-line">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded-[2px] bg-ink text-white font-mono text-[10px] font-semibold">
                      {ev.event_id || "EV-LSD-2026-10-09-001"}
                    </span>
                    <span className="text-[11px] font-mono text-muted tabular-nums">
                      {ev.timestamp || "2026-10-09 08:15 IST"}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-ink tracking-tight mt-1">
                    {ev.title || "Landslide in Rudraprayag"}
                  </h2>
                  <div className="text-xs text-muted mt-0.5">
                    Sector: <strong className="text-ink2">{ev.location || "Rudraprayag, Uttarakhand"}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <SeverityBadge severity={ev.severity || "High"} />
                  <StatusBadge status={ev.status || "Active"} />
                </div>
              </div>

              {/* 7 Sub-tabs Navigation */}
              <div className="flex flex-wrap border-b border-line mt-3 -mb-4 text-[11px] font-mono uppercase tracking-wider gap-1">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'timeline', label: 'Timeline' },
                  { id: 'evidence', label: 'Evidence (12)' },
                  { id: 'modality', label: 'Modality Feeds (4)' },
                  { id: 'regions', label: 'Regions (3)' },
                  { id: 'impacts', label: 'Impacts (6)' },
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

            {/* TAB CONTENT: Overview */}
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
                          title: ev.title,
                          hazard: ev.hazard_name,
                          severity: ev.severity
                        }]}
                        showBasemapSwitcher={false}
                      />
                    </div>
                  </div>

                  {/* Key Information */}
                  <div className="bg-surface2 rounded-[2px] p-2.5 border border-line space-y-1.5 font-mono text-[11px] tabular-nums">
                    <div className="panel-title mb-1">Geospatial Attributes</div>
                    <div className="flex justify-between py-0.5 border-b border-line">
                      <span className="text-muted">HAZARD:</span>
                      <span className="text-ink font-semibold">{ev.hazard_name || "Landslide"}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-line">
                      <span className="text-muted">CONFIDENCE:</span>
                      <span className="text-ok font-semibold">{Math.round((ev.confidence || 0.82) * 100)}%</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-line">
                      <span className="text-muted">COORDS:</span>
                      <span className="text-ink2">30.2849°N, 78.9867°E</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-line">
                      <span className="text-muted">ELEVATION:</span>
                      <span className="text-ink2">1,245 m</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-muted">EXTENT:</span>
                      <span className="text-ink2">25.0 sq km</span>
                    </div>
                  </div>

                  {/* Field Recon Imagery Metadata */}
                  <div className="bg-surface2 rounded-[2px] p-2.5 border border-line flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="panel-title">Field Recon Frames</span>
                        <span className="text-[10px] font-mono text-muted">6 FRAMES</span>
                      </div>
                      <div className="h-24 rounded-[2px] bg-surface border border-line flex flex-col items-center justify-center p-2 text-center">
                        <span className="font-mono text-[10px] font-semibold text-accent uppercase">UAV-RECON-NH58-01.TIFF</span>
                        <span className="text-[10px] text-muted mt-1">Slope debris obstruction on NH-58 corridor</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 mt-2 font-mono text-[9px] text-center">
                      <div className="py-1 rounded-[2px] bg-surface border border-line text-ink2">SAR-01</div>
                      <div className="py-1 rounded-[2px] bg-surface border border-line text-ink2">OPT-02</div>
                      <div className="py-1 rounded-[2px] bg-accent-soft border border-accent/30 text-accent font-semibold">+4 MORE</div>
                    </div>
                  </div>
                </div>

                {/* Narrative Description */}
                <div className="bg-surface2 rounded-[2px] p-3 border border-line">
                  <div className="panel-title mb-1">Operational Situation Narrative</div>
                  <p className="text-ink2 leading-relaxed">
                    {ev.description || "Sustained monsoon precipitation triggered slope failure along NH-107 / NH-58 corridor near Rudraprayag, obstructing highway access and stranding transit vehicles. District Disaster Management Authority (DDMA) and SDRF units are deployed on site."}
                  </p>
                </div>

                {/* Split Impact Comparison (Observed vs Predicted) */}
                <div className="bg-surface2 rounded-[2px] p-3.5 border border-line">
                  <div className="panel-title mb-2.5">
                    Impact Assessment Matrix (Observed Ground Truth vs. Model Projection)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Left: Observed Impacts */}
                    <div className="p-3 rounded-[2px] bg-surface border border-line border-l-2 border-l-ok space-y-1.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider font-semibold text-ok">
                        Observed Impacts (Verified Field SITREPs)
                      </div>
                      <ul className="space-y-1 text-ink2 text-[11px] list-disc list-inside font-mono">
                        <li><strong className="text-ink">3,500</strong> population directly affected</li>
                        <li><strong className="text-ink">12.0 km</strong> highway corridor obstructed</li>
                        <li><strong className="text-ink">3</strong> minor injuries / stranded transit buses</li>
                        <li><strong className="text-ink">5</strong> gram panchayats isolated from road access</li>
                      </ul>
                    </div>

                    {/* Right: Potential / Predicted Impacts */}
                    <div className="p-3 rounded-[2px] bg-surface border border-line border-l-2 border-l-info space-y-1.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider font-semibold text-info">
                        Projected Cascade Risks (24–48h Forecast)
                      </div>
                      <ul className="space-y-1 text-ink2 text-[11px] list-disc list-inside font-mono">
                        <li><strong className="text-ink">HIGH RISK</strong> of secondary slope failure (24h)</li>
                        <li><strong className="text-ink">MODERATE</strong> tributary impoundment hazard</li>
                        <li><strong className="text-ink">~5,000</strong> downstream residents in watch zone</li>
                        <li><strong className="text-ink">24–48h</strong> estimated BRO clearance window</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Contributing Modality Events & Related Events */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-[2px] bg-surface2 border border-line">
                    <div className="panel-title mb-2">Contributing Sensor &amp; Agency Feeds</div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between py-1 border-b border-line">
                        <span className="text-ink font-medium">IMD AWS Heavy Rainfall Trigger</span>
                        <span className="text-ok font-mono font-semibold tabular-nums">CONF: 0.82</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-line">
                        <span className="text-ink font-medium">PIB / USDMA Incident Bulletin</span>
                        <span className="text-ok font-mono font-semibold tabular-nums">CONF: 0.78</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-ink font-medium">GSI Landslide Susceptibility Match</span>
                        <span className="text-ok font-mono font-semibold tabular-nums">CONF: 0.71</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-[2px] bg-surface2 border border-line">
                    <div className="panel-title mb-2">Correlated Unified Events</div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center py-1 border-b border-line">
                        <span className="text-ink font-medium">Alaknanda River Level Surge</span>
                        <SeverityBadge severity="High" />
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-line">
                        <span className="text-ink font-medium">Heavy Precipitation — Tehri Garhwal</span>
                        <SeverityBadge severity="Moderate" />
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-ink font-medium">NH-58 Corridor Disruption</span>
                        <SeverityBadge severity="Moderate" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other sub-tabs structured view */}
            {activeTab !== 'overview' && (
              <div className="p-6 bg-surface2 m-4 rounded-[2px] border border-line text-xs space-y-2">
                <div className="panel-title">
                  SUB-MODULE // {activeTab.toUpperCase()}
                </div>
                <p className="text-ink2">
                  Displaying synchronized multi-sensor evidence records, chronological state transitions, and LGD administrative polygon intersections for canonical event <strong className="font-mono text-ink">{ev.event_id || "EV-LSD-2026-10-09-001"}</strong>.
                </p>
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
