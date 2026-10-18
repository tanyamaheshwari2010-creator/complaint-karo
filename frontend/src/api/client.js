// One place for every call to your backend.
export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

/* ---------- token helpers ---------- */
// "Remember me" ticked  -> localStorage   (survives closing the browser)
// "Remember me" unticked -> sessionStorage (cleared when the tab closes)
export const getToken = () =>
  localStorage.getItem("token") ?? sessionStorage.getItem("token");

export function saveToken(token, remember) {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
}

/* ---------- base request ---------- */
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
    err.status = res.status; // lets the pages react to 401 (logged out) and 403 (not allowed)
    throw err;
  }
  return data;
}

/* ---------- endpoints (change the paths to match your backend) ---------- */
export const api = {
  login: (body) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),

  register: (body) =>
    request("/api/auth/signup", { method: "POST", body: JSON.stringify(body) }),

  createComplaint: (body) =>
    request("/api/complaints", { method: "POST", body: JSON.stringify(body) }),

  myComplaints: () => request("/api/complaints"),
};
