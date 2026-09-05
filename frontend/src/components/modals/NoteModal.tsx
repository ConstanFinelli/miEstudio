import React, { useState } from 'react';
import styles from './Modals.module.css';
import {
  X,
  FileText,
  BookOpen,
  FlaskConical,
  Sigma
} from 'lucide-react';
import { mockMaterias, mockEvaluaciones } from '../../data/mockData';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newNoteTitle: string) => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [materiaId, setMateriaId] = useState(mockMaterias[0].id);
  const [evalId, setEvalId] = useState(mockEvaluaciones[0].id);
  const [titulo, setTitulo] = useState('Arquitectura de Replicación de Máquina de Estados (RSM) y Raft');
  const [template, setTemplate] = useState('teorico');
  const [tags, setTags] = useState(['distribuidos', 'parcial1', 'raft-consenso']);
  const [newTagInput, setNewTagInput] = useState('');
  const [syncKatex, setSyncKatex] = useState(true);
  const [syncPg, setSyncPg] = useState(true);
  const [syncAnki, setSyncAnki] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(titulo);
    onClose();
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
                <span style={{ color: 'var(--text-dim)' }}>Obligatorio</span>
              </div>
              <select
                className={styles.fieldInput}
                value={materiaId}
                onChange={(e) => setMateriaId(e.target.value)}
              >
                {mockMaterias.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.codigo} · {m.nombre} ({m.cuatrimestre} {m.anio === 3 ? '2025' : '2024'})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabelRow}>
                <span>Instancia de Evaluación</span>
                <span style={{ color: 'var(--primary-glow)' }}>RF2 / RF4</span>
              </div>
              <select
                className={styles.fieldInput}
                value={evalId}
                onChange={(e) => setEvalId(e.target.value)}
              >
                {mockEvaluaciones.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.titulo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Título y Slug */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabelRow}>
              <span>Título del Documento</span>
              <span style={{ color: 'var(--text-dim)' }}>
                Slug autogenerado: /sis-304/apunte-raft.md
              </span>
            </div>
            <input
              type="text"
              className={styles.fieldInput}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Consenso Distribuido Raft"
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
              <span>Tip: Presiona <strong>⌘ + Enter</strong> para inicializar</span>
            </div>
            <div className={styles.footerActions}>
              <button type="button" className={styles.btnCancel} onClick={onClose}>
                Cancelar (Esc)
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
