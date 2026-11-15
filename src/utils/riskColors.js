export const riskConfig = {
  critical: { label: 'Critical', badgeClass: 'badge-critical', color: '#ffffff', bg: 'rgba(255, 255, 255, 0.15)' },
  high:     { label: 'High',     badgeClass: 'badge-high',     color: '#e2e8f0', bg: 'rgba(226, 232, 240, 0.12)' },
  medium:   { label: 'Medium',   badgeClass: 'badge-medium',   color: '#cbd5e1', bg: 'rgba(203, 213, 225, 0.10)' },
  low:      { label: 'Low',      badgeClass: 'badge-low',      color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.08)' },
};

export const statusConfig = {
  pending:   { label: 'Pending Analysis', badgeClass: 'status-pending' },
  analysis:  { label: 'In Analysis',      badgeClass: 'status-analysis' },
  review:    { label: 'Under Review',     badgeClass: 'status-review' },
  completed: { label: 'Completed',        badgeClass: 'status-completed' },
};

export function getRiskColor(score) {
  if (score >= 85) return '#ffffff';
  if (score >= 65) return '#e2e8f0';
  if (score >= 40) return '#cbd5e1';
  return '#94a3b8';
}

export function getRiskLevel(score) {
  if (score >= 85) return 'critical';
  if (score >= 65) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}
