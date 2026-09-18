import React, { useState, useEffect, useMemo } from "react";
import styles from "./HorariosView.module.css";
import { Clock, Plus, Filter, GraduationCap, Layers } from "lucide-react";
import { WeeklyScheduleGrid } from "./components";

import { HorarioModal } from "../../components/modals";
import { useHorarios, useMaterias } from "../../hooks";
import { useAuth } from "../../context/AuthContext";

export const HorariosView: React.FC = () => {
  const { carreras, activeCarrera } = useAuth();

  // Predeterminado: la carrera activa seleccionada (o 'TODAS' si no hubiera ninguna activa)
  const [selectedCarreraId, setSelectedCarreraId] = useState<string>(() => {
    return activeCarrera?.id || "TODAS";
  });

  const [selectedCuatri, setSelectedCuatri] = useState<
    "TODOS" | "1C" | "2C" | "Anual"
  >("TODOS");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { refresh } = useHorarios();
  // Cargamos todas las materias del usuario para permitir vista unificada o filtrada
  const { materias } = useMaterias(undefined, undefined, "ALL");

  // Sincronizar con la carrera activa si el usuario la cambia desde la navegación principal
  useEffect(() => {
    if (activeCarrera?.id) {
      setSelectedCarreraId(activeCarrera.id);
    }
  }, [activeCarrera?.id]);

  // Contabilizar materias en cursada según el filtro de carrera y cuatrimestre seleccionado
  const activeMateriasFiltered = useMemo(() => {
    return materias.filter((m) => {
      if (m.estado !== "CURSANDO") return false;
      if (selectedCarreraId !== "TODAS") {
        const matCarreraId = m.carreraId || m.carrera_id;
        if (matCarreraId !== selectedCarreraId) return false;
      }
      if (selectedCuatri !== "TODOS" && m.cuatrimestre !== selectedCuatri) {
        return false;
      }
      return true;
    });
  }, [materias, selectedCarreraId, selectedCuatri]);

  const cursandoCount = activeMateriasFiltered.length;
  const hasMultipleCarreras = carreras && carreras.length > 1;

  const cuatris: ("TODOS" | "1C" | "2C" | "Anual")[] = [
    "TODOS",
    "1C",
    "2C",
    "Anual",
  ];

  return (
    <div className={styles.container}>
      {/* 1. View Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.titleRow}>
            <div className={styles.iconSquare}>
              <Clock size={18} />
            </div>
            <h1 className={styles.title}>Horarios de Cursada</h1>
          </div>
          <p className={styles.subtitle}>
            Diagramá tu cronograma semanal de cursada de lunes a viernes con
            soporte para turnos de distintas facultades, sedes y modalidades.
          </p>
        </div>

        <div className={styles.actionsGroup}>
          <button
            className={styles.btnPrimary}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={15} />
            <span>Nuevo Horario de Cursada</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Status Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filtersLeft}>
          {/* Filtro por Carrera (Todas las carreras o cada una de las disponibles) */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>
              <GraduationCap
                size={13}
                style={{ display: "inline", marginRight: 4, verticalAlign: "-2px" }}
              />
              Carrera:
            </span>
            <div className={styles.filterPills}>
              <button
                type="button"
                className={`${styles.pill} ${selectedCarreraId === "TODAS" ? styles.pillActive : ""}`}
                onClick={() => setSelectedCarreraId("TODAS")}
                title="Ver horarios combinados de todas tus carreras"
              >
                Todas las Carreras
              </button>
              {carreras.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.pill} ${selectedCarreraId === c.id ? styles.pillActive : ""}`}
                  onClick={() => setSelectedCarreraId(c.id)}
                  title={`Filtrar horarios de ${c.nombre}`}
                >
                  {c.nombre}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filtersDivider} />

          {/* Filtro por Cuatrimestre */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>
              <Filter
                size={11}
                style={{ display: "inline", marginRight: 4, verticalAlign: "-1px" }}
              />
              Cuatrimestre:
            </span>
            <div className={styles.filterPills}>
              {cuatris.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.pill} ${selectedCuatri === c ? styles.pillActive : ""}`}
                  onClick={() => setSelectedCuatri(c)}
                >
                  {c === "TODOS" ? "Todos los Cuatrimestres" : c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-muted)",
          }}
        >
          {selectedCarreraId === "TODAS" && hasMultipleCarreras && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(99, 102, 241, 0.1)",
                color: "var(--primary)",
                padding: "3px 8px",
                borderRadius: "4px",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                fontWeight: 600,
              }}
            >
              <Layers size={11} />
              {carreras.length} carreras combinadas
            </span>
          )}

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              background: "rgba(16, 185, 129, 0.1)",
              color: "var(--emerald)",
              padding: "3px 8px",
              borderRadius: "4px",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--emerald)",
              }}
            />
            {cursandoCount}{" "}
            {cursandoCount === 1 ? "materia en cursada" : "materias en cursada"}
          </span>
        </div>
      </div>

      {/* 3. Weekly Schedule Grid */}
      <WeeklyScheduleGrid
        filterCuatri={selectedCuatri}
        filterCarreraId={selectedCarreraId}
        allMaterias={materias}
      />

      {/* Modal for creating a new class schedule */}
      <HorarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          refresh();
        }}
      />
    </div>
  );
};

export default HorariosView;
