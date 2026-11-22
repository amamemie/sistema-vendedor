import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import AppShell from '../../components/layout/AppShell';
import ResumenAdmin from './ResumenAdmin';
import UsuariosAdmin from './UsuariosAdmin';
import ProductosAdmin from './ProductosAdmin';
import DevolucionesAdmin from './DevolucionesAdmin';
import ReportesAdmin from './ReportesAdmin';
import SolicitudesVendedores from './SolicitudesVendedores';
import CategoriasAdmin from './CategoriasAdmin';
import VendedoresAdmin from './VendedoresAdmin';
import CrearVendedor from './CrearVendedor';
import './admin.css';

export default function AdminPanel() {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('resumen');

  const menuItems = [
    { key: 'resumen', label: t('admin.nav.summary'), icon: 'ti-layout-dashboard' },
    { key: 'usuarios', label: t('admin.nav.users'), icon: 'ti-users' },
    { key: 'vendedores', label: t('admin.nav.sellers'), icon: 'ti-building-store' },
    { key: 'crear-vendedor', label: t('admin.nav.createSeller'), icon: 'ti-user-plus' },
    { key: 'solicitudes', label: t('admin.nav.requests'), icon: 'ti-user-question' },
    { key: 'categorias', label: t('admin.nav.categories'), icon: 'ti-folder' },
    { key: 'productos', label: t('admin.nav.products'), icon: 'ti-package' },
    { key: 'devoluciones', label: t('admin.nav.returns'), icon: 'ti-rotate' },
    { key: 'reportes', label: t('admin.nav.reports'), icon: 'ti-chart-bar' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'usuarios': return <UsuariosAdmin />;
      case 'vendedores': return <VendedoresAdmin onCrear={() => setActiveTab('crear-vendedor')} />;
      case 'crear-vendedor': return <CrearVendedor onCreado={() => setActiveTab('vendedores')} />;
      case 'solicitudes': return <SolicitudesVendedores />;
      case 'categorias': return <CategoriasAdmin />;
      case 'productos': return <ProductosAdmin />;
      case 'devoluciones': return <DevolucionesAdmin />;
      case 'reportes': return <ReportesAdmin />;
      default: return <ResumenAdmin />;
    }
  };

  const current = menuItems.find((i) => i.key === activeTab);

  return (
    <AppShell
      roleLabel={t('roles.admin')}
      workspace={t('admin.workspace')}
      user={user}
      items={menuItems}
      active={activeTab}
      onSelect={setActiveTab}
      onLogout={logout}
      title={current?.label}
      subtitle={t(`admin.subtitle.${activeTab}`)}
    >
      <div className="admin-content">{renderContent()}</div>
    </AppShell>
  );
}
