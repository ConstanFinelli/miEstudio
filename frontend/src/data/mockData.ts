import type {
  PerfilEstudiante,
  Materia,
  InstanciaEvaluacion,
  ApunteNota,
  EventoCalendario,
  MaterialEstudio
} from '../types/academic';

export const mockPerfil: PerfilEstudiante = {
  nombre: 'Sofía Chen',
  legajo: '#48.910',
  carrera: 'Ingeniería en Sistemas',
  semestreActual: 'Semestre 7 / 10',
  cicloActivo: '2025 · 1er Cuatrimestre',
  promedioGeneral: 8.42,
  deltaPromedio: 0.3,
  puestoCohorte: 3,
  percentil: 94,
  materiasAprobadas: 28,
  materiasTotales: 44,
  creditosAprobados: 180,
  creditosTotales: 280,
  promedioHistorico: [
    { cuatrimestre: '2022-1C', promedio: 7.2 },
    { cuatrimestre: '2022-2C', promedio: 7.6 },
    { cuatrimestre: '2023-1C', promedio: 7.9 },
    { cuatrimestre: '2024-1C', promedio: 8.1 },
    { cuatrimestre: '2025-1C', promedio: 8.42 }
  ]
};

export const mockMaterias: Materia[] = [
  // --- 1° AÑO ---
  {
    id: 'mat-alg1',
    codigo: 'ALG-101',
    nombre: 'Álgebra y Geometría Analítica',
    anio: 1,
    cuatrimestre: '1C',
    estado: 'APROBADA',
    color: '#10b981',
    comision: 'Comisión K1011',
    modalidad: 'Presencial',
    profesores: { titular: 'Lic. Horacio Romero', jtp: 'Ing. Silvia Costa' },
    promedio: 8.0,
    reglasAcreditacion: {
      promocion: { permitePromocion: true, condicion: 'Parciales ≥ 8', descripcion: 'Promocionada' },
      regularidad: { condicion: 'Parciales ≥ 4', descripcion: 'Regularizada' }
    },
    correlativasCursar: [],
    correlativasRendir: []
  },
  {
    id: 'mat-ana1',
    codigo: 'MAT-102',
    nombre: 'Análisis Matemático I',
    anio: 1,
    cuatrimestre: 'Anual',
    estado: 'APROBADA',
    color: '#10b981',
    comision: 'Comisión K1024',
    modalidad: 'Presencial',
    profesores: { titular: 'Dra. María González', jtp: 'Lic. Pablo Rossi' },
    promedio: 8.5,
    reglasAcreditacion: {
      promocion: { permitePromocion: true, condicion: 'Parciales ≥ 8', descripcion: 'Promocionada' },
      regularidad: { condicion: 'Parciales ≥ 4', descripcion: 'Regularizada' }
    },
    correlativasCursar: [],
    correlativasRendir: []
  },
  {
    id: 'mat-ayp',
    codigo: 'PROG-103',
    nombre: 'Algoritmos y Programación I',
    anio: 1,
    cuatrimestre: '1C',
    estado: 'APROBADA',
    color: '#10b981',
    comision: 'Comisión K1002',
    modalidad: 'Presencial',
    profesores: { titular: 'Ing. Lucas Díaz', jtp: 'Lic. Sofía Miller' },
    promedio: 9.0,
    reglasAcreditacion: {
      promocion: { permitePromocion: true, condicion: 'Parciales ≥ 8 y TP C++', descripcion: 'Promocionada' },
      regularidad: { condicion: 'Parciales ≥ 4', descripcion: 'Regularizada' }
    },
    correlativasCursar: [],
    correlativasRendir: []
  },
  {
    id: 'mat-syo',
    codigo: 'SIS-104',
    nombre: 'Sistemas y Organizaciones',
    anio: 1,
    cuatrimestre: '2C',
    estado: 'APROBADA',
    color: '#10b981',
    comision: 'Comisión K1051',
    modalidad: 'Presencial',
    profesores: { titular: 'Dr. Roberto Blanco', jtp: 'Ing. Carolina Paz' },
    promedio: 8.0,
    reglasAcreditacion: {
      promocion: { permitePromocion: true, condicion: 'Parciales ≥ 7 y monografía', descripcion: 'Promocionada' },
      regularidad: { condicion: 'Parciales ≥ 4', descripcion: 'Regularizada' }
    },
    correlativasCursar: [],
    correlativasRendir: []
  },

  // --- 2° AÑO ---
  {
    id: 'mat-5',
    codigo: 'PAR-201',
    nombre: 'Paradigmas de Programación',
    anio: 2,
    cuatrimestre: '1C',
    estado: 'APROBADA',
    color: '#10b981',
    comision: 'Comisión K2002 Presencial',
    modalidad: 'Presencial',
    profesores: { titular: 'Lic. Clara Kay', jtp: 'Ing. Pablo McCarthy' },
    promedio: 8.0,
    reglasAcreditacion: {
      promocion: { permitePromocion: true, condicion: 'Aprobada en mesa de final #1042', descripcion: 'Aprobada' },
      regularidad: { condicion: '3 parciales de paradigmas ≥ 4 y TP Wollok', descripcion: 'Cumplida' }
    },
    correlativasCursar: ['mat-ayp'],
    correlativasRendir: ['mat-ayp']
  },
  {
    id: 'mat-4',
    codigo: 'ARQ-202',
    nombre: 'Arquitectura de Computadores',
    anio: 2,
    cuatrimestre: '2C',
    estado: 'PROMOCIONADA',
    color: '#10b981',
    comision: 'Comisión K2014 Presencial',
    modalidad: 'Presencial',
    profesores: { titular: 'Ing. Gustavo Patterson', jtp: 'Ing. Matías Hennessy' },
    promedio: 9.0,
    reglasAcreditacion: {
      promocion: { permitePromocion: true, condicion: 'Parciales ≥ 8 y coloquio assembler', descripcion: 'Promocionada' },
      regularidad: { condicion: 'Parciales ≥ 4 y labs en Logisim', descripcion: 'Cumplida' }
    },
    correlativasCursar: ['mat-ayp'],
    correlativasRendir: ['mat-ayp']
  },
  {
    id: 'mat-ana2',
    codigo: 'MAT-203',
    nombre: 'Análisis Matemático II',
    anio: 2,
    cuatrimestre: 'Anual',
    estado: 'REGULAR',
    color: '#8b5cf6',
    comision: 'Comisión K2033',
    modalidad: 'Presencial',
    profesores: { titular: 'Dr. Fernando Laplace', jtp: 'Lic. Marta Euler' },
    promedio: 6.5,
    reglasAcreditacion: {
      promocion: { permitePromocion: false, condicion: 'Requiere final obligatorio', descripcion: 'Sin promoción' },
      regularidad: { condicion: 'Parciales ≥ 4.0', descripcion: 'Regularizada' }
    },
    correlativasCursar: ['mat-ana1', 'mat-alg1'],
    correlativasRendir: ['mat-ana1', 'mat-alg1']
  },
  {
    id: 'mat-sist',
    codigo: 'SO-204',
    nombre: 'Sistemas Operativos',
    anio: 2,
    cuatrimestre: '2C',
    estado: 'REGULAR',
    color: '#8b5cf6',
    comision: 'Comisión K2041',
    modalidad: 'Presencial',
    profesores: { titular: 'Ing. Andrés Tanenbaum', jtp: 'Lic. Daniel Torvalds' },
    promedio: 7.0,
    reglasAcreditacion: {
      promocion: { permitePromocion: false, condicion: 'Final obligatorio', descripcion: 'Final pendiente' },
      regularidad: { condicion: 'TP C y Threads aprobado + Parcial ≥ 4', descripcion: 'Regularizada' }
    },
    correlativasCursar: ['mat-4', 'mat-ayp'],
    correlativasRendir: ['mat-4', 'mat-ayp']
  },
  {
    id: 'mat-bd1',
    codigo: 'DAT-205',
    nombre: 'Bases de Datos I',
    anio: 2,
    cuatrimestre: '1C',
    estado: 'APROBADA',
    color: '#10b981',
    comision: 'Comisión K2020',
    modalidad: 'Presencial',
    profesores: { titular: 'Dra. Elena Rossi', jtp: 'Lic. Carlos Codd' },
    promedio: 8.5,
    reglasAcreditacion: {
      promocion: { permitePromocion: true, condicion: 'Parciales ≥ 8 y modelo relacional', descripcion: 'Promocionada' },
      regularidad: { condicion: 'Parciales ≥ 4', descripcion: 'Regularizada' }
    },
    correlativasCursar: ['mat-ayp', 'mat-syo'],
    correlativasRendir: ['mat-ayp', 'mat-syo']
  },

  // --- 3° AÑO ---
  {
    id: 'mat-1',
    codigo: 'SIS-304',
    nombre: 'Sistemas Distribuidos',
    anio: 3,
    cuatrimestre: '1C',
    estado: 'CURSANDO',
    color: '#6366f1',
    comision: 'Comisión K3012 Presencial',
    modalidad: 'Presencial',
    profesores: { titular: 'Dr. Martín O. Balbis', jtp: 'Ing. Valeria Morales' },
    promedio: 8.5,
    reglasAcreditacion: {
      promocion: { permitePromocion: true, condicion: 'Promedio ≥ 8.0 y cada parcial individual ≥ 7.0', descripcion: 'Promocionable' },
      regularidad: { condicion: 'Parciales ≥ 4.0, 75% asistencia y TP de Redes', descripcion: 'Regularidad' }
    },
    correlativasCursar: ['mat-sist', 'mat-bd1'],
    correlativasRendir: ['mat-sist', 'mat-bd1']
  },
  {
    id: 'mat-2',
    codigo: 'DAT-301',
    nombre: 'Bases de Datos II',
    anio: 3,
    cuatrimestre: '1C',
    estado: 'CURSANDO',
    color: '#3b82f6',
    comision: 'Comisión K3001 Presencial',
    modalidad: 'Presencial',
    profesores: { titular: 'Dra. Elena Rossi', jtp: 'Lic. Fernando Gómez' },
    promedio: 7.0,
    reglasAcreditacion: {
      promocion: { permitePromocion: false, condicion: 'Examen final obligatorio', descripcion: 'Sin promoción' },
      regularidad: { condicion: '2 parciales ≥ 4 y TP de SQL grupal', descripcion: 'En curso' }
    },
    correlativasCursar: ['mat-bd1'],
    correlativasRendir: ['mat-bd1']
  },
  {
    id: 'mat-3',
    codigo: 'ALG-302',
    nombre: 'Algoritmos y Estructuras III',
    anio: 3,
    cuatrimestre: '1C',
    estado: 'CURSANDO',
    color: '#a855f7',
    comision: 'Cátedra Cormen & Sedgewick',
    modalidad: 'Presencial',
    profesores: { titular: 'Dr. Alejandro Turing', jtp: 'Ing. Lucas Díaz' },
    promedio: 7.8,
    reglasAcreditacion: {
      promocion: { permitePromocion: true, condicion: 'Parciales teóricos ≥ 7.5 y coloquio práctico', descripcion: 'Promocionable' },
      regularidad: { condicion: 'Promedio general ≥ 5.0 y 4 de 5 TPs', descripcion: 'En curso' }
    },
    correlativasCursar: ['mat-5'],
    correlativasRendir: ['mat-5']
  },
  {
    id: 'mat-red',
    codigo: 'RED-303',
    nombre: 'Redes de Información',
    anio: 3,
    cuatrimestre: '2C',
    estado: 'CURSANDO',
    color: '#06b6d4',
    comision: 'Comisión K3044',
    modalidad: 'Presencial',
    profesores: { titular: 'Ing. Jim Kurose', jtp: 'Lic. Keith Ross' },
    promedio: 0,
    reglasAcreditacion: {
      promocion: { permitePromocion: true, condicion: 'Laboratorios Cisco y parciales ≥ 8', descripcion: 'Promocionable' },
      regularidad: { condicion: 'Parciales ≥ 4', descripcion: 'En curso' }
    },
    correlativasCursar: ['mat-4', 'mat-sist'],
    correlativasRendir: ['mat-4', 'mat-sist']
  },

  // --- 4° AÑO ---
  {
    id: 'mat-ia',
    codigo: 'IA-401',
    nombre: 'Inteligencia Artificial',
    anio: 4,
    cuatrimestre: '1C',
    estado: 'CURSANDO',
    color: '#ec4899',
    comision: 'Comisión K4010',
    modalidad: 'Presencial',
    profesores: { titular: 'Dr. Stuart Russell', jtp: 'Ing. Peter Norvig' },
    promedio: 0,
    reglasAcreditacion: {
      promocion: { permitePromocion: true, condicion: 'Proyecto de Machine Learning y examen ≥ 8', descripcion: 'Promoción' },
      regularidad: { condicion: 'Parciales ≥ 4 y notebooks aprobados', descripcion: 'Regularidad' }
    },
    correlativasCursar: ['mat-3', 'mat-ana2'],
    correlativasRendir: ['mat-3', 'mat-ana2']
  },
  {
    id: 'mat-seg',
    codigo: 'SEG-402',
    nombre: 'Seguridad y Criptografía',
    anio: 4,
    cuatrimestre: '2C',
    estado: 'CURSANDO',
    color: '#f59e0b',
    comision: 'Comisión K4022',
    modalidad: 'Presencial',
    profesores: { titular: 'Dr. Bruce Schneier', jtp: 'Lic. Alice Rivest' },
    promedio: 0,
    reglasAcreditacion: {
      promocion: { permitePromocion: true, condicion: 'CTF y parciales ≥ 8', descripcion: 'Promoción' },
      regularidad: { condicion: 'Parciales ≥ 4', descripcion: 'Regularidad' }
    },
    correlativasCursar: ['mat-red', 'mat-1'],
    correlativasRendir: ['mat-red', 'mat-1']
  },
  {
    id: 'mat-proy',
    codigo: 'PROY-403',
    nombre: 'Proyecto Final de Carrera',
    anio: 4,
    cuatrimestre: 'Anual',
    estado: 'CURSANDO',
    color: '#64748b',
    comision: 'Tribunal Académico',
    modalidad: 'Híbrida',
    profesores: { titular: 'Comité de Tesis', jtp: 'Tutor Asignado' },
    promedio: 0,
    reglasAcreditacion: {
      promocion: { permitePromocion: false, condicion: 'Defensa oral pública de tesis', descripcion: 'Defensa de Tesis' },
      regularidad: { condicion: 'Informe de avance aprobado', descripcion: 'Regularidad' }
    },
    correlativasCursar: ['mat-1', 'mat-2', 'mat-3'],
    correlativasRendir: ['mat-1', 'mat-2', 'mat-3', 'mat-ia', 'mat-seg']
  }
];

