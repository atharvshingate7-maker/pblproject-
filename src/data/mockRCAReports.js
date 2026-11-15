// Root Cause Analysis (RCA) and Attack Graph Dataset for each case
export const mockRCAReports = {
  'CY-2024-047': {
    caseId: 'CY-2024-047',
    title: 'Corporate Data Exfiltration — TechVault Pvt Ltd',
    targetCompany: 'TechVault Pvt Ltd',
    severity: 'Critical',
    riskScore: 94,
    status: 'In Analysis',
    incidentType: 'Insider Data Exfiltration',
    detectionDate: 'Oct 05, 2024 · 09:30 UTC',
    analyst: 'Atharv Shingate',

    rootCause: {
      summary: 'Systematic off-hours extraction of 47 GB proprietary codebase by authenticated user r.kulkarni using personal Dropbox egress, initiated via TOR VPN node.',
      primaryDefect: 'Over-permissive GitLab repository export privileges combined with lack of egress Data Loss Prevention (DLP) on developer workstations.',
      cveCode: 'CWE-200: Exposure of Sensitive Information to Unauthorized Actor',
      attackVector: 'Legitimate Credential Abuse + Staged Archive Exfiltration',
      confidenceScore: 94,
    },

    attackGraph: {
      title: 'Attack Progression Topology — CY-2024-047',
      nodes: [
        { id: 'n1', label: 'Workstation TW-047', sub: '192.168.10.47', type: 'source', stage: 'Origin' },
        { id: 'n2', label: 'TOR Exit Node', sub: '185.220.101.32', type: 'vector', stage: 'Anonymization' },
        { id: 'n3', label: 'Internal VPN Gateway', sub: 'techvault-vpn.internal', type: 'gateway', stage: 'Ingress' },
        { id: 'n4', label: 'GitLab Repo Server', sub: 'internal-git.techvault', type: 'target', stage: 'Asset Access' },
        { id: 'n5', label: 'Local 7-Zip Staging', sub: '47 Archives / 47GB', type: 'process', stage: 'Staging' },
        { id: 'n6', label: 'Dropbox API Egress', sub: '104.18.32.68:443', type: 'exfil', stage: 'Exfiltration' },
      ],
      links: [
        { from: 'n1', to: 'n2', label: 'Proxy Connect' },
        { from: 'n2', to: 'n3', label: 'VPN Auth (TOR)' },
        { from: 'n3', to: 'n4', label: 'Clone Privileges' },
        { from: 'n4', to: 'n5', label: 'Bulk Download' },
        { from: 'n5', to: 'n6', label: 'Encrypted POST' },
      ],
    },

    timeline: [
      { time: 'Sept 10, 2024 · 23:14 IST', event: 'Initial TOR VPN session initiated from IP 185.220.101.32 using r.kulkarni credentials.' },
      { time: 'Sept 12, 2024 · 01:22 IST', event: 'First batch clone of proprietary billing microservices repository (4.2 GB).' },
      { time: 'Sept 18, 2024 · 00:45 IST', event: 'Secondary clone of core algorithmic models and trade execution engine.' },
      { time: 'Sept 25, 2024 · 23:58 IST', event: 'Local batch staging using 7-Zip with custom AES encryption keys.' },
      { time: 'Sept 30, 2024 · 02:10 IST', event: 'Final 14.8 GB exfiltration push to api.dropboxapi.com endpoint completed.' },
    ],

    impactAnalysis: {
      confidentiality: 'CRITICAL — Proprietary trading algorithms & architecture blueprints exposed.',
      integrity: 'LOW — No source code tampered or deleted from internal repositories.',
      availability: 'UNAFFECTED — Systems remained fully operational throughout the attack.',
      estimatedExposure: '$14.2M Intellectual Property Valuation',
    },

    remediations: [
      { action: 'Revoke compromised GitLab personal access tokens and corporate SSO credentials', status: 'Completed', priority: 'P0' },
      { action: 'Block all known TOR exit node CIDR ranges at perimeter firewall', status: 'Completed', priority: 'P0' },
      { action: 'Deploy endpoint DLP to prohibit unauthorized cloud storage API transfers', status: 'In Progress', priority: 'P1' },
      { action: 'Implement just-in-time branch permissions for source repository downloads', status: 'Pending Review', priority: 'P2' },
    ],

    forensicHash: 'SHA-256: d84f938217bb4c90e292040b1821cf3e6371a53907cfa249018e20e8d028b3a1',
  },

  'CY-2024-046': {
    caseId: 'CY-2024-046',
    title: 'Ransomware Attack — MediCore Hospital Systems',
    targetCompany: 'MediCore Hospital Systems',
    severity: 'Critical',
    riskScore: 98,
    status: 'Pending Analysis',
    incidentType: 'LockBit 3.0 Ransomware',
    detectionDate: 'Oct 04, 2024 · 14:15 UTC',
    analyst: 'Officer Verma',

    rootCause: {
      summary: 'Exploitation of unpatched CVE-2024-21887 in perimeter Ivanti Connect Secure VPN, followed by Cobalt Strike beaconing and domain controller takeover.',
      primaryDefect: 'Delayed patch cycle on critical edge appliance allowing command injection and credential dump of domain administrator SAM database.',
      cveCode: 'CVE-2024-21887 (CVSS 9.1): Ivanti Connect Secure Command Injection',
      attackVector: 'Edge Gateway RCE -> Cobalt Strike -> PsExec Lateral Spread',
      confidenceScore: 98,
    },

    attackGraph: {
      title: 'Attack Progression Topology — CY-2024-046',
      nodes: [
        { id: 'n1', label: 'Internet Adversary', sub: '91.240.118.14', type: 'source', stage: 'Recon' },
        { id: 'n2', label: 'Ivanti VPN Edge', sub: 'vpn.medicore.org', type: 'gateway', stage: 'Exploit' },
        { id: 'n3', label: 'DMZ Web Server', sub: '172.16.4.12', type: 'vector', stage: 'Persistence' },
        { id: 'n4', label: 'Domain Controller', sub: 'DC-PRIMARY.CORP', type: 'target', stage: 'Privilege Esc' },
        { id: 'n5', label: 'PACs Medical Storage', sub: 'SAN-NAS-01 (18 TB)', type: 'process', stage: 'Encryption' },
        { id: 'n6', label: 'Shadow Copy Wipe', sub: 'vssadmin delete', type: 'exfil', stage: 'Impact' },
      ],
      links: [
        { from: 'n1', to: 'n2', label: 'CVE-2024-21887' },
        { from: 'n2', to: 'n3', label: 'Web Shell Drop' },
        { from: 'n3', to: 'n4', label: 'Mimikatz Pass-The-Hash' },
        { from: 'n4', to: 'n5', label: 'GPO Payload Push' },
        { from: 'n5', to: 'n6', label: 'Wipe Recovery' },
      ],
    },

    timeline: [
      { time: 'Oct 03, 2024 · 22:10 UTC', event: 'Automated exploit payload fired at perimeter Ivanti VPN appliance.' },
      { time: 'Oct 03, 2024 · 22:45 UTC', event: 'Webshell placed in /data/runtime/tmp; Cobalt Strike beacon established.' },
      { time: 'Oct 04, 2024 · 03:30 UTC', event: 'Domain administrator credentials extracted from LSASS memory.' },
      { time: 'Oct 04, 2024 · 06:15 UTC', event: 'Group Policy Object created to distribute encryptor binary to 142 endpoints.' },
      { time: 'Oct 04, 2024 · 14:15 UTC', event: 'Ransomware triggered across patient billing and electronic health records.' },
    ],

    impactAnalysis: {
      confidentiality: 'HIGH — 24,000 patient records staged prior to encryption.',
      integrity: 'CRITICAL — Database volumes encrypted with ChaCha20 algorithm.',
      availability: 'CRITICAL — Emergency room admittance shifted to manual paper records.',
      estimatedExposure: '₹8.5 Cr Ransom Demand + Critical Public Health Disruption',
    },

    remediations: [
      { action: 'Isolate hospital network VLANs and disconnect edge VPN appliances', status: 'Completed', priority: 'P0' },
      { action: 'Spin up clean disaster recovery backups from cold offline immutable tape', status: 'In Progress', priority: 'P0' },
      { action: 'Rotate all Active Directory Kerberos and Enterprise Admin passwords twice', status: 'Completed', priority: 'P1' },
      { action: 'Engage CERT-In and state cyber forensics cell for decryptor key assistance', status: 'In Progress', priority: 'P1' },
    ],

    forensicHash: 'SHA-256: 7a82ef45b90214c718b4081023a4928174fb01092a83b271c6401928374a5812',
  },

  'CY-2024-045': {
    caseId: 'CY-2024-045',
    title: 'CEO Email Impersonation Fraud — FinBridge Capital',
    targetCompany: 'FinBridge Capital',
    severity: 'High',
    riskScore: 82,
    status: 'Completed',
    incidentType: 'Business Email Compromise (BEC)',
    detectionDate: 'Oct 03, 2024 · 11:00 UTC',
    analyst: 'Atharv Shingate',

    rootCause: {
      summary: 'Adversary registered lookalike domain finbrldge-capital.com and crafted spoofed thread reply hijacking CEO email to divert ₹1.2 Cr acquisition funds.',
      primaryDefect: 'Absence of external email banner warnings, missing DMARC quarantine enforcement, and failure of out-of-band wire verification protocols.',
      cveCode: 'CWE-290: Authentication Bypass by Spoofing',
      attackVector: 'Lookalike Typosquat Domain + Social Engineering Thread Hijacking',
      confidenceScore: 92,
    },

    attackGraph: {
      title: 'Attack Progression Topology — CY-2024-045',
      nodes: [
        { id: 'n1', label: 'Typosquat Domain', sub: 'finbrldge-capital.com', type: 'source', stage: 'Staging' },
        { id: 'n2', label: 'Spear Phishing Mail', sub: 'To: CFO (P. Mehta)', type: 'vector', stage: 'Delivery' },
        { id: 'n3', label: 'Thread Hijack Reply', sub: 'Re: Vendor M&A Escrow', type: 'gateway', stage: 'Exploit' },
        { id: 'n4', label: 'Fake Wire Instruction', sub: 'Swift Transfer Docs', type: 'target', stage: 'Deception' },
        { id: 'n5', label: 'Mule Bank Account', sub: 'State Bank of India', type: 'exfil', stage: 'Financial Egress' },
      ],
      links: [
        { from: 'n1', to: 'n2', label: 'MX Relay via Namecheap' },
        { from: 'n2', to: 'n3', label: 'Inject False Urgent Context' },
        { from: 'n3', to: 'n4', label: 'Attach Altered Account PDF' },
        { from: 'n4', to: 'n5', label: '₹1.2 Cr Transfer Request' },
      ],
    },

    timeline: [
      { time: 'Sept 28, 2024 · 18:30 UTC', event: 'Adversary registers lookalike domain using privacy protection.' },
      { time: 'Oct 01, 2024 · 09:15 UTC', event: 'First probe email sent to Finance desk to verify accounts payable schedule.' },
      { time: 'Oct 02, 2024 · 14:40 UTC', event: 'CEO impersonation message claims confidential urgent acquisition wire.' },
      { time: 'Oct 03, 2024 · 10:15 UTC', event: 'Finance team initiates wire; internal compliance desk flags account discrepancy.' },
      { time: 'Oct 03, 2024 · 11:00 UTC', event: 'Bank contacted; wire recalled within golden 4-hour window.' },
    ],

    impactAnalysis: {
      confidentiality: 'MODERATE — Executive email conversational patterns intercepted.',
      integrity: 'HIGH — Wire instructions successfully manipulated.',
      availability: 'LOW — Normal banking operations paused during review.',
      estimatedExposure: '₹1.2 Cr Saved via Rapid Freeze Action',
    },

    remediations: [
      { action: 'Institute strict dual-authorization phone verification for transfers > ₹10 Lakh', status: 'Completed', priority: 'P0' },
      { action: 'Enforce DMARC reject policy on all corporate mail exchange gateways', status: 'Completed', priority: 'P0' },
      { action: 'Automate registrar takedown of domain finbrldge-capital.com', status: 'Completed', priority: 'P1' },
      { action: 'Conduct simulated BEC awareness drill for senior executives', status: 'Completed', priority: 'P2' },
    ],

    forensicHash: 'SHA-256: 4b910248c8271e6194b0294821a81094726b1029471029384719284719284710',
  },

  'CY-2024-044': {
    caseId: 'CY-2024-044',
    title: 'Unauthorized Access — InfraTech Cloud Platform',
    targetCompany: 'InfraTech Solutions',
    severity: 'High',
    riskScore: 79,
    status: 'Under Review',
    incidentType: 'Credential Stuffing & AWS IAM Breach',
    detectionDate: 'Oct 02, 2024 · 16:45 UTC',
    analyst: 'Officer Mehra',

    rootCause: {
      summary: 'Reused admin credentials from a third-party developer breach were used to access an unmonitored AWS root account lacking Multi-Factor Authentication (MFA).',
      primaryDefect: 'Absence of mandatory MFA on AWS root administrator account and lack of automated alerting on anomalous geographic logons.',
      cveCode: 'CWE-307: Improper Restriction of Excessive Authentication Attempts',
      attackVector: 'Credential Stuffing -> Unprotected IAM Root Account Access',
      confidenceScore: 88,
    },

    attackGraph: {
      title: 'Attack Progression Topology — CY-2024-044',
      nodes: [
        { id: 'n1', label: 'Dark Web Breach Dump', sub: 'Combo List 2024', type: 'source', stage: 'Intel' },
        { id: 'n2', label: 'TOR Exit Node Cluster', sub: 'Rotating IPs', type: 'vector', stage: 'Brute Force' },
        { id: 'n3', label: 'AWS IAM Console', sub: 'signin.aws.amazon.com', type: 'gateway', stage: 'Authentication' },
        { id: 'n4', label: 'Root Admin Role', sub: 'arn:aws:iam::root', type: 'target', stage: 'Privilege Access' },
        { id: 'n5', label: 'EC2 Crypto Miners', sub: '8x g4dn.12xlarge', type: 'exfil', stage: 'Resource Theft' },
      ],
      links: [
        { from: 'n1', to: 'n2', label: 'Automated Botnet' },
        { from: 'n2', to: 'n3', label: 'Credential Spray' },
        { from: 'n3', to: 'n4', label: 'Successful Auth (No MFA)' },
        { from: 'n4', to: 'n5', label: 'Provision GPU Instances' },
      ],
    },

    timeline: [
      { time: 'Oct 02, 2024 · 14:10 UTC', event: '420 rapid login attempts recorded from Ukrainian & Dutch IP addresses.' },
      { time: 'Oct 02, 2024 · 14:38 UTC', event: 'Successful authentication to AWS root console from IP 185.191.171.12.' },
      { time: 'Oct 02, 2024 · 15:02 UTC', event: 'Unauthorized IAM access keys created with AdministratorAccess policy.' },
      { time: 'Oct 02, 2024 · 15:45 UTC', event: 'Spike in AWS CloudWatch EC2 GPU provision calls in us-west-2 region.' },
      { time: 'Oct 02, 2024 · 16:45 UTC', event: 'AWS Cost Anomaly alert fired; security team initiated token revocation.' },
    ],

    impactAnalysis: {
      confidentiality: 'LOW — Production databases were not targeted.',
      integrity: 'LOW — CloudFormation templates unmodified.',
      availability: 'MODERATE — API quota throttling temporarily affected deploy pipelines.',
      estimatedExposure: '$18,500 AWS GPU compute debt incurred',
    },

    remediations: [
      { action: 'Immediately terminate rogue EC2 instances and delete attacker IAM keys', status: 'Completed', priority: 'P0' },
      { action: 'Enforce hardware FIDO2 MFA across all root and privileged AWS IAM accounts', status: 'Completed', priority: 'P0' },
      { action: 'Enable AWS GuardDuty and set up automated CloudWatch auto-remediation lambdas', status: 'Completed', priority: 'P1' },
      { action: 'Integrate corporate SSO identity provider to deprecate static IAM user accounts', status: 'In Progress', priority: 'P2' },
    ],

    forensicHash: 'SHA-256: 3c81920847b19284719284710928471029384719284719284710928374829102',
  },

  'CY-2024-042': {
    caseId: 'CY-2024-042',
    title: 'DDoS Attack — E-Commerce Portal',
    targetCompany: 'ShopZest India Pvt Ltd',
    severity: 'Medium',
    riskScore: 58,
    status: 'Completed',
    incidentType: 'Volumetric & Layer-7 HTTP Flood DDoS',
    detectionDate: 'Sept 25, 2024 · 08:30 IST',
    analyst: 'Atharv Shingate',

    rootCause: {
      summary: 'Sustained DDoS attack during peak shopping hours. Traffic peaked at 2.3 Gbps with 4.8M req/min from 18,400 Mirai-variant IoT botnet nodes targeting checkout and payment gateway microservices.',
      primaryDefect: 'Absence of edge-tier BGP Anycast scrubbing and missing aggressive rate-limiting on /api/v2/checkout gateway, causing TCP connection backlog pool starvation on ingress NGINX proxies.',
      cveCode: 'CWE-400: Uncontrolled Resource Consumption (DDoS Amplification)',
      attackVector: 'Distributed Mirai IoT Botnet -> NTP Amplification -> Layer-7 HTTP Flood',
      confidenceScore: 98,
    },

    attackGraph: {
      title: 'Attack Progression Topology — CY-2024-042 (DDoS Kill-Chain)',
      nodes: [
        { id: 'n1', label: 'Mirai Botnet C2', sub: '18,400 Infected IoT Nodes', type: 'source', stage: 'Origin' },
        { id: 'n2', label: 'NTP/DNS Amplifiers', sub: 'UDP Reflection Vector', type: 'vector', stage: 'Volumetric' },
        { id: 'n3', label: 'Edge BGP Transit', sub: 'AS13335 (2.3 Gbps Peak)', type: 'gateway', stage: 'Ingress' },
        { id: 'n4', label: 'Application Gateway', sub: 'NGINX Ingress Controller', type: 'target', stage: 'Resource Exhaustion' },
        { id: 'n5', label: 'Checkout API Microservice', sub: '/api/v2/checkout (HTTP 504)', type: 'process', stage: 'Service Outage' },
        { id: 'n6', label: 'Anycast Scrubbing Center', sub: 'Cloudflare Magic Transit Divert', type: 'exfil', stage: 'Mitigation' },
      ],
      links: [
        { from: 'n1', to: 'n2', label: 'Trigger SYN Beacon' },
        { from: 'n2', to: 'n3', label: '2.3 Gbps Flood' },
        { from: 'n3', to: 'n4', label: 'Connection Saturation' },
        { from: 'n4', to: 'n5', label: 'Thread Pool Starvation' },
        { from: 'n5', to: 'n6', label: 'BGP Anycast Scrub' },
      ],
    },

    timeline: [
      { time: 'Sept 25, 2024 · 08:14 IST', event: 'Initial telemetry probe: 120,000 UDP SYN bursts directed at shopzest.in origin IP.' },
      { time: 'Sept 25, 2024 · 08:22 IST', event: 'Volumetric surge escalates to 2.3 Gbps with NTP monlist amplification reflection.' },
      { time: 'Sept 25, 2024 · 08:28 IST', event: 'Layer-7 HTTP POST flood strikes /api/v2/checkout; response latency spikes to 14.8 seconds.' },
      { time: 'Sept 25, 2024 · 08:35 IST', event: 'Automated BGP route withdrawal initiated; traffic diverted to Anycast scrubbing center.' },
      { time: 'Sept 25, 2024 · 08:52 IST', event: '99.4% malicious botnet traffic filtered; checkout latency normalizes to 85ms.' },
    ],

    impactAnalysis: {
      confidentiality: 'UNAFFECTED — Customer database and PCI-DSS payment data remained completely isolated.',
      integrity: 'UNAFFECTED — No system states or inventory records altered.',
      availability: 'DEGRADED — Checkout portal experienced 38 minutes of intermittent HTTP 504 timeouts.',
      estimatedExposure: '₹34 Lakhs in estimated lost shopping cart transactions prevented.',
    },

    remediations: [
      { action: 'Migrate DNS authoritative nameservers to Cloudflare DDoS Anycast scrubbing with automated WAF challenges', status: 'Completed', priority: 'P0' },
      { action: 'Deploy strict rate limiting (max 40 req/min per IP) on all authentication and checkout endpoints', status: 'Completed', priority: 'P0' },
      { action: 'Implement Origin Shielding and hide origin load balancer IP behind secure GRE tunnels', status: 'Completed', priority: 'P1' },
      { action: 'Configure synthetic uptime heartbeat probes with automated pager escalation alerts', status: 'Completed', priority: 'P2' },
    ],

    forensicHash: 'SHA-256: 9b12847102938471928471928471029384719284710928374829102938471029',
  },
};

