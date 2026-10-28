// Disaster Intelligence Platform — View 6: Reports & Evidence (Bilingual SITREP & Provenance Inspector)
// Light Operational Theme: 5-Cell Hairline Strip, Multi-Facet Filter Bar, Master Bulletin List, Side-by-Side EN/HI Inspector

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { KpiCard, MapView, EpistemicBadge } = window.DisasterComponents || window;

  const ReportsView = () => {
    const [kpiData, setKpiData] = useState({
      total_reports: 86,
      official_reports: 24,
      news_articles: 38,
      social_media_posts: 16,
      multimedia: 8
    });

    const [reportsList, setReportsList] = useState([]);
    const [selectedReportId, setSelectedReportId] = useState(null);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [loadingList, setLoadingList] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [sourceTypeFilter, setSourceTypeFilter] = useState("All Sources");
    const [verificationFilter, setVerificationFilter] = useState("All Verification");
    const [hazardFilter, setHazardFilter] = useState("All Hazards");
    const [languageFilter, setLanguageFilter] = useState("All Languages");

    const [detailTab, setDetailTab] = useState("overview");
    const [translationMode, setTranslationMode] = useState("split");

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

    const handleClearFilters = () => {
      setSearchTerm("");
      setSourceTypeFilter("All Sources");
      setVerificationFilter("All Verification");
      setHazardFilter("All Hazards");
      setLanguageFilter("All Languages");
    };

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
      <div className="p-4 space-y-4 max-w-full">
        {/* Header */}
        <div className="bg-surface border border-line rounded-[2px] p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-ink tracking-tight">
                Reports &amp; Evidence Repository
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded-[2px] font-mono uppercase tracking-wider bg-accent-soft text-accent border-l-2 border-accent font-semibold">
                BILINGUAL EN / HI PROVENANCE
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Official USDMA/SDRF SITREPs, regional press dispatches, and crowdsourced ground telemetry with bilingual verification and perceptual hash audit trails.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded-[2px] bg-surface2 border border-line text-ink2">
              VERIFICATION PIPELINE: <strong className="text-ok">ONLINE</strong>
            </span>
          </div>
        </div>

        {/* 5-Column Hairline KPI Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-line border border-line rounded-[2px] overflow-hidden">
          <KpiCard
            title="Total Reports"
            value={kpiData.total_reports || 86}
            delta="100% indexed"
            deltaTone="neutral"
            subtitle="Processed records"
          />
          <KpiCard
            title="Official SITREPs"
            value={kpiData.official_reports || 24}
            delta="27.9% share"
            deltaTone="ok"
            subtitle="USDMA & SDRF bulletins"
          />
          <KpiCard
            title="Press Dispatches"
            value={kpiData.news_articles || 38}
            delta="44.2% share"
            deltaTone="neutral"
            subtitle="Regional & state wire"
          />
          <KpiCard
            title="Field / Social"
            value={kpiData.social_media_posts || 16}
            delta="18.6% share"
            deltaTone="warn"
            subtitle="Geotagged reports"
          />
          <KpiCard
            title="Recon Media"
            value={kpiData.multimedia || 8}
            delta="pHash verified"
            deltaTone="neutral"
            subtitle="Photos & UAV frames"
          />
        </div>

        {/* Multi-facet Filter Bar */}
        <div className="bg-surface border border-line rounded-[2px] px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <input
                type="text"
                placeholder="Search reports by title, SITREP ID, keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface2 text-ink border border-line rounded-[2px] px-2.5 py-1 focus:outline-none focus:border-accent placeholder-faint text-xs"
              />
            </div>

            <select
              value={sourceTypeFilter}
              onChange={(e) => setSourceTypeFilter(e.target.value)}
              className="bg-surface2 text-ink border border-line rounded-[2px] px-2.5 py-1 focus:outline-none focus:border-accent"
            >
              <option value="All Sources">All Sources</option>
              <option value="Official Report">Official Report</option>
              <option value="News Article">News Article</option>
              <option value="Social Media">Social Media</option>
            </select>

            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="bg-surface2 text-ink border border-line rounded-[2px] px-2.5 py-1 focus:outline-none focus:border-accent"
            >
              <option value="All Verification">All Verification</option>
              <option value="Verified">Verified</option>
              <option value="Likely True">Likely True</option>
              <option value="Unverified">Unverified</option>
            </select>

            <select
              value={hazardFilter}
              onChange={(e) => setHazardFilter(e.target.value)}
              className="bg-surface2 text-ink border border-line rounded-[2px] px-2.5 py-1 focus:outline-none focus:border-accent"
            >
              <option value="All Hazards">All Hazards</option>
              <option value="Landslide">Landslide</option>
              <option value="Flash Flood">Flash Flood</option>
              <option value="Road Blockage">Road Blockage</option>
              <option value="Infrastructure">Infrastructure</option>
            </select>

            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="bg-surface2 text-ink border border-line rounded-[2px] px-2.5 py-1 focus:outline-none focus:border-accent"
            >
              <option value="All Languages">All Languages</option>
              <option value="en">English (EN)</option>
              <option value="hi">हिंदी (HI)</option>
            </select>
          </div>

          <button
            onClick={handleClearFilters}
            className="px-2.5 py-1 rounded-[2px] bg-surface2 hover:bg-surface3 text-ink2 border border-line font-mono text-[10px] uppercase tracking-wider transition-colors"
          >
            Reset Filters
          </button>
        </div>

        {/* Main Master-Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Selectable Reports Master List (5 cols) */}
          <div className="lg:col-span-5 bg-surface border border-line rounded-[2px] overflow-hidden flex flex-col">
            <div className="px-3.5 py-2.5 bg-surface2 border-b border-line flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="panel-title">Bulletins &amp; Feeds</span>
                <span className="px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono bg-accent-soft text-accent font-semibold tabular-nums">
                  {reportsList.length}
                </span>
              </div>
              <span className="text-[10px] font-mono text-muted">SORT: LATEST</span>
            </div>

            <div className="divide-y divide-line max-h-[640px] overflow-y-auto">
              {loadingList ? (
                <div className="p-8 text-center text-muted text-xs font-mono">
                  LOADING BULLETINS...
                </div>
              ) : reportsList.length === 0 ? (
                <div className="p-8 text-center text-muted text-xs font-mono">
                  NO REPORTS MATCHED ACTIVE FILTER CRITERIA
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
                      className={`p-3 cursor-pointer transition-colors flex flex-col gap-1.5 border-l-[3px] ${
                        isSelected
                          ? "bg-accent-soft/50 border-l-accent"
                          : "bg-surface hover:bg-surface2 border-l-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <EpistemicBadge status={item.verification_status || "Verified"} />
                          <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-[2px] border ${
                            isHindi
                              ? "bg-warn-soft text-warn border-warn/30"
                              : "bg-surface2 text-ink2 border-line"
                          }`}>
                            {isHindi ? "HI · हिंदी" : "EN"}
                          </span>
                          {item.has_media && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-info-soft text-info border border-info/30">
                              MEDIA
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted font-mono tabular-nums">
                          {item.published_at ? new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "17:00 IST"}
                        </span>
                      </div>

                      <h3 className={`text-xs font-semibold leading-snug ${isSelected ? "text-accent" : "text-ink"}`}>
                        {item.title}
                      </h3>

                      <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                        {item.summary}
                      </p>

                      <div className="flex items-center justify-between text-[10px] font-mono text-muted pt-1 border-t border-line">
                        <span className="truncate max-w-[200px] text-ink2">
                          {item.publisher || item.source_type}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-[2px] bg-surface2 text-ink2 border border-line">
                          {item.hazard || "General"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-3 py-2 bg-surface2 border-t border-line text-[10px] font-mono text-muted flex items-center justify-between tabular-nums">
              <span>SHOWING {reportsList.length} ITEMS</span>
              <span>PAGE 1 OF 1</span>
            </div>
          </div>

          {/* Right Column: Master-Detail Panel (7 cols) */}
          <div className="lg:col-span-7 bg-surface border border-line rounded-[2px] overflow-hidden flex flex-col">
            {/* Detail Header */}
            <div className="p-4 bg-surface2 border-b border-line space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-[2px] bg-ink text-white">
                    {detail.report_code || "REP-SEOC-2026-10-04"}
                  </span>
                  <EpistemicBadge status={detail.verification_status || "Verified"} />
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-[2px] bg-surface text-ink2 border border-line font-semibold">
                    {detail.source_type || "Official Report"}
                  </span>
                </div>

                <button
                  onClick={() => alert(`Opening source: ${detail.publisher || "Official Source"}`)}
                  className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-[2px] bg-accent hover:bg-accent-hover text-white font-semibold transition-colors"
                >
                  Open Source Record &rarr;
                </button>
              </div>

              {/* Bilingual Titles */}
              <div>
                <h2 className="text-base font-semibold text-ink leading-tight">
                  {detail.title_en}
                </h2>
                {detail.title_hi && (
                  <h3 className="text-xs font-medium text-ink2 mt-1 leading-snug">
                    {detail.title_hi}
                  </h3>
                )}
              </div>

              {/* Publisher & Metadata Subtitle */}
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-muted pt-0.5 tabular-nums">
                <span>PUBLISHER: <strong className="text-ink2">{detail.publisher}</strong></span>
                {detail.author && <span>AUTHOR: <strong className="text-ink2">{detail.author}</strong></span>}
                <span>ISSUED: <strong className="text-ink2">{detail.published_at ? new Date(detail.published_at).toLocaleString() : "2026-10-24 17:00 IST"}</strong></span>
              </div>

              {/* Sub-Tabs Bar */}
              <div className="flex items-center gap-1 border-b border-line pt-2 -mb-4 text-[11px] font-mono uppercase tracking-wider">
                {[
                  { id: "overview", label: "Overview & Translation" },
                  { id: "checklist", label: "Provenance Checklist" },
                  { id: "media", label: "Recon Media" },
                  { id: "geo", label: "Geotag & Map" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDetailTab(t.id)}
                    className={`px-3 py-2 border-b-2 transition-colors ${
                      detailTab === t.id
                        ? "border-accent text-accent bg-surface font-semibold"
                        : "border-transparent text-muted hover:text-ink"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Detail Body */}
            <div className="p-4 space-y-4 max-h-[580px] overflow-y-auto">
              {loadingDetail ? (
                <div className="p-12 text-center text-muted text-xs font-mono">
                  FETCHING AUTHENTICATED REPORT EVIDENCE...
                </div>
              ) : (
                <>
                  {/* TAB 1: Overview & Translation */}
                  {detailTab === "overview" && (
                    <div className="space-y-4">
                      {/* Language Mode Selector */}
                      <div className="flex items-center justify-between p-2.5 rounded-[2px] bg-surface2 border border-line text-xs">
                        <span className="panel-title">Bilingual Translation Mode</span>
                        <div className="flex items-center border border-line rounded-[2px] overflow-hidden bg-surface">
                          {[
                            { id: "en", label: "EN Only" },
                            { id: "hi", label: "HI · हिंदी केवल" },
                            { id: "split", label: "Side-by-Side Split" }
                          ].map(m => (
                            <button
                              key={m.id}
                              onClick={() => setTranslationMode(m.id)}
                              className={`px-2.5 py-1 text-[11px] font-mono transition-colors ${
                                translationMode === m.id ? "bg-accent text-white font-semibold" : "text-muted hover:text-ink"
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Content Panels */}
                      <div className={`grid gap-3 ${translationMode === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                        {(translationMode === "en" || translationMode === "split") && (
                          <div className="p-3.5 rounded-[2px] bg-surface2 border border-line space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-mono uppercase pb-1.5 border-b border-line">
                              <span className="font-semibold text-accent">
                                EN // English Statement (Primary)
                              </span>
                              <span className="text-muted">ISO-639-1: EN</span>
                            </div>
                            <p className="text-xs text-ink leading-relaxed whitespace-pre-line">
                              {detail.content_en}
                            </p>
                          </div>
                        )}

                        {(translationMode === "hi" || translationMode === "split") && (
                          <div className="p-3.5 rounded-[2px] bg-surface2 border border-line space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-mono uppercase pb-1.5 border-b border-line">
                              <span className="font-semibold text-warn">
                                HI // हिंदी आधिकारिक अनुवाद (Devanagari)
                              </span>
                              <span className="text-muted">ISO-639-1: HI</span>
                            </div>
                            <p className="text-xs text-ink leading-relaxed whitespace-pre-line">
                              {detail.content_hi}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Key Extracted Points */}
                      <div className="p-3.5 rounded-[2px] bg-surface2 border border-line space-y-2">
                        <div className="panel-title">
                          Extracted Operational Facts &amp; Impact Takeaways
                        </div>
                        <ul className="space-y-1.5 text-xs text-ink">
                          {((translationMode === "hi" ? detail.key_points_hi : detail.key_points_en) || []).map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-accent font-mono font-bold shrink-0">&bull;</span>
                              <span className="leading-relaxed">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Associated Events & Telemetry Links */}
                      <div className="p-3 rounded-[2px] bg-surface2 border border-line flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-muted text-[10px] uppercase">CORROBORATING EVENTS:</span>
                          {(detail.related_events || []).map((evCode) => (
                            <span key={evCode} className="px-2 py-0.5 rounded-[2px] bg-surface text-accent border border-line text-[10px] font-semibold">
                              {evCode}
                            </span>
                          ))}
                        </div>
                        <span className="text-ok text-[11px] tabular-nums">
                          GEO: {detail.coordinates ? `${detail.coordinates[1]}°N, ${detail.coordinates[0]}°E` : "30.4850°N, 79.0620°E"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Source Reliability Checklist */}
                  {detailTab === "checklist" && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-[2px] bg-accent-soft border border-line border-l-2 border-l-accent text-ink2 text-xs">
                        <strong className="text-ink">Multi-Sensor Provenance Protocol:</strong> Every ingested SITREP undergoes perceptual hashing, cross-station temporal validation, and authority signature verification prior to indexing.
                      </div>

                      <div className="divide-y divide-line border border-line rounded-[2px]">
                        {(detail.reliability_checklist || []).map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-surface hover:bg-surface2 flex items-start gap-3"
                          >
                            <span className="px-1.5 py-0.5 rounded-[2px] bg-ok-soft text-ok border-l-2 border-ok font-mono text-[10px] font-semibold shrink-0 mt-0.5">
                              PASS
                            </span>
                            <div className="flex-1 text-xs">
                              <div className="font-semibold text-ink">
                                {item.criterion}
                              </div>
                              <p className="text-muted text-[11px] mt-0.5 font-mono">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(detail.media_gallery || [
                        { caption: "Wide-angle view of 340m rockfall on NH-107 approach", type: "image" },
                        { caption: "Pilgrim transit registration at Basukedar community hall", type: "image" }
                      ]).map((media, idx) => (
                        <div key={idx} className="rounded-[2px] overflow-hidden bg-surface2 border border-line">
                          <div className="h-40 bg-surface3 flex flex-col items-center justify-center text-muted border-b border-line p-4 relative font-mono">
                            <span className="text-xs text-ink font-semibold uppercase">
                              RECON-FRAME-0{idx + 1}.TIFF
                            </span>
                            <span className="text-[10px] text-muted mt-1 tabular-nums">
                              GEOTAG: 30.4850°N, 79.0620°E
                            </span>
                            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-[2px] bg-ok-soft text-[10px] font-mono text-ok border-l-2 border-ok font-semibold">
                              pHash VERIFIED
                            </span>
                          </div>
                          <div className="p-3 text-xs text-ink">
                            <p className="font-medium leading-snug">{media.caption}</p>
                            <span className="text-[10px] font-mono text-muted mt-1 block">INGEST: USDMA FIELD RECON</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 4: Geotag & Mini-Map */}
                  {detailTab === "geo" && (
                    <div className="space-y-3">
                      <div className="p-2.5 rounded-[2px] bg-surface2 border border-line text-xs font-mono text-ink2 flex items-center justify-between tabular-nums">
                        <span>EPICENTER SECTOR: <strong className="text-ink">BASUKEDAR (30.4850° N, 79.0620° E)</strong></span>
                        <span className="text-accent font-semibold">ELEV: 1,480 m</span>
                      </div>
                      <div className="h-64 rounded-[2px] overflow-hidden border border-line">
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
                          showBasemapSwitcher={false}
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
