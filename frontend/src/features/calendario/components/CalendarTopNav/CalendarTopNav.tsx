import React from "react";
import styles from "./CalendarTopNav.module.css";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface CalendarTopNavProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onOpenEvaluationModal: () => void;
}

export const CalendarTopNav: React.FC<CalendarTopNavProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  onOpenEvaluationModal,
}) => {
  const monthName = currentDate.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
  const formattedMonthTitle =
    monthName.charAt(0).toUpperCase() + monthName.slice(1);
  const todayLabel = `HOY · ${new Date().toLocaleDateString("es-AR", { day: "numeric", month: "short" }).toUpperCase()}`;

  return (
    <div className={styles.topNav}>
      <div className={styles.monthControls}>
        <button
          className={styles.arrowBtn}
          onClick={onPrevMonth}
          title="Mes anterior"
        >
          <ChevronLeft size={14} />
        </button>
        <h2 className={styles.monthTitle}>{formattedMonthTitle}</h2>
        <button
          className={styles.arrowBtn}
          onClick={onNextMonth}
          title="Mes siguiente"
        >
          <ChevronRight size={14} />
        </button>
        <button className={styles.todayBtn} onClick={onToday}>
          {todayLabel}
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button className={styles.btnNewEvent} onClick={onOpenEvaluationModal}>
          <Plus size={14} />
          <span>+ Nueva Fecha / Examen</span>
        </button>
      </div>
    </div>
  );
};

export default CalendarTopNav;
