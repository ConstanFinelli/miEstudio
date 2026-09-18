import React, { useState, useEffect, useMemo } from "react";
import styles from "./HorarioModal.module.css";
import {
  X,
  Clock,
  Building2,
  MapPin,
  Layers,
  Save,
  Trash2,
  AlertCircle,
  Pipette,
} from "lucide-react";
import type { HorarioCursada, DiaSemana } from "../../../types/academic";
import { useMaterias } from "../../../hooks";
import { useAuth } from "../../../context/AuthContext";
import { horariosService } from "../../../services";
import { PRESET_COLORS } from "../materia/MateriaColorModal";

interface HorarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  horarioToEdit?: HorarioCursada | null;
  defaultDiaSemana?: DiaSemana;
  defaultMateriaId?: string;
}

const DIAS: { id: DiaSemana; label: string; short: string }[] = [
  { id: "LUNES", label: "Lunes", short: "Lun" },
  { id: "MARTES", label: "Martes", short: "Mar" },
  { id: "MIERCOLES", label: "Miércoles", short: "Mié" },
  { id: "JUEVES", label: "Jueves", short: "Jue" },
  { id: "VIERNES", label: "Viernes", short: "Vie" },
  { id: "SABADO", label: "Sábado", short: "Sáb" },
];

const TIPOS_CLASE = [
  "Teoría",
  "Práctica",
  "Laboratorio",
  "Taller",
  "Teórico-Práctico",
];
const MODALIDADES: ("Presencial" | "Virtual" | "Híbrida")[] = [
  "Presencial",
  "Virtual",
  "Híbrida",
];

