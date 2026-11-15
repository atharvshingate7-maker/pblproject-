import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Brain, Shield, AlertTriangle, Clock, CheckCircle,
  FileText, Users, Globe, Server, Info, Search,
  ChevronDown, ChevronUp, AlertCircle, Download,
  Eye, Target, Lightbulb, HelpCircle, ArrowRight, ArrowLeft,
  Activity, Database, Terminal, Lock
} from 'lucide-react';
import { mockAnalysis, mockDDoSAnalysis } from '../data/mockAnalysis';
import { mockCases } from '../data/mockCases';
import { mockRCAReports } from '../data/mockRCAReports';
import { formatDateTime } from '../utils/formatters';
import { cyberAudio } from '../utils/cyberAudio';

// ── Sub-components ─────────────────────────────────────────────────────────────

const liquidGlassCard = {
  background: 'rgba(14, 14, 20, 0.75)',
  backdropFilter: 'blur(24px) saturate(160%)',
  WebkitBackdropFilter: 'blur(24px) saturate(160%)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '1.25rem',
  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.18)',
  position: 'relative',
};

function SectionHeader({ icon: Icon, title, subtitle, color = '#38bdf8', count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
      <div style={{ width: 34, height: 34, borderRadius: '0.6rem', background: `${color}18`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={17} color={color} strokeWidth={2} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em', fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h3>
          {count !== undefined && (
            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
              {count}
            </span>
          )}
        </div>
        {subtitle && <p style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.1rem' }}>{subtitle}</p>}
      </div>
    </div>
  );
}

function RiskGauge({ score, level }) {
  const color = score >= 85 ? '#f87171' : score >= 65 ? '#fbbf24' : '#34d399';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 0.75rem' }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 50 * score / 100} ${2 * Math.PI * 50 * (1 - score / 100)}`}
            strokeDashoffset={2 * Math.PI * 50 * 0.25}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.25,1,0.5,1)' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', lineHeight: 1, fontFamily: "'Space Grotesk', sans-serif" }}>{score}</span>
          <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>/ 100</span>
        </div>
      </div>
      <span style={{
        display: 'inline-block', fontSize: '0.72rem', fontWeight: 700,
        padding: '0.2rem 0.75rem', borderRadius: '9999px',
        background: `${color}20`, color, border: `1px solid ${color}40`,
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        {level} Risk
      </span>
    </div>
  );
}

function ConfidenceBar({ value, color = '#38bdf8' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 9999 }} />
      </div>
      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', minWidth: 36, textAlign: 'right', fontFamily: 'monospace' }}>{value}%</span>
    </div>
  );
}

