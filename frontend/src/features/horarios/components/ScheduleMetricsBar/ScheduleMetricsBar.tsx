import React from "react";
import styles from "./ScheduleMetricsBar.module.css";
import { Clock, Building2, Plus } from "lucide-react";

interface ScheduleMetricsBarProps {
  totalHoursStr: string;
  distinctMateriasCount: number;
  distinctSedes: string[];
  showSaturday: boolean;
  onToggleSaturday: (checked: boolean) => void;
  onOpenAddModal: () => void;
}

export const ScheduleMetricsBar: React.FC<ScheduleMetricsBarProps> = ({
  totalHoursStr,
  distinctMateriasCount,
  distinctSedes,
  showSaturday,
  onToggleSaturday,
  onOpenAddModal,
}) => {
  return (
    <div className={styles.topBar}>
      <div className={styles.metricsRow}>
        <div className={styles.metricBadge}>
          <Clock size={13} style={{ color: "var(--primary)" }} />
          <span>
            Carga Semanal: <strong>{totalHoursStr}</strong>
          </span>
        </div>
        <div className={styles.metricBadge}>
          <span>
            Materias: <strong>{distinctMateriasCount} activas</strong>
          </span>
        </div>
        {distinctSedes.length > 0 && (
          <div className={styles.metricBadge}>
            <Building2 size={13} style={{ color: "var(--emerald)" }} />
            <span>
              {distinctSedes.length === 1
                ? distinctSedes[0]
                : `${distinctSedes.length} sedes / facultades`}
            </span>
          </div>
        )}
      </div>

      <div className={styles.actionsRight}>
        <label className={styles.saturdayToggle}>
          <input
            type="checkbox"
            checked={showSaturday}
            onChange={(e) => onToggleSaturday(e.target.checked)}
          />
          <span>Incluir Sábados</span>
        </label>

        <button className={styles.btnAddHorario} onClick={onOpenAddModal}>
          <Plus size={14} />
          <span>Horario de Cursada</span>
        </button>
      </div>
    </div>
  );
};

export default ScheduleMetricsBar;
