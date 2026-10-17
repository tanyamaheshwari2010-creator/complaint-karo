import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../api/client.js";
import { officerApi } from "../api/officerApi.js";
import { clearUser, getUser } from "../api/session.js";
import ProfileMenu from "../components/dashboard/ProfileMenu.jsx";
import RoadScene from "../components/dashboard/RoadScene.jsx";
import ComplaintQueue from "../components/officer/ComplaintQueue.jsx";
import OfficerStatCards from "../components/officer/OfficerStatCards.jsx";
import ReviewPanel from "../components/officer/ReviewPanel.jsx";
import { isUnsure, normalize } from "../components/officer/officerConfig.js";
import "../styles/dashboard.css";

const TITLES = {
  all: "Complaint queue",
  submitted: "Awaiting review",
  under_review: "Reviewed complaints",
  assigned: "Assigned complaints",
  unsure: "AI was unsure about these",
};

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const user = useMemo(() => getUser(), []);

  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [setupWarning, setSetupWarning] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef();
  const panelRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  };

  const handleLogout = useCallback(() => {
    clearToken();
    clearUser();
    navigate("/login");
  }, [navigate]);

  /* ---------- load everything ---------- */
  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    setSetupWarning("");

    const [c, d, w] = await Promise.allSettled([officerApi.complaints(), officerApi.departments(), officerApi.workers()]);

    if (c.status === "rejected") {
      if (c.reason.status === 401) return handleLogout();
      setLoadError(
        c.reason.status === 403
          ? "Your account doesn't have officer access."
          : c.reason.message || "Couldn't load complaints."
      );
      setLoading(false);
      return;
    }

    setComplaints((c.value.complaints ?? []).map((x) => normalize(x)));
    setDepartments(d.status === "fulfilled" ? d.value.departments ?? [] : []);
    setWorkers(w.status === "fulfilled" ? w.value.workers ?? [] : []);

    const missing = [d.status === "rejected" && "departments", w.status === "rejected" && "workers"].filter(Boolean);
    if (missing.length) {
      setSetupWarning(`Couldn't load ${missing.join(" and ")}. Review and assignment need them (check the backend endpoints).`);
    }
    setLoading(false);
  }, [handleLogout]);

  useEffect(() => {
    load();
  }, [load]);

  /* ---------- actions (errors are shown inside the panel) ---------- */
  const replaceComplaint = (updated) =>
    setComplaints((list) => list.map((x) => (x._id === updated._id ? normalize(updated, x) : x)));

  const handleReview = async (id, payload) => {
    const res = await officerApi.review(id, payload);
    replaceComplaint(res.complaint);
    showToast("Review saved. Now assign a worker ✓");
  };

  const handleAssign = async (id, workerId) => {
    const res = await officerApi.assign(id, workerId);
    replaceComplaint(res.complaint);
    showToast("Worker assigned ✓");
  };

  /* ---------- derived data ---------- */
  const counts = useMemo(
    () => ({
      submitted: complaints.filter((c) => c.status === "submitted").length,
      under_review: complaints.filter((c) => c.status === "under_review").length,
      assigned: complaints.filter((c) => c.status === "assigned").length,
      unsure: complaints.filter(isUnsure).length,
    }),
    [complaints]
  );

  const visible = useMemo(
    () =>
      complaints
        .filter((c) => filter === "all" || (filter === "unsure" ? isUnsure(c) : c.status === filter))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [complaints, filter]
  );

  const selected = complaints.find((c) => c._id === selectedId) ?? null;

  const handleSelect = (id) => {
    setSelectedId(id);
    if (window.innerWidth <= 920) panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // clicking the active card again clears the filter
  const handleFilter = (key) => setFilter((f) => (f === key ? "all" : key));

  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="relative min-h-screen overflow-hidden px-[clamp(16px,4vw,56px)] pb-[190px] font-sans text-[#14305e]">
      <div className="dash-wall absolute inset-0 z-0" />
      <RoadScene />

      {/* top bar */}
      <header className="relative z-20 mx-auto flex max-w-[1220px] items-center justify-between pb-2 pt-[18px]">
        <div className="flex items-center gap-2.5 text-base font-bold">
          <span className="grid h-[38px] w-[38px] place-items-center rounded-[12px_12px_12px_4px] bg-linear-to-br from-[#4b8bf0] to-[#2457c5] shadow-[0_6px_14px_rgba(47,111,224,0.35)]" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
              <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm1 14h-2v-2h2v2Zm0-4h-2V7h2v5Z" />
            </svg>
          </span>
          Civic Complaint Desk
          <span className="ml-1 rounded-full bg-[#e3e9ff] px-3 py-[3px] text-[0.7rem] font-semibold text-[#3a3fb0] max-[480px]:hidden">Officer</span>
        </div>
        <ProfileMenu user={user} onLogout={handleLogout} />
      </header>

      <main className="relative z-[5] mx-auto grid max-w-[1220px] items-start gap-[26px] pt-2 min-[921px]:grid-cols-[minmax(0,1fr)_450px] min-[921px]:gap-[38px]">
        <section className="min-w-0">
          <h1 className="text-[clamp(1.4rem,2.4vw,1.9rem)] font-bold tracking-tight">
            {part}, Officer {user.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-0.5 text-[0.9rem] text-[#5b7396]">
            {loading
              ? "Loading your queue…"
              : counts.submitted
              ? `${counts.submitted} new complaint${counts.submitted > 1 ? "s are" : " is"} waiting for your review.`
              : "No new complaints waiting. Nice work!"}
          </p>

          <OfficerStatCards counts={counts} active={filter} onSelect={handleFilter} />

          <div className="mb-2.5 mt-3.5 flex items-baseline justify-between">
            <h2 className="text-[1.05rem] font-bold">{TITLES[filter]}</h2>
            {!loading && !loadError && (
              <span className="text-[0.76rem] text-[#5b7396]">
                {visible.length} complaint{visible.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {setupWarning && (
            <p role="alert" className="mb-2.5 rounded-[16px] bg-[#fff3d1] px-3.5 py-2.5 text-[0.76rem] text-[#8a5a00]">{setupWarning}</p>
          )}

          <ComplaintQueue
            complaints={visible}
            selectedId={selectedId}
            onSelect={handleSelect}
            departments={departments}
            loading={loading}
            error={loadError}
            onRetry={load}
          />
        </section>

        <div ref={panelRef} className="scroll-mt-4">
          <ReviewPanel
            key={selected?._id ?? "none"}
            complaint={selected}
            departments={departments}
            workers={workers}
            onReview={handleReview}
            onAssign={handleAssign}
          />
        </div>
      </main>

      <div
        role="status"
        className={`fixed left-1/2 top-[18px] z-[100] -translate-x-1/2 rounded-full bg-[#12306a] px-5 py-3 text-[0.86rem] font-semibold text-white shadow-[0_12px_30px_rgba(18,48,106,0.4)] transition-transform duration-400 ease-out ${toast ? "translate-y-0" : "-translate-y-20"}`}
      >
        {toast}
      </div>
    </div>
  );
}
