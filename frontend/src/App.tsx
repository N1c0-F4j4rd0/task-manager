import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { api as server } from "./services/api";
import type { Task, TaskServer, Priority } from "./types";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import RequireAuth from "./auth/RequireAuth";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";

// Adaptadores servidor ⇄ UI
const fromServer = (t: TaskServer): Task => ({
  id: t.id,
  title: t.title,
  description: t.description || "",
  done: !!t.completed,
  priority: t.priority || "Media",
  dueDate: t.dueDate || "",
  source: "db",
});

const toServer = (t: Task): TaskServer => ({
  id: t.id,
  title: t.title,
  description: t.description || "",
  completed: !!t.done,
  priority: t.priority || "Media",
  dueDate: t.dueDate || "",
});

const isOverdue = (task: Task) => !task.done && task.dueDate && new Date(task.dueDate) < new Date();

function useTaskStore() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    server
      .list()
      .then((rows) => setTasks(rows.map(fromServer)))
      .catch(console.error);
  }, []);

  const actions = {
    async add(task: Omit<Task, "id" | "source">) {
      const created = await server.create(toServer({ ...task, id: "", source: "db" } as Task));
      setTasks((prev) => [fromServer(created), ...prev]);
    },
    async update(id: string, patch: Partial<Task>) {
      const current = tasks.find((t) => String(t.id) === String(id));
      if (!current) return;
      const merged: Task = { ...current, ...patch };
      const updated = await server.update(id, toServer(merged));
      setTasks((prev) => prev.map((t) => (t.id === id ? fromServer(updated) : t)));
    },
    async remove(id: string) {
      await server.remove(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    async toggle(id: string) {
      const current = tasks.find((t) => String(t.id) === String(id));
      if (!current) return;
      const updated = await server.update(id, toServer({ ...current, done: !current.done }));
      setTasks((prev) => prev.map((t) => (t.id === id ? fromServer(updated) : t)));
    },
    clearAll() {
      setTasks([]);
    },
  };

  return { tasks, actions };
}

function AppNavbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-gradient-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <span className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: "32px", height: "32px" }}>
            ✓
          </span>
          Gestor de Tareas
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav ms-auto gap-2 align-items-center">
            <li className="nav-item">
              <Link className="nav-link" to="/">Inicio</Link>
            </li>
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link btn btn-outline-light btn-sm" to="/nueva">+ Nueva Tarea</Link>
                </li>
                <li className="nav-item">
                  <span className="nav-link small opacity-75">{user.email}</span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-light btn-sm" onClick={logout}>Salir</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Ingresar</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-light btn-sm" to="/register">Crear cuenta</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-5">
      <div className="display-6 text-gradient-primary mb-3">No hay tareas</div>
      <p className="mb-4 text-muted">Crea tu primera tarea para comenzar.</p>
      <Link to="/nueva" className="btn btn-primary btn-lg rounded-pill px-4">
        <i className="bi bi-plus-circle me-2"></i>Crear tarea
      </Link>
    </div>
  );
}

