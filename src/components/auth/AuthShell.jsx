import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../ui/Icon';
import Prefs from '../ui/Prefs';
import { formatMoney } from '../../i18n/format';
import './auth.css';

function AuthScene() {
  const { t } = useTranslation();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--ax', `${12 - y * 12}deg`);
        el.style.setProperty('--ay', `${-16 + x * 20}deg`);
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const bars = [38, 56, 44, 72, 60, 88, 76];

  return (
    <div className="auth-scene" aria-hidden="true">
      <div className="auth-scene-3d" ref={ref}>
        <div className="auth-card auth-card--sales">
          <span className="auth-card-label">{t('authScene.sales')}</span>
          <strong>{formatMoney(12480.5)}</strong>
          <span className="auth-card-up">+18,4%</span>
          <div className="auth-bars">
            {bars.map((h, i) => (
              <span key={i} style={{ '--h': `${h}%`, '--d': `${i * 70}ms` }} />
            ))}
          </div>
        </div>
        <div className="auth-card auth-card--order">
          <span className="auth-card-icon"><Icon name="check" size={16} /></span>
          <div>
            <strong>{t('authScene.order')}</strong>
            <span>{t('authScene.orderSub')}</span>
          </div>
        </div>
        <div className="auth-card auth-card--review">
          <div className="auth-stars">
            {[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" size={14} />)}
          </div>
          <span>{t('authScene.review')}</span>
        </div>
        <div className="auth-orb" />
      </div>
      <div className="auth-scene-copy">
        <h2>{t('authScene.title')}</h2>
        <p>{t('authScene.lead')}</p>
      </div>
    </div>
  );
}

export default function AuthShell({ title, subtitle, onBack, children, footer }) {
  const { t } = useTranslation();
  return (
    <div className="auth page-enter">
      <div className="auth-form-side">
        <div className="auth-top">
          {onBack ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onBack}>
              <Icon name="arrowLeft" size={16} /> {t('auth.backToStore')}
            </button>
          ) : <span />}
          <Prefs compact />
        </div>
        <div className="auth-form-wrap">
          <div className="auth-brand">
            <span className="store-brand-mark"><span>M</span></span>
            <span>{t('brand.name')}</span>
          </div>
          <h1>{title}</h1>
          {subtitle && <p className="auth-sub">{subtitle}</p>}
          {children}
          {footer && <div className="auth-footer">{footer}</div>}
        </div>
      </div>
      <AuthScene />
    </div>
  );
}
