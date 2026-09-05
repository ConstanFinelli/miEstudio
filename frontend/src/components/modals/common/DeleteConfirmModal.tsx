import React, { useEffect } from 'react';
import styles from './DeleteConfirmModal.module.css';
import { Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  itemName: string;
  itemType?: string;
  description?: string;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType = 'apunte',
  description,
  isDeleting = false,
}) => {
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

  return (
    <div className={styles.overlay} onClick={() => !isDeleting && onClose()}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Top bar */}
        <div className={styles.topRow}>
          <span className={styles.badge}>
            <AlertTriangle size={10} />
            CONFIRMAR ELIMINACIÓN
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

        {/* Content */}
        <div className={styles.headerContent}>
          <div className={styles.iconContainer}>
            <Trash2 size={20} />
          </div>
          <div className={styles.textGroup}>
            <h3 className={styles.title}>
              {title || `¿Eliminar ${itemType}?`}
            </h3>
            <p className={styles.description}>
              {description ||
                `Estás a punto de eliminar este ${itemType}. Esta acción es permanente y no se podrá deshacer.`}
            </p>
          </div>
        </div>

        {/* Item details card */}
        <div className={styles.itemCard}>
          <span>{itemName}</span>
        </div>

        {/* Action buttons */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.btnDelete}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 size={13} />
                <span>Eliminar definitivamente</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
