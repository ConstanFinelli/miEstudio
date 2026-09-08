# Especificación de CRUDs y Modelo de Datos

A continuación, se detalla la estructura relacional y las operaciones para los módulos principales del sistema.

## 1. Materias (Subjects)
Es la entidad raíz. Todo lo demás orbita alrededor de una materia.

**Modelo de Datos:**
* `id` (UUID, PK)
* `carrera_id` (UUID, FK -> Carreras)
* `nombre` (String, ej: "Sistemas de Información")
* `codigo` (String, ej: "ASI-204")
* `anio` (Int, ej: 3)
* `cuatrimestre` (Enum: 1C, 2C, Anual)
* `estado` (Enum: CURSANDO, REGULAR, APROBADA, PROMOCIONADA, LIBRE)
* `color` (String - Hex para el frontend, ej: "#3b82f6")
* `comision` (String, ej: "3K1")
* `modalidad` (Enum: Presencial, Virtual, Híbrida)
* `profesor_titular` (String)
* `profesor_jtp` (String)
* `promedio` (Float, Nullable)
* `reglas_acreditacion` (JSONB)
  * `promocion`: `{ permite_promocion: bool, condicion: string, min_asistencia: int, descripcion: string }` (donde `condicion` es un string libre para reflejar los requisitos particulares de la cátedra)
  * `regularidad`: `{ condicion: string, min_asistencia: int, descripcion: string }`
* `created_at`, `updated_at`

**Endpoints (Go):**
* `POST /api/materias` - Crea una nueva materia.
* `GET /api/materias` - Lista todas las materias de la carrera activa.
* `GET /api/materias/:id` - Detalle de la materia (incluye evaluaciones, horarios y materiales).
* `PUT /api/materias/:id` - Actualiza datos básicos, estado o notas finales.
* `PUT /api/materias/:id/reglas` - Actualiza las reglas de acreditación de la materia.
* `DELETE /api/materias/:id` - Elimina materia.

---

## 2. Instancias de Evaluación (Evaluations)
Evolución del concepto de "Exámenes". Permite trackear parciales, recuperatorios, laboratorios y TPs.

**Modelo de Datos:**
* `id` (UUID, PK)
* `materia_id` (UUID, FK -> Materias)
* `titulo` (String, ej: "Primer Parcial", "TP de Laboratorio 1 - AnyLogic")
* `tipo` (Enum: PARCIAL, RECUPERATORIO, FINAL, TP, LABORATORIO)
* `fecha` (Timestamp)
* `nota` (Float, Nullable)
* `es_aprobatorio` (Boolean) - Si es obligatorio aprobarlo para regularizar.
* `created_at`, `updated_at`

**Endpoints (Go):**
* `POST /api/evaluaciones` - (Requiere `materia_id` en el body).
* `GET /api/evaluaciones?materia_id=XXX` - Trae todas las instancias de una materia.
* `GET /api/evaluaciones/proximas` - Trae todas las evaluaciones pendientes de todas las materias (Para el calendario).
* `PATCH /api/evaluaciones/:id/nota` - Endpoint rápido solo para cargar la calificación una vez rendido.

---

## 3. Apuntes / Notas (Notes)
CRUD de documentos relacionales.

**Modelo de Datos:**
* `id` (UUID, PK)
* `materia_id` (UUID, FK -> Materias)
* `titulo` (String, ej: "Clase 4: Algoritmos Genéticos")
* `contenido` (Text/JSON - dependiendo si usas Markdown raw o un editor como BlockNote/TipTap)
* `etiquetas` (Array de Strings, ej: ["teoría", "resumen"])
* `created_at`, `updated_at`

**Endpoints (Go):**
* `POST /api/apuntes` - Crea un nuevo documento vacío o con contenido inicial.
* `GET /api/apuntes?materia_id=XXX` - Lista de apuntes de una materia (solo trae metadatos y título, no el contenido pesado).
* `GET /api/apuntes/:id` - Trae el apunte completo para edición.
* `PUT /api/apuntes/:id` - Actualiza el contenido (Auto-save desde el frontend).

---

## 4. Eventos de Calendario (Calendar Events)
**Nota de diseño:** Las "Instancias de Evaluación" ya tienen fecha y se muestran en el calendario. Este CRUD es para eventos *adicionales* (clases de consulta, grupos de estudio, entrega de papeleo).

