export type EstadoMateria = 'CURSANDO' | 'REGULAR' | 'APROBADA' | 'PROMOCIONADA' | 'LIBRE';
export type TipoEvaluacion = 'PARCIAL' | 'RECUPERATORIO' | 'FINAL' | 'TP' | 'LABORATORIO' | 'QUIZ';
export type EstadoEvaluacion = 'PENDIENTE' | 'EN_PROGRESO' | 'CALIFICADO';
export type TipoEvento = 'EXAMEN' | 'ENTREGA' | 'LABORATORIO' | 'ESTUDIO' | 'CONSULTA';
export type CategoriaMaterial = 'TEORIA' | 'GUIA_PRACTICA' | 'EXAMEN_ANTERIOR' | 'BIBLIOGRAFIA' | 'OTRO';

export interface Materia {
  id: string;
  codigo: string;
  nombre: string;
  anio: number;
  cuatrimestre: '1C' | '2C' | 'Anual';
  estado: EstadoMateria;
  color: string;
  profesores: {
    titular: string;
    jtp: string;
  };
  comision: string;
  modalidad: 'Presencial' | 'Virtual' | 'Híbrida';
  promedio: number;
  calificacionFinal?: number;
  reglasAcreditacion: {
    promocion: {
      permitePromocion?: boolean;
      minPromedio: number;
      minParcial: number;
      permiteRecuperatorio: boolean;
      minAsistencia?: number;
      descripcion: string;
    };
    regularidad: {
      minNota: number;
      minAsistencia: number;
      permiteRecuperatorio?: boolean;
      descripcion: string;
    };
  };
  correlativas: {
    requiere: { materiaId: string; codigo: string; nombre: string; estado: EstadoMateria }[];
    habilita: { materiaId: string; codigo: string; nombre: string; anio: number }[];
  };
}

export interface InstanciaEvaluacion {
  id: string;
  materiaId: string;
  materiaCodigo: string;
  materiaNombre: string;
  titulo: string;
  tipo: TipoEvaluacion;
  fecha: string; // ISO String
  horario: string;
  peso: number; // Porcentaje ej: 40
  nota: number | null;
  estado: EstadoEvaluacion;
  aula: string;
  modalidad: 'Presencial' | 'Virtual';
  temario: string[];
  asistencia: number;
  guiasCompletadas: string;
  esAprobatorio: boolean;
  diasRestantes?: number;
}

export interface ApunteNota {
  id: string;
  materiaId: string;
  materiaNombre: string;
  evaluacionId?: string;
  evaluacionNombre?: string;
  carpeta: string;
  titulo: string;
  resumen?: string;
  contenidoMarkdown: string;
  tags: string[];
  fechaModificacion: string;
  tiempoLecturaMin: number;
  palabras: number;
  esActivo?: boolean;
}

export interface EventoCalendario {
  id: string;
  titulo: string;
  materiaId?: string;
  materiaCodigo?: string;
  materiaNombre?: string;
  tipo: TipoEvento;
  fecha: string; // YYYY-MM-DD
  horarioInicio: string;
  horarioFin: string;
  aula?: string;
  modalidad?: string;
  impactoAcademico?: string;
  esCritico?: boolean;
  hitos?: { id: string; texto: string; completado: boolean; fecha?: string }[];
}

export interface MaterialEstudio {
  id: string;
  materiaId: string;
  titulo: string;
  categoria: CategoriaMaterial;
  archivoNombre: string;
  archivoUrl: string;
  tamanioBytes: number;
  cantPaginas?: number;
  fechaSubida: string;
}

export interface PerfilEstudiante {
  nombre: string;
  legajo: string;
  carrera: string;
  semestreActual: string;
  cicloActivo: string;
  promedioGeneral: number;
  promedioHistorico: { cuatrimestre: string; promedio: number }[];
  creditosAprobados: number;
  creditosTotales: number;
  materiasAprobadas: number;
  materiasTotales: number;
  puestoCohorte: number;
  percentil: number;
  deltaPromedio: number;
}
