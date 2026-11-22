import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './vendor.css';
import { formatearPrecio, formatearFecha, getEstadoPedidoClase } from './vendor.utils';
import ChatFabVendedor from '../../components/ChatFabVendedor';
import { useTranslation } from 'react-i18next';

const FILTROS = ['Todos', 'Pendiente', 'Pagada', 'Enviado', 'Entregado', 'Cancelado'];

export default function VendorPedidos() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('Todos');
  const [loading, setLoading] = useState(true);

  const cargarPedidos = async () => {
    setLoading(true);
    try {
      const idVendedor = user?.id_vendedor;
      if (!idVendedor) {
        console.error('No hay id_vendedor');
        setPedidos([]);
        setLoading(false);
        return;
      }
      const data = await api.getPedidosVendedor(idVendedor);
      setPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      setPedidos([]);
    }
    setLoading(false);
  };

  const actualizarEstado = async (idPedido, nuevoEstado) => {
  try {
    const result = await api.actualizarEstadoPedido(idPedido, nuevoEstado);
    if (result.success) {
      // Recargar los pedidos para ver el cambio
     await  cargarPedidos();
    }
  } catch (error) {
    console.error('Error al actualizar estado:', error);
  }
};

  useEffect(() => {
    cargarPedidos();
  }, [user?.id_vendedor]);

  const pedidosFiltrados = filtro === 'Todos' 
    ? pedidos 
    : pedidos.filter(p => p.estado === filtro);
    
  const total = pedidosFiltrados.reduce((sum, p) => sum + parseFloat(p.total_bruto || 0), 0);

  if (loading) return <div className="vendor-content"><div className="skeleton" style={{ height: 320, borderRadius: 16 }} /></div>;

  return (
    <div className="vendor-content">
      <div className="productos-header">
        <div>
          <h2 className="productos-title">{t('vendor.orders.title')}</h2>
          <p className="productos-count">{t('vendor.orders.count', { count: pedidosFiltrados.length })} · {t('common.total')}: {formatearPrecio(total)}</p>
        </div>
      </div>

      <div className="pedidos-filters">
        {FILTROS.map(f => (
          <button 
            key={f}
            className={`filter-btn ${filtro === f ? 'filter-btn-active' : ''}`} 
            onClick={() => setFiltro(f)}
          >
            {f === 'Todos' ? t('common.all') : t(`orderStatus.${f}`)}
          </button>
        ))}
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="empty-state"><i className="ti ti-inbox" style={{ fontSize: 30 }} aria-hidden="true" />{t('vendor.orders.empty')}</div>
      ) : (
        <div className="stagger">{pedidosFiltrados.map((p, i) => (
          <div key={p.id_compra} className="pedido-card" style={{ '--i': i }}>
            <div className="pedido-header">
              <div>
                <span className="pedido-id">{t('vendor.orders.order', { id: p.id_compra })}</span>
                <span className="pedido-fecha" style={{ marginLeft: 16, fontSize: 12.5, color: 'var(--text-3)' }}>
                  <i className="ti ti-calendar" aria-hidden="true" /> {formatearFecha(p.fecha_compra)}
                </span>
              </div>
              <span className={`pedido-estado ${getEstadoPedidoClase(p.estado || 'Pendiente')}`}>
                {t(`orderStatus.${p.estado || 'Pendiente'}`)}
              </span>
            </div>
            
            <div className="pedido-cliente">
              <i className="ti ti-user" aria-hidden="true" /> {t('vendor.orders.customer')}: {p.cliente_nombre_completo || t('vendor.orders.customerFallback')}
            </div>
            
            <div className="pedido-items">
              {p.detalles && p.detalles.length > 0 ? (
                p.detalles.map(item => (
                  <div key={item.id_producto} className="pedido-item">
                    <span>{item.nombre} x{item.cantidad}</span>
                    <span>{formatearPrecio(item.precio_unitario * item.cantidad)}</span>
                  </div>
                ))
              ) : (
                <div className="pedido-item">{t('vendor.orders.noItems')}</div>
              )}
            </div>
            
            <div className="pedido-total">
              <span>{t('common.total')}</span>
              <span>{formatearPrecio(p.total_bruto || 0)}</span>
            </div>
            
            <div className="pedido-actions">
              {/* Botón de chat para el vendedor */}
              {p.id_comprador && p.detalles && p.detalles.length > 0 && (
                <ChatFabVendedor 
                  compradorId={p.id_comprador}
                  compradorNombre={p.cliente_nombre_completo || t('roles.buyer')}
                  productoId={p.detalles[0].id_producto}
                />
              )}
              
              {/* Botones de estado */}
              {p.estado === 'Pagada' && (
                <button className="btn btn-primary btn-sm" onClick={() => actualizarEstado(p.id_compra, 'Enviado')}>
                  <i className="ti ti-truck-delivery" aria-hidden="true" /> {t('vendor.orders.markShipped')}
                </button>
              )}
              {p.estado === 'Enviado' && (
                <button className="btn btn-primary btn-sm" onClick={() => actualizarEstado(p.id_compra, 'Entregado')}>
                  <i className="ti ti-home-check" aria-hidden="true" /> {t('vendor.orders.markDelivered')}
                </button>
              )}
              {p.solicita_devolucion === 'Pendiente' && (
                <span className="devolucion-pendiente"><i className="ti ti-rotate" aria-hidden="true" /> {t('vendor.orders.returnPending')}</span>
              )}
            </div>
          </div>
        ))}</div>
      )}
    </div>
  );
}