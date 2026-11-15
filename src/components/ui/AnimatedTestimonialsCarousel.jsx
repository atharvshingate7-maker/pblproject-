import React, { useState, useEffect, useRef } from 'react';
import { Quote, ChevronLeft, ChevronRight, ShieldCheck, ArrowRight, Award, Star } from 'lucide-react';
import { cyberAudio } from '../../utils/cyberAudio';

// Import local high-resolution portraits
import vikramImg from '../../assets/testimonials/vikramaditya.jpg';
import sunitaImg from '../../assets/testimonials/sunita.jpg';
import karanImg from '../../assets/testimonials/karan.jpg';
import elenaImg from '../../assets/testimonials/elena.jpg';

export const TESTIMONIAL_CAROUSEL_DATA = [
  {
    id: 't-1',
    author: 'Vikramaditya Rao',
    role: 'Chief Information Security Officer',
    company: 'FinBridge Capital India',
    badge: 'BFSI Tier-1',
    metric: '₹1.2 Cr',
    metricLabel: 'Fraud Loss Prevented',
    quote: 'CyberIntel AI pinpointed the exact thread-hijack anomaly in our CEO communication within 4 minutes. The automated attack graph and RCA report allowed our executive board to act before wire clearance.',
    image: vikramImg,
    stat: '4 min response',
    highlight: 'CEO Thread-Hijack Intercepted',
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
    image: sunitaImg,
    stat: '0 patient files lost',
    highlight: 'Clinical Database Preserved',
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
    image: karanImg,
    stat: '100% Cryptographic Proof',
    highlight: 'Insider Exfiltration Quashed',
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
    image: elenaImg,
    stat: 'Gold Standard Unified Triage',
    highlight: 'Rapid Response Under 5 Mins',
  },
];

