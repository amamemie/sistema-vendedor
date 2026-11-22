import { useState } from 'react';
import { useAuth } from '../context/AuthContext';  // ← AGREGAR
import { api } from '../services/api';
import './ValorarVendedor.css';

export default function ValorarVendedor({ vendedorId, vendedorNombre, productoId, onValoracionEnviada }) {
  const { user } = useAuth();  // ← AGREGAR
  const [calificacion, setCalificacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async () => {
    if (calificacion === 0) {
      alert('⚠️ Selecciona una calificación');
      return;
    }

    // Obtener ID del usuario
    const userId = user?.id || user?.id_usuario;
    
    if (!userId) {
      alert('❌ Usuario no identificado. Inicia sesión nuevamente.');
      return;
    }

    setEnviando(true);
    const result = await api.calificarProducto(
      productoId, 
      calificacion, 
      comentario,
      userId  // ← AGREGAR userId
    );
    setEnviando(false);

    if (result.success) {
      setEnviado(true);
      if (onValoracionEnviada) onValoracionEnviada();
      setTimeout(() => setEnviado(false), 3000);
    } else {
      alert('❌ Error al enviar calificación: ' + result.message);
    }
  };

  return (
    <div className="valorar-vendedor">
      <h3>⭐ Calificar a {vendedorNombre}</h3>
      
      <div className="valorar-estrellas">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${star <= (hover || calificacion) ? 'star-filled' : ''}`}
            onClick={() => setCalificacion(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </span>
        ))}
      </div>

      <textarea
        className="valorar-textarea"
        placeholder="Cuéntanos tu experiencia con este vendedor..."
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        rows="3"
      />

      <button 
        className="valorar-btn" 
        onClick={handleSubmit} 
        disabled={enviando || calificacion === 0}
      >
        {enviando ? 'Enviando...' : enviado ? '✅ Gracias por calificar' : 'Enviar calificación'}
      </button>
    </div>
  );
}