import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerResenasUsuario, formatearFecha } from './comprador.utils';
import './comprador.css';
import { useTranslation } from 'react-i18next';
import { Stars, imgUrl } from '../../components/store/Store';

export default function MisResenas() {
  const { t } = useTranslation();
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
        setError(t('errors.noUser'));
        setLoading(false);
        return;
      }
      
      
      const data = await obtenerResenasUsuario(userId);
      
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
        <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mis-resenas-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="mis-resenas-container">
      <h2>{t('buyer.tabs.reviews')}</h2>
      
      {resenas.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"><i className="ti ti-star" aria-hidden="true" /></span>
          <p>{t('myReviews.empty')}</p>
          <p className="empty-subtext">{t('myReviews.emptyHint')}</p>
        </div>
      ) : (
        <div className="resenas-list stagger">
          {resenas.map((r, i) => (
            <div key={r.id_resena} className="resena-card" style={{ '--i': i }}>
              <div className="resena-producto">
                <div className="resena-producto-imagen">
                  {r.imagen_principal ? (
                    <img 
                      src={imgUrl(r.imagen_principal)} 
                      alt="" 
                    />
                  ) : (
                    <i className="ti ti-photo" aria-hidden="true" />
                  )}
                </div>
                <div className="resena-producto-info">
                  <div className="resena-producto-nombre">{r.producto || t('vendor.products.product')}</div>
                  <div className="resena-producto-tienda"><i className="ti ti-building-store" aria-hidden="true" /> {r.nombre_tienda || t('store.store')}</div>
                </div>
              </div>
              <div className="resena-calificacion">
                <Stars value={r.calificacion} />
                <span className="calificacion-numero">({r.calificacion}/5)</span>
              </div>
              <div className="resena-comentario">
                {r.comentario || t('myReviews.noComment')}
              </div>
              <div className="resena-fecha">
                <i className="ti ti-calendar" aria-hidden="true" /> {formatearFecha(r.fecha)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}