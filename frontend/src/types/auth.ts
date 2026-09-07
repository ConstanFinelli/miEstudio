export interface User {
  id: string;
  email: string;
  nombre: string;
  avatar_url?: string;
  created_at: string;
}

export interface Carrera {
  id: string;
  usuario_id: string;
  nombre: string;
  facultad_sede: string;
  legajo: string;
  semestre_actual: string;
  ciclo_activo: string;
  duracion_anios: number;
  total_materias_plan: number;
  is_activa: boolean;
  promedio_general: number;
  materias_aprobadas: number;
  fecha_ingreso?: string;
  created_at: string;
  updated_at: string;
}

export interface AprobacionHistorica {
  id: string;
  usuario_id: string;
  carrera_id: string;
  materia_id: string;
  nota_final: number;
  fecha_aprobacion: string;
  tipo_aprobacion: 'FINAL' | 'PROMOCION' | 'EQUIVALENCIA';
  libro_acta?: string;
  folio_acta?: string;
  observaciones?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  carrera_activa?: Carrera;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  carrera_nombre?: string;
  facultad_sede?: string;
  legajo?: string;
}
