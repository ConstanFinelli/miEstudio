import React, { useState, useEffect } from 'react';
import { X, Award, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { materiasService } from '../../../services/materiasService';
import { carrerasService } from '../../../services/carrerasService';
import type { Materia } from '../../../types/academic';
import styles from './AprobacionHistoricaModal.module.css';

interface AprobacionHistoricaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AprobacionHistoricaModal: React.FC<AprobacionHistoricaModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { activeCarrera, reloadCarreras } = useAuth();

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [selectedMateriaId, setSelectedMateriaId] = useState<string>('custom');
  const [customNombreMateria, setCustomNombreMateria] = useState('');
  const [customCodigoMateria, setCustomCodigoMateria] = useState('');
  const [anioMateria, setAnioMateria] = useState<number>(1);

  const [notaFinal, setNotaFinal] = useState<number>(8);
  const [fechaAprobacion, setFechaAprobacion] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [tipoAprobacion, setTipoAprobacion] = useState<string>('PROMOCION');
  const [libroActa, setLibroActa] = useState('');
  const [folioActa, setFolioActa] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      materiasService.getMaterias().then((list) => {
        setMaterias(list);
        if (list.length > 0) {
          setSelectedMateriaId(list[0].id);
        } else {
          setSelectedMateriaId('custom');
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCarrera) {
      setErrorMessage('No hay ninguna carrera activa seleccionada');
      return;
    }

    if (notaFinal < 1 || notaFinal > 10) {
      setErrorMessage('La nota final debe ser entre 1 y 10');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      let targetMateriaId = selectedMateriaId;

      // Si se crea una materia nueva que no estaba en el sistema
      if (selectedMateriaId === 'custom') {
        if (!customNombreMateria.trim()) {
          setErrorMessage('Por favor ingresá el nombre de la materia');
          setIsLoading(false);
          return;
        }

        const nuevaMateria = await materiasService.createMateria({
          nombre: customNombreMateria.trim(),
          codigo: customCodigoMateria.trim() || `HIST-${Math.floor(100 + Math.random() * 900)}`,
          anio: anioMateria,
          cuatrimestre: '1C',
          estado: 'APROBADA',
          color: '#10b981',
          promedio: notaFinal
        });
        targetMateriaId = nuevaMateria.id;
      } else {
        // Actualizar la materia existente a estado APROBADA con su nota final
        await materiasService.updateMateria(selectedMateriaId, {
          estado: 'APROBADA',
          promedio: notaFinal
        });
      }

      // Registrar la aprobación histórica en la carrera
      await carrerasService.registrarAprobacion({
        carrera_id: activeCarrera.id,
        materia_id: targetMateriaId,
        nota_final: Number(notaFinal),
        fecha_aprobacion: fechaAprobacion,
        tipo_aprobacion: tipoAprobacion,
        libro_acta: libroActa.trim() || undefined,
        folio_acta: folioActa.trim() || undefined,
        observaciones: observaciones.trim() || undefined
      });

      // Recalcular métricas de carrera en el estado global
      await reloadCarreras();
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Error al registrar la aprobación histórica'
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
              <Award size={20} />
            </div>
            <div>
              <h2 className={styles.title}>Cargar Materia Aprobada Previa</h2>
              <p className={styles.subtitle}>
                Registrá asignaturas aprobadas antes de usar miEstudio ({activeCarrera?.nombre || 'Carrera Activa'})
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
            {/* Selector de Materia */}
            <div className={styles.fieldGroup}>
              <label htmlFor="aprob-materia" className={styles.label}>
                Materia Aprobada
              </label>
              <select
                id="aprob-materia"
                className={styles.select}
                value={selectedMateriaId}
                onChange={(e) => setSelectedMateriaId(e.target.value)}
                disabled={isLoading}
              >
                <option value="custom">+ Cargar otra materia no listada...</option>
                {materias.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.codigo ? `[${m.codigo}] ` : ''}{m.nombre} ({m.anio}º Año)
                  </option>
                ))}
              </select>
            </div>

            {/* Inputs para materia no listada */}
            {selectedMateriaId === 'custom' && (
              <div className={styles.customMateriaBox}>
                <div className={styles.row}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="custom-nombre" className={styles.label}>
                      Nombre de la Materia *
                    </label>
                    <input
                      id="custom-nombre"
                      type="text"
                      className={styles.input}
                      placeholder="Ej: Álgebra Lineal y Geometría"
                      value={customNombreMateria}
                      onChange={(e) => setCustomNombreMateria(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="custom-codigo" className={styles.label}>
                      Código de Materia
                    </label>
                    <input
                      id="custom-codigo"
                      type="text"
                      className={styles.input}
                      placeholder="Ej: ALG-101"
                      value={customCodigoMateria}
                      onChange={(e) => setCustomCodigoMateria(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <label htmlFor="custom-anio" className={styles.label}>
                    Año en el Plan de Estudios
                  </label>
                  <select
                    id="custom-anio"
                    className={styles.select}
                    value={anioMateria}
                    onChange={(e) => setAnioMateria(Number(e.target.value))}
                    disabled={isLoading}
                  >
                    <option value={1}>1º Año</option>
                    <option value={2}>2º Año</option>
                    <option value={3}>3º Año</option>
                    <option value={4}>4º Año</option>
                    <option value={5}>5º Año</option>
                    <option value={6}>6º Año</option>
                  </select>
                </div>
              </div>
            )}

            {/* Nota Final y Fecha */}
            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label htmlFor="aprob-nota" className={styles.label}>
                  Calificación Final (1 al 10) *
                </label>
                <div className={styles.inputWrapper}>
                  <Award size={16} className={styles.inputIcon} />
                  <input
                    id="aprob-nota"
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    className={styles.input}
                    value={notaFinal}
                    onChange={(e) => setNotaFinal(Number(e.target.value))}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="aprob-fecha" className={styles.label}>
                  Fecha de Aprobación *
                </label>
                <div className={styles.inputWrapper}>
                  <Calendar size={16} className={styles.inputIcon} />
                  <input
                    id="aprob-fecha"
                    type="date"
                    className={styles.input}
                    value={fechaAprobacion}
                    onChange={(e) => setFechaAprobacion(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Modalidad de Aprobación */}
            <div className={styles.fieldGroup}>
              <label htmlFor="aprob-tipo" className={styles.label}>
                Modalidad de Aprobación
              </label>
              <select
                id="aprob-tipo"
                className={styles.select}
                value={tipoAprobacion}
                onChange={(e) => setTipoAprobacion(e.target.value)}
                disabled={isLoading}
              >
                <option value="PROMOCION">Promoción Directa</option>
                <option value="FINAL">Examen Final Regular</option>
                <option value="LIBRE">Examen Final Libre</option>
                <option value="EQUIVALENCIA">Equivalencia / Reconocimiento</option>
              </select>
            </div>

            {/* Libro y Folio de Acta */}
            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label htmlFor="aprob-libro" className={styles.label}>
                  Libro / Tomo de Acta
                </label>
                <input
                  id="aprob-libro"
                  type="text"
                  className={styles.input}
                  placeholder="Ej: Tomo 12"
                  value={libroActa}
                  onChange={(e) => setLibroActa(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="aprob-folio" className={styles.label}>
                  Folio / Acta Nº
                </label>
                <input
                  id="aprob-folio"
                  type="text"
                  className={styles.input}
                  placeholder="Ej: Folio 244"
                  value={folioActa}
                  onChange={(e) => setFolioActa(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Observaciones */}
            <div className={styles.fieldGroup}>
              <label htmlFor="aprob-obs" className={styles.label}>
                Observaciones o Comentarios
              </label>
              <input
                id="aprob-obs"
                type="text"
                className={styles.input}
                placeholder="Ej: Aprobada con mesa especial de diciembre"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                disabled={isLoading}
              />
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
                  <CheckCircle size={16} />
                  <span>Guardar e Impactar en Promedio</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AprobacionHistoricaModal;
