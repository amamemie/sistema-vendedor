import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerResenasUsuario, formatearFecha, renderEstrellas } from './comprador.utils';
import './comprador.css';

export default function MisResenas() {
  const { user } = useAuth();
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      // 👇 CORRECCIÓN: Obtener ID correctamente
      const userId = user?.id || user?.id_usuario || user?.usuario_id;
      
      if (!userId) {
        console.error('❌ No hay usuario logueado', user);
        setError('No se pudo identificar al usuario');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Cargando reseñas para usuario ID:', userId);
      console.log('📦 Datos del usuario:', user);
      
      const data = await obtenerResenasUsuario(userId);
      console.log('⭐ Reseñas recibidas:', data);
      
      if (data.error) {
        setError(data.error);
        setResenas([]);
      } else {
        setResenas(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    };
    
    cargar();
  }, [user]);

  if (loading) {
    return (
      <div className="mis-resenas-container">
        <div className="loading-spinner">Cargando tus reseñas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mis-resenas-container">
        <div className="error-message">❌ {error}</div>
      </div>
    );
  }

  return (
    <div className="mis-resenas-container">
      <h2>⭐ Mis reseñas</h2>
      
      {resenas.length === 0 ? (
        <div className="empty-resenas">
          <span>📝</span>
          <p>No has escrito reseñas aún</p>
          <p className="empty-subtext">¡Compra productos y califica tu experiencia!</p>
        </div>
      ) : (
        <div className="resenas-list">
          {resenas.map(r => (
            <div key={r.id_resena} className="resena-card">
              <div className="resena-producto">
                <div className="resena-producto-imagen">
                  {r.imagen_principal ? (
                    <img 
                      src={`http://localhost/sistema-vendedor/backend/uploads/productos/${r.imagen_principal}`} 
                      alt={r.producto} 
                    />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                <div className="resena-producto-info">
                  <div className="resena-producto-nombre">{r.producto || 'Producto'}</div>
                  <div className="resena-producto-tienda">🏪 {r.nombre_tienda || 'Tienda'}</div>
                </div>
              </div>
              <div className="resena-calificacion">
                {renderEstrellas(r.calificacion)}
                <span className="calificacion-numero">({r.calificacion}/5)</span>
              </div>
              <div className="resena-comentario">
                {r.comentario || 'Sin comentario'}
              </div>
              <div className="resena-fecha">
                📅 {formatearFecha(r.fecha)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}