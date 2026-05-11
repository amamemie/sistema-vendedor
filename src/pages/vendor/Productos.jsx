import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import FormProducto from '../../components/vendor/FormProducto';
import { api } from '../../services/api';

const BASE_URL = 'http://localhost:8080/sistema-vendedor/backend/';

const estadoBadge = {
  'Activo':   { bg: '#d1fae5', color: '#065f46' },
  'Inactivo': { bg: '#fee2e2', color: '#991b1b' },
};

const btnAccion = {
  width: 28, height: 28, border: '0.5px solid #e2e8f0', borderRadius: 6,
  background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: 13,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

export default function VendorProductos() {
  const { user } = useAuth();
  const [productos, setProductos]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [busqueda, setBusqueda]       = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);

  const idTienda = user?.id_tienda;

  const cargarProductos = () => {
    if (!idTienda) { setError('Tu cuenta no tiene una tienda asignada.'); setLoading(false); return; }
    setLoading(true);
    api.get(`productos.php?id_tienda=${idTienda}`)
      .then(data => {
        if (Array.isArray(data)) { setProductos(data); setError(''); }
        else setError(data.error || 'Error cargando productos');
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargarProductos(); }, [idTienda]);

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.categoria || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Topbar */}
      <header style={{
        background: '#fff', borderBottom: '0.5px solid #e2e8f0',
        padding: '0 20px', height: 48,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          background: '#f6f6f7', border: '0.5px solid #e2e8f0',
          borderRadius: 8, padding: '0 12px', height: 32, maxWidth: 360,
        }}>
          <i className="ti ti-search" style={{ fontSize: 14, color: '#94a3b8' }} />
          <input
            placeholder="Buscar por nombre o categoría..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontSize: 13, outline: 'none', flex: 1 }}
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, fontSize: 13 }}>
              <i className="ti ti-x" />
            </button>
          )}
        </div>
        {user?.nombre_tienda && (
          <span style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '3px 10px', borderRadius: 20 }}>
            <i className="ti ti-store" style={{ marginRight: 4, fontSize: 12 }} />
            {user.nombre_tienda}
          </span>
        )}
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#0f172a' }}>Mis Productos</h1>
            <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>
              {loading ? 'Cargando...' : `${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => setMostrarForm(true)}
            disabled={!idTienda}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: idTienda ? '#0f172a' : '#94a3b8',
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '8px 14px', fontSize: 12, fontWeight: 600,
              cursor: idTienda ? 'pointer' : 'not-allowed',
            }}
          >
            <i className="ti ti-plus" /> Agregar producto
          </button>
        </div>

        {!idTienda && (
          <div style={{
            background: '#fef9c3', border: '0.5px solid #fde047', borderRadius: 10,
            padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#854d0e',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: 18 }} />
            Tu cuenta aún no tiene una tienda asignada. El administrador debe aprobar tu perfil.
          </div>
        )}

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
            padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#dc2626',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 16 }} />
            {error}
          </div>
        )}

        {loading ? (
          <div style={{
            background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 10,
            padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13,
          }}>
            <i className="ti ti-loader-2" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
            Cargando productos...
          </div>
        ) : (
          <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            {/* Cabecera tabla */}
            <div style={{
              display: 'grid', gridTemplateColumns: '56px 2fr 1fr 1fr 1fr 1fr 88px',
              padding: '10px 16px', borderBottom: '0.5px solid #e2e8f0', background: '#f9fafb',
            }}>
              {['Foto', 'Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acción'].map(c => (
                <span key={c} style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c}</span>
              ))}
            </div>

            {productosFiltrados.map((p, i) => (
              <div
                key={p.id_producto}
                style={{
                  display: 'grid', gridTemplateColumns: '56px 2fr 1fr 1fr 1fr 1fr 88px',
                  padding: '10px 16px', alignItems: 'center',
                  borderBottom: i < productosFiltrados.length - 1 ? '0.5px solid #f1f5f9' : 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', border: '0.5px solid #e2e8f0', background: '#f8fafc' }}>
                  {p.imagen_principal ? (
                    <img src={BASE_URL + p.imagen_principal} alt={p.nombre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: 18 }}>
                      <i className="ti ti-photo" />
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{p.nombre}</div>
                  {p.descripcion && (
                    <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                      {p.descripcion}
                    </div>
                  )}
                </div>

                <span style={{ fontSize: 12, color: '#64748b' }}>{p.categoria || '—'}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Bs. {parseFloat(p.precio_unitario).toFixed(2)}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: p.stock === 0 ? '#dc2626' : p.stock <= 5 ? '#d97706' : '#059669' }}>
                  {p.stock} und.
                </span>
                <span style={{
                  fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600,
                  display: 'inline-block', width: 'fit-content',
                  background: (estadoBadge[p.estado] || estadoBadge['Inactivo']).bg,
                  color: (estadoBadge[p.estado] || estadoBadge['Inactivo']).color,
                }}>{p.estado}</span>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button title="Editar" style={btnAccion}><i className="ti ti-edit" /></button>
                  <button title="Eliminar" style={{ ...btnAccion, borderColor: '#fecaca', background: '#fff5f5', color: '#dc2626' }}>
                    <i className="ti ti-trash" />
                  </button>
                </div>
              </div>
            ))}

            {productosFiltrados.length === 0 && (
              <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
                <i className="ti ti-package-off" style={{ fontSize: 36, display: 'block', marginBottom: 10 }} />
                <p style={{ fontSize: 14, margin: '0 0 4px', color: '#64748b' }}>
                  {busqueda ? `Sin resultados para "${busqueda}"` : 'Aún no tienes productos'}
                </p>
                <p style={{ fontSize: 12, margin: 0 }}>
                  {busqueda ? 'Prueba con otro término' : 'Haz clic en "Agregar producto" para comenzar'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {mostrarForm && (
        <FormProducto
          idTienda={idTienda}
          onGuardado={() => { setMostrarForm(false); cargarProductos(); }}
          onCerrar={() => setMostrarForm(false)}
        />
      )}
    </div>
  );
}
