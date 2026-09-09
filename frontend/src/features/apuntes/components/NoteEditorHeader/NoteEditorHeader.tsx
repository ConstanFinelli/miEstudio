import React, { useState, useRef, useEffect } from "react";
import styles from "./NoteEditorHeader.module.css";
import {
  Cloud,
  Eye,
  Code,
  Columns,
  BookOpen,
  Trash2,
  Sparkles,
  Download,
  ChevronDown,
  FileText,
  Archive,
} from "lucide-react";
import type { ApunteNota } from "../../../../types/academic";
import { exportSingleNote, exportMateriaNotesZip } from "../../../../utils";

interface NoteEditorHeaderProps {
  activeNote: ApunteNota | null;
  materiaNotes?: ApunteNota[];
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
  materiaNotes = [],
  viewMode,
  onViewModeChange,
  showPdfSplit,
  onToggleSplit,
  showAiPane,
  onToggleAiPane,
  onDeleteNote,
}) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  const hasActiveNote = Boolean(activeNote && activeNote.id !== "nota-default");

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setIsExportMenuOpen(false);
      }
    };
    if (isExportMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExportMenuOpen]);

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
            disabled={!hasActiveNote}
            title={
              hasActiveNote
                ? (showAiPane ? "Cerrar Copiloto IA" : "Abrir Copiloto IA (Chat, Resúmenes, Flashcards y Quiz de Examen)")
                : "El Copiloto IA requiere que tengas un apunte abierto para analizar su contenido."
            }
          >
            <Sparkles size={12} />
            <span>{showAiPane ? "Cerrar IA" : "Copiloto IA"}</span>
          </button>
        )}

        {/* Export Notes Dropdown */}
        <div className={styles.exportContainer} ref={exportMenuRef}>
          <button
            type="button"
            className={styles.btnExport}
            onClick={() => setIsExportMenuOpen((prev) => !prev)}
            disabled={!hasActiveNote}
            title="Exportar notas (apunte individual o materia completa)"
          >
            <Download size={12} />
            <span>Exportar</span>
            <ChevronDown size={11} style={{ opacity: 0.6 }} />
          </button>

          {isExportMenuOpen && (
            <div className={styles.exportMenu}>
              <button
                type="button"
                className={styles.exportMenuItem}
                onClick={() => {
                  if (activeNote) {
                    exportSingleNote(activeNote);
                  }
                  setIsExportMenuOpen(false);
                }}
              >
                <div className={styles.exportMenuIcon}>
                  <FileText size={14} color="var(--primary)" />
                </div>
                <div className={styles.exportMenuText}>
                  <span className={styles.exportMenuTitle}>Descargar apunte</span>
                  <span className={styles.exportMenuDesc}>Archivo Markdown (.md)</span>
                </div>
              </button>

              {materiaNotes && materiaNotes.length > 0 && (
                <button
                  type="button"
                  className={styles.exportMenuItem}
                  onClick={() => {
                    if (activeNote) {
                      exportMateriaNotesZip(
                        activeNote.materiaNombre || "Materia",
                        materiaNotes
                      );
                    }
                    setIsExportMenuOpen(false);
                  }}
                >
                  <div className={styles.exportMenuIcon}>
                    <Archive size={14} color="var(--emerald)" />
                  </div>
                  <div className={styles.exportMenuText}>
                    <span className={styles.exportMenuTitle}>
                      Descargar materia ({materiaNotes.length} notas)
                    </span>
                    <span className={styles.exportMenuDesc}>Paquete comprimido (.zip)</span>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

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
