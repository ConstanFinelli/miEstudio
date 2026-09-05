import React, { useState } from 'react';
import styles from '../ApuntesView.module.css';
import { Flame, Check, Copy, FileText, Plus } from 'lucide-react';
import katex from 'katex';
import type { ApunteNota } from '../../../types/academic';

interface NoteReaderContentProps {
  activeNote: ApunteNota | null;
  viewMode: 'render' | 'markdown' | 'split';
  onOpenNoteModal?: () => void;
  onContentChange?: (newContent: string) => void;
}

// Helper to render inline formatting: **bold**, `code`, and $katex$
const renderInline = (text: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  // Regex to match $math$, `code`, **bold**
  const regex = /(\$[^$]+\$|`[^`]+`|\*\*[^*]+\*\*)/g;
  const segments = text.split(regex);

  segments.forEach((seg, idx) => {
    if (!seg) return;
    if (seg.startsWith('$') && seg.endsWith('$') && seg.length > 2) {
      const formula = seg.slice(1, -1);
      try {
        const html = katex.renderToString(formula, { throwOnError: false });
        parts.push(
          <span
            key={idx}
            dangerouslySetInnerHTML={{ __html: html }}
            style={{ margin: '0 2px' }}
          />
        );
      } catch {
        parts.push(<code key={idx}>{formula}</code>);
      }
    } else if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2) {
      parts.push(
        <code
          key={idx}
          style={{
            fontFamily: 'var(--font-mono)',
            background: 'var(--surface-3)',
            padding: '1px 5px',
            borderRadius: '3px',
            fontSize: '12px',
            color: 'var(--text-primary)'
          }}
        >
          {seg.slice(1, -1)}
        </code>
      );
    } else if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
      parts.push(<strong key={idx} style={{ color: 'var(--text-primary)' }}>{seg.slice(2, -2)}</strong>);
    } else {
      parts.push(seg);
    }
  });

  return parts;
};

// Parser to turn raw Markdown lines into styled block nodes
const parseMarkdownBlocks = (md: string) => {
  const lines = md.split('\n');
  const blocks: Array<{
    type: 'h1' | 'h2' | 'h3' | 'callout' | 'math' | 'code' | 'table' | 'list' | 'p';
    content: string;
    extra?: any;
  }> = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Code block ```
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({
        type: 'code',
        content: codeLines.join('\n'),
        extra: { lang: lang || 'código' }
      });
      continue;
    }

    // KaTeX block $$
    if (line.trim().startsWith('$$')) {
      const mathLines: string[] = [];
      if (line.trim().endsWith('$$') && line.trim().length > 4) {
        mathLines.push(line.trim().slice(2, -2).trim());
        i++;
      } else {
        i++;
        while (i < lines.length && !lines[i].trim().endsWith('$$')) {
          mathLines.push(lines[i]);
          i++;
        }
        i++; // skip closing $$
      }
      blocks.push({
        type: 'math',
        content: mathLines.join('\n')
      });
      continue;
    }

    // Blockquote / Callout >
    if (line.trim().startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        type: 'callout',
        content: quoteLines.join('\n')
      });
      continue;
    }

    // Table lines
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: 'table',
        content: tableLines.join('\n')
      });
      continue;
    }

    // List item
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        listItems.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push({
        type: 'list',
        content: '',
        extra: { items: listItems }
      });
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', content: line.replace(/^#\s+/, '') });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', content: line.replace(/^##\s+/, '') });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', content: line.replace(/^###\s+/, '') });
      i++;
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular paragraph
    blocks.push({ type: 'p', content: line });
    i++;
  }

  return blocks;
};