export const HorarioModal: React.FC<HorarioModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  horarioToEdit,
  defaultDiaSemana = "LUNES",
  defaultMateriaId,
}) => {
  const { activeCarrera, carreras } = useAuth();
  const { materias, updateMateria } = useMaterias(undefined, undefined, "ALL");

  const [materiaId, setMateriaId] = useState("");
  const [diaSemana, setDiaSemana] = useState<DiaSemana>(defaultDiaSemana);
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFin, setHoraFin] = useState("12:00");
  const [aula, setAula] = useState("");
  const [tipoClase, setTipoClase] = useState("Teoría");
  const [modalidad, setModalidad] = useState<
    "Presencial" | "Virtual" | "Híbrida"
  >("Presencial");
  const [observaciones, setObservaciones] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const availableMaterias = useMemo(() => {
    const cursando = materias.filter((m) => m.estado === "CURSANDO");
    if (horarioToEdit) {
      const current = materias.find((m) => m.id === horarioToEdit.materiaId);
      if (current && !cursando.some((m) => m.id === current.id)) {
        return [current, ...cursando];
      }
    }
    return cursando.length > 0 ? cursando : materias;
  }, [materias, horarioToEdit]);

  // Sync state on open / horarioToEdit change
  useEffect(() => {
    if (!isOpen) return;

    if (horarioToEdit) {
      setMateriaId(horarioToEdit.materiaId);
      setDiaSemana(horarioToEdit.diaSemana);
      setHoraInicio(horarioToEdit.horaInicio);
      setHoraFin(horarioToEdit.horaFin);
      setAula(horarioToEdit.aula || "");
      setTipoClase(horarioToEdit.tipoClase || "Teoría");
      setModalidad(horarioToEdit.modalidad || "Presencial");
      setObservaciones(horarioToEdit.observaciones || "");
      setShowDeleteConfirm(false);
    } else {
      setMateriaId(defaultMateriaId || availableMaterias[0]?.id || "");
      setDiaSemana(defaultDiaSemana);
      setHoraInicio("08:00");
      setHoraFin("12:00");
      setAula("");
      setTipoClase("Teoría");
      setModalidad("Presencial");
      setObservaciones("");
      setShowDeleteConfirm(false);
    }
  }, [isOpen, horarioToEdit]);

  // Fallback: assign initial materiaId once materias are available without clearing other fields
  useEffect(() => {
    if (isOpen && !materiaId && !horarioToEdit && availableMaterias.length > 0) {
      setMateriaId(defaultMateriaId || availableMaterias[0]?.id || "");
    }
  }, [isOpen, materiaId, horarioToEdit, defaultMateriaId, availableMaterias]);

  const selectedMateria = useMemo(() => {
    return materias.find((m) => m.id === materiaId);
  }, [materias, materiaId]);

  const assignedCarrera = useMemo(() => {
    const cId = selectedMateria?.carreraId || selectedMateria?.carrera_id;
    if (cId) {
      const found = carreras.find((c) => c.id === cId);
      if (found) return found;
    }
    return activeCarrera;
  }, [carreras, selectedMateria, activeCarrera]);

  const autoFacultadSede = useMemo(() => {
    return (
      assignedCarrera?.facultad_sede ||
      activeCarrera?.facultad_sede ||
      horarioToEdit?.facultadSede ||
      ""
    );
  }, [assignedCarrera, activeCarrera, horarioToEdit]);


  // Compute duration
  const { durationText, isValidTimeRange } = useMemo(() => {
    if (!horaInicio || !horaFin)
      return { durationText: "", isValidTimeRange: true };
    const [h1, m1] = horaInicio.split(":").map(Number);
    const [h2, m2] = horaFin.split(":").map(Number);
    const mins1 = h1 * 60 + m1;
    const mins2 = h2 * 60 + m2;
    const diff = mins2 - mins1;

    if (diff <= 0) {
      return {
        durationText: "Hora de fin debe ser posterior",
        isValidTimeRange: false,
      };
    }

    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    const text = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    return { durationText: text, isValidTimeRange: true };
  }, [horaInicio, horaFin]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materiaId || !isValidTimeRange || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const payload: Partial<HorarioCursada> = {
        materiaId,
        materiaNombre: selectedMateria?.nombre || "Materia",
        materiaCodigo: selectedMateria?.codigo || "MAT",
        materiaColor: selectedMateria?.color || "var(--primary)",
        diaSemana,
        horaInicio,
        horaFin,
        facultadSede: autoFacultadSede,
        aula: aula.trim(),
        tipoClase,
        modalidad,
        observaciones: observaciones.trim(),
      };

      let result: HorarioCursada;
      if (horarioToEdit) {
        result = await horariosService.updateHorario(horarioToEdit.id, payload);
      } else {
        result = await horariosService.createHorario(payload);
      }

      window.dispatchEvent(
        new CustomEvent("horarios:updated", { detail: result }),
      );
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error al guardar horario:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!horarioToEdit) return;
    try {
      setIsSubmitting(true);
      await horariosService.deleteHorario(horarioToEdit.id);
      window.dispatchEvent(
        new CustomEvent("horarios:updated", {
          detail: { id: horarioToEdit.id },
        }),
      );
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error al eliminar horario:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Top bar */}
        <div className={styles.modalTopBar}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className={styles.tagBadge}>
              {horarioToEdit ? "EDITAR HORARIO" : "NUEVO HORARIO"}
            </span>
            <span>GESTOR DE CURSADA SEMANAL</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Cerrar">
            <X size={14} />
            <span>ESC</span>
          </button>
        </div>

        {/* Title */}
        <div className={styles.titleGroup}>
          <h2 className={styles.modalTitle}>
            {horarioToEdit
              ? "Modificar Horario de Cursada"
              : "Agregar Horario de Cursada"}
          </h2>
          <p className={styles.modalSubtitle}>
            Configurá el día, banda horaria y aula con total
            flexibilidad para tu cronograma.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Materia */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <Layers size={13} />
              Materia (en Cursada) <span className={styles.required}>*</span>
            </label>
            <select
              value={materiaId}
              onChange={(e) => setMateriaId(e.target.value)}
              className={styles.select}
              required
            >
              <option value="" disabled>
                Seleccionar materia...
              </option>
              {availableMaterias.map((m) => {
                const cId = m.carreraId || m.carrera_id;
                const carreraObj = carreras.find((c) => c.id === cId);
                const carreraPrefix =
                  carreras.length > 1 && carreraObj
                    ? `[${carreraObj.nombre}] `
                    : "";

                return (
                  <option key={m.id} value={m.id}>
                    {carreraPrefix}
                    {m.codigo ? `[${m.codigo}] ` : ""}
                    {m.nombre} ({m.anio}° Año - {m.cuatrimestre})
                    {m.estado !== "CURSANDO" ? ` - (${m.estado})` : ""}
                  </option>
                );
              })}
            </select>

            {selectedMateria && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "6px",
                  padding: "6px 10px",
                  backgroundColor: "var(--surface-2)",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: selectedMateria.color || "#3b82f6",
                      boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.2)",
                    }}
                  />
                  <span
                    style={{ fontSize: "11px", color: "var(--text-muted)" }}
                  >
                    Color de materia:
                  </span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: "50%",
                        backgroundColor: c,
                        border:
                          (selectedMateria.color || "#3b82f6").toLowerCase() ===
                          c.toLowerCase()
                            ? "2px solid #ffffff"
                            : "1px solid rgba(255,255,255,0.15)",
                        cursor: "pointer",
                        padding: 0,
                        transform:
                          (selectedMateria.color || "#3b82f6").toLowerCase() ===
                          c.toLowerCase()
                            ? "scale(1.2)"
                            : "scale(1)",
                        transition: "all 0.12s ease",
                      }}
                      title={`Cambiar color a ${c}`}
                      onClick={async () => {
                        await updateMateria(selectedMateria.id, { color: c });
                      }}
                    />
                  ))}
                  <label
                    title="Elegir color personalizado (RGB / selector)"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 17,
                      height: 17,
                      borderRadius: "50%",
                      backgroundColor: "var(--surface-3)",
                      border: "1px dashed var(--border-hover)",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Pipette size={9} color="var(--text-secondary)" />
                    <input
                      type="color"
                      style={{
                        position: "absolute",
                        top: -10,
                        left: -10,
                        width: 40,
                        height: 40,
                        opacity: 0,
                        cursor: "pointer",
                      }}
                      value={selectedMateria.color || "#3b82f6"}
                      onChange={async (e) => {
                        await updateMateria(selectedMateria.id, {
                          color: e.target.value,
                        });
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Día de la semana */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Día de Cursada <span className={styles.required}>*</span>
            </label>
            <div className={styles.dayPillsContainer}>
              {DIAS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`${styles.dayPill} ${diaSemana === d.id ? styles.dayPillActive : ""}`}
                  onClick={() => setDiaSemana(d.id)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Horario Inicio y Fin */}
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <Clock size={13} />
                Hora de Inicio <span className={styles.required}>*</span>
              </label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <Clock size={13} />
                Hora de Fin <span className={styles.required}>*</span>
                {durationText && isValidTimeRange && (
                  <span className={styles.durationBadge}>{durationText}</span>
                )}
              </label>
              <input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className={styles.input}
                required
              />
              {!isValidTimeRange && (
                <div className={styles.durationWarning}>
                  <AlertCircle
                    size={12}
                    style={{ display: "inline", marginRight: 4 }}
                  />
                  {durationText}
                </div>
              )}
            </div>
          </div>

          {/* Aula y Sede Asignada */}
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <MapPin size={13} />
                Aula / Laboratorio
              </label>
              <input
                type="text"
                value={aula}
                onChange={(e) => setAula(e.target.value)}
                placeholder="Ej: Aula 214, Lab Sistemas, Aula Magna"
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <Building2 size={13} />
                Sede / Facultad
              </label>
              <div className={styles.autoSedeBox}>
                <Building2 size={14} className={styles.autoSedeIcon} />
                <span
                  className={styles.autoSedeText}
                  title={autoFacultadSede || "Sin sede definida en la carrera"}
                >
                  {autoFacultadSede || "Sin sede definida en la carrera"}
                </span>
                <span className={styles.autoSedeTag}>Carrera</span>
              </div>
            </div>
          </div>

          {/* Tipo de Clase y Modalidad */}
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Tipo de Clase</label>
              <div className={styles.chipsContainer}>
                {TIPOS_CLASE.map((tc) => (
                  <button
                    key={tc}
                    type="button"
                    className={`${styles.chip} ${tipoClase === tc ? styles.chipActive : ""}`}
                    onClick={() => setTipoClase(tc)}
                  >
                    {tc}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Modalidad</label>
              <div className={styles.chipsContainer}>
                {MODALIDADES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`${styles.chip} ${modalidad === m ? styles.chipActive : ""}`}
                    onClick={() => setModalidad(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Observaciones / Notas de Cursada
            </label>
            <input
              type="text"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Asistencia estricta los primeros 15 min, llevar calculadora"
              className={styles.input}
            />
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            {horarioToEdit ? (
              showDeleteConfirm ? (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    ¿Confirmar eliminación?
                  </button>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting}
                >
                  <Trash2 size={14} />
                  Eliminar Horario
                </button>
              )
            ) : (
              <div />
            )}

            <div className={styles.actionsRight}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={!materiaId || !isValidTimeRange || isSubmitting}
              >
                <Save size={14} />
                {isSubmitting
                  ? "Guardando..."
                  : horarioToEdit
                    ? "Guardar Cambios"
                    : "Registrar Horario"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
