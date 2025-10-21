import Task from "../models/Task.js";

// GET /api/tasks
export async function list(req, res) {
  const rows = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(rows);
}

// POST /api/tasks
export async function create(req, res) {
  const { title, description = "", completed = false, priority = "Media", dueDate = "" } = req.body;
  if (!title?.trim()) return res.status(400).json({ message: "title es requerido" });

  const doc = await Task.create({
    title: title.trim(),
    description,
    completed: !!completed,
    priority,
    dueDate,
    user: req.user.id,      // 👈 asociar al dueño
  });

  res.status(201).json(doc);
}

// PUT /api/tasks/:id
export async function update(req, res) {
  const { id } = req.params;
  const patch = req.body ?? {};

  const doc = await Task.findOneAndUpdate(
    { _id: id, user: req.user.id }, // 👈 sólo si es del usuario
    { $set: patch },
    { new: true }
  );
  if (!doc) return res.status(404).json({ message: "No encontrada" });
  res.json(doc);
}

// DELETE /api/tasks/:id
export async function remove(req, res) {
  const { id } = req.params;
  const doc = await Task.findOneAndDelete({ _id: id, user: req.user.id });
  if (!doc) return res.status(404).json({ message: "No encontrada" });
  res.status(204).end();
}
