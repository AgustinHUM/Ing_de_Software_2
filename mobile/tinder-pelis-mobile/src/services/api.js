import axios from "axios";

export const API_URL = "http://172.20.10.10:5050"; // Local server

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
  return get('/movies/detailsScreen', {params:{movie_id:movieId}, headers });
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

// Sale de un grupo con el groupId y devuelve { id, name, members }
export function leaveGroup(groupId, token) {
  // server expects "group_join_id" (join code = internalId * 7 + 13)
  const joinCode = Number(groupId) * 7 + 13;
  return post('/groups/leave', { group_join_id: joinCode }, {
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
export function homeMovies(token) {
 return get('/home/movies', {headers: { Authorization: `Bearer ${token}` }});
}

export function getUserInfo(token) {
  return get('/user', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateUserInfo(data, token) {
  return post('/user/update', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}


// Match - Optimized endpoints
export function create_match_session(group_id, token) {
  return post('/match/create_session', { group_id }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function joinMatchSession(sessionId, genres, token) {
  return post('/match/join_session', 
    { session_id: sessionId, genres }, 
    { headers: { Authorization: `Bearer ${token}` }}
  );
}

export function startMatchSession(sessionId, token) {
  return post('/match/start_matching', 
    { session_id: sessionId }, 
    { headers: { Authorization: `Bearer ${token}` }}
  );
}

export function submitAllVotes(sessionId, votes, token) {
  return post('/match/submit_votes', 
    { session_id: sessionId, votes }, 
    { headers: { Authorization: `Bearer ${token}` }}
  );
}

export function endMatchSession(sessionId, token) {
  return post('/match/end_session', 
    { session_id: sessionId }, 
    { headers: { Authorization: `Bearer ${token}` }}
  );
}

export function getMatchSessionStatus(sessionId, token) {
  return get(`/match/session_status/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function getGroupMatchSession(groupId, token) {
  return get(`/match/group_session/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Legacy matching endpoints (now redirected to /match/* endpoints)
export function createMatchingSession(groupId, token) {
  return create_match_session(groupId, token);
}

export function joinMatchingSession(sessionId, genres, token) {
  return joinMatchSession(sessionId, genres, token);
}

export function getSessionStatus(sessionId, token) {
  return getMatchSessionStatus(sessionId, token);
}

export function getGroupSession(groupId, token) {
  return getGroupMatchSession(groupId, token);
}

export function startMatching(sessionId, token) {
  return startMatchSession(sessionId, token);
}
