import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerPedidosUsuario, formatearPrecio, formatearFecha } from './comprador.utils';
import './comprador.css';
import { useTranslation } from 'react-i18next';
import { toast } from '../../components/ui/toast';

export default function MisPedidos() {
  const { t } = useTranslation();
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
        setError(t('errors.noUser'));
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
    if (!confirm(t('myOrders.confirmCancel'))) return;
    
    setProcesando(idCompra);
    try {
      const response = await fetch('http://localhost/sistema-vendedor/backend/cancelar_pedido.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_compra: idCompra })
      });
      const data = await response.json();
      
      if (data.success) {
        toast(t('myOrders.cancelled'));
        // Recargar pedidos
        const userId = user?.id || user?.id_usuario;
        const nuevosPedidos = await obtenerPedidosUsuario(userId);
        setPedidos(Array.isArray(nuevosPedidos) ? nuevosPedidos : []);
      } else {
        toast(data.message || t('errors.generic'), 'error');
      }
    } catch {
      toast(t('errors.connection'), 'error');
    } finally {
      setProcesando(null);
    }
  };

  // Solicitar devolución (solo pagados)
  const handleSolicitarDevolucion = async () => {
    if (!motivoDevolucion.trim()) {
      toast(t('myOrders.reasonRequired'), 'error');
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
        toast(t('myOrders.returnSent'));
        setMostrarModal(null);
        setMotivoDevolucion('');
        // Recargar pedidos
        const userId = user?.id || user?.id_usuario;
        const nuevosPedidos = await obtenerPedidosUsuario(userId);
        setPedidos(Array.isArray(nuevosPedidos) ? nuevosPedidos : []);
      } else {
        toast(data.message || t('errors.generic'), 'error');
      }
    } catch {
      toast(t('errors.connection'), 'error');
    } finally {
      setProcesando(null);
    }
  };

  if (loading) {
    return <div className="skeleton" style={{ height: 240, borderRadius: 16 }} />;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="mis-pedidos-container">
      <h2>{t('buyer.tabs.orders')}</h2>
      
      {pedidos.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"><i className="ti ti-package" aria-hidden="true" /></span>
          <p>{t('myOrders.empty')}</p>
        </div>
      ) : (
        pedidos.map((p, i) => {
          // Determinar qué botones mostrar
          const esPendiente = p.estado === 'Pendiente';
          const esPagada = p.estado === 'Pagada';
          const tieneSolicitud = p.solicita_devolucion === 'Pendiente';
          const devolucionAprobada = p.solicita_devolucion === 'Aprobado';
          const devolucionRechazada = p.solicita_devolucion === 'Rechazado';
          
          return (
            <div key={p.id_compra} className="pedido-card-comprador" style={{ animation: 'riseIn 0.45s var(--ease) both', animationDelay: `${Math.min(i, 10) * 50}ms` }}>
              <div className="pedido-header-comprador">
                <div>
                  <strong>{t('vendor.orders.order', { id: p.id_compra })}</strong>
                  <span className="pedido-fecha"><i className="ti ti-calendar" aria-hidden="true" /> {formatearFecha(p.fecha_compra)}</span>
                </div>
                <span className={`pedido-estado ${({ Pendiente: 'estado-pendiente', Pagada: 'estado-pagado', Enviado: 'estado-enviado', Entregado: 'estado-entregado' })[p.estado || 'Pendiente'] || 'estado-cancelado'}`}>
                  {t(`orderStatus.${p.estado || 'Pendiente'}`, { defaultValue: p.estado })}
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
                  <div className="pedido-item-comprador">{t('common.loading')}</div>
                )}
              </div>
              
              <div className="pedido-total-comprador">
                <strong>{t('common.total')}: {formatearPrecio(p.total_bruto || 0)}</strong>
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
                    {procesando === p.id_compra ? t('common.processing') : <><i className="ti ti-x" aria-hidden="true" /> {t('myOrders.cancel')}</>}
                  </button>
                )}
                
                {/* Botón DEVOLUCIÓN - Solo para pedidos PAGADOS sin solicitud previa */}
                {esPagada && !tieneSolicitud && !devolucionAprobada && !devolucionRechazada && (
                  <button 
                    className="btn-devolucion"
                    onClick={() => setMostrarModal(p.id_compra)}
                    disabled={procesando === p.id_compra}
                  >
                    <i className="ti ti-rotate" aria-hidden="true" /> {t('myOrders.requestReturn')}
                  </button>
                )}
                
                {/* Estado de solicitud de devolución */}
                {tieneSolicitud && (
                  <span className="devolucion-pendiente"><i className="ti ti-clock" aria-hidden="true" /> {t('myOrders.returnReview')}</span>
                )}
                
                {devolucionAprobada && (
                  <span className="devolucion-aprobada"><i className="ti ti-circle-check" aria-hidden="true" /> {t('admin.returns.approved')}</span>
                )}
                
                {devolucionRechazada && (
                  <span className="devolucion-rechazada"><i className="ti ti-circle-x" aria-hidden="true" /> {t('admin.returns.rejected')}</span>
                )}
                
                {/* Pedido cancelado */}
                {p.estado === 'Cancelada' && (
                  <span className="pedido-cancelado">{t('myOrders.isCancelled')}</span>
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
              <h3>{t('myOrders.requestReturn')}</h3>
              <button className="modal-close" onClick={() => setMostrarModal(null)} aria-label={t('common.close')}><i className="ti ti-x" aria-hidden="true" /></button>
            </div>
            <div className="modal-body">
              <p>{t('myOrders.returnQuestion')}</p>
              <textarea
                className="modal-textarea"
                rows="4"
                placeholder={t('myOrders.returnPh')}
                aria-label={t('admin.returns.reason')}
                value={motivoDevolucion}
                onChange={(e) => setMotivoDevolucion(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMostrarModal(null)}>{t('common.cancel')}</button>
              <button 
                className="btn btn-primary" 
                onClick={handleSolicitarDevolucion}
                disabled={procesando === mostrarModal}
              >
                {procesando === mostrarModal ? t('common.sending') : t('myOrders.sendRequest')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}