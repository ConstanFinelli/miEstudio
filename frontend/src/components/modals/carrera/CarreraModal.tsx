import React, { useState } from 'react';
import { X, GraduationCap, Building2, Hash, Calendar, BookOpen, Clock, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { carrerasService } from '../../../services/carrerasService';
import type { Carrera } from '../../../types/auth';
import styles from './CarreraModal.module.css';

interface CarreraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (carrera: Carrera) => void;
}

export const CarreraModal: React.FC<CarreraModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { reloadCarreras, selectCarrera } = useAuth();

  const [nombre, setNombre] = useState('');
  const [facultadSede, setFacultadSede] = useState('');
  const [legajo, setLegajo] = useState('');
  const [semestreActual, setSemestreActual] = useState('1º Semestre');
  const [cicloActivo, setCicloActivo] = useState('1C 2026');
  const [duracionAnios, setDuracionAnios] = useState<number>(5);
  const [totalMateriasPlan, setTotalMateriasPlan] = useState<number>(36);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMessage('El nombre de la carrera es obligatorio');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const created = await carrerasService.createCarrera({
        nombre: nombre.trim(),
        facultad_sede: facultadSede.trim() || 'Facultad / Universidad',
        legajo: legajo.trim() || 'S/N',
        semestre_actual: semestreActual.trim(),
        ciclo_activo: cicloActivo.trim(),
        duracion_anios: Number(duracionAnios) || 5,
        total_materias_plan: Number(totalMateriasPlan) || 36
      });

      await reloadCarreras();
      await selectCarrera(created.id);
      onSuccess?.(created);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Error al crear la carrera'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleRow}>
            <div className={styles.headerIcon}>
              <GraduationCap size={20} />
            </div>
            <div>
              <h2 className={styles.title}>Nueva Carrera Universitaria</h2>
              <p className={styles.subtitle}>
                Registrá una nueva carrera o programa de grado para tu seguimiento
              </p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className={styles.errorAlert}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.body}>
            <div className={styles.fieldGroup}>
              <label htmlFor="carrera-nombre" className={styles.label}>
                Nombre del Grado / Carrera *
              </label>
              <div className={styles.inputWrapper}>
                <BookOpen size={16} className={styles.inputIcon} />
                <input
                  id="carrera-nombre"
                  type="text"
                  className={styles.input}
                  placeholder="Ej: Licenciatura en Ciencias de la Computación"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label htmlFor="carrera-facultad" className={styles.label}>
                  Universidad / Facultad / Sede
                </label>
                <div className={styles.inputWrapper}>
                  <Building2 size={16} className={styles.inputIcon} />
                  <input
                    id="carrera-facultad"
                    type="text"
                    className={styles.input}
                    placeholder="Ej: UBA / UTN / UNLP"
                    value={facultadSede}
                    onChange={(e) => setFacultadSede(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="carrera-legajo" className={styles.label}>
                  Nº de Legajo / Padrón
                </label>
                <div className={styles.inputWrapper}>
                  <Hash size={16} className={styles.inputIcon} />
                  <input
                    id="carrera-legajo"
                    type="text"
                    className={styles.input}
                    placeholder="Ej: 104829"
                    value={legajo}
                    onChange={(e) => setLegajo(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label htmlFor="carrera-duracion" className={styles.label}>
                  Duración Teórica (Años)
                </label>
                <div className={styles.inputWrapper}>
                  <Clock size={16} className={styles.inputIcon} />
                  <input
                    id="carrera-duracion"
                    type="number"
                    min="1"
                    max="10"
                    className={styles.input}
                    value={duracionAnios}
                    onChange={(e) => setDuracionAnios(Number(e.target.value))}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="carrera-total-materias" className={styles.label}>
                  Materias Totales del Plan
                </label>
                <div className={styles.inputWrapper}>
                  <BookOpen size={16} className={styles.inputIcon} />
                  <input
                    id="carrera-total-materias"
                    type="number"
                    min="1"
                    max="100"
                    className={styles.input}
                    value={totalMateriasPlan}
                    onChange={(e) => setTotalMateriasPlan(Number(e.target.value))}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label htmlFor="carrera-semestre" className={styles.label}>
                  Nivel / Semestre Actual
                </label>
                <div className={styles.inputWrapper}>
                  <Calendar size={16} className={styles.inputIcon} />
                  <input
                    id="carrera-semestre"
                    type="text"
                    className={styles.input}
                    placeholder="Ej: 3º Año - 1º Cuatrimestre"
                    value={semestreActual}
                    onChange={(e) => setSemestreActual(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="carrera-ciclo" className={styles.label}>
                  Ciclo Lectivo Activo
                </label>
                <div className={styles.inputWrapper}>
                  <Calendar size={16} className={styles.inputIcon} />
                  <input
                    id="carrera-ciclo"
                    type="text"
                    className={styles.input}
                    placeholder="Ej: 1C 2026"
                    value={cicloActivo}
                    onChange={(e) => setCicloActivo(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className={styles.buttonSpinner} />
              ) : (
                <>
                  <Save size={16} />
                  <span>Crear y Activar Carrera</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarreraModal;
