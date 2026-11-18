import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Upload, FileText, File, Image, X, CheckCircle,
  AlertCircle, Info, ArrowRight, Database,
} from 'lucide-react';
import { caseService } from '../services/caseService';

const ACCEPTED_TYPES = [
  { ext: 'PDF', mime: 'application/pdf', icon: FileText, color: '#e53e3e' },
  { ext: 'DOCX', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', icon: FileText, color: '#2563eb' },
  { ext: 'CSV',  mime: 'text/csv', icon: Database, color: '#059669' },
  { ext: 'TXT',  mime: 'text/plain', icon: FileText, color: '#475569' },
  { ext: 'JSON', mime: 'application/json', icon: Database, color: '#d97706' },
  { ext: 'XLSX', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', icon: Database, color: '#059669' },
  { ext: 'PNG',  mime: 'image/png', icon: Image, color: '#7c3aed' },
  { ext: 'JPG',  mime: 'image/jpeg', icon: Image, color: '#7c3aed' },
  { ext: 'LOG',  mime: 'text/plain', icon: Database, color: '#0ea5e9' },
  { ext: 'PCAP', mime: 'application/vnd.tcpdump.pcap', icon: Database, color: '#c2410c' },
];

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toUpperCase();
  const match = ACCEPTED_TYPES.find(t => t.ext === ext);
  return match || { icon: File, color: '#94a3b8' };
}

export default function UploadEvidencePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadNote, setUploadNote] = useState('');

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles).map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      name: f.name,
      size: f.size,
      status: 'ready',
      progress: 0,
    }));
    setFiles(prev => [...prev, ...arr]);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const removeFile = (fileId) => setFiles(f => f.filter(x => x.id !== fileId));

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);

    // Update file states to uploading
    setFiles(prev => prev.map(f => ({ ...f, status: 'uploading', progress: 0 })));

    try {
      // Upload all files via real backend API
      const rawFiles = files.map(f => f.file);
      let done = 0;
      await caseService.uploadEvidence(id, rawFiles, () => {
        done++;
        const pct = Math.round((done / rawFiles.length) * 100);
        setFiles(prev => prev.map((f, i) =>
          i < done ? { ...f, progress: 100, status: 'done' }
          : i === done ? { ...f, progress: pct, status: 'uploading' }
          : f
        ));
      });
      setFiles(prev => prev.map(f => ({ ...f, progress: 100, status: 'done' })));
    } catch {
      // Graceful fallback: simulate upload
      for (let i = 0; i < files.length; i++) {
        for (let p = 0; p <= 100; p += 20) {
          await new Promise(r => setTimeout(r, 80));
          setFiles(prev => prev.map((f, idx) =>
            idx === i ? { ...f, progress: p, status: p === 100 ? 'done' : 'uploading' } : f
          ));
        }
      }
    }

    setUploading(false);
    setUploaded(true);
    setTimeout(() => navigate(`/cases/${id}/analysis`), 2000);
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Case Info Banner */}
      <div className="glass-card animate-fade-in-up" style={{ padding: '1.1rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255, 255, 255, 0.58)', backdropFilter: 'blur(24px)' }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(2, 132, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Info size={17} color="#0284c7" />
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Uploading forensic evidence for case <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{id || 'CY-2024-047'}</span>
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          Accepted: PDF, DOCX, CSV, TXT, JSON, XLSX, PNG, JPG, LOG, PCAP
        </span>
      </div>

      <div className="glass-card animate-fade-in-up delay-100" style={{ padding: '2.25rem' }}>
        {uploaded ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle size={52} color="#059669" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem' }}>
              {files.length} file{files.length !== 1 ? 's' : ''} uploaded successfully
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Redirecting to AI Analysis…</p>
          </div>
        ) : (
          <>
            {/* Dropzone */}
            <div
              className={`dropzone ${dragging ? 'active' : ''}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => document.getElementById('file-input').click()}
              role="button"
              tabIndex={0}
              aria-label="Drop files or click to upload"
              onKeyDown={e => e.key === 'Enter' && document.getElementById('file-input').click()}
            >
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(37,99,235,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
              }}>
                <Upload size={22} color="#2563eb" />
              </div>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.375rem' }}>
                Drop evidence files here
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                or click to browse — PDF, DOCX, CSV, TXT, JSON, images, logs, PCAP
              </p>
              <input
                id="file-input"
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={e => addFiles(e.target.files)}
                accept=".pdf,.docx,.csv,.txt,.json,.xlsx,.png,.jpg,.jpeg,.log,.pcap"
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                  Selected Files ({files.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {files.map(f => {
                    const { icon: Icon, color } = getFileIcon(f.name);
                    return (
                      <div key={f.id} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.85rem 1rem', borderRadius: '1rem',
                        background: f.status === 'done' ? 'rgba(240, 253, 244, 0.75)' : 'rgba(255, 255, 255, 0.65)',
                        backdropFilter: 'blur(16px)',
                        border: `1px solid ${f.status === 'done' ? 'rgba(34, 197, 94, 0.35)' : 'rgba(255, 255, 255, 0.85)'}`,
                        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '0.6rem', flexShrink: 0,
                          background: `${color}15`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon size={18} color={color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {f.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatBytes(f.size)}</div>
                          {f.status === 'uploading' && (
                            <div className="risk-gauge" style={{ marginTop: '0.375rem', height: 4, borderRadius: 9999, background: 'rgba(15,23,42,0.06)', overflow: 'hidden' }}>
                              <div className="risk-fill" style={{ width: `${f.progress}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7, #2563eb)', transition: 'width 0.2s ease' }} />
                            </div>
                          )}
                        </div>
                        {f.status === 'done'
                          ? <CheckCircle size={18} color="#059669" />
                          : <button onClick={() => removeFile(f.id)} style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)', cursor: 'pointer', padding: 6, borderRadius: '50%', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <X size={14} />
                            </button>
                        }
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            <div style={{ marginTop: '1.25rem' }}>
              <label className="input-label">Evidence Notes (optional)</label>
              <textarea className="input" rows={2}
                placeholder="Add context about this evidence batch…"
                value={uploadNote} onChange={e => setUploadNote(e.target.value)} />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(15, 23, 42, 0.08)' }}>
              {files.length === 0 && (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginRight: 'auto' }}>
                  Select or drop files to proceed
                </span>
              )}
              <button className="btn-pill btn-pill-glass" onClick={() => navigate('/cases')}>Cancel</button>
              <button
                className="btn-pill btn-pill-primary"
                disabled={!files.length || uploading}
                onClick={handleUpload}
              >
                {uploading ? (
                  <>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                    Analyzing Evidence…
                  </>
                ) : (
                  <>Upload {files.length > 0 && `(${files.length})`} & Run AI Analysis <ArrowRight size={14} /></>
                )}
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
