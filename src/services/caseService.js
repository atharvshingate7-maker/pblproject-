import { mockCases } from '../data/mockCases';
import { mockAnalysis } from '../data/mockAnalysis';

// Simulate network delay
const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

export const caseService = {
  // GET /cases
  async getCases(filters = {}) {
    await delay();
    let result = [...mockCases];
    if (filters.risk && filters.risk !== 'All Risk Levels') {
      result = result.filter(c => c.risk === filters.risk.toLowerCase());
    }
    if (filters.status && filters.status !== 'All Status') {
      result = result.filter(c => c.status === filters.status.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    return { data: result, total: result.length };
  },

  // GET /cases/:id
  async getCaseById(id) {
    await delay(400);
    const c = mockCases.find(c => c.id === id);
    if (!c) throw new Error('Case not found');
    return c;
  },

  // POST /cases
  async createCase(payload) {
    await delay(800);
    const newCase = {
      ...payload,
      id: `CY-2024-${String(Math.floor(Math.random() * 900) + 100)}`,
      status: 'pending',
      evidenceCount: 0,
      createdAt: new Date().toISOString(),
    };
    return newCase;
  },

  // GET /cases/:id/analysis
  async getCaseAnalysis(id) {
    await delay(1200);
    if (id === 'CY-2024-047') return mockAnalysis;
    // Return a simplified version for other cases
    return { ...mockAnalysis, caseId: id };
  },

  // POST /cases/:id/evidence
  async uploadEvidence(id, files) {
    await delay(1500);
    return { success: true, uploaded: files.length, caseId: id };
  },
};
