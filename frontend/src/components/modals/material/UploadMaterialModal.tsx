import React, { useState, useRef, useEffect } from 'react';
import styles from './UploadMaterialModal.module.css';
import {
  X,
  UploadCloud,
  FileText,
  AlertCircle,
  Loader2,
  Trash2,
  Plus,
  FolderPlus,
  CheckCircle2
} from 'lucide-react';
import type { CategoriaMaterial, MaterialEstudio } from '../../../types/academic';

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  materiaId: string;
  materiaNombre: string;
  materiaCodigo?: string;
  existingUnits?: string[];
  onUpload: (
    file: File,
    titulo: string,
    categoria: CategoriaMaterial,
    unidad?: string
  ) => Promise<MaterialEstudio>;
  onUploadBatch?: (
    items: Array<{
      file: File;
      titulo: string;
      categoria: CategoriaMaterial;
      unidad?: string;
    }>
  ) => Promise<MaterialEstudio[]>;
  onSuccess?: (material: MaterialEstudio | MaterialEstudio[]) => void;
}

export interface QueuedMaterialItem {
  id: string;
  file: File;
  titulo: string;
  categoria: CategoriaMaterial;
  unidad: string;
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
  existingUnits = [],
  onUpload,
  onUploadBatch,
  onSuccess
}) => {
  const [queuedFiles, setQueuedFiles] = useState<QueuedMaterialItem[]>([]);
  const [globalUnidad, setGlobalUnidad] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setQueuedFiles([]);
      setGlobalUnidad('');
      setIsDragging(false);
      setIsUploading(false);
      setUploadProgress(null);
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

  const handleFilesAdded = (fileList: FileList | File[]) => {
    const addedItems: QueuedMaterialItem[] = [];
    const filesArray = Array.from(fileList);
    let hasNonPdf = false;
    let hasOversized = false;

    filesArray.forEach(file => {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        hasNonPdf = true;
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        hasOversized = true;
        return;
      }
      const cleanName = file.name
        .replace(/\.pdf$/i, '')
        .replace(/[-_]/g, ' ')
        .trim();

      addedItems.push({
        id: `queue-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        titulo: cleanName || 'Material de estudio',
        categoria: 'TEORIA', // Default to TEORIA as requested
        unidad: globalUnidad.trim()
      });
    });

    if (hasOversized && hasNonPdf) {
      setErrorMessage('Algunos archivos no son formato PDF o superan el límite máximo de 50 MB.');
    } else if (hasOversized) {
      setErrorMessage('El tamaño de algunos archivos supera el límite máximo de 50 MB por archivo.');
    } else if (hasNonPdf) {
      setErrorMessage('Solo se admiten documentos en formato PDF. Los demás archivos fueron omitidos.');
    } else {
      setErrorMessage(null);
    }

    if (addedItems.length > 0) {
      setQueuedFiles(prev => [...prev, ...addedItems]);
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
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<QueuedMaterialItem>) => {
    setQueuedFiles(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setQueuedFiles(prev => prev.filter(item => item.id !== id));
  };

  const handleApplyGlobalUnidadToAll = () => {
    const trimmed = globalUnidad.trim();
    setQueuedFiles(prev =>
      prev.map(item => ({ ...item, unidad: trimmed }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (queuedFiles.length === 0) {
      setErrorMessage('Por favor, seleccioná al menos un archivo PDF para continuar.');
      return;
    }

    // Validate titles
    const emptyTitle = queuedFiles.find(item => !item.titulo.trim());
    if (emptyTitle) {
      setErrorMessage('Por favor, asegurate de que todos los archivos tengan un título asignado.');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage(null);

      if (onUploadBatch) {
        setUploadProgress({ current: 1, total: queuedFiles.length });
        const createdBatch = await onUploadBatch(
          queuedFiles.map(q => ({
            file: q.file,
            titulo: q.titulo.trim(),
            categoria: q.categoria,
            unidad: q.unidad.trim() || undefined
          }))
        );
        if (onSuccess) onSuccess(createdBatch);
      } else {
        const results: MaterialEstudio[] = [];
        for (let idx = 0; idx < queuedFiles.length; idx++) {
          const item = queuedFiles[idx];
          setUploadProgress({ current: idx + 1, total: queuedFiles.length });
          const res = await onUpload(
            item.file,
            item.titulo.trim(),
            item.categoria,
            item.unidad.trim() || undefined
          );
          results.push(res);
        }
        if (onSuccess) onSuccess(results);
      }

      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'No pudimos subir los materiales de estudio. Por favor, intentá nuevamente.'
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
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
          <h2 className={styles.title}>Subir Materiales de Estudio</h2>
          <p className={styles.subtitle}>
            Adjuntá múltiples PDFs de una unidad temática o generales, asignándoles categoría (Teoría por defecto).
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Global Unidad / Grupo selector */}
          <div className={styles.globalUnidadCard}>
            <div className={styles.globalUnidadHeader}>
              <FolderPlus size={15} className={styles.globalUnidadIcon} />
              <label className={styles.label} style={{ margin: 0 }}>
                Unidad o Grupo Temático (Opcional)
              </label>
            </div>
            <div className={styles.globalUnidadRow}>
              <input
                type="text"
                list="existing-units-list"
                className={styles.textInput}
                placeholder="Ej: Unidad 1: Cinemática (o dejar vacío para General)"
                value={globalUnidad}
                onChange={e => {
                  setGlobalUnidad(e.target.value);
                }}
                disabled={isUploading}
              />
              <datalist id="existing-units-list">
                {existingUnits.map((u, i) => (
                  <option key={i} value={u} />
                ))}
              </datalist>

              {queuedFiles.length > 0 && (
                <button
                  type="button"
                  className={styles.btnApplyGlobal}
                  onClick={handleApplyGlobalUnidadToAll}
                  disabled={isUploading}
                  title="Aplica este nombre de unidad a todos los archivos de la lista"
                >
                  <span>Asignar a todos</span>
                </button>
              )}
            </div>
          </div>

          {/* Drop Zone */}
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
              multiple
              className={styles.fileInputHidden}
              onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFilesAdded(e.target.files);
                  e.target.value = ''; // Reset input so same file can be re-selected if needed
                }
              }}
            />
            <div className={styles.dropZoneIcon}>
              <UploadCloud size={24} />
            </div>
            <div>
              <span className={styles.dropZoneText}>
                {queuedFiles.length > 0
                  ? 'Hacé click o arrastrá más archivos PDF aquí'
                  : 'Hacé click para seleccionar o arrastrá tus PDFs acá'}
              </span>
              <div className={styles.dropZoneHint}>
                Podés seleccionar varios PDFs simultáneamente · Hasta 50 MB c/u
              </div>
            </div>
          </div>

          {/* Queued Files List */}
          {queuedFiles.length > 0 && (
            <div className={styles.queueContainer}>
              <div className={styles.queueHeaderRow}>
                <span className={styles.queueTitle}>
                  Archivos preparados ({queuedFiles.length})
                </span>
                <button
                  type="button"
                  className={styles.btnAddMoreFiles}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Plus size={12} />
                  <span>Agregar más</span>
                </button>
              </div>

              <div className={styles.queueList}>
                {queuedFiles.map((item, idx) => (
                  <div key={item.id} className={styles.queueItemCard}>
                    <div className={styles.queueItemHeader}>
                      <div className={styles.queueFileMeta}>
                        <div className={styles.pdfIconBadge}>
                          <FileText size={15} />
                        </div>
                        <div className={styles.queueFileNameGroup}>
                          <span className={styles.queueOriginalName} title={item.file.name}>
                            {idx + 1}. {item.file.name}
                          </span>
                          <span className={styles.queueFileSize}>
                            {formatFileSize(item.file.size)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.removeQueueBtn}
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isUploading}
                        title="Quitar este archivo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className={styles.queueFieldsGrid}>
                      {/* Title input */}
                      <div className={styles.queueField}>
                        <label className={styles.fieldLabel}>Título visible</label>
                        <input
                          type="text"
                          className={styles.queueInput}
                          value={item.titulo}
                          onChange={e => handleUpdateItem(item.id, { titulo: e.target.value })}
                          placeholder="Título del apunte o guía"
                          disabled={isUploading}
                        />
                      </div>

                      {/* Unidad input */}
                      <div className={styles.queueField}>
                        <label className={styles.fieldLabel}>Unidad / Grupo</label>
                        <input
                          type="text"
                          list="existing-units-list"
                          className={styles.queueInput}
                          value={item.unidad}
                          onChange={e => handleUpdateItem(item.id, { unidad: e.target.value })}
                          placeholder="General / Sin unidad"
                          disabled={isUploading}
                        />
                      </div>

                      {/* Category selector */}
                      <div className={styles.queueFieldFull}>
                        <label className={styles.fieldLabel}>Categoría</label>
                        <div className={styles.categoryPillsList}>
                          {CATEGORIAS.map(cat => {
                            const isSelected = item.categoria === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                className={`${styles.categoryPill} ${
                                  isSelected ? styles.categoryPillActive : ''
                                }`}
                                onClick={() => handleUpdateItem(item.id, { categoria: cat.id })}
                                disabled={isUploading}
                              >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div className={styles.errorMessage}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Progress message */}
          {uploadProgress && (
            <div className={styles.progressBanner}>
              <Loader2 size={14} className="animate-spin" />
              <span>
                Subiendo material {uploadProgress.current} de {uploadProgress.total}...
              </span>
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
              disabled={isUploading || queuedFiles.length === 0}
            >
              {isUploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Subiendo ({uploadProgress?.current || 1}/{queuedFiles.length})...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>
                    {queuedFiles.length === 0
                      ? 'Seleccionar archivos'
                      : queuedFiles.length === 1
                      ? 'Subir 1 Material'
                      : `Subir ${queuedFiles.length} Materiales`}
                  </span>
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
