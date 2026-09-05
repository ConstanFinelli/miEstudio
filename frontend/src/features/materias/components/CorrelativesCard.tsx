import React from 'react';
import styles from '../MateriasView.module.css';
import { CheckCircle } from 'lucide-react';
import type { Materia } from '../../../types/academic';

interface CorrelativesCardProps {
  correlativas: Materia['correlativas'];
}

export const CorrelativesCard: React.FC<CorrelativesCardProps> = ({ correlativas }) => {
  return (
    <div className={styles.correlativesBox}>
      <span className={styles.correlativesTitle}>ÁRBOL DE CORRELATIVIDADES VINCULADAS</span>
      <div className={styles.correlativesRow}>
        <span>Requisitos Previos:</span>
        {correlativas.requiere.map((req) => (
          <span key={req.codigo} className={styles.correlativeTagSuccess}>
            <CheckCircle size={12} />
            <span>{req.nombre} ({req.estado.charAt(0) + req.estado.slice(1).toLowerCase()})</span>
          </span>
        ))}
      </div>
      <div className={styles.correlativesRow} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
        <span>Habilita cursada de:</span>
        {correlativas.habilita.map((hab) => (
          <span key={hab.codigo} style={{ color: 'var(--primary-glow)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            → {hab.nombre} ({hab.anio}° Año)
          </span>
        ))}
      </div>
    </div>
  );
};

export default CorrelativesCard;
