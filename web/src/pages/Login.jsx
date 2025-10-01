import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@movies.app");
  const [password, setPassword] = useState("admin123");
  const [showPass, setShowPass] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch {}
  }

  return (
    <div style={{
      minHeight: "100vh", display: "grid", placeItems: "center",
      background: "var(--bg)", color: "var(--text)"
    }}>
      <div style={{
        width: "100%", maxWidth: 420, background: "var(--panel, #18181b)",
        borderRadius: 16, border: "1px solid var(--panel-border, #2a2a2f)",
        padding: 24, boxShadow: "0 10px 30px rgba(0,0,0,.4)"
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Admin</h1>
        <p style={{ opacity: .8, marginBottom: 18 }}>Ingresá con tu cuenta de administrador.</p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: .8 }}>Email</span>
            <input type="email" value={email} onChange={(e)=> setEmail(e.target.value)}
              placeholder="admin@movies.app" required style={inputStyle}/>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: .8 }}>Contraseña</span>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} value={password}
                onChange={(e)=> setPassword(e.target.value)} placeholder="••••••••" required
                style={{ ...inputStyle, paddingRight: 76 }}/>
              <button type="button" onClick={()=> setShowPass(v=>!v)} style={ghostBtnStyle}>
                {showPass ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </label>

          {error && (
            <div style={{
              background: "rgba(255,0,0,.08)", border: "1px solid rgba(255,0,0,.25)",
              color: "#ffb3b3", borderRadius: 12, padding: "8px 12px", fontSize: 13
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ ...primaryBtnStyle, opacity: loading ? .7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          <p style={{ fontSize: 12, opacity: .6, textAlign: "center", marginTop: 4 }}>
            Demo: <code>admin@movies.app</code> / <code>admin123</code>
          </p>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  background: "var(--input, #0f0f12)", color: "var(--text)",
  border: "1px solid var(--input-border, #2a2a2f)",
  borderRadius: 12, outline: "none", padding: "12px 14px",
};
const primaryBtnStyle = {
  background: "var(--accent, #f5a623)", color: "#000", border: "none",
  borderRadius: 12, padding: "12px 14px", fontWeight: 700
};
const ghostBtnStyle = {
  position: "absolute", right: 6, top: 6, padding: "8px 10px",
  borderRadius: 10, border: "1px solid var(--panel-border, #2a2a2f)",
  background: "transparent", color: "var(--text)", fontSize: 12, cursor: "pointer"
};
