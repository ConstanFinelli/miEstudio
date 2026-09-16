# miEstudio 🎓

**miEstudio** es una plataforma integral de gestión académica, seguimiento del plan de estudios y copiloto inteligente con Inteligencia Artificial diseñada para estudiantes universitarios. Centraliza la carga curricular, la malla de correlatividades, el historial de calificaciones, el horario semanal de cursada, la biblioteca de materiales bibliográficos en PDF y la toma de notas activas enriquecidas con IA.

---

## 🚀 Características Principales

### 1. Malla Curricular y Parser de Plan de Estudio con IA
- **Visualización interactiva de la malla**: asignaturas organizadas por año académico y cuatrimestre (1C, 2C, Anual), con estados en tiempo real (*Cursando*, *Regular*, *Aprobada*, *Promocionada*, *Pendiente*).
- **Grafo de correlatividades**: visualización y control de requisitos tanto para cursar como para rendir exámenes finales.
- **Importador Inteligente de Plan con IA (Gemini)**:
  - Carga el PDF oficial de la carrera o pega el programa en texto.
  - La IA analiza y extrae automáticamente todas las asignaturas, códigos oficiales, años, regímenes y matriz de correlativas.
  - Modal de previsualización interactiva y edición antes de confirmar.
  - **Smart Upsert**: actualiza o inserta materias sin perder notas, apuntes ni materiales preexistentes.

### 2. Gestión Multi-Carrera y Selector Inteligente
- **Soporte simultáneo multi-carrera**: permite cursar o registrar múltiples planes de estudio universitarios con legajo, facultad/sede y total de materias estimadas.
- **Selector ágil en barra lateral y cabecera**: cambio instantáneo de contexto entre carreras activas.
- **Configuración y eliminación de carreras**: modal para editar parámetros de la carrera o eliminarla de forma segura mediante confirmación en doble paso, transfiriendo automáticamente la carrera activa.
- **Filtros contextuales en Dashboard y Calendario**:
  - Vista unificada (fechas de todas las carreras para no descuidar ningún vencimiento).
  - Vista filtrada (exclusiva de la carrera seleccionada).
- **Navegación inter-carrera automática**: al hacer clic en "Ver materia" desde una evaluación perteneciente a otra carrera en el Dashboard, la plataforma cambia de carrera automáticamente y abre la materia requerida.

### 3. Gestión de Materias y Reglas de Acreditación
- **Seguimiento integral de asignaturas**: nombre, código, comisión, profesores, aula y modalidad (presencial, virtual, híbrida).
- **Reglas de Acreditación personalizadas**: configuración descriptiva por cátedra para condiciones de promoción directa y regularidad (porcentajes de asistencia, notas mínimas, requisitos especiales).
- **Personalización cromática**: selector de paleta predefinida y selector RGB interactivo con persistencia directa en la base de datos.
- **Depuración inteligente de PDFs al aprobar**: detección automática y confirmación opcional para liberar almacenamiento en el servidor eliminando PDFs pesados de materias aprobadas, preservando siempre los apuntes de texto.

### 4. Instancias de Evaluación Flexibles
- **Tipos de instancia**: Parciales, Recuperatorios, Finales, Trabajos Prácticos (TP), Laboratorios y Quizzes/Entregas.
- **Preselección contextual**: al agregar una instancia desde la vista de una materia, el modal preselecciona automáticamente dicha materia y ajusta los filtros para su visualización inmediata.
- **Flexibilidad en fechas**: permite registrar evaluaciones sin fecha obligatoria previa (fechas a confirmar o registro histórico).
- **Ponderaciones y promedios**: ponderación porcentual de exámenes con cálculo automático del promedio ponderado en tiempo real.

### 5. Apuntes, Active Recall y Exportación Profesional
- **Editor Markdown enriquecido**: soporte completo para bloques de código, tablas y fórmulas matemáticas en LaTeX/KaTeX (`$...$` y `$$...$$`).
- **Organización jerárquica**: panel lateral de carpetas agrupadas por año académico y materias.
- **Exportación en múltiples formatos**:
  - **Exportación a PDF Académico**: renderizado limpio sin páginas en blanco, maquetado con tipografía académica y renderizado perfecto de fórmulas KaTeX.
  - **Documento Markdown (.md)**: descarga individual con metadatos en YAML frontmatter.
  - **Archivo comprimido (.zip)**: descarga global de todos los apuntes de una materia ordenados en subcarpetas.

