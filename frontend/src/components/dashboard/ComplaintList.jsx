import { useState } from "react";
import { categoryLabel, relTime, shortId } from "../officer/officerConfig.js";
import { GROUPS, stageOf } from "./statusConfig.js";

const SHOWN = 3; // how many to show before "Show all"
const chip = "inline-flex max-w-full items-center rounded-full bg-[#eef2ff] px-2.5 py-0.5 text-[0.7rem] font-semibold text-[#3a3fb0] [overflow-wrap:anywhere]";

// One plain-words line about where the complaint is, using the saved dates.
function updateText(c) {
  switch (c.status) {
    case "submitted":    return `Received · ${relTime(c.createdAt)}`;
    case "under_review": return `An officer has reviewed it · ${relTime(c.updatedAt)}`;
    case "assigned":     return `A field worker has been assigned · ${relTime(c.assignedAt ?? c.updatedAt)}`;
    case "in_progress":  return `Work has started · ${relTime(c.startedAt ?? c.updatedAt)}`;
    case "resolved":     return `Resolved · ${relTime(c.resolvedAt ?? c.updatedAt)}`;
    default:             return `Updated · ${relTime(c.updatedAt)}`;
  }
}

function Box({ children, tone = "soft" }) {
  return (
    <div role={tone === "error" ? "alert" : undefined} className={`rounded-[20px] bg-white/90 p-5 text-center text-[0.86rem] ${tone === "error" ? "text-[#c4284d]" : "text-[#5b7396]"}`}>
      {children}
    </div>
  );
}

export default function ComplaintList({ complaints, filter, hasAny, loading, error, onRetry }) {
  const [expanded, setExpanded] = useState(false);
  const title = filter === "all" ? "Recent complaints" : `${GROUPS[filter].label} complaints`;
  const rows = expanded ? complaints : complaints.slice(0, SHOWN);

  let body;
  if (loading) {
    body = <Box>Loading your complaints…</Box>;
  } else if (error) {
    body = (
      <Box tone="error">
        {error}
        <button type="button" onClick={onRetry} className="mt-3 block w-full cursor-pointer rounded-full bg-[#eef5ff] px-4 py-2 font-semibold text-[#1f55b8] hover:bg-[#dfeaff]">
          Try again
        </button>
      </Box>
    );
  } else if (complaints.length === 0) {
    body = <Box>{hasAny ? "No complaints in this group right now." : "No complaints yet. Spotted a problem? Tell us on the right. 🙌"}</Box>;
  } else {
    body = (
      <div className="flex flex-col gap-2.5">
        {rows.map((c) => {
          const stage = stageOf(c.status);
          const g = GROUPS[stage.group];
          const dept = c.departmentId && typeof c.departmentId === "object" ? c.departmentId.name : "";

          return (
            <article
              key={c._id}
              data-id={c._id}
              // minmax(0,1fr) lets the text shrink, so the status tag always stays inside the card
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 rounded-[20px_20px_20px_8px] bg-white/90 px-4 py-3 shadow-[0_6px_18px_rgba(47,111,184,0.12)] max-[420px]:grid-cols-1"
            >
              <div className="min-w-0">
                <div className="line-clamp-2 text-[0.88rem] font-semibold [overflow-wrap:anywhere]">{c.description}</div>
                <div className="mt-0.5 text-[0.72rem] text-[#5b7396] [overflow-wrap:anywhere]">
                  {shortId(c._id)} · 📍 {c.location || "No location given"}
                </div>
              </div>

              <span className={`self-start whitespace-nowrap rounded-full px-[11px] py-[3px] text-[0.7rem] font-semibold max-[420px]:order-first max-[420px]:justify-self-start ${g.badge}`}>
                {stage.tag}
              </span>

              {(c.category || dept) && (
                <div className="col-span-full mt-1.5 flex flex-wrap gap-1.5">
                  {c.category && <span className={chip}>{categoryLabel(c.category)}</span>}
                  {dept && <span className={chip}>{dept}</span>}
                </div>
              )}

              <div className="col-span-full mt-2 flex gap-1" aria-label={`Progress: step ${stage.step} of 5`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <i key={n} style={{ background: n <= stage.step ? g.color : "#e2ecf8" }} className="h-[5px] flex-1 rounded" />
                ))}
              </div>
              <div className="col-span-full mt-1 text-[0.72rem] text-[#5b7396]">{updateText(c)}</div>
            </article>
          );
        })}

        {complaints.length > SHOWN && (
          <button type="button" onClick={() => setExpanded((v) => !v)} className="cursor-pointer self-start rounded-full bg-white/90 px-4 py-1.5 text-[0.78rem] font-semibold text-[#1f55b8] hover:bg-white">
            {expanded ? "Show fewer" : `Show all ${complaints.length}`}
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="mb-2.5 mt-3.5 flex items-baseline justify-between">
        <h2 className="text-[1.05rem] font-bold">{title}</h2>
        {!loading && !error && hasAny && (
          <span className="text-[0.76rem] text-[#5b7396]">{complaints.length} complaint{complaints.length === 1 ? "" : "s"}</span>
        )}
      </div>
      {body}
    </>
  );
}
