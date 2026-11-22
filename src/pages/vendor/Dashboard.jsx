import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './vendor.css';
import VentasChart from '../../components/vendor/VentasChart';
import Tilt from '../../components/ui/Tilt';
import CountUp from '../../components/ui/CountUp';
import { formatMoney, formatDate, formatNumber } from '../../i18n/format';

function Metric({ label, value, icon, tone, format, index }) {
  return (
    <Tilt className={`metric metric--${tone}`} style={{ '--i': index }} max={8}>
      <div className="metric-icon tilt-pop"><i className={`ti ti-${icon}`} aria-hidden="true" /></div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">
        <CountUp value={value} format={format} />
      </div>
    </Tilt>
  );
}

export default function VendorDashboard({ onNavigate }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState({ ventasMes: 0, pedidosMes: 0, productosActivos: 0, calificacion: 0 });
  const [ventasSemana, setVentasSemana] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const [productosBajoStock, setProductosBajoStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDashboard = async () => {
      setLoading(true);
      try {
        const productos = await api.getProductos(user?.id_tienda);
        if (Array.isArray(productos)) {
          const activos = productos.filter((p) => p.estado === 'Activo').length;
          setProductosBajoStock(productos.filter((p) => p.stock > 0 && p.stock <= 5).slice(0, 5));
          setStats((prev) => ({ ...prev, productosActivos: activos }));
        }

        const pedidos = (await api.getPedidosVendedor?.(user?.id_tienda)) || [];
        if (Array.isArray(pedidos)) {
          const mesActual = new Date().getMonth();
          const pedidosMes = pedidos.filter((p) => new Date(p.fecha_compra).getMonth() === mesActual);
          const ventasMes = pedidosMes.reduce((sum, p) => sum + parseFloat(p.total_bruto || 0), 0);
          setStats((prev) => ({ ...prev, ventasMes, pedidosMes: pedidosMes.length }));
          setPedidosRecientes(pedidos.slice(0, 5));
        }

        // Ventas semanales de referencia (en producción vendrían de la API)
        setVentasSemana([120, 250, 180, 320, 280, 450, 380]);
      } catch (error) {
        console.error('Error cargando dashboard:', error);
      }
      setLoading(false);
    };
    cargarDashboard();
  }, [user?.id_tienda]);

  if (loading) {
    return (
      <div className="vendor-content">
        <div className="metrics">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 132, borderRadius: 16 }} />)}
        </div>
        <div className="skeleton" style={{ height: 320, borderRadius: 16, marginTop: 20 }} />
      </div>
    );
  }

  const int = (n) => formatNumber(Math.round(n));

  return (
    <div className="vendor-content">
      <div className="metrics stagger">
        <Metric index={0} label={t('vendor.dash.salesMonth')} value={stats.ventasMes} icon="cash" tone="accent" format={formatMoney} />
        <Metric index={1} label={t('vendor.dash.orders')} value={stats.pedidosMes} icon="shopping-cart" tone="info" format={int} />
        <Metric index={2} label={t('vendor.dash.activeProducts')} value={stats.productosActivos} icon="package" tone="warning" format={int} />
        <Metric index={3} label={t('vendor.dash.rating')} value={stats.calificacion} icon="star" tone="star" format={(n) => `${n.toFixed(1)} ★`} />
      </div>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2>{t('vendor.dash.last7')}</h2>
            <p>{t('vendor.dash.last7Hint')}</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onNavigate?.('analisis')}>
            {t('vendor.dash.seeMore')} <i className="ti ti-arrow-right" aria-hidden="true" />
          </button>
        </header>
        <VentasChart ventasSemana={ventasSemana} />
      </section>

      <div className="panel-grid">
        <section className="panel">
          <header className="panel-head">
            <h2>{t('vendor.dash.recentOrders')}</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onNavigate?.('pedidos')}>
              {t('vendor.dash.seeAll')} <i className="ti ti-arrow-right" aria-hidden="true" />
            </button>
          </header>
          {pedidosRecientes.length === 0 ? (
            <div className="empty-state"><i className="ti ti-inbox" style={{ fontSize: 28 }} aria-hidden="true" />{t('vendor.dash.noOrders')}</div>
          ) : (
            <ul className="list stagger">
              {pedidosRecientes.map((p, i) => (
                <li key={p.id_compra} className="list-row" style={{ '--i': i }}>
                  <span className="list-avatar"><i className="ti ti-receipt" aria-hidden="true" /></span>
                  <div className="list-main">
                    <strong>#{p.id_compra}</strong>
                    <span>{formatDate(p.fecha_compra)}</span>
                  </div>
                  <span className="list-amount">{formatMoney(p.total_bruto)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <header className="panel-head">
            <h2>{t('vendor.dash.lowStock')}</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onNavigate?.('productos')}>
              {t('vendor.dash.manage')} <i className="ti ti-arrow-right" aria-hidden="true" />
            </button>
          </header>
          {productosBajoStock.length === 0 ? (
            <div className="empty-state"><i className="ti ti-circle-check" style={{ fontSize: 28, color: 'var(--success)' }} aria-hidden="true" />{t('vendor.dash.stockOk')}</div>
          ) : (
            <ul className="list stagger">
              {productosBajoStock.map((p, i) => (
                <li key={p.id_producto} className="list-row" style={{ '--i': i }}>
                  <span className="list-avatar list-avatar--warn"><i className="ti ti-alert-triangle" aria-hidden="true" /></span>
                  <div className="list-main"><strong>{p.nombre}</strong></div>
                  <span className="badge badge-error">{t('vendor.dash.units', { count: Number(p.stock) })}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
