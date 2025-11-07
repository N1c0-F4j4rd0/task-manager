// server/src/index.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/task_manager";

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

// Export for convenience (no harm)
export { app };
