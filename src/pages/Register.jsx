import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/api';
import AuthShell from '../components/auth/AuthShell';
import Icon from '../components/ui/Icon';

export default function Register({ onGoToLogin, onSuccess, onBack }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: '', password: '', nombres: '', apellidos: '', telefono: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authService.register({ ...formData, rol: 'Comprador' });
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onGoToLogin?.();
        }, 2000);
      } else {
        setError(data.message || t('auth.registerError'));
      }
    } catch {
      setError(t('errors.connection'));
    }
    setLoading(false);
  };

  if (success) {
    return (
      <AuthShell title={t('auth.accountCreated')} onBack={onBack}>
        <div className="auth-success">
          <div className="auth-success-icon"><Icon name="check" size={34} strokeWidth={2.5} /></div>
          <p className="auth-sub">{t('auth.redirecting')}</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t('auth.createAccount')} subtitle={t('auth.createAccountLead')} onBack={onBack}>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-row">
          <label className="field">
            <span className="field-label">{t('auth.firstName')}</span>
            <input className="input" type="text" name="nombres" autoComplete="given-name" value={formData.nombres} onChange={handleChange} required />
          </label>
          <label className="field">
            <span className="field-label">{t('auth.lastName')}</span>
            <input className="input" type="text" name="apellidos" autoComplete="family-name" value={formData.apellidos} onChange={handleChange} required />
          </label>
        </div>
        <label className="field">
          <span className="field-label">{t('auth.email')}</span>
          <span className="input-wrap">
            <Icon name="mail" size={17} />
            <input className="input" type="email" name="email" autoComplete="email" placeholder={t('auth.emailPlaceholder')} value={formData.email} onChange={handleChange} required />
          </span>
        </label>
        <label className="field">
          <span className="field-label">{t('auth.password')}</span>
          <span className="input-wrap">
            <Icon name="lock" size={17} />
            <input className="input" type="password" name="password" autoComplete="new-password" value={formData.password} onChange={handleChange} required />
          </span>
        </label>
        <label className="field">
          <span className="field-label">{t('auth.phone')} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>({t('common.optional')})</span></span>
          <input className="input" type="tel" name="telefono" autoComplete="tel" value={formData.telefono} onChange={handleChange} />
        </label>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <button type="submit" className="btn btn-ink btn-lg btn-block" disabled={loading}>
          {loading ? <><span className="btn-spinner" /> {t('auth.creating')}</> : t('auth.register')}
        </button>
      </form>

      <div className="auth-divider">{t('auth.haveAccount')}</div>
      <button type="button" className="btn btn-outline btn-lg btn-block" onClick={onGoToLogin}>
        {t('auth.login')}
      </button>
    </AuthShell>
  );
}
