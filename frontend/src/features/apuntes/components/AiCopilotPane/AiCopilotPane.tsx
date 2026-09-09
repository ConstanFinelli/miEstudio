import React, { useState, useEffect } from 'react';
import styles from './AiCopilotPane.module.css';
import {
  Sparkles,
  X,
  MessageSquare,
  FileText,
  Layers,
  HelpCircle
} from 'lucide-react';
import type { ApunteNota, MaterialEstudio } from '../../../../types/academic';
import { materialesService } from '../../../../services';
import { AiChatTab } from './AiChatTab';
import { AiSummaryTab } from './AiSummaryTab';
import { AiFlashcardsTab } from './AiFlashcardsTab';
import { AiQuizTab } from './AiQuizTab';

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

  if (!isOpen) return null;

  const handleMaterialChange = (newMatId: string) => {
    setCurrentMaterialId(newMatId);
    if (onSelectMaterialId) {
      onSelectMaterialId(newMatId);
    }
  };

  const selectedMaterial = materials.find(m => m.id === currentMaterialId);

  return (
    <aside className={styles.copilotPane} aria-label="Panel de Copiloto IA">
      {/* Top Header */}
      <div className={styles.copilotHeader}>
        <div className={styles.headerTopRow}>
          <div className={styles.brandWrapper}>
            <div className={styles.aiSparkleIcon}>
              <Sparkles size={15} />
            </div>
            <span className={styles.brandTitle}>
              Copiloto IA
              <span className={styles.modelBadge}>Gemini 3.6 Flash</span>
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
      </div>

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

      {/* Active Tab Content Area */}
      <div className={styles.tabContent}>
        {activeTab === 'chat' && (
          <AiChatTab
            noteId={activeNote?.id}
            noteTitle={activeNote?.titulo}
            materiaId={activeNote?.materiaId || activeMateriaId}
            materialId={currentMaterialId || undefined}
            materialTitle={selectedMaterial?.titulo}
            onInsertMarkdown={onInsertMarkdown}
          />
        )}

        {activeTab === 'resumen' && (
          <AiSummaryTab
            noteId={activeNote?.id}
            materialId={currentMaterialId || undefined}
            onInsertMarkdown={onInsertMarkdown}
          />
        )}

        {activeTab === 'flashcards' && (
          <AiFlashcardsTab
            noteId={activeNote?.id}
            materialId={currentMaterialId || undefined}
            onInsertMarkdown={onInsertMarkdown}
          />
        )}

        {activeTab === 'quiz' && (
          <AiQuizTab
            noteId={activeNote?.id}
            materiaId={activeNote?.materiaId || activeMateriaId}
            materialId={currentMaterialId || undefined}
            onInsertMarkdown={onInsertMarkdown}
          />
        )}
      </div>
    </aside>
  );
};

export default AiCopilotPane;
