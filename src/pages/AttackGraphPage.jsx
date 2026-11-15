import React, { useState } from 'react';
import { Network, Shield, AlertTriangle, ArrowRight, FileText } from 'lucide-react';
import { mockRCAReports } from '../data/mockRCAReports';
import AttackGraphVisualizer from '../components/common/AttackGraphVisualizer';
import RCAReportModal from '../components/common/RCAReportModal';
import { cyberAudio } from '../utils/cyberAudio';

export default function AttackGraphPage() {
  const [selectedCaseId, setSelectedCaseId] = useState('CY-2024-047');
  const [activeRCACaseId, setActiveRCACaseId] = useState(null);

  const activeReport = mockRCAReports[selectedCaseId] || mockRCAReports['CY-2024-047'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card cyber-corner animate-fade-in-up" style={{ padding: '2rem 2.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="tag" style={{ fontSize: '0.7rem' }}>
                LIVE THREAT RECONSTRUCTION // GRAPH TOPOLOGY
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>• Multi-Stage Vector Correlation</span>
            </div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              Attack Progression Topology
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              Inspect reconstructed kill-chain vectors from entry-point probe to final data egress.
            </p>
          </div>

          {/* Case Selector Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '0.35rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflowX: 'auto',
          }}>
            {Object.keys(mockRCAReports).map(id => {
              const rep = mockRCAReports[id];
              const isSelected = selectedCaseId === id;
              return (
                <button
                  key={id}
                  onClick={() => { cyberAudio.playChirp(850, 0.02); setSelectedCaseId(id); }}
                  style={{
                    padding: '0.45rem 0.95rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    fontFamily: "'Space Grotesk', sans-serif",
                    background: isSelected ? '#ffffff' : 'transparent',
                    color: isSelected ? '#060608' : '#94a3b8',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {id} · {rep.targetCompany.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Graph Visualizer */}
      <AttackGraphVisualizer
        graph={activeReport.attackGraph}
        caseId={selectedCaseId}
        onOpenRCA={(id) => setActiveRCACaseId(id)}
      />

      {/* Root Cause Analysis Summary Card for this graph */}
      <div className="glass-card cyber-corner" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              ROOT CAUSE ANALYSIS (RCA) PREVIEW
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif", marginTop: '0.2rem' }}>
              {activeReport.title}
            </h3>
          </div>

          <button
            onClick={() => {
              cyberAudio.playLaserBlip();
              setActiveRCACaseId(selectedCaseId);
            }}
            className="btn-pill btn-pill-primary"
            style={{ fontSize: '0.82rem', padding: '0.5rem 1.25rem' }}
          >
            <FileText size={15} color="#060608" strokeWidth={2.4} />
            <span>Open Full RCA Dossier</span>
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          {activeReport.rootCause.summary}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Defect Root Cause</div>
            <div style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600, marginTop: '0.2rem' }}>{activeReport.rootCause.primaryDefect}</div>
          </div>
          <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>CVE Code</div>
            <div style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 700, marginTop: '0.2rem', fontFamily: 'monospace' }}>{activeReport.rootCause.cveCode}</div>
          </div>
          <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Forensic Confidence</div>
            <div style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 700, marginTop: '0.2rem' }}>{activeReport.rootCause.confidenceScore}% Cryptographically Verified</div>
          </div>
        </div>
      </div>

      {/* Root Cause Analysis (RCA) Modal */}
      {activeRCACaseId && (
        <RCAReportModal
          report={mockRCAReports[activeRCACaseId]}
          onClose={() => setActiveRCACaseId(null)}
        />
      )}
    </div>
  );
}

