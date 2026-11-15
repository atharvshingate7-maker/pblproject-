import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, Plus, FolderOpen, AlertTriangle,
  Clock, CheckCircle2, ChevronRight, Upload, BarChart2,
  Shield, FileText, ArrowRight, Sparkles, Terminal, Network
} from 'lucide-react';
import { mockCases, caseTypes, riskLevels, statusOptions } from '../data/mockCases';
import { mockRCAReports } from '../data/mockRCAReports';
import RCAReportModal from '../components/common/RCAReportModal';
import { formatDate } from '../utils/formatters';
import { riskConfig, statusConfig } from '../utils/riskColors';
import { cyberAudio } from '../utils/cyberAudio';

export default function CasesPage() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All Risk Levels');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [activeRCACaseId, setActiveRCACaseId] = useState(null);

  const filtered = useMemo(() => {
    return mockCases.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.title.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
      const matchRisk   = riskFilter   === 'All Risk Levels' || c.risk   === riskFilter.toLowerCase();
      const matchStatus = statusFilter === 'All Status'       || c.status === statusFilter.toLowerCase();
      const matchType   = typeFilter   === 'All Types'        || c.type   === typeFilter;
      return matchSearch && matchRisk && matchStatus && matchType;
    });
  }, [search, riskFilter, statusFilter, typeFilter]);

  const riskScoreBar = (score) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{
          width: 75,
          height: 6,
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.12)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${score}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #ffffff, #94a3b8)',
            borderRadius: '9999px',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
            transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }} />
        </div>
        <span className="num-sci-fi" style={{
          fontSize: '1rem',
          fontWeight: 800,
          color: '#ffffff',
          minWidth: 26,
        }}>
          {score}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Filter Controls Bar */}
      <div className="glass-card cyber-corner animate-fade-in-up" style={{
        padding: '2rem 2.25rem',
        background: 'rgba(14, 14, 18, 0.95)',
        backdropFilter: 'blur(32px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.8)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="tag" style={{ fontSize: '0.7rem' }}>
                INVESTIGATION REGISTRY // DOSSIER MATRIX
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                • Root Cause Analysis Enabled
              </span>
            </div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              Active Security Cases & RCA
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              Every graph and case below includes an automated Root Cause Analysis (RCA) report and kill-chain timeline.
            </p>
          </div>

          <Link
            to="/cases/new"
            onClick={() => cyberAudio.playLaserBlip()}
            className="btn-pill btn-pill-primary"
            style={{
              padding: '0.65rem 1.5rem',
              fontSize: '0.86rem',
            }}
          >
            <Plus size={16} color="#060608" strokeWidth={2.4} />
            <span>Create New Case</span>
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.85rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          alignItems: 'center',
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              className="input"
              style={{ paddingLeft: '2.4rem', height: 44, fontSize: '0.85rem' }}
              placeholder="Search by Case ID, entity, vector or suspect…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search cases"
            />
          </div>

          {/* Risk Filter */}
          <div style={{ position: 'relative' }}>
            <select
              className="select"
              style={{ height: 44, paddingRight: '2rem', fontSize: '0.82rem' }}
              value={riskFilter}
              onChange={e => {
                cyberAudio.playChirp(800, 0.02);
                setRiskFilter(e.target.value);
              }}
              aria-label="Filter by risk"
            >
              {riskLevels.map(r => <option key={r} value={r} style={{ background: '#0e0d15', color: '#fff' }}>{r}</option>)}
            </select>
            <ChevronRight size={13} color="#94a3b8" style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
          </div>

          {/* Status Filter */}
          <div style={{ position: 'relative' }}>
            <select
              className="select"
              style={{ height: 44, paddingRight: '2rem', fontSize: '0.82rem' }}
              value={statusFilter}
              onChange={e => {
                cyberAudio.playChirp(800, 0.02);
                setStatusFilter(e.target.value);
              }}
              aria-label="Filter by status"
            >
              {statusOptions.map(s => <option key={s} value={s} style={{ background: '#0e0d15', color: '#fff' }}>{s}</option>)}
            </select>
            <ChevronRight size={13} color="#94a3b8" style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Cases List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filtered.length === 0 ? (
          <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
            <FolderOpen size={40} color="#94a3b8" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 700 }}>No matching incident cases found</h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.25rem' }}>Try clearing filters or search criteria.</p>
          </div>
        ) : (
          filtered.map(c => {
            const rca = mockRCAReports[c.id];
            return (
              <div
                key={c.id}
                className="glass-card cyber-corner animate-fade-in-up"
                style={{
                  padding: '1.75rem 2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
                  {/* Left Column: Details */}
                  <div style={{ flex: 1, minWidth: 300 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
                      <span className="tag">{c.id}</span>
                      <span className={`badge ${riskConfig[c.risk]?.badgeClass}`}>
                        {c.risk} SEVERITY
                      </span>
                      <span className={`status-badge ${statusConfig[c.status]?.badgeClass}`}>
                        {statusConfig[c.status]?.label}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: 'auto' }}>
                        Logged: {formatDate(c.createdAt)}
                      </span>
                    </div>

                    <h2 style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: '#ffffff',
                      marginBottom: '0.35rem',
                    }}>
                      {c.title}
                    </h2>

                    <div style={{
                      fontSize: '0.78rem',
                      color: '#94a3b8',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}>
                      <span>Target: <strong style={{ color: '#ffffff' }}>{c.company}</strong></span>
                      <span>•</span>
                      <span>Vector: <strong style={{ color: '#ffffff' }}>{c.type}</strong></span>
                      <span>•</span>
                      <span>Operator: <strong style={{ color: '#ffffff' }}>{c.assignedTo}</strong></span>
                    </div>

                    <p style={{
                      fontSize: '0.85rem',
                      color: '#cbd5e1',
                      lineHeight: 1.6,
                      marginBottom: '1rem',
                    }}>
                      {c.summary}
                    </p>

                    {/* Root cause highlight if present */}
                    {rca && (
                      <div style={{
                        padding: '0.875rem 1rem',
                        borderRadius: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                            DETERMINED ROOT CAUSE:
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600, marginTop: '2px' }}>
                            {rca.rootCause.primaryDefect}
                          </div>
                        </div>
                        <span className="tag" style={{ fontFamily: 'monospace' }}>
                          {rca.rootCause.cveCode.split(':')[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Score, Artifacts & Actions */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '0.875rem',
                    flexShrink: 0,
                    minWidth: 180,
                  }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                        Threat Risk Index
                      </div>
                      {riskScoreBar(c.riskScore)}
                    </div>

                    <div style={{
                      fontSize: '0.72rem',
                      color: '#cbd5e1',
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '0.2rem 0.65rem',
                      borderRadius: '9999px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      fontWeight: 600,
                    }}>
                      {c.evidenceCount} artifacts ingested
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                      {rca && (
                        <button
                          onClick={() => {
                            cyberAudio.playLaserBlip();
                            setActiveRCACaseId(c.id);
                          }}
                          className="btn-pill btn-pill-primary"
                          style={{ padding: '0.45rem 1rem', fontSize: '0.78rem' }}
                        >
                          <FileText size={13} color="#060608" strokeWidth={2.4} />
                          <span>View RCA Report</span>
                        </button>
                      )}

                      <Link
                        to={`/cases/${c.id}/analysis`}
                        onClick={() => cyberAudio.playLaserBlip()}
                        className="btn-pill btn-pill-glass"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.78rem' }}
                      >
                        <BarChart2 size={13} />
                        <span>AI Analysis</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
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
