// Mock Dashboard Data
export const dashboardStats = {
  totalCases: 47,
  highRiskCases: 9,
  pendingAnalysis: 13,
  completedCases: 31,
};

export const riskDistributionData = [
  { name: 'Critical', value: 4, color: '#b91c1c' },
  { name: 'High', value: 9, color: '#c2410c' },
  { name: 'Medium', value: 16, color: '#a16207' },
  { name: 'Low', value: 18, color: '#166534' },
];

export const caseVolumeData = [
  { month: 'May', cases: 7 },
  { month: 'Jun', cases: 11 },
  { month: 'Jul', cases: 9 },
  { month: 'Aug', cases: 14 },
  { month: 'Sep', cases: 8 },
  { month: 'Oct', cases: 12 },
];

export const recentActivity = [
  {
    id: 'act-1',
    type: 'analysis_complete',
    message: 'AI analysis completed for Case #CY-2024-047',
    time: '12 minutes ago',
    icon: 'check',
    color: 'success',
  },
  {
    id: 'act-2',
    type: 'evidence_uploaded',
    message: '3 new evidence files uploaded to Case #CY-2024-046',
    time: '1 hour ago',
    icon: 'upload',
    color: 'info',
  },
  {
    id: 'act-3',
    type: 'high_risk',
    message: 'HIGH RISK flag raised on Case #CY-2024-044 — Ransomware indicators',
    time: '2 hours ago',
    icon: 'alert',
    color: 'danger',
  },
  {
    id: 'act-4',
    type: 'case_created',
    message: 'New case created: Corporate Data Exfiltration — TechVault Pvt Ltd',
    time: '3 hours ago',
    icon: 'plus',
    color: 'navy',
  },
  {
    id: 'act-5',
    type: 'report_generated',
    message: 'Investigation report generated for Case #CY-2024-043',
    time: '5 hours ago',
    icon: 'file',
    color: 'info',
  },
];
