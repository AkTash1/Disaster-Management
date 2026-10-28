// Disaster Intelligence Platform — View 4: Modality Events (Single-Sensor Ingestion Feeds)
// Light Operational Theme: 8-Cell Sensor Telemetry Strip, Master Ingestion Log, Epistemic Classification Matrix

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { KpiCard, MapView, SeverityBadge, EpistemicBadge, StatusBadge } = window.DisasterComponents || window;

  const ModalityEventsView = () => {
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
      timestamp: "2026-10-09 08:25 IST",
      confidence: 0.82,
      classification: "Detected Event",
      status: "Processed",
      detection_method: "Threshold-based anomaly algorithm",
      matched_unified_event_id: "EV-2026-10-09-003",
      description: "Automated telemetry ingestion detected sustained rainfall exceeding 112 mm over a 3-hour window, crossing the critical flash flood and slope failure threshold for steep gradient catchments in Rudraprayag."
    };

    const modTag = (mod) => {
      const s = String(mod || "").toLowerCase();
      if (s.includes("weather")) return "WTH";
      if (s.includes("seismic") || s.includes("earth")) return "EQK";
      if (s.includes("hydro") || s.includes("flood")) return "HYD";
      if (s.includes("news")) return "NWS";
      if (s.includes("social")) return "SOC";
      return "SEN";
    };

    return (
      <div className="p-4 space-y-4 max-w-full">
        {/* Header */}
        <div className="bg-surface border border-line rounded-[2px] p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-ink tracking-tight">
                Modality Events (Single-Sensor Detections)
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded-[2px] font-mono uppercase tracking-wider bg-ok-soft text-ok border-l-2 border-ok font-semibold">
                TIER-2 INGESTION STREAM
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Raw anomaly detections within individual sensor modalities (IMD Doppler, CWC Hydrology, NCS Seismic, Press, Social Telemetry) prior to multi-sensor fusion.
            </p>
          </div>
          <div className="text-[11px] font-mono text-muted tabular-nums">
            INGESTED: <strong className="text-ink">{kpis.total || 482} DETECTIONS</strong>
          </div>
        </div>

        {/* 8-Column Hairline Modality Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-px bg-line border border-line rounded-[2px] overflow-hidden">
          <KpiCard title="Total Stream" value={kpis.total || 482} delta="100% indexed" deltaTone="neutral" />
          <KpiCard title="Seismic (NCS)" value={kpis.earthquake || 36} delta="7.5% share" deltaTone="neutral" />
          <KpiCard title="Hydrology (CWC)" value={kpis.flood || 92} delta="19.1% share" deltaTone="warn" />
          <KpiCard title="Geotech (GSI)" value={kpis.landslide || 74} delta="15.4% share" deltaTone="crit" />
          <KpiCard title="Weather (IMD)" value={kpis.weather || 118} delta="24.5% share" deltaTone="neutral" />
          <KpiCard title="Press / Media" value={kpis.news || 64} delta="13.3% share" deltaTone="neutral" />
          <KpiCard title="Social Crowd" value={kpis.social || 71} delta="14.7% share" deltaTone="neutral" />
          <KpiCard title="Other / UAV" value={kpis.other || 27} delta="5.6% share" deltaTone="neutral" />
        </div>

        {/* Filter Bar */}
        <div className="bg-surface border border-line rounded-[2px] px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-muted pr-1">
              MODALITY FILTER:
            </span>
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              className="bg-surface2 text-ink border border-line rounded-[2px] px-2.5 py-1 text-xs focus:outline-none focus:border-accent"
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
              className="bg-surface2 text-ink border border-line rounded-[2px] px-2.5 py-1 text-xs focus:outline-none focus:border-accent"
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
              className="text-[11px] font-mono uppercase tracking-wider text-muted hover:text-ink px-2 py-1 rounded-[2px] hover:bg-surface2"
            >
              Reset
            </button>
          </div>
          <div className="text-[11px] font-mono text-muted tabular-nums">
            SHOWING <strong className="text-ink">{modalityList.length}</strong> RECORDS
          </div>
        </div>

        {/* Main Grid: Left Modality Master List + Right Detail Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT: MASTER MODALITY EVENT LIST */}
          <div className="lg:col-span-5 bg-surface border border-line rounded-[2px] overflow-hidden">
            <div className="px-3.5 py-2.5 bg-surface2 border-b border-line flex items-center justify-between">
              <span className="panel-title">Telemetry &amp; Ingestion Records</span>
              <span className="text-[10px] font-mono text-muted tabular-nums">PAGE {page}</span>
            </div>

            <div className="divide-y divide-line max-h-[700px] overflow-y-auto">
              {modalityList.map((item) => {
                const id = item.modality_event_id || item.id;
                const isSelected = id === selectedId;
                const conf = item.confidence || 0.82;

                return (
                  <div
                    key={id}
                    onClick={() => setSelectedId(id)}
                    className={`p-3 cursor-pointer transition-colors flex items-start gap-2.5 border-l-[3px] ${
                      isSelected
                        ? 'bg-accent-soft/50 border-l-accent'
                        : 'bg-surface hover:bg-surface2 border-l-transparent'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-[2px] bg-surface2 border border-line flex items-center justify-center shrink-0 font-mono text-[10px] font-bold text-ink2">
                      {modTag(item.modality)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-semibold text-xs text-ink truncate">
                          {item.title || item.event_name || `${item.hazard || 'Hazard'} Detection`}
                        </h3>
                        <span className="font-mono text-[11px] font-semibold text-accent tabular-nums">
                          {conf.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-[11px] text-muted mt-0.5 flex items-center justify-between font-mono tabular-nums">
                        <span className="truncate">{item.source || item.modality || "Telemetry"}</span>
                        <span>{item.time || item.timestamp || "08:25 IST"}</span>
                      </div>

                      <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-line">
                        <EpistemicBadge status={item.type || item.classification || "Detected"} />
                        <StatusBadge status={item.status || "Processed"} />
                      </div>
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
              <span className="tabular-nums">PAGE {page} OF 25</span>
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-2.5 py-1 rounded-[2px] bg-surface border border-line hover:border-line-strong text-ink"
              >
                NEXT &rarr;
              </button>
            </div>
          </div>

          {/* RIGHT: DETAIL PANEL */}
          <div className="lg:col-span-7 bg-surface border border-line rounded-[2px] overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-surface2 border-b border-line">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded-[2px] bg-ink text-white font-mono text-[10px] font-semibold">
                      {currentItem.modality_event_id || "ME-WTH-2026-10-09-001"}
                    </span>
                    <span className="text-[11px] font-mono text-muted">
                      {currentItem.source || "IMD AWS"}
                    </span>
                    <span className="text-[11px] font-mono text-muted tabular-nums">
                      &bull; {currentItem.timestamp || "2026-10-09 08:25 IST"}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-ink tracking-tight mt-1">
                    {currentItem.title || "Heavy Rainfall Detection"}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <EpistemicBadge status={currentItem.classification || "Detected"} />
                  <StatusBadge status={currentItem.status || "Processed"} />
                  <div className="bg-surface px-2 py-0.5 rounded-[2px] border border-line flex items-center gap-1 font-mono text-[11px] tabular-nums">
                    <span className="text-muted">CONF:</span>
                    <span className="font-semibold text-accent">
                      {(currentItem.confidence || 0.82).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5 Sub-tabs Navigation */}
              <div className="flex flex-wrap border-b border-line mt-3 -mb-4 text-[11px] font-mono uppercase tracking-wider gap-1">
                {[
                  { id: 'summary', label: 'Summary' },
                  { id: 'sensor', label: 'Sensor / Raw Data' },
                  { id: 'observations', label: 'Observations (6)' },
                  { id: 'ml', label: 'Models & Thresholds' },
                  { id: 'unified', label: 'Linked Unified Event' }
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

            {/* Sub-tab 1: Summary */}
            {activeTab === 'summary' && (
              <div className="p-4 space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Mini-Map with Rainfall Heatmap bar */}
                  <div className="bg-surface2 rounded-[2px] p-2.5 border border-line flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="panel-title">Station Telemetry Footprint</span>
                      <span className="text-[10px] font-mono text-muted">IMD DOPPLER</span>
                    </div>
                    <div className="h-32 rounded-[2px] overflow-hidden border border-line">
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
                    <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-muted tabular-nums">
                      <span>0 mm</span>
                      <div className="flex-1 mx-2 h-1.5 rounded-[1px] bg-gradient-to-r from-sky-400 via-amber-400 to-red-600"></div>
                      <span>200+ mm</span>
                    </div>
                  </div>

                  {/* Key Information */}
                  <div className="bg-surface2 rounded-[2px] p-2.5 border border-line space-y-1.5 font-mono text-[11px] tabular-nums">
                    <div className="panel-title mb-1">Telemetry Attributes</div>
                    <div className="flex justify-between py-0.5 border-b border-line">
                      <span className="text-muted">MODALITY:</span>
                      <span className="text-ink font-semibold">{currentItem.modality || "Weather"}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-line">
                      <span className="text-muted">METHOD:</span>
                      <span className="text-ink2">Threshold Anomaly</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-line">
                      <span className="text-muted">PRECIP RATE:</span>
                      <span className="text-accent font-semibold">112.0 mm / 3h</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-line">
                      <span className="text-muted">UNIFIED EVENT:</span>
                      <span className="text-accent underline cursor-pointer">
                        {currentItem.matched_unified_event_id || "EV-2026-10-09-003"}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-muted">CASCADES:</span>
                      <span className="text-high font-semibold">Flood, Landslide</span>
                    </div>
                  </div>
                </div>

                {/* Event Description */}
                <div className="bg-surface2 rounded-[2px] p-3 border border-line">
                  <div className="panel-title mb-1">Modality Ingestion Note</div>
                  <p className="text-ink2 leading-relaxed">
                    {currentItem.description || "Automated telemetry ingestion detected sustained rainfall exceeding 112 mm over a 3-hour window, crossing the critical flash flood and slope failure threshold for steep gradient catchments in Rudraprayag."}
                  </p>
                </div>

                {/* Event Classification Selector */}
                <div className="bg-surface2 rounded-[2px] p-3.5 border border-line">
                  <div className="panel-title mb-2">
                    Source Provenance &amp; Verification Category
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {[
                      { id: "detected", label: "Sensor Detected", desc: "Directly measured from calibrated physical station stream" },
                      { id: "reported", label: "Field / Agency Reported", desc: "Ingested from official SEOC bulletin or press wire" },
                      { id: "inference", label: "Cross-Modal Derived", desc: "Inferred by multi-sensor geotechnical correlation" },
                      { id: "predicted", label: "Forecast Projection", desc: "Simulated trajectory for upcoming 24–48h window" },
                    ].map(opt => (
                      <label
                        key={opt.id}
                        className={`p-2.5 rounded-[2px] border flex items-start gap-2.5 cursor-pointer transition-colors ${
                          classification === opt.id
                            ? 'bg-accent-soft border-accent text-ink'
                            : 'bg-surface border-line text-ink2 hover:border-line-strong'
                        }`}
                      >
                        <input
                          type="radio"
                          name="classification"
                          value={opt.id}
                          checked={classification === opt.id}
                          onChange={(e) => setClassification(e.target.value)}
                          className="mt-0.5 text-accent focus:ring-0"
                        />
                        <div>
                          <div className="font-semibold text-ink">{opt.label}</div>
                          <div className="text-[10px] text-muted leading-tight mt-0.5">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bottom 3 Columns: Observations, Derived Results, Evidence */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-[2px] bg-surface2 border border-line">
                    <div className="panel-title mb-2">Supporting Observations</div>
                    <ul className="space-y-1.5 text-[11px] font-mono text-ink2 tabular-nums">
                      <li>&bull; 08:25 — AWS 3h: 112.0 mm</li>
                      <li>&bull; 08:20 — Radar reflectivity: 52 dBZ</li>
                      <li>&bull; 08:15 — Adjacent gauge: +1.4m</li>
                      <li>&bull; 08:10 — Cloud top temp: -68°C</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-[2px] bg-surface2 border border-line">
                    <div className="panel-title mb-2">Derived Indices</div>
                    <div className="space-y-1.5 text-[11px] font-mono tabular-nums">
                      <div className="flex justify-between">
                        <span className="text-muted">FLASH FLOOD IDX:</span>
                        <span className="text-crit font-semibold">0.85</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">SLOPE FAILURE IDX:</span>
                        <span className="text-high font-semibold">0.72</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">BUFFER RADIUS:</span>
                        <span className="text-ink2">15.0 km</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-[2px] bg-surface2 border border-line">
                    <div className="panel-title mb-2">Corroborating Streams</div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-ink2 font-medium">IMD Bulletin #42</span>
                        <EpistemicBadge status="Official" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ink2 font-medium">CWC Hydro Gauge</span>
                        <EpistemicBadge status="Observed" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ink2 font-medium">Doppler Raster</span>
                        <EpistemicBadge status="Observed" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other sub-tabs fallback */}
            {activeTab !== 'summary' && (
              <div className="p-6 bg-surface2 m-4 rounded-[2px] border border-line text-xs space-y-2">
                <div className="panel-title">
                  TELEMETRY SUB-MODULE // {activeTab.toUpperCase()}
                </div>
                <p className="text-ink2">
                  Displaying raw sensor time-series packets, calibration parameters, and threshold evaluation logs for <strong className="font-mono text-ink">{currentItem.modality_event_id}</strong>.
                </p>
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
