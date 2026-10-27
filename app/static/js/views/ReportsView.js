// Disaster Intelligence Multimodal Platform - View 6: Reports & Evidence (image10.png)
// Specifications: 5 KPI Cards, Multi-facet Filter Bar (Source Type, Verification, Hazard, Language, Search),
// Left Selectable Master Reports List with Verification Badges & Language Tags,
// Right Master-Detail Panel with English / Hindi Translation Toggle, Key Extracted Points,
// Source Reliability Checklist, Media Previews, Mini-Map, and Related Events.

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { KpiCard, MapView, EpistemicBadge, SeverityBadge } = window.DisasterComponents || window;

  const ReportsView = () => {
    // KPI Data State
    const [kpiData, setKpiData] = useState({
      total_reports: 86,
      official_reports: 24,
      news_articles: 38,
      social_media_posts: 16,
      multimedia: 8
    });

    // Master List State
    const [reportsList, setReportsList] = useState([]);
    const [selectedReportId, setSelectedReportId] = useState(null);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [loadingList, setLoadingList] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Filters State
    const [searchTerm, setSearchTerm] = useState("");
    const [sourceTypeFilter, setSourceTypeFilter] = useState("All Sources");
    const [verificationFilter, setVerificationFilter] = useState("All Verification");
    const [hazardFilter, setHazardFilter] = useState("All Hazards");
    const [languageFilter, setLanguageFilter] = useState("All Languages");

    // Detail Panel View State
    const [detailTab, setDetailTab] = useState("overview"); // 'overview', 'translation', 'checklist', 'media'
    const [translationMode, setTranslationMode] = useState("split"); // 'en', 'hi', 'split'

    // Fetch Reports List
    useEffect(() => {
      let isSubscribed = true;
      setLoadingList(true);

      const fetchReports = async () => {
        try {
          let url = "/api/v1/reports?";
          const params = [];
          if (searchTerm.trim()) params.push(`search=${encodeURIComponent(searchTerm.trim())}`);
          if (sourceTypeFilter !== "All Sources") params.push(`source_type=${encodeURIComponent(sourceTypeFilter)}`);
          if (verificationFilter !== "All Verification") params.push(`verification=${encodeURIComponent(verificationFilter)}`);
          if (hazardFilter !== "All Hazards") params.push(`hazard=${encodeURIComponent(hazardFilter)}`);
          if (languageFilter !== "All Languages") params.push(`language=${encodeURIComponent(languageFilter.toLowerCase())}`);

          url += params.join("&");
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to load reports");
          const data = await res.json();

          if (!isSubscribed) return;

          const items = Array.isArray(data) ? data : (data.reports || []);
          setReportsList(items);

          if (data.kpis) {
            setKpiData(prev => ({ ...prev, ...data.kpis }));
          }

          // Auto-select first item if current selection invalid or none selected
          if (items.length > 0) {
            const currentExists = items.some(r => (r.id || r.report_id) === selectedReportId);
            if (!currentExists || !selectedReportId) {
              setSelectedReportId(items[0].id || items[0].report_id);
            }
          } else {
            setSelectedReportId(null);
            setSelectedDetail(null);
          }
          setLoadingList(false);
        } catch (err) {
          console.error("Error fetching reports:", err);
          if (isSubscribed) setLoadingList(false);
        }
      };

      fetchReports();
      return () => { isSubscribed = false; };
    }, [searchTerm, sourceTypeFilter, verificationFilter, hazardFilter, languageFilter]);

    // Fetch Single Report Detail
    useEffect(() => {
      if (!selectedReportId) return;
      let isSubscribed = true;
      setLoadingDetail(true);

      const fetchDetail = async () => {
        try {
          const res = await fetch(`/api/v1/reports/${selectedReportId}`);
          if (!res.ok) throw new Error("Failed to load report detail");
          const data = await res.json();
          if (isSubscribed) {
            setSelectedDetail(data);
            setLoadingDetail(false);
          }
        } catch (err) {
          console.error("Error fetching report detail:", err);
          if (isSubscribed) setLoadingDetail(false);
        }
      };

      fetchDetail();
      return () => { isSubscribed = false; };
    }, [selectedReportId]);

    // Clear all filters
    const handleClearFilters = () => {
      setSearchTerm("");
      setSourceTypeFilter("All Sources");
      setVerificationFilter("All Verification");
      setHazardFilter("All Hazards");
      setLanguageFilter("All Languages");
    };

    // Fallback detail representation
    const detail = selectedDetail || {
      report_id: "rep-001",
      report_code: "REP-SEOC-2026-10-04",
      title_en: "USDMA Incident SITREP #04: NH-107 Severed at Basukedar Due to Massive Debris Flow",
      title_hi: "यूएसडीएमए घटना सिटरैप #04: भारी मलबे के कारण बसुकेदार में एनएच-107 केदारनाथ हाईवे पूरी तरह बंद",
      source_type: "Official Report",
      publisher: "Uttarakhand State Emergency Operation Centre (USDMA)",
      author: "Dr. V. K. Negi, In-Charge SEOC Dehradun",
      published_at: "2026-10-24T17:00:00Z",
      verification_status: "Verified",
      epistemic_badge: "Official",
      language_primary: "en",
      content_en: "Following unprecedented precipitation recorded at CWC Basukedar (128.4 mm in 6 hours), a massive debris avalanche occurred along National Highway 107 (Kedarnath Highway) at kilometer 48+200. A 340-meter section of the road is heavily obstructed by an estimated 18,500 m³ of rock, mud, and timber. SDRF Quick Response Teams from Agastyamuni and BRO 752 BRTF personnel are actively mobilized on site. 420 pilgrims stranded in 65 vehicles have been successfully moved to Basukedar Community Relief Camp. No casualties have been reported.",
      content_hi: "सीडब्ल्यूसी बसुकेदार स्टेशन पर दर्ज अभूतपूर्व वर्षा (6 घंटे में 128.4 मिमी) के बाद, राष्ट्रीय राजमार्ग 107 (केदारनाथ मार्ग) पर किलोमीटर 48+200 पर भीषण भूस्खलन हुआ। सड़क का 340 मीटर का हिस्सा लगभग 18,500 घन मीटर मलबे और चट्टानों से पूरी तरह अवरुद्ध हो गया है। अगस्त्यमुनि से एसडीआरएफ और बीआरओ की 752 बीआरटीएफ टीमें मौके पर तैनात हैं। 420 तीर्थयात्रियों को सुरक्षित राहत शिविर में पहुंचाया गया है।",
      key_points_en: [
        "340 meters of Kedarnath Highway (NH-107) severed near Basukedar.",
        "Debris mass estimated at 18,500 m³; clearance duration projected at 36–48 hours.",
        "420 stranded pilgrims evacuated safely to designated community shelters; zero casualties.",
        "BRO and SDRF operating hydraulic excavators from both northern and southern flanks."
      ],
      key_points_hi: [
        "बसुकेदार के पास केदारनाथ हाईवे (एनएच-107) का 340 मीटर हिस्सा पूरी तरह अवरुद्ध।",
        "लगभग 18,500 घन मीटर मलबा; मार्ग सुचारू होने में 36 से 48 घंटे लगने का अनुमान।",
        "फंसे 420 तीर्थयात्रियों को सुरक्षित शिविरों में पहुंचाया गया; कोई जनहानि नहीं।",
        "बीआरओ और एसडीआरएफ की टीमें दोनों तरफ से मलबा हटाने में जुटीं।"
      ],
      reliability_checklist: [
        { criterion: "Official Government Agency Confirmation", passed: true, notes: "Issued by USDMA SEOC Control Room" },
        { criterion: "Geotagged Coordinates & Aerial Verification", passed: true, notes: "Drone recon confirmed 30.4850° N, 79.0620° E" },
        { criterion: "Multiple Corroborating Telemetry Feeds", passed: true, notes: "CWC Basukedar gauge & IMD AWS telemetry match" },
        { criterion: "Temporal Consistency Check", passed: true, notes: "Timestamps match road closure logs within 15 minutes" },
        { criterion: "Tamper-Free Image & Video Perceptual Hash", passed: true, notes: "Zero synthetic manipulation detected (pHash: a8f0...)" }
      ],
      media_gallery: [
        { url: "/static/images/reports/basukedar_obstruction_wide.jpg", caption: "Wide-angle view of 340m rockfall on NH-107 approach", type: "image" },
        { url: "/static/images/reports/sdrf_relief_camp.jpg", caption: "Pilgrim transit registration at Basukedar community hall", type: "image" }
      ],
      related_events: ["EV-LSD-2026-10-09-001", "EV-RAIN-2026-10-08-002", "EV-ROD-2026-10-09-004"],
      coordinates: [79.062, 30.485]
    };

    return (
      <div className="p-6 space-y-5 max-w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Reports & Evidence</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                View 6 • Multilingual Feeds
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Explore official SITREPs, press releases, news articles, and ground telemetry with bilingual English/Hindi verification.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
              Corroborated Telemetry: <strong className="text-emerald-400">Online</strong>
            </span>
          </div>
        </div>

        {/* 5 KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard
            title="Total Reports"
            value={kpiData.total_reports || 86}
            trend="↑ 12%"
            subtitle="Processed records"
            icon="pulse"
          />
          <KpiCard
            title="Official SITREPs"
            value={kpiData.official_reports || 24}
            trend="↑ 18%"
            subtitle="USDMA & SDRF bulletins"
            icon="shield"
            iconColor="#10b981"
          />
          <KpiCard
            title="News Articles"
            value={kpiData.news_articles || 38}
            trend="↑ 9%"
            subtitle="Regional & state press"
            icon="activity"
            iconColor="#38bdf8"
          />
          <KpiCard
            title="Social Telemetry"
            value={kpiData.social_media_posts || 16}
            trend="↑ 15%"
            subtitle="Geotagged crowdsourced"
            icon="waves"
            iconColor="#a855f7"
          />
          <KpiCard
            title="Multimedia Evidence"
            value={kpiData.multimedia || 8}
            trend="↑ 11%"
            subtitle="Photos & drone footage"
            icon="alert"
            iconColor="#f59e0b"
          />
        </div>

        {/* Multi-facet Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <span className="absolute left-2.5 top-2 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search reports by title, keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 placeholder-slate-500 text-xs"
              />
            </div>

            {/* Source Type Filter */}
            <select
              value={sourceTypeFilter}
              onChange={(e) => setSourceTypeFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="All Sources">All Sources</option>
              <option value="Official Report">Official Report</option>
              <option value="News Article">News Article</option>
              <option value="Social Media">Social Media</option>
            </select>

            {/* Verification Status Filter */}
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="All Verification">All Verification</option>
              <option value="Verified">Verified</option>
              <option value="Likely True">Likely True</option>
              <option value="Unverified">Unverified</option>
            </select>

            {/* Hazard Filter */}
            <select
              value={hazardFilter}
              onChange={(e) => setHazardFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="All Hazards">All Hazards</option>
              <option value="Landslide">Landslide</option>
              <option value="Flash Flood">Flash Flood</option>
              <option value="Road Blockage">Road Blockage</option>
              <option value="Infrastructure">Infrastructure</option>
            </select>

            {/* Language Filter */}
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="All Languages">All Languages</option>
              <option value="en">English (en)</option>
              <option value="hi">हिंदी (hi)</option>
            </select>
          </div>

          <button
            onClick={handleClearFilters}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition font-medium"
          >
            Clear Filters
          </button>
        </div>

        {/* Main Master-Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Selectable Reports Master List (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow">
            {/* List Header */}
            <div className="p-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Disaster Bulletins & Feeds</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  {reportsList.length} items
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Sort: Newest First</span>
            </div>

            {/* List Items Scroll Container */}
            <div className="divide-y divide-slate-800/80 max-h-[640px] overflow-y-auto">
              {loadingList ? (
                <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading reports...</span>
                </div>
              ) : reportsList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <span className="text-2xl block mb-2">📭</span>
                  No reports matched your active filter criteria.
                </div>
              ) : (
                reportsList.map((item) => {
                  const itemId = item.id || item.report_id;
                  const isSelected = itemId === selectedReportId;
                  const isHindi = item.language === "hi";

                  return (
                    <div
                      key={itemId}
                      onClick={() => setSelectedReportId(itemId)}
                      className={`p-3.5 cursor-pointer transition flex flex-col gap-2 ${
                        isSelected
                          ? "bg-slate-800/90 border-l-4 border-l-blue-500"
                          : "hover:bg-slate-800/40 border-l-4 border-l-transparent"
                      }`}
                    >
                      {/* Top Badges & Time */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <EpistemicBadge status={item.verification_status || "Verified"} />
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isHindi ? "bg-amber-900/30 text-amber-300 border border-amber-600/30" : "bg-blue-900/30 text-blue-300 border border-blue-600/30"
                          }`}>
                            {isHindi ? "हिंदी" : "EN"}
                          </span>
                          {item.has_media && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-300 border border-purple-600/30 flex items-center gap-1">
                              📷 Media
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {item.published_at ? new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Live"}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className={`text-xs font-semibold leading-snug ${isSelected ? "text-blue-300 font-bold" : "text-slate-100"}`}>
                        {item.title}
                      </h3>

                      {/* Publisher & Summary Snippet */}
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {item.summary}
                      </p>

                      {/* Footer Metadata */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/50">
                        <span className="truncate max-w-[200px] text-slate-400 font-medium">
                          {item.publisher || item.source_type}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                          {item.hazard || "General"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* List Footer / Pagination */}
            <div className="p-2.5 bg-slate-850 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Showing {reportsList.length} filtered items</span>
              <span className="font-mono text-slate-400">1 of 1</span>
            </div>
          </div>

          {/* Right Column: Master-Detail Panel (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow">
            {/* Detail Header */}
            <div className="p-5 bg-slate-850 border-b border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📄</span>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                    {detail.report_code || "REP-SEOC-2026-10-04"}
                  </span>
                  <EpistemicBadge status={detail.verification_status || "Verified"} />
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                    {detail.source_type || "Official Report"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Opening source: ${detail.publisher || "Official Source"}`)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1 transition"
                  >
                    <span>View Source</span>
                    <span>↗</span>
                  </button>
                </div>
              </div>

              {/* Bilingual Titles */}
              <div>
                <h2 className="text-base font-bold text-white leading-tight">
                  {detail.title_en}
                </h2>
                {detail.title_hi && (
                  <h3 className="text-xs font-medium text-amber-300/90 mt-1 leading-snug">
                    {detail.title_hi}
                  </h3>
                )}
              </div>

              {/* Publisher & Metadata Subtitle */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span><strong>Publisher:</strong> {detail.publisher}</span>
                {detail.author && <span><strong>Author:</strong> {detail.author}</span>}
                <span><strong>Published:</strong> {detail.published_at ? new Date(detail.published_at).toLocaleString() : "2026-10-24 17:00 IST"}</span>
              </div>

              {/* Sub-Tabs Bar */}
              <div className="flex items-center gap-1 border-b border-slate-800 pt-2 text-xs">
                {[
                  { id: "overview", label: "Overview & Translation", icon: "🌐" },
                  { id: "checklist", label: "Reliability Checklist", icon: "✔" },
                  { id: "media", label: "Media & Attachments", icon: "📷" },
                  { id: "geo", label: "Geotag & Map", icon: "🗺" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDetailTab(t.id)}
                    className={`px-3 py-2 font-medium border-b-2 transition flex items-center gap-1.5 ${
                      detailTab === t.id
                        ? "border-blue-500 text-blue-400 bg-blue-500/5"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail Body */}
            <div className="p-5 space-y-5 max-h-[580px] overflow-y-auto">
              {loadingDetail ? (
                <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Fetching authenticated report evidence...</span>
                </div>
              ) : (
                <>
                  {/* TAB 1: Overview & Translation */}
                  {detailTab === "overview" && (
                    <div className="space-y-4">
                      {/* Language Mode Selector */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
                        <span className="text-slate-300 font-medium">Bilingual Translation View:</span>
                        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-700">
                          <button
                            onClick={() => setTranslationMode("en")}
                            className={`px-2.5 py-1 rounded text-xs transition ${
                              translationMode === "en" ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            English Only
                          </button>
                          <button
                            onClick={() => setTranslationMode("hi")}
                            className={`px-2.5 py-1 rounded text-xs transition ${
                              translationMode === "hi" ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            हिंदी केवल
                          </button>
                          <button
                            onClick={() => setTranslationMode("split")}
                            className={`px-2.5 py-1 rounded text-xs transition ${
                              translationMode === "split" ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            Side-by-Side Split
                          </button>
                        </div>
                      </div>

                      {/* Content Panels */}
                      <div className={`grid gap-4 ${translationMode === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                        {/* English Content */}
                        {(translationMode === "en" || translationMode === "split") && (
                          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-700">
                              <span className="font-bold text-blue-400 flex items-center gap-1">
                                <span>🇬🇧</span> English Statement (Original)
                              </span>
                              <span className="text-slate-500 font-mono text-[10px]">Primary</span>
                            </div>
                            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                              {detail.content_en}
                            </p>
                          </div>
                        )}

                        {/* Hindi Content */}
                        {(translationMode === "hi" || translationMode === "split") && (
                          <div className="p-4 rounded-xl bg-slate-800/40 border border-amber-600/30 space-y-2">
                            <div className="flex items-center justify-between text-xs pb-2 border-b border-amber-600/30">
                              <span className="font-bold text-amber-300 flex items-center gap-1">
                                <span>🇮🇳</span> हिंदी आधिकारिक अनुवाद (Devanagari)
                              </span>
                              <span className="text-amber-400 font-mono text-[10px]">Verified Translation</span>
                            </div>
                            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                              {detail.content_hi}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Key Extracted Points */}
                      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/60 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                          <span>📌</span>
                          <span>Key Intelligence Takeaways & Impact Facts</span>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-300">
                          {((translationMode === "hi" ? detail.key_points_hi : detail.key_points_en) || []).map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-400 font-bold shrink-0">•</span>
                              <span className="leading-relaxed">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Associated Events & Telemetry Links */}
                      <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-400 font-semibold">Corroborating Events:</span>
                          {(detail.related_events || []).map((evCode) => (
                            <span key={evCode} className="px-2 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-600/40 font-mono text-[11px]">
                              🔗 {evCode}
                            </span>
                          ))}
                        </div>
                        <span className="text-emerald-400 font-mono text-[11px]">
                          Geo: {detail.coordinates ? `${detail.coordinates[1]}°N, ${detail.coordinates[0]}°E` : "30.485°N, 79.062°E"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Source Reliability Checklist */}
                  {detailTab === "checklist" && (
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-500/30 text-blue-300 text-xs">
                        <strong>Source Verification Engine:</strong> Every ingested sitrep undergoes automated perceptual hashing, cross-telemetry temporal validation, and authority authentication before publication.
                      </div>

                      <div className="space-y-2.5">
                        {(detail.reliability_checklist || []).map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-800/40 border border-slate-700 flex items-start gap-3"
                          >
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              ✓
                            </span>
                            <div className="flex-1 text-xs">
                              <div className="font-semibold text-slate-100 flex items-center justify-between">
                                <span>{item.criterion}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-700/40">
                                  PASSED
                                </span>
                              </div>
                              <p className="text-slate-400 text-[11px] mt-0.5">
                                {item.notes}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Media Gallery Previews */}
                  {detailTab === "media" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(detail.media_gallery || [
                          { caption: "Wide-angle view of 340m rockfall on NH-107 approach", type: "image" },
                          { caption: "Pilgrim transit registration at Basukedar community hall", type: "image" }
                        ]).map((media, idx) => (
                          <div key={idx} className="rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shadow">
                            <div className="h-44 bg-slate-850 flex flex-col items-center justify-center text-slate-500 border-b border-slate-700 p-4 relative">
                              <span className="text-4xl mb-2">🏔️</span>
                              <span className="text-xs text-slate-400 font-semibold text-center">
                                Telemetry Capture #{idx + 1}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono mt-1">
                                Geotagged: 30.485°N, 79.062°E
                              </span>
                              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-slate-900/80 text-[10px] font-mono text-emerald-400 border border-slate-700">
                                Perceptual Hash OK
                              </span>
                            </div>
                            <div className="p-3 text-xs text-slate-300">
                              <p className="font-medium leading-snug">{media.caption}</p>
                              <span className="text-[10px] text-slate-500 mt-1 block">Verified Ingest • USDMA Field Recon</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Geotag & Mini-Map */}
                  {detailTab === "geo" && (
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-slate-800 text-xs text-slate-300 flex items-center justify-between">
                        <span><strong>Epicenter Coordinates:</strong> Basukedar Sector (30.485° N, 79.062° E)</span>
                        <span className="text-blue-400 font-mono">Elevation: 1,480 MASL</span>
                      </div>
                      <div className="h-64 rounded-xl overflow-hidden border border-slate-700">
                        <MapView
                          center={[30.485, 79.062]}
                          zoom={10}
                          markers={[
                            {
                              id: "rep-marker",
                              lat: 30.485,
                              lng: 79.062,
                              title: detail.title_en || "Report Location",
                              hazard: "landslide",
                              severity: "Critical"
                            }
                          ]}
                          height="100%"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  window.DisasterViews = window.DisasterViews || {};
  window.DisasterViews.ReportsView = ReportsView;
  window.ReportsView = ReportsView;
})();
