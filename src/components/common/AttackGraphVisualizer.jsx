import React, { useState } from 'react';
import { Shield, Server, ArrowRight, Globe, Lock, AlertTriangle, Cpu, Terminal, CheckCircle2 } from 'lucide-react';
import { cyberAudio } from '../../utils/cyberAudio';

export default function AttackGraphVisualizer({ graph, report, onOpenRCA, onViewRCA, caseId }) {
  const actualGraph = graph || report?.attackGraph;
  const [selectedNode, setSelectedNode] = useState(actualGraph?.nodes?.[0] || null);

  const handleRCA = onOpenRCA || onViewRCA;

  if (!actualGraph || !actualGraph.nodes) return null;

  const nodeIcons = {
    source: Globe,
    vector: AlertTriangle,
    gateway: Shield,
    target: Server,
    process: Cpu,
    exfil: Lock,
  };

  const nodeColors = {
    source: '#94a3b8',
    vector: '#f87171',
    gateway: '#38bdf8',
    target: '#fbbf24',
    process: '#c084fc',
    exfil: '#ffffff',
  };

  return (
    <div style={{
      background: 'rgba(12, 12, 16, 0.95)',
      borderRadius: '1.25rem',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      padding: '1.75rem',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 16px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.15)',
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffffff', animation: 'pulseLive 2s infinite' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Space Grotesk', sans-serif" }}>
              ATTACK GRAPH TOPOLOGY
            </span>
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif", marginTop: '0.2rem' }}>
            {actualGraph.title || 'Live Kill-Chain Vector Mapping'}
          </h4>
        </div>

        {handleRCA && (
          <button
            onClick={() => { cyberAudio.playLaserBlip(); handleRCA(caseId); }}
            className="btn-pill btn-pill-primary"
            style={{ fontSize: '0.78rem', padding: '0.45rem 1.1rem' }}
          >
            Open RCA Report →
          </button>
        )}
      </div>

      {/* Interactive Node Flowchart / Pipeline */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflowX: 'auto',
        padding: '1.5rem 0.5rem',
        gap: '0.75rem',
        position: 'relative',
      }}>
        {actualGraph.nodes.map((node, idx) => {
          const Icon = nodeIcons[node.type] || Server;
          const isSelected = selectedNode?.id === node.id;
          const color = nodeColors[node.type] || '#ffffff';

          return (
            <React.Fragment key={node.id}>
              {/* Node Card */}
              <div
                onClick={() => { cyberAudio.playChirp(900, 0.02); setSelectedNode(node); }}
                style={{
                  minWidth: 150,
                  maxWidth: 180,
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.12)'}`,
                  boxShadow: isSelected ? '0 8px 25px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)' : '0 4px 14px rgba(0,0,0,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Stage {idx + 1}: {node.stage}
                  </span>
                  <div style={{
                    width: 24, height: 24, borderRadius: '0.45rem',
                    background: `${color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={12} color={color} />
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.25 }}>
                  {node.label}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                  {node.sub}
                </div>
              </div>

              {/* Connecting line */}
              {idx < actualGraph.nodes.length - 1 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 40,
                  flexShrink: 0,
                }}>
                  <div style={{
                    fontSize: '0.58rem',
                    color: '#64748b',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                  }}>
                    {actualGraph.links?.[idx]?.label || 'Proceed'}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#94a3b8',
                  }}>
                    <div style={{ width: 24, height: 1.5, background: 'linear-gradient(90deg, rgba(255,255,255,0.2), #ffffff)' }} />
                    <ArrowRight size={13} color="#ffffff" style={{ marginLeft: -2 }} />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Selected Node Inspector Detail */}
      {selectedNode && (
        <div style={{
          marginTop: '1.25rem',
          padding: '1rem 1.25rem',
          borderRadius: '0.875rem',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              INSPECTED VECTOR NODE: [{selectedNode.stage}]
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
              {selectedNode.label} — <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{selectedNode.sub}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="tag">Stage {actualGraph.nodes.findIndex(n => n.id === selectedNode.id) + 1} of {actualGraph.nodes.length}</span>
            {handleRCA && (
              <button
                onClick={() => { cyberAudio.playLaserBlip(); handleRCA(caseId); }}
                className="btn-pill btn-pill-glass"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem' }}
              >
                View Root Cause Analysis
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

