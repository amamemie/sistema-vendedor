// src/pages/comprador/MisDescuentos.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './comprador.css';
import { useTranslation } from 'react-i18next';
import { toast } from '../../components/ui/toast';
import { formatDate } from '../../i18n/format';

export default function MisDescuentos() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [descuentos, setDescuentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDescuentos();
  }, []);

  const cargarDescuentos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost/sistema-vendedor/backend/mis_descuentos.php?id_usuario=${user?.id}`);
      const data = await response.json();
      if (data.success) {
        setDescuentos((data.descuentos || []).map((d) => ({ ...d, codigo: `DESC-${d.descuento}-${Math.floor(Math.random() * 10000)}` })));
      }
    } catch (error) {
      console.error('Error cargando descuentos:', error);
    }
    setLoading(false);
  };

  const formatearFecha = (fecha) => formatDate(fecha, { dateStyle: 'long' });

  // El código se genera una sola vez al cargar, así el que se ve es el mismo que se copia.

  if (loading) {
    return (
      <div className="mis-descuentos-container">
        <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
      </div>
    );
  }

  return (
    <div className="mis-descuentos-container">
      <div className="descuentos-header">
        <h2>{t('buyer.tabs.discounts')}</h2>
        <p className="descuentos-subtitle">{t('myDiscounts.subtitle')}</p>
      </div>

      {descuentos.length === 0 ? (
        <div className="empty-descuentos">
          <div className="empty-icon"><i className="ti ti-ticket" aria-hidden="true" /></div>
          <h3>{t('myDiscounts.empty')}</h3>
          <p>{t('myDiscounts.emptyHint')}</p>
        </div>
      ) : (
        <div className="descuentos-grid stagger">
          {descuentos.map((d, idx) => (
            <div key={idx} className="descuento-card" style={{ '--i': idx }}>
              <div className="descuento-badge">
                <span className="descuento-porcentaje">{d.descuento}%</span>
                <span className="descuento-off">{t('myDiscounts.off')}</span>
              </div>
              
              <div className="descuento-body">
                <div className="descuento-motivo">
                  <i className="ti ti-target-arrow motivo-icon" aria-hidden="true" />
                  <span className="motivo-text">{d.motivo || t('myDiscounts.special')}</span>
                </div>
                <div className="descuento-fecha">
                  <i className="ti ti-calendar fecha-icon" aria-hidden="true" />
                  <span className="fecha-text">{formatearFecha(d.fecha)}</span>
                </div>
                <div className="descuento-codigo">
                  <span className="codigo-label">{t('myDiscounts.code')}:</span>
                  <code className="codigo-value">{d.codigo}</code>
                  <button 
                    className="copiar-btn"
                    onClick={() => {
                      navigator.clipboard?.writeText(d.codigo);
                      toast(t('myDiscounts.copied'));
                    }}
                    aria-label={t('myDiscounts.copy')}
                    title={t('myDiscounts.copy')}
                  >
                    <i className="ti ti-copy" aria-hidden="true" />
                  </button>
                </div>
              </div>
              
              <div className="descuento-footer">
                <span className="descuento-estado activo"><i className="ti ti-check" aria-hidden="true" /> {t('productStatus.Activo')}</span>
                <span className="descuento-uso">{t('myDiscounts.validNext')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="descuentos-info">
        <p><i className="ti ti-bulb" aria-hidden="true" /> <strong>{t('myDiscounts.howTitle')}</strong></p>
        <p>{t('myDiscounts.how')}</p>
      </div>
    </div>
  );
}