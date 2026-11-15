import React, { createContext, useContext, useState, useEffect } from 'react';

export const CURRENT_USER = {
  id: 'officer-001',
  name: 'Atharv Shingate',
  shortName: 'Atharv',
  initials: 'AS',
  role: 'Cybersecurity Officer',
  email: 'atharv.shingate@cyberintel.gov.in',
  badge: 'CY-8942',
  avatar: 'AS',
  department: 'Cyber Intelligence & Defense Unit, CERT-In',
  securityClearance: 'Level 4 — Cryptographic & Threat Intel Access',
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Check if auth token exists
    const token = localStorage.getItem('cyberintel_token');
    if (token) {
      return CURRENT_USER;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('cyberintel_token');
    if (token) {
      // Ensure user always reflects Atharv Shingate
      localStorage.setItem('cyberintel_user', JSON.stringify(CURRENT_USER));
      setUser(CURRENT_USER);
    } else {
      setUser(null);
    }
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    // Simulate high-security authentication handshake
    await new Promise(r => setTimeout(r, 600));
    if (credentials.email && credentials.password) {
      localStorage.setItem('cyberintel_user', JSON.stringify(CURRENT_USER));
      localStorage.setItem('cyberintel_token', 'cyberintel_session_token_' + Date.now());
      setUser(CURRENT_USER);
      setLoading(false);
      return CURRENT_USER;
    }
    setLoading(false);
    throw new Error('Invalid credentials');
  };

  const logout = () => {
    localStorage.removeItem('cyberintel_user');
    localStorage.removeItem('cyberintel_token');
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, currentUser: CURRENT_USER }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
