import axios from "axios";

export const API_URL = "http://192.168.68.63:5050"; // Local server

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
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


export function getMovieDetails(movieId, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return get('/movies/detailsScreen', {params:{movieId}, headers });
}


// Crea un grupo y devuelve { group_join_id }
export function createGroup(groupName, token) {
  return post('/groups', { group_name: groupName }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Se une a un grupo con el código y devuelve { message }
export function joinGroup(groupJoinId, token) {
  return post('/groups/join', { group_join_id: groupJoinId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getUserGroups(token) {
  return request('/groups', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}
export function saveForm(data, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return post("/saveUserForm", data, { headers });
}
export function showUserForm() {
  return get("/showUserForm");
}


export function getGroupUsersById(groupId, token) {
  return get('/groups/users', {
    params: { group_id: groupId },
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function rateMovie(movieId, rating, token) {
  return post('/seen_movies/rate_movie', { movie_id: movieId, rating }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

  export function toFavorite(movieId,action, token) {
  return post('/user/to_favorite', { movie_id: movieId,action: action }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getSeenMovies(token) {
  return get('/seen_movies/get_seen_movies', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getUserRating(movie_id, token) {
  return get('/seen_movies/get_user_rating', {
    headers: { Authorization: `Bearer ${token}` },
    params: { movie_id }
  });
}
export function getFavourites(token) {
  return get('/user/favorites', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
