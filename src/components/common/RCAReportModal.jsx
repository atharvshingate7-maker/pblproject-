import React from 'react';
import {
  X, Shield, AlertTriangle, CheckCircle2, Clock,
  FileText, Download, Share2, Terminal, ArrowRight, ExternalLink, Lock, Check
} from 'lucide-react';
import AttackGraphVisualizer from './AttackGraphVisualizer';
import { cyberAudio } from '../../utils/cyberAudio';
import { mockRCAReports } from '../../data/mockRCAReports';

export default function RCAReportModal({ report: reportProp, caseId, onClose }) {
  // Support both passing a report object directly OR a caseId string
  const report = reportProp || (caseId ? mockRCAReports[caseId] : null);
  if (!report) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="glass-strong animate-scale-in"
        style={{
          width: '100%',
          maxWidth: 960,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'rgba(10, 10, 14, 0.98)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Metallic Bar */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #ffffff, #cbd5e1, #64748b)' }} />

        {/* Modal Header */}
        <div style={{
          padding: '1.75rem 2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          position: 'sticky',
          top: 0,
          background: 'rgba(10, 10, 14, 0.98)',
          zIndex: 20,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="tag" style={{ fontSize: '0.75rem' }}>{report.caseId}</span>
              <span className="badge badge-critical" style={{ fontSize: '0.7rem' }}>
                {report.severity} RISK · SCORE {report.riskScore}/100
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{report.incidentType}</span>
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#ffffff',
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '0.02em',
            }}>
              Root Cause Analysis (RCA) Dossier
            </h2>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
              Target: <strong style={{ color: '#ffffff' }}>{report.targetCompany}</strong> · Investigated by {report.analyst} · Detected {report.detectionDate}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => {
                cyberAudio.playLaserBlip();
                window.print();
              }}
              className="btn-pill btn-pill-glass"
              style={{ padding: '0.45rem 1rem', fontSize: '0.78rem' }}
            >
              <Download size={14} /> Export Dossier
            </button>
            <button
              onClick={() => { cyberAudio.playChirp(700, 0.03); onClose(); }}
              aria-label="Close RCA Report"
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#ffffff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Section 1: Executive Root Cause Summary */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <AlertTriangle size={16} color="#ffffff" />
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                1. PRIMARY ROOT CAUSE DETERMINATION
              </h3>
            </div>
            <p style={{ fontSize: '0.92rem', color: '#ffffff', lineHeight: 1.6, marginBottom: '1.25rem', fontWeight: 500 }}>
              {report.rootCause.summary}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Primary Vulnerability Defect</div>
                <div style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600, marginTop: '0.2rem' }}>{report.rootCause.primaryDefect}</div>
              </div>
              <div style={{ padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>CVE / Classification</div>
                <div style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 700, marginTop: '0.2rem', fontFamily: 'monospace' }}>{report.rootCause.cveCode}</div>
              </div>
              <div style={{ padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Vector Progression</div>
                <div style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600, marginTop: '0.2rem' }}>{report.rootCause.attackVector}</div>
              </div>
            </div>
          </div>

          {/* Section 2: Attack Progression Graph Visualizer */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Shield size={16} color="#ffffff" />
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                2. ATTACK GRAPH KILL-CHAIN TOPOLOGY
              </h3>
            </div>
            <AttackGraphVisualizer graph={report.attackGraph} />
          </div>

          {/* Section 3: Chronological Attack Progression Timeline */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Clock size={16} color="#ffffff" />
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                3. RECONSTRUCTED KILL-CHAIN TIMELINE
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {report.timeline.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#ffffff', color: '#060608',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 800, flexShrink: 0, marginTop: '2px',
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>
                      {item.time}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#ffffff', marginTop: '0.15rem' }}>
                      {item.event}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Impact Analysis & Exposure */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            <div style={{
              padding: '1.25rem',
              borderRadius: '1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                4. IMPACT ASSESSMENT
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                <div><span style={{ color: '#94a3b8' }}>Confidentiality: </span><strong style={{ color: '#ffffff' }}>{report.impactAnalysis.confidentiality}</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Integrity: </span><strong style={{ color: '#ffffff' }}>{report.impactAnalysis.integrity}</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Availability: </span><strong style={{ color: '#ffffff' }}>{report.impactAnalysis.availability}</strong></div>
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.06)', borderRadius: '0.5rem', color: '#ffffff', fontWeight: 700 }}>
                  Exposure: {report.impactAnalysis.estimatedExposure}
                </div>
              </div>
            </div>

            {/* Section 5: Remediations & Preventative Controls */}
            <div style={{
              padding: '1.25rem',
              borderRadius: '1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                5. RECOMMENDED REMEDIATION CHECKLIST
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {report.remediations.map((rem, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ffffff' }}>
                      <CheckCircle2 size={13} color={rem.status === 'Completed' ? '#34d399' : '#fbbf24'} />
                      <span>{rem.action}</span>
                    </div>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      background: rem.status === 'Completed' ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)',
                      color: rem.status === 'Completed' ? '#6ee7b7' : '#fde047',
                    }}>
                      {rem.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cryptographic Proof Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '1rem 1.25rem',
            borderRadius: '0.75rem',
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.72rem',
            color: '#94a3b8',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={13} color="#34d399" />
              <span>Immutable Forensic Seal: <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{report.forensicHash}</strong></span>
            </div>
            <span style={{ color: '#34d399', fontWeight: 700 }}>Cryptographically Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}

