import React from "react";
import styles from "./NoteEditorHeader.module.css";
import { Cloud, Eye, Code, Columns, BookOpen, Trash2, Sparkles } from "lucide-react";
import type { ApunteNota } from "../../../../types/academic";

interface NoteEditorHeaderProps {
  activeNote: ApunteNota | null;
  viewMode: "render" | "markdown" | "split";
  onViewModeChange: (mode: "render" | "markdown" | "split") => void;
  showPdfSplit: boolean;
  onToggleSplit: () => void;
  showAiPane?: boolean;
  onToggleAiPane?: () => void;
  onDeleteNote?: (id: string, titulo: string) => void;
}

export const NoteEditorHeader: React.FC<NoteEditorHeaderProps> = ({
  activeNote,
  viewMode,
  onViewModeChange,
  showPdfSplit,
  onToggleSplit,
  showAiPane,
  onToggleAiPane,
  onDeleteNote,
}) => {
  return (
    <header className={styles.editorTopBar}>
      <div className={styles.editorBreadcrumbs}>
        <span>WORKSPACE</span>
        <span>/</span>
        <span>{activeNote?.materiaNombre || "Apuntes"}</span>
        {activeNote?.evaluacionNombre && (
          <>
            <span>/</span>
            <span className={styles.parcialBadge}>
              {activeNote.evaluacionNombre}
            </span>
          </>
        )}
        {activeNote?.carpeta && (
          <>
            <span>/</span>
            <span>{activeNote.carpeta}</span>
          </>
        )}
        <span>·</span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            color: "var(--emerald)",
          }}
        >
          <Cloud size={12} />
          <span>Sincronizado</span>
        </div>
      </div>

      <div className={styles.editorActionsRight}>
        {/* View Mode Toggle */}
        <div className={styles.viewModeToggle}>
          <button
            className={`${styles.viewModeBtn} ${viewMode === "render" ? styles.viewModeBtnActive : ""}`}
            onClick={() => onViewModeChange("render")}
          >
            <Eye size={12} />
            <span>Render</span>
          </button>
          <button
            className={`${styles.viewModeBtn} ${viewMode === "markdown" ? styles.viewModeBtnActive : ""}`}
            onClick={() => onViewModeChange("markdown")}
          >
            <Code size={12} />
            <span>Markdown</span>
          </button>
          <button
            className={`${styles.viewModeBtn} ${viewMode === "split" ? styles.viewModeBtnActive : ""}`}
            onClick={() => onViewModeChange("split")}
          >
            <Columns size={12} />
            <span>Split</span>
          </button>
        </div>

        {/* AI Copilot Mode Toggle Button */}
        {onToggleAiPane && (
          <button
            className={`${styles.btnAiCopilot} ${showAiPane ? styles.btnAiCopilotActive : ""}`}
            onClick={onToggleAiPane}
            title="Abrir Copiloto IA (Chat, Resúmenes, Flashcards y Quiz de Examen)"
          >
            <Sparkles size={12} />
            <span>{showAiPane ? "Cerrar IA" : "Copiloto IA"}</span>
          </button>
        )}

        {/* Split PDF Mode Toggle Button */}
        <button
          className={`${styles.btnNewFolder} ${showPdfSplit ? styles.viewModeBtnActive : ""}`}
          onClick={onToggleSplit}
          title="Abrir visor de material PDF lado a lado con notas (auto-colapsa barras laterales para máxima amplitud)"
        >
          <BookOpen size={12} />
          <span>{showPdfSplit ? "Cerrar PDF" : "Ver PDF"}</span>
        </button>

        {activeNote && onDeleteNote && (
          <button
            className={`${styles.btnNewFolder} ${styles.btnDangerAction}`}
            style={{ width: "auto", padding: "4px 8px" }}
            onClick={() => onDeleteNote(activeNote.id, activeNote.titulo)}
            title={`Eliminar "${activeNote.titulo}"`}
          >
            <Trash2 size={12} />
            <span>Eliminar</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default NoteEditorHeader;
