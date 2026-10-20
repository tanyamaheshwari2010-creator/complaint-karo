import { useEffect, useRef } from "react";

// These match the categories your backend accepts. Potholes and drains live under "Water".
const TOPICS = [
  { title: "Garbage", text: "Piles not collected, overflowing bins, dumping.", color: "#1fa463",
    icon: "M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z" },
  { title: "Water & waterlogging", text: "Leaks, blocked drains, flooded lanes and potholes.", color: "#3b9be8",
    icon: "M12 2.7c-.3.3-6 5.9-6 11A6 6 0 0 0 12 20a6 6 0 0 0 6-6.3c0-5.1-5.7-10.7-6-11Z" },
  { title: "Electricity", text: "Power faults, loose wires, damaged poles.", color: "#e0a100",
    icon: "M13 2 4 14h6l-1 8 9-12h-6l1-8Z" },
  { title: "Streetlight", text: "Lights that are off, flickering or broken.", color: "#6b6ff0",
    icon: "M9 21h6v-2h-2V9.9A5 5 0 0 0 17 5h-1.5A3.5 3.5 0 0 1 12 8.5 3.5 3.5 0 0 1 8.5 5H7a5 5 0 0 0 4 4.9V19H9v2Z" },
  { title: "Something else", text: "Anything else in your area that needs fixing.", color: "#e0527a",
    icon: "M6 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" },
];
const RADII = ["34px 34px 34px 10px", "34px 10px 34px 34px", "10px 34px 34px 34px", "34px 34px 10px 34px"];
const MASK = "linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent)";

function Topic({ t, i, hidden }) {
  return (
    <article
      aria-hidden={hidden || undefined}
      style={{ borderRadius: RADII[i % 4] }}
      className="w-[250px] flex-none bg-white/90 px-[22px] pb-[18px] pt-5 shadow-[0_12px_28px_rgba(47,111,184,0.16)] max-[920px]:w-[220px]"
    >
      <div
        style={{ background: `color-mix(in srgb, ${t.color} 16%, white)` }}
        className="mb-2.5 grid h-10 w-10 place-items-center rounded-[14px_14px_14px_5px]"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" style={{ fill: t.color }} aria-hidden="true">
          <path d={t.icon} />
        </svg>
      </div>
      <h3 className="text-base font-bold">{t.title}</h3>
      <p className="mt-0.5 text-[0.8rem] leading-snug text-[#5b7396]">{t.text}</p>
    </article>
  );
}

// A slow, endless row. It holds still while you hover, touch or focus it, and you can swipe it
// or use the arrow keys. With "reduce motion" switched on it does not move by itself at all.
export default function TopicsCarousel() {
  const trackRef = useRef(null);
  const st = useRef({ pos: 0, paused: false, timer: null });

  const hold = () => { clearTimeout(st.current.timer); st.current.paused = true; };
  const release = (ms = 0) => {
    clearTimeout(st.current.timer);
    st.current.timer = setTimeout(() => {
      st.current.pos = trackRef.current?.scrollLeft ?? 0;
      st.current.paused = false;
    }, ms);
  };

  useEffect(() => {
    const el = trackRef.current;
    const s = st.current;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const half = () => el.scrollWidth / 2; // the list is shown twice, so it can loop without a gap
    let raf;
    const frame = () => {
      if (!s.paused && !reduce) {
        s.pos += 0.45; // slow drift
        if (s.pos >= half()) s.pos -= half();
        el.scrollLeft = s.pos;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onVisibility = () => (document.hidden ? hold() : release());
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(s.timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const onScroll = () => {
    const el = trackRef.current;
    if (!st.current.paused) return;
    let p = el.scrollLeft;
    if (p >= el.scrollWidth / 2) { p -= el.scrollWidth / 2; el.scrollLeft = p; }
    st.current.pos = p;
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") { trackRef.current.scrollBy({ left: 270, behavior: "smooth" }); e.preventDefault(); }
    if (e.key === "ArrowLeft") { trackRef.current.scrollBy({ left: -270, behavior: "smooth" }); e.preventDefault(); }
  };

  return (
    <section className="relative z-[2] mx-auto max-w-[1180px] px-[clamp(16px,4vw,56px)] pb-2.5">
      <h2 className="text-[clamp(1.4rem,2.6vw,1.9rem)] font-bold tracking-tight">What you can report</h2>
      <p className="mt-1 text-[0.9rem] text-[#5b7396]">A few examples. Just describe your problem in your own words.</p>

      <div
        ref={trackRef}
        tabIndex={0}
        aria-label="Examples of problems you can report. It moves slowly by itself; swipe or use the arrow keys to move it."
        onPointerEnter={(e) => e.pointerType === "mouse" && hold()}
        onPointerLeave={(e) => e.pointerType === "mouse" && release()}
        onTouchStart={hold}
        onTouchEnd={() => release(2500)}
        onFocus={hold}
        onBlur={() => release()}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        style={{ WebkitMaskImage: MASK, maskImage: MASK }}
        className="mt-5 flex gap-[22px] overflow-x-auto px-1 pb-[30px] pt-1.5 [scrollbar-width:none] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#2f6fe0]/50 [&::-webkit-scrollbar]:hidden"
      >
        {TOPICS.map((t, i) => <Topic key={t.title} t={t} i={i} />)}
        {TOPICS.map((t, i) => <Topic key={`copy-${t.title}`} t={t} i={i} hidden />)}
      </div>
    </section>
  );
}
