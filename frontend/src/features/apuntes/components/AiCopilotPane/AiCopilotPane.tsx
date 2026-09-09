import React, { useState, useEffect, useCallback } from 'react';
import styles from './AiCopilotPane.module.css';
import {
  Sparkles,
  X,
  MessageSquare,
  FileText,
  Layers,
  HelpCircle,
  AlertCircle,
  BookOpen,
  UploadCloud
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
  onOpenUploadModal?: () => void;
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
  onOpenUploadModal,
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

  const handleMaterialChange = useCallback((newMatId: string) => {
    setCurrentMaterialId(newMatId);
    if (onSelectMaterialId) {
      onSelectMaterialId(newMatId);
    }
  }, [onSelectMaterialId]);

  // Load materials for the active subject (or all if subject has none)
  const loadMaterials = useCallback((autoSelectId?: string) => {
    materialesService
      .getMateriales(activeMateriaId)
      .then(docs => {
        if (docs.length > 0) {
          setMaterials(docs);
          if (autoSelectId && docs.some(d => d.id === autoSelectId)) {
            handleMaterialChange(autoSelectId);
          } else if (!currentMaterialId || !docs.some(d => d.id === currentMaterialId)) {
            handleMaterialChange(docs[0].id);
          }
        } else {
          // If no materials for this specific materia, get all materials across all materias
          materialesService.getMateriales().then(allDocs => {
            setMaterials(allDocs);
            if (autoSelectId && allDocs.some(d => d.id === autoSelectId)) {
              handleMaterialChange(autoSelectId);
            } else if (allDocs.length > 0 && (!currentMaterialId || !allDocs.some(d => d.id === currentMaterialId))) {
              handleMaterialChange(allDocs[0].id);
            }
          });
        }
      })
      .catch(err => console.error('Error cargando materiales en copiloto IA:', err));
  }, [activeMateriaId, currentMaterialId, handleMaterialChange]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  // Reactive listener: when a material is uploaded anywhere in the app, update materials list & select it
  useEffect(() => {
    const handleMaterialUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<MaterialEstudio>;
      const newDoc = customEvent.detail;
      if (newDoc && newDoc.id) {
        setMaterials(prev => [newDoc, ...prev.filter(m => m.id !== newDoc.id)]);
        handleMaterialChange(newDoc.id);
      }
      loadMaterials(newDoc?.id);
    };
    window.addEventListener('materiales:updated', handleMaterialUpdate);
    return () => window.removeEventListener('materiales:updated', handleMaterialUpdate);
  }, [handleMaterialChange, loadMaterials]);

  const selectedMaterial = materials.find(m => m.id === currentMaterialId);
  const hasContext = Boolean(currentMaterialId && materials.some(m => m.id === currentMaterialId));

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

        {/* Material de Estudio Selector */}
        <div className={styles.contextRow}>
          <span className={styles.contextLabel}>Material:</span>
          <select
            className={styles.contextSelect}
            value={currentMaterialId}
            onChange={e => handleMaterialChange(e.target.value)}
            title="Seleccionar material PDF oficial para consultar con la IA"
          >
            {materials.length === 0 ? (
              <option value="">Sin materiales en esta materia</option>
            ) : (
              materials.map(m => (
                <option key={m.id} value={m.id}>
                  📄 [{m.categoria}] {m.titulo}
                </option>
              ))
            )}
          </select>
          {onOpenUploadModal && (
            <button
              type="button"
              className={styles.uploadDocBtn}
              onClick={onOpenUploadModal}
              title="Subir nuevo documento o PDF de cátedra"
            >
              <UploadCloud size={13} />
            </button>
          )}
        </div>
      </div>

      {materials.length === 0 ? (
        <div className={styles.emptyNoteState}>
          <div className={styles.emptyNoteIcon}>
            <BookOpen size={28} />
          </div>
          <h3 className={styles.emptyNoteTitle}>
            Sin materiales en {activeMateriaNombre || 'esta materia'}
          </h3>
          <p className={styles.emptyNoteText}>
            El Copiloto IA responde consultas, genera resúmenes y crea cuestionarios basándose en los documentos y PDFs oficiales de la materia.
          </p>
          {onOpenUploadModal && (
            <button
              type="button"
              className={styles.btnUploadAction}
              onClick={onOpenUploadModal}
            >
              <UploadCloud size={14} />
              <span>Subir Material PDF</span>
            </button>
          )}
          <p className={styles.emptyNoteSubtext}>
            Sube bibliografía, diapositivas o guías de cátedra para habilitar el asistente.
          </p>
        </div>
      ) : (
        <>
          {!hasContext && (
            <div className={styles.contextWarningBanner}>
              <AlertCircle size={15} />
              <span>
                Por favor, selecciona un material de estudio en la lista superior para comenzar.
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
