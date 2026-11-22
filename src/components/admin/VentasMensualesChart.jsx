import { Bar } from 'react-chartjs-2';

export default function VentasMensualesChart({ ventasMensuales = [0,0,0,0,0,0,0,0,0,0,0,0] }) {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  const data = {
    labels: meses,
    datasets: [{
      label: 'Ventas (Bs.)',
      data: ventasMensuales,
      backgroundColor: 'var(--accent)',
      borderRadius: 8,
      borderColor: '#fff',
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } }
  };

  return (
    <div style={{ height: 300 }}>
      <Bar data={data} options={options} />
    </div>
  );
}