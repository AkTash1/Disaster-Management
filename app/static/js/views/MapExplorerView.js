// Disaster Intelligence Multimodal Platform - View 2: Map Explorer (image6.png)
// Specifications: Floating Layers Card, Interactive Leaflet Canvas, Right Feed (All/Events/Warnings/Alerts),
// Timeline Scrubber Playback, Selected Location Card, Filter Bar

(function() {
  const React = window.React;
  const { useState, useEffect, useRef } = React;
  const { MapView, SeverityBadge, EpistemicBadge } = window.DisasterComponents || window;

  const MapExplorerView = ({ onNavigate = null }) => {
    // Filter states
    const [selectedHazard, setSelectedHazard] = useState("All Hazards");
    const [selectedSeverity, setSelectedSeverity] = useState("All Severities");
    const [selectedRegion, setSelectedRegion] = useState("All Districts");
    const [selectedTab, setSelectedTab] = useState("all");

    // Map layer visibility & opacity
    const [layerTab, setLayerTab] = useState("events");
    const [layerOpacity, setLayerOpacity] = useState(70);
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
        }, 1200);
      }
      return () => { if (timer) clearInterval(timer); };
    }, [isPlaying, timelineSteps]);

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
      timestamp: "Oct 09, 2026 08:30 IST",
      date: "Oct 09, 2026"
    };

    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        {/* Top Filter Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Hazard Dropdown */}
            <select
              value={selectedHazard}
              onChange={(e) => setSelectedHazard(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All Hazards">All Hazards</option>
              <option value="Landslide">Landslide</option>
              <option value="Flood">Flood</option>
              <option value="Heavy Rainfall">Heavy Rainfall</option>
              <option value="Earthquake">Earthquake</option>
            </select>

            {/* Severity Dropdown */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All Severities">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>

            {/* Region Dropdown */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All Districts">All Districts</option>
              <option value="Rudraprayag">Rudraprayag</option>
              <option value="Chamoli">Chamoli</option>
              <option value="Tehri Garhwal">Tehri Garhwal</option>
              <option value="Uttarkashi">Uttarkashi</option>
              <option value="Pithoragarh">Pithoragarh</option>
              <option value="Dehradun">Dehradun</option>
            </select>

            {/* Clear Filters Button */}
            <button
              onClick={handleClearFilters}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Showing: <b className="text-slate-200">{feedItems.length} active features</b></span>
          </div>
        </div>

        {/* Main Body: Split Map & Right Feed */}
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

            {/* Floating Layers Card (Top-Left overlay) */}
            <div className="absolute top-3 left-3 z-[400] w-64 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-xl overflow-hidden text-xs">
              {/* Layers Sub-tabs */}
              <div className="flex border-b border-slate-800 text-[11px] font-semibold">
                <button
                  onClick={() => setLayerTab("events")}
                  className={`flex-1 py-2 text-center transition-colors ${
                    layerTab === "events" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Events & Alerts
                </button>
                <button
                  onClick={() => setLayerTab("environmental")}
                  className={`flex-1 py-2 text-center transition-colors ${
                    layerTab === "environmental" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Environmental
                </button>
              </div>

              {/* Layer Checkboxes */}
              <div className="p-3 space-y-2 max-h-56 overflow-y-auto">
                {layerTab === "events" ? (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={activeLayers.events}
                        onChange={() => toggleLayer("events")}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-800"
                      />
                      <span>Disaster Events</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={activeLayers.warnings}
                        onChange={() => toggleLayer("warnings")}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-800"
                      />
                      <span>Official Warnings</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={activeLayers.riskAlerts}
                        onChange={() => toggleLayer("riskAlerts")}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-800"
                      />
                      <span>Platform Risk Alerts</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={activeLayers.observedAreas}
                        onChange={() => toggleLayer("observedAreas")}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-800"
                      />
                      <span>Affected Areas (Observed)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={activeLayers.forecastAreas}
                        onChange={() => toggleLayer("forecastAreas")}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-800"
                      />
                      <span>At-Risk Areas (Forecast)</span>
                    </label>
                  </>
                ) : (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={activeLayers.rainfall}
                        onChange={() => toggleLayer("rainfall")}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-800"
                      />
                      <span>Rainfall Radar (24h)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={activeLayers.landslides}
                        onChange={() => toggleLayer("landslides")}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-800"
                      />
                      <span>Landslide Inventory</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={activeLayers.boundaries}
                        onChange={() => toggleLayer("boundaries")}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-800"
                      />
                      <span>District Boundaries</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={activeLayers.rivers}
                        onChange={() => toggleLayer("rivers")}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-800"
                      />
                      <span>Major Rivers & Gauges</span>
                    </label>
                  </>
                )}
              </div>

              {/* Layer Opacity Slider */}
              <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">Opacity:</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={layerOpacity}
                  onChange={(e) => setLayerOpacity(e.target.value)}
                  className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-[10px] font-mono text-slate-300">{layerOpacity}%</span>
              </div>
            </div>

            {/* Floating Location Summary Card (Top-Right under basemap) */}
            {selectedLocation && (
              <div className="absolute top-14 right-3 z-[400] w-64 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-xl text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-100">{selectedLocation.name}</h3>
                    <p className="text-[11px] text-slate-400">{selectedLocation.state}</p>
                  </div>
                  <SeverityBadge severity={selectedLocation.riskLevel} />
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800 grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                  <div>Coords: <span className="font-mono text-slate-400">{selectedLocation.coords}</span></div>
                  <div>Elevation: <span className="text-slate-400">{selectedLocation.elevation}</span></div>
                </div>
                <button
                  onClick={() => onNavigate && onNavigate('events')}
                  className="w-full mt-2.5 py-1 text-center rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition-colors"
                >
                  View Events in District →
                </button>
              </div>
            )}

            {/* Bottom Timeline Scrubber */}
            <div className="absolute bottom-3 inset-x-3 z-[400] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl flex flex-col md:flex-row items-center gap-3">
              {/* Play / Pause button & timestamp */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center font-bold shadow transition-colors"
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-100">
                    {currentStep.timestamp || currentStep.date || "Oct 09, 2026 08:30 IST"}
                  </span>
                  <span className="text-[10px] text-slate-400">Chronological Telemetry</span>
                </div>
              </div>

              {/* Slider Track */}
              <div className="flex-1 w-full flex items-center gap-2">
                <span className="text-[10px] text-slate-400 shrink-0">Sep 02</span>
                <input
                  type="range"
                  min="0"
                  max={Math.max(timelineSteps.length - 1, 1)}
                  value={activeStepIndex}
                  onChange={(e) => setActiveStepIndex(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-[10px] text-slate-400 shrink-0">Oct 09</span>
              </div>

              {/* Timeframe selector */}
              <div className="flex items-center gap-2 shrink-0 text-xs">
                <select className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-1 text-xs">
                  <option>Last 7 Days</option>
                  <option>Last 24 Hours</option>
                  <option>Last 30 Days</option>
                </select>
                <span className="text-xs text-slate-400 font-mono">1x</span>
              </div>
            </div>
          </div>

          {/* RIGHT-HAND FEED (All / Events / Warnings / Alerts) */}
          <div className="w-80 md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
            {/* Feed Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-100">Events & Warnings ({feedItems.length})</h2>
              <span className="text-xs text-slate-400">Newest First ▾</span>
            </div>

            {/* Sub-filter Tabs */}
            <div className="flex border-b border-slate-800 text-xs font-semibold px-2 pt-1 gap-1">
              {[
                { id: 'all', label: `All (${feedItems.length})` },
                { id: 'events', label: 'Events' },
                { id: 'warnings', label: 'Warnings' },
                { id: 'risk_alerts', label: 'Risk Alerts' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-3 py-1.5 rounded-t-lg transition-colors ${
                    selectedTab === tab.id
                      ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Feed Item List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {feedItems.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No active events or warnings matching filter.
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
                    className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-xs text-slate-200 leading-tight">
                        {item.title || item.hazard_name || "Disaster Event"}
                      </div>
                      <SeverityBadge severity={item.severity || "Moderate"} />
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>📍 {item.location || item.district || "Uttarakhand"}</span>
                      <span>{item.timestamp || item.time || "Recent"}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <EpistemicBadge status={item.epistemic_status || item.status || "Observed"} />
                      <span className="text-[10px] text-blue-400 hover:underline">
                        Details →
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
