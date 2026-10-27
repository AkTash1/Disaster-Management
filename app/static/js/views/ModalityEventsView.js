// Disaster Intelligence Multimodal Platform - View 4: Modality Events (image8.png)
// Specifications: 8 Modality KPI Cards, Left Modality Event List,
// Right Detail Panel with 5 Sub-tabs (Summary, Sensor/Raw Data with rainfall heatmap, Linked Observations, ML Models & Inferences, Event Group),
// Event Classification Selector (Detected, Reported, AI Inference, Predicted)

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { KpiCard, MapView, SeverityBadge, EpistemicBadge, StatusBadge } = window.DisasterComponents || window;

  const ModalityEventsView = () => {
    // 8 KPI counts
    const [kpis, setKpis] = useState({
      total: 482,
      earthquake: 36,
      flood: 92,
      landslide: 74,
      weather: 118,
      news: 64,
      social: 71,
      other: 27
    });

    const [modalityList, setModalityList] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [activeTab, setActiveTab] = useState("summary");
    const [classification, setClassification] = useState("detected");

    // Filters
    const [modalityFilter, setModalityFilter] = useState("All Modalities");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [page, setPage] = useState(1);

    // Fetch modality events list
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

    // Fetch modality event detail
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
            if (detail.classification || detail.event_type) {
              setClassification(String(detail.classification || detail.event_type).toLowerCase());
            }
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
      title: "Heavy Rainfall Detection",
      modality: "Weather",
      source: "IMD AWS (Rudraprayag Station)",
      hazard_type: "Heavy Rainfall",
      location: "Rudraprayag, Uttarakhand",
      timestamp: "Oct 09, 2026 08:25 IST",
      confidence: 0.82,
      classification: "Detected Event",
      status: "Processed",
      detection_method: "Threshold-based anomaly algorithm",
      matched_unified_event_id: "EV-2026-10-09-003",
      description: "Automated telemetry ingestion detected sustained rainfall exceeding 112 mm over a 3-hour period, crossing the critical flash flood and landslide susceptibility threshold for steep gradient slopes in Rudraprayag."
    };

    return (
      <div className="p-6 space-y-5 max-w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Modality Events</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Individual Sensor Feeds
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Events detected within individual modalities such as earthquake, weather, news, and social media.
            </p>
          </div>
        </div>

        {/* 8 Modality KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          <KpiCard title="Total" value={kpis.total || 482} delta="↑ 12%" icon="pulse" />
          <KpiCard title="Earthquake" value={kpis.earthquake || 36} delta="↑ 18%" icon="pulse" iconColor="#ef4444" />
          <KpiCard title="Flood" value={kpis.flood || 92} delta="↑ 25%" icon="waves" iconColor="#38bdf8" />
          <KpiCard title="Landslide" value={kpis.landslide || 74} delta="↑ 14%" icon="mountain" iconColor="#f97316" />
          <KpiCard title="Weather" value={kpis.weather || 118} delta="↑ 10%" icon="cloud" iconColor="#60a5fa" />
          <KpiCard title="News" value={kpis.news || 64} delta="↑ 8%" icon="feed" iconColor="#a855f7" />
          <KpiCard title="Social" value={kpis.social || 71} delta="↑ 6%" icon="users" iconColor="#06b6d4" />
          <KpiCard title="Other" value={kpis.other || 27} delta="↑ 4%" icon="activity" iconColor="#94a3b8" />
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="All Modalities">All Modalities</option>
              <option value="Weather">Weather</option>
              <option value="Hydrology">Hydrology</option>
              <option value="Seismic">Seismic</option>
              <option value="News">News</option>
              <option value="Social Media">Social Media</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
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
              className="text-slate-400 hover:text-slate-200 px-2 py-1"
            >
              Clear Filters
            </button>
          </div>
          <div className="text-slate-400">
            Showing <b className="text-slate-200">{modalityList.length}</b> events
          </div>
        </div>

        {/* Main Grid: Left Modality Master List + Right Detail Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: MASTER MODALITY EVENT LIST */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Telemetry & Ingestion Records
              </h2>
              <span className="text-[11px] text-slate-400">Page {page}</span>
            </div>

            <div className="divide-y divide-slate-800/80 max-h-[700px] overflow-y-auto">
              {modalityList.map((item) => {
                const id = item.modality_event_id || item.id;
                const isSelected = id === selectedId;
                const conf = item.confidence || 0.82;

                return (
                  <div
                    key={id}
                    onClick={() => setSelectedId(id)}
                    className={`p-3 cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-slate-800/90 border-l-4 border-blue-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-base">
                      {String(item.modality || '').includes('Weather') ? '🌧' : (String(item.modality || '').includes('Seismic') ? '⚡' : '📡')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-semibold text-xs text-slate-200 truncate">
                          {item.title || item.event_name || `${item.hazard || 'Hazard'} Detection`}
                        </h3>
                        <span className="font-mono text-xs font-bold text-red-400">
                          {conf.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                        <span className="truncate">{item.source || item.modality || "Telemetry"}</span>
                        <span>{item.time || item.timestamp || "Recent"}</span>
                      </div>

                      <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-800/50">
                        <EpistemicBadge status={item.type || item.classification || "Detected"} />
                        <StatusBadge status={item.status || "Processed"} />
                      </div>
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
              <span>Page {page} of 25</span>
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
              >
                Next
              </button>
            </div>
          </div>

          {/* RIGHT: DETAIL PANEL */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow space-y-4 p-5">
            {/* Header */}
            <div className="border-b border-slate-800 pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌧</span>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      {currentItem.title || "Heavy Rainfall Detection"}
                    </h2>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-blue-400">{currentItem.modality_event_id || "ME-WTH-2026-10-09-001"}</span>
                      <span>•</span>
                      <span>{currentItem.source || "IMD AWS"}</span>
                      <span>•</span>
                      <span>{currentItem.timestamp || "Oct 09, 2026 08:25 IST"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <EpistemicBadge status={currentItem.classification || "Detected"} />
                  <StatusBadge status={currentItem.status || "Processed"} />
                  <div className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">Confidence:</span>
                    <span className="font-bold text-xs text-red-400 font-mono">
                      {(currentItem.confidence || 0.82).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5 Sub-tabs Navigation */}
              <div className="flex flex-wrap border-b border-slate-800/80 mt-4 text-xs font-semibold gap-1">
                {[
                  { id: 'summary', label: 'Summary' },
                  { id: 'sensor', label: 'Sensor / Raw Data' },
                  { id: 'observations', label: 'Linked Observations (6)' },
                  { id: 'ml', label: 'ML Models & Inferences' },
                  { id: 'unified', label: 'Related Unified Event' }
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

            {/* Sub-tab 1: Summary */}
            {activeTab === 'summary' && (
              <div className="space-y-4 text-xs">
                {/* Top Row: Mini-Map + Key Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mini-Map with Rainfall Heatmap bar */}
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/60 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-300">Rainfall Radar Telemetry</span>
                      <span className="text-[10px] text-slate-400">IMD Doppler Radar</span>
                    </div>
                    <div className="h-32 rounded-lg overflow-hidden border border-slate-700">
                      <MapView
                        center={[30.28, 78.98]}
                        zoom={9}
                        markers={[{
                          lat: 30.2849,
                          lon: 78.9867,
                          title: "Rudraprayag AWS Station",
                          hazard: "Heavy Rainfall",
                          severity: "High"
                        }]}
                        showBasemapSwitcher={false}
                      />
                    </div>
                    {/* 0-200mm Gradient Bar */}
                    <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400">
                      <span>0 mm</span>
                      <div className="flex-1 mx-2 h-2 rounded bg-gradient-to-r from-blue-300 via-yellow-400 to-red-600"></div>
                      <span>200+ mm</span>
                    </div>
                  </div>

                  {/* Key Information */}
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/60 space-y-1.5">
                    <div className="font-semibold text-slate-300 mb-1">Telemetry Attributes</div>
                    <div className="flex justify-between py-0.5 border-b border-slate-700/40">
                      <span className="text-slate-400">Modality:</span>
                      <span className="text-slate-200 font-medium">{currentItem.modality || "Weather"}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-700/40">
                      <span className="text-slate-400">Detection Method:</span>
                      <span className="text-slate-200">Threshold Trigger</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-700/40">
                      <span className="text-slate-400">Rainfall Rate:</span>
                      <span className="text-blue-400 font-bold font-mono">112 mm / 3h</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-700/40">
                      <span className="text-slate-400">Unified Event Link:</span>
                      <span className="text-blue-400 font-mono underline cursor-pointer">
                        🔗 {currentItem.matched_unified_event_id || "EV-2026-10-09-003"}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Related Hazards:</span>
                      <span className="text-orange-400">Flood, Landslide</span>
                    </div>
                  </div>
                </div>

                {/* Event Description */}
                <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/60">
                  <div className="font-semibold text-slate-300 mb-1">Modality Ingestion Note</div>
                  <p className="text-slate-300 leading-relaxed">
                    {currentItem.description || "Automated telemetry ingestion detected sustained rainfall exceeding 112 mm over a 3-hour period, crossing the critical flash flood and landslide susceptibility threshold for steep gradient slopes in Rudraprayag."}
                  </p>
                </div>

                {/* Event Classification Selector (Radio buttons) */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60">
                  <div className="font-bold text-slate-200 mb-2 uppercase tracking-wider text-[11px]">
                    Event Classification (Epistemic Categorization)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {[
                      { id: "detected", label: "Detected Event", desc: "Directly detected from physical sensor streams" },
                      { id: "reported", label: "Reported Incident", desc: "Reported via news or social media sources" },
                      { id: "inference", label: "AI Inference", desc: "Derived by spatio-temporal ML models" },
                      { id: "predicted", label: "Predicted Event", desc: "Simulated forecast for future timeframe" },
                    ].map(opt => (
                      <label
                        key={opt.id}
                        className={`p-2.5 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-colors ${
                          classification === opt.id
                            ? 'bg-blue-600/15 border-blue-500 text-white'
                            : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:bg-slate-800/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="classification"
                          value={opt.id}
                          checked={classification === opt.id}
                          onChange={(e) => setClassification(e.target.value)}
                          className="mt-0.5 text-blue-600 focus:ring-0 bg-slate-800 border-slate-700"
                        />
                        <div>
                          <div className="font-semibold text-slate-200">{opt.label}</div>
                          <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bottom 3 Columns: Observations, Derived Results, Evidence */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                    <div className="font-semibold text-slate-300 mb-2">Supporting Observations</div>
                    <ul className="space-y-1.5 text-[11px] text-slate-400">
                      <li>• 08:25 - AWS Hourly 112 mm</li>
                      <li>• 08:20 - Steep radar reflectivity dBZ 52</li>
                      <li>• 08:15 - Adjoining station high rate</li>
                      <li>• 08:10 - Cloud top brightness temp -68°C</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                    <div className="font-semibold text-slate-300 mb-2">Derived Results</div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Flash Flood Score:</span>
                        <span className="text-red-400 font-bold font-mono">0.85</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Landslide Susceptibility:</span>
                        <span className="text-orange-400 font-bold font-mono">0.72</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Buffer Radius:</span>
                        <span className="text-slate-300">15 km</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                    <div className="font-semibold text-slate-300 mb-2">Related Evidence</div>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-300">IMD Bulletin #42</span>
                        <EpistemicBadge status="Official" />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">CWC Hydro Gauge</span>
                        <EpistemicBadge status="Observed" />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Doppler Radar Raster</span>
                        <EpistemicBadge status="Observed" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other sub-tabs fallback */}
            {activeTab !== 'summary' && (
              <div className="p-8 text-center bg-slate-800/30 rounded-xl border border-slate-700/40 text-slate-400 text-xs">
                <span className="text-2xl block mb-2">🔬</span>
                <span className="font-semibold text-slate-200 block mb-1">
                  Sub-Tab: {activeTab.toUpperCase()}
                </span>
                Raw sensor arrays, telemetry streams, and ML model inference parameters for {currentItem.modality_event_id}.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  window.DisasterViews = window.DisasterViews || {};
  window.DisasterViews.ModalityEventsView = ModalityEventsView;
  window.ModalityEventsView = ModalityEventsView;
})();
