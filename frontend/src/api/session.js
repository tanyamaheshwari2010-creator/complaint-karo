// Remembers WHO is logged in (name, email, role) so the dashboards can show it.
// It is stored in the same place as the token (see saveToken in client.js).
export const DEFAULT_USER = { name: "Citizen", email: "", role: "" }; // shown until real data arrives

const KEY = "user";
const VISITOR_KEY = "knownVisitor";

// "priya.sharma@gmail.com" -> "Priya Sharma"
const nameFromEmail = (email) =>
  email
    ? email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

// Has this browser logged in before? The home page uses it to choose between
// "Sign up" (new visitor) and "Login" (returning visitor). Logging out does NOT clear it.
export function rememberVisitor() {
  try {
    localStorage.setItem(VISITOR_KEY, "1");
  } catch {
    /* ignore */
  }
}
export function isReturningVisitor() {
  try {
    return localStorage.getItem(VISITOR_KEY) === "1";
  } catch {
    return false;
  }
}

// Where each role lands after login.
export const homePathFor = (role) =>
  ({ complaint_officer: "/officer", field_worker: "/worker" })[role] ?? "/dashboard";

export function saveUser(raw, remember) {
  const email = raw?.email ?? "";
  const user = {
    name: raw?.name ?? raw?.fullName ?? raw?.username ?? (nameFromEmail(email) || DEFAULT_USER.name),
    email,
    role: raw?.role ?? "",
  };
  clearUser();
  (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(user));
  rememberVisitor(); // saveUser runs right after a successful login
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
