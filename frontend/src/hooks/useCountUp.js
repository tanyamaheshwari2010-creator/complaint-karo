import { useEffect, useRef, useState } from "react";

// Numbers count up smoothly when the value changes.
export default function useCountUp(value) {
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
