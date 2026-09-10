# Arquitectura Frontend: React + TypeScript (Feature-Driven)

En el frontend aplicaremos un enfoque similar al Vertical Slicing. En lugar de agrupar todos los componentes por tipo (todos los hooks juntos, todas las vistas juntas), agruparemos por **módulo o funcionalidad** (Feature-Driven Architecture).

### Estructura de Directorios (React + Vite)

```text
src/
  components/           # Componentes UI compartidos y modales del sistema
    auth/               # ProtectedRoute
    layout/             # AppLayout (Sidebar, Topbar, Breadcrumbs, Selector de Carreras)
    modals/             # Modales: MateriaModal, EvaluationModal, NoteModal, CarreraModal, EditUserModal, PdfViewerModal, CleanApprovedPdfsModal
  context/              # AuthContext (sesión y carrera activa), ThemeContext (modo oscuro/claro)
  data/                 # Datos mockeados y seeds demostrativos
  features/             # <-- FEATURE-DRIVEN MODULES
    auth/               # LoginView, RegisterView
    dashboard/          # DashboardView, KPIs, Evaluaciones pendientes, Gráfico de progreso, Notas recientes
    materias/           # MateriasView, MateriaDetail, Reglas de acreditación, Materiales, Horarios
    horarios/           # HorariosView (grilla horaria semanal interactiva)
    calendario/         # CalendarioView (agenda de exámenes, parciales y eventos)
    apuntes/            # ApuntesView, FoldersSidebar, NoteEditor, NoteReader, Split PDF Study, AiCopilotPane (Chat, Resumen, Flashcards, Quiz)
    progreso/           # ProgresoView (Progreso analítico, KPIs, evolución histórica de notas, modalidades de aprobación y timeline de hitos)
  hooks/                # Custom hooks (useMaterias, useEvaluaciones, useApuntes, useMateriales, useProgresoAcademico, usePerfil, etc.)
  services/             # Clientes HTTP hacia el backend Go (apiClient, materiasService, apuntesService, aiService, etc.)
  types/                # Definiciones TypeScript de dominio académico
```

### Visualización y Gestión de PDFs en el Frontend

- **Librería del Visor de PDFs:**
  - `@react-pdf-viewer/core` + `@react-pdf-viewer/default-layout` (Basado en Mozilla PDF.js. Provee de fábrica zoom, miniaturas, barra de navegación, búsqueda de texto y responsive design).
- **Modo Estudio (Split-View):**
  - Uso de `react-resizable-panels` para permitir al usuario arrastrar el divisor central y ajustar el ancho del PDF y del editor de apuntes de forma fluida.

### Stack Sugerido y Puntos de Decisión

- **Build Tool:** `Vite` + React + TypeScript.
- **Server State (Peticiones):** `TanStack Query (React Query)`. Fundamental para manejar estados de carga, errores y caché de los CRUDs.
- **Client State (Estado Global):** `Zustand`. Ligero y fácil, ideal para estados de UI (ej. sidebar abierto, paneles colapsados, zoom del visor).
- **Estilos y UI:** `CSS Modules` + Variables CSS (`index.css` con el sistema de tokens de `Terminal Scholar`). Sin Tailwind CSS, priorizando estilos puros, modulares y alto control.
- **Manejo de Formularios:** `React Hook Form` + `Zod` (para validación de esquemas).
- **Editor de Notas:** Editor Markdown nativo con soporte KaTeX y bloques de código.
- **Visor PDF:** `@react-pdf-viewer/core` o visor integrado con PDF.js.
