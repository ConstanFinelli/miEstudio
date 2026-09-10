import { useState, useMemo, useCallback } from 'react';
import type { Materia } from '../../../types/academic';
import type { MateriaNodeData, MallaStatus, FilterMode, StatusFilter, ConnectionLink } from '../types';

interface UseMallaCurricularProps {
  materias: Materia[];
}

export const useMallaCurricular = ({ materias }: UseMallaCurricularProps) => {
  const [selectedMateriaId, setSelectedMateriaId] = useState<string | null>(null);
  const [hoveredMateriaId, setHoveredMateriaId] = useState<string | null>(null);
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(false);
  const [simulatedApprovedIds, setSimulatedApprovedIds] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<FilterMode>('TODAS');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODOS');

  // Map de acceso rápido por ID
  const materiasMap = useMemo(() => {
    const map = new Map<string, Materia>();
    materias.forEach(m => map.set(m.id, m));
    return map;
  }, [materias]);

  // Toggle simulación global
  const toggleSimulation = useCallback(() => {
    setIsSimulationActive(prev => {
      if (prev) {
        // Al desactivar, resetear las simuladas
        setSimulatedApprovedIds(new Set());
      }
      return !prev;
    });
  }, []);

  // Simular aprobación de una materia específica
  const toggleSimulateSubject = useCallback((id: string) => {
    setSimulatedApprovedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const resetSimulation = useCallback(() => {
    setSimulatedApprovedIds(new Set());
  }, []);

  // Determinar si una materia está efectivamente aprobada (real o simulada)
  const isAprobadaEffective = useCallback((materia: Materia): boolean => {
    if (materia.estado === 'APROBADA' || materia.estado === 'PROMOCIONADA') {
      return true;
    }
    if (isSimulationActive && simulatedApprovedIds.has(materia.id)) {
      return true;
    }
    return false;
  }, [isSimulationActive, simulatedApprovedIds]);

  // Determinar si una materia está regularizada o aprobada
  const isRegularOrAprobadaEffective = useCallback((materia: Materia): boolean => {
    if (isAprobadaEffective(materia)) return true;
    if (materia.estado === 'REGULAR') return true;
    return false;
  }, [isAprobadaEffective]);

  // Grafo de desbloqueos a futuro (map de materiaId -> lista de materias que la tienen de correlativa)
  const downstreamMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    materias.forEach(m => {
      const allPre = [
        ...(m.correlativasCursar || []),
        ...(m.correlativasRendir || [])
      ];
      allPre.forEach(preId => {
        if (!map.has(preId)) {
          map.set(preId, new Set());
        }
        map.get(preId)!.add(m.id);
      });
    });
    return map;
  }, [materias]);

  // Calcular impacto total recursivo (cuello de botella)
  const getDownstreamCount = useCallback((startId: string): number => {
    const visited = new Set<string>();
    const queue = [startId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      const dependents = downstreamMap.get(current);
      if (dependents) {
        dependents.forEach(depId => {
          if (!visited.has(depId)) {
            visited.add(depId);
            queue.push(depId);
          }
        });
      }
    }
    return visited.size;
  }, [downstreamMap]);

  // Computar nodos de materias con estados dinámicos
  const nodesMap = useMemo(() => {
    const map = new Map<string, MateriaNodeData>();

    materias.forEach(materia => {
      const isSim = isSimulationActive && simulatedApprovedIds.has(materia.id);

      // Evaluación de correlativas para Cursar
      const correlativasCursarFaltantes: Materia[] = [];
      const correlativasCursarCumplidas: Materia[] = [];

      (materia.correlativasCursar || []).forEach(reqId => {
        const reqMat = materiasMap.get(reqId);
        if (reqMat) {
          if (isRegularOrAprobadaEffective(reqMat)) {
            correlativasCursarCumplidas.push(reqMat);
          } else {
            correlativasCursarFaltantes.push(reqMat);
          }
        }
      });

      // Evaluación de correlativas para Rendir
      const correlativasRendirFaltantes: Materia[] = [];
      const correlativasRendirCumplidas: Materia[] = [];

      (materia.correlativasRendir || []).forEach(reqId => {
        const reqMat = materiasMap.get(reqId);
        if (reqMat) {
          if (isAprobadaEffective(reqMat)) {
            correlativasRendirCumplidas.push(reqMat);
          } else {
            correlativasRendirFaltantes.push(reqMat);
          }
        }
      });

      const puedeCursar = correlativasCursarFaltantes.length === 0;
      const puedeRendir = correlativasRendirFaltantes.length === 0;

      // Estado calculado
      let computedStatus: MallaStatus;
      if (isAprobadaEffective(materia)) {
        computedStatus = materia.estado === 'PROMOCIONADA' && !isSim ? 'PROMOCIONADA' : 'APROBADA';
      } else if (materia.estado === 'CURSANDO') {
        computedStatus = 'CURSANDO';
      } else if (materia.estado === 'REGULAR') {
        computedStatus = 'REGULAR';
      } else if (puedeCursar) {
        computedStatus = 'HABILITADA';
      } else {
        computedStatus = 'BLOQUEADA';
      }

      // Materias directas que desbloquea
      const directDependents = Array.from(downstreamMap.get(materia.id) || [])
        .map(id => materiasMap.get(id))
        .filter((m): m is Materia => m !== undefined);

      map.set(materia.id, {
        materia,
        computedStatus,
        isSimulated: isSim,
        correlativasCursarFaltantes,
        correlativasCursarCumplidas,
        correlativasRendirFaltantes,
        correlativasRendirCumplidas,
        desbloqueaDirectas: directDependents,
        desbloqueaTotalCount: getDownstreamCount(materia.id),
        puedeCursar,
        puedeRendir
      });
    });

    return map;
  }, [
    materias,
    materiasMap,
    isSimulationActive,
    simulatedApprovedIds,
    isAprobadaEffective,
    isRegularOrAprobadaEffective,
    downstreamMap,
    getDownstreamCount
  ]);

  // Agrupar materias por año lectivo
  const materiasByYear = useMemo(() => {
    const grouped: Record<number, MateriaNodeData[]> = {};

    materias.forEach(m => {
      const anio = m.anio || 1;
      if (!grouped[anio]) grouped[anio] = [];
      const nodeData = nodesMap.get(m.id);
      if (nodeData) {
        grouped[anio].push(nodeData);
      }
    });

    // Ordenar por cuatrimestre (1C, 2C, Anual) y luego nombre
    const cuatriWeight: Record<string, number> = { '1C': 1, 'Anual': 2, '2C': 3 };
    Object.keys(grouped).forEach(key => {
      const yr = Number(key);
      grouped[yr].sort((a, b) => {
        const wA = cuatriWeight[a.materia.cuatrimestre] || 99;
        const wB = cuatriWeight[b.materia.cuatrimestre] || 99;
        if (wA !== wB) return wA - wB;
        return a.materia.nombre.localeCompare(b.materia.nombre);
      });
    });

    return grouped;
  }, [materias, nodesMap]);

  const yearsList = useMemo(() => {
    const yrs = Object.keys(materiasByYear).map(Number);
    return yrs.sort((a, b) => a - b);
  }, [materiasByYear]);

  // Materia seleccionada explícitamente con click (para abrir el Drawer lateral de diagnóstico)
  const selectedMateriaData = selectedMateriaId ? nodesMap.get(selectedMateriaId) || null : null;

  // Materia enfocada activa: Si hay una materia seleccionada, TIENE PRIORIDAD ABSOLUTA.
  // El hover solo actúa cuando NO hay ninguna materia seleccionada.
  const focusedMateriaId = selectedMateriaId ? selectedMateriaId : hoveredMateriaId;
  const activeMateriaData = focusedMateriaId ? nodesMap.get(focusedMateriaId) || null : null;

  // Conexiones de grafo activas para la materia enfocada
  const activeConnections = useMemo((): ConnectionLink[] => {
    if (!focusedMateriaId) return [];

    const focusedMat = materiasMap.get(focusedMateriaId);
    if (!focusedMat) return [];

    const links: ConnectionLink[] = [];

    // 1. Requisitos previos (UPSTREAM -> de las cuales depende)
    if (filterMode === 'TODAS' || filterMode === 'SOLO_CURSAR') {
      (focusedMat.correlativasCursar || []).forEach(preId => {
        links.push({
          id: `link-up-cur-${preId}-${focusedMat.id}`,
          sourceId: preId,
          targetId: focusedMat.id,
          tipo: 'CURSAR',
          isHighlighted: true,
          direction: 'UPSTREAM'
        });
      });
    }

    if (filterMode === 'TODAS' || filterMode === 'SOLO_RENDIR') {
      (focusedMat.correlativasRendir || []).forEach(preId => {
        // Evitar duplicar si ya está en cursar
        if (!links.some(l => l.sourceId === preId && l.targetId === focusedMat.id)) {
          links.push({
            id: `link-up-ren-${preId}-${focusedMat.id}`,
            sourceId: preId,
            targetId: focusedMat.id,
            tipo: 'RENDIR',
            isHighlighted: true,
            direction: 'UPSTREAM'
          });
        }
      });
    }

    // 2. Futuras que desbloquea (DOWNSTREAM -> las que dependen de ella)
    const downstreamIds = downstreamMap.get(focusedMat.id);
    if (downstreamIds) {
      downstreamIds.forEach(depId => {
        const depMat = materiasMap.get(depId);
        if (!depMat) return;

        const isCursarDep = depMat.correlativasCursar?.includes(focusedMat.id);
        const isRendirDep = depMat.correlativasRendir?.includes(focusedMat.id);

        if ((isCursarDep && (filterMode === 'TODAS' || filterMode === 'SOLO_CURSAR')) ||
            (isRendirDep && (filterMode === 'TODAS' || filterMode === 'SOLO_RENDIR'))) {
          links.push({
            id: `link-down-${focusedMat.id}-${depId}`,
            sourceId: focusedMat.id,
            targetId: depId,
            tipo: isCursarDep ? 'CURSAR' : 'RENDIR',
            isHighlighted: true,
            direction: 'DOWNSTREAM'
          });
        }
      });
    }

    return links;
  }, [focusedMateriaId, materiasMap, downstreamMap, filterMode]);

  // Estadísticas globales y de simulación
  const stats = useMemo(() => {
    let aprobadasCount = 0;
    let promocionadasCount = 0;
    let cursandoCount = 0;
    let regularesCount = 0;
    let habilitadasCount = 0;
    let bloqueadasCount = 0;

    nodesMap.forEach(node => {
      switch (node.computedStatus) {
        case 'APROBADA':
          aprobadasCount++;
          break;
        case 'PROMOCIONADA':
          aprobadasCount++;
          promocionadasCount++;
          break;
        case 'CURSANDO':
          cursandoCount++;
          break;
        case 'REGULAR':
          regularesCount++;
          break;
        case 'HABILITADA':
          habilitadasCount++;
          break;
        case 'BLOQUEADA':
          bloqueadasCount++;
          break;
      }
    });

    const total = materias.length;
    const porcentajeCarrera = total > 0 ? Number(((aprobadasCount / total) * 100).toFixed(1)) : 0;

    return {
      totalMaterias: total,
      aprobadasCount,
      promocionadasCount,
      cursandoCount,
      regularesCount,
      habilitadasCount,
      bloqueadasCount,
      porcentajeCarrera,
      simulatedGainCount: simulatedApprovedIds.size
    };
  }, [nodesMap, materias.length, simulatedApprovedIds.size]);

  // Manejar hover evitando desincronizar cuando hay una materia seleccionada
  const handleSetHoveredMateriaId = useCallback((id: string | null) => {
    if (selectedMateriaId) return;
    setHoveredMateriaId(id);
  }, [selectedMateriaId]);

  const handleSetSelectedMateriaId = useCallback((action: string | null | ((prev: string | null) => string | null)) => {
    setHoveredMateriaId(null);
    setSelectedMateriaId(action);
  }, []);

  return {
    selectedMateriaId,
    setSelectedMateriaId: handleSetSelectedMateriaId,
    hoveredMateriaId,
    setHoveredMateriaId: handleSetHoveredMateriaId,
    focusedMateriaId,
    selectedMateriaData,
    activeMateriaData,
    activeConnections,
    nodesMap,
    materiasByYear,
    yearsList,
    isSimulationActive,
    simulatedApprovedIds,
    toggleSimulation,
    toggleSimulateSubject,
    resetSimulation,
    filterMode,
    setFilterMode,
    statusFilter,
    setStatusFilter,
    stats
  };
};
