import { useEffect, useState } from 'react';

const EVENT = 'sv-toast';
let seq = 0;

/** Muestra un aviso breve. type: 'success' | 'error' | 'info' */
// eslint-disable-next-line react-refresh/only-export-components
export function toast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { id: ++seq, message, type } }));
}

const ICONS = {
  success: <path d="M20 6 9 17l-5-5" />,
  error: <path d="M12 8v5M12 16.5v.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />,
  info: <path d="M12 16v-4M12 8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" />,
};

export function Toaster() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const onToast = (e) => {
      const item = e.detail;
      setItems((list) => [...list.slice(-3), item]);
      setTimeout(() => setItems((list) => list.filter((i) => i.id !== item.id)), 3200);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  return (
    <div className="toaster" role="status" aria-live="polite">
      {items.map((i) => (
        <div key={i.id} className={`toast toast--${i.type}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {ICONS[i.type] || ICONS.info}
          </svg>
          <span>{i.message}</span>
        </div>
      ))}
    </div>
  );
}
