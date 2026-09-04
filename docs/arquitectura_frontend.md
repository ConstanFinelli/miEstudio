# Arquitectura Frontend: React + TypeScript (Feature-Driven)

En el frontend aplicaremos un enfoque similar al Vertical Slicing. En lugar de agrupar todos los componentes por tipo (todos los hooks juntos, todas las vistas juntas), agruparemos por **módulo o funcionalidad** (Feature-Driven Architecture).

### Estructura de Directorios (React + Vite)

```text
src/
  app/                # Configuración global: Proveedores (React Query, Context), Enrutador principal.
  assets/             # Imágenes, íconos globales.
  components/         # Componentes UI reutilizables (Botones, Modales, Inputs). "Dumb components".
  lib/                # Utilidades, configuración global (ej. axios, utilidades de fecha).
  features/           # <-- FEATURE-DRIVEN
    materias/
      api/            # Funciones que llaman al backend de materias (fetchMaterias, createMateria)
      components/     # Componentes ESPECÍFICOS de materias (MateriaCard, FormularioMateria)
      hooks/          # Custom hooks (ej. useMaterias que envuelve a React Query)
      types/          # Interfaces TS para Materias
    evaluaciones/
      ...
    apuntes/
      ...
    materiales/       # Feature: Materiales y Visor de PDFs
      api/            # uploadPdf, fetchMateriales, deleteMaterial
      components/     # PdfViewer, PdfToolbar, MaterialList, UploadModal, SplitStudyView
      hooks/          # usePdfViewer, useMateriales
      types/          # Material, CategoriaMaterial
  pages/              # Vistas a nivel de ruta que orquestan a los features (Dashboard, SubjectDetails, NotesEditor, StudyRoom)
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
- **Estilos y UI:** `Tailwind CSS` combinado con `Shadcn/UI` para componentes pre-armados, accesibles y estéticos.
- **Manejo de Formularios:** `React Hook Form` + `Zod` (para validación de esquemas).
- **Editor de Notas:** `TipTap` (Headless editor extensible) o `BlockNote` (Estilo Notion por bloques, muy rápido de implementar).
- **Visor PDF:** `@react-pdf-viewer/core` o `react-pdf`.
