import { useAuth } from '../../context/AuthContext';

const navItems = [
  { icon: 'ti-home',            label: 'Inicio',       page: 'dashboard' },
  { icon: 'ti-shopping-cart',   label: 'Pedidos',      page: 'pedidos',  badge: 4 },
  { icon: 'ti-package',         label: 'Productos',    page: 'productos' },
  { icon: 'ti-chart-bar',       label: 'Analíticas',   page: 'analiticas' },
  { icon: 'ti-tag',             label: 'Descuentos',   page: 'descuentos' },
  { icon: 'ti-truck-delivery',  label: 'Envíos',       page: 'envios' },
];

export default function VendorSidebar({ activePage, onNavigate }) {
  const { user, logout } = useAuth();
  const initials = user?.email?.substring(0, 2).toUpperCase() ?? 'MV';

  return (
    <aside style={{
      width: '220px', background: '#1a1a1a', display: 'flex',
      flexDirection: 'column', flexShrink: 0, height: '100vh',
      position: 'sticky', top: 0,
    }}>
      <div style={{
        padding: '16px 18px', borderBottom: '0.5px solid #333',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6, background: '#2563eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 12, fontWeight: 500,
        }}>{initials}</div>
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>
          Mi Tienda
        </span>
      </div>

      <nav style={{ flex: 1, padding: '8px 0' }}>
        {navItems.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: 10, padding: '8px 18px', background: 'none', border: 'none',
              cursor: 'pointer', textAlign: 'left',
              color: activePage === item.page ? '#fff' : '#aaa',
              backgroundColor: activePage === item.page ? '#2a2a2a' : 'transparent',
              fontSize: 13,
            }}
          >
            <i className={`ti ${item.icon}`} style={{ fontSize: 16 }} aria-hidden="true" />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span style={{
                background: '#2563eb', color: '#fff', fontSize: 10,
                padding: '2px 6px', borderRadius: 10,
              }}>{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <div style={{ borderTop: '0.5px solid #333', padding: '8px 0' }}>
        <button
          onClick={() => onNavigate('configuracion')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 18px', background: 'none', border: 'none',
            cursor: 'pointer', color: '#aaa', fontSize: 13,
          }}
        >
          <i className="ti ti-settings" style={{ fontSize: 16 }} aria-hidden="true" />
          Configuración
        </button>
        <button
          onClick={logout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 18px', background: 'none', border: 'none',
            cursor: 'pointer', color: '#aaa', fontSize: 13,
          }}
        >
          <i className="ti ti-logout" style={{ fontSize: 16 }} aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
