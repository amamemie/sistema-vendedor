// src/pages/admin/ProductosAdmin.jsx
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './admin.css';

const BASE_URL = 'http://localhost/sistema-vendedor/backend';

export default function ProductosAdmin() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('Pendiente');
  const [mostrarModal, setMostrarModal] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [procesando, setProcesando] = useState(false);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/productos_pendientes.php`);
      const data = await response.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setProductos([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const aprobarProducto = async (idProducto) => {
    setProcesando(true);
    try {
      const result = await api.aprobarProducto(idProducto, 'Aprobado');
      if (result.success) {
        alert('✅ Producto aprobado');
        cargarProductos();
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (error) {
      alert('❌ Error al aprobar');
    }
    setProcesando(false);
  };

  const rechazarProducto = async (idProducto) => {
    if (!motivoRechazo.trim()) {
      alert('⚠️ Debes escribir un motivo de rechazo');
      return;
    }
    
    setProcesando(true);
    try {
      const result = await api.aprobarProducto(idProducto, 'Rechazado', motivoRechazo);
      if (result.success) {
        alert('❌ Producto rechazado');
        setMostrarModal(null);
        setMotivoRechazo('');
        cargarProductos();
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (error) {
      alert('❌ Error al rechazar');
    }
    setProcesando(false);
  };

  const productosFiltrados = productos.filter(p => {
    if (filtro === 'Pendiente') return p.estado_admin === 'Pendiente' || !p.estado_admin;
    if (filtro === 'Aprobado') return p.estado_admin === 'Aprobado';
    if (filtro === 'Rechazado') return p.estado_admin === 'Rechazado';
    return true;
  });

  const formatearPrecio = (precio) => {
    return `Bs. ${precio.toFixed(2)}`;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-BO');
  };

  if (loading) {
    return <div className="admin-loading">Cargando productos pendientes...</div>;
  }

  return (
    <div className="productos-admin">
      <div className="admin-section-header">
        <h2>📦 Aprobación de Productos</h2>
        <div className="productos-filtros">
          <button 
            className={`filtro-btn ${filtro === 'Pendiente' ? 'filtro-btn-active' : ''}`}
            onClick={() => setFiltro('Pendiente')}
          >
            Pendientes ({productos.filter(p => p.estado_admin === 'Pendiente' || !p.estado_admin).length})
          </button>
          <button 
            className={`filtro-btn ${filtro === 'Aprobado' ? 'filtro-btn-active' : ''}`}
            onClick={() => setFiltro('Aprobado')}
          >
            Aprobados
          </button>
          <button 
            className={`filtro-btn ${filtro === 'Rechazado' ? 'filtro-btn-active' : ''}`}
            onClick={() => setFiltro('Rechazado')}
          >
            Rechazados
          </button>
        </div>
      </div>

      {productosFiltrados.length === 0 ? (
        <div className="productos-empty">No hay productos en esta categoría</div>
      ) : (
        <div className="productos-pendientes-grid">
          {productosFiltrados.map(producto => (
            <div key={producto.id_producto} className="producto-pendiente-card">
              {/* Imagen */}
              <div className="producto-pendiente-imagen">
                {producto.imagen_principal ? (
                  <img src={`${BASE_URL}/${producto.imagen_principal}`} alt={producto.nombre} />
                ) : (
                  <div className="producto-pendiente-sin-imagen">📦</div>
                )}
              </div>
              
              {/* Información */}
              <div className="producto-pendiente-info">
                <h3 className="producto-pendiente-nombre">{producto.nombre}</h3>
                
                <div className="producto-pendiente-descripcion">
                  {producto.descripcion ? (
                    <p>{producto.descripcion}</p>
                  ) : (
                    <p className="sin-descripcion">Sin descripción</p>
                  )}
                </div>
                
                <div className="producto-pendiente-detalles">
                  <div className="detalle-item">
                    <span className="detalle-label">💰 Precio:</span>
                    <span className="detalle-valor">{formatearPrecio(producto.precio_unitario)}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">📂 Categoría:</span>
                    <span className="detalle-valor">{producto.categoria || 'Sin categoría'}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">📅 Fecha:</span>
                    <span className="detalle-valor">{formatearFecha(producto.fecha_creacion)}</span>
                  </div>
                </div>
                
                {/* Información del vendedor */}
                <div className="producto-pendiente-vendedor">
                  <div className="vendedor-header">
                    <span className="vendedor-icon">🏪</span>
                    <span className="vendedor-titulo">Vendedor</span>
                  </div>
                  <div className="vendedor-info">
                    <div><strong>Tienda:</strong> {producto.nombre_tienda || 'Sin tienda'}</div>
                    <div><strong>Vendedor:</strong> {producto.vendedor_nombre_completo}</div>
                    <div><strong>Email:</strong> {producto.vendedor_email || 'No disponible'}</div>
                    <div><strong>ID Vendedor:</strong> #{producto.id_vendedor || 'N/A'}</div>
                  </div>
                </div>
              </div>
              
              {/* Estado y acciones */}
              <div className="producto-pendiente-acciones">
                <div className={`producto-estado-badge estado-${producto.estado_admin?.toLowerCase() || 'pendiente'}`}>
                  {producto.estado_admin || 'Pendiente'}
                </div>
                
                {(producto.estado_admin === 'Pendiente' || !producto.estado_admin) && (
                  <div className="acciones-botones">
                    <button 
                      className="btn-aprobar"
                      onClick={() => aprobarProducto(producto.id_producto)}
                      disabled={procesando}
                    >
                      ✅ Aprobar
                    </button>
                    <button 
                      className="btn-rechazar"
                      onClick={() => setMostrarModal(producto.id_producto)}
                      disabled={procesando}
                    >
                      ❌ Rechazar
                    </button>
                  </div>
                )}
                
                {producto.estado_admin === 'Aprobado' && (
                  <div className="aprobado-info">✓ Producto aprobado y visible en el catálogo</div>
                )}
                
                {producto.estado_admin === 'Rechazado' && producto.rechazo_motivo && (
                  <div className="rechazado-info">
                    <strong>Motivo de rechazo:</strong>
                    <p>{producto.rechazo_motivo}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de rechazo */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rechazar producto</h3>
              <button className="modal-close" onClick={() => setMostrarModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>¿Por qué motivo rechazas este producto?</p>
              <textarea
                className="modal-textarea"
                rows="4"
                placeholder="Escribe el motivo del rechazo..."
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setMostrarModal(null)}>Cancelar</button>
              <button 
                className="btn-danger" 
                onClick={() => rechazarProducto(mostrarModal)}
                disabled={procesando}
              >
                {procesando ? 'Procesando...' : 'Rechazar producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}