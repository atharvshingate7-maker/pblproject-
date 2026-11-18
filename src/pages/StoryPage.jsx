import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Network, FileText, ChevronRight, ChevronLeft, Shield, Activity, Lock, AlertTriangle, Eye, ArrowUpRight, ArrowRight, ExternalLink } from 'lucide-react';
import { mockRCAReports, mockTestimonials } from '../data/mockRCAReports';
import { mockCases } from '../data/mockCases';
import AttackGraphVisualizer from '../components/common/AttackGraphVisualizer';
import RCAReportModal from '../components/common/RCAReportModal';
import { cyberAudio } from '../utils/cyberAudio';
import { generateCaseCardTexture } from '../utils/caseCardRenderer';

// Asset imports
import robotImg from '../assets/robot.jpg';
import paradiseImg from '../assets/paradise.jpeg';
import bgVelocityImg from '../assets/bg_velocity.jpg';
import bgSokolovaImg from '../assets/bg_sokolova.jpg';
import DitherHelixCarousel from '../components/ui/DitherHelixCarousel';
import AnimatedTestimonialsCarousel from '../components/ui/AnimatedTestimonialsCarousel';
import BackendHubFrame from '../components/backend/BackendHubFrame';

/* ─── Liquid Glassmorphism Core Style ───────────────────────── */
const liquidGlassCard = {
  background: 'rgba(14, 14, 20, 0.65)',
  backdropFilter: 'blur(24px) saturate(160%)',
  WebkitBackdropFilter: 'blur(24px) saturate(160%)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '1.5rem',
  boxShadow: '0 18px 48px rgba(0, 0, 0, 0.75), inset 0 1px 1px 0 rgba(255, 255, 255, 0.22)',
  position: 'relative',
  overflow: 'hidden',
};

/* ─── Scroll helper (finds the snap container by id) ─────────── */
const scrollToSection = (sectionId) => {
  cyberAudio.playChirp(900, 0.02);
  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

/* ─── Section wrapper ───────────────────────────────────────── */
function Frame({ id, children, style = {} }) {
  return (
    <section
      id={id}
      style={{
        scrollSnapAlign: 'start',
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#060608',
        ...style,
      }}
    >
      {children}
    </section>
  );
}

/* ─── Section label ─────────────────────────────────────────── */
function Tag({ children }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      fontSize: '0.62rem',
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: '#94a3b8',
      background: 'rgba(255, 255, 255, 0.04)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      padding: '0.3rem 0.85rem',
      borderRadius: 9999,
      fontFamily: "'Space Grotesk', sans-serif",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ffffff', display: 'inline-block' }} />
      {children}
    </span>
  );
}

