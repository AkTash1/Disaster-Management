// Disaster Intelligence Platform — Clean, Readable KPI Summary Card
// Displays a clear title, large bold number, optional mini sparkline, and a helpful subtitle.

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
    neutral: 'text-muted bg-surface2',
    crit: 'text-crit bg-crit-soft',
    hazard: 'text-crit bg-crit-soft',
    warn: 'text-warn bg-warn-soft',
    warning: 'text-warn bg-warn-soft',
    ok: 'text-ok bg-ok-soft',
    good: 'text-ok bg-ok-soft'
  };

  const SparkBars = ({ data = [], tone = 'neutral' }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data, 1);
    const fill = (tone === 'hazard' || tone === 'crit') ? '#DC2626' : (tone === 'warning' || tone === 'warn') ? '#D97706' : '#0284C7';
    const w = 4, gap = 2, h = 20;
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
        className={`${bare ? '' : 'bg-surface border border-line rounded-lg shadow-sm'} p-4 flex flex-col justify-between gap-2 min-w-[130px] transition-all ${onClick ? 'cursor-pointer hover:border-accent/50 hover:shadow' : ''} ${className}`}
      >
        <div className="text-[12.5px] font-semibold text-muted truncate" title={title}>
          {title}
        </div>

        <div className="flex items-end justify-between gap-2">
          <div className="text-[26px] leading-none font-bold text-ink tracking-tight tabular-nums">
            {value !== undefined && value !== null ? value : "—"}
          </div>
          <SparkBars data={spark} tone={resolvedTone} />
        </div>

        {(displayDelta || subtitle) && (
          <div className="flex items-center justify-between gap-1.5 pt-1 text-[12px]">
            {displayDelta ? (
              <span className={`px-2 py-0.5 rounded-md text-[11.5px] font-semibold truncate ${toneCls}`}>
                {displayDelta}{deltaLabel ? ` ${deltaLabel}` : ''}
              </span>
            ) : (
              subtitle && <span className="text-muted truncate">{subtitle}</span>
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
