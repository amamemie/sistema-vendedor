import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { toast } from '../../components/ui/toast';
import './admin.css';

const VACIO = {
  email: '', password: '', nombres: '', apellidos: '', telefono: '',
  tipo_persona: 'Natural', documento_identidad: '', direccion: '', ciudad: 'La Paz', pais: 'Bolivia',
  nombre_tienda: '', descripcion_tienda: '',
};

/** Alta directa de un vendedor por el administrador (endpoint admin_crear_vendedor.php). */
export default function CrearVendedor({ onCreado }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(VACIO);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError(t('admin.createSeller.passwordShort'));
      return;
    }
    setEnviando(true);
    const res = await api.crearVendedor(form);
    setEnviando(false);
    if (res.success) {
      toast(t('admin.createSeller.created', { name: `${form.nombres} ${form.apellidos}`.trim() }));
      setForm(VACIO);
      onCreado?.();
    } else {
      setError(res.message || t('errors.generic'));
    }
  };

  const campo = (name, label, props = {}) => (
    <label className="field">
      <span className="field-label">{label}{props.required && ' *'}</span>
      <input className="input" name={name} value={form[name]} onChange={set} {...props} />
    </label>
  );

  return (
    <form className="panel create-seller" onSubmit={enviar}>
      <header className="panel-head">
        <div>
          <h2>{t('admin.createSeller.title')}</h2>
          <p>{t('admin.createSeller.lead')}</p>
        </div>
      </header>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <fieldset className="form-section">
        <legend><i className="ti ti-lock" aria-hidden="true" /> {t('admin.createSeller.account')}</legend>
        <div className="form-grid">
          {campo('email', t('auth.email'), { type: 'email', required: true, autoComplete: 'off', spellCheck: false, placeholder: 'tienda@ejemplo.com' })}
          {campo('password', t('admin.createSeller.password'), { type: 'password', required: true, autoComplete: 'new-password', minLength: 6 })}
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend><i className="ti ti-id" aria-hidden="true" /> {t('admin.createSeller.personal')}</legend>
        <div className="form-grid">
          {campo('nombres', t('auth.firstName'), { required: true, autoComplete: 'off' })}
          {campo('apellidos', t('auth.lastName'), { autoComplete: 'off' })}
          {campo('telefono', t('auth.phone'), { type: 'tel', inputMode: 'tel', autoComplete: 'off' })}
          <label className="field">
            <span className="field-label">{t('admin.sellers.personType')}</span>
            <select className="input" name="tipo_persona" value={form.tipo_persona} onChange={set}>
              <option value="Natural">{t('admin.sellers.types.Natural')}</option>
              <option value="Juridica">{t('admin.sellers.types.Juridica')}</option>
            </select>
          </label>
          {campo('documento_identidad', t('admin.sellers.document'), { required: true, autoComplete: 'off', placeholder: t('admin.createSeller.documentPh') })}
          {campo('direccion', t('vendor.company.address'), { autoComplete: 'off' })}
          {campo('ciudad', t('vendor.company.city'), { autoComplete: 'off' })}
          {campo('pais', t('admin.createSeller.country'), { autoComplete: 'off' })}
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend><i className="ti ti-building-store" aria-hidden="true" /> {t('admin.createSeller.store')}</legend>
        <div className="form-grid">
          {campo('nombre_tienda', t('admin.createSeller.storeName'), { autoComplete: 'off', placeholder: t('admin.createSeller.storeNamePh') })}
          {campo('descripcion_tienda', t('vendor.company.description'), { autoComplete: 'off' })}
        </div>
      </fieldset>

      <div className="create-seller-actions">
        <button type="button" className="btn btn-secondary" onClick={() => setForm(VACIO)} disabled={enviando}>{t('admin.createSeller.clear')}</button>
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? <><span className="btn-spinner" /> {t('common.saving')}</> : <><i className="ti ti-user-plus" aria-hidden="true" /> {t('admin.createSeller.submit')}</>}
        </button>
      </div>
    </form>
  );
}
