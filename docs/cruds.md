# Especificación de CRUDs y Modelo de Datos

A continuación, se detalla la estructura relacional y las operaciones para los módulos principales del sistema.

## 1. Materias (Subjects)
Es la entidad raíz. Todo lo demás orbita alrededor de una materia.

**Modelo de Datos:**
* `id` (UUID, PK)
* `nombre` (String, ej: "Sistemas de Información")
* `anio` (Int, ej: 2026)
* `cuatrimestre` (Enum: PRIMERO, SEGUNDO, ANUAL)
* `estado` (Enum: CURSANDO, REGULAR, APROBADA, PROMOCIONADA)
* `color` (String - Hex para el frontend)
* `created_at`, `updated_at`

**Endpoints (Go):**
* `POST /api/materias` - Crea una nueva materia.
* `GET /api/materias` - Lista todas, con soporte para filtrado (por estado, por año).
* `GET /api/materias/:id` - Detalle de la materia (incluye evaluaciones y conteo de apuntes).
* `PUT /api/materias/:id` - Actualiza datos básicos o estado.
* `DELETE /api/materias/:id` - Elimina materia (Soft delete recomendado para no perder historial).

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

