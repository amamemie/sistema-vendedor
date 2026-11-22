import { useState, useEffect } from 'react';
import { formatearFecha } from './admin.utils';
import './admin.css';

export default function SolicitudesVendedores() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(null);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost/sistema-vendedor/backend/solicitudes_vendedores.php');
      const data = await response.json();
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const procesarSolicitud = async (idVendedor, accion) => {
    setProcesando(idVendedor);
    try {
      const response = await fetch('http://localhost/sistema-vendedor/backend/solicitudes_vendedores.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_vendedor: idVendedor, accion })
      });
      const result = await response.json();
      if (result.success) {
        alert(`✅ ${result.message}`);
        cargarSolicitudes();
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      alert('Error de conexión');
    }
    setProcesando(null);
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Cargando solicitudes...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>📋 Solicitudes de vendedores</h1>
      {solicitudes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}>No hay solicitudes pendientes</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {solicitudes.map(s => (
            <div key={s.id_vendedor} style={{ background: 'var(--surface)', borderRadius: 12, padding: 16, border: '1px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 600 }}>{s.nombre_tienda || 'Sin nombre'}</span>
                <span style={{ background: 'var(--warning-light)', color: 'var(--warning-strong)', padding: '3px 8px', borderRadius: 20, fontSize: 11 }}>Pendiente</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, marginBottom: 16 }}>
                <div><strong>NIT/RUT:</strong> {s.documento_identidad || '—'}</div>
                <div><strong>Teléfono:</strong> {s.telefono || '—'}</div>
                <div><strong>Email:</strong> {s.email || '—'}</div>
                <div><strong>Dirección:</strong> {s.direccion || '—'}</div>
                <div><strong>Fecha solicitud:</strong> {formatearFecha(s.fecha_creacion)}</div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="admin-btn-danger" onClick={() => procesarSolicitud(s.id_vendedor, 'rechazar')} disabled={procesando === s.id_vendedor}>Rechazar</button>
                <button className="admin-btn-success" onClick={() => procesarSolicitud(s.id_vendedor, 'aprobar')} disabled={procesando === s.id_vendedor}>Aprobar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}