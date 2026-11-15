import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Bell, Shield, Check, AlertTriangle, FileText,
  Upload, LogOut, ChevronDown, CheckCheck, Sparkles,
  ExternalLink, UserCheck, Volume2, VolumeX, Clock,
  Network, MessageSquareQuote, FolderOpen, Plus, Menu, X
} from 'lucide-react';
import { useAuth, CURRENT_USER } from '../../context/AuthContext';
import { cyberAudio } from '../../utils/cyberAudio';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'AI Correlation Confirmed',
    description: 'High-risk exfiltration detected in Case CY-2024-047 (TechVault Incident)',
    time: '4 min ago',
    type: 'danger',
    unread: true,
    link: '/cases/CY-2024-047/analysis',
    caseId: 'CY-2024-047',
  },
  {
    id: 'notif-2',
    title: 'Evidence Files Ingested',
    description: '3 packet capture files verified via SHA-256 for MediCore Systems',
    time: '28 min ago',
    type: 'info',
    unread: true,
    link: '/cases',
    caseId: 'CY-2024-046',
  },
  {
    id: 'notif-3',
    title: 'Anomalous Traffic Detected',
    description: 'C2 beaconing signatures active on port 8443',
    time: '1 hr ago',
    type: 'danger',
    unread: true,
    link: '/cases',
    caseId: 'CY-2024-044',
  },
  {
    id: 'notif-4',
    title: 'RCA Report Generated',
    description: 'Root cause analysis compiled for Case CY-2024-043',
    time: '3 hrs ago',
    type: 'success',
    unread: false,
    link: '/cases',
    caseId: 'CY-2024-043',
  },
];

