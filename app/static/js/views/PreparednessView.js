// Disaster Intelligence Platform — View 8: Preparedness & Response (Civil Defense & Resource Roster)
// Light Operational Theme: 4-Cell Verified Telemetry Strip, Searchable Shelter Capacity Table,
// Geospatial Deployment Map, and 3-Column Command Directory (Hotlines, Stockpiles, Bilingual SOPs)

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { KpiCard, MapView } = window.DisasterComponents || window;

  const PreparednessView = () => {
    const [summaryData, setSummaryData] = useState({
      verified_shelters: { count: 48, last_verified: "2026-10-24 16:00 IST", occupancy_rate: "34% Occupied", status: "Available" },
      emergency_contacts: { count: 32, last_verified: "2026-10-24 18:00 IST", hotlines_active: "100% Operational", status: "Available" },
      relief_resources: { count: 124, last_verified: "2026-10-24 15:30 IST", stock_status: "Adequate Reserves", status: "Available" },
      safety_guidance: { count: 18, last_verified: "2026-10-20 12:00 IST", languages: "English & Hindi (Bilingual)", status: "Available" }
    });

    const [activeTab, setActiveTab] = useState("shelters");

    const [sheltersList, setSheltersList] = useState([]);
    const [selectedShelterId, setSelectedShelterId] = useState("sh-001");
    const [loadingShelters, setLoadingShelters] = useState(false);

    const [shelterSearch, setShelterSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [districtFilter, setDistrictFilter] = useState("All Districts");

    const [directoryData, setDirectoryData] = useState({
      contacts: [],
      resources: [],
      guidance: []
    });

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

    const shelterMarkers = sheltersList.map(s => {
      const coords = s.coordinates || [79.052, 30.435];
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
      <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
        {/* Page Header (Prominent Heading + Description Below It) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-ink tracking-tight">
                Preparedness &amp; Response
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-ok-soft text-ok border border-ok/30 font-semibold">
                Verified Resources
              </span>
            </div>
            <p className="text-sm font-normal text-muted mt-1">
              Verified relief shelters, emergency contact numbers, response resources, and bilingual safety guidance.
            </p>
          </div>
        </div>

        {/* 4-Column Hairline KPI Strip with "Last verified" Timestamps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line rounded-[2px] overflow-hidden">
          <KpiCard
            title="Verified Relief Shelters"
            value={summaryData.verified_shelters?.count || 48}
            delta="34% occupied"
            deltaTone="ok"
            subtitle={`Verified: ${summaryData.verified_shelters?.last_verified || "2026-10-24 16:00 IST"}`}
          />
          <KpiCard
            title="Emergency Command Contacts"
            value={summaryData.emergency_contacts?.count || 32}
            delta="24x7 hotlines"
            deltaTone="ok"
            subtitle={`Verified: ${summaryData.emergency_contacts?.last_verified || "2026-10-24 18:00 IST"}`}
          />
          <KpiCard
            title="Relief Resource Stockpiles"
            value={summaryData.relief_resources?.count || 124}
            delta="Adequate reserves"
            deltaTone="neutral"
            subtitle={`Verified: ${summaryData.relief_resources?.last_verified || "2026-10-24 15:30 IST"}`}
          />
          <KpiCard
            title="Bilingual Safety SOPs"
            value={summaryData.safety_guidance?.count || 18}
            delta="EN + HI"
            deltaTone="neutral"
            subtitle={`Verified: ${summaryData.safety_guidance?.last_verified || "2026-10-20 12:00 IST"}`}
          />
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1 border-b border-line bg-surface px-3 pt-1 text-[11px] font-mono uppercase tracking-wider overflow-x-auto rounded-t-[2px]">
          {[
            { id: "shelters", label: "01 · Relief Shelters & Evacuation Centers" },
            { id: "contacts", label: "02 · Incident Command Directory" },
            { id: "resources", label: "03 · Machinery & Stockpile Inventory" },
            { id: "guidance", label: "04 · Bilingual Safety SOPs" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 border-b-2 transition-colors shrink-0 ${
                activeTab === tab.id
                  ? "border-accent text-accent font-semibold bg-surface2"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SECTION 1: Shelters Section (Split Table + Map) */}
        {(activeTab === "shelters" || activeTab === "all") && (
          <div className="space-y-4">
            {/* Filter Bar for Shelters */}
            <div className="bg-surface border border-line rounded-[2px] px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                <div className="relative flex-1 min-w-[180px] max-w-sm">
                  <input
                    type="text"
                    placeholder="Search shelters by name, tehsil, commander..."
                    value={shelterSearch}
                    onChange={(e) => setShelterSearch(e.target.value)}
                    className="w-full bg-surface2 text-ink border border-line rounded-[2px] px-2.5 py-1 focus:outline-none focus:border-accent placeholder-faint text-xs"
                  />
                </div>

                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="bg-surface2 text-ink border border-line rounded-[2px] px-2.5 py-1 focus:outline-none focus:border-accent"
                >
                  <option value="All Districts">All Districts</option>
                  <option value="Rudraprayag">Rudraprayag</option>
                  <option value="Chamoli">Chamoli</option>
                  <option value="Uttarkashi">Uttarkashi</option>
                  <option value="Tehri Garhwal">Tehri Garhwal</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-surface2 text-ink border border-line rounded-[2px] px-2.5 py-1 focus:outline-none focus:border-accent"
                >
                  <option value="All Status">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Partially Filled">Partially Filled</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              <span className="text-muted text-[11px] font-mono tabular-nums">
                SHOWING {sheltersList.length} VERIFIED SHELTERS
              </span>
            </div>

            {/* Split Grid: Shelters Table (7 cols) + Map (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Shelters Table */}
              <div className="lg:col-span-7 bg-surface border border-line rounded-[2px] overflow-hidden">
                <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-surface2 text-muted sticky top-0 border-b border-line font-mono text-[10px] uppercase tracking-wider z-10">
                      <tr>
                        <th className="py-2.5 px-3">Shelter Name &amp; Sector</th>
                        <th className="py-2.5 px-3">Capacity &amp; Occupancy</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Last Verified</th>
                        <th className="py-2.5 px-3 text-right">Focus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {loadingShelters ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-muted font-mono">
                            LOADING RELIEF SHELTERS...
                          </td>
                        </tr>
                      ) : sheltersList.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-muted font-mono">
                            NO SHELTERS MATCHING ACTIVE FILTER
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
                              className={`cursor-pointer transition-colors border-l-[3px] ${
                                isSelected ? "bg-accent-soft/50 border-l-accent" : "hover:bg-surface2 border-l-transparent"
                              }`}
                            >
                              <td className="p-3">
                                <div className="font-semibold text-ink flex items-center gap-1.5">
                                  <span>{s.name}</span>
                                  {s.distance_km && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-[2px] bg-surface2 border border-line text-muted font-mono tabular-nums">
                                      {s.distance_km} km
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-muted mt-0.5">
                                  {s.tehsil}, {s.district} &bull; {s.contact_person} (<span className="font-mono">{s.phone}</span>)
                                </div>
                                <div className="flex items-center gap-1 mt-1 flex-wrap">
                                  {(s.facilities || []).slice(0, 3).map((f, i) => (
                                    <span key={i} className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-[2px] bg-surface2 text-ink2 border border-line">
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              <td className="p-3 min-w-[140px]">
                                <div className="flex items-center justify-between text-[11px] font-mono text-ink2 mb-1 tabular-nums">
                                  <span>{s.current_occupancy} / {s.capacity}</span>
                                  <span className={pct > 80 ? "text-crit font-semibold" : (pct > 50 ? "text-warn font-semibold" : "text-ok font-semibold")}>
                                    {pct}%
                                  </span>
                                </div>
                                <div className="w-full bg-surface3 rounded-[1px] h-1.5 overflow-hidden">
                                  <div
                                    className={`h-1.5 ${
                                      pct > 80 ? "bg-crit" : (pct > 50 ? "bg-warn" : "bg-ok")
                                    }`}
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                  ></div>
                                </div>
                              </td>

                              <td className="p-3 whitespace-nowrap">
                                <span className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono uppercase font-semibold border-l-2 ${
                                  s.status === "Available"
                                    ? "bg-ok-soft text-ok border-ok"
                                    : (s.status === "Partially Filled"
                                      ? "bg-warn-soft text-warn border-warn"
                                      : "bg-crit-soft text-crit border-crit")
                                }`}>
                                  {s.status}
                                </span>
                              </td>

                              <td className="p-3 text-[10px] text-muted font-mono whitespace-nowrap tabular-nums">
                                {s.last_verified}
                              </td>

                              <td className="p-3 text-right whitespace-nowrap">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedShelterId(s.shelter_id);
                                  }}
                                  className="px-2 py-1 rounded-[2px] bg-surface2 hover:bg-surface3 text-accent border border-line font-mono text-[10px] uppercase transition-colors"
                                >
                                  Locate &rarr;
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
              <div className="lg:col-span-5 bg-surface border border-line rounded-[2px] flex flex-col">
                <div className="px-3.5 py-2.5 bg-surface2 border-b border-line flex items-center justify-between">
                  <div>
                    <div className="panel-title">Relief Center Geospatial Deployment</div>
                    <span className="text-[10px] font-mono text-muted">GREEN: AVAILABLE &bull; AMBER: PARTIAL &bull; RED: FULL</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-[2px] bg-surface border border-line text-ink2 font-mono">
                    {selectedShelter.shelter_id || 'SH-001'}
                  </span>
                </div>

                <div className="p-3.5 space-y-3">
                  <div className="h-72 rounded-[2px] overflow-hidden border border-line">
                    <MapView
                      center={mapCenter}
                      zoom={10}
                      markers={shelterMarkers}
                      height="100%"
                      showBasemapSwitcher={false}
                    />
                  </div>

                  {selectedShelter && (
                    <div className="p-3 rounded-[2px] bg-surface2 border border-line text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-ink">{selectedShelter.name}</span>
                        <span className="font-mono text-accent font-semibold tabular-nums">{selectedShelter.phone}</span>
                      </div>
                      <div className="text-ink2 text-[11px] font-mono flex flex-wrap gap-x-4 gap-y-1 tabular-nums">
                        <span>OFFICER: <strong>{selectedShelter.contact_person}</strong></span>
                        <span>DIST: <strong>{selectedShelter.distance_km} km</strong></span>
                        <span>BEDS: <strong>{selectedShelter.current_occupancy}/{selectedShelter.capacity}</strong></span>
                      </div>
                      <div className="flex items-center gap-1 pt-1 flex-wrap">
                        {(selectedShelter.facilities || []).map((f, i) => (
                          <span key={i} className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-[2px] bg-surface text-ok border border-line">
                            [OK] {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Bottom 3-Column Directory */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Emergency Command Contacts */}
          <div className="bg-surface border border-line rounded-[2px] flex flex-col">
            <div className="px-3.5 py-2.5 bg-surface2 border-b border-line flex items-center justify-between">
              <span className="panel-title">Emergency Command Hotlines (24x7)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-ok-soft text-ok border-l-2 border-ok font-semibold">
                VERIFIED
              </span>
            </div>

            <div className="p-3 space-y-2 max-h-[360px] overflow-y-auto">
              {(directoryData.contacts || []).map((c, idx) => (
                <div key={idx} className="p-2.5 rounded-[2px] bg-surface2 border border-line text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">{c.agency}</span>
                    <span className="text-[10px] font-mono text-ok font-semibold px-1.5 py-0.5 rounded-[2px] bg-ok-soft">
                      {c.availability}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted">{c.role}</div>
                  <div className="pt-1 flex items-center justify-between border-t border-line font-mono text-[11px]">
                    <a
                      href={`tel:${c.phone}`}
                      className="text-accent font-semibold hover:underline tabular-nums"
                    >
                      TEL: {c.phone}
                    </a>
                    <span className="text-[10px] text-faint">SEOC DIRECT</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Relief Resources Inventory */}
          <div className="bg-surface border border-line rounded-[2px] flex flex-col">
            <div className="px-3.5 py-2.5 bg-surface2 border-b border-line flex items-center justify-between">
              <span className="panel-title">Relief Logistics &amp; Heavy Equipment</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-accent-soft text-accent border-l-2 border-accent font-semibold">
                STOCKPILES
              </span>
            </div>

            <div className="p-3 space-y-2 max-h-[360px] overflow-y-auto">
              {(directoryData.resources || []).map((r, idx) => (
                <div key={idx} className="p-2.5 rounded-[2px] bg-surface2 border border-line text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">{r.item}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-surface text-accent border border-line font-semibold tabular-nums">
                      {r.quantity}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted">Depot: {r.location}</div>
                  <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-line">
                    <span className="text-warn font-semibold">STATUS: {r.status}</span>
                    <span className="text-faint">SDRF LOGISTICS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Multilingual Safety Guidance */}
          <div className="bg-surface border border-line rounded-[2px] flex flex-col">
            <div className="px-3.5 py-2.5 bg-surface2 border-b border-line flex items-center justify-between">
              <span className="panel-title">Bilingual Safety Protocols &amp; SOPs</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-info-soft text-info border-l-2 border-info font-semibold">
                EN / HI
              </span>
            </div>

            <div className="p-3 space-y-2 max-h-[360px] overflow-y-auto">
              {(directoryData.guidance || []).map((g, idx) => (
                <div key={idx} className="p-2.5 rounded-[2px] bg-surface2 border border-line text-xs space-y-1.5">
                  <div className="font-semibold text-ink">{g.title}</div>
                  <p className="text-[11px] text-muted leading-relaxed">{g.summary}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-line">
                    <div className="flex items-center gap-1 font-mono text-[10px]">
                      {(g.languages || []).map((lang, li) => (
                        <span key={li} className="px-1.5 py-0.5 rounded-[2px] bg-surface text-ink2 border border-line">
                          {lang}
                        </span>
                      ))}
                      {(g.formats || []).map((fmt, fi) => (
                        <span key={fi} className="px-1.5 py-0.5 rounded-[2px] bg-info-soft text-info">
                          {fmt}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => alert(`Downloading SOP: ${g.title}`)}
                      className="text-[10px] font-mono uppercase px-2 py-1 rounded-[2px] bg-accent hover:bg-accent-hover text-white font-semibold transition-colors"
                    >
                      Download SOP &rarr;
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
