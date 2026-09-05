import React from 'react';
import styles from '../ApuntesView.module.css';
import { Cloud, Eye, Code, Columns, BookOpen, Download, Share2 } from 'lucide-react';
import type { ApunteNota } from '../../../types/academic';

interface NoteEditorHeaderProps {
  activeNote: ApunteNota;
  viewMode: 'render' | 'markdown' | 'split';
  onViewModeChange: (mode: 'render' | 'markdown' | 'split') => void;
  showPdfSplit: boolean;
  onToggleSplit: () => void;
}

export const NoteEditorHeader: React.FC<NoteEditorHeaderProps> = ({
  activeNote,
  viewMode,
  onViewModeChange,
  showPdfSplit,
  onToggleSplit
}) => {
  return (
    <header className={styles.editorTopBar}>
      <div className={styles.editorBreadcrumbs}>
        <span>WORKSPACE</span>
        <span>/</span>
        <span>{activeNote.materiaNombre}</span>
        <span>/</span>
        <span className={styles.parcialBadge}>Parcial 1</span>
        <span>·</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--emerald)' }}>
          <Cloud size={12} />
          <span>Autoguardado 15:42</span>
        </div>
      </div>

      <div className={styles.editorActionsRight}>
        {/* View Mode Toggle */}
        <div className={styles.viewModeToggle}>
          <button
            className={`${styles.viewModeBtn} ${viewMode === 'render' ? styles.viewModeBtnActive : ''}`}
            onClick={() => onViewModeChange('render')}
          >
            <Eye size={12} />
            <span>Render</span>
          </button>
          <button
            className={`${styles.viewModeBtn} ${viewMode === 'markdown' ? styles.viewModeBtnActive : ''}`}
            onClick={() => onViewModeChange('markdown')}
          >
            <Code size={12} />
            <span>Markdown</span>
          </button>
          <button
            className={`${styles.viewModeBtn} ${viewMode === 'split' ? styles.viewModeBtnActive : ''}`}
            onClick={() => onViewModeChange('split')}
          >
            <Columns size={12} />
            <span>Split</span>
          </button>
        </div>

        {/* Split PDF Mode Toggle Button */}
        <button
          className={`${styles.viewModeBtn} ${showPdfSplit ? styles.viewModeBtnActive : ''}`}
          onClick={onToggleSplit}
          title="Abrir visor de material PDF lado a lado con notas (auto-colapsa barras laterales para máxima amplitud)"
        >
          <BookOpen size={12} />
          <span>{showPdfSplit ? 'Cerrar PDF' : 'Ver PDF al lado'}</span>
        </button>

        <button className={styles.btnNewFolder} style={{ width: 'auto', padding: '4px 8px' }}>
          <Download size={12} />
          <span>Exportar PDF</span>
        </button>

        <button className={styles.btnNewFolder} style={{ width: 'auto', padding: '4px 8px' }}>
          <Share2 size={12} />
          <span>Compartir</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--emerald)', fontFamily: 'var(--font-mono)' }}>
          <span>●</span>
          <span>Sincronizado</span>
        </div>
      </div>
    </header>
  );
};

export default NoteEditorHeader;
