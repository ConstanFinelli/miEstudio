# Especificación de CRUDs y Modelo de Datos (V2.0)

A continuación, se detalla la estructura relacional, modelos de datos y endpoints de los módulos que componen el sistema **miEstudio**.

---

## 1. Materias (Subjects)
Entidad fundamental del seguimiento académico y de la malla curricular.

**Modelo de Datos:**
* `id` (UUID/String 36, PK)
* `usuario_id` (UUID/String 36, FK -> Users, Index)
* `carrera_id` (UUID/String 36, FK -> Carreras, Index)
* `codigo` (String 50, ej: "ASI-204")
* `nombre` (String 255, ej: "Sistemas Operativos")
* `anio` (Int, ej: 2)
* `cuatrimestre` (String 20: "1C", "2C", "Anual")
* `estado` (Enum: "CURSANDO", "REGULAR", "APROBADA", "PROMOCIONADA", "LIBRE", "PENDIENTE")
* `color` (String 30: Hex o RGB para frontend, ej: "#3b82f6")
* `comision` (String 50, ej: "2K1")
* `modalidad` (Enum: "Presencial", "Virtual", "Híbrida")
* `promedio` (Float)
* `profesor_titular` (String 255)
* `profesor_jtp` (String 255)
* `reglas_acreditacion` (JSON String / Struct)
  * `promocion`: `{ permite_promocion: bool, condicion: string, min_promedio: float, min_parcial: float, permite_recuperatorio: bool, min_asistencia: int, descripcion: string }`
  * `regularidad`: `{ condicion: string, min_nota: float, min_asistencia: int, permite_recuperatorio: bool, descripcion: string }`
* `correlativas_cursar` (JSON Array de Strings / IDs de materias correlativas para cursar)
* `correlativas_rendir` (JSON Array de Strings / IDs de materias correlativas para rendir examen final)
* `created_at`, `updated_at`

**Endpoints (Go / Fiber):**
* `POST /api/materias` - Crea una nueva materia en la carrera activa.
* `GET /api/materias` - Lista todas las materias (admite query params: `carrera_id`, `estado`, `anio`).
* `GET /api/materias/:id` - Detalle completo de una materia (incluye evaluaciones, horarios y materiales).
* `PUT /api/materias/:id` - Actualiza datos básicos, estado, color o notas de la materia.
* `DELETE /api/materias/:id` - Elimina la materia y sus dependencias.
* `POST /api/materias/batch-import` - Importación masiva con *Smart Upsert*: actualiza materias existentes o inserta nuevas asignaturas y correlatividades (usado por el importador de plan de estudio con IA).

---

## 2. Instancias de Evaluación (Evaluations)
Gestión y seguimiento de exámenes, parciales y entregas prácticas.

**Modelo de Datos:**
* `id` (UUID/String 36, PK)
* `materia_id` (UUID/String 36, FK -> Materias, Index)
* `titulo` (String 255, ej: "Primer Parcial Teórico")
* `tipo` (Enum: "PARCIAL", "FINAL", "RECUPERATORIO", "TP", "LABORATORIO", "QUIZ")
* `fecha` (Timestamp/Date, Nullable: permite registrar evaluaciones sin fecha fija o pasadas)
* `horario` (String 50, ej: "19:00 hs")
* `aula` (String 100, ej: "Aula 304")
* `modalidad` (Enum: "Presencial", "Virtual")
* `peso` (Float, ponderación porcentual del examen, ej: 100 o 50)
* `es_aprobatorio` (Boolean)
* `nota` (Float, Nullable)
* `temario` (JSON Array de Strings)
* `created_at`, `updated_at`

**Endpoints (Go / Fiber):**
* `POST /api/evaluaciones` - Registra una nueva instancia evaluativa vinculada a una materia.
* `GET /api/evaluaciones?materia_id=...` - Lista las evaluaciones de una materia específica.
* `GET /api/evaluaciones/proximas` - Lista todas las evaluaciones con fecha pendiente para el Dashboard y Calendario.
* `PUT /api/evaluaciones/:id` - Actualiza la información completa de la evaluación.
* `PATCH /api/evaluaciones/:id/nota` - Carga o modificación rápida de la calificación obtenida.
* `DELETE /api/evaluaciones/:id` - Elimina la instancia de evaluación.

---

## 3. Apuntes / Notas (Notes)
Editor Markdown enriquecido con soporte para fórmulas KaTeX y exportación multi-formato.

