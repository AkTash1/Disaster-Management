// Disaster Intelligence Platform — Top Navigation Header
// Clean brand mark (without Uttarakhand Testbed / State Emergency Center subtitle),
// global search bar, region/date selectors, live status, alerts drawer, and Ashutosh Kanojia Role & Authority Switcher.

(function() {
  const React = window.React;
  const { useState, useEffect, useRef } = React;

  const FALLBACK_ROLES = [
    {
      id: 'authority',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleTitle: 'Disaster Management Authority',
      displayTitle: 'Disaster Management Authority (LVL 5)',
      shortLevel: 'LVL 5',
      authorityLevel: 'LEVEL 5 · EXECUTIVE COMMAND',
      clearanceBadge: 'FULL READ/WRITE & BROADCAST',
      sla: 'Immediate (< 5 mins)',
      accessSummary: 'Primary: MEI-01, Role Hub · Full: HM-01, SMI-01, Public Overview',
      levelColor: 'bg-crit-soft text-crit border-crit/30'
    },
    {
      id: 'analyst',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleTitle: 'Hazard Analyst',
      displayTitle: 'Hazard Analyst (LVL 4)',
      shortLevel: 'LVL 4',
      authorityLevel: 'LEVEL 4 · SCIENTIFIC CALIBRATION',
      clearanceBadge: 'TELEMETRY & MODEL WRITE',
      sla: 'High (Hourly Cycles)',
      accessSummary: 'Primary: HM-01 · Full: MEI-01 · Read-Only: SMI-01',
      levelColor: 'bg-accent-soft text-accent border-accent/30'
    },
    {
      id: 'response',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleTitle: 'Emergency Response Team',
      displayTitle: 'Emergency Response Team (LVL 4)',
      shortLevel: 'LVL 4',
      authorityLevel: 'LEVEL 4 · TACTICAL DISPATCH',
      clearanceBadge: 'FIELD DISPATCH & TRIAGE WRITE',
      sla: 'Critical (< 15 mins)',
      accessSummary: 'Primary: SMI-01 · Full: MEI-01 · Read-Only: HM-01',
      levelColor: 'bg-high-soft text-high border-high/30'
    },
    {
      id: 'researcher',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleTitle: 'Disaster Researcher',
      displayTitle: 'Disaster Researcher (LVL 3)',
      shortLevel: 'LVL 3',
      authorityLevel: 'LEVEL 3 · RESEARCH SANDBOX',
      clearanceBadge: 'READ-ONLY & DATASET EXPORT',
      sla: 'Batch / Deliberate',
      accessSummary: 'Read-Only & Corpus Export: HM-01, SMI-01, MEI-01',
      levelColor: 'bg-info-soft text-info border-info/30'
    },
    {
      id: 'data-admin',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleTitle: 'Data Administrator',
      displayTitle: 'Data Administrator (LVL 5)',
      shortLevel: 'LVL 5',
      authorityLevel: 'LEVEL 5 · SYSTEM & PIPELINE ADMIN',
      clearanceBadge: 'INGESTION & SENSOR CONTROL',
      sla: 'Continuous (24/7 Ops)',
      accessSummary: 'Primary: Role Hub · Full: HM-01, SMI-01 · Read-Only: MEI-01',
      levelColor: 'bg-warn-soft text-warn border-warn/30'
    },
    {
      id: 'citizen',
      officerName: 'Ashutosh Kanojia',
      initials: 'AK',
      roleTitle: 'Common Citizen · Public',
      displayTitle: 'Common Citizen · Public (LVL 1)',
      shortLevel: 'LVL 1',
      authorityLevel: 'LEVEL 1 · PUBLIC ACCESS',
      clearanceBadge: 'PUBLIC ADVISORIES & SOS ONLY',
      sla: 'On-Demand Safety',
      accessSummary: 'Public Open: Main Overview, Advisories & SOS · Restricted: Raw Telemetry',
      levelColor: 'bg-ok-soft text-ok border-ok/30'
    }
  ];

  const resolveRoles = () => {
    const engine = window.DisasterRoleEngine;
    if (engine && Array.isArray(engine.ROLE_LIST) && engine.ROLE_LIST.length > 0) {
      return FALLBACK_ROLES.map((fb) => {
        const match = engine.ROLE_LIST.find((r) => r.id === fb.id) || (engine.ROLES && engine.ROLES[fb.id]);
        if (!match) return fb;
        return {
          ...fb,
          ...match,
          officerName: 'Ashutosh Kanojia',
          initials: 'AK',
          displayTitle: fb.displayTitle,
          shortLevel: fb.shortLevel,
          accessSummary: match.accessSummary || fb.accessSummary,
          levelColor: fb.levelColor
        };
      });
    }
    return FALLBACK_ROLES;
  };

  const TopBar = ({
    onSearch = null,
    selectedRegion = "Uttarakhand",
    onRegionChange = null,
    onNavigate = null,
    searchPlaceholder = "Search events, locations...",
    activeRoleId = "authority",
    onRoleChange = null
  }) => {
    const [searchValue, setSearchValue] = useState("");
    const [state, setState] = useState(selectedRegion);
    const [timeframe, setTimeframe] = useState("Sep 01, 2026 - Oct 09, 2026");
    const [isLive, setIsLive] = useState(true);
    const [alertsOpen, setAlertsOpen] = useState(false);
    const [roleMenuOpen, setRoleMenuOpen] = useState(false);
    const searchRef = useRef(null);
    const roleDropdownRef = useRef(null);

    const roleList = resolveRoles();
    const activeRole = roleList.find((r) => r.id === activeRoleId) || roleList[0];

    useEffect(() => {
      const onKey = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          if (searchRef.current) searchRef.current.focus();
        } else if (e.key === 'Escape') {
          setRoleMenuOpen(false);
          setAlertsOpen(false);
        }
      };
      const onClickOutside = (e) => {
        if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
          setRoleMenuOpen(false);
        }
      };
      window.addEventListener('keydown', onKey);
      document.addEventListener('mousedown', onClickOutside);
      return () => {
        window.removeEventListener('keydown', onKey);
        document.removeEventListener('mousedown', onClickOutside);
      };
    }, []);

    const handleSearchSubmit = (e) => {
      e.preventDefault();
      if (onSearch) onSearch(searchValue);
    };

    const handleSelectRole = (roleId) => {
      if (roleId === 'citizen') {
        setAlertsOpen(false);
      }
      if (onRoleChange) {
        onRoleChange(roleId);
      }
      setRoleMenuOpen(false);
    };

    const isCitizen = activeRoleId === 'citizen';

    const ALERTS = [
      { sev: 'crit', agency: 'IMD Weather', title: 'Red Alert: Heavy Rainfall in Rudraprayag & Chamoli', time: '10 mins ago' },
      { sev: 'high', agency: 'CWC River Gauge', title: 'Alaknanda River water level above warning mark (626.4 m)', time: '45 mins ago' },
      { sev: 'warn', agency: 'BRO Roads', title: 'NH-58 Highway blocked near Banswara — clearance underway', time: '2 hours ago' }
    ];
    const sevBar = { crit: 'border-l-crit', high: 'border-l-high', warn: 'border-l-warn' };

    return (
      <header className="h-16 bg-surface border-b border-line px-4 flex items-center justify-between gap-3 shrink-0 relative z-30">
        {/* Left: Brand Emblem & Title */}
        <div
          onClick={() => onNavigate && onNavigate('overview')}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-accent text-white flex items-center justify-center shadow-xs shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="hidden sm:block">
            <div className="text-[15px] font-extrabold text-ink leading-tight tracking-tight whitespace-nowrap">
              Disaster Intelligence
            </div>
            <div className="text-[11.5px] font-medium text-muted leading-tight whitespace-nowrap">
              Multimodal Platform
            </div>
          </div>
        </div>

        {/* Center: Search Bar + Region & Date Selectors */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
          <div className="relative flex-1 min-w-[140px] max-w-[260px]">
            <svg className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search events, locations..."
              className="w-full h-9 pl-9 pr-3 bg-surface2 border border-line rounded-lg text-[13px] text-ink placeholder-muted focus:bg-surface"
            />
          </div>

          <div className="hidden 2xl:flex items-center gap-2 shrink-0">
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                if (onRegionChange) onRegionChange(e.target.value);
              }}
              aria-label="Select State"
              className="h-9 px-2.5 bg-surface2 border border-line rounded-lg text-[12.5px] font-medium text-ink cursor-pointer hover:border-line-strong"
            >
              <option value="Uttarakhand">State: Uttarakhand</option>
              <option value="Garhwal Division">Garhwal Division</option>
              <option value="Kumaon Division">Kumaon Division</option>
            </select>

            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              aria-label="Select Timeframe"
              className="h-9 px-2.5 bg-surface2 border border-line rounded-lg text-[12.5px] font-medium text-ink cursor-pointer hover:border-line-strong"
            >
              <option value="Sep 01, 2026 - Oct 09, 2026">Sep 01, 2026 - Oct 09, 2026</option>
              <option value="Past 7 Days">Past 7 Days</option>
              <option value="Past 24 Hours">Past 24 Hours</option>
            </select>

            <button
              type="submit"
              className="h-9 px-3 rounded-lg bg-accent hover:bg-accent-hover text-white text-[12.5px] font-semibold transition-colors"
            >
              Apply
            </button>
          </div>
        </form>

        {/* Right: Live Status, Alerts Button, User Profile & Role Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
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
            <span>{isLive ? 'Live Mode' : 'Feed Paused'}</span>
          </button>

          {/* Alerts Dropdown Trigger (Hidden for Citizen Public Role) */}
          {!isCitizen && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setAlertsOpen(!alertsOpen);
                  setRoleMenuOpen(false);
                }}
                className="flex items-center gap-2 h-9 px-3 rounded-lg bg-crit-soft border border-crit/25 hover:border-crit/50 text-crit font-semibold text-[13px] transition-colors"
                title="View active emergency alerts"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                <span>{ALERTS.length}</span>
              </button>

              {alertsOpen && (
                <div className="absolute right-0 top-11 w-[380px] bg-surface border border-line-strong rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 bg-surface2 border-b border-line flex items-center justify-between">
                    <span className="font-bold text-sm text-ink">Active Emergency Alerts ({ALERTS.length})</span>
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
                        <div className="text-[13px] font-semibold text-ink leading-snug">{a.title}</div>
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
          )}

          {/* Ashutosh Kanojia (AK) Profile + Unmistakable Role Switcher <select> Dropdown */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-line" ref={roleDropdownRef}>
            <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[13px] shadow-xs shrink-0">
              {activeRole.initials || 'AK'}
            </div>
            <div className="hidden lg:flex items-center gap-1.5">
              <span className="text-[13px] font-bold text-ink whitespace-nowrap">Ashutosh Kanojia</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${activeRole.levelColor}`}>
                {activeRole.shortLevel}
              </span>
            </div>

            <select
              value={activeRole.id}
              onChange={(e) => handleSelectRole(e.target.value)}
              aria-label="Switch Active Role"
              title="Switch Active Role & Dashboard Access"
              className="h-9 px-2.5 bg-surface2 border border-line-strong rounded-lg text-[12.5px] font-semibold text-ink cursor-pointer hover:border-accent focus:outline-none focus:border-accent w-[290px] max-w-[290px]"
            >
              <option value="authority">Disaster Management Authority &middot; LVL 5</option>
              <option value="analyst">Hazard Analyst &middot; LVL 4</option>
              <option value="response">Emergency Response Team &middot; LVL 4</option>
              <option value="researcher">Disaster Researcher &middot; LVL 3</option>
              <option value="data-admin">Data Administrator &middot; LVL 5</option>
              <option value="citizen">Common Citizen &middot; LVL 1</option>
            </select>
          </div>
        </div>
      </header>
    );
  };

  window.DisasterComponents = window.DisasterComponents || {};
  window.DisasterComponents.TopBar = TopBar;
  window.TopBar = TopBar;
})();
