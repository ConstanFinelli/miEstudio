import React, { useState, useMemo } from 'react';
import styles from './ApuntesView.module.css';
import { mockApuntes } from '../../data/mockData';
import type { ApunteNota } from '../../types/academic';
import {
  FoldersSidebar,
  NotesListSidebar,
  NoteEditorHeader,
  FormattingToolbar,
  NoteReaderContent,
  SplitPdfViewerPane
} from './components';

interface ApuntesViewProps {
  onOpenNoteModal: () => void;
}

export const ApuntesView: React.FC<ApuntesViewProps> = ({ onOpenNoteModal }) => {
  const [selectedFolder, setSelectedFolder] = useState('Sistemas Distribuidos');
  const [selectedSubFolder, setSelectedSubFolder] = useState<string | null>('1er Parcial');
  const [activeNoteId, setActiveNoteId] = useState('note-1');
  const [viewMode, setViewMode] = useState<'render' | 'markdown' | 'split'>('render');
  const [showPdfSplit, setShowPdfSplit] = useState(false);
  const [isFoldersCollapsed, setIsFoldersCollapsed] = useState(false);
  const [isNotesListCollapsed, setIsNotesListCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const activeNote: ApunteNota = mockApuntes.find(n => n.id === activeNoteId) || mockApuntes[0];

  const filteredNotes = useMemo(() => {
    return mockApuntes.filter(n => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return n.titulo.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q));
      }
      return true;
    });
  }, [searchQuery]);

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
      />

      {/* 2. Middle Notes List Column (Collapsible) */}
      <NotesListSidebar
        isCollapsed={isNotesListCollapsed}
        onToggleCollapse={setIsNotesListCollapsed}
        notes={filteredNotes}
        activeNoteId={activeNote.id}
        onSelectNote={setActiveNoteId}
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
        <FormattingToolbar tags={activeNote.tags} />

        {/* Main Document Body or Split View */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Note Area */}
          <NoteReaderContent
            activeNote={activeNote}
            viewMode={viewMode}
          />

          {/* PDF Split-View Pane (50% real estate, realistic reader controls) */}
          {showPdfSplit && (
            <SplitPdfViewerPane onClose={handleToggleSplit} />
          )}
        </div>
      </main>
    </div>
  );
};

export default ApuntesView;
