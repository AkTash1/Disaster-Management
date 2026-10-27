// Disaster Intelligence Multimodal Platform - Badges Component
// Epistemic Status & Severity Taxonomy matching explorer_ui_3/handoff.md

(function() {
  const React = window.React;

  // Epistemic Badges: Observed, Official, Reported, AI Inferred, Predicted, Unverified, Likely True
  const EPISTEMIC_STYLES = {
    'observed': { bg: '#ecfdf5', text: '#059669', border: '#059669', label: 'Observed' },
    'official': { bg: '#f0fdf4', text: '#16a34a', border: '#16a34a', label: 'Official' },
    'reported': { bg: '#eff6ff', text: '#2563eb', border: '#2563eb', label: 'Reported' },
    'ai inferred': { bg: '#faf5ff', text: '#9333ea', border: '#9333ea', label: 'AI Inferred' },
    'ai inference': { bg: '#faf5ff', text: '#9333ea', border: '#9333ea', label: 'AI Inferred' },
    'ai predicted': { bg: '#faf5ff', text: '#7c3aed', border: '#7c3aed', label: 'AI Predicted' },
    'predicted': { bg: '#fef2f2', text: '#dc2626', border: '#dc2626', label: 'Predicted' },
    'unverified': { bg: '#fff1f2', text: '#e11d48', border: '#e11d48', label: 'Unverified' },
    'likely true': { bg: '#f0fdfa', text: '#0d9488', border: '#0d9488', label: 'Likely True' },
    'verified': { bg: '#ecfdf5', text: '#059669', border: '#059669', label: 'Verified' },
    'detected': { bg: '#ecfdf5', text: '#059669', border: '#059669', label: 'Detected' },
    'confirmed': { bg: '#ecfdf5', text: '#059669', border: '#059669', label: 'Confirmed' },
    'possible': { bg: '#f1f5f9', text: '#64748b', border: '#94a3b8', label: 'Possible' },
    'fact': { bg: '#ecfdf5', text: '#059669', border: '#059669', label: 'Fact' },
    'inference': { bg: '#fff7ed', text: '#ea580c', border: '#ea580c', label: 'Inference' },
    'prediction': { bg: '#faf5ff', text: '#9333ea', border: '#9333ea', label: 'Prediction' },
  };

  const EpistemicBadge = ({ status, className = "" }) => {
    if (!status) return null;
    const key = String(status).trim().toLowerCase();
    const style = EPISTEMIC_STYLES[key] || { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', label: status };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${className}`}
        style={{
          backgroundColor: style.bg,
          color: style.text,
          border: `1px solid ${style.border}`,
          lineHeight: '1.2'
        }}
      >
        {style.label || status}
      </span>
    );
  };

  // Severity Badges: Critical, High, Moderate, Low, Advisory
  const SEVERITY_STYLES = {
    'critical': { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: '#ef4444', label: 'Critical' },
    'high': { bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c', border: '#f97316', label: 'High' },
    'moderate': { bg: 'rgba(234, 179, 8, 0.15)', text: '#facc15', border: '#eab308', label: 'Moderate' },
    'medium': { bg: 'rgba(234, 179, 8, 0.15)', text: '#facc15', border: '#eab308', label: 'Moderate' },
    'low': { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: '#22c55e', label: 'Low' },
    'advisory': { bg: 'rgba(2, 132, 199, 0.15)', text: '#38bdf8', border: '#0284c7', label: 'Advisory' },
    'warning': { bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c', border: '#f97316', label: 'Warning' },
    'alert': { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: '#ef4444', label: 'Alert' },
  };

  const SeverityBadge = ({ severity, className = "" }) => {
    if (!severity) return null;
    const key = String(severity).trim().toLowerCase();
    const style = SEVERITY_STYLES[key] || { bg: 'rgba(148, 163, 184, 0.15)', text: '#cbd5e1', border: '#64748b', label: severity };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}
        style={{
          backgroundColor: style.bg,
          color: style.text,
          border: `1px solid ${style.border}`,
          lineHeight: '1.2'
        }}
      >
        ● {style.label || severity}
      </span>
    );
  };

  // Status Badge (Active, Resolved, Pending, etc.)
  const StatusBadge = ({ status, className = "" }) => {
    if (!status) return null;
    const key = String(status).trim().toLowerCase();
    const isAct = key === 'active' || key === 'live' || key === 'ongoing' || key === 'open';
    const isRes = key === 'resolved' || key === 'closed' || key === 'processed' || key === 'available';

    const bg = isAct ? 'rgba(239, 68, 68, 0.15)' : (isRes ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)');
    const text = isAct ? '#f87171' : (isRes ? '#34d399' : '#94a3b8');
    const border = isAct ? '#ef4444' : (isRes ? '#10b981' : '#475569');

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}
        style={{ backgroundColor: bg, color: text, border: `1px solid ${border}` }}
      >
        {status}
      </span>
    );
  };

  window.DisasterComponents = window.DisasterComponents || {};
  window.DisasterComponents.EpistemicBadge = EpistemicBadge;
  window.DisasterComponents.SeverityBadge = SeverityBadge;
  window.DisasterComponents.StatusBadge = StatusBadge;

  // Global exposure for direct access
  window.EpistemicBadge = EpistemicBadge;
  window.SeverityBadge = SeverityBadge;
  window.StatusBadge = StatusBadge;
})();
