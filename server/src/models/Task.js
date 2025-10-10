import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ["Alta", "Media", "Baja"], default: "Media" },
    // guardamos como string YYYY-MM-DD para encajar con el <input type="date">
    dueDate: { type: String, default: "" }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export default mongoose.model("Task", TaskSchema, "tasks");
