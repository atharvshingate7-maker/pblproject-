// Mock Analysis Data for Case CY-2024-047
export const mockAnalysis = {
  caseId: 'CY-2024-047',
  status: 'complete',
  analyzedAt: '2024-10-05T11:45:00Z',
  processingTime: '4m 32s',

  aiSummary: `Based on analysis of 8 evidence files including server logs, network captures, email records, and the company-provided incident report, the AI has identified strong indicators of a premeditated insider data exfiltration event. An authenticated internal user (user: r.kulkarni@techvault.com) systematically accessed and downloaded sensitive intellectual property — primarily proprietary source code repositories — using a personal cloud storage account (Dropbox) over a 21-day period between September 10–30, 2024.

The exfiltration occurred in off-hours (11 PM – 2 AM IST) to evade detection, with volume spikes on weekends. Approximately 47 GB of data was transferred. Analysis of file access patterns shows deliberate staging: files were compressed using 7-Zip before upload. A critical timeline inconsistency has been identified between the company's incident report timestamp and server log timestamps, requiring officer verification.`,

  riskScore: 94,
  riskLevel: 'Critical',
  aiConfidence: 91,

  extractedEntities: {
    ips: [
      { value: '103.21.244.0', type: 'External', note: 'Dropbox CDN egress node', flag: 'medium' },
      { value: '192.168.10.47', type: 'Internal', note: 'Workstation — r.kulkarni', flag: 'high' },
      { value: '185.220.101.32', type: 'External', note: 'TOR exit node — accessed company VPN', flag: 'critical' },
      { value: '104.18.32.68', type: 'External', note: 'Dropbox API endpoint', flag: 'medium' },
    ],
    domains: [
      { value: 'dropbox.com', note: 'Data exfiltration destination' },
      { value: 'techvault-internal.vpn', note: 'Company VPN domain' },
      { value: 'api.dropboxapi.com', note: 'API calls for upload' },
    ],
    users: [
      { value: 'r.kulkarni@techvault.com', role: 'Senior Dev Engineer', flag: 'critical', note: 'Primary suspect — authenticated all sessions' },
      { value: 'admin@techvault.com', role: 'IT Admin', flag: 'low', note: 'Reviewed access logs' },
      { value: 'security@techvault.com', role: 'Security Team', flag: 'none', note: 'Reported incident' },
    ],
    systems: [
      { value: 'GitLab Server (internal-git.techvault.com)', note: 'Primary data source' },
      { value: 'SFTP File Server (files.techvault.internal)', note: 'Secondary access point' },
      { value: 'Windows Workstation — Asset ID TW-047', note: 'Physical machine of suspect' },
    ],
    files: [
      { value: '*.zip archives (47 files, ~47 GB total)', note: '7-Zip compressed source code' },
      { value: 'access_log_sept.csv', note: 'Server access logs' },
    ],
  },

  findings: [
    {
      id: 'F-001',
      title: 'Systematic Data Exfiltration via Cloud Storage',
      severity: 'critical',
      confidence: 94,
      source: 'server_access_log.csv + network_capture.pcap',
      description: 'User r.kulkarni performed 47 large file uploads to Dropbox between Sept 10–30. Upload volumes range from 800MB to 2.1GB per session. Uploads consistently occurred between 11 PM–2 AM IST.',
    },
    {
      id: 'F-002',
      title: 'Possible Unauthorized Access via TOR Network',
      severity: 'high',
      confidence: 88,
      source: 'vpn_access_log.txt',
      description: 'One VPN session originated from known TOR exit node IP 185.220.101.32. The session lasted 43 minutes and accessed the GitLab server. The employee has no prior history of TOR usage.',
    },
    {
      id: 'F-003',
      title: 'Abnormal After-Hours Repository Access',
      severity: 'high',
      confidence: 92,
      source: 'gitlab_audit_log.json',
      description: '23 repository clone operations performed between 11 PM–2 AM across 18 nights. Normal working hours for the employee are 9 AM–6 PM. Weekend access detected on 4 occasions.',
    },
    {
      id: 'F-004',
      title: 'File Compression Pattern Suggesting Staging',
      severity: 'medium',
      confidence: 78,
      source: 'endpoint_log.csv',
      description: '7-Zip process executed repeatedly on the suspect workstation immediately before each upload event. Files named with generic names (backup_001.zip, backup_002.zip) to avoid detection.',
    },
    {
      id: 'F-005',
      title: 'Resignation Notice Correlation',
      severity: 'medium',
      confidence: 72,
      source: 'hr_email_records.pdf',
      description: 'Employee submitted resignation notice on September 8, 2024 — 2 days before the exfiltration activity commenced. Exit date was October 15, 2024.',
    },
  ],

  timeline: [
    { time: 'Sept 8, 2024 — 10:30 AM', event: 'Employee r.kulkarni submits resignation letter via email', type: 'info' },
    { time: 'Sept 10, 2024 — 11:15 PM', event: 'First large file upload to Dropbox detected (1.2 GB). GitLab clone of /repo/core-engine performed.', type: 'warning' },
    { time: 'Sept 14, 2024 — 11:47 PM', event: 'TOR exit node VPN session detected. GitLab admin panel accessed.', type: 'danger' },
    { time: 'Sept 19, 2024 — 12:02 AM', event: 'Weekend upload — 2.1 GB. Largest single exfiltration event.', type: 'danger' },
    { time: 'Sept 25, 2024 — 1:30 AM', event: 'SFTP server accessed. /client-data/ directory traversed.', type: 'warning' },
    { time: 'Sept 30, 2024 — 11:58 PM', event: 'Final upload session — 900 MB. 21-day exfiltration window closes.', type: 'danger' },
    { time: 'Oct 3, 2024 — 9:00 AM', event: 'Security team detects anomaly in access logs. Incident reported.', type: 'info' },
    { time: 'Oct 4, 2024 — 2:00 PM', event: 'Incident Report timestamp as stated by company (see inconsistency below)', type: 'inconsistency' },
    { time: 'Oct 5, 2024 — 9:30 AM', event: 'Case registered with Cyber Cell. Evidence submitted.', type: 'info' },
  ],

  inconsistencies: [
    {
      id: 'INC-001',
      severity: 'high',
      title: 'Incident Discovery Timestamp Mismatch',
      source1: { label: 'Incident Report (Company)', value: 'Oct 4, 2024 — 2:00 PM' },
      source2: { label: 'Security SIEM Log', value: 'Oct 3, 2024 — 9:14 AM' },
      description: 'Company incident report states discovery at 2:00 PM on Oct 4. SIEM alert logs show anomaly was flagged at 9:14 AM on Oct 3 — over 28 hours earlier. Possible delayed reporting or evidence of delayed response.',
      recommendation: 'Officer should verify with IT security team and obtain original SIEM alert records.',
    },
    {
      id: 'INC-002',
      severity: 'medium',
      title: 'Employee Access Badge vs. System Log Discrepancy',
      source1: { label: 'Physical Access Badge Record', value: 'Sept 19 — No office entry recorded' },
      source2: { label: 'Workstation Login Log', value: 'Sept 19 — Login at 11:58 PM from office IP' },
      description: 'Physical badge records show no office entry on Sept 19 (the largest upload day), but system logs show a workstation login from an office IP range. This suggests either remote access with VPN masking office IP, or a discrepancy in badge/system reconciliation.',
      recommendation: 'Request CCTV footage and VPN session logs for Sept 19.',
    },
    {
      id: 'INC-003',
      severity: 'low',
      title: 'File Count Discrepancy in Inventory',
      source1: { label: 'Company Provided File List', value: '43 repositories listed' },
      source2: { label: 'GitLab Audit Log', value: '51 clone operations detected' },
      description: 'Company states 43 repositories were potentially accessed, but GitLab audit log shows 51 distinct clone operations.',
      recommendation: 'Request complete GitLab repository inventory from company admin.',
    },
  ],

  missingInfo: [
    { id: 'MI-001', item: 'Authentication Logs (MFA/OTP records)', priority: 'critical', reason: "Cannot confirm if suspect's credentials were solely used or shared/stolen." },
    { id: 'MI-002', item: 'Dropbox Account Activity Log', priority: 'critical', reason: 'Need legal process to obtain Dropbox access logs confirming receipt of uploads.' },
    { id: 'MI-003', item: 'File Hash Values (SHA-256) of Stolen Files', priority: 'high', reason: 'Required to prove chain of custody and identify exact files exfiltrated.' },
    { id: 'MI-004', item: 'Employee Exit Interview Records', priority: 'medium', reason: 'May reveal motive; useful for modus operandi analysis.' },
    { id: 'MI-005', item: 'CCTV Footage — Server Room (Sept 10-30)', priority: 'medium', reason: 'Needed to corroborate physical presence on after-hours activity dates.' },
    { id: 'MI-006', item: 'Endpoint DLP Logs', priority: 'high', reason: 'Data Loss Prevention software logs may capture exact file names and transfers.' },
  ],

  recommendations: [
    { id: 'R-001', priority: 'immediate', text: "Issue Legal Notice / Preservation Order to Dropbox Inc. for account data associated with the suspect's email, covering Sept 1-Oct 5 period." },
    { id: 'R-002', priority: 'immediate', text: 'Seize and forensically image suspect workstation (Asset TW-047) before evidence tampering.' },
    { id: 'R-003', priority: 'high', text: "Obtain MFA/OTP authentication records from company's Identity Provider (Okta/Azure AD) to confirm sole account usage." },
    { id: 'R-004', priority: 'high', text: 'Request CCTV footage from company premises for all nights where after-hours activity was detected.' },
    { id: 'R-005', priority: 'medium', text: 'Investigate the TOR VPN session (Sept 14) - determine whether external actor may have used compromised credentials.' },
    { id: 'R-006', priority: 'medium', text: 'Coordinate with company legal team regarding non-disclosure agreement breach for civil proceedings in parallel.' },
  ],

  evidence: [
    { id: 'EV-001', name: 'server_access_log.csv', type: 'CSV', size: '2.4 MB', uploadedAt: '2024-10-05T09:45:00Z', analyzedBy: 'AI + Officer', status: 'analyzed', keyFindings: ['F-001', 'F-003'] },
    { id: 'EV-002', name: 'network_capture.pcap', type: 'PCAP', size: '18.2 MB', uploadedAt: '2024-10-05T09:47:00Z', analyzedBy: 'AI', status: 'analyzed', keyFindings: ['F-001', 'F-002'] },
    { id: 'EV-003', name: 'gitlab_audit_log.json', type: 'JSON', size: '1.1 MB', uploadedAt: '2024-10-05T09:50:00Z', analyzedBy: 'AI', status: 'analyzed', keyFindings: ['F-003'] },
    { id: 'EV-004', name: 'incident_report_company.pdf', type: 'PDF', size: '890 KB', uploadedAt: '2024-10-05T09:52:00Z', analyzedBy: 'AI + Officer', status: 'analyzed', keyFindings: ['INC-001'] },
    { id: 'EV-005', name: 'endpoint_log.csv', type: 'CSV', size: '3.1 MB', uploadedAt: '2024-10-05T09:55:00Z', analyzedBy: 'AI', status: 'analyzed', keyFindings: ['F-004'] },
    { id: 'EV-006', name: 'vpn_access_log.txt', type: 'TXT', size: '420 KB', uploadedAt: '2024-10-05T09:57:00Z', analyzedBy: 'AI', status: 'analyzed', keyFindings: ['F-002'] },
    { id: 'EV-007', name: 'hr_email_records.pdf', type: 'PDF', size: '120 KB', uploadedAt: '2024-10-05T10:00:00Z', analyzedBy: 'AI', status: 'analyzed', keyFindings: ['F-005'] },
    { id: 'EV-008', name: 'badge_access_records.xlsx', type: 'XLSX', size: '85 KB', uploadedAt: '2024-10-05T10:02:00Z', analyzedBy: 'AI', status: 'analyzed', keyFindings: ['INC-002'] },
  ],
};

