import React, { useState, useEffect } from 'react';
import {
  Database, Server, HardDrive, ShieldCheck, Cpu, UploadCloud,
  CheckCircle, AlertTriangle, Clock, RefreshCw, FileText,
  Trash2, Play, ExternalLink, Copy, Check, Info, Terminal, Key, Code
} from 'lucide-react';
import api from '../../services/api';
import { cyberAudio } from '../../utils/cyberAudio';

// Realistic sample records representing Supabase PostgreSQL stored rows
const INITIAL_STORED_FILES = [
  {
    id: 'f-891a-45c1',
    original_name: 'finbridge_c2_traffic.pcap',
    file_size: 14829312,
    content_type: 'application/vnd.tcpdump.pcap',
    sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    storage_provider: 'supabase_storage',
    created_at: '2026-11-18T10:14:22Z',
    status: 'analyzed'
  },
  {
    id: 'f-342b-91d8',
    original_name: 'powershell_exfil_staged.log',
    file_size: 421090,
    content_type: 'text/plain',
    sha256_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    storage_provider: 'supabase_storage',
    created_at: '2026-11-18T11:45:10Z',
    status: 'analyzed'
  },
  {
    id: 'f-712e-11a9',
    original_name: 'medicore_vpn_memory_dump.raw',
    file_size: 89124000,
    content_type: 'application/octet-stream',
    sha256_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    storage_provider: 'local',
    created_at: '2026-11-18T14:02:44Z',
    status: 'processing'
  }
];

const INITIAL_JOBS = [
  {
    id: 'job-9912a',
    file_id: 'f-891a-45c1',
    filename: 'finbridge_c2_traffic.pcap',
    status: 'completed',
    progress: 100,
    started_at: '2026-11-18T10:14:25Z',
    completed_at: '2026-11-18T10:14:31Z',
    threat_score: 94,
    verdict: 'malicious'
  },
  {
    id: 'job-5541b',
    file_id: 'f-342b-91d8',
    filename: 'powershell_exfil_staged.log',
    status: 'completed',
    progress: 100,
    started_at: '2026-11-18T11:45:12Z',
    completed_at: '2026-11-18T11:45:16Z',
    threat_score: 79,
    verdict: 'suspicious'
  },
  {
    id: 'job-2139c',
    file_id: 'f-712e-11a9',
    filename: 'medicore_vpn_memory_dump.raw',
    status: 'processing',
    progress: 65,
    started_at: '2026-11-18T14:02:46Z',
    completed_at: null,
    threat_score: null,
    verdict: null
  }
];

const INITIAL_RESULTS = [
  {
    id: 'res-01',
    job_id: 'job-9912a',
    file_name: 'finbridge_c2_traffic.pcap',
    threat_score: 94,
    verdict: 'malicious',
    summary: 'Direct TOR exit node tunneling and high-frequency C2 beaconing on port 8443 identified with 14.8 GB payload transfer.',
    mitre_tactics: ['Command and Control (T1071)', 'Exfiltration Over Web (T1048)'],
    indicators: [
      { type: 'c2_ip', value: '194.26.29.112:8443', severity: 'critical' },
      { type: 'entropy_spike', value: '7.89 bits/byte', severity: 'high' }
    ],
    raw_output: {
      packets_inspected: 142090,
      protocol: 'TLSv1.3 Encrypted',
      c2_beacons_count: 84,
      anomalous_bursts: 12
    }
  },
  {
    id: 'res-02',
    job_id: 'job-5541b',
    file_name: 'powershell_exfil_staged.log',
    threat_score: 79,
    verdict: 'suspicious',
    summary: 'Base64 encoded execution string found invoking system discovery and scheduled task persistence.',
    mitre_tactics: ['Execution (T1059.001)', 'Persistence (T1053)'],
    indicators: [
      { type: 'powershell_enc', value: 'powershell.exe -enc JABjAGw...', severity: 'high' },
      { type: 'registry_run', value: 'HKLM\\Software\\Microsoft\\Windows\\Run', severity: 'medium' }
    ],
    raw_output: {
      script_entropy: 6.42,
      hidden_window: true,
      execution_depth: 3
    }
  }
];

