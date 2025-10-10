export type Priority = "Alta" | "Media" | "Baja";

export interface Task {
  id: string;
  title: string;
  description: string;
  done: boolean;           // UI
  priority: Priority;
  dueDate: string;         // YYYY-MM-DD
  source?: "db";
}

export interface TaskServer {
  id: string;
  title: string;
  description?: string;
  completed: boolean;      // API
  priority?: Priority;
  dueDate?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
