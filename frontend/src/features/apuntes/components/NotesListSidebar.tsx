import React from 'react';
import styles from '../ApuntesView.module.css';
import { BookOpen, ChevronLeft, Search, Plus } from 'lucide-react';
import type { ApunteNota } from '../../../types/academic';

interface NotesListSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
  notes: ApunteNota[];
  activeNoteId: string;
  onSelectNote: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNoteModal: () => void;
}

export const NotesListSidebar: React.FC<NotesListSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  notes,
  activeNoteId,
  onSelectNote,
  searchQuery,
  onSearchChange,
  onOpenNoteModal
}) => {
  if (isCollapsed) {
    return (
      <section className={styles.notesColumnCollapsed}>
        <button
          className={styles.railToggleBtn}
          onClick={() => onToggleCollapse(false)}
          title="Expandir Lista de Apuntes"
        >
          <BookOpen size={14} color="var(--text-secondary)" />
        </button>
        <span className={styles.railVerticalLabel}>Apuntes</span>
      </section>
    );
  }

  return (
    <section className={styles.notesColumn}>
      <div className={styles.notesHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className={styles.searchNoteRow} style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Search size={12} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Buscar apunte..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{ border: 'none', background: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '11px', width: '100%' }}
              />
            </div>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>ESC</span>
          </div>
          <button
            className={styles.toolBtn}
            style={{ padding: '4px 6px' }}
            onClick={() => onToggleCollapse(true)}
            title="Colapsar lista de notas"
          >
            <ChevronLeft size={12} />
          </button>
        </div>

        <div className={styles.notesListStats}>
          <span>{notes.length} apuntes</span>
          <span style={{ cursor: 'pointer' }}>Cronológico ▾</span>
        </div>
      </div>

      <div className={styles.notesList}>
        {notes.map((note) => {
          const isActive = note.id === activeNoteId;
          return (
            <div
              key={note.id}
              className={`${styles.noteCard} ${isActive ? styles.noteCardActive : ''}`}
              onClick={() => onSelectNote(note.id)}
            >
              <div className={styles.noteCardTop}>
                <h4 className={styles.noteCardTitle}>{note.titulo}</h4>
                {isActive && <span className={styles.activeTag}>ACTIVO</span>}
              </div>

              <p className={styles.noteCardExcerpt}>{note.resumen}</p>

              <div className={styles.noteCardFooter}>
                <span>{note.fechaModificacion}</span>
                <div className={styles.tagPillsRow}>
                  {note.tags.map(tag => (
                    <span key={tag} className={styles.miniTag}>#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.notesFooter}>
        <button className={styles.btnNewFolder} onClick={onOpenNoteModal}>
          <Plus size={12} />
          <span>+ Nueva Nota en esta Materia</span>
        </button>
      </div>
    </section>
  );
};

export default NotesListSidebar;
