import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const NAV = [
  { icon: 'ti-layout-dashboard', label: 'Resumen',   key: 'resumen' },
  { icon: 'ti-users',            label: 'Usuarios',  key: 'usuarios' },
  { icon: 'ti-store',            label: 'Vendedores',key: 'vendedores' },
  { icon: 'ti-user-plus',        label: 'Crear Vendedor', key: 'crear-vendedor' },
  { icon: 'ti-chart-bar',        label: 'Reportes',  key: 'reportes' },
];

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [activeKey, setActiveKey] = useState('resumen');
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [vendedores, setVendedores] = useState([]);
  const [loadingVendedores, setLoadingVendedores] = useState(false);
  const [statsData, setStatsData] = useState({ compradores: '0', vendedores: '0', pedidos: '0', ingresos: '0.00' });

  const [formData, setFormData] = useState({
    email: '', password: '', nombres: '', apellidos: '', 
    telefono: '', tipo_persona: 'Natural', documento_identidad: '',
    direccion: '', ciudad: '', pais: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  const initials = user?.email?.substring(0, 2).toUpperCase() ?? 'AD';

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateVendedor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = await api.post('admin_crear_vendedor.php', formData);
    setFormMsg({ type: data.success ? 'success' : 'error', text: data.message });
    if (data.success) setFormData({ 
      email: '', password: '', nombres: '', apellidos: '', 
      telefono: '', tipo_persona: 'Natural', documento_identidad: '',
      direccion: '', ciudad: '', pais: ''
    });
    setSubmitting(false);
  };

  useEffect(() => {
    if (activeKey === 'resumen') {
      api.get('admin_stats.php').then(data => data.success && setStatsData(data));
    }
    if (activeKey === 'usuarios') {
      setLoadingUsers(true);
      api.get('usuarios.php')
        .then(data => setUsuarios(Array.isArray(data) ? data : []))
        .finally(() => setLoadingUsers(false));
    }
    if (activeKey === 'vendedores') {
      setLoadingVendedores(true);
      api.get('vendedores.php').then(data => setVendedores(Array.isArray(data) ? data : [])).finally(() => setLoadingVendedores(false));
    }
  }, [activeKey]);

  const STATS_CARDS = [
    { label: 'Compradores',      value: statsData.compradores, icon: 'ti-users',      color: '#2563eb' },
    { label: 'Vendedores activos',value: statsData.vendedores,  icon: 'ti-store',     color: '#059669' },
    { label: 'Pedidos del mes',   value: statsData.pedidos,     icon: 'ti-shopping-cart', color: '#d97706' },
    { label: 'Ingresos del mes',  value: `$${statsData.ingresos}`, icon: 'ti-cash',  color: '#7c3aed' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f6f6f7' }}>
      {/* Sidebar admin */}
      <aside style={{
        width: 220, background: '#0f172a', display: 'flex',
        flexDirection: 'column', flexShrink: 0, height: '100vh',
        position: 'sticky', top: 0,
      }}>
        <div style={{
          padding: '16px 18px', borderBottom: '0.5px solid #1e293b',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#7c3aed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 600,
          }}>{initials}</div>
          <div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>Admin</div>
            <div style={{ color: '#64748b', fontSize: 11 }}>{user?.email}</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '8px 0' }}>
          {NAV.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveKey(item.key)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 18px', background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontSize: 13,
                color: activeKey === item.key ? '#fff' : '#94a3b8',
                backgroundColor: activeKey === item.key ? '#1e293b' : 'transparent',
                borderLeft: activeKey === item.key ? '2px solid #7c3aed' : '2px solid transparent',
              }}
            >
              <i className={`ti ${item.icon}`} style={{ fontSize: 16 }} aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: '0.5px solid #1e293b', padding: '8px 0' }}>
          <button
            onClick={logout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 18px', background: 'none', border: 'none',
              cursor: 'pointer', color: '#94a3b8', fontSize: 13,
            }}
          >
            <i className="ti ti-logout" style={{ fontSize: 16 }} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          background: 'var(--color-background-primary)',
          borderBottom: '0.5px solid var(--color-border-tertiary)',
          padding: '0 20px', height: 48,
          display: 'flex', alignItems: 'center',
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>
            Panel de Administración
          </h2>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

          {/* ── RESUMEN ── */}
          {activeKey === 'resumen' && (
            <>
              <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>Resumen general</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
                {STATS_CARDS.map(s => (
                  <div key={s.label} style={{
                    background: 'var(--color-background-primary)',
                    border: '0.5px solid var(--color-border-tertiary)',
                    borderRadius: 10, padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, background: s.color + '1a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: s.color, fontSize: 20,
                    }}>
                      <i className={`ti ${s.icon}`} aria-hidden="true" />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 500 }}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                background: 'var(--color-background-primary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 10, padding: 20,
              }}>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                  Bienvenido al panel de administración. Usa el menú lateral para gestionar usuarios, vendedores y reportes.
                </p>
              </div>
            </>
          )}

          {/* ── USUARIOS ── */}
          {activeKey === 'usuarios' && (
            <>
              <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>Usuarios del sistema</h1>
              <div style={{
                background: 'var(--color-background-primary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 10, overflow: 'hidden',
              }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '50px 2fr 1fr 100px',
                  padding: '10px 16px', borderBottom: '0.5px solid var(--color-border-tertiary)',
                  background: '#f9fafb',
                }}>
                  {['ID', 'Email', 'Rol', 'Acciones'].map(c => (
                    <span key={c} style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c}</span>
                  ))}
                </div>

                {loadingUsers && (
                  <div style={{ padding: 30, textAlign: 'center', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    Cargando usuarios...
                  </div>
                )}

                {!loadingUsers && usuarios.map((u, i) => (
                  <div key={u.id_usuario} style={{
                    display: 'grid', gridTemplateColumns: '50px 2fr 1fr 100px',
                    padding: '11px 16px', alignItems: 'center',
                    borderBottom: i < usuarios.length - 1 ? '0.5px solid var(--color-border-tertiary)' : 'none',
                  }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>#{u.id_usuario}</span>
                    <span style={{ fontSize: 13 }}>{u.email}</span>
                    <span style={{
                      fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 500,
                      display: 'inline-block', width: 'fit-content',
                      background: u.rol === 'Admin' ? '#ede9fe' : u.rol === 'Vendedor' ? '#dbeafe' : '#f0fdf4',
                      color: u.rol === 'Admin' ? '#6d28d9' : u.rol === 'Vendedor' ? '#1d4ed8' : '#166534',
                    }}>
                      {u.rol}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{
                        width: 28, height: 28, border: '0.5px solid var(--color-border-tertiary)',
                        borderRadius: 6, cursor: 'pointer', background: 'var(--color-background-primary)',
                        color: 'var(--color-text-secondary)', fontSize: 13,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <i className="ti ti-edit" aria-hidden="true" />
                      </button>
                      <button style={{
                        width: 28, height: 28, border: '0.5px solid #fecaca',
                        borderRadius: 6, cursor: 'pointer', background: '#fff5f5',
                        color: '#dc2626', fontSize: 13,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <i className="ti ti-trash" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}

                {!loadingUsers && usuarios.length === 0 && (
                  <div style={{ padding: 30, textAlign: 'center', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    No se encontraron usuarios o hubo un error de conexión.
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── VENDEDORES ── */}
          {activeKey === 'vendedores' && (
            <>
              <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>Vendedores registrados</h1>
              <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '50px 2fr 1.5fr 1fr 100px', padding: '10px 16px', background: '#f9fafb', borderBottom: '0.5px solid #e2e8f0' }}>
                  {['ID', 'Nombre', 'Email', 'Doc', 'Estado'].map(h => <span key={h} style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{h}</span>)}
                </div>
                {!loadingVendedores && vendedores.map(v => (
                  <div key={v.id_vendedor} style={{ display: 'grid', gridTemplateColumns: '50px 2fr 1.5fr 1fr 100px', padding: '12px 16px', borderBottom: '0.5px solid #f1f5f9', alignItems: 'center' }}>
                    <span style={{ fontSize: 12 }}>#{v.id_vendedor}</span>
                    <span style={{ fontSize: 13 }}>{v.nombres} {v.apellidos}</span>
                    <span style={{ fontSize: 13 }}>{v.email}</span>
                    <span style={{ fontSize: 12 }}>{v.documento_identidad}</span>
                    <span style={{ fontSize: 11, background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: 10 }}>{v.estado}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── CREAR VENDEDOR ── */}
          {activeKey === 'crear-vendedor' && (
            <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 12, padding: 24, maxWidth: 600, margin: '0 auto' }}>
              <h2 style={{ fontSize: 17, marginBottom: 20 }}>Nuevo Vendedor</h2>
              <form onSubmit={handleCreateVendedor} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input name="nombres" placeholder="Nombres" required value={formData.nombres} onChange={handleFormChange} style={inputStyle} />
                  <input name="apellidos" placeholder="Apellidos" required value={formData.apellidos} onChange={handleFormChange} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input name="email" type="email" placeholder="Email" required value={formData.email} onChange={handleFormChange} style={inputStyle} />
                  <input name="password" type="password" placeholder="Contraseña" required value={formData.password} onChange={handleFormChange} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleFormChange} style={inputStyle} />
                  <select name="tipo_persona" value={formData.tipo_persona} onChange={handleFormChange} style={inputStyle}>
                    <option value="Natural">Natural</option>
                    <option value="Juridica">Jurídica</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input name="documento_identidad" placeholder="Documento / NIT" required value={formData.documento_identidad} onChange={handleFormChange} style={inputStyle} />
                  <input name="pais" placeholder="País" value={formData.pais} onChange={handleFormChange} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                  <input name="ciudad" placeholder="Ciudad" value={formData.ciudad} onChange={handleFormChange} style={inputStyle} />
                  <input name="direccion" placeholder="Dirección completa" value={formData.direccion} onChange={handleFormChange} style={inputStyle} />
                </div>
                {formMsg.text && <div style={{ fontSize: 13, color: formMsg.type === 'success' ? 'green' : 'red' }}>{formMsg.text}</div>}
                <button type="submit" disabled={submitting} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px', borderRadius: 8, cursor: 'pointer' }}>
                  {submitting ? 'Creando...' : 'Registrar Vendedor'}
                </button>
              </form>
            </div>
          )}

          {/* ── REPORTES ── */}
          {activeKey === 'reportes' && (
            <div style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 10, padding: 30, textAlign: 'center',
            }}>
              <i className="ti ti-chart-bar" style={{ fontSize: 40, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 12 }} />
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                Reportes y analíticas — próximamente
              </p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};
