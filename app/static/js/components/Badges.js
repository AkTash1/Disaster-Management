// Disaster Intelligence Platform — Readable Status & Severity Badges
// Clean, easy-to-read badges with clear contrast and a subtle left accent bar.

(function() {
  const React = window.React;

  const TONES = {
    green: { text: '#065F46', bg: '#ECFDF5', bar: '#10B981' },
    teal: { text: '#075985', bg: '#E0F2FE', bar: '#0284C7' },
    blue: { text: '#1E40AF', bg: '#EFF6FF', bar: '#3B82F6' },
    indigo: { text: '#3730A3', bg: '#EEF2FF', bar: '#6366F1' },
    amber: { text: '#92400E', bg: '#FFFBEB', bar: '#F59E0B' },
    orange: { text: '#9A3412', bg: '#FFF7ED', bar: '#EA580C' },
    red: { text: '#991B1B', bg: '#FEF2F2', bar: '#EF4444' },
    grey: { text: '#334155', bg: '#F1F5F9', bar: '#64748B' }
  };

  const Tag = ({ tone = 'grey', label, className = '', title }) => {
    const t = TONES[tone] || TONES.grey;
    return (
      <span
        title={title}
        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-semibold leading-tight whitespace-nowrap ${className}`}
        style={{ backgroundColor: t.bg, color: t.text, borderLeft: `3px solid ${t.bar}` }}
      >
        {label}
      </span>
    );
  };

  const EPISTEMIC = {
    'observed': ['green', 'Sensor Verified'],
    'official': ['teal', 'Official Bulletin'],
    'reported': ['blue', 'Field Report'],
    'ai inferred': ['indigo', 'Analyzed'],
    'ai inference': ['indigo', 'Analyzed'],
    'inferred': ['indigo', 'Analyzed'],
    'ai predicted': ['amber', 'Forecast'],
    'predicted': ['amber', 'Forecast'],
    'unverified': ['red', 'Unverified'],
    'likely true': ['teal', 'Likely True'],
    'verified': ['green', 'Verified'],
    'detected': ['green', 'Detected'],
    'confirmed': ['green', 'Confirmed'],
    'possible': ['grey', 'Possible'],
    'fact': ['green', 'Verified Fact'],
    'inference': ['indigo', 'Analysis'],
    'prediction': ['amber', 'Forecast']
  };

  const EpistemicBadge = ({ status, className = "" }) => {
    if (!status) return null;
    const key = String(status).trim().toLowerCase();
    const [tone, label] = EPISTEMIC[key] || ['grey', status];
    return <Tag tone={tone} label={label} className={className} title={`Verification status: ${label}`} />;
  };

  const SEVERITY = {
    'critical': ['red', 'Critical'],
    'red': ['red', 'Red Alert'],
    'alert': ['red', 'Alert'],
    'high': ['orange', 'High Risk'],
    'orange': ['orange', 'Orange Alert'],
    'warning': ['orange', 'Warning'],
    'moderate': ['amber', 'Moderate'],
    'medium': ['amber', 'Moderate'],
    'yellow': ['amber', 'Yellow Watch'],
    'low': ['green', 'Low Risk'],
    'advisory': ['green', 'Advisory'],
    'green': ['green', 'Normal']
  };

  const SeverityBadge = ({ severity, className = "" }) => {
    if (!severity) return null;
    const key = String(severity).trim().toLowerCase();
    const [tone, label] = SEVERITY[key] || ['grey', severity];
    return <Tag tone={tone} label={label} className={className} title={`Severity level: ${label}`} />;
  };

  const StatusBadge = ({ status, className = "" }) => {
    if (!status) return null;
    const key = String(status).trim().toLowerCase();
    const isAct = ['active', 'live', 'ongoing', 'open'].includes(key);
    const isRes = ['resolved', 'closed', 'processed', 'available', 'completed'].includes(key);
    const tone = isAct ? 'red' : (isRes ? 'green' : 'grey');
    return <Tag tone={tone} label={status} className={className} />;
  };

  window.DisasterComponents = window.DisasterComponents || {};
  window.DisasterComponents.EpistemicBadge = EpistemicBadge;
  window.DisasterComponents.SeverityBadge = SeverityBadge;
  window.DisasterComponents.StatusBadge = StatusBadge;
  window.DisasterComponents.Tag = Tag;

  window.EpistemicBadge = EpistemicBadge;
  window.SeverityBadge = SeverityBadge;
  window.StatusBadge = StatusBadge;
  window.Tag = Tag;
})();
