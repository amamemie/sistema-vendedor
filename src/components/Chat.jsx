// src/components/Chat.jsx
import { useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import './Chat.css';
import { useTranslation } from 'react-i18next';

export default function Chat({ chatId, usuarioActual, nombreVendedor, onClose }) {
  const { t, i18n } = useTranslation();
  const { 
    mensajes, 
    nuevoMensaje, 
    setNuevoMensaje, 
    enviarMensaje,
    cargando
  } = useChat(chatId, usuarioActual);

  const handleEnviar = () => {
    if (nuevoMensaje.trim()) {
      enviarMensaje(nuevoMensaje);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEnviar();
    }
  };

  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  if (cargando) {
    return (
      <div className="chat-container">
        <div className="chat-loading"><span className="btn-spinner" /> {t('chat.loading')}</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <span className="chat-header-title">
          <i className="ti ti-message-circle" aria-hidden="true" /> {t('chat.with', { name: nombreVendedor || t('roles.seller') })}
        </span>
        <button className="chat-header-close" onClick={onClose} aria-label={t('common.close')}><i className="ti ti-x" aria-hidden="true" /></button>
      </div>

      <div className="chat-messages">
        {mensajes.length === 0 ? (
          <div className="chat-empty">
            <i className="ti ti-messages" style={{ fontSize: 32 }} aria-hidden="true" />
            <p>{t('chat.empty')}</p>
          </div>
        ) : (
          mensajes.map(msg => (
            <div 
              key={msg.id} 
              className={`chat-message ${msg.emisor === (usuarioActual === 'vendedor' ? 'vendedor' : 'comprador') ? 'chat-message-sent' : 'chat-message-received'}`}
            >
              <div className="chat-bubble">{msg.texto}</div>
              <div className="chat-time">
                {new Date(msg.fecha).toLocaleTimeString(i18n.resolvedLanguage === 'en' ? 'en-US' : 'es-BO', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder={t('chat.placeholder')}
          aria-label={t('chat.placeholder')}
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={handleEnviar} aria-label={t('common.send')}>
          <i className="ti ti-send" aria-hidden="true" /> <span>{t('common.send')}</span>
        </button>
      </div>
    </div>
  );
}