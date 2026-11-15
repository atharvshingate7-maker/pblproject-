import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, ArrowRight, Plus, Terminal, ExternalLink,
  ChevronRight, Network, FileText, CheckCircle2,
  FolderOpen, MessageSquareQuote, Lock, Globe, AlertTriangle,
  Zap, Award, Quote
} from 'lucide-react';
import { mockCases } from '../data/mockCases';
import { mockRCAReports, mockTestimonials } from '../data/mockRCAReports';
import AttackGraphVisualizer from '../components/common/AttackGraphVisualizer';
import RCAReportModal from '../components/common/RCAReportModal';
import { cyberAudio } from '../utils/cyberAudio';

export default function DashboardPage() {
  const [selectedGraphCaseId, setSelectedGraphCaseId] = useState('CY-2024-047');
  const [activeRCACaseId, setActiveRCACaseId] = useState(null);

  const activeGraphReport = mockRCAReports[selectedGraphCaseId] || mockRCAReports['CY-2024-047'];

  const scrollTo = (id) => {
    cyberAudio.playChirp(900, 0.02);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-24">
      {/* ========================================================
          HERO SECTION: Minimal, Spacious & Uncongested
          (Directly inspired by the reference design)
          ======================================================== */}
      <section style={{
        padding: '3rem 0 2rem',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Step tracker hairline bar from reference */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1.25rem',
          padding: '0.4rem 1.25rem',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '2rem',
          fontSize: '0.68rem',
          fontWeight: 700,
          color: '#94a3b8',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          <span>MEASURE</span>
          <span style={{ color: '#ffffff' }}>•</span>
          <span style={{ color: '#ffffff' }}>ANALYZE</span>
          <span style={{ color: '#ffffff' }}>•</span>
          <span>IMPLEMENT</span>
          <span style={{ color: '#ffffff' }}>•</span>
          <span>RCA REPORT</span>
        </div>

        {/* Hero Title: Wide Futuristic Display Typography */}
        <h1 style={{
          fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
          fontWeight: 800,
          fontFamily: "'Space Grotesk', sans-serif",
          color: '#ffffff',
          lineHeight: 1.1,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          maxWidth: 960,
          margin: '0 auto 1.5rem',
        }}>
          AUTONOMOUS THREAT <br />
          <span style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 45%, #64748b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            INTELLIGENCE & DEFENSE
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
          color: '#94a3b8',
          lineHeight: 1.7,
          maxWidth: 680,
          margin: '0 auto 2.5rem',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 400,
        }}>
          Precision vector correlation, dynamic attack progression graphs, and automated Root Cause Analysis (RCA) dossiers for high-stakes forensic response.
        </p>

        {/* Action Buttons with Liquid Glass Distortion Effect */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '4.5rem',
        }}>
          <button
            onClick={() => scrollTo('attack-graph')}
            className="btn-pill btn-pill-primary"
            style={{ padding: '0.75rem 1.8rem', fontSize: '0.9rem' }}
          >
            <Network size={16} color="#060608" strokeWidth={2.4} />
            <span>Explore Attack Graph</span>
          </button>

          <button
            onClick={() => scrollTo('cases')}
            className="btn-pill btn-pill-glass"
            style={{ padding: '0.75rem 1.8rem', fontSize: '0.9rem' }}
          >
            <FolderOpen size={16} color="#ffffff" />
            <span>Inspect Cases & RCA</span>
          </button>

          <button
            onClick={() => scrollTo('testimonials')}
            className="btn-pill btn-pill-dark"
            style={{ padding: '0.75rem 1.8rem', fontSize: '0.9rem' }}
          >
            <MessageSquareQuote size={16} color="#ffffff" />
            <span>Testimonials</span>
          </button>
        </div>

        {/* 3 Clean Minimal Metric Callouts with Hairline Dividers (Reference Style) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          maxWidth: 1080,
          margin: '0 auto',
          textAlign: 'left',
        }}>
          {/* Metric 1 */}
          <div style={{
            padding: '1.75rem',
            borderRadius: '1.25rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
          }}>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>
              22%
            </div>
            <div style={{ width: '100%', height: 1, background: 'rgba(255, 255, 255, 0.12)', margin: '0.75rem 0' }} />
            <div style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600 }}>
              reduction in average threat dwell time
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Real-time multi-source log ingestion & cryptographic correlation
            </div>
          </div>

          {/* Metric 2 */}
          <div style={{
            padding: '1.75rem',
            borderRadius: '1.25rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
          }}>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>
              35%
            </div>
            <div style={{ width: '100%', height: 1, background: 'rgba(255, 255, 255, 0.12)', margin: '0.75rem 0' }} />
            <div style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600 }}>
              faster automated root cause triage
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Automated CVE identification & kill-chain timeline generation
            </div>
          </div>

          {/* Metric 3 */}
          <div style={{
            padding: '1.75rem',
            borderRadius: '1.25rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
          }}>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>
              $40M+
            </div>
            <div style={{ width: '100%', height: 1, background: 'rgba(255, 255, 255, 0.12)', margin: '0.75rem 0' }} />
            <div style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600 }}>
              threat exposure prevented
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Across monitored BFSI, healthcare, and critical infrastructure
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 1: ATTACKING GRAPH
          Interactive vector progression topology with case selector
          ======================================================== */}
      <section id="attack-graph" style={{ paddingTop: '2rem' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="tag" style={{ fontSize: '0.7rem' }}>01 // THREAT TOPOLOGY</span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Live Attack Surface Mapping</span>
            </div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              Interactive Attacking Graph
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: 620, marginTop: '0.35rem' }}>
              Select a security case to inspect its real-time attack path from origin asset to exfiltration node. Each graph includes an automated Root Cause Analysis dossier.
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
              const isSelected = selectedGraphCaseId === id;
              return (
                <button
                  key={id}
                  onClick={() => { cyberAudio.playChirp(850, 0.02); setSelectedGraphCaseId(id); }}
                  style={{
                    padding: '0.45rem 0.85rem',
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

        {/* Active Attack Graph Component */}
        <AttackGraphVisualizer
          graph={activeGraphReport.attackGraph}
          caseId={selectedGraphCaseId}
          onOpenRCA={(id) => setActiveRCACaseId(id)}
        />
      </section>

      {/* ========================================================
          SECTION 2: CASES WITH ROOT CAUSE ANALYSIS (RCA)
          Every case is linked to an interactive RCA report
          ======================================================== */}
      <section id="cases" style={{ paddingTop: '2rem' }}>
        <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="tag" style={{ fontSize: '0.7rem' }}>02 // FORENSIC DOSSIERS</span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Cryptographically Verified Cases</span>
            </div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              Cases & RCA Reports
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: 680, marginTop: '0.35rem' }}>
              Each case below features an integrated attack progression graph and an instant **Root Cause Analysis (RCA)** dossier with CVE mappings, forensic timeline, and verified remediations.
            </p>
          </div>

          <Link
            to="/cases"
            onClick={() => cyberAudio.playChirp(800, 0.02)}
            className="btn-pill btn-pill-glass"
            style={{ fontSize: '0.8rem', padding: '0.45rem 1.1rem' }}
          >
            <span>View Full Registry ({mockCases.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Grid of Case Cards with RCA Trigger */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}>
          {mockCases.slice(0, 4).map(c => {
            const rca = mockRCAReports[c.id];
            return (
              <div
                key={c.id}
                className="glass-card cyber-corner"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                }}
              >
                <div>
                  {/* Card top tags */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="tag">{c.id}</span>
                      <span className={`badge ${c.risk === 'critical' ? 'badge-critical' : 'badge-high'}`}>
                        {c.risk}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                      Score: {c.riskScore}/100
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    fontFamily: "'Space Grotesk', sans-serif",
                    lineHeight: 1.3,
                    marginBottom: '0.5rem',
                  }}>
                    {c.title}
                  </h3>

                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1rem' }}>
                    {c.summary}
                  </p>

                  {/* RCA Highlight Box */}
                  {rca && (
                    <div style={{
                      padding: '0.875rem 1rem',
                      borderRadius: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      marginBottom: '1rem',
                    }}>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                        DETERMINED ROOT CAUSE DEFECT:
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#ffffff', fontWeight: 600, marginTop: '0.2rem' }}>
                        {rca.rootCause.primaryDefect}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                        {rca.rootCause.cveCode}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '1rem',
                  gap: '0.5rem',
                }}>
                  {rca ? (
                    <button
                      onClick={() => {
                        cyberAudio.playLaserBlip();
                        setActiveRCACaseId(c.id);
                      }}
                      className="btn-pill btn-pill-primary"
                      style={{ fontSize: '0.78rem', padding: '0.45rem 1rem' }}
                    >
                      <FileText size={14} color="#060608" strokeWidth={2.2} />
                      <span>View RCA Report</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>RCA Processing</span>
                  )}

                  <Link
                    to={`/cases/${c.id}/analysis`}
                    onClick={() => cyberAudio.playChirp(900, 0.02)}
                    className="btn-pill btn-pill-glass"
                    style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}
                  >
                    <span>Analysis</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          SECTION 3: TESTIMONIALS (CISO & Operator Endorsements)
          Minimalist, high-contrast, brutalist design
          ======================================================== */}
      <section id="testimonials" style={{ paddingTop: '2rem' }}>
        <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="tag" style={{ fontSize: '0.7rem' }}>03 // VALIDATION</span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Enterprise Defense Feedback</span>
          </div>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            Trusted By Security Founders & CISOs
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', maxWidth: 640, margin: '0.4rem auto 0' }}>
            Proven in live incidents across critical infrastructure, defense banking sectors, and high-frequency cloud clusters.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}>
          {mockTestimonials.map(t => (
            <div
              key={t.id}
              className="glass-card cyber-corner"
              style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.5rem',
              }}
            >
              <div>
                {/* Metric pill at top of testimonial */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <span className="tag" style={{ fontSize: '0.68rem' }}>{t.badge}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                      {t.metric}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                      {t.metricLabel}
                    </div>
                  </div>
                </div>

                <Quote size={24} color="#64748b" style={{ marginBottom: '0.75rem', opacity: 0.7 }} />

                <p style={{
                  fontSize: '0.88rem',
                  color: '#ffffff',
                  lineHeight: 1.65,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontStyle: 'normal',
                }}>
                  "{t.quote}"
                </p>
              </div>

              {/* Author footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '1rem',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #64748b 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.75rem', color: '#060608',
                }}>
                  {t.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                    {t.author}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    {t.role} · <strong style={{ color: '#cbd5e1' }}>{t.company}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          INTERACTIVE ROOT CAUSE ANALYSIS (RCA) MODAL
          ======================================================== */}
      {activeRCACaseId && (
        <RCAReportModal
          report={mockRCAReports[activeRCACaseId]}
          onClose={() => setActiveRCACaseId(null)}
        />
      )}
    </div>
  );
}
