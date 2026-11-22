import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { formatearPrecio, formatearFecha } from './admin.utils';
import { exportToExcel, exportToCSV } from '../../utils/exportUtils';
import './admin.css';

export default function ReportesAdmin() {
  const [ventas, setVentas] = useState([]);
  const [comisiones, setComisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState('ventas');

  const cargarDatos = async () => {
    setLoading(true);
    const [ventasData, comisionesData] = await Promise.all([
      api.getReporteVentas(),
      api.getReporteComisiones()
    ]);
    if (Array.isArray(ventasData)) setVentas(ventasData);
    if (Array.isArray(comisionesData)) setComisiones(comisionesData);
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const totalVentas = ventas.reduce((acc, v) => acc + parseFloat(v.total_bruto || 0), 0);
  const totalComisiones = comisiones.reduce((acc, c) => acc + parseFloat(c.comision_monto || 0), 0);

  // Preparar datos para exportar (limpiar objetos anidados)
  const ventasParaExportar = ventas.map(v => ({
    'ID Pedido': v.id_compra,
    'Fecha': formatearFecha(v.fecha_compra),
    'Comprador': `${v.comprador_nombres || ''} ${v.comprador_apellidos || ''}`.trim(),
    'Total (Bs.)': parseFloat(v.total_bruto || 0).toFixed(2),
    'Estado': v.estado
  }));

  const comisionesParaExportar = comisiones.map(c => ({
    'Vendedor': `${c.vendedor_nombres || ''} ${c.vendedor_apellidos || ''}`.trim(),
    'Comisión (Bs.)': parseFloat(c.comision_monto || 0).toFixed(2),
    'Monto Vendedor (Bs.)': parseFloat(c.vendedor_monto || 0).toFixed(2),
    'Estado': c.dispersion_estado || 'Pendiente',
    'Fecha': formatearFecha(c.fecha_dispersion)
  }));

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Cargando reportes...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>📈 Reportes</h1>
        <span style={{ fontSize: 12, color: '#64748b' }}>
          Última actualización: {new Date().toLocaleString()}
        </span>
      </div>

      {/* Botones de exportación */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {tipo === 'ventas' ? (
          <>
            <button className="admin-btn-success" onClick={() => exportToExcel(ventasParaExportar, 'reporte_ventas', 'Ventas')}>
              📊 Exportar a Excel
            </button>
            <button className="admin-btn-primary" onClick={() => exportToCSV(ventasParaExportar, 'reporte_ventas')}>
              📄 Exportar a CSV
            </button>
          </>
        ) : (
          <>
            <button className="admin-btn-success" onClick={() => exportToExcel(comisionesParaExportar, 'reporte_comisiones', 'Comisiones')}>
              📊 Exportar a Excel
            </button>
            <button className="admin-btn-primary" onClick={() => exportToCSV(comisionesParaExportar, 'reporte_comisiones')}>
              📄 Exportar a CSV
            </button>
          </>
        )}
      </div>

      {/* Toggle entre reportes */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <button 
          className={tipo === 'ventas' ? 'admin-btn-primary' : 'admin-btn-secondary'} 
          onClick={() => setTipo('ventas')}
        >
          📊 Ventas
        </button>
        <button 
          className={tipo === 'comisiones' ? 'admin-btn-primary' : 'admin-btn-secondary'} 
          onClick={() => setTipo('comisiones')}
        >
          💰 Comisiones
        </button>
      </div>

      {/* Reporte de Ventas */}
      {tipo === 'ventas' ? (
        <>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Total de ventas:</strong>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>{formatearPrecio(totalVentas)}</span>
          </div>

          {ventas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>No hay ventas registradas</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Comprador</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map(v => (
                  <tr key={v.id_compra}>
                    <td>#{v.id_compra}</td>
                    <td>{formatearFecha(v.fecha_compra)}</td>
                    <td>{v.comprador_nombres || ''} {v.comprador_apellidos || ''}</td>
                    <td>{formatearPrecio(v.total_bruto)}</td>
                    <td>
                      <span style={{ 
                        background: v.estado === 'Pagada' ? '#d1fae5' : '#fef3c7', 
                        color: v.estado === 'Pagada' ? '#065f46' : '#92400e', 
                        padding: '2px 8px', 
                        borderRadius: 20, 
                        fontSize: 10 
                      }}>
                        {v.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : (
        // Reporte de Comisiones
        <>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Total comisiones generadas:</strong>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>{formatearPrecio(totalComisiones)}</span>
          </div>

          {comisiones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>No hay comisiones registradas</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Vendedor</th>
                  <th>Comisión</th>
                  <th>Monto vendedor</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {comisiones.map(c => (
                  <tr key={c.id_comision}>
                    <td>{c.vendedor_nombres || ''} {c.vendedor_apellidos || ''}</td>
                    <td>{formatearPrecio(c.comision_monto)}</td>
                    <td>{formatearPrecio(c.vendedor_monto)}</td>
                    <td>
                      <span style={{ 
                        background: c.dispersion_estado === 'Enviada' ? '#d1fae5' : '#fef3c7', 
                        color: c.dispersion_estado === 'Enviada' ? '#065f46' : '#92400e', 
                        padding: '2px 8px', 
                        borderRadius: 20 
                      }}>
                        {c.dispersion_estado || 'Pendiente'}
                      </span>
                    </td>
                    <td>{formatearFecha(c.fecha_dispersion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}