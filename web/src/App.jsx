import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Logs from "./pages/Logs";
import Movies from "./pages/Movies";

export default function App() {
  return (
    <BrowserRouter>
      <Sidebar />
      <div style={{
        marginLeft: 200,          // 👈 deja espacio igual al ancho del sidebar
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)"
      }}>
        <main style={{ padding: 20 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/movies" element={<Movies />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
