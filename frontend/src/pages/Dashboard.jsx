import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearToken } from "../api/client.js";
import { clearUser, getUser } from "../api/session.js";
// import { mockComplaints } from "../data/mockComplaints.js";
import ComplaintComposer from "../components/dashboard/ComplaintComposer.jsx";
import ComplaintList from "../components/dashboard/ComplaintList.jsx";
import ProfileMenu from "../components/dashboard/ProfileMenu.jsx";
import RoadScene from "../components/dashboard/RoadScene.jsx";
import StatsCards from "../components/dashboard/StatsCards.jsx";
import "../styles/dashboard.css";
function formatComplaint(complaint) {
  const statusMap = {
    submitted: "pending",
    under_review: "pending",
    assigned: "progress",
    in_progress: "progress",
    resolved: "resolved",
  };

  const description = complaint.description ?? "";

  return {
    id: `CMP-${complaint._id.slice(-6).toUpperCase()}`,
    title:
      description.length > 60
        ? `${description.slice(0, 57)}…`
        : description,
    place: complaint.location || "Location not provided",
    status: statusMap[complaint.status] ?? "pending",
    update: complaint.createdAt
      ? `Submitted · ${new Date(complaint.createdAt).toLocaleString()}`
      : "Submitted",
  };
}



export default function Dashboard() {
  const navigate = useNavigate();

  // Name/email come from what was saved at login (see api/session.js).
  // Until your backend sends them, this shows a plain "Citizen".
  const user = useMemo(() => getUser(), []);

  // TODO: load this from your backend instead of demo data, e.g. api.myComplaints()
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [complaintsError, setComplaintsError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadComplaints() {
      try {
        setComplaintsError("");

        const data = await api.myComplaints();

        if (active) {
          setComplaints(
            (data.complaints ?? []).map(formatComplaint)
          );
        }
      } catch (error) {
        if (active) {
          setComplaintsError(error.message);
        }
      } finally {
        if (active) {
          setComplaintsLoading(false);
        }
      }
    }

    loadComplaints();

    return () => {
      active = false;
    };
  }, []);

  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState("");
  const toastTimer = useRef();

  const counts = useMemo(
    () => ({
      all: complaints.length,
      pending: complaints.filter((c) => c.status === "pending").length,
      progress: complaints.filter((c) => c.status === "progress").length,
      resolved: complaints.filter((c) => c.status === "resolved").length,
    }),
    [complaints]
  );

  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user.name.split(" ")[0];

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  };

  const handleLogout = () => {
    clearToken();
    clearUser();
    navigate("/login");
  };

  const handleSubmit = async ({ description, location }) => {
    const data = await api.createComplaint({
      description: description.trim(),
      location: location.trim(),
    });

    const savedComplaint = formatComplaint(data.complaint);

    setComplaints((previous) => [
      savedComplaint,
      ...previous,
    ]);

    setFilter("all");
    showToast("Complaint submitted successfully!");
  };

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
        <ProfileMenu user={user} onLogout={handleLogout} />
      </header>

      {/* content */}
      <main className="relative z-[5] mx-auto grid max-w-[1180px] items-start gap-[26px] pt-2 min-[921px]:grid-cols-[minmax(0,1fr)_420px] min-[921px]:gap-[38px]">
        <section>
          <h1 className="text-[clamp(1.4rem,2.4vw,1.9rem)] font-bold tracking-tight">
            {part}, {firstName} 👋
          </h1>
          <p className="mt-0.5 text-[0.9rem] text-[#5b7396]">
            {counts.progress
              ? `${counts.progress} of your complaints ${counts.progress === 1 ? "is" : "are"} being worked on right now.`
              : "Nothing is being worked on right now."}
          </p>


          {complaintsLoading && (
            <p className="mt-4 text-sm text-[#5b7396]">
              Loading your complaints…
            </p>
          )}

          {complaintsError && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              Could not load complaints: {complaintsError}
            </p>
          )}

          <StatsCards counts={counts} active={filter} onSelect={setFilter} />
          <ComplaintList complaints={complaints} filter={filter} />
        </section>

        <ComplaintComposer onSubmit={handleSubmit} />
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
