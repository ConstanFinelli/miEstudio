import React, { useRef } from 'react';
import styles from './MallaCanvas.module.css';
import { MateriaNode } from './MateriaNode';
import { CorrelatividadesSvgOverlay } from './CorrelatividadesSvgOverlay';
import type { MateriaNodeData, ConnectionLink, StatusFilter } from '../types';

interface MallaCanvasProps {
  yearsList: number[];
  materiasByYear: Record<number, MateriaNodeData[]>;
  selectedMateriaId: string | null;
  hoveredMateriaId: string | null;
  activeConnections: ConnectionLink[];
  statusFilter: StatusFilter;
  searchQuery: string;
  isSimulationActive: boolean;
  onSelectMateria: (id: string) => void;
  onHoverMateria: (id: string | null) => void;
  onToggleSimulate: (id: string) => void;
}

export const MallaCanvas: React.FC<MallaCanvasProps> = ({
  yearsList,
  materiasByYear,
  selectedMateriaId,
  hoveredMateriaId,
  activeConnections,
  statusFilter,
  searchQuery,
  isSimulationActive,
  onSelectMateria,
  onHoverMateria,
  onToggleSimulate
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const focusedId = hoveredMateriaId || selectedMateriaId;

  // Determinar si una materia está conectada al nodo enfocado
  const isNodeUpstream = (id: string) => {
    return activeConnections.some(c => c.sourceId === id && c.direction === 'UPSTREAM');
  };

  const isNodeDownstream = (id: string) => {
    return activeConnections.some(c => c.targetId === id && c.direction === 'DOWNSTREAM');
  };

  // Determinar si un nodo debe atenuarse (cuando hay un nodo enfocado y este no tiene relación)
  const isNodeDimmed = (id: string) => {
    if (!focusedId) return false;
    if (id === focusedId) return false;
    return !isNodeUpstream(id) && !isNodeDownstream(id);
  };

  // Filtrado por estado y búsqueda
  const isNodeVisible = (node: MateriaNodeData) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = node.materia.nombre.toLowerCase().includes(q);
      const matchCode = (node.materia.codigo || '').toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }

    if (statusFilter === 'TODOS') return true;
    if (statusFilter === 'HABILITADAS') return node.computedStatus === 'HABILITADA';
    if (statusFilter === 'CURSANDO') return node.computedStatus === 'CURSANDO';
    if (statusFilter === 'REGULARES') return node.computedStatus === 'REGULAR';
    if (statusFilter === 'APROBADAS') {
      return node.computedStatus === 'APROBADA' || node.computedStatus === 'PROMOCIONADA';
    }
    if (statusFilter === 'BLOQUEADAS') return node.computedStatus === 'BLOQUEADA';

    return true;
  };

  return (
    <div className={styles.canvasScrollWrapper} ref={containerRef}>
      <div className={styles.canvasInner}>
        {/* SVG Dynamic Overlay */}
        <CorrelatividadesSvgOverlay
          connections={activeConnections}
          containerRef={containerRef}
        />

        {/* Columns by Year */}
        {yearsList.map(year => {
          const yearNodes = materiasByYear[year] || [];
          const aprobadas = yearNodes.filter(
            n => n.computedStatus === 'APROBADA' || n.computedStatus === 'PROMOCIONADA'
          ).length;
          const total = yearNodes.length;
          const pct = total > 0 ? Math.round((aprobadas / total) * 100) : 0;

          // Sub-agrupar por cuatrimestre
          const cuatri1 = yearNodes.filter(n => n.materia.cuatrimestre === '1C');
          const anuales = yearNodes.filter(n => n.materia.cuatrimestre === 'Anual');
          const cuatri2 = yearNodes.filter(n => n.materia.cuatrimestre === '2C');

          return (
            <div key={year} className={styles.yearColumn}>
              {/* Year Header Card */}
              <div className={styles.yearHeader}>
                <div className={styles.yearHeaderTop}>
                  <span className={styles.yearTitle}>{year}° Año</span>
                  <span className={styles.yearStatsBadge}>
                    {aprobadas}/{total} ({pct}%)
                  </span>
                </div>
                <div className={styles.yearProgressBar}>
                  <div
                    className={styles.yearProgressFill}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* 1er Cuatrimestre */}
              {cuatri1.length > 0 && (
                <div className={styles.periodGroup}>
                  <div className={styles.periodDivider}>
                    <span className={styles.periodDividerLabel}>1° Cuatrimestre</span>
                    <span className={styles.periodDividerLine} />
                  </div>
                  <div className={styles.nodesList}>
                    {cuatri1.map(node => (
                      <div
                        key={node.materia.id}
                        style={{ display: isNodeVisible(node) ? 'block' : 'none' }}
                      >
                        <MateriaNode
                          nodeData={node}
                          isSelected={selectedMateriaId === node.materia.id}
                          isFocused={focusedId === node.materia.id}
                          isUpstream={isNodeUpstream(node.materia.id)}
                          isDownstream={isNodeDownstream(node.materia.id)}
                          isDimmed={isNodeDimmed(node.materia.id)}
                          isSimulationActive={isSimulationActive}
                          onSelect={onSelectMateria}
                          onHover={onHoverMateria}
                          onToggleSimulate={onToggleSimulate}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Anuales */}
              {anuales.length > 0 && (
                <div className={styles.periodGroup}>
                  <div className={styles.periodDivider}>
                    <span className={styles.periodDividerLabel}>Anual</span>
                    <span className={styles.periodDividerLine} />
                  </div>
                  <div className={styles.nodesList}>
                    {anuales.map(node => (
                      <div
                        key={node.materia.id}
                        style={{ display: isNodeVisible(node) ? 'block' : 'none' }}
                      >
                        <MateriaNode
                          nodeData={node}
                          isSelected={selectedMateriaId === node.materia.id}
                          isFocused={focusedId === node.materia.id}
                          isUpstream={isNodeUpstream(node.materia.id)}
                          isDownstream={isNodeDownstream(node.materia.id)}
                          isDimmed={isNodeDimmed(node.materia.id)}
                          isSimulationActive={isSimulationActive}
                          onSelect={onSelectMateria}
                          onHover={onHoverMateria}
                          onToggleSimulate={onToggleSimulate}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2do Cuatrimestre */}
              {cuatri2.length > 0 && (
                <div className={styles.periodGroup}>
                  <div className={styles.periodDivider}>
                    <span className={styles.periodDividerLabel}>2° Cuatrimestre</span>
                    <span className={styles.periodDividerLine} />
                  </div>
                  <div className={styles.nodesList}>
                    {cuatri2.map(node => (
                      <div
                        key={node.materia.id}
                        style={{ display: isNodeVisible(node) ? 'block' : 'none' }}
                      >
                        <MateriaNode
                          nodeData={node}
                          isSelected={selectedMateriaId === node.materia.id}
                          isFocused={focusedId === node.materia.id}
                          isUpstream={isNodeUpstream(node.materia.id)}
                          isDownstream={isNodeDownstream(node.materia.id)}
                          isDimmed={isNodeDimmed(node.materia.id)}
                          isSimulationActive={isSimulationActive}
                          onSelect={onSelectMateria}
                          onHover={onHoverMateria}
                          onToggleSimulate={onToggleSimulate}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
