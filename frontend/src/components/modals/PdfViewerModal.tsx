import React, { useState } from 'react';
import styles from './Modals.module.css';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  BookOpen
} from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfTitle: string;
  pdfUrl?: string;
  onOpenSplitNote?: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  pdfTitle,
  onOpenSplitNote
}) => {
  const [page, setPage] = useState(1);
  const totalPages = 18;
  const [zoom, setZoom] = useState(100);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        style={{ width: '920px', height: '85vh', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: 'var(--red)', color: 'white', fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '2px' }}>
              PDF
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {pdfTitle || 'Paper Raft: In Search of an Understandable Consensus Algorithm'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Page controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--surface-3)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ color: page <= 1 ? 'var(--text-dim)' : 'var(--text-primary)' }}
              >
                <ChevronLeft size={14} />
              </button>
              <span>{page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                style={{ color: page >= totalPages ? 'var(--text-dim)' : 'var(--text-primary)' }}
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Zoom controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--surface-3)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <button onClick={() => setZoom(z => Math.max(50, z - 10))}>
                <ZoomOut size={13} />
              </button>
              <span>{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(200, z + 10))}>
                <ZoomIn size={13} />
              </button>
            </div>

            {/* Split view trigger */}
            {onOpenSplitNote && (
              <button
                className={styles.btnCancel}
                style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => {
                  onClose();
                  onOpenSplitNote();
                }}
              >
                <BookOpen size={12} color="var(--primary)" />
                <span>Modo Estudio Split</span>
              </button>
            )}

            <button className={styles.closeBtn} onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* PDF Canvas content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#050507',
          display: 'flex',
          justifyContent: 'center',
          padding: '24px'
        }}>
          {/* Simulated rendered PDF page */}
          <div style={{
            width: `${Math.round(580 * (zoom / 100))}px`,
            minHeight: `${Math.round(800 * (zoom / 100))}px`,
            backgroundColor: '#ffffff',
            color: '#1a1a1a',
            borderRadius: '4px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            padding: '40px 50px',
            fontFamily: 'serif',
            fontSize: `${Math.round(14 * (zoom / 100))}px`,
            lineHeight: 1.6,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center', borderBottom: '1px solid #ddd', paddingBottom: '16px' }}>
              <h1 style={{ fontSize: `${Math.round(20 * (zoom / 100))}px`, fontWeight: 'bold', color: '#111', margin: '0 0 8px 0' }}>
                In Search of an Understandable Consensus Algorithm
              </h1>
              <div style={{ fontSize: `${Math.round(12 * (zoom / 100))}px`, color: '#555', fontStyle: 'italic' }}>
                Diego Ongaro and John Ousterhout · Stanford University
              </div>
            </div>

            <div style={{ fontWeight: 'bold', fontSize: `${Math.round(14 * (zoom / 100))}px`, marginTop: '8px' }}>
              Abstract
            </div>
            <p style={{ textAlign: 'justify', fontSize: `${Math.round(12 * (zoom / 100))}px`, color: '#333' }}>
              Raft is a consensus algorithm for managing a replicated log. It produces a result equivalent to (multi-)Paxos, and it is as efficient as Paxos, but its structure is different from Paxos; this makes Raft more understandable than Paxos and also provides a better foundation for building practical systems. In order to enhance understandability, Raft separates the key elements of consensus, such as leader election, log replication, and safety.
            </p>

            <div style={{ fontWeight: 'bold', fontSize: `${Math.round(14 * (zoom / 100))}px`, marginTop: '8px' }}>
              5. The Raft Consensus Algorithm
            </div>
            <p style={{ textAlign: 'justify', fontSize: `${Math.round(12 * (zoom / 100))}px`, color: '#333' }}>
              Raft implements consensus by first electing a distinguished leader, then giving the leader complete responsibility for managing the replicated log. The leader accepts log entries from clients, replicates them on other servers, and tells servers when it is safe to apply log entries to their state machines.
            </p>

            {/* Diagram simulation */}
            <div style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '16px', textAlign: 'center', background: '#f9f9f9', marginTop: '12px' }}>
              <div style={{ fontSize: `${Math.round(11 * (zoom / 100))}px`, fontFamily: 'monospace', color: '#222' }}>
                [ Follower ] --(times out, starts election)---&gt; [ Candidate ]
              </div>
              <div style={{ fontSize: `${Math.round(11 * (zoom / 100))}px`, fontFamily: 'monospace', color: '#222', marginTop: '4px' }}>
                [ Candidate ] --(receives votes from majority)---&gt; [ Leader ]
              </div>
              <div style={{ fontSize: `${Math.round(10 * (zoom / 100))}px`, color: '#777', marginTop: '8px' }}>
                Figure 4: Server states and transitions in the Raft consensus algorithm.
              </div>
            </div>

            <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: `${Math.round(10 * (zoom / 100))}px`, color: '#888', borderTop: '1px solid #eee', paddingTop: '10px' }}>
              Stanford University Technical Report · Page {page} of {totalPages}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
