import type { Materia } from '../../types/academic';

export type MallaStatus =
  | 'APROBADA'
  | 'PROMOCIONADA'
  | 'CURSANDO'
  | 'REGULAR'
  | 'HABILITADA'
  | 'BLOQUEADA';

export type FilterMode = 'TODAS' | 'SOLO_CURSAR' | 'SOLO_RENDIR';
export type StatusFilter = 'TODOS' | 'HABILITADAS' | 'CURSANDO' | 'REGULARES' | 'APROBADAS' | 'BLOQUEADAS';

export interface MateriaNodeData {
  materia: Materia;
  computedStatus: MallaStatus;
  isSimulated: boolean;
  correlativasCursarFaltantes: Materia[];
  correlativasCursarCumplidas: Materia[];
  correlativasRendirFaltantes: Materia[];
  correlativasRendirCumplidas: Materia[];
  desbloqueaDirectas: Materia[];
  desbloqueaTotalCount: number;
  puedeCursar: boolean;
  puedeRendir: boolean;
}

export interface ConnectionLink {
  id: string;
  sourceId: string;
  targetId: string;
  tipo: 'CURSAR' | 'RENDIR';
  isHighlighted: boolean;
  direction: 'UPSTREAM' | 'DOWNSTREAM'; // UPSTREAM = prerequisite of active; DOWNSTREAM = unlocked by active
}
