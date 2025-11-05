import React, { createContext, useContext, useMemo, useState } from "react";
import { adminLogin, getAuth, logoutAuth } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getAuth());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(email, password) {          // ✅ existe y es función
    setError("");
    setLoading(true);
    try {
      const a = await adminLogin(email, password); // ✅ llama al servicio
      setAuth(a);
      return a;
    } catch (e) {
      setError(e.message || "Error de autenticación");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    logoutAuth();
    setAuth(null);
  }

  const value = useMemo(() => ({
    auth,
    user: auth?.user || null,
    isAuthenticated: !!auth?.tokens?.access_token,
    setAuth,
    login,                 // ✅ se expone en el contexto
    loading,
    error,
    logout,
  }), [auth, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}