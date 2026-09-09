import React, { useState, useEffect } from 'react';
import styles from './AiCopilotPane.module.css';
import {
  Sparkles,
  X,
  MessageSquare,
  FileText,
  Layers,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import type { ApunteNota, MaterialEstudio } from '../../../../types/academic';
import { materialesService } from '../../../../services';
import {
  AiChatTab,
  AiSummaryTab,
  AiFlashcardsTab,
  AiQuizTab
} from './components';

export type AiCopilotTabType = 'chat' | 'resumen' | 'flashcards' | 'quiz';

interface AiCopilotPaneProps {
  isOpen: boolean;
  onClose: () => void;
  activeNote: ApunteNota | null;
  activeMateriaId?: string;
  activeMateriaNombre?: string;
  selectedMaterialId?: string;
  onSelectMaterialId?: (id: string) => void;
  onInsertMarkdown?: (text: string) => void;
  initialTab?: AiCopilotTabType;
}

export const AiCopilotPane: React.FC<AiCopilotPaneProps> = ({
  isOpen,
  onClose,
  activeNote,
  activeMateriaId,
  activeMateriaNombre,
  selectedMaterialId = '',
  onSelectMaterialId,
  onInsertMarkdown,
  initialTab = 'chat'
}) => {
  const [activeTab, setActiveTab] = useState<AiCopilotTabType>(initialTab);
  const [materials, setMaterials] = useState<MaterialEstudio[]>([]);
  const [currentMaterialId, setCurrentMaterialId] = useState<string>(selectedMaterialId);

  // Sync external selectedMaterialId if changed
  useEffect(() => {
    if (selectedMaterialId) {
      setCurrentMaterialId(selectedMaterialId);
    }
  }, [selectedMaterialId]);

  // Load materials for the active subject
  useEffect(() => {
    let isMounted = true;
    materialesService
      .getMateriales(activeMateriaId)
      .then(docs => {
        if (!isMounted) return;
        setMaterials(docs);
        // If no material selected yet and docs exist, don't force select unless requested
      })
      .catch(err => console.error('Error cargando materiales en copiloto IA:', err));

    return () => {
      isMounted = false;
    };
  }, [activeMateriaId]);

  const handleMaterialChange = (newMatId: string) => {
    setCurrentMaterialId(newMatId);
    if (onSelectMaterialId) {
      onSelectMaterialId(newMatId);
    }
  };

  const selectedMaterial = materials.find(m => m.id === currentMaterialId);

  const hasActiveNote = Boolean(activeNote && activeNote.id !== 'nota-default');
  const hasNoteContent = Boolean(activeNote?.contenidoMarkdown?.trim());
  const hasContext = Boolean(hasNoteContent || currentMaterialId);

  return (
    <aside
      className={styles.copilotPane}
      style={{ display: isOpen ? 'flex' : 'none' }}
      aria-label="Panel de Copiloto IA"
    >
      {/* Top Header */}
      <div className={styles.copilotHeader}>
        <div className={styles.headerTopRow}>
          <div className={styles.brandWrapper}>
            <div className={styles.aiSparkleIcon}>
              <Sparkles size={15} />
            </div>
            <span className={styles.brandTitle}>
              Copiloto IA
              <span className={styles.modelBadge}>Gemini 3.8 Flash</span>
            </span>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.iconBtn}
              onClick={onClose}
              title="Cerrar Copiloto IA"
              aria-label="Cerrar panel de IA"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Dynamic Context Selector */}
        {hasActiveNote && (
          <div className={styles.contextRow}>
            <span className={styles.contextLabel}>Contexto:</span>
            <select
              className={styles.contextSelect}
              value={currentMaterialId}
              onChange={e => handleMaterialChange(e.target.value)}
              title="Seleccionar material PDF complementario para la IA"
            >
              <option value="">
                📝 Solo Apunte: {activeNote ? activeNote.titulo : activeMateriaNombre ? `Notas de ${activeMateriaNombre}` : 'Sin apunte'}
              </option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>
                  📄 PDF: [{m.categoria}] {m.titulo}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!hasActiveNote ? (
        <div className={styles.emptyNoteState}>
          <div className={styles.emptyNoteIcon}>
            <FileText size={28} />
          </div>
          <h3 className={styles.emptyNoteTitle}>Sin apunte activo</h3>
          <p className={styles.emptyNoteText}>
            El Copiloto IA se habilita únicamente cuando tienes un apunte disponible para analizar su contenido y responder con contexto universitario.
          </p>
          <p className={styles.emptyNoteSubtext}>
            Selecciona o crea un apunte en el panel lateral para comenzar.
          </p>
        </div>
      ) : (
        <>
          {!hasContext && (
            <div className={styles.contextWarningBanner}>
              <AlertCircle size={15} />
              <span>
                Este apunte aún no tiene contenido escrito. Escribe notas o selecciona un PDF para que el Copiloto IA tenga material de estudio.
              </span>
            </div>
          )}

          {/* Tabs Navigation */}
          <nav className={styles.tabsStrip} aria-label="Modos de estudio IA">
            <button
              className={`${styles.tabBtn} ${
                activeTab === 'chat' ? styles.tabBtnActive : ''
              }`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare size={13} />
              <span>Chat</span>
            </button>

            <button
              className={`${styles.tabBtn} ${
                activeTab === 'resumen' ? styles.tabBtnActive : ''
              }`}
              onClick={() => setActiveTab('resumen')}
            >
              <FileText size={13} />
              <span>Resumen</span>
            </button>

            <button
              className={`${styles.tabBtn} ${
                activeTab === 'flashcards' ? styles.tabBtnActive : ''
              }`}
              onClick={() => setActiveTab('flashcards')}
            >
              <Layers size={13} />
              <span>Flashcards</span>
            </button>

            <button
              className={`${styles.tabBtn} ${
                activeTab === 'quiz' ? styles.tabBtnActive : ''
              }`}
              onClick={() => setActiveTab('quiz')}
            >
              <HelpCircle size={13} />
              <span>Quiz</span>
            </button>
          </nav>

          {/* Tab Panels (Persistent in DOM to prevent losing conversation & progress) */}
          <div className={styles.tabContent}>
            <div
              className={`${styles.tabPanel} ${
                activeTab === 'chat' ? '' : styles.tabPanelHidden
              }`}
            >
              <AiChatTab
                noteId={activeNote?.id}
                noteTitle={activeNote?.titulo}
                noteContent={activeNote?.contenidoMarkdown}
                hasContext={hasContext}
                materiaId={activeNote?.materiaId || activeMateriaId}
                materialId={currentMaterialId || undefined}
                materialTitle={selectedMaterial?.titulo}
                onInsertMarkdown={onInsertMarkdown}
              />
            </div>

            <div
              className={`${styles.tabPanel} ${
                activeTab === 'resumen' ? '' : styles.tabPanelHidden
              }`}
            >
              <AiSummaryTab
                noteId={activeNote?.id}
                materialId={currentMaterialId || undefined}
                hasContext={hasContext}
                onInsertMarkdown={onInsertMarkdown}
              />
            </div>

            <div
              className={`${styles.tabPanel} ${
                activeTab === 'flashcards' ? '' : styles.tabPanelHidden
              }`}
            >
              <AiFlashcardsTab
                noteId={activeNote?.id}
                materialId={currentMaterialId || undefined}
                hasContext={hasContext}
                onInsertMarkdown={onInsertMarkdown}
              />
            </div>

            <div
              className={`${styles.tabPanel} ${
                activeTab === 'quiz' ? '' : styles.tabPanelHidden
              }`}
            >
              <AiQuizTab
                noteId={activeNote?.id}
                materiaId={activeNote?.materiaId || activeMateriaId}
                materialId={currentMaterialId || undefined}
                hasContext={hasContext}
                onInsertMarkdown={onInsertMarkdown}
              />
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

export default AiCopilotPane;
