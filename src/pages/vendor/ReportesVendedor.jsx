import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './vendor.css';
import { formatearPrecio, formatearFecha } from './vendor.utils';

export default function ReportesVendedor() {
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
    } catch (error) {
      setVentas([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarReportes();
  }, [fechaInicio, fechaFin, user?.id_tienda]);

  const totalVentas = ventas.reduce((sum, v) => sum + parseFloat(v.total_bruto || 0), 0);
  const totalPedidos = ventas.length;

  if (loading) return <div className="vendor-content"><div style={{ textAlign: 'center', padding: 60 }}>Cargando reportes...</div></div>;

  return (
    <div className="vendor-content">
      <div className="productos-header">
        <h1 className="productos-title">📊 Reportes de ventas</h1>
      </div>

      <div className="reportes-filters">
        <div className="reportes-filter-group">
          <label className="reportes-filter-label">Desde</label>
          <input type="date" className="reportes-filter-input" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
        </div>
        <div className="reportes-filter-group">
          <label className="reportes-filter-label">Hasta</label>
          <input type="date" className="reportes-filter-input" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={cargarReportes}>Aplicar filtro</button>
      </div>

      <div className="reportes-summary">
        <div className="reportes-summary-card"><div className="reportes-summary-value">{totalPedidos}</div><div className="reportes-summary-label">Pedidos</div></div>
        <div className="reportes-summary-card"><div className="reportes-summary-value">{formatearPrecio(totalVentas)}</div><div className="reportes-summary-label">Ventas totales</div></div>
        <div className="reportes-summary-card"><div className="reportes-summary-value">{ventas.length ? formatearPrecio(totalVentas / ventas.length) : 'Bs. 0'}</div><div className="reportes-summary-label">Ticket promedio</div></div>
      </div>

      <div className="reportes-table">
        <div className="reportes-table-header"><span>Pedido</span><span>Fecha</span><span>Cliente</span><span>Total</span></div>
        {ventas.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No hay ventas en este período</div> : ventas.map(v => (
          <div key={v.id_compra} className="reportes-table-row">
            <span>#{v.id_compra}</span><span>{formatearFecha(v.fecha_compra)}</span><span>{v.cliente_nombre || 'Cliente'}</span><span>{formatearPrecio(v.total_bruto)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}