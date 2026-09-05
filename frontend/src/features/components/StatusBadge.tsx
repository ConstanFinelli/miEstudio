import React from 'react';
import styles from './StatusBadge.module.css';
import type { EstadoMateria } from '../../types/academic';

interface StatusBadgeProps {
  status: EstadoMateria | 'PENDIENTE' | string;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = ''
}) => {
  const normalized = status.toUpperCase();

  const getStyleClass = () => {
    switch (normalized) {
      case 'CURSANDO':
        return styles.cursando;
      case 'REGULAR':
        return styles.regular;
      case 'APROBADA':
        return styles.aprobada;
      case 'PROMOCIONADA':
        return styles.promocionada;
      default:
        return styles.pendiente;
    }
  };

  const displayText = label || (normalized.charAt(0) + normalized.slice(1).toLowerCase());

  return (
    <span className={`${styles.badge} ${getStyleClass()} ${className}`}>
      <span className={styles.dot} />
      <span>{displayText}</span>
    </span>
  );
};

export default StatusBadge;
