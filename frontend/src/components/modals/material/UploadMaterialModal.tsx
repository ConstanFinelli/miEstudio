import React, { useState, useRef, useEffect } from 'react';
import styles from './UploadMaterialModal.module.css';
import { X, UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';
import type { CategoriaMaterial, MaterialEstudio } from '../../../types/academic';

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  materiaId: string;
  materiaNombre: string;
  materiaCodigo?: string;
  onUpload: (
    file: File,
    titulo: string,
    categoria: CategoriaMaterial
  ) => Promise<MaterialEstudio>;
  onSuccess?: (material: MaterialEstudio) => void;
}

const CATEGORIAS: { id: CategoriaMaterial; label: string; icon: string }[] = [
  { id: 'TEORIA', label: 'Teoría / Clases', icon: '📖' },
  { id: 'GUIA_PRACTICA', label: 'Guías de TP', icon: '📝' },
  { id: 'EXAMEN_ANTERIOR', label: 'Exámenes / Parciales', icon: '🎯' },
  { id: 'BIBLIOGRAFIA', label: 'Bibliografía / Libros', icon: '📚' },
  { id: 'OTRO', label: 'Resúmenes y Apuntes', icon: '💡' }
];

export const UploadMaterialModal: React.FC<UploadMaterialModalProps> = ({
  isOpen,
  onClose,
  materiaNombre,
  materiaCodigo,
  onUpload,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<CategoriaMaterial>('TEORIA');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setTitulo('');
      setCategoria('TEORIA');
      setIsDragging(false);
      setIsUploading(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isUploading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isUploading, onClose]);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setErrorMessage('Por favor seleccioná un archivo en formato PDF.');
      return;
    }
    setErrorMessage(null);
    setFile(selectedFile);

    // Auto-generate a clean title if title is empty
    if (!titulo.trim()) {
      const cleanName = selectedFile.name
        .replace(/\.pdf$/i, '')
        .replace(/[-_]/g, ' ')
        .trim();
      setTitulo(cleanName);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Debes adjuntar un archivo PDF.');
      return;
    }
    if (!titulo.trim()) {
      setErrorMessage('El título del material es obligatorio.');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage(null);
      const created = await onUpload(file, titulo.trim(), categoria);
      if (onSuccess) {
        onSuccess(created);
      }
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Error al subir el material. Intentalo de nuevo.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={styles.overlay} onClick={isUploading ? undefined : onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.tagBadge}>PDF & MATERIALES</span>
            {materiaCodigo && <span>{materiaCodigo} · </span>}
            <span>{materiaNombre}</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isUploading}
            title="Cerrar (Esc)"
          >
            <X size={14} />
            <span>ESC</span>
          </button>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Subir Material de Estudio</h2>
          <p className={styles.subtitle}>
            Adjuntá diapositivas, guías, resúmenes o exámenes para consultarlos y visualizarlos en pantalla.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Drop Zone / Selected File */}
          {!file ? (
            <div
              className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className={styles.fileInputHidden}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <div className={styles.dropZoneIcon}>
                <UploadCloud size={24} />
              </div>
              <div>
                <span className={styles.dropZoneText}>
                  Hacé click para seleccionar o arrastrá tu PDF acá
                </span>
                <div className={styles.dropZoneHint}>Archivos .pdf hasta 50 MB</div>
              </div>
            </div>
          ) : (
            <div className={styles.selectedFileCard}>
              <div className={styles.selectedFileInfo}>
                <div className={styles.pdfIconBox}>
                  <FileText size={20} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className={styles.selectedFileName} title={file.name}>
                    {file.name}
                  </div>
                  <div className={styles.selectedFileSize}>
                    {formatFileSize(file.size)} · PDF
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={styles.removeFileBtn}
                onClick={() => setFile(null)}
                disabled={isUploading}
                title="Quitar archivo"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Title Input */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Título del Material</label>
            <input
              type="text"
              className={styles.textInput}
              placeholder="Ej: Guía Práctica 2 - Enrutamiento BGP"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              disabled={isUploading}
              required
            />
          </div>

          {/* Category Selector */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Categoría</label>
            <div className={styles.categoryGrid}>
              {CATEGORIAS.map(cat => {
                const isActive = categoria === cat.id;
                return (
                  <div
                    key={cat.id}
                    className={`${styles.categoryCard} ${isActive ? styles.categoryCardActive : ''}`}
                    onClick={() => !isUploading && setCategoria(cat.id)}
                  >
                    <span className={styles.categoryIcon}>{cat.icon}</span>
                    <span className={styles.categoryLabel}>{cat.label}</span>
                  </div>
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

          {/* Footer Actions */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
              disabled={isUploading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={isUploading || !file}
            >
              {isUploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Subiendo PDF...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={14} />
                  <span>Subir Material</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadMaterialModal;
