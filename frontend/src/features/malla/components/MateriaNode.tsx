import React from 'react';
import styles from './MateriaNode.module.css';
import type { MateriaNodeData } from '../types';
import {
  CheckCircle2,
  Lock,
  Sparkles,
  Award,
  BookOpen,
  HelpCircle,
  FlaskConical
} from 'lucide-react';

interface MateriaNodeProps {
  nodeData: MateriaNodeData;
  isSelected: boolean;
  isFocused: boolean;
  isUpstream: boolean;
  isDownstream: boolean;
  isDimmed: boolean;
  isSimulationActive: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onToggleSimulate: (id: string) => void;
}

export const MateriaNode: React.FC<MateriaNodeProps> = ({
  nodeData,
  isSelected,
  isFocused: _isFocused,
  isUpstream,
  isDownstream,
  isDimmed,
  isSimulationActive,
  onSelect,
  onHover,
  onToggleSimulate
}) => {
  const { materia, computedStatus, isSimulated } = nodeData;

  const getStatusIcon = () => {
    switch (computedStatus) {
      case 'APROBADA':
        return <CheckCircle2 size={11} />;
      case 'PROMOCIONADA':
        return <Award size={11} />;
      case 'CURSANDO':
        return <BookOpen size={11} />;
      case 'REGULAR':
        return <CheckCircle2 size={11} />;
      case 'HABILITADA':
        return <Sparkles size={11} />;
      case 'BLOQUEADA':
        return <Lock size={11} />;
      default:
        return <HelpCircle size={11} />;
    }
  };

  const getStatusLabel = () => {
    if (isSimulated) return 'Simulada';
    switch (computedStatus) {
      case 'APROBADA':
        return materia.promedio > 0 ? `Nota: ${materia.promedio}` : 'Aprobada';
      case 'PROMOCIONADA':
        return materia.promedio > 0 ? `Prom: ${materia.promedio}` : 'Promoción';
      case 'CURSANDO':
        return 'Cursando';
      case 'REGULAR':
        return 'Regular';
      case 'HABILITADA':
        return 'Habilitada';
      case 'BLOQUEADA':
        return `Faltan ${nodeData.correlativasCursarFaltantes.length}`;
      default:
        return computedStatus;
    }
  };

  const getStatusClass = () => {
    switch (computedStatus) {
      case 'APROBADA':
        return styles.statusAprobada;
      case 'PROMOCIONADA':
        return styles.statusPromocionada;
      case 'CURSANDO':
        return styles.statusCursando;
      case 'REGULAR':
        return styles.statusRegular;
      case 'HABILITADA':
        return styles.statusHabilitada;
      case 'BLOQUEADA':
        return styles.statusBloqueada;
      default:
        return '';
    }
  };

  const cardClasses = [
    styles.nodeCard,
    isSelected ? styles.nodeSelected : '',
    isUpstream ? styles.nodeUpstream : '',
    isDownstream ? styles.nodeDownstream : '',
    isDimmed ? styles.nodeDimmed : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      id={`materia-node-${materia.id}`}
      className={cardClasses}
      onClick={() => onSelect(materia.id)}
      onMouseEnter={() => onHover(materia.id)}
      onMouseLeave={() => onHover(null)}
      title={`${materia.nombre} (${materia.codigo}) - ${computedStatus}`}
    >
      <div className={styles.nodeHeader}>
        <span className={styles.codigo}>{materia.codigo}</span>
        <span className={styles.cuatriBadge}>{materia.cuatrimestre}</span>
      </div>

      <div className={styles.nombre}>{materia.nombre}</div>

      <div className={styles.nodeFooter}>
        <div className={`${styles.statusBadge} ${getStatusClass()}`}>
          {getStatusIcon()}
          <span>{getStatusLabel()}</span>
        </div>

        {/* Simulation trigger */}
        {isSimulationActive ? (
          <button
            type="button"
            className={`${styles.simButton} ${isSimulated ? styles.simButtonActive : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSimulate(materia.id);
            }}
            title={isSimulated ? 'Quitar simulación de aprobación' : 'Simular como aprobada'}
          >
            <FlaskConical size={10} />
            <span>{isSimulated ? 'Aprobada' : 'Simular'}</span>
          </button>
        ) : (
          (nodeData.correlativasCursarFaltantes.length > 0 || nodeData.correlativasCursarCumplidas.length > 0) && (
            <span className={styles.reqPill} title="Correlativas requeridas">
              {nodeData.correlativasCursarCumplidas.length}/
              {nodeData.correlativasCursarCumplidas.length + nodeData.correlativasCursarFaltantes.length} req
            </span>
          )
        )}
      </div>
    </div>
  );
};
