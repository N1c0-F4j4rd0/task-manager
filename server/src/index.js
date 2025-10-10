import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/task_manager";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// routes
import tasksRouter from "./routes/tasks.js";
app.use("/api/tasks", tasksRouter);

// connect & start
mongoose
  .connect(MONGODB_URI, { dbName: undefined }) // ya incluye /task_manager
  .then(() => {
    console.log("MongoDB conectado:", MONGODB_URI);
    app.listen(PORT, () => console.log(`API escuchando en http://127.0.0.1:${PORT}`));
  })
  .catch((err) => {
    console.error("Error al conectar a MongoDB:", err);
    process.exit(1);
  });
