import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Prefs from '../../components/ui/Prefs';
import './comprador.css';
import { cargarPerfil, guardarPerfil, validarPerfil, obtenerIniciales, imagenToBase64 } from './comprador.utils';
import MisPedidos from './MisPedidos';
import MisResenas from './MisResenas';
import SolicitarVendedor from './SolicitarVendedor';
import MisDescuentos from './MisDescuentos';

export default function PerfilComprador({ onBack }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');
  const [perfil, setPerfil] = useState({
    nombres: '', apellidos: '', telefono: '', direccion: '', ciudad: '', metodoPago: 'tarjeta', imagenPerfil: null,
  });
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [errores, setErrores] = useState([]);

  useEffect(() => {
    const perfilGuardado = cargarPerfil();
    if (perfilGuardado) setPerfil(perfilGuardado);
  }, []);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'telefono') value = value.replace(/\D/g, '');
    setPerfil({ ...perfil, [e.target.name]: value });
    if (errores.length) setErrores([]);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) setPerfil({ ...perfil, imagenPerfil: await imagenToBase64(file) });
  };

  const guardarPerfilHandler = () => {
    const erroresValidacion = validarPerfil(perfil);
    if (erroresValidacion.length) {
      setErrores(erroresValidacion);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      guardarPerfil(perfil);
      setEditando(false);
      setMensaje(t('buyer.profile.saved'));
      setTimeout(() => setMensaje(''), 3000);
      setLoading(false);
    }, 500);
  };

  const tabs = [
    { id: 'perfil', label: t('buyer.tabs.profile'), icon: 'ti-user' },
    { id: 'pedidos', label: t('buyer.tabs.orders'), icon: 'ti-package' },
    { id: 'resenas', label: t('buyer.tabs.reviews'), icon: 'ti-star' },
    { id: 'descuentos', label: t('buyer.tabs.discounts'), icon: 'ti-discount' },
    { id: 'vendedor', label: t('buyer.tabs.sell'), icon: 'ti-rocket', special: true },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'pedidos': return <MisPedidos />;
      case 'resenas': return <MisResenas />;
      case 'descuentos': return <MisDescuentos />;
      case 'vendedor': return <SolicitarVendedor />;
      default:
        return (
          <>
            <div className="perfil-header">
              <h2 className="perfil-title">{t('buyer.tabs.profile')}</h2>
              {!editando && (
                <button className="btn btn-outline btn-sm" onClick={() => setEditando(true)}>
                  <i className="ti ti-pencil" aria-hidden="true" /> {t('buyer.profile.edit')}
                </button>
              )}
            </div>

            {mensaje && <div className="alert alert-success"><i className="ti ti-circle-check" aria-hidden="true" /> {mensaje}</div>}
            {errores.length > 0 && <div className="alert alert-error" style={{ display: 'grid' }}>{errores.map((e) => <div key={e}>{e}</div>)}</div>}

            <div className="perfil-avatar">
              <div className="perfil-avatar-circle">
                {perfil.imagenPerfil
                  ? <img src={perfil.imagenPerfil} alt={t('buyer.profile.photo')} className="perfil-avatar-image" />
                  : <span className="perfil-avatar-letter">{obtenerIniciales(user?.email)}</span>}
              </div>
              {editando && (
                <label className="perfil-upload-btn">
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  <i className="ti ti-camera" aria-hidden="true" /> {t('buyer.profile.changePhoto')}
                </label>
              )}
            </div>

            <div className="perfil-form-grid">
              <div className="perfil-field perfil-field-email"><label>{t('auth.email')}</label><input type="email" value={user?.email || ''} disabled /></div>
              <div className="perfil-field"><label>{t('auth.firstName')}</label><input name="nombres" value={perfil.nombres} onChange={handleChange} disabled={!editando} autoComplete="given-name" /></div>
              <div className="perfil-field"><label>{t('auth.lastName')}</label><input name="apellidos" value={perfil.apellidos} onChange={handleChange} disabled={!editando} autoComplete="family-name" /></div>
              <div className="perfil-field"><label>{t('auth.phone')}</label><input name="telefono" value={perfil.telefono} onChange={handleChange} disabled={!editando} inputMode="tel" autoComplete="tel" /></div>
              <div className="perfil-field"><label>{t('vendor.company.address')}</label><input name="direccion" value={perfil.direccion} onChange={handleChange} disabled={!editando} autoComplete="street-address" /></div>
              <div className="perfil-field"><label>{t('vendor.company.city')}</label><input name="ciudad" value={perfil.ciudad} onChange={handleChange} disabled={!editando} autoComplete="address-level2" /></div>
              <div className="perfil-field"><label>{t('checkout.method')}</label>
                <select name="metodoPago" value={perfil.metodoPago} onChange={handleChange} disabled={!editando}>
                  <option value="tarjeta">{t('checkout.methods.tarjeta')}</option>
                  <option value="qr">{t('checkout.methods.qr')}</option>
                  <option value="transferencia">{t('checkout.methods.transferencia')}</option>
                  <option value="contraentrega">{t('checkout.methods.contraentrega')}</option>
                </select>
              </div>
            </div>

            {editando && (
              <div className="perfil-actions">
                <button className="perfil-save-btn" onClick={guardarPerfilHandler} disabled={loading}>{loading ? t('common.saving') : t('common.saveChanges')}</button>
                <button className="perfil-cancel-btn" onClick={() => setEditando(false)}>{t('common.cancel')}</button>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="perfil-container page-enter">
      <div className="perfil-content">
        <div className="detail-top">
          <button onClick={onBack} className="btn btn-ghost btn-sm"><i className="ti ti-arrow-left" aria-hidden="true" /> {t('auth.backToStore')}</button>
          <Prefs compact />
        </div>

        <div className="perfil-card">
          <div className="perfil-options-bar" role="tablist" aria-label={t('buyer.myAccount')}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`perfil-option-btn ${activeTab === tab.id ? 'perfil-option-btn-active' : ''}${tab.special ? ' perfil-option-danger' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`ti ${tab.icon}`} aria-hidden="true" /> {tab.label}
              </button>
            ))}
          </div>
          <div key={activeTab} className="fade-in">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
