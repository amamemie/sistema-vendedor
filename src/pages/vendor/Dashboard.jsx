import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './vendor.css';
import { formatearPrecio } from './vendor.utils';
import VentasChart from '../../components/vendor/VentasChart';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    ventasMes: 0,
    pedidosMes: 0,
    productosActivos: 0,
    calificacion: 0
  });
  const [ventasSemana, setVentasSemana] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const [productosBajoStock, setProductosBajoStock] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarDashboard = async () => {
    setLoading(true);
    try {
      // Cargar productos del vendedor
      const productos = await api.getProductos(user?.id_tienda);
      if (Array.isArray(productos)) {
        const activos = productos.filter(p => p.estado === 'Activo').length;
        const bajoStock = productos.filter(p => p.stock > 0 && p.stock <= 5);
        setProductosBajoStock(bajoStock.slice(0, 5));
        setStats(prev => ({ ...prev, productosActivos: activos }));
      }

      // Cargar pedidos
      const pedidos = await api.getPedidosVendedor?.(user?.id_tienda) || [];
      if (Array.isArray(pedidos)) {
        const mesActual = new Date().getMonth();
        const pedidosMes = pedidos.filter(p => new Date(p.fecha_compra).getMonth() === mesActual);
        const ventasMes = pedidosMes.reduce((sum, p) => sum + parseFloat(p.total_bruto || 0), 0);
        
        setStats(prev => ({ ...prev, ventasMes, pedidosMes: pedidosMes.length }));
        setPedidosRecientes(pedidos.slice(0, 4));
      }

      // Ventas semanales (en producción vendría de API)
      setVentasSemana([120, 250, 180, 320, 280, 450, 380]);
      
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarDashboard();
  }, [user?.id_tienda]);

  const MetricCard = ({ label, value, change, changeType, icon, color }) => (
    <div className="dashboard-card">
      <div className="dashboard-card-icon" style={{ background: `${color}15`, color }}>
        <i className={`ti ti-${icon}`}></i>
      </div>
      <div className="dashboard-card-info">
        <div className="dashboard-card-label">{label}</div>
        <div className="dashboard-card-value">{typeof value === 'number' ? formatearPrecio(value) : value}</div>
        {change && <div className={`dashboard-card-change ${changeType === 'up' ? 'change-up' : changeType === 'down' ? 'change-down' : 'change-neutral'}`}>{change}</div>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="vendor-content">
        <div style={{ textAlign: 'center', padding: 60 }}>Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="vendor-content">
      {/* Tarjetas de métricas */}
      <div className="dashboard-stats">
        <MetricCard label="Ventas del mes" value={stats.ventasMes} icon="cash" color="var(--success)" />
        <MetricCard label="Pedidos" value={stats.pedidosMes} icon="shopping-cart" color="var(--accent)" />
        <MetricCard label="Productos activos" value={stats.productosActivos} icon="package" color="var(--warning)" />
        <MetricCard label="Calificación" value={`${stats.calificacion} ★`} icon="star" color="var(--accent)" />
      </div>

      {/* Gráfico de ventas semanales */}
      <div className="dashboard-chart">
        <div className="dashboard-chart-header">
          <span className="dashboard-chart-title">Ventas de los últimos 7 días</span>
          <span className="dashboard-chart-link">Ver más →</span>
        </div>
        <div style={{ height: 280, marginTop: 8 }}>
          <VentasChart ventasSemana={ventasSemana} />
        </div>
      </div>

      {/* Pedidos recientes y Stock bajo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        {/* Pedidos recientes */}
        <div className="dashboard-chart">
          <div className="dashboard-chart-header">
            <span className="dashboard-chart-title">Pedidos recientes</span>
            <span className="dashboard-chart-link">Ver todos →</span>
          </div>
          {pedidosRecientes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>No hay pedidos recientes</div>
          ) : (
            pedidosRecientes.map(p => (
              <div key={p.id_compra} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-200)' }}>
                <span style={{ fontWeight: 500 }}>#{p.id_compra}</span>
                <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{new Date(p.fecha_compra).toLocaleDateString()}</span>
                <span>{formatearPrecio(p.total_bruto)}</span>
              </div>
            ))
          )}
        </div>

        {/* Productos con stock bajo */}
        <div className="dashboard-chart">
          <div className="dashboard-chart-header">
            <span className="dashboard-chart-title">Productos con stock bajo</span>
            <span className="dashboard-chart-link">Gestionar →</span>
          </div>
          {productosBajoStock.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>✓ Todos los productos tienen stock suficiente</div>
          ) : (
            productosBajoStock.map(p => (
              <div key={p.id_producto} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-200)' }}>
    <span>{p.nombre}</span>
    <span style={{ color: 'var(--error)', fontWeight: 600 }}>{p.stock} und.</span>
  </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}