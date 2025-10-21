import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ["Alta", "Media", "Baja"], default: "Media" },
    dueDate: { type: String, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, // 👈 dueño
  },
  { timestamps: true }
);

// para devolver "id" en lugar de "_id"
TaskSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

export default mongoose.model("Task", TaskSchema);