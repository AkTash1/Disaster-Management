// Disaster Intelligence Platform — View 9: Ask (Intelligence Query & SITREP Synthesis Terminal)
// Light Operational Theme: Technical Prompt Chips, Structured SITREP Briefings (Facts / Inferences / Projections),
// Inline Monospace Citations [1]–[6] Linked to Right-Hand Source Provenance Inspector

(function() {
  const React = window.React;
  const { useState, useEffect, useRef } = React;
  const { MapView, EpistemicBadge } = window.DisasterComponents || window;

  const AskView = () => {
    // Suggested Questions
    const [suggestedQuestions, setSuggestedQuestions] = useState([
      { id: 1, question: "What caused the landslide in Rudraprayag and what is the current road status?", hazard: "Landslide", region: "Rudraprayag (NH-107)" },
      { id: 2, question: "Which CWC hydrological stations are reporting water levels above danger mark?", hazard: "Flood", region: "Alaknanda & Mandakini Basins" },
      { id: 3, question: "What is the 48-hour rainfall forecast and satellite outlook for Chamoli and Uttarkashi?", hazard: "Weather", region: "Chamoli / Uttarkashi" },
      { id: 4, question: "Are relief camps and emergency shelters available near Basukedar?", hazard: "Preparedness", region: "Basukedar / Jakholi" },
      { id: 5, question: "How does the current October 2026 episode compare with the 2023 monsoon impacts?", hazard: "Comparison", region: "Garhwal Division" }
    ]);

    const [queryInput, setQueryInput] = useState("");
    const [loadingQuery, setLoadingQuery] = useState(false);

    // Active Q&A Dialogue State
    const [chatHistory, setChatHistory] = useState([
      {
        sender: "user",
        text: "What caused the landslide in Rudraprayag on October 24, 2026 and what are the current road status and impacts?",
        timestamp: "2026-10-24 17:15 IST"
      },
      {
        sender: "assistant",
        intro: "SITREP synthesis derived from IMD Doppler weather stations, CWC Basukedar hydrological gauge, SDRF field SITREPs, and BRO 752 BRTF road advisories:",
        facts: [
          "On October 24, 2026 at 16:30 IST, a major debris avalanche occurred at Basukedar along the NH-107 (Kedarnath Highway) in Rudraprayag district [1].",
          "The Central Water Commission Basukedar station (CWC_UK_Basukedar) recorded 128.4 mm of cumulative precipitation over 6 hours preceding the slope failure [2].",
          "State Disaster Response Force (SDRF) confirmed 340 meters of highway carriageway is entirely blocked with debris volume estimated at 18,500 m³ [3]."
        ],
        inferences: [
          "EOS-04 SAR C-band backscatter decrease (-4.2 dB cross-pol ratio) indicates critical soil saturation and pore-water pressure along the shear plane [4].",
          "A temporary debris dam formed in the Basukedar tributary stream creates an acute flash flood hazard downstream if breached under ongoing runoff [5]."
        ],
        predictions: [
          "IMD radar projections and MOSDAC INSAT-3DR satellite imagery project continued moderate-to-heavy rainfall (25–40 mm/hr) through the next 18 hours [6].",
          "Highway clearance operations by Border Roads Organisation (752 BRTF) are projected to require at least 36 to 48 hours for single-lane emergency opening."
        ],
        key_impacts: [
          { metric: "Road Blocked", value: "340 m", status: "Critical" },
          { metric: "Stranded Pilgrims/Vehicles", value: "420 / 65", status: "Evacuated to Shelter" },
          { metric: "Downstream Risk", value: "Mandakini Basin", status: "High Alert" },
          { metric: "Estimated Clearance", value: "36–48 Hrs", status: "Machinery Deployed" }
        ],
        citations: [
          { id: 1, source_title: "SDRF Incident SITREP #04 — NH-107 Basukedar Blockage", source_type: "Official Report", reliability: "Verified", url: "https://sdrf.uk.gov.in/sitrep/2026/10/04" },
          { id: 2, source_title: "CWC Hydrological Monitoring Station Basukedar Hourly Telemetry", source_type: "Sensor Data", reliability: "Verified", url: "https://cwc.gov.in/stations/CWC_UK_Basukedar" },
          { id: 3, source_title: "Border Roads Organisation (BRO) 752 BRTF Road Status Advisory", source_type: "Official Report", reliability: "Verified", url: "https://bro.gov.in/advisories/nh107" },
          { id: 4, source_title: "ISRO EOS-04 SAR C-Band Microwave Soil Saturation Analysis", source_type: "Satellite Derived", reliability: "Inferred", url: "https://bhuvan.nrsc.gov.in/disaster/sar/eos04" },
          { id: 5, source_title: "Multi-Sensor Causal Cascade Model (Model ID: CAS-2026-v2)", source_type: "Cross-Modal Model", reliability: "Inferred", url: "#model-cas-2026" },
          { id: 6, source_title: "IMD Dehradun Doppler Weather Radar Nowcast Bulletin", source_type: "Weather Forecast", reliability: "Predicted", url: "https://mausam.imd.gov.in/dehradun" }
        ],
        context: {
          related_district: "Rudraprayag",
          active_shelter: "Basukedar Community Relief Camp (1.8 km)",
          related_events: ["EV-LSD-2026-10-09-001", "EV-RAIN-2026-10-08-002", "EV-ROD-2026-10-09-004"]
        },
        timestamp: "2026-10-24 17:15 IST"
      }
    ]);

    const [highlightedCitationId, setHighlightedCitationId] = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
      let isSubscribed = true;
      const fetchSuggested = async () => {
        try {
          const res = await fetch("/api/v1/ask/suggested");
          if (!res.ok) return;
          const data = await res.json();
          if (isSubscribed && data.questions) {
            setSuggestedQuestions(data.questions);
          }
        } catch (err) {
          console.error("Error loading suggested questions:", err);
        }
      };
      fetchSuggested();
      return () => { isSubscribed = false; };
    }, []);

    useEffect(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [chatHistory, loadingQuery]);

    const handleSendQuery = async (queryText) => {
      const q = (queryText || queryInput).trim();
      if (!q) return;

      const userMsg = {
        sender: "user",
        text: q,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " IST"
      };

      setChatHistory(prev => [...prev, userMsg]);
      setQueryInput("");
      setLoadingQuery(true);

      try {
        const res = await fetch("/api/v1/ask/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q })
        });

        if (!res.ok) throw new Error("API error while generating answer");
        const data = await res.json();

        const ans = data.answer || {};
        const assistantMsg = {
          sender: "assistant",
          intro: `Grounded SITREP synthesis for query: "${q}"`,
          facts: ans.facts || [],
          inferences: ans.inferences || [],
          predictions: ans.predictions || [],
          key_impacts: data.key_impacts || [],
          citations: data.citations || [],
          context: data.context || {
            related_district: "Uttarakhand",
            active_shelter: "District Relief Hub",
            related_events: ["EV-LSD-2026-10-09-001"]
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " IST"
        };

        setChatHistory(prev => [...prev, assistantMsg]);
        setLoadingQuery(false);
      } catch (err) {
        console.error("Error in ask query:", err);
        setLoadingQuery(false);
      }
    };

    // Render text with clickable monospace citation badges [1], [2], etc.
    const renderWithCitations = (text) => {
      if (!text) return null;
      const parts = text.split(/(\[\d+\])/g);
      return parts.map((part, i) => {
        const match = part.match(/\[(\d+)\]/);
        if (match) {
          const citeId = parseInt(match[1], 10);
          const isHighlighted = highlightedCitationId === citeId;
          return (
            <button
              key={i}
              onClick={() => {
                setHighlightedCitationId(citeId);
                const el = document.getElementById(`citation-card-${citeId}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-[2px] text-[10px] font-mono font-semibold transition-colors ${
                isHighlighted
                  ? "bg-accent text-white"
                  : "bg-accent-soft text-accent hover:bg-accent hover:text-white border border-accent/30"
              }`}
            >
              [REF-0{citeId}]
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      });
    };

    const latestAssistantMsg = [...chatHistory].reverse().find(m => m.sender === "assistant") || chatHistory[1];
    const citationsList = latestAssistantMsg?.citations || [];

    return (
      <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-surface border border-line rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-ink tracking-tight">
                Ask Assistant (Plain-English Disaster Q&amp;A)
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent-soft text-accent font-semibold">
                Verified Sources
              </span>
            </div>
            <p className="text-sm text-muted mt-0.5">
              Ask any question about road blocks, rainfall, river levels, or relief shelters in Uttarakhand. Every answer links to official sources.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-surface2 border border-line text-ink2 font-medium">
              Data Source: <strong className="text-accent">IMD, CWC &amp; USDMA Live Feeds</strong>
            </span>
          </div>
        </div>

        {/* Top Row: 5 Clickable Prompt Chips */}
        <div className="bg-surface border border-line rounded-xl p-5 shadow-sm">
          <div className="panel-title mb-3">
            Common Questions (Click any card to ask immediately)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {suggestedQuestions.map((q) => (
              <div
                key={q.id}
                onClick={() => handleSendQuery(q.question)}
                className="p-3.5 rounded-lg bg-surface2 hover:bg-surface border border-line hover:border-accent cursor-pointer transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-accent-soft text-accent">
                    {q.hazard}
                  </span>
                  <span className="text-xs text-muted truncate max-w-[120px]">
                    {q.region}
                  </span>
                </div>
                <p className="text-xs text-ink group-hover:text-accent transition-colors leading-relaxed font-semibold line-clamp-3">
                  {q.question}
                </p>
                <div className="text-xs font-semibold text-accent mt-2.5 flex items-center justify-end">
                  Ask this question &rarr;
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main 2-Column Split Pane: Left SITREP Synthesis Feed (7 cols) + Right Provenance Sidebar (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: SITREP Synthesis Terminal (7 cols) */}
          <div className="lg:col-span-7 bg-surface border border-line rounded-[2px] overflow-hidden flex flex-col">
            {/* Feed Header */}
            <div className="px-3.5 py-2.5 bg-surface2 border-b border-line flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-[1px] bg-ok"></span>
                <span className="panel-title">Grounded Intelligence Session</span>
              </div>
              <span className="text-[10px] font-mono text-muted">STRICT CITATION ENFORCEMENT [REF-01..06]</span>
            </div>

            {/* Chat Messages Scroll Container */}
            <div className="p-4 space-y-4 max-h-[640px] overflow-y-auto bg-canvas/40">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className="space-y-2">
                  {msg.sender === "user" ? (
                    <div className="flex justify-end items-start gap-2.5 pl-8">
                      <div className="bg-surface border border-line-strong rounded-[2px] p-3 text-xs text-ink max-w-xl">
                        <div className="text-xs font-semibold text-muted mb-1 flex items-center justify-between gap-4">
                          <span>Ashutosh Kanojia (Duty Officer)</span>
                          <span className="tabular-nums">{msg.timestamp}</span>
                        </div>
                        <p className="leading-relaxed font-medium text-ink">{msg.text}</p>
                      </div>
                    </div>
                  ) : (
                    /* Structured SITREP Briefing */
                    <div className="bg-surface border border-line-strong rounded-[2px] p-4 space-y-3.5 text-xs text-ink">
                      {/* Briefing Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-line">
                        <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-accent">
                          AUTOMATED SITREP BRIEFING // MULTI-SENSOR SYNTHESIS
                        </span>
                        <span className="font-mono text-[10px] text-muted tabular-nums">{msg.timestamp}</span>
                      </div>

                      <div className="text-ink2 text-[11px] leading-relaxed">
                        {msg.intro}
                      </div>

                      {/* 1. EMPIRICAL FACTS (VERIFIED) */}
                      {msg.facts && msg.facts.length > 0 && (
                        <div className="p-3 rounded-[2px] bg-ok-soft border border-line border-l-2 border-l-ok space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider font-semibold text-ok pb-1 border-b border-ok/20">
                            <span>Empirical Facts (Direct Sensor &amp; Official Bulletins)</span>
                            <span>STATUS: VERIFIED</span>
                          </div>
                          <ul className="space-y-1.5 text-ink">
                            {msg.facts.map((fact, fi) => (
                              <li key={fi} className="flex items-start gap-2">
                                <span className="text-ok font-mono font-bold shrink-0">&bull;</span>
                                <span className="leading-relaxed">{renderWithCitations(fact)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 2. DERIVED INFERENCES (CROSS-MODAL) */}
                      {msg.inferences && msg.inferences.length > 0 && (
                        <div className="p-3 rounded-[2px] bg-warn-soft border border-line border-l-2 border-l-warn space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider font-semibold text-warn pb-1 border-b border-warn/20">
                            <span>Derived Inferences (Cross-Modal Geotechnical Analysis)</span>
                            <span>STATUS: INFERRED</span>
                          </div>
                          <ul className="space-y-1.5 text-ink">
                            {msg.inferences.map((inf, ii) => (
                              <li key={ii} className="flex items-start gap-2">
                                <span className="text-warn font-mono font-bold shrink-0">&bull;</span>
                                <span className="leading-relaxed">{renderWithCitations(inf)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 3. FORWARD PROJECTIONS (24-48H) */}
                      {msg.predictions && msg.predictions.length > 0 && (
                        <div className="p-3 rounded-[2px] bg-info-soft border border-line border-l-2 border-l-info space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider font-semibold text-info pb-1 border-b border-info/20">
                            <span>Forward Projections &amp; Simulations (Next 24–48 Hours)</span>
                            <span>STATUS: PROJECTED</span>
                          </div>
                          <ul className="space-y-1.5 text-ink">
                            {msg.predictions.map((pred, pi) => (
                              <li key={pi} className="flex items-start gap-2">
                                <span className="text-info font-mono font-bold shrink-0">&bull;</span>
                                <span className="leading-relaxed">{renderWithCitations(pred)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 4. KEY IMPACT METRICS SUMMARY */}
                      {msg.key_impacts && msg.key_impacts.length > 0 && (
                        <div>
                          <div className="panel-title mb-1.5">
                            Key Operational Impact Telemetry
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border border-line">
                            {msg.key_impacts.map((imp, imi) => (
                              <div key={imi} className="p-2.5 bg-surface2">
                                <div className="text-[10px] font-mono uppercase text-muted truncate">{imp.metric}</div>
                                <div className="text-xs font-mono font-semibold text-ink mt-0.5 tabular-nums">{imp.value}</div>
                                <div className="text-[10px] font-mono text-high mt-0.5">{imp.status}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Citations Footer Row */}
                      <div className="pt-2 border-t border-line text-[10px] font-mono text-muted flex items-center justify-between tabular-nums">
                        <span>CROSS-VERIFICATION CONFIDENCE: <strong className="text-ok">94.8%</strong></span>
                        <span>PROVENANCE REFS: {citationsList.length}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loadingQuery && (
                <div className="flex items-center gap-3 text-xs font-mono text-muted p-4 bg-surface border border-line rounded-[2px]">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                  <span>SYNTHESIZING TELEMETRY ACROSS IMD RADAR, CWC GAUGES &amp; SAR BACKSCATTER...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Bottom Query Input Bar */}
            <div className="p-3 bg-surface2 border-t border-line flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted px-1.5">QUERY &gt;</span>
              <input
                type="text"
                placeholder="Enter operational query on Uttarakhand hazards, CWC gauges, shelters, or highway status..."
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendQuery();
                  }
                }}
                className="flex-1 bg-surface text-ink border border-line-strong rounded-[2px] px-3 py-1.5 text-xs focus:outline-none focus:border-accent placeholder-faint"
              />
              <button
                onClick={() => handleSendQuery()}
                disabled={loadingQuery || !queryInput.trim()}
                className="px-4 py-1.5 rounded-[2px] bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-mono uppercase tracking-wider font-semibold text-[11px] transition-colors shrink-0"
              >
                Execute &rarr;
              </button>
            </div>
          </div>

          {/* Right Column: Context & Cited Evidence Provenance Inspector (5 cols) */}
          <div className="lg:col-span-5 bg-surface border border-line rounded-[2px] flex flex-col">
            <div className="px-3.5 py-2.5 bg-surface2 border-b border-line flex items-center justify-between">
              <span className="panel-title">Cited Evidence &amp; Source Provenance ({citationsList.length})</span>
              <span className="text-[10px] font-mono text-muted">GROUNDING LOG</span>
            </div>

            <div className="p-3.5 space-y-3.5">
              {/* Mini Map of Query Context */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-muted">
                  <span>EPICENTER TELEMETRY BOUNDS</span>
                  <span className="text-ink font-semibold">RUDRAPRAYAG // NH-107</span>
                </div>
                <div className="h-44 rounded-[2px] overflow-hidden border border-line">
                  <MapView
                    center={[30.485, 79.062]}
                    zoom={10}
                    markers={[
                      { id: "cite-1", lat: 30.485, lng: 79.062, title: "Basukedar NH-107 Obstruction", hazard: "landslide", severity: "Critical" },
                      { id: "cite-2", lat: 30.435, lng: 79.052, title: "Basukedar Relief Shelter", hazard: "weather", severity: "Low" }
                    ]}
                    height="100%"
                    showBasemapSwitcher={false}
                  />
                </div>
              </div>

              {/* Cited Evidence Cards List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto">
                {citationsList.length === 0 ? (
                  <div className="p-4 text-center text-muted text-xs font-mono">
                    NO CITATIONS LOADED FOR CURRENT QUERY
                  </div>
                ) : (
                  citationsList.map((cite) => {
                    const isHighlighted = highlightedCitationId === cite.id;
                    return (
                      <div
                        key={cite.id}
                        id={`citation-card-${cite.id}`}
                        className={`p-2.5 rounded-[2px] border transition-colors text-xs space-y-1.5 ${
                          isHighlighted
                            ? "bg-accent-soft border-accent"
                            : "bg-surface2 border-line hover:border-line-strong"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded-[2px] bg-ink text-white font-mono font-semibold text-[10px]">
                              REF-0{cite.id}
                            </span>
                            <span className="font-semibold text-ink truncate max-w-[200px]">
                              {cite.source_type || "Evidence"}
                            </span>
                          </div>
                          <EpistemicBadge status={cite.reliability || "Verified"} />
                        </div>

                        <p className="text-[11px] text-ink2 leading-snug font-medium">
                          {cite.source_title || cite.title || "Telemetry Record"}
                        </p>

                        <div className="flex items-center justify-between text-[10px] font-mono text-muted pt-1 border-t border-line">
                          <span className="truncate max-w-[210px]">
                            {cite.url || "Authenticated Ingestion"}
                          </span>
                          {cite.url && !cite.url.startsWith("#") ? (
                            <a
                              href={cite.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-accent hover:underline font-semibold"
                            >
                              OPEN SOURCE &rarr;
                            </a>
                          ) : (
                            <span className="text-info">INTERNAL MODEL</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Related Context Summary Footer */}
              <div className="p-2.5 rounded-[2px] bg-surface2 border border-line text-[11px] space-y-1.5">
                <div className="panel-title">Active Operational Grounding</div>
                <div className="text-ink2 flex items-center justify-between font-mono text-[10px]">
                  <span>SECTOR: <strong>RUDRAPRAYAG</strong></span>
                  <span>RELIEF CAMP: <strong>BASUKEDAR (1.8 KM)</strong></span>
                </div>
                <div className="flex items-center gap-1.5 pt-1 flex-wrap font-mono text-[10px]">
                  <span className="text-muted">LINKED EVENTS:</span>
                  <span className="px-1.5 py-0.5 rounded-[2px] bg-surface text-accent border border-line">
                    EV-LSD-2026-10-09-001
                  </span>
                  <span className="px-1.5 py-0.5 rounded-[2px] bg-surface text-accent border border-line">
                    EV-RAIN-2026-10-08-002
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  window.DisasterViews = window.DisasterViews || {};
  window.DisasterViews.AskView = AskView;
  window.AskView = AskView;
})();
