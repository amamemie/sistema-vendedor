import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../hooks/useNotifications';
import { formatDateTime } from '../i18n/format';
import './NotificationBell.css';

const TYPES = {
  pedido: { icon: 'ti-shopping-cart', tone: 'accent' },
  pago: { icon: 'ti-cash', tone: 'success' },
  reporte: { icon: 'ti-alert-triangle', tone: 'error' },
};

export default function NotificationBell({ userId }) {
  const { t } = useTranslation();
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  const { notificaciones, totalNoLeidas, marcarComoLeida, marcarTodasLeidas } = useNotifications(userId);

  useEffect(() => {
    if (!abierto) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setAbierto(false);
    const onKey = (e) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [abierto]);

  return (
    <div className="nb" ref={ref}>
      <button
        type="button"
        className={`icon-btn nb-bell${totalNoLeidas > 0 ? ' has-unread' : ''}`}
        onClick={() => setAbierto(!abierto)}
        aria-label={t('notifications.title')}
        aria-expanded={abierto}
      >
        <i className="ti ti-bell" aria-hidden="true" />
        {totalNoLeidas > 0 && <span className="icon-btn-badge">{totalNoLeidas > 9 ? '9+' : totalNoLeidas}</span>}
      </button>

      {abierto && (
        <div className="nb-menu" role="dialog" aria-label={t('notifications.title')}>
          <div className="nb-head">
            <strong>{t('notifications.title')}</strong>
            {totalNoLeidas > 0 && (
              <button type="button" onClick={marcarTodasLeidas} className="nb-mark">{t('notifications.markAll')}</button>
            )}
          </div>
          <div className="nb-list">
            {notificaciones.length === 0 ? (
              <div className="empty-state nb-empty">
                <span className="empty-icon"><i className="ti ti-bell-off" aria-hidden="true" /></span>
                {t('notifications.empty')}
              </div>
            ) : (
              notificaciones.map((noti) => {
                const type = TYPES[noti.tipo] || { icon: 'ti-speakerphone', tone: 'info' };
                return (
                  <button type="button" key={noti.id} className={`nb-item${!noti.leida ? ' is-unread' : ''}`} onClick={() => marcarComoLeida(noti.id)}>
                    <span className={`nb-icon nb-icon--${type.tone}`}><i className={`ti ${type.icon}`} aria-hidden="true" /></span>
                    <span className="nb-content">
                      <strong>{noti.titulo}</strong>
                      <span>{noti.mensaje}</span>
                      <small>{formatDateTime(noti.fecha)}</small>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
