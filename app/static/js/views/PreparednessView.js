// Disaster Intelligence Multimodal Platform - View 8: Preparedness & Response (image2.png)
// Specifications: 4 KPI Cards with "Last verified" timestamps,
// Searchable & Filterable Shelters Table with Capacity, Occupancy % Bar & Availability Badges,
// Shelter Location Leaflet Map (MapView) with Colored Status Pins,
// Bottom 3-Column Directory for Emergency Contacts, Relief Resources, and Multilingual Safety Guidance.

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { KpiCard, MapView, StatusBadge } = window.DisasterComponents || window;

  const PreparednessView = () => {
    // 4 KPI Summary Cards with "Last verified" timestamps
    const [summaryData, setSummaryData] = useState({
      verified_shelters: { count: 48, last_verified: "2026-10-24 16:00 IST", occupancy_rate: "34% Occupied", status: "Available" },
      emergency_contacts: { count: 32, last_verified: "2026-10-24 18:00 IST", hotlines_active: "100% Operational", status: "Available" },
      relief_resources: { count: 124, last_verified: "2026-10-24 15:30 IST", stock_status: "Adequate Reserves", status: "Available" },
      safety_guidance: { count: 18, last_verified: "2026-10-20 12:00 IST", languages: "English & Hindi (Bilingual)", status: "Available" }
    });

    // Sub-Tabs
    const [activeTab, setActiveTab] = useState("shelters"); // 'shelters', 'contacts', 'resources', 'guidance', 'all'

    // Shelters State
    const [sheltersList, setSheltersList] = useState([]);
    const [selectedShelterId, setSelectedShelterId] = useState("sh-001");
    const [loadingShelters, setLoadingShelters] = useState(false);

    // Shelter Filters
    const [shelterSearch, setShelterSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [districtFilter, setDistrictFilter] = useState("All Districts");

    // Directory State (Contacts, Resources, Guidance)
    const [directoryData, setDirectoryData] = useState({
      contacts: [],
      resources: [],
      guidance: []
    });

    // 1. Fetch Preparedness Summary
    useEffect(() => {
      let isSubscribed = true;
      const fetchSummary = async () => {
        try {
          const res = await fetch("/api/v1/preparedness/summary");
          if (!res.ok) return;
          const data = await res.json();
          if (isSubscribed) {
            setSummaryData(data);
          }
        } catch (err) {
          console.error("Error loading preparedness summary:", err);
        }
      };
      fetchSummary();
      return () => { isSubscribed = false; };
    }, []);

    // 2. Fetch Shelters List
    useEffect(() => {
      let isSubscribed = true;
      setLoadingShelters(true);

      const fetchShelters = async () => {
        try {
          let url = "/api/v1/preparedness/shelters?";
          const params = [];
          if (shelterSearch.trim()) params.push(`search=${encodeURIComponent(shelterSearch.trim())}`);
          if (statusFilter !== "All Status") params.push(`status=${encodeURIComponent(statusFilter)}`);
          if (districtFilter !== "All Districts") params.push(`district=${encodeURIComponent(districtFilter)}`);

          url += params.join("&");
          const res = await fetch(url);
          if (!res.ok) return;
          const data = await res.json();
          if (isSubscribed) {
            const items = Array.isArray(data) ? data : (data.shelters || []);
            setSheltersList(items);
            if (items.length > 0 && !items.some(s => s.shelter_id === selectedShelterId)) {
              setSelectedShelterId(items[0].shelter_id);
            }
            setLoadingShelters(false);
          }
        } catch (err) {
          console.error("Error loading shelters:", err);
          if (isSubscribed) setLoadingShelters(false);
        }
      };
      fetchShelters();
      return () => { isSubscribed = false; };
    }, [shelterSearch, statusFilter, districtFilter]);

    // 3. Fetch Directory (Contacts, Resources, Guidance)
    useEffect(() => {
      let isSubscribed = true;
      const fetchDirectory = async () => {
        try {
          const res = await fetch("/api/v1/preparedness/directory?category=all");
          if (!res.ok) return;
          const data = await res.json();
          if (isSubscribed) {
            setDirectoryData({
              contacts: data.contacts || [],
              resources: data.resources || [],
              guidance: data.guidance || []
            });
          }
        } catch (err) {
          console.error("Error loading preparedness directory:", err);
        }
      };
      fetchDirectory();
      return () => { isSubscribed = false; };
    }, []);

    // Selected Shelter Object
    const selectedShelter = sheltersList.find(s => s.shelter_id === selectedShelterId) || sheltersList[0] || {
      shelter_id: "sh-001",
      name: "Basukedar Community Relief Centre",
      district: "Rudraprayag",
      tehsil: "Jakholi",
      capacity: 250,
      current_occupancy: 84,
      status: "Available",
      distance_km: 1.8,
      facilities: ["Medical Station", "Emergency Food Rations", "Backup Generator", "Sanitation Blocks"],
      contact_person: "Inspector B. S. Negi",
      phone: "+91-1364-233100",
      coordinates: [79.052, 30.435],
      last_verified: "2026-10-24 16:00 IST"
    };

    // Format Map Markers for Shelters
    const shelterMarkers = sheltersList.map(s => {
      const coords = s.coordinates || [79.052, 30.435];
      const isSelected = s.shelter_id === selectedShelterId;
      return {
        id: s.shelter_id,
        lat: coords[1],
        lng: coords[0],
        title: s.name,
        hazard: s.status === "Available" ? "weather" : (s.status === "Partially Filled" ? "landslide" : "earthquake"),
        severity: s.status === "Available" ? "Low" : (s.status === "Partially Filled" ? "Moderate" : "Critical"),
        subtitle: `Occupancy: ${s.current_occupancy}/${s.capacity} (${Math.round((s.current_occupancy / s.capacity) * 100)}%) • ${s.status}`
      };
    });

    const mapCenter = selectedShelter.coordinates
      ? [selectedShelter.coordinates[1], selectedShelter.coordinates[0]]
      : [30.435, 79.052];

    return (
      <div className="p-6 space-y-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Preparedness & Response</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                View 8 • Certified Civil Defense Roster
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Verified directory of emergency relief shelters, incident commanders, heavy equipment stockpiles, and bilingual safety protocols.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Verified State Response System
            </span>
          </div>
        </div>

        {/* 4 KPI Cards with "Last verified" Timestamps (image2.png) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Verified Relief Shelters"
            value={summaryData.verified_shelters?.count || 48}
            trend="Active"
            subtitle={`Last verified: ${summaryData.verified_shelters?.last_verified || "Oct 24, 2026"}`}
            icon="shield"
            iconColor="#10b981"
          />
          <KpiCard
            title="Emergency Command Contacts"
            value={summaryData.emergency_contacts?.count || 32}
            trend="24x7"
            subtitle={`Last verified: ${summaryData.emergency_contacts?.last_verified || "Oct 24, 2026"}`}
            icon="pulse"
            iconColor="#38bdf8"
          />
          <KpiCard
            title="Relief Resource Stockpiles"
            value={summaryData.relief_resources?.count || 124}
            trend="Dispatched"
            subtitle={`Last verified: ${summaryData.relief_resources?.last_verified || "Oct 24, 2026"}`}
            icon="waves"
            iconColor="#f59e0b"
          />
          <KpiCard
            title="Multilingual Safety Guidance"
            value={summaryData.safety_guidance?.count || 18}
            subtitle={`Last verified: ${summaryData.safety_guidance?.last_verified || "Oct 20, 2026"}`}
            icon="activity"
            iconColor="#a855f7"
          />
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs overflow-x-auto">
          {[
            { id: "shelters", label: "Relief Shelters & Evacuation Centers", icon: "🏠" },
            { id: "contacts", label: "Incident Command Directory", icon: "📞" },
            { id: "resources", label: "Machinery & Stockpile Inventory", icon: "📦" },
            { id: "guidance", label: "Multilingual Safety Guidelines", icon: "📑" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg font-semibold transition shrink-0 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* SECTION 1: Shelters Section (Split Table + Map) */}
        {(activeTab === "shelters" || activeTab === "all") && (
          <div className="space-y-4">
            {/* Filter Bar for Shelters */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[180px] max-w-sm">
                  <span className="absolute left-2.5 top-2 text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search shelters by name, tehsil, contact..."
                    value={shelterSearch}
                    onChange={(e) => setShelterSearch(e.target.value)}
                    className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 placeholder-slate-500 text-xs"
                  />
                </div>

                {/* District Filter */}
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="All Districts">All Districts</option>
                  <option value="Rudraprayag">Rudraprayag</option>
                  <option value="Chamoli">Chamoli</option>
                  <option value="Uttarkashi">Uttarkashi</option>
                  <option value="Tehri Garhwal">Tehri Garhwal</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="All Status">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Partially Filled">Partially Filled</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              <span className="text-slate-400 text-[11px]">
                Showing {sheltersList.length} verified shelters
              </span>
            </div>

            {/* Split Grid: Shelters Table (7 cols) + Map (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Shelters Table */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
                <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-850 text-slate-400 sticky top-0 border-b border-slate-800 font-semibold z-10">
                      <tr>
                        <th className="p-3">Shelter Name & Location</th>
                        <th className="p-3">Capacity & Occupancy</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Last Verified</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {loadingShelters ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-500">
                            Loading relief shelters...
                          </td>
                        </tr>
                      ) : sheltersList.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-400">
                            No shelters found matching current search/filter.
                          </td>
                        </tr>
                      ) : (
                        sheltersList.map(s => {
                          const isSelected = s.shelter_id === selectedShelterId;
                          const pct = Math.round((s.current_occupancy / s.capacity) * 100);

                          return (
                            <tr
                              key={s.shelter_id}
                              onClick={() => setSelectedShelterId(s.shelter_id)}
                              className={`cursor-pointer transition ${
                                isSelected ? "bg-slate-800/90 border-l-4 border-l-blue-500" : "hover:bg-slate-800/40 border-l-4 border-l-transparent"
                              }`}
                            >
                              <td className="p-3">
                                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                                  <span>{s.name}</span>
                                  {s.distance_km && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                      {s.distance_km} km
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  {s.tehsil}, {s.district} • Contact: {s.contact_person} ({s.phone})
                                </div>
                                {/* Facilities Pills */}
                                <div className="flex items-center gap-1 mt-1 flex-wrap">
                                  {(s.facilities || []).slice(0, 3).map((f, i) => (
                                    <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              <td className="p-3 min-w-[140px]">
                                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-1">
                                  <span>{s.current_occupancy} / {s.capacity}</span>
                                  <span className={pct > 80 ? "text-red-400" : (pct > 50 ? "text-amber-400" : "text-emerald-400")}>
                                    {pct}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-1.5 rounded-full ${
                                      pct > 80 ? "bg-red-500" : (pct > 50 ? "bg-amber-500" : "bg-emerald-500")
                                    }`}
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                  ></div>
                                </div>
                              </td>

                              <td className="p-3 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                                  s.status === "Available"
                                    ? "bg-emerald-900/30 text-emerald-300 border-emerald-600/40"
                                    : (s.status === "Partially Filled"
                                      ? "bg-amber-900/30 text-amber-300 border-amber-600/40"
                                      : "bg-red-900/30 text-red-300 border-red-600/40")
                                }`}>
                                  ● {s.status}
                                </span>
                              </td>

                              <td className="p-3 text-[11px] text-slate-400 font-mono whitespace-nowrap">
                                {s.last_verified}
                              </td>

                              <td className="p-3 text-right whitespace-nowrap">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedShelterId(s.shelter_id);
                                  }}
                                  className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 font-medium text-[11px] transition"
                                >
                                  View Map 📍
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Shelter Interactive Leaflet Map (5 cols) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>📍</span>
                      <span>Relief Center Geospatial Deployment</span>
                    </h3>
                    <span className="text-[11px] text-slate-400">Green: Available • Amber: Partial • Red: Full</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {selectedShelter.name ? selectedShelter.name.slice(0, 18) + '...' : 'Selected'}
                  </span>
                </div>

                <div className="h-80 rounded-xl overflow-hidden border border-slate-700/80">
                  <MapView
                    center={mapCenter}
                    zoom={10}
                    markers={shelterMarkers}
                    height="100%"
                  />
                </div>

                {/* Selected Shelter Highlight Card */}
                {selectedShelter && (
                  <div className="p-3 rounded-xl bg-slate-850 border border-slate-700 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{selectedShelter.name}</span>
                      <span className="font-mono text-emerald-400">{selectedShelter.phone}</span>
                    </div>
                    <div className="text-slate-300 text-[11px] flex flex-wrap gap-x-4 gap-y-1">
                      <span><strong>Officer:</strong> {selectedShelter.contact_person}</span>
                      <span><strong>Distance:</strong> {selectedShelter.distance_km} km</span>
                      <span><strong>Capacity:</strong> {selectedShelter.current_occupancy} / {selectedShelter.capacity} beds</span>
                    </div>
                    <div className="flex items-center gap-1 pt-1 flex-wrap">
                      {(selectedShelter.facilities || []).map((f, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-600/30">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Bottom 3-Column Directory (image2.png) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column 1: Emergency Command Contacts */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>📞</span>
                <span>Emergency Contacts (24x7)</span>
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/30 text-emerald-300 border border-emerald-600/30 font-semibold">
                Verified Hotlines
              </span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto">
              {(directoryData.contacts || []).map((c, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{c.agency}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.2 rounded bg-emerald-900/30">
                      {c.availability}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{c.role}</div>
                  <div className="pt-1 flex items-center justify-between">
                    <a
                      href={`tel:${c.phone}`}
                      className="text-blue-400 font-mono font-bold hover:underline flex items-center gap-1"
                    >
                      <span>📞</span> {c.phone}
                    </a>
                    <span className="text-[10px] text-slate-500">SEOC Direct</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Relief Resources Inventory */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>📦</span>
                <span>Relief Resources & Heavy Equipment</span>
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-600/30 font-semibold">
                Stockpiles Active
              </span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto">
              {(directoryData.resources || []).map((r, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{r.item}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700 font-semibold">
                      {r.quantity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Depot: {r.location}</div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-amber-400 font-medium">Status: {r.status}</span>
                    <span className="text-[10px] text-slate-500">SDRF Inventory</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Multilingual Safety Guidance */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>📑</span>
                <span>Bilingual Safety Guidance & SOPs</span>
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/30 text-purple-300 border border-purple-600/30 font-semibold">
                English & हिंदी
              </span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto">
              {(directoryData.guidance || []).map((g, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 text-xs space-y-1.5">
                  <div className="font-bold text-slate-100">{g.title}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{g.summary}</p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      {(g.languages || []).map((lang, li) => (
                        <span key={li} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {lang}
                        </span>
                      ))}
                      {(g.formats || []).map((fmt, fi) => (
                        <span key={fi} className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/30 text-purple-300 border border-purple-600/30 font-mono">
                          {fmt}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => alert(`Downloading SOP: ${g.title}`)}
                      className="text-[11px] px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
                    >
                      Download 📥
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  window.DisasterViews = window.DisasterViews || {};
  window.DisasterViews.PreparednessView = PreparednessView;
  window.PreparednessView = PreparednessView;
})();
