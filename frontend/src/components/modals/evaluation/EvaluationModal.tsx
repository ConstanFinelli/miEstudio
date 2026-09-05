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
import { mockMaterias } from '../../../data/mockData';
import type { TipoEvaluacion } from '../../../types/academic';

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
  const [materiaId, setMateriaId] = useState(mockMaterias[0].id);
  const [titulo, setTitulo] = useState('2° Parcial (Sistemas Distribuidos y Tolerancia a Fallos)');
  const [tipo, setTipo] = useState<TipoEvaluacion>('PARCIAL');
  const [fecha, setFecha] = useState('2025-06-12');
  const [horario, setHorario] = useState('19:00 - 22:00 hs');
  const [aula, setAula] = useState('Aula 302');
  const [modalidad, setModalidad] = useState<'Presencial' | 'Virtual'>('Presencial');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess();
    onClose();
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
          <span>RF2.0 · SISTEMAS DISTRIBUIDOS / Nueva Instancia</span>
          <button className={styles.closeBtn} onClick={onClose}>
            <span>ESC</span>
            <X size={14} />
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
            <select
              className={styles.fieldInput}
              value={materiaId}
              onChange={(e) => setMateriaId(e.target.value)}
            >
              {mockMaterias.map(m => (
                <option key={m.id} value={m.id}>
                  {m.codigo} · {m.nombre} ({m.cuatrimestre} {m.anio === 3 ? '2025' : '2024'} · {m.estado})
                </option>
              ))}
            </select>
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
              placeholder="Ej: 2° Parcial (Consenso y DHT)"
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
                  type="text"
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
                  style={{ width: '90px' }}
                />
                <button
                  type="button"
                  className={`${styles.btnCancel} ${modalidad === 'Presencial' ? styles.tagBadge : ''}`}
                  onClick={() => setModalidad(modalidad === 'Presencial' ? 'Virtual' : 'Presencial')}
                  style={{ padding: '4px 8px', fontSize: '10px' }}
                >
                  {modalidad}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            <span>Tip: La ponderación impacta directamente en el cálculo de regularidad y promoción</span>
            <div className={styles.footerActions}>
              <button type="button" className={styles.btnCancel} onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className={styles.btnSubmit}>
                Guardar Evaluación
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluationModal;
