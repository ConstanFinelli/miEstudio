import React, { useState } from "react";
import styles from "./MallaCurricularView.module.css";
import { useMaterias } from "../../hooks";
import { useAuth } from "../../context";
import { useMallaCurricular } from "./hooks/useMallaCurricular";
import { MallaCanvas } from "./components/MallaCanvas";
import { MateriaDrawer } from "./components/MateriaDrawer";
import { EditCorrelativasModal } from "./components/EditCorrelativasModal";
import { MallaReferencias } from "./components/MallaReferencias";

import {
  Network,
  FlaskConical,
  RotateCcw,
  Sparkles,
  BookOpen,
} from "lucide-react";

export const MallaCurricularView: React.FC = () => {
  const { materias, updateMateria } = useMaterias();
  const { activeCarrera } = useAuth();

  const {
    selectedMateriaId,
    setSelectedMateriaId,
    hoveredMateriaId,
    setHoveredMateriaId,
    selectedMateriaData,
    activeConnections,
    materiasByYear,
    yearsList,
    isSimulationActive,
    simulatedApprovedIds,
    toggleSimulation,
    toggleSimulateSubject,
    resetSimulation,
    statusFilter,
    setStatusFilter,
    stats,
  } = useMallaCurricular({ materias });

  // Estado para el panel lateral de diagnóstico
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modal de edición de correlativas
  const [editingMateriaId, setEditingMateriaId] = useState<string | null>(null);

  const editingMateria = editingMateriaId
    ? materias.find((m) => m.id === editingMateriaId) || null
    : null;

  const handleSaveCorrelativas = async (
    materiaId: string,
    cursarIds: string[],
    rendirIds: string[],
  ) => {
    await updateMateria(materiaId, {
      correlativasCursar: cursarIds,
      correlativasRendir: rendirIds,
    });
  };

  return (
    <div className={styles.mallaContainer}>
      {/* Header & Controls */}
      <div className={styles.mallaHeader}>
        <div className={styles.headerTop}>
          <div className={styles.titleGroup}>
            <div className={styles.titleIcon}>
              <Network size={20} />
            </div>
            <div>
              <h1 className={styles.mainTitle}>Plan de Estudio</h1>
              <p className={styles.subtitle}>
                {activeCarrera?.nombre || "Carrera Universitaria"} •{" "}
                {activeCarrera?.facultad_sede || "Plan de Estudio"}
              </p>
            </div>
          </div>

          <div className={styles.headerRight}>
            {/* Stats Bar */}
            <div className={styles.statsBar}>
              <div className={styles.statChip}>
                <span>Plan Acreditado:</span>
                <span
                  className={styles.statChipVal}
                  style={{ color: "var(--emerald)" }}
                >
                  {stats.porcentajeCarrera}%
                </span>
              </div>
              <div className={styles.statChip}>
                <span>Aprobadas:</span>
                <span className={styles.statChipVal}>
                  {stats.aprobadasCount}/{stats.totalMaterias}
                </span>
              </div>
              <div className={styles.statChip}>
                <span>Cursando:</span>
                <span
                  className={styles.statChipVal}
                  style={{ color: "var(--primary-glow)" }}
                >
                  {stats.cursandoCount}
                </span>
              </div>
              <div className={styles.statChip}>
                <span>Habilitadas:</span>
                <span className={styles.statChipVal} style={{ color: "#22d3ee" }}>
                  {stats.habilitadasCount}
                </span>
              </div>
              <div className={styles.statChip}>
                <span>Bloqueadas:</span>
                <span
                  className={styles.statChipVal}
                  style={{ color: "var(--text-muted)" }}
                >
                  {stats.bloqueadasCount}
                </span>
              </div>
            </div>

            {/* Simulation mode switch */}
            <button
              type="button"
              className={`${styles.simSwitchBtn} ${isSimulationActive ? styles.simSwitchBtnActive : ""}`}
              onClick={toggleSimulation}
              title="Activar sandbox de proyección para ver qué desbloquearías al aprobar materias"
            >
              <FlaskConical size={14} />
              <span>
                {isSimulationActive
                  ? "Modo Simulación Activo"
                  : "Simular Aprobaciones"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Referencias del Plan de Estudio */}
      <MallaReferencias
        stats={stats}
        statusFilter={statusFilter}
        onSelectStatusFilter={setStatusFilter}
      />

      {/* Simulation Banner if active */}
      {isSimulationActive && (
        <div className={styles.simBanner}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={14} color="var(--emerald)" />
            <span>
              <strong>Modo Simulación Activo:</strong> Haz clic en el botón{" "}
              <em>"Simular"</em> de cualquier materia pendiente para proyectar
              en tiempo real qué asignaturas de años superiores desbloquearías.
              {simulatedApprovedIds.size > 0 && (
                <span style={{ marginLeft: "6px", color: "var(--emerald)" }}>
                  ({simulatedApprovedIds.size}{" "}
                  {simulatedApprovedIds.size === 1
                    ? "materia simulada"
                    : "materias simuladas"}
                  )
                </span>
              )}
            </span>
          </div>

          {simulatedApprovedIds.size > 0 && (
            <button
              type="button"
              className={styles.simResetBtn}
              onClick={resetSimulation}
              title="Restablecer simulación a los estados reales"
            >
              <RotateCcw
                size={11}
                style={{ marginRight: "4px", verticalAlign: "middle" }}
              />
              Restablecer
            </button>
          )}
        </div>
      )}

      {/* Interactive Canvas */}
      {materias.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            color: "var(--text-muted)",
          }}
        >
          <BookOpen size={36} strokeWidth={1.5} />
          <p style={{ fontSize: "14px" }}>
            No hay materias registradas en la carrera activa.
          </p>
        </div>
      ) : (
        <MallaCanvas
          yearsList={yearsList}
          materiasByYear={materiasByYear}
          selectedMateriaId={selectedMateriaId}
          hoveredMateriaId={hoveredMateriaId}
          activeConnections={activeConnections}
          statusFilter={statusFilter}
          isSimulationActive={isSimulationActive}
          onSelectMateria={(id) =>
            setSelectedMateriaId((prev) => (!id || prev === id ? null : id))
          }
          onHoverMateria={(id) => setHoveredMateriaId(id)}
          onToggleSimulate={toggleSimulateSubject}
          onOpenDrawer={() => setIsDrawerOpen(true)}
        />
      )}

      {/* Side Drawer with subject diagnosis */}
      {isDrawerOpen && selectedMateriaData && (
        <MateriaDrawer
          nodeData={selectedMateriaData}
          onClose={() => setIsDrawerOpen(false)}
          onSelectMateria={(id) => setSelectedMateriaId(id)}
          onOpenEditCorrelativas={(id) => setEditingMateriaId(id)}
        />
      )}

      {/* Modal to configure correlativas */}
      <EditCorrelativasModal
        isOpen={Boolean(editingMateriaId)}
        materia={editingMateria}
        allMaterias={materias}
        onClose={() => setEditingMateriaId(null)}
        onSave={handleSaveCorrelativas}
      />
    </div>
  );
};
