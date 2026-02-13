import { API_BASE } from "./constants";

async function request(path, options = {}) {
  const userId = localStorage.getItem("acl_user_id");
  const headers = {
    "Content-Type": "application/json",
    ...(userId ? { "x-user-id": userId } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "API fout");
  }
  return res.json();
}

export const api = {
  register: (name, pin) => request("/api/auth/register", { method: "POST", body: JSON.stringify({ name, pin }) }),
  login: ({ pin, name, user_id }) => request("/api/auth/login", { method: "POST", body: JSON.stringify({ pin, name, user_id }) }),
  exercises: () => request("/api/exercises"),
  updateExercise: (id, payload) => request(`/api/exercises/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  updateName: (name) => request("/api/settings/name", { method: "PUT", body: JSON.stringify({ name }) }),
  updatePin: (current_pin, new_pin) => request("/api/settings/pin", { method: "PUT", body: JSON.stringify({ current_pin, new_pin }) }),
  createSession: () => request("/api/sessions", { method: "POST" }),
  sessions: () => request("/api/sessions"),
  finishSession: (id, payload) => request(`/api/sessions/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  logSessionExercise: (id, payload) => request(`/api/sessions/${id}/exercises`, { method: "POST", body: JSON.stringify(payload) }),
  addHealthLog: (payload) => request("/api/health-log", { method: "POST", body: JSON.stringify(payload) }),
  healthLog: () => request("/api/health-log"),
  share: (token) => request(`/api/share/${token}`),
  progress: (exerciseId) => request(`/api/progress/${exerciseId}`)
};
