// Disaster Intelligence Multimodal Platform - Main Application Shell & Router
// Light operational EOC shell routing all 10 domain views + Role Workspace (RAC-01) + Intelligence Suite + /settings and /help views.

(function() {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const { useState, useEffect } = React;

  const getComponents = () => window.DisasterComponents || window;
  const getViews = () => window.DisasterViews || window;

  const VALID_VIEWS = [
    'overview', 'map-explorer', 'events', 'modality-events', 'event-groups',
    'reports', 'history', 'preparedness', 'ask', 'my-area', 'settings', 'help',
    'role-command', 'hazard-monitoring', 'social-intelligence', 'multimodal-intelligence'
  ];

  const ROLE_DEFAULT_VIEW = {
    'authority': 'multimodal-intelligence',
    'analyst': 'hazard-monitoring',
    'response': 'social-intelligence',
    'researcher': 'multimodal-intelligence',
    'data-admin': 'role-command',
    'citizen': 'overview'
  };

  const ROLE_ALLOWED_VIEWS = {
    'authority': [
      'overview', 'map-explorer', 'events', 'modality-events', 'event-groups',
      'reports', 'history', 'preparedness', 'ask', 'my-area', 'settings', 'help',
      'role-command', 'hazard-monitoring', 'social-intelligence', 'multimodal-intelligence'
    ],
    'analyst': [
      'overview', 'map-explorer', 'modality-events', 'history',
      'hazard-monitoring', 'multimodal-intelligence', 'help'
    ],
    'response': [
      'overview', 'map-explorer', 'events', 'preparedness',
      'social-intelligence', 'multimodal-intelligence', 'help'
    ],
    'researcher': [
      'overview', 'history', 'reports', 'ask',
      'hazard-monitoring', 'multimodal-intelligence', 'help'
    ],
    'data-admin': [
      'overview', 'modality-events',
      'role-command', 'hazard-monitoring', 'social-intelligence',
      'settings', 'help'
    ],
    'citizen': [
      'overview', 'events', 'modality-events', 'reports', 'preparedness', 'my-area', 'ask', 'help'
    ]
  };

  const ROLE_TITLES = {
    'authority': 'Disaster Management Authority (LVL 5)',
    'analyst': 'Hazard Analyst (LVL 4)',
    'response': 'Emergency Response Team (LVL 4)',
    'researcher': 'Disaster Researcher (LVL 3)',
    'data-admin': 'Data Administrator (LVL 5)',
    'citizen': 'Common Citizen · Public (LVL 1)'
  };

  const resolveViewFromLocation = () => {
    const path = window.location.pathname.replace(/^\//, '').split('?')[0].toLowerCase();
    if (VALID_VIEWS.includes(path)) return path;
    const hash = (window.location.hash || '').replace(/^#\/?/, '').split('?')[0].toLowerCase();
    if (VALID_VIEWS.includes(hash)) return hash;
    return 'overview';
  };

  const App = () => {
    const [currentView, setCurrentView] = useState(() => {
      const resolved = resolveViewFromLocation();
      return VALID_VIEWS.includes(resolved) ? resolved : 'overview';
    });

    const [activeRoleId, setActiveRoleId] = useState('authority');
    const [drillContext, setDrillContext] = useState(null);
    const [globalSearch, setGlobalSearch] = useState("");
    const [selectedRegion, setSelectedRegion] = useState("Uttarakhand");

    const handleRoleChange = (newRoleId) => {
      if (!newRoleId || typeof newRoleId !== 'string') return;
      const normalizedRole = ROLE_DEFAULT_VIEW[newRoleId] ? newRoleId : 'authority';
      const defaultView = ROLE_DEFAULT_VIEW[normalizedRole] || 'overview';
      setActiveRoleId(normalizedRole);
      setDrillContext(null);
      setCurrentView(defaultView);
      if (window.history && window.history.pushState) {
        const nextUrl = defaultView === 'overview' ? '/' : `/${defaultView}`;
        window.history.pushState(null, '', nextUrl);
      }
    };

    // Re-render until Babel finishes compiling all view scripts
    const [, setTick] = useState(0);
    useEffect(() => {
      let ticks = 0;
      const timer = setInterval(() => {
        ticks++;
        const c = window.DisasterComponents;
        const v = window.DisasterViews;
        if (
          (c && c.Sidebar && c.TopBar &&
          v && v.OverviewView && v.SettingsView && v.HelpView &&
          v.RoleWorkspaceView && v.HazardMonitoringView &&
          v.SocialMediaIntelligenceView && v.MultimodalEventView) ||
          ticks >= 50
        ) {
          clearInterval(timer);
        }
        setTick((t) => t + 1);
      }, 120);
      return () => clearInterval(timer);
    }, []);

    const handleViewChange = (viewId, contextPayload = null) => {
      let targetView = viewId;
      let payload = contextPayload;

      if (typeof viewId === 'object' && viewId !== null) {
        targetView = viewId.targetTab || viewId.view || viewId.id || 'overview';
        payload = payload || viewId.params || viewId;
      }

      const rawStr = String(targetView || 'overview').replace(/^[\/#]+/, '');
      const [cleanIdPart, queryPart] = rawStr.split('?');
      const cleanId = (cleanIdPart || 'overview').toLowerCase();

      if (!payload && queryPart) {
        try {
          const params = Object.fromEntries(new URLSearchParams(queryPart).entries());
          if (Object.keys(params).length > 0) {
            payload = params;
          }
        } catch (_) {}
      }

      if (payload !== null && payload !== undefined) {
        if (payload.roleId && typeof payload.roleId === 'string') {
          setActiveRoleId(payload.roleId);
        }
        setDrillContext({ ...payload, _ts: Date.now() });
      }

      setCurrentView(VALID_VIEWS.includes(cleanId) ? cleanId : 'overview');
      if (window.history && window.history.pushState) {
        const nextUrl = cleanId === 'overview' ? '/' : `/${cleanId}`;
        window.history.pushState(payload || null, '', nextUrl);
      }
    };

    useEffect(() => {
      const handlePopState = (e) => {
        if (e && e.state) {
          setDrillContext(e.state);
        }
        setCurrentView(resolveViewFromLocation());
      };
      window.addEventListener('popstate', handlePopState);
      window.addEventListener('hashchange', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('hashchange', handlePopState);
      };
    }, []);

    const handleGlobalSearch = (q) => {
      setGlobalSearch(q);
      if (q && q.trim() && currentView === 'overview') {
        handleViewChange('events');
      }
    };

    const renderActiveView = () => {
      const allowedViews = ROLE_ALLOWED_VIEWS[activeRoleId] || ROLE_ALLOWED_VIEWS['authority'];
      if (!allowedViews.includes(currentView)) {
        const roleTitle = ROLE_TITLES[activeRoleId] || 'Active Role';
        const defaultView = ROLE_DEFAULT_VIEW[activeRoleId] || 'overview';
        return (
          <div className="p-6 max-w-2xl mx-auto mt-10">
            <div className="bg-surface border border-crit/30 rounded-xl shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-crit-soft text-crit border border-crit/30 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-crit">
                    403 &middot; RBAC Route Guard
                  </div>
                  <h2 className="text-lg font-bold text-ink">
                    403 &middot; Access Restricted for {roleTitle}
                  </h2>
                </div>
              </div>
              <p className="text-sm text-ink2 leading-relaxed">
                <span className="font-semibold text-ink">Ashutosh Kanojia</span> is currently operating as{' '}
                <span className="font-semibold text-ink">{roleTitle}</span>. This role does not have clearance to access the{' '}
                <code className="px-1.5 py-0.5 rounded bg-surface2 border border-line text-xs font-mono text-ink">{currentView}</code>{' '}
                dashboard.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleViewChange(defaultView)}
                  className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-colors"
                >
                  Go to {defaultView.replace(/-/g, ' ')} Workspace
                </button>
              </div>
            </div>
          </div>
        );
      }

      const views = getViews();
      const ViewOverview = views.OverviewView;
      const ViewMap = views.MapExplorerView;
      const ViewEvents = views.EventsView;
      const ViewModality = views.ModalityEventsView;
      const ViewGroups = views.EventGroupsView;
      const ViewReports = views.ReportsView;
      const ViewHistory = views.HistoryTrendsView;
      const ViewPreparedness = views.PreparednessView;
      const ViewAsk = views.AskView;
      const ViewMyArea = views.MyAreaView;
      const ViewSettings = views.SettingsView;
      const ViewHelp = views.HelpView;
      const ViewRoleWorkspace = views.RoleWorkspaceView;
      const ViewHazardMonitoring = views.HazardMonitoringView;
      const ViewSocialIntelligence = views.SocialMediaIntelligenceView;
      const ViewMultimodal = views.MultimodalEventView;

      switch (currentView) {
        case 'overview':
          return ViewOverview ? <ViewOverview onNavigate={handleViewChange} /> : null;
        case 'map-explorer':
          return ViewMap ? <ViewMap onNavigate={handleViewChange} /> : null;
        case 'events':
          return ViewEvents ? <ViewEvents onNavigate={handleViewChange} initialSearch={globalSearch} /> : null;
        case 'modality-events':
          return ViewModality ? <ViewModality onNavigate={handleViewChange} /> : null;
        case 'event-groups':
          return ViewGroups ? <ViewGroups onNavigate={handleViewChange} /> : null;
        case 'reports':
          return ViewReports ? <ViewReports onNavigate={handleViewChange} /> : null;
        case 'history':
          return ViewHistory ? <ViewHistory onNavigate={handleViewChange} /> : null;
        case 'preparedness':
          return ViewPreparedness ? <ViewPreparedness onNavigate={handleViewChange} /> : null;
        case 'ask':
          return ViewAsk ? <ViewAsk onNavigate={handleViewChange} /> : null;
        case 'my-area':
          return ViewMyArea ? <ViewMyArea onNavigate={handleViewChange} /> : null;
        case 'role-command':
          return ViewRoleWorkspace
            ? (
              <ViewRoleWorkspace
                activeRoleId={activeRoleId}
                onRoleChange={handleRoleChange}
                onNavigate={handleViewChange}
                drillContext={drillContext}
              />
            )
            : null;
        case 'hazard-monitoring':
          return ViewHazardMonitoring
            ? (
              <ViewHazardMonitoring
                onNavigate={handleViewChange}
                drillContext={drillContext}
                activeRoleId={activeRoleId}
                onRoleChange={handleRoleChange}
              />
            )
            : null;
        case 'social-intelligence':
          return ViewSocialIntelligence
            ? (
              <ViewSocialIntelligence
                onNavigate={handleViewChange}
                drillContext={drillContext}
                activeRoleId={activeRoleId}
                onRoleChange={handleRoleChange}
              />
            )
            : null;
        case 'multimodal-intelligence':
          return ViewMultimodal
            ? (
              <ViewMultimodal
                onNavigate={handleViewChange}
                drillContext={drillContext}
                activeRoleId={activeRoleId}
                onRoleChange={handleRoleChange}
              />
            )
            : null;
        case 'settings':
          return ViewSettings
            ? <ViewSettings onNavigate={handleViewChange} />
            : (ViewMyArea ? <ViewMyArea initialTab="notifications" onNavigate={handleViewChange} /> : null);
        case 'help':
          return ViewHelp ? <ViewHelp onNavigate={handleViewChange} /> : null;
        default:
          return ViewOverview ? <ViewOverview onNavigate={handleViewChange} /> : null;
      }
    };

    const comps = getComponents();
    const SidebarComp = comps.Sidebar;
    const TopBarComp = comps.TopBar;

    if (!SidebarComp || !TopBarComp) {
      return (
        <div className="boot-screen">
          <div className="boot-mark">USDMA // DISASTER INTELLIGENCE</div>
          <div className="boot-line">Initializing Uttarakhand testbed modules&hellip;</div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-canvas text-ink">
        {/* Global Top Telemetry Bar */}
        <TopBarComp
          onSearch={handleGlobalSearch}
          selectedRegion={selectedRegion}
          onRegionChange={(r) => setSelectedRegion(r)}
          onNavigate={handleViewChange}
          searchPlaceholder={`Search ${currentView.replace('-', ' ')}...`}
          activeRoleId={activeRoleId}
          onRoleChange={handleRoleChange}
        />

        {/* Workspace below top bar: Left Navigation Rail + Active View */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <SidebarComp
            currentView={currentView}
            onViewChange={handleViewChange}
            activeRoleId={activeRoleId}
            onRoleChange={handleRoleChange}
          />
          <main className="flex-1 overflow-y-auto bg-canvas min-w-0">
            {renderActiveView()}
          </main>
        </div>
      </div>
    );
  };

  window.App = {
    version: "1.0.0",
    platform: "Disaster Intelligence Multimodal Platform",
    initialized: true,
    React: React,
    mount: function(targetId) {
      const rootEl = document.getElementById(targetId || "root");
      if (!rootEl || !ReactDOM) return;

      function doMount() {
        try {
          if (ReactDOM.createRoot) {
            if (!window._reactRootInstance) {
              window._reactRootInstance = ReactDOM.createRoot(rootEl);
            }
            window._reactRootInstance.render(React.createElement(App));
          } else {
            ReactDOM.render(React.createElement(App), rootEl);
          }
          window._reactMounted = true;
        } catch (err) {
          console.error("Mount error:", err);
        }
      }

      if (window.DisasterComponents?.Sidebar && window.DisasterViews?.OverviewView) {
        doMount();
      } else {
        let attempts = 0;
        const timer = setInterval(() => {
          attempts++;
          if ((window.DisasterComponents?.Sidebar && window.DisasterViews?.OverviewView) || attempts >= 30) {
            clearInterval(timer);
            doMount();
          }
        }, 100);
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      setTimeout(() => window.App.mount("root"), 50);
    });
  } else {
    setTimeout(() => window.App.mount("root"), 50);
  }
})();
