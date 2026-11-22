import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './vendor.css';
import { formatearPrecio, formatearFecha } from './vendor.utils';
import ChatFabVendedor from '../../components/ChatFabVendedor';

const FILTROS = ['Todos', 'Pendiente', 'Pagada', 'Enviado', 'Entregado', 'Cancelado'];

export default function VendorPedidos() {
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

  if (loading) return <div className="vendor-content"><div style={{ textAlign: 'center', padding: 60 }}>Cargando pedidos...</div></div>;

  return (
    <div className="vendor-content">
      <div className="productos-header">
        <div>
          <h1 className="productos-title">Pedidos recibidos</h1>
          <p className="productos-count">{pedidosFiltrados.length} pedidos · Total: {formatearPrecio(total)}</p>
        </div>
      </div>

      <div className="pedidos-filters">
        {FILTROS.map(f => (
          <button 
            key={f}
            className={`filter-btn ${filtro === f ? 'filter-btn-active' : ''}`} 
            onClick={() => setFiltro(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}>No hay pedidos en esta categoría</div>
      ) : (
        pedidosFiltrados.map(p => (
          <div key={p.id_compra} className="pedido-card">
            <div className="pedido-header">
              <div>
                <span className="pedido-id">Pedido #{p.id_compra}</span>
                <span className="pedido-fecha" style={{ marginLeft: 16, fontSize: 12, color: 'var(--gray-500)' }}>
                  📅 {formatearFecha(p.fecha_compra)}
                </span>
              </div>
              <span className={`pedido-estado ${p.estado === 'Pagada' ? 'estado-pagado' : p.estado === 'Pendiente' ? 'estado-pendiente' : 'estado-cancelado'}`}>
                {p.estado || 'Pendiente'}
              </span>
            </div>
            
            <div className="pedido-cliente">
              Cliente: {p.cliente_nombre_completo || 'Cliente'}
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
                <div className="pedido-item">No hay productos</div>
              )}
            </div>
            
            <div className="pedido-total">
              <span>Total</span>
              <span>{formatearPrecio(p.total_bruto || 0)}</span>
            </div>
            
            <div className="pedido-actions">
              {/* Botón de chat para el vendedor */}
              {p.id_comprador && p.detalles && p.detalles.length > 0 && (
                <ChatFabVendedor 
                  compradorId={p.id_comprador}
                  compradorNombre={p.cliente_nombre_completo || 'Comprador'}
                  productoId={p.detalles[0].id_producto}
                />
              )}
              
              {/* Botones de estado */}
              {p.estado === 'Pagada' && (
                <button className="btn-primary" onClick={() => actualizarEstado(p.id_compra, 'Enviado')}>
                  📦 Marcar como enviado
                </button>
              )}
              {p.estado === 'Enviado' && (
                <button className="btn-primary" onClick={() => actualizarEstado(p.id_compra, 'Entregado')}>
                  🏠 Marcar como entregado
                </button>
              )}
              {p.solicita_devolucion === 'Pendiente' && (
                <span className="devolucion-pendiente">⏳ Solicitud de devolución pendiente</span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}