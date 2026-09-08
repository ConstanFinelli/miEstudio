import React, { useState } from "react";
import styles from "./AccreditationRulesCard.module.css";
import { CheckCircle, AlertCircle, SlidersHorizontal, Award } from "lucide-react";
import type { Materia } from "../../../../types/academic";

interface AccreditationRulesCardProps {
  reglas: Materia["reglasAcreditacion"];
  estado?: Materia["estado"];
  onConfigure?: () => void;
}

export const AccreditationRulesCard: React.FC<AccreditationRulesCardProps> = ({
  reglas,
  estado,
  onConfigure,
}) => {
  const promo = reglas?.promocion;
  const regu = reglas?.regularidad;
  const isPromoEnabled = promo?.permitePromocion !== false;
  const isAprobada = estado === "APROBADA" || estado === "PROMOCIONADA";
  const [showRules, setShowRules] = useState(false);

  // Si la materia ya está aprobada o promocionada, no mostrar las reglas por defecto,
  // pero habilitar la opción de verlas y configurarlas si el usuario lo desea.
  if (isAprobada && !showRules) {
    return (
      <div className={styles.sectionBox} style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle size={15} color="var(--emerald)" />
            <div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                Materia Acreditada ({estado === "PROMOCIONADA" ? "Promoción Directa" : "Examen Final Aprobado"})
              </span>
              <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "var(--text-dim)" }}>
                Las reglas de cursada y acreditación ya fueron cumplimentadas.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              className={styles.btnConfigureRules}
              onClick={() => setShowRules(true)}
              title="Visualizar las reglas de cursada de la materia"
            >
              <Award size={12} color="var(--primary)" />
              <span>Ver Reglas</span>
            </button>
            {onConfigure && (
              <button
                type="button"
                className={styles.btnConfigureRules}
                onClick={onConfigure}
                title="Modificar o configurar requisitos"
              >
                <SlidersHorizontal size={11} />
                <span>Configurar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sectionBox}>
      <div className={styles.boxHeader}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>=≠ REGLAS DE ACREDITACIÓN CONFIGURADAS</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isAprobada && (
              <button
                type="button"
                className={styles.btnConfigureRules}
                onClick={() => setShowRules(false)}
                title="Ocultar panel de reglas"
              >
                <span>Ocultar</span>
              </button>
            )}
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

          {isPromoEnabled ? (
            <div className={styles.conditionBox}>
              <span className={styles.conditionLabel}>Requisito de Promoción:</span>
              <p className={styles.conditionText}>
                {promo?.condicion ||
                  promo?.descripcion ||
                  "Promedio ≥ 8.0 y evaluaciones ≥ 7.0 sin recuperatorio."}
              </p>
            </div>
          ) : (
            <p className={styles.ruleCardDesc}>
              Sin promoción directa. Examen final obligatorio para acreditar la materia.
            </p>
          )}

          <div className={styles.rulePills}>
            {isPromoEnabled ? (
              <>
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

          <div className={styles.conditionBox}>
            <span className={styles.conditionLabel}>Requisito de Regularidad:</span>
            <p className={styles.conditionText}>
              {regu?.condicion ||
                regu?.descripcion ||
                "Todas las evaluaciones ≥ 4.0 y requisitos de cátedra cumplidos."}
            </p>
          </div>

          <div className={styles.rulePills}>
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
