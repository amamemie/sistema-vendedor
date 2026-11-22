import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';  // ← AGREGAR ESTA LÍNEA
import { motivosReporte, reportarProducto } from './comprador.utils';
import ChatFab from '../../components/ChatFab';
import ValorarVendedor from '../../components/ValorarVendedor';
import './comprador.css';

export default function DetalleProducto({ producto, onBack, onAddToCart }) {
  const { user } = useAuth();  // ← AGREGAR ESTA LÍNEA
  const [cantidad, setCantidad] = useState(1);
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState(null);
  const [descripcionReporte, setDescripcionReporte] = useState('');
  const [reportando, setReportando] = useState(false);
  const [mensajeReporte, setMensajeReporte] = useState('');
  const stock = producto.stock || 0;

  const handleReportar = async () => {
    if (!motivoSeleccionado) {
      setMensajeReporte('⚠️ Selecciona un motivo para reportar');
      setTimeout(() => setMensajeReporte(''), 3000);
      return;
    }
    
    setReportando(true);
    setMensajeReporte('');
    
    try {
      const motivo = motivosReporte.find(m => m.id === motivoSeleccionado);
      const result = await reportarProducto(producto.id_producto, motivo.label, descripcionReporte);
      
      if (result.success) {
        setMensajeReporte('✅ Reporte enviado. El administrador lo revisará.');
        setTimeout(() => {
          setMostrarReporte(false);
          setMotivoSeleccionado(null);
          setDescripcionReporte('');
          setMensajeReporte('');
        }, 1500);
      } else {
        setMensajeReporte(`❌ Error: ${result.message || 'No se pudo enviar el reporte'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMensajeReporte('❌ Error de conexión. Intenta nuevamente.');
    } finally {
      setReportando(false);
    }
  };

  return (
    <div className="detalle-container">
      <div className="detalle-content">
        <button onClick={onBack} className="carrito-btn-volver">
          <span>←</span> Volver al catálogo
        </button>

        <div className="detalle-card">
          {/* Imagen */}
          <div className="detalle-imagen">
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, textAlign: 'center' }}>
              {producto.imagen_principal ? (
                <img 
                  src={`http://localhost/sistema-vendedor/backend/${producto.imagen_principal}`} 
                  alt={producto.nombre} 
                  style={{ maxWidth: '100%', maxHeight: 300 }} 
                />
              ) : (
                <span style={{ fontSize: 80 }}>📦</span>
              )}
            </div>
          </div>

          {/* Información */}
          <div className="detalle-info">
            <h1>{producto.nombre}</h1>
            <div className="detalle-tienda">{producto.nombre_tienda || 'Tienda oficial'}</div>
            
            <div className="detalle-precio">
              Bs. {parseFloat(producto.precio_unitario).toFixed(2)}
            </div>
            
            <div className={`detalle-stock ${stock <= 0 ? 'stock-agotado' : stock <= 5 ? 'stock-bajo' : 'stock-normal'}`}>
              {stock <= 0 ? '❌ Agotado' : stock <= 5 ? `⚠️ Últimas ${stock} unidades` : `✅ Stock: ${stock} unidades`}
            </div>
            
            <div className="detalle-descripcion">
              <h3>Descripción</h3>
              <p>{producto.descripcion || 'Sin descripción disponible'}</p>
            </div>
            
            <div className="detalle-vendedor">
              <h3>Información del vendedor</h3>
              <p><strong>Tienda:</strong> {producto.nombre_tienda || 'Tienda oficial'}</p>
              
              {/* Calificación del vendedor */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 12, color: '#f59e0b' }}>
                  {'★'.repeat(Math.round(producto.vendedor_calificacion || 0))}
                  {'☆'.repeat(5 - Math.round(producto.vendedor_calificacion || 0))}
                </span>
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  {producto.vendedor_calificacion?.toFixed(1) || 'Nuevo'} · 
                  {producto.vendedor_total_resenas || 0} reseñas
                </span>
              </div>
              
              <p><strong>Vendedor verificado</strong></p>
            </div>
            
            {stock > 0 && (
              <div className="detalle-cantidad">
                <button 
                  className="cantidad-btn" 
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                >-</button>
                <span className="cantidad-valor">{cantidad}</span>
                <button 
                  className="cantidad-btn" 
                  onClick={() => setCantidad(Math.min(stock, cantidad + 1))}
                >+</button>
                <button 
                  className="btn-primary" 
                  onClick={() => onAddToCart({ ...producto, cantidad })}
                >
                  Agregar al carrito
                </button>
              </div>
            )}
            
            <button 
              className="btn-reportar-producto" 
              onClick={() => setMostrarReporte(true)}
            >
              ⚠️ Reportar producto
            </button>

            {/* Valorar vendedor - solo después de comprar */}
            {user && user.rol === 'Comprador' && (
              <ValorarVendedor 
                vendedorId={producto.id_vendedor}
                vendedorNombre={producto.nombre_tienda}
                productoId={producto.id_producto}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal de reporte */}
      {mostrarReporte && (
        <div className="reportar-overlay" onClick={() => setMostrarReporte(false)}>
          <div className="reportar-modal" onClick={e => e.stopPropagation()}>
            <div className="reportar-header">
              <h3 className="reportar-title">⚠️ Reportar producto</h3>
              <button className="modal-close" onClick={() => setMostrarReporte(false)}>✕</button>
            </div>
            
            <div className="reportar-body">
              <p><strong>{producto.nombre}</strong> - {producto.nombre_tienda}</p>
              
              {mensajeReporte && (
                <div className={`perfil-message ${mensajeReporte.includes('✅') ? 'success' : 'error'}`}>
                  {mensajeReporte}
                </div>
              )}
              
              <div className="reportar-motivos">
                {motivosReporte.map(m => (
                  <label key={m.id} className="reportar-motivo-option">
                    <input 
                      type="radio" 
                      name="motivo" 
                      value={m.id} 
                      checked={motivoSeleccionado === m.id} 
                      onChange={() => setMotivoSeleccionado(m.id)} 
                    />
                    {m.icon} {m.label}
                  </label>
                ))}
              </div>
              
              <div className="form-group">
                <label className="form-label">Describe el problema (opcional)</label>
                <textarea 
                  className="form-textarea" 
                  rows="3" 
                  value={descripcionReporte} 
                  onChange={e => setDescripcionReporte(e.target.value)} 
                  placeholder="Explica con detalles el problema..."
                />
              </div>
            </div>
            
            <div className="reportar-footer">
              <button className="btn-secondary" onClick={() => setMostrarReporte(false)}>Cancelar</button>
              <button 
                className="btn-primary" 
                onClick={handleReportar} 
                disabled={!motivoSeleccionado || reportando}
              >
                {reportando ? 'Enviando...' : 'Enviar reporte'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante de chat - solo para compradores logueados */}
      {user && user.rol === 'Comprador' && (
        <ChatFab 
          vendedorId={producto.id_vendedor}
          vendedorNombre={producto.nombre_tienda}
          productoId={producto.id_producto}
        />
      )}
    </div>
  );
}