/* ─── FRAME 1: HERO (Pure Matte Dark + Liquid Glassmorphism) ─── */
function HeroFrame() {
  return (
    <Frame id="hero">
      {/* Ambient specular glow orbs (NO image background) */}
      <div style={{
        position: 'absolute', top: '-15%', left: '15%',
        width: 700, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, rgba(148, 163, 184, 0.02) 40%, transparent 70%)',
        filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '10%',
        width: 600, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Content grid */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.15fr) minmax(360px, 0.85fr)',
        gap: '3rem',
        alignItems: 'center',
        width: '100%',
        maxWidth: 1260,
        margin: '0 auto',
        padding: '0 2.5rem',
        minHeight: '100vh',
      }}>
        {/* LEFT – Typography & Action Pillars */}
        <div>
          {/* Step tracker pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.85rem',
            padding: '0.35rem 1.1rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 9999,
            marginBottom: '2rem',
            fontSize: '0.62rem', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            fontFamily: "'Space Grotesk', sans-serif",
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          }}>
            <span style={{ color: '#64748b' }}>MEASURE</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>•</span>
            <span style={{ color: '#ffffff' }}>ANALYZE</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>•</span>
            <span style={{ color: '#64748b' }}>IMPLEMENT</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>•</span>
            <span style={{ color: '#64748b' }}>RCA REPORT</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.6rem, 5.2vw, 4.4rem)',
            fontWeight: 900,
            fontFamily: "'Space Grotesk', sans-serif",
            color: '#ffffff',
            lineHeight: 1.05,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            marginBottom: '1.4rem',
          }}>
            AUTONOMOUS<br />
            THREAT<br />
            <span style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #64748b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>INTELLIGENCE</span>
          </h1>

          <p style={{
            fontSize: '1rem', color: '#94a3b8', lineHeight: 1.75,
            maxWidth: 520, marginBottom: '2.25rem',
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            Precision vector correlation, dynamic attack progression graphs, and
            automated Root Cause Analysis dossiers for high‑stakes forensic response.
          </p>

          {/* CTA buttons with Liquid Glass */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <button
              onClick={() => { cyberAudio.playChirp(1100, 0.03); scrollToSection('attack-graph'); }}
              className="btn-pill btn-pill-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.85rem' }}
            >
              <Network size={16} /> <span>Explore Attack Graph</span>
            </button>
            <button
              onClick={() => { cyberAudio.playChirp(900, 0.02); scrollToSection('cases'); }}
              className="btn-pill btn-pill-glass"
              style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.85rem' }}
            >
              <FileText size={16} /> <span>View Cases & RCA</span>
            </button>
          </div>

          {/* Metrics Trio */}
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
            {[
              { val: '22%', label: 'Reduction in avg threat dwell time' },
              { val: '35%', label: 'Faster automated root cause triage' },
              { val: '$40M+', label: 'Threat exposure prevented' },
            ].map(m => (
              <div key={m.val}>
                <div style={{
                  fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                  fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif",
                  color: '#ffffff', lineHeight: 1, marginBottom: '0.4rem',
                }}>{m.val}</div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', maxWidth: 135 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT – Liquid Glass Portrait Card */}
        <div style={{
          ...liquidGlassCard,
          borderRadius: '2rem',
          height: '520px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.5rem',
        }}>
          {/* Top header badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                NEURAL SENTINEL // ONLINE
              </span>
            </div>
            <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontFamily: 'monospace' }}>
              CORE-v2.6
            </span>
          </div>

          {/* Centered Robot Avatar in Liquid Glass Frame */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '360px',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.4)',
          }}>
            <img
              src={robotImg}
              alt="AI Threat Hunter"
              className="robot-frame"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 20%',
                filter: 'contrast(1.1) brightness(0.95)',
              }}
            />
            {/* Shimmer gradient overlay */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
              background: 'linear-gradient(to top, rgba(14, 14, 20, 0.95), transparent)',
            }} />
          </div>

          {/* Bottom Card Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 2,
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                AI Forensic Agent
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                Multi-Modal Kill-Chain Topology Ingestion
              </div>
            </div>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '0.25rem 0.65rem',
              borderRadius: 9999,
              background: '#ffffff',
              color: '#060608',
            }}>
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Scroll indicator pill */}
      <div
        onClick={() => scrollToSection('attack-graph')}
        style={{
          position: 'absolute', bottom: '1.5rem', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '0.4rem', cursor: 'pointer', zIndex: 3,
        }}>
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: '#64748b', textTransform: 'uppercase' }}>SCROLL</span>
        <div style={{ width: 1.5, height: 24, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.4))', borderRadius: 2 }} />
      </div>
    </Frame>
  );
}