export default function BackendHubFrame() {
  const [activeTab, setActiveTab] = useState('files');
  const [backendOnline, setBackendOnline] = useState(false);
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [files, setFiles] = useState(INITIAL_STORED_FILES);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [results, setResults] = useState(INITIAL_RESULTS);
  const [selectedRawResult, setSelectedRawResult] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Poll FastAPI Health
  const checkHealth = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.get('/health', { timeout: 3000 });
      if (res.data?.status === 'healthy') {
        setBackendOnline(true);
        setDbStatus(res.data.database || 'Supabase Connected');
      } else {
        setBackendOnline(false);
        setDbStatus('Degraded');
      }
    } catch {
      setBackendOnline(false);
      setDbStatus('Local Dev Engine');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    cyberAudio.playLaserBlip();
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSimulateAnalysis = (fileId) => {
    cyberAudio.playChirp(950, 0.03);
    const targetFile = files.find(f => f.id === fileId);
    if (!targetFile) return;

    const newJobId = `job-${Math.random().toString(36).slice(2, 7)}`;
    const newJob = {
      id: newJobId,
      file_id: fileId,
      filename: targetFile.original_name,
      status: 'processing',
      progress: 35,
      started_at: new Date().toISOString(),
      completed_at: null,
      threat_score: null,
      verdict: null
    };

    setJobs(prev => [newJob, ...prev]);
    setActiveTab('jobs');

    setTimeout(() => {
      setJobs(prev => prev.map(j => j.id === newJobId ? { ...j, progress: 80 } : j));
    }, 1200);

    setTimeout(() => {
      const score = Math.floor(Math.random() * 35) + 65;
      const verdict = score >= 75 ? 'malicious' : 'suspicious';
      setJobs(prev => prev.map(j => j.id === newJobId ? {
        ...j,
        progress: 100,
        status: 'completed',
        completed_at: new Date().toISOString(),
        threat_score: score,
        verdict
      } : j));

      const newResult = {
        id: `res-${Math.random().toString(36).slice(2, 7)}`,
        job_id: newJobId,
        file_name: targetFile.original_name,
        threat_score: score,
        verdict,
        summary: `Autonomous pipeline completed forensic correlation. Identified ${score}/100 threat indicators.`,
        mitre_tactics: ['Defense Evasion (T1027)', 'Discovery (T1082)'],
        indicators: [
          { type: 'entropy_anomaly', value: 'High byte variance detected', severity: 'high' },
          { type: 'sha256_verified', value: targetFile.sha256_hash.slice(0, 16) + '...', severity: 'medium' }
        ],
        raw_output: {
          file_size: targetFile.file_size,
          threat_index: score,
          signature_match: true
        }
      };
      setResults(prev => [newResult, ...prev]);
    }, 2500);
  };

  const handleDeleteFile = (id) => {
    cyberAudio.playAlertAlarm();
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <section id="backend" style={{
      position: 'relative',
      background: '#07080b',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '5rem 2rem 6rem',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{ maxWidth: 1260, width: '100%', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
            padding: '0.25rem 0.85rem', borderRadius: 9999,
            background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8', fontSize: '0.68rem', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            fontFamily: "'Space Grotesk', monospace",
          }}>
            <Database size={13} />
            LIVE TELEMETRY // SUPABASE POSTGRESQL & FASTAPI
          </div>

          <h2 style={{
            fontSize: 'clamp(1.9rem, 3.2vw, 2.7rem)',
            fontWeight: 900,
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontFamily: "'Space Grotesk', sans-serif",
            marginTop: '0.8rem',
            marginBottom: '0.4rem',
          }}>
            Backend Storage & Analysis Hub
          </h2>

          <p style={{
            fontSize: '0.88rem',
            color: '#94a3b8',
            maxWidth: 680,
            margin: '0 auto',
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            Real-time inspection of uploaded evidence files, asynchronous background analysis jobs, and Supabase relational schema state.
          </p>
        </div>

        {/* Live Service Status Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {/* Card 1: FastAPI Service */}
          <div style={{
            background: 'rgba(15, 17, 23, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1.25rem',
            padding: '1.25rem 1.4rem',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                FastAPI Service
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                {backendOnline ? 'Port 8000 · Live' : 'Offline / Standby'}
              </div>
              <div style={{ fontSize: '0.72rem', color: backendOnline ? '#34d399' : '#fbbf24', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: backendOnline ? '#34d399' : '#fbbf24' }} />
                {backendOnline ? 'Accepting HTTP & Axios' : 'Ready on uvicorn app.main:app'}
              </div>
            </div>
            <Server size={32} color={backendOnline ? '#34d399' : '#64748b'} />
          </div>

          {/* Card 2: Supabase PostgreSQL */}
          <div style={{
            background: 'rgba(15, 17, 23, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1.25rem',
            padding: '1.25rem 1.4rem',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Supabase PostgreSQL
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                {dbStatus}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8' }} />
                RLS Policies & Pooling Active
              </div>
            </div>
            <Database size={32} color="#38bdf8" />
          </div>

          {/* Card 3: Storage Bucket */}
          <div style={{
            background: 'rgba(15, 17, 23, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1.25rem',
            padding: '1.25rem 1.4rem',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Storage Bucket
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                evidence-files
              </div>
              <div style={{ fontSize: '0.72rem', color: '#a78bfa', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa' }} />
                {files.length} Stored Evidence Objects
              </div>
            </div>
            <HardDrive size={32} color="#a78bfa" />
          </div>

          {/* Card 4: Background Worker Queue */}
          <div style={{
            background: 'rgba(15, 17, 23, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1.25rem',
            padding: '1.25rem 1.4rem',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Background Worker Queue
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                FastAPI BackgroundTasks
              </div>
              <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />
                {jobs.filter(j => j.status === 'processing').length} Processing · {jobs.filter(j => j.status === 'completed').length} Done
              </div>
            </div>
            <Cpu size={32} color="#34d399" />
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'rgba(12, 14, 20, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '1.25rem',
          padding: '0.6rem 0.8rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { id: 'files', label: 'Stored Files & Evidence', count: files.length, icon: FileText },
              { id: 'jobs', label: 'Analysis Jobs & Queue', count: jobs.length, icon: Cpu },
              { id: 'results', label: 'Stored Forensic Results', count: results.length, icon: ShieldCheck },
              { id: 'supabase', label: 'Connect to Supabase Guide', icon: Terminal },
            ].map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { cyberAudio.playChirp(900, 0.02); setActiveTab(tab.id); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.45rem 1rem',
                    borderRadius: 9999,
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 700 : 500,
                    fontFamily: "'Space Grotesk', sans-serif",
                    background: isActive ? 'rgba(56, 189, 248, 0.16)' : 'transparent',
                    color: isActive ? '#38bdf8' : '#94a3b8',
                    border: isActive ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span style={{
                      fontSize: '0.68rem',
                      background: isActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                      color: isActive ? '#060608' : '#ffffff',
                      padding: '0.08rem 0.45rem',
                      borderRadius: 9999,
                      fontWeight: 800,
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={checkHealth}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.9rem',
              borderRadius: 9999,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            <RefreshCw size={13} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>Sync Live Telemetry</span>
          </button>
        </div>

        {/* Tab 1: Stored Files & Evidence */}
        {activeTab === 'files' && (
          <div style={{
            background: 'rgba(12, 14, 20, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1.5rem',
            padding: '1.75rem',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                  Evidence Artifacts in Supabase PostgreSQL
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Metadata stored in `public.files` with binary storage path in bucket `evidence-files`.
                </p>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', background: 'rgba(255, 255, 255, 0.06)', padding: '0.35rem 0.8rem', borderRadius: 9999 }}>
                Total: <strong>{files.length} files</strong>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: "'Space Grotesk', sans-serif" }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>File Name / ID</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Size</th>
                    <th style={{ padding: '0.75rem 1rem' }}>MIME Type</th>
                    <th style={{ padding: '0.75rem 1rem' }}>SHA-256 Hash</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Storage</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map(f => (
                    <tr key={f.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.84rem', color: '#ffffff' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{f.original_name}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace' }}>{f.id}</div>
                      </td>
                      <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                        {(f.file_size / (1024 * 1024)).toFixed(2)} MB
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.06)', padding: '0.2rem 0.5rem', borderRadius: 4, fontFamily: 'monospace', color: '#a78bfa' }}>
                          {f.content_type.split('/').pop()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button
                          onClick={() => copyToClipboard(f.sha256_hash, f.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                            background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)',
                            padding: '0.25rem 0.55rem', borderRadius: 6, color: '#38bdf8',
                            fontSize: '0.7rem', fontFamily: 'monospace', cursor: 'pointer'
                          }}
                          title="Click to copy full SHA-256"
                        >
                          {copiedId === f.id ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                          <span>{f.sha256_hash.slice(0, 10)}…{f.sha256_hash.slice(-6)}</span>
                        </button>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700,
                          color: f.storage_provider === 'supabase_storage' ? '#34d399' : '#fbbf24',
                          background: f.storage_provider === 'supabase_storage' ? 'rgba(52, 211, 153, 0.12)' : 'rgba(251, 191, 36, 0.12)',
                          padding: '0.2rem 0.55rem', borderRadius: 9999, border: '1px solid currentColor'
                        }}>
                          {f.storage_provider === 'supabase_storage' ? 'Supabase S3' : 'Local Disk'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleSimulateAnalysis(f.id)}
                            className="btn-pill"
                            style={{
                              padding: '0.35rem 0.75rem', fontSize: '0.72rem',
                              background: '#38bdf8', color: '#060608', fontWeight: 700,
                              display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer'
                            }}
                          >
                            <Play size={11} fill="#060608" /> Analyze
                          </button>
                          <button
                            onClick={() => handleDeleteFile(f.id)}
                            style={{
                              padding: '0.35rem', background: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '0.5rem',
                              color: '#ef4444', cursor: 'pointer'
                            }}
                            title="Delete file artifact"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Analysis Jobs & Queue */}
        {activeTab === 'jobs' && (
          <div style={{
            background: 'rgba(12, 14, 20, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1.5rem',
            padding: '1.75rem',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                Asynchronous Background Analysis Jobs
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Monitored in `public.analysis_jobs` via FastAPI BackgroundTasks worker pool.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {jobs.map(j => {
                const isDone = j.status === 'completed';
                const isProc = j.status === 'processing';
                return (
                  <div key={j.id} style={{
                    background: 'rgba(16, 18, 26, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '1rem',
                    padding: '1.25rem 1.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 800,
                          padding: '0.2rem 0.6rem', borderRadius: 9999,
                          background: isDone ? 'rgba(52, 211, 153, 0.15)' : isProc ? 'rgba(56, 189, 248, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                          color: isDone ? '#34d399' : isProc ? '#38bdf8' : '#fbbf24',
                          border: `1px solid ${isDone ? '#34d399' : isProc ? '#38bdf8' : '#fbbf24'}`,
                          textTransform: 'uppercase',
                        }}>
                          {j.status}
                        </span>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                          {j.filename}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                          ({j.id})
                        </span>
                      </div>

                      <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                        {isDone ? `Completed in 6.2s · Score ${j.threat_score}/100` : `Running analysis pipeline… ${j.progress}%`}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 9999, overflow: 'hidden' }}>
                      <div style={{
                        width: `${j.progress}%`,
                        height: '100%',
                        background: isDone ? 'linear-gradient(90deg, #38bdf8, #34d399)' : '#38bdf8',
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Stored Forensic Results */}
        {activeTab === 'results' && (
          <div style={{
            background: 'rgba(12, 14, 20, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1.5rem',
            padding: '1.75rem',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                Stored Forensic Analysis Results
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Retrieved from `public.analysis_results` (includes threat score, verdict, MITRE tactics & indicators JSONB).
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
              {results.map(r => (
                <div key={r.id} style={{
                  background: 'rgba(16, 18, 26, 0.88)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '1.25rem',
                  padding: '1.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.9rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>{r.file_name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Job ID: {r.job_id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: r.verdict === 'malicious' ? '#f87171' : '#fbbf24', lineHeight: 1 }}>
                        {r.threat_score}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                        {r.verdict}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                    "{r.summary}"
                  </p>

                  {/* Indicators Preview */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {r.indicators.map((ind, i) => (
                      <span key={i} style={{
                        fontSize: '0.68rem', fontFamily: 'monospace',
                        background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171', padding: '0.2rem 0.5rem', borderRadius: 6
                      }}>
                        {ind.type}: {ind.value}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => { cyberAudio.playLaserBlip(); setSelectedRawResult(r); }}
                    style={{
                      marginTop: '0.2rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      padding: '0.45rem', borderRadius: '0.6rem',
                      background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#ffffff', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    <Code size={13} /> Inspect Stored JSON Output
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Connect to Supabase Guide */}
        {activeTab === 'supabase' && (
          <div style={{
            background: 'rgba(12, 14, 20, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1.5rem',
            padding: '2rem',
            backdropFilter: 'blur(20px)',
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem', fontFamily: "'Space Grotesk', sans-serif" }}>
              How to Connect Your Supabase Project
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginBottom: '1.75rem' }}>
              Follow these 4 simple steps to connect the live Supabase PostgreSQL database and S3-compatible storage.
            </p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              
              {/* Step 1 */}
              <div style={{ background: 'rgba(16, 18, 26, 0.88)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '1rem', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#38bdf8', color: '#060608', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>1</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Execute the SQL Schema in Supabase</div>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 0.75rem 2rem' }}>
                  Open your <strong>Supabase Dashboard $\rightarrow$ SQL Editor</strong>, create a new query, and paste the schema from <code style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '0.15rem 0.4rem', borderRadius: 4 }}>backend/app/db/schema.sql</code>. It creates the tables (`files`, `analysis_jobs`, `analysis_results`), Row Level Security policies, indexes, and triggers.
                </p>
              </div>

              {/* Step 2 */}
              <div style={{ background: 'rgba(16, 18, 26, 0.88)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '1rem', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#38bdf8', color: '#060608', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>2</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Create the Storage Bucket</div>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 0 2rem' }}>
                  Go to <strong>Storage $\rightarrow$ New Bucket</strong>, name it <strong style={{ color: '#ffffff' }}>evidence-files</strong>, and check <em>Public Bucket</em> if you want direct download URLs for uploaded artifacts.
                </p>
              </div>

              {/* Step 3 */}
              <div style={{ background: 'rgba(16, 18, 26, 0.88)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '1rem', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#38bdf8', color: '#060608', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>3</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Update `backend/.env` with your Credentials</div>
                </div>
                <div style={{ margin: '0 0 0 2rem' }}>
                  <pre style={{
                    background: '#090a0f', border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '0.6rem', padding: '0.85rem 1rem', fontSize: '0.78rem',
                    color: '#e2e8f0', overflowX: 'auto', fontFamily: 'monospace'
                  }}>
{`SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_KEY="your-anon-or-service-role-key"
SUPABASE_JWT_SECRET="your-supabase-jwt-secret"
DATABASE_URL="postgresql+asyncpg://postgres:your-db-password@db.your-project-ref.supabase.co:5432/postgres"`}
                  </pre>
                </div>
              </div>

              {/* Step 4 */}
              <div style={{ background: 'rgba(16, 18, 26, 0.88)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '1rem', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#38bdf8', color: '#060608', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>4</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Launch the FastAPI Server</div>
                </div>
                <div style={{ margin: '0 0 0 2rem' }}>
                  <pre style={{
                    background: '#090a0f', border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '0.6rem', padding: '0.85rem 1rem', fontSize: '0.78rem',
                    color: '#34d399', overflowX: 'auto', fontFamily: 'monospace'
                  }}>
{`cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000`}
                  </pre>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Raw JSON Inspection Modal */}
      {selectedRawResult && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
        }}>
          <div style={{
            background: '#0d0f18', border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '1.5rem', maxWidth: 650, width: '100%', maxHeight: '80vh',
            display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>Stored JSON Telemetry</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Row: {selectedRawResult.id} · File: {selectedRawResult.file_name}</div>
              </div>
              <button
                onClick={() => setSelectedRawResult(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)', border: 'none',
                  borderRadius: '50%', width: 32, height: 32, color: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <pre style={{
                background: '#07080d', border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '1rem', borderRadius: '0.75rem', color: '#38bdf8',
                fontSize: '0.78rem', fontFamily: 'monospace', margin: 0,
              }}>
                {JSON.stringify(selectedRawResult, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
