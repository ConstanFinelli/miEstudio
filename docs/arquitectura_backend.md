# Arquitectura Backend: GoLang + Vertical Slicing

Para el backend priorizamos la mantenibilidad y la escalabilidad, alejándonos del patrón MVC tradicional y adoptando **Vertical Slicing**. Esto permite iterar más rápido y mantener el enfoque en los _casos de uso_. En Vertical Slicing organizamos el código por **Features** (características) y no por capas técnicas (rutas, controladores, modelos).

### Estructura de Directorios (Go)

```text
cmd/
  api/
    main.go           # Punto de entrada, inicialización del servidor y BD.
internal/
  db/                 # Conexión a DB (PostgreSQL + GORM) y auto-migraciones.
  common/             # Middleware (JWT auth, CORS, logger, errores), utilidades globales.
  storage/            # Adaptador de almacenamiento desacoplado (Local Disk / S3 / R2)
  features/           # <-- VERTICAL SLICES
    auth/             # Feature: Autenticación, JWT y edición de perfil (PUT /auth/me)
    carreras/         # Feature: Multi-carrera y selección de carrera activa
    subjects/         # Feature: Materias y Reglas de Acreditación (condición libre en string)
    evaluations/      # Feature: Instancias de Evaluación (Parciales, TPs, Finales)
    schedules/        # Feature: Grilla semanal de horarios de cursada
    notes/            # Feature: Apuntes Markdown, carpetas y etiquetas
    materials/        # Feature: Materiales y Archivos (subida multipart, streaming HTTP Range)
```

### Estrategia de Almacenamiento de Archivos (PDFs)

Para desacoplar el almacenamiento físico de la lógica de negocio, se define una interfaz de servicio de storage (`storage.StorageService`):

- `Save(ctx context.Context, file io.Reader, filename string) (key string, err error)`
- `Get(ctx context.Context, key string) (io.ReadSeekCloser, error)` (soporta Range requests)
- `Delete(ctx context.Context, key string) error`

Esto permite intercambiar la implementación mediante configuración (`STORAGE_DRIVER=local` en desarrollo o `STORAGE_DRIVER=s3` / `r2` en producción con Cloudflare R2 o MinIO).

### Stack Sugerido y Puntos de Decisión

- **Framework Web:**
  - `Fiber v2/v3` (Extremadamente rápido, API idéntica a Express.js, ideal para desarrollo ágil).
- **Database / ORM:**
  - `GORM` (ORM clásico, rápido para prototipado con migraciones automáticas).
- **Base de Datos:** PostgreSQL (Soporta JSONB para apuntes ricos/bloques y relaciones estrictas).
- **Validación:** `go-playground/validator`.
