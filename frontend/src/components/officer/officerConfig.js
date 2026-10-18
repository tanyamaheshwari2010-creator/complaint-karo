// Shared constants and helpers for the officer pages.

// MUST match ALLOWED_CATEGORIES in backend/constants/complaintConstants.js
// (the backend rejects anything that isn't in its list).
export const CATEGORIES = {
  garbage: "Garbage",
  streetlight: "Streetlight",
  water_leak: "Water leakage",
  pothole: "Road / pothole",
  drainage: "Drainage",
  other: "Other",
};

export const prettify = (s) =>
  String(s ?? "").replace(/[_-]+/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export const categoryLabel = (key) => CATEGORIES[key] ?? prettify(key);

export const STATUS = {
  submitted:    { label: "Awaiting review", badge: "bg-[#fff3d1] text-[#8a5a00]" },
  under_review: { label: "Reviewed",        badge: "bg-[#dcebff] text-[#1d4ea0]" },
  assigned:     { label: "Assigned",        badge: "bg-[#e3e4ff] text-[#3a3fb0]" },
  in_progress:  { label: "In progress",     badge: "bg-[#d6f0ff] text-[#0b5e8f]" },
  resolved:     { label: "Resolved",        badge: "bg-[#d9f6e4] text-[#17693a]" },
};
export const statusInfo = (s) => STATUS[s] ?? { label: prettify(s), badge: "bg-[#e8eef7] text-[#3d5478]" };

// Complaints that are out with the field team (assigned, or being worked on).
export const FIELD_STATUSES = ["assigned", "in_progress"];

// The backend only lets officers review/assign complaints in these states.
export const REVIEWABLE = ["submitted", "under_review"];

// The API sometimes returns an id and sometimes a populated { _id, name } object.
export const idOf = (v) => (v && typeof v === "object" ? v._id : v) ?? "";

// Makes every complaint look the same, whatever the endpoint returned.
export function normalize(c, prev) {
  return {
    ...c,
    citizen: c.citizenId?.name ? c.citizenId : prev?.citizen ?? { name: "Citizen", email: "" },
    category: c.category ?? "",
    departmentId: idOf(c.departmentId),
    aiSuggestedDepartmentId: idOf(c.aiSuggestedDepartmentId),
    assignedWorkerId: idOf(c.assignedWorkerId),
  };
}

// What is wrong with the AI result, if anything?
//   "failed" = it failed, or it has been "pending/processing" for 5+ minutes (the job was probably lost)
//   "low"    = it answered, but with low confidence
//   null     = fine (or still working, or the complaint is past the review stage)
export const AI_STUCK_MS = 5 * 60 * 1000;
export function aiProblem(c) {
  if (!REVIEWABLE.includes(c.status)) return null;
  if (c.aiStatus === "failed") return "failed";
  if (c.aiStatus === "pending" || c.aiStatus === "processing") {
    return Date.now() - new Date(c.createdAt) > AI_STUCK_MS ? "failed" : null;
  }
  if (c.aiStatus === "completed" && (c.aiConfidence ?? 0) < 0.6) return "low";
  return null;
}
export const isUnsure = (c) => aiProblem(c) !== null;

export const shortId = (id) => "#" + String(id).slice(-6).toUpperCase();
export const pct = (x) => Math.round((x ?? 0) * 100);
export const confColor = (x) => (x >= 0.8 ? "#1fa463" : x >= 0.6 ? "#e0a100" : "#e0527a");
export const confChip = (x) =>
  x >= 0.8 ? "bg-[#d9f6e4] text-[#17693a]" : x >= 0.6 ? "bg-[#fff3d1] text-[#8a5a00]" : "bg-[#ffe9ee] text-[#c4284d]";

export function relTime(iso) {
  const m = Math.max(1, Math.round((Date.now() - new Date(iso)) / 60000));
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}
