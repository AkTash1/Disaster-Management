// Disaster Intelligence Platform — KPI Summary Card
// Strong visual hierarchy: clear semi-bold label, large extra-bold value (28px), and subtle metadata/delta pill.

(function() {
  const React = window.React;

  const normaliseDelta = (d) => {
    if (d === null || d === undefined || d === '') return null;
    let s = String(d).trim();
    if (s.includes('↑')) s = '+' + s.replace('↑', '').trim();
    if (s.includes('↓')) s = '-' + s.replace('↓', '').trim();
    return s;
  };

  const DELTA_TONE = {
    neutral: 'text-muted bg-surface2 border border-line',
    crit: 'text-crit bg-crit-soft border border-crit/20',
    hazard: 'text-crit bg-crit-soft border border-crit/20',
    warn: 'text-warn bg-warn-soft border border-warn/20',
    warning: 'text-warn bg-warn-soft border border-warn/20',
    ok: 'text-ok bg-ok-soft border border-ok/20',
    good: 'text-ok bg-ok-soft border border-ok/20'
  };

  const SparkBars = ({ data = [], tone = 'neutral' }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data, 1);
    const fill = (tone === 'hazard' || tone === 'crit') ? '#DC2626' : (tone === 'warning' || tone === 'warn') ? '#D97706' : '#0284C7';
    const w = 4, gap = 2, h = 22;
    return (
      <svg width={data.length * (w + gap) - gap} height={h} className="shrink-0" aria-hidden="true">
        {data.map((v, i) => {
          const bh = Math.max(3, Math.round((v / max) * h));
          return <rect key={i} x={i * (w + gap)} y={h - bh} width={w} height={bh} rx="1" fill={fill} opacity={i === data.length - 1 ? 1 : 0.35} />;
        })}
      </svg>
    );
  };

  const KpiCard = ({
    title,
    value,
    trend = null,
    delta = null,
    deltaTone = null,
    tone = null,
    deltaLabel = "",
    spark = null,
    subtitle = "",
    bare = false,
    className = "",
    onClick = null
  }) => {
    const displayDelta = normaliseDelta(trend || delta);
    const resolvedTone = deltaTone || tone || 'neutral';
    const toneCls = DELTA_TONE[resolvedTone] || DELTA_TONE.neutral;

    return (
      <div
        onClick={onClick}
        className={`${bare ? '' : 'bg-surface border border-line rounded-xl shadow-xs'} p-4 flex flex-col justify-between gap-2.5 min-w-[125px] transition-all ${onClick ? 'cursor-pointer hover:border-accent/50 hover:shadow-sm' : ''} ${className}`}
      >
        <div className="text-[13px] font-semibold text-ink2 truncate" title={title}>
          {title}
        </div>

        <div className="flex items-end justify-between gap-2">
          <div className="text-[28px] leading-none font-extrabold text-ink tracking-tight tabular-nums">
            {value !== undefined && value !== null ? value : "—"}
          </div>
          <SparkBars data={spark} tone={resolvedTone} />
        </div>

        {(displayDelta || subtitle) && (
          <div className="flex items-center justify-between gap-1.5 pt-0.5 text-[11.5px]">
            {displayDelta ? (
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium truncate ${toneCls}`}>
                {displayDelta}{deltaLabel ? ` ${deltaLabel}` : ''}
              </span>
            ) : (
              subtitle && <span className="text-muted font-normal truncate">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  window.DisasterComponents = window.DisasterComponents || {};
  window.DisasterComponents.KpiCard = KpiCard;
  window.KpiCard = KpiCard;
})();
