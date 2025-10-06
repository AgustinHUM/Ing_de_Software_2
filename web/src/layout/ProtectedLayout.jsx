import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function ProtectedLayout() {
  const { auth } = useAuth();

  if (!auth) return <Navigate to="/login" replace />;

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
