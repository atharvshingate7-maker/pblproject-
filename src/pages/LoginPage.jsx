import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Eye, EyeOff, Lock, Mail, AlertCircle,
  ArrowRight, KeyRound, Cpu, Globe, Activity
} from 'lucide-react';
import { useAuth, CURRENT_USER } from '../context/AuthContext';
import { cyberAudio } from '../utils/cyberAudio';

const stats = [
  { label: 'Uptime', value: '99.98%', sub: 'Zero-trust verified', icon: Activity, color: '#34d399' },
  { label: 'Threat Nodes', value: '4.2K+', sub: 'Active telemetry matrix', icon: Globe, color: '#ffffff' },
  { label: 'AI Models', value: '12',    sub: 'Neural forensic engines', icon: Cpu, color: '#e2e8f0' },
  { label: 'Cases',    value: '3.8K',   sub: 'Resolved dossiers', icon: Shield, color: '#cbd5e1' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('atharv.shingate@cyberintel.gov.in');
  const [password, setPassword] = useState('CyberIntel2026Secure!');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotMsg, setForgotMsg] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      cyberAudio.playAlertAlarm();
      setError('Please provide your credentials.');
      return;
    }
    setLoading(true);
    cyberAudio.playLaserBlip();
    try {
      await login({ email, password });
      cyberAudio.playAccessGranted();
      navigate('/', { replace: true });
    } catch {
      cyberAudio.playAlertAlarm();
      setError('Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setEmail('atharv.shingate@cyberintel.gov.in');
    setPassword('CyberIntel2026Secure!');
    setLoading(true);
    cyberAudio.playLaserBlip();
    try {
      await login({ email: 'atharv.shingate@cyberintel.gov.in', password: 'CyberIntel2026Secure!' });
      cyberAudio.playAccessGranted();
      navigate('/dashboard', { replace: true });
    } catch {
      cyberAudio.playAlertAlarm();
      setError('Unable to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: 1040,
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      gap: '3rem',
      alignItems: 'center',
      position: 'relative',
      zIndex: 2,
    }}>
      {/* ── Left: Context Panel (Monochrome Tech / Reference Aesthetic) ── */}
      <div className="animate-fade-in-up" style={{ padding: '1rem' }}>

        {/* Technical telemetry marker & breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div className="tech-checker-mark">
            <span /><span /><span /><span /><span /><span />
          </div>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#94a3b8',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            SYSTEM ACCESS // CYBERINTEL AI
          </span>
        </div>

        {/* Brand pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.3rem 0.85rem',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          marginBottom: '1.5rem',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffffff', animation: 'pulseLive 2s infinite' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Neural Forensic Matrix
          </span>
        </div>

        {/* Hero heading - Wide Display Typography */}
        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 2.9rem)',
          fontWeight: 800,
          fontFamily: "'Space Grotesk', sans-serif",
          color: '#ffffff',
          lineHeight: 1.15,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '1.25rem',
        }}>
          INTELLIGENCE <br />
          <span style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #64748b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            OPTIMIZATION
          </span>
        </h1>

        <p style={{
          fontSize: '0.92rem',
          color: '#94a3b8',
          lineHeight: 1.7,
          marginBottom: '2.25rem',
          maxWidth: 440,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          Autonomous forensic correlation, multi-vector threat ingestion, and cryptographic chain reconstruction.
        </p>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', maxWidth: 440 }}>
          {stats.map(({ label, value, sub, icon: Icon, color }) => (
            <div
              key={label}
              className="cyber-corner"
              style={{
                background: 'rgba(16, 16, 20, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '0.875rem',
                padding: '1rem 1.125rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                transition: 'all 0.22s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {label}
                </span>
                <div style={{
                  width: 26, height: 26, borderRadius: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={13} color={color} />
                </div>
              </div>
              <div className="num-sci-fi" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.25rem' }}>
                {sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Login Card ── */}
      <div className="animate-fade-in-up delay-100" style={{ width: '100%', maxWidth: 440, justifySelf: 'center' }}>
        <div style={{
          background: 'rgba(14, 14, 18, 0.90)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          borderRadius: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Top chrome metallic accent bar */}
          <div style={{
            height: 2,
            background: 'linear-gradient(90deg, #ffffff, #cbd5e1, #64748b)',
          }} />

          {/* Section Step Tracker like reference */}
          <div className="tech-step-tracker">
            <span>MEASURE</span>
            <span className="active">ANALYZE</span>
            <span>IMPLEMENT</span>
            <span>MORE</span>
          </div>

          <div style={{ padding: '2rem 2.25rem 1.75rem' }}>
            {/* Brand header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
              <div style={{
                width: 44, height: 44,
                borderRadius: '0.875rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #64748b 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(255, 255, 255, 0.25)',
                position: 'relative',
              }}>
                <Shield size={22} color="#060608" strokeWidth={2.4} />
                <span style={{
                  position: 'absolute', top: 3, right: 3,
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#ffffff',
                  border: '1.5px solid #060608',
                  animation: 'pulseLive 2s infinite',
                }} />
              </div>
              <div>
                <div style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: '#ffffff',
                  letterSpacing: '0.06em',
                }}>
                  CYBER<span style={{ color: '#cbd5e1' }}>INTEL</span> AI
                </div>
                <div style={{
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  color: '#94a3b8',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}>
                  Zero-Trust Authentication
                </div>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(248, 113, 113, 0.14)',
                border: '1px solid rgba(248, 113, 113, 0.35)',
                borderRadius: '0.75rem',
                padding: '0.625rem 0.875rem',
                marginBottom: '1.25rem',
              }}>
                <AlertCircle size={14} color="#f87171" />
                <span style={{ fontSize: '0.8rem', color: '#fca5a5', fontWeight: 500 }}>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="input-label" htmlFor="email">Operator Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="#94a3b8" style={{
                    position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }} />
                  <input
                    id="email"
                    type="email"
                    className="input"
                    style={{ paddingLeft: '2.5rem', height: 44 }}
                    placeholder="atharv.shingate@cyberintel.gov.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="input-label" htmlFor="password">Passcode / Key</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#94a3b8" style={{
                    position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem', height: 44 }}
                    placeholder="Enter password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => { cyberAudio.playChirp(750, 0.02); setShowPassword(!showPassword); }}
                    style={{
                      position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                      color: '#94a3b8',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember / Forgot */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '1.5rem', fontSize: '0.78rem',
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: '#94a3b8' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#ffffff', width: 14, height: 14, cursor: 'pointer' }}
                  />
                  Remember terminal
                </label>
                <button
                  type="button"
                  onClick={() => setForgotMsg(true)}
                  style={{
                    background: 'none', border: 'none',
                    color: '#ffffff', fontWeight: 600,
                    cursor: 'pointer', fontSize: '0.78rem',
                  }}
                >
                  Forgot token?
                </button>
              </div>

              {forgotMsg && (
                <div style={{
                  fontSize: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  color: '#cbd5e1',
                  marginBottom: '1rem',
                }}>
                  Contact Security Officer (Ext: 8942) or insert YubiKey.
                </div>
              )}

              {/* Sign In button with Glass Effect */}
              <button
                type="submit"
                disabled={loading}
                className="btn-pill btn-pill-primary"
                style={{
                  width: '100%', height: 46,
                  fontSize: '0.9rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.5rem',
                  borderRadius: '0.875rem',
                  letterSpacing: '0.04em',
                }}
              >
                {loading ? (
                  <span style={{
                    width: 18, height: 18,
                    border: '2px solid rgba(0,0,0,0.4)',
                    borderTopColor: '#000',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.65s linear infinite',
                  }} />
                ) : (
                  <>
                    <span>Authenticate</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Quick demo with Glass Effect */}
            <div style={{ marginTop: '0.875rem' }}>
              <button
                type="button"
                onClick={handleQuickDemo}
                className="btn-pill btn-pill-glass"
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: '0.875rem',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <KeyRound size={13} />
                <span>Quick Access: <strong>Atharv Shingate</strong></span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '0.75rem 2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: '0.68rem', color: '#94a3b8',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#34d399' }}>
              <Lock size={11} color="#34d399" />
              256-bit encrypted
            </span>
            <span>Node: CY-8942 · Hardware Verified</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
