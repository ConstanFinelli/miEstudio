# Etapa 1: Compilación de la aplicación Go
FROM golang:alpine AS builder

WORKDIR /app

# Instalar herramientas y certificados SSL
RUN apk add --no-cache git ca-certificates tzdata

# Copiar manifiestos de dependencias para aprovechar la caché de Docker
COPY go.mod go.sum ./
RUN go mod download

# Copiar el resto del código fuente del backend
COPY . .

# Compilar binario estático optimizado para Linux
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server ./cmd/api/main.go

# Etapa 2: Imagen final minimalista
FROM alpine:3.20

WORKDIR /app

# Instalar certificados raíz para conexiones seguras
RUN apk add --no-cache ca-certificates tzdata

# Copiar el binario compilado
COPY --from=builder /app/server /app/server

# Crear directorio para almacenamiento de PDFs/archivos subidos
RUN mkdir -p /app/uploads

EXPOSE 8080

CMD ["/app/server"]
