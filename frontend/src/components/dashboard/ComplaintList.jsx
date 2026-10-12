import { STATUS } from "./statusConfig.js";

export default function ComplaintList({ complaints, filter }) {
  const rows = complaints.filter((c) => filter === "all" || c.status === filter).slice(0, 3);
  const title = filter === "all" ? "Recent complaints" : `${STATUS[filter].label} complaints`;

  return (
    <>
      <div className="mb-2.5 mt-3.5 flex items-baseline justify-between">
        <h2 className="text-[1.05rem] font-bold">{title}</h2>
        {/* TODO: link to the full "My complaints" page when it exists */}
        <a href="#" className="text-[0.78rem] font-semibold text-[#1f55b8] hover:underline">
          View all →
        </a>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-[20px] bg-white/90 p-5 text-center text-[0.86rem] text-[#5b7396]">
          No complaints here yet. Spotted a problem? Tell us on the right. 🙌
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {rows.map((c) => {
            const s = STATUS[c.status];
            return (
              <article
                key={c.id}
                className="grid grid-cols-[1fr_auto] gap-x-3.5 gap-y-0.5 rounded-[20px_20px_20px_8px] bg-white/90 px-4 py-3 shadow-[0_6px_18px_rgba(47,111,184,0.12)]"
              >
                <div className="min-w-0">
                  <div className="truncate text-[0.88rem] font-semibold">{c.title}</div>
                  <div className="text-[0.72rem] text-[#5b7396]">
                    {c.id} · {c.place}
                  </div>
                </div>
                <span className={`self-start whitespace-nowrap rounded-full px-[11px] py-[3px] text-[0.7rem] font-semibold ${s.badge}`}>
                  {s.label}
                </span>

                <div className="col-span-full mt-[7px] flex gap-1">
                  {[1, 2, 3, 4].map((n) => (
                    <i
                      key={n}
                      style={{ background: n <= s.step ? s.color : "#e2ecf8" }}
                      className="h-[5px] flex-1 rounded"
                    />
                  ))}
                </div>
                <div className="col-span-full mt-1 text-[0.72rem] text-[#5b7396]">{c.update}</div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