export const mockEvaluaciones: InstanciaEvaluacion[] = [
  {
    id: 'eval-1',
    materiaId: 'mat-1',
    materiaCodigo: 'DIST-701',
    materiaNombre: 'Sistemas Distribuidos',
    titulo: 'Parcial 1: Sistemas Distribuidos',
    tipo: 'PARCIAL',
    fecha: '2025-04-24T19:00:00',
    horario: '19:00 hs',
    peso: 40,
    nota: null,
    estado: 'PENDIENTE',
    aula: 'Aula Magna Pabellón 3',
    modalidad: 'Presencial',
    temario: ['gRPC & Protocol Buffers', 'Raft Consensus Algorithm', 'Relojes Lógicos (Lamport)'],
    esAprobatorio: true,
    diasRestantes: 3
  },
  {
    id: 'eval-2',
    materiaId: 'mat-2',
    materiaCodigo: 'BD-502',
    materiaNombre: 'Bases de Datos II',
    titulo: 'TP Especial: Motor de Índices y Caché',
    tipo: 'TP',
    fecha: '2025-04-29T23:59:00',
    horario: '23:59 hs',
    peso: 25,
    nota: null,
    estado: 'EN_PROGRESO',
    aula: 'Entrega GitHub Classroom',
    modalidad: 'Virtual',
    temario: ['Golang 1.22', 'PostgreSQL WAL parsing', 'Benchmarking CPU'],
    esAprobatorio: true,
    diasRestantes: 8
  },
  {
    id: 'eval-3',
    materiaId: 'mat-3',
    materiaCodigo: 'ALG-603',
    materiaNombre: 'Algoritmos y Estructuras III',
    titulo: 'Parcial 2: Algoritmos Avanzados y Grafos',
    tipo: 'PARCIAL',
    fecha: '2025-05-15T17:00:00',
    horario: '17:00 hs',
    peso: 35,
    nota: null,
    estado: 'PENDIENTE',
    aula: 'Laboratorio Turing',
    modalidad: 'Presencial',
    temario: ['Flujo Máximo (Ford-Fulkerson)', 'Programación Lineal', 'NP-Completitud'],
    esAprobatorio: true,
    diasRestantes: 24
  },
  {
    id: 'eval-4',
    materiaId: 'mat-1',
    materiaCodigo: 'DIST-701',
    materiaNombre: 'Sistemas Distribuidos',
    titulo: 'TP Obligatorio: Motor Raft en Go',
    tipo: 'TP',
    fecha: '2025-04-10T23:59:00',
    horario: '23:59 hs',
    peso: 30,
    nota: 9.0,
    estado: 'CALIFICADO',
    aula: 'Campus Virtual',
    modalidad: 'Virtual',
    temario: ['Consenso Raft', 'Heartbeats', 'RPC con Go'],
    esAprobatorio: true
  },
  {
    id: 'eval-5',
    materiaId: 'mat-1',
    materiaCodigo: 'DIST-701',
    materiaNombre: 'Sistemas Distribuidos',
    titulo: 'Parcial 2 (Sistemas P2P & Paxos)',
    tipo: 'PARCIAL',
    fecha: '2025-06-12T19:00:00',
    horario: '19:00 hs',
    peso: 30,
    nota: null,
    estado: 'PENDIENTE',
    aula: 'Aula 302',
    modalidad: 'Presencial',
    temario: ['Consenso distribuido', 'Tolerancia a fallas bizantinas', 'DHT Chord'],
    esAprobatorio: true
  }
];

