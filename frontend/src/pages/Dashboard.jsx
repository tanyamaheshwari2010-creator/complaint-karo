import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, clearToken } from "../api/client.js";
import { clearDraft, peekDraft } from "../api/draft.js";
import { clearUser, getUser } from "../api/session.js";
import ComplaintComposer from "../components/dashboard/ComplaintComposer.jsx";
import ComplaintList from "../components/dashboard/ComplaintList.jsx";
import ProfileMenu from "../components/dashboard/ProfileMenu.jsx";
import RoadScene from "../components/dashboard/RoadScene.jsx";
import StatsCards from "../components/dashboard/StatsCards.jsx";
import { groupOf } from "../components/dashboard/statusConfig.js";
import { shortId } from "../components/officer/officerConfig.js";
import "../styles/dashboard.css";

const pill =
  "rounded-full border border-[#cfe0f5] bg-white/90 px-4 py-2 text-[0.8rem] font-semibold text-[#1f55b8] shadow-[0_4px_14px_rgba(47,111,184,0.12)] hover:bg-white max-[600px]:hidden";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useMemo(() => getUser(), []);

  // Real complaints from the backend. The database is the only source of truth.
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState("");
  const toastTimer = useRef();

  // Something the visitor wrote on the home page before signing up / logging in
  const [initialDraft] = useState(() => peekDraft());

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4200);
  };

  const handleLogout = useCallback(() => {
    clearToken();
    clearUser();
    clearDraft();
    navigate("/login");
  }, [navigate]);

  // silent = refresh in the background (no loading screen; keeps the old list if it fails)
  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setError("");
      }
      try {
        const data = await api.myComplaints();
        setComplaints(data.complaints ?? []);
      } catch (e) {
        if (e.status === 401) return handleLogout(); // token missing or expired
        if (!silent) setError(e.message || "Couldn't load your complaints.");
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
    if (initialDraft) showToast("Welcome! We kept what you wrote. Check it, then press Submit complaint.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quietly re-read the list, so a complaint moving along (reviewed, assigned, started, resolved)
  // shows up without refreshing the page.
  useEffect(() => {
    const tick = () => {
      if (!document.hidden) load(true);
    };
    const timer = setInterval(tick, 15000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [load]);


  const handleSubmit = async ({
    description,
    location,
    photo,
    latitude,
    longitude,
    locationAccuracy,
  }) => {
    // Photos aren't supported by the backend yet, so only text and location go out.
    const data = await api.createComplaint({
      description,
      location,
      latitude,
      longitude,
      locationAccuracy,
    });

    clearDraft();
    setFilter("all");
    await load(true);

    const id = data?.complaint?._id
      ? shortId(data.complaint._id)
      : "";

    showToast(
      photo
        ? "Complaint submitted. Photos can't be uploaded yet, so it was sent without the photo."
        : `Complaint ${id} submitted ✓`
    );
  };


  // The five real statuses are grouped into the three the citizen sees.
  const counts = useMemo(
    () => ({
      all: complaints.length,
      pending: complaints.filter((c) => groupOf(c.status) === "pending").length,
      progress: complaints.filter((c) => groupOf(c.status) === "progress").length,
      resolved: complaints.filter((c) => groupOf(c.status) === "resolved").length,
    }),
    [complaints]
  );

  const visible = useMemo(
    () =>
      complaints
        .filter((c) => filter === "all" || groupOf(c.status) === filter)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [complaints, filter]
  );

  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user.name.split(" ")[0];

  const subtitle = loading
    ? "Loading your complaints…"
    : counts.progress
      ? `${counts.progress} of your complaints ${counts.progress === 1 ? "is" : "are"} being worked on right now.`
      : counts.all
        ? "We're on it. You'll see updates here as they happen."
        : "File your first complaint on the right.";

  return (
    <div className="relative min-h-screen overflow-hidden px-[clamp(16px,4vw,56px)] pb-[190px] font-sans text-[#14305e]">
      <div className="dash-wall absolute inset-0 z-0" />
      <RoadScene />

      {/* top bar */}
      <header className="relative z-20 mx-auto flex max-w-[1180px] items-center justify-between pb-2 pt-[18px]">
        <div className="flex items-center gap-2.5 text-base font-bold">
          <span className="grid h-[38px] w-[38px] place-items-center rounded-[12px_12px_12px_4px] bg-linear-to-br from-[#4b8bf0] to-[#2457c5] shadow-[0_6px_14px_rgba(47,111,224,0.35)]" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
              <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm1 14h-2v-2h2v2Zm0-4h-2V7h2v5Z" />
            </svg>
          </span>
          Civic Complaint Desk
        </div>

        <div className="flex items-center gap-3">
          {/* staff can jump back to their own desk */}
          {user.role === "complaint_officer" && <Link to="/officer" className={pill}>← Officer desk</Link>}
          {user.role === "field_worker" && <Link to="/worker" className={pill}>← My assignments</Link>}
          <ProfileMenu user={user} onLogout={handleLogout} />
        </div>
      </header>

      <main className="relative z-[5] mx-auto grid max-w-[1180px] items-start gap-[26px] pt-2 min-[921px]:grid-cols-[minmax(0,1fr)_420px] min-[921px]:gap-[38px]">
        <section className="min-w-0">
          <h1 className="text-[clamp(1.4rem,2.4vw,1.9rem)] font-bold tracking-tight">
            {part}, {firstName} 👋
          </h1>
          <p className="mt-0.5 text-[0.9rem] text-[#5b7396]">{subtitle}</p>

          <StatsCards counts={counts} active={filter} onSelect={(key) => setFilter((f) => (f === key && key !== "all" ? "all" : key))} />
          <ComplaintList
            complaints={visible}
            filter={filter}
            hasAny={complaints.length > 0}
            loading={loading}
            error={error}
            onRetry={() => load()}
          />
        </section>

        <ComplaintComposer onSubmit={handleSubmit} initial={initialDraft} />
      </main>

      {/* toast */}
      <div
        role="status"
        className={`fixed left-1/2 top-[18px] z-[100] w-max max-w-[92vw] -translate-x-1/2 rounded-full bg-[#12306a] px-5 py-3 text-center text-[0.86rem] font-semibold text-white shadow-[0_12px_30px_rgba(18,48,106,0.4)] transition-transform duration-400 ease-out ${toast ? "translate-y-0" : "-translate-y-24"}`}
      >
        {toast}
      </div>
    </div>
  );
}
