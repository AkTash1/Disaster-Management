// Disaster Intelligence Multimodal Platform - View 10: My Area / Settings (image3.png)
// Specifications: Pinned Regions Watchlist Management (GET/POST/DELETE /api/v1/my-area/watchlist),
// Per-district Hazard Status Cards, Watchlist Leaflet Map (MapView),
// Multi-Hazard Notification Toggle Switches, Channel Checkboxes (SMS/Email/Push),
// Display Unit Preferences (Metric/Imperial, C/F), Map Configuration, and Account Profile.

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { MapView, SeverityBadge } = window.DisasterComponents || window;

  const MyAreaView = ({ initialTab = "watchlist", onNavigate }) => {
    // Sub-Tabs
    const [activeTab, setActiveTab] = useState(initialTab); // 'watchlist', 'notifications', 'units', 'map', 'account'

    // Watchlist State
    const [watchlist, setWatchlist] = useState([]);
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [selectedDistrictToAdd, setSelectedDistrictToAdd] = useState("");
    const [loadingWatchlist, setLoadingWatchlist] = useState(false);

    // Hazard quick toggles for watchlist
    const [hazardToggles, setHazardToggles] = useState({
      landslide: true,
      flood: true,
      cloudburst: true,
      earthquake: false,
      weather: false
    });

    // Settings State (persisted via PUT /api/v1/my-area/settings)
    const [settings, setSettings] = useState({
      notifications: {
        critical_alerts_sms: true,
        push_notifications: true,
        daily_summary_email: false,
        severe_weather_warning: true,
        landslide_early_warning: true,
        flash_flood_threshold: true
      },
      display_units: {
        rainfall: "mm",
        distance: "km",
        elevation: "m",
        temperature: "celsius",
        pressure: "hPa"
      },
      map_settings: {
        default_basemap: "dark",
        show_station_markers: true,
        show_risk_polygons: true,
        auto_refresh_sec: 30,
        default_zoom: 8
      },
      account: {
        name: "Ashutosh Sharma",
        role: "State Disaster Response Officer",
        state: "Uttarakhand",
        badge: "AS",
        organization: "Uttarakhand State Disaster Management Authority"
      }
    });

    const [saveStatus, setSaveStatus] = useState("");

    // 1. Fetch Watchlist & Available Districts
    const fetchWatchlist = async () => {
      try {
        setLoadingWatchlist(true);
        const res = await fetch("/api/v1/my-area/watchlist");
        if (!res.ok) return;
        const data = await res.json();
        setWatchlist(data.watchlist || []);
        setAvailableDistricts(data.available_districts || []);
        if (data.available_districts && data.available_districts.length > 0) {
          // Find first district not currently in watchlist
          const watchCodes = new Set((data.watchlist || []).map(w => w.district_lgd_code));
          const unpinned = data.available_districts.find(d => !watchCodes.has(d.district_lgd_code));
          if (unpinned) setSelectedDistrictToAdd(String(unpinned.district_lgd_code));
        }
        setLoadingWatchlist(false);
      } catch (err) {
        console.error("Error loading watchlist:", err);
        setLoadingWatchlist(false);
      }
    };

    // 2. Fetch User Settings
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/v1/my-area/settings");
        if (!res.ok) return;
        const data = await res.json();
        setSettings(prev => ({
          ...prev,
          ...data,
          notifications: { ...prev.notifications, ...(data.notifications || {}) },
          display_units: { ...prev.display_units, ...(data.display_units || {}) },
          map_settings: { ...prev.map_settings, ...(data.map_settings || {}) },
          account: { ...prev.account, ...(data.account || {}) }
        }));
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    };

    useEffect(() => {
      fetchWatchlist();
      fetchSettings();
    }, []);

    // 3. Add District to Watchlist
    const handleAddDistrict = async () => {
      if (!selectedDistrictToAdd) return;
      try {
        const codeNum = parseInt(selectedDistrictToAdd, 10);
        const distObj = availableDistricts.find(d => d.district_lgd_code === codeNum);
        const res = await fetch("/api/v1/my-area/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            district_lgd_code: codeNum,
            district_name: distObj?.district_name || ""
          })
        });

        if (!res.ok) throw new Error("Failed to add district");
        const data = await res.json();
        setWatchlist(data.watchlist || []);
        setSaveStatus("Added to watchlist!");
        setTimeout(() => setSaveStatus(""), 3000);
      } catch (err) {
        console.error("Error adding district:", err);
      }
    };

    // 4. Remove District from Watchlist
    const handleRemoveDistrict = async (districtCode) => {
      try {
        const res = await fetch(`/api/v1/my-area/watchlist/${districtCode}`, {
          method: "DELETE"
        });
        if (!res.ok) throw new Error("Failed to delete district");
        const data = await res.json();
        setWatchlist(data.watchlist || []);
        setSaveStatus("Removed from watchlist!");
        setTimeout(() => setSaveStatus(""), 3000);
      } catch (err) {
        console.error("Error removing district:", err);
      }
    };

    // 5. Save Settings via PUT /api/v1/my-area/settings
    const handleSaveSettings = async (partialUpdates = {}) => {
      try {
        const payload = { ...settings, ...partialUpdates };
        const res = await fetch("/api/v1/my-area/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to save settings");
        setSaveStatus("Settings saved successfully!");
        setTimeout(() => setSaveStatus(""), 3000);
      } catch (err) {
        console.error("Error saving settings:", err);
        setSaveStatus("Error saving settings.");
      }
    };

    // Format Watchlist Map Markers
    const watchlistMarkers = watchlist.map(w => {
      const centroid = w.centroid || [79.05, 30.50];
      return {
        id: `watch-${w.district_lgd_code}`,
        lat: centroid[1],
        lng: centroid[0],
        title: `${w.district_name} Watchlist Sector`,
        hazard: w.active_hazards?.includes("Landslide") ? "landslide" : "flood",
        severity: w.alert_level || "Critical",
        subtitle: `Hazards: ${(w.active_hazards || []).join(", ")} • Monitored since ${w.monitored_since}`
      };
    });

    return (
      <div className="p-6 space-y-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>My Area / Settings</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                View 10 • Personalized Telemetry Hub
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Personalize disaster watchlists, configure multi-hazard notification triggers, and set measurement units and geospatial defaults.
            </p>
          </div>

          {/* Save Status Notification */}
          {saveStatus && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-pulse">
              ✓ {saveStatus}
            </div>
          )}
        </div>

        {/* 5 Navigation Sub-Tabs (image3.png) */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs overflow-x-auto">
          {[
            { id: "watchlist", label: "My Watchlist", icon: "📍" },
            { id: "notifications", label: "Notification Triggers", icon: "🔔" },
            { id: "units", label: "Display & Units", icon: "📐" },
            { id: "map", label: "Map Configuration", icon: "🗺" },
            { id: "account", label: "Account & Profile", icon: "👤" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg font-semibold transition shrink-0 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: My Watchlist (image3.png) */}
        {activeTab === "watchlist" && (
          <div className="space-y-5">
            {/* Top Grid (3 Columns): Watchlist Cards (4 cols), Map (5 cols), Hazard Toggles (3 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Column 1: Pinned Regions List (4 cols) */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>📌</span>
                    <span>Pinned Districts ({watchlist.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Live Monitored</span>
                </div>

                {/* Add Region Bar */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedDistrictToAdd}
                    onChange={(e) => setSelectedDistrictToAdd(e.target.value)}
                    className="flex-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                  >
                    {availableDistricts
                      .filter(d => !watchlist.some(w => w.district_lgd_code === d.district_lgd_code))
                      .map(d => (
                        <option key={d.district_lgd_code} value={d.district_lgd_code}>
                          {d.district_name} (Code: {d.district_lgd_code})
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleAddDistrict}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shrink-0"
                  >
                    + Pin Region
                  </button>
                </div>

                {/* Pinned District Cards */}
                <div className="space-y-3 max-h-[460px] overflow-y-auto">
                  {watchlist.map(w => (
                    <div
                      key={w.district_lgd_code}
                      className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{w.district_name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-700">
                            LGD: {w.district_lgd_code}
                          </span>
                        </div>
                        <SeverityBadge severity={w.alert_level || "Critical"} />
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(w.active_hazards || []).map((h, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-600/30 font-medium">
                            {h === "Landslide" ? "⛰️ Landslide" : (h === "Flash Flood" ? "🌊 Flash Flood" : `⚠️ ${h}`)}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-750">
                        <span>Monitored since: {w.monitored_since}</span>
                        <button
                          onClick={() => handleRemoveDistrict(w.district_lgd_code)}
                          className="text-red-400 hover:text-red-300 font-medium transition"
                        >
                          Unpin 🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Watchlist Interactive Leaflet Map (5 cols) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>🗺️</span>
                    <span>Watchlist Geospatial Bounds</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">CartoDB Dark Tile</span>
                </div>

                <div className="h-96 rounded-xl overflow-hidden border border-slate-700/80">
                  <MapView
                    center={[30.3, 79.1]}
                    zoom={8}
                    markers={watchlistMarkers}
                    height="100%"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-slate-850 text-xs text-slate-400 flex items-center justify-between">
                  <span>Displaying {watchlist.length} pinned monitored district perimeters</span>
                  <span className="text-blue-400 font-semibold">Active Geofence</span>
                </div>
              </div>

              {/* Column 3: Multi-Hazard Triggers Quick Toggles (3 cols) (image3.png) */}
              <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow space-y-4">
                <div className="pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>Watchlist Hazards</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Automated alarm filters</span>
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    { id: "landslide", label: "Landslide Early Warning", icon: "⛰️" },
                    { id: "flood", label: "Flash Flood Surge (CWC)", icon: "🌊" },
                    { id: "cloudburst", label: "Cloudburst Doppler Nowcast", icon: "⛈️" },
                    { id: "earthquake", label: "Seismic Tremors (NCS/USGS)", icon: "🔴" },
                    { id: "weather", label: "Severe Wind & Hail Advisory", icon: "💨" }
                  ].map(hz => (
                    <div
                      key={hz.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-750"
                    >
                      <span className="text-slate-200 font-medium flex items-center gap-2">
                        <span>{hz.icon}</span>
                        <span>{hz.label}</span>
                      </span>
                      <button
                        onClick={() => {
                          const updated = { ...hazardToggles, [hz.id]: !hazardToggles[hz.id] };
                          setHazardToggles(updated);
                        }}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                          hazardToggles[hz.id] ? "bg-blue-600 justify-end" : "bg-slate-700 justify-start"
                        }`}
                      >
                        <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSaveSettings()}
                  className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow"
                >
                  Save Watchlist Alarms 💾
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Notifications */}
        {activeTab === "notifications" && (
          <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-6 shadow space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>🔔</span>
                <span>Notification Channels & Thresholds</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure delivery channels and emergency threshold triggers for state incident alerts.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
                <span className="font-bold text-slate-200 block text-xs">Delivery Channels:</span>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.critical_alerts_sms}
                    onChange={(e) => setSettings(s => ({ ...s, notifications: { ...s.notifications, critical_alerts_sms: e.target.checked } }))}
                    className="rounded bg-slate-700 border-slate-600 text-blue-600"
                  />
                  <span>SMS Critical Bulletins (Dispatched directly to mobile)</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.push_notifications}
                    onChange={(e) => setSettings(s => ({ ...s, notifications: { ...s.notifications, push_notifications: e.target.checked } }))}
                    className="rounded bg-slate-700 border-slate-600 text-blue-600"
                  />
                  <span>In-App Real-time Push Notifications</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.daily_summary_email}
                    onChange={(e) => setSettings(s => ({ ...s, notifications: { ...s.notifications, daily_summary_email: e.target.checked } }))}
                    className="rounded bg-slate-700 border-slate-600 text-blue-600"
                  />
                  <span>Daily Incident Summary Email (08:00 IST Morning SITREP)</span>
                </label>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
                <span className="font-bold text-slate-200 block text-xs">Automated Hazard Triggers:</span>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.landslide_early_warning}
                    onChange={(e) => setSettings(s => ({ ...s, notifications: { ...s.notifications, landslide_early_warning: e.target.checked } }))}
                    className="rounded bg-slate-700 border-slate-600 text-blue-600"
                  />
                  <span>Slope Saturation & Pore Pressure Threshold Exceeded (>80% saturation)</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.flash_flood_threshold}
                    onChange={(e) => setSettings(s => ({ ...s, notifications: { ...s.notifications, flash_flood_threshold: e.target.checked } }))}
                    className="rounded bg-slate-700 border-slate-600 text-blue-600"
                  />
                  <span>CWC Gauge Danger Mark Water Level Breach Warning</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.severe_weather_warning}
                    onChange={(e) => setSettings(s => ({ ...s, notifications: { ...s.notifications, severe_weather_warning: e.target.checked } }))}
                    className="rounded bg-slate-700 border-slate-600 text-blue-600"
                  />
                  <span>IMD Red Alert Precipitation Nowcasts (>100 mm in 24 hrs)</span>
                </label>
              </div>
            </div>

            <button
              onClick={() => handleSaveSettings({ notifications: settings.notifications })}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow"
            >
              Save Notification Preferences 💾
            </button>
          </div>
        )}

        {/* TAB 3: Display & Units */}
        {activeTab === "units" && (
          <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-6 shadow space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>📐</span>
                <span>Measurement Units & Display Formats</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Customize physical units for rainfall, topography, and temperature readings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700 space-y-2">
                <span className="font-semibold text-slate-300 block">Rainfall Measurement:</span>
                <select
                  value={settings.display_units.rainfall}
                  onChange={(e) => setSettings(s => ({ ...s, display_units: { ...s.display_units, rainfall: e.target.value } }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="mm">Millimeters (mm)</option>
                  <option value="inches">Inches (in)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700 space-y-2">
                <span className="font-semibold text-slate-300 block">Distance & Reach:</span>
                <select
                  value={settings.display_units.distance}
                  onChange={(e) => setSettings(s => ({ ...s, display_units: { ...s.display_units, distance: e.target.value } }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="km">Kilometers (km)</option>
                  <option value="miles">Miles (mi)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700 space-y-2">
                <span className="font-semibold text-slate-300 block">Topographic Elevation:</span>
                <select
                  value={settings.display_units.elevation}
                  onChange={(e) => setSettings(s => ({ ...s, display_units: { ...s.display_units, elevation: e.target.value } }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="m">Meters Above Sea Level (MASL)</option>
                  <option value="ft">Feet (ft)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700 space-y-2">
                <span className="font-semibold text-slate-300 block">Ambient Temperature:</span>
                <select
                  value={settings.display_units.temperature}
                  onChange={(e) => setSettings(s => ({ ...s, display_units: { ...s.display_units, temperature: e.target.value } }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="celsius">Celsius (°C)</option>
                  <option value="fahrenheit">Fahrenheit (°F)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleSaveSettings({ display_units: settings.display_units })}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow"
            >
              Save Display Preferences 💾
            </button>
          </div>
        )}

        {/* TAB 4: Map Settings */}
        {activeTab === "map" && (
          <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-6 shadow space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>🗺️</span>
                <span>Geospatial Map Defaults</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure default basemap tiles, zoom levels, and sensor layer visibility.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
                <span className="font-bold text-slate-200 block text-xs">Default Basemap Style:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "dark", label: "Dark Matter" },
                    { id: "satellite", label: "Satellite Imagery" },
                    { id: "terrain", label: "Topographic Terrain" },
                    { id: "light", label: "Light Clean" }
                  ].map(b => (
                    <button
                      key={b.id}
                      onClick={() => setSettings(s => ({ ...s, map_settings: { ...s.map_settings, default_basemap: b.id } }))}
                      className={`p-2.5 rounded-lg border text-xs font-semibold transition ${
                        settings.map_settings.default_basemap === b.id
                          ? "bg-blue-600 text-white border-blue-400 shadow"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
                <span className="font-bold text-slate-200 block text-xs">Default Layer Visibility:</span>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.map_settings.show_station_markers}
                    onChange={(e) => setSettings(s => ({ ...s, map_settings: { ...s.map_settings, show_station_markers: e.target.checked } }))}
                    className="rounded bg-slate-700 border-slate-600 text-blue-600"
                  />
                  <span>Show Hydrological Telemetry Stations (CWC & IMD AWS)</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.map_settings.show_risk_polygons}
                    onChange={(e) => setSettings(s => ({ ...s, map_settings: { ...s.map_settings, show_risk_polygons: e.target.checked } }))}
                    className="rounded bg-slate-700 border-slate-600 text-blue-600"
                  />
                  <span>Show Predictive Flash Flood & Landslide Susceptibility Zones</span>
                </label>
              </div>
            </div>

            <button
              onClick={() => handleSaveSettings({ map_settings: settings.map_settings })}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow"
            >
              Save Map Defaults 💾
            </button>
          </div>
        )}

        {/* TAB 5: Account & Profile */}
        {activeTab === "account" && (
          <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-6 shadow space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>👤</span>
                <span>Duty Officer Profile & Command Authority</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Verified responder credentials and jurisdictional assignment.
              </p>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow">
                {settings.account.badge || "AS"}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{settings.account.name}</h4>
                <div className="text-xs text-blue-400 font-medium">{settings.account.role}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{settings.account.organization} • {settings.account.state}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <span className="text-slate-400 block mb-1">Assigned Command Center:</span>
                <span className="font-semibold text-slate-200">SEOC Dehradun (State Level)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <span className="text-slate-400 block mb-1">Operational Authorization:</span>
                <span className="font-semibold text-emerald-400">Level-3 Emergency Incident Commander</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => alert("Settings export downloaded (JSON config backup).")}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              >
                📥 Export Watchlist Backup
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  window.DisasterViews = window.DisasterViews || {};
  window.DisasterViews.MyAreaView = MyAreaView;
  window.MyAreaView = MyAreaView;
})();
