import { useEffect, useRef, useState } from "react";

// Numbers count up smoothly when the value changes.
export default function useCountUp(value) {
  const [shown, setShown] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf;
    const step = () => {
      // use performance.now() (same clock as `start`) and keep p between 0 and 1,
      // so the number can never flicker negative or overshoot
      const p = Math.min(Math.max((performance.now() - start) / 600, 0), 1);
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