// Mock Analysis Data for Case CY-2024-042 (DDoS Attack — ShopZest India)
export const mockDDoSAnalysis = {
  caseId: 'CY-2024-042',
  status: 'complete',
  analyzedAt: '2024-09-25T11:20:00Z',
  processingTime: '2m 45s',

  aiSummary: `Comprehensive packet inspection and edge telemetry analysis of the ShopZest India e-commerce infrastructure confirm a multi-vector Distributed Denial of Service (DDoS) incident occurring during peak morning flash sale hours on September 25, 2024. 

The attack combined high-volume Layer-4 NTP monlist reflection amplification with an asynchronous Layer-7 HTTP flood targeting /api/v2/checkout and /api/v1/payments/process. Ingress traffic surged from a baseline of 45 Mbps to a peak of 2.3 Gbps (4.8M pps) within 8 minutes. Telemetry correlation identified 18,400 Mirai-variant IoT botnet nodes orchestrated by Command & Control (C2) servers located in Eastern Europe and Seychelles.

Automated BGP Anycast route divergence via Cloudflare Magic Transit successfully scrubbed 99.4% of malicious packets, mitigating total outage and preserving backend PostgreSQL transaction pools with zero customer data loss or payment corruption.`,

  riskScore: 58,
  riskLevel: 'Medium',
  aiConfidence: 96,

  extractedEntities: {
    ips: [
      { value: '185.220.101.32', type: 'External', note: 'Primary Mirai Botnet C2 Controller', flag: 'critical' },
      { value: '45.142.214.8', type: 'External', note: 'Secondary Command Beacon Relay', flag: 'critical' },
      { value: '198.51.100.22', type: 'Internal', note: 'ShopZest Edge NGINX Ingress Proxy', flag: 'high' },
      { value: '162.158.0.1', type: 'External', note: 'Cloudflare Magic Transit BGP Scrub Node', flag: 'low' },
      { value: '10.0.4.15', type: 'Internal', note: 'Kubernetes Checkout Microservice Cluster', flag: 'low' },
    ],
    domains: [
      { value: 'shopzest.in', note: 'Primary Production E-Commerce Domain' },
      { value: 'api.shopzest.in', note: 'Restricted Microservice API Gateway' },
      { value: 'c2-beacon-relay.xyz', note: 'Identified Botnet Coordination Host' },
    ],
    users: [
      { value: 'Atharv Shingate', role: 'Lead Incident Commander', flag: 'none', note: 'Led mitigation and Anycast diversion' },
      { value: 'noc-oncall@shopzest.in', role: 'Site Reliability Engineer', flag: 'low', note: 'Flagged initial connection queue spike' },
      { value: 'security@shopzest.in', role: 'SOC Analyst', flag: 'none', note: 'Authorized BGP scrubbing escalation' },
    ],
    systems: [
      { value: 'NGINX Ingress Gateway (v1.24)', note: 'Experienced worker thread starvation during Layer-7 flood' },
      { value: 'Cloudflare Magic Transit (AS13335)', note: 'BGP Anycast scrubbing center filtering 2.3 Gbps ingress' },
      { value: 'Payment Gateway Broker', note: 'Safely isolated behind circuit-breaker middleware' },
    ],
    files: [
      { value: 'ddos_ingress_capture_0925.pcap', note: 'Wireshark dump showing NTP monlist UDP reflection packets' },
      { value: 'nginx_access_surge.log', note: '4.8M requests/min targeting /api/v2/checkout' },
    ],
  },

  findings: [
    {
      id: 'F-D01',
      title: 'Volumetric NTP Monlist UDP Amplification (2.3 Gbps Peak)',
      severity: 'critical',
      confidence: 98,
      source: 'ddos_ingress_capture_0925.pcap',
      description: 'Attacker botnet spoofed origin IP to public NTP servers using monlist commands, generating a 56x traffic multiplier. Saturated 1 Gbps direct transit link within 6 minutes.',
    },
    {
      id: 'F-D02',
      title: 'Targeted Layer-7 HTTP Flood on Checkout & Payment APIs',
      severity: 'high',
      confidence: 95,
      source: 'nginx_access_surge.log',
      description: 'Concurrent HTTP/2 POST requests with randomized User-Agent strings targeted /api/v2/checkout, attempting to exhaust upstream connection backlog pools.',
    },
    {
      id: 'F-D03',
      title: '18,400 Node Mirai-Variant IoT Botnet Infrastructure',
      severity: 'high',
      confidence: 93,
      source: 'c2_telemetry_flow.json',
      description: 'Traffic originated from compromised routers, DVRs, and IP cameras across 42 countries, communicating with C2 nodes 185.220.101.32 and 45.142.214.8.',
    },
    {
      id: 'F-D04',
      title: 'Absence of Edge Adaptive Rate-Limiting Policy',
      severity: 'medium',
      confidence: 90,
      source: 'nginx_config_audit.conf',
      description: 'NGINX proxy lacked granular per-IP and token bucket rate limits on the checkout path, allowing the gateway thread pool to be exhausted prior to upstream WAF intervention.',
    },
    {
      id: 'F-D05',
      title: 'BGP Anycast Divert Scrubbing Success (99.4% Mitigation)',
      severity: 'low',
      confidence: 99,
      source: 'cloudflare_magic_transit_metrics.csv',
      description: 'BGP route announcement diverted transit to Magic Transit scrubbing centers. 99.4% of malicious payload dropped; 0% legitimate checkout transactions lost.',
    },
  ],

  timeline: [
    { time: 'Sept 25, 2024 — 08:14 IST', event: 'Initial telemetry probe: 120,000 UDP SYN bursts directed at shopzest.in origin IP', type: 'info' },
    { time: 'Sept 25, 2024 — 08:22 IST', event: 'Volumetric surge escalates to 2.3 Gbps with NTP monlist amplification reflection', type: 'danger' },
    { time: 'Sept 25, 2024 — 08:29 IST', event: 'Layer-7 flood hits /api/v2/checkout; NGINX proxy returns HTTP 504 gateway timeouts', type: 'danger' },
    { time: 'Sept 25, 2024 — 08:34 IST', event: 'Incident Commander Atharv Shingate triggers BGP route announcement to Cloudflare Anycast', type: 'warning' },
    { time: 'Sept 25, 2024 — 08:41 IST', event: 'Magic Transit scrubs 99.4% of ingress traffic; origin pipe returns to 52 Mbps clean baseline', type: 'info' },
    { time: 'Sept 25, 2024 — 09:01 IST', event: 'Attack abates. Threat actor ceases C2 beacons. Zero customer payment failures recorded', type: 'info' },
  ],

  inconsistencies: [
    {
      id: 'INC-D01',
      severity: 'medium',
      title: 'Edge CDN vs Upstream ISP NetFlow Discrepancy',
      source1: { label: 'Upstream Transit NetFlow', value: 'Recorded 2.3 Gbps peak volume' },
      source2: { label: 'Edge CDN SYN Tracker', value: 'Recorded 1.8 Gbps peak volume' },
      description: 'A 500 Mbps discrepancy was noted during the initial 4 minutes of the surge due to 1:1000 sampling rates on the edge CDN switch.',
      recommendation: 'Deploy real-time sFlow sampling on edge aggregation switches for sub-second volumetric alerting.',
    },
  ],

  missingInfo: [
    { id: 'MI-D01', item: 'Full ISP Upstream NetFlow Samples', priority: 'high', reason: 'To identify upstream tier-1 transit reflection vectors.' },
    { id: 'MI-D02', item: 'Botnet Binary Firmware Signatures', priority: 'medium', reason: 'To pinpoint exact Mirai variant strain across infected IoT devices.' },
  ],

  recommendations: [
    { id: 'R-D01', priority: 'immediate', text: 'Maintain permanent Always-On BGP Anycast DDoS scrubbing via Cloudflare Magic Transit.' },
    { id: 'R-D02', priority: 'immediate', text: 'Implement strict NGINX token-bucket rate limiting on /api/v2/checkout (10 req/s per client IP).' },
    { id: 'R-D03', priority: 'high', text: 'Deploy Cloudflare Turnstile / Managed Challenge on suspicious ASN traffic bursts.' },
    { id: 'R-D04', priority: 'medium', text: 'Block ingress UDP port 123 (NTP) at the upstream border router ACL level.' },
  ],

  evidence: [
    { id: 'EV-D01', name: 'ddos_ingress_capture_0925.pcap', type: 'PCAP', size: '42.8 MB', uploadedAt: '2024-09-25T09:15:00Z', analyzedBy: 'AI + Atharv Shingate', status: 'analyzed', keyFindings: ['F-D01', 'F-D03'] },
    { id: 'EV-D02', name: 'nginx_access_surge.log', type: 'LOG', size: '8.4 MB', uploadedAt: '2024-09-25T09:20:00Z', analyzedBy: 'AI', status: 'analyzed', keyFindings: ['F-D02', 'F-D04'] },
    { id: 'EV-D03', name: 'cloudflare_magic_transit_metrics.csv', type: 'CSV', size: '1.2 MB', uploadedAt: '2024-09-25T09:25:00Z', analyzedBy: 'AI', status: 'analyzed', keyFindings: ['F-D05'] },
    { id: 'EV-D04', name: 'c2_telemetry_flow.json', type: 'JSON', size: '640 KB', uploadedAt: '2024-09-25T09:30:00Z', analyzedBy: 'AI', status: 'analyzed', keyFindings: ['F-D03'] },
  ],
};
