import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerPedidosUsuario, formatearPrecio, formatearFecha } from './comprador.utils';
import './comprador.css';

export default function MisPedidos() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(null);
  const [motivoDevolucion, setMotivoDevolucion] = useState('');

  useEffect(() => {
    const cargar = async () => {
      const userId = user?.id || user?.id_usuario;
      
      if (!userId) {
        setError('Usuario no identificado');
        setLoading(false);
        return;
      }
      
      const data = await obtenerPedidosUsuario(userId);
      
      if (data.error) {
        setError(data.error);
        setPedidos([]);
      } else {
        setPedidos(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    };
    
    cargar();
  }, [user]);

  // Cancelar pedido (solo pendientes)
  const handleCancelar = async (idCompra) => {
    if (!confirm('¿Estás seguro de que quieres CANCELAR este pedido?')) return;
    
    setProcesando(idCompra);
    try {
      const response = await fetch('http://localhost/sistema-vendedor/backend/cancelar_pedido.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_compra: idCompra })
      });
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Pedido cancelado correctamente');
        // Recargar pedidos
        const userId = user?.id || user?.id_usuario;
        const nuevosPedidos = await obtenerPedidosUsuario(userId);
        setPedidos(Array.isArray(nuevosPedidos) ? nuevosPedidos : []);
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      alert('❌ Error de conexión');
    } finally {
      setProcesando(null);
    }
  };

  // Solicitar devolución (solo pagados)
  const handleSolicitarDevolucion = async () => {
    if (!motivoDevolucion.trim()) {
      alert('⚠️ Por favor, escribe un motivo para la devolución');
      return;
    }
    
    setProcesando(mostrarModal);
    try {
      const response = await fetch('http://localhost/sistema-vendedor/backend/solicitar_devolucion.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id_compra: mostrarModal,
          motivo: motivoDevolucion
        })
      });
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Solicitud de devolución enviada');
        setMostrarModal(null);
        setMotivoDevolucion('');
        // Recargar pedidos
        const userId = user?.id || user?.id_usuario;
        const nuevosPedidos = await obtenerPedidosUsuario(userId);
        setPedidos(Array.isArray(nuevosPedidos) ? nuevosPedidos : []);
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      alert('❌ Error de conexión');
    } finally {
      setProcesando(null);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Cargando pedidos...</div>;
  }

  if (error) {
    return <div className="error-message">❌ {error}</div>;
  }

  return (
    <div className="mis-pedidos-container">
      <h2>📦 Mis pedidos</h2>
      
      {pedidos.length === 0 ? (
        <div className="empty-pedidos">
          <span>🛒</span>
          <p>No tienes pedidos aún</p>
        </div>
      ) : (
        pedidos.map(p => {
          // Determinar qué botones mostrar
          const esPendiente = p.estado === 'Pendiente';
          const esPagada = p.estado === 'Pagada';
          const tieneSolicitud = p.solicita_devolucion === 'Pendiente';
          const devolucionAprobada = p.solicita_devolucion === 'Aprobado';
          const devolucionRechazada = p.solicita_devolucion === 'Rechazado';
          
          return (
            <div key={p.id_compra} className="pedido-card-comprador">
              <div className="pedido-header-comprador">
                <div>
                  <strong>Pedido #{p.id_compra}</strong>
                  <span className="pedido-fecha">📅 {formatearFecha(p.fecha_compra)}</span>
                </div>
                <span className={`pedido-estado ${esPendiente ? 'estado-pendiente' : esPagada ? 'estado-pagado' : 'estado-cancelado'}`}>
                  {p.estado || 'Pendiente'}
                </span>
              </div>
              
              <div className="pedido-items-comprador">
                {p.detalles && p.detalles.length > 0 ? (
                  p.detalles.map(item => (
                    <div key={item.id_producto} className="pedido-item-comprador">
                      <span>{item.producto_nombre} x{item.cantidad}</span>
                      <span>{formatearPrecio(item.precio_unitario * item.cantidad)}</span>
                    </div>
                  ))
                ) : (
                  <div className="pedido-item-comprador">Cargando detalles...</div>
                )}
              </div>
              
              <div className="pedido-total-comprador">
                <strong>Total: {formatearPrecio(p.total_bruto || 0)}</strong>
              </div>
              
              {/* BOTONES DE ACCIÓN */}
              <div className="pedido-acciones">
                {/* Botón CANCELAR - Solo para pedidos PENDIENTES */}
                {esPendiente && (
                  <button 
                    className="btn-cancelar"
                    onClick={() => handleCancelar(p.id_compra)}
                    disabled={procesando === p.id_compra}
                  >
                    {procesando === p.id_compra ? 'Procesando...' : '❌ Cancelar pedido'}
                  </button>
                )}
                
                {/* Botón DEVOLUCIÓN - Solo para pedidos PAGADOS sin solicitud previa */}
                {esPagada && !tieneSolicitud && !devolucionAprobada && !devolucionRechazada && (
                  <button 
                    className="btn-devolucion"
                    onClick={() => setMostrarModal(p.id_compra)}
                    disabled={procesando === p.id_compra}
                  >
                    🔄 Solicitar devolución
                  </button>
                )}
                
                {/* Estado de solicitud de devolución */}
                {tieneSolicitud && (
                  <span className="devolucion-pendiente">⏳ Devolución en revisión</span>
                )}
                
                {devolucionAprobada && (
                  <span className="devolucion-aprobada">✅ Devolución aprobada</span>
                )}
                
                {devolucionRechazada && (
                  <span className="devolucion-rechazada">❌ Devolución rechazada</span>
                )}
                
                {/* Pedido cancelado */}
                {p.estado === 'Cancelada' && (
                  <span className="pedido-cancelado">Pedido cancelado</span>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* Modal para solicitar devolución */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Solicitar devolución</h3>
              <button className="modal-close" onClick={() => setMostrarModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>¿Por qué quieres devolver este pedido?</p>
              <textarea
                className="modal-textarea"
                rows="4"
                placeholder="Escribe el motivo de tu devolución..."
                value={motivoDevolucion}
                onChange={(e) => setMotivoDevolucion(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setMostrarModal(null)}>Cancelar</button>
              <button 
                className="btn-primary" 
                onClick={handleSolicitarDevolucion}
                disabled={procesando === mostrarModal}
              >
                {procesando === mostrarModal ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}