import React, { useEffect, useState } from 'react';
import styles from './CleanApprovedPdfsModal.module.css';
import { Sparkles, X, FileText, Trash2, Download, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

interface CleanApprovedPdfsModalProps {
  isOpen: boolean;
  onClose: () => void;
  materiaNombre: string;
  pdfCount: number;
  totalBytes?: number;
  notesCount?: number;
  onConfirmDeletePdfs: () => Promise<void> | void;
  onDownloadNotesZip?: () => void;
}

export const CleanApprovedPdfsModal: React.FC<CleanApprovedPdfsModalProps> = ({
  isOpen,
  onClose,
  materiaNombre,
  pdfCount,
  totalBytes = 0,
  notesCount = 0,
  onConfirmDeletePdfs,
  onDownloadNotesZip,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  const formatSize = (bytes: number) => {
    if (bytes <= 0) return '';
    const mb = (bytes / (1024 * 1024)).toFixed(1);
    return ` (~${mb} MB)`;
  };

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirmDeletePdfs();
      onClose();
    } catch (err) {
      console.error('Error purgando PDFs:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={() => !isDeleting && onClose()}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Top celebration badge */}
        <div className={styles.topRow}>
          <span className={styles.celebrationBadge}>
            <Sparkles size={11} />
            ¡MATERIA APROBADA!
          </span>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isDeleting}
            title="Cerrar (Esc)"
          >
            <X size={14} />
          </button>
        </div>

        {/* Header Icon + Title */}
        <div className={styles.headerContent}>
          <div className={styles.iconContainer}>
            <CheckCircle2 size={24} color="var(--emerald)" />
          </div>
          <div className={styles.textGroup}>
            <h3 className={styles.title}>¿Deseas liberar espacio de PDFs?</h3>
            <p className={styles.subtitle}>
              Has acreditado <strong>{materiaNombre}</strong>. Para optimizar el almacenamiento de tu cuenta y del servidor, podés eliminar los archivos PDF y guías adjuntas de esta materia.
            </p>
          </div>
        </div>

        {/* Information box */}
        <div className={styles.infoCard}>
          <div className={styles.infoItem}>
            <FileText size={16} color="var(--amber)" />
            <div className={styles.infoDetails}>
              <span className={styles.infoTitle}>
                {pdfCount} {pdfCount === 1 ? 'documento PDF subido' : 'documentos PDF subidos'}{formatSize(totalBytes)}
              </span>
              <span className={styles.infoDescription}>
                Se eliminarán del servidor para no ocupar espacio innecesario.
              </span>
            </div>
          </div>

          <div className={styles.infoItem}>
            <ShieldCheck size={16} color="var(--emerald)" />
            <div className={styles.infoDetails}>
              <span className={styles.infoTitle}>Tus apuntes de texto están a salvo</span>
              <span className={styles.infoDescription}>
                {notesCount > 0
                  ? `Se conservarán todas tus ${notesCount} notas y resúmenes para que puedas consultarlos en futuras materias.`
                  : 'Tus notas personales no se eliminarán.'}
              </span>
            </div>
          </div>
        </div>

        {/* Optional notes backup button */}
        {notesCount > 0 && onDownloadNotesZip && (
          <div className={styles.backupSection}>
            <button
              type="button"
              className={styles.backupBtn}
              onClick={onDownloadNotesZip}
              title="Descargar todos los apuntes de esta materia en un archivo .zip"
            >
              <Download size={13} />
              <span>Descargar respaldo de apuntes (.zip)</span>
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isDeleting}
          >
            Conservar PDFs
          </button>

          <button
            type="button"
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Liberando espacio...</span>
              </>
            ) : (
              <>
                <Trash2 size={13} />
                <span>Eliminar PDFs y liberar espacio</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CleanApprovedPdfsModal;
