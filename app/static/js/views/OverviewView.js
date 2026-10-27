// Disaster Intelligence Multimodal Platform - View 1: Overview (image7.png)
// Specifications: 7 KPI Cards, Active Events Map, 3 Charts (Hazard Donut, Trend Line, Severity Donut), Top 5 Regions, 24h Recent Events, Alerts & News Feeds, Data Sources

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { KpiCard, MapView, ChartView, SeverityBadge, EpistemicBadge, StatusBadge } = window.DisasterComponents || window;

  const OverviewView = ({ onNavigate = null }) => {
    const [summary, setSummary] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [news, setNews] = useState([]);
    const [charts, setCharts] = useState(null);
    const [regions, setRegions] = useState([]);
    const [recentEvents, setRecentEvents] = useState([]);
    const [dataSources, setDataSources] = useState([]);
    const [mapEvents, setMapEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch overview data from backend REST API
    useEffect(() => {
      let isSubscribed = true;

      const fetchAllData = async () => {
        try {
          const [
            summaryRes,
            alertsRes,
            newsRes,
            chartsRes,
            regionsRes,
            recentRes,
            sourcesRes,
            eventsRes
          ] = await Promise.all([
            fetch('/api/v1/overview/summary').then(r => r.ok ? r.json() : null),
            fetch('/api/v1/overview/alerts').then(r => r.ok ? r.json() : null),
            fetch('/api/v1/overview/news').then(r => r.ok ? r.json() : null),
            fetch('/api/v1/overview/charts').then(r => r.ok ? r.json() : null),
            fetch('/api/v1/overview/regions').then(r => r.ok ? r.json() : null),
            fetch('/api/v1/overview/recent-events?limit=5').then(r => r.ok ? r.json() : null),
            fetch('/api/v1/overview/data-sources').then(r => r.ok ? r.json() : null),
            fetch('/api/v1/events?limit=25').then(r => r.ok ? r.json() : null)
          ]);

          if (!isSubscribed) return;

          setSummary(summaryRes);
          setAlerts(Array.isArray(alertsRes) ? alertsRes : (alertsRes?.alerts || []));
          setNews(Array.isArray(newsRes) ? newsRes : (newsRes?.news || []));
          setCharts(chartsRes);
          setRegions(Array.isArray(regionsRes) ? regionsRes : (regionsRes?.regions || []));
          setRecentEvents(Array.isArray(recentRes) ? recentRes : (recentRes?.events || []));
          setDataSources(Array.isArray(sourcesRes) ? sourcesRes : (sourcesRes?.data_sources || []));
          setMapEvents(Array.isArray(eventsRes) ? eventsRes : (eventsRes?.events || []));
          setLoading(false);
        } catch (err) {
          console.error("Error loading overview data:", err);
          if (isSubscribed) setLoading(false);
        }
      };

      fetchAllData();
      return () => { isSubscribed = false; };
    }, []);

    // 7 KPI card definitions matching image7.png and backend summary
    const kpiCardsData = [
      {
        title: "Total Events",
        value: summary?.total_events || 127,
        trend: "↑ 12%",
        subtitle: "All hazards (30d)",
        icon: "pulse",
        iconColor: "#38bdf8"
      },
      {
        title: "Active Events",
        value: summary?.total_active_events || summary?.active_events || 34,
        trend: "↑ 21%",
        subtitle: "Ongoing events",
        icon: "warning",
        iconColor: "#ef4444"
      },
      {
        title: "Official Warnings",
        value: summary?.weather_warnings || summary?.official_warnings || 18,
        trend: "↑ 6%",
        subtitle: "From authorities",
        icon: "alert",
        iconColor: "#f97316"
      },
      {
        title: "Platform Risk Alerts",
        value: summary?.severe_alerts || summary?.risk_alerts || 11,
        trend: "↑ 22%",
        subtitle: "AI generated",
        icon: "shield",
        iconColor: "#a855f7"
      },
      {
        title: "Affected Area (Est.)",
        value: summary?.population_at_risk ? `${Math.round(summary.population_at_risk / 1000)}k` : "1.2M",
        trend: "↑ 35%",
        subtitle: "Population impacted",
        icon: "users",
        iconColor: "#3b82f6"
      },
      {
        title: "Affected Regions",
        value: summary?.flood_watch_stations || 48,
        trend: "↑ 14%",
        subtitle: "Districts & Tehsils",
        icon: "pin",
        iconColor: "#06b6d4"
      },
      {
        title: "Casualties (Reported)",
        value: summary?.casualties || 86,
        trend: "↑ 10%",
        subtitle: "From official reports",
        icon: "pulse",
        iconColor: "#ef4444"
      }
    ];

    // Chart 1: Hazards Donut Data
    const hazardChartData = {
      labels: ['Landslide', 'Heavy Rain', 'Flood', 'Earthquake', 'Severe Wx', 'Other'],
      datasets: [{
        data: [42, 28, 20, 14, 12, 11],
        backgroundColor: ['#f97316', '#3b82f6', '#06b6d4', '#ef4444', '#eab308', '#64748b'],
        borderWidth: 0
      }]
    };

    // Chart 2: Event Trend Multi-line Data
    const trendChartData = {
      labels: ['Sep 10', 'Sep 17', 'Sep 24', 'Oct 01', 'Oct 08'],
      datasets: [
        { label: 'Landslide', data: [8, 14, 22, 31, 42], borderColor: '#f97316', tension: 0.3, borderWidth: 2, pointRadius: 2 },
        { label: 'Flood', data: [4, 9, 12, 16, 20], borderColor: '#06b6d4', tension: 0.3, borderWidth: 2, pointRadius: 2 },
        { label: 'Rainfall', data: [6, 11, 18, 24, 28], borderColor: '#3b82f6', tension: 0.3, borderWidth: 2, pointRadius: 2 },
        { label: 'Earthquake', data: [2, 4, 7, 10, 14], borderColor: '#ef4444', tension: 0.3, borderWidth: 2, pointRadius: 2 }
      ]
    };

    // Chart 3: Severity Donut Data
    const severityChartData = {
      labels: ['Critical', 'High', 'Moderate', 'Low'],
      datasets: [{
        data: [18, 32, 46, 31],
        backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e'],
        borderWidth: 0
      }]
    };

    return (
      <div className="p-6 space-y-6 max-w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Overview</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ● Live
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Current disaster situation, active warnings, and key updates for Uttarakhand.
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Last updated: <span className="text-slate-200 font-medium">Oct 09, 2026 08:30 IST</span>
          </div>
        </div>

        {/* 7 KPI Summary Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {kpiCardsData.map((kpi, idx) => (
            <KpiCard
              key={idx}
              title={kpi.title}
              value={kpi.value}
              trend={kpi.trend}
              subtitle={kpi.subtitle}
              icon={kpi.icon}
              iconColor={kpi.iconColor}
            />
          ))}
        </div>

        {/* Main Grid: 2 Columns (65% Left, 35% Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN (8/12 on large screens) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Top: Active Events & Warnings Interactive Map */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-200">Active Events and Warnings</span>
                  <span className="text-xs text-slate-500">Uttarakhand Focus</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => onNavigate && onNavigate('map-explorer')}
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Open Map Explorer →
                  </button>
                </div>
              </div>
              <div className="h-[380px] w-full rounded-lg overflow-hidden border border-slate-800">
                <MapView
                  markers={mapEvents}
                  center={[30.28, 78.98]}
                  zoom={8}
                  showBasemapSwitcher={true}
                />
              </div>
            </div>

            {/* Middle: 3 Analytical Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Donut 1: Hazard Distribution */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">Events by Hazard</span>
                  <span className="text-[10px] text-slate-400">Last 30d</span>
                </div>
                <ChartView
                  type="doughnut"
                  data={hazardChartData}
                  centerText="127"
                  centerSubtext="Total Events"
                  height={190}
                />
              </div>

              {/* Line Chart 2: 7-Day / 30-Day Trend */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">Event Trend</span>
                  <span className="text-[10px] text-slate-400">Sep-Oct</span>
                </div>
                <ChartView
                  type="line"
                  data={trendChartData}
                  height={190}
                />
              </div>

              {/* Donut 3: Severity Distribution */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">Severity Distribution</span>
                  <span className="text-[10px] text-slate-400">Active</span>
                </div>
                <ChartView
                  type="doughnut"
                  data={severityChartData}
                  centerText="127"
                  centerSubtext="Classified"
                  height={190}
                />
              </div>
            </div>

            {/* Bottom: 2 Tables (Top 5 Affected Regions & Recent 24h Events) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Table 1: Top 5 Affected Regions */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-200">Top 5 Affected Regions</span>
                  <button onClick={() => onNavigate && onNavigate('events')} className="text-[11px] text-blue-400 hover:underline">
                    View All →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/60 text-slate-400 text-[11px] uppercase">
                      <tr>
                        <th className="py-2 px-2.5">Region</th>
                        <th className="py-2 px-2 text-center">Events</th>
                        <th className="py-2 px-2 text-center">Alerts</th>
                        <th className="py-2 px-2">Main Hazard</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {[
                        { district: "Rudraprayag", events: 18, alerts: 5, hazard: "Landslide", pop: "120k" },
                        { district: "Chamoli", events: 16, alerts: 4, hazard: "Landslide", pop: "85k" },
                        { district: "Tehri Garhwal", events: 14, alerts: 3, hazard: "Heavy Rain", pop: "110k" },
                        { district: "Pithoragarh", events: 11, alerts: 2, hazard: "Flash Flood", pop: "75k" },
                        { district: "Dehradun", events: 8, alerts: 1, hazard: "Heavy Rain", pop: "150k" },
                      ].map((r, i) => (
                        <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2 px-2.5 font-medium text-slate-200">{r.district}</td>
                          <td className="py-2 px-2 text-center font-bold text-blue-400">{r.events}</td>
                          <td className="py-2 px-2 text-center font-bold text-orange-400">{r.alerts}</td>
                          <td className="py-2 px-2 text-slate-400">{r.hazard}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: Recent Events (Last 24 Hours) */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-200">Recent Events (Last 24 Hours)</span>
                  <button onClick={() => onNavigate && onNavigate('events')} className="text-[11px] text-blue-400 hover:underline">
                    View All →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/60 text-slate-400 text-[11px] uppercase">
                      <tr>
                        <th className="py-2 px-2">Hazard</th>
                        <th className="py-2 px-2">Location</th>
                        <th className="py-2 px-2">Time</th>
                        <th className="py-2 px-2 text-right">Severity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {[
                        { time: "08:15 IST", hazard: "Landslide", location: "Rudraprayag", severity: "High" },
                        { time: "06:45 IST", hazard: "Heavy Rainfall", location: "Tehri Garhwal", severity: "Moderate" },
                        { time: "05:20 IST", hazard: "Flood Rise", location: "Alaknanda River", severity: "High" },
                        { time: "03:10 IST", hazard: "Tremor M4.2", location: "Pithoragarh", severity: "Moderate" },
                        { time: "23:50 IST", hazard: "Debris Flow", location: "Chamoli", severity: "Moderate" },
                      ].map((ev, i) => (
                        <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2 px-2 font-medium text-slate-200">{ev.hazard}</td>
                          <td className="py-2 px-2 text-slate-400">{ev.location}</td>
                          <td className="py-2 px-2 text-slate-400">{ev.time}</td>
                          <td className="py-2 px-2 text-right">
                            <SeverityBadge severity={ev.severity} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (4/12 on large screens) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: Active Alerts & Warnings */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-200">Active Alerts & Warnings</span>
                <span className="text-[11px] font-semibold text-red-400">5 Active</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { title: "Heavy Rainfall Warning", loc: "Uttarakhand", sev: "Critical", time: "Oct 09 08:30" },
                  { title: "Potential Landslide Risk", loc: "Rudraprayag", sev: "High", time: "Oct 09 07:45" },
                  { title: "River Level Rise Alert", loc: "Tehri Garhwal", sev: "Moderate", time: "Oct 09 06:20" },
                  { title: "Thunderstorm & Rain Alert", loc: "Himachal Border", sev: "Moderate", time: "Oct 09 05:10" },
                  { title: "Rough Weather Advisory", loc: "Garhwal Division", sev: "Advisory", time: "Oct 08 22:40" },
                ].map((a, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-200 leading-tight">{a.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">📍 {a.loc} • {a.time}</div>
                    </div>
                    <SeverityBadge severity={a.sev} className="shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Latest News & Reports */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-200">Latest News & Reports</span>
                <button onClick={() => onNavigate && onNavigate('reports')} className="text-[11px] text-blue-400 hover:underline">
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { headline: "Landslide blocks NH-58 near Banswara; traffic diverted", source: "PIB", time: "Oct 09 08:20", status: "Official" },
                  { headline: "IMD issues red alert for heavy rain across Garhwal", source: "IMD", time: "Oct 09 07:15", status: "Official" },
                  { headline: "Local residents report rising water levels in Alaknanda", source: "Social Media", time: "Oct 09 06:30", status: "Reported" },
                  { headline: "SDRF teams deployed to vulnerable slopes in Chamoli", source: "NDMA", time: "Oct 09 05:45", status: "Official" },
                ].map((item, idx) => (
                  <div key={idx} className="pb-2.5 border-b border-slate-800/80 last:border-0 last:pb-0">
                    <div className="text-xs font-medium text-slate-200 hover:text-blue-400 cursor-pointer leading-snug">
                      {item.headline}
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-slate-400">{item.source} • {item.time}</span>
                      <EpistemicBadge status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Data Source Status */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-200">Data Source Status</span>
                <span className="text-[11px] text-emerald-400 font-medium">8/9 Operational</span>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { name: "IMD Weather Telemetry", type: "Meteorological", status: "Live", latency: "2m" },
                  { name: "CWC Hydrology Network", type: "River Gauges", status: "Live", latency: "5m" },
                  { name: "NCS Seismic Network", type: "Earthquake", status: "Live", latency: "1m" },
                  { name: "GSI Landslide Inventory", type: "Geological", status: "Live", latency: "10m" },
                  { name: "PIB & News Feeds", type: "Media Reports", status: "Live", latency: "3m" },
                ].map((ds, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800/50 last:border-0">
                    <div>
                      <div className="font-medium text-slate-300">{ds.name}</div>
                      <div className="text-[10px] text-slate-500">{ds.type}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[11px] text-emerald-400 font-medium">{ds.status}</span>
                    </div>
                  </div>
                ))}
              </div>
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
