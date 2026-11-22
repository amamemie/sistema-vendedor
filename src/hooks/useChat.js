// src/hooks/useChat.js
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useChat(chatId, usuarioActual) {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargando, setCargando] = useState(true);

  // Cargar mensajes desde la BASE DE DATOS
  const cargarMensajes = useCallback(async () => {
    if (!chatId?.id_producto) {
      setCargando(false);
      return;
    }

    try {
      const response = await api.getMensajes(
        chatId.id_producto, 
        chatId.id_vendedor || '', 
        chatId.id_comprador || ''
      );
      
      if (response.success) {
        const mensajesFormateados = (response.mensajes || []).map(msg => ({
          id: msg.id_resena,
          texto: msg.mensaje,
          emisor: msg.emisor,
          fecha: msg.fecha,
          leido: msg.leido === 1
        }));
        setMensajes(mensajesFormateados);
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    } finally {
      setCargando(false);
    }
  }, [chatId]);

  // Enviar mensaje a la BASE DE DATOS
  const enviarMensaje = async (texto) => {
    if (!texto.trim()) return;
    if (!chatId?.id_producto) return;

    try {
      const emisor = usuarioActual === 'vendedor' ? 'vendedor' : 'comprador';
      const response = await api.enviarMensaje(chatId.id_producto, texto.trim(), emisor);

      if (response.success) {
        const nuevoMensajeObj = {
          id: Date.now(),
          texto: texto.trim(),
          emisor: emisor,
          fecha: new Date().toISOString(),
          leido: false
        };
        setMensajes(prev => [...prev, nuevoMensajeObj]);
        setNuevoMensaje('');
        
        setTimeout(() => cargarMensajes(), 500);
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  };

  const marcarComoLeido = async (id) => {
    setMensajes(prev => prev.map(m => 
      m.id === id ? { ...m, leido: true } : m
    ));
  };

  const marcarTodosLeidos = () => {
    setMensajes(prev => prev.map(m => 
      m.emisor !== usuarioActual ? { ...m, leido: true } : m
    ));
  };

  const mensajesNoLeidos = mensajes.filter(m => !m.leido && m.emisor !== usuarioActual).length;

  useEffect(() => {
    cargarMensajes();
    
    const interval = setInterval(() => {
      cargarMensajes();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [cargarMensajes]);

  return {
    mensajes,
    nuevoMensaje,
    setNuevoMensaje,
    enviarMensaje,
    marcarComoLeido,
    marcarTodosLeidos,
    mensajesNoLeidos,
    cargando,
    cargarMensajes
  };
}