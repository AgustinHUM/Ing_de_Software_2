// Sidebar.jsx
import { NavLink } from "react-router-dom";

const baseStyle = {
  display: "block",
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: "inherit",
  fontWeight: 500,
  transition: "background .2s",
};

const activeStyle = {
  background: "linear-gradient(90deg, var(--grad-start), var(--grad-end))",
  color: "#111",
  fontWeight: 600,
};

export default function Sidebar() {
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
        padding: 16,
      }}
    >
      <h3 style={{ margin: "6px 8px 16px", fontWeight: 800, fontSize: 30 }}>Admin</h3>
      <nav style={{ display: "grid", gap: 8 }}>
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
    </aside>
  );
}
