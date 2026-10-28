// Disaster Intelligence Platform — View 2: Map Explorer (Full-Bleed GIS Workbench)
// Light Operational Theme: Floating HUD Filter & Layer Manager, Right Telemetry Dock, Precision Time Scrubber

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { MapView, SeverityBadge, EpistemicBadge } = window.DisasterComponents || window;

  const MapExplorerView = ({ onNavigate = null }) => {
    // Filter states
    const [selectedHazard, setSelectedHazard] = useState("All Hazards");
    const [selectedSeverity, setSelectedSeverity] = useState("All Severities");
    const [selectedRegion, setSelectedRegion] = useState("All Districts");
    const [selectedTab, setSelectedTab] = useState("all");

    // Map layer visibility & opacity
    const [layerTab, setLayerTab] = useState("events");
    const [layerOpacity, setLayerOpacity] = useState(85);
    const [layersCollapsed, setLayersCollapsed] = useState(false);
    const [activeLayers, setActiveLayers] = useState({
      events: true,
      warnings: true,
      riskAlerts: true,
      observedAreas: true,
      forecastAreas: true,
      rainfall: true,
      landslides: true,
      boundaries: true,
      rivers: true,
      roads: false
    });

    // Data states
    const [feedItems, setFeedItems] = useState([]);
    const [mapEvents, setMapEvents] = useState([]);
    const [timelineSteps, setTimelineSteps] = useState([]);
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [selectedLocation, setSelectedLocation] = useState({
      name: "Rudraprayag",
      state: "Uttarakhand",
      coords: "30.2849° N, 78.9867° E",
      elevation: "895 m",
      eventsCount: 18,
      riskLevel: "High"
    });

    // Fetch Map Feed & Timeline from backend
    useEffect(() => {
      let isSubscribed = true;

      const fetchMapData = async () => {
        try {
          const feedUrl = `/api/v1/map/feed?tab=${selectedTab}${selectedSeverity !== 'All Severities' ? `&severity=${selectedSeverity}` : ''}`;
          const [feedRes, timelineRes, eventsRes] = await Promise.all([
            fetch(feedUrl).then(r => r.ok ? r.json() : null),
            fetch('/api/v1/map/timeline').then(r => r.ok ? r.json() : null),
            fetch('/api/v1/events?limit=30').then(r => r.ok ? r.json() : null)
          ]);

          if (!isSubscribed) return;

          const items = Array.isArray(feedRes) ? feedRes : (feedRes?.items || feedRes?.feed || []);
          setFeedItems(items);

          const steps = timelineRes?.steps || timelineRes?.timeline || [];
          setTimelineSteps(steps);
          if (steps.length > 0) setActiveStepIndex(steps.length - 1);

          const evs = Array.isArray(eventsRes) ? eventsRes : (eventsRes?.events || []);
          setMapEvents(evs);
        } catch (err) {
          console.error("Failed to load map explorer data:", err);
        }
      };

      fetchMapData();
      return () => { isSubscribed = false; };
    }, [selectedTab, selectedSeverity]);

    // Timeline playback scrubber interval
    useEffect(() => {
      let timer = null;
      if (isPlaying && timelineSteps.length > 0) {
        timer = setInterval(() => {
          setActiveStepIndex((prev) => (prev + 1) % timelineSteps.length);
        }, Math.max(300, Math.round(1200 / playbackSpeed)));
      }
      return () => { if (timer) clearInterval(timer); };
    }, [isPlaying, timelineSteps, playbackSpeed]);

    const toggleLayer = (layerName) => {
      setActiveLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
    };

    const handleClearFilters = () => {
      setSelectedHazard("All Hazards");
      setSelectedSeverity("All Severities");
      setSelectedRegion("All Districts");
      setSelectedTab("all");
    };

    const currentStep = timelineSteps[activeStepIndex] || {
      timestamp: "2026-10-09 08:30 IST",
      date: "2026-10-09"
    };

    const sevBorderColor = (sev) => {
      const s = String(sev || "").toLowerCase();
      if (s.includes("crit") || s.includes("red")) return "border-l-crit";
      if (s.includes("high") || s.includes("orange")) return "border-l-high";
      if (s.includes("mod") || s.includes("yellow")) return "border-l-warn";
      return "border-l-ok";
    };

    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-canvas">
        {/* Main Full-Bleed GIS Workspace */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* MAP CANVAS CONTAINER */}
          <div className="flex-1 relative h-full">
            <MapView
              markers={mapEvents}
              center={[30.2849, 78.9867]}
              zoom={8}
              activeLayers={activeLayers}
              showBasemapSwitcher={true}
              onMarkerClick={(m) => {
                setSelectedLocation({
                  name: m.district || m.location || m.title || "Selected Feature",
                  state: "Uttarakhand",
                  coords: `${m.latitude || m.lat || 30.28}° N, ${m.longitude || m.lon || 78.98}° E`,
                  elevation: "1,245 m",
                  eventsCount: 1,
                  riskLevel: m.severity || "High"
                });
              }}
            />

            {/* Top-Left HUD: Filter Strip + Collapsible Layer Manager */}
            <div className="absolute top-2.5 left-2.5 z-[400] flex flex-col gap-2 max-w-[calc(100%-10rem)]">
              {/* Compact HUD Filter Bar */}
              <div className="bg-surface/95 border border-line-strong rounded-[2px] px-2.5 py-1.5 shadow-sm flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-muted pr-1 border-r border-line">
                  GIS FILTER
                </span>
                <select
                  value={selectedHazard}
                  onChange={(e) => setSelectedHazard(e.target.value)}
                  className="bg-surface2 text-ink border border-line rounded-[2px] px-2 py-1 text-[11px] font-medium focus:outline-none focus:border-accent"
                >
                  <option value="All Hazards">All Hazards</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Flood">Flood</option>
                  <option value="Heavy Rainfall">Heavy Rainfall</option>
                  <option value="Earthquake">Earthquake</option>
                </select>

                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="bg-surface2 text-ink border border-line rounded-[2px] px-2 py-1 text-[11px] font-medium focus:outline-none focus:border-accent"
                >
                  <option value="All Severities">All Severities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Low">Low</option>
                </select>

                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="bg-surface2 text-ink border border-line rounded-[2px] px-2 py-1 text-[11px] font-medium focus:outline-none focus:border-accent"
                >
                  <option value="All Districts">All Districts</option>
                  <option value="Rudraprayag">Rudraprayag</option>
                  <option value="Chamoli">Chamoli</option>
                  <option value="Tehri Garhwal">Tehri Garhwal</option>
                  <option value="Uttarkashi">Uttarkashi</option>
                  <option value="Pithoragarh">Pithoragarh</option>
                  <option value="Dehradun">Dehradun</option>
                </select>

                <button
                  onClick={handleClearFilters}
                  className="text-[10px] font-mono uppercase tracking-wider text-muted hover:text-ink px-2 py-1 rounded-[2px] hover:bg-surface3 border border-transparent hover:border-line transition-colors"
                >
                  Reset
                </button>

                <span className="font-mono text-[10px] text-ink2 pl-1.5 border-l border-line tabular-nums">
                  ACTIVE: <strong>{feedItems.length}</strong>
                </span>
              </div>

              {/* Layer Control HUD Panel */}
              <div className="w-64 bg-surface/95 border border-line-strong rounded-[2px] shadow-sm overflow-hidden text-xs">
                <div className="px-2.5 py-1.5 bg-surface2 border-b border-line flex items-center justify-between">
                  <span className="panel-title">Layer Control</span>
                  <button
                    onClick={() => setLayersCollapsed(!layersCollapsed)}
                    className="text-[10px] font-mono text-muted hover:text-ink px-1"
                  >
                    {layersCollapsed ? "[EXPAND +]" : "[MINIMIZE -]"}
                  </button>
                </div>

                {!layersCollapsed && (
                  <>
                    {/* Layers Sub-tabs */}
                    <div className="flex border-b border-line text-[10px] font-mono uppercase tracking-wider bg-surface2">
                      <button
                        onClick={() => setLayerTab("events")}
                        className={`flex-1 py-1.5 text-center transition-colors border-b-2 ${
                          layerTab === "events"
                            ? "border-accent text-accent bg-surface font-semibold"
                            : "border-transparent text-muted hover:text-ink"
                        }`}
                      >
                        Events &amp; Alerts
                      </button>
                      <button
                        onClick={() => setLayerTab("environmental")}
                        className={`flex-1 py-1.5 text-center transition-colors border-b-2 ${
                          layerTab === "environmental"
                            ? "border-accent text-accent bg-surface font-semibold"
                            : "border-transparent text-muted hover:text-ink"
                        }`}
                      >
                        Environmental
                      </button>
                    </div>

                    {/* Layer Checkboxes */}
                    <div className="p-2.5 space-y-1.5 max-h-52 overflow-y-auto text-[11px]">
                      {layerTab === "events" ? (
                        <>
                          {[
                            { key: "events", label: "Disaster Events", code: "EV" },
                            { key: "warnings", label: "Official Warnings (CAP)", code: "WRN" },
                            { key: "riskAlerts", label: "Platform Risk Alerts", code: "RSK" },
                            { key: "observedAreas", label: "Affected Polygons (Obs)", code: "OBS" },
                            { key: "forecastAreas", label: "At-Risk Zones (Forecast)", code: "FCT" }
                          ].map(l => (
                            <label key={l.key} className="flex items-center justify-between gap-2 cursor-pointer text-ink2 hover:text-ink py-0.5">
                              <span className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={activeLayers[l.key]}
                                  onChange={() => toggleLayer(l.key)}
                                  className="rounded-[2px] border-line-strong text-accent focus:ring-0"
                                />
                                <span>{l.label}</span>
                              </span>
                              <span className="font-mono text-[9px] text-faint">{l.code}</span>
                            </label>
                          ))}
                        </>
                      ) : (
                        <>
                          {[
                            { key: "rainfall", label: "IMD Doppler Radar (24h)", code: "RDR" },
                            { key: "landslides", label: "GSI/Bhuvan Scar Inventory", code: "LSI" },
                            { key: "boundaries", label: "LGD District Boundaries", code: "ADM" },
                            { key: "rivers", label: "CWC Hydrological Gauges", code: "HYD" }
                          ].map(l => (
                            <label key={l.key} className="flex items-center justify-between gap-2 cursor-pointer text-ink2 hover:text-ink py-0.5">
                              <span className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={activeLayers[l.key]}
                                  onChange={() => toggleLayer(l.key)}
                                  className="rounded-[2px] border-line-strong text-accent focus:ring-0"
                                />
                                <span>{l.label}</span>
                              </span>
                              <span className="font-mono text-[9px] text-faint">{l.code}</span>
                            </label>
                          ))}
                        </>
                      )}
                    </div>

                    {/* Layer Opacity Slider */}
                    <div className="px-2.5 py-2 border-t border-line bg-surface2 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase text-muted">Opacity</span>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={layerOpacity}
                        onChange={(e) => setLayerOpacity(e.target.value)}
                        className="w-28 h-1 bg-line-strong rounded-[1px] appearance-none cursor-pointer accent-accent"
                      />
                      <span className="text-[10px] font-mono text-ink tabular-nums w-8 text-right">{layerOpacity}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Floating Selected Sector Card (Top-Right below basemap switcher) */}
            {selectedLocation && (
              <div className="absolute top-12 right-2.5 z-[400] w-64 bg-surface/95 border border-line-strong rounded-[2px] p-2.5 shadow-sm text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-wider text-muted">SELECTED SECTOR</div>
                    <h3 className="font-semibold text-ink text-xs mt-0.5">{selectedLocation.name}</h3>
                  </div>
                  <SeverityBadge severity={selectedLocation.riskLevel} />
                </div>
                <div className="mt-2 pt-1.5 border-t border-line space-y-1 text-[10px] font-mono text-ink2 tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-muted">COORDS:</span>
                    <span>{selectedLocation.coords}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">ELEVATION:</span>
                    <span>{selectedLocation.elevation}</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate && onNavigate('events')}
                  className="w-full mt-2 py-1 text-center rounded-[2px] bg-accent hover:bg-accent-hover text-white font-mono uppercase tracking-wider text-[10px] transition-colors"
                >
                  Inspect Sector Events &rarr;
                </button>
              </div>
            )}

            {/* Bottom Chronological Telemetry Scrubber */}
            <div className="absolute bottom-8 inset-x-2.5 z-[400] bg-surface/95 border border-line-strong rounded-[2px] px-3 py-2 shadow-sm flex flex-col md:flex-row items-center gap-3">
              {/* Step / Play / Pause Controls & Timestamp */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center border border-line-strong rounded-[2px] overflow-hidden bg-surface2">
                  <button
                    type="button"
                    onClick={() => setActiveStepIndex(prev => Math.max(0, prev - 1))}
                    className="px-2 py-1 text-[10px] font-mono text-ink2 hover:bg-surface3 border-r border-line"
                    title="Step Backward"
                  >
                    |&lt;
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-2.5 py-1 text-[10px] font-mono font-semibold bg-accent text-white hover:bg-accent-hover transition-colors"
                  >
                    {isPlaying ? "PAUSE" : "PLAY"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStepIndex(prev => Math.min(Math.max(timelineSteps.length - 1, 0), prev + 1))}
                    className="px-2 py-1 text-[10px] font-mono text-ink2 hover:bg-surface3 border-l border-line"
                    title="Step Forward"
                  >
                    &gt;|
                  </button>
                </div>

                <div className="pl-1">
                  <div className="text-[11px] font-mono font-semibold text-ink tabular-nums">
                    {currentStep.timestamp || currentStep.date || "2026-10-09 08:30 IST"}
                  </div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-muted">
                    Chronological Playback
                  </div>
                </div>
              </div>

              {/* Slider Track */}
              <div className="flex-1 w-full flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted shrink-0 tabular-nums">2026-09-02</span>
                <input
                  type="range"
                  min="0"
                  max={Math.max(timelineSteps.length - 1, 1)}
                  value={activeStepIndex}
                  onChange={(e) => setActiveStepIndex(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-line-strong rounded-[1px] appearance-none cursor-pointer accent-accent"
                />
                <span className="text-[10px] font-mono text-muted shrink-0 tabular-nums">2026-10-09</span>
              </div>

              {/* Timeframe & Speed Selector */}
              <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono">
                <select className="bg-surface2 text-ink border border-line rounded-[2px] px-2 py-1 text-[10px] font-mono">
                  <option>WINDOW: 7D</option>
                  <option>WINDOW: 24H</option>
                  <option>WINDOW: 30D</option>
                </select>
                <div className="flex border border-line rounded-[2px] overflow-hidden">
                  {[1, 2, 4].map(spd => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-1.5 py-1 text-[10px] font-mono ${
                        playbackSpeed === spd ? "bg-ink text-white font-semibold" : "bg-surface2 text-muted hover:text-ink"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT-HAND TELEMETRY DOCK */}
          <div className="w-80 md:w-96 bg-surface border-l border-line flex flex-col shrink-0">
            {/* Feed Header */}
            <div className="px-3.5 py-2.5 bg-surface2 border-b border-line flex items-center justify-between">
              <span className="panel-title">Geospatial Feed ({feedItems.length})</span>
              <span className="text-[10px] font-mono text-muted">SORT: LATEST</span>
            </div>

            {/* Sub-filter Tabs */}
            <div className="flex border-b border-line text-[10px] font-mono uppercase tracking-wider bg-surface2 px-2">
              {[
                { id: 'all', label: `All (${feedItems.length})` },
                { id: 'events', label: 'Events' },
                { id: 'warnings', label: 'Warnings' },
                { id: 'risk_alerts', label: 'Risk Alerts' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-2.5 py-2 border-b-2 transition-colors ${
                    selectedTab === tab.id
                      ? 'border-accent text-accent bg-surface font-semibold'
                      : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Feed Item List */}
            <div className="flex-1 overflow-y-auto divide-y divide-line">
              {feedItems.length === 0 ? (
                <div className="text-center py-12 text-muted text-xs font-mono">
                  NO ACTIVE FEATURES MATCHING FILTER
                </div>
              ) : (
                feedItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (item.latitude || item.lat) {
                        setSelectedLocation({
                          name: item.title || item.location,
                          state: "Uttarakhand",
                          coords: `${item.latitude || item.lat}° N, ${item.longitude || item.lon}° E`,
                          elevation: "1,100 m",
                          eventsCount: 1,
                          riskLevel: item.severity || "Moderate"
                        });
                      }
                    }}
                    className={`p-3 bg-surface hover:bg-surface2 cursor-pointer transition-colors border-l-[3px] ${sevBorderColor(item.severity)} space-y-1.5`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-xs text-ink leading-tight">
                        {item.title || item.hazard_name || "Disaster Event"}
                      </div>
                      <SeverityBadge severity={item.severity || "Moderate"} />
                    </div>

                    <div className="text-[11px] text-muted flex items-center justify-between font-mono tabular-nums">
                      <span>{item.location || item.district || "Uttarakhand"}</span>
                      <span>{item.timestamp || item.time || "08:30 IST"}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <EpistemicBadge status={item.epistemic_status || item.status || "Observed"} />
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigate) onNavigate('events');
                        }}
                        className="text-[10px] font-mono uppercase tracking-wider text-accent hover:underline"
                      >
                        Inspect &rarr;
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  window.DisasterViews = window.DisasterViews || {};
  window.DisasterViews.MapExplorerView = MapExplorerView;
  window.MapExplorerView = MapExplorerView;
})();
