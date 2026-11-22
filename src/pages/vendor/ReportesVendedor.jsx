import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './vendor.css';
import { formatearPrecio, formatearFecha } from './vendor.utils';
import { useTranslation } from 'react-i18next';

export default function ReportesVendedor() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaInicio, setFechaInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const data = await api.getReporteVentasVendedor?.(user?.id_tienda, fechaInicio, fechaFin) || [];
      setVentas(Array.isArray(data) ? data : []);
    } catch {
      setVentas([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarReportes();
  }, [fechaInicio, fechaFin, user?.id_tienda]);

  const totalVentas = ventas.reduce((sum, v) => sum + parseFloat(v.total_bruto || 0), 0);
  const totalPedidos = ventas.length;

  if (loading) return <div className="vendor-content"><div className="skeleton" style={{ height: 320, borderRadius: 16 }} /></div>;

  return (
    <div className="vendor-content">
      <div className="productos-header">
        <h2 className="productos-title">{t('vendor.reports.title')}</h2>
      </div>

      <div className="reportes-filters">
        <div className="reportes-filter-group">
          <label className="reportes-filter-label">{t('common.from')}</label>
          <input type="date" className="reportes-filter-input" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
        </div>
        <div className="reportes-filter-group">
          <label className="reportes-filter-label">{t('common.to')}</label>
          <input type="date" className="reportes-filter-input" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={cargarReportes}>{t('common.applyFilter')}</button>
      </div>

      <div className="reportes-summary">
        <div className="reportes-summary-card"><div className="reportes-summary-value">{totalPedidos}</div><div className="reportes-summary-label">{t('vendor.nav.orders')}</div></div>
        <div className="reportes-summary-card"><div className="reportes-summary-value">{formatearPrecio(totalVentas)}</div><div className="reportes-summary-label">{t('vendor.reports.totalSales')}</div></div>
        <div className="reportes-summary-card"><div className="reportes-summary-value">{formatearPrecio(ventas.length ? totalVentas / ventas.length : 0)}</div><div className="reportes-summary-label">{t('vendor.reports.avgTicket')}</div></div>
      </div>

      <div className="reportes-table">
        <div className="reportes-table-header"><span>{t('vendor.reports.order')}</span><span>{t('common.date')}</span><span>{t('vendor.orders.customer')}</span><span>{t('common.total')}</span></div>
        {ventas.length === 0 ? <div className="empty-state"><i className="ti ti-chart-bar-off" style={{ fontSize: 30 }} aria-hidden="true" />{t('vendor.reports.empty')}</div> : ventas.map(v => (
          <div key={v.id_compra} className="reportes-table-row">
            <span>#{v.id_compra}</span><span>{formatearFecha(v.fecha_compra)}</span><span>{v.cliente_nombre || t('vendor.orders.customerFallback')}</span><span>{formatearPrecio(v.total_bruto)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}