import { categoryLabel, prettify } from "../officer/officerConfig.js";

// How each status looks for a field worker.
export const STATUS = {
  assigned:    { label: "New",         badge: "bg-[#e3e4ff] text-[#3a3fb0]" },
  in_progress: { label: "In progress", badge: "bg-[#dcebff] text-[#1d4ea0]" },
  resolved:    { label: "Resolved",    badge: "bg-[#d9f6e4] text-[#17693a]" },
};
export const statusInfo = (s) => STATUS[s] ?? { label: prettify(s), badge: "bg-[#e8eef7] text-[#3d5478]" };

// new work first, finished work last
export const ORDER = { assigned: 0, in_progress: 1, resolved: 2 };

// The API is the only source of data. This just makes the shape predictable.
export function normalize(c) {
  const dept = c.departmentId;
  return {
    ...c, // keeps the real _id for the status actions we add later
    categoryText: c.category ? categoryLabel(c.category) : "No category",
    departmentName: dept && typeof dept === "object" ? dept.name ?? "" : "",
  };
}
