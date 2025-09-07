import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Logs from "./pages/Logs";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar fijo a la izquierda */}
        <Sidebar />

        {/* Contenido principal que cambia según la ruta */}
        <main style={{ flex: 1, padding: "1rem" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/logs" element={<Logs />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

