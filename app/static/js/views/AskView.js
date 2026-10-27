// Disaster Intelligence Multimodal Platform - View 9: Ask (Evidence-Grounded Q&A) (image5.png)
// Specifications: Top Row of 5 Clickable Suggested Question Cards (fetched from /api/v1/ask/suggested),
// Query Input Bar with Submit Button,
// Conversational Chat Feed with Structured Epistemic Response Sections:
// Fact (Green #10b981), Inference (Orange #f59e0b), Prediction (Purple #8b5cf6),
// Inline Clickable Bracketed Citations [1]–[6] Linked to Context/Evidence Sidebar Cards,
// Key Impact Metrics Summary Row, and Context Mini-Map.

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

    // Current Query Input State
    const [queryInput, setQueryInput] = useState("");
    const [loadingQuery, setLoadingQuery] = useState(false);

    // Active Q&A Dialogue State
    const [chatHistory, setChatHistory] = useState([
      {
        sender: "user",
        text: "What caused the landslide in Rudraprayag on October 24, 2026 and what are the current road status and impacts?",
        timestamp: "Oct 24, 2026 17:15 IST"
      },
      {
        sender: "assistant",
        intro: "Synthesis based on multimodal telemetry from IMD Doppler weather stations, CWC Basukedar hydrological gauge, SDRF field SITREPs, and BRO 752 BRTF road advisories:",
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
          "IMD radar projections and MOSDAC INSAT-3DR satellite imagery predict continued moderate-to-heavy rainfall (25–40 mm/hr) through the next 18 hours [6].",
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
          { id: 5, source_title: "Disaster Intelligence AI Causal Cascade Model (Model ID: ML-CAS-2026-v2)", source_type: "AI Model", reliability: "Inferred", url: "#model-ml-cas-2026" },
          { id: 6, source_title: "IMD Dehradun Doppler Weather Radar Nowcast Bulletin", source_type: "Weather Forecast", reliability: "Predicted", url: "https://mausam.imd.gov.in/dehradun" }
        ],
        context: {
          related_district: "Rudraprayag",
          active_shelter: "Basukedar Community Relief Camp (1.8 km)",
          related_events: ["EV-LSD-2026-10-09-001", "EV-RAIN-2026-10-08-002", "EV-ROD-2026-10-09-004"]
        },
        timestamp: "Oct 24, 2026 17:15 IST"
      }
    ]);

    // Highlighted Citation ID when clicked in text
    const [highlightedCitationId, setHighlightedCitationId] = useState(null);
    const chatEndRef = useRef(null);

    // 1. Fetch Suggested Questions from API
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

    // Scroll to bottom on new message
    useEffect(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [chatHistory, loadingQuery]);

    // Handle Query Submission
    const handleSendQuery = async (queryText) => {
      const q = (queryText || queryInput).trim();
      if (!q) return;

      // Add user message to chat feed
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
          intro: `Grounded synthesis for: "${q}"`,
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

    // Helper to render text with clickable citation links [1], [2], etc.
    const renderWithCitations = (text) => {
      if (!text) return null;
      // Match bracketed citations e.g. [1], [2]
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
                // Also scroll right sidebar to evidence card
                const el = document.getElementById(`citation-card-${citeId}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded text-[11px] font-mono font-bold transition ${
                isHighlighted
                  ? "bg-blue-500 text-white ring-2 ring-blue-300"
                  : "bg-blue-900/50 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-600/40"
              }`}
            >
              [{citeId}]
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      });
    };

    // Get current active assistant response for context sidebar
    const latestAssistantMsg = [...chatHistory].reverse().find(m => m.sender === "assistant") || chatHistory[1];
    const citationsList = latestAssistantMsg?.citations || [];

    return (
      <div className="p-6 space-y-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Ask (Evidence-Grounded Q&A)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                View 9 • Epistemic RAG Assistant
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Ask natural language queries grounded strictly in sensor telemetry, official bulletins, and causal models with explicit Fact, Inference, and Prediction verification.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-lg bg-slate-850 border border-slate-700 text-slate-300 font-mono">
              Model: <strong className="text-purple-400">RAG-Multimodal-Uttarakhand</strong>
            </span>
          </div>
        </div>

        {/* Top Row: 5 Clickable Suggested Question Cards (image5.png) */}
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <span>💡</span>
            <span>Suggested Inquiries for Operational Situational Awareness:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {suggestedQuestions.map((q) => (
              <div
                key={q.id}
                onClick={() => handleSendQuery(q.question)}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition shadow flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-600/30">
                    {q.hazard}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[100px]">
                    {q.region}
                  </span>
                </div>
                <p className="text-xs text-slate-200 group-hover:text-blue-300 transition leading-snug font-medium line-clamp-3">
                  "{q.question}"
                </p>
                <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-end font-semibold group-hover:text-blue-400">
                  Ask ➔
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main 2-Column Grid: Left Chat Feed (7 cols) + Right Evidence Sidebar (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Conversational Q&A Feed (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow">
            {/* Feed Header */}
            <div className="p-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold text-white">Grounded Intelligence Session</span>
              </div>
              <span className="text-[11px] text-slate-400">Strict Citations [1]–[6]</span>
            </div>

            {/* Chat Messages Scroll Container */}
            <div className="p-4 space-y-5 max-h-[640px] overflow-y-auto">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className="space-y-3">
                  {/* User Query Bubble */}
                  {msg.sender === "user" ? (
                    <div className="flex justify-end items-start gap-2.5 pl-10">
                      <div className="bg-blue-600/25 border border-blue-500/40 rounded-2xl rounded-tr-none p-3.5 text-xs text-slate-100 shadow max-w-xl">
                        <div className="font-semibold text-blue-300 text-[11px] mb-1">
                          You (Disaster Officer AS) • {msg.timestamp}
                        </div>
                        <p className="leading-relaxed font-medium">{msg.text}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        AS
                      </div>
                    </div>
                  ) : (
                    /* AI Assistant Response Container (image5.png) */
                    <div className="flex justify-start items-start gap-3 pr-4">
                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm shrink-0 mt-1 shadow">
                        🤖
                      </div>
                      <div className="flex-1 bg-slate-850 border border-slate-750 rounded-2xl rounded-tl-none p-4 space-y-4 text-xs text-slate-200 shadow">
                        {/* Narrative Intro */}
                        <div className="text-slate-400 text-[11px] leading-relaxed pb-2 border-b border-slate-750">
                          {msg.intro}
                        </div>

                        {/* 1. FACT SECTION (Green #10b981) */}
                        {msg.facts && msg.facts.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pb-1 border-b border-emerald-500/20">
                              <span className="flex items-center gap-1.5">
                                <span>✔</span>
                                <span>Empirical Facts (Direct Sensor & Official Bulletins)</span>
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/40 text-emerald-300 font-mono">
                                Verified
                              </span>
                            </div>
                            <ul className="space-y-1.5 text-slate-200">
                              {msg.facts.map((fact, fi) => (
                                <li key={fi} className="flex items-start gap-2">
                                  <span className="text-emerald-400 font-bold shrink-0">•</span>
                                  <span className="leading-relaxed">{renderWithCitations(fact)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 2. INFERENCE SECTION (Orange #f59e0b) */}
                        {msg.inferences && msg.inferences.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-amber-400 pb-1 border-b border-amber-500/20">
                              <span className="flex items-center gap-1.5">
                                <span>⚠</span>
                                <span>Derived Inferences (Causal & Cross-Modal ML Analysis)</span>
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-900/40 text-amber-300 font-mono">
                                Inferred
                              </span>
                            </div>
                            <ul className="space-y-1.5 text-slate-200">
                              {msg.inferences.map((inf, ii) => (
                                <li key={ii} className="flex items-start gap-2">
                                  <span className="text-amber-400 font-bold shrink-0">•</span>
                                  <span className="leading-relaxed">{renderWithCitations(inf)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 3. PREDICTION SECTION (Purple #8b5cf6) */}
                        {msg.predictions && msg.predictions.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-purple-400 pb-1 border-b border-purple-500/20">
                              <span className="flex items-center gap-1.5">
                                <span>📊</span>
                                <span>Forward Predictions & Simulations (Next 24–48 Hours)</span>
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/40 text-purple-300 font-mono">
                                Predicted
                              </span>
                            </div>
                            <ul className="space-y-1.5 text-slate-200">
                              {msg.predictions.map((pred, pi) => (
                                <li key={pi} className="flex items-start gap-2">
                                  <span className="text-purple-400 font-bold shrink-0">•</span>
                                  <span className="leading-relaxed">{renderWithCitations(pred)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 4. KEY IMPACT METRICS SUMMARY (4 Cards in row) */}
                        {msg.key_impacts && msg.key_impacts.length > 0 && (
                          <div>
                            <div className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                              Key Impacts Reported So Far:
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {msg.key_impacts.map((imp, imi) => (
                                <div key={imi} className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                                  <div className="text-[10px] text-slate-400 truncate">{imp.metric}</div>
                                  <div className="text-xs font-bold text-white mt-0.5">{imp.value}</div>
                                  <div className="text-[10px] text-amber-400 mt-0.5 font-medium">{imp.status}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Citations Footer Row */}
                        <div className="pt-2 border-t border-slate-750 text-[11px] text-slate-400 flex items-center justify-between">
                          <span>Grounding Confidence: <strong className="text-emerald-400">94.8%</strong></span>
                          <span>Timestamp: {msg.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* In-Flight Query Spinner */}
              {loadingQuery && (
                <div className="flex items-center gap-3 text-xs text-slate-400 p-4">
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Synthesizing evidence across IMD radar, CWC telemetry, and satellite backscatter...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Bottom Query Input Bar */}
            <div className="p-3 bg-slate-850 border-t border-slate-800 flex items-center gap-2">
              <span className="text-slate-400 pl-2">📎</span>
              <input
                type="text"
                placeholder="Ask a question about Uttarakhand hazards, shelters, rainfall, road status..."
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendQuery();
                  }
                }}
                className="flex-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 placeholder-slate-500"
              />
              <button
                onClick={() => handleSendQuery()}
                disabled={loadingQuery || !queryInput.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow"
              >
                <span>Ask</span>
                <span>➤</span>
              </button>
            </div>
          </div>

          {/* Right Column: Context & Cited Evidence Sidebar (5 cols) (image5.png) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow space-y-4">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>📚</span>
                <span>Context & Cited Evidence Sources ({citationsList.length})</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">Interactive Grounding</span>
            </div>

            {/* Mini Map of Query Context */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Epicenter Telemetry Bounds</span>
                <span className="text-emerald-400 font-mono text-[11px]">Rudraprayag / NH-107</span>
              </div>
              <div className="h-48 rounded-xl overflow-hidden border border-slate-700/80">
                <MapView
                  center={[30.485, 79.062]}
                  zoom={10}
                  markers={[
                    { id: "cite-1", lat: 30.485, lng: 79.062, title: "Basukedar NH-107 Obstruction", hazard: "landslide", severity: "Critical" },
                    { id: "cite-2", lat: 30.435, lng: 79.052, title: "Basukedar Relief Shelter", hazard: "weather", severity: "Low" }
                  ]}
                  height="100%"
                />
              </div>
            </div>

            {/* Cited Evidence Cards List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
              {citationsList.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs">
                  No citations loaded for current response.
                </div>
              ) : (
                citationsList.map((cite) => {
                  const isHighlighted = highlightedCitationId === cite.id;
                  return (
                    <div
                      key={cite.id}
                      id={`citation-card-${cite.id}`}
                      className={`p-3 rounded-xl border transition text-xs space-y-1.5 ${
                        isHighlighted
                          ? "bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/40"
                          : "bg-slate-850 border-slate-750 hover:border-slate-650"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-[10px]">
                            {cite.id}
                          </span>
                          <span className="font-semibold text-slate-100 truncate max-w-[200px]">
                            {cite.source_type || "Evidence"}
                          </span>
                        </div>
                        <EpistemicBadge status={cite.reliability || "Verified"} />
                      </div>

                      <p className="text-[11px] text-slate-300 leading-snug font-medium">
                        {cite.source_title || cite.title || "Telemetry Record"}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-750">
                        <span className="font-mono truncate max-w-[180px]">
                          {cite.url || "Authenticated Ingestion"}
                        </span>
                        {cite.url && !cite.url.startsWith("#") ? (
                          <a
                            href={cite.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>Open</span>
                            <span>↗</span>
                          </a>
                        ) : (
                          <span className="text-purple-400">Internal Model</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Related Context Summary Footers */}
            <div className="p-3 rounded-lg bg-slate-850 border border-slate-750 text-xs space-y-1.5">
              <div className="text-slate-400 text-[11px] font-semibold">Active Operational Grounding:</div>
              <div className="text-slate-300 flex items-center justify-between">
                <span>District: <strong>Rudraprayag</strong></span>
                <span>Active Camp: <strong>Basukedar (1.8 km)</strong></span>
              </div>
              <div className="flex items-center gap-1 pt-1 flex-wrap">
                <span className="text-slate-400 text-[10px]">Corroborated:</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-blue-400 font-mono text-[10px] border border-slate-700">
                  EV-LSD-2026-10-09-001
                </span>
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-blue-400 font-mono text-[10px] border border-slate-700">
                  EV-RAIN-2026-10-08-002
                </span>
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
