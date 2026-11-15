import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Download, ExternalLink, ShieldAlert,
  CheckCircle2, Clock, Sparkles, Filter, FileCheck,
  Hash, HardDrive, Share2, Layers
} from 'lucide-react';
import { mockReports } from '../data/mockReports';
import { formatDateTime } from '../utils/formatters';
import { riskConfig } from '../utils/riskColors';
import { CURRENT_USER } from '../context/AuthContext';

export default function ReportsPage() {
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadToast, setDownloadToast] = useState('');
  const [filterType, setFilterType] = useState('all');

  const handleDownload = (report) => {
    setDownloadingId(report.id);
    setTimeout(() => {
      setDownloadingId(null);
      setDownloadToast(`Generated & downloaded: ${report.id}.pdf`);
      setTimeout(() => setDownloadToast(''), 4000);
    }, 800);
  };

  const handleExportAll = () => {
    setDownloadToast('Exporting encrypted archive of all 4 dossiers (ZIP)...');
    setTimeout(() => {
      setDownloadToast('Archived dossiers downloaded successfully.');
      setTimeout(() => setDownloadToast(''), 4000);
    }, 1200);
  };

  const filteredReports = mockReports.filter(r => {
    if (filterType === 'all') return true;
    if (filterType === 'critical') return r.risk === 'critical';
    if (filterType === 'high') return r.risk === 'high';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Download toast notification */}
      {downloadToast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 80,
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#fff',
          padding: '0.75rem 1.25rem',
          borderRadius: '9999px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          fontSize: '0.82rem',
          fontWeight: 600,
          animation: 'fadeInUp 0.3s ease',
        }}>
          <CheckCircle2 size={16} color="#10b981" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-card animate-fade-in-up" style={{
        padding: '1.75rem 2rem',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.60) 0%, rgba(240, 249, 255, 0.35) 100%)',
        backdropFilter: 'blur(32px) saturate(200%)',
        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.85)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#0369a1',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: 'rgba(2, 132, 199, 0.1)',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
              }}>
                FORENSIC DOSSIERS &amp; EVIDENCE REPOSITORY
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                • Chain-of-Custody Verified
              </span>
            </div>
            <h2 style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              color: 'var(--navy)',
              letterSpacing: '-0.025em',
            }}>
              Cyber Investigation Report Center
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: 620 }}>
              Official prosecutorial reports generated with AI neural timeline correlation, artifact hash validation, and signed by Officer {CURRENT_USER.name}.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleExportAll}
              className="btn-pill-dark"
              style={{
                padding: '0.65rem 1.4rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Download size={15} />
              <span>Export All Dossiers</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.5rem' }}>
            Filter Dossiers:
          </span>
          <button
            onClick={() => setFilterType('all')}
            className={`btn-pill ${filterType === 'all' ? 'btn-pill-dark' : 'btn-pill-glass'}`}
            style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem' }}
          >
            All Reports ({mockReports.length})
          </button>
          <button
            onClick={() => setFilterType('critical')}
            className={`btn-pill ${filterType === 'critical' ? 'btn-pill-dark' : 'btn-pill-glass'}`}
            style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem' }}
          >
            Critical Risk
          </button>
          <button
            onClick={() => setFilterType('high')}
            className={`btn-pill ${filterType === 'high' ? 'btn-pill-dark' : 'btn-pill-glass'}`}
            style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem' }}
          >
            High Risk
          </button>
        </div>
      </div>

      {/* Reports Investigation Panels List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredReports.map((r, i) => {
          const isCritical = r.risk === 'critical';
          const isHigh = r.risk === 'high';
          const accentColor = isCritical ? '#dc2626' : isHigh ? '#ea580c' : '#0284c7';

          return (
            <div
              key={r.id}
              className={`glass-card animate-fade-in-up delay-${i * 100 + 100}`}
              style={{
                padding: '1.5rem 1.75rem',
                borderLeft: `4px solid ${accentColor}`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
                {/* Left Section: Icon + Metadata + Title */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flex: 1, minWidth: 320 }}>
                  {/* Document Icon Box with Hover Shift */}
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(224, 242, 254, 0.4) 100%)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
                  }}>
                    <FileText size={24} color={accentColor} strokeWidth={2} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Header Badges Pill Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="tag" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                        {r.caseId}
                      </span>
                      <span className={`badge ${riskConfig[r.risk]?.badgeClass}`}>
                        {riskConfig[r.risk]?.label} SEVERITY
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        background: 'rgba(5, 150, 105, 0.1)',
                        color: '#059669',
                        border: '1px solid rgba(5, 150, 105, 0.25)',
                        padding: '0.15rem 0.55rem',
                        borderRadius: '9999px',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}>
                        <CheckCircle2 size={11} />
                        FINAL — ANALYSIS COMPLETE
                      </span>
                      {r.readiness && (
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: 'rgba(2, 132, 199, 0.08)',
                          color: '#0284c7',
                          border: '1px solid rgba(2, 132, 199, 0.2)',
                          padding: '0.15rem 0.55rem',
                          borderRadius: '9999px',
                        }}>
                          {r.readiness}
                        </span>
                      )}
                    </div>

                    {/* Report Title */}
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: 'var(--navy)',
                      letterSpacing: '-0.015em',
                      marginBottom: '0.5rem',
                      lineHeight: 1.3,
                    }}>
                      {r.title}
                    </h3>

                    {/* Technical Metadata Bar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      flexWrap: 'wrap',
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--navy)', fontWeight: 600 }}>
                        <HardDrive size={13} color="var(--text-muted)" />
                        {r.pages} Pages ({r.fileSize || '3.5 MB'})
                      </span>
                      <span>•</span>
                      <span style={{ color: 'var(--navy)', fontWeight: 600 }}>
                        Lead Officer: <strong style={{ color: '#0284c7' }}>{r.generatedBy || CURRENT_USER.name}</strong>
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} />
                        {formatDateTime(r.generatedAt)}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                        <Hash size={13} />
                        SHA-256 Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
                  <Link
                    to={`/cases/${r.caseId}/analysis`}
                    className="btn-pill-glass"
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    <ExternalLink size={13} />
                    <span>View Analysis</span>
                  </Link>

                  <button
                    onClick={() => handleDownload(r)}
                    disabled={downloadingId === r.id}
                    className="btn-pill-dark"
                    style={{
                      padding: '0.5rem 1.15rem',
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    {downloadingId === r.id ? (
                      <span style={{
                        width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block',
                        animation: 'spin 0.6s linear infinite',
                      }} />
                    ) : (
                      <Download size={13} />
                    )}
                    <span>{downloadingId === r.id ? 'Exporting…' : 'Download PDF'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
