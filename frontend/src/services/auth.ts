// src/services/auth.ts
const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

let accessToken: string | null = null;

type User = { id: string; name?: string; email: string; role?: string };

export function getAccessToken() {
  return accessToken;
}
export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function json<T>(res: Response): Promise<T> {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json() as Promise<T>;
  // arroja un mensaje legible cuando no viene JSON
  const text = await res.text();
  throw new Error(text || `HTTP ${res.status}`);
}

/** Intenta refrescar usando cookie httpOnly */
export async function refreshAccessToken(): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include", // IMPORTANTE para enviar cookie
  });
  if (!res.ok) throw new Error("No se pudo refrescar sesión");
  const data = await json<{ accessToken: string }>(res);
  setAccessToken(data.accessToken);
  return data.accessToken;
}

/** Wrapper de fetch que añade Bearer y hace 1 reintento tras refresh */
export async function fetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}) {
  const withAuth = (token: string | null): RequestInit => ({
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: init.credentials ?? "include", // para CORS + cookies en same-site
  });

  let res = await fetch(input, withAuth(getAccessToken()));
  if (res.status === 401) {
    try {
      await refreshAccessToken();
      res = await fetch(input, withAuth(getAccessToken()));
    } catch {
      // queda 401
    }
  }
  return res;
}

// ==== Endpoints Auth ==== //

export async function register(payload: { name?: string; email: string; password: string }) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await json<{ user: User; accessToken: string }>(res);
  setAccessToken(data.accessToken);
  return data;
}

export async function login(payload: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await json<{ user: User; accessToken: string }>(res);
  setAccessToken(data.accessToken);
  return data;
}

export async function logout() {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  setAccessToken(null);
}
