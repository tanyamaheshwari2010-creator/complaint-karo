import { useState } from "react";
import {
  CATEGORIES, REVIEWABLE, categoryLabel, confColor, confChip, idOf, pct, relTime, shortId,
} from "./officerConfig.js";

const chip = "inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold";
const selectCls =
  "h-11 w-full rounded-full border-2 border-[#cfe0f5] bg-white px-4 text-[0.86rem] font-semibold text-[#14305e] outline-none transition focus:border-[#2f6fe0] focus:ring-4 focus:ring-[#2f6fe0]/15 disabled:cursor-not-allowed disabled:bg-[#f1f5fb] disabled:text-[#8ea2bf]";
const btnBase =
  "mt-2.5 h-[46px] w-full cursor-pointer rounded-full text-[0.92rem] font-semibold text-white transition focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#2f6fe0]/45 active:scale-[0.985] disabled:cursor-not-allowed disabled:bg-none disabled:bg-[#cdd9ea] disabled:shadow-none";
const btnPrimary = `${btnBase} bg-linear-to-br from-[#4b8bf0] to-[#2457c5] shadow-[0_10px_24px_rgba(47,111,224,0.38)] hover:shadow-[0_14px_30px_rgba(47,111,224,0.5)]`;
const btnAssign = `${btnBase} bg-linear-to-br from-[#7c80f5] to-[#4a4fd0] shadow-[0_10px_24px_rgba(74,79,208,0.35)] hover:shadow-[0_14px_30px_rgba(74,79,208,0.5)]`;

function Steps({ status }) {
  const idx = status === "submitted" ? 0 : status === "under_review" ? 1 : 2;
  const step = (n, label) => (
    <span className={`flex items-center gap-1.5 ${idx >= n ? "text-[#1f55b8]" : ""}`}>
      <span className={`grid h-[18px] w-[18px] place-items-center rounded-full text-[0.62rem] text-white ${idx >= n ? "bg-[#2f6fe0]" : "bg-[#e2ecf8]"}`}>
        {idx >= n ? "✓" : n + 1}
      </span>
      {label}
    </span>
  );
  return (
    <div className="mb-3.5 flex items-center gap-1.5 text-[0.7rem] font-semibold text-[#9fb2cc]">
      {step(0, "Submitted")}
      <span className="h-0.5 flex-1 rounded bg-[#e2ecf8]" />
      {step(1, "Reviewed")}
      <span className="h-0.5 flex-1 rounded bg-[#e2ecf8]" />
      {step(2, "Assigned")}
    </div>
  );
}

function Shell({ children }) {
  return (
    <aside aria-live="polite" className="rounded-[36px_36px_36px_12px] bg-white/90 px-6 pb-[22px] pt-6 shadow-[0_18px_44px_rgba(47,111,184,0.22)]">
      {children}
    </aside>
  );
}

/**
 * complaint: the selected complaint (normalized), or null
 * onReview(id, { category, departmentId }) and onAssign(id, workerId) return promises. They throw on errors.
 * Use key={complaint._id} where you render this, so the form resets when another complaint is picked.
 */
