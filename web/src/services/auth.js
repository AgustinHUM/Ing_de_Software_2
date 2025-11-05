import { api, setStoredAuth, clearStoredAuth, getStoredAuth } from "./api";

const ADMIN_LOGIN_PATH = "/admin/login";
const BYPASS = import.meta.env.VITE_BYPASS_AUTH === "1";

export async function adminLogin(email, password) {
  try {
    const data = await api.post(ADMIN_LOGIN_PATH, { email, password });
    const auth = {
      user: { name: data.nombre_cuenta, email, isAdmin: true },
      tokens: {
        id_token: data.id_token,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      },
    };
    setStoredAuth(auth);
    return auth;
  } catch (e) {
    if (BYPASS) {
      const auth = {
        user: { name: "Admin Dev", email: email || "admin@dev.local", isAdmin: true },
        tokens: { id_token: "dev.id", access_token: "dev.access", refresh_token: "dev.refresh" },
      };
      setStoredAuth(auth);
      return auth;
    }
    throw e;
  }
}

export function logoutAuth() {
  clearStoredAuth();
}

export function getAuth() {
  return getStoredAuth();
}