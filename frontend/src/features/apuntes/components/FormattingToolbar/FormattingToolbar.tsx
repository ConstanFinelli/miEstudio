import React, { useState } from 'react';
import styles from './FormattingToolbar.module.css';
import { X, Plus } from 'lucide-react';

interface FormattingToolbarProps {
  tags: string[];
  onInsertMarkdown?: (prefix: string, suffix?: string, defaultText?: string) => void;
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  tags,
  onInsertMarkdown,
  onAddTag,
  onRemoveTag
}) => {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleToolClick = (prefix: string, suffix: string = '', defaultText: string = '') => {
    if (onInsertMarkdown) {
      onInsertMarkdown(prefix, suffix, defaultText);
    }
  };

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && onAddTag && !tags.includes(clean)) {
      onAddTag(clean);
      setTagInput('');
      setIsAddingTag(false);
    }
  };

  return (
    <div className={styles.formattingToolbar}>
      {/* Editor action buttons / "chiches" */}
      <div className={styles.toolbarGroup}>
        <button
          type="button"
          className={styles.toolBtn}
          title="Título Principal (# H1)"
          onClick={() => handleToolClick('# ', '', 'Encabezado 1')}
        >
          H1
        </button>
        <button
          type="button"
          className={styles.toolBtn}
          title="Subtítulo (## H2)"
          onClick={() => handleToolClick('## ', '', 'Encabezado 2')}
        >
          H2
        </button>
        <button
          type="button"
          className={styles.toolBtn}
          title="Sección (### H3)"
          onClick={() => handleToolClick('### ', '', 'Encabezado 3')}
        >
          H3
        </button>
        <button
          type="button"
          className={styles.toolBtn}
          title="Negrita (**texto**)"
          onClick={() => handleToolClick('**', '**', 'negrita')}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={styles.toolBtn}
          title="Cursiva (*texto*)"
          onClick={() => handleToolClick('*', '*', 'cursiva')}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={styles.toolBtn}
          title="Código en línea (`código`)"
          onClick={() => handleToolClick('`', '`', 'código')}
        >
          `code`
        </button>
        <button
          type="button"
          className={styles.toolBtn}
          title="Bloque de código (```lenguaje```)"
          onClick={() => handleToolClick('```python\n', '\n```', '# Código python')}
        >
          &lt;/&gt;
        </button>
        <button
          type="button"
          className={`${styles.toolBtn} ${styles.toolBtnKatex}`}
          title="Fórmula matemática KaTeX ($$ formula $$)"
          onClick={() => handleToolClick('$$\n', '\n$$', '\\int_{a}^{b} f(x) dx')}
        >
          KaTeX $$
        </button>
        <button
          type="button"
          className={styles.toolBtn}
          title="Lista de viñetas (- Item)"
          onClick={() => handleToolClick('- ', '', 'Elemento')}
        >
          • Lista
        </button>
        <button
          type="button"
          className={styles.toolBtn}
          title="Tabla Markdown"
          onClick={() =>
            handleToolClick(
              '\n| Concepto | Definición | Complejidad |\n|---|---|---|\n| Algoritmo A | Búsqueda binaria | O(log n) |\n| Algoritmo B | Recorrido lineal | O(n) |\n',
              '',
              ''
            )
          }
        >
          ⊞ Tabla
        </button>
        <button
          type="button"
          className={styles.toolBtn}
          title="Cita o referencia (> texto)"
          onClick={() => handleToolClick('> ', '', 'Cita bibliográfica o referencia')}
        >
          &quot;Cita&quot;
        </button>
        <button
          type="button"
          className={styles.toolBtn}
          title="Nota destacada / Callout"
          onClick={() => handleToolClick('> [!NOTE]\n> ', '', 'Concepto clave de examen')}
          style={{ color: 'var(--amber)' }}
        >
          ★ Clave
        </button>
      </div>

      {/* Tags section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {tags.map(t => (
          <span
            key={t}
            className={styles.miniTag}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            #{t}
            {onRemoveTag && (
              <button
                type="button"
                onClick={() => onRemoveTag(t)}
                title={`Eliminar etiqueta #${t}`}
                style={{ background: 'none', border: 'none', padding: 0, display: 'flex', cursor: 'pointer', color: 'inherit' }}
              >
                <X size={11} style={{ opacity: 0.7 }} />
              </button>
            )}
          </span>
        ))}

        {isAddingTag ? (
          <form onSubmit={handleTagSubmit} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            <input
              type="text"
              autoFocus
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onBlur={() => {
                if (!tagInput.trim()) setIsAddingTag(false);
              }}
              placeholder="etiqueta..."
              style={{
                background: 'var(--surface-3)',
                border: '1px solid var(--border-hover)',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                padding: '1px 5px',
                outline: 'none',
                width: '70px'
              }}
            />
          </form>
        ) : (
          onAddTag && (
            <button
              type="button"
              className={styles.toolBtn}
              style={{ padding: '1px 5px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
              onClick={() => setIsAddingTag(true)}
              title="Agregar etiqueta"
            >
              <Plus size={10} />
              <span>Tag</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default FormattingToolbar;
