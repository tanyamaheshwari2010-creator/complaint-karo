// Your database has five statuses. Citizens see them as three groups
// (the same three as the cards): Pending, In progress, Resolved.
export const GROUPS = {
  pending:  { label: "Pending",     color: "#e0a100", badge: "bg-[#fff3d1] text-[#8a5a00]" },
  progress: { label: "In progress", color: "#3b9be8", badge: "bg-[#dcebff] text-[#1d4ea0]" },
  resolved: { label: "Resolved",    color: "#1fa463", badge: "bg-[#d9f6e4] text-[#17693a]" },
};

// step = how far along the 5-step progress bar the complaint is
export const STAGES = {
  submitted:    { group: "pending",  step: 1, tag: "Received" },
  under_review: { group: "pending",  step: 2, tag: "Being reviewed" },
  assigned:     { group: "progress", step: 3, tag: "Assigned" },
  in_progress:  { group: "progress", step: 4, tag: "Work started" },
  resolved:     { group: "resolved", step: 5, tag: "Resolved" },
};

export const stageOf = (status) => STAGES[status] ?? STAGES.submitted;
export const groupOf = (status) => stageOf(status).group;
