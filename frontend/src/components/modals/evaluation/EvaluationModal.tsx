import React, { useState, useEffect } from 'react';
import styles from './EvaluationModal.module.css';
import {
  X,
  FileText,
  Award,
  Users,
  FlaskConical,
  HelpCircle
} from 'lucide-react';
import type { TipoEvaluacion, InstanciaEvaluacion } from '../../../types/academic';
import { useMaterias } from '../../../hooks';
import { evaluacionesService } from '../../../services';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (saved?: InstanciaEvaluacion) => void;
  evaluationToEdit?: InstanciaEvaluacion | null;
  initialMateriaId?: string;
}

const getTodayLocal = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  evaluationToEdit,
  initialMateriaId
}) => {
  const { materias } = useMaterias();
  const [filterYear, setFilterYear] = useState<number | 'TODOS'>('TODOS');
  const [filterCuatri, setFilterCuatri] = useState<'TODOS' | '1C' | '2C' | 'Anual'>('TODOS');
  const [materiaId, setMateriaId] = useState('');
  const [customMateria, setCustomMateria] = useState('');
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<TipoEvaluacion>('PARCIAL');
  const [sinFecha, setSinFecha] = useState(false);
  const [fecha, setFecha] = useState(getTodayLocal);
  const [horario, setHorario] = useState('19:00');
  const [aula, setAula] = useState('');
  const [modalidad, setModalidad] = useState<'Presencial' | 'Virtual'>('Presencial');
  const [peso, setPeso] = useState<number | string>(100);
  const [esAprobatorio, setEsAprobatorio] = useState(true);
  const [nota, setNota] = useState('');
  const [temarioText, setTemarioText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredMaterias = materias.filter(m => {
    if (filterYear !== 'TODOS' && m.anio !== filterYear) return false;
    if (filterCuatri !== 'TODOS' && m.cuatrimestre !== filterCuatri) return false;
    return true;
  });

  // Prefill or reset state on open / evaluationToEdit changes
  useEffect(() => {
    if (!isOpen) return;

    if (evaluationToEdit) {
      setMateriaId(evaluationToEdit.materiaId || '');
      setTitulo(evaluationToEdit.titulo || '');
      setTipo(evaluationToEdit.tipo || 'PARCIAL');
      const hasDate = Boolean(evaluationToEdit.fecha);
      setSinFecha(!hasDate);
      const d = evaluationToEdit.fecha ? evaluationToEdit.fecha.split('T')[0] : '';
      setFecha(d || getTodayLocal());
      setHorario(evaluationToEdit.horario ? evaluationToEdit.horario.replace(' hs', '').replace('hs', '') : '19:00');
      setAula(evaluationToEdit.aula || '');
      setModalidad(evaluationToEdit.modalidad || 'Presencial');
      setPeso(evaluationToEdit.peso ?? 100);
      setEsAprobatorio(evaluationToEdit.esAprobatorio ?? true);
      setNota(
        evaluationToEdit.nota !== null && evaluationToEdit.nota !== undefined
          ? String(evaluationToEdit.nota)
          : ''
      );
      setTemarioText(
        Array.isArray(evaluationToEdit.temario)
          ? evaluationToEdit.temario.join(', ')
          : ''
      );
    } else {
      if (initialMateriaId) {
        setMateriaId(initialMateriaId);
      } else if (materias.length > 0 && !materiaId) {
        setMateriaId(materias[0].id);
      }
      setTitulo('');
      setTipo('PARCIAL');
      setSinFecha(false);
      setFecha(getTodayLocal());
      setHorario('19:00');
      setAula('');
      setModalidad('Presencial');
      setPeso(100);
      setEsAprobatorio(true);
      setNota('');
      setTemarioText('');
    }
  }, [isOpen, evaluationToEdit, initialMateriaId]);

  // Sync initial materiaId when materias load
  useEffect(() => {
    if (materias.length > 0 && !materiaId && !evaluationToEdit) {
      setMateriaId(materias[0].id);
    }
  }, [materias, materiaId, evaluationToEdit]);

  // Sync materiaId if current selection is outside filtered subset (only for new evaluations)
  useEffect(() => {
    if (!evaluationToEdit && filteredMaterias.length > 0) {
      if (!filteredMaterias.some(m => m.id === materiaId)) {
        setMateriaId(filteredMaterias[0].id);
      }
    }
  }, [filterYear, filterCuatri, evaluationToEdit]);

  if (!isOpen) return null;

  const selectedMat = materias.find(m => m.id === materiaId) || filteredMaterias[0] || materias[0];

  const handleTypeChange = (newTipo: TipoEvaluacion) => {
    setTipo(newTipo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const materiaNombre = selectedMat?.nombre || customMateria.trim() || 'Materia General';
      const materiaCodigo = selectedMat?.codigo || 'GEN';
      const parsedNota = nota.trim() !== '' && !isNaN(Number(nota)) ? Number(nota) : null;
      const parsedTemario = temarioText.trim()
        ? temarioText.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      const finalFecha = sinFecha ? null : (fecha.trim() || null);

      if (evaluationToEdit) {
        const updated = await evaluacionesService.updateEvaluacion(evaluationToEdit.id, {
          materiaId: selectedMat?.id || evaluationToEdit.materiaId,
          materiaNombre,
          materiaCodigo,
          titulo: titulo.trim(),
          tipo,
          fecha: finalFecha,
          horario: sinFecha ? '' : (horario.trim() || '19:00'),
          aula: aula.trim() || 'A confirmar',
          modalidad,
          peso: Number(peso) > 0 ? Number(peso) : 100,
          esAprobatorio,
          nota: parsedNota,
          temario: parsedTemario
        });

        window.dispatchEvent(new CustomEvent('evaluaciones:updated', { detail: updated }));
        onSuccess(updated);
        onClose();
      } else {
        const created = await evaluacionesService.createEvaluacion({
          materiaId: selectedMat?.id || (customMateria ? `mat-${Date.now()}` : 'mat-gen'),
          materiaNombre,
          materiaCodigo,
          titulo: titulo.trim(),
          tipo,
          fecha: finalFecha,
          horario: sinFecha ? '' : (horario.trim() || '19:00'),
          aula: aula.trim() || 'A confirmar',
          modalidad,
          peso: Number(peso) > 0 ? Number(peso) : 100,
          esAprobatorio,
          nota: parsedNota,
          temario: parsedTemario
        });

        window.dispatchEvent(new CustomEvent('evaluaciones:updated', { detail: created }));
        setTitulo('');
        setNota('');
        setTemarioText('');
        setAula('');
        onSuccess(created);
        onClose();
      }
    } catch (err) {
      console.error('Error al guardar evaluacion:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const evalTypes: { id: TipoEvaluacion; label: string; icon: any }[] = [
    { id: 'PARCIAL', label: 'Parcial', icon: FileText },
    { id: 'FINAL', label: 'Final', icon: Award },
    { id: 'TP', label: 'TP Grupal', icon: Users },
    { id: 'LABORATORIO', label: 'Laboratorio', icon: FlaskConical },
    { id: 'QUIZ', label: 'Quiz / Entrega', icon: HelpCircle }
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Top bar */}
        <div className={styles.modalTopBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.tagBadge}>
              {evaluationToEdit ? 'EDITAR EVALUACIÓN' : 'EVALUACIÓN'}
            </span>
            <span>{selectedMat ? selectedMat.nombre.toUpperCase() : 'NUEVA INSTANCIA'}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Cerrar (Esc)">
            <X size={14} />
            <span>ESC</span>
          </button>
        </div>

        {/* Title */}
        <div className={styles.titleGroup}>
          <h2 className={styles.modalTitle}>
            {evaluationToEdit ? 'Editar Instancia de Evaluación' : 'Registrar Nueva Instancia de Evaluación'}
          </h2>
          <p className={styles.modalSub}>
            {evaluationToEdit
              ? 'Modifica la fecha, ponderación, nota o detalles de esta evaluación.'
              : 'Configura tipo de examen, fecha, horario, ponderación y requisitos de acreditación.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {/* 1. Materia Vinculada */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabelRow}>
              <span>1. Materia Vinculada</span>
              <span style={{ color: 'var(--text-dim)' }}>OBLIGATORIO</span>
            </div>

            {/* Quick Year and Cuatri Filter */}
            {materias.length > 0 && (
              <div className={styles.miniFilterRow}>
                <div className={styles.miniPillGroup}>
                  <button
                    type="button"
                    className={`${styles.miniPillBtn} ${filterYear === 'TODOS' ? styles.miniPillBtnActive : ''}`}
                    onClick={() => setFilterYear('TODOS')}
                  >
                    Todos
                  </button>
                  {[1, 2, 3, 4, 5, 6].map(yr => (
                    <button
                      key={yr}
                      type="button"
                      className={`${styles.miniPillBtn} ${filterYear === yr ? styles.miniPillBtnActive : ''}`}
                      onClick={() => setFilterYear(yr)}
                    >
                      {yr}°
                    </button>
                  ))}
                </div>

                <div className={styles.miniPillGroup}>
                  <button
                    type="button"
                    className={`${styles.miniPillBtn} ${filterCuatri === 'TODOS' ? styles.miniPillBtnActive : ''}`}
                    onClick={() => setFilterCuatri('TODOS')}
                  >
                    Todos
                  </button>
                  {(['1C', '2C', 'Anual'] as const).map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`${styles.miniPillBtn} ${filterCuatri === c ? styles.miniPillBtnActive : ''}`}
                      onClick={() => setFilterCuatri(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredMaterias.length > 0 ? (
              <select
                className={styles.fieldInput}
                value={materiaId || filteredMaterias[0]?.id || ''}
                onChange={(e) => setMateriaId(e.target.value)}
              >
                {[1, 2, 3, 4, 5, 6].map(yr => {
                  const matsInYear = filteredMaterias.filter(m => m.anio === yr);
                  if (matsInYear.length === 0) return null;
                  return (
                    <optgroup key={yr} label={`${yr}° Año de la Carrera`}>
                      {matsInYear.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.codigo ? `${m.codigo} · ` : ''}{m.nombre} ({m.cuatrimestre})
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            ) : materias.length > 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--amber)', padding: '6px 0' }}>
                No hay materias en {filterYear !== 'TODOS' ? `${filterYear}° Año` : ''} {filterCuatri !== 'TODOS' ? `(${filterCuatri})` : ''}.
                <button
                  type="button"
                  style={{ marginLeft: '6px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => { setFilterYear('TODOS'); setFilterCuatri('TODOS'); }}
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <input
                type="text"
                className={styles.fieldInput}
                value={customMateria}
                onChange={(e) => setCustomMateria(e.target.value)}
                placeholder="Nombre de la materia (ej: Sistemas Distribuidos)"
                required
              />
            )}
          </div>

          {/* 2. Título */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabelRow}>
              <span>2. Nombre o Título de la Instancia</span>
              <span style={{ color: 'var(--text-dim)' }}>DESCRIPTIVO</span>
            </div>
            <input
              type="text"
              className={styles.fieldInput}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: 1° Parcial Teórico / Entrega TP1"
              required
            />
          </div>

          {/* 3. Tipo de Evaluación */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabelRow}>
              <span>3. Tipo de Evaluación</span>
              <span style={{ color: 'var(--primary-glow)' }}>Tipo: {tipo}</span>
            </div>
            <div className={styles.typeCardsRow}>
              {evalTypes.map(t => {
                const Icon = t.icon;
                const isSelected = tipo === t.id;
                return (
                  <div
                    key={t.id}
                    className={`${styles.typeCard} ${isSelected ? styles.typeCardActive : ''}`}
                    onClick={() => handleTypeChange(t.id)}
                  >
                    <Icon size={16} />
                    <span>{t.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Fecha y Horario / Modalidad */}
          <div className={styles.fieldGroup}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <div className={styles.fieldLabelRow} style={{ margin: 0 }}>
                <span>4. Fecha y Horario de la Instancia</span>
              </div>
              <label className={styles.checkboxRow} style={{ margin: 0, fontSize: '12px' }}>
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={sinFecha}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSinFecha(checked);
                    if (!checked && !fecha) {
                      setFecha(getTodayLocal());
                    }
                  }}
                />
                <span style={{ color: sinFecha ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: sinFecha ? 600 : 400 }}>
                  Sin fecha exacta (evaluación ya rendida)
                </span>
              </label>
            </div>

            {sinFecha ? (
              <div style={{
                padding: '10px 14px',
                backgroundColor: 'var(--surface-2)',
                borderRadius: 'var(--radius-xs)',
                border: '1px dashed var(--border-subtle)',
                fontSize: '12px',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '15px' }}>ℹ️</span>
                <span>Esta evaluación se registrará como instancia previa sin fecha asignada (no ocupará lugar en el calendario ni en próximas evaluaciones).</span>
              </div>
            ) : (
              <div className={styles.grid2}>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldLabelRow}>
                    <span>Fecha de Mesa / Examen</span>
                    <span style={{ color: 'var(--text-dim)' }}>OBLIGATORIO</span>
                  </div>
                  <input
                    type="date"
                    className={styles.fieldInput}
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required={!sinFecha}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <div className={styles.fieldLabelRow}>
                    <span>Horario, Aula y Modalidad</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="time"
                      className={styles.fieldInput}
                      value={horario}
                      onChange={(e) => setHorario(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      className={styles.fieldInput}
                      value={aula}
                      onChange={(e) => setAula(e.target.value)}
                      placeholder="Aula"
                      style={{ width: '90px' }}
                    />
                    <button
                      type="button"
                      className={`${styles.modalidadToggle} ${modalidad === 'Presencial' ? styles.modalidadToggleActive : ''}`}
                      onClick={() => setModalidad(modalidad === 'Presencial' ? 'Virtual' : 'Presencial')}
                      title="Alternar modalidad presencial / virtual"
                    >
                      {modalidad}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. Ponderación & Condición Aprobatoria */}
          <div className={styles.grid2}>
            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabelRow}>
                <span>Ponderación / Peso en Nota Final</span>
                <span style={{ color: 'var(--text-dim)' }}>1 a 100%</span>
              </div>
              <div className={styles.inputWithSuffix}>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className={styles.fieldInput}
                  value={peso}
                  onChange={(e) => setPeso(e.target.value === '' ? '' : e.target.value)}
                  required
                />
                <span className={styles.inputSuffix}>%</span>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabelRow}>
                <span>Calificación (Opcional)</span>
                <span style={{ color: 'var(--text-dim)' }}>1 a 10</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="1"
                max="10"
                className={styles.fieldInput}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Dejar vacío si está pendiente"
              />
            </div>
          </div>

          {/* 6. Temario y Requisito Aprobatorio */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabelRow}>
              <span>Temario o Unidades a Evaluar (Opcional)</span>
              <span style={{ color: 'var(--text-dim)' }}>SEPARADO POR COMAS</span>
            </div>
            <input
              type="text"
              className={styles.fieldInput}
              value={temarioText}
              onChange={(e) => setTemarioText(e.target.value)}
              placeholder="Ej: Unidad 1, Matrices y Espacios Vectoriales, Diagonalización"
            />
          </div>

          <div style={{ padding: '4px 0' }}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                className={styles.checkboxInput}
                checked={esAprobatorio}
                onChange={(e) => setEsAprobatorio(e.target.checked)}
              />
              <span>Instancia obligatoria para aprobar o regularizar la cursada</span>
            </label>
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            <span>Tip: La ponderación impacta en el cálculo de regularidad y promoción</span>
            <div className={styles.footerActions}>
              <button type="button" className={styles.btnCancel} onClick={onClose}>
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.btnSubmit}
                disabled={!titulo.trim() || isSubmitting}
              >
                {isSubmitting
                  ? 'Guardando...'
                  : evaluationToEdit
                  ? 'Guardar Cambios'
                  : 'Guardar Evaluación'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluationModal;
