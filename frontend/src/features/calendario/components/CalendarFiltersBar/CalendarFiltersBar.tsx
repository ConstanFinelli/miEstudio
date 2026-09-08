import React from "react";
import styles from "./CalendarFiltersBar.module.css";

interface CalendarFiltersBarProps {
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  selectedYear?: number | "TODOS";
  onSelectYear?: (year: number | "TODOS") => void;
  selectedCuatri?: "TODOS" | "1C" | "2C" | "Anual";
  onSelectCuatri?: (cuatri: "TODOS" | "1C" | "2C" | "Anual") => void;
}

export const CalendarFiltersBar: React.FC<CalendarFiltersBarProps> = ({
  selectedFilter,
  onSelectFilter,
}) => {
  return (
    <div className={styles.filtersRow}>
      <span
        style={{
          fontWeight: 600,
          color: "var(--text-secondary)",
          marginLeft: "4px",
        }}
      >
        TIPO:
      </span>
      <div
        className={styles.filterItem}
        style={{
          opacity: selectedFilter === "ALL" ? 1 : 0.6,
          fontWeight: selectedFilter === "ALL" ? 700 : 400,
        }}
        onClick={() => onSelectFilter("ALL")}
      >
        <span>Todos</span>
      </div>
      <div
        className={styles.filterItem}
        style={{
          opacity:
            selectedFilter === "ALL" || selectedFilter === "EXAMEN" ? 1 : 0.4,
          fontWeight: selectedFilter === "EXAMEN" ? 700 : 400,
        }}
        onClick={() =>
          onSelectFilter(selectedFilter === "EXAMEN" ? "ALL" : "EXAMEN")
        }
      >
        <span
          className={styles.filterColorDot}
          style={{ backgroundColor: "var(--red)" }}
        />
        <span>Exámenes</span>
      </div>
      <div
        className={styles.filterItem}
        style={{
          opacity:
            selectedFilter === "ALL" || selectedFilter === "TP" ? 1 : 0.4,
          fontWeight: selectedFilter === "TP" ? 700 : 400,
        }}
        onClick={() => onSelectFilter(selectedFilter === "TP" ? "ALL" : "TP")}
      >
        <span
          className={styles.filterColorDot}
          style={{ backgroundColor: "var(--purple)" }}
        />
        <span>TPs y Entregas</span>
      </div>
      <div
        className={styles.filterItem}
        style={{
          opacity:
            selectedFilter === "ALL" || selectedFilter === "LAB" ? 1 : 0.4,
          fontWeight: selectedFilter === "LAB" ? 700 : 400,
        }}
        onClick={() => onSelectFilter(selectedFilter === "LAB" ? "ALL" : "LAB")}
      >
        <span
          className={styles.filterColorDot}
          style={{ backgroundColor: "var(--blue)" }}
        />
        <span>Laboratorios</span>
      </div>
      <div
        className={styles.filterItem}
        style={{
          opacity:
            selectedFilter === "ALL" || selectedFilter === "ESTUDIO" ? 1 : 0.4,
          fontWeight: selectedFilter === "ESTUDIO" ? 700 : 400,
        }}
        onClick={() =>
          onSelectFilter(selectedFilter === "ESTUDIO" ? "ALL" : "ESTUDIO")
        }
      >
        <span
          className={styles.filterColorDot}
          style={{ backgroundColor: "var(--emerald)" }}
        />
        <span>Estudio</span>
      </div>
    </div>
  );
};

export default CalendarFiltersBar;
