import { Router } from "express";
import Task from "../models/Task.js";
import mongoose from "mongoose";
import { requireAuth, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
// GET /api/tasks
router.get("/", async (_req, res) => {
  const docs = await Task.find().sort({ createdAt: -1 }).lean();
  const out = docs.map(d => ({
    id: String(d._id),
    title: d.title,
    description: d.description ?? "",
    completed: !!d.completed,
    priority: d.priority ?? "Media",
    dueDate: d.dueDate ?? "",
    createdAt: d.createdAt,
    updatedAt: d.updatedAt
  }));
  res.json(out);
});

// POST /api/tasks
router.post("/", async (req, res) => {
  const { title, description = "", completed = false, priority = "Media", dueDate = "" } = req.body || {};
  if (!title || !String(title).trim()) return res.status(400).json({ error: "title es requerido" });

  const doc = await Task.create({ title: title.trim(), description, completed: !!completed, priority, dueDate });
  res.status(201).json({
    id: String(doc._id),
    title: doc.title,
    description: doc.description ?? "",
    completed: !!doc.completed,
    priority: doc.priority ?? "Media",
    dueDate: doc.dueDate ?? "",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  });
});

// GET /api/tasks/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "id inválido" });
  const doc = await Task.findById(id).lean();
  if (!doc) return res.status(404).json({ error: "no encontrado" });
  res.json({
    id: String(doc._id),
    title: doc.title,
    description: doc.description ?? "",
    completed: !!doc.completed,
    priority: doc.priority ?? "Media",
    dueDate: doc.dueDate ?? "",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  });
});

// PUT /api/tasks/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "id inválido" });

  const patch = {};
  ["title", "description", "priority", "dueDate"].forEach(k => {
    if (k in req.body) patch[k] = req.body[k];
  });
  if ("completed" in req.body) patch.completed = !!req.body.completed;

  if (!Object.keys(patch).length) return res.status(400).json({ error: "nada para actualizar" });

  const doc = await Task.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
  if (!doc) return res.status(404).json({ error: "no encontrado" });

  res.json({
    id: String(doc._id),
    title: doc.title,
    description: doc.description ?? "",
    completed: !!doc.completed,
    priority: doc.priority ?? "Media",
    dueDate: doc.dueDate ?? "",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  });
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "id inválido" });
  const r = await Task.deleteOne({ _id: id });
  if (r.deletedCount === 0) return res.status(404).json({ error: "no encontrado" });
  res.json({ ok: true });
});

export default router;
