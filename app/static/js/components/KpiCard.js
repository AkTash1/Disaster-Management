// Disaster Intelligence Multimodal Platform - KpiCard Component
(function() {
  const React = window.React;

  // Icon mapping helper
  const renderIcon = (iconName, color = "#38bdf8") => {
    // Return clean SVG icon based on name
    const svgs = {
      pulse: <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
      warning: <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>,
      alert: <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>,
      cloud: <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"/></svg>,
      mountain: <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 19l6-10 4 6 6-10 4 14H4z"/></svg>,
      waves: <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M3 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/></svg>,
      users: <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
      pin: <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
      shield: <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
      activity: <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
      feed: <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z"/></svg>,
    };

    const key = (iconName || 'activity').toLowerCase().replace('alerttriangle', 'warning').replace('bellring', 'alert').replace('cloudrain', 'cloud').replace('radio', 'feed');
    return svgs[key] || svgs.activity;
  };

  const KpiCard = ({
    title,
    value,
    trend = null,
    delta = null,
    trendType = "neutral", // "up", "down", "positive", "negative", "neutral"
    icon = "activity",
    iconColor = "#38bdf8",
    subtitle = "",
    statusColor = null,
    className = "",
    onClick = null
  }) => {
    // Format trend text and styling
    const displayDelta = trend || delta;
    const isUp = String(displayDelta).includes('↑') || trendType === 'up' || trendType === 'positive';
    const isDown = String(displayDelta).includes('↓') || trendType === 'down';
    
    // Check if green or red trend
    let trendBadgeBg = 'rgba(148, 163, 184, 0.15)';
    let trendBadgeColor = '#94a3b8';
    if (isUp) {
      trendBadgeBg = 'rgba(16, 185, 129, 0.15)';
      trendBadgeColor = '#34d399';
    } else if (isDown) {
      trendBadgeBg = 'rgba(239, 68, 68, 0.15)';
      trendBadgeColor = '#f87171';
    }

    return (
      <div
        onClick={onClick}
        className={`bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-xl p-3.5 transition-all duration-200 flex flex-col justify-between ${onClick ? 'cursor-pointer' : ''} ${className}`}
        style={{ minWidth: '130px' }}
      >
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className="text-xs font-medium text-slate-400 truncate tracking-wide" title={title}>
            {title}
          </span>
          <div className="p-1.5 rounded-lg bg-slate-900/60 shrink-0">
            {renderIcon(icon, iconColor)}
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2 mt-0.5">
          <div className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
            {value !== undefined && value !== null ? value : "—"}
          </div>
          {displayDelta && (
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded shrink-0"
              style={{ backgroundColor: trendBadgeBg, color: trendBadgeColor }}
            >
              {displayDelta}
            </span>
          )}
        </div>

        {subtitle && (
          <div className="text-[11px] text-slate-400 mt-1 truncate" title={subtitle}>
            {subtitle}
          </div>
        )}
      </div>
    );
  };

  window.DisasterComponents = window.DisasterComponents || {};
  window.DisasterComponents.KpiCard = KpiCard;
  window.KpiCard = KpiCard;
})();
