// Disaster Intelligence Multimodal Platform - TopBar Component
// Specifications: Search input, Country [🇮🇳 India], State [Uttarakhand], Date Range, Live pill, Notification count 3, Avatar AS

(function() {
  const React = window.React;
  const { useState } = React;

  const TopBar = ({
    onSearch = null,
    selectedRegion = "All Districts",
    onRegionChange = null,
    searchPlaceholder = "Search events, warnings, regions..."
  }) => {
    const [searchValue, setSearchValue] = useState("");
    const [country, setCountry] = useState("India");
    const [state, setState] = useState("Uttarakhand");
    const [dateRange, setDateRange] = useState("Sep 01, 2026 - Oct 09, 2026");
    const [isLive, setIsLive] = useState(true);

    const handleSearchSubmit = (e) => {
      e.preventDefault();
      if (onSearch) onSearch(searchValue);
    };

    return (
      <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-5 flex items-center justify-between gap-4 sticky top-0 z-10 backdrop-blur-md">
        {/* Left: Global Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-800/80 text-slate-100 placeholder-slate-400 border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </form>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-3">
          {/* Country Selector */}
          <div className="hidden lg:flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-200 gap-1.5">
            <span>🇮🇳</span>
            <span className="font-medium">India</span>
            <span className="text-[10px] text-slate-400">▾</span>
          </div>

          {/* State / Region Selector */}
          <div className="hidden sm:flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-200 gap-1.5">
            <span className="text-slate-400 text-xs">State:</span>
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                if (onRegionChange) onRegionChange(e.target.value);
              }}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="Uttarakhand" className="bg-slate-800">Uttarakhand</option>
              <option value="Himachal Pradesh" className="bg-slate-800">Himachal Pradesh</option>
              <option value="Jammu & Kashmir" className="bg-slate-800">Jammu & Kashmir</option>
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="hidden xl:flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-200 gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span className="font-medium">{dateRange}</span>
            <span className="text-[10px] text-slate-400">▾</span>
          </div>

          {/* Apply Button */}
          <button
            type="button"
            className="hidden md:inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#1976d2' }}
          >
            Apply
          </button>

          {/* Live Mode Indicator Pill */}
          <div
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
              isLive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
            <span className="font-semibold">{isLive ? 'Live Mode' : 'Paused'}</span>
            <span className="text-[9px]">▾</span>
          </div>

          {/* Notification Count Badge */}
          <div className="relative p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span
              className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: '#ef4444' }}
            >
              3
            </span>
          </div>

          {/* User Profile Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow cursor-pointer border border-blue-400/30"
            style={{ backgroundColor: '#1976d2' }}
            title="Aryan Sharma (AS)"
          >
            AS
          </div>
        </div>
      </header>
    );
  };

  window.DisasterComponents = window.DisasterComponents || {};
  window.DisasterComponents.TopBar = TopBar;
  window.TopBar = TopBar;
})();
