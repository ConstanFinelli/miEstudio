import React, { useState } from "react";
import styles from "./MallaReferencias.module.css";
import type { StatusFilter } from "../../../../types/malla";
import {
  CheckCircle2,
  Award,
  BookOpen,
  Sparkles,
  Lock,
  Info,
  ChevronDown,
  ChevronUp,
  Network,
} from "lucide-react";

interface MallaReferenciasProps {
  stats: {
    totalMaterias: number;
    aprobadasCount: number;
    promocionadasCount?: number;
    cursandoCount: number;
    regularesCount: number;
    habilitadasCount: number;
    bloqueadasCount: number;
  };
  statusFilter: StatusFilter;
  onSelectStatusFilter: (status: StatusFilter) => void;
}

export const MallaReferencias: React.FC<MallaReferenciasProps> = ({
  stats,
  statusFilter,
  onSelectStatusFilter,
}) => {
  const [showGuide, setShowGuide] = useState(false);

  const handleChipClick = (target: StatusFilter) => {
    if (statusFilter === target) {
      onSelectStatusFilter("TODOS");
    } else {
      onSelectStatusFilter(target);
    }
  };

  return (
    <div className={styles.referenciasContainer}>
      <div className={styles.barRow}>
        {/* Left: State Chips */}
        <div className={styles.leftGroup}>
          <div className={styles.legendTitle}>
            <span>Referencias</span>
          </div>

          <div className={styles.chipsList}>
            {/* Aprobadas */}
            <button
              type="button"
              className={`${styles.statusChip} ${styles.chipAprobada} ${
                statusFilter === "APROBADAS" ? styles.statusChipActive : ""
              }`}
              onClick={() => handleChipClick("APROBADAS")}
              title="Filtrar por materias aprobadas o promocionadas"
            >
              <CheckCircle2 size={12} />
              <span>Aprobada</span>
              <span className={styles.chipCount}>({stats.aprobadasCount})</span>
            </button>

            {/* Promocionada (visual reference) */}
            <button
              type="button"
              className={`${styles.statusChip} ${styles.chipPromocionada} ${
                statusFilter === "APROBADAS" ? styles.statusChipActive : ""
              }`}
              onClick={() => handleChipClick("APROBADAS")}
              title="Materias acreditadas por promoción directa"
            >
              <Award size={12} />
              <span>Promocionada</span>
              {typeof stats.promocionadasCount === "number" &&
                stats.promocionadasCount > 0 && (
                  <span className={styles.chipCount}>
                    ({stats.promocionadasCount})
                  </span>
                )}
            </button>

            {/* Cursando */}
            <button
              type="button"
              className={`${styles.statusChip} ${styles.chipCursando} ${
                statusFilter === "CURSANDO" ? styles.statusChipActive : ""
              }`}
              onClick={() => handleChipClick("CURSANDO")}
              title="Filtrar por materias en cursada actual"
            >
              <BookOpen size={12} />
              <span>Cursando</span>
              <span className={styles.chipCount}>({stats.cursandoCount})</span>
            </button>

            {/* Regular */}
            <button
              type="button"
              className={`${styles.statusChip} ${styles.chipRegular} ${
                statusFilter === "REGULARES" ? styles.statusChipActive : ""
              }`}
              onClick={() => handleChipClick("REGULARES")}
              title="Filtrar por materias regulares (cursada aprobada, pendiente examen final)"
            >
              <Sparkles size={12} />
              <span>Regular</span>
              <span className={styles.chipCount}>({stats.regularesCount})</span>
            </button>

            {/* Habilitada */}
            <button
              type="button"
              className={`${styles.statusChip} ${styles.chipHabilitada} ${
                statusFilter === "HABILITADAS" ? styles.statusChipActive : ""
              }`}
              onClick={() => handleChipClick("HABILITADAS")}
              title="Filtrar por materias habilitadas para cursar"
            >
              <span className={styles.chipDot} />
              <span>Habilitada</span>
              <span className={styles.chipCount}>
                ({stats.habilitadasCount})
              </span>
            </button>

            {/* Bloqueada */}
            <button
              type="button"
              className={`${styles.statusChip} ${styles.chipBloqueada} ${
                statusFilter === "BLOQUEADAS" ? styles.statusChipActive : ""
              }`}
              onClick={() => handleChipClick("BLOQUEADAS")}
              title="Filtrar por materias con correlativas faltantes"
            >
              <Lock size={11} />
              <span>Bloqueada</span>
              <span className={styles.chipCount}>
                ({stats.bloqueadasCount})
              </span>
            </button>

            {/* Reset filter button if one is active */}
            {statusFilter !== "TODOS" && (
              <button
                type="button"
                className={styles.statusChip}
                onClick={() => onSelectStatusFilter("TODOS")}
                style={{ background: "transparent", borderStyle: "dashed" }}
                title="Mostrar todos los estados"
              >
                <span>Mostrar todas</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Connections & Toggle Guide */}
        <div className={styles.rightGroup}>
          <div className={styles.connectionsLegend}>
            <div
              className={styles.connectionItem}
              title="Requisito previo requerido para cursar o rendir la materia seleccionada"
            >
              <span className={styles.lineSampleAmber} />
              <span>Correlativa previa</span>
            </div>
            <div
              className={styles.connectionItem}
              title="Materia futura que se desbloquea al aprobar la seleccionada"
            >
              <span className={styles.lineSampleEmerald} />
              <span>Desbloquea</span>
            </div>
          </div>

          <button
            type="button"
            className={`${styles.infoToggleBtn} ${showGuide ? styles.infoToggleBtnActive : ""}`}
            onClick={() => setShowGuide((prev) => !prev)}
            title="Ver guía y significado de cada estado"
          >
            <Info size={13} />
            <span>Guía</span>
            {showGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Expandable Guide Panel */}
      {showGuide && (
        <div className={styles.guidePanel}>
          <div>
            <div className={styles.guideSectionTitle}>
              <Network size={13} color="var(--primary-glow)" />
              <span>Significado de los Estados Académicos</span>
            </div>
            <div className={styles.guideList}>
              <div className={styles.guideItem}>
                <CheckCircle2
                  size={12}
                  color="var(--emerald)"
                  style={{ marginTop: "2px", flexShrink: 0 }}
                />
                <div>
                  <span className={styles.guideItemTitle}>Aprobada: </span>
                  <span className={styles.guideItemDesc}>
                    Cursada acreditada y examen final aprobado con su
                    calificación final.
                  </span>
                </div>
              </div>
              <div className={styles.guideItem}>
                <Award
                  size={12}
                  color="#34d399"
                  style={{ marginTop: "2px", flexShrink: 0 }}
                />
                <div>
                  <span className={styles.guideItemTitle}>Promocionada: </span>
                  <span className={styles.guideItemDesc}>
                    Acreditada directamente por promedio de cursada sin
                    necesidad de rendir final.
                  </span>
                </div>
              </div>
              <div className={styles.guideItem}>
                <BookOpen
                  size={12}
                  color="var(--primary-glow)"
                  style={{ marginTop: "2px", flexShrink: 0 }}
                />
                <div>
                  <span className={styles.guideItemTitle}>Cursando: </span>
                  <span className={styles.guideItemDesc}>
                    Materia inscripta y en curso en el período actual.
                  </span>
                </div>
              </div>
              <div className={styles.guideItem}>
                <Sparkles
                  size={12}
                  color="#c084fc"
                  style={{ marginTop: "2px", flexShrink: 0 }}
                />
                <div>
                  <span className={styles.guideItemTitle}>Regular: </span>
                  <span className={styles.guideItemDesc}>
                    Cursada aprobada (regularizada). Habilitado para presentarse
                    a rendir el examen final.
                  </span>
                </div>
              </div>
              <div className={styles.guideItem}>
                <span
                  className={styles.chipDot}
                  style={{ color: "#22d3ee", marginTop: "5px", flexShrink: 0 }}
                />
                <div>
                  <span className={styles.guideItemTitle}>Habilitada: </span>
                  <span className={styles.guideItemDesc}>
                    Cumple todas las correlativas previas requeridas. Lista para
                    cursar.
                  </span>
                </div>
              </div>
              <div className={styles.guideItem}>
                <Lock
                  size={12}
                  color="var(--text-muted)"
                  style={{ marginTop: "2px", flexShrink: 0 }}
                />
                <div>
                  <span className={styles.guideItemTitle}>Bloqueada: </span>
                  <span className={styles.guideItemDesc}>
                    Aún adeuda correlativas requeridas para poder inscribirse o
                    cursar.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className={styles.guideSectionTitle}>
              <Info size={13} color="var(--amber)" />
              <span>Cómo leer el mapa interactivo</span>
            </div>
            <div className={styles.guideList}>
              <div className={styles.guideItem}>
                <span style={{ color: "var(--amber)", fontWeight: 700 }}>
                  •
                </span>
                <div>
                  <span className={styles.guideItemTitle}>
                    Inspección de correlatividades:{" "}
                  </span>
                  <span className={styles.guideItemDesc}>
                    Haz clic o pasa el cursor sobre cualquier materia para
                    visualizar las curvas de dependencias. Hacia la izquierda
                    (ámbar) verás qué necesitas antes; hacia la derecha (verde)
                    qué se habilitará.
                  </span>
                </div>
              </div>
              <div className={styles.guideItem}>
                <span style={{ color: "var(--emerald)", fontWeight: 700 }}>
                  •
                </span>
                <div>
                  <span className={styles.guideItemTitle}>
                    Modo Simulación:{" "}
                  </span>
                  <span className={styles.guideItemDesc}>
                    Haz clic en "Simular Aprobaciones" en la barra superior para
                    activar el sandbox interactivo y proyectar en tiempo real el
                    impacto de aprobar cualquier materia.
                  </span>
                </div>
              </div>
              <div className={styles.guideItem}>
                <span style={{ color: "var(--primary-glow)", fontWeight: 700 }}>
                  •
                </span>
                <div>
                  <span className={styles.guideItemTitle}>
                    Panel de diagnóstico:{" "}
                  </span>
                  <span className={styles.guideItemDesc}>
                    Al hacer clic en cualquier materia se abre el panel lateral
                    donde puedes consultar el detalle de correlativas cumplidas
                    y faltantes, tanto para cursar como para rendir.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
