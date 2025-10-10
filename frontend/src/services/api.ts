import type { Task, TaskServer } from "../types";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `HTTP ${res.status}`);
  }
  return res.status !== 204 ? (await res.json()) as T : (null as T);
}

export const api = {
  list: () => http<TaskServer[]>("/tasks"),
  create: (payload: TaskServer) => http<TaskServer>("/tasks", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: TaskServer) =>
    http<TaskServer>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: string) => http<{ ok: boolean }>(`/tasks/${id}`, { method: "DELETE" }),
};
