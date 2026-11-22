import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Chat from './Chat';
import './Chat.css';

export default function ChatFab({ vendedorId, vendedorNombre, productoId }) {
  const { user } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState(0);

  // Solo mostrar para compradores
  if (!user || user.rol !== 'Comprador') return null;

  // Crear objeto chatId con los datos que espera useChat
  const chatId = {
    id_producto: productoId,
    id_vendedor: vendedorId,
    id_comprador: user.id_comprador || user.id_usuario
  };

  // Verificar notificaciones desde la base de datos
  useEffect(() => {
    if (!abierto && productoId) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost/sistema-vendedor/backend/chat.php?id_producto=${productoId}`);
          const data = await response.json();
          if (data.success && data.mensajes) {
            const noLeidos = data.mensajes.filter(m => m.emisor === 'vendedor' && m.leido === 0).length;
            setNotificaciones(noLeidos);
          }
        } catch (error) {
          console.error('Error checking notifications:', error);
        }
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setNotificaciones(0);
    }
  }, [abierto, productoId]);

  return (
    <>
      <button className="chat-fab" onClick={() => setAbierto(true)}>
        💬
        {notificaciones > 0 && (
          <span className="chat-fab-badge">{notificaciones > 9 ? '9+' : notificaciones}</span>
        )}
      </button>

      {abierto && (
        <div className="chat-modal-overlay" onClick={() => setAbierto(false)}>
          <div className="chat-modal" onClick={e => e.stopPropagation()}>
            <Chat 
              chatId={chatId}
              usuarioActual="comprador"
              nombreVendedor={vendedorNombre}
              onClose={() => setAbierto(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}