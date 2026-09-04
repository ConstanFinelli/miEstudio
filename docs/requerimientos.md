# Documento de Requerimientos (V1.0)

## Proyecto: Plataforma de Gestión de Estudio y Seguimiento Académico

### 1. Visión General

El objetivo del sistema es proveer a estudiantes universitarios una herramienta centralizada para organizar su carga académica, realizar un seguimiento de sus notas y progreso, y mantener un repositorio estructurado de sus apuntes. Todo esto interconectado de manera lógica y fluida.

### 2. Requerimientos Funcionales (RF)

#### 2.1 Gestión de Materias

- **RF1.1:** El usuario podrá registrar nuevas materias indicando nombre, año cursado, cuatrimestre y estado (Cursando, Regular, Aprobada, Promocionada, Libre).
- **RF1.2:** El usuario podrá editar, archivar o eliminar materias.
- **RF1.3:** El sistema deberá calcular el promedio general y el progreso de la carrera en base a las materias aprobadas.

#### 2.2 Gestión de Instancias de Evaluación (Exámenes, TPs, etc.)

- **RF2.1:** El usuario podrá crear "Instancias de Evaluación" asociadas a una materia.
- **RF2.2:** Cada instancia deberá especificar su tipo: Parcial, Final, Trabajo Práctico (TP), Laboratorio, o Entregable.
- **RF2.3:** Se podrá registrar la fecha de la evaluación y la nota obtenida (o pendiente).
- **RF2.4:** El sistema calculará el estado de la materia (ej. si alcanza para promoción o regularidad) basado en un conjunto de reglas o pesos personalizables de las instancias de evaluación.

#### 2.3 Sistema de Calendario y Fechas

- **RF3.1:** El sistema mostrará un calendario integrado con todas las fechas de las Instancias de Evaluación.
- **RF3.2:** Se podrán agregar recordatorios o "Eventos de Estudio" en el calendario, asociados a una evaluación específica.
- **RF3.3:** La vista principal (Dashboard) deberá listar las próximas entregas y exámenes en los siguientes 7 y 30 días.

#### 2.4 Toma de Notas y Apuntes

- **RF4.1:** El usuario podrá crear apuntes (texto enriquecido / Markdown) vinculados a una materia específica.
- **RF4.2:** Los apuntes deben soportar inserción de código, tablas y fórmulas básicas.
- **RF4.3:** Búsqueda global de texto dentro del contenido de todos los apuntes.

#### 2.5 Gestión de Material de Estudio y Visor de PDFs

- **RF5.1:** El usuario podrá subir y organizar material en PDF (teóricos, guías prácticas, exámenes anteriores, bibliografía) vinculado a cada materia.
- **RF5.2:** Cada material contará con metadatos: título, categoría (Teoría, Práctica, Final/Parcial resuelto, Bibliografía oficial), fecha de carga y tamaño.
- **RF5.3:** Visor de PDFs integrado y optimizado en la plataforma web, con controles de zoom, rotación, miniaturas de página, salto directo a página y búsqueda de texto.
- **RF5.4:** Modo Estudio (Split-View): capacidad de abrir un PDF en un panel lateral y el editor de apuntes en el otro, permitiendo estudiar y resumir sin cambiar de pestaña o ventana.
- **RF5.5:** Descarga directa y eliminación segura (con borrado del almacenamiento físico) de archivos.

#### 2.6 Nuevas Funcionalidades Sugeridas (Roadmap / V1.1+)

- **RF6.1 (Árbol de Correlatividades y Plan de Carrera):** Grafo interactivo para visualizar dependencias entre materias (requisitos para cursar y para rendir final) y cálculo automático de materias habilitadas para el próximo ciclo lectivo.
- **RF6.2 (Tarjetas de Memoria / Spaced Repetition - Flashcards):** Generación manual o asistida de tarjetas de repaso rápido basadas en los apuntes, con algoritmo de repaso espaciado (estilo Anki/Leitner) previo a los exámenes.

### 3. Requerimientos No Funcionales (RNF)

- **RNF1 (Arquitectura Backend):** Desarrollado en Go (Golang) implementando arquitectura de Vertical Slicing para mantener alta cohesión y bajo acoplamiento por funcionalidad.
- **RNF2 (Arquitectura Frontend):** Desarrollado en React + TypeScript, priorizando una estructura modular y orientada a "Features".
- **RNF3 (Persistencia y Almacenamiento):** Uso de base de datos relacional (PostgreSQL) para integridad referencial. Almacenamiento de archivos desacoplado mediante interfaz (Local Filesystem en desarrollo / S3-compatible como Cloudflare R2 o MinIO en producción).
- **RNF4 (UX/UI):** Interfaz limpia, modo oscuro nativo.
- **RNF5 (Rendimiento de Streaming PDF):** El backend debe soportar peticiones parciales (HTTP Range requests) para visualizar PDFs pesados (libros de 500+ páginas) de forma instantánea sin descargar el archivo completo en memoria.
