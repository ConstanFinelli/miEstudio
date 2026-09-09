import React, { useState } from 'react';
import styles from './AiQuizTab.module.css';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  FileDown,
  Loader2,
  AlertCircle,
  Trophy,
  ArrowRight,
  Check
} from 'lucide-react';
import { aiService, type QuizPregunta, type QuizResponse } from '../../../../../../services';
import { AiMarkdownRenderer } from '../AiMarkdownRenderer';

interface AiQuizTabProps {
  materiaId?: string;
  materialId?: string;
  hasContext?: boolean;
  onInsertMarkdown?: (text: string) => void;
}

export const AiQuizTab: React.FC<AiQuizTabProps> = ({
  materiaId,
  materialId,
  hasContext = true,
  onInsertMarkdown
}) => {
  const [cantidad, setCantidad] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizResponse | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInserted, setIsInserted] = useState(false);

  const handleGenerate = async () => {
    if (!materialId || !hasContext) {
      setError('Debes tener un material de estudio (PDF) seleccionado en la parte superior.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setIsCompleted(false);

    try {
      const res = await aiService.generarQuiz({
        materia_id: materiaId,
        material_id: materialId,
        cantidad_preguntas: cantidad
      });
      setQuizData(res);
    } catch (err: any) {
      console.error('Error generando quiz:', err);
      setError(err.message || 'No se pudo generar la simulación de examen del material.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (qIndex: number, optionIndex: number) => {
    // Prevent changing answer once selected
    if (selectedAnswers[qIndex] !== undefined) return;

    setSelectedAnswers(prev => ({
      ...prev,
      [qIndex]: optionIndex
    }));
  };

  const handleNext = () => {
    if (!quizData) return;
    if (currentQIndex < quizData.preguntas.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setIsCompleted(false);
  };

  // Calculate score
  const calculateScore = () => {
    if (!quizData) return { correct: 0, total: 0, percentage: 0 };
    let correct = 0;
    quizData.preguntas.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.indice_correcta) {
        correct++;
      }
    });
    const total = quizData.preguntas.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, total, percentage };
  };

  const handleInsertInNote = () => {
    if (!onInsertMarkdown || !quizData) return;

    let md = `\n\n## 🎯 Simulación de Examen: ${quizData.titulo}\n\n`;
    quizData.preguntas.forEach((q, qIdx) => {
      md += `### Pregunta ${qIdx + 1}: ${q.pregunta}\n`;
      q.opciones.forEach((opt, oIdx) => {
        const isCorrect = oIdx === q.indice_correcta;
        md += `- [${isCorrect ? 'x' : ' '}] ${opt}\n`;
      });
      md += `\n> 💡 **Explicación:** ${q.explicacion}\n\n`;
    });

    onInsertMarkdown(md);
    setIsInserted(true);
    setTimeout(() => setIsInserted(false), 2000);
  };

  const currentQuestion: QuizPregunta | undefined = quizData?.preguntas[currentQIndex];
  const isCurrentAnswered = selectedAnswers[currentQIndex] !== undefined;
  const { correct, total, percentage } = calculateScore();

  return (
    <div className={styles.quizContainer}>
      {/* Quiz Config */}
      {!quizData && (
        <div className={styles.configCard}>
          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Cantidad de Preguntas</label>
            <select
              className={styles.configSelect}
              value={cantidad}
              onChange={e => setCantidad(Number(e.target.value))}
            >
              <option value={3}>3 Preguntas (Express)</option>
              <option value={5}>5 Preguntas (Estándar)</option>
              <option value={8}>8 Preguntas (Examen Completo)</option>
            </select>
          </div>

          <button
            className={styles.primaryActionBtn}
            onClick={handleGenerate}
            disabled={isLoading || !hasContext}
            title={hasContext ? undefined : "Se requiere un material PDF seleccionado"}
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Generando Preguntas de Examen...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Iniciar Simulación de Examen</span>
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={14} color="var(--red)" />
          <span>{error}</span>
        </div>
      )}

      {/* Animated Thinking & Loading Skeleton */}
      {isLoading && (
        <div className={styles.thinkingCard}>
          <div className={styles.thinkingHeader}>
            <div className={styles.thinkingPulseIcon}>
              <Sparkles size={14} />
            </div>
            <div className={styles.thinkingTitleWrapper}>
              <div className={styles.thinkingTitleRow}>
                <span className={styles.thinkingTitle}>Preparando preguntas de examen</span>
                <span className={styles.thinkingDots}>
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </span>
              </div>
              <span className={styles.thinkingSubtitle}>
                Gemini está diseñando opciones múltiples y explicaciones pedagógicas...
              </span>
            </div>
          </div>
          <div className={styles.skeletonContainer}>
            <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonOption}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonOption}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonOption}`} />
          </div>
        </div>
      )}

      {/* Active Quiz Runner */}
      {!isLoading && quizData && !isCompleted && currentQuestion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Progress Bar */}
          <div className={styles.quizProgressBar}>
            <div
              className={styles.quizProgressFill}
              style={{
                width: `${((currentQIndex + 1) / quizData.preguntas.length) * 100}%`
              }}
            />
          </div>

          {/* Question Card */}
          <div className={styles.quizQuestionCard}>
            <div className={styles.quizQuestionHeader}>
              <span>
                Pregunta {currentQIndex + 1} de {quizData.preguntas.length}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>
                {Math.round(((currentQIndex + 1) / quizData.preguntas.length) * 100)}%
              </span>
            </div>

            <div className={styles.quizQuestionPrompt}>
              <AiMarkdownRenderer content={currentQuestion.pregunta} />
            </div>

            {/* Multiple Choice Options */}
            <div className={styles.optionsList}>
              {currentQuestion.opciones.map((opt, oIdx) => {
                const isSelected = selectedAnswers[currentQIndex] === oIdx;
                const isCorrect = oIdx === currentQuestion.indice_correcta;

                let optionStyleClass = '';
                if (isCurrentAnswered) {
                  if (isCorrect) {
                    optionStyleClass = styles.optionCorrect;
                  } else if (isSelected && !isCorrect) {
                    optionStyleClass = styles.optionIncorrect;
                  }
                }

                return (
                  <button
                    key={oIdx}
                    className={`${styles.optionBtn} ${optionStyleClass}`}
                    onClick={() => handleSelectOption(currentQIndex, oIdx)}
                    disabled={isCurrentAnswered}
                  >
                    <span className={styles.optionIndex}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <AiMarkdownRenderer content={opt} />
                    </div>
                    {isCurrentAnswered && isCorrect && (
                      <CheckCircle2 size={16} color="var(--emerald)" />
                    )}
                    {isCurrentAnswered && isSelected && !isCorrect && (
                      <XCircle size={16} color="var(--red)" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box revealed after answering */}
            {isCurrentAnswered && (
              <div className={styles.explanationBox}>
                <div className={styles.explanationHeader}>
                  <HelpCircle size={12} />
                  <span>Explicación Conceptual</span>
                </div>
                <AiMarkdownRenderer content={currentQuestion.explicacion} />
              </div>
            )}
          </div>

          {/* Navigation to next question */}
          {isCurrentAnswered && (
            <button
              className={`${styles.primaryActionBtn} ${styles.nextBtn}`}
              onClick={handleNext}
            >
              <span>
                {currentQIndex < quizData.preguntas.length - 1
                  ? 'Siguiente Pregunta'
                  : 'Ver Resultados del Examen'}
              </span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}

      {/* Finished Quiz Results View */}
      {quizData && isCompleted && (
        <div className={styles.resultsSummaryCard}>
          <Trophy size={36} color="var(--amber)" />
          <h3 className={styles.resultsTitle}>
            Simulación Finalizada
          </h3>

          <div className={styles.scoreCircle}>
            <span className={styles.scorePercentage}>{percentage}%</span>
            <span className={styles.scoreFraction}>
              {correct}/{total}
            </span>
          </div>

          <p className={styles.resultsFeedback}>
            {percentage >= 80
              ? '🎉 ¡Excelente rendimiento! Tenés un gran dominio conceptual de este material.'
              : percentage >= 50
              ? '👍 ¡Buen intento! Aprobado, pero conviene reforzar los conceptos explicados.'
              : '📚 Recomendación: repasá los apuntes y volvé a intentar la simulación para afianzar conceptos.'}
          </p>

          <div className={styles.resultsActionsRow}>
            <button
              className={styles.deckBtn}
              onClick={handleRestart}
            >
              <RotateCcw size={13} />
              <span>Reintentar Quiz</span>
            </button>

            <button
              className={styles.deckBtn}
              onClick={handleGenerate}
            >
              <Sparkles size={13} />
              <span>Nuevo Quiz</span>
            </button>
          </div>

          {onInsertMarkdown && (
            <button
              className={`${styles.deckBtn} ${styles.insertQuizBtn} ${
                isInserted ? styles.insertQuizBtnSuccess : ''
              }`}
              onClick={handleInsertInNote}
            >
              {isInserted ? <Check size={13} /> : <FileDown size={13} />}
              <span>
                {isInserted ? '¡Preguntas insertadas!' : 'Insertar Preguntas y Respuestas en Apunte'}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Initial state placeholder */}
      {!quizData && !isLoading && !error && (
        <div className={styles.emptyState}>
          <HelpCircle size={32} color="var(--text-dim)" />
          <p className={styles.emptyStateText}>
            Poné a prueba tu conocimiento con preguntas tipo examen con respuestas
            múltiples y explicaciones pedagógicas detalladas generadas por IA.
          </p>
        </div>
      )}
    </div>
  );
};

export default AiQuizTab;
