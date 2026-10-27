// Disaster Intelligence Multimodal Platform - View 7: History & Trends (image1.png)
// Specifications: Top Right Toggle (Events Trends vs Landslide Inventory),
// 6 Historical KPI Summary Cards (2015-2025 Baseline),
// 10-Year Yearly/Monthly Stacked Bar Chart, 12-Month Seasonal Pattern Multi-Line Chart (Monsoon Peak),
// Interactive Historical Map & Bhuvan/GSI Landslide Point Inventory,
// 13-District Regional Vulnerability Distribution Horizontal Stacked Bar Chart,
// Side-by-Side Past Event Comparison Widget (July 2023 vs October 2026).

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { KpiCard, MapView, ChartView } = window.DisasterComponents || window;

  const HistoryTrendsView = () => {
    // Mode toggle: 'trends' (Events Trends) vs 'inventory' (Landslide Inventory)
    const [viewMode, setViewMode] = useState("trends");

    // KPI Summary Data
    const [summaryData, setSummaryData] = useState({
      total_recorded_events: "1,420",
      decadal_trend_pct: "+24.8%",
      major_disasters: "16",
      historical_landslides: "892",
      most_vulnerable_district: "Rudraprayag",
      total_economic_impact_cr: "₹4,850 Cr"
    });

    // Trend Granularity: 'yearly' vs 'monthly'
    const [granularity, setGranularity] = useState("yearly");
    const [trendsChartData, setTrendsChartData] = useState(null);

    // Seasonal Multi-Line Data
    const [seasonalChartData, setSeasonalChartData] = useState(null);

    // Regional 13-District Distribution
    const [regionalChartData, setRegionalChartData] = useState(null);

    // Landslide Inventory GeoJSON & Filter
    const [landslideFeatures, setLandslideFeatures] = useState([]);
    const [inventoryDistrict, setInventoryDistrict] = useState("All Districts");

    // Comparison Widget State
    const [comparisonData, setComparisonData] = useState(null);
    const [eventA, setEventA] = useState("2023_Rudraprayag");
    const [eventB, setEventB] = useState("2026_Basukedar");

    // Loading states
    const [loadingSummary, setLoadingSummary] = useState(true);

    // 1. Fetch Summary KPIs
    useEffect(() => {
      let isSubscribed = true;
      const fetchSummary = async () => {
        try {
          const res = await fetch("/api/v1/history/summary");
          if (!res.ok) return;
          const data = await res.json();
          if (isSubscribed) {
            setSummaryData({
              total_recorded_events: data.total_recorded_events ? data.total_recorded_events.toLocaleString() : "1,420",
              decadal_trend_pct: data.decadal_trend_pct ? `+${data.decadal_trend_pct}%` : "+24.8%",
              major_disasters: String(data.major_disasters || 16),
              historical_landslides: data.historical_landslides ? data.historical_landslides.toLocaleString() : "892",
              most_vulnerable_district: data.most_vulnerable_district || "Rudraprayag",
              total_economic_impact_cr: data.total_economic_impact_cr ? `₹${data.total_economic_impact_cr.toLocaleString()} Cr` : "₹4,850 Cr"
            });
            setLoadingSummary(false);
          }
        } catch (err) {
          console.error("Error loading history summary:", err);
          if (isSubscribed) setLoadingSummary(false);
        }
      };
      fetchSummary();
      return () => { isSubscribed = false; };
    }, []);

    // 2. Fetch Historical Trends (Stacked Bar)
    useEffect(() => {
      let isSubscribed = true;
      const fetchTrends = async () => {
        try {
          const res = await fetch(`/api/v1/history/trends?granularity=${granularity}`);
          if (!res.ok) return;
          const data = await res.json();
          if (!isSubscribed) return;

          const labels = data.labels || [];
          const datasets = (data.datasets || []).map(ds => ({
            label: ds.name,
            data: ds.data,
            backgroundColor: ds.color,
            borderRadius: 3,
            stack: 'combined'
          }));

          setTrendsChartData({ labels, datasets });
        } catch (err) {
          console.error("Error loading history trends:", err);
        }
      };
      fetchTrends();
      return () => { isSubscribed = false; };
    }, [granularity]);

    // 3. Fetch Seasonal Patterns (Multi-line)
    useEffect(() => {
      let isSubscribed = true;
      const fetchSeasonal = async () => {
        try {
          const res = await fetch("/api/v1/history/seasonal");
          if (!res.ok) return;
          const list = await res.json();
          if (!isSubscribed) return;

          const labels = list.map(item => item.month);
          const rainfallData = list.map(item => item.rainfall_mm);
          const landslideData = list.map(item => item.landslide_events);
          const floodData = list.map(item => item.flood_events);

          setSeasonalChartData({
            labels: labels,
            datasets: [
              {
                label: "Monsoon Rainfall (mm)",
                data: rainfallData,
                borderColor: "#38bdf8",
                backgroundColor: "rgba(56, 189, 248, 0.15)",
                fill: true,
                tension: 0.35,
                yAxisID: 'y'
              },
              {
                label: "Landslide Events",
                data: landslideData,
                borderColor: "#ef4444",
                backgroundColor: "transparent",
                tension: 0.35,
                borderDash: [4, 4],
                yAxisID: 'y1'
              },
              {
                label: "Flash Flood Events",
                data: floodData,
                borderColor: "#06b6d4",
                backgroundColor: "transparent",
                tension: 0.35,
                yAxisID: 'y1'
              }
            ]
          });
        } catch (err) {
          console.error("Error loading seasonal patterns:", err);
        }
      };
      fetchSeasonal();
      return () => { isSubscribed = false; };
    }, []);

    // 4. Fetch Regional Distribution (13 Districts)
    useEffect(() => {
      let isSubscribed = true;
      const fetchRegional = async () => {
        try {
          const res = await fetch("/api/v1/history/regional-distribution");
          if (!res.ok) return;
          const list = await res.json();
          if (!isSubscribed) return;

          const labels = list.map(item => item.district);
          const highData = list.map(item => item.high);
          const modData = list.map(item => item.moderate);
          const lowData = list.map(item => item.low);

          setRegionalChartData({
            labels: labels,
            datasets: [
              { label: "High Severity", data: highData, backgroundColor: "#ef4444", stack: 'dist' },
              { label: "Moderate Severity", data: modData, backgroundColor: "#f59e0b", stack: 'dist' },
              { label: "Low Severity", data: lowData, backgroundColor: "#3b82f6", stack: 'dist' }
            ]
          });
        } catch (err) {
          console.error("Error loading regional distribution:", err);
        }
      };
      fetchRegional();
      return () => { isSubscribed = false; };
    }, []);

    // 5. Fetch Landslide Inventory Scars
    useEffect(() => {
      let isSubscribed = true;
      const fetchLandslides = async () => {
        try {
          let url = "/api/v1/history/landslides";
          if (inventoryDistrict !== "All Districts") {
            url += `?district=${encodeURIComponent(inventoryDistrict)}`;
          }
          const res = await fetch(url);
          if (!res.ok) return;
          const geojson = await res.json();
          if (isSubscribed) {
            setLandslideFeatures(geojson.features || []);
          }
        } catch (err) {
          console.error("Error loading landslide inventory:", err);
        }
      };
      fetchLandslides();
      return () => { isSubscribed = false; };
    }, [inventoryDistrict]);

    // 6. Fetch Comparison Widget
    useEffect(() => {
      let isSubscribed = true;
      const fetchCompare = async () => {
        try {
          const res = await fetch(`/api/v1/history/compare?event_a=${eventA}&event_b=${eventB}`);
          if (!res.ok) return;
          const data = await res.json();
          if (isSubscribed) {
            setComparisonData(data);
          }
        } catch (err) {
          console.error("Error loading event comparison:", err);
        }
      };
      fetchCompare();
      return () => { isSubscribed = false; };
    }, [eventA, eventB]);

    // Format Landslide Scars for MapView
    const mapMarkers = (landslideFeatures || []).map(f => {
      const coords = f.geometry?.coordinates || [79.064, 30.482];
      const p = f.properties || {};
      return {
        id: f.id || p.scar_id,
        lat: coords[1],
        lng: coords[0],
        title: `${p.name || 'Landslide Scar'} (${p.year || 'Hist'})`,
        hazard: "landslide",
        severity: "High",
        subtitle: `Trigger: ${p.trigger || 'Rainfall'} • Vol: ${(p.volume_m3 || 0).toLocaleString()} m³`
      };
    });

    return (
      <div className="p-6 space-y-6 max-w-full">
        {/* Header with Mode Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>History & Trends</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                View 7 • Decadal Analytics (2015–2025)
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Examine 10-year historical baselines, monthly monsoon seasonal patterns, Bhuvan/GSI landslide inventory, and side-by-side event comparisons.
            </p>
          </div>

          {/* Top Right Mode Toggle matching image1.png */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shadow shrink-0">
            <button
              onClick={() => setViewMode("trends")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === "trends"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>📊</span>
              <span>Events Trends</span>
            </button>
            <button
              onClick={() => setViewMode("inventory")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === "inventory"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>⛰️</span>
              <span>Landslide Inventory</span>
            </button>
          </div>
        </div>

        {/* 6 Historical KPI Summary Cards (image1.png) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard
            title="Total Historical Events"
            value={summaryData.total_recorded_events}
            trend="↑ 12%"
            subtitle="2015–2025 decadal archive"
            icon="pulse"
          />
          <KpiCard
            title="Decadal Shift"
            value={summaryData.decadal_trend_pct}
            trend="↑ 8%"
            subtitle="Accelerating frequency"
            icon="activity"
            iconColor="#f59e0b"
          />
          <KpiCard
            title="Major Disasters"
            value={summaryData.major_disasters}
            subtitle="State Level-3 emergencies"
            icon="warning"
            iconColor="#ef4444"
          />
          <KpiCard
            title="Mapped Landslides"
            value={summaryData.historical_landslides}
            subtitle="Bhuvan NRSC inventory"
            icon="alert"
            iconColor="#eab308"
          />
          <KpiCard
            title="Most Vulnerable"
            value={summaryData.most_vulnerable_district}
            subtitle="134 events in 10 yrs"
            icon="shield"
            iconColor="#38bdf8"
          />
          <KpiCard
            title="Total Economic Loss"
            value={summaryData.total_economic_impact_cr}
            subtitle="Infrastructure & relief"
            icon="waves"
            iconColor="#a855f7"
          />
        </div>

        {/* Middle Row: Stacked Bar Trends & Seasonal Multi-Line Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Decadal Trends Stacked Bar (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>📈</span>
                  <span>Event Trends Over Time (Stacked Hazard Distribution)</span>
                </h2>
                <span className="text-[11px] text-slate-400">Hazard breakdown across 2016–2025</span>
              </div>

              {/* Granularity Switcher: Yearly vs Monthly */}
              <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
                <button
                  onClick={() => setGranularity("yearly")}
                  className={`px-2 py-1 rounded text-[11px] transition font-medium ${
                    granularity === "yearly" ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Yearly (10 Yrs)
                </button>
                <button
                  onClick={() => setGranularity("monthly")}
                  className={`px-2 py-1 rounded text-[11px] transition font-medium ${
                    granularity === "monthly" ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Monthly Aggregated
                </button>
              </div>
            </div>

            <div className="h-64 relative">
              {trendsChartData ? (
                <ChartView
                  type="bar"
                  data={trendsChartData}
                  height={250}
                  options={{
                    scales: {
                      x: { stacked: true, grid: { color: 'rgba(51,65,85,0.2)' }, ticks: { color: '#94a3b8' } },
                      y: { stacked: true, grid: { color: 'rgba(51,65,85,0.2)' }, ticks: { color: '#94a3b8' } }
                    },
                    plugins: {
                      legend: { display: true, position: 'top', labels: { color: '#cbd5e1', boxWidth: 10 } }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">Loading trends chart...</div>
              )}
            </div>
          </div>

          {/* 12-Month Monsoon Seasonal Pattern Multi-Line Chart (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow">
            <div className="mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>🌧️</span>
                <span>Seasonal Monsoon Pattern (12-Month Cyclical Wave)</span>
              </h2>
              <span className="text-[11px] text-slate-400">Peak hazard window aligns with July–September rainfall surge</span>
            </div>

            <div className="h-64 relative">
              {seasonalChartData ? (
                <ChartView
                  type="line"
                  data={seasonalChartData}
                  height={250}
                  options={{
                    scales: {
                      y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Rainfall (mm)', color: '#38bdf8', font: { size: 10 } },
                        grid: { color: 'rgba(56, 189, 248, 0.1)' },
                        ticks: { color: '#38bdf8' }
                      },
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Hazard Events', color: '#ef4444', font: { size: 10 } },
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#ef4444' }
                      },
                      x: { grid: { color: 'rgba(51,65,85,0.2)' }, ticks: { color: '#94a3b8' } }
                    },
                    plugins: {
                      legend: { display: true, position: 'top', labels: { color: '#cbd5e1', boxWidth: 10 } }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">Loading seasonal curves...</div>
              )}
            </div>
          </div>
        </div>

        {/* Lower Row: Interactive Map & 13-District Vulnerability Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Interactive Historical Point Map (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>🗺️</span>
                  <span>{viewMode === "inventory" ? "Bhuvan / GSI Landslide Scar Inventory" : "Historical Disaster Event Map"}</span>
                </h2>
                <span className="text-[11px] text-slate-400">
                  {viewMode === "inventory" ? "Geotagged slope failure scars with trigger & volume telemetry" : "Decadal spatial disaster density across Uttarakhand"}
                </span>
              </div>

              {/* District Filter for Inventory */}
              {viewMode === "inventory" && (
                <select
                  value={inventoryDistrict}
                  onChange={(e) => setInventoryDistrict(e.target.value)}
                  className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="All Districts">All Districts</option>
                  <option value="Rudraprayag">Rudraprayag</option>
                  <option value="Chamoli">Chamoli</option>
                  <option value="Uttarkashi">Uttarkashi</option>
                  <option value="Pauri Garhwal">Pauri Garhwal</option>
                  <option value="Pithoragarh">Pithoragarh</option>
                </select>
              )}
            </div>

            <div className="h-72 rounded-xl overflow-hidden border border-slate-700/80">
              <MapView
                center={[30.35, 79.1]}
                zoom={8}
                markers={mapMarkers}
                height="100%"
              />
            </div>

            {/* Inventory Scars List Pills */}
            <div className="flex items-center gap-2 overflow-x-auto text-xs py-1">
              <span className="text-slate-400 shrink-0 font-semibold text-[11px]">Identified Scars:</span>
              {landslideFeatures.map((f, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 shrink-0 text-[11px]"
                >
                  📍 {f.properties?.name || `Scar ${idx + 1}`} ({f.properties?.year})
                </span>
              ))}
            </div>
          </div>

          {/* 13-District Vulnerability Distribution Horizontal Stacked Bar (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow space-y-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>📊</span>
                <span>Regional Vulnerability Distribution (All 13 Uttarakhand Districts)</span>
              </h2>
              <span className="text-[11px] text-slate-400">Total decadal hazard incidents ordered by risk severity</span>
            </div>

            <div className="h-72 relative">
              {regionalChartData ? (
                <ChartView
                  type="bar"
                  data={regionalChartData}
                  height={280}
                  options={{
                    indexAxis: 'y',
                    scales: {
                      x: { stacked: true, grid: { color: 'rgba(51,65,85,0.2)' }, ticks: { color: '#94a3b8' } },
                      y: { stacked: true, grid: { color: 'rgba(51,65,85,0.2)' }, ticks: { color: '#cbd5e1', font: { size: 10 } } }
                    },
                    plugins: {
                      legend: { display: true, position: 'top', labels: { color: '#cbd5e1', boxWidth: 10 } }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">Loading regional vulnerability...</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Past Event Comparison Widget (image1.png) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                <span>⚖️</span>
                <span>Past Disaster Episode Comparison Tool</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Benchmark current crisis telemetry against past severe episodes in the same watershed to assess mitigation efficacy.
              </p>
            </div>

            {/* Event Selectors */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Event A:</span>
                <select
                  value={eventA}
                  onChange={(e) => setEventA(e.target.value)}
                  className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs"
                >
                  <option value="2023_Rudraprayag">July 2023 Rudraprayag Flood</option>
                  <option value="2021_Chamoli">Feb 2021 Chamoli Avalanche</option>
                </select>
              </div>

              <span className="text-slate-500 font-bold">vs</span>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Event B:</span>
                <select
                  value={eventB}
                  onChange={(e) => setEventB(e.target.value)}
                  className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs"
                >
                  <option value="2026_Basukedar">October 2026 Basukedar Slide</option>
                </select>
              </div>
            </div>
          </div>

          {/* Comparison Cards & Metrics Table */}
          {comparisonData && (
            <div className="space-y-4">
              {/* Event Heads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                      BASELINE HISTORICAL EVENT
                    </span>
                    <span className="text-xs text-slate-400">{comparisonData.event_a?.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1.5">{comparisonData.event_a?.name}</h3>
                  <div className="text-xs text-slate-300 mt-1">
                    <strong>Classification:</strong> {comparisonData.event_a?.type}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-blue-500/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                      CURRENT INCIDENT TELEMETRY
                    </span>
                    <span className="text-xs text-slate-400">{comparisonData.event_b?.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1.5">{comparisonData.event_b?.name}</h3>
                  <div className="text-xs text-slate-300 mt-1">
                    <strong>Classification:</strong> {comparisonData.event_b?.type}
                  </div>
                </div>
              </div>

              {/* Side-by-Side Metrics Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-850 text-slate-400 border-b border-slate-800 font-semibold">
                      <th className="p-3">Comparison Metric</th>
                      <th className="p-3">July 2023 Baseline</th>
                      <th className="p-3">October 2026 Incident</th>
                      <th className="p-3">System Variance & Efficacy Evaluation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(comparisonData.metrics || []).map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition">
                        <td className="p-3 font-semibold text-slate-200">{m.metric}</td>
                        <td className="p-3 font-mono text-amber-300">{m.event_a}</td>
                        <td className="p-3 font-mono text-blue-300">{m.event_b}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            m.comparison.includes("Improvement") || m.comparison.includes("Zero") || m.comparison.includes("-")
                              ? "bg-emerald-900/30 text-emerald-300 border border-emerald-600/30"
                              : "bg-orange-900/30 text-orange-300 border border-orange-600/30"
                          }`}>
                            {m.comparison}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  window.DisasterViews = window.DisasterViews || {};
  window.DisasterViews.HistoryTrendsView = HistoryTrendsView;
  window.HistoryTrendsView = HistoryTrendsView;
})();
