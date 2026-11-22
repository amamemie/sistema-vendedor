import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function CatalogoComprador({ user, onViewProduct, onViewCart, onViewProfile }) {
  const { logout } = useAuth();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  // Cargar productos
  const cargarProductos = async () => {
    setLoading(true);
    try {
      const data = await api.getProductos(null, true);
      if (Array.isArray(data)) {
        setProductos(data);
      }
    } catch (err) {
      setError('Error al cargar productos');
    }
    setLoading(false);
  };

  // Cargar categorías
  const cargarCategorias = async () => {
    try {
      const data = await api.getCategorias();
      if (Array.isArray(data)) {
        setCategorias([{ id_categoria: null, nombre: 'Todos' }, ...data]);
      }
    } catch (err) {
      console.error('Error cargando categorías:', err);
    }
  };

  // Cargar carrito desde localStorage
  const cargarCarrito = () => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }
  };

  // Guardar carrito en localStorage
  const guardarCarrito = (nuevoCarrito) => {
    setCarrito(nuevoCarrito);
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
  };

  // Agregar al carrito
  const agregarAlCarrito = (producto) => {
    const nuevoCarrito = [...carrito];
    const existe = nuevoCarrito.find(item => item.id_producto === producto.id_producto);
    
    if (existe) {
      existe.cantidad += 1;
    } else {
      nuevoCarrito.push({ ...producto, cantidad: 1 });
    }
    
    guardarCarrito(nuevoCarrito);
    alert(`✅ ${producto.nombre} agregado al carrito`);
  };

  // Eliminar del carrito
  const eliminarDelCarrito = (idProducto) => {
    const nuevoCarrito = carrito.filter(item => item.id_producto !== idProducto);
    guardarCarrito(nuevoCarrito);
  };

  // Vaciar carrito
  const vaciarCarrito = () => {
    if (confirm('¿Vaciar todo el carrito?')) {
      guardarCarrito([]);
    }
  };

  // Calcular total del carrito
  const totalCarrito = carrito.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
  const cantidadCarrito = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
    cargarCarrito();
  }, []);

  const productosFiltrados = productos.filter(p => {
    const matchCategoria = categoriaSeleccionada === 'Todos' || p.id_categoria == categoriaSeleccionada;
    const matchBusqueda = busqueda === '' || 
                          (p.nombre && p.nombre.toLowerCase().includes(busqueda.toLowerCase()));
    return matchCategoria && matchBusqueda;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f6f6f7' }}>
      {/* Header */}
      <header style={{
        background: '#fff',
        padding: '0 20px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: '#1a1a1a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700
          }}>M</div>
          <span style={{ fontWeight: 600, fontSize: 16 }}>MarketPlace Paceño</span>
        </div>

        {/* Buscador */}
        <div style={{
          flex: 1, maxWidth: 400, margin: '0 20px',
          display: 'flex', alignItems: 'center',
          background: '#f6f6f7', border: '1px solid #e2e8f0',
          borderRadius: 8, padding: '0 12px', height: 38
        }}>
          <input
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontSize: 14, outline: 'none', flex: 1 }}
          />
        </div>

        {/* Botones de navegación */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Botón carrito */}
          <button
            onClick={() => setMostrarCarrito(!mostrarCarrito)}
            style={{
              position: 'relative',
              width: 40, height: 40,
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              background: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            🛒
            {cantidadCarrito > 0 && (
              <span style={{
                position: 'absolute',
                top: -5, right: -5,
                background: '#2563eb',
                color: '#fff',
                fontSize: 10,
                borderRadius: 10,
                padding: '1px 5px',
                minWidth: 18,
                textAlign: 'center'
              }}>{cantidadCarrito}</span>
            )}
          </button>

          {/* Botón perfil */}
          <button
            onClick={onViewProfile}
            style={{
              width: 34, height: 34, borderRadius: 20,
              background: '#e0e7ef', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 12, fontWeight: 600
            }}
          >
            {user?.email?.substring(0, 2).toUpperCase() || 'U'}
          </button>

          {/* Botón salir */}
          <button
            onClick={logout}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#64748b' }}
          >
            Salir
          </button>
        </div>
      </header>

      {/* Panel del carrito */}
      {mostrarCarrito && (
        <div style={{
          position: 'fixed',
          top: 60,
          right: 20,
          width: 380,
          maxHeight: '80vh',
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 200,
          overflow: 'auto'
        }}>
          <div style={{ padding: 16, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>🛒 Mi carrito ({cantidadCarrito} items)</h3>
            <button onClick={() => setMostrarCarrito(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
          </div>
          
          {carrito.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              <p>Carrito vacío</p>
            </div>
          ) : (
            <>
              {carrito.map(item => (
                <div key={item.id_producto} style={{ padding: 12, borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 12 }}>
                  <div style={{ width: 50, height: 50, background: '#f8fafc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.imagen_principal ? (
                      <img src={`http://localhost/sistema-vendedor/backend/${item.imagen_principal}`} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{item.nombre}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{item.nombre_tienda}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Bs. {item.precio_unitario.toFixed(2)}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span>Cant: {item.cantidad}</span>
                        <button onClick={() => eliminarDelCarrito(item.id_producto)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ padding: 16, borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <strong>Total:</strong>
                  <strong style={{ fontSize: 18, color: '#1a1a1a' }}>Bs. {totalCarrito.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={vaciarCarrito} style={{ flex: 1, padding: 10, background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Vaciar</button>
                  <button onClick={onViewCart} style={{ flex: 1, padding: 10, background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Comprar ahora</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Contenido principal */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        {error && (
          <div style={{ background: '#fef2f2', padding: 12, borderRadius: 8, marginBottom: 20, color: '#dc2626', textAlign: 'center' }}>
            ❌ {error}
          </div>
        )}

        {/* Categorías */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {categorias.map(cat => (
            <button
              key={cat.id_categoria || 'todos'}
              onClick={() => setCategoriaSeleccionada(cat.id_categoria ?? 'Todos')}
              style={{
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: 13,
                cursor: 'pointer',
                border: '1px solid #e2e8f0',
                background: categoriaSeleccionada === (cat.id_categoria ?? 'Todos') ? '#1a1a1a' : '#fff',
                color: categoriaSeleccionada === (cat.id_categoria ?? 'Todos') ? '#fff' : '#64748b'
              }}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* Grid de productos */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>Cargando productos...</div>
        ) : productosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {productosFiltrados.map(p => (
              <div
                key={p.id_producto}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  transition: 'box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                {/* Imagen */}
                <div
                  style={{ height: 180, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #e2e8f0' }}
                  onClick={() => onViewProduct?.(p)}
                >
                  {p.imagen_principal ? (
                    <img
                      src={`http://localhost/sistema-vendedor/backend/${p.imagen_principal}`}
                      alt={p.nombre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span style={{ fontSize: 48 }}>📦</span>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '14px' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{p.nombre_tienda || 'Tienda'}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{p.nombre}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
                    Bs. {parseFloat(p.precio_unitario).toFixed(2)}
                  </div>
                  
                  {/* Calificación */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: '#f59e0b' }}>
                      {'★'.repeat(Math.round(p.calificacion_promedio || 0))}
                      {'☆'.repeat(5 - Math.round(p.calificacion_promedio || 0))}
                    </span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      {p.calificacion_promedio?.toFixed(1) || 'Nuevo'}
                    </span>
                  </div>

                  {/* Stock */}
                  <div style={{ fontSize: 11, marginTop: 6, color: (p.stock || 0) <= 0 ? '#dc2626' : (p.stock || 0) <= 5 ? '#d97706' : '#059669' }}>
                    Stock: {p.stock || 0} unidades
                  </div>

                  {/* Botones */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                      onClick={() => onViewProduct?.(p)}
                      style={{ flex: 1, padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}
                    >
                      Ver detalles
                    </button>
                    <button
                      onClick={() => agregarAlCarrito(p)}
                      disabled={(p.stock || 0) <= 0}
                      style={{
                        flex: 1, padding: '8px', background: (p.stock || 0) <= 0 ? '#cbd5e1' : '#1a1a1a',
                        color: '#fff', border: 'none', borderRadius: 8, cursor: (p.stock || 0) <= 0 ? 'not-allowed' : 'pointer',
                        fontSize: 12
                      }}
                    >
                      {(p.stock || 0) <= 0 ? 'Sin stock' : 'Agregar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}