const API_BASE = import.meta.env.DEV
  ? "/api"                                  // dev: usa proxy (sin CORS)
  : (import.meta.env.VITE_API_BASE || "");

const MOCK = import.meta.env.VITE_MOCK_API === "1";

export function getStoredAuth() {
  try {
    const raw = localStorage.getItem("auth:v1");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth) {
  localStorage.setItem("auth:v1", JSON.stringify(auth));
}

export function clearStoredAuth() {
  localStorage.removeItem("auth:v1");
}

/**
 * Elegimos usar el access_token para las llamadas al API.
 * (id_token se usa típicamente para identidad/claims front)
 */
function authHeader() {
  const auth = getStoredAuth();
  if (auth?.tokens?.access_token) {
    return { Authorization: `Bearer ${auth.tokens.access_token}` };
  }
  return {};
}

// --- ⬇⬇⬇ DEV ONLY MOCKS ⬇⬇⬇ ---
function mockResponse(data, status = 200) {
  return Promise.resolve({ ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(data) });
}

function is(path, pattern) {
  return typeof path === "string" && path.startsWith(pattern);
}
// --- ⬆⬆⬆ DEV ONLY MOCKS ⬆⬆⬆ ---

async function request(path, { method = "GET", headers = {}, body } = {}) {
  // 🔧 Mocks de endpoints (solo en dev con flag)
  if (MOCK) {
    // login admin (simula tokens)
    if (is(path, "/admin/login") && method === "POST") {
      return { id_token: "dev.id", access_token: "dev.access", refresh_token: "dev.refresh", nombre_cuenta: "Admin Dev" };
    }
    // dashboard
    if (is(path, "/admin/home/user_count") && method === "GET") {
      return { user_count: 1234 };
    }
    if (is(path, "/admin/home/most_rated_movies") && method === "GET") {
      return { page: 1, per_page: 5, movies: [
        { id: 1, title: "Inception",  avg_rating: 4.7, raing_count: 342 },
        { id: 2, title: "Interstellar", avg_rating: 4.6, raing_count: 298 },
      ]};
    }
    if (is(path, "/admin/home/users_most_favourites") && method === "GET") {
      return { page: 1, per_page: 5, movies: [
        { id: 10, title: "The Dark Knight", fv_count: 512 },
        { id: 11, title: "Whiplash",        fv_count: 401 },
      ]};
    }
    // admins create/delete
    if (is(path, "/admin/create") && method === "POST") {
      return { msg: "Administrator created successfully (MOCK)" };
    }
    if (is(path, "/admin/delete") && method === "DELETE") {
      return { msg: "Administrator deleted successfully (MOCK)" };
    }
  }

  // Flujo real:
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });


  // Leemos texto SIEMPRE para poder mostrar el msg del backend
  const text = await res.text().catch(() => "");
  // Solo limpiamos sesión si NO estamos en los endpoints de login
  const isAuthPath = typeof path === "string" && (path.startsWith("/login") || path.startsWith("/admin/login"));
  if (res.status === 401 && !isAuthPath) {
    clearStoredAuth();
  }
  if (!res.ok) {
    const looksJson = text && text.trim().startsWith("{");
    const msg = looksJson ? (JSON.parse(text).msg || JSON.parse(text).detail || text) : `HTTP ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return text ? JSON.parse(text) : null;
}

export const api = {
  get: (p) => request(p),
  post: (p, b) => request(p, { method: "POST", body: b }),
  del: (p, b) => request(p, { method: "DELETE", body: b }),
};