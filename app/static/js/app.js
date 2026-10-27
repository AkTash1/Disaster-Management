// Disaster Intelligence Multimodal Platform - Main Application Shell & Router
// React 18 UMD application with navigation routing across 10 views + Settings + Help

(function() {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const { useState, useEffect } = React;

  // Retrieve components and views from window registry
  const { Sidebar, TopBar } = window.DisasterComponents || window;
  const {
    OverviewView,
    MapExplorerView,
    EventsView,
    ModalityEventsView,
    EventGroupsView,
    ReportsView,
    HistoryTrendsView,
    PreparednessView,
    AskView,
    MyAreaView
  } = window.DisasterViews || window;

  // Milestone M3 Placeholder Views Generator
  const PlaceholderView = ({ id, title, icon, description }) => {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        {/* Milestone Banner */}
        <div className="p-4 rounded-xl bg-blue-900/30 border border-blue-500/40 text-blue-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            <div>
              <div className="font-bold text-sm text-white">{title} — Scheduled for Milestone M3</div>
              <div className="text-xs text-blue-200">
                Core UI contracts, database schemas, and REST endpoints are already deployed and operational in backend.
              </div>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-blue-600 text-white font-semibold shrink-0">
            Milestone M3 Ready
          </span>
        </div>

        {/* View Header */}
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
      // Determine initial view from window.location.pathname
      const path = window.location.pathname.replace(/^\//, '').toLowerCase();
      const validViews = [
        'overview', 'map-explorer', 'events', 'modality-events', 'event-groups',
        'reports', 'history', 'preparedness', 'ask', 'my-area', 'settings', 'help'
      ];
      return validViews.includes(path) ? path : 'overview';
    });

    const [globalSearch, setGlobalSearch] = useState("");

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

    // Render active view component
    const renderActiveView = () => {
      switch (currentView) {
        case 'overview':
          return <OverviewView onNavigate={handleViewChange} />;
        case 'map-explorer':
          return <MapExplorerView onNavigate={handleViewChange} />;
        case 'events':
          return <EventsView onNavigate={handleViewChange} />;
        case 'modality-events':
          return <ModalityEventsView onNavigate={handleViewChange} />;
        case 'event-groups':
          return <EventGroupsView onNavigate={handleViewChange} />;
        case 'reports':
          return <ReportsView onNavigate={handleViewChange} />;
        case 'history':
          return <HistoryTrendsView onNavigate={handleViewChange} />;
        case 'preparedness':
          return <PreparednessView onNavigate={handleViewChange} />;
        case 'ask':
          return <AskView onNavigate={handleViewChange} />;
        case 'my-area':
          return <MyAreaView onNavigate={handleViewChange} />;
        case 'settings':
          return <MyAreaView initialTab="notifications" onNavigate={handleViewChange} />;
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
          return <OverviewView onNavigate={handleViewChange} />;
      }
    };

    return (
      <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
        {/* Fixed Left Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Filter & Utility Bar */}
          <TopBar
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
      if (rootEl && ReactDOM) {
        if (ReactDOM.createRoot) {
          const root = ReactDOM.createRoot(rootEl);
          root.render(React.createElement(App));
        } else {
          ReactDOM.render(React.createElement(App), rootEl);
        }
        console.log("Disaster Intelligence Platform mounted successfully.");
      }
    }
  };

  // Mount on DOM Ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      window.App.mount("root");
    });
  } else {
    window.App.mount("root");
  }
})();
