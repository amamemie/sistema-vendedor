import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import Tilt from '../../components/ui/Tilt';
import CountUp from '../../components/ui/CountUp';
import { formatMoney } from '../../i18n/format';
import './admin.css';

export default function ResumenAdmin() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsuarios: 0, totalVendedores: 0, productosPendientes: 0, devolucionesPendientes: 0, solicitudesVendedores: 0,
    pedidosMes: 0, ingresosMes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      setLoading(true);
      try {
        const usuarios = await api.getUsuarios();
        const vendedores = Array.isArray(usuarios) ? usuarios.filter((u) => u.rol === 'Vendedor') : [];
        const productosPend = await api.getProductosPendientes();
        const productosArray = Array.isArray(productosPend) ? productosPend : [];
        const devoluciones = await api.getSolicitudesDevolucion();
        const devolucionesArray = Array.isArray(devoluciones) ? devoluciones : [];
        const devolucionesPendientes = devolucionesArray.filter((d) => d.solicita_devolucion === 'Pendiente').length;

        let solicitudesVendedores = 0;
        try {
          const solicitudesRes = await fetch('http://localhost/sistema-vendedor/backend/solicitudes_vendedores.php');
          const solicitudes = await solicitudesRes.json();
          solicitudesVendedores = Array.isArray(solicitudes) ? solicitudes.length : 0;
        } catch (err) {
          console.error('Error cargando solicitudes de vendedores:', err);
        }

        // Estadísticas del mes (admin_stats.php)
        const mes = await api.getAdminStats();
        const ingresosMes = mes?.success ? Number(String(mes.ingresos).replace(/,/g, '')) || 0 : 0;

        setStats({
          pedidosMes: mes?.success ? Number(mes.pedidos) || 0 : 0,
          ingresosMes,
          totalUsuarios: Array.isArray(usuarios) ? usuarios.length : 0,
          totalVendedores: vendedores.length,
          productosPendientes: productosArray.length,
          devolucionesPendientes,
          solicitudesVendedores,
        });
      } catch (err) {
        console.error('Error cargando estadísticas:', err);
      } finally {
        setLoading(false);
      }
    };
    cargarEstadisticas();
  }, []);

  const cards = [
    { label: t('admin.summary.monthRevenue'), value: stats.ingresosMes, icon: 'ti-cash', tone: 'accent', format: formatMoney },
    { label: t('admin.summary.monthOrders'), value: stats.pedidosMes, icon: 'ti-receipt', tone: 'info' },
    { label: t('admin.summary.users'), value: stats.totalUsuarios, icon: 'ti-users', tone: 'accent' },
    { label: t('admin.summary.sellers'), value: stats.totalVendedores, icon: 'ti-building-store', tone: 'success' },
    { label: t('admin.summary.requests'), value: stats.solicitudesVendedores, icon: 'ti-user-plus', tone: 'info' },
    { label: t('admin.summary.pendingProducts'), value: stats.productosPendientes, icon: 'ti-package', tone: 'warning' },
    { label: t('admin.summary.pendingReturns'), value: stats.devolucionesPendientes, icon: 'ti-rotate', tone: 'error' },
  ];

  if (loading) {
    return (
      <div className="metrics">
        {cards.map((c) => <div key={c.label} className="skeleton" style={{ height: 132, borderRadius: 16 }} />)}
      </div>
    );
  }

  return (
    <div className="metrics stagger">
      {cards.map((card, i) => (
        <Tilt key={card.label} className={`metric metric--${card.tone}`} style={{ '--i': i }} max={8}>
          <div className="metric-icon tilt-pop"><i className={`ti ${card.icon}`} aria-hidden="true" /></div>
          <div className="metric-label">{card.label}</div>
          <div className="metric-value"><CountUp value={card.value} {...(card.format ? { format: card.format } : {})} /></div>
        </Tilt>
      ))}
    </div>
  );
}
