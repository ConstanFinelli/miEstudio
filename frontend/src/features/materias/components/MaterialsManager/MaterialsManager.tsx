import React, { useState, useMemo } from 'react';
import styles from './MaterialsManager.module.css';
import { Eye, FileDown, Trash2, UploadCloud, FileText } from 'lucide-react';
import type { MaterialEstudio, CategoriaMaterial } from '../../../../types/academic';

interface MaterialsManagerProps {
  materials: MaterialEstudio[];
  materiaNombre: string;
  onViewPdf: (title: string, url: string) => void;
  onOpenUploadModal: () => void;
  onDeleteMaterial?: (id: string, titulo: string) => void;
}

type FilterCategory = 'TODOS' | CategoriaMaterial;

const CATEGORY_TABS: { id: FilterCategory; label: string }[] = [
  { id: 'TODOS', label: 'Todos' },
  { id: 'TEORIA', label: 'Teoría' },
  { id: 'GUIA_PRACTICA', label: 'Guías de TP' },
  { id: 'EXAMEN_ANTERIOR', label: 'Exámenes' },
  { id: 'BIBLIOGRAFIA', label: 'Bibliografía' },
  { id: 'OTRO', label: 'Apuntes / Otros' }
];

export const MaterialsManager: React.FC<MaterialsManagerProps> = ({
  materials,
  materiaNombre,
  onViewPdf,
  onOpenUploadModal,
  onDeleteMaterial
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('TODOS');

  const filteredMaterials = useMemo(() => {
    if (selectedCategory === 'TODOS') return materials;
    return materials.filter(m => m.categoria === selectedCategory);
  }, [materials, selectedCategory]);

  const getCategoryBadgeClass = (categoria: CategoriaMaterial) => {
    switch (categoria) {
      case 'TEORIA':
        return styles.catBadgeTeoria;
      case 'GUIA_PRACTICA':
        return styles.catBadgeGuia;
      case 'EXAMEN_ANTERIOR':
        return styles.catBadgeExamen;
      case 'BIBLIOGRAFIA':
        return styles.catBadgeBiblio;
      case 'OTRO':
      default:
        return styles.catBadgeOtro;
    }
  };

  const getCategoryLabel = (categoria: CategoriaMaterial) => {
    switch (categoria) {
      case 'TEORIA':
        return 'TEORÍA';
      case 'GUIA_PRACTICA':
        return 'GUÍA TP';
      case 'EXAMEN_ANTERIOR':
        return 'EXAMEN';
      case 'BIBLIOGRAFIA':
        return 'BIBLIOGRAFÍA';
      case 'OTRO':
      default:
        return 'APUNTE';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={styles.materialsSection}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
          MATERIALES DE ESTUDIO & VISOR DE PDFS ({materials.length})
        </div>
        <button
          className={styles.btnPrimary}
          onClick={onOpenUploadModal}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px' }}
        >
          <UploadCloud size={14} />
          <span>+ Subir PDF / Guía</span>
        </button>
      </div>

      {/* Category filter tabs */}
      {materials.length > 0 && (
        <div className={styles.materialFiltersRow}>
          {CATEGORY_TABS.map(tab => {
            const count = tab.id === 'TODOS'
              ? materials.length
              : materials.filter(m => m.categoria === tab.id).length;

            if (tab.id !== 'TODOS' && count === 0) return null;

            return (
              <button
                key={tab.id}
                type="button"
                className={`${styles.materialFilterChip} ${selectedCategory === tab.id ? styles.materialFilterChipActive : ''}`}
                onClick={() => setSelectedCategory(tab.id)}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Materials list */}
      {filteredMaterials.length > 0 ? (
        filteredMaterials.map(mat => (
          <div key={mat.id} className={styles.materialCardItem}>
            <div className={styles.materialLeft}>
              <span className={styles.pdfBadge}>PDF</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className={styles.materialTitle}>{mat.titulo}</span>
                  <span className={`${styles.catBadge} ${getCategoryBadgeClass(mat.categoria)}`}>
                    {getCategoryLabel(mat.categoria)}
                  </span>
                </div>
                <div className={styles.materialMeta}>
                  <span>{mat.archivoNombre}</span> ·{' '}
                  <span>{formatFileSize(mat.tamanioBytes)}</span>
                  {mat.cantPaginas ? <span> · {mat.cantPaginas} págs</span> : null} ·{' '}
                  <span>Subido el {mat.fechaSubida}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                className={styles.btnActionLight}
                onClick={() => onViewPdf(mat.titulo, mat.archivoUrl)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Abrir visor de lectura"
              >
                <Eye size={13} />
                <span>Visualizar en Pantalla</span>
              </button>

              <a
                href={mat.archivoUrl}
                download={mat.archivoNombre}
                target="_blank"
                rel="noreferrer"
                className={styles.iconBtnSmall}
                title={`Descargar ${mat.archivoNombre}`}
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <FileDown size={13} />
              </a>

              {onDeleteMaterial && (
                <button
                  className={styles.iconBtnDanger}
                  onClick={() => onDeleteMaterial(mat.id, mat.titulo)}
                  title={`Eliminar "${mat.titulo}"`}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))
      ) : materials.length > 0 ? (
        <div className={styles.materialsEmptyState}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            No hay materiales en la categoría seleccionada ({selectedCategory}).
          </div>
          <button
            className={styles.btnActionLight}
            onClick={() => setSelectedCategory('TODOS')}
          >
            Ver todos los materiales ({materials.length})
          </button>
        </div>
      ) : (
        <div className={styles.materialsEmptyState}>
          <FileText size={28} color="var(--text-dim)" />
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Sin materiales de estudio para {materiaNombre}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 6px', maxWidth: '360px' }}>
            Subí el programa, diapositivas, guías prácticas o parciales viejos en PDF para tenerlos siempre a mano y visualizarlos en pantalla.
          </p>
          <button
            className={styles.btnPrimary}
            onClick={onOpenUploadModal}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px' }}
          >
            <UploadCloud size={14} />
            <span>Subir primer PDF</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MaterialsManager;
