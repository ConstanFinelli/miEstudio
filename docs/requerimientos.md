# Documento de Requerimientos (V2.0)

## Proyecto: Plataforma de Gestión de Estudio y Seguimiento Académico (miEstudio)

### 1. Visión General

El objetivo del sistema es proveer a estudiantes universitarios una herramienta integral y centralizada para organizar su carga académica, estructurar y recorrer la malla curricular de su carrera, controlar correlatividades, registrar calificaciones y promedios históricos, gestionar horarios semanales, consultar material bibliográfico en PDF y tomar apuntes interactivos potenciados por Inteligencia Artificial (Google Gemini).

---

### 2. Requerimientos Funcionales (RF)

#### 2.1 Gestión de Materias y Malla Curricular

- **RF1.1:** El usuario podrá registrar nuevas materias indicando nombre, código oficial, año cursado, cuatrimestre (1C, 2C, Anual) y estado (*Cursando*, *Regular*, *Aprobada*, *Promocionada*, *Libre*, *Pendiente*).
- **RF1.2:** El usuario podrá editar, archivar o eliminar materias.
- **RF1.3:** El sistema deberá calcular el promedio general y el progreso de la carrera en base a las materias aprobadas sobre el total de materias del plan.
- **RF1.4:** El usuario podrá definir y consultar las Reglas de Acreditación (condición de promoción directa y condición de regularidad) mediante condiciones descriptivas en formato de texto (string), adaptándose a las exigencias particulares de cada cátedra (ej. asistencias mínimas, notas de parciales, laboratorios aprobados).
- **RF1.5 (Malla Curricular y Correlatividades):** Visualización interactiva de la malla curricular organizada por años y cuatrimestres, con trazabilidad de correlatividades tanto para cursar como para rendir exámenes finales.
- **RF1.6 (Importación Inteligente de Plan con IA):** Capacidad de cargar el PDF oficial del plan de estudio o pegar su contenido en texto para que la IA (Gemini) extraiga automáticamente todas las materias, códigos, años, cuatrimestres y dependencias de correlativas. Incluye modal interactivo de previsualización y confirmación mediante *Smart Upsert* (actualización o inserción sin duplicación ni pérdida de datos).

#### 2.2 Gestión de Instancias de Evaluación (Exámenes, TPs, etc.)

- **RF2.1:** El usuario podrá crear "Instancias de Evaluación" asociadas a una materia específica.
- **RF2.2:** Cada instancia deberá especificar su tipo: Parcial, Recuperatorio, Final, Trabajo Práctico (TP), Laboratorio o Quiz/Entrega.
- **RF2.3:** Registro flexible de fechas: se podrá registrar la fecha y horario de la evaluación, o registrarla como "sin fecha fijada" (fechas a definir o evaluaciones históricas).
- **RF2.4:** Registro de calificaciones obtenidas, condición aprobatoria y ponderación porcentual del examen, con cálculo automático del promedio ponderado de la materia en tiempo real.
- **RF2.5 (Preselección Contextual):** Al abrir el modal de creación de evaluación desde la ficha de una materia, el sistema debe preseleccionar automáticamente dicha materia y restablecer los filtros para su visualización y asignación directa.

#### 2.3 Sistema de Calendario, Dashboard y Fechas

- **RF3.1:** El sistema mostrará un calendario interactivo mensual consolidado con todas las fechas de las Instancias de Evaluación y eventos de estudio.
- **RF3.2:** Se podrán agregar recordatorios o "Eventos de Estudio" en el calendario asociados a una evaluación o materia.
- **RF3.3:** El Dashboard principal deberá listar las próximas entregas y exámenes con cuenta regresiva en días.
- **RF3.4 (Filtro por Carrera):** Tanto en el Dashboard como en el Calendario, el usuario podrá alternar entre ver las fechas de todas sus carreras universitarias (visión consolidada) o exclusivamente las correspondientes a la carrera activa.
- **RF3.5 (Navegación Inter-Carrera):** Al seleccionar "Ver materia" en una evaluación del Dashboard que pertenece a una carrera distinta a la activa, el sistema cambiará automáticamente la carrera activa y navegará a la asignatura correspondiente sin requerir pasos manuales adicionales.

#### 2.4 Toma de Notas y Apuntes

- **RF4.1:** El usuario podrá crear apuntes (Markdown enriquecido) vinculados a una materia específica e instancias evaluativas.
- **RF4.2:** Los apuntes soportan bloques de código con syntax highlighting, tablas, checklists y fórmulas matemáticas completas en LaTeX/KaTeX (`$...$` y `$$...$$`).
- **RF4.3:** Búsqueda global de texto dentro del título y contenido de todos los apuntes.
- **RF4.4 (Organización Jerárquica):** Visualización de notas en árbol lateral de carpetas agrupadas por año lectivo y materias de la carrera.
- **RF4.5 (Exportación Multi-Formato):**
  - Exportación de notas individuales como archivo Markdown estándar (`.md`) con frontmatter YAML.
  - Exportación de toda la materia en archivo comprimido (`.zip`) con estructura de carpetas.
  - Exportación directa a PDF con diseño académico profesional, paginación limpia sin parpadeos y fórmulas matemáticas renderizadas.

