import { useState } from "react";
import { api } from "../services/api";

export default function Admins() {
  // Crear
  const [createEmail, setCreateEmail] = useState("");
  const [createUsername, setCreateUsername] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  // Eliminar
  const [deleteEmail, setDeleteEmail] = useState("");
  // UI state
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  async function onCreate(e) {
    e.preventDefault();
    setMsg(""); setErr(""); setLoadingCreate(true);
    try {
      const r = await api.post("/admin/create", {
        email: createEmail.trim(),
        username: createUsername.trim(),
        password: createPassword,
      });
      setMsg(r.msg || "Administrador creado");
      setCreateEmail(""); setCreateUsername(""); setCreatePassword("");
    } catch (e) {
      setErr(e.message || "Error creando administrador");
    } finally {
      setLoadingCreate(false);
    }
  }

  async function onDelete(e) {
    e.preventDefault();
    setMsg(""); setErr(""); setLoadingDelete(true);
    try {
      const r = await api.del("/admin/delete", { email: deleteEmail.trim() });
      setMsg(r.msg || "Administrador eliminado");
      setDeleteEmail("");
    } catch (e) {
      setErr(e.message || "Error eliminando administrador");
    } finally {
      setLoadingDelete(false);
    }
  }

  return (
    <>
      <h2 style={{ margin: "0 0 6px" }}>Administradores</h2>
      <p style={{ color: "var(--muted)", margin: "0 0 20px" }}>
        Alta y baja de cuentas de administrador.
      </p>

      {/* Mensajes globales */}
      {msg && (
        <div className="card" style={okBoxStyle}>
          <span style={{ fontWeight: 600 }}>Listo: </span>{msg}
        </div>
      )}
      {err && (
        <div className="card" style={errBoxStyle}>
          <span style={{ fontWeight: 600 }}>Error: </span>{err}
        </div>
      )}

      {/* Grid responsive como en Dashboard */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))" }}>
        {/* Crear administrador */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span>➕</span><h3 style={{ margin: 0 }}>Crear administrador</h3>
          </div>

          <form onSubmit={onCreate} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={labelSpanStyle}>Email</span>
              <input
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="admin@ejemplo.com"
                required
                style={inputStyle}
                autoComplete="off"
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={labelSpanStyle}>Nombre de usuario</span>
              <input
                value={createUsername}
                onChange={(e) => setCreateUsername(e.target.value)}
                placeholder="Nombre"
                required
                style={inputStyle}
                autoComplete="off"
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={labelSpanStyle}>Contraseña temporal</span>
              <input
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
                autoComplete="new-password"
              />
            </label>

            <button
              type="submit"
              disabled={loadingCreate}
              style={{
                ...primaryBtnStyle,
                opacity: loadingCreate ? .7 : 1,
                cursor: loadingCreate ? "not-allowed" : "pointer"
              }}
            >
              {loadingCreate ? "Creando..." : "Crear"}
            </button>

            <p style={{ fontSize: 12, opacity: .7, margin: 0 }}>
              * No se puede crear/eliminar el root admin ni eliminarte a vos mismo.
            </p>
          </form>
        </div>

        {/* Eliminar administrador */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span>🗑️</span><h3 style={{ margin: 0 }}>Eliminar administrador</h3>
          </div>

          <form onSubmit={onDelete} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={labelSpanStyle}>Email del administrador</span>
              <input
                type="email"
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
                placeholder="admin@ejemplo.com"
                required
                style={inputStyle}
                autoComplete="off"
              />
            </label>

            <button
              type="submit"
              disabled={loadingDelete}
              style={{
                ...primaryBtnStyle,
                opacity: loadingDelete ? .7 : 1,
                cursor: loadingDelete ? "not-allowed" : "pointer"
              }}
            >
              {loadingDelete ? "Eliminando..." : "Eliminar"}
            </button>

            <p style={{ fontSize: 12, opacity: .7, margin: 0 }}>
              * La cuenta quedará marcada como eliminada.
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

/* === estilos consistentes con Login/Dashboard === */
const labelSpanStyle = { fontSize: 12, opacity: .8 };

const inputStyle = {
  background: "var(--input, #0f0f12)",
  color: "var(--text)",
  border: "1px solid var(--input-border, #2a2a2f)",
  borderRadius: 12,
  outline: "none",
  padding: "12px 14px",
};

const primaryBtnStyle = {
  background: "var(--accent, #f5a623)",
  color: "#000",
  border: "none",
  borderRadius: 12,
  padding: "12px 14px",
  fontWeight: 700
};

const okBoxStyle = {
  marginBottom: 16,
  color: "#b6ffcf",
  background: "rgba(0,255,140,.08)",
  border: "1px solid rgba(0,255,140,.25)",
  borderRadius: 12,
  padding: "10px 12px",
  fontSize: 13
};

const errBoxStyle = {
  marginBottom: 16,
  color: "#ffb3b3",
  background: "rgba(255,0,0,.08)",
  border: "1px solid rgba(255,0,0,.25)",
  borderRadius: 12,
  padding: "10px 12px",
  fontSize: 13
};