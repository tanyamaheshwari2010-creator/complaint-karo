// Pill-shaped input with an icon on the right. Passes every prop to <input>.
export default function AuthInput({ icon, ...props }) {
  return (
    <div className="relative mb-4">
      <input
        {...props}
        className="h-11 w-full rounded-full border border-white/30 bg-white/10 pl-4.5 pr-12 text-[0.85rem] text-white outline-none transition placeholder:text-white/80 focus:border-amber-200/90 focus:bg-white/15 focus:ring-4 focus:ring-amber-300/20"
      />
      <span className="pointer-events-none absolute right-4.5 top-1/2 -translate-y-1/2">
        {icon}
      </span>
    </div>
  );
}
