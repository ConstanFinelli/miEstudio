# miEstudio 🎓

**miEstudio** es una plataforma integral de gestión de estudio, seguimiento académico y copiloto inteligente diseñada para estudiantes universitarios. Centraliza la carga académica, el historial de notas, el horario semanal de cursada, la biblioteca de materiales bibliográficos en PDF y la toma de notas activas enriquecidas con inteligencia artificial.

---

## 🚀 Características Principales

### 1. Gestión de Materias y Acreditación
- Seguimiento de estados por materia: *Cursando*, *Regular*, *Aprobada*, *Promocionada*, *Libre*.
- Configuración flexible de **Reglas de Acreditación** personalizadas por cátedra (porcentajes de asistencia, condiciones de promoción directa y regularidad).
- **Depuración inteligente de PDFs al aprobar**: detección automática y confirmación opcional para liberar espacio en el servidor eliminando PDFs pesados de materias ya acreditadas, manteniendo los apuntes de texto intactos.

### 2. Toma de Notas y Exportación
- Editor Markdown con soporte para bloques de código, tablas y fórmulas matemáticas en LaTeX/KaTeX (`$...$` y `$$...$$`).
- Organización de notas por carpetas y vinculación estricta a materias e instancias de evaluación.
- **Exportación en un clic**:
  - Descarga individual de apuntes como documentos Markdown estándar (`.md`) con metadatos en YAML frontmatter.
  - Exportación integral comprimida (`.zip`) con todas las notas de una materia ordenadas en subcarpetas.

### 3. Materiales de Estudio y Visor Split-Screen
- Biblioteca de materiales categorizados (*Teoría*, *Guías Prácticas*, *Exámenes Anteriores*, *Bibliografía Oficial*).
- Visor de PDFs integrado en pantalla dividida (*Split-View*) para leer el material de cátedra y tomar apuntes simultáneamente sin cambiar de ventana.
- Streaming HTTP Range inline optimizado para archivos extensos con soporte para autenticación en navegadores e iframes.

### 4. Copiloto de Inteligencia Artificial (Google Gemini)
- **Fundamentación rigurosa en PDFs**: el copiloto basa sus explicaciones, resúmenes y preguntas estrictamente en el material bibliográfico de cátedra seleccionado.
- **Chat conversacional con streaming SSE**: animación de estado de pensamiento (*thinking card* con shimmer) y cursor de escritura continuo en tiempo real.
- **Inserción directa en apuntes**: un clic para transferir respuestas y explicaciones de la IA al apunte activo o crear una nota nueva.
- **Active Recall & Autoevaluación**:
  - Resúmenes ejecutivos con conceptos clave y tips de examen.
  - Generación de tarjetas de memoria (*Flashcards*) por nivel de dificultad.
  - Cuestionarios interactivos (*Quiz*) con explicaciones pedagógicas.

### 5. Horarios, Calendario y Analíticas de Progreso
- Grilla semanal interactiva de cursado por día, aula y modalidad (presencial, virtual, híbrida).
- Calendario consolidado de instancias evaluativas (parciales, recuperatorios, entregas de TPs, finales).
- **Progreso analítico**: evolución histórica del promedio de notas calculada sobre materias aprobadas por ciclo lectivo, distribución de calificaciones y desglose de modalidades de aprobación (promoción directa vs. final vs. equivalencia).

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, CSS Modules + Vanilla CSS tokens, KaTeX, Lucide Icons, JSZip. |
| **Backend** | Go (Golang) 1.24+, Fiber v2 (Arquitectura Vertical Slicing), GORM, JWT Auth, Multi-tenant. |
| **Base de Datos** | MySQL / PostgreSQL / SQLite (soporte multi-driver vía GORM). |
| **Inteligencia Artificial** | Google Gemini API (`gemini-2.5-flash` / `gemini-3.8-flash`) vía llamadas nativas con streaming SSE y blindaje multi-tenant. |
| **Almacenamiento** | Adaptador desacoplado `storage.StorageService` (Local Disk / S3 / R2). |

---

## 📦 Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js 18+ y npm
- Go 1.22+
- Servidor de base de datos MySQL o PostgreSQL

### 1. Configuración del Backend

```bash
cd backend

# Copiar y editar variables de entorno
cp .env.example .env   # o ajustar backend/.env

# Ejecutar migraciones e iniciar servidor
go run cmd/api/main.go
```

Variables clave en `backend/.env`:
```env
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
GEMINI_MODEL=gemini-2.5-flash
```

### 2. Configuración del Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo Vite
npm run dev
```

La aplicación quedará disponible en `http://localhost:5173`.

---

## 🧪 Calidad de Código y Compilación

- **Frontend**:
  ```bash
  npm run build     # Verificación de tipos con tsc y empaquetado Vite
  npm run lint      # Análisis estático ultrarrápido con oxlint
  ```
- **Backend**:
  ```bash
  go build ./...    # Compilación de todos los paquetes y vertical slices
  go vet ./...      # Análisis estático estándar de Go
  ```

---

## 📂 Estructura del Proyecto

```text
miEstudio/
├── backend/
│   ├── cmd/api/main.go            # Inicialización del servidor HTTP y dependencias
│   └── internal/
│       ├── common/                # Middlewares (Auth JWT, CORS, Errores)
│       ├── db/                    # Conexión a BD y migraciones automáticas
│       ├── storage/               # Adaptador de almacenamiento en disco / S3
│       └── features/              # Vertical Slices
│           ├── ai/                # Integración Gemini, SSE streaming, prompts
│           ├── auth/              # Registro, login, JWT y perfil
│           ├── carreras/          # Multi-carrera y acreditaciones históricas
│           ├── evaluations/       # Instancias de evaluación
│           ├── materials/         # Subida multipart, streaming Range, depuración
│           ├── notes/             # Apuntes Markdown y carpetas
│           ├── profile/           # Datos del estudiante
│           ├── schedules/         # Grilla semanal de cursada
│           └── subjects/          # Materias y reglas de acreditación
├── frontend/
│   └── src/
│       ├── components/            # Modales y componentes compartidos
│       ├── features/              # Módulos organizados por funcionalidad
│       │   ├── apuntes/           # Editor, Split PDF y Copiloto IA (Chat, Resumen, Flashcards, Quiz)
│       │   ├── calendario/        # Agenda de exámenes y eventos
│       │   ├── dashboard/         # Resumen general y accesos rápidos
│       │   ├── horarios/          # Grilla de cursado
│       │   ├── materias/          # Gestión de asignaturas y bibliografía
│       │   └── progreso/          # Analíticas de promedio y rendimiento
│       ├── hooks/                 # Custom hooks reactivos
│       └── services/              # Clientes de API y mappers DTO
└── docs/                          # Especificaciones de arquitectura y CRUDs
```
