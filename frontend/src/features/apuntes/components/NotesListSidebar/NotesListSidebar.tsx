import React from "react";
import styles from "./NotesListSidebar.module.css";
import { BookOpen, ChevronLeft, Search, Plus, Trash2 } from "lucide-react";
import type { ApunteNota } from "../../../../types/academic";

interface NotesListSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
  notes: ApunteNota[];
  activeNoteId: string;
  onSelectNote: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNoteModal: (materiaId?: string) => void;
  onDeleteNote?: (id: string, titulo: string) => void;
  filterLabel?: string;
}

export const NotesListSidebar: React.FC<NotesListSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  notes,
  activeNoteId,
  onSelectNote,
  searchQuery,
  onSearchChange,
  onOpenNoteModal,
  onDeleteNote,
  filterLabel,
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
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div className={styles.searchNoteRow} style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Search size={12} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Buscar apunte..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                  border: "none",
                  background: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: "11px",
                  width: "100%",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "9px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-dim)",
              }}
            >
              ESC
            </span>
          </div>
          <button
            className={styles.toolBtn}
            style={{ padding: "4px 6px" }}
            onClick={() => onToggleCollapse(true)}
            title="Colapsar lista de notas"
          >
            <ChevronLeft size={12} />
          </button>
        </div>

        <div className={styles.notesListStats}>
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "155px",
            }}
            title={filterLabel}
          >
            {filterLabel ? (
              <strong style={{ color: "var(--text-primary)" }}>
                {filterLabel}:{" "}
              </strong>
            ) : null}
            {notes.length} {notes.length === 1 ? "apunte" : "apuntes"}
          </span>
          <span style={{ cursor: "pointer", flexShrink: 0 }}>
            Cronológico ▾
          </span>
        </div>
      </div>

      <div className={styles.notesList}>
        {notes.length === 0 ? (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            <BookOpen
              size={24}
              style={{
                color: "var(--text-dim)",
                margin: "0 auto 8px",
                display: "block",
                opacity: 0.6,
              }}
            />
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "4px",
              }}
            >
              Sin notas
            </p>
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-dim)",
                display: "block",
                marginBottom: "14px",
                lineHeight: 1.4,
              }}
            >
              {searchQuery
                ? "No hay notas con ese término"
                : filterLabel
                  ? `No hay notas registradas en ${filterLabel}`
                  : "No hay notas registradas en esta carpeta"}
            </span>
            <button
              className={styles.btnNewFolder}
              onClick={() => onOpenNoteModal()}
              style={{ justifyContent: "center" }}
            >
              <Plus size={12} />
              <span>Crear Apunte</span>
            </button>
          </div>
        ) : (
          notes.map((note) => {
            const isActive = note.id === activeNoteId;
            return (
              <div
                key={note.id}
                className={`${styles.noteCard} ${isActive ? styles.noteCardActive : ""}`}
                onClick={() => onSelectNote(note.id)}
              >
                <div className={styles.noteCardTop}>
                  <h4 className={styles.noteCardTitle}>{note.titulo}</h4>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      flexShrink: 0,
                    }}
                  >
                    {isActive && (
                      <span className={styles.activeTag}>ACTIVO</span>
                    )}
                    {onDeleteNote && (
                      <button
                        type="button"
                        className={styles.noteDeleteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNote(note.id, note.titulo);
                        }}
                        title={`Eliminar "${note.titulo}"`}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <p className={styles.noteCardExcerpt}>{note.resumen}</p>

                <div className={styles.noteCardFooter}>
                  <span>
                    {new Date(note.fechaModificacion).toLocaleDateString(
                      "es-AR",
                      { day: "numeric", month: "short" },
                    )}
                  </span>
                  <div className={styles.tagPillsRow}>
                    {note.tags.map((tag) => (
                      <span key={tag} className={styles.miniTag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className={styles.notesFooter}>
        <button className={styles.btnNewFolder} onClick={() => onOpenNoteModal()}>
          <Plus size={12} />
          <span>Nueva Nota en esta Materia</span>
        </button>
      </div>
    </section>
  );
};

export default NotesListSidebar;
