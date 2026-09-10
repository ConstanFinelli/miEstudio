import React, { useRef, useState, useMemo, useEffect } from 'react';
import styles from './MallaCanvas.module.css';
import { MateriaNode } from './MateriaNode';
import { CorrelatividadesSvgOverlay } from './CorrelatividadesSvgOverlay';
import { MallaFocusBar } from './MallaFocusBar';
import type { MateriaNodeData, ConnectionLink, StatusFilter } from '../types';

interface MallaCanvasProps {
  yearsList: number[];
  materiasByYear: Record<number, MateriaNodeData[]>;
  selectedMateriaId: string | null;
  hoveredMateriaId: string | null;
  activeConnections: ConnectionLink[];
  statusFilter: StatusFilter;
  isSimulationActive: boolean;
  onSelectMateria: (id: string) => void;
  onHoverMateria: (id: string | null) => void;
  onToggleSimulate: (id: string) => void;
  onOpenDrawer: () => void;
}

export const MallaCanvas: React.FC<MallaCanvasProps> = ({
  yearsList,
  materiasByYear,
  selectedMateriaId,
  hoveredMateriaId,
  activeConnections,
  statusFilter,
  isSimulationActive,
  onSelectMateria,
  onHoverMateria,
  onToggleSimulate,
  onOpenDrawer
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(true);

  const focusedId = hoveredMateriaId || selectedMateriaId;

  // Selected materia node data
  const selectedNodeData = useMemo(() => {
    if (!selectedMateriaId) return null;
    for (const year of yearsList) {
      const found = (materiasByYear[year] || []).find(n => n.materia.id === selectedMateriaId);
      if (found) return found;
    }
    return null;
  }, [selectedMateriaId, yearsList, materiasByYear]);

  // Counts of connected prerequisites and unlocked subjects
  const upstreamCount = useMemo(() => {
    return activeConnections.filter(c => c.direction === 'UPSTREAM').length;
  }, [activeConnections]);

  const downstreamCount = useMemo(() => {
    return activeConnections.filter(c => c.direction === 'DOWNSTREAM').length;
  }, [activeConnections]);

  // Determinar si una materia está conectada al nodo enfocado
  const isNodeUpstream = (id: string) => {
    return activeConnections.some(c => c.sourceId === id && c.direction === 'UPSTREAM');
  };

  const isNodeDownstream = (id: string) => {
    return activeConnections.some(c => c.targetId === id && c.direction === 'DOWNSTREAM');
  };

  // Determinar si una materia es relevante en modo enfoque
  const isNodeRelevant = (id: string) => {
    if (!selectedMateriaId) return true;
    return id === selectedMateriaId || isNodeUpstream(id) || isNodeDownstream(id);
  };

  // Determinar si un nodo debe atenuarse (cuando hay un nodo enfocado y no tiene relación directa)
  const isNodeDimmed = (id: string) => {
    if (!focusedId) return false;
    if (id === focusedId) return false;
    return !isNodeUpstream(id) && !isNodeDownstream(id);
  };

  // Filtrado por estado
  const isNodeVisible = (node: MateriaNodeData) => {
    if (isFocusMode && selectedMateriaId) {
      // En modo enfoque de correlativas, siempre mostrar los nodos conectados
      return isNodeRelevant(node.materia.id);
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

  // Auto-scroll horizontal suave para centrar la materia seleccionada
  useEffect(() => {
    if (selectedMateriaId && containerRef.current) {
      const timer = setTimeout(() => {
        const selectedEl = document.getElementById(`materia-node-${selectedMateriaId}`);
        const container = containerRef.current;
        if (selectedEl && container) {
          const elRect = selectedEl.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const currentScroll = container.scrollLeft;
          const targetScroll =
            currentScroll +
            (elRect.left - containerRect.left) -
            containerRect.width / 2 +
            elRect.width / 2;

          container.scrollTo({
            left: Math.max(0, targetScroll),
            behavior: 'smooth'
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedMateriaId]);

  return (
    <div className={styles.canvasContainer}>
      {/* Floating Focus Toolbar when a materia is selected */}
      {selectedMateriaId && selectedNodeData && (
        <MallaFocusBar
          nodeData={selectedNodeData}
          isFocusMode={isFocusMode}
          upstreamCount={upstreamCount}
          downstreamCount={downstreamCount}
          onToggleFocusMode={() => setIsFocusMode(prev => !prev)}
          onOpenDrawer={onOpenDrawer}
          onClearSelection={() => onSelectMateria('')}
        />
      )}

      <div
        className={styles.canvasScrollWrapper}
        ref={containerRef}
        onClick={(e) => {
          // Deseleccionar si se hace clic en el fondo vacío del lienzo
          if (e.target === containerRef.current || e.target === innerRef.current) {
            if (selectedMateriaId) onSelectMateria('');
          }
        }}
      >
        <div className={styles.canvasInner} ref={innerRef}>
          {/* SVG Dynamic Overlay */}
          <CorrelatividadesSvgOverlay
            connections={activeConnections}
            innerRef={innerRef}
            scrollContainerRef={containerRef}
          />

          {/* Columns by Year */}
          {yearsList.map(year => {
            const yearNodes = materiasByYear[year] || [];
            const aprobadas = yearNodes.filter(
              n => n.computedStatus === 'APROBADA' || n.computedStatus === 'PROMOCIONADA'
            ).length;
            const total = yearNodes.length;
            const pct = total > 0 ? Math.round((aprobadas / total) * 100) : 0;

            // En modo enfoque, determinar si la columna tiene alguna materia relevante
            const hasRelevantInYear = yearNodes.some(n => isNodeRelevant(n.materia.id));
            const isColumnCollapsed = isFocusMode && Boolean(selectedMateriaId) && !hasRelevantInYear;

            // Sub-agrupar por cuatrimestre
            const cuatri1 = yearNodes.filter(n => {
              const c = (n.materia.cuatrimestre || '').trim().toLowerCase();
              return c === '1c' || c === '1' || c.startsWith('1');
            });
            const cuatri2 = yearNodes.filter(n => {
              const c = (n.materia.cuatrimestre || '').trim().toLowerCase();
              return c === '2c' || c === '2' || c.startsWith('2');
            });
            const anuales = yearNodes.filter(n => {
              const c = (n.materia.cuatrimestre || '').trim().toLowerCase();
              return c === 'anual' || (!c.startsWith('1') && !c.startsWith('2'));
            });

            const cuatri1HasRelevant = cuatri1.some(n => isNodeRelevant(n.materia.id));
            const anualesHasRelevant = anuales.some(n => isNodeRelevant(n.materia.id));
            const cuatri2HasRelevant = cuatri2.some(n => isNodeRelevant(n.materia.id));

            return (
              <div
                key={year}
                className={`${styles.yearColumn} ${isColumnCollapsed ? styles.yearColumnCollapsed : ''}`}
              >
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
                  <div
                    className={`${styles.periodGroup} ${
                      isFocusMode && Boolean(selectedMateriaId) && !cuatri1HasRelevant
                        ? styles.periodGroupCollapsed
                        : ''
                    }`}
                  >
                    <div className={styles.periodDivider}>
                      <span className={styles.periodDividerLabel}>1° Cuatrimestre</span>
                      <span className={styles.periodDividerLine} />
                    </div>
                    <div className={styles.nodesList}>
                      {cuatri1.map(node => {
                        const isRel = isNodeRelevant(node.materia.id);
                        const isCollapsed = isFocusMode && Boolean(selectedMateriaId) && !isRel;

                        return (
                          <div
                            key={node.materia.id}
                            className={`${styles.nodeWrapper} ${
                              isCollapsed ? styles.nodeWrapperCollapsed : ''
                            }`}
                            style={{ display: isNodeVisible(node) ? undefined : 'none' }}
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
                              onHover={selectedMateriaId ? () => {} : onHoverMateria}
                              onToggleSimulate={onToggleSimulate}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Anuales */}
                {anuales.length > 0 && (
                  <div
                    className={`${styles.periodGroup} ${
                      isFocusMode && Boolean(selectedMateriaId) && !anualesHasRelevant
                        ? styles.periodGroupCollapsed
                        : ''
                    }`}
                  >
                    <div className={styles.periodDivider}>
                      <span className={styles.periodDividerLabel}>Anual</span>
                      <span className={styles.periodDividerLine} />
                    </div>
                    <div className={styles.nodesList}>
                      {anuales.map(node => {
                        const isRel = isNodeRelevant(node.materia.id);
                        const isCollapsed = isFocusMode && Boolean(selectedMateriaId) && !isRel;

                        return (
                          <div
                            key={node.materia.id}
                            className={`${styles.nodeWrapper} ${
                              isCollapsed ? styles.nodeWrapperCollapsed : ''
                            }`}
                            style={{ display: isNodeVisible(node) ? undefined : 'none' }}
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
                              onHover={selectedMateriaId ? () => {} : onHoverMateria}
                              onToggleSimulate={onToggleSimulate}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2do Cuatrimestre */}
                {cuatri2.length > 0 && (
                  <div
                    className={`${styles.periodGroup} ${
                      isFocusMode && Boolean(selectedMateriaId) && !cuatri2HasRelevant
                        ? styles.periodGroupCollapsed
                        : ''
                    }`}
                  >
                    <div className={styles.periodDivider}>
                      <span className={styles.periodDividerLabel}>2° Cuatrimestre</span>
                      <span className={styles.periodDividerLine} />
                    </div>
                    <div className={styles.nodesList}>
                      {cuatri2.map(node => {
                        const isRel = isNodeRelevant(node.materia.id);
                        const isCollapsed = isFocusMode && Boolean(selectedMateriaId) && !isRel;

                        return (
                          <div
                            key={node.materia.id}
                            className={`${styles.nodeWrapper} ${
                              isCollapsed ? styles.nodeWrapperCollapsed : ''
                            }`}
                            style={{ display: isNodeVisible(node) ? undefined : 'none' }}
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
                              onHover={selectedMateriaId ? () => {} : onHoverMateria}
                              onToggleSimulate={onToggleSimulate}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
