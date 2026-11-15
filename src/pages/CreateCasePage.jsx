import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle, AlertCircle, X } from 'lucide-react';
import { caseTypes } from '../data/mockCases';

const OFFICERS = ['Atharv Shingate (You)', 'Officer Verma', 'Officer Mehra', 'Officer Patel', 'Officer Singh'];

export default function CreateCasePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    title: '',
    company: '',
    type: '',
    assignedTo: 'Atharv Shingate',
    priority: 'medium',
    description: '',
    complainantName: '',
    complainantContact: '',
    incidentDate: '',
    estimatedLoss: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Case title is required';
    if (!form.company.trim())     e.company     = 'Company / complainant name is required';
    if (!form.type)               e.type        = 'Select a case type';
    if (!form.assignedTo)         e.assignedTo  = 'Assign to an officer';
    if (!form.description.trim()) e.description = 'Provide a brief case description';
    if (!form.incidentDate)       e.incidentDate = 'Incident date is required';
    return e;
  };

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
    setTimeout(() => navigate('/cases'), 2000);
  };

  if (submitted) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="glass-card animate-scale-in" style={{ padding: '3rem', textAlign: 'center', maxWidth: 420 }}>
        <CheckCircle size={52} color="#059669" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem' }}>Case Created!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Redirecting to Cases list…</p>
      </div>
    </div>
  );

  const Field = ({ label, required, error, children }) => (
    <div>
      <label className="input-label">{label}{required && <span style={{ color: '#e53e3e', marginLeft: 2 }}>*</span>}</label>
      {children}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
          <AlertCircle size={12} color="#e53e3e" />
          <span style={{ fontSize: '0.72rem', color: '#e53e3e' }}>{error}</span>
        </div>
      )}
    </div>
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        padding: '2.5rem 1.5rem 6rem',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ maxWidth: 760, width: '100%', margin: '0 auto' }}>
        <div className="glass-card animate-fade-in-up" style={{ padding: '2.5rem', position: 'relative' }}>
        {/* Close / X Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            zIndex: 10,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(30,58,95,0.08)' }}>
          <div className="hero-eyebrow" style={{ marginBottom: '0.25rem' }}>New Investigation</div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>
            Register Cyber Case
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            All fields marked with * are required. Evidence can be uploaded after case creation.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Section: Case Information */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
              Case Information
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <Field label="Case Title" required error={errors.title}>
                <input className="input" style={errors.title ? { borderColor: '#e53e3e' } : {}}
                  placeholder="e.g., Corporate Data Exfiltration — Acme Corp"
                  value={form.title} onChange={e => set('title', e.target.value)} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Company / Complainant" required error={errors.company}>
                  <input className="input" style={errors.company ? { borderColor: '#e53e3e' } : {}}
                    placeholder="Company or individual name"
                    value={form.company} onChange={e => set('company', e.target.value)} />
                </Field>
                <Field label="Case Type" required error={errors.type}>
                  <div style={{ position: 'relative' }}>
                    <select className="select" style={errors.type ? { borderColor: '#e53e3e' } : {}}
                      value={form.type} onChange={e => set('type', e.target.value)}>
                      <option value="">Select type…</option>
                      {caseTypes.slice(1).map(t => <option key={t}>{t}</option>)}
                    </select>
                    <ChevronRight size={12} color="var(--text-muted)" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
                  </div>
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Assigned Officer" required error={errors.assignedTo}>
                  <div style={{ position: 'relative' }}>
                    <select className="select" style={errors.assignedTo ? { borderColor: '#e53e3e' } : {}}
                      value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)}>
                      <option value="">Select officer…</option>
                      {OFFICERS.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronRight size={12} color="var(--text-muted)" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
                  </div>
                </Field>
                <Field label="Initial Priority">
                  <div style={{ position: 'relative' }}>
                    <select className="select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                    <ChevronRight size={12} color="var(--text-muted)" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
                  </div>
                </Field>
              </div>

              <Field label="Case Description" required error={errors.description}>
                <textarea className="input" rows={4}
                  placeholder="Brief description of the cyber incident, affected systems, nature of attack…"
                  value={form.description} onChange={e => set('description', e.target.value)}
                  style={errors.description ? { borderColor: '#e53e3e' } : {}} />
              </Field>
            </div>
          </div>

          {/* Section: Incident Details */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
              Incident Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Date of Incident" required error={errors.incidentDate}>
                <input type="date" className="input" style={errors.incidentDate ? { borderColor: '#e53e3e' } : {}}
                  value={form.incidentDate} onChange={e => set('incidentDate', e.target.value)} />
              </Field>
              <Field label="Estimated Financial Loss (₹)">
                <input className="input" placeholder="e.g., 12,00,000"
                  value={form.estimatedLoss} onChange={e => set('estimatedLoss', e.target.value)} />
              </Field>
              <Field label="Complainant Name">
                <input className="input" placeholder="Full name of complainant"
                  value={form.complainantName} onChange={e => set('complainantName', e.target.value)} />
              </Field>
              <Field label="Complainant Contact">
                <input className="input" placeholder="Phone or email"
                  value={form.complainantContact} onChange={e => set('complainantContact', e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(15, 23, 42, 0.08)' }}>
            <button type="button" className="btn-pill btn-pill-glass" onClick={() => navigate('/cases')}>
              Cancel
            </button>
            <button type="submit" className="btn-pill btn-pill-primary" disabled={loading}>
              {loading ? (
                <>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Registering Case…
                </>
              ) : 'Register Case & Upload Evidence'}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
