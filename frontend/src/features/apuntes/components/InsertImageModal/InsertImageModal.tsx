import React, { useState, useRef, useEffect } from 'react';
import styles from './InsertImageModal.module.css';
import { X, UploadCloud, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { apuntesService } from '../../../../services/apuntesService';

interface InsertImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (markdown: string) => void;
}

export const InsertImageModal: React.FC<InsertImageModalProps> = ({
  isOpen,
  onClose,
  onInsert
}) => {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTab('upload');
      setSelectedFile(null);
      setFilePreview(null);
      setUrlInput('');
      setDescription('');
      setIsUploading(false);
      setErrorMsg('');
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (filePreview && filePreview.startsWith('blob:')) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor seleccioná un archivo de imagen válido (PNG, JPG, WebP, GIF, SVG).');
      return;
    }
    setErrorMsg('');
    setSelectedFile(file);
    if (!description) {
      // Default description from filename without extension
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDescription(cleanName);
    }
    const previewUrl = URL.createObjectURL(file);
    setFilePreview(previewUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const altText = description.trim() || 'Imagen';

    if (tab === 'upload') {
      if (!selectedFile) {
        setErrorMsg('Por favor seleccioná una imagen para subir.');
        return;
      }

      setIsUploading(true);
      try {
        const result = await apuntesService.uploadImage(selectedFile);
        const md = `\n![${altText}](${result.url})\n`;
        onInsert(md);
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'Error al subir la imagen.');
      } finally {
        setIsUploading(false);
      }
    } else {
      const cleanUrl = urlInput.trim();
      if (!cleanUrl) {
        setErrorMsg('Por favor ingresá la URL de la imagen.');
        return;
      }
      const md = `\n![${altText}](${cleanUrl})\n`;
      onInsert(md);
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={isUploading ? undefined : onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <span className={styles.headerIcon}>
              <ImageIcon size={18} />
            </span>
            <span>Insertar Imagen en Apunte</span>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isUploading}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className={styles.tabBar}>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === 'upload' ? styles.tabBtnActive : ''}`}
            onClick={() => setTab('upload')}
          >
            <UploadCloud size={15} />
            <span>Subir archivo</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === 'url' ? styles.tabBtnActive : ''}`}
            onClick={() => setTab('url')}
          >
            <LinkIcon size={15} />
            <span>Enlace web (URL)</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            {errorMsg && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--rose-alpha, rgba(239, 68, 68, 0.1))',
                  border: '1px solid var(--rose, #ef4444)',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--rose, #ef4444)',
                  fontSize: '12px'
                }}
              >
                {errorMsg}
              </div>
            )}

            {tab === 'upload' ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  style={{ display: 'none' }}
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />

                {!selectedFile ? (
                  <div
                    className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className={styles.dropzoneIcon}>
                      <UploadCloud size={24} />
                    </div>
                    <div className={styles.dropzoneText}>
                      Hacé clic para seleccionar o arrastrá una imagen aquí
                    </div>
                    <div className={styles.dropzoneHint}>
                      PNG, JPG, WebP, GIF o SVG (máx. 15 MB)
                    </div>
                  </div>
                ) : (
                  <div className={styles.previewContainer}>
                    <img src={filePreview || ''} alt="Vista previa" className={styles.previewImg} />
                    <button
                      type="button"
                      className={styles.removePreviewBtn}
                      title="Eliminar y elegir otra"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Dirección web de la imagen (URL)</label>
                <input
                  type="url"
                  className={styles.input}
                  placeholder="https://ejemplo.com/grafico.png"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  autoFocus
                />
                {urlInput.trim() && (
                  <div className={styles.previewContainer} style={{ marginTop: '8px' }}>
                    <img
                      src={urlInput}
                      alt="Vista previa de URL"
                      className={styles.previewImg}
                      onError={() => setErrorMsg('No se pudo previsualizar la URL ingresada. Asegurate de que sea una dirección de imagen directa válida.')}
                      onLoad={() => setErrorMsg('')}
                    />
                  </div>
                )}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label className={styles.label}>Descripción o Pie de foto (opcional)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ej: Diagrama de bloques del microcontrolador"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isUploading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isUploading || (tab === 'upload' && !selectedFile) || (tab === 'url' && !urlInput.trim())}
            >
              {isUploading ? (
                <>
                  <span className={styles.spinner} />
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <ImageIcon size={14} />
                  <span>Insertar en Apunte</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
