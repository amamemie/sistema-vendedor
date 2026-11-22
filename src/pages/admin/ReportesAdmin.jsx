import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { formatearPrecio, formatearFecha } from './admin.utils';
import { exportToExcel, exportToCSV } from '../../utils/exportUtils';
import VentasMensualesChart from '../../components/admin/VentasMensualesChart';
import Tilt from '../../components/ui/Tilt';
import CountUp from '../../components/ui/CountUp';
import { formatMoney, formatDateTime } from '../../i18n/format';
import './admin.css';

const toneFor = (estado) => (estado === 'Pagada' || estado === 'Entregado' || estado === 'Enviada' ? 'badge-success' : estado === 'Cancelado' ? 'badge-error' : 'badge-warning');

export default function ReportesAdmin() {
  const { t } = useTranslation();
  const [ventas, setVentas] = useState([]);
  const [comisiones, setComisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState('ventas');
  const [actualizado, setActualizado] = useState(new Date());

  const cargarDatos = async () => {
    setLoading(true);
    const [ventasData, comisionesData] = await Promise.all([api.getReporteVentas(), api.getReporteComisiones()]);
    if (Array.isArray(ventasData)) setVentas(ventasData);
    if (Array.isArray(comisionesData)) setComisiones(comisionesData);
    setActualizado(new Date());
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const totalVentas = ventas.reduce((acc, v) => acc + parseFloat(v.total_bruto || 0), 0);
  const totalComisiones = comisiones.reduce((acc, c) => acc + parseFloat(c.comision_monto || 0), 0);

  const ventasMensuales = useMemo(() => {
    const year = new Date().getFullYear();
    const out = Array(12).fill(0);
    ventas.forEach((v) => {
      const d = new Date(String(v.fecha_compra).replace(' ', 'T'));
      if (!Number.isNaN(d.getTime()) && d.getFullYear() === year) out[d.getMonth()] += parseFloat(v.total_bruto || 0);
    });
    return out;
  }, [ventas]);

  const h = (k) => t(`admin.reports.cols.${k}`);
  const ventasParaExportar = ventas.map((v) => ({
    [h('orderId')]: v.id_compra,
    [h('date')]: formatearFecha(v.fecha_compra),
    [h('buyer')]: `${v.comprador_nombres || ''} ${v.comprador_apellidos || ''}`.trim(),
    [h('totalBs')]: parseFloat(v.total_bruto || 0).toFixed(2),
    [h('status')]: t(`orderStatus.${v.estado}`, { defaultValue: v.estado }),
  }));
  const comisionesParaExportar = comisiones.map((c) => ({
    [h('seller')]: `${c.vendedor_nombres || ''} ${c.vendedor_apellidos || ''}`.trim(),
    [h('commissionBs')]: parseFloat(c.comision_monto || 0).toFixed(2),
    [h('sellerAmountBs')]: parseFloat(c.vendedor_monto || 0).toFixed(2),
    [h('status')]: c.dispersion_estado || t('productStatus.Pendiente'),
    [h('date')]: formatearFecha(c.fecha_dispersion),
  }));

  if (loading) {
    return (
      <>
        <div className="metrics">{[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 132, borderRadius: 16 }} />)}</div>
        <div className="skeleton" style={{ height: 340, borderRadius: 16 }} />
      </>
    );
  }

  const data = tipo === 'ventas' ? ventasParaExportar : comisionesParaExportar;
  const file = tipo === 'ventas' ? 'reporte_ventas' : 'reporte_comisiones';

  return (
    <div>
      <div className="metrics stagger">
        <Tilt className="metric metric--accent" style={{ '--i': 0 }}>
          <div className="metric-icon tilt-pop"><i className="ti ti-cash" aria-hidden="true" /></div>
          <div className="metric-label">{t('admin.reports.totalSales')}</div>
          <div className="metric-value"><CountUp value={totalVentas} format={formatMoney} /></div>
        </Tilt>
        <Tilt className="metric metric--success" style={{ '--i': 1 }}>
          <div className="metric-icon tilt-pop"><i className="ti ti-percentage" aria-hidden="true" /></div>
          <div className="metric-label">{t('admin.reports.totalCommissions')}</div>
          <div className="metric-value"><CountUp value={totalComisiones} format={formatMoney} /></div>
        </Tilt>
        <Tilt className="metric metric--info" style={{ '--i': 2 }}>
          <div className="metric-icon tilt-pop"><i className="ti ti-receipt" aria-hidden="true" /></div>
          <div className="metric-label">{t('admin.reports.orders')}</div>
          <div className="metric-value"><CountUp value={ventas.length} /></div>
        </Tilt>
      </div>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2>{t('admin.reports.monthly', { year: new Date().getFullYear() })}</h2>
            <p>{t('admin.reports.updated', { date: formatDateTime(actualizado) })}</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={cargarDatos}>
            <i className="ti ti-refresh" aria-hidden="true" /> {t('common.refresh')}
          </button>
        </header>
        <VentasMensualesChart ventasMensuales={ventasMensuales} />
      </section>

      <section className="panel">
        <header className="panel-head" style={{ flexWrap: 'wrap' }}>
          <div className="segmented" role="tablist" aria-label={t('admin.reports.type')}>
            <button type="button" role="tab" aria-selected={tipo === 'ventas'} onClick={() => setTipo('ventas')}>
              <i className="ti ti-chart-bar" aria-hidden="true" /> {t('admin.reports.sales')}
            </button>
            <button type="button" role="tab" aria-selected={tipo === 'comisiones'} onClick={() => setTipo('comisiones')}>
              <i className="ti ti-coins" aria-hidden="true" /> {t('admin.reports.commissions')}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => exportToExcel(data, file, tipo === 'ventas' ? t('admin.reports.sales') : t('admin.reports.commissions'))}>
              <i className="ti ti-file-spreadsheet" aria-hidden="true" /> Excel
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => exportToCSV(data, file)}>
              <i className="ti ti-file-text" aria-hidden="true" /> CSV
            </button>
          </div>
        </header>

        <div className="table-scroll" key={tipo}>
          {tipo === 'ventas' ? (
            ventas.length === 0 ? (
              <div className="empty-state">{t('admin.reports.noSales')}</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>ID</th><th>{h('date')}</th><th>{h('buyer')}</th><th>{t('common.total')}</th><th>{h('status')}</th></tr>
                </thead>
                <tbody>
                  {ventas.map((v) => (
                    <tr key={v.id_compra}>
                      <td>#{v.id_compra}</td>
                      <td>{formatearFecha(v.fecha_compra)}</td>
                      <td>{v.comprador_nombres || ''} {v.comprador_apellidos || ''}</td>
                      <td style={{ fontWeight: 600 }}>{formatearPrecio(v.total_bruto)}</td>
                      <td><span className={`badge ${toneFor(v.estado)}`}>{t(`orderStatus.${v.estado}`, { defaultValue: v.estado })}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : comisiones.length === 0 ? (
            <div className="empty-state">{t('admin.reports.noCommissions')}</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>{h('seller')}</th><th>{t('admin.reports.commission')}</th><th>{t('admin.reports.sellerAmount')}</th><th>{h('status')}</th><th>{h('date')}</th></tr>
              </thead>
              <tbody>
                {comisiones.map((c) => (
                  <tr key={c.id_comision}>
                    <td>{c.vendedor_nombres || ''} {c.vendedor_apellidos || ''}</td>
                    <td style={{ fontWeight: 600 }}>{formatearPrecio(c.comision_monto)}</td>
                    <td>{formatearPrecio(c.vendedor_monto)}</td>
                    <td><span className={`badge ${toneFor(c.dispersion_estado)}`}>{c.dispersion_estado || t('productStatus.Pendiente')}</span></td>
                    <td>{formatearFecha(c.fecha_dispersion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
