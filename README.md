Task Manager — React (TS) + Express + MongoDB

Aplicación full-stack de gestión de tareas con React + TypeScript (Vite) en el frontend, Express + Mongoose en el backend y MongoDB como base de datos. Este README explica cómo clonar, configurar y correr todo el proyecto en local.

🚀 Stack

Frontend: React 18 + TypeScript + Vite

Backend: Node.js + Express + Mongoose

DB: MongoDB (recomendado en Docker)

Herramientas: Nodemon, Dotenv, Bootstrap

✅ Requisitos

Node.js 18+ y npm

Docker (opcional pero recomendado para MongoDB)

Si prefieres sin Docker, puedes usar mongod nativo.

⚙️ Variables de entorno
Backend (server/.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task_manager
CORS_ORIGIN=http://localhost:5173

Frontend (.env en la raíz)
VITE_API_URL=http://127.0.0.1:5000/api

🗄️ Opción A — Levantar MongoDB con Docker (recomendado)

En cualquier carpeta (no importa cuál):
docker run -d --name mongo \
  -p 27017:27017 \
  -v mongo-data:/data/db \
  mongo:7

Verifica:
docker ps --filter name=mongo

Conéctate con Compass (opcional):
mongodb://localhost:27017


🧪 Opción B — MongoDB nativo (sin Docker)

Ubuntu/Debian (ejemplo):
sudo systemctl start mongod
sudo systemctl enable mongod

Comprueba que escucha en 27017:
ss -ltnp | grep 27017


▶️ Arranque rápido (todo)
git clone <URL-DEL-REPO>.git
cd task-manager


Levantar MongoDB
Con Docker: (una sola vez)
docker run -d --name mongo -p 27017:27017 -v mongo-data:/data/db mongo:7
O con servicio nativo:
sudo systemctl start mongod

Backend
cd server
cp .env.example .env  # si hay ejemplo, si no crea el .env como arriba
npm install
npm run dev
# → "MongoDB conectado ..." y "API escuchando en http://127.0.0.1:5000"


Frontend (en otra terminal)
cd task-manager    # raíz del proyecto (asegúrate de estar arriba de /server)
cp .env.example .env  # si hay ejemplo, si no crea el .env como arriba
npm install
npm run dev
# → Vite on http://localhost:5173


Prueba
- Abre http://localhost:5173
- Crea/edita/elimina tareas en la UI
- Verifica en Compass: DB task_manager → colección tasks
