// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const baseStyle = {
  display: "block",
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: "inherit",
  fontSize: 16,         // 👈 mismo tamaño para links y botón
  lineHeight: 1.2,
  transition: "background .2s",
  fontWeight: 500
};

const activeStyle = {
  background: "linear-gradient(90deg, var(--grad-start), var(--grad-end))",
  color: "#111",
  fontWeight: 700,
};

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        width: 200,
        background: "#131219",
        borderRight: "1px solid var(--border)",
        padding: 20,
        display: "flex",          // 👈 usamos flex columna
        flexDirection: "column",  // para poder empujar el botón abajo
      }}
    >
      <h3 style={{ margin: "1px 8px 16px", fontWeight: 700, fontSize: 30 }}>Admin</h3>

      <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <NavLink
          end
          to="/"
          style={({ isActive }) => ({
            ...baseStyle,
            ...(isActive ? activeStyle : {}),
          })}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/logs"
          style={({ isActive }) => ({
            ...baseStyle,
            ...(isActive ? activeStyle : {}),
          })}
        >
          Logs
        </NavLink>

        <NavLink
          to="/movies"
          style={({ isActive }) => ({
            ...baseStyle,
            ...(isActive ? activeStyle : {}),
          })}
        >
          Películas
        </NavLink>
      </nav>

      {/* Botón fijo abajo */}
      <button
        onClick={logout}
        style={{
          ...baseStyle,                      // 👈 mismo estilo de fuente que links
          marginTop: "auto",                 // 👈 empuja el botón al fondo
          background: "var(--accent, #f5a623)",
          color: "#000",
          border: "none",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Cerrar sesión
      </button>
    </aside>
  );
}
