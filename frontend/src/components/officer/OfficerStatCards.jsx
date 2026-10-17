import useCountUp from "../../hooks/useCountUp.js";

const CARDS = [
  { key: "submitted", label: "Awaiting review", hint: "New, nobody has looked yet", color: "#e0a100", radius: "34px 34px 34px 10px", offset: false,
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5v5.4l4 2.4-1 1.7-5-3V7h2Z" },
  { key: "under_review", label: "Reviewed", hint: "Ready to assign a worker", color: "#3b9be8", radius: "34px 10px 34px 34px", offset: true,
    icon: "M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" },
  { key: "assigned", label: "Assigned", hint: "A worker is on it", color: "#6b6ff0", radius: "10px 34px 34px 34px", offset: false,
    icon: "M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm8 2c-3 0-8 1.5-8 4.5V20h16v-2.5c0-3-5-4.5-8-4.5Zm-8 .1C4.7 13.3 1 14.4 1 17v3h5v-2.5c0-1.7.9-3 2-3.9Z" },
  { key: "unsure", label: "AI unsure", hint: "Low confidence or failed", color: "#e0527a", radius: "34px 34px 10px 34px", offset: true,
    icon: "M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" },
];

function StatCard({ card, value, active, onSelect }) {
  const shown = useCountUp(value);

  return (
    // The wrapper holds the downward offset.
    <div className={card.offset ? "translate-y-[34px]" : ""}>
      {/*
        FLICKER FIX: the button itself never moves, so the area under the cursor stays put.
        Only the inner "face" lifts on hover. Before, the whole button lifted 4px, which pushed
        the cursor off the bottom edge, which dropped the card, which lifted it again... forever.
      */}
      <button
        type="button"
        aria-pressed={active}
        onClick={() => onSelect(card.key)}
        style={{ borderRadius: card.radius }}
        className="group block w-full cursor-pointer text-left text-[#14305e] focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#2f6fe0]/45"
      >
        <span
          style={{ borderRadius: card.radius, borderColor: active ? card.color : "transparent" }}
          className="flex flex-col gap-1 border-2 bg-white/90 px-5 pb-3.5 pt-4 shadow-[0_12px_28px_rgba(47,111,184,0.16)] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_16px_34px_rgba(47,111,184,0.24)] max-[480px]:px-3.5 max-[480px]:pb-3 max-[480px]:pt-3.5"
        >
          <span
            style={{ background: `color-mix(in srgb, ${card.color} 16%, white)` }}
            className="mb-0.5 grid h-9 w-9 place-items-center rounded-[14px_14px_14px_5px]"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" style={{ fill: card.color }} aria-hidden="true">
              <path d={card.icon} />
            </svg>
          </span>
          <span style={{ color: card.color }} className="text-[2.1rem] font-bold leading-none max-[480px]:text-[1.75rem]">
            {shown}
          </span>
          <span className="text-[0.86rem] font-semibold">{card.label}</span>
          <span className="text-[0.72rem] text-[#5b7396] max-[480px]:hidden">{card.hint}</span>
        </span>
      </button>
    </div>
  );
}

export default function OfficerStatCards({ counts, active, onSelect }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-x-[22px] gap-y-4 pb-[34px] max-[480px]:gap-x-3.5 max-[480px]:gap-y-3">
      {CARDS.map((card) => (
        <StatCard key={card.key} card={card} value={counts[card.key]} active={active === card.key} onSelect={onSelect} />
      ))}
    </div>
  );
}
