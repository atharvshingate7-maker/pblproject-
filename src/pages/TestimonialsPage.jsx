import React from 'react';
import { Quote, MessageSquareQuote, Shield, Award, CheckCircle2 } from 'lucide-react';
import { mockTestimonials } from '../data/mockRCAReports';

export default function TestimonialsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card cyber-corner animate-fade-in-up" style={{ padding: '2rem 2.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="tag" style={{ fontSize: '0.7rem' }}>
            ENTERPRISE VALIDATION // CISO TESTIMONIALS
          </span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>• Proven Defense Results</span>
        </div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          fontFamily: "'Space Grotesk', sans-serif",
          color: '#ffffff',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          Founder & Operator Testimonials
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
          Trusted by cybersecurity executives and forensic responders safeguarding critical assets.
        </p>
      </div>

      {/* Testimonials Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem',
      }}>
        {mockTestimonials.map(t => (
          <div
            key={t.id}
            className="glass-card cyber-corner animate-fade-in-up"
            style={{
              padding: '2.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.75rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span className="tag">{t.badge}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                    {t.metric}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                    {t.metricLabel}
                  </div>
                </div>
              </div>

              <Quote size={28} color="#64748b" style={{ marginBottom: '1rem', opacity: 0.7 }} />

              <p style={{
                fontSize: '0.92rem',
                color: '#ffffff',
                lineHeight: 1.7,
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                "{t.quote}"
              </p>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '1.25rem',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #64748b 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.8rem', color: '#060608',
              }}>
                {t.author.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                  {t.author}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {t.role} · <strong style={{ color: '#cbd5e1' }}>{t.company}</strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

