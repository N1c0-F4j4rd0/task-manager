import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      nav("/", { replace: true });
    } catch (e: any) {
      setErr(e?.message || "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <h1 className="h3 fw-bold mb-4">Crear cuenta</h1>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          {err && <div className="alert alert-danger">{err}</div>}
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Nombre</label>
              <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input type="email" className="form-control" autoComplete="username"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Contraseña</label>
              <input type="password" className="form-control" autoComplete="new-password"
                value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Creando..." : "Crear cuenta"}
            </button>
          </form>
          <div className="text-center mt-3">
            <small className="text-muted">
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}