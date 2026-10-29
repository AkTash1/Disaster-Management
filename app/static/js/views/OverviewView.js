// Disaster Intelligence Multimodal Platform - View 1: Overview
// Clean, Spacious & Client-Friendly Dashboard:
// - Top plain-English situation summary banner with quick-action buttons
// - 7 spaced KPI cards with neutral/severity-aware deltas
// - Live Interactive Map + Active Events and Warnings + Official Updates
// - Clear analytical breakdowns (Events by Hazard Type, 30-Day Trend, Severity Breakdown, Affected Districts)

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { KpiCard, MapView, ChartView, SeverityBadge, EpistemicBadge } = window.DisasterComponents || window;

  const StackedDistBar = ({ segments = [], total = 100 }) => {
    const safeTotal = total || segments.reduce((a, b) => a + (b.count || 0), 0) || 1;
    return (
      <div className="space-y-3">
        {/* Stacked Horizontal Bar */}
        <div className="h-3.5 w-full flex rounded-full bg-surface2 border border-line overflow-hidden">
          {segments.map((seg, i) => {
            const pct = Math.max(1, ((seg.count / safeTotal) * 100));
            return (
              <div
                key={i}
                style={{ width: `${pct}%`, backgroundColor: seg.color }}
                title={`${seg.label}: ${seg.count} (${pct.toFixed(1)}%)`}
                className="h-full border-r border-surface last:border-r-0"
              />
            );
          })}
        </div>

        {/* Clean Breakdown Table */}
        <table className="w-full text-left text-xs border-t border-line">
          <thead className="text-muted border-b border-line">
            <tr>
              <th className="py-1.5 font-semibold">Category</th>
              <th className="py-1.5 text-right font-semibold">Incidents</th>
              <th className="py-1.5 text-right font-semibold">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {segments.map((seg, i) => {
              const pct = ((seg.count / safeTotal) * 100).toFixed(1);
              return (
                <tr key={i} className="hover:bg-surface2">
                  <td className="py-1.5 flex items-center gap-2 text-ink font-medium">
                    <span className="w-2.5 h-2.5 rounded-sm inline-block shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="truncate">{seg.label}</span>
                  </td>
                  <td className="py-1.5 text-right text-ink font-semibold tabular-nums">{seg.count}</td>
                  <td className="py-1.5 text-right text-muted tabular-nums">{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const OverviewView = ({ onNavigate = null }) => {
    const [summary, setSummary] = useState(null);
    const [mapEvents, setMapEvents] = useState([]);
    const [mapCenter, setMapCenter] = useState([30.28, 79.05]);
    const [mapZoom, setMapZoom] = useState(8);

    useEffect(() => {
      let isSubscribed = true;

      const fetchAllData = async () => {
        try {
          const [summaryRes, eventsRes] = await Promise.all([
            fetch('/api/v1/overview/summary').then(r => r.ok ? r.json() : null),
            fetch('/api/v1/events?limit=25').then(r => r.ok ? r.json() : null)
          ]);

          if (!isSubscribed) return;

          setSummary(summaryRes);
          setMapEvents(Array.isArray(eventsRes) ? eventsRes : (eventsRes?.events || []));
        } catch (err) {
          console.error("Error loading overview data:", err);
        }
      };

      fetchAllData();
      return () => { isSubscribed = false; };
    }, []);

    // 7 Spaced KPI Cards (neutral/crimson/amber deltas, never celebratory green on casualties)
    const kpiStrip = [
      {
        title: "Total Events (30d)",
        value: summary?.total_events || 127,
        delta: "+14 vs 30d avg",
        tone: "neutral",
        subtitle: "Past 30 days",
        spark: [12, 15, 14, 19, 22, 24, 21],
        target: "events"
      },
      {
        title: "Active Incidents",
        value: summary?.total_active_events || summary?.active_events || 34,
        delta: "+6 in 24h",
        tone: "hazard",
        subtitle: "Ongoing now",
        spark: [18, 20, 22, 25, 29, 31, 34],
        target: "events"
      },
      {
        title: "Official Warnings",
        value: summary?.weather_warnings || summary?.official_warnings || 18,
        delta: "5 Red · 8 Orange",
        tone: "warning",
        subtitle: "IMD & CWC",
        spark: [6, 8, 9, 12, 15, 17, 18],
        target: "reports"
      },
      {
        title: "Risk Alerts",
        value: summary?.severe_alerts || summary?.risk_alerts || 11,
        delta: "+3 sensor alerts",
        tone: "warning",
        subtitle: "Sensor triggers",
        spark: [4, 5, 5, 7, 8, 10, 11],
        target: "modality-events"
      },
      {
        title: "People in Watch Zones",
        value: summary?.population_at_risk ? `${Math.round(summary.population_at_risk / 1000)}k` : "125k",
        delta: "13 districts",
        tone: "neutral",
        subtitle: "Estimated residents",
        spark: [65, 72, 80, 95, 110, 118, 125],
        target: "my-area"
      },
      {
        title: "Affected Areas",
        value: summary?.flood_watch_stations || 48,
        delta: "+4 today",
        tone: "neutral",
        subtitle: "Blocks & tehsils",
        spark: [30, 34, 36, 40, 42, 45, 48],
        target: "map-explorer"
      },
      {
        title: "Reported Casualties",
        value: summary?.casualties || 86,
        delta: "+8 vs 30d avg",
        tone: "hazard",
        subtitle: "Verified reports",
        spark: [42, 48, 55, 63, 71, 78, 86],
        target: "events"
      }
    ];

    const hazardDistribution = [
      { label: "Landslide / Road Block", count: 42, color: "#D97706" },
      { label: "Heavy Rainfall", count: 28, color: "#0284C7" },
      { label: "River / Flash Flood", count: 20, color: "#2563EB" },
      { label: "Earthquake / Tremor", count: 14, color: "#DC2626" },
      { label: "Severe Thunderstorm", count: 12, color: "#CA8A04" },
      { label: "Other Infrastructure", count: 11, color: "#64748B" }
    ];

    const severityDistribution = [
      { label: "Red Alert · Critical", count: 18, color: "#DC2626" },
      { label: "Orange Alert · High Risk", count: 32, color: "#EA580C" },
      { label: "Yellow Watch · Moderate", count: 46, color: "#D97706" },
      { label: "Green · Advisory / Normal", count: 31, color: "#059669" }
    ];

    const trendChartData = {
      labels: ['Sep 10', 'Sep 17', 'Sep 24', 'Oct 01', 'Oct 08'],
      datasets: [
        { label: 'Landslide', data: [8, 14, 22, 31, 42], borderColor: '#D97706', backgroundColor: '#D97706' },
        { label: 'Rainfall', data: [6, 11, 18, 24, 28], borderColor: '#0284C7', backgroundColor: '#0284C7' },
        { label: 'Flood', data: [4, 9, 12, 16, 20], borderColor: '#2563EB', backgroundColor: '#2563EB' },
        { label: 'Earthquake', data: [2, 4, 7, 10, 14], borderColor: '#DC2626', backgroundColor: '#DC2626' }
      ]
    };

    const activeWarningsFeed = [
      { title: "Extremely Heavy Rainfall (>115 mm in 24h)", district: "Rudraprayag", agency: "IMD Weather", sev: "Critical", time: "08:30 IST", coords: [30.2849, 78.9811] },
      { title: "NH-58 Highway Blocked by Landslide Debris", district: "Chamoli", agency: "GSI / BRO", sev: "Critical", time: "07:45 IST", coords: [30.4021, 79.3215] },
      { title: "Alaknanda River Above Warning Mark (626.4m)", district: "Srinagar (UK)", agency: "CWC River Gauge", sev: "High", time: "06:20 IST", coords: [30.2229, 78.7834] },
      { title: "Mandakini Basin Flash Flood Watch", district: "Tehri Garhwal", agency: "USDMA", sev: "Moderate", time: "05:10 IST", coords: [30.3809, 78.4803] },
      { title: "Kumaon Foothills Thunderstorm Advisory", district: "Pithoragarh", agency: "IMD Weather", sev: "Advisory", time: "22:40 IST", coords: [29.5829, 80.2182] }
    ];

    const sevLeftBorder = (s) => {
      const k = String(s).toLowerCase();
      if (k === 'critical') return 'border-l-crit';
      if (k === 'high') return 'border-l-high';
      if (k === 'moderate') return 'border-l-warn';
      return 'border-l-ok';
    };

    return (
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Page Header (Prominent Heading + Description Below It, Matching Reference) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-ink tracking-tight">
                Overview
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-ok-soft text-ok border border-ok/30 font-semibold">
                Live Operational Picture
              </span>
            </div>
            <p className="text-sm font-normal text-muted mt-1">
              Real-time summary of active disaster events, official warnings, affected areas, and multi-sensor intelligence across Uttarakhand.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('map-explorer')}
              className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Open Full Map &rarr;
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('preparedness')}
              className="px-3.5 py-2 rounded-lg bg-surface hover:bg-surface2 text-ink border border-line text-xs font-semibold transition-colors"
            >
              Preparedness &amp; Shelters
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('ask')}
              className="px-3.5 py-2 rounded-lg bg-surface hover:bg-surface2 text-ink border border-line text-xs font-semibold transition-colors"
            >
              Ask (Q&amp;A)
            </button>
          </div>
        </div>

        {/* 7 Spaced KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
          {kpiStrip.map((kpi, idx) => (
            <KpiCard
              key={idx}
              bare={false}
              title={kpi.title}
              value={kpi.value}
              delta={kpi.delta}
              tone={kpi.tone}
              subtitle={kpi.subtitle}
              spark={kpi.spark}
              onClick={() => onNavigate && onNavigate(kpi.target)}
            />
          ))}
        </div>

        {/* Row 1: Live Disaster Map (Left 8 cols) + Active Warnings & News (Right 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left 8 Columns: Interactive Disaster Map */}
          <div className="lg:col-span-8 bg-surface border border-line rounded-xl p-5 shadow-sm flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-3.5 border-b border-line shrink-0">
              <div>
                <h2 className="panel-title">Live Disaster Map — Uttarakhand</h2>
                <p className="text-xs text-muted mt-0.5">Click any marker on the map to inspect the incident or switch map styles</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setMapCenter([30.28, 79.05]); setMapZoom(8); }}
                  className="px-3 py-1.5 rounded-lg border border-line bg-surface2 hover:border-line-strong text-xs font-semibold text-ink2"
                >
                  Reset Map View
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('map-explorer')}
                  className="px-3 py-1.5 rounded-lg border border-accent/30 bg-accent-soft text-xs text-accent font-semibold hover:bg-accent hover:text-white transition-colors"
                >
                  Full Map Explorer &rarr;
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-[540px] w-full rounded-lg overflow-hidden border border-line relative">
              <div className="absolute inset-0">
                <MapView
                  markers={mapEvents}
                  center={mapCenter}
                  zoom={mapZoom}
                  height="100%"
                  showBasemapSwitcher={true}
                  onMarkerClick={() => onNavigate && onNavigate('events')}
                />
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Active Events and Warnings + Official News */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Active Warnings Card */}
            <div className="bg-surface border border-line rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-line">
                <div>
                  <h2 className="panel-title">Active Events and Warnings</h2>
                  <p className="text-xs text-muted">Click any alert to locate it on the map</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-crit-soft text-crit">
                  5 Urgent
                </span>
              </div>
              <div className="space-y-2">
                {activeWarningsFeed.map((w, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (w.coords) {
                        setMapCenter(w.coords);
                        setMapZoom(10);
                      }
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg bg-surface2 hover:bg-surface3 border border-line border-l-4 ${sevLeftBorder(w.sev)} transition-colors`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs text-muted">
                      <span className="font-semibold text-ink2">{w.district} &bull; {w.agency}</span>
                      <span>{w.time}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="text-xs font-semibold text-ink truncate">{w.title}</span>
                      <SeverityBadge severity={w.sev} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Verified News & Field Reports */}
            <div className="bg-surface border border-line rounded-xl p-5 shadow-sm flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-line">
                  <div>
                    <h2 className="panel-title">Latest Official Updates &amp; News</h2>
                    <p className="text-xs text-muted">Verified bulletins from field agencies</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('reports')}
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    View All &rarr;
                  </button>
                </div>
                <div className="divide-y divide-line">
                  {[
                    { headline: "NH-58 blocked near Banswara; BRO excavators on site", source: "PIB", time: "08:20 IST", status: "Official" },
                    { headline: "IMD Dehradun maintains Red Alert across Garhwal hills", source: "IMD", time: "07:15 IST", status: "Official" },
                    { headline: "Alaknanda water level rises 1.8m at Rudraprayag gauge", source: "CWC", time: "06:30 IST", status: "Observed" },
                    { headline: "SDRF rescue teams positioned at Joshimath & Karnaprayag", source: "USDMA", time: "05:45 IST", status: "Official" }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => onNavigate && onNavigate('reports')}
                      className="py-2.5 cursor-pointer hover:bg-surface2 px-2 rounded-lg transition-colors"
                    >
                      <div className="text-xs font-semibold text-ink leading-snug">{item.headline}</div>
                      <div className="flex items-center justify-between mt-1 text-xs text-muted">
                        <span>{item.source} &bull; {item.time}</span>
                        <EpistemicBadge status={item.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Analytical Cards (Events by Hazard Type, 30-Day Trend, Events by Severity) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Panel 1: Events by Hazard Type */}
          <div className="lg:col-span-4 bg-surface border border-line rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-line">
              <div>
                <h2 className="panel-title">Events by Hazard Type</h2>
                <p className="text-xs text-muted">Breakdown over the past 30 days</p>
              </div>
              <span className="text-xs font-semibold text-muted">127 Total</span>
            </div>
            <StackedDistBar segments={hazardDistribution} total={127} />
          </div>

          {/* Panel 2: 30-Day Incident Trend */}
          <div className="lg:col-span-4 bg-surface border border-line rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-line">
              <div>
                <h2 className="panel-title">30-Day Incident Trend</h2>
                <p className="text-xs text-muted">Weekly progression by disaster type</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('history')}
                className="text-xs font-semibold text-accent hover:underline"
              >
                Full History &rarr;
              </button>
            </div>
            <ChartView
              type="line"
              data={trendChartData}
              height={220}
            />
          </div>

          {/* Panel 3: Severity Breakdown */}
          <div className="lg:col-span-4 bg-surface border border-line rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-line">
              <div>
                <h2 className="panel-title">Events by Risk Level</h2>
                <p className="text-xs text-muted">Grouped by official IMD alert colors</p>
              </div>
              <span className="text-xs font-semibold text-muted">All Verified</span>
            </div>
            <StackedDistBar segments={severityDistribution} total={127} />
          </div>
        </div>

        {/* Row 3: Most Affected Districts, Recent Incidents (24h), and Connected Data Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Most Affected Districts */}
          <div className="lg:col-span-4 bg-surface border border-line rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-line">
              <div>
                <h2 className="panel-title">Most Affected Districts</h2>
                <p className="text-xs text-muted">Click a district to filter incidents</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('events')}
                className="text-xs font-semibold text-accent hover:underline"
              >
                View All &rarr;
              </button>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-surface2 text-muted border-b border-line">
                <tr>
                  <th className="py-2 px-2.5 font-semibold">District</th>
                  <th className="py-2 px-2.5 text-right font-semibold">Events</th>
                  <th className="py-2 px-2.5 text-right font-semibold">Active Alerts</th>
                  <th className="py-2 px-2.5 font-semibold">Main Hazard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[
                  { district: "Rudraprayag", events: 18, alerts: 5, hazard: "Landslide" },
                  { district: "Chamoli", events: 16, alerts: 4, hazard: "Landslide" },
                  { district: "Tehri Garhwal", events: 14, alerts: 3, hazard: "Heavy Rain" },
                  { district: "Pithoragarh", events: 11, alerts: 2, hazard: "Flash Flood" },
                  { district: "Dehradun", events: 8, alerts: 1, hazard: "Heavy Rain" }
                ].map((r, i) => (
                  <tr
                    key={i}
                    onClick={() => onNavigate && onNavigate('events')}
                    className="hover:bg-surface2 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-2.5 font-semibold text-ink">{r.district}</td>
                    <td className="py-2.5 px-2.5 text-right text-ink font-semibold tabular-nums">{r.events}</td>
                    <td className="py-2.5 px-2.5 text-right text-crit font-bold tabular-nums">{r.alerts}</td>
                    <td className="py-2.5 px-2.5 text-muted font-medium">{r.hazard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Incidents (Last 24 Hours) */}
          <div className="lg:col-span-5 bg-surface border border-line rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-line">
              <div>
                <h2 className="panel-title">Recent Incidents (Past 24 Hours)</h2>
                <p className="text-xs text-muted">Latest verified events across Uttarakhand</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('events')}
                className="text-xs font-semibold text-accent hover:underline"
              >
                See All &rarr;
              </button>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-surface2 text-muted border-b border-line">
                <tr>
                  <th className="py-2 px-2.5 font-semibold">Hazard</th>
                  <th className="py-2 px-2.5 font-semibold">Location</th>
                  <th className="py-2 px-2.5 font-semibold">Time</th>
                  <th className="py-2 px-2.5 text-right font-semibold">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[
                  { id: "EV-LSD-001", time: "08:15 IST", hazard: "Landslide", location: "Rudraprayag · NH-58", severity: "Critical" },
                  { id: "EV-WTH-004", time: "06:45 IST", hazard: "Heavy Rainfall", location: "Tehri Garhwal", severity: "High" },
                  { id: "EV-FLD-002", time: "05:20 IST", hazard: "River Surge", location: "Alaknanda Basin", severity: "High" },
                  { id: "EV-EQK-009", time: "03:10 IST", hazard: "Tremor M4.2", location: "Pithoragarh", severity: "Moderate" },
                  { id: "EV-LSD-012", time: "23:50 IST", hazard: "Debris Flow", location: "Chamoli · Joshimath", severity: "Moderate" }
                ].map((ev, i) => (
                  <tr
                    key={i}
                    onClick={() => onNavigate && onNavigate('events')}
                    className="hover:bg-surface2 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-2.5 font-semibold text-ink">{ev.hazard}</td>
                    <td className="py-2.5 px-2.5 text-ink2 font-medium">{ev.location}</td>
                    <td className="py-2.5 px-2.5 text-muted tabular-nums">{ev.time}</td>
                    <td className="py-2.5 px-2.5 text-right"><SeverityBadge severity={ev.severity} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Connected Government Agencies */}
          <div className="lg:col-span-3 bg-surface border border-line rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-line">
              <div>
                <h2 className="panel-title">Connected Agencies</h2>
                <p className="text-xs text-muted">Official live data feeds</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-ok-soft text-ok">
                5 Online
              </span>
            </div>
            <div className="divide-y divide-line text-xs">
              {[
                { name: "IMD Weather Stations", desc: "Rainfall & storm radar", status: "Observed" },
                { name: "CWC River Gauges", desc: "47 water level sensors", status: "Observed" },
                { name: "ISRO Satellite Feeds", desc: "Cloud & terrain imagery", status: "Official" },
                { name: "GSI Landslide Monitor", desc: "Slope stability maps", status: "Official" },
                { name: "USDMA & SDRF Control", desc: "Field situation reports", status: "Reported" }
              ].map((ds, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-ink truncate">{ds.name}</div>
                    <div className="text-xs text-muted">{ds.desc}</div>
                  </div>
                  <EpistemicBadge status={ds.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  window.DisasterViews = window.DisasterViews || {};
  window.DisasterViews.OverviewView = OverviewView;
  window.OverviewView = OverviewView;
})();
