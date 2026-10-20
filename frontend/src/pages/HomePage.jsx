import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getToken } from "../api/client.js";
import { saveDraft } from "../api/draft.js";
import { getUser, homePathFor, isReturningVisitor } from "../api/session.js";
import ComplaintComposer from "../components/dashboard/ComplaintComposer.jsx";
import HowItWorks from "../components/home/HowItWorks.jsx";
import StreetScene from "../components/home/StreetScene.jsx";
import TopicsCarousel from "../components/home/TopicsCarousel.jsx";
import "../styles/dashboard.css"; // the brick wall, road and the garbage/pothole animations
import "../styles/home.css";      // the street light flicker

const linkBtn = "rounded-full px-[18px] py-[9px] text-[0.86rem] font-semibold text-[#1f55b8] transition-colors hover:bg-white/70 max-[640px]:px-3";
const fillBtn = "rounded-full bg-linear-to-br from-[#4b8bf0] to-[#2457c5] px-5 py-[9px] text-[0.86rem] font-semibold text-white shadow-[0_8px_18px_rgba(47,111,224,0.35)] transition-shadow hover:shadow-[0_12px_24px_rgba(47,111,224,0.5)]";

export default function HomePage() {
  const navigate = useNavigate();

  // Who is looking at the page? (read once when the page opens)
  const status = useMemo(() => {
    if (getToken()) return { kind: "in", to: homePathFor(getUser().role) };
    return { kind: isReturningVisitor() ? "returning" : "new" };
  }, []);

  // IMPORTANT: this page never sends a complaint. It only keeps what the visitor wrote and moves them on:
  //   logged in          -> /dashboard  (they review it and press Submit there)
  //   used the app before -> /login
  //   first time          -> /signup
  const handleReport = async ({ description, location, photo }) => {
    saveDraft({ description, location, photo });
    navigate(status.kind === "in" ? "/dashboard" : status.kind === "returning" ? "/login" : "/signup");
  };

  const goHow = (e) => {
    e.preventDefault();
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("how")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="font-sans text-[#14305e]">
      <div className="relative overflow-hidden">
        <div className="dash-wall absolute inset-0 z-0" />

        {/* header */}
        <header className="relative z-[2] mx-auto flex max-w-[1180px] items-center justify-between px-[clamp(16px,4vw,56px)] pb-2 pt-[18px]">
          <Link to="/" className="flex items-center gap-2.5 font-bold">
            <span className="grid h-[38px] w-[38px] place-items-center rounded-[12px_12px_12px_4px] bg-linear-to-br from-[#4b8bf0] to-[#2457c5] shadow-[0_6px_14px_rgba(47,111,224,0.35)]" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm1 14h-2v-2h2v2Zm0-4h-2V7h2v5Z" />
              </svg>
            </span>
            Civic Complaint Desk
          </Link>
          <nav aria-label="Account" className="flex items-center gap-2">
            {status.kind === "in" ? (
              <Link to={status.to} className={fillBtn}>My dashboard</Link>
            ) : (
              <>
                <Link to="/login" className={linkBtn}>Login</Link>
                <Link to="/signup" className={fillBtn}>Sign up</Link>
              </>
            )}
          </nav>
        </header>

        <main className="relative z-[2]">
          {/* headline + report box */}
          {/* items-start keeps the headline fixed at the top, so a taller report box can't move or stretch it */}
          <section className="mx-auto grid max-w-[1180px] items-start gap-12 px-[clamp(16px,4vw,56px)] pb-10 pt-8 max-[920px]:gap-7 max-[920px]:pt-4 min-[921px]:grid-cols-[minmax(0,1fr)_440px]">
            <div className="min-w-0 self-start">
              <h1 className="text-[clamp(2.1rem,4.8vw,3.5rem)] font-bold leading-[1.1] tracking-tight">
                See a problem on <span className="text-[#2f6fe0]">your street?</span>
              </h1>
              <p className="mt-4 max-w-[30em] text-[clamp(1rem,1.5vw,1.2rem)] text-[#5b7396]">
                Tell us what's happening. We'll try to solve it.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-[999px_999px_999px_6px] bg-white/85 px-4 py-2 text-[0.82rem] font-semibold text-[#1f55b8] shadow-[0_6px_16px_rgba(47,111,184,0.12)]">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V22h2v-3.1A7 7 0 0 0 19 12h-2Z" />
                </svg>
                Write or speak your complaint in English or हिन्दी
              </div>
              <a href="#how" onClick={goHow} className="mt-5 block text-[0.86rem] font-semibold text-[#1f55b8] hover:underline">
                How it works ↓
              </a>
            </div>

            <ComplaintComposer
              onSubmit={handleReport}
              submitLabel="Report a problem"
              busyLabel="One moment…"
              requireLocation={false}
              className=""
            >
              <p className="mt-3 text-center text-[0.76rem] leading-normal text-[#5b7396]">
                {status.kind === "in" && <>We'll take you to your dashboard to send it. Your words are saved.</>}
                {status.kind === "returning" && <>Please log in to send it. Your words are saved.</>}
                {status.kind === "new" && (
                  <>
                    You'll need to sign up to send it. Your words are saved.
                    <br />
                    Already have an account?{" "}
                    <Link to="/login" className="font-bold text-[#1f55b8] hover:underline">Log in</Link>
                  </>
                )}
              </p>
            </ComplaintComposer>
          </section>

          <HowItWorks />
          <TopicsCarousel />
          <StreetScene />
        </main>
      </div>

      {/* footer: a separate block, not part of the scene */}
      <footer className="bg-[#12306a] py-[30px] text-[#cfe0f5]">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-[clamp(16px,4vw,56px)] max-[640px]:flex-col max-[640px]:items-start">
          <div>
            <div className="font-bold text-white">Civic Complaint Desk</div>
            <p className="mt-0.5 text-[0.8rem]">Helping neighbourhoods get problems fixed.</p>
          </div>
          <nav aria-label="Footer" className="flex gap-5 text-[0.82rem]">
            {/* TODO: point these at real pages when they exist */}
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white hover:underline">Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white hover:underline">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
