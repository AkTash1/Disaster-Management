// Disaster Intelligence Multimodal Platform - EpisodeGraph Component
// Custom SVG DAG for View 5 horizontal episode relationship graph (image9.png)
// Nodes: Multi-hazard events with timestamps and epistemic status badges
// Edges: Directional causal arrows with epistemic labels (Confirmed, Inferred, Reported, Possible)

(function() {
  const React = window.React;
  const { useState } = React;

  // Default graph structure if none supplied from API
  const DEFAULT_NODES = [
    { id: "node-1", label: "Heavy Rainfall", hazard: "Heavy Rainfall", time: "Oct 08, 06:00", epistemic: "Observed", icon: "🌧" },
    { id: "node-2", label: "River Level Rise", hazard: "Flood", time: "Oct 08, 12:00", epistemic: "Observed", icon: "🌊" },
    { id: "node-3", label: "Landslide", hazard: "Landslide", time: "Oct 08, 18:30", epistemic: "Reported", icon: "⛰" },
    { id: "node-4", label: "Road Blockage", hazard: "Infrastructure", time: "Oct 09, 07:45", epistemic: "Observed", icon: "🚧" },
    { id: "node-5", label: "Flooding Risk", hazard: "Flood", time: "Oct 09, 12:00", epistemic: "Predicted", icon: "⚠️" }
  ];

  const DEFAULT_EDGES = [
    { source: "node-1", target: "node-2", label: "Confirmed", type: "confirmed", epistemic_badge: "Confirmed" },
    { source: "node-2", target: "node-3", label: "Inferred", type: "inferred", epistemic_badge: "Inferred" },
    { source: "node-3", target: "node-4", label: "Reported", type: "reported", epistemic_badge: "Reported" },
    { source: "node-4", target: "node-5", label: "Possible", type: "possible", epistemic_badge: "Possible" }
  ];

  // Link edge style lookup
  const EDGE_STYLES = {
    confirmed: { color: "#10b981", strokeDasharray: "none", labelBg: "rgba(16, 185, 129, 0.2)", labelText: "#34d399" },
    inferred: { color: "#f97316", strokeDasharray: "5,4", labelBg: "rgba(249, 115, 22, 0.2)", labelText: "#fb923c" },
    reported: { color: "#38bdf8", strokeDasharray: "4,4", labelBg: "rgba(56, 189, 248, 0.2)", labelText: "#38bdf8" },
    possible: { color: "#94a3b8", strokeDasharray: "2,3", labelBg: "rgba(148, 163, 184, 0.2)", labelText: "#cbd5e1" },
  };

  const EpisodeGraph = ({
    graph = null,
    onNodeSelect = null,
    className = ""
  }) => {
    const [selectedNodeId, setSelectedNodeId] = useState(null);

    const nodes = (graph && graph.nodes && graph.nodes.length > 0) ? graph.nodes : DEFAULT_NODES;
    const edges = (graph && graph.edges && graph.edges.length > 0) ? graph.edges : DEFAULT_EDGES;

    // Layout configuration
    const nodeWidth = 140;
    const nodeHeight = 72;
    const spacingX = 60;
    const startX = 30;
    const startY = 35;
    const totalWidth = startX * 2 + nodes.length * nodeWidth + (nodes.length - 1) * spacingX;
    const totalHeight = 150;

    // Node position map
    const nodePositions = {};
    nodes.forEach((n, idx) => {
      nodePositions[n.id] = {
        x: startX + idx * (nodeWidth + spacingX),
        y: startY,
        cx: startX + idx * (nodeWidth + spacingX) + nodeWidth / 2,
        cy: startY + nodeHeight / 2
      };
    });

    const getEdgeKey = (e) => {
      const type = (e.epistemic_badge || e.relation || e.type || e.label || "confirmed").toLowerCase();
      if (type.includes("infer")) return "inferred";
      if (type.includes("report")) return "reported";
      if (type.includes("possib")) return "possible";
      return "confirmed";
    };

    return (
      <div className={`w-full overflow-x-auto bg-slate-900/90 rounded-xl border border-slate-700/80 p-4 ${className}`}>
        {/* Top Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-slate-800 text-[11px] text-slate-300">
          <div className="font-semibold text-slate-200 uppercase tracking-wider text-[10px]">
            Episode Relationship Chain (Causal DAG)
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-emerald-500 inline-block"></span>
              <span className="text-emerald-400">Confirmed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-b border-orange-500 border-dashed inline-block"></span>
              <span className="text-orange-400">Inferred</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-b border-sky-400 border-dashed inline-block"></span>
              <span className="text-sky-400">Reported</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-b border-slate-400 border-dotted inline-block"></span>
              <span className="text-slate-400">Possible</span>
            </span>
          </div>
        </div>

        {/* SVG Canvas */}
        <div className="min-w-[850px] relative">
          <svg
            viewBox={`0 0 ${Math.max(totalWidth, 850)} ${totalHeight}`}
            className="w-full h-auto overflow-visible"
            style={{ minHeight: `${totalHeight}px` }}
          >
            {/* Arrowhead marker definitions */}
            <defs>
              {Object.keys(EDGE_STYLES).map((key) => (
                <marker
                  key={`arrow-${key}`}
                  id={`arrow-${key}`}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill={EDGE_STYLES[key].color} />
                </marker>
              ))}
            </defs>

            {/* Connecting Edges */}
            {edges.map((e, idx) => {
              const src = nodePositions[e.source];
              const tgt = nodePositions[e.target];
              if (!src || !tgt) return null;

              const edgeStyleKey = getEdgeKey(e);
              const style = EDGE_STYLES[edgeStyleKey] || EDGE_STYLES.confirmed;

              const x1 = src.x + nodeWidth;
              const y1 = src.cy;
              const x2 = tgt.x;
              const y2 = tgt.cy;
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;

              return (
                <g key={`edge-${idx}`}>
                  {/* Directional connecting line */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={style.color}
                    strokeWidth="2"
                    strokeDasharray={style.strokeDasharray}
                    markerEnd={`url(#arrow-${edgeStyleKey})`}
                  />

                  {/* Epistemic Label pill */}
                  <rect
                    x={midX - 30}
                    y={midY - 10}
                    width="60"
                    height="18"
                    rx="9"
                    fill="#0f172a"
                    stroke={style.color}
                    strokeWidth="1"
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fill={style.labelText}
                    fontSize="9"
                    fontWeight="600"
                    fontFamily="sans-serif"
                  >
                    {e.epistemic_badge || e.label || "Link"}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((n) => {
              const pos = nodePositions[n.id];
              if (!pos) return null;

              const isSelected = selectedNodeId === n.id;
              const epistemic = n.epistemic || n.epistemic_status || "Observed";
              const title = n.label || n.title || n.hazard || "Event";
              const time = n.time || n.timestamp || "Oct 08";
              const icon = n.icon || (title.includes("Rain") ? "🌧" : (title.includes("River") ? "🌊" : (title.includes("Landslide") ? "⛰" : "⚠️")));

              return (
                <g
                  key={n.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer transition-all"
                  onClick={() => {
                    setSelectedNodeId(n.id);
                    if (onNodeSelect) onNodeSelect(n);
                  }}
                >
                  {/* Node Container Card */}
                  <rect
                    width={nodeWidth}
                    height={nodeHeight}
                    rx="10"
                    fill={isSelected ? "#1e293b" : "#1e293b"}
                    stroke={isSelected ? "#38bdf8" : "#334155"}
                    strokeWidth={isSelected ? "2" : "1"}
                    filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))"
                  />

                  {/* Node Header (Icon + Title) */}
                  <text x="12" y="24" fontSize="13" fill="#ffffff">
                    {icon}
                  </text>
                  <text
                    x="30"
                    y="24"
                    fontSize="11"
                    fontWeight="700"
                    fill="#f8fafc"
                    fontFamily="sans-serif"
                  >
                    {title.length > 14 ? title.substring(0, 13) + "…" : title}
                  </text>

                  {/* Node Subtitle (Time) */}
                  <text
                    x="12"
                    y="42"
                    fontSize="9.5"
                    fill="#94a3b8"
                    fontFamily="sans-serif"
                  >
                    {time}
                  </text>

                  {/* Epistemic Badge Pill */}
                  <rect
                    x="12"
                    y="50"
                    width="65"
                    height="14"
                    rx="3"
                    fill="rgba(16, 185, 129, 0.15)"
                    stroke="#10b981"
                    strokeWidth="0.8"
                  />
                  <text
                    x="44"
                    y="60"
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="700"
                    fill="#34d399"
                    fontFamily="sans-serif"
                  >
                    {epistemic}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  window.DisasterComponents = window.DisasterComponents || {};
  window.DisasterComponents.EpisodeGraph = EpisodeGraph;
  window.EpisodeGraph = EpisodeGraph;
})();
