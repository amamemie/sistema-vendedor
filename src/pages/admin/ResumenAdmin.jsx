import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './admin.css';

export default function ResumenAdmin() {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalVendedores: 0,
    productosPendientes: 0,
    devolucionesPendientes: 0,
    solicitudesVendedores: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      setLoading(true);
      try {
        // Cargar usuarios
        const usuarios = await api.getUsuarios();
        const vendedores = Array.isArray(usuarios) ? usuarios.filter(u => u.rol === 'Vendedor') : [];
        
        // Cargar productos pendientes
        const productosPend = await api.getProductosPendientes();
        const productosArray = Array.isArray(productosPend) ? productosPend : [];
        
        // Cargar solicitudes de devolución
        const devoluciones = await api.getSolicitudesDevolucion();
        const devolucionesArray = Array.isArray(devoluciones) ? devoluciones : [];
        const devolucionesPendientes = devolucionesArray.filter(d => d.solicita_devolucion === 'Pendiente').length;
        
        // Cargar solicitudes de vendedores
        let solicitudesVendedores = 0;
        try {
          const solicitudesRes = await fetch('http://localhost/sistema-vendedor/backend/solicitudes_vendedores.php');
          const solicitudes = await solicitudesRes.json();
          solicitudesVendedores = Array.isArray(solicitudes) ? solicitudes.length : 0;
        } catch (err) {
          console.error('Error cargando solicitudes de vendedores:', err);
        }
        
        setStats({
          totalUsuarios: Array.isArray(usuarios) ? usuarios.length : 0,
          totalVendedores: vendedores.length,
          productosPendientes: productosArray.length,
          devolucionesPendientes: devolucionesPendientes,
          solicitudesVendedores: solicitudesVendedores
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
    { label: 'Usuarios totales', value: stats.totalUsuarios, icon: 'ti-users', color: '#2563eb' },
    { label: 'Vendedores', value: stats.totalVendedores, icon: 'ti-store', color: '#059669' },
    { label: 'Solicitudes vendedores', value: stats.solicitudesVendedores, icon: 'ti-user-plus', color: '#8b5cf6' },
    { label: 'Productos pendientes', value: stats.productosPendientes, icon: 'ti-package', color: '#d97706' },
    { label: 'Devoluciones pendientes', value: stats.devolucionesPendientes, icon: 'ti-rotate', color: '#dc2626' }
  ];

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
        <i className="ti ti-loader-2" style={{ fontSize: 40, display: 'inline-block', marginBottom: 12 }} />
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>📊 Resumen General</h1>
      <div className="admin-stats-grid">
        {cards.map(card => (
          <div key={card.label} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: card.color + '1a', color: card.color }}>
              <i className={`ti ${card.icon}`}></i>
            </div>
            <div className="admin-stat-info">
              <div className="admin-stat-label">{card.label}</div>
              <div className="admin-stat-value">{card.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}