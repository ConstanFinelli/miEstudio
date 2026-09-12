import React, { useState, useEffect } from "react";
import styles from "./MateriaModal.module.css";
import { X, BookOpen, Plus, Award, Save } from "lucide-react";
import type {
  Materia,
  EstadoMateria,
  ApunteNota,
} from "../../../types/academic";
import {
  materiasService,
  materialesService,
  apuntesService,
} from "../../../services";
import { useAuth } from "../../../context/AuthContext";
import { carrerasService } from "../../../services/carrerasService";
import { CleanApprovedPdfsModal } from "../material/CleanApprovedPdfsModal";
import { exportMateriaNotesZip } from "../../../utils";
import { ColorPickerRGB } from "../../common/ColorPickerRGB";

interface MateriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (materia: Materia) => void;
  materiaToEdit?: Materia | null;
  initialEstado?: EstadoMateria;
}

export const MateriaModal: React.FC<MateriaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  materiaToEdit,
  initialEstado,
}) => {
  const { activeCarrera, reloadCarreras } = useAuth();
  const isEditing = Boolean(materiaToEdit);

  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [anio, setAnio] = useState<number>(1);
  const [cuatrimestre, setCuatrimestre] = useState<"1C" | "2C" | "Anual">("1C");
  const [estado, setEstado] = useState<EstadoMateria>("CURSANDO");
  const [color, setColor] = useState("#3b82f6");
  const [comision, setComision] = useState("");
  const [modalidad, setModalidad] = useState<
    "Presencial" | "Virtual" | "Híbrida"
  >("Presencial");
  const [profesorTitular, setProfesorTitular] = useState("");
  const [profesorJtp, setProfesorJtp] = useState("");

  // Campos de Aprobación Previa / Calificación Final
  const [notaFinal, setNotaFinal] = useState<number | string>("");
  const [fechaAprobacion, setFechaAprobacion] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [fechaExactaDesconocida, setFechaExactaDesconocida] = useState(false);
  const [anioAprobacion, setAnioAprobacion] = useState<number | string>(() =>
    new Date().getFullYear(),
  );
  const [tipoAprobacion, setTipoAprobacion] = useState<string>("FINAL");
  const [libroActa, setLibroActa] = useState("");
  const [folioActa, setFolioActa] = useState("");

  // Reglas de acreditación configurables
  const [permitePromocion, setPermitePromocion] = useState(true);
  const [condicionPromocion, setCondicionPromocion] = useState(
    "Promedio ≥ 8.0 y parciales ≥ 7.0 (sin recuperatorio)",
  );
  const [condicionRegularidad, setCondicionRegularidad] = useState(
    "Todas las evaluaciones ≥ 4.0 y requisitos de cátedra",
  );
  const [minAsistencia, setMinAsistencia] = useState<number | string>(75);
  const [showRulesConfig, setShowRulesConfig] = useState(false);
  const isAprobada = estado === "APROBADA" || estado === "PROMOCIONADA";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cleanPdfsData, setCleanPdfsData] = useState<{
    isOpen: boolean;
    materiaId: string;
    materiaNombre: string;
    pdfCount: number;
    totalBytes: number;
    notesCount: number;
    notesList: ApunteNota[];
    updatedMateria: Materia;
  } | null>(null);

  useEffect(() => {
    if (materiaToEdit) {
      setNombre(materiaToEdit.nombre || "");
      setCodigo(materiaToEdit.codigo || "");
      setAnio(materiaToEdit.anio || 1);
      setCuatrimestre(materiaToEdit.cuatrimestre || "1C");
      const editEst = materiaToEdit.estado || "CURSANDO";
      setEstado(editEst);
      setColor(materiaToEdit.color || "#3b82f6");
      setComision(materiaToEdit.comision || "");
      setModalidad(materiaToEdit.modalidad || "Presencial");
      setProfesorTitular(materiaToEdit.profesores?.titular || "");
      setProfesorJtp(materiaToEdit.profesores?.jtp || "");
      setPermitePromocion(
        materiaToEdit.reglasAcreditacion?.promocion?.permitePromocion ?? true,
      );
      setCondicionPromocion(
        materiaToEdit.reglasAcreditacion?.promocion?.condicion ||
          materiaToEdit.reglasAcreditacion?.promocion?.descripcion ||
          "Promedio ≥ 8.0 y parciales ≥ 7.0 (sin recuperatorio)",
      );
      setCondicionRegularidad(
        materiaToEdit.reglasAcreditacion?.regularidad?.condicion ||
          materiaToEdit.reglasAcreditacion?.regularidad?.descripcion ||
          "Todas las evaluaciones ≥ 4.0 y requisitos de cátedra",
      );
      setMinAsistencia(
        materiaToEdit.reglasAcreditacion?.regularidad?.minAsistencia ?? 75,
      );
      setNotaFinal(
        materiaToEdit.promedio && materiaToEdit.promedio > 0
          ? materiaToEdit.promedio
          : "",
      );
      setTipoAprobacion(editEst === "PROMOCIONADA" ? "PROMOCION" : "FINAL");
      setLibroActa("");
      setFolioActa("");
      setFechaExactaDesconocida(false);
      setAnioAprobacion(new Date().getFullYear());
      setShowRulesConfig(false);

      if (
        activeCarrera &&
        (editEst === "APROBADA" || editEst === "PROMOCIONADA")
      ) {
        carrerasService
          .getAprobaciones(activeCarrera.id)
          .then((aprobs) => {
            const found = aprobs.find((a) => a.materia_id === materiaToEdit.id);
            if (found) {
              if (found.nota_final) setNotaFinal(found.nota_final);
              if (found.tipo_aprobacion)
                setTipoAprobacion(found.tipo_aprobacion);
              if (found.libro_acta) setLibroActa(found.libro_acta);
              if (found.folio_acta) setFolioActa(found.folio_acta);
              if (found.fecha_aprobacion) {
                const datePart = found.fecha_aprobacion.split("T")[0];
                setFechaAprobacion(datePart);
                if (datePart.endsWith("-12-31")) {
                  setFechaExactaDesconocida(true);
                  setAnioAprobacion(
                    parseInt(datePart.split("-")[0], 10) ||
                      new Date().getFullYear(),
                  );
                } else {
                  setFechaExactaDesconocida(false);
                }
              }
            }
          })
          .catch(() => {});
      }
    } else {
      setNombre("");
      setCodigo("");
      setAnio(1);
      setCuatrimestre("1C");
      const defaultEst = initialEstado || "CURSANDO";
      setEstado(defaultEst);
      setColor("#3b82f6");
      setComision("");
      setModalidad("Presencial");
      setProfesorTitular("");
      setProfesorJtp("");
      setPermitePromocion(true);
      setCondicionPromocion(
        "Promedio ≥ 8.0 y parciales ≥ 7.0 (sin recuperatorio)",
      );
      setCondicionRegularidad(
        "Todas las evaluaciones ≥ 4.0 y requisitos de cátedra",
      );
      setMinAsistencia(75);
      setNotaFinal("");
      const now = new Date();
      setFechaAprobacion(now.toISOString().split("T")[0]);
      setFechaExactaDesconocida(false);
      setAnioAprobacion(now.getFullYear());
      setTipoAprobacion(defaultEst === "PROMOCIONADA" ? "PROMOCION" : "FINAL");
      setLibroActa("");
      setFolioActa("");
      setShowRulesConfig(false);
    }
  }, [materiaToEdit, isOpen, initialEstado, activeCarrera]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    try {
      setIsSubmitting(true);
      const isAprobada = estado === "APROBADA" || estado === "PROMOCIONADA";
      const parsedNota = notaFinal === "" ? 0 : Number(notaFinal);
      const promedioFinal = isAprobada
        ? parsedNota
        : materiaToEdit?.promedio || 0;

      const payload: Partial<Materia> = {
        nombre: nombre.trim(),
        codigo: codigo.trim() || `MAT-${Math.floor(100 + Math.random() * 900)}`,
        anio,
        cuatrimestre,
        estado,
        color,
        comision: comision.trim() || "Comisión Única",
        modalidad,
        promedio: promedioFinal,
        profesores: {
          titular: profesorTitular.trim(),
          jtp: profesorJtp.trim(),
        },
        reglasAcreditacion: {
          promocion: {
            permitePromocion: isAprobada
              ? estado === "PROMOCIONADA"
              : permitePromocion,
            condicion:
              isAprobada && !showRulesConfig
                ? estado === "PROMOCIONADA"
                  ? "Promoción directa acreditada"
                  : "Acreditación por examen final"
                : permitePromocion
                  ? condicionPromocion.trim()
                  : "Sin promoción directa. Examen final obligatorio.",
            minAsistencia: isAprobada && !showRulesConfig ? 0 : 80,
            permiteRecuperatorio: false,
            descripcion:
              isAprobada && !showRulesConfig
                ? estado === "PROMOCIONADA"
                  ? "Promoción directa acreditada"
                  : "Acreditación por examen final"
                : permitePromocion
                  ? condicionPromocion.trim()
                  : "Sin promoción directa. Examen final obligatorio.",
          },
          regularidad: {
            condicion:
              isAprobada && !showRulesConfig
                ? "Cursada aprobada"
                : condicionRegularidad.trim() ||
                  "Evaluaciones ≥ 4.0 y requisitos de cátedra",
            minAsistencia:
              isAprobada && !showRulesConfig
                ? 0
                : minAsistencia === ""
                  ? 75
                  : Number(minAsistencia),
            permiteRecuperatorio: true,
            descripcion:
              isAprobada && !showRulesConfig
                ? "Cursada aprobada"
                : condicionRegularidad.trim() ||
                  "Evaluaciones ≥ 4.0 y requisitos de cátedra",
          },
        },
      };

      let result: Materia;
      if (materiaToEdit) {
        result = await materiasService.updateMateria(materiaToEdit.id, payload);
      } else {
        result = await materiasService.createMateria(payload);
      }

      // Si se cargó como aprobada/promocionada y hay carrera activa, registrar aprobación histórica
      if (isAprobada) {
        let carreraId = activeCarrera?.id;
        if (!carreraId) {
          const carrerasList = await carrerasService
            .getCarreras()
            .catch(() => []);
          carreraId =
            carrerasList.find((c) => c.is_activa)?.id || carrerasList[0]?.id;
        }

        if (carreraId) {
          try {
            const finalFecha = fechaExactaDesconocida
              ? `${anioAprobacion}-12-31`
              : fechaAprobacion || new Date().toISOString().split("T")[0];

            await carrerasService.registrarAprobacion({
              carrera_id: carreraId,
              materia_id: result.id,
              nota_final: parsedNota,
              fecha_aprobacion: finalFecha,
              tipo_aprobacion: tipoAprobacion,
              libro_acta: libroActa.trim() || undefined,
              folio_acta: folioActa.trim() || undefined,
            });
            await reloadCarreras();
          } catch (aprobErr) {
            console.warn(
              "[MateriaModal] Error al registrar aprobación histórica:",
              aprobErr,
            );
          }
        }
      }

      // Disparar evento reactivo para sincronizar inmediatamente todas las vistas
      window.dispatchEvent(
        new CustomEvent("materias:updated", { detail: result }),
      );

      // Verificar si acaba de ser acreditada (aprobada o promocionada)
      const wasAlreadyApproved = Boolean(
        materiaToEdit &&
        (materiaToEdit.estado === "APROBADA" ||
          materiaToEdit.estado === "PROMOCIONADA"),
      );
      const isNowApproved = estado === "APROBADA" || estado === "PROMOCIONADA";

      if (materiaToEdit && isNowApproved && !wasAlreadyApproved) {
        try {
          // Verificar explícitamente que haya PDFs subidos antes de abrir el modal
          const pdfs = await materialesService.getMateriales(materiaToEdit.id);
          if (pdfs.length > 0) {
            const matNotes = await apuntesService
              .getApuntes(materiaToEdit.id)
              .catch(() => []);
            const totalBytes = pdfs.reduce(
              (sum, p) => sum + (p.tamanioBytes || 0),
              0,
            );
            setCleanPdfsData({
              isOpen: true,
              materiaId: materiaToEdit.id,
              materiaNombre: result.nombre,
              pdfCount: pdfs.length,
              totalBytes,
              notesCount: matNotes.length,
              notesList: matNotes,
              updatedMateria: result,
            });
            return; // Esperar decisión del alumno en el modal antes de cerrar
          }
        } catch (checkErr) {
          console.warn(
            "[MateriaModal] Error verificando PDFs de la materia:",
            checkErr,
          );
        }
      }

      onSuccess(result);
      onClose();
    } catch (err) {
      console.error("Error al guardar materia:", err);
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
            <span className={styles.tagBadge}>CURSADA</span>
            <span>{isEditing ? "EDITAR MATERIA" : "NUEVA MATERIA"}</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            title="Cerrar (Esc)"
          >
            <X size={14} />
            <span>ESC</span>
          </button>
        </div>

        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BookOpen size={20} color="var(--primary)" />
            <h2 className={styles.modalTitle}>
              {isEditing
                ? `Editar: ${materiaToEdit?.nombre}`
                : "Registrar Asignatura / Cursada"}
            </h2>
          </div>
          <p className={styles.modalSub}>
            {isEditing
              ? "Modificá los datos académicos, profesores y reglas de acreditación de la materia."
              : "Ingresá los datos académicos para comenzar a registrar notas, fechas de examen, apuntes y bibliografía."}
          </p>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Nombre y Código */}
          <div className={styles.row2}>
            <div className={styles.formGroup} style={{ gridColumn: "span 1" }}>
              <label className={styles.label}>Nombre de la Materia *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ej: Sistemas Distribuidos"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className={styles.formGroup} style={{ gridColumn: "span 1" }}>
              <label className={styles.label}>Código de Cátedra</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ej: 75.08 o SIS-304"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
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
                onChange={(e) => setAnio(Number(e.target.value))}
              >
                {Array.from(
                  {
                    length: Math.max(
                      activeCarrera?.duracion_anios || 5,
                      anio,
                      1,
                    ),
                  },
                  (_, i) => i + 1,
                ).map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}° Año
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Cuatrimestre</label>
              <select
                className={styles.select}
                value={cuatrimestre}
                onChange={(e) =>
                  setCuatrimestre(e.target.value as "1C" | "2C" | "Anual")
                }
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
                onChange={(e) => {
                  const nextEstado = e.target.value as EstadoMateria;
                  setEstado(nextEstado);
                  if (nextEstado === "PROMOCIONADA") {
                    setTipoAprobacion("PROMOCION");
                    setShowRulesConfig(false);
                  } else if (nextEstado === "APROBADA") {
                    setTipoAprobacion("FINAL");
                    setShowRulesConfig(false);
                  }
                }}
              >
                <option value="CURSANDO">Cursando actualmente</option>
                <option value="APROBADA">Aprobada (con Examen Final)</option>
                <option value="PROMOCIONADA">
                  Aprobada (Promoción Directa)
                </option>
                <option value="REGULAR">Regularizada (Final pendiente)</option>
                <option value="LIBRE">Libre</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Modalidad de Dictado</label>
              <select
                className={styles.select}
                value={modalidad}
                onChange={(e) =>
                  setModalidad(
                    e.target.value as "Presencial" | "Virtual" | "Híbrida",
                  )
                }
              >
                <option value="Presencial">Presencial</option>
                <option value="Virtual">Virtual</option>
                <option value="Híbrida">Híbrida</option>
              </select>
            </div>
          </div>

          {/* Bloque especial: Datos de Aprobación & Calificación */}
          {(estado === "APROBADA" || estado === "PROMOCIONADA") && (
            <div className={styles.aprobacionBox}>
              <div className={styles.aprobacionHeader}>
                <Award size={16} className={styles.aprobacionIcon} />
                <span className={styles.aprobacionTitle}>
                  Datos de Aprobación{" "}
                  {estado === "PROMOCIONADA"
                    ? "(Promoción Directa)"
                    : "(Examen Final)"}
                  {activeCarrera ? ` • ${activeCarrera.nombre}` : ""}
                </span>
              </div>

              <div className={styles.row2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    {tipoAprobacion === "EQUIVALENCIA"
                      ? "Calificación / Nota (Opcional)"
                      : "Calificación / Nota Final (1 al 10) *"}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    className={styles.input}
                    value={notaFinal}
                    onChange={(e) =>
                      setNotaFinal(e.target.value === "" ? "" : e.target.value)
                    }
                    placeholder="Ej: 8"
                    required={tipoAprobacion !== "EQUIVALENCIA"}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    {fechaExactaDesconocida
                      ? "Año de Aprobación *"
                      : "Fecha de Aprobación *"}
                  </label>

                  {fechaExactaDesconocida ? (
                    <input
                      type="number"
                      min="1980"
                      max={new Date().getFullYear() + 1}
                      className={styles.input}
                      value={anioAprobacion}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAnioAprobacion(val === "" ? "" : val);
                        if (val !== "" && !isNaN(parseInt(val, 10))) {
                          setFechaAprobacion(`${val}-12-31`);
                        }
                      }}
                      placeholder={`Ej: ${new Date().getFullYear()}`}
                      required
                    />
                  ) : (
                    <input
                      type="date"
                      className={styles.input}
                      value={fechaAprobacion}
                      onChange={(e) => setFechaAprobacion(e.target.value)}
                      required
                    />
                  )}

                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "11px",
                      color: fechaExactaDesconocida
                        ? "var(--primary-glow)"
                        : "var(--text-muted)",
                      cursor: "pointer",
                      userSelect: "none",
                      marginTop: "6px",
                      fontWeight: 500,
                    }}
                    title="Si no recuerdas el día y mes exacto, puedes indicar solo el año"
                  >
                    <input
                      type="checkbox"
                      checked={fechaExactaDesconocida}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFechaExactaDesconocida(checked);
                        if (checked) {
                          setFechaAprobacion(`${anioAprobacion}-12-31`);
                        } else {
                          setFechaAprobacion(
                            new Date().toISOString().split("T")[0],
                          );
                        }
                      }}
                      style={{
                        cursor: "pointer",
                        accentColor: "var(--primary)",
                      }}
                    />
                    <span>Fecha exacta desconocida (indicar solo el año)</span>
                  </label>
                </div>
              </div>

              <div className={styles.row3}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Modalidad de Aprobación
                  </label>
                  <select
                    className={styles.select}
                    value={tipoAprobacion}
                    onChange={(e) => setTipoAprobacion(e.target.value)}
                  >
                    <option value="FINAL">Examen Final Regular</option>
                    <option value="PROMOCION">Promoción Directa</option>
                    <option value="LIBRE">Examen Final Libre</option>
                    <option value="EQUIVALENCIA">
                      Equivalencia / Reconocimiento
                    </option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Libro / Tomo (Opcional)
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Ej: Tomo 14"
                    value={libroActa}
                    onChange={(e) => setLibroActa(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Folio / Acta (Opcional)
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Ej: Folio 240"
                    value={folioActa}
                    onChange={(e) => setFolioActa(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Comisión y Docentes */}
          <div className={styles.row3}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Comisión / Turno</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ej: K3051 o Noche"
                value={comision}
                onChange={(e) => setComision(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Profesor Titular</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ej: Dr. García"
                value={profesorTitular}
                onChange={(e) => setProfesorTitular(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>JTP / Ayudante</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ej: Ing. Martínez"
                value={profesorJtp}
                onChange={(e) => setProfesorJtp(e.target.value)}
              />
            </div>
          </div>

          {/* Configuración de Reglas de Acreditación (Ocultas por defecto si ya está aprobada) */}
          {isAprobada ? (
            !showRulesConfig ? (
              <div style={{ margin: "4px 0 10px 0" }}>
                <button
                  type="button"
                  onClick={() => setShowRulesConfig(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-dim)",
                    fontSize: "11px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 0",
                  }}
                >
                  <Award size={13} color="var(--primary)" />
                  <span>
                    + Configurar reglas de acreditación de cursada (opcional)
                  </span>
                </button>
              </div>
            ) : (
              <div className={styles.rulesSection}>
                <div className={styles.rulesSectionHeader}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Award size={14} color="var(--primary)" />
                    <span>Reglas de Acreditación de Cursada</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <button
                      type="button"
                      className={`${styles.promoToggleBtn} ${permitePromocion ? styles.promoToggleBtnActive : ""}`}
                      onClick={() => setPermitePromocion(!permitePromocion)}
                    >
                      {permitePromocion
                        ? "✓ Admite Promoción Directa"
                        : "🚫 Sin Promoción"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRulesConfig(false)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        fontSize: "11px",
                        cursor: "pointer",
                      }}
                    >
                      Ocultar
                    </button>
                  </div>
                </div>

                {permitePromocion ? (
                  <div className={styles.formGroup}>
                    <label
                      className={styles.label}
                      style={{ fontSize: "10px" }}
                    >
                      Condición para Promoción Directa
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ej: Promedio ≥ 8.0, parciales ≥ 7.0 y coloquio aprobado"
                      value={condicionPromocion}
                      onChange={(e) => setCondicionPromocion(e.target.value)}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--amber)",
                      backgroundColor: "var(--amber-alpha)",
                      padding: "6px 10px",
                      borderRadius: "var(--radius-xs)",
                      border: "1px solid var(--amber-border)",
                    }}
                  >
                    Esta materia requerirá obligatoriamente aprobación de examen
                    final tras regularizar.
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "10px",
                  }}
                >
                  <div className={styles.formGroup}>
                    <label
                      className={styles.label}
                      style={{ fontSize: "10px" }}
                    >
                      Condición para Regularizar Cursada
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ej: Parciales ≥ 4.0, TPs entregados y 75% asistencia"
                      value={condicionRegularidad}
                      onChange={(e) => setCondicionRegularidad(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label
                      className={styles.label}
                      style={{ fontSize: "10px" }}
                    >
                      Asistencia Mínima (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className={styles.input}
                      value={minAsistencia}
                      onChange={(e) =>
                        setMinAsistencia(
                          e.target.value === "" ? "" : e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className={styles.rulesSection}>
              <div className={styles.rulesSectionHeader}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Award size={14} color="var(--primary)" />
                  <span>Reglas de Acreditación de Cursada</span>
                </div>
                <button
                  type="button"
                  className={`${styles.promoToggleBtn} ${permitePromocion ? styles.promoToggleBtnActive : ""}`}
                  onClick={() => setPermitePromocion(!permitePromocion)}
                >
                  {permitePromocion
                    ? "✓ Admite Promoción Directa"
                    : "🚫 Sin Promoción (Final Obligatorio)"}
                </button>
              </div>

              {permitePromocion ? (
                <div className={styles.formGroup}>
                  <label className={styles.label} style={{ fontSize: "10px" }}>
                    Condición para Promoción Directa
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Ej: Promedio ≥ 8.0, parciales ≥ 7.0 y coloquio aprobado"
                    value={condicionPromocion}
                    onChange={(e) => setCondicionPromocion(e.target.value)}
                  />
                </div>
              ) : (
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--amber)",
                    backgroundColor: "var(--amber-alpha)",
                    padding: "6px 10px",
                    borderRadius: "var(--radius-xs)",
                    border: "1px solid var(--amber-border)",
                  }}
                >
                  Esta materia requerirá obligatoriamente aprobación de examen
                  final tras regularizar.
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr",
                  gap: "10px",
                }}
              >
                <div className={styles.formGroup}>
                  <label className={styles.label} style={{ fontSize: "10px" }}>
                    Condición para Regularizar Cursada
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Ej: Parciales ≥ 4.0, TPs entregados y 75% asistencia"
                    value={condicionRegularidad}
                    onChange={(e) => setCondicionRegularidad(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} style={{ fontSize: "10px" }}>
                    Asistencia Mínima (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className={styles.input}
                    value={minAsistencia}
                    onChange={(e) =>
                      setMinAsistencia(
                        e.target.value === "" ? "" : e.target.value,
                      )
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Color de Identificación */}
          <div className={styles.formGroup}>
            <ColorPickerRGB
              value={color}
              onChange={(newColor) => setColor(newColor)}
              label="Color Identificador de la Materia"
              hint="💡 Este color se utiliza para distinguir visualmente los bloques de la materia en los Horarios de cursada, calendarios y apuntes."
            />
          </div>

          {/* Actions */}
          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
            >
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
                  ? isEditing
                    ? "Guardando..."
                    : "Registrando..."
                  : isEditing
                    ? "Guardar Cambios"
                    : "Registrar Materia"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal de confirmación para depurar PDFs al aprobar materia */}
      {cleanPdfsData && (
        <CleanApprovedPdfsModal
          isOpen={cleanPdfsData.isOpen}
          onClose={() => {
            const res = cleanPdfsData.updatedMateria;
            setCleanPdfsData(null);
            onSuccess(res);
            onClose();
          }}
          materiaNombre={cleanPdfsData.materiaNombre}
          pdfCount={cleanPdfsData.pdfCount}
          totalBytes={cleanPdfsData.totalBytes}
          notesCount={cleanPdfsData.notesCount}
          onDownloadNotesZip={() => {
            exportMateriaNotesZip(
              cleanPdfsData.materiaNombre,
              cleanPdfsData.notesList,
            );
          }}
          onConfirmDeletePdfs={async () => {
            await materialesService.deleteMaterialesByMateria(
              cleanPdfsData.materiaId,
            );
          }}
        />
      )}
    </div>
  );
};

export default MateriaModal;
