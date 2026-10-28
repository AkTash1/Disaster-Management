// Disaster Intelligence Multimodal Platform - Help & Reference Manual (/help)
// Interactive documentation view with working tab navigation: System Architecture,
// Source Provenance & Verification Standards, 38-Table Schema Inspector, and REST API Reference.

(function() {
  const React = window.React;
  const { useState, useEffect } = React;
  const { EpistemicBadge, SeverityBadge, StatusBadge } = window.DisasterComponents || window;

  const HelpView = ({ onNavigate = null }) => {
    const [activeSection, setActiveSection] = useState("provenance");
    const [tablesMeta, setTablesMeta] = useState(null);

    useEffect(() => {
      fetch('/api/v1/tables')
        .then(r => r.ok ? r.json() : null)
        .then(d => setTablesMeta(d))
        .catch(() => {});
    }, []);

    const SECTIONS = [
      { id: "provenance", label: "01 · Source Provenance & Severity Ladder" },
      { id: "fusion", label: "02 · 4-Tier Fusion Pipeline" },
      { id: "schema", label: "03 · 38-Table Relational Schema" },
      { id: "api", label: "04 · REST API Endpoints" }
    ];

    return (
      <div className="p-4 space-y-4">
        <div className="bg-surface border border-line px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="panel-title">OPERATIONS MANUAL &amp; TECHNICAL REFERENCE</div>
            <h1 className="text-base font-semibold text-ink mt-0.5">
              USDMA Disaster Intelligence Platform · Uttarakhand Testbed Documentation
            </h1>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('overview')}
              className="px-2.5 py-1 border border-line bg-surface2 hover:border-line-strong text-ink2"
            >
              &larr; Return to Command Overview
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="bg-surface border border-line px-3 flex flex-wrap gap-1 border-b">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSection(s.id)}
              className={`px-3 py-2.5 font-mono text-[11px] uppercase tracking-wider border-b-2 -mb-px transition-colors ${
                activeSection === s.id
                  ? "border-accent text-ink font-semibold bg-surface2"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {activeSection === "provenance" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-line border border-line">
            <div className="bg-surface p-4 space-y-3">
              <div className="panel-title">SOURCE PROVENANCE TAGS (HOW WE KNOW)</div>
              <p className="text-xs text-muted">
                Every observation, event, and impact metric carries an explicit provenance classification so duty officers can separate physical gauge measurements from uncorroborated field reports.
              </p>
              <table className="w-full text-left border border-line text-xs">
                <thead className="bg-surface2 font-mono text-[10px] uppercase text-muted border-b border-line">
                  <tr>
                    <th className="py-2 px-2.5">Tag</th>
                    <th className="py-2 px-2.5">Operational Definition &amp; Qualifying Sources</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  <tr>
                    <td className="py-2 px-2.5"><EpistemicBadge status="Observed" /></td>
                    <td className="py-2 px-2.5 text-ink2">Direct physical measurement from calibrated CWC river gauges, IMD rain gauges, or verified EOS-04 SAR pass.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5"><EpistemicBadge status="Official" /></td>
                    <td className="py-2 px-2.5 text-ink2">Authoritative bulletin issued by IMD, CWC, NDMA, USDMA, GSI, or District Emergency Operations Center.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5"><EpistemicBadge status="Reported" /></td>
                    <td className="py-2 px-2.5 text-ink2">Credible press dispatch (PIB, PTI) or field sighting awaiting instrument cross-check.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5"><EpistemicBadge status="Inferred" /></td>
                    <td className="py-2 px-2.5 text-ink2">Derived by automated cross-sensor classification (`derived_result`) over current observations.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5"><EpistemicBadge status="Predicted" /></td>
                    <td className="py-2 px-2.5 text-ink2">Forward-projected hazard window from hydrological runoff or slope susceptibility models.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5"><EpistemicBadge status="Unverified" /></td>
                    <td className="py-2 px-2.5 text-ink2">Single-source crowdsourced report lacking independent corroboration.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-surface p-4 space-y-3">
              <div className="panel-title">IMD / NDMA SEVERITY LADDER</div>
              <p className="text-xs text-muted">
                Alert severity follows the standard Indian four-tier color protocol across all maps, tables, and feeds.
              </p>
              <table className="w-full text-left border border-line text-xs">
                <thead className="bg-surface2 font-mono text-[10px] uppercase text-muted border-b border-line">
                  <tr>
                    <th className="py-2 px-2.5">Level</th>
                    <th className="py-2 px-2.5">Required SEOC Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  <tr>
                    <td className="py-2 px-2.5"><SeverityBadge severity="Critical" /></td>
                    <td className="py-2 px-2.5 text-ink2">Level 4 Red Alert · Immediate evacuation, SDRF deployment, and corridor closure.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5"><SeverityBadge severity="High" /></td>
                    <td className="py-2 px-2.5 text-ink2">Level 3 Orange Alert · Mobilize response teams and issue public advisories.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5"><SeverityBadge severity="Moderate" /></td>
                    <td className="py-2 px-2.5 text-ink2">Level 2 Yellow Watch · Continuous monitoring of vulnerable slopes and river stages.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5"><SeverityBadge severity="Advisory" /></td>
                    <td className="py-2 px-2.5 text-ink2">Level 1 Green / Advisory · Routine synoptic tracking.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === "fusion" && (
          <div className="bg-surface border border-line p-4 space-y-3">
            <div className="panel-title">4-TIER MULTI-SENSOR FUSION PIPELINE</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-line border border-line">
              {[
                { step: "TIER 01", name: "Canonical Observations", tbl: "observation, text_item, raster_product, media", view: "reports", desc: "Normalized single-source records: hourly CWC gauge readings, INSAT-3DR half-hourly rain rates, and bilingual field reports." },
                { step: "TIER 02", name: "Modality Detections", tbl: "modality_event, modality_event_input", view: "modality-events", desc: "Single-sensor threshold triggers and model classifications with explicit input lineage." },
                { step: "TIER 03", name: "Unified Events", tbl: "event, event_match, event_attribute_selection", view: "events", desc: "Spatiotemporally matched real-world incidents combining weather, hydrology, and field evidence." },
                { step: "TIER 04", name: "Cascading Episodes", tbl: "event_group, event_relationship", view: "event-groups", desc: "Multi-hazard causal chains (e.g., Cloudburst -> Alaknanda Surge -> Slope Failure -> NH-58 Blockage)." }
              ].map((t, i) => (
                <div key={i} className="bg-surface p-3.5 flex flex-col justify-between gap-2">
                  <div>
                    <div className="font-mono text-[10px] text-accent font-semibold">{t.step}</div>
                    <div className="text-sm font-semibold text-ink mt-0.5">{t.name}</div>
                    <div className="font-mono text-[10px] text-faint mt-1">{t.tbl}</div>
                    <p className="text-xs text-muted mt-2 leading-relaxed">{t.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate(t.view)}
                    className="self-start font-mono text-[11px] text-accent hover:underline"
                  >
                    Open View &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "schema" && (
          <div className="bg-surface border border-line p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="panel-title">POSTGRESQL 16 + POSTGIS CANONICAL SCHEMA (38 TABLES / 8 DOMAINS)</span>
              <span className="font-mono text-[11px] text-ok">
                Loaded: {tablesMeta?.total || 38} tables
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line text-xs">
              {[
                { dom: "1. Source Management", list: ["data_source", "dataset", "dataset_version"] },
                { dom: "2. Ingestion & Provenance", list: ["pipeline_run", "collection", "raw_object", "raw_validation", "ingest_rejection"] },
                { dom: "3. Reference Geography", list: ["hazard", "admin_region", "static_raster", "geo_feature"] },
                { dom: "4. Canonical Observations", list: ["observation", "observation_region", "observation_relation", "text_item", "raster_product", "media"] },
                { dom: "5. Derived Results", list: ["model", "derived_result", "derived_result_input"] },
                { dom: "6. Source Quality", list: ["source_score"] },
                { dom: "7. Event Intelligence", list: ["modality_event", "modality_event_input", "event_match", "event", "event_attribute_selection", "event_member", "event_evidence", "event_region", "event_impact", "event_lineage", "event_relationship", "event_group", "event_group_member"] },
                { dom: "8. Benchmark Datasets", list: ["dataset_sample", "dataset_sample_item", "dataset_sample_event"] }
              ].map((g, i) => (
                <div key={i} className="bg-surface p-3">
                  <div className="font-mono text-[11px] font-semibold text-ink mb-1.5">{g.dom}</div>
                  <div className="flex flex-wrap gap-1">
                    {g.list.map((t) => (
                      <span key={t} className="font-mono text-[10px] px-1.5 py-0.5 bg-surface2 border border-line text-ink2">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "api" && (
          <div className="bg-surface border border-line p-4 space-y-3">
            <div className="panel-title">REST API V1 CONTRACT SUMMARY</div>
            <table className="w-full text-left border border-line text-xs">
              <thead className="bg-surface2 font-mono text-[10px] uppercase text-muted border-b border-line">
                <tr>
                  <th className="py-2 px-2.5">Endpoint Prefix</th>
                  <th className="py-2 px-2.5">Methods</th>
                  <th className="py-2 px-2.5">Operational Scope</th>
                  <th className="py-2 px-2.5 text-right">Bound View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line font-mono text-[11px]">
                {[
                  { ep: "/api/v1/tables", m: "GET", desc: "38-table DDL metadata, foreign keys, and seed rows", v: "help" },
                  { ep: "/api/v1/overview/*", m: "GET", desc: "7 KPI telemetry summary, active alerts, trend series, source status", v: "overview" },
                  { ep: "/api/v1/map/*", m: "GET", desc: "GeoJSON hazard features, spatial bbox filter, chronological timeline", v: "map-explorer" },
                  { ep: "/api/v1/events/*", m: "GET", desc: "Unified events catalog and 7-tab incident dossier", v: "events" },
                  { ep: "/api/v1/modality-events/*", m: "GET", desc: "Single-modality sensor detections and input lineage", v: "modality-events" },
                  { ep: "/api/v1/event-groups/*", m: "GET", desc: "Multi-hazard episodes and causal propagation DAG", v: "event-groups" },
                  { ep: "/api/v1/reports/*", m: "GET", desc: "Bilingual EN/HI field reports and source reliability matrix", v: "reports" },
                  { ep: "/api/v1/history/*", m: "GET", desc: "2015-2025 historical series and GSI landslide inventory", v: "history" },
                  { ep: "/api/v1/preparedness/*", m: "GET", desc: "Verified relief shelters, SDRF contacts, and SOP guidance", v: "preparedness" },
                  { ep: "/api/v1/ask/*", m: "GET, POST", desc: "Evidence-grounded SITREP query terminal with inline citations", v: "ask" },
                  { ep: "/api/v1/my-area/*", m: "GET, POST, PUT, DELETE", desc: "District watchlist CRUD and console configuration", v: "my-area" }
                ].map((r, i) => (
                  <tr key={i} className="hover:bg-surface2">
                    <td className="py-2 px-2.5 text-ink font-semibold">{r.ep}</td>
                    <td className="py-2 px-2.5 text-muted">{r.m}</td>
                    <td className="py-2 px-2.5 font-sans text-ink2">{r.desc}</td>
                    <td className="py-2 px-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => onNavigate && onNavigate(r.v)}
                        className="text-accent hover:underline"
                      >
                        /{r.v} &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  window.DisasterViews = window.DisasterViews || {};
  window.DisasterViews.HelpView = HelpView;
  window.HelpView = HelpView;
})();
