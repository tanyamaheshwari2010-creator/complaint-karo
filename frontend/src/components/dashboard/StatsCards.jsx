import { useEffect, useRef, useState } from "react";

const CARDS = [
  {
    key: "all", label: "Total filed", hint: "Everything you've reported",
    color: "#2f6fe0", radius: "34px 34px 34px 10px", offset: false,
    icon: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 5v2h10V8H7Zm0 4v2h10v-2H7Zm0 4v2h6v-2H7Z",
  },
  {
    key: "pending", label: "Pending", hint: "Waiting to be picked up",
    color: "#e0a100", radius: "34px 10px 34px 34px", offset: true,
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5v5.4l4 2.4-1 1.7-5-3V7h2Z",
  },
  {
    key: "progress", label: "In progress", hint: "Someone is working on it",
    color: "#3b9be8", radius: "10px 34px 34px 34px", offset: false,
    icon: "M22 7.2 17.8 3l-1.4 1.4 1.6 1.6a6 6 0 0 0-7.7 7.7L3 20.6 4.4 22l7.3-7.3A6 6 0 0 0 19.4 7l1.6 1.6L22 7.2Z",
  },
  {
    key: "resolved", label: "Resolved", hint: "Fixed and closed",
    color: "#1fa463", radius: "34px 34px 10px 34px", offset: true,
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14.6-4-4 1.4-1.4 2.6 2.6 5-5 1.4 1.4-6.4 6.4Z",
  },
];

// numbers count up smoothly when they change
function useCountUp(value) {
  const [shown, setShown] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf;
    const step = (now) => {
      const p = Math.min((now - start) / 600, 1);
      const v = Math.round(from + (value - from) * (1 - Math.pow(1 - p, 3)));
      setShown(v);
      fromRef.current = v;
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return shown;
}

function StatCard({ card, value, active, onSelect }) {
  const shown = useCountUp(value);

  return (
    // the wrapper holds the downward offset, so the hover lift on the button doesn't cancel it
    <div className={card.offset ? "translate-y-[34px]" : ""}>
      <button
        type="button"
        aria-pressed={active}
        onClick={() => onSelect(card.key)}
        style={{
          borderRadius: card.radius,
          borderColor: active ? card.color : "transparent",
        }}
        className="flex w-full cursor-pointer flex-col gap-1 border-2 bg-white/90 px-5 pb-4 pt-[18px] text-left text-[#14305e] shadow-[0_12px_28px_rgba(47,111,184,0.16)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(47,111,184,0.24)] focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#2f6fe0]/45 max-[480px]:px-3.5 max-[480px]:pb-3 max-[480px]:pt-3.5"
      >
        <span
          style={{ background: `color-mix(in srgb, ${card.color} 16%, white)` }}
          className="mb-1 grid h-[38px] w-[38px] place-items-center rounded-[14px_14px_14px_5px]"
        >
          <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" style={{ fill: card.color }} aria-hidden="true">
            <path d={card.icon} />
          </svg>
        </span>
        <span style={{ color: card.color }} className="text-[2.2rem] font-bold leading-none max-[480px]:text-[1.8rem]">
          {shown}
        </span>
        <span className="text-[0.86rem] font-semibold">{card.label}</span>
        <span className="text-[0.72rem] text-[#5b7396] max-[480px]:hidden">{card.hint}</span>
      </button>
    </div>
  );
}

export default function StatsCards({ counts, active, onSelect }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-x-[22px] gap-y-4 pb-[34px] max-[480px]:gap-x-3.5 max-[480px]:gap-y-3">
      {CARDS.map((card) => (
        <StatCard
          key={card.key}
          card={card}
          value={counts[card.key]}
          active={active === card.key}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
