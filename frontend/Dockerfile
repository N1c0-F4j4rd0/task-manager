# frontend/Dockerfile (para usar con build context = raíz del repo)
FROM node:18-alpine AS build
WORKDIR /app

# Copiar package.json / lockfile de la raíz (importante para workspaces)
COPY package*.json ./

# Copiar el package.json del workspace frontend para npm entender la estructura (opcional pero seguro)
COPY frontend/package*.json ./frontend/

# Instalar dependencias de workspaces (incluye devDependencies)
# --include=dev para asegurarnos de que vite y otras devDeps estén presentes (npm >=7/8/9).
RUN if [ -f package-lock.json ]; then \
      npm ci --include=dev --workspaces || npm ci --workspaces; \
    else \
      npm install; \
    fi

# Copiar todo el repo (o al menos las carpetas necesarias)
COPY . .

# Construir sólo el workspace frontend
WORKDIR /app/frontend
ENV NODE_ENV=development
RUN npm run build

# Etapa final: nginx sirve los assets estáticos
FROM nginx:stable-alpine AS production
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
