import React, { useState, useEffect } from 'react';
import styles from './NoteModal.module.css';
import {
  X,
  FileText,
  BookOpen,
  FlaskConical,
  Sigma
} from 'lucide-react';
import { useMaterias, useEvaluaciones } from '../../../hooks';
import { apuntesService } from '../../../services';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newNoteTitle: string) => void;
  initialMateriaId?: string;
  initialEvaluacionId?: string;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMateriaId,
  initialEvaluacionId
}) => {
  const { materias } = useMaterias();
  const { evaluaciones } = useEvaluaciones();

  const [materiaId, setMateriaId] = useState('');
  const [customMateria, setCustomMateria] = useState('');
  const [evalId, setEvalId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [template, setTemplate] = useState('teorico');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [syncKatex, setSyncKatex] = useState(true);
  const [syncPg, setSyncPg] = useState(true);
  const [syncAnki, setSyncAnki] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Materias ordenadas ascendentemente por año de cursada, cuatrimestre y nombre
  const sortedMaterias = React.useMemo(() => {
    return [...materias].sort((a, b) => {
      const yrA = a.anio ?? 1;
      const yrB = b.anio ?? 1;
      if (yrA !== yrB) return yrA - yrB;

      const cuatriWeight = (c?: string) => (c === '1C' ? 1 : c === '2C' ? 2 : 3);
      const wA = cuatriWeight(a.cuatrimestre);
      const wB = cuatriWeight(b.cuatrimestre);
      if (wA !== wB) return wA - wB;

      return a.nombre.localeCompare(b.nombre);
    });
  }, [materias]);

  // Años únicos para los grupos de materias en el select
  const aniosDisponibles = React.useMemo(() => {
    const years = Array.from(new Set(sortedMaterias.map(m => m.anio || 1)));
    return years.sort((a, b) => a - b);
  }, [sortedMaterias]);

  // Filtrar instancias de evaluación restringidas estrictamente a la materia seleccionada
  const filteredEvaluaciones = React.useMemo(() => {
    if (!materiaId) return [];
    const selectedMat = materias.find(m => m.id === materiaId);
    return evaluaciones.filter(ev => {
      if (ev.materiaId === materiaId) return true;
      if (selectedMat) {
        if (ev.materiaCodigo && selectedMat.codigo && ev.materiaCodigo === selectedMat.codigo) return true;
        if (
          ev.materiaNombre &&
          selectedMat.nombre &&
          ev.materiaNombre.trim().toLowerCase() === selectedMat.nombre.trim().toLowerCase()
        ) {
          return true;
        }
      }
      return false;
    });
  }, [evaluaciones, materiaId, materias]);

  // Sincronizar materia seleccionada y resetear campos al abrir modal
  useEffect(() => {
    if (isOpen) {
      setTitulo('');
      setTags([]);
      setIsSubmitting(false);

      if (initialMateriaId && sortedMaterias.some(m => m.id === initialMateriaId)) {
        setMateriaId(initialMateriaId);
      } else if (!materiaId || !sortedMaterias.some(m => m.id === materiaId)) {
        if (sortedMaterias.length > 0) {
          setMateriaId(sortedMaterias[0].id);
        }
      }

      if (initialEvaluacionId) {
        setEvalId(initialEvaluacionId);
      } else {
        setEvalId('');
      }
    }
  }, [isOpen, initialMateriaId, initialEvaluacionId, sortedMaterias]);

  // Si cambia la materia y la evaluación elegida no pertenece a ella, resetearla
  useEffect(() => {
    if (evalId && !filteredEvaluaciones.some(ev => ev.id === evalId)) {
      setEvalId('');
    }
  }, [filteredEvaluaciones, evalId]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const selectedMat = materias.find(m => m.id === materiaId) || sortedMaterias[0];
    const materiaIdVal = selectedMat?.id || (customMateria.trim() ? `mat-${Date.now()}` : 'mat-general');
    const materiaNombreVal = selectedMat?.nombre || customMateria.trim() || 'General';
    const selectedEval = filteredEvaluaciones.find(e => e.id === evalId);
    const noteTitle = titulo.trim() || 'Nuevo Apunte';

    let initialContent = `# ${noteTitle}\n\n## 1. Introducción y Conceptos Clave\n\nComienza a escribir tus notas de ${materiaNombreVal} aquí...\n`;
    if (template === 'formulas') {
      initialContent = `# ${noteTitle}\n\n## Fórmulas y Demostraciones Matemáticas\n\n$$\n\\int_{a}^{b} f(x) dx = F(b) - F(a)\n$$\n\n> [!NOTE]\n> Definición formal y condiciones de aplicabilidad.\n`;
    } else if (template === 'laboratorio') {
      initialContent = `# ${noteTitle}\n\n## Laboratorio y Práctica de Código\n\n\`\`\`bash\n# Comandos de ejecución\ngit status\n\`\`\`\n\n\`\`\`python\ndef test_algoritmo():\n    print("Ejecutando pruebas...")\n\`\`\`\n`;
    } else if (template === 'blanco') {
      initialContent = `# ${noteTitle}\n\n`;
    }

    try {
      setIsSubmitting(true);
      const created = await apuntesService.createApunte({
        materiaId: materiaIdVal,
        materiaNombre: materiaNombreVal,
        evaluacionId: selectedEval?.id,
        evaluacionNombre: selectedEval?.titulo,
        titulo: noteTitle,
        tags: tags.length > 0 ? tags : ['apunte'],
        carpeta: template === 'laboratorio' ? 'Laboratorios' : template === 'formulas' ? 'Fórmulas' : 'Teoría',
        contenidoMarkdown: initialContent
      });

      // Disparar evento reactivo para sincronizar useApuntes y vistas abiertas
      window.dispatchEvent(new CustomEvent('apuntes:updated', { detail: created }));

      onSuccess(noteTitle);
      onClose();
    } catch (err) {
      console.error('Error al crear apunte:', err);
      alert('Error al crear apunte. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const templates = [
    { id: 'blanco', title: 'En Blanco', desc: 'Editor vacío y limpio para redacción libre', icon: FileText },
    { id: 'teorico', title: 'Resumen Teórico', desc: 'Objetivos, conceptos clave, diagramas ASCII', icon: BookOpen },
    { id: 'laboratorio', title: 'Laboratorio / TP', desc: 'Bloques de código, bash, logs de testing', icon: FlaskConical },
    { id: 'formulas', title: 'Fórmulas & Math', desc: 'Sintaxis KaTeX ($$), lemas y demostraciones', icon: Sigma }
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Top bar */}
        <div className={styles.modalTopBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>● RF4.1 · REPOSITORIO DE APUNTES / NUEVO DOCUMENTO</span>
            <span className={styles.tagBadge}>LaTeX Ready</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <span>ESC</span>
            <X size={14} />
          </button>
        </div>

        {/* Title */}
        <div className={styles.titleGroup}>
          <h2 className={styles.modalTitle}>Crear Nuevo Apunte Markdown</h2>
          <p className={styles.modalSub}>
            Inicializa un apunte técnico con soporte nativo de Markdown extendido, fórmulas KaTeX, tablas comparativas y fragmentos de código vinculados a tu cursada.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {/* Row 1: Materia e Instancia */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabelRow}>
                <span>Materia Vinculada *</span>
                <span style={{ color: 'var(--text-dim)' }}>Ordenada por año</span>
              </div>
              {sortedMaterias.length > 0 ? (
                <select
                  className={styles.fieldInput}
                  value={materiaId || sortedMaterias[0]?.id}
                  onChange={(e) => setMateriaId(e.target.value)}
                >
                  {aniosDisponibles.map((yr) => {
                    const matsInYear = sortedMaterias.filter(m => (m.anio || 1) === yr);
                    if (matsInYear.length === 0) return null;
                    return (
                      <optgroup key={yr} label={`${yr}° Año`}>
                        {matsInYear.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.codigo ? `${m.codigo} · ` : ''}{m.nombre} ({m.cuatrimestre})
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              ) : (
                <input
                  type="text"
                  className={styles.fieldInput}
                  value={customMateria}
                  onChange={(e) => setCustomMateria(e.target.value)}
                  placeholder="Nombre de la materia (ej: Algoritmos)"
                  required
                />
              )}
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabelRow}>
                <span>Instancia de Evaluación</span>
                <span style={{ color: filteredEvaluaciones.length > 0 ? 'var(--primary-glow)' : 'var(--text-dim)' }}>
                  {filteredEvaluaciones.length > 0
                    ? `${filteredEvaluaciones.length} disponible${filteredEvaluaciones.length > 1 ? 's' : ''}`
                    : 'Sin evaluaciones'}
                </span>
              </div>
              <select
                className={styles.fieldInput}
                value={evalId}
                onChange={(e) => setEvalId(e.target.value)}
              >
                <option value="">
                  {filteredEvaluaciones.length === 0
                    ? 'General (sin evaluaciones para esta materia)'
                    : 'General (sin evaluación asociada)'}
                </option>
                {filteredEvaluaciones.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.titulo} ({ev.tipo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Título */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabelRow}>
              <span>Título del Documento</span>
              <span style={{ color: 'var(--text-dim)' }}>
                Formato Markdown (.md)
              </span>
            </div>
            <input
              type="text"
              className={styles.fieldInput}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Resumen Unidad 1 - Fundamentos"
              required
            />
          </div>

          {/* Row 3: Plantilla de Inicio Rápido */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabelRow}>
              <span>PLANTILLA DE INICIO RÁPIDO (TEMPLATE MARKDOWN)</span>
              <span style={{ color: 'var(--text-dim)' }}>Pre-configurado</span>
            </div>
            <div className={styles.templatesGrid}>
              {templates.map(tpl => {
                const Icon = tpl.icon;
                const isSelected = template === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    className={`${styles.templateCard} ${isSelected ? styles.templateCardActive : ''}`}
                    onClick={() => setTemplate(tpl.id)}
                  >
                    <div className={styles.templateTitle}>
                      <Icon size={14} color="var(--primary)" />
                      <span>{tpl.title}</span>
                    </div>
                    <p className={styles.templateDesc}>{tpl.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 4: Etiquetas y Taxonomía */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabelRow}>
              <span>ETIQUETAS Y TAXONOMÍA (TAGS)</span>
              <span style={{ color: 'var(--text-dim)' }}>Búsqueda rápida</span>
            </div>
            <div className={styles.tagsBox}>
              {tags.map(t => (
                <span key={t} className={styles.tagPill}>
                  #{t}
                  <X size={11} style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(t)} />
                </span>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="text"
                  placeholder="Nueva etiqueta..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  style={{ border: 'none', background: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '11px', width: '100px' }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  style={{ fontSize: '10px', background: 'var(--surface-3)', border: '1px solid var(--border-hover)', color: 'var(--text-secondary)', padding: '2px 5px', borderRadius: '2px' }}
                >
                  ADD
                </button>
              </div>
            </div>
          </div>

          {/* Row 5: Sincronización & Entorno */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabelRow}>
              <span>ENTORNO DE EJECUCIÓN & SINCRONIZACIÓN</span>
            </div>
            <div className={styles.syncOptionsRow}>
              <label className={`${styles.syncBox} ${syncKatex ? styles.syncBoxActive : ''}`}>
                <input
                  type="checkbox"
                  checked={syncKatex}
                  onChange={(e) => setSyncKatex(e.target.checked)}
                  style={{ accentColor: 'var(--emerald)' }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>KaTeX / LaTeX ($$)</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '10px' }}>Renderizado matemático</div>
                </div>
              </label>

              <label className={`${styles.syncBox} ${syncPg ? styles.syncBoxActive : ''}`}>
                <input
                  type="checkbox"
                  checked={syncPg}
                  onChange={(e) => setSyncPg(e.target.checked)}
                  style={{ accentColor: 'var(--emerald)' }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>PostgreSQL Sync</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '10px' }}>Markdown en vivo (0 latency)</div>
                </div>
              </label>

              <label className={`${styles.syncBox} ${syncAnki ? styles.syncBoxActive : ''}`}>
                <input
                  type="checkbox"
                  checked={syncAnki}
                  onChange={(e) => setSyncAnki(e.target.checked)}
                  style={{ accentColor: 'var(--emerald)' }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Anki Flashcards</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '10px' }}>Extracción de tarjetas</div>
                </div>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--primary)' }}>⚡</span>
              <span>Editor con soporte Markdown, fórmulas KaTeX y bloques de código</span>
            </div>
            <div className={styles.footerActions}>
              <button type="button" className={styles.btnCancel} onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className={styles.btnSubmit}>
                <span>+ Crear y Abrir Editor</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
