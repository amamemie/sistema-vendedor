import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { useTranslation } from 'react-i18next';
import useChartTheme from '../../hooks/useChartTheme';
import { formatMoney } from '../../i18n/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function VentasMensualesChart({ ventasMensuales = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }) {
  const { t } = useTranslation();
  const { colors, base, theme } = useChartTheme();
  const meses = t('charts.months', { returnObjects: true });

  const data = {
    labels: meses,
    datasets: [{
      label: t('charts.salesBs'),
      data: ventasMensuales,
      backgroundColor: colors.accent,
      hoverBackgroundColor: colors.accent + 'cc',
      borderRadius: 8,
      borderSkipped: false,
      maxBarThickness: 36,
    }],
  };

  const options = {
    ...base,
    plugins: {
      ...base.plugins,
      legend: { display: false },
      tooltip: { ...base.plugins.tooltip, callbacks: { label: (c) => formatMoney(c.raw) } },
    },
    scales: { x: { ...base.scales.x, grid: { display: false } }, y: { ...base.scales.y, beginAtZero: true } },
  };

  return (
    <div style={{ height: 300 }}>
      <Bar key={theme} data={data} options={options} />
    </div>
  );
}
