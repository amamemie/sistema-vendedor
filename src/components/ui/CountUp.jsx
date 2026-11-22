import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '../../i18n/format';

/** Número que cuenta desde 0 hasta `value`. `format` recibe el número y devuelve el texto. */
export default function CountUp({ value, duration = 900, format = (n) => formatNumber(Math.round(n)) }) {
  const target = Number(value) || 0;
  const [n, setN] = useState(target);
  const from = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const total = reduce ? 0 : duration;
    const start = performance.now();
    const origin = from.current;
    let raf;
    const tick = (now) => {
      const p = total === 0 ? 1 : Math.min(1, (now - start) / total);
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