### 6. Biblioteca de Materiales y Visor Split-Screen
- **Categorización de recursos**: Teoría, Guías Prácticas, Exámenes Anteriores y Bibliografía Oficial.
- **Conteo automático de páginas**: extracción precisa de cantidad de páginas de PDFs en el backend con `pdfcpu`.
- **Visor de PDFs integrado (Split-View)**: lectura y toma de apuntes simultánea en pantalla dividida sin cambiar de pestaña, con streaming HTTP Range optimizado.
- **Edición y recategorización**: actualización ágil de títulos y categorías de archivos ya subidos.

### 7. Copiloto de Inteligencia Artificial (Google Gemini)
- **Fundamentación rigurosa en PDFs**: el copiloto fundamenta sus respuestas, resúmenes y preguntas estrictamente en la bibliografía oficial seleccionada.
- **Chat conversacional con streaming SSE**: interfaz fluida con animación de estado de pensamiento (*thinking card* con efecto *shimmer*) y cursor de escritura en tiempo real.
- **Gestión de API Key por usuario**: cada estudiante puede configurar su propia clave personal de Gemini desde los ajustes de su perfil, contando con fallback seguro a la variable del servidor.
- **Herramientas de Active Recall**:
  - Generación de resúmenes estructurados con fórmulas y consejos de examen.
  - Barajas de tarjetas de memoria (*Flashcards*) por nivel de dificultad.
  - Cuestionarios interactivos (*Quiz*) con explicaciones pedagógicas.
  - Inserción directa de respuestas de la IA en el apunte activo.

### 8. Horarios Semanales, Calendario y Analíticas de Progreso
- **Grilla horaria interactiva**: visualización semanal con bloques coloreados por materia y detalles de cursada.
- **Calendario académico mensual**: agenda de exámenes y eventos con filtros por tipo e indicador de carrera.
- **Analíticas de progreso**: porcentaje de avance de la carrera respecto al total de materias del plan, evolución del promedio anual calculada sobre materias aprobadas, distribución de calificaciones y modalidades de aprobación (promoción vs. final vs. equivalencia).

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, CSS Modules + Tokens CSS Vanilla, KaTeX, Lucide Icons, JSZip, HTML2Canvas, Purify. |
| **Backend** | Go (Golang) 1.24, Fiber v2 (Arquitectura Vertical Slicing), GORM, JWT Auth, Multi-tenant, `pdfcpu`. |
| **Base de Datos** | MySQL 8.0 / PostgreSQL (soporte multi-driver mediante GORM con serialización JSON). |
| **Inteligencia Artificial** | Google Gemini API (`gemini-3.8-flash` / `gemini-2.5-flash`), streaming SSE, prompts pedagógicos y gestión multi-usuario de API Keys. |
| **Almacenamiento** | Adaptador desacoplado `storage.StorageService` (Disco Local / S3 / Cloudflare R2 / MinIO). |
| **Infraestructura** | Docker, Docker Compose, Nginx (Reverse Proxy & Static Server), GitHub Actions CI/CD y despliegue automatizado en Dokploy. |

---

## 📦 Instalación y Puesta en Marcha

### Opción 1: Con Docker Compose (Recomendada)

La forma más rápida y consistente de ejecutar la plataforma completa (Base de Datos MySQL, Backend en Go y Frontend en Nginx):

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/miEstudio.git
cd miEstudio

# 2. Configurar variables de entorno opcionales (GEMINI_API_KEY)
export GEMINI_API_KEY="tu-api-key-de-gemini"

# 3. Construir e iniciar contenedores
docker compose up -d --build
```

Servicios desplegados:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8080`
- **Base de Datos MySQL**: `localhost:3307` (mapeada a 3306 del contenedor)

Para ver los logs en tiempo real:
```bash
docker compose logs -f
```

---

### Opción 2: Entorno de Desarrollo Local

#### Prerrequisitos
- **Node.js 18+** y npm
- **Go 1.24+**
- Servidor de base de datos **MySQL 8.0+** o PostgreSQL

#### 1. Configuración del Backend

