import React, { useState, useMemo } from "react";
import styles from "./ApuntesView.module.css";
import type { ApunteNota } from "../../types/academic";
import { useApuntes } from "../../hooks";
import {
  FoldersSidebar,
  NotesListSidebar,
  NoteEditorHeader,
  FormattingToolbar,
  NoteReaderContent,
  SplitPdfViewerPane,
} from "./components";

interface ApuntesViewProps {
  onOpenNoteModal: () => void;
}

export const ApuntesView: React.FC<ApuntesViewProps> = ({
  onOpenNoteModal,
}) => {
  const { apuntes, selectedApunte, setSelectedApunte } = useApuntes();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedSubFolder, setSelectedSubFolder] = useState<string | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"render" | "markdown" | "split">(
    "render",
  );
  const [showPdfSplit, setShowPdfSplit] = useState(false);
  const [isFoldersCollapsed, setIsFoldersCollapsed] = useState(false);
  const [isNotesListCollapsed, setIsNotesListCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
        />

        {/* Formatting Toolbar */}
        <FormattingToolbar tags={activeNote?.tags || []} />

        {/* Main Document Body or Split View */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Note Area */}
          <NoteReaderContent
            activeNote={activeNote}
            viewMode={viewMode}
            onOpenNoteModal={onOpenNoteModal}
          />

          {/* PDF Split-View Pane */}
          {showPdfSplit && <SplitPdfViewerPane onClose={handleToggleSplit} />}
        </div>
      </main>
    </div>
  );
};

export default ApuntesView;
