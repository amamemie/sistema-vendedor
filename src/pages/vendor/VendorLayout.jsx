import { useState } from 'react';
import VendorSidebar from '../../components/vendor/Sidebar';
import VendorDashboard from './Dashboard';
import VendorProductos from './Productos';
import VendorPedidos from './Pedidos';

// Páginas pendientes — placeholder genérico
function Proximamente({ titulo, icono }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f6f7' }}>
      <div style={{
        background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 12,
        padding: '48px 40px', textAlign: 'center', maxWidth: 360,
      }}>
        <i className={`ti ${icono}`} style={{ fontSize: 40, color: '#cbd5e1', display: 'block', marginBottom: 14 }} />
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 6px', color: '#0f172a' }}>{titulo}</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Esta sección está en desarrollo.</p>
      </div>
    </div>
  );
}

// Mapa de páginas del vendedor
function renderPage(page) {
  switch (page) {
    case 'dashboard':   return <VendorDashboard />;
    case 'productos':   return <VendorProductos />;
    case 'pedidos':     return <VendorPedidos />;
    case 'analiticas':  return <Proximamente titulo="Analíticas" icono="ti-chart-bar" />;
    case 'descuentos':  return <Proximamente titulo="Descuentos" icono="ti-tag" />;
    case 'envios':      return <Proximamente titulo="Envíos" icono="ti-truck-delivery" />;
    case 'configuracion': return <Proximamente titulo="Configuración" icono="ti-settings" />;
    default:            return <VendorDashboard />;
  }
}

export default function VendorLayout() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f6f6f7' }}>
      {/* Sidebar recibe activePage y onNavigate para controlar qué se muestra */}
      <VendorSidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Renderiza la página activa */}
      {renderPage(activePage)}
    </div>
  );
}