**Modelo de Datos:**
* `id` (UUID/String 36, PK)
* `usuario_id` (UUID/String 36, FK -> Users, Index)
* `materia_id` (UUID/String 36, FK -> Materias, Index)
* `evaluacion_id` (UUID/String 36, Nullable, vinculación opcional a una evaluación)
* `titulo` (String 255, ej: "Unidad 2: Concurrencia y Semáforos")
* `contenido` (Text, Markdown con soporte LaTeX `$...$` y `$$...$$`)
* `etiquetas` (JSON Array de Strings, ej: ["teoría", "resumen"])
* `carpeta` (String 100, para estructura jerárquica)
* `created_at`, `updated_at`

**Endpoints (Go / Fiber):**
* `POST /api/apuntes` - Crea un nuevo apunte.
* `GET /api/apuntes?materia_id=...` - Lista metadatos y títulos de los apuntes de una materia.
* `GET /api/apuntes/:id` - Obtiene el apunte completo con su contenido para edición y lectura.
* `PUT /api/apuntes/:id` - Guarda y sincroniza cambios de contenido.
* `DELETE /api/apuntes/:id` - Elimina el apunte.

---

## 4. Materiales de Estudio y Archivos (Materials & PDFs)
Gestión bibliográfica con streaming parcial y extracción de metadatos.

**Modelo de Datos:**
* `id` (UUID/String 36, PK)
* `materia_id` (UUID/String 36, FK -> Materias, Index)
* `titulo` (String 255, ej: "Sistemas Operativos Modernos - Tanenbaum")
* `categoria` (Enum: "TEORIA", "GUIA_PRACTICA", "EXAMEN_ANTERIOR", "BIBLIOGRAFIA", "OTRO")
* `archivo_nombre_original` (String 255)
* `archivo_path` (String 500, ruta física en disco o clave de bucket)
* `mime_type` (String 100, ej: "application/pdf")
* `tamanio_bytes` (BigInt)
* `cant_paginas` (Int, Nullable: calculado automáticamente en el backend vía `pdfcpu`)
* `created_at`, `updated_at`

**Endpoints (Go / Fiber):**
* `POST /api/materias/:materia_id/materiales` - Carga multipart (`multipart/form-data`) de archivos PDF.
* `GET /api/materias/:materia_id/materiales` - Lista materiales bibliográficos de la asignatura.
* `GET /api/materiales/:id` - Consulta de metadatos de un material.
* `GET /api/materiales/:id/archivo` - Streaming optimizado inline con soporte de `Accept-Ranges: bytes` y autenticación vía header o query token (`?token=...`).
* `PUT /api/materiales/:id` - Actualización de metadatos (título y categoría).
* `DELETE /api/materiales/:id` - Elimina el registro y el archivo físico del almacenamiento.
* `DELETE /api/materias/:materia_id/materiales` - Depuración por materia: elimina todos los archivos PDF al aprobar o promocionar la materia.

---

## 5. Carreras Universitarias y Acreditaciones (Careers & Approvals)
Soporte multi-carrera, configuración de planes y registro de aprobaciones históricas.

**Modelo de Datos (Carreras):**
* `id` (UUID/String 36, PK)
* `usuario_id` (UUID/String 36, FK -> Users, Index)
* `nombre` (String 255, ej: "Licenciatura en Ciencias de la Computación")
* `facultad_sede` (String 255, ej: "FCEN - UBA")
* `legajo` (String 50, ej: "98765/4")
* `semestre_actual` (String 50, ej: "3° Año - 1C")
* `ciclo_activo` (String 50, ej: "1C 2026")
* `duracion_anios` (Int, ej: 5)
* `total_materias_plan` (Int, total de materias estimadas de la carrera para cálculo de avance)
* `is_activa` (Boolean, indica cuál es la carrera seleccionada por el usuario)
* `promedio_general` (Float)
* `materias_aprobadas` (Int)
* `fecha_ingreso` (Timestamp/Date, Nullable)
* `created_at`, `updated_at`

**Modelo de Datos (Aprobaciones Históricas):**
* `id` (UUID/String 36, PK)
* `usuario_id` (UUID/String 36, FK -> Users, Index)
* `carrera_id` (UUID/String 36, FK -> Carreras, Index)
* `materia_id` (UUID/String 36, FK -> Materias)
* `nota_final` (Float, ej: 9.0)
* `fecha_aprobacion` (Date)
* `tipo_aprobacion` (Enum: "FINAL", "PROMOCION", "EQUIVALENCIA")
* `libro_acta`, `folio_acta` (Strings)
* `observaciones` (Text)
* `created_at`, `updated_at`

