// server/src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
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

// Rutas
import authRouter from "./routes/auth.js";
import tasksRouter from "./routes/tasks.js";

app.use("/api/auth", authRouter);
app.use("/api/tasks", tasksRouter);

export default app;
