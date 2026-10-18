import { relTime, shortId } from "../officer/officerConfig.js";
import { statusInfo } from "./workerConfig.js";

const chip = "inline-flex max-w-full items-center rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold [overflow-wrap:anywhere]";

const actionBase =
  "mt-2.5 h-10 w-full cursor-pointer rounded-full text-[0.84rem] font-semibold text-white transition focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#2f6fe0]/45 active:scale-[0.985] disabled:cursor-wait disabled:opacity-70";
const TONES = {
  start: `${actionBase} bg-linear-to-br from-[#4b8bf0] to-[#2457c5] shadow-[0_8px_20px_rgba(47,111,224,0.35)] hover:shadow-[0_12px_26px_rgba(47,111,224,0.5)]`,
  resolve: `${actionBase} bg-linear-to-br from-[#34c58a] to-[#16955c] shadow-[0_8px_20px_rgba(31,164,99,0.35)] hover:shadow-[0_12px_26px_rgba(31,164,99,0.5)]`,
};

function Message({ children, tone = "soft" }) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={`rounded-[20px] bg-[#f4f9ff] p-5 text-center text-[0.86rem] ${tone === "error" ? "text-[#c4284d]" : "text-[#5b7396]"}`}
    >
      {children}
    </div>
  );
}

// The button depends on the complaint's CURRENT status (from the database).
function Actions({ c, busy, onStart, onResolve }) {
  if (c.status === "assigned") {
    return (
      <button type="button" disabled={busy} onClick={() => onStart(c._id)} className={TONES.start}>
        {busy ? "Starting…" : "Start Work"}
      </button>
    );
  }
  if (c.status === "in_progress") {
    return (
      <button type="button" disabled={busy} onClick={() => onResolve(c._id)} className={TONES.resolve}>
        {busy ? "Resolving…" : "Mark Resolved"}
      </button>
    );
  }
  if (c.status === "resolved") {
    return (
      <p className="mt-2.5 rounded-full bg-[#d9f6e4] px-3 py-2 text-center text-[0.78rem] font-semibold text-[#17693a]">
        ✓ Work completed{c.resolvedAt ?? c.updatedAt ? ` · ${relTime(c.resolvedAt ?? c.updatedAt)}` : ""}
      </p>
    );
  }
  return null; // unknown status: no actions
}

/**
 * Every card keeps the complaint's real _id (data-id, key, and the id passed to onStart/onResolve).
 * busyId        = the complaint whose request is running right now
 * actionError   = { id, message } for the last failed action
 */
export default function AssignmentList({
  complaints, selectedId, onSelect, loading, error, onRetry, isFiltered,
  busyId, actionError, onStart, onResolve,
}) {
  if (loading) return <Message>Loading your assignments…</Message>;

  if (error) {
    return (
      <Message tone="error">
        {error}
        <button type="button" onClick={onRetry} className="mt-3 block w-full cursor-pointer rounded-full bg-[#eef5ff] px-4 py-2 font-semibold text-[#1f55b8] hover:bg-[#dfeaff]">
          Try again
        </button>
      </Message>
    );
  }

  if (complaints.length === 0) {
    return (
      <Message>
        {isFiltered
          ? "Nothing here right now. 🎉"
          : "No assignments yet. When an officer assigns you a complaint, it will show up here."}
      </Message>
    );
  }

  return (
    <div className="flex max-h-[620px] flex-col gap-2.5 overflow-y-auto py-1 pl-0.5 pr-1.5">
      {complaints.map((c) => {
        const s = statusInfo(c.status);
        const selected = c._id === selectedId;
        const busy = busyId === c._id;

        return (
          // The card is an <article>, so the action button is never nested inside another button.
          <article
            key={c._id}
            data-id={c._id}
            className={`rounded-[20px_20px_20px_8px] border-2 px-4 py-3 text-[#14305e] transition-shadow hover:shadow-[0_10px_24px_rgba(47,111,184,0.2)] ${
              selected ? "border-[#2f6fe0] bg-white shadow-[0_10px_24px_rgba(47,111,184,0.18)]" : "border-transparent bg-[#f4f9ff]"
            }`}
          >
            <button
              type="button"
              aria-expanded={selected}
              onClick={() => onSelect(selected ? null : c._id)}
              // minmax(0,1fr) lets the text column shrink, so the status tag always stays inside the card.
              // On very small screens the tag moves above the text.
              className="grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#2f6fe0]/45 max-[420px]:grid-cols-1"
            >
              <span className="block min-w-0">
                {/* long text wraps to the next line; two lines when collapsed, everything when opened */}
                <span className={`block text-[0.88rem] font-semibold [overflow-wrap:anywhere] ${selected ? "" : "line-clamp-2"}`}>
                  {c.description}
                </span>
                <span className="mt-0.5 block text-[0.72rem] text-[#5b7396] [overflow-wrap:anywhere]">
                  {shortId(c._id)} · 📍 {c.location || "No location given"}
                </span>
              </span>

              <span className={`self-start whitespace-nowrap rounded-full px-[11px] py-[3px] text-[0.7rem] font-semibold max-[420px]:order-first max-[420px]:justify-self-start ${s.badge}`}>
                {s.label}
              </span>

              <span className="col-span-full mt-1.5 flex flex-wrap gap-1.5">
                <span className={`${chip} ${c.category ? "bg-[#eef2ff] text-[#3a3fb0]" : "bg-[#e8eef7] text-[#3d5478]"}`}>{c.categoryText}</span>
                {c.departmentName && <span className={`${chip} bg-[#eef2ff] text-[#3a3fb0]`}>{c.departmentName}</span>}
              </span>
            </button>

            {selected && (
              <p className="mt-2 border-t border-[#cfe0f5] pt-2 text-[0.72rem] text-[#5b7396]">
                Reported {relTime(c.createdAt)}
              </p>
            )}

            <Actions c={c} busy={busy} onStart={onStart} onResolve={onResolve} />

            {actionError?.id === c._id && (
              <p role="alert" className="mt-2 rounded-xl bg-[#ffe9ee] px-3 py-2 text-[0.74rem] text-[#c4284d]">
                {actionError.message}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
