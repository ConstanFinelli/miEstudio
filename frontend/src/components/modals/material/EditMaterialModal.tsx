import React, { useState, useEffect } from 'react';
import styles from './EditMaterialModal.module.css';
import { X, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import type { CategoriaMaterial, MaterialEstudio } from '../../../types/academic';

interface EditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: MaterialEstudio | null;
  materiaNombre?: string;
  existingUnits?: string[];
  onSave: (
    id: string,
    updates: {
      titulo: string;
      categoria: CategoriaMaterial;
      unidad?: string;
    }
  ) => Promise<void>;
}

const CATEGORIAS: { id: CategoriaMaterial; label: string; icon: string }[] = [
  { id: 'TEORIA', label: 'Teoría / Clases', icon: '📖' },
  { id: 'GUIA_PRACTICA', label: 'Guías de TP', icon: '📝' },
  { id: 'EXAMEN_ANTERIOR', label: 'Exámenes / Parciales', icon: '🎯' },
  { id: 'BIBLIOGRAFIA', label: 'Bibliografía / Libros', icon: '📚' },
  { id: 'OTRO', label: 'Resúmenes y Apuntes', icon: '💡' }
];

export const EditMaterialModal: React.FC<EditMaterialModalProps> = ({
  isOpen,
  onClose,
  material,
  materiaNombre,
  existingUnits = [],
  onSave
}) => {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<CategoriaMaterial>('TEORIA');
  const [unidad, setUnidad] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (material) {
      setTitulo(material.titulo || '');
      setCategoria(material.categoria || 'TEORIA');
      setUnidad(material.unidad || '');
      setErrorMessage(null);
    }
  }, [material, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !material) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setErrorMessage('El título no puede estar vacío.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onSave(material.id, {
        titulo: titulo.trim(),
        categoria,
        unidad: unidad.trim()
      });
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al actualizar material.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={styles.overlay} onClick={isSubmitting ? undefined : onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.tagBadge}>EDITAR MATERIAL</span>
            {materiaNombre && <span>{materiaNombre}</span>}
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isSubmitting}
            title="Cerrar (Esc)"
          >
            <X size={14} />
            <span>ESC</span>
          </button>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Editar y Recategorizar Material</h2>
          <p className={styles.subtitle}>
            Actualizá el título, asigná o cambiá de unidad temática y ajustá la categoría de este apunte o guía.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* File meta preview */}
          <div className={styles.fileMetaBanner}>
            <FileText size={18} className={styles.fileMetaIcon} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
              <span className={styles.fileNameText} title={material.archivoNombre}>
                {material.archivoNombre}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                {formatFileSize(material.tamanioBytes)}
                {material.cantPaginas ? ` · ${material.cantPaginas} ${material.cantPaginas === 1 ? 'pág' : 'págs'}` : ''} · Subido el{' '}
                {material.fechaSubida}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Título Visible</span>
              <span style={{ color: 'var(--text-dim)' }}>Obligatorio</span>
            </label>
            <input
              type="text"
              className={styles.textInput}
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ej: Guía de Ejercicios Prácticos N° 2"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Unit / Theme Group */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Unidad o Grupo Temático</span>
              <span style={{ color: 'var(--text-dim)' }}>Opcional</span>
            </label>
            <input
              type="text"
              list="edit-material-units-list"
              className={styles.textInput}
              value={unidad}
              onChange={e => setUnidad(e.target.value)}
              placeholder="Ej: Unidad 2: Dinámica (dejar vacío para General)"
              disabled={isSubmitting}
            />
            <datalist id="edit-material-units-list">
              {existingUnits.map((u, i) => (
                <option key={i} value={u} />
              ))}
            </datalist>
          </div>

          {/* Category selection */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Categoría del Material</span>
            </label>
            <div className={styles.categoryPillsList}>
              {CATEGORIAS.map(cat => {
                const isSelected = categoria === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`${styles.categoryPill} ${
                      isSelected ? styles.categoryPillActive : ''
                    }`}
                    onClick={() => setCategoria(cat.id)}
                    disabled={isSubmitting}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className={styles.errorMessage}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer actions */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={isSubmitting || !titulo.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMaterialModal;
