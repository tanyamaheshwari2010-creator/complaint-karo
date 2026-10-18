import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearToken } from "../api/client.js";
import { clearUser, getUser } from "../api/session.js";
import { workerApi } from "../api/workerApi.js";
import ProfileMenu from "../components/dashboard/ProfileMenu.jsx";
import RoadScene from "../components/dashboard/RoadScene.jsx";
import AssignmentList from "../components/worker/AssignmentList.jsx";
import WorkerStatCards from "../components/worker/WorkerStatCards.jsx";
import { ORDER, STATUS, normalize } from "../components/worker/workerConfig.js";
import "../styles/dashboard.css";

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const user = useMemo(() => getUser(), []);

  // The API is the only source of data. No mock complaints here.
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  const [busyId, setBusyId] = useState(null);       // complaint whose Start/Resolve request is running
  const [actionError, setActionError] = useState(null); // { id, message }
  const [toast, setToast] = useState("");
  const toastTimer = useRef();

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

  // silent = refresh the list in the background (no loading screen, keeps the old list if it fails)
  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setError("");
      }
      try {
        const data = await workerApi.complaints();
        setComplaints((data.complaints ?? []).map(normalize));
      } catch (e) {
        if (e.status === 401) return handleLogout(); // token missing or expired
        if (!silent) {
          setError(e.status === 403 ? "Your account doesn't have field worker access." : e.message || "Couldn't load your assignments.");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [handleLogout]
  );

  useEffect(() => {
    load();
  }, [load]);


  useEffect(() => {
    const tick = () => { if (!document.hidden) load(true); };
    const timer = setInterval(tick, 15000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [load]);


  // Start Work / Mark Resolved: ask the backend first, then reload the list from the database.
  // We never change the status in React ourselves, so the screen can't drift from MongoDB.
  const runAction = async (id, action) => {
    setBusyId(id);
    setActionError(null);
    try {
      await workerApi[action](id);
      await load(true);
      showToast(action === "start" ? "Work started ✓" : "Marked as resolved ✓");
    } catch (e) {
      if (e.status === 401) return handleLogout();
      setActionError({ id, message: e.message });
      load(true); // refresh anyway, in case someone changed it in the meantime
    } finally {
      setBusyId(null);
    }
  };

  // The counters are calculated from the list, so they update whenever the list is reloaded.
  const counts = useMemo(
    () => ({
      all: complaints.length,
      assigned: complaints.filter((c) => c.status === "assigned").length,
      in_progress: complaints.filter((c) => c.status === "in_progress").length,
      resolved: complaints.filter((c) => c.status === "resolved").length,
    }),
    [complaints]
  );

  const visible = useMemo(
    () =>
      complaints
        .filter((c) => filter === "all" || c.status === filter)
        .sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9) || new Date(b.createdAt) - new Date(a.createdAt)),
    [complaints, filter]
  );

  // clicking the active card again clears the filter
  const handleFilter = (key) => setFilter((f) => (f === key ? "all" : key));

  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user.name.split(" ")[0];

  const subtitle = loading
    ? "Loading your assignments…"
    : error
      ? "We couldn't load your assignments."
      : counts.assigned
        ? `${counts.assigned} new assignment${counts.assigned > 1 ? "s are" : " is"} waiting for you.`
        : counts.in_progress
          ? `You're working on ${counts.in_progress} complaint${counts.in_progress > 1 ? "s" : ""}.`
          : "Nothing assigned to you right now.";

  const title = filter === "all" ? "My assignments" : filter === "assigned" ? "New assignments" : `${STATUS[filter].label} assignments`;

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
          <span className="ml-1 rounded-full bg-[#e3e9ff] px-3 py-[3px] text-[0.7rem] font-semibold text-[#3a3fb0] max-[480px]:hidden">Field worker</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="rounded-full border border-[#cfe0f5] bg-white/90 px-4 py-2 text-[0.8rem] font-semibold text-[#1f55b8] shadow-[0_4px_14px_rgba(47,111,184,0.12)] hover:bg-white max-[600px]:hidden"
          >
            File my own complaint
          </Link>
          <ProfileMenu user={user} onLogout={handleLogout} />
        </div>
      </header>

      <main className="relative z-[5] mx-auto grid max-w-[1220px] items-start gap-[26px] pt-2 min-[921px]:grid-cols-[minmax(0,1fr)_500px] min-[921px]:gap-[38px]">
        <section className="min-w-0">
          <h1 className="text-[clamp(1.4rem,2.4vw,1.9rem)] font-bold tracking-tight">
            {part}, {firstName} 👋
          </h1>
          <p className="mt-0.5 text-[0.9rem] text-[#5b7396]">{subtitle}</p>

          <WorkerStatCards counts={counts} active={filter} onSelect={handleFilter} />
        </section>

        <aside aria-live="polite" className="min-w-0 rounded-[36px_36px_36px_12px] bg-white/90 px-6 pb-[22px] pt-6 shadow-[0_18px_44px_rgba(47,111,184,0.22)] max-[920px]:-mt-5">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-[1.25rem] font-bold">{title}</h2>
            {!loading && !error && (
              <span className="shrink-0 text-[0.76rem] text-[#5b7396]">
                {visible.length} complaint{visible.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <AssignmentList
            complaints={visible}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={loading}
            error={error}
            onRetry={() => load()}
            isFiltered={filter !== "all"}
            busyId={busyId}
            actionError={actionError}
            onStart={(id) => runAction(id, "start")}
            onResolve={(id) => runAction(id, "resolve")}
          />
        </aside>
      </main>

      {/* toast */}
      <div
        role="status"
        className={`fixed left-1/2 top-[18px] z-[100] -translate-x-1/2 rounded-full bg-[#12306a] px-5 py-3 text-[0.86rem] font-semibold text-white shadow-[0_12px_30px_rgba(18,48,106,0.4)] transition-transform duration-400 ease-out ${toast ? "translate-y-0" : "-translate-y-20"}`}
      >
        {toast}
      </div>
    </div>
  );
}
