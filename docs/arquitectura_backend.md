# Arquitectura Backend: Go (Golang) 1.24 + Vertical Slicing

Para el backend se adopta una arquitectura de **Vertical Slicing** (rebanadas verticales) en lugar del esquema tradicional MVC por capas. Cada slice agrupa de forma autónoma el modelo de datos, la lógica de negocio (service), el acceso a datos (repository), los DTOs y los handlers HTTP de un caso de uso o dominio específico.

---

### Estructura de Directorios (`backend/`)

```text
backend/
├── cmd/
│   └── api/
│       └── main.go           # Punto de entrada: arranque de Fiber, inyección de dependencias y registro de rutas
└── internal/
    ├── common/               # Middlewares (Auth JWT, CORS, Logger, Error Handler) y utilidades de contexto
    ├── config/               # Carga y validación de variables de entorno (.env) y defaults
    ├── db/                   # Inicialización de GORM (MySQL / PostgreSQL) y auto-migraciones del esquema
    ├── storage/              # Adaptador desacoplado de almacenamiento en disco / S3 / Cloudflare R2
    └── features/             # <-- VERTICAL SLICES
        ├── ai/               # Copiloto Gemini AI, streaming SSE, parser de planes de estudio, validación y rate-limit
        ├── auth/             # Registro, login JWT, perfil y gestión de Gemini API Key por usuario
        ├── calendar/         # Agenda de eventos de estudio y fechas académicas
        ├── carreras/         # Multi-carrera, activación de carrera, edición, eliminación y acreditaciones históricas
        ├── evaluaciones/     # Instancias de evaluación, soporte sin fecha obligatoria, ponderaciones y notas
        ├── materials/        # Subida multipart, streaming Range, conteo de páginas con pdfcpu y depuración al aprobar
        ├── notes/            # Apuntes Markdown, carpetas y etiquetas
        ├── profile/          # Métricas académicas y perfil consolidado del estudiante
        ├── schedules/        # Grilla semanal de cursada y sincronización de colores
        └── subjects/         # Materias, reglas de acreditación, correlatividades (cursar y rendir) y batch-import
```

---

### Vertical Slices y Funcionalidades Destacadas

#### 1. Inteligencia Artificial (`features/ai`)
- **Streaming SSE en tiempo real**: soporte para endpoint `/api/ai/chat/stream` que envía chunks incrementales al frontend mediante Server-Sent Events.
- **Parser de Plan de Estudio (`/parse-study-plan`)**: recibe texto o PDF de un plan universitario y utiliza Google Gemini (`gemini-3.8-flash`) para estructurar todas las materias, regímenes (1C, 2C, Anual) y correlatividades.
- **Gestión Multi-Tenant de API Keys**: si el usuario configuró su propia clave en su perfil, el servicio de IA la utiliza de forma prioritaria; en caso contrario, realiza fallback a la variable de entorno `GEMINI_API_KEY` del servidor.
- **Rate Limiting preventivo**: limitador en memoria que restringe las peticiones de IA a un máximo de 15 consultas por minuto por usuario para proteger cuotas de API.

#### 2. Carreras Universitarias (`features/carreras`)
- Mantiene la relación de pertenencia de todas las entidades académicas a una carrera (`carrera_id`).
- Permite la activación ágil (`POST /:id/activar`), actualización de metas del plan (`total_materias_plan`) y eliminación segura con reasignación automática de la carrera activa.

#### 3. Materias y Correlatividades (`features/subjects`)
- Persistencia de correlatividades mediante serialización JSON (`serializer:json`) para `correlativas_cursar` y `correlativas_rendir`.
- Endpoint `POST /batch-import` con lógica de **Smart Upsert**: actualiza asignaturas si ya existen por código/nombre o crea nuevos registros, garantizando que no se pierdan apuntes, materiales ni notas asociadas.

#### 4. Materiales Bibliográficos y Streaming (`features/materials`)
- **Extracción de páginas con `pdfcpu`**: calcula en el servidor el número exacto de páginas de los archivos PDF para optimizar la visualización y navegación en el frontend.
- **Streaming HTTP Range**: implementación inline que permite peticiones parciales (`Accept-Ranges: bytes`) para que libros y documentos extensos comiencen a leerse inmediatamente sin descargarse completos en memoria.
- **Depuración al Aprobar**: borrado físico seguro en el almacenamiento de los archivos pesados cuando el estudiante aprueba la materia y decide liberar espacio.

---

### Capa de Almacenamiento Desacoplada (`internal/storage`)

Para independizar la persistencia física del código de negocio, se define la interfaz:

```go
type StorageService interface {
    Save(ctx context.Context, file io.Reader, filename string) (key string, err error)
    Get(ctx context.Context, key string) (io.ReadSeekCloser, error)
    Delete(ctx context.Context, key string) error
}
```

Esto permite alternar sin modificar los controladores entre almacenamiento local en disco (`STORAGE_DIR`) o buckets compatibles con S3 (MinIO, AWS S3, Cloudflare R2).

---

### Base de Datos y Persistencia

- **Motor**: MySQL 8.0 o PostgreSQL.
- **ORM**: GORM con migraciones automáticas en el arranque del servidor.
- **Integridad y Seguridad**: Soft Deletes con `gorm.DeletedAt` y restricciones multi-usuario por `usuario_id` en todas las consultas.
