import React from "react";
import styles from "./DashboardKpis.module.css";
import {
  Calculator,
  GraduationCap,
  Layers,
  TrendingUp,
} from "lucide-react";
import {
  usePerfil,
  useMaterias,
  useHorarios,
} from "../../../../hooks";
import { useAuth } from "../../../../context/AuthContext";

interface DashboardKpisProps {
  onGoToMaterias: () => void;
  onGoToCalendario?: () => void;
  onGoToHorarios?: () => void;
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({
  onGoToMaterias,
  onGoToHorarios,
}) => {
  const { activeCarrera } = useAuth();
  const { perfil } = usePerfil();
  const { materias } = useMaterias();
  const { horarios } = useHorarios();

  const activeSubjects = materias.filter((m) => m.estado === "CURSANDO");

  // Cálculo de carga horaria basado en los horarios de cursada activos
  const parseTimeToMinutes = (timeStr?: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":").map(Number);
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  };

  const activeSubjectIds = new Set(activeSubjects.map((m) => m.id));
  const activeHorarios = horarios.filter((h) => {
    if (activeSubjects.length === 0) return false;
    if (h.materiaId) return activeSubjectIds.has(h.materiaId);
    return true;
  });

  let totalMins = 0;
  activeHorarios.forEach((h) => {
    const diff =
      parseTimeToMinutes(h.horaFin) - parseTimeToMinutes(h.horaInicio);
    if (diff > 0) totalMins += diff;
  });

  const hoursFromSchedule = Math.floor(totalMins / 60);
  const minsFromSchedule = totalMins % 60;
  const hasRealSchedule = totalMins > 0;
  const cargaHorariaTexto = hasRealSchedule
    ? minsFromSchedule > 0
      ? `${hoursFromSchedule}h ${minsFromSchedule}m/sem`
      : `${hoursFromSchedule} hs/sem`
    : `${activeSubjects.length * 4} hs/sem`;

  if (!perfil) return null;

  // Real data calculations
  const approvedSubjects = materias.filter(
    (m) => m.estado === "APROBADA" || m.estado === "PROMOCIONADA",
  );
  const totalApproved =
    perfil?.materiasAprobadas && perfil.materiasAprobadas > 0
      ? perfil.materiasAprobadas
      : approvedSubjects.length;

  // Si no hay materias cargadas en la carrera, el total debe ser 0 para no mostrar números falsos/hardcodeados
  const totalPlan =
    materias.length === 0
      ? 0
      : (activeCarrera?.total_materias_plan && activeCarrera.total_materias_plan > 0
          ? Math.max(activeCarrera.total_materias_plan, materias.length)
          : (perfil?.materiasTotales && perfil.materiasTotales > 0
              ? Math.max(perfil.materiasTotales, materias.length)
              : materias.length));

  const progressPercent =
    totalPlan > 0
      ? Math.min(100, Math.round((totalApproved / totalPlan) * 100))
      : 0;

  // Promedio calculation from real grades
  const gradedSubjects = materias.filter((m) => m.promedio && m.promedio > 0);
  const computedAverage =
    gradedSubjects.length > 0
      ? gradedSubjects.reduce((acc, m) => acc + (m.promedio || 0), 0) /
        gradedSubjects.length
      : 0;
  const displayAverage =
    perfil.promedioGeneral > 0 ? perfil.promedioGeneral : computedAverage;
  const hasPromedio = displayAverage > 0;

