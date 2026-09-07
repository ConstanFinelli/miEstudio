import React, { useState } from "react";
import styles from "./HorariosView.module.css";
import { Clock, Plus, Filter } from "lucide-react";
import { WeeklyScheduleGrid } from "./components";

import { HorarioModal } from "../../components/modals";
import { useHorarios, useMaterias } from "../../hooks";

export const HorariosView: React.FC = () => {
  const [selectedCuatri, setSelectedCuatri] = useState<
    "TODOS" | "1C" | "2C" | "Anual"
  >("TODOS");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { refresh } = useHorarios();
  const { materias } = useMaterias();

  const cursandoCount = materias.filter((m) => m.estado === "CURSANDO").length;

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
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>
            <Filter size={11} style={{ display: "inline", marginRight: 4 }} />
            Cuatrimestre:
          </span>
          <div className={styles.filterPills}>
            {cuatris.map((c) => (
              <button
                key={c}
                className={`${styles.pill} ${selectedCuatri === c ? styles.pillActive : ""}`}
                onClick={() => setSelectedCuatri(c)}
              >
                {c === "TODOS" ? "Todos los Cuatrimestres" : c}
              </button>
            ))}
          </div>
        </div>

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
      <WeeklyScheduleGrid filterCuatri={selectedCuatri} />

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
