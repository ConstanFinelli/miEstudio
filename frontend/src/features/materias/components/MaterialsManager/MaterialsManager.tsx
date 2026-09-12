import React, { useState, useMemo } from 'react';
import styles from './MaterialsManager.module.css';
import {
  Eye,
  FileDown,
  Trash2,
  UploadCloud,
  FileText,
  Folder,
  Layers,
  ListFilter,
  ChevronDown,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import type { MaterialEstudio, CategoriaMaterial } from '../../../../types/academic';

interface MaterialsManagerProps {
  materials: MaterialEstudio[];
  materiaNombre: string;
  onViewPdf: (title: string, url: string) => void;
  onOpenUploadModal: () => void;
  onDeleteMaterial?: (id: string, titulo: string) => void;
}

type FilterCategory = 'TODOS' | CategoriaMaterial;
type ViewMode = 'UNIDADES' | 'CATEGORIAS';

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
  const [viewMode, setViewMode] = useState<ViewMode>('UNIDADES');
  const [collapsedUnits, setCollapsedUnits] = useState<Record<string, boolean>>({});

  // Filter materials by selected category
  const filteredMaterials = useMemo(() => {
    if (selectedCategory === 'TODOS') return materials;
    return materials.filter(m => m.categoria === selectedCategory);
  }, [materials, selectedCategory]);

  // Group filtered materials by unit
  const unitGroups = useMemo(() => {
    const groupsMap = new Map<string, MaterialEstudio[]>();

    filteredMaterials.forEach(mat => {
      const unitKey = mat.unidad && mat.unidad.trim() ? mat.unidad.trim() : 'General / Sin unidad';
      const existing = groupsMap.get(unitKey) || [];
      existing.push(mat);
      groupsMap.set(unitKey, existing);
    });

    // Sort groups: numbered/named units first, General last
    const sortedKeys = Array.from(groupsMap.keys()).sort((a, b) => {
      if (a === 'General / Sin unidad') return 1;
      if (b === 'General / Sin unidad') return -1;
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });

    return sortedKeys.map(key => ({
      unitName: key,
      isGeneral: key === 'General / Sin unidad',
      items: groupsMap.get(key) || []
    }));
  }, [filteredMaterials]);

  const toggleUnitCollapse = (unitName: string) => {
    setCollapsedUnits(prev => ({
      ...prev,
      [unitName]: !prev[unitName]
    }));
  };

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

  const renderMaterialCard = (mat: MaterialEstudio) => (
    <div key={mat.id} className={styles.materialCardItem}>
      <div className={styles.materialLeft}>
        <span className={styles.pdfBadge}>PDF</span>
        <div className={styles.materialMetaContent}>
          <div className={styles.materialTitleRow}>
            <span className={styles.materialTitle}>{mat.titulo}</span>
            <span className={`${styles.catBadge} ${getCategoryBadgeClass(mat.categoria)}`}>
              {getCategoryLabel(mat.categoria)}
            </span>
            {viewMode === 'CATEGORIAS' && mat.unidad && (
              <span className={styles.unitTagBadge}>
                {mat.unidad}
              </span>
            )}
          </div>
          <div className={styles.materialMeta}>
            <span>{mat.archivoNombre}</span> ·{' '}
            <span>{formatFileSize(mat.tamanioBytes)}</span>
            {mat.cantPaginas ? <span> · {mat.cantPaginas} págs</span> : null} ·{' '}
            <span>Subido el {mat.fechaSubida}</span>
          </div>
        </div>
      </div>

      <div className={styles.materialActions}>
        <button
          className={`${styles.btnActionLight} ${styles.btnActionWithIcon}`}
          onClick={() => onViewPdf(mat.titulo, mat.archivoUrl)}
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
          className={`${styles.iconBtnSmall} ${styles.btnDownloadIcon}`}
          title={`Descargar ${mat.archivoNombre}`}
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
  );

  return (
    <div className={styles.materialsSection}>
      {/* Header bar */}
      <div className={styles.materialsHeader}>
        <div className={styles.headerLeftGroup}>
          <div className={styles.materialsTitle}>
            MATERIALES DE ESTUDIO & VISOR DE PDFS ({materials.length})
          </div>

          {/* View mode toggle */}
          {materials.length > 0 && (
            <div className={styles.viewModeSwitch}>
              <button
                type="button"
                className={`${styles.viewSwitchBtn} ${
                  viewMode === 'UNIDADES' ? styles.viewSwitchBtnActive : ''
                }`}
                onClick={() => setViewMode('UNIDADES')}
                title="Agrupar materiales por unidades temáticas"
              >
                <Layers size={12} />
                <span>Por Unidades</span>
              </button>
              <button
                type="button"
                className={`${styles.viewSwitchBtn} ${
                  viewMode === 'CATEGORIAS' ? styles.viewSwitchBtnActive : ''
                }`}
                onClick={() => setViewMode('CATEGORIAS')}
                title="Ver lista plana de materiales"
              >
                <ListFilter size={12} />
                <span>Lista Plana</span>
              </button>
            </div>
          )}
        </div>

        <button
          className={`${styles.btnPrimary} ${styles.btnAddMaterial}`}
          onClick={onOpenUploadModal}
        >
          <UploadCloud size={14} />
          <span>+ Subir PDFs / Guías</span>
        </button>
      </div>

      {/* Category filter tabs */}
      {materials.length > 0 && (
        <div className={styles.materialFiltersRow}>
          {CATEGORY_TABS.map(tab => {
            const count =
              tab.id === 'TODOS'
                ? materials.length
                : materials.filter(m => m.categoria === tab.id).length;

            if (tab.id !== 'TODOS' && count === 0) return null;

            return (
              <button
                key={tab.id}
                type="button"
                className={`${styles.materialFilterChip} ${
                  selectedCategory === tab.id ? styles.materialFilterChipActive : ''
                }`}
                onClick={() => setSelectedCategory(tab.id)}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Materials display */}
      {filteredMaterials.length > 0 ? (
        viewMode === 'UNIDADES' ? (
          /* Grouped by Unit view */
          <div className={styles.unitsContainer}>
            {unitGroups.map(group => {
              const isCollapsed = Boolean(collapsedUnits[group.unitName]);
              const totalBytes = group.items.reduce((acc, curr) => acc + (curr.tamanioBytes || 0), 0);

              return (
                <div key={group.unitName} className={styles.unitGroupCard}>
                  <div
                    className={styles.unitGroupHeader}
                    onClick={() => toggleUnitCollapse(group.unitName)}
                  >
                    <div className={styles.unitHeaderLeft}>
                      {isCollapsed ? (
                        <ChevronRight size={15} className={styles.chevronIcon} />
                      ) : (
                        <ChevronDown size={15} className={styles.chevronIcon} />
                      )}
                      {group.isGeneral ? (
                        <BookOpen size={16} className={styles.unitFolderIcon} />
                      ) : (
                        <Folder size={16} className={styles.unitFolderIcon} />
                      )}
                      <span className={styles.unitGroupTitle}>{group.unitName}</span>
                      <span className={styles.unitCountBadge}>
                        {group.items.length} {group.items.length === 1 ? 'archivo' : 'archivos'}
                      </span>
                      <span className={styles.unitSizeText}>
                        ({formatFileSize(totalBytes)})
                      </span>
                    </div>

                    <span className={styles.unitCollapseHint}>
                      {isCollapsed ? 'Desplegar' : 'Colapsar'}
                    </span>
                  </div>

                  {!isCollapsed && (
                    <div className={styles.unitCardsList}>
                      {group.items.map(mat => renderMaterialCard(mat))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Flat list view */
          <div className={styles.flatCardsList}>
            {filteredMaterials.map(mat => renderMaterialCard(mat))}
          </div>
        )
      ) : materials.length > 0 ? (
        <div className={styles.materialsEmptyState}>
          <div className={styles.emptyCategoryText}>
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
          <div className={styles.emptyStateTitle}>
            Sin materiales de estudio para {materiaNombre}
          </div>
          <p className={styles.emptyStateDesc}>
            Subí diapositivas, guías prácticas o parciales viejos en PDF organizados por unidades para tenerlos siempre a mano.
          </p>
          <button
            className={`${styles.btnPrimary} ${styles.btnAddInitial}`}
            onClick={onOpenUploadModal}
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
