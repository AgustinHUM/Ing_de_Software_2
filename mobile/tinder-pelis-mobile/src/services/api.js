// src/services/api.js
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.68.56:5050"; // Local server

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
  
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    let payload = null;
    try { payload = await res.json(); } catch {}

    if (!res.ok) {
      const msg = payload?.error || payload?.detail || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return payload;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

export function post(path, body) {
  return request(path, { method: "POST", body });
}

export function get(path) {
  return request(path, { method: "GET" });
}

export function getMovies() {
  return get("/movies");
}

export function getMovieDetails(movieId) {
  return post("/movies/selected", { movie_id: movieId });
}