function TaskItem({ task, onToggle, onRemove }: { task: Task; onToggle: (id: string) => void; onRemove: (id: string) => void }) {
  const getPriorityClass = (priority: Priority) => {
    switch (priority) {
      case "Alta": return "badge bg-danger";
      case "Media": return "badge bg-warning";
      case "Baja": return "badge bg-info";
      default: return "badge bg-secondary";
    }
  };

  return (
    <div className="card shadow-sm mb-3 border-0 task-card">
      <div className="card-body d-flex align-items-center gap-3 py-3">
        <div className="form-check form-check-lg">
          <input className="form-check-input" type="checkbox" checked={task.done} onChange={() => onToggle(task.id)} title="Marcar como hecha" />
        </div>
        <div className="flex-grow-1">
          <div className="d-flex align-items-center mb-1">
            <Link to={`/tarea/${task.id}`} className={`fw-semibold text-decoration-none me-2 ${task.done ? "text-decoration-line-through text-muted" : "text-dark"}`}>
              {task.title}
            </Link>
            <span className={getPriorityClass(task.priority)}>{task.priority}</span>
          </div>
          <div className="small text-muted">
            <span className="d-inline-block me-3">
              <i className="bi bi-calendar-event me-1"></i>Vence: {task.dueDate || "—"}
            </span>
            {task.source === "db" && <span className="badge bg-light text-dark ms-2">DB</span>}
          </div>
        </div>
        <div className="d-flex gap-2 align-items-center">
          {isOverdue(task) && <span className="badge bg-danger"><i className="bi bi-exclamation-triangle me-1"></i>Vencida</span>}
          {task.done && <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i>Hecha</span>}
          <button className="btn btn-outline-danger btn-sm rounded-circle" onClick={() => onRemove(task.id)} title="Eliminar">
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

function Filters({ query, setQuery, status, setStatus, priority, setPriority }: {
  query: string; setQuery: (v: string) => void;
  status: "all" | "open" | "done" | "overdue"; setStatus: (v: "all" | "open" | "done" | "overdue") => void;
  priority: "all" | Priority; setPriority: (v: "all" | Priority) => void;
}) {
  return (
    <div className="row g-3 align-items-end mb-4">
      <div className="col-md-4">
        <label className="form-label fw-semibold">Buscar</label>
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            className="form-control border-start-0"
            placeholder="Título o descripción"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="col-md-3">
        <label className="form-label fw-semibold">Estado</label>
        <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="all">Todas las tareas</option>
          <option value="open">Pendientes</option>
          <option value="done">Completadas</option>
          <option value="overdue">Vencidas</option>
        </select>
      </div>
      <div className="col-md-3">
        <label className="form-label fw-semibold">Prioridad</label>
        <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
          <option value="all">Todas las prioridades</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
      </div>
      <div className="col-md-2 text-md-end">
        <Link className="btn btn-primary rounded-pill w-100" to="/nueva">
          <i className="bi bi-plus-circle me-1"></i>Nueva
        </Link>
      </div>
    </div>
  );
}

function TaskList({ store }: { store: ReturnType<typeof useTaskStore> }) {
  const { tasks, actions } = store;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "open" | "done" | "overdue">("all");
  const [priority, setPriority] = useState<"all" | Priority>("all");

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchesQuery =
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        (t.description || "").toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        status === "all" ||
        (status === "done" && t.done) ||
        (status === "open" && !t.done) ||
        (status === "overdue" && isOverdue(t));

      const matchesPriority = priority === "all" || t.priority === priority;

      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [tasks, query, status, priority]);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 fw-bold text-dark">Mis Tareas</h1>
        <span className="badge bg-primary rounded-pill">{filtered.length} tareas</span>
      </div>
      <Filters
        query={query}
        setQuery={setQuery}
        status={status}
        setStatus={setStatus}
        priority={priority}
        setPriority={setPriority}
      />
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="task-list">
          {filtered.map((t) => (
            <TaskItem key={t.id} task={t} onToggle={actions.toggle} onRemove={actions.remove} />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskForm({ store }: { store: ReturnType<typeof useTaskStore> }) {
  const { actions } = store;
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Media");
  const [dueDate, setDueDate] = useState("");

  const canSave = title.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    await actions.add({ title: title.trim(), description, priority, dueDate, done: false });
    navigate("/");
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="d-flex align-items-center mb-4">
            <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i>
            </button>
            <h1 className="h4 mb-0 fw-bold">Crear Nueva Tarea</h1>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Título *</label>
                  <input className="form-control form-control-lg" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Preparar presentación" required />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea className="form-control" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe los detalles de tu tarea..." />
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Prioridad</label>
                    <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                      <option>Alta</option>
                      <option>Media</option>
                      <option>Baja</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Fecha límite</label>
                    <input type="date" className="form-control" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                </div>
                <div className="d-flex gap-2 mt-4 pt-3 border-top">
                  <button className="btn btn-primary rounded-pill px-4" type="submit" disabled={!canSave}>
                    <i className="bi bi-check-circle me-1"></i>Guardar
                  </button>
                  <button className="btn btn-outline-secondary rounded-pill px-4" type="button" onClick={() => navigate(-1)}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskDetail({ store }: { store: ReturnType<typeof useTaskStore> }) {
  const { tasks, actions } = store;
  const { id } = useParams();
  const task = tasks.find((t) => String(t.id) === String(id));
  const navigate = useNavigate();

  const [form, setForm] = useState<Task>(() => task || { id: "", title: "", description: "", priority: "Media", dueDate: "", done: false });

  useEffect(() => {
    if (task) setForm(task);
  }, [task]);

  if (!task) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">No se encontró la tarea.</div>
        <button className="btn btn-secondary" onClick={() => navigate("/")}>Volver</button>
      </div>
    );
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await actions.update(task.id, form);
    navigate("/");
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="d-flex align-items-center mb-4">
            <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i>
            </button>
            <h1 className="h4 mb-0 fw-bold">Editar Tarea</h1>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <form onSubmit={onSave}>
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label fw-semibold">Título</label>
                    <input className="form-control form-control-lg" name="title" value={form.title} onChange={onChange} />
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="done" name="done" checked={form.done} onChange={onChange} />
                      <label htmlFor="done" className="form-check-label ms-2 fw-semibold">Completada</label>
                    </div>
                  </div>
                </div>
                <div className="mb-4 mt-4">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea className="form-control" name="description" rows={4} value={form.description} onChange={onChange} />
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Prioridad</label>
                    <select className="form-select" name="priority" value={form.priority} onChange={onChange}>
                      <option>Alta</option>
                      <option>Media</option>
                      <option>Baja</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Fecha límite</label>
                    <input type="date" className="form-control" name="dueDate" value={form.dueDate || ""} onChange={onChange} />
                  </div>
                </div>
                <div className="d-flex gap-2 mt-4 pt-3 border-top">
                  <button className="btn btn-primary rounded-pill px-4" type="submit">
                    <i className="bi bi-check-circle me-1"></i>Guardar cambios
                  </button>
                  <button
                    className="btn btn-outline-danger rounded-pill px-4"
                    type="button"
                    onClick={async () => {
                      if (confirm("¿Eliminar tarea?")) {
                        await actions.remove(task.id);
                        navigate("/");
                      }
                    }}
                  >
                    <i className="bi bi-trash me-1"></i>Eliminar
                  </button>
                  <button className="btn btn-outline-secondary rounded-pill px-4" type="button" onClick={() => navigate(-1)}>
                    Volver
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="h3 mb-4 fw-bold">Acerca de la Aplicación</h1>
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <p className="lead">
                Este gestor de tareas demuestra mejores prácticas en desarrollo frontend con React + TypeScript y una API Express.
              </p>
              <div className="row mt-4">
                <div className="col-md-6">
                  <h5 className="fw-semibold mb-3">Características</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Interfaz moderna y responsive</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Persistencia con API propia</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Filtros avanzados y búsqueda</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Diseño con Bootstrap 5</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h5 className="fw-semibold mb-3">Tecnologías</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2"><span className="badge bg-primary me-2">React</span> + TypeScript</li>
                    <li className="mb-2"><span className="badge bg-primary me-2">React Router</span></li>
                    <li className="mb-2"><span className="badge bg-primary me-2">Express</span> + MongoDB</li>
                    <li className="mb-2"><span className="badge bg-primary me-2">Vite</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TaskManagerApp() {
  const store = useTaskStore();
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppNavbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/"
            element={
              <RequireAuth>
                <TaskList store={store} />
              </RequireAuth>
            }
          />
          <Route
            path="/nueva"
            element={
              <RequireAuth>
                <TaskForm store={store} />
              </RequireAuth>
            }
          />
          <Route
            path="/tarea/:id"
            element={
              <RequireAuth>
                <TaskDetail store={store} />
              </RequireAuth>
            }
          />
          <Route path="/about" element={<About />} />
          <Route
            path="*"
            element={
              <div className="container py-5">
                <div className="alert alert-danger">Ruta no encontrada</div>
                <Link to="/" className="btn btn-primary mt-2">Ir al inicio</Link>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