/* ─── FRAME 2: ATTACK PROGRESSION TOPOLOGY (Content-Rich) ────── */
function AttackGraphFrame() {
  const [selectedCaseId, setSelectedCaseId] = useState('CY-2024-047');
  const [activeRCAReport, setActiveRCAReport] = useState(null);
  const activeReport = mockRCAReports[selectedCaseId] || mockRCAReports['CY-2024-047'];

  const openRCA = (caseId) => {
    const report = mockRCAReports[caseId] || mockRCAReports[selectedCaseId];
    if (report) {
      cyberAudio.playLaserBlip();
      setActiveRCAReport(report);
    }
  };

  return (
    <Frame id="attack-graph" style={{ background: '#060608' }}>
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1260, width: '100%', margin: '0 auto',
        padding: '3.75rem 2.5rem 1.75rem',
        display: 'flex', flexDirection: 'column', gap: '0.95rem',
      }}>
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Tag>LIVE THREAT RECONSTRUCTION // GRAPH TOPOLOGY</Tag>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
              fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif",
              color: '#ffffff', textTransform: 'uppercase',
              letterSpacing: '0.04em', marginTop: '0.6rem',
            }}>Attack Progression Topology</h2>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '0.3rem', fontFamily: "'Space Grotesk', sans-serif" }}>
              Inspect reconstructed kill-chain vectors from entry-point probe to final data egress with real-time vector analysis.
            </p>
          </div>

          {/* Case Selector Tabs */}
          <div style={{
            ...liquidGlassCard,
            padding: '0.35rem 0.5rem',
            borderRadius: '9999px',
            display: 'flex',
            gap: '0.4rem',
            flexWrap: 'wrap',
          }}>
            {Object.keys(mockRCAReports).map(id => {
              const isSelected = selectedCaseId === id;
              return (
                <button
                  key={id}
                  onClick={() => { cyberAudio.playChirp(850, 0.02); setSelectedCaseId(id); }}
                  style={{
                    padding: '0.4rem 1rem', borderRadius: '9999px',
                    fontSize: '0.74rem', fontWeight: 700,
                    fontFamily: "'Space Grotesk', sans-serif",
                    background: isSelected ? '#ffffff' : 'transparent',
                    color: isSelected ? '#060608' : '#94a3b8',
                    border: 'none', cursor: 'pointer',
                    transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                  }}
                >
                  {id} · {mockRCAReports[id].targetCompany.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Attack Graph Visualizer Container with Liquid Glassmorphism */}
        <div style={{ ...liquidGlassCard, padding: '1.5rem' }}>
          <AttackGraphVisualizer
            caseId={selectedCaseId}
            graph={activeReport?.attackGraph}
            report={activeReport}
            onOpenRCA={openRCA}
            onViewRCA={openRCA}
          />
        </div>

        {/* RCA Summary Card with Direct Launch */}
        {activeReport && (
          <div style={{
            ...liquidGlassCard,
            padding: '1.25rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8',
                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.3rem',
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8' }} />
                ROOT CAUSE ANALYSIS // {selectedCaseId} — {activeReport.targetCompany}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.5 }}>
                {activeReport.rootCause?.primaryDefect || activeReport.primaryRootCause}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => openRCA(selectedCaseId)}
                className="btn-pill btn-pill-primary"
                style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}
              >
                <FileText size={14} /> Open Full RCA Dossier
              </button>
            </div>
          </div>
        )}
      </div>

      {activeRCAReport && (
        <RCAReportModal report={activeRCAReport} onClose={() => setActiveRCAReport(null)} />
      )}
    </Frame>
  );
}

/* ─── FRAME 3: ACTIVE SECURITY CASES & RCA (3D Dither Helix Animation) ─ */
function CasesFrame() {
  const navigate = useNavigate();
  const [activeRCACaseId, setActiveRCACaseId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);

  // Take top 6 cases for the 3D spiral column
  const caseList = useMemo(() => (mockCases || []).slice(0, 6), []);

  // Generate real-time high-res canvas textures for each case card
  const helixItems = useMemo(() => {
    return caseList.map((c) => {
      const rca = mockRCAReports[c.id];
      const textureUrl = generateCaseCardTexture(c, rca);
      return {
        id: c.id,
        image: textureUrl,
        title: `${c.id} · ${c.title.split('—')[0].trim()}`,
        caseData: c,
        rcaReport: rca,
      };
    });
  }, [caseList]);

  const currentItem = helixItems[activeIndex] || helixItems[0];
  const currentCase = currentItem?.caseData || caseList[0];
  const currentRCA = currentItem?.rcaReport || (currentCase ? mockRCAReports[currentCase.id] : null);

  const riskColor = (level) => {
    if (!level) return '#64748b';
    const l = level.toLowerCase();
    if (l === 'critical') return '#f87171';
    if (l === 'high') return '#fbbf24';
    if (l === 'medium') return '#38bdf8';
    return '#64748b';
  };

  const handleStep = (by) => {
    cyberAudio.playChirp(850, 0.02);
    carouselRef.current?.step(by);
  };

  const handleGoTo = (idx) => {
    cyberAudio.playChirp(900, 0.02);
    setActiveIndex(idx);
    carouselRef.current?.goTo(idx);
  };

  return (
    <Frame id="cases" style={{ background: '#060608', minHeight: '1050px', height: 'auto', paddingBottom: '3.5rem' }}>
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1400, width: '100%', margin: '0 auto',
        padding: '3.75rem 2.5rem 1rem',
        display: 'flex', flexDirection: 'column', gap: '1rem',
        height: 'auto',
      }}>
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Tag>INVESTIGATION REGISTRY // 3D HELIX TELEMETRY</Tag>
            <h2 style={{
              fontSize: 'clamp(1.7rem, 2.8vw, 2.3rem)',
              fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif",
              color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.35rem',
            }}>Active Security Cases & RCA</h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: "'Space Grotesk', sans-serif", maxWidth: 620 }}>
              Live 3D forensic spiral monitoring active threat vectors. Spin or click any case to inspect telemetry, vector graphs, and automated RCA dossiers.
            </p>
          </div>

          {/* Case Switcher Tabs & Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{
              ...liquidGlassCard,
              padding: '0.35rem 0.5rem',
              borderRadius: '9999px',
              display: 'flex',
              gap: '0.35rem',
              flexWrap: 'wrap',
            }}>
              {caseList.map((c, idx) => {
                const isSelected = activeIndex === idx;
                const isDDoS = c.id === 'CY-2024-042' || c.type === 'DDoS';
                const label = isDDoS ? `${c.id} · DDoS Attack (ShopZest)` : `${c.id} · ${c.company.replace('Pvt Ltd', '').replace('Systems', '').replace('Capital', '').replace('Solutions', '').trim()}`;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleGoTo(idx)}
                    style={{
                      padding: '0.35rem 0.85rem', borderRadius: '9999px',
                      fontSize: '0.72rem', fontWeight: 700,
                      fontFamily: "'Space Grotesk', sans-serif",
                      background: isSelected ? '#ffffff' : 'transparent',
                      color: isSelected ? '#060608' : '#94a3b8',
                      border: isDDoS && !isSelected ? '1px solid rgba(56, 189, 248, 0.4)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                      boxShadow: isSelected ? '0 0 16px rgba(255, 255, 255, 0.4)' : 'none',
                    }}
                  >
                    <span style={{
                      display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                      background: riskColor(c.risk), marginRight: 6
                    }} />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Direct Case Actions */}
            {currentCase && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    cyberAudio.playLaserBlip();
                    navigate(`/cases/${currentCase.id}/analysis`);
                  }}
                  className="btn-pill btn-pill-primary"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
                >
                  <span>View in Detail</span> <ArrowRight size={13} />
                </button>

                <button
                  onClick={() => {
                    cyberAudio.playLaserBlip();
                    setActiveRCACaseId(currentCase.id);
                  }}
                  className="btn-pill btn-pill-glass"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
                >
                  <FileText size={13} /> <span>Quick RCA</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── 3D Dither Helix Cases Spiral (Unboxed, Pure Floating 3D Canvas, Large Size) ─── */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '840px',
          minHeight: '840px',
          margin: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}>
          {/* Subtle Floating Navigation Controls */}
          <div style={{
            position: 'absolute', top: '0.5rem', right: '0.75rem', zIndex: 10,
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            background: 'rgba(10, 10, 14, 0.75)', backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '0.35rem 0.75rem', borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          }}>
            <button
              onClick={() => handleStep(-1)}
              style={{
                background: 'transparent', border: 'none', color: '#ffffff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem'
              }}
              title="Rotate to previous case"
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{
              fontSize: '0.68rem', color: '#cbd5e1', fontFamily: 'monospace', fontWeight: 700,
              letterSpacing: '0.08em', padding: '0 0.3rem'
            }}>
              CASE {String(activeIndex + 1).padStart(2, '0')} / {String(helixItems.length).padStart(2, '0')}
            </span>

            <button
              onClick={() => handleStep(1)}
              style={{
                background: 'transparent', border: 'none', color: '#ffffff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem'
              }}
              title="Rotate to next case"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* 3D Helix WebGL Canvas Scene (Unboxed, Floating Large Canvas) */}
          <DitherHelixCarousel
            ref={carouselRef}
            items={helixItems}
            accent="#38bdf8"
            cell={3.5}
            cardRatio={1.826}
            twist={0.58}
            rise={0.76}
            focusBand={0.68}
            showOverlay={false}
            style={{ height: '840px', width: '100%', background: 'transparent' }}
            onActiveChange={(idx) => setActiveIndex(idx)}
            onSelect={(idx, item) => {
              cyberAudio.playLaserBlip();
              navigate(`/cases/${item.id}/analysis`);
            }}
          />
        </div>
      </div>

      {activeRCACaseId && (
        <RCAReportModal caseId={activeRCACaseId} onClose={() => setActiveRCACaseId(null)} />
      )}
    </Frame>
  );
}

