// Disaster Intelligence Platform — Clean, Uncluttered Top Navigation Header
// Features: Brand Title | Intuitive Search Bar + Simple Region & Timeframe Selectors | Live Status, Alerts Drawer & User Profile (Ashutosh Kanojia)

(function() {
  const React = window.React;
  const { useState, useEffect, useRef } = React;

  const TopBar = ({
    onSearch = null,
    selectedRegion = "Uttarakhand",
    onRegionChange = null,
    onNavigate = null,
    searchPlaceholder = "Search districts, road closures, hazards, or events..."
  }) => {
    const [searchValue, setSearchValue] = useState("");
    const [state, setState] = useState(selectedRegion);
    const [timeframe, setTimeframe] = useState("30d");
    const [isLive, setIsLive] = useState(true);
    const [alertsOpen, setAlertsOpen] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
      const onKey = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          if (searchRef.current) searchRef.current.focus();
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, []);

    const handleSearchSubmit = (e) => {
      e.preventDefault();
      if (onSearch) onSearch(searchValue);
    };

    const ALERTS = [
      { sev: 'crit', agency: 'IMD Weather', title: 'Red Alert: Heavy Rainfall in Rudraprayag & Chamoli', time: '10 mins ago' },
      { sev: 'high', agency: 'CWC River Gauge', title: 'Alaknanda River water level above warning mark (626.4 m)', time: '45 mins ago' },
      { sev: 'warn', agency: 'BRO Roads', title: 'NH-58 Highway blocked near Banswara — clearance underway', time: '2 hours ago' }
    ];
    const sevBar = { crit: 'border-l-crit', high: 'border-l-high', warn: 'border-l-warn' };

    return (
      <header className="h-16 bg-surface border-b border-line px-5 flex items-center justify-between gap-4 shrink-0 relative z-30">
        {/* Left: Clean Brand Emblem & Title */}
        <div
          onClick={() => onNavigate && onNavigate('overview')}
          className="flex items-center gap-3 shrink-0 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-sm shadow-sm">
            UK
          </div>
          <div>
            <div className="text-[15px] font-bold text-ink leading-tight">
              Disaster Intelligence Platform
            </div>
            <div className="text-[12px] text-muted leading-tight">
              Uttarakhand Testbed &bull; State Emergency Center
            </div>
          </div>
        </div>

        {/* Center: Easy Search Bar + Simple Region & Time Selectors */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl flex items-center gap-2.5">
          <div className="relative flex-1">
            <svg className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-9 pl-9 pr-4 bg-surface2 border border-line rounded-lg text-[13.5px] text-ink placeholder-muted focus:bg-surface"
            />
          </div>

          <div className="hidden xl:flex items-center gap-2">
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                if (onRegionChange) onRegionChange(e.target.value);
              }}
              aria-label="Select Region"
              className="h-9 px-3 bg-surface2 border border-line rounded-lg text-[13px] font-medium text-ink cursor-pointer hover:border-line-strong"
            >
              <option value="Uttarakhand">Region: Uttarakhand</option>
              <option value="Garhwal Division">Garhwal Division</option>
              <option value="Kumaon Division">Kumaon Division</option>
            </select>

            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              aria-label="Select Timeframe"
              className="h-9 px-3 bg-surface2 border border-line rounded-lg text-[13px] font-medium text-ink cursor-pointer hover:border-line-strong"
            >
              <option value="30d">Past 30 Days</option>
              <option value="7d">Past 7 Days</option>
              <option value="24h">Past 24 Hours</option>
            </select>
          </div>
        </form>

        {/* Right: Live Status, Alerts Button, User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsLive(!isLive)}
            className={`hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg border text-[12.5px] font-semibold transition-colors ${
              isLive
                ? 'bg-ok-soft border-ok/30 text-ok'
                : 'bg-surface2 border-line text-muted'
            }`}
            title="Click to pause or resume live updates"
          >
            {isLive ? <span className="live-dot"></span> : <span className="w-2 h-2 rounded-full bg-faint inline-block"></span>}
            <span>{isLive ? 'Live Feed Active' : 'Feed Paused'}</span>
          </button>

          {/* Alerts Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAlertsOpen(!alertsOpen)}
              className="flex items-center gap-2 h-9 px-3 rounded-lg bg-crit-soft border border-crit/25 hover:border-crit/50 text-crit font-semibold text-[13px] transition-colors"
              title="View active emergency alerts"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span>{ALERTS.length} Alerts</span>
            </button>

            {alertsOpen && (
              <div className="absolute right-0 top-11 w-[380px] bg-surface border border-line-strong rounded-xl shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 bg-surface2 border-b border-line flex items-center justify-between">
                  <span className="font-semibold text-sm text-ink">Active Emergency Alerts ({ALERTS.length})</span>
                  <button onClick={() => setAlertsOpen(false)} className="text-xs text-muted hover:text-ink font-medium">Close</button>
                </div>
                <div className="divide-y divide-line">
                  {ALERTS.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => { setAlertsOpen(false); if (onNavigate) onNavigate('events'); }}
                      className={`w-full text-left px-4 py-3 border-l-4 ${sevBar[a.sev]} hover:bg-surface2 transition-colors`}
                    >
                      <div className="flex items-center justify-between text-xs text-muted mb-1">
                        <span className="font-semibold text-ink2">{a.agency}</span>
                        <span>{a.time}</span>
                      </div>
                      <div className="text-[13px] font-medium text-ink leading-snug">{a.title}</div>
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2.5 bg-surface2 border-t border-line text-center">
                  <button
                    onClick={() => { setAlertsOpen(false); if (onNavigate) onNavigate('events'); }}
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    View All Events &amp; Warnings &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile (Ashutosh Kanojia) */}
          <div
            onClick={() => onNavigate && onNavigate('my-area')}
            className="flex items-center gap-2.5 pl-3 border-l border-line cursor-pointer group"
            title="Open My Area & Profile"
          >
            <div className="w-9 h-9 rounded-full bg-accent-soft border border-accent/30 flex items-center justify-center font-bold text-[13px] text-accent group-hover:bg-accent group-hover:text-white transition-colors">
              AK
            </div>
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-[13.5px] font-semibold text-ink group-hover:text-accent transition-colors">
                Ashutosh Kanojia
              </span>
              <span className="text-[11.5px] text-muted">
                State Response Officer
              </span>
            </div>
          </div>
        </div>
      </header>
    );
  };

  window.DisasterComponents = window.DisasterComponents || {};
  window.DisasterComponents.TopBar = TopBar;
  window.TopBar = TopBar;
})();
