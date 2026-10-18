import { getToken } from "./client.js";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const WORKER = "/api/worker"; // must match: app.use("/api/worker", workerRoutes)

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(data?.message || "Something went wrong. Please try again.");
    err.status = res.status; // 401 = not logged in, 403 = not a field worker, 404/409 = can't do that now
    throw err;
  }
  return data;
}

export const workerApi = {
  // returns { message, complaints: [...] }
  complaints: () => request(`${WORKER}/complaints`),

  // assigned -> in_progress
  // >>> Make this path (and method) match YOUR existing "start work" route <<<
  start: (id) => request(`${WORKER}/complaints/${id}/start`, { method: "PATCH" }),

  // in_progress -> resolved
  resolve: (id) => request(`${WORKER}/complaints/${id}/resolve`, { method: "PATCH" }),
};
