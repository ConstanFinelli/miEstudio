import React, { useState } from 'react';
import styles from './AiCopilotPane.module.css';
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
import { aiService, type QuizPregunta, type QuizResponse } from '../../../../services';
import { AiMarkdownRenderer } from './AiMarkdownRenderer';

interface AiQuizTabProps {
  noteId?: string;
  materiaId?: string;
  materialId?: string;
  onInsertMarkdown?: (text: string) => void;
}

export const AiQuizTab: React.FC<AiQuizTabProps> = ({
  noteId,
  materiaId,
  materialId,
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
    if (!noteId && !materialId) {
      setError('Debes tener un apunte abierto o un PDF seleccionado como contexto.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setIsCompleted(false);

    try {
      const res = await aiService.generarQuiz({
        apunte_id: noteId,
        materia_id: materiaId,
        material_id: materialId,
        cantidad_preguntas: cantidad
      });
      setQuizData(res);
    } catch (err: any) {
      console.error('Error generando quiz:', err);
      setError(err.message || 'No se pudo generar la simulación de examen.');
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
            disabled={isLoading}
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
        <div
          style={{
            background: 'var(--red-alpha)',
            border: '1px solid var(--red-border)',
            color: 'var(--text-primary)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <AlertCircle size={14} color="var(--red)" />
          <span>{error}</span>
        </div>
      )}

      {/* Active Quiz Runner */}
      {quizData && !isCompleted && currentQuestion && (
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
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '11px',
                    color: 'var(--emerald)',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
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
              className={styles.primaryActionBtn}
              onClick={handleNext}
              style={{ alignSelf: 'flex-end', width: 'auto', padding: '8px 18px' }}
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
          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>
            Simulación Finalizada
          </h3>

          <div className={styles.scoreCircle}>
            <span style={{ fontSize: '18px' }}>{percentage}%</span>
            <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)' }}>
              {correct}/{total}
            </span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {percentage >= 80
              ? '🎉 ¡Excelente rendimiento! Tenés un gran dominio conceptual de este material.'
              : percentage >= 50
              ? '👍 ¡Buen intento! Aprobado, pero conviene reforzar los conceptos explicados.'
              : '📚 Recomendación: repasá los apuntes y volvé a intentar la simulación para afianzar conceptos.'}
          </p>

          <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '6px' }}>
            <button
              className={styles.deckBtn}
              style={{ flex: 1, justifyContent: 'center', padding: '8px 0' }}
              onClick={handleRestart}
            >
              <RotateCcw size={13} />
              <span>Reintentar Quiz</span>
            </button>

            <button
              className={styles.deckBtn}
              style={{ flex: 1, justifyContent: 'center', padding: '8px 0' }}
              onClick={handleGenerate}
            >
              <Sparkles size={13} />
              <span>Nuevo Quiz</span>
            </button>
          </div>

          {onInsertMarkdown && (
            <button
              className={styles.deckBtn}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '8px 0',
                color: isInserted ? 'var(--emerald)' : 'var(--text-primary)'
              }}
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
        <div
          style={{
            padding: '24px 16px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <HelpCircle size={32} color="var(--text-dim)" />
          <p style={{ fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
            Poné a prueba tu conocimiento con preguntas tipo examen con respuestas
            múltiples y explicaciones pedagógicas detalladas generadas por IA.
          </p>
        </div>
      )}
    </div>
  );
};

export default AiQuizTab;
