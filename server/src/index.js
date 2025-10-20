import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/task_manager";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// Seguridad base + JSON + Cookies
app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Rate limit sólo para /api/auth
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/auth", authLimiter);

// Rutas AUTH
import authRouter from "./routes/auth.js";
app.use("/api/auth", authRouter);

// Rutas TASKS (se protegerán dentro del router)
import tasksRouter from "./routes/tasks.js";
app.use("/api/tasks", tasksRouter);

// Conectar y arrancar
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB conectado:", MONGODB_URI);
    app.listen(PORT, () => console.log(`API escuchando en http://127.0.0.1:${PORT}`));
  })
  .catch((err) => {
    console.error("Error al conectar a MongoDB:", err);
    process.exit(1);
  });
