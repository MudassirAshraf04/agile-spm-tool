import { useState } from "react";
import api from "../src/services/api";

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [form,       setForm]       = useState({
    name: "", email: "", password: "", role: "developer",
  });

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Email and password are required."); return;
    }
    setLoading(true);
    try {
      const data = isRegister
        ? await api.auth.register(form)
        : await api.auth.login({ email: form.email, password: form.password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify({ name: data.name, email: data.email, role: data.role }));
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--surface)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 20px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52,
            background: "var(--accent)",
            borderRadius: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 700, color: "#fff",
            margin: "0 auto 14px",
          }}>AC</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>AgileCase</div>
          <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>
            SPM Tool — Muhammad Mudassir
          </div>
        </div>

        {/* Card */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 4 }}>
            {isRegister ? "Create account" : "Welcome back"}
          </div>
          <div className="card-sub" style={{ marginBottom: 20 }}>
            {isRegister ? "Fill in your details to get started" : "Sign in to your workspace"}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "var(--red-bg)",
              border: "1px solid rgba(240,101,101,.2)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              color: "var(--red)",
              marginBottom: 14,
            }}>
              {error}
            </div>
          )}

          {/* Name (register only) */}
          {isRegister && (
            <div style={{ marginBottom: 12 }}>
              <div className="inp-label">Full Name</div>
              <input
                className="inp"
                placeholder="Muhammad Mudassir"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ width: "100%" }}
              />
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 12 }}>
            <div className="inp-label">Email</div>
            <input
              className="inp"
              type="email"
              placeholder="mudassir@agilecase.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ width: "100%" }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 12 }}>
            <div className="inp-label">Password</div>
            <input
              className="inp"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{ width: "100%" }}
            />
          </div>

          {/* Role (register only) */}
          {isRegister && (
            <div style={{ marginBottom: 16 }}>
              <div className="inp-label">Role</div>
              <select
                className="inp"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={{ width: "100%" }}
              >
                <option value="developer">Developer</option>
                <option value="scrum_master">Scrum Master</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {/* Submit */}
          <button
            className="tbtn primary"
            style={{ width: "100%", justifyContent: "center", padding: "11px", marginBottom: 12 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </button>

          {/* Toggle */}
          <div style={{ textAlign: "center", fontSize: 13, color: "var(--text3)" }}>
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <span
              style={{ color: "var(--accent2)", cursor: "pointer", fontWeight: 600 }}
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
            >
              {isRegister ? "Sign in" : "Register"}
            </span>
          </div>
        </div>

        {/* Demo hint */}
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--text3)", marginTop: 16 }}>
          Demo: mudassir@agilecase.com / password123
        </div>
      </div>
    </div>
  );
}