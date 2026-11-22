import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Chat from '../../components/Chat';
import './vendor.css';

export default function MisConversaciones() {
  const { user } = useAuth();
  const [conversaciones, setConversaciones] = useState([]);
  const [chatAbierto, setChatAbierto] = useState(null);

  useEffect(() => {
    cargarConversaciones();
  }, []);

  const cargarConversaciones = async () => {
    try {
      // Obtener pedidos con productos para saber con qué compradores chatear
      const response = await fetch(`http://localhost/sistema-vendedor/backend/pedidos_vendedor.php?id_vendedor=${user.id_vendedor}`);
      const pedidos = await response.json();
      
      // Extraer conversaciones únicas (comprador + producto)
      const conversacionesUnicas = [];
      pedidos.forEach(pedido => {
        if (pedido.detalles && pedido.detalles.length > 0) {
          pedido.detalles.forEach(producto => {
            conversacionesUnicas.push({
              id_comprador: pedido.id_comprador,
              nombre_comprador: pedido.cliente_nombre_completo,
              id_producto: producto.id_producto,
              nombre_producto: producto.nombre,
              id_compra: pedido.id_compra
            });
          });
        }
      });
      
      setConversaciones(conversacionesUnicas);
    } catch (error) {
      console.error('Error cargando conversaciones:', error);
    }
  };

  return (
    <div className="vendor-content">
      <div className="productos-header">
        <h1 className="productos-title">💬 Mis conversaciones</h1>
      </div>

      {conversaciones.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}>
          No tienes conversaciones aún
        </div>
      ) : (
        <div className="conversaciones-list">
          {conversaciones.map(conv => (
            <div key={`${conv.id_comprador}-${conv.id_producto}`} className="conversacion-card">
              <div className="conversacion-info">
                <div className="conversacion-cliente">
                  👤 {conv.nombre_comprador}
                </div>
                <div className="conversacion-producto">
                  📦 Producto: {conv.nombre_producto}
                </div>
              </div>
              <button 
                className="btn-primary"
                onClick={() => setChatAbierto(conv)}
              >
                💬 Chatear
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de chat */}
      {chatAbierto && (
        <div className="modal-overlay" onClick={() => setChatAbierto(null)}>
          <div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chat con {chatAbierto.nombre_comprador}</h3>
              <button className="modal-close" onClick={() => setChatAbierto(null)}>✕</button>
            </div>
            <div style={{ height: 400 }}>
              <Chat 
                chatId={{
                  id_producto: chatAbierto.id_producto,
                  id_vendedor: user.id_vendedor,
                  id_comprador: chatAbierto.id_comprador
                }}
                usuarioActual="vendedor"
                nombreVendedor={chatAbierto.nombre_comprador}
                onClose={() => setChatAbierto(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}