// src/auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout, setAccessToken, refreshAccessToken } from "../services/auth";

type User = { id: string; name?: string; email: string; role?: string };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, intenta obtener un access token nuevo si hay cookie de refresh
  useEffect(() => {
    (async () => {
      try {
        const token = await refreshAccessToken(); // si falla, no hay sesión
        if (token) {
          // opcional: llamar /me para datos de usuario
          // aquí solo marcamos "logueado" sin datos adicionales
          setUser((u) => u ?? { id: "me", email: "sesion@activa" });
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const { user, accessToken } = await apiLogin({ email, password });
        setUser(user);
        setAccessToken(accessToken);
      },
      async register(name, email, password) {
        const { user, accessToken } = await apiRegister({ name, email, password });
        setUser(user);
        setAccessToken(accessToken);
      },
      async logout() {
        await apiLogout();
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
