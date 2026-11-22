import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function CatalogoPublico({ onLoginClick, onRegisterClick }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [mostrarCheckout, setMostrarCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [animacionCarga, setAnimacionCarga] = useState(true);

  // Cargar productos
  const cargarProductos = async () => {
    setLoading(true);
    setAnimacionCarga(true);
    setError('');
    try {
      const data = await api.getProductos(null, true);
      console.log('📦 Productos:', data);
      if (Array.isArray(data)) {
        // Simular tiempo de carga para ver la animación
        setTimeout(() => {
          setProductos(data);
          setLoading(false);
          setAnimacionCarga(false);
        }, 800);
      } else {
        setError('Error al cargar productos');
        setLoading(false);
        setAnimacionCarga(false);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Error de conexión');
      setLoading(false);
      setAnimacionCarga(false);
    }
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
    const carritoGuardado = localStorage.getItem('carrito_publico');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }
  };

  // Guardar carrito en localStorage
  const guardarCarrito = (nuevoCarrito) => {
    setCarrito(nuevoCarrito);
    localStorage.setItem('carrito_publico', JSON.stringify(nuevoCarrito));
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
    
    // Mostrar feedback visual
    const btn = document.getElementById(`btn-${producto.id_producto}`);
    if (btn) {
      btn.textContent = '✓ Agregado';
      btn.style.background = '#059669';
      setTimeout(() => {
        btn.textContent = 'Agregar';
        btn.style.background = '#1a1a1a';
      }, 1000);
    }
  };

  // Eliminar del carrito
  const eliminarDelCarrito = (idProducto) => {
    const nuevoCarrito = carrito.filter(item => item.id_producto !== idProducto);
    guardarCarrito(nuevoCarrito);
  };

  // Actualizar cantidad
  const actualizarCantidad = (idProducto, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(idProducto);
      return;
    }
    const nuevoCarrito = carrito.map(item =>
      item.id_producto === idProducto ? { ...item, cantidad: nuevaCantidad } : item
    );
    guardarCarrito(nuevoCarrito);
  };

  // Vaciar carrito
  const vaciarCarrito = () => {
    if (confirm('¿Vaciar todo el carrito?')) {
      guardarCarrito([]);
    }
  };

  // Ir a checkout (pide login/registro)
  const irAcheckout = () => {
    if (carrito.length === 0) {
      alert('🛒 Tu carrito está vacío');
      return;
    }
    
    // Guardar datos del checkout temporalmente
    const datosCheckout = {
      carrito: carrito,
      total: totalCarrito,
      items: carrito.length,
      timestamp: Date.now()
    };
    localStorage.setItem('checkout_pendiente', JSON.stringify(datosCheckout));
    
    // Mostrar modal o redirigir a login
    setCheckoutData(datosCheckout);
    setMostrarCheckout(true);
  };

  // Confirmar checkout (después de login/registro)
  const confirmarCheckout = () => {
    // Limpiar carrito después de la compra
    guardarCarrito([]);
    localStorage.removeItem('checkout_pendiente');
    setMostrarCarrito(false);
    setMostrarCheckout(false);
    alert('✅ Redirigiendo al proceso de pago...');
    // Aquí se llamaría a la función de login/registro
    if (onLoginClick) onLoginClick();
  };

  // Cancelar checkout
  const cancelarCheckout = () => {
    setMostrarCheckout(false);
    setCheckoutData(null);
    localStorage.removeItem('checkout_pendiente');
  };

  // Calcular total
  const totalCarrito = carrito.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
  const cantidadCarrito = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
    cargarCarrito();
    
    // Verificar si hay checkout pendiente al cargar
    const checkoutPendiente = localStorage.getItem('checkout_pendiente');
    if (checkoutPendiente) {
      const datos = JSON.parse(checkoutPendiente);
      setCheckoutData(datos);
      setMostrarCheckout(true);
    }
  }, []);

  const productosFiltrados = productos.filter(p => {
    const matchCategoria = categoriaSeleccionada === 'Todos' || p.id_categoria == categoriaSeleccionada;
    const matchBusqueda = busqueda === '' || 
                          (p.nombre && p.nombre.toLowerCase().includes(busqueda.toLowerCase()));
    return matchCategoria && matchBusqueda;
  });

  // Spinner de carga animado
  if (loading || animacionCarga) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f6f6f7'
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'spin 1s linear infinite',
          marginBottom: 20
        }}>
          <span style={{ fontSize: 40, color: '#fff' }}>🛒</span>
        </div>
        <div style={{
          width: 60,
          height: 60,
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #1a1a1a',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <p style={{ marginTop: 20, color: '#64748b' }}>Cargando productos...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

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
            width: 36,
            height: 36,
            borderRadius: 8,
            background: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            animation: 'pulse 2s infinite'
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

        {/* Botones */}
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

          <button
            onClick={onLoginClick}
            style={{
              padding: '8px 16px',
              background: '#fff',
              border: '1px solid #2563eb',
              borderRadius: 8,
              color: '#2563eb',
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            Iniciar sesión
          </button>
          <button
            onClick={onRegisterClick}
            style={{
              padding: '8px 16px',
              background: '#2563eb',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            Crear cuenta
          </button>
        </div>
      </header>

      {/* Panel del carrito flotante */}
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
              <span style={{ fontSize: 48 }}>🛒</span>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Bs. {item.precio_unitario.toFixed(2)}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => actualizarCantidad(item.id_producto, item.cantidad - 1)} style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>-</button>
                        <span style={{ minWidth: 20, textAlign: 'center' }}>{item.cantidad}</span>
                        <button onClick={() => actualizarCantidad(item.id_producto, item.cantidad + 1)} style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>+</button>
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
                  <button onClick={irAcheckout} style={{ flex: 1, padding: 10, background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Continuar compra</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal de confirmación de checkout (pide login/registro) */}
      {mostrarCheckout && checkoutData && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            maxWidth: 400,
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
            <h3 style={{ marginBottom: 8 }}>¡Ya casi tienes tu pedido!</h3>
            <p style={{ color: '#64748b', marginBottom: 16 }}>
              Tienes <strong>{checkoutData.items} productos</strong> en tu carrito<br />
              Total: <strong style={{ fontSize: 18, color: '#1a1a1a' }}>Bs. {checkoutData.total.toFixed(2)}</strong>
            </p>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              Para continuar con tu compra, necesitas <strong>iniciar sesión</strong> o <strong>crear una cuenta</strong>
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={cancelarCheckout}
                style={{ flex: 1, padding: 10, background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                Seguir comprando
              </button>
              <button
                onClick={() => {
                  // Guardar que el carrito debe restaurarse después del login
                  localStorage.setItem('restaurar_carrito', 'true');
                  cancelarCheckout();
                  if (onLoginClick) onLoginClick();
                }}
                style={{ flex: 1, padding: 10, background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                Iniciar sesión
              </button>
            </div>
            <button
              onClick={() => {
                cancelarCheckout();
                if (onRegisterClick) onRegisterClick();
              }}
              style={{ marginTop: 12, background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 13 }}
            >
              Crear una cuenta nueva
            </button>
          </div>
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
                color: categoriaSeleccionada === (cat.id_categoria ?? 'Todos') ? '#fff' : '#64748b',
                transition: 'all 0.2s'
              }}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* Grid de productos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20
        }}>
          {productosFiltrados.map(p => (
            <div
              key={p.id_producto}
              style={{
                background: '#fff',
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Imagen */}
              <div style={{
                height: 180,
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid #e2e8f0'
              }}>
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
                  {p.stock > 0 ? `Stock: ${p.stock} unidades` : 'Agotado'}
                </div>

                {/* Botón agregar */}
                <button
                  id={`btn-${p.id_producto}`}
                  onClick={() => agregarAlCarrito(p)}
                  disabled={(p.stock || 0) <= 0}
                  style={{
                    width: '100%',
                    marginTop: 12,
                    padding: '10px',
                    background: (p.stock || 0) <= 0 ? '#cbd5e1' : '#1a1a1a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: (p.stock || 0) <= 0 ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                >
                  {(p.stock || 0) <= 0 ? 'Sin stock' : 'Agregar al carrito'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {productosFiltrados.length === 0 && !loading && !error && (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
            <span style={{ fontSize: 48 }}>🔍</span>
            <p>No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Estilos de animación */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
    </div>
  );
}