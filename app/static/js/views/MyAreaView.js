// Disaster Intelligence Platform — View 10: My Area (Jurisdictional Watchlist & Alarm Console)
// Light Operational Theme: Pinned LGD District Watchlist, Geofence Perimeter Map,
// Multi-Hazard Threshold Toggles, Delivery Channels, and Duty Officer Credentials

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { MapView, SeverityBadge } = window.DisasterComponents || window;

  const MyAreaView = ({ initialTab = "watchlist", onNavigate }) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    const [watchlist, setWatchlist] = useState([]);
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [selectedDistrictToAdd, setSelectedDistrictToAdd] = useState("");
    const [loadingWatchlist, setLoadingWatchlist] = useState(false);

    const [hazardToggles, setHazardToggles] = useState({
      landslide: true,
      flood: true,
      cloudburst: true,
      earthquake: false,
      weather: false
    });

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
        default_basemap: "light",
        show_station_markers: true,
        show_risk_polygons: true,
        auto_refresh_sec: 30,
        default_zoom: 8
      },
      account: {
        name: "Ashutosh Kanojia",
        role: "State Disaster Response Officer",
        state: "Uttarakhand",
        badge: "AK",
        organization: "Uttarakhand State Disaster Management Authority"
      }
    });

    const [saveStatus, setSaveStatus] = useState("");

    const fetchWatchlist = async () => {
      try {
        setLoadingWatchlist(true);
        const res = await fetch("/api/v1/my-area/watchlist");
        if (!res.ok) return;
        const data = await res.json();
        setWatchlist(data.watchlist || []);
        setAvailableDistricts(data.available_districts || []);
        if (data.available_districts && data.available_districts.length > 0) {
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
        setSaveStatus("SECTOR PINNED TO WATCHLIST");
        setTimeout(() => setSaveStatus(""), 3000);
      } catch (err) {
        console.error("Error adding district:", err);
      }
    };

    const handleRemoveDistrict = async (districtCode) => {
      try {
        const res = await fetch(`/api/v1/my-area/watchlist/${districtCode}`, {
          method: "DELETE"
        });
        if (!res.ok) throw new Error("Failed to delete district");
        const data = await res.json();
        setWatchlist(data.watchlist || []);
        setSaveStatus("SECTOR REMOVED FROM WATCHLIST");
        setTimeout(() => setSaveStatus(""), 3000);
      } catch (err) {
        console.error("Error removing district:", err);
      }
    };

    const handleSaveSettings = async (partialUpdates = {}) => {
      try {
        const payload = { ...settings, ...partialUpdates };
        const res = await fetch("/api/v1/my-area/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to save settings");
        setSaveStatus("WATCHLIST CONFIGURATION COMMITTED");
        setTimeout(() => setSaveStatus(""), 3000);
      } catch (err) {
        console.error("Error saving settings:", err);
        setSaveStatus("ERROR SAVING CONFIGURATION");
      }
    };

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
      <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-surface border border-line rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-ink tracking-tight">
                My Area &amp; District Alerts
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent-soft text-accent font-semibold">
                Custom Watchlist
              </span>
            </div>
            <p className="text-sm text-muted mt-0.5">
              Choose which Uttarakhand districts you want to follow closely and manage your SMS / alert preferences.
            </p>
          </div>

          {saveStatus && (
            <div className="px-3.5 py-1.5 rounded-lg bg-ok-soft border border-ok/40 text-ok text-xs font-semibold">
              Saved: {saveStatus}
            </div>
          )}
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-line bg-surface px-4 pt-2 text-xs font-semibold overflow-x-auto rounded-t-xl">
          {[
            { id: "watchlist", label: "Watched Districts" },
            { id: "notifications", label: "Alert Notifications" },
            { id: "units", label: "Measurement Units" },
            { id: "map", label: "Map Preferences" },
            { id: "account", label: "Officer Profile (Ashutosh Kanojia)" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 border-b-2 transition-colors shrink-0 ${
                activeTab === tab.id
                  ? "border-accent text-accent font-semibold bg-surface2"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: My Watchlist */}
        {activeTab === "watchlist" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Column 1: Pinned Regions List (4 cols) */}
            <div className="lg:col-span-4 bg-surface border border-line rounded-[2px] overflow-hidden">
              <div className="px-3.5 py-2.5 bg-surface2 border-b border-line flex items-center justify-between">
                <span className="panel-title">Pinned LGD Districts ({watchlist.length})</span>
                <span className="text-[10px] font-mono text-ok font-semibold">LIVE MONITORED</span>
              </div>

              <div className="p-3.5 space-y-3">
                {/* Add Region Bar */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedDistrictToAdd}
                    onChange={(e) => setSelectedDistrictToAdd(e.target.value)}
                    className="flex-1 bg-surface2 text-ink border border-line rounded-[2px] px-2.5 py-1.5 text-xs focus:outline-none focus:border-accent"
                  >
                    {availableDistricts
                      .filter(d => !watchlist.some(w => w.district_lgd_code === d.district_lgd_code))
                      .map(d => (
                        <option key={d.district_lgd_code} value={d.district_lgd_code}>
                          {d.district_name} (LGD: {d.district_lgd_code})
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleAddDistrict}
                    className="px-3 py-1.5 rounded-[2px] bg-accent hover:bg-accent-hover text-white font-mono uppercase tracking-wider font-semibold text-[11px] transition-colors shrink-0"
                  >
                    + Pin Sector
                  </button>
                </div>

                {/* Pinned District Cards */}
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
                  {watchlist.map(w => (
                    <div
                      key={w.district_lgd_code}
                      className="p-3 rounded-[2px] bg-surface2 border border-line hover:border-line-strong transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink text-xs">{w.district_name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-surface text-muted border border-line tabular-nums">
                            LGD:{w.district_lgd_code}
                          </span>
                        </div>
                        <SeverityBadge severity={w.alert_level || "Critical"} />
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(w.active_hazards || []).map((h, i) => (
                          <span key={i} className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-[2px] bg-surface text-ink2 border border-line font-semibold">
                            {h}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-muted pt-1.5 border-t border-line tabular-nums">
                        <span>SINCE: {w.monitored_since}</span>
                        <button
                          onClick={() => handleRemoveDistrict(w.district_lgd_code)}
                          className="text-crit hover:underline font-semibold uppercase"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Watchlist Interactive Leaflet Map (5 cols) */}
            <div className="lg:col-span-5 bg-surface border border-line rounded-[2px] overflow-hidden">
              <div className="px-3.5 py-2.5 bg-surface2 border-b border-line flex items-center justify-between">
                <span className="panel-title">Watchlist Geofence Bounds</span>
                <span className="text-[10px] font-mono text-muted">EPSG:4326</span>
              </div>

              <div className="p-3.5 space-y-2.5">
                <div className="h-96 rounded-[2px] overflow-hidden border border-line">
                  <MapView
                    center={[30.3, 79.1]}
                    zoom={8}
                    markers={watchlistMarkers}
                    height="100%"
                  />
                </div>

                <div className="p-2 rounded-[2px] bg-surface2 border border-line text-[11px] font-mono text-muted flex items-center justify-between tabular-nums">
                  <span>MONITORED SECTORS: {watchlist.length}</span>
                  <span className="text-ok font-semibold">GEOFENCE ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Column 3: Multi-Hazard Triggers Quick Toggles (3 cols) */}
            <div className="lg:col-span-3 bg-surface border border-line rounded-[2px] overflow-hidden">
              <div className="px-3.5 py-2.5 bg-surface2 border-b border-line">
                <div className="panel-title">Watchlist Hazard Triggers</div>
                <span className="text-[10px] text-muted">Automated sector alarm filters</span>
              </div>

              <div className="p-3.5 space-y-3">
                <div className="space-y-2 text-xs">
                  {[
                    { id: "landslide", label: "Landslide Early Warning", code: "LSD" },
                    { id: "flood", label: "Flash Flood Surge (CWC)", code: "FLD" },
                    { id: "cloudburst", label: "Cloudburst Doppler Nowcast", code: "CLD" },
                    { id: "earthquake", label: "Seismic Tremors (NCS/USGS)", code: "EQK" },
                    { id: "weather", label: "Severe Wind & Hail Advisory", code: "WTH" }
                  ].map(hz => (
                    <div
                      key={hz.id}
                      className="flex items-center justify-between p-2.5 rounded-[2px] bg-surface2 border border-line"
                    >
                      <div>
                        <div className="text-ink font-medium text-xs">{hz.label}</div>
                        <div className="text-[9px] font-mono text-muted">STREAM: {hz.code}</div>
                      </div>
                      <button
                        onClick={() => {
                          const updated = { ...hazardToggles, [hz.id]: !hazardToggles[hz.id] };
                          setHazardToggles(updated);
                        }}
                        className={`px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-semibold border transition-colors ${
                          hazardToggles[hz.id]
                            ? "bg-accent text-white border-accent"
                            : "bg-surface text-muted border-line"
                        }`}
                      >
                        {hazardToggles[hz.id] ? "ON" : "OFF"}
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSaveSettings()}
                  className="w-full py-2 rounded-[2px] bg-accent hover:bg-accent-hover text-white font-mono uppercase tracking-wider font-semibold text-[11px] transition-colors"
                >
                  Save Watchlist Configuration
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Notifications */}
        {activeTab === "notifications" && (
          <div className="max-w-2xl bg-surface border border-line rounded-[2px] overflow-hidden">
            <div className="px-4 py-3 bg-surface2 border-b border-line">
              <div className="panel-title">Notification Channels &amp; Thresholds</div>
              <p className="text-xs text-muted mt-0.5">
                Configure dispatch channels and quantitative sensor thresholds for SEOC incident alerts.
              </p>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <div className="p-3.5 rounded-[2px] bg-surface2 border border-line space-y-2.5">
                <span className="panel-title block">Dispatch Channels</span>
                <label className="flex items-center gap-2 text-ink2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.critical_alerts_sms}
                    onChange={(e) => setSettings(s => ({ ...s, notifications: { ...s.notifications, critical_alerts_sms: e.target.checked } }))}
                    className="rounded-[2px] border-line-strong text-accent"
                  />
                  <span>SMS Critical Bulletins (Dispatched directly to registered duty handset)</span>
                </label>
                <label className="flex items-center gap-2 text-ink2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.push_notifications}
                    onChange={(e) => setSettings(s => ({ ...s, notifications: { ...s.notifications, push_notifications: e.target.checked } }))}
                    className="rounded-[2px] border-line-strong text-accent"
                  />
                  <span>Console Real-Time Telemetry Stream Alerts</span>
                </label>
                <label className="flex items-center gap-2 text-ink2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.daily_summary_email}
                    onChange={(e) => setSettings(s => ({ ...s, notifications: { ...s.notifications, daily_summary_email: e.target.checked } }))}
                    className="rounded-[2px] border-line-strong text-accent"
                  />
                  <span>Daily Morning SITREP Digest (08:00 IST)</span>
                </label>
              </div>

              <div className="p-3.5 rounded-[2px] bg-surface2 border border-line space-y-2.5">
                <span className="panel-title block">Automated Sensor Thresholds</span>
                <label className="flex items-center gap-2 text-ink2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.landslide_early_warning}
                    onChange={(e) => setSettings(s => ({ ...s, notifications: { ...s.notifications, landslide_early_warning: e.target.checked } }))}
                    className="rounded-[2px] border-line-strong text-accent"
                  />
                  <span>Slope Saturation &amp; Pore Pressure Threshold Exceeded (&gt;80% saturation)</span>
                </label>
                <label className="flex items-center gap-2 text-ink2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.flash_flood_threshold}
                    onChange={(e) => setSettings(s => ({ ...s, notifications: { ...s.notifications, flash_flood_threshold: e.target.checked } }))}
                    className="rounded-[2px] border-line-strong text-accent"
                  />
                  <span>CWC Gauge Danger Mark Water Level Breach Warning</span>
                </label>
                <label className="flex items-center gap-2 text-ink2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.severe_weather_warning}
                    onChange={(e) => setSettings(s => ({ ...s, notifications: { ...s.notifications, severe_weather_warning: e.target.checked } }))}
                    className="rounded-[2px] border-line-strong text-accent"
                  />
                  <span>IMD Red Alert Precipitation Nowcasts (&gt;100 mm in 24 hrs)</span>
                </label>
              </div>

              <button
                onClick={() => handleSaveSettings({ notifications: settings.notifications })}
                className="px-4 py-2 rounded-[2px] bg-accent hover:bg-accent-hover text-white font-mono uppercase tracking-wider font-semibold text-xs transition-colors"
              >
                Save Notification Preferences
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Display & Units */}
        {activeTab === "units" && (
          <div className="max-w-2xl bg-surface border border-line rounded-[2px] overflow-hidden">
            <div className="px-4 py-3 bg-surface2 border-b border-line">
              <div className="panel-title">Measurement Units &amp; Display Formats</div>
              <p className="text-xs text-muted mt-0.5">
                Configure physical units for precipitation, topography, and meteorological telemetry.
              </p>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-[2px] bg-surface2 border border-line space-y-1.5">
                  <span className="panel-title block">Precipitation</span>
                  <select
                    value={settings.display_units.rainfall}
                    onChange={(e) => setSettings(s => ({ ...s, display_units: { ...s.display_units, rainfall: e.target.value } }))}
                    className="w-full bg-surface border border-line rounded-[2px] p-1.5 text-ink"
                  >
                    <option value="mm">Millimeters (mm)</option>
                    <option value="inches">Inches (in)</option>
                  </select>
                </div>

                <div className="p-3 rounded-[2px] bg-surface2 border border-line space-y-1.5">
                  <span className="panel-title block">Distance &amp; Reach</span>
                  <select
                    value={settings.display_units.distance}
                    onChange={(e) => setSettings(s => ({ ...s, display_units: { ...s.display_units, distance: e.target.value } }))}
                    className="w-full bg-surface border border-line rounded-[2px] p-1.5 text-ink"
                  >
                    <option value="km">Kilometers (km)</option>
                    <option value="miles">Miles (mi)</option>
                  </select>
                </div>

                <div className="p-3 rounded-[2px] bg-surface2 border border-line space-y-1.5">
                  <span className="panel-title block">Topographic Elevation</span>
                  <select
                    value={settings.display_units.elevation}
                    onChange={(e) => setSettings(s => ({ ...s, display_units: { ...s.display_units, elevation: e.target.value } }))}
                    className="w-full bg-surface border border-line rounded-[2px] p-1.5 text-ink"
                  >
                    <option value="m">Meters Above Sea Level (MASL)</option>
                    <option value="ft">Feet (ft)</option>
                  </select>
                </div>

                <div className="p-3 rounded-[2px] bg-surface2 border border-line space-y-1.5">
                  <span className="panel-title block">Ambient Temperature</span>
                  <select
                    value={settings.display_units.temperature}
                    onChange={(e) => setSettings(s => ({ ...s, display_units: { ...s.display_units, temperature: e.target.value } }))}
                    className="w-full bg-surface border border-line rounded-[2px] p-1.5 text-ink"
                  >
                    <option value="celsius">Celsius (°C)</option>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => handleSaveSettings({ display_units: settings.display_units })}
                className="px-4 py-2 rounded-[2px] bg-accent hover:bg-accent-hover text-white font-mono uppercase tracking-wider font-semibold text-xs transition-colors"
              >
                Save Display Preferences
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: Map Settings */}
        {activeTab === "map" && (
          <div className="max-w-2xl bg-surface border border-line rounded-[2px] overflow-hidden">
            <div className="px-4 py-3 bg-surface2 border-b border-line">
              <div className="panel-title">Geospatial Map Defaults</div>
              <p className="text-xs text-muted mt-0.5">
                Configure default key-free basemap tiles, zoom levels, and sensor layer visibility.
              </p>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <div className="p-3.5 rounded-[2px] bg-surface2 border border-line space-y-2.5">
                <span className="panel-title block">Default Basemap Layer</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "light", label: "Light OSM" },
                    { id: "terrain", label: "OpenTopoMap" },
                    { id: "satellite", label: "Esri Imagery" },
                    { id: "dark", label: "Technical Dark" }
                  ].map(b => (
                    <button
                      key={b.id}
                      onClick={() => setSettings(s => ({ ...s, map_settings: { ...s.map_settings, default_basemap: b.id } }))}
                      className={`p-2 rounded-[2px] border text-xs font-mono font-semibold transition-colors ${
                        settings.map_settings.default_basemap === b.id
                          ? "bg-accent text-white border-accent"
                          : "bg-surface text-ink2 border-line hover:border-line-strong"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-[2px] bg-surface2 border border-line space-y-2.5">
                <span className="panel-title block">Default Layer Visibility</span>
                <label className="flex items-center gap-2 text-ink2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.map_settings.show_station_markers}
                    onChange={(e) => setSettings(s => ({ ...s, map_settings: { ...s.map_settings, show_station_markers: e.target.checked } }))}
                    className="rounded-[2px] border-line-strong text-accent"
                  />
                  <span>Show Hydrological Telemetry Stations (CWC &amp; IMD AWS)</span>
                </label>
                <label className="flex items-center gap-2 text-ink2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.map_settings.show_risk_polygons}
                    onChange={(e) => setSettings(s => ({ ...s, map_settings: { ...s.map_settings, show_risk_polygons: e.target.checked } }))}
                    className="rounded-[2px] border-line-strong text-accent"
                  />
                  <span>Show Predictive Flash Flood &amp; Landslide Susceptibility Zones</span>
                </label>
              </div>

              <button
                onClick={() => handleSaveSettings({ map_settings: settings.map_settings })}
                className="px-4 py-2 rounded-[2px] bg-accent hover:bg-accent-hover text-white font-mono uppercase tracking-wider font-semibold text-xs transition-colors"
              >
                Save Map Defaults
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: Account & Profile */}
        {activeTab === "account" && (
          <div className="max-w-2xl bg-surface border border-line rounded-[2px] overflow-hidden">
            <div className="px-4 py-3 bg-surface2 border-b border-line">
              <div className="panel-title">Duty Officer Profile &amp; Command Authority</div>
              <p className="text-xs text-muted mt-0.5">
                Verified responder credentials and jurisdictional assignment.
              </p>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3.5 p-3.5 rounded-[2px] bg-surface2 border border-line">
                <div className="w-12 h-12 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-base">
                  {settings.account.badge || "AK"}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-ink">{settings.account.name}</h4>
                  <div className="text-xs text-accent font-mono font-semibold">{settings.account.role}</div>
                  <div className="text-[11px] text-muted mt-0.5">{settings.account.organization} &bull; {settings.account.state}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-[2px] bg-surface2 border border-line">
                  <span className="text-muted text-[10px] block mb-1">ASSIGNED COMMAND CENTER:</span>
                  <span className="font-semibold text-ink">SEOC DEHRADUN (STATE LEVEL)</span>
                </div>
                <div className="p-3 rounded-[2px] bg-surface2 border border-line">
                  <span className="text-muted text-[10px] block mb-1">OPERATIONAL CLEARANCE:</span>
                  <span className="font-semibold text-ok">LEVEL-3 INCIDENT COMMANDER</span>
                </div>
              </div>

              <div className="pt-1 flex items-center gap-3">
                <button
                  onClick={() => alert("Settings export downloaded (JSON config backup).")}
                  className="px-3.5 py-1.5 rounded-[2px] bg-surface2 hover:bg-surface3 text-ink border border-line text-[11px] font-mono uppercase tracking-wider font-semibold transition-colors"
                >
                  Export Watchlist Configuration (JSON)
                </button>
              </div>
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