function FindingCard({ finding }) {
  const [expanded, setExpanded] = useState(false);
  const sevColor = finding.severity === 'critical' ? '#f87171' : finding.severity === 'high' ? '#fbbf24' : '#34d399';
  const sevBg    = `${sevColor}18`;
  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem',
      overflow: 'hidden', marginBottom: '0.625rem',
      background: 'rgba(255,255,255,0.02)',
      borderLeft: `3px solid ${sevColor}`,
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.875rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '0.25rem', background: sevBg, color: sevColor, border: `1px solid ${sevColor}33`, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
          {finding.severity}
        </span>
        <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 600, color: '#ffffff' }}>{finding.title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500, fontFamily: 'monospace' }}>
            {finding.confidence}% confidence
          </span>
          {expanded ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
        </div>
      </button>
      {expanded && (
        <div style={{ padding: '0 1rem 1rem' }}>
          <div style={{ marginBottom: '0.625rem' }}>
            <ConfidenceBar value={finding.confidence} color={sevColor} />
          </div>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '0.625rem' }}>
            {finding.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.72rem', color: '#64748b' }}>
            <FileText size={11} />
            <span>Source: <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>{finding.source}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

function InconsistencyCard({ item }) {
  const sevColor = item.severity === 'high' ? '#fbbf24' : '#34d399';
  return (
    <div style={{
      border: `1px solid ${sevColor}33`, borderRadius: '0.75rem', padding: '1rem',
      background: `${sevColor}08`, marginBottom: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
        <AlertTriangle size={14} color={sevColor} />
        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>{item.title}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', background: `${sevColor}20`, color: sevColor, textTransform: 'uppercase' }}>
          {item.severity}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        {[item.source1, item.source2].map((src, i) => (
          <div key={i} style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>{src.label}</div>
            <div style={{ fontSize: '0.83rem', fontWeight: 700, color: i === 0 ? '#38bdf8' : '#f87171' }}>{src.value}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '0.5rem' }}>{item.description}</p>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem', padding: '0.5rem 0.75rem', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '0.5rem', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
        <Lightbulb size={12} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span style={{ fontSize: '0.75rem', color: '#7dd3fc', lineHeight: 1.5 }}>{item.recommendation}</span>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'summary',         label: 'AI Summary',     icon: Brain },
  { id: 'findings',        label: 'Findings',       icon: Target },
  { id: 'entities',        label: 'Entities',       icon: Globe },
  { id: 'timeline',        label: 'Timeline',       icon: Clock },
  { id: 'inconsistencies', label: 'Inconsistencies',icon: AlertTriangle },
  { id: 'missing',         label: 'Missing Info',   icon: HelpCircle },
  { id: 'evidence',        label: 'Evidence',       icon: Database },
  { id: 'recommendations', label: 'Recommendations',icon: Lightbulb },
];

export default function CaseAnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  const activeCaseId = id || 'CY-2024-047';
  const targetCase = mockCases.find(c => c.id === activeCaseId) || mockCases[0];
  const targetRca = mockRCAReports[activeCaseId] || mockRCAReports[targetCase.id] || mockRCAReports['CY-2024-047'];

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.25rem' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '1.25rem',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 0 30px rgba(56, 189, 248, 0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Brain size={28} color="#38bdf8" style={{ animation: 'pulse 1.5s ease infinite' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8',
            textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem',
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            AI CORRELATION & FORENSIC DOSSIER
          </div>
          <p style={{ fontWeight: 800, color: '#ffffff', fontSize: '1.1rem', fontFamily: "'Space Grotesk', sans-serif" }}>
            Ingesting Forensic Evidence for {activeCaseId}
          </p>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Compiling SIEM logs, packet captures, and attack progression topology…
          </p>
        </div>
        <div style={{ width: 220, height: 5, borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
          <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #38bdf8, #818cf8)', borderRadius: '9999px', animation: 'loadbar 1.5s ease-in-out infinite' }} />
        </div>
        <style>{`
          @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
          @keyframes loadbar { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        `}</style>
      </div>
    );
  }

  // Select base analysis template (DDoS specific for CY-2024-042)
  const baseAnalysis = activeCaseId === 'CY-2024-042' ? mockDDoSAnalysis : mockAnalysis;

  // Synthesize case data with RCA and base analysis
  const a = {
    ...baseAnalysis,
    caseId: targetCase.id,
    title: targetCase.title,
    company: targetCase.company,
    riskScore: targetCase.riskScore,
    riskLevel: targetCase.risk === 'critical' ? 'Critical' : targetCase.risk === 'high' ? 'High' : 'Medium',
    aiSummary: targetRca?.rootCause?.summary 
      ? `${targetRca.rootCause.summary}\n\nPrimary Defect Identified: ${targetRca.rootCause.primaryDefect}\n\nAttack Vector: ${targetRca.rootCause.attackVector}`
      : baseAnalysis.aiSummary,
    timeline: targetRca?.timeline?.map(t => ({
      time: t.time,
      event: t.event,
      type: t.event.toLowerCase().includes('inconsistency') ? 'inconsistency' : t.event.toLowerCase().includes('exfiltration') || t.event.toLowerCase().includes('ransom') || t.event.toLowerCase().includes('surge') || t.event.toLowerCase().includes('timeouts') ? 'danger' : 'info',
    })) || baseAnalysis.timeline,
  };

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: '2rem 2.5rem 5rem',
      maxWidth: 1280,
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Top Bar Back Button & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          onClick={() => {
            cyberAudio.playChirp(900, 0.02);
            navigate('/#cases');
          }}
          className="btn-pill btn-pill-glass"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.45rem 1.1rem' }}
        >
          <ArrowLeft size={14} /> Back to Cases & RCA
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => {
              cyberAudio.playLaserBlip();
              window.print();
            }}
            className="btn-pill btn-pill-glass"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem' }}
          >
            <Download size={13} />
            <span>Export Official Dossier</span>
          </button>
        </div>
      </div>

      {/* Case Header with Liquid Glassmorphism */}
      <div style={{ ...liquidGlassCard, padding: '1.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.65rem',
                borderRadius: '9999px', background: 'rgba(255,255,255,0.08)',
                color: '#ffffff', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.15)',
              }}>{a.caseId}</span>

              <span style={{
                fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.04em',
                background: a.riskLevel === 'Critical' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                color: a.riskLevel === 'Critical' ? '#f87171' : '#fbbf24',
                border: `1px solid ${a.riskLevel === 'Critical' ? 'rgba(248, 113, 113, 0.35)' : 'rgba(251, 191, 36, 0.35)'}`,
                padding: '0.15rem 0.6rem', borderRadius: '9999px', textTransform: 'uppercase',
              }}>
                {a.riskLevel} RISK
              </span>

              <span style={{
                fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em',
                background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.28)', padding: '0.15rem 0.6rem',
                borderRadius: '9999px', textTransform: 'uppercase',
              }}>
                AI ANALYSIS COMPLETE • {a.aiConfidence}% CONFIDENCE
              </span>

              <span style={{
                fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em',
                background: 'rgba(52, 211, 153, 0.12)', color: '#34d399',
                border: '1px solid rgba(52, 211, 153, 0.28)', padding: '0.15rem 0.6rem',
                borderRadius: '9999px', textTransform: 'uppercase',
              }}>
                EVIDENCE VERIFIED • SOURCE MATCHED
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)',
              fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif",
              color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '0.35rem',
            }}>
              {a.title}
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Target Organization: <strong style={{ color: '#ffffff' }}>{a.company}</strong> · Processing Time: <strong style={{ color: '#ffffff' }}>{a.processingTime}</strong> · Lead Investigator: <strong style={{ color: '#ffffff' }}>{targetCase.assignedTo || 'Atharv Shingate'}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>
              {a.riskScore}
            </div>
            <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.2rem' }}>
              THREAT RISK INDEX
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.875rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Risk Score',   value: `${a.riskScore}/100`,  color: a.riskScore >= 90 ? '#f87171' : '#fbbf24' },
          { label: 'AI Confidence',value: `${a.aiConfidence}%`,  color: '#38bdf8' },
          { label: 'Findings',     value: a.findings.length,      color: '#f87171' },
          { label: 'Inconsistencies', value: a.inconsistencies.length, color: '#fbbf24' },
          { label: 'Evidence Files', value: targetCase.evidenceCount || a.evidence.length, color: '#34d399' },
          { label: 'Attack Stage', value: 'Exfiltration', color: '#c084fc' },
        ].map((s) => (
          <div key={s.label} style={{ ...liquidGlassCard, padding: '1rem 1.15rem' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: s.color, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.4rem' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation with Liquid Glassmorphism */}
      <div style={{ ...liquidGlassCard, padding: '0.4rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.1rem' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  cyberAudio.playChirp(1000, 0.02);
                  setActiveTab(tab.id);
                }}
                className={`btn-pill ${isActive ? 'btn-pill-primary' : 'btn-pill-glass'}`}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.45rem 0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Display */}
      <div key={activeTab}>
        {/* ── AI SUMMARY ── */}
        {activeTab === 'summary' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 260px', gap: '1.25rem', alignItems: 'start' }}>
            <div style={{ ...liquidGlassCard, padding: '1.6rem' }}>
              <SectionHeader icon={Brain} title="AI Summary & Incident Reconstruction" subtitle="Autonomous multi-vector synthesis compiled by CyberIntel AI Core" color="#38bdf8" />
              <div style={{
                background: 'rgba(56, 189, 248, 0.04)', border: '1px solid rgba(56, 189, 248, 0.12)',
                borderRadius: '0.85rem', padding: '1.25rem',
              }}>
                <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.8, whiteSpace: 'pre-line', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {a.aiSummary}
                </p>
              </div>

              {targetRca?.rootCause?.primaryDefect && (
                <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(248, 113, 113, 0.06)', border: '1px solid rgba(248, 113, 113, 0.2)', borderRadius: '0.75rem' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#f87171', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    DETERMINED ROOT CAUSE // FORENSIC CONCLUSION
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#ffffff', fontWeight: 600 }}>
                    {targetRca.rootCause.primaryDefect}
                  </div>
                  {targetRca.rootCause.cveCode && (
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                      Ref: {targetRca.rootCause.cveCode}
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', color: '#94a3b8' }}>
                <Brain size={13} color="#38bdf8" />
                <span>AI Confidence: <strong style={{ color: '#ffffff' }}>{a.aiConfidence}%</strong></span>
                <span style={{ margin: '0 0.4rem' }}>·</span>
                <span>Based on {targetCase.evidenceCount || a.evidence.length} correlated forensic evidence files</span>
              </div>
            </div>

            <div>
              <div style={{ ...liquidGlassCard, padding: '1.4rem', marginBottom: '1rem' }}>
                <SectionHeader icon={Shield} title="Risk Gauge" color="#f87171" />
                <RiskGauge score={a.riskScore} level={a.riskLevel} />
              </div>

              <div style={{ ...liquidGlassCard, padding: '1.4rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem' }}>
                  AI Confidence Metrics
                </div>
                <ConfidenceBar value={a.aiConfidence} color="#38bdf8" />
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                    { label: 'Evidence Quality', val: 88 },
                    { label: 'Pattern Match',    val: 94 },
                    { label: 'Cross-Reference',  val: 82 },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                        <span>{item.label}</span>
                        <span style={{ color: '#ffffff', fontWeight: 600 }}>{item.val}%</span>
                      </div>
                      <ConfidenceBar value={item.val} color="#64748b" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FINDINGS ── */}
        {activeTab === 'findings' && (
          <div style={{ ...liquidGlassCard, padding: '1.6rem' }}>
            <SectionHeader icon={Target} title="Key Forensic Findings" subtitle="AI-identified indicators of compromise, exfiltration paths, and abnormal behavior" color="#f87171" count={a.findings.length} />
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem', fontSize: '0.78rem', color: '#94a3b8' }}>
              Click any finding below to inspect technical specifics, confidence ratings, and source evidence traceability.
            </div>
            {a.findings.map(f => <FindingCard key={f.id} finding={f} />)}
          </div>
        )}

        {/* ── ENTITIES ── */}
        {activeTab === 'entities' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {/* IPs */}
            <div style={{ ...liquidGlassCard, padding: '1.4rem' }}>
              <SectionHeader icon={Globe} title="Correlated IP Addresses" color="#38bdf8" count={a.extractedEntities.ips.length} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {a.extractedEntities.ips.map((ip, i) => {
                  const fc = ip.flag === 'critical' ? '#f87171' : ip.flag === 'high' ? '#fbbf24' : '#34d399';
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: fc, background: `${fc}15`, border: `1px solid ${fc}33`, padding: '0.2rem 0.55rem', borderRadius: '0.35rem', fontFamily: 'monospace' }}>
                        {ip.value}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{ip.type} · {ip.note}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Domains */}
            <div style={{ ...liquidGlassCard, padding: '1.4rem' }}>
              <SectionHeader icon={Globe} title="Domains & Endpoints" color="#c084fc" count={a.extractedEntities.domains.length} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {a.extractedEntities.domains.map((d, i) => (
                  <div key={i} style={{ padding: '0.75rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c084fc', background: 'rgba(192, 132, 252, 0.12)', border: '1px solid rgba(192, 132, 252, 0.25)', padding: '0.2rem 0.55rem', borderRadius: '0.35rem', display: 'inline-block', marginBottom: '0.25rem', fontFamily: 'monospace' }}>
                      {d.value}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{d.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Users */}
            <div style={{ ...liquidGlassCard, padding: '1.4rem' }}>
              <SectionHeader icon={Users} title="Users & Accounts" color="#fbbf24" count={a.extractedEntities.users.length} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {a.extractedEntities.users.map((u, i) => {
                  const fc = u.flag === 'critical' ? '#f87171' : u.flag === 'high' ? '#fbbf24' : '#e2e8f0';
                  return (
                    <div key={i} style={{ padding: '0.85rem', borderRadius: '0.6rem', background: u.flag === 'critical' ? 'rgba(248, 113, 113, 0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${u.flag === 'critical' ? 'rgba(248, 113, 113, 0.25)' : 'rgba(255,255,255,0.06)'}` }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: fc, fontFamily: 'monospace' }}>{u.value}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>{u.role}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{u.note}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Systems */}
            <div style={{ ...liquidGlassCard, padding: '1.4rem' }}>
              <SectionHeader icon={Server} title="Impacted Systems & Infrastructure" color="#34d399" count={a.extractedEntities.systems.length} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {a.extractedEntities.systems.map((s, i) => (
                  <div key={i} style={{ padding: '0.75rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff' }}>{s.value}</div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.2rem' }}>{s.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TIMELINE ── */}
        {activeTab === 'timeline' && (
          <div style={{ ...liquidGlassCard, padding: '1.6rem' }}>
            <SectionHeader icon={Clock} title="Chronological Incident Timeline" subtitle="Reconstructed kill-chain sequence of events correlated from SIEM & log artifacts" color="#38bdf8" count={a.timeline.length} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {a.timeline.map((item, i) => {
                const dotColor = item.type === 'danger' ? '#f87171' : item.type === 'inconsistency' ? '#c084fc' : '#38bdf8';
                return (
                  <div key={i} style={{
                    padding: '0.9rem 1.15rem', borderRadius: '0.75rem',
                    background: item.type === 'danger' ? 'rgba(248, 113, 113, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${item.type === 'danger' ? 'rgba(248, 113, 113, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderLeft: `4px solid ${dotColor}`,
                  }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: dotColor, fontFamily: 'monospace', marginBottom: '0.35rem' }}>
                      {item.time}
                      {item.type === 'inconsistency' && <span style={{ marginLeft: '0.5rem', background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontSize: '0.62rem' }}>⚠ Forensic Discrepancy</span>}
                    </div>
                    <p style={{ fontSize: '0.86rem', color: '#e2e8f0', lineHeight: 1.6 }}>{item.event}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── INCONSISTENCIES ── */}
        {activeTab === 'inconsistencies' && (
          <div style={{ ...liquidGlassCard, padding: '1.6rem' }}>
            <SectionHeader icon={AlertTriangle} title="Forensic Inconsistencies" subtitle="Cross-source discrepancies requiring officer corroboration" color="#fbbf24" count={a.inconsistencies.length} />
            <div style={{
              padding: '0.9rem 1.2rem',
              background: 'rgba(251, 191, 36, 0.08)',
              border: '1px solid rgba(251, 191, 36, 0.25)',
              borderRadius: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <AlertCircle size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  ANOMALY DETECTION // OFFICER AUDIT REQUIRED
                </div>
                <div style={{ fontSize: '0.8rem', color: '#e2e8f0', marginTop: '0.15rem' }}>
                  These cross-source discrepancies indicate deliberate staging or clock-drift anomalies. Manual verification is strongly advised before submission to court or legal counsel.
                </div>
              </div>
            </div>
            {a.inconsistencies.map(item => <InconsistencyCard key={item.id} item={item} />)}
          </div>
        )}

        {/* ── MISSING INFO ── */}
        {activeTab === 'missing' && (
          <div style={{ ...liquidGlassCard, padding: '1.6rem' }}>
            <SectionHeader icon={HelpCircle} title="Missing Information & Evidence Gaps" subtitle="Identified forensic blind spots that may impact investigation completeness" color="#c084fc" count={a.missingInfo.length} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {a.missingInfo.map(item => {
                const pc = item.priority === 'critical' ? '#f87171' : item.priority === 'high' ? '#fbbf24' : '#38bdf8';
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderLeft: `3px solid ${pc}` }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '9999px', background: `${pc}18`, color: pc, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0, marginTop: '0.1rem' }}>
                      {item.priority}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>{item.item}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{item.reason}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── EVIDENCE ── */}
        {activeTab === 'evidence' && (
          <div style={{ ...liquidGlassCard, padding: '1.6rem' }}>
            <SectionHeader icon={Database} title="Submitted Evidence Registry" subtitle="Verified forensic evidence files with SHA-256 hashes and linked findings" color="#34d399" count={a.evidence.length} />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#64748b' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>FILE NAME</th>
                    <th style={{ padding: '0.75rem 1rem' }}>TYPE</th>
                    <th style={{ padding: '0.75rem 1rem' }}>SIZE</th>
                    <th style={{ padding: '0.75rem 1rem' }}>PARSED BY</th>
                    <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
                    <th style={{ padding: '0.75rem 1rem' }}>LINKED FINDINGS</th>
                  </tr>
                </thead>
                <tbody>
                  {a.evidence.map(ev => (
                    <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{ev.name}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace' }}>{ev.id}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.5rem', borderRadius: '0.3rem', color: '#cbd5e1' }}>{ev.type}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>{ev.size}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>{ev.analyzedBy}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#34d399', background: 'rgba(52, 211, 153, 0.12)', padding: '0.15rem 0.5rem', borderRadius: 9999 }}>ANALYZED</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {ev.keyFindings.map(f => (
                            <span key={f} style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '0.25rem', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── RECOMMENDATIONS ── */}
        {activeTab === 'recommendations' && (
          <div style={{ ...liquidGlassCard, padding: '1.6rem' }}>
            <SectionHeader icon={Lightbulb} title="Automated Remediation & Countermeasures" subtitle="Actionable security protocols and mitigation guidance" color="#fbbf24" count={a.recommendations.length} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {a.recommendations.map((rec, i) => {
                const pc = rec.priority === 'immediate' ? '#f87171' : rec.priority === 'high' ? '#fbbf24' : '#38bdf8';
                return (
                  <div key={rec.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.15rem', borderRadius: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderLeft: `4px solid ${pc}` }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${pc}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 900, color: pc }}>{i + 1}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '0.15rem 0.55rem', borderRadius: '9999px', background: `${pc}18`, color: pc, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', display: 'inline-block' }}>
                        {rec.priority}
                      </span>
                      <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.6 }}>{rec.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
