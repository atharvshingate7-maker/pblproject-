import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, FilePlus, BarChart2,
  Shield, LogOut, X, Activity
} from 'lucide-react';
import { useAuth, CURRENT_USER } from '../../context/AuthContext';
import { cyberAudio } from '../../utils/cyberAudio';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',      badge: 'Live' },
  { to: '/cases',     icon: FolderOpen,      label: 'Investigations', badge: '7' },
  { to: '/cases/new', icon: FilePlus,        label: 'New Case' },
  { to: '/reports',   icon: BarChart2,       label: 'Reports',        badge: '4' },
];

export default function Sidebar({ mobileOpen, setMobileOpen, collapsed = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const activeUser = user || CURRENT_USER;

  const handleLogout = () => {
    cyberAudio.playAlertAlarm();
    logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen) setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, setMobileOpen]);

  const renderContent = (isMobile = false) => {
    const isCollapsed = !isMobile && collapsed;

    return (
      <div className="flex flex-col h-full select-none">

        {/* Brand */}
        <div style={{
          padding: isCollapsed ? '1.25rem 0.5rem 1rem' : '1.25rem 1.25rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            {/* Logo icon with Liquid Chrome effect */}
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #64748b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(255, 255, 255, 0.25)',
              flexShrink: 0,
              position: 'relative',
            }}>
              <Shield size={18} color="#060608" strokeWidth={2.4} />
              <span style={{
                position: 'absolute', top: 2, right: 2,
                width: 7, height: 7, borderRadius: '50%',
                background: '#ffffff',
                border: '1.5px solid #060608',
                animation: 'pulseLive 2s infinite',
              }} />
            </div>

            {!isCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <div style={{
                  fontSize: '0.98rem',
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
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    fontWeight: 800,
                    marginLeft: '0.35rem',
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
                  marginTop: '0.15rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                  Forensic Platform
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          padding: isCollapsed ? '1rem 0.5rem' : '1rem 0.875rem 0.5rem',
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          {!isCollapsed && (
            <div style={{
              padding: '0 0.5rem 0.625rem',
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#9ca3af',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontFamily: "'Inter', sans-serif",
            }}>
              Navigation
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map(({ to, icon: Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                title={isCollapsed ? label : undefined}
                className={({ isActive }) =>
                  `sidebar-pill-link ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`
                }
                onClick={() => {
                  cyberAudio.playLaserBlip();
                  setMobileOpen?.(false);
                }}
              >
                <div className="icon-wrapper">
                  <Icon size={17} strokeWidth={2.1} />
                </div>

                {!isCollapsed && (
                  <span className="label-text" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {label}
                  </span>
                )}

                {!isCollapsed && badge && (
                  <span className={`pill-badge ${badge === 'Live' ? 'badge-live' : ''}`}>
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* System status card */}
          {!isCollapsed && (
            <div style={{
              marginTop: '1.5rem',
              padding: '0.875rem 1rem',
              borderRadius: '0.875rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Space Grotesk', sans-serif" }}>
                  Defense Grid
                </span>
                <Activity size={12} color="#ffffff" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                <span className="num-sci-fi" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  99.8%
                </span>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>uptime</span>
              </div>
              <div style={{
                marginTop: '0.4rem',
                height: 3,
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.12)',
                overflow: 'hidden',
              }}>
                <div style={{ width: '99.8%', height: '100%', background: 'linear-gradient(90deg, #ffffff, #94a3b8)', borderRadius: '9999px' }} />
              </div>
            </div>
          )}
        </div>

        {/* User card */}
        <div style={{
          padding: isCollapsed ? '0.75rem 0.5rem' : '0.875rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '0.75rem',
            padding: isCollapsed ? '0.5rem' : '0.6rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            transition: 'all 0.25s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '0.6rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #64748b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#060608',
                fontWeight: 800,
                fontSize: '0.72rem',
                fontFamily: "'Space Grotesk', sans-serif",
                flexShrink: 0,
                boxShadow: '0 2px 10px rgba(255, 255, 255, 0.2)',
              }}
              title={isCollapsed ? `${activeUser.name} (${activeUser.role})` : undefined}
              >
                {activeUser.initials || 'AS'}
              </div>

              {!isCollapsed && (
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}>
                    {activeUser.name}
                  </div>
                  <div style={{
                    fontSize: '0.62rem',
                    color: '#94a3b8',
                    fontFamily: "'Space Grotesk', sans-serif",
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {activeUser.role}
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                title="Sign Out"
                aria-label="Sign Out"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '5px',
                  borderRadius: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; }}
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="sidebar-futuristic hidden lg:flex flex-col"
        style={{
          width: collapsed ? 72 : 236,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 30,
          transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 60 }}
          onClick={() => setMobileOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation drawer"
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease-out',
          }} />

          <aside
            className="sidebar-futuristic"
            style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: 260, zIndex: 70,
              boxShadow: '4px 0 30px rgba(0,0,0,0.15)',
              animation: 'slideInLeft 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'absolute', top: '1.1rem', right: '0.875rem', zIndex: 10 }}>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                style={{
                  background: 'rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.10)',
                  color: '#6b7280',
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                  padding: '0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={15} />
              </button>
            </div>

            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
