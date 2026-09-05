import React from 'react';
import styles from '../ApuntesView.module.css';
import { X } from 'lucide-react';

interface SplitPdfViewerPaneProps {
  onClose: () => void;
}

export const SplitPdfViewerPane: React.FC<SplitPdfViewerPaneProps> = ({ onClose }) => {
  return (
    <div className={styles.pdfPane} style={{ flex: 1, minWidth: '400px' }}>
      <div className={styles.pdfHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
          <span style={{ background: 'var(--red)', color: 'white', fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '2px' }}>PDF</span>
          <span style={{ color: 'var(--text-primary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Paper Raft (Ongaro & Ousterhout)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', background: 'var(--surface-3)', padding: '2px 6px', borderRadius: '3px' }}>
            Pág. 1 / 18 · 100%
          </span>
          <button
            className={styles.toolBtn}
            style={{ padding: '3px 6px' }}
            onClick={onClose}
            title="Cerrar visor PDF y restaurar paneles laterales"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Reader Canvas Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: 'var(--bg-canvas)', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: '#0d0d11',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '6px', lineHeight: 1.3 }}>
              In Search of an Understandable Consensus Algorithm
            </h2>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Diego Ongaro and John Ousterhout · Stanford University
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--surface-2)',
            borderLeft: '2px solid var(--primary)',
            padding: '8px 12px',
            borderRadius: '2px',
            fontSize: '11px',
            fontStyle: 'italic',
            color: 'var(--text-muted)',
            lineHeight: 1.5
          }}>
            <strong>Abstract —</strong> Raft is a consensus algorithm for managing a replicated log. It produces a result equivalent to (multi-Paxos), and it is as efficient as Paxos, but its structure makes it more understandable.
          </div>

          <div style={{ fontSize: '11px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>1. Introduction</strong>
            Consensus algorithms allow a collection of machines to work as a coherent group that can survive the failures of some of its members. Raft decomposes consensus into relatively independent subproblems: Leader election, Log replication, and Safety...
          </div>

          <div style={{
            border: '1px dashed var(--border-hover)',
            borderRadius: 'var(--radius-xs)',
            padding: '10px',
            textAlign: 'center',
            backgroundColor: 'var(--surface-1)'
          }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--emerald)', marginBottom: '4px' }}>
              [Figure 3: Raft Server States & Transitions]
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Follower ⇄ Candidate ⇄ Leader
            </div>
          </div>

          <div style={{ fontSize: '10px', color: 'var(--text-dim)', textAlign: 'center', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
            — Fin de Página 1 de 18 · Material de Estudio Oficial —
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitPdfViewerPane;
