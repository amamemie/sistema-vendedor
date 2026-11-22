import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { useTranslation } from 'react-i18next';
import useChartTheme from '../../hooks/useChartTheme';
import { formatMoney } from '../../i18n/format';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function VentasChart({ ventasSemana = [0, 0, 0, 0, 0, 0, 0] }) {
  const { t } = useTranslation();
  const { colors, base, theme } = useChartTheme();
  const dias = t('charts.weekdays', { returnObjects: true });

  const data = {
    labels: dias,
    datasets: [{
      label: t('charts.salesBs'),
      data: ventasSemana,
      fill: true,
      backgroundColor: (ctx) => {
        const { chart } = ctx;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return colors.accentSoft;
        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, colors.accent + '55');
        g.addColorStop(1, colors.accent + '00');
        return g;
      },
      borderColor: colors.accent,
      borderWidth: 2.5,
      tension: 0.4,
      pointBackgroundColor: colors.accent,
      pointBorderColor: colors.surface,
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 7,
    }],
  };

  const options = {
    ...base,
    animation: { duration: 900, easing: 'easeOutQuart' },
    plugins: {
      ...base.plugins,
      legend: { display: false },
      tooltip: { ...base.plugins.tooltip, callbacks: { label: (c) => formatMoney(c.raw) } },
    },
    scales: {
      x: base.scales.x,
      y: { ...base.scales.y, beginAtZero: true, ticks: { ...base.scales.y.ticks, callback: (v) => `Bs. ${v}` } },
    },
  };

  return (
    <div style={{ height: 260, width: '100%' }}>
      <Line key={theme} data={data} options={options} />
    </div>
  );
}
