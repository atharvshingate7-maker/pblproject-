import api from './api';
import { mockCases } from '../data/mockCases';
import { mockAnalysis } from '../data/mockAnalysis';

// ─── Helper: graceful fallback to mock data if backend is down ───────────────
const withMockFallback = async (apiFn, mockFn) => {
  try {
    return await apiFn();
  } catch (err) {
    console.warn('[caseService] Backend unavailable, using mock data:', err.message);
    return mockFn();
  }
};

export const caseService = {

  // ── GET /cases ─────────────────────────────────────────────────────────────
  async getCases(filters = {}) {
    return withMockFallback(
      async () => {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.status && filters.status !== 'All Status') params.status = filters.status;
        if (filters.risk && filters.risk !== 'All Risk Levels') params.risk = filters.risk;
        const res = await api.get('/cases', { params });
        return { data: res.data.items || res.data, total: res.data.total || res.data.length };
      },
      () => {
        let result = [...mockCases];
        if (filters.risk && filters.risk !== 'All Risk Levels')
          result = result.filter(c => c.risk === filters.risk.toLowerCase());
        if (filters.status && filters.status !== 'All Status')
          result = result.filter(c => c.status === filters.status.toLowerCase());
        if (filters.search) {
          const q = filters.search.toLowerCase();
          result = result.filter(c =>
            c.title.toLowerCase().includes(q) ||
            c.company.toLowerCase().includes(q) ||
            c.id.toLowerCase().includes(q)
          );
        }
        return { data: result, total: result.length };
      }
    );
  },

  // ── GET /cases/:id ─────────────────────────────────────────────────────────
  async getCaseById(id) {
    return withMockFallback(
      async () => {
        const res = await api.get(`/cases/${id}`);
        return res.data;
      },
      () => {
        const c = mockCases.find(c => c.id === id);
        if (!c) throw new Error('Case not found');
        return c;
      }
    );
  },

  // ── POST /cases ────────────────────────────────────────────────────────────
  async createCase(payload) {
    return withMockFallback(
      async () => {
        const res = await api.post('/cases', {
          title: payload.title,
          company: payload.company,
          type: payload.type,
          assigned_to: payload.assignedTo || payload.assigned_to || 'Atharv Shingate',
          priority: payload.priority || 'medium',
          description: payload.description,
          complainant_name: payload.complainantName || payload.complainant_name,
          complainant_contact: payload.complainantContact || payload.complainant_contact,
          incident_date: payload.incidentDate || payload.incident_date,
          estimated_loss: payload.estimatedLoss || payload.estimated_loss,
        });
        return res.data;
      },
      () => ({
        ...payload,
        id: `CY-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
        status: 'pending',
        risk: payload.priority === 'critical' ? 'critical' : payload.priority || 'medium',
        risk_score: { low: 25, medium: 50, high: 75, critical: 92 }[payload.priority] || 50,
        evidence_count: 0,
        created_at: new Date().toISOString(),
      })
    );
  },

  // ── PATCH /cases/:id ───────────────────────────────────────────────────────
  async updateCase(id, updates) {
    return withMockFallback(
      async () => {
        const res = await api.patch(`/cases/${id}`, updates);
        return res.data;
      },
      () => ({ id, ...updates })
    );
  },

  // ── DELETE /cases/:id ──────────────────────────────────────────────────────
  async deleteCase(id) {
    return withMockFallback(
      async () => {
        await api.delete(`/cases/${id}`);
        return { success: true };
      },
      () => ({ success: true })
    );
  },

  // ── GET /cases/:id/analysis (still mock-based) ─────────────────────────────
  async getCaseAnalysis(id) {
    await new Promise(r => setTimeout(r, 1200));
    if (id === 'CY-2024-047') return mockAnalysis;
    return { ...mockAnalysis, caseId: id };
  },

  // ── POST /files/upload (evidence for a case) ───────────────────────────────
  async uploadEvidence(caseId, files, onProgress) {
    const results = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => onProgress && onProgress(e),
        });
        results.push(res.data);
      } catch (err) {
        console.warn(`[caseService] Upload failed for ${file.name}:`, err.message);
        results.push({ name: file.name, status: 'failed' });
      }
    }
    // Increment evidence count
    try {
      const caseRes = await api.get(`/cases/${caseId}`);
      const count = (caseRes.data?.evidence_count || 0) + files.length;
      await api.patch(`/cases/${caseId}`, { evidence_count: count });
    } catch (_) {}
    return { success: true, uploaded: results.length, caseId };
  },
};
