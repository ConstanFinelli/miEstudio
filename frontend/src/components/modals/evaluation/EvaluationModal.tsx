import React, { useState } from 'react';
import styles from './EvaluationModal.module.css';
import {
  X,
  FileText,
  Award,
  Users,
  FlaskConical,
  HelpCircle
} from 'lucide-react';
import type { TipoEvaluacion } from '../../../types/academic';
import { useMaterias } from '../../../hooks';
import { evaluacionesService } from '../../../services';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { materias } = useMaterias();
  const [filterYear, setFilterYear] = useState<number | 'TODOS'>('TODOS');
  const [filterCuatri, setFilterCuatri] = useState<'TODOS' | '1C' | '2C' | 'Anual'>('TODOS');
  const [materiaId, setMateriaId] = useState(materias[0]?.id || '');
  const [customMateria, setCustomMateria] = useState('');
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<TipoEvaluacion>('PARCIAL');
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [horario, setHorario] = useState('19:00');
  const [aula, setAula] = useState('');
  const [modalidad, setModalidad] = useState<'Presencial' | 'Virtual'>('Presencial');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const filteredMaterias = materias.filter(m => {
    if (filterYear !== 'TODOS' && m.anio !== filterYear) return false;
    if (filterCuatri !== 'TODOS' && m.cuatrimestre !== filterCuatri) return false;
    return true;
  });

  const selectedMat = materias.find(m => m.id === (materiaId || filteredMaterias[0]?.id || materias[0]?.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const materiaNombre = selectedMat?.nombre || customMateria.trim() || 'Materia General';
      const materiaCodigo = selectedMat?.codigo || 'GEN';

      await evaluacionesService.createEvaluacion({
        materiaId: selectedMat?.id || `mat-${Date.now()}`,
        materiaNombre,
        materiaCodigo,
        titulo: titulo.trim(),
        tipo,
        fecha,
        horario: horario.trim() || '19:00',
        aula: aula.trim() || 'A confirmar',
        modalidad,
        peso: 35
      });
      setTitulo('');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al registrar evaluacion:', err);
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
            <span className={styles.tagBadge}>EVALUACIÓN</span>
            <span>{selectedMat ? selectedMat.nombre.toUpperCase() : 'NUEVA INSTANCIA'}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Cerrar (Esc)">
            <X size={14} />
            <span>ESC</span>
          </button>
        </div>

        {/* Title */}
        <div className={styles.titleGroup}>
          <h2 className={styles.modalTitle}>Registrar Nueva Instancia de Evaluación</h2>
          <p className={styles.modalSub}>
            Configura tipo de examen, ponderación en la nota final y reglas de aprobación académica.
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
                value={materiaId || filteredMaterias[0]?.id}
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
              <span>3. Tipo de Evaluación (RF2.2)</span>
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
                    onClick={() => setTipo(t.id)}
                  >
                    <Icon size={16} />
                    <span>{t.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Fecha y Horario */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabelRow}>
                <span>Fecha de Mesa / Examen</span>
              </div>
              <input
                type="date"
                className={styles.fieldInput}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabelRow}>
                <span>Horario y Modalidad</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="time"
                  className={styles.fieldInput}
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  required
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
                {isSubmitting ? 'Guardando...' : 'Guardar Evaluación'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluationModal;
