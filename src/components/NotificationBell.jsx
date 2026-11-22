import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import './NotificationBell.css';

export default function NotificationBell({ userId }) {
  const [abierto, setAbierto] = useState(false);
  const { notificaciones, totalNoLeidas, marcarComoLeida, marcarTodasLeidas } = useNotifications(userId);

  const getTipoIcono = (tipo) => {
    switch(tipo) {
      case 'pedido': return '🛒';
      case 'pago': return '💰';
      case 'reporte': return '⚠️';
      default: return '📢';
    }
  };

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'pedido': return '#2563eb';
      case 'pago': return '#059669';
      case 'reporte': return '#dc2626';
      default: return '#64748b';
    }
  };

  return (
    <div className="notification-container">
      <button className="notification-bell" onClick={() => setAbierto(!abierto)}>
        🔔
        {totalNoLeidas > 0 && (
          <span className="notification-badge">{totalNoLeidas > 9 ? '9+' : totalNoLeidas}</span>
        )}
      </button>

      {abierto && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <span>Notificaciones</span>
            {totalNoLeidas > 0 && (
              <button onClick={marcarTodasLeidas} className="notification-mark-all">
                Marcar todas como leídas
              </button>
            )}
          </div>
          <div className="notification-list">
            {notificaciones.length === 0 ? (
              <div className="notification-empty">No hay notificaciones</div>
            ) : (
              notificaciones.map(noti => (
                <div 
                  key={noti.id} 
                  className={`notification-item ${!noti.leida ? 'unread' : ''}`}
                  onClick={() => marcarComoLeida(noti.id)}
                >
                  <div className="notification-icon" style={{ background: getTipoColor(noti.tipo) + '20', color: getTipoColor(noti.tipo) }}>
                    {getTipoIcono(noti.tipo)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{noti.titulo}</div>
                    <div className="notification-message">{noti.mensaje}</div>
                    <div className="notification-date">{new Date(noti.fecha).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}