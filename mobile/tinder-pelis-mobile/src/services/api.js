// src/services/api.js
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.68.59:8000"; // 👈 LAN

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try { payload = await res.json(); } catch {}

  if (!res.ok) {
    const msg = payload?.error || payload?.detail || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return payload;
}

export function post(path, body) {
  return request(path, { method: "POST", body });
}