#### 2.5 Gestión de Material de Estudio y Visor de PDFs

- **RF5.1:** El usuario podrá subir y organizar material en PDF vinculado a cada materia.
- **RF5.2:** Cada material contará con metadatos: título, categoría (Teoría, Práctica, Final/Parcial resuelto, Bibliografía oficial), fecha de carga, tamaño y conteo de páginas.
- **RF5.3:** Conteo automático de páginas en el servidor utilizando `pdfcpu` al subir o procesar materiales.
- **RF5.4:** Visor de PDFs integrado en modo estudio (*Split-View*): apertura en panel lateral simultáneo con el editor de notas, con streaming inline HTTP Range y autenticación por token.
- **RF5.5:** Edición de metadatos: capacidad de modificar título y recategorizar archivos ya subidos.
- **RF5.6 (Depuración de PDFs al Aprobar):** Al marcar una materia como *Aprobada* o *Promocionada*, el sistema consulta opcionalmente si se desean eliminar los PDFs pesados del servidor para liberar espacio, conservando en todo momento los apuntes de texto.

#### 2.6 Gestión Multi-Carrera y Perfil de Usuario

- **RF6.1 (Soporte Multi-Carrera):** El usuario puede registrar múltiples carreras universitarias indicando nombre, facultad/sede, legajo, plan de estudio y total de materias estimadas, alternando la carrera activa desde la barra lateral o cabecera.
- **RF6.2 (Configuración y Eliminación Segura):** Capacidad de editar los datos de cualquier carrera o eliminarla de forma definitiva mediante modal con confirmación en doble paso, reasignando automáticamente la carrera activa si la eliminada estaba seleccionada.
- **RF6.3:** Edición de perfil de usuario: actualización de nombre, correo electrónico y contraseña desde el modal de ajustes del usuario.
- **RF6.4 (Gestión de API Key Personal de Gemini):** Cada estudiante puede ingresar su propia clave de Google Gemini API en su perfil con validación de conectividad en tiempo real y fallback automático a la clave del entorno del servidor.

#### 2.7 Copiloto de Inteligencia Artificial Académico (Gemini AI)

- **RF7.1 (Fundamentación en Materiales Oficiales):** El copiloto basa sus explicaciones, resúmenes y preguntas estrictamente en el material bibliográfico de cátedra seleccionado en PDF.
- **RF7.2 (Chat Conversacional Streaming):** Streaming en tiempo real vía Server-Sent Events (SSE), tarjeta animada de pensamiento (*thinking card* con shimmer) y cursor continuo.
- **RF7.3 (Inserción Directa):** Transferencia en un solo clic de las explicaciones generadas por la IA hacia el apunte activo o creación automática de una nueva nota.
- **RF7.4 (Active Recall y Autoevaluación):** Generación de resúmenes ejecutivos estructurados con fórmulas y consejos de examen, barajas automáticas de Flashcards por dificultad y Quizzes interactivos de opción múltiple con retroalimentación explicativa.

#### 2.8 Horarios de Cursada y Analíticas de Rendimiento

- **RF8.1 (Grilla Semanal de Horarios):** Panel interactivo semanal con días, franjas horarias, aulas y modalidades.
- **RF8.2 (Personalización de Color RGB):** Selector de colores de paleta predefinida y selector cromático RGB libre para asignar a cada materia y reflejar en los bloques horarios.
- **RF8.3 (Analíticas y Progreso Académico):** KPIs consolidados, porcentaje de completitud del plan de estudios, curva histórica de promedio anual de materias aprobadas y distribución de calificaciones por modalidad (promoción, final, equivalencia).

---

### 3. Requerimientos No Funcionales (RNF)

- **RNF1 (Arquitectura Backend):** Desarrollado en Go (Golang) 1.24+ utilizando arquitectura de Vertical Slicing para mantener alta cohesión y bajo acoplamiento por funcionalidad.
- **RNF2 (Arquitectura Frontend):** Desarrollado en React 19 + TypeScript y Vite, con arquitectura modular orientada a Features (`features/*`).
- **RNF3 (Persistencia y Almacenamiento):** Base de datos relacional MySQL 8.0 / PostgreSQL con integridad referencial y serialización JSON. Almacenamiento desacoplado mediante interfaz `storage.StorageService` (disco local o almacenamiento en la nube S3/R2).
- **RNF4 (Diseño y Experiencia de Usuario):** Modo oscuro nativo, variables de diseño en CSS puro modular (`index.css` + CSS Modules) sin dependencias invasivas de utilidades atómicas.
- **RNF5 (Rendimiento de Streaming PDF):** Soporte de peticiones parciales HTTP Range para visualizar libros extensos de forma instantánea sin saturar la memoria del servidor.
- **RNF6 (Contenedores e Integración Continua):** Empaquetado completo en contenedores Docker y orquestación con Docker Compose. Pipeline de CI/CD automatizado con GitHub Actions y despliegue continuo en Dokploy.
