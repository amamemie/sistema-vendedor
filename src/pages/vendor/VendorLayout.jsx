import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import AppShell from '../../components/layout/AppShell';
import VendorDashboard from './Dashboard';
import VendorProductos from './Productos';
import VendorPedidos from './Pedidos';
import PerfilVendedor from './PerfilVendedor';
import ReportesVendedor from './ReportesVendedor';
import AnalisisVentas from './AnalisisVentas';
import './vendor.css';

export default function VendorLayout() {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  const menuItems = [
    { key: 'dashboard', label: t('vendor.nav.dashboard'), icon: 'ti-layout-dashboard' },
    { key: 'productos', label: t('vendor.nav.products'), icon: 'ti-package' },
    { key: 'pedidos', label: t('vendor.nav.orders'), icon: 'ti-shopping-cart' },
    { key: 'analisis', label: t('vendor.nav.analytics'), icon: 'ti-chart-pie' },
    { key: 'reportes', label: t('vendor.nav.reports'), icon: 'ti-chart-bar' },
    { key: 'perfil', label: t('vendor.nav.company'), icon: 'ti-building-store' },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'productos': return <VendorProductos />;
      case 'pedidos': return <VendorPedidos />;
      case 'analisis': return <AnalisisVentas />;
      case 'reportes': return <ReportesVendedor />;
      case 'perfil': return <PerfilVendedor onBack={() => setActivePage('dashboard')} />;
      default: return <VendorDashboard onNavigate={setActivePage} />;
    }
  };

  const current = menuItems.find((i) => i.key === activePage);

  return (
    <AppShell
      roleLabel={t('roles.seller')}
      workspace={t('vendor.workspace')}
      user={user}
      items={menuItems}
      active={activePage}
      onSelect={setActivePage}
      onLogout={logout}
      title={current?.label}
      subtitle={t(`vendor.subtitle.${activePage}`)}
    >
      {renderPage()}
    </AppShell>
  );
}
