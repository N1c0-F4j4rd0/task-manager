import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      const to = loc.state?.from?.pathname || "/";
      nav(to, { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <h1 className="h3 fw-bold mb-4">Iniciar sesión</h1>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          {err && <div className="alert alert-danger">{err}</div>}
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input type="email" className="form-control" autoComplete="username"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Contraseña</label>
              <input type="password" className="form-control" autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
          <div className="text-center mt-3">
            <small className="text-muted">
              ¿No tienes cuenta? <Link to="/register">Crea una</Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}