import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const CATEGORIAS = ['Todos', 'Ropa', 'Calzado', 'Accesorios'];

const PRODUCTOS = [
  { id: 1, nombre: 'Camiseta Premium', vendedor: 'Moda Urbana', precio: 45.00, rating: 4.8, reviews: 24, categoria: 'Ropa',       icon: 'ti-shirt',      badge: null },
  { id: 2, nombre: 'Zapatillas Urbanas', vendedor: 'Sport Zone', precio: 120.00, rating: 4.6, reviews: 41, categoria: 'Calzado',  icon: 'ti-shoe',       badge: 'Oferta' },
  { id: 3, nombre: 'Mochila Canvas', vendedor: 'TravelPack', precio: 65.00, rating: 4.9, reviews: 12, categoria: 'Accesorios',   icon: 'ti-backpack',   badge: 'Nuevo' },
  { id: 4, nombre: 'Lentes Sol Classic', vendedor: 'OptiStyle', precio: 30.00, rating: 4.3, reviews: 8,  categoria: 'Accesorios', icon: 'ti-sunglasses', badge: null },
  { id: 5, nombre: 'Pantalón Slim Fit', vendedor: 'Moda Urbana', precio: 78.00, rating: 4.5, reviews: 19, categoria: 'Ropa',      icon: 'ti-layers',     badge: null },
  { id: 6, nombre: 'Reloj Minimalista', vendedor: 'TimePro', precio: 210.00, rating: 4.7, reviews: 33, categoria: 'Accesorios',   icon: 'ti-clock',      badge: 'Popular' },
  { id: 7, nombre: 'Sudadera Oversize', vendedor: 'Moda Urbana', precio: 55.00, rating: 4.4, reviews: 15, categoria: 'Ropa',     icon: 'ti-shirt',      badge: null },
  { id: 8, nombre: 'Sandalias Playa',  vendedor: 'Sport Zone', precio: 28.00, rating: 4.2, reviews: 7,  categoria: 'Calzado',    icon: 'ti-shoe',       badge: 'Oferta' },
];

const badgeStyle = {
  'Oferta':  { bg: '#fee2e2', color: '#991b1b' },
  'Nuevo':   { bg: '#d1fae5', color: '#065f46' },
  'Popular': { bg: '#dbeafe', color: '#1e40af' },
};

function Stars({ rating }) {
  return (
    <span style={{ fontSize: 11, color: '#f59e0b' }}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  );
}

export default function Catalogo() {
  const { logout, user } = useAuth();
  const [categoria, setCategoria] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);

  const productosFiltrados = PRODUCTOS.filter(p =>
    (categoria === 'Todos' || p.categoria === categoria) &&
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === producto.id);
      if (existe) return prev.map(i => i.id === producto.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...producto, qty: 1 }];
    });
  };

  const totalCarrito = carrito.reduce((acc, i) => acc + i.qty, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f6f6f7' }}>
      {/* Header */}
      <header style={{
        background: 'var(--color-background-primary)',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        padding: '0 24px', height: 52,
        display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: '#1a1a1a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 600, fontSize: 14, flexShrink: 0,
        }}>M</div>

        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
          Marketplace
        </span>

        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          background: '#f6f6f7', border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 8, padding: '0 12px', height: 32, maxWidth: 480,
        }}>
          <i className="ti ti-search" style={{ fontSize: 14, color: 'var(--color-text-secondary)' }} aria-hidden="true" />
          <input
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontSize: 13, outline: 'none', flex: 1 }}
          />
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Carrito */}
          <button style={{
            position: 'relative', width: 34, height: 34,
            border: '0.5px solid var(--color-border-tertiary)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', background: 'var(--color-background-primary)',
            color: 'var(--color-text-secondary)', fontSize: 16,
          }}>
            <i className="ti ti-shopping-cart" aria-hidden="true" />
            {totalCarrito > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: '#2563eb', color: '#fff',
                fontSize: 9, fontWeight: 700, borderRadius: 10,
                padding: '1px 5px', minWidth: 16, textAlign: 'center',
              }}>{totalCarrito}</span>
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 20, background: '#e0e7ef',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, color: '#1e293b',
            }}>
              {user?.email?.substring(0, 2).toUpperCase()}
            </div>
            <button
              onClick={logout}
              style={{
                fontSize: 12, color: 'var(--color-text-secondary)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px' }}>
        {/* Categorías */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {CATEGORIAS.map(c => (
            <button
              key={c}
              onClick={() => setCategoria(c)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                border: '0.5px solid',
                borderColor: categoria === c ? '#2563eb' : 'var(--color-border-tertiary)',
                background: categoria === c ? '#2563eb' : 'var(--color-background-primary)',
                color: categoria === c ? '#fff' : 'var(--color-text-secondary)',
                fontWeight: categoria === c ? 500 : 400,
                transition: 'all 0.15s',
              }}
            >
              {c}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-text-secondary)', alignSelf: 'center' }}>
            {productosFiltrados.length} resultados
          </span>
        </div>

        {/* Grid de productos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
        }}>
          {productosFiltrados.map(p => (
            <div
              key={p.id}
              style={{
                background: 'var(--color-background-primary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 12, overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              {/* Imagen placeholder */}
              <div style={{
                height: 140, background: '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <i className={`ti ${p.icon}`} style={{ fontSize: 48, color: '#cbd5e1' }} aria-hidden="true" />
                {p.badge && (
                  <span style={{
                    position: 'absolute', top: 8, right: 8,
                    fontSize: 9, padding: '2px 7px', borderRadius: 10, fontWeight: 600,
                    background: badgeStyle[p.badge].bg,
                    color: badgeStyle[p.badge].color,
                  }}>{p.badge}</span>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '12px 12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 3 }}>{p.vendedor}</div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, flex: 1 }}>{p.nombre}</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                  <Stars rating={p.rating} />
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                    {p.rating} ({p.reviews})
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    ${p.precio.toFixed(2)}
                  </span>
                  <button
                    onClick={() => agregarAlCarrito(p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 10px', background: '#1a1a1a', color: '#fff',
                      border: 'none', borderRadius: 7, fontSize: 11, cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    <i className="ti ti-shopping-cart-plus" style={{ fontSize: 13 }} aria-hidden="true" />
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {productosFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-secondary)', fontSize: 14 }}>
            <i className="ti ti-search-off" style={{ fontSize: 40, display: 'block', marginBottom: 10 }} />
            No se encontraron productos
          </div>
        )}
      </div>
    </div>
  );
}
