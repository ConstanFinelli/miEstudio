# miEstudio - Frontend ⚛️

Cliente web interactivo desarrollado en **React 19**, **TypeScript** y **Vite** para la plataforma académica **miEstudio**.

---

## 🚀 Inicio Rápido

### Prerrequisitos
- **Node.js 18+** (o Node.js 20/22 recomendado)
- **npm** o **pnpm**

### Instalación y Ejecución Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo con Vite (HMR)
npm run dev
```

La aplicación se ejecutará en `http://localhost:5173`.

---

## 🛠️ Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con Hot Module Replacement (HMR). |
| `npm run build` | Ejecuta la verificación estricta de tipos de TypeScript (`tsc -b`) y empaqueta para producción con Vite. |
| `npm run lint` | Ejecuta el análisis estático de código ultrarrápido con `oxlint`. |
| `npm run preview` | Previsualiza el bundle de producción compilado localmente. |

---

## 📂 Arquitectura del Código

El proyecto adopta una arquitectura **Feature-Driven** orientada a casos de uso:

```text
src/
├── components/          # Componentes reutilizables de UI y modales del sistema
│   ├── auth/            # ProtectedRoute
│   ├── layout/          # AppLayout, Sidebar, Topbar, selector de carreras
│   └── modals/          # Modales: CarreraModal, EvaluationModal, ImportStudyPlanModal, MateriaModal, etc.
├── context/             # AuthContext (autenticación JWT y persistencia de carrera activa)
├── features/            # MÓDULOS DE NEGOCIO (Feature-Driven)
│   ├── apuntes/         # Editor Markdown, árbol de carpetas por año, visor Split PDF, Copiloto IA y exportación PDF
│   ├── auth/            # Vistas de Login y Registro
│   ├── calendario/      # Calendario académico mensual con filtros de carrera
│   ├── dashboard/       # Resumen general, evaluaciones próximas y accesos directos
│   ├── horarios/        # Grilla horaria semanal y selector interactivo RGB de colores
│   ├── malla/           # Malla curricular interactiva, correlativas e importador con IA
│   ├── materias/        # Ficha de materias, reglas de acreditación y biblioteca bibliográfica
│   └── progreso/        # Analíticas de avance, promedio histórico y modalidades de aprobación
├── hooks/               # Custom hooks reactivos (useMaterias, useEvaluaciones, useCarreras, useMateriales, etc.)
├── services/            # Clientes HTTP y mappers DTO conectados al backend Go
├── styles/              # Tokens y utilidades de estilo globales
├── types/               # Definiciones de TypeScript de dominio académico
├── App.tsx              # Ruteo principal y orquestación de modales globales
└── main.tsx             # Punto de entrada de la aplicación React
```

---

## 🎨 Sistema de Diseño y Estilos

- **Vanilla CSS Tokens + CSS Modules**: la aplicación no depende de frameworks utilitarios invasivos. Todo el sistema visual se rige por variables CSS declaradas en `src/index.css`.
- **Tema Oscuro Nativo**: paleta de alto contraste optimizada para largas jornadas de estudio nocturno.
- **Tipografía**: fuentes modernas optimizadas con excelente legibilidad en código y texto técnico.
- **Fórmulas Matemáticas**: renderizado de expresiones LaTeX en tiempo real mediante `KaTeX`.
- **Iconografía**: colección moderna y consistente provista por `lucide-react`.

---

## 🐳 Docker y Nginx

Para producción, el frontend se empaqueta en una imagen liviana con **Nginx** que actúa como servidor de estáticos y maneja el fallback de rutas del SPA (`try_files $uri /index.html`).

```bash
docker build -t miestudio-frontend .
docker run -p 5173:80 miestudio-frontend
```