  return (
    <div className={styles.kpiGrid}>
      {/* KPI 1: Promedio General */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <div className={styles.kpiTitleGroup}>
            <span className={styles.kpiLabel}>Promedio General</span>
            <span className={styles.kpiSub}>Escala oficial (1 - 10)</span>
          </div>
          <div className={styles.kpiIconBox}>
            <Calculator size={15} />
          </div>
        </div>
        <div className={styles.kpiValueRow}>
          <span className={styles.kpiMainValue}>
            {hasPromedio ? displayAverage.toFixed(2) : "--"}
          </span>
          <span className={styles.kpiSubValue}>/ 10.0</span>
          {perfil.deltaPromedio !== 0 ? (
            <span className={styles.deltaBadge}>
              <TrendingUp size={11} />+{perfil.deltaPromedio} vs ciclo anterior
            </span>
          ) : (
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-dim)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {hasPromedio ? "Ciclo actual" : "Sin notas cargadas"}
            </span>
          )}
        </div>
        <div className={styles.kpiFooter}>
          {perfil.puestoCohorte > 0 ? (
            <>
              <span>Puesto: #{perfil.puestoCohorte} en cohorte</span>
              <span>Percentil {perfil.percentil}%</span>
            </>
          ) : (
            <>
              <span>Régimen regular</span>
              <span>
                {activeSubjects.length > 0
                  ? "Cursadas activas"
                  : "Sin cursadas"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* KPI 2: Progreso de Carrera */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <div className={styles.kpiTitleGroup}>
            <span className={styles.kpiLabel}>Progreso de Carrera</span>
            <span className={styles.kpiSub}>
              {totalPlan > 0
                ? `${totalApproved} de ${totalPlan} materias aprobadas`
                : "Sin materias cargadas"}
            </span>
          </div>
          <div className={styles.kpiIconBox}>
            <GraduationCap size={15} />
          </div>
        </div>
        <div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiMainValue}>{progressPercent}%</span>
            <span className={styles.kpiSubValue}>
              {totalPlan > 0
                ? `${Math.max(0, totalPlan - totalApproved)} pendientes`
                : "Plan por iniciar"}
            </span>
          </div>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className={styles.kpiFooter}>
          {totalPlan > 0 ? (
            <>
              <span>{totalApproved} materias acreditadas</span>
              <span>
                {Math.max(0, totalPlan - totalApproved)} para completar
              </span>
            </>
          ) : (
            <>
              <span>Sin materias cargadas aún</span>
              <span
                style={{ cursor: "pointer", color: "var(--primary-glow)" }}
                onClick={onGoToMaterias}
              >
                Cargar materias →
              </span>
            </>
          )}
        </div>
      </div>

      {/* KPI 3: Materias en Curso */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <div className={styles.kpiTitleGroup}>
            <span className={styles.kpiLabel}>Materias en Curso</span>
            <span className={styles.kpiSub}>En curso regular</span>
          </div>
          <div className={styles.kpiIconBox}>
            <Layers size={15} />
          </div>
        </div>
        <div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiMainValue}>{activeSubjects.length}</span>
            <span
              style={{
                fontSize: '12px',
                color: activeSubjects.length > 0 ? 'var(--emerald)' : 'var(--text-dim)',
              }}
            >
              {activeSubjects.length > 0 ? 'Todas regulares al día' : 'Sin materias activas'}
            </span>
          </div>
          <div className={styles.subjectPills}>
            {activeSubjects.slice(0, 4).map((subj) => (
              <span
                key={subj.id}
                className={styles.subjectMiniPill}
                title={subj.nombre}
              >
                {subj.codigo || subj.nombre.slice(0, 4)}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.kpiFooter}>
          {activeSubjects.length === 0 ? (
            <>
              <span>Sin cursadas activas</span>
              <span
                style={{ cursor: "pointer", color: "var(--primary-glow)" }}
                onClick={onGoToMaterias}
              >
                Ver materias →
              </span>
            </>
          ) : (
            <>
              <span
                title={
                  hasRealSchedule
                    ? `Calculado según ${activeHorarios.length} ${activeHorarios.length === 1 ? "clase semanal" : "clases semanales"} en Horarios de Cursada`
                    : "Estimación de 4 hs/sem por materia (sin horarios cargados aún)"
                }
              >
                {hasRealSchedule ? "Carga semanal: " : "Carga estimada: "}
                <strong
                  style={{
                    color: hasRealSchedule ? "var(--text-primary)" : "inherit",
                  }}
                >
                  {cargaHorariaTexto}
                </strong>
              </span>
              <span
                style={{ cursor: "pointer", color: "var(--primary-glow)" }}
                onClick={onGoToHorarios || onGoToMaterias}
                title={
                  hasRealSchedule
                    ? "Ver grilla semanal de horarios"
                    : "Cargar horarios de cursada"
                }
              >
                {hasRealSchedule ? "Ver horarios →" : "Cargar horarios →"}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardKpis;