export default function AnimatedTestimonialsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const count = TESTIMONIAL_CAROUSEL_DATA.length;

  // Auto-advance every 5.5s unless hovered
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, count]);

  const handleStep = (direction) => {
    cyberAudio.playChirp(850, 0.02);
    setActiveIndex((prev) => (prev + direction + count) % count);
  };

  const handleSelect = (idx) => {
    cyberAudio.playChirp(920, 0.02);
    setActiveIndex(idx);
  };

  const activeItem = TESTIMONIAL_CAROUSEL_DATA[activeIndex];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.75rem',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 3D Perspective Stage */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '430px',
          perspective: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {TESTIMONIAL_CAROUSEL_DATA.map((t, idx) => {
          // Calculate offset relative to active index
          let offset = idx - activeIndex;
          if (offset < -Math.floor(count / 2)) offset += count;
          if (offset > Math.floor(count / 2)) offset -= count;

          const isCurrent = offset === 0;
          const isLeft = offset === -1 || (offset === count - 1 && count > 2);
          const isRight = offset === 1 || (offset === -(count - 1) && count > 2);
          const isVisible = isCurrent || isLeft || isRight;

          if (!isVisible) return null;

          // Compute transform properties for smooth 3D stage layout
          let translateX = '0%';
          let translateZ = 0;
          let rotateY = 0;
          let scale = 1;
          let opacity = 1;
          let zIndex = 10;

          if (isCurrent) {
            translateX = '0%';
            translateZ = 60;
            rotateY = 0;
            scale = 1;
            opacity = 1;
            zIndex = 10;
          } else if (isLeft) {
            translateX = '-52%';
            translateZ = -120;
            rotateY = 18;
            scale = 0.86;
            opacity = 0.45;
            zIndex = 5;
          } else if (isRight) {
            translateX = '52%';
            translateZ = -120;
            rotateY = -18;
            scale = 0.86;
            opacity = 0.45;
            zIndex = 5;
          }

          return (
            <div
              key={t.id}
              onClick={() => !isCurrent && handleSelect(idx)}
              style={{
                position: 'absolute',
                width: '100%',
                maxWidth: 680,
                height: 360,
                transform: `translateX(${translateX}) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                zIndex,
                transition: 'all 0.55s cubic-bezier(0.2, 0.8, 0.2, 1)',
                cursor: isCurrent ? 'default' : 'pointer',
                userSelect: 'none',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  boxSizing: 'border-box',
                  background: isCurrent
                    ? 'rgba(16, 18, 26, 0.88)'
                    : 'rgba(10, 11, 16, 0.65)',
                  backdropFilter: 'blur(28px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                  border: isCurrent
                    ? '1px solid rgba(56, 189, 248, 0.35)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '1.75rem',
                  padding: '1.8rem 2.2rem',
                  boxShadow: isCurrent
                    ? '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(56, 189, 248, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
                    : '0 15px 40px rgba(0, 0, 0, 0.8)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {/* Header: Tag + Metric */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#38bdf8',
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 9999,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {t.badge}
                    </span>

                    <span style={{ fontSize: '0.64rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ShieldCheck size={13} /> Verified Deployment
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 900,
                        color: '#ffffff',
                        fontFamily: "'Space Grotesk', sans-serif",
                        lineHeight: 1.1,
                        textShadow: '0 0 16px rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      {t.metric}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                      {t.metricLabel}
                    </div>
                  </div>
                </div>

                {/* Quote Content with Quotation Mark */}
                <div style={{ position: 'relative', paddingLeft: '1.25rem', borderLeft: '3px solid rgba(56, 189, 248, 0.4)', flex: 1, display: 'flex', alignItems: 'center', margin: '0.5rem 0' }}>
                  <Quote
                    size={26}
                    color="#38bdf8"
                    style={{ position: 'absolute', top: -4, left: -24, opacity: 0.35 }}
                  />
                  <p
                    style={{
                      fontSize: '0.95rem',
                      color: '#f1f5f9',
                      lineHeight: 1.65,
                      fontFamily: "'Space Grotesk', sans-serif",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    "{t.quote}"
                  </p>
                </div>

                {/* Author Card Footer with Portrait Image */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingTop: '1rem',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    {/* Executive Portrait with Glowing Ring */}
                    <div
                      style={{
                        position: 'relative',
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        padding: 2,
                        background: isCurrent
                          ? 'linear-gradient(135deg, #38bdf8, #818cf8)'
                          : 'rgba(255, 255, 255, 0.2)',
                        boxShadow: isCurrent ? '0 0 20px rgba(56, 189, 248, 0.4)' : 'none',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={t.image}
                        alt={t.author}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '1rem',
                          fontWeight: 800,
                          color: '#ffffff',
                          fontFamily: "'Space Grotesk', sans-serif",
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {t.author}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                        {t.role} · <strong style={{ color: '#e2e8f0' }}>{t.company}</strong>
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#cbd5e1',
                      background: 'rgba(255, 255, 255, 0.06)',
                      padding: '0.35rem 0.8rem',
                      borderRadius: 9999,
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      fontFamily: 'monospace',
                    }}
                  >
                    ★ {t.stat}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls & Executive Avatar Dock (Strictly Fixed Constant Sizing) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          justifyContent: 'center',
        }}
      >
        {/* Previous Button */}
        <button
          onClick={() => handleStep(-1)}
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'rgba(15, 17, 24, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
            flexShrink: 0,
          }}
          title="Previous Testimonial"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Thumbnail Selector Dock: Invariant Width & Identical Circular Avatars */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(12, 14, 20, 0.85)',
            backdropFilter: 'blur(16px)',
            padding: '0.45rem 0.85rem',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          {TESTIMONIAL_CAROUSEL_DATA.map((t, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <button
                key={t.id}
                onClick={() => handleSelect(idx)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  padding: 2,
                  background: isSelected ? 'linear-gradient(135deg, #38bdf8, #818cf8)' : 'rgba(255, 255, 255, 0.06)',
                  border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.18)',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  boxShadow: isSelected ? '0 0 16px rgba(56, 189, 248, 0.65)' : 'none',
                  transform: isSelected ? 'scale(1.12)' : 'scale(0.95)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: 'none',
                }}
                title={t.author}
              >
                <img
                  src={t.image}
                  alt={t.author}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    filter: isSelected ? 'none' : 'grayscale(100%) opacity(0.48)',
                    transition: 'all 0.25s ease',
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handleStep(1)}
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'rgba(15, 17, 24, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
            flexShrink: 0,
          }}
          title="Next Testimonial"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
