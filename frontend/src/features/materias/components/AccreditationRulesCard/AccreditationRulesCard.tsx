import React from "react";
import styles from "./AccreditationRulesCard.module.css";
import { CheckCircle, AlertCircle, SlidersHorizontal } from "lucide-react";
import type { Materia } from "../../../../types/academic";

interface AccreditationRulesCardProps {
  reglas: Materia["reglasAcreditacion"];
  onConfigure?: () => void;
}

export const AccreditationRulesCard: React.FC<AccreditationRulesCardProps> = ({
  reglas,
  onConfigure,
}) => {
  const promo = reglas?.promocion;
  const regu = reglas?.regularidad;
  const isPromoEnabled = promo?.permitePromocion !== false;

  return (
    <div className={styles.sectionBox}>
      <div className={styles.boxHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>=≠ REGLAS DE ACREDITACIÓN CONFIGURADAS</span>
          {onConfigure && (
            <button
              className={styles.btnConfigureRules}
              onClick={onConfigure}
              title="Modificar requisitos de promoción y regularidad"
            >
              <SlidersHorizontal size={11} />
              <span>Configurar Reglas</span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.rulesGrid}>
        {/* Card 1: Promoción Directa */}
        <div
          className={`${styles.ruleCard} ${!isPromoEnabled ? styles.ruleCardDisabled : ""}`}
        >
          <div className={styles.ruleCardTitle}>
            {isPromoEnabled ? (
              <CheckCircle size={13} color="var(--emerald)" />
            ) : (
              <AlertCircle size={13} color="var(--amber)" />
            )}
            <span>Condición Promoción Directa</span>
            {isPromoEnabled ? (
              <span className={styles.ruleBadgeActive}>PROMOCIONABLE</span>
            ) : (
              <span className={styles.ruleBadgeDisabled}>
                FINAL OBLIGATORIO
              </span>
            )}
          </div>

          <p className={styles.ruleCardDesc}>
            {promo?.descripcion ||
              (isPromoEnabled
                ? "Promedio ≥ 8.0, parciales ≥ 7.0 sin recuperatorio."
                : "Sin promoción directa. Examen final obligatorio para acreditar la materia.")}
          </p>

          <div className={styles.rulePills}>
            {isPromoEnabled ? (
              <>
                <span className={styles.rulePill}>
                  Promedio mín: <strong>≥ {promo?.minPromedio ?? 8.0}</strong>
                </span>
                <span className={styles.rulePill}>
                  Parcial mín: <strong>≥ {promo?.minParcial ?? 7.0}</strong>
                </span>
                <span className={styles.rulePill}>
                  Asistencia: <strong>≥ {promo?.minAsistencia ?? 80}%</strong>
                </span>
                <span className={styles.rulePill}>
                  Recuperatorio:{" "}
                  <strong>
                    {promo?.permiteRecuperatorio ? "Permitido" : "No admite"}
                  </strong>
                </span>
              </>
            ) : (
              <>
                <span
                  className={styles.rulePill}
                  style={{ color: "var(--amber)" }}
                >
                  🚫 No admite promoción directa
                </span>
                <span className={styles.rulePill}>
                  📖 Acreditación exclusivamente por Final
                </span>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Regularidad */}
        <div className={styles.ruleCard}>
          <div className={styles.ruleCardTitle}>
            <CheckCircle size={13} color="var(--blue)" />
            <span>Condición Regularidad</span>
            <span className={styles.ruleBadgeActive}>REGULARIDAD</span>
          </div>

          <p className={styles.ruleCardDesc}>
            {regu?.descripcion ||
              "Todas las evaluaciones ≥ 4.0 y 75% de asistencia mínima requerida."}
          </p>

          <div className={styles.rulePills}>
            <span className={styles.rulePill}>
              Parciales: <strong>≥ {regu?.minNota ?? 4.0}</strong>
            </span>
            <span className={styles.rulePill}>
              Asistencia requerida:{" "}
              <strong>≥ {regu?.minAsistencia ?? 75}%</strong>
            </span>
            <span className={styles.rulePill}>
              Recuperatorio:{" "}
              <strong>
                {regu?.permiteRecuperatorio !== false
                  ? "Permitido"
                  : "No admite"}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccreditationRulesCard;
