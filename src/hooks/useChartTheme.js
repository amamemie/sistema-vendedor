import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

const read = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** Colores de Chart.js leídos de los tokens; cambian con el tema. */
export default function useChartTheme() {
  const { theme } = useTheme();
  return useMemo(() => {
    const c = {
      accent: read('--accent'),
      accentSoft: read('--accent-soft'),
      text: read('--text-2'),
      muted: read('--text-3'),
      grid: read('--border'),
      surface: read('--surface'),
      border: read('--border-strong'),
      series: [read('--accent'), read('--info'), read('--warning'), read('--danger'), read('--success'), read('--gray-500')],
    };
    const base = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: c.text, font: { family: 'Inter', size: 12 }, usePointStyle: true, boxWidth: 8 } },
        tooltip: {
          backgroundColor: c.surface,
          titleColor: read('--text'),
          bodyColor: c.text,
          borderColor: c.border,
          borderWidth: 1,
          padding: 10,
          cornerRadius: 10,
        },
      },
      scales: {
        x: { ticks: { color: c.muted }, grid: { color: c.grid, drawTicks: false }, border: { display: false } },
        y: { ticks: { color: c.muted }, grid: { color: c.grid, drawTicks: false }, border: { display: false } },
      },
    };
    return { colors: c, base, theme };
  }, [theme]);
}
