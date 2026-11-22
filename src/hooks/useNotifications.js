import { useState, useEffect } from 'react';

export function useNotifications(userId) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [totalNoLeidas, setTotalNoLeidas] = useState(0);

  // Cargar notificaciones desde localStorage
  const cargarNotificaciones = () => {
    const guardadas = localStorage.getItem(`notificaciones_${userId}`);
    if (guardadas) {
      const notis = JSON.parse(guardadas);
      setNotificaciones(notis);
      setTotalNoLeidas(notis.filter(n => !n.leida).length);
    }
  };

  // Agregar notificación
  const agregarNotificacion = (titulo, mensaje, tipo = 'info') => {
    const nuevaNoti = {
      id: Date.now(),
      titulo,
      mensaje,
      tipo,
      fecha: new Date().toISOString(),
      leida: false
    };
    
    const actualizadas = [nuevaNoti, ...notificaciones];
    setNotificaciones(actualizadas);
    localStorage.setItem(`notificaciones_${userId}`, JSON.stringify(actualizadas));
    setTotalNoLeidas(prev => prev + 1);
  };

  // Marcar como leída
  const marcarComoLeida = (id) => {
    const actualizadas = notificaciones.map(n => 
      n.id === id ? { ...n, leida: true } : n
    );
    setNotificaciones(actualizadas);
    localStorage.setItem(`notificaciones_${userId}`, JSON.stringify(actualizadas));
    setTotalNoLeidas(actualizadas.filter(n => !n.leida).length);
  };

  // Marcar todas como leídas
  const marcarTodasLeidas = () => {
    const actualizadas = notificaciones.map(n => ({ ...n, leida: true }));
    setNotificaciones(actualizadas);
    localStorage.setItem(`notificaciones_${userId}`, JSON.stringify(actualizadas));
    setTotalNoLeidas(0);
  };

  useEffect(() => {
    if (userId) cargarNotificaciones();
  }, [userId]);

  return {
    notificaciones,
    totalNoLeidas,
    agregarNotificacion,
    marcarComoLeida,
    marcarTodasLeidas
  };
}