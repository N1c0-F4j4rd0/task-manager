import { fetchWithAuth } from "./auth";

const RAW = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";
const API_URL = RAW.replace(/\/+$/, "");

export type TaskServer = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: "Alta" | "Media" | "Baja";
  dueDate?: string;
};

export const api = {
  async list(): Promise<TaskServer[]> {
    const res = await fetchWithAuth(`${API_URL}/api/tasks`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async create(task: TaskServer): Promise<TaskServer> {
    const res = await fetchWithAuth(`${API_URL}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async update(id: string, task: TaskServer): Promise<TaskServer> {
    const res = await fetchWithAuth(`${API_URL}/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async remove(id: string): Promise<void> {
    const res = await fetchWithAuth(`${API_URL}/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
  },
};
