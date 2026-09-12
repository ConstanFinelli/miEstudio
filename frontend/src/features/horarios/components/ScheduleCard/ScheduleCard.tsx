import React, { useMemo } from "react";
import styles from "./ScheduleCard.module.css";
import {
  Clock,
  Building2,
  MapPin,
  Edit2,
  Trash2,
  AlertTriangle,
  Palette,
} from "lucide-react";
import type { HorarioCursada } from "../../../../types/academic";

export interface ScheduleLayoutItem {
  horario: HorarioCursada;
  topPercent: number;
  heightPercent: number;
  hasConflict: boolean;
  colIndex: number;
  colTotal: number;
}

interface ScheduleCardProps {
  item: ScheduleLayoutItem;
  onClick: (horario: HorarioCursada) => void;
  onDelete: (e: React.MouseEvent, id: string, name?: string) => void;
  onColorClick?: (
    materiaId: string,
    materiaNombre: string,
    currentColor?: string,
    materiaCodigo?: string,
  ) => void;
}

const parseTimeToMinutes = (timeStr?: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  item,
  onClick,
  onDelete,
  onColorClick,
}) => {
  const h = item.horario;
  const cardColor = h.materiaColor || "#6366f1";
  const colWidth = 100 / item.colTotal;
  const leftOffset = item.colIndex * colWidth;

  const durationMinutes = useMemo(() => {
    const start = parseTimeToMinutes(h.horaInicio);
    const end = parseTimeToMinutes(h.horaFin);
    return end - start;
  }, [h.horaInicio, h.horaFin]);

  // Si la clase dura menos de 75 min o tiene poca altura relativa, se oculta el footer para evitar recortes
  const isCompact = durationMinutes > 0 && durationMinutes < 75;

  const fullTooltip = [
    h.materiaNombre,
    `(${h.horaInicio} - ${h.horaFin} hs)`,
    h.tipoClase ? `• ${h.tipoClase}` : "",
    h.facultadSede ? `• Sede: ${h.facultadSede}` : "",
    h.aula ? `• Aula: ${h.aula}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`${styles.classCard} ${item.hasConflict ? styles.classCardConflict : ""}`}
      style={{
        top: `${item.topPercent}%`,
        height: `${item.heightPercent}%`,
        left: `${leftOffset}%`,
        width: `calc(${colWidth}% - 4px)`,
        backgroundColor: `${cardColor}20`,
        border: `1px solid ${cardColor}60`,
        borderLeft: `4px solid ${cardColor}`,
      }}
      onClick={() => onClick(h)}
      title={fullTooltip}
    >
      {/* Solapamiento / Conflicto Badge */}
      {item.hasConflict && (
        <div className={styles.conflictBadge}>
          <AlertTriangle size={8} /> Solapamiento
        </div>
      )}

      {/* Header: Nombre de la Materia, Código y Acciones */}
      <div className={styles.cardTop}>
        <div className={styles.cardTitleGroup}>
          <span className={styles.cardSubjectName} title={h.materiaNombre}>
            {h.materiaNombre}
          </span>
          <span className={styles.cardSubjectCode}>
            {h.materiaCodigo ? `[${h.materiaCodigo}]` : ""}
          </span>
        </div>

        <div className={styles.cardActions}>
          {onColorClick && (
            <button
              type="button"
              className={styles.iconBtn}
              title="Cambiar color de la materia"
              onClick={(e) => {
                e.stopPropagation();
                onColorClick(
                  h.materiaId || "",
                  h.materiaNombre || "Materia",
                  cardColor,
                  h.materiaCodigo,
                );
              }}
            >
              <Palette size={10} />
            </button>
          )}
          <button
            type="button"
            className={styles.iconBtn}
            title="Editar horario"
            onClick={(e) => {
              e.stopPropagation();
              onClick(h);
            }}
          >
            <Edit2 size={10} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            title="Eliminar horario"
            onClick={(e) => onDelete(e, h.id, h.materiaNombre)}
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>

      {/* Horario de la Clase y Tipo de Clase (Siempre visible) */}
      <div className={styles.cardTimeRow}>
        <div className={styles.cardTime}>
          <Clock size={9} />
          <span>
            {h.horaInicio} - {h.horaFin} hs
          </span>
        </div>

        {h.tipoClase && (
          <span className={styles.typeBadge} title={`Tipo: ${h.tipoClase}`}>
            {h.tipoClase}
          </span>
        )}
      </div>

      {/* Footer: Sede y Aula (si hay espacio suficiente en la tarjeta) */}
      {!isCompact && (h.facultadSede || h.aula) && (
        <div className={styles.cardFooter}>
          {h.facultadSede ? (
            <span className={styles.locationBadge} title={h.facultadSede}>
              <Building2 size={8} />
              <span className={styles.badgeText}>{h.facultadSede}</span>
            </span>
          ) : null}
          {h.aula ? (
            <span className={styles.locationBadge} title={`Aula: ${h.aula}`}>
              <MapPin size={8} />
              <span className={styles.badgeText}>{h.aula}</span>
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ScheduleCard;
