// Disaster Intelligence Multimodal Platform - Main Application Shell & Router
// Light operational EOC shell routing all 10 domain views + dedicated /settings and /help views.

(function() {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const { useState, useEffect } = React;

  const getComponents = () => window.DisasterComponents || window;
  const getViews = () => window.DisasterViews || window;

  const App = () => {
    const [currentView, setCurrentView] = useState(() => {
      const path = window.location.pathname.replace(/^\//, '').toLowerCase();
      const validViews = [
        'overview', 'map-explorer', 'events', 'modality-events', 'event-groups',
        'reports', 'history', 'preparedness', 'ask', 'my-area', 'settings', 'help'
      ];
      return validViews.includes(path) ? path : 'overview';
    });

    const [globalSearch, setGlobalSearch] = useState("");
    const [selectedRegion, setSelectedRegion] = useState("Uttarakhand");

    // Re-render until Babel finishes compiling all view scripts
    const [, setTick] = useState(0);
    useEffect(() => {
      const timer = setInterval(() => {
        const c = window.DisasterComponents;
        const v = window.DisasterViews;
        if (c && c.Sidebar && c.TopBar && v && v.OverviewView && v.SettingsView && v.HelpView) {
          clearInterval(timer);
        }
        setTick((t) => t + 1);
      }, 120);
      return () => clearInterval(timer);
    }, []);

    const handleViewChange = (viewId) => {
      const cleanId = String(viewId || 'overview').replace(/^\//, '').toLowerCase();
      setCurrentView(cleanId);
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', cleanId === 'overview' ? '/' : `/${cleanId}`);
      }
    };

    useEffect(() => {
      const handlePopState = () => {
        const path = window.location.pathname.replace(/^\//, '').toLowerCase();
        setCurrentView(path || 'overview');
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleGlobalSearch = (q) => {
      setGlobalSearch(q);
      if (q && q.trim() && currentView === 'overview') {
        handleViewChange('events');
      }
    };

    const renderActiveView = () => {
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
        />

        {/* Workspace below top bar: Left Navigation Rail + Active View */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <SidebarComp
            currentView={currentView}
            onViewChange={handleViewChange}
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
