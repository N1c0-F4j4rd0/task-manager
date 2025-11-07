# ✅ Task Manager — React (TS) + Express + MongoDB + Docker + Testing

Aplicación **full-stack** para gestión de tareas:

- **Frontend:** React + TypeScript + Vite + Bootstrap  
- **Backend:** Node.js (Express) + Mongoose + JWT + Roles  
- **Base de datos:** MongoDB  
- **Testing automatizado:**
  - Backend: Vitest + Supertest + mongodb-memory-server (sin tocar tu BD real)
  - Frontend: Vitest + React Testing Library + JSDOM
- **Dockerización completa:** frontend + backend + MongoDB

---
---

## 🚀 Requisitos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js     | **20.19.0 o superior** |
| npm         | incluido con Node |
| Docker / Docker Desktop | opcional pero recomendado |
| MongoDB Compass | opcional |

---

## 🔧 Instalación del proyecto

Clonar el repositorio:

```sh
git clone <URL-DEL-REPO>.git
cd task-manager

✅ Backend (server)
1️⃣ Crear variables de entorno

server/.env
contenido:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task_manager
CORS_ORIGIN=http://localhost:5173

JWT_ACCESS_SECRET=secret123
JWT_REFRESH_SECRET=secret123
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

2️⃣ Instalar dependencias
cd server
npm install

3️⃣ Ejecutar servidor en modo desarrollo
npm run dev


✅ Frontend (React)
1️⃣ Crear archivo .env
frontend/.env

VITE_API_URL=http://127.0.0.1:5000

2️⃣ Instalar dependencias
cd frontend
npm install

3️⃣ Ejecutar frontend
npm run dev


🧪 Pruebas automatizadas
El proyecto incluye 15 pruebas automáticas (backend + frontend)

Backend (Vitest + Supertest + mongo-memory-server)
Permite ejecutar la API sin usar Mongo real.

Ejecutar:
cd server
npm test

Frontend (Vitest + React Testing Library + JSDOM)
Ejecutar:
cd frontend
npm test

🐳 Docker — Levantar TODA la aplicación con 1 comando
El proyecto incluye:

✅ MongoDB
✅ Backend (Express)
✅ Frontend (React build con Nginx)

Ejecutar en la raíz del proyecto:
docker compose up --build

Parar contenedores:
docker compose down

🔍 Probar la aplicación

Abre: http://localhost:5173
Registra un usuario
Crea / edita / elimina tareas
Verifica en MongoDB Compass:
mongodb://localhost:27017/task_manager


✨ Características principales
✔ Login / Registro con JWT + Refresh Token (cookies httpOnly)
✔ CRUD de tareas protegido por sesión
✔ Roles (user / admin)
✔ Testing completo backend + frontend
✔ Docker listo para despliegue