export const mockApuntes: ApunteNota[] = [
  {
    id: 'note-1',
    materiaId: 'mat-1',
    materiaNombre: 'Sistemas Distribuidos',
    evaluacionId: 'eval-1',
    evaluacionNombre: 'Parcial 1 (Jueves 8 May)',
    carpeta: '1er Parcial',
    titulo: 'Consenso Distribuido: Algoritmo Raft',
    resumen: 'Mecanismo de elección de líderes, log replication y seguridad frente a particiones...',
    tags: ['distribuidos', 'parcial1', 'raft-core'],
    fechaModificacion: 'hace 15 minutos',
    tiempoLecturaMin: 6,
    palabras: 2140,
    esActivo: true,
    contenidoMarkdown: `
> [!IMPORTANT]
> **REGLA CRÍTICA PARA EL 1ER PARCIAL**
> Memorizar condición de **quórum mayoritaria estricta**:
> \`Q = floor(N/2) + 1\`
> En un clúster de **N=5** nodos, tolera exactamente **2 fallos simultáneos** sin comprometer la liveness ni crear split-brain.

### Definición Formal KaTeX:
$$ Q = \\lfloor N / 2 \\rfloor + 1 $$

*Donde $N$ es el total de servidores activos y $Q$ es la mayoría absoluta requerida.*

---

## 1. Introducción y Problema del Consenso

El consenso implica múltiples servidores acordando valores de estado. En presencia de desconexiones de red y demoras arbitrarias, Raft descompone la problemática en tres subproblemas independientes: **Elección de Líder**, **Replicación de Logs** y **Seguridad**.

\`\`\`go
// Nodo Raft en Go
type RaftNode struct {
    mu          sync.Mutex
    peers       []*rpc.ClientEnd
    currentTerm int
    votedFor    int
    state       NodeRole // Follower, Candidate, Leader
}
\`\`\`

### Tabla de Estados de un Nodo Raft:

| Estado | Responsabilidad | Transición Si... |
| :--- | :--- | :--- |
| **Follower** | Responde RPCs de candidatos y líderes | Expira el election timeout sin heartbeat |
| **Candidate** | Solicita votos (\`RequestVoteRPC\`) | Obtiene quórum mayoritario ($Q$) o vence timeout |
| **Leader** | Atiende clientes y replica logs | Recibe RPC con un término mayor ($T > \\text{currentTerm}$) |
`
  },
  {
    id: 'note-2',
    materiaId: 'mat-1',
    materiaNombre: 'Sistemas Distribuidos',
    carpeta: '1er Parcial',
    titulo: 'RPC y Serialización con Protocol Buffers',
    resumen: 'Comparativa gRPC vs REST. Estructuración del archivo .proto y serialización binaria compacta.',
    tags: ['redes', 'grpc'],
    fechaModificacion: '17 Abr',
    tiempoLecturaMin: 4,
    palabras: 1420,
    contenidoMarkdown: `## RPC y Protocol Buffers\n\nProtocol Buffers ofrece compresión estricta basada en tags y tipos de datos enteros en zigzag.`
  },
  {
    id: 'note-3',
    materiaId: 'mat-1',
    materiaNombre: 'Sistemas Distribuidos',
    carpeta: '1er Parcial',
    titulo: 'Relojes Lógicos de Lamport & Vector Clocks',
    resumen: 'Ordenamiento causal de eventos concurrentes sin sincronización física mediante timestamps.',
    tags: ['sincronizacion'],
    fechaModificacion: '12 Abr',
    tiempoLecturaMin: 5,
    palabras: 1750,
    contenidoMarkdown: `## Relojes Lógicos de Lamport\n\nSi $a \\to b$, entonces $L(a) < L(b)$.`
  },
  {
    id: 'note-4',
    materiaId: 'mat-1',
    materiaNombre: 'Sistemas Distribuidos',
    carpeta: 'Laboratorios Go',
    titulo: 'Glosario Teorema CAP y PACELC',
    resumen: 'Trade-offs de Consistencia, Disponibilidad y Tolerancia a Particiones en arquitecturas...',
    tags: ['teoria'],
    fechaModificacion: '05 Abr',
    tiempoLecturaMin: 3,
    palabras: 980,
    contenidoMarkdown: `## Teorema CAP\n\nEn presencia de partición de red ($P$), el sistema debe elegir entre Consistencia ($C$) o Disponibilidad ($A$).`
  }
];

