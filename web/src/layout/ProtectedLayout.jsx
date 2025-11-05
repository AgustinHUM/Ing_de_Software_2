import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

// Si está en producción, bypassa la autenticación
const BYPASS = import.meta.env.VITE_BYPASS_AUTH === "1";

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated && !BYPASS) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Sidebar />
      <div style={{
        marginLeft: 200,
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)"
      }}>
        <main style={{ padding: 20 }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}