/* ─── FRAME 4: TESTIMONIALS (3D Liquid Glass Carousel) ─────── */
function TestimonialsFrame() {
  return (
    <Frame id="testimonials" style={{ background: '#060608', minHeight: '100vh', height: 'auto', paddingBottom: '4.5rem' }}>
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1260, width: '100%', margin: '0 auto',
        padding: '5rem 2.5rem 3rem',
        display: 'flex', flexDirection: 'column', gap: '2.5rem',
        height: 'auto',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <Tag>ENTERPRISE VALIDATION // CISO TESTIMONIALS</Tag>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
            fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif",
            color: '#ffffff', textTransform: 'uppercase',
            letterSpacing: '0.04em', marginTop: '0.6rem', marginBottom: '0.4rem',
          }}>Founder & Operator Testimonials</h2>
          <p style={{ fontSize: '0.86rem', color: '#94a3b8', fontFamily: "'Space Grotesk', sans-serif", maxWidth: 650, margin: '0 auto' }}>
            Trusted by cybersecurity executives and forensic responders safeguarding critical infrastructure.
          </p>
        </div>

        {/* 3D Liquid Glass Testimonials Carousel with Real Executive Portraits */}
        <AnimatedTestimonialsCarousel />
      </div>
    </Frame>
  );
}

/* ─── MAIN STORY PAGE ─────────────────────────────────────────── */
export default function StoryPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    window.__storyScrollContainer = containerRef.current;
  }, []);

  return (
    <div
      ref={containerRef}
      id="story-scroll-container"
      style={{
        height: '100%',
        overflowY: 'auto',
        scrollSnapType: 'y proximity',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorY: 'contain',
      }}
    >
      <HeroFrame />
      <AttackGraphFrame />
      <CasesFrame />
      <BackendHubFrame />
      <TestimonialsFrame />
    </div>
  );
}
