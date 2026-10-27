// Disaster Intelligence Multimodal Platform - Main Application Shell & Router
// React 18 UMD application with navigation routing across 10 views + Settings + Help

(function() {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const { useState, useEffect } = React;

  // Retrieve components and views dynamically from window registry
  const getComponents = () => window.DisasterComponents || window;
  const getViews = () => window.DisasterViews || window;

  // Placeholder View for Help & About
  const PlaceholderView = ({ id, title, icon, description }) => {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shrink-0">
              {icon}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <span className="text-slate-400 block mb-1">Backend Schema:</span>
              <span className="font-semibold text-emerald-400">Operational (38 Tables)</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <span className="text-slate-400 block mb-1">REST API Status:</span>
              <span className="font-semibold text-blue-400">Loaded under /api/v1/{id}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <span className="text-slate-400 block mb-1">Telemetry Integration:</span>
              <span className="font-semibold text-purple-400">Active Live Feed</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const App = () => {
    // Current route/view state
    const [currentView, setCurrentView] = useState(() => {
      const path = window.location.pathname.replace(/^\//, '').toLowerCase();
      const validViews = [
        'overview', 'map-explorer', 'events', 'modality-events', 'event-groups',
        'reports', 'history', 'preparedness', 'ask', 'my-area', 'settings', 'help'
      ];
      return validViews.includes(path) ? path : 'overview';
    });

    const [globalSearch, setGlobalSearch] = useState("");

    // Babel compiles the component scripts asynchronously; re-render until they have registered
    const [, setTick] = useState(0);
    useEffect(() => {
      const timer = setInterval(() => {
        const c = window.DisasterComponents;
        if (c && c.Sidebar && c.TopBar && window.DisasterViews && window.DisasterViews.OverviewView) {
          clearInterval(timer);
        }
        setTick((t) => t + 1);
      }, 150);
      return () => clearInterval(timer);
    }, []);

    // Sync browser URL with view navigation
    const handleViewChange = (viewId) => {
      setCurrentView(viewId);
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', `/${viewId}`);
      }
    };

    // Handle back/forward navigation in browser
    useEffect(() => {
      const handlePopState = () => {
        const path = window.location.pathname.replace(/^\//, '').toLowerCase();
        if (path) setCurrentView(path);
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Render active view component safely
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

      switch (currentView) {
        case 'overview':
          return ViewOverview ? <ViewOverview onNavigate={handleViewChange} /> : null;
        case 'map-explorer':
          return ViewMap ? <ViewMap onNavigate={handleViewChange} /> : null;
        case 'events':
          return ViewEvents ? <ViewEvents onNavigate={handleViewChange} /> : null;
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
          return ViewMyArea ? <ViewMyArea initialTab="notifications" onNavigate={handleViewChange} /> : null;
        case 'help':
          return (
            <PlaceholderView
              id="help"
              title="Help & About"
              icon="❓"
              description="System documentation, multimodal epistemic taxonomy reference, user manual, and developer API references (/docs)."
            />
          );
        default:
          return ViewOverview ? <ViewOverview onNavigate={handleViewChange} /> : null;
      }
    };

    const comps = getComponents();
    const SidebarComp = comps.Sidebar;
    const TopBarComp = comps.TopBar;

    if (!SidebarComp || !TopBarComp) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-slate-300 gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-sm font-semibold tracking-wide text-slate-200">Disaster Intelligence — Multimodal Platform</div>
          <div className="text-xs text-slate-500">Loading components...</div>
        </div>
      );
    }

    return (
      <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
        {/* Fixed Left Navigation Sidebar */}
        <SidebarComp
          currentView={currentView}
          onViewChange={handleViewChange}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Filter & Utility Bar */}
          <TopBarComp
            onSearch={(q) => setGlobalSearch(q)}
            searchPlaceholder={`Search ${currentView.replace('-', ' ')}...`}
          />

          {/* Dynamic Scrollable View Canvas */}
          <main className="flex-1 overflow-y-auto bg-slate-950">
            {renderActiveView()}
          </main>
        </div>
      </div>
    );
  };

  // Attach App to window namespace
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
          console.log("Disaster Intelligence Platform mounted successfully.");
        } catch (err) {
          console.error("Mount error:", err);
        }
      }

      // Check if critical components are ready; if Babel is still compiling, wait briefly
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

  // Mount on DOM Ready or immediately
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      setTimeout(() => window.App.mount("root"), 50);
    });
  } else {
    setTimeout(() => window.App.mount("root"), 50);
  }
})();
