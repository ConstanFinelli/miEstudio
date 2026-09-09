import React from 'react';
import katex from 'katex';

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
        <code
          key={idx}
          style={{
            fontFamily: 'var(--font-mono)',
            background: 'var(--surface-3)',
            padding: '1px 5px',
            borderRadius: '3px',
            fontSize: '11px',
            color: 'var(--text-primary)'
          }}
        >
          {seg.slice(1, -1)}
        </code>
      );
    } else if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
      parts.push(
        <strong key={idx} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
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
        <div
          key={`code-${i}`}
          style={{
            margin: '8px 0',
            background: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden'
          }}
        >
          {lang && (
            <div
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                padding: '4px 8px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--surface-2)',
                textTransform: 'uppercase'
              }}
            >
              {lang}
            </div>
          )}
          <pre
            style={{
              padding: '8px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              overflowX: 'auto',
              margin: 0,
              color: 'var(--text-primary)',
              lineHeight: 1.45
            }}
          >
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
          dangerouslySetInnerHTML={{ __html: html }}
          style={{
            margin: '10px 0',
            padding: '8px 12px',
            background: 'var(--surface-2)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            overflowX: 'auto',
            textAlign: 'center'
          }}
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
        <blockquote
          key={`quote-${i}`}
          style={{
            margin: '8px 0',
            padding: '6px 12px',
            borderLeft: '3px solid var(--primary)',
            background: 'var(--primary-alpha)',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            fontSize: '12px',
            color: 'var(--text-primary)',
            fontStyle: 'italic'
          }}
        >
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
        <ul
          key={`list-${i}`}
          style={{
            margin: '6px 0',
            paddingLeft: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          {items.map((item, itemIdx) => (
            <li
              key={itemIdx}
              style={{
                fontSize: '12px',
                color: 'var(--text-primary)',
                lineHeight: 1.5
              }}
            >
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
        <h3
          key={`h1-${i}`}
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '12px 0 6px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '4px'
          }}
        >
          {renderInline(line.replace(/^#\s+/, ''))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <h4
          key={`h2-${i}`}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--primary-glow)',
            margin: '10px 0 4px'
          }}
        >
          {renderInline(line.replace(/^##\s+/, ''))}
        </h4>
      );
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push(
        <h5
          key={`h3-${i}`}
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            margin: '8px 0 2px'
          }}
        >
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
      <p
        key={`p-${i}`}
        style={{
          margin: '4px 0',
          fontSize: '12px',
          color: 'var(--text-primary)',
          lineHeight: 1.55
        }}
      >
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className={className}>{blocks}</div>;
};

export default AiMarkdownRenderer;
