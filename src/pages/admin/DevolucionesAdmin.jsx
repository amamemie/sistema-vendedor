import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { formatearPrecio, getEstadoDevolucionBadge } from './admin.utils';
import './admin.css';

export default function DevolucionesAdmin() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const data = await api.getSolicitudesDevolucion();
      if (Array.isArray(data)) {
        setSolicitudes(data);
      } else {
        console.error('Error: devoluciones no es un array', data);
        setSolicitudes([]);
      }
    } catch (error) {
      console.error('Error cargando devoluciones:', error);
      setSolicitudes([]);
    }
    setLoading(false);
  };

  const procesarDevolucion = async (idCompra, accion) => {
    try {
      const result = await api.procesarDevolucion(idCompra, accion);
      if (result.success) {
        alert(`✅ Devolución ${accion === 'Aprobar' ? 'aprobada' : 'rechazada'}`);
        cargarSolicitudes();
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Cargando solicitudes...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>🔄 Solicitudes de Devolución</h1>
      {solicitudes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <i className="ti ti-rotate-clockwise" style={{ fontSize: 48, marginBottom: 12 }} />
          <p>No hay solicitudes de devolución pendientes</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {solicitudes.map(s => {
            const badge = getEstadoDevolucionBadge(s.solicita_devolucion);
            return (
              <div key={s.id_compra} style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontWeight: 600 }}>Orden #{s.id_compra}</span>
                  <span style={{ background: badge.bg, color: badge.color, padding: '3px 8px', borderRadius: 20, fontSize: 11 }}>{badge.text}</span>
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Comprador: {s.comprador_nombres} {s.comprador_apellidos}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Tienda: {s.nombre_tienda}</div>
                <div style={{ fontSize: 13, marginBottom: 12, background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                  <strong>Motivo:</strong> {s.devolucion_motivo}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="admin-btn-success" onClick={() => procesarDevolucion(s.id_compra, 'Aprobar')}>✓ Aprobar</button>
                  <button className="admin-btn-danger" onClick={() => procesarDevolucion(s.id_compra, 'Rechazar')}>✗ Rechazar</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}