// Remembers WHO is logged in (name, email, role) so the dashboards can show it.
// It is stored in the same place as the token (see saveToken in client.js).
export const DEFAULT_USER = { name: "Citizen", email: "", role: "" }; // shown until real data arrives

const KEY = "user";

// "priya.sharma@gmail.com" -> "Priya Sharma"
const nameFromEmail = (email) =>
  email
    ? email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

export function saveUser(raw, remember) {
  const email = raw?.email ?? "";
  const user = {
    name: raw?.name ?? raw?.fullName ?? raw?.username ?? (nameFromEmail(email) || DEFAULT_USER.name),
    email,
    role: raw?.role ?? "",
  };
  clearUser();
  (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(user));
}

export function getUser() {
  try {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
    return raw ? { ...DEFAULT_USER, ...JSON.parse(raw) } : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

export function clearUser() {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
}
