import React from 'react';
import katex from 'katex';
import styles from './AiMarkdownRenderer.module.css';

interface AiMarkdownRendererProps {
  content: string;
  className?: string;
}

// Inline formatting: **bold**, `code`, and $formula$
const renderInline = (text: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
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
        <code key={idx} className={styles.inlineCode}>
          {seg.slice(1, -1)}
        </code>
      );
    } else if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
      parts.push(
        <strong key={idx} className={styles.boldText}>
          {seg.slice(2, -2)}
        </strong>
      );
    } else {
      parts.push(seg);
    }
  });

  return parts;
};

// Parser to turn raw Markdown lines into styled block nodes
export const AiMarkdownRenderer: React.FC<AiMarkdownRendererProps> = ({
  content,
  className
}) => {
  if (!content) return null;

  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
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
      blocks.push(
        <div key={`code-${i}`} className={styles.codeBlock}>
          {lang && <div className={styles.codeHeader}>{lang}</div>}
          <pre className={styles.codePre}>
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
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
      const rawFormula = mathLines.join('\n');
      let html = '';
      try {
        html = katex.renderToString(rawFormula, {
          displayMode: true,
          throwOnError: false
        });
      } catch {
        html = `<code>${rawFormula}</code>`;
      }
      blocks.push(
        <div
          key={`math-${i}`}
          className={styles.mathBlock}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
      continue;
    }

    // Blockquote / Callout >
    if (line.trim().startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote key={`quote-${i}`} className={styles.calloutBlock}>
          {quoteLines.map((ql, qIdx) => (
            <div key={qIdx}>{renderInline(ql)}</div>
          ))}
        </blockquote>
      );
      continue;
    }

    // Bullet list items
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const items: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))
      ) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul key={`list-${i}`} className={styles.bulletList}>
          {items.map((item, itemIdx) => (
            <li key={itemIdx} className={styles.bulletItem}>
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      blocks.push(
        <h3 key={`h1-${i}`} className={styles.heading1}>
          {renderInline(line.replace(/^#\s+/, ''))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <h4 key={`h2-${i}`} className={styles.heading2}>
          {renderInline(line.replace(/^##\s+/, ''))}
        </h4>
      );
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push(
        <h5 key={`h3-${i}`} className={styles.heading3}>
          {renderInline(line.replace(/^###\s+/, ''))}
        </h5>
      );
      i++;
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular paragraph
    blocks.push(
      <p key={`p-${i}`} className={styles.paragraph}>
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className={`${styles.rendererRoot} ${className || ''}`}>{blocks}</div>;
};

export default AiMarkdownRenderer;
