import React, { useState, useEffect } from 'react';
import styles from './AccreditationRulesModal.module.css';
import { X, CheckCircle, AlertCircle, Award, Check, SlidersHorizontal, Sparkles } from 'lucide-react';
import type { Materia } from '../../../types/academic';

interface AccreditationRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  materia: Materia;
  onSave: (updatedReglas: Materia['reglasAcreditacion']) => Promise<void>;
}

const PROMO_CHIPS = [
  'Promedio ≥ 8.0',
  'Parciales ≥ 7.0 en 1° intento',
  'Coloquio oral integrador',
  'TP integrador ≥ 8.0',
  'Sin recuperatorios'
];

const REGULAR_CHIPS = [
  'Parciales ≥ 4.0',
  '100% de TPs aprobados',
  'Laboratorio de cátedra aprobado',
  'Coloquio de regularidad',
  'Asistencia ≥ 75%'
];

export const AccreditationRulesModal: React.FC<AccreditationRulesModalProps> = ({
  isOpen,
  onClose,
  materia,
  onSave
}) => {
  const currentReglas = materia?.reglasAcreditacion;

  // Promoción
  const [permitePromocion, setPermitePromocion] = useState<boolean>(
    currentReglas?.promocion?.permitePromocion !== false
  );
  const [condicionPromocion, setCondicionPromocion] = useState<string>(
    currentReglas?.promocion?.condicion ||
    currentReglas?.promocion?.descripcion ||
    'Promedio ≥ 8.0 y parciales ≥ 7.0 (sin recuperatorio)'
  );
  const [permiteRecupPromocion, setPermiteRecupPromocion] = useState<boolean>(
    currentReglas?.promocion?.permiteRecuperatorio ?? false
  );
  const [minAsistenciaPromocion, setMinAsistenciaPromocion] = useState<number | string>(
    currentReglas?.promocion?.minAsistencia ?? 80
  );

  // Regularidad
  const [condicionRegularidad, setCondicionRegularidad] = useState<string>(
    currentReglas?.regularidad?.condicion ||
    currentReglas?.regularidad?.descripcion ||
    'Todas las evaluaciones ≥ 4.0 y requisitos de cátedra cumplidos'
  );
  const [minAsistenciaRegularidad, setMinAsistenciaRegularidad] = useState<number | string>(
    currentReglas?.regularidad?.minAsistencia ?? 75
  );
  const [permiteRecupRegularidad, setPermiteRecupRegularidad] = useState<boolean>(
    currentReglas?.regularidad?.permiteRecuperatorio ?? true
  );

  const [isSaving, setIsSaving] = useState(false);

  // Sync state when materia or isOpen changes
  useEffect(() => {
    if (materia?.reglasAcreditacion) {
      const p = materia.reglasAcreditacion.promocion;
      const r = materia.reglasAcreditacion.regularidad;
      setPermitePromocion(p.permitePromocion !== false);
      setCondicionPromocion(
        p.condicion ||
        p.descripcion ||
        'Promedio ≥ 8.0 y parciales ≥ 7.0 (sin recuperatorio)'
      );
      setPermiteRecupPromocion(p.permiteRecuperatorio ?? false);
      setMinAsistenciaPromocion(p.minAsistencia ?? 80);

      setCondicionRegularidad(
        r.condicion ||
        r.descripcion ||
        'Todas las evaluaciones ≥ 4.0 y requisitos de cátedra cumplidos'
      );
      setMinAsistenciaRegularidad(r.minAsistencia ?? 75);
      setPermiteRecupRegularidad(r.permiteRecuperatorio ?? true);
    }
  }, [materia, isOpen]);

  if (!isOpen) return null;

  const appendChipToCondition = (
    currentText: string,
    setter: (val: string) => void,
    chip: string
  ) => {
    const trimmed = currentText.trim();
    if (!trimmed) {
      setter(chip);
    } else if (!trimmed.toLowerCase().includes(chip.toLowerCase())) {
      setter(`${trimmed}, ${chip}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const promoText = permitePromocion
        ? (condicionPromocion.trim() || 'Promedio ≥ 8.0 y evaluaciones ≥ 7.0')
        : 'Sin promoción directa. Examen final obligatorio para acreditar la materia.';

      const reguText = condicionRegularidad.trim() || 'Todas las evaluaciones ≥ 4.0 y requisitos de cursada';

      await onSave({
        promocion: {
          permitePromocion,
          condicion: promoText,
          minAsistencia: permitePromocion ? (minAsistenciaPromocion === '' ? 80 : Number(minAsistenciaPromocion)) : 0,
          permiteRecuperatorio: permitePromocion ? permiteRecupPromocion : false,
          descripcion: promoText
        },
        regularidad: {
          condicion: reguText,
          minAsistencia: minAsistenciaRegularidad === '' ? 75 : Number(minAsistenciaRegularidad),
          permiteRecuperatorio: permiteRecupRegularidad,
          descripcion: reguText
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
            Definí las condiciones específicas de la cátedra para alcanzar la promoción directa y regularizar la cursada.
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
                onClick={() => setPermitePromocion(!permitePromocion)}
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
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Condición de Cátedra para Promocionar</label>
                  <span className={styles.fieldSub}>Requisito textual establecido por los docentes (ej: notas, coloquio, instancias)</span>
                  <textarea
                    className={styles.textarea}
                    value={condicionPromocion}
                    onChange={e => setCondicionPromocion(e.target.value)}
                    placeholder="Ej: Promedio ≥ 8.0, sin parciales inferiores a 7.0 y coloquio oral integrador aprobado"
                    rows={2}
                    required
                  />
                  <div className={styles.chipsContainer}>
                    <span className={styles.chipsLabel}>
                      <Sparkles size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                      Sugerencias:
                    </span>
                    {PROMO_CHIPS.map(chip => (
                      <button
                        key={chip}
                        type="button"
                        className={styles.chipBtn}
                        onClick={() => appendChipToCondition(condicionPromocion, setCondicionPromocion, chip)}
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Asistencia Mínima (%)</label>
                    <span className={styles.fieldSub}>Porcentaje de clases requerido</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className={styles.input}
                      value={minAsistenciaPromocion}
                      onChange={e => setMinAsistenciaPromocion(e.target.value === '' ? '' : e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>¿Permite Recuperatorio?</label>
                    <span className={styles.fieldSub}>Para acceder a la promoción</span>
                    <select
                      className={styles.select}
                      value={permiteRecupPromocion ? 'SI' : 'NO'}
                      onChange={e => setPermiteRecupPromocion(e.target.value === 'SI')}
                    >
                      <option value="NO">No permite (solo 1° instancia)</option>
                      <option value="SI">Sí, permite recuperar</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* SECCIÓN 2: CONDICIÓN DE REGULARIDAD */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <CheckCircle size={16} color="var(--blue)" />
                <span>Condición de Regularidad (Firma de Trabajos)</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Condición de Cátedra para Regularizar</label>
              <span className={styles.fieldSub}>Requisitos específicos (parciales, entregas de TPs, laboratorios, talleres)</span>
              <textarea
                className={styles.textarea}
                value={condicionRegularidad}
                onChange={e => setCondicionRegularidad(e.target.value)}
                placeholder="Ej: Parciales ≥ 4.0 (con recuperatorio), 100% de TPs de laboratorio entregados y coloquio aprobado"
                rows={2}
                required
              />
              <div className={styles.chipsContainer}>
                <span className={styles.chipsLabel}>
                  <Sparkles size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                  Sugerencias:
                </span>
                {REGULAR_CHIPS.map(chip => (
                  <button
                    key={chip}
                    type="button"
                    className={styles.chipBtn}
                    onClick={() => appendChipToCondition(condicionRegularidad, setCondicionRegularidad, chip)}
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Asistencia Mínima Requerida (%)</label>
                <span className={styles.fieldSub}>Requisito de asistencia obligatoria</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className={styles.input}
                  value={minAsistenciaRegularidad}
                  onChange={e => setMinAsistenciaRegularidad(e.target.value === '' ? '' : e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>¿Permite Recuperatorio para Regularizar?</label>
                <span className={styles.fieldSub}>Instancias de recuperación de parciales</span>
                <select
                  className={styles.select}
                  value={permiteRecupRegularidad ? 'SI' : 'NO'}
                  onChange={e => setPermiteRecupRegularidad(e.target.value === 'SI')}
                >
                  <option value="SI">Sí, admite instancias de recuperación</option>
                  <option value="NO">No admite recuperatorios</option>
                </select>
              </div>
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