export const mockEventosCalendario: EventoCalendario[] = [
  {
    id: 'evt-1',
    titulo: '1° Parcial: Sistemas Distribuidos',
    materiaId: 'mat-1',
    materiaCodigo: 'SIS-304',
    materiaNombre: 'Sistemas Distribuidos',
    tipo: 'EXAMEN',
    fecha: '2025-04-24',
    horarioInicio: '09:00',
    horarioFin: '12:00',
    aula: 'Pabellón 1 · Aula 302',
    modalidad: 'Presencial / Escrito',
    impactoAcademico: '40% de la nota final',
    esCritico: true,
    hitos: [
      { id: 'h-1', texto: 'Resumen de paper Raft (Ongaro & Ousterhout)', completado: true, fecha: '19 Abr' },
      { id: 'h-2', texto: 'Simulación de algoritmos de elección de líder', completado: false }
    ]
  },
  {
    id: 'evt-2',
    titulo: 'TP Entrega BD II: Motor Índices',
    materiaId: 'mat-2',
    materiaCodigo: 'DAT-301',
    materiaNombre: 'Bases de Datos II',
    tipo: 'ENTREGA',
    fecha: '2025-04-29',
    horarioInicio: '23:59',
    horarioFin: '23:59',
    aula: 'Campus Virtual',
    modalidad: 'Virtual',
    impactoAcademico: '25% de la nota final'
  },
  {
    id: 'evt-3',
    titulo: 'Sesión Estudio Raft & RPC',
    materiaId: 'mat-1',
    materiaCodigo: 'SIS-304',
    tipo: 'ESTUDIO',
    fecha: '2025-04-21',
    horarioInicio: '18:00',
    horarioFin: '20:00',
    aula: 'Biblioteca / Discord'
  },
  {
    id: 'evt-4',
    titulo: 'Lab: SQL Tuning & EXPLAIN',
    materiaId: 'mat-2',
    materiaCodigo: 'DAT-301',
    tipo: 'LABORATORIO',
    fecha: '2025-04-18',
    horarioInicio: '14:00',
    horarioFin: '16:30',
    aula: 'Laboratorio Turing'
  }
];

