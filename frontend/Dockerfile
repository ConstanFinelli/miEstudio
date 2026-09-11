# Etapa 1: Construcción de la SPA con Vite
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar manifiestos para caché de dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Inyectar VITE_API_URL en tiempo de build apuntando a /api (manejado por el proxy de Nginx)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Compilar para producción
RUN npm run build

# Etapa 2: Servidor web ultraligero Nginx
FROM nginx:alpine

# Reemplazar configuración de Nginx con soporte para SPA y proxy reverso
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados del build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
