import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Logs from "./pages/Logs";
import Movies from "./pages/Movies";
import Login from "./pages/Login";
import ProtectedLayout from "./layout/ProtectedLayout";
import { AuthProvider } from "./context/AuthContext";
import Admins from "./pages/Admins";

export default function App() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<Login />} />

      {/* Protegidas */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admins" element={<Admins />} />

        {/* <Route path="/logs" element={<Logs />} /> */}
        {/* <Route path="/movies" element={<Movies />} /> */}
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}