export default function Topbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const activeUser = user || CURRENT_USER;

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(() => cyberAudio.isEnabled());
  const [currentTime, setCurrentTime] = useState('');

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      setCurrentTime(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setProfileOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggleAudio = () => {
    const next = cyberAudio.toggle();
    setAudioEnabled(next);
    if (next) cyberAudio.playChirp(1200, 0.04);
  };

  const markAllAsRead = () => {
    cyberAudio.playLaserBlip();
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const handleLogout = () => {
    cyberAudio.playAlertAlarm();
    logout();
    navigate('/login', { replace: true });
  };

  const [activeSection, setActiveSection] = useState('hero');

  // Track active section as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'attack-graph', 'cases', 'testimonials'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 260 && rect.bottom >= 140) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    const container = document.getElementById('story-scroll-container');
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home',            scrollId: 'hero',          icon: Shield },
    { label: 'Attacking Graph', scrollId: 'attack-graph',  icon: Network },
    { label: 'Cases & RCA',     scrollId: 'cases',         icon: FolderOpen },
    { label: 'Testimonials',    scrollId: 'testimonials',  icon: MessageSquareQuote },
  ];

  const handleNavClick = (scrollId) => {
    setActiveSection(scrollId);
    cyberAudio.playChirp(900, 0.02);
    setMobileMenuOpen(false);

    const container = document.getElementById('story-scroll-container');
    const el = document.getElementById(scrollId);

    if (location.pathname !== '/' && location.pathname !== '/story' && location.pathname !== '/dashboard') {
      navigate('/#' + scrollId);
      setTimeout(() => {
        const target = document.getElementById(scrollId);
        const cont = document.getElementById('story-scroll-container');
        if (cont && target) {
          cont.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
        } else if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return;
    }

    if (scrollId === 'hero') {
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (container && el) {
      container.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header style={{
      height: 72,
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(8, 8, 11, 0.88)',
      backdropFilter: 'blur(24px) saturate(160%)',
      WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.8)',
      overflow: 'visible',
    }}>
      <div style={{
        maxWidth: 1320,
        margin: '0 auto',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        gap: '1.5rem',
        overflow: 'visible',
      }}>
        {/* Left: Brand Logo */}
        <Link
          to="/dashboard"
          onClick={() => cyberAudio.playChirp(1100, 0.03)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none', flexShrink: 0 }}
        >
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #64748b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(255, 255, 255, 0.25)',
            position: 'relative',
          }}>
            <Shield size={20} color="#060608" strokeWidth={2.4} />
            <span style={{
              position: 'absolute', top: 2, right: 2,
              width: 7, height: 7, borderRadius: '50%',
              background: '#ffffff',
              border: '1.5px solid #060608',
              animation: 'pulseLive 2s infinite',
            }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#ffffff',
              letterSpacing: '0.06em',
              lineHeight: 1.15,
            }}>
              CYBER<span style={{ color: '#cbd5e1' }}>INTEL</span>
              <span style={{
                fontSize: '0.58rem',
                background: '#ffffff',
                color: '#060608',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontWeight: 800,
                marginLeft: '0.4rem',
                letterSpacing: '0.04em',
              }}>
                AI
              </span>
            </div>
            <div style={{
              fontSize: '0.62rem',
              fontWeight: 600,
              color: '#94a3b8',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              Forensic Matrix
            </div>
          </div>
        </Link>

        {/* Center: Floating Lamp Pill Navigation Bar (matching reference design) */}
        <nav
          className="hidden md:flex items-center"
          style={{
            position: 'relative',
            background: 'rgba(12, 13, 17, 0.86)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            padding: '0.28rem 0.35rem',
            borderRadius: 9999,
            gap: '0.25rem',
            overflow: 'visible',
          }}
        >
          {navLinks.map(({ label, scrollId }) => {
            const isActive = activeSection === scrollId;
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleNavClick(scrollId)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.45rem 1.35rem',
                  borderRadius: 9999,
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                  letterSpacing: '0.01em',
                  background: isActive ? 'rgba(255, 255, 255, 0.11)' : 'transparent',
                  color: isActive ? '#ffffff' : '#9ca3af',
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  whiteSpace: 'nowrap',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#9ca3af';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {/* Active Lamp Light: Top Glowing Notch & Radiant Ambient Flare */}
                {isActive && (
                  <>
                    {/* The crisp white notch sitting on the top pill border */}
                    <div
                      style={{
                        position: 'absolute',
                        top: -6,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 34,
                        height: 3.5,
                        borderRadius: 9999,
                        background: '#ffffff',
                        boxShadow: '0 0 12px 2px rgba(255, 255, 255, 0.95), 0 -2px 18px 4px rgba(255, 255, 255, 0.7), 0 -6px 28px 8px rgba(255, 255, 255, 0.4)',
                        zIndex: 10,
                      }}
                    />
                    {/* Upward radiant lamp beam / spotlight halo */}
                    <div
                      style={{
                        position: 'absolute',
                        top: -24,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 68,
                        height: 26,
                        background: 'radial-gradient(ellipse at 50% 100%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.18) 45%, transparent 75%)',
                        pointerEvents: 'none',
                        filter: 'blur(3px)',
                        zIndex: 9,
                      }}
                    />
                  </>
                )}

                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Action & User Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {/* New Case Button with Glass Effect */}
          <Link
            to="/cases/new"
            onClick={() => cyberAudio.playLaserBlip()}
            className="btn-pill btn-pill-primary hidden sm:inline-flex"
            style={{ fontSize: '0.82rem', padding: '0.5rem 1.15rem' }}
          >
            <Plus size={15} color="#060608" strokeWidth={2.4} />
            <span>New Case</span>
          </Link>

          {/* Clock */}
          <div className="hidden lg:flex" style={{
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '0.6rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: "'Space Grotesk', monospace",
            fontSize: '0.72rem',
            color: '#cbd5e1',
          }}>
            <Clock size={12} color="#ffffff" />
            <span style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}>
              {currentTime || '00:00:00'}
            </span>
          </div>

          {/* Audio toggle */}
          <button
            type="button"
            onClick={handleToggleAudio}
            title={audioEnabled ? 'Mute UI sounds' : 'Enable UI sounds'}
            aria-label={audioEnabled ? 'Mute Audio' : 'Unmute Audio'}
            style={{
              width: 38,
              height: 38,
              borderRadius: '0.65rem',
              background: audioEnabled ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'all 0.18s ease',
            }}
          >
            {audioEnabled
              ? <Volume2 size={16} color="#ffffff" />
              : <VolumeX size={16} color="#94a3b8" />
            }
          </button>

          {/* Notifications */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              type="button"
              onClick={() => { cyberAudio.playChirp(800, 0.04); setNotifOpen(p => !p); setProfileOpen(false); }}
              aria-label="Open notifications"
              style={{
                width: 38,
                height: 38,
                borderRadius: '0.65rem',
                background: notifOpen ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                position: 'relative',
                transition: 'all 0.18s ease',
              }}
            >
              <Bell size={16} color={unreadCount > 0 ? '#ffffff' : '#94a3b8'} strokeWidth={2.1} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#ffffff',
                  boxShadow: '0 0 8px #ffffff',
                }} />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifOpen && (
              <div
                className="glass-dropdown animate-dropdown"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: 340,
                  maxWidth: '90vw',
                  borderRadius: '1rem',
                  zIndex: 60,
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  padding: '0.875rem 1.125rem',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                      Telemetry Alerts
                    </span>
                    {unreadCount > 0 && (
                      <span style={{
                        fontSize: '0.62rem', fontWeight: 700,
                        background: '#ffffff', color: '#060608',
                        padding: '0.1rem 0.45rem', borderRadius: '9999px',
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{
                        background: 'none', border: 'none',
                        fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px',
                      }}
                    >
                      <CheckCheck size={12} /> Mark read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: 310, overflowY: 'auto' }}>
                  {notifications.map((n, idx) => (
                    <div
                      key={n.id}
                      onClick={() => { markAsRead(n.id); if (n.link) { setNotifOpen(false); navigate(n.link); } }}
                      style={{
                        padding: '0.75rem 1.125rem',
                        borderBottom: idx !== notifications.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                        background: n.unread ? 'rgba(255,255,255,0.04)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          display: 'inline-block',
                          background: n.unread ? '#ffffff' : 'transparent',
                          border: n.unread ? 'none' : '1px solid #475569',
                        }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                          {n.type === 'danger' ? <AlertTriangle size={13} color="#f87171" /> :
                           n.type === 'success' ? <Check size={13} color="#34d399" /> :
                           <FileText size={13} color="#94a3b8" />}
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ffffff' }}>{n.title}</span>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.35 }}>{n.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div style={{ position: 'relative' }} ref={profileRef}>
            <button
              type="button"
              onClick={() => { cyberAudio.playChirp(900, 0.03); setProfileOpen(p => !p); setNotifOpen(false); }}
              aria-label="User profile menu"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '0.65rem',
                padding: '0.25rem 0.65rem 0.25rem 0.25rem',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 30, height: 30,
                borderRadius: '0.5rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #64748b 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.68rem', fontWeight: 800, color: '#060608',
              }}>
                {activeUser.initials || 'AS'}
              </div>
              <ChevronDown size={13} color="#94a3b8" />
            </button>

            {profileOpen && (
              <div
                className="glass-dropdown animate-dropdown"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: 250,
                  borderRadius: '1rem',
                  zIndex: 60,
                  overflow: 'hidden',
                  padding: '0.625rem',
                }}
              >
                <div style={{
                  padding: '0.75rem 0.875rem',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '0.6rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                  marginBottom: '0.375rem',
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                    {activeUser.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                    {activeUser.role} · {activeUser.department}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <Link
                    to="/cases"
                    onClick={() => setProfileOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                      fontSize: '0.8rem', color: '#cbd5e1', textDecoration: 'none',
                    }}
                  >
                    <FolderOpen size={14} color="#94a3b8" />
                    Cases & RCA
                  </Link>
                  <Link
                    to="/reports"
                    onClick={() => setProfileOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                      fontSize: '0.8rem', color: '#cbd5e1', textDecoration: 'none',
                    }}
                  >
                    <FileText size={14} color="#94a3b8" />
                    Reports
                  </Link>
                </div>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0.375rem 0' }} />

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                    fontSize: '0.8rem', fontWeight: 600,
                    color: '#ffffff',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="flex md:hidden"
            onClick={() => setMobileMenuOpen(p => !p)}
            aria-label="Toggle mobile navigation"
            style={{
              width: 38,
              height: 38,
              borderRadius: '0.65rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
            }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: 72,
          left: 0,
          right: 0,
          background: 'rgba(8, 8, 11, 0.98)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          zIndex: 50,
          backdropFilter: 'blur(24px)',
        }}>
          {navLinks.map(({ label, scrollId, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleNavClick(scrollId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 600,
                textAlign: 'left',
              }}
            >
              <Icon size={16} color="#ffffff" />
              <span>{label}</span>
            </button>
          ))}
          <Link
            to="/cases/new"
            onClick={() => setMobileMenuOpen(false)}
            className="btn-pill btn-pill-primary w-full"
            style={{ padding: '0.75rem', textAlign: 'center', marginTop: '0.5rem' }}
          >
            + Create New Case
          </Link>
        </div>
      )}
    </header>
  );
}