export const NoteReaderContent: React.FC<NoteReaderContentProps> = ({
  activeNote,
  viewMode,
  onOpenNoteModal,
  onContentChange
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // If no note is selected or available
  if (!activeNote || activeNote.id === 'nota-default') {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        background: 'var(--bg-canvas)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--surface-2)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <FileText size={26} color="var(--primary)" />
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Sin apunte seleccionado
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.5, marginBottom: '20px' }}>
          Selecciona una nota del panel lateral o crea un nuevo apunte en formato Markdown para documentar tus clases, fórmulas y laboratorios.
        </p>
        {onOpenNoteModal && (
          <button
            onClick={onOpenNoteModal}
            className={styles.btnNewFolder}
            style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}
          >
            <Plus size={14} />
            <span>Crear Primer Apunte (⌘N)</span>
          </button>
        )}
      </div>
    );
  }

  const blocks = parseMarkdownBlocks(activeNote.contenidoMarkdown || '');

  return (
    <div className={styles.editorScrollArea} style={{ flex: 1 }}>
      <h1 className={styles.noteDocTitle}># {activeNote.titulo}</h1>

      <div className={styles.docMetaGroup}>
        <div>Materia: <strong>{activeNote.materiaNombre}</strong></div>
        <div>Evaluación: <strong>{activeNote.evaluacionNombre || activeNote.carpeta || 'General'}</strong></div>
        <div>Modificado: {new Date(activeNote.fechaModificacion).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        <div>Lectura: ~{activeNote.tiempoLecturaMin || 1} min ({activeNote.palabras || 0} palabras)</div>
      </div>

      {viewMode === 'markdown' ? (
        <textarea
          value={activeNote.contenidoMarkdown}
          onChange={(e) => onContentChange && onContentChange(e.target.value)}
          style={{
            width: '100%',
            height: '500px',
            background: 'var(--surface-1)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            lineHeight: 1.6,
            padding: '16px',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            resize: 'vertical'
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
          {blocks.map((block, idx) => {
            switch (block.type) {
              case 'h1':
                return (
                  <h1 key={idx} style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                    {renderInline(block.content)}
                  </h1>
                );
              case 'h2':
                return (
                  <h2 key={idx} style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>
                    {renderInline(block.content)}
                  </h2>
                );
              case 'h3':
                return (
                  <h3 key={idx} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '6px' }}>
                    {renderInline(block.content)}
                  </h3>
                );
              case 'callout':
                return (
                  <div key={idx} className={styles.calloutCritical}>
                    <div className={styles.calloutHeader}>
                      <Flame size={14} />
                      <span>NOTA CLAVE</span>
                    </div>
                    <p className={styles.calloutBody}>
                      {renderInline(block.content)}
                    </p>
                  </div>
                );
              case 'math': {
                let mathHtml = block.content;
                try {
                  mathHtml = katex.renderToString(block.content, {
                    displayMode: true,
                    throwOnError: false
                  });
                } catch {
                  mathHtml = block.content;
                }
                return (
                  <div key={idx} className={styles.mathDisplayBox}>
                    <div className={styles.mathHeader}>KaTeX · Formal Notation</div>
                    <div
                      className={styles.mathFormula}
                      dangerouslySetInnerHTML={{ __html: mathHtml }}
                    />
                  </div>
                );
              }
              case 'code':
                return (
                  <div key={idx} className={styles.codeBlock}>
                    <div className={styles.codeHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                        <span style={{ marginLeft: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                          {block.extra?.lang || 'código'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(block.content, idx)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '11px', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {copiedIndex === idx ? <Check size={12} color="var(--emerald)" /> : <Copy size={12} />}
                        <span>{copiedIndex === idx ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                    <pre className={styles.codeContent}>
                      <code>{block.content}</code>
                    </pre>
                  </div>
                );
              case 'table': {
                const rows = block.content.split('\n').filter(r => r.trim() && !r.includes('---'));
                if (rows.length === 0) return null;
                const headerCols = rows[0].split('|').map(c => c.trim()).filter(Boolean);
                const bodyRows = rows.slice(1).map(r => r.split('|').map(c => c.trim()).filter(Boolean));
                return (
                  <table key={idx} className={styles.markdownTable}>
                    <thead>
                      <tr>
                        {headerCols.map((col, colIdx) => (
                          <th key={colIdx}>{renderInline(col)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bodyRows.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx}>{renderInline(cell)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              }
              case 'list':
                return (
                  <ul key={idx} style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {block.extra?.items?.map((item: string, itemIdx: number) => (
                      <li key={itemIdx}>{renderInline(item)}</li>
                    ))}
                  </ul>
                );
              case 'p':
              default:
                return (
                  <p key={idx} style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {renderInline(block.content)}
                  </p>
                );
            }
          })}
        </div>
      )}
    </div>
  );
};

export default NoteReaderContent;