**Modelo de Datos:**
* `id` (UUID, PK)
* `materia_id` (UUID, FK -> Materias, Nullable por si es un evento general)
* `titulo` (String)
* `fecha_inicio` (Timestamp)
* `fecha_fin` (Timestamp)
* `tipo` (Enum: ESTUDIO, CONSULTA, OTRO)

---

## 5. Materiales de Estudio / Documentos (Materials & PDFs)
CRUD para la gestión de archivos bibliográficos y recursos asociados a cada materia.

**Modelo de Datos:**
* `id` (UUID, PK)
* `materia_id` (UUID, FK -> Materias)
* `titulo` (String, ej: "Guía 2 - Espacios Vectoriales", "Libro Stallings 9na Edición")
* `categoria` (Enum: TEORIA, GUIA_PRACTICA, EXAMEN_ANTERIOR, BIBLIOGRAFIA, OTRO)
* `archivo_nombre_original` (String, ej: "guia2_algebra.pdf")
* `archivo_path` / `archivo_key` (String, ruta interna o key S3)
* `mime_type` (String, ej: "application/pdf")
* `tamanio_bytes` (BigInt, ej: 14285900)
* `cant_paginas` (Int, Nullable - metadato extraído opcionalmente al procesar el PDF)
* `created_at`, `updated_at`

**Endpoints (Go):**
* `POST /api/materias/:materia_id/materiales` - Carga de archivo multipart (`multipart/form-data`) con metadatos asociados.
* `GET /api/materias/:materia_id/materiales` - Lista de materiales de la materia, con filtro opcional por `categoria`.
* `GET /api/materiales/:id` - Metadatos de un material específico.
* `GET /api/materiales/:id/archivo` - Descarga o visualización directa del binario. Soporta headers de `Content-Disposition: inline` y `Accept-Ranges: bytes` para permitir navegación por páginas en el visor web sin transferir el archivo completo de golpe.
* `PUT /api/materiales/:id` - Actualización de metadatos (título, categoría).
* `DELETE /api/materiales/:id` - Elimina el registro en la base de datos y borra el archivo físico correspondiente del storage.

---

## 6. Usuarios y Perfil (Auth & User Profile)
Gestión de identidad, sesiones y datos personales del estudiante.

**Modelo de Datos:**
* `id` (UUID, PK)
* `email` (String, Unique)
* `password_hash` (String)
* `nombre` (String, ej: "Estudiante")
* `created_at`, `updated_at`

**Endpoints (Go):**
* `POST /api/auth/register` - Registro de usuario e inicialización de su primera carrera.
* `POST /api/auth/login` - Autenticación con email/password y retorno de token JWT.
* `GET /api/auth/me` - Perfil del usuario autenticado y su carrera activa seleccionada.
* `PUT /api/auth/me` - Actualización de datos del usuario (`nombre`, `email`, `password` opcional).

---

## 7. Carreras Universitarias (Careers)
Soporte multi-carrera para estudiantes cursando o graduados de múltiples planes de estudio.

**Modelo de Datos:**
* `id` (UUID, PK)
* `usuario_id` (UUID, FK -> Users)
* `nombre` (String, ej: "Ingeniería en Informática")
* `facultad_sede` (String, ej: "Facultad de Ingeniería")
* `legajo` (String, ej: "INFO-2026")
* `plan_estudio` (String, ej: "Plan 2023")
* `promedio_general` (Float)
* `is_activa` (Boolean) - Identifica qué carrera está activa en la sesión.
* `created_at`, `updated_at`

**Endpoints (Go):**
* `GET /api/carreras` - Lista de carreras pertenecientes al usuario autenticado.
* `POST /api/carreras` - Registra una nueva carrera para el estudiante.
* `POST /api/carreras/:id/seleccionar` - Establece la carrera como activa para la sesión.

---

## 8. Horarios de Cursada (Schedules)
Organización semanal de cursado por materia.

**Modelo de Datos:**
* `id` (UUID, PK)
* `materia_id` (UUID, FK -> Materias)
* `dia_semana` (Enum: LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO)
* `hora_inicio` (String, ej: "08:00")
* `hora_fin` (String, ej: "12:00")
* `aula` (String, ej: "Aula Magna / Lab 3")
* `modalidad` (Enum: Presencial, Virtual, Híbrida)

**Endpoints (Go):**
* `GET /api/horarios` - Trae la grilla semanal completa de horarios de la carrera activa.
* `POST /api/materias/:id/horarios` - Añade una franja horaria de cursado a una materia.
* `DELETE /api/horarios/:id` - Elimina una franja horaria.

