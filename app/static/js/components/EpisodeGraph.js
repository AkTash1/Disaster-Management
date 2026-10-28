// Disaster Intelligence Multimodal Platform - EpisodeGraph Component
// Horizontal causal cascade DAG with sharp 2px rectangular technical blocks,
// colored top severity/hazard bars, monospace timestamps, and clean connector tags.

(function() {
  const React = window.React;
  const { useState } = React;

  const DEFAULT_NODES = [
    { id: "node-1", code: "ME-WTH-01", label: "Extreme Rainfall", hazard: "Meteorological", time: "2026-10-08 06:00", epistemic: "Observed", bar: "#0B6E99" },
    { id: "node-2", code: "ME-HYD-04", label: "Alaknanda Surge", hazard: "Hydrological", time: "2026-10-08 12:00", epistemic: "Observed", bar: "#0B6E99" },
    { id: "node-3", code: "EV-LSD-01", label: "Slope Failure", hazard: "Geotechnical", time: "2026-10-08 18:30", epistemic: "Reported", bar: "#B54708" },
    { id: "node-4", code: "EV-INF-02", label: "NH-58 Blockage", hazard: "Infrastructure", time: "2026-10-09 07:45", epistemic: "Observed", bar: "#B42318" },
    { id: "node-5", code: "PR-FLD-09", label: "Downstream Inundation", hazard: "Forecast", time: "2026-10-09 12:00", epistemic: "Predicted", bar: "#8F6100" }
  ];

  const DEFAULT_EDGES = [
    { source: "node-1", target: "node-2", label: "CONFIRMED", type: "confirmed" },
    { source: "node-2", target: "node-3", label: "INFERRED", type: "inferred" },
    { source: "node-3", target: "node-4", label: "REPORTED", type: "reported" },
    { source: "node-4", target: "node-5", label: "POSSIBLE", type: "possible" }
  ];

  const EDGE_STYLES = {
    confirmed: { color: "#06704F", strokeDasharray: "none", bg: "#E6F4EE", text: "#06704F" },
    inferred: { color: "#4A5089", strokeDasharray: "5,3", bg: "#EEEFF7", text: "#4A5089" },
    reported: { color: "#0B6E99", strokeDasharray: "4,3", bg: "#E7F1F6", text: "#0B6E99" },
    possible: { color: "#5E6675", strokeDasharray: "2,3", bg: "#ECEEF1", text: "#3A414D" }
  };

  const EpisodeGraph = ({
    graph = null,
    onNodeSelect = null,
    className = ""
  }) => {
    const [selectedNodeId, setSelectedNodeId] = useState(null);

    const nodes = (graph && graph.nodes && graph.nodes.length > 0) ? graph.nodes : DEFAULT_NODES;
    const edges = (graph && graph.edges && graph.edges.length > 0) ? graph.edges : DEFAULT_EDGES;

    const nodeWidth = 152;
    const nodeHeight = 76;
    const spacingX = 74;
    const startX = 20;
    const startY = 30;
    const totalWidth = startX * 2 + nodes.length * nodeWidth + (nodes.length - 1) * spacingX;
    const totalHeight = 140;

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

    const getNodeBar = (n) => {
      if (n.bar) return n.bar;
      const t = String(n.label || n.hazard || "").toLowerCase();
      if (t.includes("block") || t.includes("crit")) return "#B42318";
      if (t.includes("landslide") || t.includes("slope")) return "#B54708";
      if (t.includes("predict") || t.includes("risk")) return "#8F6100";
      return "#0B6E99";
    };

    return (
      <div className={`w-full overflow-x-auto bg-surface border border-line p-3.5 ${className}`}>
        {/* Top Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 mb-2 border-b border-line font-mono text-[10px]">
          <div className="panel-title">
            CAUSAL PROPAGATION GRAPH (DAG)
          </div>
          <div className="flex items-center gap-4 text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-ok inline-block"></span>
              <span>CONFIRMED</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-b border-info border-dashed inline-block"></span>
              <span>INFERRED</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-b border-accent border-dashed inline-block"></span>
              <span>REPORTED</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-b border-muted border-dotted inline-block"></span>
              <span>POSSIBLE</span>
            </span>
          </div>
        </div>

        {/* SVG Canvas */}
        <div className="min-w-[880px] relative">
          <svg
            viewBox={`0 0 ${Math.max(totalWidth, 880)} ${totalHeight}`}
            className="w-full h-auto overflow-visible"
            style={{ minHeight: `${totalHeight}px` }}
          >
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
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill={EDGE_STYLES[key].color} />
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
              const lbl = String(e.epistemic_badge || e.label || "LINK").toUpperCase();

              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={style.color}
                    strokeWidth="1.5"
                    strokeDasharray={style.strokeDasharray}
                    markerEnd={`url(#arrow-${edgeStyleKey})`}
                  />
                  <rect
                    x={midX - 31}
                    y={midY - 9}
                    width="62"
                    height="16"
                    rx="2"
                    fill={style.bg}
                    stroke={style.color}
                    strokeWidth="0.8"
                  />
                  <text
                    x={midX}
                    y={midY + 2.5}
                    textAnchor="middle"
                    fill={style.text}
                    fontSize="8.5"
                    fontWeight="600"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {lbl}
                  </text>
                </g>
              );
            })}

            {/* Rectangular Technical Nodes */}
            {nodes.map((n, idx) => {
              const pos = nodePositions[n.id];
              if (!pos) return null;

              const isSelected = selectedNodeId === n.id;
              const epistemic = String(n.epistemic || n.epistemic_status || "Observed").toUpperCase();
              const title = n.label || n.title || n.hazard || "Event";
              const time = n.time || n.timestamp || "2026-10-08";
              const code = n.code || `STAGE-0${idx + 1}`;
              const barColor = getNodeBar(n);

              return (
                <g
                  key={n.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedNodeId(n.id);
                    if (onNodeSelect) onNodeSelect(n);
                  }}
                >
                  {/* Base block */}
                  <rect
                    width={nodeWidth}
                    height={nodeHeight}
                    rx="2"
                    fill={isSelected ? "#F7F8FA" : "#FFFFFF"}
                    stroke={isSelected ? "#0B6E99" : "#C8CDD5"}
                    strokeWidth={isSelected ? "1.5" : "1"}
                  />
                  {/* Top severity bar */}
                  <rect
                    x="0"
                    y="0"
                    width={nodeWidth}
                    height="3"
                    fill={barColor}
                  />
                  {/* Stage / ID code */}
                  <text
                    x="10"
                    y="17"
                    fontSize="9"
                    fill="#5E6675"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {code}
                  </text>
                  {/* Title */}
                  <text
                    x="10"
                    y="33"
                    fontSize="11"
                    fontWeight="600"
                    fill="#14171C"
                    fontFamily="Inter, sans-serif"
                  >
                    {title.length > 18 ? title.substring(0, 17) + "…" : title}
                  </text>
                  {/* Monospace timestamp */}
                  <text
                    x="10"
                    y="48"
                    fontSize="9.5"
                    fill="#5E6675"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {time}
                  </text>
                  {/* Epistemic tag */}
                  <rect
                    x="10"
                    y="55"
                    width="74"
                    height="14"
                    rx="1"
                    fill="#F2F3F5"
                    stroke="#C8CDD5"
                    strokeWidth="0.7"
                  />
                  <text
                    x="47"
                    y="64.5"
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="600"
                    fill="#3A414D"
                    fontFamily="JetBrains Mono, monospace"
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
