import React, { useState, useEffect } from 'react';
import styles from './SplitPdfViewerPane.module.css';
import { X, ExternalLink, UploadCloud, FileText, Loader2 } from 'lucide-react';
import type { MaterialEstudio } from '../../../../types/academic';
import { materialesService } from '../../../../services';

interface SplitPdfViewerPaneProps {
  onClose: () => void;
  activeMateriaId?: string;
  activeMateriaNombre?: string;
  onOpenUploadModal?: () => void;
}

export const SplitPdfViewerPane: React.FC<SplitPdfViewerPaneProps> = ({
  onClose,
  activeMateriaId,
  activeMateriaNombre,
  onOpenUploadModal
}) => {
  const [materials, setMaterials] = useState<MaterialEstudio[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // Fetch all materials or by materia
    materialesService
      .getMateriales(activeMateriaId)
      .then(docs => {
        if (!isMounted) return;
        setMaterials(docs);
        if (docs.length > 0) {
          setSelectedDocId(docs[0].id);
        } else {
          // If no materials for this materia, fetch all materials across all materias
          materialesService.getMateriales().then(allDocs => {
            if (!isMounted) return;
            setMaterials(allDocs);
            if (allDocs.length > 0) {
              setSelectedDocId(allDocs[0].id);
            }
          });
        }
      })
      .catch(err => console.error('Error al cargar materiales para visor:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeMateriaId]);

  const selectedDoc = materials.find(m => m.id === selectedDocId) || materials[0] || null;

  return (
    <div className={styles.pdfPane} style={{ flex: 1, minWidth: '420px' }}>
      {/* Top Header Bar */}
      <div className={styles.pdfHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span
            style={{
              background: 'var(--primary)',
              color: 'white',
              fontSize: '9px',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '2px',
              flexShrink: 0
            }}
          >
            DOC
          </span>

          {materials.length > 0 ? (
            <select
              className={styles.splitPdfSelect}
              value={selectedDocId}
              onChange={e => setSelectedDocId(e.target.value)}
              title="Seleccionar documento de cátedra"
            >
              {materials.map(m => (
                <option key={m.id} value={m.id}>
                  [{m.categoria}] {m.titulo}
                </option>
              ))}
            </select>
          ) : (
            <span
              style={{
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              Documentos de Cátedra
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onOpenUploadModal && (
            <button
              className={styles.toolBtn}
              onClick={onOpenUploadModal}
              title="Subir nuevo PDF de cátedra"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px' }}
            >
              <UploadCloud size={12} color="var(--primary)" />
              <span>+ Subir PDF</span>
            </button>
          )}

          {selectedDoc?.archivoUrl && (
            <a
              href={selectedDoc.archivoUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.toolBtn}
              title="Abrir PDF en pestaña completa"
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ExternalLink size={12} />
            </a>
          )}

          <button
            className={styles.toolBtn}
            style={{ padding: '3px 6px' }}
            onClick={onClose}
            title="Cerrar visor y restaurar paneles laterales"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Reader / Iframe Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: 'var(--surface-2)' }}>
        {isLoading ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: 'var(--text-muted)'
            }}
          >
            <Loader2 size={24} className="animate-spin" />
            <span style={{ fontSize: '12px' }}>Cargando documentos de cátedra...</span>
          </div>
        ) : selectedDoc?.archivoUrl ? (
          <iframe
            src={selectedDoc.archivoUrl}
            className={styles.splitPdfIframe}
            title={selectedDoc.titulo}
          />
        ) : (
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '480px',
                backgroundColor: 'var(--surface-1)',
                border: '1px dashed var(--border-hover)',
                borderRadius: 'var(--radius-sm)',
                padding: '32px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <FileText size={36} color="var(--text-dim)" />
              <div>
                <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
                  Sin documentos PDF disponibles
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  {activeMateriaNombre
                    ? `Aún no hay PDFs cargados para ${activeMateriaNombre}.`
                    : 'Aún no hay PDFs de cátedra registrados.'}
                  <br />
                  Podés subir guías, diapositivas o parciales viejos para consultarlos en paralelo mientras tomás notas.
                </p>
              </div>

              {onOpenUploadModal && (
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={onOpenUploadModal}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px', marginTop: '6px' }}
                >
                  <UploadCloud size={14} />
                  <span>Subir Primer Documento PDF</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitPdfViewerPane;
