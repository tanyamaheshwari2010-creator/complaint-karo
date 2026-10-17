import { getToken, BASE_URL } from "./client.js";


const OFFICER = "/api/officer"; // change this if your officer router is mounted somewhere else

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
    err.status = res.status; // 401 = not logged in, 403 = not allowed, 409 = state conflict
    throw err;
  }
  return data;
}

export const officerApi = {
  complaints: () => request(`${OFFICER}/complaints`),
  departments: () => request(`${OFFICER}/departments`),
  workers: () => request(`${OFFICER}/workers`),
  review: (id, body) => request(`${OFFICER}/complaints/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  assign: (id, workerId) =>
    request(`${OFFICER}/complaints/${id}/assign-worker`, { method: "PATCH", body: JSON.stringify({ workerId }) }),
};
