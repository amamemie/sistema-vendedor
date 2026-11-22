import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import AuthShell from '../components/auth/AuthShell';
import Icon from '../components/ui/Icon';

export default function Login({ onGoToRegister, onSuccess, onBack }) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authService.login(email, password);
      if (data.success) {
        login(data);
        onSuccess?.();
      } else {
        setError(data.message || t('auth.badCredentials'));
      }
    } catch {
      setError(t('errors.connection'));
    }
    setLoading(false);
  };

  return (
    <AuthShell
      title={t('auth.welcome')}
      subtitle={t('auth.welcomeLead')}
      onBack={onBack}
      footer={<>{t('auth.wantToSell')} <strong>{t('auth.wantToSellHint')}</strong></>}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate={false}>
        <label className="field">
          <span className="field-label">{t('auth.email')}</span>
          <span className="input-wrap">
            <Icon name="mail" size={17} />
            <input className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.emailPlaceholder')} />
          </span>
        </label>
        <label className="field">
          <span className="field-label">{t('auth.password')}</span>
          <span className="input-wrap">
            <Icon name="lock" size={17} />
            <input className="input" type={showPass ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            <button type="button" className="input-toggle" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? t('auth.hidePassword') : t('auth.showPassword')}>
              <Icon name={showPass ? 'eyeOff' : 'eye'} size={17} />
            </button>
          </span>
        </label>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <button type="submit" className="btn btn-ink btn-lg btn-block" disabled={loading}>
          {loading ? <><span className="btn-spinner" /> {t('auth.signingIn')}</> : <>{t('auth.signIn')} <Icon name="arrowRight" size={17} /></>}
        </button>
      </form>

      <div className="auth-divider">{t('auth.noAccount')}</div>
      <button type="button" className="btn btn-outline btn-lg btn-block" onClick={onGoToRegister}>
        {t('auth.createAccount')}
      </button>
    </AuthShell>
  );
}