**Endpoints (Go / Fiber):**
* `GET /api/carreras` - Lista de carreras pertenecientes al usuario autenticado.
* `POST /api/carreras` - Registra una nueva carrera para el estudiante.
* `GET /api/carreras/activa` - Obtiene la carrera activa en la sesión.
* `GET /api/carreras/:id` - Detalle de una carrera específica.
* `PATCH /api/carreras/:id` - Actualiza la configuración de la carrera (`nombre`, `facultad_sede`, `legajo`, `total_materias_plan`, etc.).
* `POST /api/carreras/:id/activar` - Establece la carrera seleccionada como activa.
* `DELETE /api/carreras/:id` - Elimina la carrera y reasigna automáticamente la carrera activa.
* `POST /api/carreras/aprobaciones/crear` - Registra una acreditación formal de materia.
* `GET /api/carreras/:id/aprobaciones` - Lista las acreditaciones históricas para analíticas.
* `DELETE /api/carreras/aprobaciones/:id` - Elimina una acreditación histórica.

---

## 6. Autenticación y Perfil de Usuario (Auth & User Profile)
Gestión de credenciales, seguridad y API Key personal de Gemini.

**Modelo de Datos:**
* `id` (UUID/String 36, PK)
* `email` (String 255, Unique)
* `password_hash` (String)
* `nombre` (String 255)
* `gemini_api_key` (String 255, clave opcional provista por el usuario para su propio uso de IA)
* `created_at`, `updated_at`

**Endpoints (Go / Fiber):**
* `POST /api/auth/register` - Registro de usuario e inicialización de su primera carrera académica.
* `POST /api/auth/login` - Autenticación y emisión de token JWT.
* `GET /api/auth/me` - Perfil autenticado, carrera activa e indicador `has_gemini_key: bool`.
* `PUT /api/auth/me` - Actualización de perfil (`nombre`, `email`, `password` y `gemini_api_key`).
* `GET /api/perfil` - Perfil académico con métricas agregadas (percentil, puesto de cohorte, créditos).
* `PUT /api/perfil` - Actualización de métricas de perfil académico.

---

## 7. Horarios de Cursada (Schedules)
Grilla semanal interactiva de cursado por materia.

**Modelo de Datos:**
* `id` (UUID/String 36, PK)
* `materia_id` (UUID/String 36, FK -> Materias)
* `dia_semana` (Enum: "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO")
* `hora_inicio` (String, ej: "08:00")
* `hora_fin` (String, ej: "12:00")
* `aula` (String 100, ej: "Aula 212 / Lab Virtual")
* `modalidad` (Enum: "Presencial", "Virtual", "Híbrida")

**Endpoints (Go / Fiber):**
* `GET /api/horarios` - Grilla horaria completa de la carrera activa.
* `POST /api/materias/:id/horarios` - Agrega un bloque horario a una materia.
* `DELETE /api/horarios/:id` - Elimina una franja horaria.

---

## 8. Copiloto de Inteligencia Artificial (Google Gemini)
Endpoints para asistencia pedagógica, Active Recall y análisis de planes de estudio.

**Endpoints (Go / Fiber):**
* `POST /api/ai/chat` - Consulta al copiloto fundamentada en el contexto de un material PDF.
* `POST /api/ai/chat/stream` - Chat conversacional en tiempo real con streaming Server-Sent Events (SSE).
* `POST /api/ai/resumir` - Generación de resúmenes estructurados JSON (conceptos clave, fórmulas KaTeX y tips).
* `POST /api/ai/flashcards` - Generador automático de tarjetas de memoria por nivel de dificultad.
* `POST /api/ai/quiz` - Cuestionario de opción múltiple con respuestas y retroalimentación pedagógica.
* `POST /api/ai/explicar-seleccion` - Explicación paso a paso de fragmentos de texto seleccionados.
* `POST /api/ai/validate-key` - Validación de conectividad y validez de la API Key de Gemini.
* `POST /api/ai/parse-study-plan` - Extracción con IA de planes de estudio a partir de PDFs o texto, estructurando asignaturas, regímenes y correlatividades para la malla curricular.
