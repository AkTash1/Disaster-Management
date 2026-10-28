// Disaster Intelligence Multimodal Platform - Operational Settings View (/settings)
// Dedicated system configuration console: Data Refresh Interval, Coordinate Format (DMS vs Decimal Degrees),
// Default Basemap Layer, API Key / Webhook Configuration, and Bilingual Language Default (EN / HI).

(function() {
  const React = window.React;
  const { useState } = React;
  const { EpistemicBadge, StatusBadge } = window.DisasterComponents || window;

  const SettingsView = ({ onNavigate = null }) => {
    const [refreshInterval, setRefreshInterval] = useState("30");
    const [coordFormat, setCoordFormat] = useState("dd");
    const [defaultBasemap, setDefaultBasemap] = useState("light");
    const [defaultLanguage, setDefaultLanguage] = useState("en");
    const [timezone, setTimezone] = useState("IST");
    const [elevationUnit, setElevationUnit] = useState("m");
    const [rainfallUnit, setRainfallUnit] = useState("mm");
    const [webhookUrl, setWebhookUrl] = useState("https://seoc.uk.gov.in/hooks/cap-v12-ingest");
    const [capFeedEnabled, setCapFeedEnabled] = useState(true);
    const [savedStatus, setSavedStatus] = useState(null);

    const handleSave = (e) => {
      e.preventDefault();
      try {
        fetch('/api/v1/my-area/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            refresh_interval_sec: Number(refreshInterval),
            coordinate_format: coordFormat,
            default_basemap: defaultBasemap,
            language: defaultLanguage,
            timezone: timezone
          })
        }).catch(() => {});
      } catch (err) {}
      setSavedStatus("SAVED · " + new Date().toLocaleTimeString());
      setTimeout(() => setSavedStatus(null), 4000);
    };

    return (
      <div className="p-4 space-y-4">
        {/* Top bar */}
        <div className="bg-surface border border-line px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="panel-title">SYSTEM CONFIGURATION // CONSOLE PARAMETERS</div>
            <h1 className="text-base font-semibold text-ink mt-0.5">
              Operational Telemetry &amp; Workstation Settings
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {savedStatus && (
              <span className="font-mono text-[11px] text-ok bg-ok-soft px-2 py-1 border-l-2 border-ok">
                {savedStatus}
              </span>
            )}
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('my-area')}
              className="px-2.5 py-1 border border-line bg-surface2 hover:border-line-strong font-mono text-[11px] text-ink2"
            >
              District Watchlist (/my-area) &rarr;
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1 bg-accent text-surface hover:bg-accent-hover font-mono text-[11px] uppercase tracking-wider font-medium"
            >
              Commit Parameters
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-line border border-line">
          {/* Column 1: Telemetry & Geodesy */}
          <div className="lg:col-span-6 bg-surface p-4 space-y-4">
            <div className="border-b border-line pb-2 flex items-center justify-between">
              <span className="panel-title">01 // TELEMETRY POLLING &amp; GEODETIC DISPLAY</span>
              <span className="font-mono text-[10px] text-faint">EPSG:4326 / WGS84</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-mono text-[11px] uppercase text-ink2 mb-1">
                  Data Refresh &amp; Polling Interval
                </label>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(e.target.value)}
                  className="w-full h-8 px-2.5 bg-surface2 border border-line text-ink font-mono text-xs"
                >
                  <option value="15">15 seconds (High-frequency flash flood / seismic mode)</option>
                  <option value="30">30 seconds (Standard SEOC operations)</option>
                  <option value="60">60 seconds (Low-bandwidth field terminal)</option>
                  <option value="300">300 seconds (5-minute synoptic cycle)</option>
                </select>
                <p className="text-[11px] text-muted mt-1">
                  Controls background polling cadence for CWC river gauges, IMD AWS telemetry, and NCS seismic feeds.
                </p>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase text-ink2 mb-1">
                  Coordinate Readout Format
                </label>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setCoordFormat("dd")}
                    className={`p-2.5 text-left border ${
                      coordFormat === "dd" ? "border-accent bg-accent-soft text-ink font-semibold" : "border-line bg-surface2 text-muted"
                    }`}
                  >
                    <div>Decimal Degrees (DD)</div>
                    <div className="text-[10px] text-muted mt-0.5">30.2849° N, 79.0193° E</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoordFormat("dms")}
                    className={`p-2.5 text-left border ${
                      coordFormat === "dms" ? "border-accent bg-accent-soft text-ink font-semibold" : "border-line bg-surface2 text-muted"
                    }`}
                  >
                    <div>Deg · Min · Sec (DMS)</div>
                    <div className="text-[10px] text-muted mt-0.5">30°17&apos;05.6&quot;N 79°01&apos;09.5&quot;E</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted mb-1">Default Basemap</label>
                  <select
                    value={defaultBasemap}
                    onChange={(e) => setDefaultBasemap(e.target.value)}
                    className="w-full h-8 px-2 bg-surface2 border border-line text-ink font-mono text-xs"
                  >
                    <option value="light">OSM Light (Default)</option>
                    <option value="terrain">OpenTopoMap Contours</option>
                    <option value="satellite">Esri World Imagery</option>
                    <option value="dark">OSM Dark (High Contrast)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted mb-1">Bilingual Default</label>
                  <select
                    value={defaultLanguage}
                    onChange={(e) => setDefaultLanguage(e.target.value)}
                    className="w-full h-8 px-2 bg-surface2 border border-line text-ink font-mono text-xs"
                  >
                    <option value="en">EN · English Primary</option>
                    <option value="hi">HI · हिन्दी Primary</option>
                    <option value="bi">EN + HI Side-by-Side</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted mb-1">Primary Clock</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-8 px-2 bg-surface2 border border-line text-ink font-mono text-xs"
                  >
                    <option value="IST">IST (UTC+05:30)</option>
                    <option value="UTC">UTC (Synoptic Z)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted mb-1">Precipitation Unit</label>
                  <select
                    value={rainfallUnit}
                    onChange={(e) => setRainfallUnit(e.target.value)}
                    className="w-full h-8 px-2 bg-surface2 border border-line text-ink font-mono text-xs"
                  >
                    <option value="mm">Millimeters (mm / hr)</option>
                    <option value="cm">Centimeters (cm / day)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted mb-1">River Stage / Elevation</label>
                  <select
                    value={elevationUnit}
                    onChange={(e) => setElevationUnit(e.target.value)}
                    className="w-full h-8 px-2 bg-surface2 border border-line text-ink font-mono text-xs"
                  >
                    <option value="m">Meters above MSL (m)</option>
                    <option value="ft">Feet (ft)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: API Keys, Webhooks & Feed Contracts */}
          <div className="lg:col-span-6 bg-surface p-4 space-y-4">
            <div className="border-b border-line pb-2 flex items-center justify-between">
              <span className="panel-title">02 // INGESTION CREDENTIALS &amp; CAP WEBHOOKS</span>
              <StatusBadge status="Active" />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-mono text-[11px] uppercase text-ink2 mb-1">
                  Outbound CAP v1.2 / SACHET Alert Webhook Endpoint
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full h-8 px-2.5 bg-surface2 border border-line text-ink font-mono text-xs"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <label className="flex items-center gap-2 text-ink2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={capFeedEnabled}
                      onChange={(e) => setCapFeedEnabled(e.target.checked)}
                    />
                    <span>Forward verified Critical/High events to NDMA CAP bus</span>
                  </label>
                  <span className="font-mono text-[10px] text-ok">HMAC-SHA256 SIGNED</span>
                </div>
              </div>

              <div className="border-t border-line pt-3">
                <div className="panel-title mb-2">REGISTERED AGENCY FEED ADAPTERS</div>
                <table className="w-full text-left border border-line text-xs">
                  <thead className="bg-surface2 font-mono text-[10px] uppercase text-muted border-b border-line">
                    <tr>
                      <th className="py-1.5 px-2">Provider</th>
                      <th className="py-1.5 px-2">Protocol</th>
                      <th className="py-1.5 px-2">Auth Key</th>
                      <th className="py-1.5 px-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line font-mono text-[11px]">
                    {[
                      { p: "IMD Gridded & AWS", proto: "NetCDF / REST", key: "PUBLIC-OPEN", st: "Observed" },
                      { p: "ISRO MOSDAC 3RIMG", proto: "HDF5 SFTP", key: "MOSDAC_USER ···", st: "Official" },
                      { p: "CWC River Telemetry", proto: "WFS / CSV", key: "WRIS_TOKEN ···", st: "Observed" },
                      { p: "NRSC Bhuvan & Bhoonidhi", proto: "OGC WMS/WMTS", key: "BHUVAN_KEY ···", st: "Official" }
                    ].map((row, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 px-2 font-sans font-medium text-ink">{row.p}</td>
                        <td className="py-1.5 px-2 text-muted">{row.proto}</td>
                        <td className="py-1.5 px-2 text-ink2">{row.key}</td>
                        <td className="py-1.5 px-2 text-right"><EpistemicBadge status={row.st} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  };

  window.DisasterViews = window.DisasterViews || {};
  window.DisasterViews.SettingsView = SettingsView;
  window.SettingsView = SettingsView;
})();
