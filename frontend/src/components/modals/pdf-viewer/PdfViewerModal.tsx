import React, { useState } from 'react';
import styles from './PdfViewerModal.module.css';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { getAuthenticatedFileUrl } from '../../../services';

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
  pdfUrl,
  onOpenSplitNote
}) => {
  const [page, setPage] = useState(1);
  const totalPages = 18;
  const [zoom, setZoom] = useState(100);

  if (!isOpen) return null;

  const authPdfUrl = getAuthenticatedFileUrl(pdfUrl);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
            <span className={styles.pdfBadge}>PDF</span>
            <span
              className={styles.titleText}
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              title={pdfTitle}
            >
              {pdfTitle || 'Visualizador de Documento'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Page & Zoom controls only when no native iframe URL is active */}
            {!authPdfUrl && (
              <>
                <div className={styles.controlPill}>
                  <button
                    className={styles.iconBtn}
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span>{page} / {totalPages}</span>
                  <button
                    className={styles.iconBtn}
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className={styles.controlPill}>
                  <button className={styles.iconBtn} onClick={() => setZoom(z => Math.max(50, z - 10))}>
                    <ZoomOut size={13} />
                  </button>
                  <span>{zoom}%</span>
                  <button className={styles.iconBtn} onClick={() => setZoom(z => Math.min(200, z + 10))}>
                    <ZoomIn size={13} />
                  </button>
                </div>
              </>
            )}

            {authPdfUrl && (
              <a
                href={authPdfUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.btnAction}
                style={{ textDecoration: 'none' }}
                title="Abrir en ventana completa"
              >
                <ExternalLink size={12} />
                <span>Abrir Completo</span>
              </a>
            )}

            {/* Split view trigger */}
            {onOpenSplitNote && (
              <button
                className={styles.btnAction}
                onClick={() => {
                  onClose();
                  onOpenSplitNote();
                }}
              >
                <BookOpen size={12} color="var(--primary)" />
                <span>Modo Estudio</span>
              </button>
            )}

            <button
              className={styles.iconBtn}
              onClick={onClose}
              style={{ marginLeft: '4px' }}
              title="Cerrar (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Real PDF iframe or Paper Document Canvas */}
        {authPdfUrl ? (
          <div className={styles.iframeContainer}>
            <iframe
              src={authPdfUrl}
              className={styles.pdfIframe}
              title={pdfTitle}
            />
          </div>
        ) : (
          <div className={styles.canvasArea}>
            <div
              className={styles.paperSheet}
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            >
            {/* Paper Header */}
            <div className={styles.paperHeader}>
              <h1 className={styles.paperTitle}>
                {pdfTitle || 'Documento de Cátedra'}
              </h1>
              <div className={styles.paperAuthors}>
                Material de Cátedra y Bibliografía Oficial
              </div>
            </div>

            {/* Abstract */}
            <div className={styles.abstractBox}>
              <strong>Abstract —</strong> Raft is a consensus algorithm for managing a replicated log.
              It produces a result equivalent to (multi-Paxos), and it is as efficient as Paxos,
              but its structure makes it more understandable. In order to enhance understandability,
              Raft separates the key elements of consensus, such as leader election, log replication,
              and safety, and it enforces a stronger degree of coherency to reduce the number of states
              that must be considered.
            </div>

            {/* Academic 2-column layout */}
            <div className={styles.columnLayout}>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  1. Introduction
                </strong>
                <p>
                  Consensus algorithms allow a collection of machines to work as a coherent group that can
                  survive the failures of some of its members. Because of this, they play a key role in
                  building reliable large-scale software systems. Paxos has dominated the discussion of consensus
                  algorithms over the last decade...
                </p>
                <p style={{ marginTop: '8px' }}>
                  Unfortunately, Paxos is quite difficult to understand, in spite of numerous attempts to make it
                  more approachable. Furthermore, its architecture requires complex changes to support practical systems.
                </p>
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  2. Replicated State Machines
                </strong>
                <p>
                  Consensus algorithms typically arise in the context of replicated state machines. In this approach,
                  state machines on a collection of servers compute identical copies of the same state and can continue
                  operating even if some of the servers are down.
                </p>
                {/* Diagram box */}
                <div style={{
                  border: '1px dashed var(--border-hover)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '8px',
                  textAlign: 'center',
                  marginTop: '10px',
                  backgroundColor: 'var(--surface-1)'
                }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--emerald)' }}>
                    [Figure 1: Replicated State Machine Architecture]
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Clients → Consensus Module → Replicated Log → State Machine
                  </div>
                </div>
              </div>
            </div>

            {/* Paper Footer */}
            <div className={styles.paperFooter}>
              <span>USENIX Annual Technical Conference (ATC &apos;14)</span>
              <span>Página {page} de {totalPages}</span>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewerModal;
