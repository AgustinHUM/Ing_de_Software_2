import axios from "axios";

export const API_URL = "http://192.168.1.9:5050"; // Local server

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});


function normalizeAxiosError(error) {
  if (error.response) {
    const data = error.response.data ?? {};
    const msg = data.error || data.detail || `HTTP ${error.response.status}`;
    return new Error(msg);
  }

  if (error.request) {
    if (error.code === "ECONNABORTED") return new Error("Request timeout");
    return new Error("No response from server");
  }

  return new Error(error.message || "Request error");
}

/*
request wrapper generico
 - path: string ("/movies")
 - { method = "GET", data, params, headers, signal }
 - params son los URL params para GET requests
 */
async function request(path, { method = "GET", data, params, headers = {} } = {}) {
  try {
    const res = await api.request({
      url: path,
      method,
      data,
      params,
      headers
    });

    return res.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
}

export function post(path, body, { headers } = {}) {
  return request(path, { method: "POST", data: body, headers });
}

export function get(path, { params, headers } = {}) {
  return request(path, { method: "GET", params, headers });
}

export function getMovies(query,page) {
  return get("/movies", {params:{query:query,page:page}});
}


export function getMovieDetails(movieId) {
  return post("/movies/selected", { movie_id: movieId });
}