export const mockMateriales: MaterialEstudio[] = [
  {
    id: 'mat-res-1',
    materiaId: 'mat-1',
    titulo: 'Paper Raft: In Search of an Understandable Consensus Algorithm',
    categoria: 'BIBLIOGRAFIA',
    archivoNombre: 'ongaro-raft-paper-2014.pdf',
    archivoUrl: '/docs/stitch/sample.pdf',
    tamanioBytes: 1840000,
    cantPaginas: 18,
    fechaSubida: '10 Abr 2025'
  },
  {
    id: 'mat-res-2',
    materiaId: 'mat-1',
    titulo: 'Guía Práctica 3: Replicación y Heartbeats',
    categoria: 'GUIA_PRACTICA',
    archivoNombre: 'guia_3_distribuidos.pdf',
    archivoUrl: '/docs/stitch/sample.pdf',
    tamanioBytes: 480000,
    cantPaginas: 8,
    fechaSubida: '15 Abr 2025'
  },
  {
    id: 'mat-res-3',
    materiaId: 'mat-1',
    titulo: '1er Parcial Resuelto - Ciclo 2024',
    categoria: 'EXAMEN_ANTERIOR',
    archivoNombre: 'parcial1_2024_resuelto.pdf',
    archivoUrl: '/docs/stitch/sample.pdf',
    tamanioBytes: 950000,
    cantPaginas: 6,
    fechaSubida: '18 Abr 2025'
  }
];
