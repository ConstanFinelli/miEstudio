import React, { useState, useEffect } from 'react';
import styles from './AccreditationRulesModal.module.css';
import { X, CheckCircle, AlertCircle, Award, Check, SlidersHorizontal } from 'lucide-react';
import type { Materia } from '../../../types/academic';

interface AccreditationRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  materia: Materia;
  onSave: (updatedReglas: Materia['reglasAcreditacion']) => Promise<void>;
}

export const AccreditationRulesModal: React.FC<AccreditationRulesModalProps> = ({
  isOpen,
  onClose,
  materia,
  onSave
}) => {
  const currentReglas = materia?.reglasAcreditacion;

  // Promoción
  const [permitePromocion, setPermitePromocion] = useState<boolean>(
    currentReglas?.promocion?.permitePromocion ?? true
  );
  const [minPromedio, setMinPromedio] = useState<number>(
    currentReglas?.promocion?.minPromedio ?? 8.0
  );
  const [minParcialPromocion, setMinParcialPromocion] = useState<number>(
    currentReglas?.promocion?.minParcial ?? 7.0
  );
  const [permiteRecupPromocion, setPermiteRecupPromocion] = useState<boolean>(
    currentReglas?.promocion?.permiteRecuperatorio ?? false
  );
  const [minAsistenciaPromocion, setMinAsistenciaPromocion] = useState<number>(
    currentReglas?.promocion?.minAsistencia ?? 80
  );
  const [descripcionPromocion, setDescripcionPromocion] = useState<string>(
    currentReglas?.promocion?.descripcion || ''
  );

  // Regularidad
  const [minNotaRegularidad, setMinNotaRegularidad] = useState<number>(
    currentReglas?.regularidad?.minNota ?? 4.0
  );
  const [minAsistenciaRegularidad, setMinAsistenciaRegularidad] = useState<number>(
    currentReglas?.regularidad?.minAsistencia ?? 75
  );
  const [permiteRecupRegularidad, setPermiteRecupRegularidad] = useState<boolean>(
    currentReglas?.regularidad?.permiteRecuperatorio ?? true
  );
  const [descripcionRegularidad, setDescripcionRegularidad] = useState<string>(
    currentReglas?.regularidad?.descripcion || ''
  );

  const [isSaving, setIsSaving] = useState(false);

  // Sync state when materia or isOpen changes
  useEffect(() => {
    if (materia?.reglasAcreditacion) {
      const p = materia.reglasAcreditacion.promocion;
      const r = materia.reglasAcreditacion.regularidad;
      setPermitePromocion(p.permitePromocion ?? true);
      setMinPromedio(p.minPromedio ?? 8.0);
      setMinParcialPromocion(p.minParcial ?? 7.0);
      setPermiteRecupPromocion(p.permiteRecuperatorio ?? false);
      setMinAsistenciaPromocion(p.minAsistencia ?? 80);
      setDescripcionPromocion(p.descripcion || '');

      setMinNotaRegularidad(r.minNota ?? 4.0);
      setMinAsistenciaRegularidad(r.minAsistencia ?? 75);
      setPermiteRecupRegularidad(r.permiteRecuperatorio ?? true);
      setDescripcionRegularidad(r.descripcion || '');
    }
  }, [materia, isOpen]);

  // Auto-generate descriptions if default/empty
  const generatePromocionDesc = (permite: boolean, avg: number, minP: number, recup: boolean, asist: number) => {
    if (!permite) {
      return 'Sin promoción directa. La materia se aprueba únicamente mediante examen final obligatorio.';
    }
    const recupStr = recup ? 'permite recuperatorio' : 'sin recuperatorio';
    return `Promedio ≥ ${avg.toFixed(1)}, notas parciales ≥ ${minP.toFixed(1)}, ${recupStr} y ${asist}% de asistencia.`;
  };

  const generateRegularidadDesc = (nota: number, recup: boolean, asist: number) => {
    const recupStr = recup ? 'permite recuperatorio' : 'sin recuperatorio';
    return `Todas las evaluaciones ≥ ${nota.toFixed(1)} (${recupStr}) y ${asist}% de asistencia mínima.`;
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const descPromo = descripcionPromocion.trim() || generatePromocionDesc(
        permitePromocion,
        minPromedio,
        minParcialPromocion,
        permiteRecupPromocion,
        minAsistenciaPromocion
      );
      const descReg = descripcionRegularidad.trim() || generateRegularidadDesc(
        minNotaRegularidad,
        permiteRecupRegularidad,
        minAsistenciaRegularidad
      );

      await onSave({
        promocion: {
          permitePromocion,
          minPromedio: permitePromocion ? minPromedio : 0,
          minParcial: permitePromocion ? minParcialPromocion : 0,
          permiteRecuperatorio: permitePromocion ? permiteRecupPromocion : false,
          minAsistencia: permitePromocion ? minAsistenciaPromocion : 0,
          descripcion: descPromo
        },
        regularidad: {
          minNota: minNotaRegularidad,
          minAsistencia: minAsistenciaRegularidad,
          permiteRecuperatorio: permiteRecupRegularidad,
          descripcion: descReg
        }
      });
      onClose();
    } catch (err) {
      console.error('Error al guardar reglas:', err);
      alert('Ocurrió un error al guardar las reglas de acreditación.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.tagBadge}>ACREDITACIÓN</span>
            <span>CONFIGURACIÓN DE CONDICIONES</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Cerrar (Esc)">
            <X size={14} />
            <span>ESC</span>
          </button>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleRow}>
            <SlidersHorizontal size={18} color="var(--primary)" />
            <h2 className={styles.title}>Reglas de Acreditación</h2>
          </div>
          <p className={styles.subtitle}>
            Definí los criterios de promoción directa y regularidad aplicables a esta asignatura.
          </p>
          <div className={styles.materiaBadge}>
            {materia.codigo ? `${materia.codigo} · ` : ''}{materia.nombre} ({materia.anio}° Año · {materia.cuatrimestre})
          </div>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* SECCIÓN 1: PROMOCIÓN DIRECTA */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <Award size={16} color={permitePromocion ? 'var(--emerald)' : 'var(--amber)'} />
                <span>Régimen de Promoción Directa</span>
              </div>
              <div
                className={styles.toggleWrapper}
                onClick={() => {
                  const next = !permitePromocion;
                  setPermitePromocion(next);
                  setDescripcionPromocion(generatePromocionDesc(
                    next,
                    minPromedio,
                    minParcialPromocion,
                    permiteRecupPromocion,
                    minAsistenciaPromocion
                  ));
                }}
              >
                <span className={styles.toggleLabel}>
                  {permitePromocion ? 'Promocionable' : 'No Promocionable'}
                </span>
                <div className={`${styles.switch} ${permitePromocion ? styles.switchActive : ''}`}>
                  <div className={`${styles.switchSlider} ${permitePromocion ? styles.switchSliderActive : ''}`} />
                </div>
              </div>
            </div>

            {!permitePromocion ? (
              <div className={styles.disabledBanner}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div className={styles.disabledBannerText}>
                    <strong>Esta materia no admite Promoción Directa.</strong>
                  </div>
                  <div className={styles.disabledBannerSub}>
                    Para acreditar la materia, el estudiante debe obtener la condición de Regularidad y luego aprobar obligatoriamente un Examen Final.
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Nota Promedio Mínima</label>
                    <span className={styles.fieldSub}>Calificación media requerida</span>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      className={styles.input}
                      value={minPromedio}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        setMinPromedio(val);
                        setDescripcionPromocion(generatePromocionDesc(
                          true,
                          val,
                          minParcialPromocion,
                          permiteRecupPromocion,
                          minAsistenciaPromocion
                        ));
                      }}
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Nota Mínima por Parcial</label>
                    <span className={styles.fieldSub}>Piso mínimo en cada evaluación</span>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      className={styles.input}
                      value={minParcialPromocion}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        setMinParcialPromocion(val);
                        setDescripcionPromocion(generatePromocionDesc(
                          true,
                          minPromedio,
                          val,
                          permiteRecupPromocion,
                          minAsistenciaPromocion
                        ));
                      }}
                      required
                    />
                  </div>
                </div>

                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Asistencia Mínima (%)</label>
                    <span className={styles.fieldSub}>Porcentaje de clases</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className={styles.input}
                      value={minAsistenciaPromocion}
                      onChange={e => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setMinAsistenciaPromocion(val);
                        setDescripcionPromocion(generatePromocionDesc(
                          true,
                          minPromedio,
                          minParcialPromocion,
                          permiteRecupPromocion,
                          val
                        ));
                      }}
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>¿Permite Recuperatorio?</label>
                    <span className={styles.fieldSub}>Para alcanzar la promoción</span>
                    <select
                      className={styles.select}
                      value={permiteRecupPromocion ? 'SI' : 'NO'}
                      onChange={e => {
                        const val = e.target.value === 'SI';
                        setPermiteRecupPromocion(val);
                        setDescripcionPromocion(generatePromocionDesc(
                          true,
                          minPromedio,
                          minParcialPromocion,
                          val,
                          minAsistenciaPromocion
                        ));
                      }}
                    >
                      <option value="NO">No permite (solo 1° instancia)</option>
                      <option value="SI">Sí, permite recuperar</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Descripción Resumida de la Regla</label>
              <textarea
                className={styles.textarea}
                value={descripcionPromocion}
                onChange={e => setDescripcionPromocion(e.target.value)}
                placeholder="Texto explicativo para la tarjeta del alumno..."
              />
            </div>
          </div>

          {/* SECCIÓN 2: CONDICIÓN DE REGULARIDAD */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <CheckCircle size={16} color="var(--blue)" />
                <span>Condición de Regularidad (Firma de Trabajos)</span>
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Nota Mínima de Parciales / TPs</label>
                <span className={styles.fieldSub}>Piso para no quedar libre</span>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  className={styles.input}
                  value={minNotaRegularidad}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    setMinNotaRegularidad(val);
                    setDescripcionRegularidad(generateRegularidadDesc(
                      val,
                      permiteRecupRegularidad,
                      minAsistenciaRegularidad
                    ));
                  }}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Asistencia Mínima Requerida (%)</label>
                <span className={styles.fieldSub}>Requisito de cursada</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className={styles.input}
                  value={minAsistenciaRegularidad}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setMinAsistenciaRegularidad(val);
                    setDescripcionRegularidad(generateRegularidadDesc(
                      minNotaRegularidad,
                      permiteRecupRegularidad,
                      val
                    ));
                  }}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>¿Permite Recuperatorio para Regularizar?</label>
              <select
                className={styles.select}
                value={permiteRecupRegularidad ? 'SI' : 'NO'}
                onChange={e => {
                  const val = e.target.value === 'SI';
                  setPermiteRecupRegularidad(val);
                  setDescripcionRegularidad(generateRegularidadDesc(
                    minNotaRegularidad,
                    val,
                    minAsistenciaRegularidad
                  ));
                }}
              >
                <option value="SI">Sí, admite instancias de recuperación</option>
                <option value="NO">No admite recuperatorios</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Descripción Resumida de Regularidad</label>
              <textarea
                className={styles.textarea}
                value={descripcionRegularidad}
                onChange={e => setDescripcionRegularidad(e.target.value)}
                placeholder="Texto explicativo para la tarjeta del alumno..."
              />
            </div>
          </div>

          {/* Acciones */}
          <div className={styles.actions}>
            <button type="button" className={styles.btnCancel} onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={isSaving}>
              <Check size={14} />
              <span>{isSaving ? 'Guardando...' : 'Guardar Reglas de Acreditación'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccreditationRulesModal;
