// src/services/auth.js
const FAKE_USER = { email: "admin@movies.app", password: "admin123", name: "Admin" };
const STORAGE_KEY = "auth:v1";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function login(email, password) {
  await delay(500); // simula latencia
  if (email === FAKE_USER.email && password === FAKE_USER.password) {
    const auth = { token: "mock-token", user: { name: FAKE_USER.name, email } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    return auth;
  }
  throw new Error("Credenciales inválidas");
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
