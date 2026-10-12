import { useEffect, useRef, useState } from "react";

export default function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close when clicking outside or pressing Escape
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const initials = user.name.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "C";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex cursor-pointer items-center gap-2.5 rounded-full border border-[#cfe0f5] bg-white/90 py-[5px] pl-[5px] pr-3.5 text-[0.86rem] font-semibold text-[#14305e] shadow-[0_4px_14px_rgba(47,111,184,0.12)] max-[920px]:pr-[5px]"
      >
        <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-linear-to-br from-[#5b9bf5] to-[#2f6fe0] text-[0.8rem] font-bold text-white">
          {initials}
        </span>
        <span className="max-[920px]:hidden">{user.name}</span>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+10px)] z-30 w-[250px] rounded-[18px] border border-[#cfe0f5] bg-white p-3.5 shadow-[0_18px_40px_rgba(31,85,184,0.22)]">
          <div className="text-[0.95rem] font-bold">{user.name}</div>
          {user.email && <div className="mt-0.5 break-all text-[0.78rem] text-[#5b7396]">{user.email}</div>}
          <hr className="my-3 border-0 border-t border-[#cfe0f5]" />
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="w-full cursor-pointer rounded-xl bg-[#eef5ff] px-3 py-[9px] text-left text-[0.85rem] font-semibold text-[#1f55b8] hover:bg-[#dfeaff]"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
