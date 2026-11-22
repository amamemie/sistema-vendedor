import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { solicitarSerVendedor } from './comprador.utils';
import './comprador.css';
import { useTranslation } from 'react-i18next';

export default function SolicitarVendedor() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [solicitando, setSolicitando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    nit_rut: '',
    telefono: '',
    direccion: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = user?.id || user?.id_usuario;
    
    if (!userId) {
      setMensaje({ ok: false, text: t('errors.noUser') });
      return;
    }
    
    setSolicitando(true);
    const result = await solicitarSerVendedor(userId, formData);
    setMensaje({ ok: !!result.success, text: result.success ? t('sell.sent') : result.message });
    if (result.success) {
      setFormData({ nombreEmpresa: '', nit_rut: '', telefono: '', direccion: '' });
    }
    setTimeout(() => setMensaje(''), 5000);
    setSolicitando(false);
  };

  return (
    <div className="solicitar-vendedor-container">
      <div className="solicitar-vendedor-card">
        <div className="solicitar-vendedor-icon"><i className="ti ti-building-store" aria-hidden="true" /></div>
        <h2 className="solicitar-vendedor-title">{t('sell.title')}</h2>
        <p className="solicitar-vendedor-desc">
          {t('sell.lead')}
        </p>
        
        <div className="solicitar-beneficios">
          <h4>{t('sell.benefits')}</h4>
          <ul>
            <li><i className="ti ti-trending-up" aria-hidden="true" /> {t('sell.b1')}</li>
            <li><i className="ti ti-percentage" aria-hidden="true" /> {t('sell.b2')}</li>
            <li><i className="ti ti-chart-bar" aria-hidden="true" /> {t('sell.b3')}</li>
            <li><i className="ti ti-layout-dashboard" aria-hidden="true" /> {t('sell.b4')}</li>
          </ul>
        </div>

        {mensaje && (
          <div className={`alert ${mensaje.ok ? 'alert-success' : 'alert-error'}`} role="status">
            {mensaje.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('vendor.company.name')} *</label>
            <input 
              className="form-input" 
              name="nombreEmpresa" 
              value={formData.nombreEmpresa} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('vendor.company.nit')} *</label>
            <input 
              className="form-input" 
              name="nit_rut" 
              value={formData.nit_rut} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.phone')} *</label>
            <input 
              className="form-input" 
              name="telefono" 
              value={formData.telefono} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('vendor.company.address')}</label>
            <input 
              className="form-input" 
              name="direccion" 
              value={formData.direccion} 
              onChange={handleChange} 
            />
          </div>
          <button 
            type="submit" 
            disabled={solicitando} 
            className="btn btn-ink btn-lg btn-block"
          >
            {solicitando ? t('common.sending') : t('sell.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}