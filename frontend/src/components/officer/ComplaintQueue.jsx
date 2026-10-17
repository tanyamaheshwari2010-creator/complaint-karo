import { categoryLabel, confChip, pct, relTime, shortId, statusInfo } from "./officerConfig.js";

const chip = "inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold";

export default function ComplaintQueue({ complaints, selectedId, onSelect, departments, loading, error, onRetry }) {
  const deptName = (id) => departments.find((d) => d._id === id)?.name;

  if (loading) {
    return <div className="rounded-[20px] bg-white/90 p-5 text-center text-[0.86rem] text-[#5b7396]">Loading complaints…</div>;
  }
  if (error) {
    return (
      <div role="alert" className="rounded-[20px] bg-white/90 p-5 text-center text-[0.86rem] text-[#c4284d]">
        {error}
        <button type="button" onClick={onRetry} className="mt-3 block w-full cursor-pointer rounded-full bg-[#eef5ff] px-4 py-2 font-semibold text-[#1f55b8] hover:bg-[#dfeaff]">
          Try again
        </button>
      </div>
    );
  }
  if (complaints.length === 0) {
    return <div className="rounded-[20px] bg-white/90 p-5 text-center text-[0.86rem] text-[#5b7396]">Nothing here right now. 🎉</div>;
  }

  return (
    <div className="flex max-h-[470px] flex-col gap-2.5 overflow-y-auto py-1 pl-0.5 pr-1.5">
      {complaints.map((c) => {
        const s = statusInfo(c.status);
        const selected = c._id === selectedId;

        return (
          <button
            key={c._id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(c._id)}
            // TAG FIX: minmax(0,1fr) lets the text column shrink, so the status tag always stays inside the card.
            // On very small screens the tag moves above the text instead of squeezing it.
            className={`grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 rounded-[20px_20px_20px_8px] border-2 bg-white/90 px-4 py-3 text-left text-[#14305e] shadow-[0_6px_18px_rgba(47,111,184,0.12)] transition-shadow hover:shadow-[0_10px_24px_rgba(47,111,184,0.22)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#2f6fe0]/45 max-[420px]:grid-cols-1 ${
              selected ? "border-[#2f6fe0]" : "border-transparent"
            }`}
          >
            <div className="min-w-0">
              {/* long complaints wrap onto the next line (max 2 lines, then ...) */}
              <div className="line-clamp-2 text-[0.88rem] font-semibold [overflow-wrap:anywhere]">{c.description}</div>
              <div className="mt-0.5 text-[0.72rem] text-[#5b7396] [overflow-wrap:anywhere]">
                {shortId(c._id)} · {c.location || "No location"} · {c.citizen.name} · {relTime(c.createdAt)}
              </div>
            </div>

            <span className={`self-start whitespace-nowrap rounded-full px-[11px] py-[3px] text-[0.7rem] font-semibold max-[420px]:order-first max-[420px]:justify-self-start ${s.badge}`}>
              {s.label}
            </span>

            <div className="col-span-full mt-1.5 flex flex-wrap gap-1.5">
              {c.aiStatus === "completed" ? (
                <span className={`${chip} ${confChip(c.aiConfidence)}`}>
                  AI: {categoryLabel(c.aiSuggestedCategory)} · {pct(c.aiConfidence)}%
                </span>
              ) : c.aiStatus === "processing" ? (
                <span className={`${chip} bg-[#eef2ff] text-[#3a3fb0]`}>AI is working…</span>
              ) : (
                <span className={`${chip} bg-[#ffe9ee] text-[#c4284d]`}>AI failed · choose manually</span>
              )}
              {c.departmentId && deptName(c.departmentId) && (
                <span className={`${chip} bg-[#eef2ff] text-[#3a3fb0]`}>{deptName(c.departmentId)}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
