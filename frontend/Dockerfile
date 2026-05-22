# Stage 1: Build
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Asumim que el build d'Angular es crea a /app/dist/frontend/browser
RUN npm run build --configuration=production

# Stage 2: Serve amb Nginx
FROM nginx:alpine
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Configuració personalitzada d'Nginx per:
# 1. Redirigir les rutes d'Angular a index.html (SPA)
# 2. Configurar el proxy invers per enviar les peticions /api al servei backend
RUN echo 'server { \
    listen 80; \
    \
    # Proxy pel backend (així evitem problemes de CORS i URLs hardcodejades) \
    location /api/ { \
        proxy_pass http://backend-service/api/; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    \
    # Rutes d Angular \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