// Customer / CISO Testimonials Dataset
export const mockTestimonials = [
  {
    id: 't-1',
    author: 'Vikramaditya Rao',
    role: 'Chief Information Security Officer',
    company: 'FinBridge Capital India',
    badge: 'BFSI Tier-1',
    metric: '₹1.2 Cr',
    metricLabel: 'Fraud Loss Prevented',
    quote: 'CyberIntel AI pinpointed the exact thread-hijack anomaly in our CEO communication within 4 minutes. The automated attack graph and RCA report allowed our executive board to act before wire clearance.',
  },
  {
    id: 't-2',
    author: 'Dr. Sunita Deshmukh',
    role: 'Director of Healthcare IT & Security',
    company: 'MediCore Hospital Systems',
    badge: 'Critical Infrastructure',
    metric: '88% Faster',
    metricLabel: 'Ransomware Triage',
    quote: 'When our edge VPN was exploited, CyberIntel correlated the Active Directory privilege escalation and generated an end-to-end Root Cause Analysis dossier that saved our clinical databases.',
  },
  {
    id: 't-3',
    author: 'Karan Malhotra',
    role: 'VP of Platform Engineering',
    company: 'TechVault Global Cloud',
    badge: 'Enterprise SaaS',
    metric: '47 GB',
    metricLabel: 'IP Exfil Intercepted',
    quote: 'The precision of the attack topology graph is unmatched. We could trace the insider from local 7-Zip compression through TOR exit nodes directly to the egress CDN node with cryptographic proof.',
  },
  {
    id: 't-4',
    author: 'Elena Rostova',
    role: 'Lead Forensic Investigator',
    company: 'Cyber Defense CERT Squad',
    badge: 'Incident Response',
    metric: '< 5 min',
    metricLabel: 'Autonomous RCA Generation',
    quote: 'Having the Root Cause Analysis, CVE mapping, and interactive attack progression graph unified on a single screen is the gold standard for high-stakes forensic operations.',
  },
];

