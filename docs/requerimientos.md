# Documento de Requerimientos (V1.0)

## Proyecto: Plataforma de Gestión de Estudio y Seguimiento Académico

### 1. Visión General

El objetivo del sistema es proveer a estudiantes universitarios una herramienta centralizada para organizar su carga académica, realizar un seguimiento de sus notas y progreso, y mantener un repositorio estructurado de sus apuntes. Todo esto interconectado de manera lógica y fluida.

### 2. Requerimientos Funcionales (RF)

#### 2.1 Gestión de Materias

- **RF1.1:** El usuario podrá registrar nuevas materias indicando nombre, año cursado, cuatrimestre y estado (Cursando, Regular, Aprobada, Promocionada, Libre).
- **RF1.2:** El usuario podrá editar, archivar o eliminar materias.
- **RF1.3:** El sistema deberá calcular el promedio general y el progreso de la carrera en base a las materias aprobadas.
- **RF1.4:** El usuario podrá definir y consultar las Reglas de Acreditación (condición de promoción directa y condición de regularidad) mediante condiciones descriptivas en formato de texto (string), adaptándose a las exigencias particulares de cada cátedra (ej. asistencias, parciales mínimos, laboratorios aprobados).

#### 2.2 Gestión de Instancias de Evaluación (Exámenes, TPs, etc.)

- **RF2.1:** El usuario podrá crear "Instancias de Evaluación" asociadas a una materia.
- **RF2.2:** Cada instancia deberá especificar su tipo: Parcial, Final, Trabajo Práctico (TP), Laboratorio, o Entregable.
- **RF2.3:** Se podrá registrar la fecha de la evaluación y la nota obtenida (o pendiente).
- **RF2.4:** El sistema mostrará las ponderaciones y notas alcanzadas en relación con los criterios de acreditación de la materia.

#### 2.3 Sistema de Calendario y Fechas

- **RF3.1:** El sistema mostrará un calendario integrado con todas las fechas de las Instancias de Evaluación.
- **RF3.2:** Se podrán agregar recordatorios o "Eventos de Estudio" en el calendario, asociados a una evaluación específica.
- **RF3.3:** La vista principal (Dashboard) deberá listar las próximas entregas y exámenes en los siguientes 7 y 30 días.

#### 2.4 Toma de Notas y Apuntes

- **RF4.1:** El usuario podrá crear apuntes (texto enriquecido / Markdown) vinculados a una materia específica.
- **RF4.2:** Los apuntes deben soportar inserción de código, tablas y fórmulas matemáticas (KaTeX / LaTeX).
- **RF4.3:** Búsqueda global de texto dentro del contenido de todos los apuntes.
- **RF4.4 (Exportación y Respaldo):** El usuario podrá exportar cualquier nota individual como archivo Markdown estándar (`.md`) con metadatos en YAML frontmatter, así como descargar un archivo comprimido (`.zip`) con todas las notas de una materia organizadas.

#### 2.5 Gestión de Material de Estudio y Visor de PDFs

- **RF5.1:** El usuario podrá subir y organizar material en PDF (teóricos, guías prácticas, exámenes anteriores, bibliografía) vinculado a cada materia.
- **RF5.2:** Cada material contará con metadatos: título, categoría (Teoría, Práctica, Final/Parcial resuelto, Bibliografía oficial), fecha de carga y tamaño.
- **RF5.3:** Visor de PDFs integrado y optimizado en la plataforma web, con controles de zoom, rotación, miniaturas de página, salto directo a página y búsqueda de texto. Soporta autenticación por query token y streaming inline HTTP Range.
- **RF5.4:** Modo Estudio (Split-View): capacidad de abrir un PDF en un panel lateral y el editor de apuntes en el otro, permitiendo estudiar y resumir sin cambiar de pestaña o ventana.
- **RF5.5:** Descarga directa y eliminación segura (con borrado del almacenamiento físico) de archivos.
- **RF5.6 (Depuración de PDFs al Aprobar):** Al cambiar el estado de una materia a "Aprobada" o "Promocionada", si la materia posee archivos PDF subidos, el sistema desplegará un modal de confirmación inteligente que permite conservar los PDFs o eliminarlos del servidor para liberar espacio, garantizando en todo momento que los apuntes de texto nunca se eliminen.

#### 2.6 Gestión de Carreras y Perfil de Usuario

- **RF6.1:** Soporte multi-carrera: el usuario puede registrar múltiples carreras universitarias indicando nombre, facultad/sede y legajo, y alternar fácilmente la carrera activa desde la barra lateral.
- **RF6.2:** Edición de perfil de usuario: el usuario podrá actualizar su nombre, correo electrónico y contraseña de acceso desde el modal de ajustes del usuario accesible desde el dashboard.

#### 2.7 Copiloto de Inteligencia Artificial Académico (Gemini AI)

- **RF7.1 (Fundamentación en Materiales Oficiales):** El copiloto de IA interactúa basándose estrictamente en el material de cátedra seleccionado (documento PDF), extrayendo citas, conceptos y rigor pedagógico de la bibliografía oficial.
- **RF7.2 (Chat Conversacional Streaming):** Chat con streaming en tiempo real vía Server-Sent Events (SSE), estado animado de pensamiento (*thinking card* con efecto *shimmer*) y cursor de escritura continuo. Soporta inserción directa o creación de apunte a partir de respuestas del copiloto.
- **RF7.3 (Resúmenes y Active Recall):** Generación de síntesis estructuradas con fórmulas LaTeX y tips de examen, y barajas automáticas de tarjetas de memoria (*flashcards*) clasificadas por dificultad.
- **RF7.4 (Quiz Interactivo):** Creación de cuestionarios de opción múltiple con explicaciones pedagógicas de acierto o error para autoevaluación antes de parciales y finales.

#### 2.8 Analíticas y Progreso Académico

- **RF8.1:** Panel analítico de la carrera con KPIs consolidados (materias aprobadas, promedio histórico, créditos y porcentaje de avance).
- **RF8.2:** Curva interactiva de evolución del promedio anual calculada exclusivamente sobre materias aprobadas en cada ciclo lectivo.
- **RF8.3:** Gráficos de distribución de calificaciones obtenidas y desglose de modalidades de acreditación (Promoción vs. Examen Final vs. Equivalencia).

### 3. Requerimientos No Funcionales (RNF)

- **RNF1 (Arquitectura Backend):** Desarrollado en Go (Golang) implementando arquitectura de Vertical Slicing para mantener alta cohesión y bajo acoplamiento por funcionalidad.
- **RNF2 (Arquitectura Frontend):** Desarrollado en React + TypeScript, priorizando una estructura modular y orientada a "Features".
- **RNF3 (Persistencia y Almacenamiento):** Uso de base de datos relacional para integridad referencial. Almacenamiento de archivos desacoplado mediante interfaz (Local Filesystem en desarrollo / S3-compatible como Cloudflare R2 o MinIO en producción).
- **RNF4 (UX/UI):** Interfaz limpia, modo oscuro nativo, variables de diseño centralizadas en CSS puro (Vanilla CSS / CSS Modules).
- **RNF5 (Rendimiento de Streaming PDF):** El backend debe soportar peticiones parciales (HTTP Range requests) para visualizar PDFs pesados (libros de 500+ páginas) de forma instantánea sin descargar el archivo completo en memoria.
