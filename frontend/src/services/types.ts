/**
 * Backend Go DTOs (Data Transfer Objects)
 * Corresponden a los modelos relacionales de Go y PostgreSQL definidos en docs/cruds.md.
 * Siguen la convención snake_case del backend.
 */

export interface ReglaPromocionDTO {
  permite_promocion: boolean;
  condicion?: string;
  min_promedio?: number;
  min_parcial?: number;
  permite_recuperatorio: boolean;
  min_asistencia: number;
  descripcion: string;
}

export interface ReglaRegularidadDTO {
  condicion?: string;
  min_nota?: number;
  min_asistencia: number;
  permite_recuperatorio: boolean;
  descripcion: string;
}

export interface ReglasAcreditacionDTO {
  promocion: ReglaPromocionDTO;
  regularidad: ReglaRegularidadDTO;
}

export interface MateriaDTO {
  id: string;
  codigo?: string;
  nombre: string;
  anio: number;
  cuatrimestre: "PRIMERO" | "SEGUNDO" | "ANUAL";
  estado: "CURSANDO" | "REGULAR" | "APROBADA" | "PROMOCIONADA" | "LIBRE";
  color: string;
  comision?: string;
  modalidad?: "Presencial" | "Virtual" | "Híbrida";
  promedio?: number;
  profesor_titular?: string;
  profesor_jtp?: string;
  reglas_acreditacion?: ReglasAcreditacionDTO | null;
  correlativas_cursar?: string[];
  correlativas_rendir?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface EvaluacionDTO {
  id: string;
  materia_id: string;
  materia_nombre?: string;
  materia_codigo?: string;
  titulo: string;
  tipo: "PARCIAL" | "RECUPERATORIO" | "FINAL" | "TP" | "LABORATORIO" | "QUIZ";
  fecha: string | null;
  horario?: string;
  nota: number | null;
  peso: number;
  es_aprobatorio: boolean;
  aula?: string;
  modalidad?: "Presencial" | "Virtual";
  temario?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ApunteDTO {
  id: string;
  materia_id: string;
  titulo: string;
  contenido: string;
  carpeta?: string;
  resumen?: string;
  etiquetas: string[];
  created_at?: string;
  updated_at?: string;
}

export interface EventoCalendarioDTO {
  id: string;
  materia_id?: string | null;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo: "EXAMEN" | "ENTREGA" | "LABORATORIO" | "ESTUDIO" | "CONSULTA";
  aula?: string;
  modalidad?: string;
  impacto_academico?: string;
  es_critico?: boolean;
}

export interface MaterialDTO {
  id: string;
  materia_id: string;
  titulo: string;
  categoria:
    | "TEORIA"
    | "GUIA_PRACTICA"
    | "EXAMEN_ANTERIOR"
    | "BIBLIOGRAFIA"
    | "OTRO";
  unidad?: string;
  archivo_nombre_original: string;
  archivo_path: string;
  mime_type: string;
  tamanio_bytes: number;
  cant_paginas?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface PerfilDTO {
  id: string;
  nombre: string;
  legajo: string;
  carrera: string;
  semestre_actual: string;
  ciclo_activo?: string;
  promedio_general: number;
  delta_promedio?: number;
  puesto_cohorte?: number;
  percentil?: number;
  materias_aprobadas: number;
  materias_totales: number;
  creditos_aprobados: number;
  creditos_totales: number;
  promedio_historico?: { cuatrimestre: string; promedio: number }[];
}

export interface HorarioCursadaDTO {
  id: string;
  materia_id: string;
  materia?: MateriaDTO;
  dia_semana:
    | "LUNES"
    | "MARTES"
    | "MIERCOLES"
    | "JUEVES"
    | "VIERNES"
    | "SABADO";
  hora_inicio: string;
  hora_fin: string;
  facultad_sede?: string;
  aula?: string;
  tipo_clase?: string;
  modalidad?: "Presencial" | "Virtual" | "Híbrida";
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
