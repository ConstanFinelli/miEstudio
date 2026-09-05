import React, { useState, useMemo, useRef } from "react";
import styles from "./ApuntesView.module.css";
import type { ApunteNota } from "../../types/academic";
import { useApuntes, useMateriales } from "../../hooks";
import {
  FoldersSidebar,
  NotesListSidebar,
  NoteEditorHeader,
  FormattingToolbar,
  NoteReaderContent,
  SplitPdfViewerPane,
} from "./components";
import { UploadMaterialModal, DeleteConfirmModal } from "../../components/modals";

interface ApuntesViewProps {
  onOpenNoteModal: () => void;
}

export const ApuntesView: React.FC<ApuntesViewProps> = ({
  onOpenNoteModal,
}) => {
  const { apuntes, selectedApunte, setSelectedApunte, updateApunte, deleteApunte } = useApuntes();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedSubFolder, setSelectedSubFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"render" | "markdown" | "split">("split");
  const [showPdfSplit, setShowPdfSplit] = useState(false);
  const [isFoldersCollapsed, setIsFoldersCollapsed] = useState(false);
  const [isNotesListCollapsed, setIsNotesListCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadPdfModalOpen, setIsUploadPdfModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<{ id: string; titulo: string } | null>(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  // Auto-collapse sidebars when activating split mode for a spacious study layout
  const handleToggleSplit = () => {
    if (!showPdfSplit) {
      setShowPdfSplit(true);
      setIsFoldersCollapsed(true);
      setIsNotesListCollapsed(true);
    } else {
      setShowPdfSplit(false);
      setIsFoldersCollapsed(false);
      setIsNotesListCollapsed(false);
    }
  };

  const filteredNotes = useMemo(() => {
    return apuntes.filter((n) => {
      if (selectedFolder) {
        const matchesMateria =
          n.materiaNombre === selectedFolder || n.materiaId === selectedFolder;
        if (!matchesMateria) return false;
      }
      if (selectedSubFolder) {
        const matchesSub =
          n.carpeta === selectedSubFolder ||
          n.evaluacionNombre === selectedSubFolder;
        if (!matchesSub) return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          n.titulo.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [apuntes, selectedFolder, selectedSubFolder, searchQuery]);

  const activeNote: ApunteNota | null =
    selectedApunte || filteredNotes[0] || apuntes[0] || null;

  // Materials hook for uploading PDFs from the split pane
  const { uploadMaterial } = useMateriales(activeNote?.materiaId);

  // Formatting inserter callback ref
  const insertMarkdownRef = useRef<((prefix: string, suffix?: string, defaultText?: string) => void) | null>(null);

  const handleInsertMarkdown = (prefix: string, suffix: string = "", defaultText: string = "") => {
    if (viewMode === "render") {
      setViewMode("split");
    }
    if (insertMarkdownRef.current) {
      insertMarkdownRef.current(prefix, suffix, defaultText);
    }
  };

  // Debounced auto-save for content updates
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleContentChange = (newContent: string) => {
    if (!activeNote) return;

    // Immediately update local note state for instant UI preview
    setSelectedApunte({ ...activeNote, contenidoMarkdown: newContent });

    // Debounce save to backend by 700ms
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateApunte(activeNote.id, { contenidoMarkdown: newContent });
      } catch (err) {
        console.error("Error al autoguardar apunte:", err);
      }
    }, 700);
  };

  // Tag addition & deletion
  const handleAddTag = async (newTag: string) => {
    if (!activeNote) return;
    const currentTags = activeNote.tags || [];
    if (!currentTags.includes(newTag)) {
      const updatedTags = [...currentTags, newTag];
      await updateApunte(activeNote.id, { tags: updatedTags });
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!activeNote) return;
    const updatedTags = (activeNote.tags || []).filter((t) => t !== tagToRemove);
    await updateApunte(activeNote.id, { tags: updatedTags });
  };

  // Note deletion handlers
  const handleDeleteRequest = (id: string, titulo: string) => {
    setNoteToDelete({ id, titulo });
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    try {
      setIsDeletingNote(true);
      await deleteApunte(noteToDelete.id);
      setNoteToDelete(null);
    } catch (err) {
      console.error("Error al eliminar apunte:", err);
      alert("Ocurrió un error al eliminar el apunte.");
    } finally {
      setIsDeletingNote(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 1. Left Folders Column (Collapsible) */}
      <FoldersSidebar
        isCollapsed={isFoldersCollapsed}
        onToggleCollapse={setIsFoldersCollapsed}
        selectedFolder={selectedFolder}
        onSelectFolder={setSelectedFolder}
        selectedSubFolder={selectedSubFolder}
        onSelectSubFolder={setSelectedSubFolder}
        onOpenNoteModal={onOpenNoteModal}
        notes={apuntes}
      />

      {/* 2. Middle Notes List Column (Collapsible) */}
      <NotesListSidebar
        isCollapsed={isNotesListCollapsed}
        onToggleCollapse={setIsNotesListCollapsed}
        notes={filteredNotes}
        activeNoteId={activeNote?.id || ""}
        onSelectNote={(id) => {
          const found = apuntes.find((a) => a.id === id);
          if (found) setSelectedApunte(found);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNoteModal={onOpenNoteModal}
        onDeleteNote={handleDeleteRequest}
      />

      {/* 3. Right Editor / Visualizer Column */}
      <main className={styles.editorColumn}>
        {/* Editor Top Bar */}
        <NoteEditorHeader
          activeNote={activeNote}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showPdfSplit={showPdfSplit}
          onToggleSplit={handleToggleSplit}
          onDeleteNote={handleDeleteRequest}
        />

        {/* Formatting Toolbar */}
        <FormattingToolbar
          tags={activeNote?.tags || []}
          onInsertMarkdown={handleInsertMarkdown}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
        />

        {/* Main Document Body or Split View */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
          {/* Note Area */}
          <NoteReaderContent
            activeNote={activeNote}
            viewMode={viewMode}
            onOpenNoteModal={onOpenNoteModal}
            onContentChange={handleContentChange}
            onRegisterInsert={(inserter) => {
              insertMarkdownRef.current = inserter;
            }}
          />

          {/* PDF Split-View Pane */}
          {showPdfSplit && (
            <SplitPdfViewerPane
              onClose={handleToggleSplit}
              activeMateriaId={activeNote?.materiaId}
              activeMateriaNombre={activeNote?.materiaNombre}
              onOpenUploadModal={() => setIsUploadPdfModalOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Modal to upload PDF right from the split viewer */}
      {isUploadPdfModalOpen && activeNote && (
        <UploadMaterialModal
          isOpen={isUploadPdfModalOpen}
          onClose={() => setIsUploadPdfModalOpen(false)}
          materiaId={activeNote.materiaId}
          materiaNombre={activeNote.materiaNombre}
          onUpload={(file, titulo, categoria) =>
            uploadMaterial(file, titulo, categoria)
          }
        />
      )}

      {/* Modal to confirm note deletion */}
      {noteToDelete && (
        <DeleteConfirmModal
          isOpen={Boolean(noteToDelete)}
          onClose={() => !isDeletingNote && setNoteToDelete(null)}
          onConfirm={handleConfirmDelete}
          itemName={noteToDelete.titulo}
          itemType="apunte"
          title="¿Eliminar apunte?"
          description="Estás a punto de eliminar este apunte. Se borrará su contenido y notas asociadas de forma permanente."
          isDeleting={isDeletingNote}
        />
      )}
    </div>
  );
};

export default ApuntesView;
