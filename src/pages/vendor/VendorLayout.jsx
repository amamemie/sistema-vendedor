import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import VendorDashboard from './Dashboard';
import VendorProductos from './Productos';
import VendorPedidos from './Pedidos';
import PerfilVendedor from './PerfilVendedor';
import ReportesVendedor from './ReportesVendedor';
import AnalisisVentas from './AnalisisVentas';  // ← IMPORTAR NUEVO COMPONENTE
import './vendor.css';

export default function VendorLayout() {
  const { logout, user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
    { key: 'productos', label: 'Mis Productos', icon: 'ti-package' },
    { key: 'pedidos', label: 'Pedidos', icon: 'ti-shopping-cart' },
    { key: 'analisis', label: 'Análisis de Ventas', icon: 'ti-chart-pie' },  // ← NUEVO
    { key: 'reportes', label: 'Reportes', icon: 'ti-chart-bar' },
    { key: 'perfil', label: 'Mi Empresa', icon: 'ti-building-store' }
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <VendorDashboard />;
      case 'productos': return <VendorProductos />;
      case 'pedidos': return <VendorPedidos />;
      case 'analisis': return <AnalisisVentas />;  // ← NUEVO
      case 'reportes': return <ReportesVendedor />;
      case 'perfil': return <PerfilVendedor onBack={() => setActivePage('dashboard')} />;
      default: return <VendorDashboard />;
    }
  };

  return (
    <div className="vendor-container">
      <aside className="vendor-sidebar">
        <div className="vendor-sidebar-header">🏪 Mi Tienda</div>
        <div className="vendor-sidebar-user">
          <div className="vendor-sidebar-user-label">Vendedor</div>
          <div className="vendor-sidebar-user-email">{user?.email}</div>
        </div>
        <nav className="vendor-sidebar-nav">
          {menuItems.map(item => (
            <button 
              key={item.key} 
              className={`vendor-sidebar-item ${activePage === item.key ? 'vendor-sidebar-item-active' : ''}`} 
              onClick={() => setActivePage(item.key)}
            >
              <i className={`ti ${item.icon}`}></i> 
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="vendor-sidebar-footer">
          <button className="vendor-sidebar-logout" onClick={logout}>
            <i className="ti ti-logout"></i> 
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
      <main className="vendor-main">
        <div className="vendor-header">
          <span className="vendor-header-title">
            {menuItems.find(item => item.key === activePage)?.label || 'Panel de Vendedor'}
          </span>
        </div>
        {renderPage()}
      </main>
    </div>
  );
}