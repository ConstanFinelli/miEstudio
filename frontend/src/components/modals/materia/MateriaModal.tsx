import React, { useState, useEffect } from 'react';
import styles from './MateriaModal.module.css';
import { X, BookOpen, Plus, Award, Save } from 'lucide-react';
import type { Materia, EstadoMateria } from '../../../types/academic';
import { materiasService } from '../../../services';

interface MateriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (materia: Materia) => void;
  materiaToEdit?: Materia | null;
}

const PRESET_COLORS = [
  '#3b82f6', // Cobalt Blue
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
];

export const MateriaModal: React.FC<MateriaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  materiaToEdit
}) => {
  const isEditing = Boolean(materiaToEdit);

  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [anio, setAnio] = useState<number>(3);
  const [cuatrimestre, setCuatrimestre] = useState<'1C' | '2C' | 'Anual'>('1C');
  const [estado, setEstado] = useState<EstadoMateria>('CURSANDO');
  const [color, setColor] = useState('#3b82f6');
  const [comision, setComision] = useState('');
  const [modalidad, setModalidad] = useState<'Presencial' | 'Virtual' | 'Híbrida'>('Presencial');
  const [profesorTitular, setProfesorTitular] = useState('');
  const [profesorJtp, setProfesorJtp] = useState('');

  // Reglas de acreditación configurables
  const [permitePromocion, setPermitePromocion] = useState(true);
  const [minPromedio, setMinPromedio] = useState(8.0);
  const [minParcial, setMinParcial] = useState(7.0);
  const [minNotaRegular, setMinNotaRegular] = useState(4.0);
  const [minAsistencia, setMinAsistencia] = useState(75);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (materiaToEdit) {
      setNombre(materiaToEdit.nombre || '');
      setCodigo(materiaToEdit.codigo || '');
      setAnio(materiaToEdit.anio || 3);
      setCuatrimestre(materiaToEdit.cuatrimestre || '1C');
      setEstado(materiaToEdit.estado || 'CURSANDO');
      setColor(materiaToEdit.color || '#3b82f6');
      setComision(materiaToEdit.comision || '');
      setModalidad(materiaToEdit.modalidad || 'Presencial');
      setProfesorTitular(materiaToEdit.profesores?.titular || '');
      setProfesorJtp(materiaToEdit.profesores?.jtp || '');
      setPermitePromocion(materiaToEdit.reglasAcreditacion?.promocion?.permitePromocion ?? true);
      setMinPromedio(materiaToEdit.reglasAcreditacion?.promocion?.minPromedio ?? 8.0);
      setMinParcial(materiaToEdit.reglasAcreditacion?.promocion?.minParcial ?? 7.0);
      setMinNotaRegular(materiaToEdit.reglasAcreditacion?.regularidad?.minNota ?? 4.0);
      setMinAsistencia(materiaToEdit.reglasAcreditacion?.regularidad?.minAsistencia ?? 75);
    } else {
      setNombre('');
      setCodigo('');
      setAnio(3);
      setCuatrimestre('1C');
      setEstado('CURSANDO');
      setColor('#3b82f6');
      setComision('');
      setModalidad('Presencial');
      setProfesorTitular('');
      setProfesorJtp('');
      setPermitePromocion(true);
      setMinPromedio(8.0);
      setMinParcial(7.0);
      setMinNotaRegular(4.0);
      setMinAsistencia(75);
    }
  }, [materiaToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    try {
      setIsSubmitting(true);
      const payload: Partial<Materia> = {
        nombre: nombre.trim(),
        codigo: codigo.trim() || `MAT-${Math.floor(100 + Math.random() * 900)}`,
        anio,
        cuatrimestre,
        estado,
        color,
        comision: comision.trim() || 'Comisión Única',
        modalidad,
        profesores: {
          titular: profesorTitular.trim(),
          jtp: profesorJtp.trim()
        },
        reglasAcreditacion: {
          promocion: {
            permitePromocion,
            minPromedio: permitePromocion ? minPromedio : 0,
            minParcial: permitePromocion ? minParcial : 0,
            permiteRecuperatorio: false,
            minAsistencia: 80,
            descripcion: permitePromocion
              ? `Promedio ≥ ${minPromedio.toFixed(1)}, parciales ≥ ${minParcial.toFixed(1)} sin recuperatorio.`
              : 'Sin promoción directa. Examen final obligatorio para acreditar la materia.'
          },
          regularidad: {
            minNota: minNotaRegular,
            minAsistencia,
            permiteRecuperatorio: true,
            descripcion: `Evaluaciones ≥ ${minNotaRegular.toFixed(1)} y ${minAsistencia}% de asistencia mínima.`
          }
        }
      };

      let result: Materia;
      if (materiaToEdit) {
        result = await materiasService.updateMateria(materiaToEdit.id, payload);
      } else {
        result = await materiasService.createMateria({
          ...payload,
          promedio: 0
        });
      }

      onSuccess(result);
      onClose();
    } catch (err) {
      console.error('Error al guardar materia:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Top bar */}
        <div className={styles.modalTopBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.tagBadge}>CURSADA</span>
            <span>{isEditing ? 'EDITAR MATERIA' : 'NUEVA MATERIA'}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Cerrar (Esc)">
            <X size={14} />
            <span>ESC</span>
          </button>
        </div>

        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} color="var(--primary)" />
            <h2 className={styles.modalTitle}>
              {isEditing ? `Editar: ${materiaToEdit?.nombre}` : 'Registrar Asignatura / Cursada'}
            </h2>
          </div>
          <p className={styles.modalSub}>
            {isEditing
              ? 'Modificá los datos académicos, profesores y reglas de acreditación de la materia.'
              : 'Ingresá los datos académicos para comenzar a registrar notas, fechas de examen, apuntes y bibliografía.'}
          </p>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Nombre y Código */}
          <div className={styles.row2}>
            <div className={styles.formGroup} style={{ gridColumn: 'span 1' }}>
              <label className={styles.label}>Nombre de la Materia *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ej: Sistemas Distribuidos"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className={styles.formGroup} style={{ gridColumn: 'span 1' }}>
              <label className={styles.label}>Código de Cátedra</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ej: 75.08 o SIS-304"
                value={codigo}
                onChange={e => setCodigo(e.target.value)}
              />
            </div>
          </div>

          {/* Año y Cuatrimestre */}
          <div className={styles.row2}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Año de la Carrera</label>
              <select
                className={styles.select}
                value={anio}
                onChange={e => setAnio(Number(e.target.value))}
              >
                <option value={1}>1° Año</option>
                <option value={2}>2° Año</option>
                <option value={3}>3° Año</option>
                <option value={4}>4° Año</option>
                <option value={5}>5° Año</option>
                <option value={6}>6° Año</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Cuatrimestre</label>
              <select
                className={styles.select}
                value={cuatrimestre}
                onChange={e => setCuatrimestre(e.target.value as '1C' | '2C' | 'Anual')}
              >
                <option value="1C">1° Cuatrimestre</option>
                <option value="2C">2° Cuatrimestre</option>
                <option value="Anual">Anual</option>
              </select>
            </div>
          </div>

          {/* Estado y Modalidad */}
          <div className={styles.row2}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Estado de la Cursada</label>
              <select
                className={styles.select}
                value={estado}
                onChange={e => setEstado(e.target.value as EstadoMateria)}
              >
                <option value="CURSANDO">Cursando actualmente</option>
                <option value="REGULAR">Regularizada</option>
                <option value="APROBADA">Aprobada (con Final)</option>
                <option value="PROMOCIONADA">Promocionada directa</option>
                <option value="LIBRE">Libre</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Modalidad de Dictado</label>
              <select
                className={styles.select}
                value={modalidad}
                onChange={e => setModalidad(e.target.value as 'Presencial' | 'Virtual' | 'Híbrida')}
              >
                <option value="Presencial">Presencial</option>
                <option value="Virtual">Virtual</option>
                <option value="Híbrida">Híbrida</option>
              </select>
            </div>
          </div>

          {/* Comisión y Docentes */}
          <div className={styles.row3}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Comisión / Turno</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ej: K3051 o Noche"
                value={comision}
                onChange={e => setComision(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Profesor Titular</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ej: Dr. García"
                value={profesorTitular}
                onChange={e => setProfesorTitular(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>JTP / Ayudante</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ej: Ing. Martínez"
                value={profesorJtp}
                onChange={e => setProfesorJtp(e.target.value)}
              />
            </div>
          </div>

          {/* Configuración de Reglas de Acreditación */}
          <div className={styles.rulesSection}>
            <div className={styles.rulesSectionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={14} color="var(--primary)" />
                <span>Reglas de Acreditación de Cursada</span>
              </div>
              <button
                type="button"
                className={`${styles.promoToggleBtn} ${permitePromocion ? styles.promoToggleBtnActive : ''}`}
                onClick={() => setPermitePromocion(!permitePromocion)}
              >
                {permitePromocion ? '✓ Admite Promoción Directa' : '🚫 Sin Promoción (Final Obligatorio)'}
              </button>
            </div>

            {permitePromocion ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label} style={{ fontSize: '10px' }}>Promedio Mínimo para Promover</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="10"
                    className={styles.input}
                    value={minPromedio}
                    onChange={e => setMinPromedio(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} style={{ fontSize: '10px' }}>Nota Mínima por Parcial</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="10"
                    className={styles.input}
                    value={minParcial}
                    onChange={e => setMinParcial(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--amber)', backgroundColor: 'var(--amber-alpha)', padding: '6px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--amber-border)' }}>
                Esta materia requerirá obligatoriamente aprobación de examen final tras regularizar.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className={styles.formGroup}>
                <label className={styles.label} style={{ fontSize: '10px' }}>Nota Mín. Regularidad (Parciales)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  className={styles.input}
                  value={minNotaRegular}
                  onChange={e => setMinNotaRegular(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} style={{ fontSize: '10px' }}>Asistencia Mínima Requerida (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className={styles.input}
                  value={minAsistencia}
                  onChange={e => setMinAsistencia(parseInt(e.target.value, 10) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Color de Identificación */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Color Identificador de la Materia</label>
            <div className={styles.colorPickerRow}>
              {PRESET_COLORS.map(c => (
                <div
                  key={c}
                  className={`${styles.colorDot} ${color === c ? styles.colorDotSelected : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actionsRow}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={!nombre.trim() || isSubmitting}
            >
              {isEditing ? <Save size={14} /> : <Plus size={14} />}
              <span>
                {isSubmitting
                  ? (isEditing ? 'Guardando...' : 'Registrando...')
                  : (isEditing ? 'Guardar Cambios' : 'Registrar Materia')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MateriaModal;
