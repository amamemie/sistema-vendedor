import { useEffect, useRef, useState } from 'react';

/** Número que cuenta desde 0 hasta `value`. `format` recibe el número y devuelve el texto. */
export default function CountUp({ value, duration = 900, format = (n) => Math.round(n).toLocaleString() }) {
  const target = Number(value) || 0;
  const [n, setN] = useState(target);
  const from = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setN(target);
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(origin + (target - origin) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return <span className="count-up">{format(n)}</span>;
}