export default function ReviewPanel({ complaint, departments, workers, onReview, onAssign }) {
  const c = complaint;

  // start from the officer's saved choice; if none, start from the AI suggestion
  const hasSaved = Boolean(c?.category || c?.departmentId);
  const aiOk = c?.aiStatus === "completed";
  const [draft, setDraft] = useState(() =>
    hasSaved
      ? { category: c.category, departmentId: c.departmentId }
      : aiOk
      ? { category: c.aiSuggestedCategory ?? "", departmentId: c.aiSuggestedDepartmentId ?? "" }
      : { category: "", departmentId: "" }
  );
  const [fromAI, setFromAI] = useState(!hasSaved && aiOk);
  const [workerId, setWorkerId] = useState("");
  const [busy, setBusy] = useState("");
  const [reviewNote, setReviewNote] = useState({ text: "", err: false });
  const [assignNote, setAssignNote] = useState({ text: "", err: false });

  if (!c) {
    return (
      <Shell>
        <h2 className="text-[1.25rem] font-bold">Review a complaint</h2>
        <p className="mb-3 mt-0.5 text-[0.8rem] text-[#5b7396]">Pick a complaint from the queue to check what the AI suggested and make the final call.</p>
        <div className="rounded-[20px] bg-[#f4f9ff] p-5 text-center text-[0.86rem] text-[#5b7396]">👈 Nothing selected yet</div>
      </Shell>
    );
  }

  const locked = !REVIEWABLE.includes(c.status); // the backend refuses changes after assignment
  const deptName = (id) => departments.find((d) => d._id === id)?.name;

  // The server assigns using the SAVED department, so the assign button depends on saved values.
  const savedOk = c.status === "under_review" && Boolean(c.departmentId);
  const changedSinceSave = savedOk && (draft.departmentId !== c.departmentId || draft.category !== c.category);
  const hasDeptInfo = workers.some((w) => w.departmentId); // if workers have no department yet, show them all
  const workerDept = savedOk ? c.departmentId : draft.departmentId;
  const workerList = hasDeptInfo ? workers.filter((w) => idOf(w.departmentId) === workerDept) : workers;
  const canAssign = savedOk && !changedSinceSave;

  const assignedWorker = workers.find((w) => w._id === c.assignedWorkerId);

  const pick = (patch) => {
    setDraft((d) => ({ ...d, ...patch }));
    setFromAI(false);
    setReviewNote({ text: "", err: false });
  };

  const useAI = () => {
    setDraft({ category: c.aiSuggestedCategory ?? "", departmentId: c.aiSuggestedDepartmentId ?? "" });
    setFromAI(false);
    setReviewNote({ text: "AI suggestion applied. Save to confirm.", err: false });
  };

  const save = async () => {
    if (!draft.category) return setReviewNote({ text: "Please choose a category.", err: true });
    if (!draft.departmentId) return setReviewNote({ text: "Please choose a department.", err: true });
    setBusy("review");
    try {
      await onReview(c._id, { category: draft.category, departmentId: draft.departmentId });
      setReviewNote({ text: "Review saved. Now assign a worker.", err: false });
    } catch (e) {
      setReviewNote({ text: e.message, err: true });
    } finally {
      setBusy("");
    }
  };

  const assign = async () => {
    if (!workerId) return setAssignNote({ text: "Please choose a worker.", err: true });
    setBusy("assign");
    try {
      await onAssign(c._id, workerId);
    } catch (e) {
      setAssignNote({ text: e.message, err: true });
    } finally {
      setBusy("");
    }
  };

  const assignHint = !savedOk
    ? "Save your review first. Then you can assign a worker."
    : changedSinceSave
    ? "You changed the category or department. Save the review again before assigning."
    : "";

  return (
    <Shell>
      <h2 className="text-[1.25rem] font-bold">Review complaint</h2>
      <p className="mb-3 mt-0.5 text-[0.8rem] text-[#5b7396]">
        {shortId(c._id)} · submitted {relTime(c.createdAt)}
      </p>
      <Steps status={c.status} />

      {/* the complaint itself */}
      <div className="rounded-[18px_18px_18px_6px] border border-[#cfe0f5] bg-[#f4f9ff] px-3.5 py-3 text-[0.86rem] leading-normal [overflow-wrap:anywhere]">
        {c.description}
        <div className="mt-2 flex flex-col gap-0.5 text-[0.74rem] text-[#5b7396]">
          <span>📍 {c.location || "No location given"}</span>
          <span>👤 {c.citizen.name}{c.citizen.email ? ` · ${c.citizen.email}` : ""}</span>
        </div>
      </div>

      {/* AI suggestion */}
      <div className="mt-3 rounded-[18px_18px_18px_6px] border border-[#c7d2fe] bg-[#eef2ff] px-3.5 py-3">
        <div className="flex items-center justify-between text-[0.78rem] font-bold text-[#3a3fb0]">
          <span>✨ AI suggestion</span>
          <span className={`${chip} ${aiOk ? "bg-[#e3e4ff] text-[#3a3fb0]" : "bg-[#ffe9ee] text-[#c4284d]"}`}>{c.aiStatus}</span>
        </div>

        {aiOk ? (
          <div className="mt-2 flex flex-col gap-1.5 text-[0.8rem]">
            <div className="flex flex-wrap gap-1.5">
              <span className={`${chip} bg-white text-[#3a3fb0]`}>{categoryLabel(c.aiSuggestedCategory)}</span>
              <span className={`${chip} bg-white text-[#3a3fb0]`}>{deptName(c.aiSuggestedDepartmentId) ?? "No department"}</span>
            </div>
            <div className="flex items-center gap-2 text-[0.74rem] text-[#5b7396]">
              <span>Confidence</span>
              <div className="h-[7px] flex-1 overflow-hidden rounded bg-[#dde3fb]">
                <div className="h-full rounded" style={{ width: `${pct(c.aiConfidence)}%`, background: confColor(c.aiConfidence) }} />
              </div>
              <b className={`rounded-full px-2 py-px ${confChip(c.aiConfidence)}`}>{pct(c.aiConfidence)}%</b>
            </div>
            {c.aiConfidence < 0.6 && <p className="text-[0.72rem] text-[#c4284d]">The AI isn't sure about this one. Please read it carefully.</p>}
            <button
              type="button"
              onClick={useAI}
              disabled={locked}
              className="mt-0.5 cursor-pointer self-start rounded-full bg-white px-3 py-[5px] text-[0.74rem] font-semibold text-[#3a3fb0] shadow-[0_2px_8px_rgba(58,63,176,0.15)] hover:bg-[#f4f5ff] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Use AI suggestion
            </button>
          </div>
        ) : (
          <p className="mt-2 text-[0.74rem] text-[#c4284d]">
            {c.aiStatus === "processing" ? "The AI is still working on this one." : "The AI couldn't classify this complaint."} Please choose the category and department yourself.
          </p>
        )}
      </div>

      {/* officer decision */}
      <div className="mb-2 mt-4 flex items-baseline justify-between">
        <h3 className="text-[0.95rem] font-bold">Your decision</h3>
        <small className="text-[0.7rem] text-[#5b7396]">Your choice is final</small>
      </div>

      <label htmlFor="fCat" className="mb-1 mt-2 block px-1 text-[0.74rem] font-semibold text-[#5b7396]">Category</label>
      <select id="fCat" className={selectCls} disabled={locked} value={draft.category} onChange={(e) => pick({ category: e.target.value })}>
        <option value="">Choose a category…</option>
        {Object.entries(CATEGORIES).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>

      <label htmlFor="fDept" className="mb-1 mt-2 block px-1 text-[0.74rem] font-semibold text-[#5b7396]">Department</label>
      <select id="fDept" className={selectCls} disabled={locked} value={draft.departmentId} onChange={(e) => pick({ departmentId: e.target.value })}>
        <option value="">Choose a department…</option>
        {departments.map((d) => (
          <option key={d._id} value={d._id}>{d.name}</option>
        ))}
      </select>

      <p className={`ml-1 mt-1.5 min-h-[1.1em] text-[0.72rem] ${reviewNote.err ? "text-[#c4284d]" : "text-[#5b7396]"}`}>
        {reviewNote.text || (fromAI ? "Pre-filled from the AI. Check it, change it if it's wrong, then save." : "")}
      </p>

      {!locked && (
        <button type="button" className={btnPrimary} disabled={busy === "review"} onClick={save}>
          {busy === "review" ? "Saving…" : c.status === "under_review" ? "Update review" : "Save review"}
        </button>
      )}

      {/* assign worker */}
      <div className="mb-2 mt-4 flex items-baseline justify-between">
        <h3 className="text-[0.95rem] font-bold">Assign a field worker</h3>
        <small className="text-[0.7rem] text-[#5b7396]">{canAssign ? `${deptName(c.departmentId) ?? ""} team` : locked ? "" : "Step 2"}</small>
      </div>

      {locked ? (
        <div className="rounded-[18px] bg-[#e8ebff] p-3.5 text-[0.84rem] font-semibold text-[#3a3fb0]">
          {c.assignedWorkerId ? `Assigned to ${assignedWorker?.name ?? "a field worker"}` : "This complaint can no longer be changed here."}
          {deptName(c.departmentId) ? ` · ${deptName(c.departmentId)}` : ""}
        </div>
      ) : (
        <>
          <label htmlFor="fWorker" className="mb-1 mt-2 block px-1 text-[0.74rem] font-semibold text-[#5b7396]">Worker</label>
          <select id="fWorker" className={selectCls} disabled={!canAssign} value={workerId} onChange={(e) => { setWorkerId(e.target.value); setAssignNote({ text: "", err: false }); }}>
            <option value="">{workerList.length ? "Choose a worker…" : "No workers in this department"}</option>
            {workerList.map((w) => (
              <option key={w._id} value={w._id}>{w.name}</option>
            ))}
          </select>
          <p className={`ml-1 mt-1.5 min-h-[1.1em] text-[0.72rem] ${assignNote.err ? "text-[#c4284d]" : "text-[#5b7396]"}`}>
            {assignNote.text || assignHint}
          </p>
          <button type="button" className={btnAssign} disabled={!canAssign || busy === "assign"} onClick={assign}>
            {busy === "assign" ? "Assigning…" : "Assign worker"}
          </button>
        </>
      )}
    </Shell>
  );
}
