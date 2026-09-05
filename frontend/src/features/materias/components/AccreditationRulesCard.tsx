import React from 'react';
import styles from '../MateriasView.module.css';
import { CheckCircle } from 'lucide-react';
import type { Materia } from '../../../types/academic';

interface AccreditationRulesCardProps {
  reglas: Materia['reglasAcreditacion'];
}

export const AccreditationRulesCard: React.FC<AccreditationRulesCardProps> = ({ reglas }) => {
  return (
    <div className={styles.sectionBox}>
      <div className={styles.boxHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>=≠ REGLAS DE ACREDITACIÓN CONFIGURADAS</span>
        </div>
        <span style={{ color: 'var(--emerald)', fontSize: '10px' }}>ALGORITMO ACTIVO</span>
      </div>

      <div className={styles.rulesGrid}>
        <div className={styles.ruleCard}>
          <div className={styles.ruleCardTitle}>
            <CheckCircle size={13} color="var(--emerald)" />
            <span>Condición Promoción Directa</span>
          </div>
          <p className={styles.ruleCardDesc}>
            {reglas.promocion.descripcion}
          </p>
        </div>

        <div className={styles.ruleCard}>
          <div className={styles.ruleCardTitle}>
            <CheckCircle size={13} color="var(--blue)" />
            <span>Condición Regularidad</span>
          </div>
          <p className={styles.ruleCardDesc}>
            {reglas.regularidad.descripcion}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccreditationRulesCard;
