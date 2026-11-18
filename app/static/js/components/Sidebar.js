// Disaster Intelligence Platform — Left Navigation Sidebar
// Clean single-line navigation items with PUBLIC & SEOC CORE group and RBAC-aware INTELLIGENCE SUITE

(function() {
  const React = window.React;

  const ROLE_SIDEBAR_CONFIG = {
    'authority': {
      core: ['overview', 'map-explorer', 'events', 'modality-events', 'reports', 'history', 'preparedness', 'ask', 'my-area'],
      intelligence: ['role-command', 'hazard-monitoring', 'social-intelligence', 'multimodal-intelligence'],
      utility: ['settings', 'help'],
      badges: {
        'role-command': '6 ROLES',
        'hazard-monitoring': 'FULL',
        'social-intelligence': 'FULL',
        'multimodal-intelligence': 'PRIMARY'
      }
    },
    'analyst': {
      core: ['overview', 'map-explorer', 'modality-events', 'history'],
      intelligence: ['hazard-monitoring', 'multimodal-intelligence'],
      utility: ['help'],
      badges: {
        'hazard-monitoring': 'PRIMARY',
        'multimodal-intelligence': 'FULL'
      }
    },
    'response': {
      core: ['overview', 'map-explorer', 'events', 'preparedness'],
      intelligence: ['social-intelligence', 'multimodal-intelligence'],
      utility: ['help'],
      badges: {
        'social-intelligence': 'PRIMARY',
        'multimodal-intelligence': 'FULL'
      }
    },
    'researcher': {
      core: ['overview', 'history', 'reports', 'ask'],
      intelligence: ['hazard-monitoring', 'multimodal-intelligence'],
      utility: ['help'],
      badges: {
        'hazard-monitoring': 'READ-ONLY',
        'multimodal-intelligence': 'READ-ONLY'
      }
    },
    'data-admin': {
      core: ['overview', 'modality-events'],
      intelligence: ['role-command', 'hazard-monitoring', 'social-intelligence'],
      utility: ['settings', 'help'],
      badges: {
        'role-command': 'PIPELINE HUB',
        'hazard-monitoring': 'SENSOR HEALTH',
        'social-intelligence': 'NLP QUEUE'
      }
    },
    'citizen': {
      core: ['overview', 'events', 'modality-events', 'reports', 'preparedness', 'my-area', 'ask'],
      intelligence: [],
      utility: ['help'],
      badges: {}
    }
  };

  const ROLE_LABELS = {
    'authority': 'Authority (LVL 5)',
    'analyst': 'Hazard Analyst (LVL 4)',
    'response': 'Response Team (LVL 4)',
    'researcher': 'Researcher (LVL 3)',
    'data-admin': 'Data Admin (LVL 5)',
    'citizen': 'Citizen · Public (LVL 1)'
  };

  const NAV_ITEMS = [
    {
      id: 'overview',
      label: 'Overview',
      badge: 'PUBLIC',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      )
    },
    {
      id: 'map-explorer',
      label: 'Map Explorer',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
        </svg>
      )
    },
    {
      id: 'events',
      label: 'Events',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      )
    },
    {
      id: 'modality-events',
      label: 'Modality Events',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      )
    },
    {
      id: 'event-groups',
      label: 'Event Groups',
      hidden: true, // Temporarily hidden from sidebar navigation
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      )
    },
    {
      id: 'reports',
      label: 'Reports & Evidence',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      )
    },
    {
      id: 'history',
      label: 'History & Trends',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      )
    },
    {
      id: 'preparedness',
      label: 'Preparedness & Response',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
      )
    },
    {
      id: 'ask',
      label: 'Ask (Q&A)',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      )
    },
    {
      id: 'my-area',
      label: 'My Area',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      )
    }
  ];

  const INTELLIGENCE_ITEMS = [
    {
      id: 'role-command',
      label: 'Role Hub',
      badge: '6 ROLES',
      screenCode: 'RAC-01',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
      )
    },
    {
      id: 'hazard-monitoring',
      label: 'Hazard Monitoring',
      badge: 'HM-01',
      screenCode: 'HM-01',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
        </svg>
      )
    },
    {
      id: 'social-intelligence',
      label: 'Social Intelligence',
      badge: 'SMI-01',
      screenCode: 'SMI-01',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
        </svg>
      )
    },
    {
      id: 'multimodal-intelligence',
      label: 'Multimodal Dossier',
      badge: 'MEI-01',
      screenCode: 'MEI-01',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
      )
    }
  ];

  const UTILITY_ITEMS = [
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      )
    },
    {
      id: 'help',
      label: 'Help & About',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      )
    }
  ];

  const SHORT_BADGE = {
    '6 ROLES': 'FULL',
    'READ-ONLY': 'VIEW',
    'PIPELINE HUB': 'PRIMARY',
    'SENSOR HEALTH': 'FULL',
    'NLP QUEUE': 'PRIMARY'
  };

  const resolveRoleAccessBadge = (activeRoleId, viewId) => {
    const cfg = ROLE_SIDEBAR_CONFIG[activeRoleId] || ROLE_SIDEBAR_CONFIG['authority'];
    if (cfg.badges && cfg.badges[viewId]) {
      return cfg.badges[viewId];
    }
    return 'FULL';
  };

  const getAccessBadgeStyle = (accessType, isActive) => {
    if (isActive) {
      return 'bg-white/20 text-white border-white/30';
    }
    switch (accessType) {
      case 'PRIMARY':
      case 'NLP QUEUE':
        return 'bg-accent-soft text-accent border-accent/30';
      case 'FULL':
      case 'SENSOR HEALTH':
        return 'bg-ok-soft text-ok border-ok/30';
      case 'READ-ONLY':
        return 'bg-info-soft text-info border-info/30';
      case 'PUBLIC':
        return 'bg-ok-soft text-ok border-ok/30';
      case 'LOCKED':
        return 'bg-crit-soft text-crit border-crit/30';
      case '6 ROLES':
      case 'PIPELINE HUB':
        return 'bg-warn-soft text-warn border-warn/30';
      default:
        return 'bg-surface2 text-muted border-line';
    }
  };

  const Sidebar = ({
    currentView,
    onViewChange,
    activeRoleId = 'authority',
    onRoleChange = null
  }) => {
    const roleCfg = ROLE_SIDEBAR_CONFIG[activeRoleId] || ROLE_SIDEBAR_CONFIG['authority'];
    const visibleCoreItems = NAV_ITEMS.filter(
      (item) => !item.hidden && roleCfg.core.includes(item.id)
    ).map((item) => (
      item.id === 'preparedness' && activeRoleId === 'citizen'
        ? { ...item, label: 'Shelters & Helplines' }
        : item
    ));
    const visibleIntelligenceItems = INTELLIGENCE_ITEMS.filter(
      (item) => roleCfg.intelligence.includes(item.id)
    );
    const visibleUtilityItems = UTILITY_ITEMS.filter(
      (item) => roleCfg.utility.includes(item.id)
    );
    const canOpenRoleCommand = roleCfg.intelligence.includes('role-command');
    const renderItem = (item) => {
      const isActive = currentView === item.id;
      return (
        <button
          key={item.id}
          onClick={() => onViewChange && onViewChange(item.id)}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-lg text-left transition-colors ${
            isActive
              ? 'bg-accent text-white font-semibold shadow-xs'
              : 'text-ink2 hover:text-ink hover:bg-surface2 font-medium'
          }`}
        >
          <span className="flex items-center gap-3 min-w-0">
            <span className={`shrink-0 ${isActive ? 'text-white' : 'text-muted'}`}>{item.icon}</span>
            <span className="text-[13.5px] leading-tight truncate">{item.label}</span>
          </span>
          {item.badge && (
            <span
              className={`shrink-0 text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${
                isActive
                  ? 'bg-white/20 text-white border-white/30'
                  : item.badge === 'PUBLIC'
                  ? 'bg-ok-soft text-ok border-ok/30'
                  : 'bg-surface2 text-muted border-line'
              }`}
            >
              {item.badge}
            </span>
          )}
        </button>
      );
    };

    const renderIntelligenceItem = (item) => {
      const isActive = currentView === item.id;
      const accessBadge = resolveRoleAccessBadge(activeRoleId, item.id);
      const isLocked = accessBadge === 'LOCKED';
      const showViewTag = accessBadge === 'READ-ONLY' || isLocked;

      return (
        <button
          key={item.id}
          onClick={() => onViewChange && onViewChange(item.id)}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-lg text-left transition-colors ${
            isActive
              ? 'bg-accent text-white font-semibold shadow-xs'
              : 'text-ink2 hover:text-ink hover:bg-surface2 font-medium'
          }`}
          title={`${item.label} (${accessBadge})`}
        >
          <span className="flex items-center gap-3 min-w-0 flex-1">
            <span className={`shrink-0 ${isActive ? 'text-white' : isLocked ? 'text-crit' : 'text-muted'}`}>
              {item.icon}
            </span>
            <span className="text-[13.5px] leading-tight truncate">{item.label}</span>
          </span>
          {showViewTag && (
            <span
              className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded border ${getAccessBadgeStyle(accessBadge, isActive)}`}
            >
              {isLocked ? 'LOCKED' : 'VIEW'}
            </span>
          )}
        </button>
      );
    };

    return (
      <aside className="w-60 h-full flex flex-col shrink-0 select-none z-20 bg-surface border-r border-line">
        <nav className="flex-1 py-3.5 px-3 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="px-3.5 pb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase text-muted">
                PUBLIC &amp; SEOC CORE
              </span>
            </div>
            <div className="space-y-0.5">
              {visibleCoreItems.map(renderItem)}
            </div>

            {visibleIntelligenceItems.length > 0 && (
              <div className="pt-3.5 mt-3.5 border-t border-line">
                <div className="px-3.5 pb-1.5 flex items-center justify-between">
                  <span className="text-[10.5px] font-bold tracking-wider uppercase text-muted">
                    INTELLIGENCE SUITE
                  </span>
                </div>
                <div className="space-y-1">
                  {visibleIntelligenceItems.map(renderIntelligenceItem)}
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-line space-y-0.5">
            {visibleUtilityItems.map(renderItem)}
          </div>
        </nav>

      </aside>
    );
  };

  window.DisasterComponents = window.DisasterComponents || {};
  window.DisasterComponents.Sidebar = Sidebar;
  window.Sidebar = Sidebar;
})();
