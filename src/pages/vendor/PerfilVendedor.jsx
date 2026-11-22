import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './vendor.css';
import { guardarTiendaLocal, cargarTiendaLocal, validarDatosEmpresa, imagenToBase64 } from './vendor.utils';
import { useTranslation } from 'react-i18next';

export default function PerfilVendedor({ onBack }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tienda, setTienda] = useState({
    nombreEmpresa: '',
    nit_rut: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    descripcion: '',
    logo: null
  });
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [errores, setErrores] = useState([]);

  useEffect(() => {
    const tiendaGuardada = cargarTiendaLocal();
    if (tiendaGuardada) setTienda(tiendaGuardada);
  }, []);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'telefono') value = value.replace(/\D/g, '');
    setTienda({ ...tienda, [e.target.name]: value });
    if (errores.length) setErrores([]);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await imagenToBase64(file);
      setTienda({ ...tienda, logo: base64 });
    }
  };

  const guardarTienda = async () => {
    const erroresValidacion = validarDatosEmpresa(tienda);
    if (erroresValidacion.length) {
      setErrores(erroresValidacion);
      setMensaje('');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      guardarTiendaLocal(tienda);
      setEditando(false);
      setMensaje(t('vendor.company.saved'));
      setTimeout(() => setMensaje(''), 3000);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="vendor-content">
      <div className="perfil-vendedor-container">
        <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}><i className="ti ti-arrow-left" aria-hidden="true" /> {t('vendor.company.back')}</button>

        <div className="perfil-vendedor-card">
          <div className="perfil-vendedor-header">
            <h2 className="perfil-vendedor-title">{t('vendor.nav.company')}</h2>
            {!editando && <button className="btn btn-primary" onClick={() => setEditando(true)}><i className="ti ti-pencil" aria-hidden="true" /> {t('vendor.company.edit')}</button>}
          </div>

          {mensaje && <div className="alert alert-success"><i className="ti ti-circle-check" aria-hidden="true" /> {mensaje}</div>}
          {errores.length > 0 && <div className="alert alert-error" style={{ display: 'grid' }}>{errores.map(e => <div key={e}>{e}</div>)}</div>}

          <div className="perfil-vendedor-avatar">
            <div className="perfil-vendedor-avatar-circle">
              {tienda.logo ? <img src={tienda.logo} alt={t('vendor.company.logo')} className="perfil-avatar-image" /> : <i className="ti ti-building-store perfil-vendedor-avatar-letter" aria-hidden="true" />}
            </div>
            {editando && <label className="perfil-upload-btn"><input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} /> <i className="ti ti-upload" aria-hidden="true" /> {t('vendor.company.changeLogo')}</label>}
          </div>

          <div className="perfil-vendedor-form-grid">
            <div className="perfil-field"><label>{t('auth.email')}</label><input type="email" value={user?.email || ''} disabled /></div>
            <div className="perfil-field"><label>{t('vendor.company.name')} *</label><input name="nombreEmpresa" value={tienda.nombreEmpresa} onChange={handleChange} disabled={!editando} /></div>
            <div className="perfil-field"><label>{t('vendor.company.nit')} *</label><input name="nit_rut" value={tienda.nit_rut} onChange={handleChange} disabled={!editando} /></div>
            <div className="perfil-field"><label>{t('auth.phone')} *</label><input name="telefono" value={tienda.telefono} onChange={handleChange} disabled={!editando} /></div>
            <div className="perfil-field"><label>{t('vendor.company.address')}</label><input name="direccion" value={tienda.direccion} onChange={handleChange} disabled={!editando} /></div>
            <div className="perfil-field"><label>{t('vendor.company.city')}</label><input name="ciudad" value={tienda.ciudad} onChange={handleChange} disabled={!editando} /></div>
            <div className="perfil-field"><label>{t('vendor.company.description')}</label><textarea name="descripcion" value={tienda.descripcion} onChange={handleChange} disabled={!editando} rows="3" /></div>
          </div>

          {editando && (
            <div className="perfil-actions" style={{ marginTop: 24 }}>
              <button className="perfil-save-btn" onClick={guardarTienda} disabled={loading}>{loading ? t('common.saving') : t('common.saveChanges')}</button>
              <button className="perfil-cancel-btn" onClick={() => setEditando(false)}>{t('common.cancel')}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}