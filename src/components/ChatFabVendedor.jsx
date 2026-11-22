import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Chat from './Chat';
import './Chat.css';
import { useTranslation } from 'react-i18next';

export default function ChatFabVendedor({ compradorId, compradorNombre, productoId }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState(0);


  const chatId = {
    id_producto: productoId,
    id_vendedor: user.id_vendedor,
    id_comprador: compradorId
  };

  useEffect(() => {
    if (!abierto && productoId) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost/sistema-vendedor/backend/chat.php?id_producto=${productoId}`);
          const data = await response.json();
          if (data.success && data.mensajes) {
            const noLeidos = data.mensajes.filter(m => m.emisor === 'comprador' && m.leido === 0).length;
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

  if (!user || user.rol !== 'Vendedor') return null;

  return (
    <>
      <button className="chat-fab" onClick={() => setAbierto(true)} aria-label={t('chat.open')} title={t('chat.open')}>
        <i className="ti ti-message-circle" aria-hidden="true" />
        {notificaciones > 0 && (
          <span className="chat-fab-badge">{notificaciones > 9 ? '9+' : notificaciones}</span>
        )}
      </button>

      {abierto && (
        <div className="chat-modal-overlay" onClick={() => setAbierto(false)}>
          <div className="chat-modal" onClick={e => e.stopPropagation()}>
            <Chat 
              chatId={chatId}
              usuarioActual="vendedor"
              nombreVendedor={compradorNombre}
              onClose={() => setAbierto(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}