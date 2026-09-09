import React, { useState } from 'react';
import styles from './AiSummaryTab.module.css';
import {
  FileText,
  Sparkles,
  Check,
  Copy,
  FileDown,
  Loader2,
  AlertCircle,
  Lightbulb,
  Sigma
} from 'lucide-react';
import { aiService, type ResumenResponse } from '../../../../../../services';
import { AiMarkdownRenderer } from '../AiMarkdownRenderer';

interface AiSummaryTabProps {
  materialId?: string;
  hasContext?: boolean;
  onInsertMarkdown?: (text: string) => void;
}

export const AiSummaryTab: React.FC<AiSummaryTabProps> = ({
  materialId,
  hasContext = true,
  onInsertMarkdown
}) => {
  const [formato, setFormato] = useState<'BULLET_POINTS' | 'CONCEPTUAL' | 'EXAMEN'>('CONCEPTUAL');
  const [longitud, setLongitud] = useState<'CORTO' | 'MEDIO' | 'DETALLADO'>('MEDIO');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<ResumenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isInserted, setIsInserted] = useState(false);

  const handleGenerate = async () => {
    if (!materialId || !hasContext) {
      setError('Debes tener un material de estudio (PDF) seleccionado en la parte superior.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await aiService.resumir({
        material_id: materialId,
        formato,
        longitud
      });
      setSummaryData(res);
    } catch (err: any) {
      console.error('Error generando resumen:', err);
      setError(err.message || 'No se pudo generar el resumen del material.');
    } finally {
      setIsLoading(false);
    }
  };

  const buildMarkdownExport = (): string => {
    if (!summaryData) return '';
    let md = `\n\n## 📋 ${summaryData.titulo}\n\n`;
    md += `${summaryData.resumen}\n\n`;

    if (summaryData.conceptos_clave && summaryData.conceptos_clave.length > 0) {
      md += `### 🔑 Conceptos Clave\n`;
      summaryData.conceptos_clave.forEach(c => {
        md += `- **${c}**\n`;
      });
      md += `\n`;
    }

    if (summaryData.formulas_teoremas && summaryData.formulas_teoremas.length > 0) {
      md += `### 📐 Fórmulas y Teoremas\n`;
      summaryData.formulas_teoremas.forEach(f => {
        md += `- ${f}\n`;
      });
      md += `\n`;
    }

    if (summaryData.tips_examen && summaryData.tips_examen.length > 0) {
      md += `### 💡 Tips para el Examen\n`;
      summaryData.tips_examen.forEach(t => {
        md += `> ⚠️ **Tip:** ${t}\n`;
      });
      md += `\n`;
    }

    return md;
  };

  const handleCopyAll = () => {
    const md = buildMarkdownExport();
    navigator.clipboard.writeText(md);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleInsertAll = () => {
    if (!onInsertMarkdown) return;
    const md = buildMarkdownExport();
    onInsertMarkdown(md);
    setIsInserted(true);
    setTimeout(() => setIsInserted(false), 2000);
  };

  return (
    <div className={styles.summaryTab}>
      {/* Config Form */}
      <div className={styles.configCard}>
        <div className={styles.configRow}>
          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Formato de Enfoque</label>
            <select
              className={styles.configSelect}
              value={formato}
              onChange={e => setFormato(e.target.value as any)}
            >
              <option value="CONCEPTUAL">Conceptual y Teórico</option>
              <option value="BULLET_POINTS">Puntos Clave / Esquema</option>
              <option value="EXAMEN">Enfoque a Examen / Final</option>
            </select>
          </div>

          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Extensión</label>
            <select
              className={styles.configSelect}
              value={longitud}
              onChange={e => setLongitud(e.target.value as any)}
            >
              <option value="CORTO">Corto / Sinóptico</option>
              <option value="MEDIO">Medio / Estándar</option>
              <option value="DETALLADO">Detallado / Exhaustivo</option>
            </select>
          </div>
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
              <span>Extrayendo y Sintetizando...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Generar Síntesis Inteligente</span>
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

      {/* Animated Thinking & Loading Skeleton */}
      {isLoading && (
        <div className={styles.thinkingCard}>
          <div className={styles.thinkingHeader}>
            <div className={styles.thinkingPulseIcon}>
              <Sparkles size={14} />
            </div>
            <div className={styles.thinkingTitleWrapper}>
              <div className={styles.thinkingTitleRow}>
                <span className={styles.thinkingTitle}>Sintetizando material de estudio</span>
                <span className={styles.thinkingDots}>
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </span>
              </div>
              <span className={styles.thinkingSubtitle}>
                Gemini está extrayendo conceptos clave, fórmulas y tips de examen...
              </span>
            </div>
          </div>
          <div className={styles.skeletonContainer}>
            <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonFull}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonMedium}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonShort}`} />
          </div>
        </div>
      )}

      {/* Generated Summary Card */}
      {!isLoading && summaryData && (
        <div className={styles.summaryContainer}>
          {/* Header with quick actions */}
          <div className={styles.summaryHeader}>
            <h4 className={styles.summaryTitle}>{summaryData.titulo}</h4>

            <div className={styles.headerActions}>
              <button
                className={`${styles.actionPillBtn} ${isCopied ? styles.actionPillSuccess : ''}`}
                onClick={handleCopyAll}
                title="Copiar resumen en Markdown"
              >
                {isCopied ? <Check size={11} /> : <Copy size={11} />}
                <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
              </button>

              {onInsertMarkdown && (
                <button
                  className={`${styles.actionPillBtn} ${isInserted ? styles.actionPillSuccess : ''}`}
                  onClick={handleInsertAll}
                  title="Insertar resumen en apunte"
                >
                  {isInserted ? <Check size={11} /> : <FileDown size={11} />}
                  <span>{isInserted ? 'Insertado' : 'Insertar'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Main summary text */}
          <div className={styles.summaryContentBox}>
            <AiMarkdownRenderer content={summaryData.resumen} />
          </div>

          {/* Conceptos Clave */}
          {summaryData.conceptos_clave && summaryData.conceptos_clave.length > 0 && (
            <div>
              <div className={styles.sectionHeader}>
                <FileText size={12} />
                <span>Conceptos Clave</span>
              </div>
              <div className={styles.conceptsGrid}>
                {summaryData.conceptos_clave.map((c, idx) => (
                  <span key={idx} className={styles.conceptTag}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fórmulas y Teoremas */}
          {summaryData.formulas_teoremas && summaryData.formulas_teoremas.length > 0 && (
            <div>
              <div className={`${styles.sectionHeader} ${styles.sectionHeaderPrimary}`}>
                <Sigma size={12} />
                <span>Fórmulas y Teoremas Relevantes</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {summaryData.formulas_teoremas.map((formula, idx) => (
                  <div key={idx} className={styles.formulaCard}>
                    <AiMarkdownRenderer content={formula} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips de Examen */}
          {summaryData.tips_examen && summaryData.tips_examen.length > 0 && (
            <div className={styles.tipBox}>
              <div className={styles.tipTitle}>
                <Lightbulb size={13} />
                <span>Tips y Puntos Críticos para el Examen</span>
              </div>
              <ul className={styles.tipsList}>
                {summaryData.tips_examen.map((tip, idx) => (
                  <li key={idx} className={styles.tipItem}>
                    <AiMarkdownRenderer content={tip} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiSummaryTab;
