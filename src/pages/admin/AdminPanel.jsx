import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ResumenAdmin from './ResumenAdmin';
import UsuariosAdmin from './UsuariosAdmin';
import ProductosAdmin from './ProductosAdmin';
import DevolucionesAdmin from './DevolucionesAdmin';
import ReportesAdmin from './ReportesAdmin';
import SolicitudesVendedores from './SolicitudesVendedores';
import './admin.css';
import CategoriasAdmin from './CategoriasAdmin'; // Agregar esta importación

export default function AdminPanel() {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('resumen');

  const menuItems = [
    { key: 'resumen', label: 'Resumen', icon: 'ti-layout-dashboard' },
  { key: 'usuarios', label: 'Usuarios', icon: 'ti-users' },
  { key: 'solicitudes', label: 'Solicitudes Vendedores', icon: 'ti-user-plus' },
  { key: 'categorias', label: 'Categorías', icon: 'ti-folder' }, // ← NUEVO
  { key: 'productos', label: 'Aprobar Productos', icon: 'ti-package' },
  { key: 'devoluciones', label: 'Devoluciones', icon: 'ti-rotate' },
  { key: 'reportes', label: 'Reportes', icon: 'ti-chart-bar' }
  ];

 // Agregar el case en renderContent
const renderContent = () => {
  switch (activeTab) {
    case 'resumen': return <ResumenAdmin />;
    case 'usuarios': return <UsuariosAdmin />;
    case 'solicitudes': return <SolicitudesVendedores />;
    case 'categorias': return <CategoriasAdmin />; // ← NUEVO
    case 'productos': return <ProductosAdmin />;
    case 'devoluciones': return <DevolucionesAdmin />;
    case 'reportes': return <ReportesAdmin />;
    default: return <ResumenAdmin />;
  }
};

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">Admin Panel</div>
        <div className="admin-sidebar-user">
          <div className="admin-sidebar-user-label">Conectado como</div>
          <div className="admin-sidebar-user-email">{user?.email}</div>
        </div>
        <nav className="admin-sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.key}
              className={`admin-sidebar-item ${activeTab === item.key ? 'admin-sidebar-item-active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              <i className={`ti ${item.icon}`}></i> {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-sidebar-logout" onClick={logout}>
            <i className="ti ti-logout"></i> Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-header"><span className="admin-header-title">Panel de Administración</span></div>
        <div className="admin-content">{renderContent()}</div>
      </main>
    </div>
  );
}