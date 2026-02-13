import { API_BASE } from "./constants";

const QUEUE_KEY = "acl_offline_queue_v1";

function loadQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function queueWrite(path, options) {
  const queue = loadQueue();
  queue.push({ path, method: options.method, body: options.body || null, created_at: Date.now() });
  saveQueue(queue);
}

async function rawRequest(path, options = {}) {
  const userId = localStorage.getItem("acl_user_id");
  const headers = {
    "Content-Type": "application/json",
    ...(userId ? { "x-user-id": userId } : {}),
    ...(options.headers || {})
  };
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

async function request(path, options = {}, { queueable = false } = {}) {
  try {
    const res = await rawRequest(path, options);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "API fout");
    }
    return res.json();
  } catch (e) {
    const method = (options.method || "GET").toUpperCase();
    const offlineLike = !navigator.onLine || /Failed to fetch/i.test(String(e?.message || ""));
    if (queueable && offlineLike && ["POST", "PUT", "DELETE"].includes(method)) {
      queueWrite(path, options);
      return { queued: true };
    }
    throw e;
  }
}

export async function syncQueuedWrites() {
  const queue = loadQueue();
  if (!queue.length || !navigator.onLine) return { synced: 0, remaining: queue.length };

  const remaining = [];
  let synced = 0;

  for (const item of queue) {
    try {
      const res = await rawRequest(item.path, { method: item.method, body: item.body });
      if (!res.ok) {
        remaining.push(item);
      } else {
        synced += 1;
      }
    } catch {
      remaining.push(item);
    }
  }

  saveQueue(remaining);
  return { synced, remaining: remaining.length };
}

export const api = {
  register: (name, pin) => request("/api/auth/register", { method: "POST", body: JSON.stringify({ name, pin }) }),
  login: ({ pin, name, user_id }) => request("/api/auth/login", { method: "POST", body: JSON.stringify({ pin, name, user_id }) }),

  exercises: () => request("/api/exercises"),
  createExercise: (payload) => request("/api/exercises", { method: "POST", body: JSON.stringify(payload) }, { queueable: true }),
  deleteExercise: (id) => request(`/api/exercises/${id}`, { method: "DELETE" }, { queueable: true }),
  reorderExercises: (order) => request("/api/exercises/reorder", { method: "PUT", body: JSON.stringify({ order }) }, { queueable: true }),
  updateExercise: (id, payload) => request(`/api/exercises/${id}`, { method: "PUT", body: JSON.stringify(payload) }, { queueable: true }),

  updateName: (name) => request("/api/settings/name", { method: "PUT", body: JSON.stringify({ name }) }, { queueable: true }),
  updatePin: (current_pin, new_pin) => request("/api/settings/pin", { method: "PUT", body: JSON.stringify({ current_pin, new_pin }) }),

  createSession: () => request("/api/sessions", { method: "POST" }, { queueable: true }),
  sessions: () => request("/api/sessions"),
  finishSession: (id, payload) => request(`/api/sessions/${id}`, { method: "PUT", body: JSON.stringify(payload) }, { queueable: true }),
  logSessionExercise: (id, payload) => request(`/api/sessions/${id}/exercises`, { method: "POST", body: JSON.stringify(payload) }, { queueable: true }),

  addHealthLog: (payload) => request("/api/health-log", { method: "POST", body: JSON.stringify(payload) }, { queueable: true }),
  healthLog: () => request("/api/health-log"),

  share: (token) => request(`/api/share/${token}`),
  progress: (exerciseId) => request(`/api/progress/${exerciseId}`)
};
