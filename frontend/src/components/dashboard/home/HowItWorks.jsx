const STEPS = [
  { n: 1, title: "Tell us", text: "Type it, or say it out loud, in English or हिन्दी. A few words are enough.", color: "#2f6fe0", radius: "34px 34px 34px 10px", drop: false },
  { n: 2, title: "We send it on", text: "Your complaint goes to the right team for the problem.", color: "#6b6ff0", radius: "34px 10px 34px 34px", drop: true },
  { n: 3, title: "See it get fixed", text: "Follow every step from your own page, until the job is done.", color: "#1fa463", radius: "10px 34px 34px 34px", drop: false },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative z-[2] mx-auto max-w-[1180px] scroll-mt-4 px-[clamp(16px,4vw,56px)] pb-12">
      <h2 className="text-[clamp(1.4rem,2.6vw,1.9rem)] font-bold tracking-tight">How it works</h2>
      <p className="mt-1 text-[0.9rem] text-[#5b7396]">Three simple steps.</p>

      <div className="mt-5 grid grid-cols-3 gap-[22px] pb-6 max-[920px]:grid-cols-1 max-[920px]:gap-3.5">
        {STEPS.map((s) => (
          <div
            key={s.n}
            style={{ borderRadius: s.radius }}
            className={`bg-white/90 px-[22px] pb-5 pt-[22px] shadow-[0_12px_28px_rgba(47,111,184,0.16)] ${s.drop ? "min-[921px]:translate-y-6" : ""}`}
          >
            <div
              style={{ background: `color-mix(in srgb, ${s.color} 16%, white)`, color: s.color }}
              className="mb-2.5 grid h-[38px] w-[38px] place-items-center rounded-[14px_14px_14px_5px] font-bold"
            >
              {s.n}
            </div>
            <h3 className="text-[1.05rem] font-bold">{s.title}</h3>
            <p className="mt-1 text-[0.86rem] leading-normal text-[#5b7396]">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
