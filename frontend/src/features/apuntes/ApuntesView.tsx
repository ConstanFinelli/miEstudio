import React, { useState, useMemo, useRef, useEffect } from "react";
import styles from "./ApuntesView.module.css";
import type { ApunteNota } from "../../types/academic";
import { useApuntes, useMateriales, useMaterias } from "../../hooks";
import { useLayout } from "../../context";
import {
  FoldersSidebar,
  NotesListSidebar,
  NoteEditorHeader,
  FormattingToolbar,
  NoteReaderContent,
  SplitPdfViewerPane,
  AiCopilotPane,
} from "./components";
import {
  UploadMaterialModal,
  DeleteConfirmModal,
} from "../../components/modals";

interface ApuntesViewProps {
  onOpenNoteModal: () => void;
}

export const ApuntesView: React.FC<ApuntesViewProps> = ({
  onOpenNoteModal,
}) => {
  const { materias } = useMaterias();
  const {
    apuntes,
    selectedApunte,
    setSelectedApunte,
    updateApunte,
    deleteApunte,
  } = useApuntes();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedSubFolder, setSelectedSubFolder] = useState<string | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"render" | "markdown" | "split">(
    "split",
  );
  const [showPdfSplit, setShowPdfSplit] = useState(false);
  const [showAiPane, setShowAiPane] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [isFoldersCollapsed, setIsFoldersCollapsed] = useState(false);
  const [isNotesListCollapsed, setIsNotesListCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadPdfModalOpen, setIsUploadPdfModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<{
    id: string;
    titulo: string;
  } | null>(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  const { isSidebarCollapsed, setIsSidebarCollapsed } = useLayout();
  const wasNavAutoCollapsedRef = useRef(false);

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

  const currentMateriaNotes = useMemo(() => {
    if (!activeNote) return [];
    return apuntes.filter(
      (a) =>
        (activeNote.materiaId && a.materiaId === activeNote.materiaId) ||
        (activeNote.materiaNombre &&
          a.materiaNombre === activeNote.materiaNombre),
    );
  }, [apuntes, activeNote]);

  const currentMateriaId =
    activeNote?.materiaId ||
    materias.find((m) => m.nombre === selectedFolder || m.id === selectedFolder)
      ?.id ||
    undefined;

  const currentMateriaNombre =
    activeNote?.materiaNombre ||
    materias.find((m) => m.nombre === selectedFolder || m.id === selectedFolder)
      ?.nombre ||
    undefined;

  // Auto-collapse sidebars (including main navigation sidebar) when activating split mode for a spacious study layout
  const handleToggleSplit = () => {
    if (!showPdfSplit) {
      setShowPdfSplit(true);
      setIsFoldersCollapsed(true);
      setIsNotesListCollapsed(true);
      if (!isSidebarCollapsed) {
        wasNavAutoCollapsedRef.current = true;
        setIsSidebarCollapsed(true);
      }
    } else {
      setShowPdfSplit(false);
      if (!showAiPane) {
        setIsFoldersCollapsed(false);
        setIsNotesListCollapsed(false);
        if (wasNavAutoCollapsedRef.current) {
          wasNavAutoCollapsedRef.current = false;
          setIsSidebarCollapsed(false);
        }
      }
    }
  };

  const handleToggleAiPane = () => {
    if (!showAiPane) {
      setShowAiPane(true);
      setIsFoldersCollapsed(true);
      if (!isSidebarCollapsed && !showPdfSplit) {
        wasNavAutoCollapsedRef.current = true;
        setIsSidebarCollapsed(true);
      }
    } else {
      setShowAiPane(false);
      if (!showPdfSplit) {
        setIsFoldersCollapsed(false);
        if (wasNavAutoCollapsedRef.current) {
          wasNavAutoCollapsedRef.current = false;
          setIsSidebarCollapsed(false);
        }
      }
    }
  };

  const handleOpenAiWithDoc = (docId: string) => {
    setSelectedMaterialId(docId);
    setShowAiPane(true);
    setIsFoldersCollapsed(true);
    if (!isSidebarCollapsed) {
      wasNavAutoCollapsedRef.current = true;
      setIsSidebarCollapsed(true);
    }
  };

  // Restore navigation sidebar on unmount if it was auto-collapsed by split view
  useEffect(() => {
    return () => {
      if (wasNavAutoCollapsedRef.current) {
        setIsSidebarCollapsed(false);
      }
    };
  }, [setIsSidebarCollapsed]);

  // Materials hook for uploading PDFs from the split pane
  const { uploadMaterial } = useMateriales(activeNote?.materiaId);

  // Formatting inserter callback ref
  const insertMarkdownRef = useRef<
    ((prefix: string, suffix?: string, defaultText?: string) => void) | null
  >(null);

  const handleInsertMarkdown = (
    prefix: string,
    suffix: string = "",
    defaultText: string = "",
  ) => {
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

  // Callback to append content generated by AI directly into the active note
  const handleInsertFromAi = (contentToInsert: string) => {
    if (!activeNote) return;
    const current = activeNote.contenidoMarkdown || "";
    const updated = current.trim()
      ? `${current}\n\n${contentToInsert}`
      : contentToInsert;
    handleContentChange(updated);
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
    const updatedTags = (activeNote.tags || []).filter(
      (t) => t !== tagToRemove,
    );
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
          materiaNotes={currentMateriaNotes}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showPdfSplit={showPdfSplit}
          onToggleSplit={handleToggleSplit}
          showAiPane={showAiPane}
          onToggleAiPane={handleToggleAiPane}
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
        <div
          style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}
        >
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
              selectedDocId={selectedMaterialId}
              onSelectDocId={setSelectedMaterialId}
              onOpenUploadModal={() => setIsUploadPdfModalOpen(true)}
              onOpenAiWithDoc={handleOpenAiWithDoc}
            />
          )}

          {/* AI Copilot Pane (Persistent in DOM so conversation & tab states are never lost) */}
          <AiCopilotPane
            isOpen={showAiPane}
            onClose={() => setShowAiPane(false)}
            activeNote={activeNote}
            activeMateriaId={currentMateriaId}
            activeMateriaNombre={currentMateriaNombre}
            selectedMaterialId={selectedMaterialId}
            onSelectMaterialId={setSelectedMaterialId}
            onInsertMarkdown={handleInsertFromAi}
            onOpenUploadModal={() => setIsUploadPdfModalOpen(true)}
          />
        </div>
      </main>

      {/* Modal to upload PDF right from the split viewer or copilot */}
      {isUploadPdfModalOpen && (
        <UploadMaterialModal
          isOpen={isUploadPdfModalOpen}
          onClose={() => setIsUploadPdfModalOpen(false)}
          materiaId={currentMateriaId || materias[0]?.id || ""}
          materiaNombre={
            currentMateriaNombre || materias[0]?.nombre || "Materia"
          }
          onUpload={async (file, titulo, categoria) => {
            const targetId = currentMateriaId || materias[0]?.id || "";
            const created = await uploadMaterial(file, titulo, categoria, targetId);
            setSelectedMaterialId(created.id);
            return created;
          }}
          onSuccess={(created) => {
            if (created && created.id) {
              setSelectedMaterialId(created.id);
            }
          }}
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
