import React, { useState, useEffect } from 'react';
import styles from './AiFlashcardsTab.module.css';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  FileDown,
  Loader2,
  AlertCircle,
  Layers,
  Check
} from 'lucide-react';
import { aiService, type FlashcardItem } from '../../../../../../services';
import { AiMarkdownRenderer } from '../AiMarkdownRenderer';

interface AiFlashcardsTabProps {
  noteId?: string;
  materialId?: string;
  onInsertMarkdown?: (text: string) => void;
}

export const AiFlashcardsTab: React.FC<AiFlashcardsTabProps> = ({
  noteId,
  materialId,
  onInsertMarkdown
}) => {
  const [enfoque, setEnfoque] = useState<'TEORICO' | 'PRACTICO' | 'MIXTO'>('MIXTO');
  const [cantidad, setCantidad] = useState<number>(8);
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInserted, setIsInserted] = useState(false);

  // Reset flip state when navigating
  const goToCard = (newIndex: number) => {
    setIsFlipped(false);
    setCurrentIndex(newIndex);
  };

  const handleGenerate = async () => {
    if (!noteId && !materialId) {
      setError('Debes tener un apunte abierto o un PDF seleccionado como contexto.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsFlipped(false);

    try {
      const res = await aiService.generarFlashcards({
        apunte_id: noteId,
        material_id: materialId,
        enfoque,
        cantidad
      });
      setCards(res.flashcards || []);
      setCurrentIndex(0);
    } catch (err: any) {
      console.error('Error generando flashcards:', err);
      setError(err.message || 'No se pudieron generar las flashcards.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentCard = cards[currentIndex];

  // Keyboard navigation when reviewing cards
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (cards.length === 0) return;
      if (e.key === 'ArrowRight' && currentIndex < cards.length - 1) {
        goToCard(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        goToCard(currentIndex - 1);
      } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards, currentIndex]);

  const handleInsertAll = () => {
    if (!onInsertMarkdown || cards.length === 0) return;

    let md = `\n\n## 🃏 Flashcards de Repaso Activo (${cards.length} tarjetas)\n\n`;
    cards.forEach((c, idx) => {
      md += `### ${idx + 1}. ${c.frente}\n`;
      md += `> **Respuesta:** ${c.dorso}\n`;
      md += `*Dificultad: ${c.dificultad}* ${c.categoria ? `| *Tema: ${c.categoria}*` : ''}\n\n`;
    });

    onInsertMarkdown(md);
    setIsInserted(true);
    setTimeout(() => setIsInserted(false), 2000);
  };

  const getDifficultyClass = (d: string) => {
    switch (d) {
      case 'FACIL':
        return styles.badgeFacil;
      case 'MEDIA':
        return styles.badgeMedia;
      case 'DIFICIL':
      default:
        return styles.badgeDificil;
    }
  };

  return (
    <div className={styles.flashcardsContainer}>
      {/* Config Form */}
      <div className={styles.configCard}>
        <div className={styles.configRow}>
          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Enfoque de Estudio</label>
            <select
              className={styles.configSelect}
              value={enfoque}
              onChange={e => setEnfoque(e.target.value as any)}
            >
              <option value="MIXTO">Mixto (Teoría y Práctica)</option>
              <option value="TEORICO">Solo Teórico y Conceptos</option>
              <option value="PRACTICO">Solo Práctico y Fórmulas</option>
            </select>
          </div>

          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Cantidad</label>
            <select
              className={styles.configSelect}
              value={cantidad}
              onChange={e => setCantidad(Number(e.target.value))}
            >
              <option value={5}>5 Flashcards</option>
              <option value={8}>8 Flashcards</option>
              <option value={10}>10 Flashcards</option>
              <option value={15}>15 Flashcards</option>
            </select>
          </div>
        </div>

        <button
          className={styles.primaryActionBtn}
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Generando Baraja de Flashcards...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Generar Flashcards con IA</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={14} color="var(--red)" />
          <span>{error}</span>
        </div>
      )}

      {/* 3D Card Viewer */}
      {cards.length > 0 && currentCard && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* 3D Flip Card Container */}
          <div
            className={styles.cardPerspectiveWrapper}
            onClick={() => setIsFlipped(prev => !prev)}
            title="Hacé click o presioná la barra espaciadora para voltear la tarjeta"
          >
            <div
              className={`${styles.cardInner3D} ${
                isFlipped ? styles.cardFlipped : ''
              }`}
            >
              {/* Front Face (Question) */}
              <div className={`${styles.cardFace} ${styles.cardFront}`}>
                <div className={styles.cardBadgeRow}>
                  <span
                    className={`${styles.difficultyBadge} ${getDifficultyClass(
                      currentCard.dificultad
                    )}`}
                  >
                    {currentCard.dificultad}
                  </span>
                  {currentCard.categoria && (
                    <span className={styles.cardCategory}>
                      {currentCard.categoria}
                    </span>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardQuestionText}>
                    <AiMarkdownRenderer content={currentCard.frente} />
                  </div>
                </div>

                <div className={styles.cardFootnote}>
                  <RotateCw size={11} />
                  <span>Click para ver la respuesta</span>
                </div>
              </div>

              {/* Back Face (Answer) */}
              <div className={`${styles.cardFace} ${styles.cardBack}`}>
                <div className={styles.cardBadgeRow}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--primary-glow)',
                      textTransform: 'uppercase'
                    }}
                  >
                    Respuesta Explicada
                  </span>
                  <span className={styles.cardCategory}>
                    Tarjeta {currentIndex + 1} de {cards.length}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardAnswerText}>
                    <AiMarkdownRenderer content={currentCard.dorso} />
                  </div>
                </div>

                <div className={styles.cardFootnote}>
                  <RotateCw size={11} />
                  <span>Click para volver a la pregunta</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deck Controls */}
          <div className={styles.deckControls}>
            <button
              className={styles.deckBtn}
              onClick={() => goToCard(currentIndex - 1)}
              disabled={currentIndex === 0}
              title="Tarjeta anterior (Flecha Izquierda)"
            >
              <ChevronLeft size={14} />
              <span>Anterior</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={styles.deckCounter}>
                {currentIndex + 1} / {cards.length}
              </span>
              <button
                className={styles.deckBtn}
                onClick={() => setIsFlipped(prev => !prev)}
                title="Voltear tarjeta (Espacio)"
              >
                <RotateCw size={12} />
                <span>Voltear</span>
              </button>
            </div>

            <button
              className={styles.deckBtn}
              onClick={() => goToCard(currentIndex + 1)}
              disabled={currentIndex === cards.length - 1}
              title="Siguiente tarjeta (Flecha Derecha)"
            >
              <span>Siguiente</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Insert Deck into note */}
          {onInsertMarkdown && (
            <button
              className={`${styles.deckBtn} ${styles.insertDeckBtn} ${
                isInserted ? styles.insertDeckBtnSuccess : ''
              }`}
              onClick={handleInsertAll}
            >
              {isInserted ? <Check size={12} /> : <FileDown size={12} />}
              <span>
                {isInserted ? '¡Flashcards insertadas!' : 'Insertar todas las Flashcards en apunte'}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Initial state placeholder */}
      {cards.length === 0 && !isLoading && !error && (
        <div className={styles.emptyState}>
          <Layers size={32} color="var(--text-dim)" />
          <p className={styles.emptyStateText}>
            El repaso activo mediante <strong>Flashcards</strong> fortalece la retención
            a largo plazo de teoremas, fórmulas y definiciones críticas para exámenes.
          </p>
        </div>
      )}
    </div>
  );
};

export default AiFlashcardsTab;
