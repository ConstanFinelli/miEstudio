# Arquitectura Frontend: React 19 + TypeScript (Feature-Driven)

En el frontend se implementa una arquitectura **Feature-Driven** (guiada por características o casos de uso), logrando alta cohesión y bajo acoplamiento. En lugar de organizar el código por capas técnicas abstractas, cada módulo agrupa sus propias vistas, subcomponentes, estilos y lógica contextual.

---

### Estructura de Directorios (`frontend/src/`)

```text
src/
  components/               # Componentes transversales y modales del sistema
    auth/                   # ProtectedRoute (guardia de sesión JWT)
    layout/                 # AppLayout (Sidebar, Topbar, Breadcrumbs, Selector de Carreras)
    modals/                 # Modales interactivos:
      ├── carrera/          # CarreraModal (Creación, edición de total de materias y eliminación segura)
      ├── evaluation/       # EvaluationModal (Preselección de materia, filtros por año, evaluaciones sin fecha)
      ├── import/           # ImportStudyPlanModal (Carga de plan con IA, preview y smart upsert)
      ├── materia/          # MateriaModal (Alta y edición de materias, estados académicos)
      ├── note/             # NoteModal (Creación rápida y vinculación de apuntes)
      ├── user/             # EditUserModal (Perfil, clave y configuración de Gemini API Key)
      └── ...
  context/                  # Contextos globales de React (AuthContext con persistencia y carrera activa)
  features/                 # <-- FEATURE-DRIVEN MODULES
    ├── apuntes/            # ApuntesView, FoldersSidebar jerárquico por año, NoteEditor Markdown, Visor Split-View, Copiloto IA y exportación a PDF
    ├── auth/               # LoginView y RegisterView
    ├── calendario/         # CalendarioView, agenda mensual, filtros por carrera activa vs todas
    ├── dashboard/          # DashboardView, KPIs de la carrera, próximas evaluaciones con navegación inter-carrera y accesos directos
    ├── horarios/           # HorariosView, grilla semanal interactiva y selector RGB de colores
    ├── malla/              # MallaCurricularView, árbol de asignaturas por año/cuatrimestre, matriz de correlatividades y gatillo de importación con IA
    ├── materias/           # MateriasView, ficha detallada, reglas de acreditación, evaluaciones y biblioteca bibliográfica
    └── progreso/           # ProgresoView, evolución histórica del promedio de aprobadas y distribución de notas
  hooks/                    # Custom hooks reactivos (useMaterias, useEvaluaciones, useCarreras, useApuntes, useMateriales, etc.)
  services/                 # Clientes HTTP hacia el backend Go (apiClient, materiasService, aiService, carrerasService, etc.)
  types/                    # Interfaces y contratos de TypeScript del dominio académico
```

---

### Módulos Principales y Decisiones Técnicas

#### 1. Malla Curricular (`features/malla/`)
- Muestra el mapa completo de materias ordenadas por año y cuatrimestre (1C, 2C y Anuales).
- Identificación visual de estados (*Cursando*, *Regular*, *Aprobada*, *Promocionada*, *Pendiente*).
- Panel de control de correlatividades (requisitos para cursar y requisitos para rendir final).
- Integración con `ImportStudyPlanModal`: permite cargar un PDF o texto de plan de estudios y orquestar con el backend la extracción con IA antes de aplicar cambios a la base de datos.

#### 2. Apuntes y Motor de Exportación a PDF (`features/apuntes/`)
- **Organización jerárquica**: las carpetas en `FoldersSidebar` se agrupan automáticamente por año lectivo (`1° Año`, `2° Año`, etc.) y materia.
- **Editor Markdown con KaTeX**: renderizado en vivo de fórmulas matemáticas (`$...$` inline y `$$...$$` en bloque).
- **Exportación limpia a PDF**: genera documentos de alta calidad académica listos para imprimir o compartir, procesando fórmulas matemáticas sin parpadeos ni hojas en blanco innecesarias.
- **Exportación a Markdown (.md) y archivo ZIP (.zip)**: para respaldos y portabilidad fuera de la plataforma.

#### 3. Modal de Evaluaciones Contextual (`components/modals/evaluation/`)
- **Preselección inteligente**: cuando el modal se abre desde una materia específica, dicha materia queda preseleccionada automáticamente y los filtros temporales se restablecen para garantizar su visibilidad en el desplegable.
- **Soporte para evaluaciones sin fecha fija**: habilita registrar exámenes con fecha por definir o antecedentes históricos.
- **Ponderaciones porcentuales**: cálculo instantáneo del promedio ponderado de la materia.

#### 4. Horarios y Selector Cromático (`features/horarios/`)
- Grilla semanal con soporte para múltiples modalidades (Presencial, Virtual, Híbrida).
- Selector de color con paleta predefinida y control interactivo RGB con persistencia inmediata en la entidad de la materia.

#### 5. Gestión Multi-Carrera y Navegación Inteligente
- Selector de carrera integrado en la barra lateral con sincronización reactiva en todos los módulos.
- Modal `CarreraModal` para ajustar la duración, materias estimadas del plan o solicitar la eliminación definitiva con confirmación de seguridad en dos pasos.
- Filtros por carrera en Dashboard y Calendario (vista consolidada multi-carrera vs. vista focalizada en la carrera activa).
- Navegación inter-carrera automática al hacer clic en "Ver materia" en cualquier evaluación del Dashboard.

---

### Stack Tecnológico del Frontend

- **Framework Core**: React 19 + TypeScript.
- **Bundler & Dev Server**: Vite (HMR ultrarrápido).
- **Enrutamiento**: React Router v7.
- **Estilos y Diseño**: CSS Modules + Tokens CSS puros (`index.css`) con soporte nativo para tema oscuro.
- **Iconografía**: `lucide-react`.
- **Matemáticas & Notación**: `KaTeX` para renderizado de fórmulas LaTeX.
- **Compilador & Linting**: `oxlint` para análisis estático y `tsc` para comprobación estricta de tipos.
