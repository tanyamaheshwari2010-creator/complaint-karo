import { useEffect, useRef } from "react";

const LAMP_W = 130;
const REST_LEN = 90; // wire length when the lamp is just hanging

export default function Lamp() {
  const lampRef = useRef(null);
  const wireRef = useRef(null);
  const sheenRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    const lamp = lampRef.current;
    const wire = wireRef.current;
    const sheen = sheenRef.current;
    const hint = hintRef.current;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Physics lives in plain variables (not React state) so there is no re-render per frame.
    const anchor = { x: window.innerWidth / 2, y: -4 };
    const pos = { x: anchor.x, y: REST_LEN };
    const vel = { x: 0, y: 0 };
    const target = { x: anchor.x, y: REST_LEN };
    const grab = { x: 0, y: 0 };
    let dragging = false;
    let rafId;
    const startTime = performance.now();

    const clamp = (x, y) => {
      const pad = LAMP_W / 2;
      return {
        x: Math.min(window.innerWidth - pad, Math.max(pad, x)),
        y: Math.min(window.innerHeight - 70, Math.max(40, y)),
      };
    };

    const goHome = () => {
      target.x = anchor.x;
      target.y = REST_LEN;
    };

    const hideHint = () => hint.classList.add("opacity-0");

    /* ----- mouse / touch ----- */
    const onDown = (e) => {
      dragging = true;
      lamp.setPointerCapture(e.pointerId);
      lamp.classList.add("cursor-grabbing");
      grab.x = e.clientX - pos.x;
      grab.y = e.clientY - pos.y;
      hideHint();
      e.preventDefault();
    };

    const onMove = (e) => {
      if (!dragging) return;
      const c = clamp(e.clientX - grab.x, e.clientY - grab.y);
      target.x = c.x;
      target.y = c.y;
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      lamp.classList.remove("cursor-grabbing");
      goHome(); // springs back and swings
    };

    /* ----- keyboard ----- */
    const onKey = (e) => {
      const step = 60;
      const moves = {
        ArrowDown: [0, step],
        ArrowUp: [0, -step],
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
      };
      if (moves[e.key]) {
        const c = clamp(target.x + moves[e.key][0], target.y + moves[e.key][1]);
        target.x = c.x;
        target.y = c.y;
        hideHint();
        e.preventDefault();
      } else if (e.key === "Escape" || e.key === "Home") {
        goHome();
      }
    };

    const onResize = () => {
      anchor.x = window.innerWidth / 2;
      if (dragging) {
        const c = clamp(target.x, target.y);
        target.x = c.x;
        target.y = c.y;
      } else {
        goHome();
      }
    };

    lamp.addEventListener("pointerdown", onDown);
    lamp.addEventListener("pointermove", onMove);
    lamp.addEventListener("pointerup", onUp);
    lamp.addEventListener("pointercancel", onUp);
    lamp.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);

    /* ----- animation loop ----- */
    const frame = (now) => {
      const k = dragging ? 0.22 : 0.045; // spring stiffness
      const d = dragging ? 0.62 : 0.91; // damping

      vel.x = (vel.x + (target.x - pos.x) * k) * d;
      vel.y = (vel.y + (target.y - pos.y) * k) * d;

      // tiny idle sway so the lamp always feels alive
      if (!dragging && !reduceMotion) vel.x += Math.sin((now - startTime) / 1100) * 0.06;

      pos.x += vel.x;
      pos.y += vel.y;

      // the lamp tilts to follow the wire, and its light goes with it
      const dx = pos.x - anchor.x;
      const dy = Math.max(pos.y - anchor.y, 1);
      const deg = Math.max(-75, Math.min(75, (Math.atan2(dx, dy) * 180) / Math.PI));

      lamp.style.transform = `translate(${pos.x - LAMP_W / 2}px, ${pos.y}px) rotate(${-deg}deg)`;

      // curved wire that trails behind the movement
      const midX = anchor.x + dx * 0.5 - vel.x * 2.2;
      const midY = anchor.y + (pos.y - anchor.y) * 0.55;
      const path = `M ${anchor.x} ${anchor.y} Q ${midX} ${midY} ${pos.x} ${pos.y}`;
      wire.setAttribute("d", path);
      sheen.setAttribute("d", path);

      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    const hintTimer = setTimeout(hideHint, 9000);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(hintTimer);
      window.removeEventListener("resize", onResize);
      lamp.removeEventListener("pointerdown", onDown);
      lamp.removeEventListener("pointermove", onMove);
      lamp.removeEventListener("pointerup", onUp);
      lamp.removeEventListener("pointercancel", onUp);
      lamp.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      {/* wire */}
      <svg className="pointer-events-none fixed inset-0 z-[9] h-full w-full overflow-visible" aria-hidden="true">
        <path ref={wireRef} fill="none" stroke="#0a0f1f" strokeWidth="3" strokeLinecap="round" />
        <path ref={sheenRef} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      </svg>

      {/* lamp: glow and beam are children, so they rotate with the lamp */}
      <div
        ref={lampRef}
        tabIndex={0}
        role="button"
        aria-label="Lamp. Drag it to move the light."
        className="fixed left-0 top-0 z-10 h-16 w-[130px] origin-top cursor-grab touch-none select-none outline-none will-change-transform focus-visible:drop-shadow-[0_0_6px_#7fb2ff]"
      >
        <div className="lamp-glow pointer-events-none absolute left-1/2 top-[52px] h-[220px] w-[340px] -translate-x-1/2 mix-blend-screen" />
        <div className="lamp-beam pointer-events-none absolute left-1/2 top-[58px] h-[640px] w-[640px] -translate-x-1/2 mix-blend-screen" />

        <svg viewBox="0 0 130 64" className="block h-full w-full overflow-visible" aria-hidden="true">
          <rect x="58" y="0" width="14" height="9" rx="2" fill="#10162a" />
          <path d="M18 54 C18 26 40 10 65 10 C90 10 112 26 112 54 Z" fill="#161d36" />
          <path d="M26 50 C28 30 44 16 65 16" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="2" strokeLinecap="round" />
          <rect x="14" y="52" width="102" height="6" rx="3" fill="#fff1bf" />
          <ellipse cx="65" cy="59" rx="40" ry="4" fill="#ffe08a" />
        </svg>
      </div>

      <p
        ref={hintRef}
        className="pointer-events-none fixed inset-x-0 bottom-3.5 z-[6] text-center text-[0.72rem] text-white/55 transition-opacity duration-700"
      >
        Drag the lamp to move the light
      </p>
    </>
  );
}
