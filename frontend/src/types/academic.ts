export type EstadoMateria =
  | "CURSANDO"
  | "REGULAR"
  | "APROBADA"
  | "PROMOCIONADA"
  | "LIBRE"
  | "PENDIENTE";
export type TipoEvaluacion =
  | "PARCIAL"
  | "RECUPERATORIO"
  | "FINAL"
  | "TP"
  | "LABORATORIO"
  | "QUIZ";
export type EstadoEvaluacion = "PENDIENTE" | "EN_PROGRESO" | "CALIFICADO";
export type TipoEvento =
  | "EXAMEN"
  | "ENTREGA"
  | "LABORATORIO"
  | "ESTUDIO"
  | "CONSULTA";
export type CategoriaMaterial =
  | "TEORIA"
  | "GUIA_PRACTICA"
  | "EXAMEN_ANTERIOR"
  | "BIBLIOGRAFIA"
  | "OTRO";

export interface Materia {
  id: string;
  carreraId?: string;
  carrera_id?: string;
  codigo: string;
  nombre: string;
  anio: number;
  cuatrimestre: "1C" | "2C" | "Anual";
  estado: EstadoMateria;
  color: string;
  profesores: {
    titular: string;
    jtp: string;
  };
  comision: string;
  modalidad: "Presencial" | "Virtual" | "Híbrida";
  promedio: number;
  reglasAcreditacion: {
    promocion: {
      permitePromocion?: boolean;
      condicion: string;
      minPromedio?: number;
      minParcial?: number;
      permiteRecuperatorio?: boolean;
      minAsistencia?: number;
      descripcion?: string;
    };
    regularidad: {
      condicion: string;
      minNota?: number;
      minAsistencia?: number;
      permiteRecuperatorio?: boolean;
      descripcion?: string;
    };
  };
  correlativasCursar?: string[];
  correlativasRendir?: string[];
}

export interface InstanciaEvaluacion {
  id: string;
  materiaId: string;
  materiaCodigo: string;
  materiaNombre: string;
  titulo: string;
  tipo: TipoEvaluacion;
  fecha: string | null; // ISO String or null for past/undated
  horario: string;
  peso: number; // Porcentaje ej: 40
  nota: number | null;
  estado: EstadoEvaluacion;
  aula: string;
  modalidad: "Presencial" | "Virtual";
  temario: string[];
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
  unidad?: string;
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

export type DiaSemana =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO";

export interface HorarioCursada {
  id: string;
  materiaId: string;
  materiaNombre?: string;
  materiaCodigo?: string;
  materiaColor?: string;
  diaSemana: DiaSemana;
  horaInicio: string; // "08:30"
  horaFin: string; // "12:45"
  facultadSede?: string; // ej: "UTN FRBA - Medrano" o "UBA FCEyN"
  aula?: string;
  tipoClase?: "Teoría" | "Práctica" | "Laboratorio" | "Taller" | string;
  modalidad?: "Presencial" | "Virtual" | "Híbrida";
  observaciones?: string;
}

export interface ParsedSubjectItem {
  temp_id: string;
  codigo: string;
  nombre: string;
  anio: number;
  cuatrimestre: string; // "1C" | "2C" | "Anual"
  modalidad: string;
  carga_horaria_total?: number;
  carga_horaria_semanal?: number;
  correlativas_cursar: string[];
  correlativas_rendir: string[];
  estado?: EstadoMateria;
  color?: string;
  profesor_titular?: string;
  profesor_jtp?: string;
}

export interface ParseStudyPlanResponse {
  carrera_sugerida?: string;
  total_materias: number;
  duracion_anios: number;
  materias: ParsedSubjectItem[];
  notas?: string;
}

export interface BatchImportPlanRequest {
  carrera_id: string;
  replace_plan: boolean;
  duracion_anios: number;
  materias: ParsedSubjectItem[];
}

export interface BatchImportPlanResponse {
  total_importadas: number;
  duracion_anios: number;
  carrera_id: string;
  materias: Materia[];
}

