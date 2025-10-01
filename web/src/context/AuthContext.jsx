import { createContext, useContext, useMemo, useState } from "react";
import { getStoredAuth, login as svcLogin, logout as svcLogout } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth()); // {token, user} | null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(email, password) {
    setLoading(true); setError("");
    try {
      const res = await svcLogin(email, password);
      setAuth(res);
      return res;
    } catch (e) {
      setError(e.message || "Error al iniciar sesión");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    svcLogout();
    setAuth(null);
  }

  const value = useMemo(() => ({ auth, loading, error, login, logout }), [auth, loading, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
