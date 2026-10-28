// Disaster Intelligence Platform — View 7: History & Trends (Decadal Baseline & Seasonal Analytics)
// Light Operational Theme: 6-Cell Hairline Strip, Stacked Decadal Bar, Monsoon Dual-Axis Curve,
// Bhuvan/GSI Landslide Scar Inventory Map, 13-District Vulnerability Bar, Past Episode Benchmark Matrix

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { KpiCard, MapView, ChartView } = window.DisasterComponents || window;

  const HistoryTrendsView = () => {
    const [viewMode, setViewMode] = useState("trends");

    const [summaryData, setSummaryData] = useState({
      total_recorded_events: "1,420",
      decadal_trend_pct: "+24.8%",
      major_disasters: "16",
      historical_landslides: "892",
      most_vulnerable_district: "Rudraprayag",
      total_economic_impact_cr: "₹4,850 Cr"
    });

    const [granularity, setGranularity] = useState("yearly");
    const [trendsChartData, setTrendsChartData] = useState(null);
    const [seasonalChartData, setSeasonalChartData] = useState(null);
    const [regionalChartData, setRegionalChartData] = useState(null);
    const [landslideFeatures, setLandslideFeatures] = useState([]);
    const [inventoryDistrict, setInventoryDistrict] = useState("All Districts");
    const [comparisonData, setComparisonData] = useState(null);
    const [eventA, setEventA] = useState("2023_Rudraprayag");
    const [eventB, setEventB] = useState("2026_Basukedar");

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
          }
        } catch (err) {
          console.error("Error loading history summary:", err);
        }
      };
      fetchSummary();
      return () => { isSubscribed = false; };
    }, []);

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
            borderRadius: 1,
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
                borderColor: "#0B6E99",
                backgroundColor: "rgba(11, 110, 153, 0.10)",
                fill: true,
                tension: 0.3,
                yAxisID: 'y'
              },
              {
                label: "Landslide Events",
                data: landslideData,
                borderColor: "#B42318",
                backgroundColor: "transparent",
                tension: 0.3,
                borderDash: [4, 4],
                yAxisID: 'y1'
              },
              {
                label: "Flash Flood Events",
                data: floodData,
                borderColor: "#B54708",
                backgroundColor: "transparent",
                tension: 0.3,
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
              { label: "High Severity", data: highData, backgroundColor: "#B42318", stack: 'dist' },
              { label: "Moderate Severity", data: modData, backgroundColor: "#B54708", stack: 'dist' },
              { label: "Low Severity", data: lowData, backgroundColor: "#0B6E99", stack: 'dist' }
            ]
          });
        } catch (err) {
          console.error("Error loading regional distribution:", err);
        }
      };
      fetchRegional();
      return () => { isSubscribed = false; };
    }, []);

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
      <div className="p-4 space-y-4 max-w-full">
        {/* Header with Mode Toggle */}
        <div className="bg-surface border border-line rounded-[2px] p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-ink tracking-tight">
                History &amp; Decadal Trends (2015–2025 Baseline)
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded-[2px] font-mono uppercase tracking-wider bg-accent-soft text-accent border-l-2 border-accent font-semibold">
                CLIMATOLOGY &amp; SCAR ARCHIVE
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              10-year historical frequency baselines, monsoon seasonal wave patterns, NRSC Bhuvan / GSI landslide scar inventory, and cross-episode benchmarking.
            </p>
          </div>

          {/* Segmented Mode Toggle */}
          <div className="flex items-center border border-line-strong rounded-[2px] overflow-hidden bg-surface2 shrink-0 text-[11px] font-mono uppercase tracking-wider">
            <button
              onClick={() => setViewMode("trends")}
              className={`px-3 py-1.5 transition-colors ${
                viewMode === "trends"
                  ? "bg-accent text-white font-semibold"
                  : "text-muted hover:text-ink"
              }`}
            >
              Decadal Event Trends
            </button>
            <button
              onClick={() => setViewMode("inventory")}
              className={`px-3 py-1.5 transition-colors border-l border-line ${
                viewMode === "inventory"
                  ? "bg-accent text-white font-semibold"
                  : "text-muted hover:text-ink"
              }`}
            >
              GSI Landslide Inventory
            </button>
          </div>
        </div>

        {/* 6-Column Hairline KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-line border border-line rounded-[2px] overflow-hidden">
          <KpiCard
            title="Historical Events"
            value={summaryData.total_recorded_events}
            delta="2015–2025 archive"
            deltaTone="neutral"
            subtitle="10-year baseline"
          />
          <KpiCard
            title="Decadal Shift"
            value={summaryData.decadal_trend_pct}
            delta="+2.4% / yr slope"
            deltaTone="crit"
            subtitle="Frequency variance"
          />
          <KpiCard
            title="Major Disasters"
            value={summaryData.major_disasters}
            delta="Level-3 declared"
            deltaTone="crit"
            subtitle="State emergencies"
          />
          <KpiCard
            title="Mapped Landslides"
            value={summaryData.historical_landslides}
            delta="NRSC / GSI scars"
            deltaTone="warn"
            subtitle="Geotech inventory"
          />
          <KpiCard
            title="Peak Exposure Sector"
            value={summaryData.most_vulnerable_district}
            delta="134 events (10y)"
            deltaTone="crit"
            subtitle="Highest incident density"
          />
          <KpiCard
            title="Cumulative Loss"
            value={summaryData.total_economic_impact_cr}
            delta="Public infra & relief"
            deltaTone="neutral"
            subtitle="Assessed damages"
          />
        </div>

        {/* Middle Row: Stacked Bar Trends & Seasonal Multi-Line Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Decadal Trends Stacked Bar (7 cols) */}
          <div className="lg:col-span-7 bg-surface border border-line rounded-[2px] flex flex-col">
            <div className="px-3.5 py-2.5 bg-surface2 border-b border-line flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="panel-title">Event Frequency Over Time (Stacked Hazard Breakdown)</div>
                <span className="text-[11px] text-muted">Annual and monthly hazard distribution across 2016–2025</span>
              </div>

              <div className="flex items-center border border-line rounded-[2px] overflow-hidden bg-surface text-[10px] font-mono uppercase">
                <button
                  onClick={() => setGranularity("yearly")}
                  className={`px-2.5 py-1 transition-colors ${
                    granularity === "yearly" ? "bg-accent text-white font-semibold" : "text-muted hover:text-ink"
                  }`}
                >
                  Yearly (10Y)
                </button>
                <button
                  onClick={() => setGranularity("monthly")}
                  className={`px-2.5 py-1 transition-colors border-l border-line ${
                    granularity === "monthly" ? "bg-accent text-white font-semibold" : "text-muted hover:text-ink"
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="p-3.5 h-64 relative">
              {trendsChartData ? (
                <ChartView
                  type="bar"
                  data={trendsChartData}
                  height={230}
                  options={{
                    scales: {
                      x: { stacked: true },
                      y: { stacked: true }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted text-xs font-mono">LOADING DECADAL TRENDS...</div>
              )}
            </div>
          </div>

          {/* 12-Month Monsoon Seasonal Pattern Multi-Line Chart (5 cols) */}
          <div className="lg:col-span-5 bg-surface border border-line rounded-[2px] flex flex-col">
            <div className="px-3.5 py-2.5 bg-surface2 border-b border-line">
              <div className="panel-title">Seasonal Monsoon Wave (12-Month Climatology)</div>
              <span className="text-[11px] text-muted">Peak hazard window aligns with July–September SW monsoon surge</span>
            </div>

            <div className="p-3.5 h-64 relative">
              {seasonalChartData ? (
                <ChartView
                  type="line"
                  data={seasonalChartData}
                  height={230}
                  options={{
                    scales: {
                      y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Rainfall (mm)', color: '#0B6E99', font: { size: 10 } }
                      },
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Hazard Events', color: '#B42318', font: { size: 10 } },
                        grid: { drawOnChartArea: false }
                      }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted text-xs font-mono">LOADING SEASONAL CURVES...</div>
              )}
            </div>
          </div>
        </div>

        {/* Lower Row: Interactive Map & 13-District Vulnerability Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Interactive Historical Point Map (6 cols) */}
          <div className="lg:col-span-6 bg-surface border border-line rounded-[2px] flex flex-col">
            <div className="px-3.5 py-2.5 bg-surface2 border-b border-line flex items-center justify-between gap-2 flex-wrap">
              <div>
                <div className="panel-title">
                  {viewMode === "inventory" ? "NRSC Bhuvan / GSI Landslide Scar Inventory" : "Historical Disaster Density Map"}
                </div>
                <span className="text-[11px] text-muted">
                  {viewMode === "inventory" ? "Geotagged slope failure scars with trigger & volume telemetry" : "Decadal spatial disaster distribution across Uttarakhand"}
                </span>
              </div>

              {viewMode === "inventory" && (
                <select
                  value={inventoryDistrict}
                  onChange={(e) => setInventoryDistrict(e.target.value)}
                  className="bg-surface text-ink border border-line rounded-[2px] px-2 py-1 text-xs focus:outline-none focus:border-accent"
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

            <div className="p-3.5 space-y-2.5">
              <div className="h-64 rounded-[2px] overflow-hidden border border-line">
                <MapView
                  center={[30.35, 79.1]}
                  zoom={8}
                  markers={mapMarkers}
                  height="100%"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono py-1">
                <span className="text-muted shrink-0 uppercase font-semibold">CATALOGED SCARS:</span>
                {landslideFeatures.map((f, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-[2px] bg-surface2 border border-line text-ink2 shrink-0 tabular-nums"
                  >
                    {f.properties?.name || `Scar ${idx + 1}`} ({f.properties?.year})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 13-District Vulnerability Distribution Horizontal Stacked Bar (6 cols) */}
          <div className="lg:col-span-6 bg-surface border border-line rounded-[2px] flex flex-col">
            <div className="px-3.5 py-2.5 bg-surface2 border-b border-line">
              <div className="panel-title">Regional Vulnerability Distribution (13 LGD Districts)</div>
              <span className="text-[11px] text-muted">Cumulative 10-year hazard incidents stratified by severity tier</span>
            </div>

            <div className="p-3.5 h-72 relative">
              {regionalChartData ? (
                <ChartView
                  type="bar"
                  data={regionalChartData}
                  height={265}
                  options={{
                    indexAxis: 'y',
                    scales: {
                      x: { stacked: true },
                      y: { stacked: true }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted text-xs font-mono">LOADING REGIONAL VULNERABILITY...</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Past Event Comparison Widget */}
        <div className="bg-surface border border-line rounded-[2px] overflow-hidden">
          <div className="px-4 py-3 bg-surface2 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="panel-title">Historical Episode Benchmark Matrix</div>
              <p className="text-xs text-muted mt-0.5">
                Compare current crisis telemetry against historical baseline episodes in the same watershed to evaluate early-warning and response efficacy.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-muted text-[10px]">BASELINE A:</span>
                <select
                  value={eventA}
                  onChange={(e) => setEventA(e.target.value)}
                  className="bg-surface text-ink border border-line rounded-[2px] px-2 py-1 text-xs"
                >
                  <option value="2023_Rudraprayag">July 2023 Rudraprayag Flood</option>
                  <option value="2021_Chamoli">Feb 2021 Chamoli Avalanche</option>
                </select>
              </div>

              <span className="text-muted font-bold">VS</span>

              <div className="flex items-center gap-1.5">
                <span className="text-muted text-[10px]">ACTIVE B:</span>
                <select
                  value={eventB}
                  onChange={(e) => setEventB(e.target.value)}
                  className="bg-surface text-ink border border-line rounded-[2px] px-2 py-1 text-xs"
                >
                  <option value="2026_Basukedar">October 2026 Basukedar Slide</option>
                </select>
              </div>
            </div>
          </div>

          {comparisonData && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-[2px] bg-surface2 border border-line border-l-2 border-l-warn">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-semibold text-warn uppercase">
                      BASELINE HISTORICAL EPISODE
                    </span>
                    <span className="text-muted tabular-nums">{comparisonData.event_a?.date}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-ink mt-1">{comparisonData.event_a?.name}</h3>
                  <div className="text-xs text-muted mt-0.5">
                    Classification: <strong className="text-ink2">{comparisonData.event_a?.type}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-[2px] bg-surface2 border border-line border-l-2 border-l-accent">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-semibold text-accent uppercase">
                      CURRENT INCIDENT TELEMETRY
                    </span>
                    <span className="text-muted tabular-nums">{comparisonData.event_b?.date}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-ink mt-1">{comparisonData.event_b?.name}</h3>
                  <div className="text-xs text-muted mt-0.5">
                    Classification: <strong className="text-ink2">{comparisonData.event_b?.type}</strong>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-[2px] border border-line">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface2 text-muted border-b border-line font-mono text-[10px] uppercase tracking-wider">
                      <th className="py-2 px-3">Benchmark Parameter</th>
                      <th className="py-2 px-3">Baseline (Event A)</th>
                      <th className="py-2 px-3">Current (Event B)</th>
                      <th className="py-2 px-3">Variance &amp; Operational Assessment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {(comparisonData.metrics || []).map((m, idx) => {
                      const isPositive = m.comparison.includes("Improvement") || m.comparison.includes("Zero") || m.comparison.includes("-");
                      return (
                        <tr key={idx} className="hover:bg-surface2 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-ink">{m.metric}</td>
                          <td className="py-2.5 px-3 font-mono text-ink2 tabular-nums">{m.event_a}</td>
                          <td className="py-2.5 px-3 font-mono text-accent font-semibold tabular-nums">{m.event_b}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-semibold border-l-2 ${
                              isPositive
                                ? "bg-ok-soft text-ok border-ok"
                                : "bg-warn-soft text-warn border-warn"
                            }`}>
                              {m.comparison}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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
