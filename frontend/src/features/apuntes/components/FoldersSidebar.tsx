import React from 'react';
import styles from '../ApuntesView.module.css';
import { Folder, ChevronLeft, Plus } from 'lucide-react';

interface FoldersSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
  selectedSubFolder: string | null;
  onSelectSubFolder: (sub: string | null) => void;
}

export const FoldersSidebar: React.FC<FoldersSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  selectedFolder,
  onSelectFolder,
  selectedSubFolder,
  onSelectSubFolder
}) => {
  if (isCollapsed) {
    return (
      <aside className={styles.foldersColumnCollapsed}>
        <button
          className={styles.railToggleBtn}
          onClick={() => onToggleCollapse(false)}
          title="Expandir Carpetas de Carrera"
        >
          <Folder size={14} color="var(--primary)" />
        </button>
        <span className={styles.railVerticalLabel}>Carpetas</span>
      </aside>
    );
  }

  return (
    <aside className={styles.foldersColumn}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 12px 4px 12px' }}>
        <span className={styles.folderSectionTitle} style={{ padding: 0 }}>Carpetas (4)</span>
        <button
          className={styles.toolBtn}
          style={{ padding: '2px 5px' }}
          onClick={() => onToggleCollapse(true)}
          title="Colapsar panel de carpetas"
        >
          <ChevronLeft size={12} />
        </button>
      </div>

      <div className={styles.foldersList}>
        {/* Sistemas Distribuidos */}
        <div>
          <div
            className={`${styles.folderItem} ${selectedFolder === 'Sistemas Distribuidos' ? styles.folderItemActive : ''}`}
            onClick={() => onSelectFolder('Sistemas Distribuidos')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Folder size={13} color="var(--primary)" />
              <span>Sistemas Distribuidos</span>
            </div>
            <span className={styles.countBadge}>5</span>
          </div>

          {selectedFolder === 'Sistemas Distribuidos' && (
            <div>
              <div
                className={styles.folderSubItem}
                style={{ color: selectedSubFolder === '1er Parcial' ? 'var(--text-primary)' : undefined }}
                onClick={() => onSelectSubFolder('1er Parcial')}
              >
                <span>↳ 1er Parcial</span>
                <span className={styles.countBadge}>3</span>
              </div>
              <div
                className={styles.folderSubItem}
                style={{ color: selectedSubFolder === 'Laboratorios Go' ? 'var(--text-primary)' : undefined }}
                onClick={() => onSelectSubFolder('Laboratorios Go')}
              >
                <span>↳ Laboratorios Go</span>
                <span className={styles.countBadge}>2</span>
              </div>
            </div>
          )}
        </div>

        {/* Bases de Datos II */}
        <div
          className={`${styles.folderItem} ${selectedFolder === 'Bases de Datos II' ? styles.folderItemActive : ''}`}
          onClick={() => onSelectFolder('Bases de Datos II')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Folder size={13} color="var(--blue)" />
            <span>Bases de Datos II</span>
          </div>
          <span className={styles.countBadge}>8</span>
        </div>

        {/* Algoritmos III */}
        <div
          className={`${styles.folderItem} ${selectedFolder === 'Algoritmos III' ? styles.folderItemActive : ''}`}
          onClick={() => onSelectFolder('Algoritmos III')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Folder size={13} color="var(--purple)" />
            <span>Algoritmos III</span>
          </div>
          <span className={styles.countBadge}>3</span>
        </div>

        {/* Redes de Datos */}
        <div
          className={`${styles.folderItem} ${selectedFolder === 'Redes de Datos' ? styles.folderItemActive : ''}`}
          onClick={() => onSelectFolder('Redes de Datos')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Folder size={13} color="var(--emerald)" />
            <span>Redes de Datos</span>
          </div>
          <span className={styles.countBadge}>2</span>
        </div>

        <div className={styles.folderSectionTitle} style={{ marginTop: '12px', padding: '0 8px' }}>Histórico</div>
        <div className={styles.folderItem}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Folder size={13} color="var(--text-dim)" />
            <span>Archivo de Materias</span>
          </div>
          <span className={styles.countBadge}>24</span>
        </div>
      </div>

      <div className={styles.foldersFooter}>
        <button className={styles.btnNewFolder} onClick={() => alert('Crear nueva carpeta')}>
          <Plus size={12} />
          <span>+ Nueva Carpeta / Materia</span>
        </button>
      </div>
    </aside>
  );
};

export default FoldersSidebar;
