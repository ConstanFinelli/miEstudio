import React, { useState, useRef, useEffect } from 'react';
import styles from './NoteReaderContent.module.css';
import { Flame, Check, Copy, FileText, Plus, Maximize2, ImageOff, X } from 'lucide-react';
import katex from 'katex';
import type { ApunteNota } from '../../../../types/academic';
import { apuntesService } from '../../../../services/apuntesService';

interface NoteReaderContentProps {
  activeNote: ApunteNota | null;
  viewMode: 'render' | 'markdown' | 'split';
  onOpenNoteModal?: (materiaId?: string) => void;
  onContentChange?: (newContent: string) => void;
  onRegisterInsert?: (
    inserter: (prefix: string, suffix?: string, defaultText?: string) => void
  ) => void;
}

// Helper to render inline formatting: **bold**, `code`, $katex$, and inline images
const renderInline = (text: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  const regex = /(!\[[^\]]*\]\([^)]+\)|\$[^$]+\$|`[^`]+`|\*\*[^*]+\*\*)/g;
  const segments = text.split(regex);

  segments.forEach((seg, idx) => {
    if (!seg) return;
    if (seg.startsWith('![') && seg.endsWith(')')) {
      const imgMatch = seg.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        parts.push(
          <img
            key={idx}
            src={imgMatch[2].trim()}
            alt={imgMatch[1].trim() || 'Imagen'}
            className={styles.inlineImage}
            title={imgMatch[1].trim()}
            loading="lazy"
          />
        );
        return;
      }
    }
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
            color: 'var(--text-primary)',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}
        >
          {seg.slice(1, -1)}
        </code>
      );
    } else if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
      parts.push(
        <strong key={idx} style={{ color: 'var(--text-primary)' }}>
          {seg.slice(2, -2)}
        </strong>
      );
    } else {
      parts.push(seg);
    }
  });

  return parts;
};

export interface MarkdownBlock {
  type: 'h1' | 'h2' | 'h3' | 'callout' | 'math' | 'code' | 'table' | 'list' | 'image' | 'p';
  content: string;
  startLine: number;
  endLine: number;
  extra?: any;
}

// Parser to turn raw Markdown lines into styled block nodes with line metadata
const parseMarkdownBlocks = (md: string): MarkdownBlock[] => {
  const lines = md.split('\n');
  const blocks: MarkdownBlock[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const startLine = i;

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
        startLine,
        endLine: i - 1,
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
        content: mathLines.join('\n'),
        startLine,
        endLine: i - 1
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
        content: quoteLines.join('\n'),
        startLine,
        endLine: i - 1
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
        content: tableLines.join('\n'),
        startLine,
        endLine: i - 1
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
        startLine,
        endLine: i - 1,
        extra: { items: listItems }
      });
      continue;
    }

    // Standalone image block ![alt](url)
    const imgMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      blocks.push({
        type: 'image',
        content: imgMatch[2].trim(),
        startLine,
        endLine: startLine,
        extra: { alt: imgMatch[1].trim() }
      });
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', content: line.replace(/^#\s+/, ''), startLine, endLine: startLine });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', content: line.replace(/^##\s+/, ''), startLine, endLine: startLine });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', content: line.replace(/^###\s+/, ''), startLine, endLine: startLine });
      i++;
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular paragraph
    blocks.push({ type: 'p', content: line, startLine, endLine: startLine });
    i++;
  }

  return blocks;
};

export const NoteReaderContent: React.FC<NoteReaderContentProps> = ({
  activeNote,
  viewMode,
  onOpenNoteModal,
  onContentChange,
  onRegisterInsert
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{ src: string; alt?: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const scrollingSourceRef = useRef<'editor' | 'preview' | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Sincronización precisa entre editor y preview basada en bloques de contenido
  const syncEditorToPreview = () => {
    const editor = textareaRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    const editorScrollable = editor.scrollHeight - editor.clientHeight;
    const previewScrollable = preview.scrollHeight - preview.clientHeight;

    if (editorScrollable <= 0 || previewScrollable <= 0) return;

    // Alinear top y bottom con exactitud
    if (editor.scrollTop <= 2) {
      preview.scrollTop = 0;
      return;
    }
    if (editor.scrollTop >= editorScrollable - 4) {
      preview.scrollTop = previewScrollable;
      return;
    }

    const elements = preview.querySelectorAll<HTMLElement>('[data-line]');
    if (elements.length === 0) {
      const ratio = editor.scrollTop / editorScrollable;
      preview.scrollTop = ratio * previewScrollable;
      return;
    }

    const previewRect = preview.getBoundingClientRect();
    const anchors: Array<{ line: number; top: number }> = [{ line: 0, top: 0 }];

    elements.forEach(el => {
      const line = parseInt(el.getAttribute('data-line') || '0', 10);
      const elRect = el.getBoundingClientRect();
      const top = elRect.top - previewRect.top + preview.scrollTop;
      anchors.push({ line, top });
    });

    const totalLines = Math.max(1, (activeNote?.contenidoMarkdown || '').split('\n').length);
    anchors.push({ line: totalLines, top: previewScrollable });
    anchors.sort((a, b) => a.line - b.line);

    const currentLine = (editor.scrollTop / editorScrollable) * totalLines;

    let a0 = anchors[0];
    let a1 = anchors[anchors.length - 1];

    for (let k = 0; k < anchors.length - 1; k++) {
      if (anchors[k].line <= currentLine && anchors[k + 1].line >= currentLine) {
        a0 = anchors[k];
        a1 = anchors[k + 1];
        break;
      }
    }

    const lineSpan = Math.max(0.001, a1.line - a0.line);
    const factor = Math.min(1, Math.max(0, (currentLine - a0.line) / lineSpan));
    const targetTop = a0.top + factor * (a1.top - a0.top);

    preview.scrollTop = Math.min(previewScrollable, Math.max(0, targetTop));
  };

  const syncPreviewToEditor = () => {
    const editor = textareaRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    const editorScrollable = editor.scrollHeight - editor.clientHeight;
    const previewScrollable = preview.scrollHeight - preview.clientHeight;

    if (editorScrollable <= 0 || previewScrollable <= 0) return;

    // Alinear top y bottom con exactitud
    if (preview.scrollTop <= 2) {
      editor.scrollTop = 0;
      return;
    }
    if (preview.scrollTop >= previewScrollable - 4) {
      editor.scrollTop = editorScrollable;
      return;
    }

    const elements = preview.querySelectorAll<HTMLElement>('[data-line]');
    if (elements.length === 0) {
      const ratio = preview.scrollTop / previewScrollable;
      editor.scrollTop = ratio * editorScrollable;
      return;
    }

    const previewRect = preview.getBoundingClientRect();
    const anchors: Array<{ line: number; top: number }> = [{ line: 0, top: 0 }];

    elements.forEach(el => {
      const line = parseInt(el.getAttribute('data-line') || '0', 10);
      const elRect = el.getBoundingClientRect();
      const top = elRect.top - previewRect.top + preview.scrollTop;
      anchors.push({ line, top });
    });

    const totalLines = Math.max(1, (activeNote?.contenidoMarkdown || '').split('\n').length);
    anchors.push({ line: totalLines, top: previewScrollable });
    anchors.sort((a, b) => a.top - b.top);

    const currentTop = preview.scrollTop;

    let a0 = anchors[0];
    let a1 = anchors[anchors.length - 1];

    for (let k = 0; k < anchors.length - 1; k++) {
      if (anchors[k].top <= currentTop && anchors[k + 1].top >= currentTop) {
        a0 = anchors[k];
        a1 = anchors[k + 1];
        break;
      }
    }

    const topSpan = Math.max(0.001, a1.top - a0.top);
    const factor = Math.min(1, Math.max(0, (currentTop - a0.top) / topSpan));
    const targetLine = a0.line + factor * (a1.line - a0.line);

    const targetEditorTop = (targetLine / totalLines) * editorScrollable;
    editor.scrollTop = Math.min(editorScrollable, Math.max(0, targetEditorTop));
  };

  const handleEditorScroll = () => {
    if (scrollingSourceRef.current === 'preview') return;
    scrollingSourceRef.current = 'editor';
    syncEditorToPreview();
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      scrollingSourceRef.current = null;
    }, 60);
  };

  const handlePreviewScroll = () => {
    if (scrollingSourceRef.current === 'editor') return;
    scrollingSourceRef.current = 'preview';
    syncPreviewToEditor();
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      scrollingSourceRef.current = null;
    }, 60);
  };

  // Helper to upload and insert image from paste or drop
  const handleImageFileInsertion = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsUploadingImage(true);
    try {
      const textarea = textareaRef.current;
      const start = textarea?.selectionStart ?? (activeNote?.contenidoMarkdown || '').length;
      const end = textarea?.selectionEnd ?? start;
      const current = activeNote?.contenidoMarkdown || '';

      const placeholder = `\n![Subiendo imagen...]()\n`;
      const tempText = current.substring(0, start) + placeholder + current.substring(end);
      onContentChange?.(tempText);

      const uploaded = await apuntesService.uploadImage(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Imagen';
      const finalTag = `\n![${cleanName}](${uploaded.url})\n`;

      const replaced = tempText.replace(placeholder, finalTag);
      onContentChange?.(replaced);
    } catch (err) {
      console.error('Error al insertar imagen pegada:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleTextareaPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        handleImageFileInsertion(file);
      }
    }
  };

  const handleTextareaDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        handleImageFileInsertion(file);
      }
    }
  };

  // Register the inserter function so FormattingToolbar can insert into the textarea cursor
  useEffect(() => {
    if (onRegisterInsert) {
      onRegisterInsert((prefix: string, suffix: string = '', defaultText: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart ?? 0;
        const end = textarea.selectionEnd ?? 0;
        const currentText = textarea.value;
        const selected = currentText.substring(start, end) || defaultText;
        const replacement = `${prefix}${selected}${suffix}`;

        const newText =
          currentText.substring(0, start) + replacement + currentText.substring(end);

        onContentChange?.(newText);

        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start + prefix.length,
            start + prefix.length + selected.length
          );
        }, 10);
      });
    }
  }, [onRegisterInsert, onContentChange]);

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // If no note is selected or available
  if (!activeNote || activeNote.id === 'nota-default') {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center',
          background: 'var(--bg-canvas)'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--surface-2)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          <FileText size={26} color="var(--primary)" />
        </div>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}
        >
          Sin apunte seleccionado
        </h3>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            maxWidth: '420px',
            lineHeight: 1.5,
            marginBottom: '20px'
          }}
        >
          Selecciona una nota del panel lateral o crea un nuevo apunte en formato Markdown para
          documentar tus clases, fórmulas y laboratorios.
        </p>
        {onOpenNoteModal && (
          <button
            onClick={() => onOpenNoteModal()}
            className={styles.btnNewFolder}
            style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}
          >
            <Plus size={14} />
            <span>Crear Primer Apunte</span>
          </button>
        )}
      </div>
    );
  }

  const blocks = parseMarkdownBlocks(activeNote.contenidoMarkdown || '');

  const renderBlocksList = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        marginTop: '8px',
        minWidth: 0,
        maxWidth: '100%',
        width: '100%',
        boxSizing: 'border-box',
        overflowWrap: 'break-word',
        wordBreak: 'break-word'
      }}
    >
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h1':
            return (
              <h1
                key={idx}
                data-line={block.startLine}
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginTop: '12px',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '6px',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                {renderInline(block.content)}
              </h1>
            );
          case 'h2':
            return (
              <h2
                key={idx}
                data-line={block.startLine}
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginTop: '8px',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                {renderInline(block.content)}
              </h2>
            );
          case 'h3':
            return (
              <h3
                key={idx}
                data-line={block.startLine}
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginTop: '6px',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                {renderInline(block.content)}
              </h3>
            );
          case 'callout':
            return (
              <div key={idx} data-line={block.startLine} className={styles.calloutCritical}>
                <div className={styles.calloutHeader}>
                  <Flame size={14} />
                  <span>NOTA CLAVE</span>
                </div>
                <p className={styles.calloutBody}>{renderInline(block.content)}</p>
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
              mathHtml = `<pre>${block.content}</pre>`;
            }
            return (
              <div
                key={idx}
                data-line={block.startLine}
                style={{
                  margin: '12px 0',
                  padding: '12px',
                  background: 'var(--surface-2)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  overflowX: 'auto',
                  textAlign: 'center'
                }}
                dangerouslySetInnerHTML={{ __html: mathHtml }}
              />
            );
          }
          case 'code':
            return (
              <div key={idx} data-line={block.startLine} className={styles.codeBlock}>
                <div className={styles.codeHeader}>
                  <span>{block.extra?.lang || 'código'}</span>
                  <button
                    className={styles.copyBtn}
                    onClick={() => handleCopyCode(block.content, idx)}
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check size={12} color="var(--emerald)" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className={styles.codeContent}>
                  <code>{block.content}</code>
                </pre>
              </div>
            );
          case 'table': {
            const rows = block.content.trim().split('\n');
            const headerRow = rows[0]
              ? rows[0]
                  .split('|')
                  .filter((_, i, arr) => i > 0 && i < arr.length - 1)
                  .map(c => c.trim())
              : [];
            const dataRows = rows.slice(2).map(r =>
              r
                .split('|')
                .filter((_, i, arr) => i > 0 && i < arr.length - 1)
                .map(c => c.trim())
            );
            return (
              <div key={idx} data-line={block.startLine} style={{ overflowX: 'auto', margin: '8px 0' }}>
                <table className={styles.markdownTable}>
                  <thead>
                    <tr>
                      {headerRow.map((h, hIdx) => (
                        <th key={hIdx}>{renderInline(h)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataRows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx}>{renderInline(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          case 'list':
            return (
              <ul
                key={idx}
                data-line={block.startLine}
                style={{
                  paddingLeft: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  color: 'var(--text-secondary)',
                  minWidth: 0,
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {block.extra?.items?.map((item: string, itemIdx: number) => (
                  <li
                    key={itemIdx}
                    style={{
                      lineHeight: 1.5,
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word'
                    }}
                  >
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            );
          case 'image':
            return (
              <figure key={idx} data-line={block.startLine} className={styles.imageFigure}>
                <div className={styles.imageContainer}>
                  <img
                    src={block.content}
                    alt={block.extra?.alt || 'Imagen de apunte'}
                    className={styles.noteImage}
                    loading="lazy"
                    onClick={() => setZoomedImage({ src: block.content, alt: block.extra?.alt })}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.querySelector(`.${styles.imageErrorFallback}`) as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className={styles.imageErrorFallback} style={{ display: 'none' }}>
                    <ImageOff size={16} />
                    <span>No se pudo cargar la imagen</span>
                  </div>
                  <button
                    type="button"
                    className={styles.imageZoomBtn}
                    onClick={() => setZoomedImage({ src: block.content, alt: block.extra?.alt })}
                    title="Ver imagen en tamaño completo"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>
                {block.extra?.alt && (
                  <figcaption className={styles.imageCaption}>
                    {block.extra.alt}
                  </figcaption>
                )}
              </figure>
            );
          case 'p':
          default:
            return (
              <p
                key={idx}
                data-line={block.startLine}
                style={{
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  margin: 0,
                  minWidth: 0,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                {renderInline(block.content)}
              </p>
            );
        }
      })}
    </div>
  );

  return (
    <>
      {viewMode === 'split' ? (
        /* Modo Split: Editor de Markdown a la izquierda + Live Preview Renderizado a la derecha */
        <div className={styles.editorSplitContainer}>
          <div className={styles.splitEditorPane} style={{ position: 'relative' }}>
            <textarea
              ref={textareaRef}
              value={activeNote.contenidoMarkdown}
              onChange={e => onContentChange?.(e.target.value)}
              onPaste={handleTextareaPaste}
              onDrop={handleTextareaDrop}
              onScroll={handleEditorScroll}
              onMouseEnter={() => {
                if (scrollingSourceRef.current !== 'preview') {
                  scrollingSourceRef.current = 'editor';
                }
              }}
              onFocus={() => {
                scrollingSourceRef.current = 'editor';
              }}
              className={styles.markdownTextarea}
              placeholder="Escribe tu apunte en formato Markdown aquí (puedes arrastrar o pegar imágenes)..."
              spellCheck={false}
            />
            {isUploadingImage && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  backgroundColor: 'var(--surface-3)',
                  border: '1px solid var(--primary)',
                  color: 'var(--primary)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: '2px solid var(--primary)',
                    borderTopColor: 'transparent',
                    animation: 'spin 0.6s linear infinite'
                  }}
                />
                <span>Subiendo imagen adjunta...</span>
              </div>
            )}
          </div>
          <div
            ref={previewRef}
            className={styles.splitPreviewPane}
            onScroll={handlePreviewScroll}
            onMouseEnter={() => {
              if (scrollingSourceRef.current !== 'editor') {
                scrollingSourceRef.current = 'preview';
              }
            }}
          >
            <h1 className={styles.noteDocTitle}># {activeNote.titulo}</h1>
            <div className={styles.docMetaGroup}>
              <div>Materia: <strong>{activeNote.materiaNombre}</strong></div>
              <div>Evaluación: <strong>{activeNote.evaluacionNombre || activeNote.carpeta || 'General'}</strong></div>
            </div>
            {renderBlocksList()}
          </div>
        </div>
      ) : viewMode === 'markdown' ? (
        /* Modo Markdown Completo */
        <div className={styles.editorScrollArea} style={{ flex: 1, position: 'relative' }}>
          <h1 className={styles.noteDocTitle}># {activeNote.titulo}</h1>
          <div className={styles.docMetaGroup}>
            <div>Materia: <strong>{activeNote.materiaNombre}</strong></div>
            <div>Evaluación: <strong>{activeNote.evaluacionNombre || activeNote.carpeta || 'General'}</strong></div>
          </div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <textarea
              ref={textareaRef}
              value={activeNote.contenidoMarkdown}
              onChange={e => onContentChange?.(e.target.value)}
              onPaste={handleTextareaPaste}
              onDrop={handleTextareaDrop}
              className={styles.markdownTextarea}
              placeholder="Escribe tu apunte en formato Markdown aquí (puedes arrastrar o pegar imágenes)..."
              style={{ minHeight: '600px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}
              spellCheck={false}
            />
            {isUploadingImage && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  backgroundColor: 'var(--surface-3)',
                  border: '1px solid var(--primary)',
                  color: 'var(--primary)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: '2px solid var(--primary)',
                    borderTopColor: 'transparent',
                    animation: 'spin 0.6s linear infinite'
                  }}
                />
                <span>Subiendo imagen adjunta...</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Modo Renderizado Completo */
        <div className={styles.editorScrollArea} style={{ flex: 1 }}>
          <h1 className={styles.noteDocTitle}># {activeNote.titulo}</h1>
          <div className={styles.docMetaGroup}>
            <div>Materia: <strong>{activeNote.materiaNombre}</strong></div>
            <div>Evaluación: <strong>{activeNote.evaluacionNombre || activeNote.carpeta || 'General'}</strong></div>
            <div>
              Modificado:{' '}
              {new Date(activeNote.fechaModificacion).toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </div>
            <div>Lectura: ~{activeNote.tiempoLecturaMin || 1} min ({activeNote.palabras || 0} palabras)</div>
          </div>
          {renderBlocksList()}
        </div>
      )}

      {/* Lightbox / Zoom modal */}
      {zoomedImage && (
        <div className={styles.lightboxOverlay} onClick={() => setZoomedImage(null)}>
          <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={() => setZoomedImage(null)}
              title="Cerrar vista ampliada"
            >
              <X size={26} />
            </button>
            <img
              src={zoomedImage.src}
              alt={zoomedImage.alt || 'Vista ampliada'}
              className={styles.lightboxImg}
            />
            {zoomedImage.alt && (
              <div className={styles.lightboxCaption}>{zoomedImage.alt}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NoteReaderContent;