```bash
cd backend

# Crear archivo de entorno a partir de las variables requeridas
cat <<EOF > .env
PORT=8080
DB_DRIVER=mysql
DB_USER=miestudio
DB_PASSWORD=miestudio123
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=miestudio
STORAGE_DIR=./uploads
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
GEMINI_API_KEY=tu_api_key_de_gemini
GEMINI_MODEL=gemini-3.8-flash
EOF

# Descargar dependencias y ejecutar migraciones e iniciar servidor
go run cmd/api/main.go
```

#### 2. Configuración del Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo con Vite (HMR)
npm run dev
```

La aplicación quedará disponible en `http://localhost:5173`.

---

## 🧪 Calidad de Código, Pruebas y Compilación

- **Frontend**:
  ```bash
  cd frontend
  npm run build     # Verificación estricta de tipos con TypeScript y empaquetado Vite
  npm run lint      # Análisis estático ultrarrápido con oxlint
  ```
- **Backend**:
  ```bash
  cd backend
  go build ./...    # Compilación de todos los paquetes y vertical slices
  go vet ./...      # Análisis estático estándar de Go
  ```

---

## 🚀 Despliegue Continuo (CI/CD)

El repositorio cuenta con integración continua automatizada mediante **GitHub Actions** (`.github/workflows/main.yml`):
- **Rama `develop`**: construye las imágenes Docker de frontend y backend y las publica en GitHub Container Registry (`ghcr.io`) bajo etiquetas de *staging*.
- **Rama `main`**: construye las imágenes de producción y las despliega automáticamente en el servidor a través de **Dokploy** mediante webhooks autenticados.

---

## 📂 Estructura del Proyecto

```text
miEstudio/
├── backend/
│   ├── cmd/api/main.go            # Inicialización del servidor Fiber, middlewares y slices
│   └── internal/
│       ├── common/                # Middlewares (Auth JWT, CORS, Logger, Errores)
│       ├── config/                # Carga de variables de entorno y defaults
│       ├── db/                    # Conexión GORM y auto-migraciones relacionales
│       ├── storage/               # Adaptador de almacenamiento (Disco local / S3)
│       └── features/              # VERTICAL SLICES
│           ├── ai/                # Integración Gemini, SSE streaming, parser de plan de estudio y validación de keys
│           ├── auth/              # Registro, login, JWT y API key de Gemini por usuario
│           ├── calendar/          # Eventos adicionales de estudio y fechas académicas
│           ├── carreras/          # Multi-carrera, configuración, eliminación y aprobaciones históricas
│           ├── evaluaciones/      # Instancias de evaluación, ponderaciones y notas
│           ├── materials/         # Subida multipart, streaming Range, conteo pdfcpu y depuración
│           ├── notes/             # Editor Markdown, carpetas y etiquetas
│           ├── profile/           # Perfil del estudiante y métricas de avance
│           ├── schedules/         # Grilla semanal de cursada y sincronización de colores
│           └── subjects/          # Materias, reglas de acreditación, correlativas y batch-import
├── frontend/
│   └── src/
│       ├── components/            # Layout, barras de navegación y modales del sistema
│       │   ├── layout/            # AppLayout, Sidebar, Selector de carreras
│       │   └── modals/            # CarreraModal, MateriaModal, EvaluationModal, NoteModal, etc.
│       ├── features/              # FEATURE-DRIVEN MODULES
│       │   ├── apuntes/           # Editor de notas, Split PDF, visor KaTeX y Copiloto IA
│       │   ├── calendario/        # Calendario mensual y filtros por carrera
│       │   ├── dashboard/         # Resumen académico, evaluaciones próximas y accesos rápidos
│       │   ├── horarios/          # Grilla semanal interactiva y selector RGB de color
│       │   ├── malla/             # Malla curricular interactiva, grafo de correlativas y modal de importación
│       │   ├── materias/          # Asignaturas, bibliografía, reglas y evaluaciones
│       │   └── progreso/          # Analíticas de promedio histórico y modalidades de aprobación
│       ├── hooks/                 # Custom hooks reactivos (useMaterias, useEvaluaciones, useCarreras, etc.)
│       └── services/              # Clientes HTTP y mappers DTO
├── docs/                          # Documentación técnica y especificaciones de arquitectura
├── docker-compose.yml             # Orquestación de MySQL, Backend y Frontend
└── .github/workflows/main.yml     # Pipeline CI/CD automatizado
```

---

## 📄 Licencia

Este proyecto está desarrollado para uso académico y personal. Todos los derechos reservados.
