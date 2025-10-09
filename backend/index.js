const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// store simple en memoria (reemplazar por DB luego)
let tasks = [];

// Listar tareas
app.get('/api/tasks', (req, res) => res.json(tasks));

// Crear tarea
app.post('/api/tasks', (req, res) => {
  const id = Date.now().toString();
  const task = { id, ...req.body };
  tasks.push(task);
  res.status(201).json(task);
});

// Actualizar tarea
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  tasks[idx] = { ...tasks[idx], ...req.body };
  res.json(tasks[idx]);
});

// Eliminar
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(t => t.id !== id);
  res.json({ message: 'deleted' });
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));