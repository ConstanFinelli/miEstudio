# Arquitectura Backend: GoLang + Vertical Slicing

Para el backend priorizamos la mantenibilidad y la escalabilidad, alejándonos del patrón MVC tradicional y adoptando **Vertical Slicing**. Esto permite iterar más rápido y mantener el enfoque en los _casos de uso_. En Vertical Slicing organizamos el código por **Features** (características) y no por capas técnicas (rutas, controladores, modelos).

### Estructura de Directorios (Go)

```text
cmd/
  api/
    main.go           # Punto de entrada, inicialización del servidor y BD.
internal/
  db/                 # Conexión a DB (ej. pgx, GORM, sqlc) y migraciones.
  common/             # Middleware (auth, logger, errores), utilidades globales.
  storage/            # Adaptador de almacenamiento desacoplado (Local Disk / S3 / R2)
  features/           # <-- VERTICAL SLICES
    subjects/         # Feature: Materias
      handler.go      # Rutas HTTP para materias
      service.go      # Lógica de negocio
      repository.go   # Consultas a la base de datos
      models.go       # Estructuras de datos (DTOs y DB models)
    evaluations/      # Feature: Instancias de Evaluación
      handler.go
      ...
    notes/            # Feature: Apuntes
      handler.go
      ...
    materials/        # Feature: Materiales y Archivos (PDFs)
      handler.go      # Subida multipart, streaming con HTTP Range
      service.go      # Validación de MIME types y orquestación con storage
      repository.go   # Metadatos del archivo en PostgreSQL
      models.go
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
