import { useState } from 'react';
import { useAuth } from '../context/AuthContext';  // ← AGREGAR
import { api } from '../services/api';
import './ValorarVendedor.css';
import { useTranslation } from 'react-i18next';
import { toast } from './ui/toast';

export default function ValorarVendedor({ vendedorNombre, productoId, onValoracionEnviada }) {
  const { t } = useTranslation();
  const { user } = useAuth();  // ← AGREGAR
  const [calificacion, setCalificacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async () => {
    if (calificacion === 0) {
      toast(t('rate.pick'), 'error');
      return;
    }

    // Obtener ID del usuario
    const userId = user?.id || user?.id_usuario;
    
    if (!userId) {
      toast(t('errors.noUser'), 'error');
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
      toast(result.message || t('errors.generic'), 'error');
    }
  };

  return (
    <div className="valorar-vendedor">
      <h3><i className="ti ti-star" aria-hidden="true" /> {t('rate.title', { name: vendedorNombre })}</h3>
      
      <div className="valorar-estrellas" role="radiogroup" aria-label={t('rate.title', { name: vendedorNombre })}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            type="button"
            key={star}
            role="radio"
            aria-checked={calificacion === star}
            aria-label={t('rate.stars', { count: star })}
            className={`star ${star <= (hover || calificacion) ? 'star-filled' : ''}`}
            onClick={() => setCalificacion(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        className="valorar-textarea"
        placeholder={t('rate.placeholder')}
        aria-label={t('rate.placeholder')}
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        rows="3"
      />

      <button 
        className="valorar-btn" 
        onClick={handleSubmit} 
        disabled={enviando || calificacion === 0}
      >
        {enviando ? t('common.sending') : enviado ? t('rate.thanks') : t('rate.send')}
      </button>
    </div>
  );
}