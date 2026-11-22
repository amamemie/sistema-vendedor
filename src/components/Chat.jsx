// src/components/Chat.jsx
import { useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import './Chat.css';

export default function Chat({ chatId, usuarioActual, nombreVendedor, onClose }) {
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
        <div className="chat-loading">Cargando conversación...</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <span className="chat-header-title">
          💬 Chat con {nombreVendedor || 'Vendedor'}
        </span>
        <button className="chat-header-close" onClick={onClose}>✕</button>
      </div>

      <div className="chat-messages">
        {mensajes.length === 0 ? (
          <div className="chat-empty">
            <span style={{ fontSize: 32 }}>💬</span>
            <p>No hay mensajes aún. ¡Envía tu consulta!</p>
          </div>
        ) : (
          mensajes.map(msg => (
            <div 
              key={msg.id} 
              className={`chat-message ${msg.emisor === (usuarioActual === 'vendedor' ? 'vendedor' : 'comprador') ? 'chat-message-sent' : 'chat-message-received'}`}
            >
              <div className="chat-bubble">{msg.texto}</div>
              <div className="chat-time">
                {new Date(msg.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleEnviar}>
          Enviar
        </button>
      </div>
    </div>
  );
}