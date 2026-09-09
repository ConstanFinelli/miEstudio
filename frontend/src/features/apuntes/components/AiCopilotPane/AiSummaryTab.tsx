import React, { useState } from 'react';
import styles from './AiCopilotPane.module.css';
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
import { aiService, type ResumenResponse } from '../../../../services';
import { AiMarkdownRenderer } from './AiMarkdownRenderer';

interface AiSummaryTabProps {
  noteId?: string;
  materialId?: string;
  onInsertMarkdown?: (text: string) => void;
}

export const AiSummaryTab: React.FC<AiSummaryTabProps> = ({
  noteId,
  materialId,
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
    if (!noteId && !materialId) {
      setError('Debes tener un apunte abierto o un PDF seleccionado como contexto.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await aiService.resumir({
        apunte_id: noteId,
        material_id: materialId,
        formato,
        longitud
      });
      setSummaryData(res);
    } catch (err: any) {
      console.error('Error generando resumen:', err);
      setError(err.message || 'No se pudo generar el resumen.');
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
    <div className={styles.panelSection}>
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
          disabled={isLoading}
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

      {/* Generated Summary Card */}
      {summaryData && (
        <div className={styles.summaryContainer}>
          {/* Header with quick actions */}
          <div className={styles.summaryHeader}>
            <h4 className={styles.summaryTitle}>{summaryData.titulo}</h4>

            <div style={{ display: 'flex', gap: '6px' }}>
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
          <div
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px'
            }}
          >
            <AiMarkdownRenderer content={summaryData.resumen} />
          </div>

          {/* Conceptos Clave */}
          {summaryData.conceptos_clave && summaryData.conceptos_clave.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
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
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--primary-glow)',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sigma size={12} />
                <span>Fórmulas y Teoremas Relevantes</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {summaryData.formulas_teoremas.map((formula, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 10px',
                      fontSize: '11.5px'
                    }}
                  >
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
              <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {summaryData.tips_examen.map((tip, idx) => (
                  <li key={idx} style={{ fontSize: '11.5px', color: 'var(--text-primary)', lineHeight: 1.45 }}>
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
