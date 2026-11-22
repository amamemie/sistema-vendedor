import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Prefs from '../ui/Prefs';
import NotificationBell from '../NotificationBell';
import './shell.css';

/**
 * Estructura común de los paneles (vendedor y administrador):
 * barra lateral oscura, barra superior con título, tema/idioma y notificaciones,
 * y menú tipo cajón en pantallas pequeñas.
 */
export default function AppShell({ roleLabel, workspace, user, items, active, onSelect, onLogout, title, subtitle, children }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const select = (key) => {
    onSelect(key);
    setOpen(false);
    window.scrollTo({ top: 0 });
  };

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <div className={`shell${open ? ' shell--open' : ''}`}>
      <aside className="shell-side" aria-label={t('shell.navigation')}>
        <div className="shell-brand">
          <span className="shell-brand-mark">M</span>
          <div>
            <strong>{t('brand.name')}</strong>
            <span>{workspace}</span>
          </div>
        </div>

        <nav className="shell-nav">
          {items.map((item, i) => (
            <button
              key={item.key}
              type="button"
              className={`shell-link${active === item.key ? ' is-active' : ''}`}
              aria-current={active === item.key ? 'page' : undefined}
              onClick={() => select(item.key)}
              style={{ '--i': i }}
            >
              <i className={`ti ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="shell-user">
          <span className="shell-avatar">{initials}</span>
          <div className="shell-user-info">
            <span>{roleLabel}</span>
            <strong title={user?.email}>{user?.email}</strong>
          </div>
          <button type="button" className="shell-logout" onClick={onLogout} aria-label={t('auth.logout')} title={t('auth.logout')}>
            <i className="ti ti-logout" aria-hidden="true" />
          </button>
        </div>
      </aside>

      <div className="shell-scrim" onClick={() => setOpen(false)} />

      <div className="shell-main">
        <header className="shell-top">
          <button type="button" className="shell-menu icon-btn" onClick={() => setOpen(true)} aria-label={t('shell.openMenu')} aria-expanded={open}>
            <i className="ti ti-menu-2" aria-hidden="true" />
          </button>
          <div className="shell-title">
            <h1 key={title}>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="shell-top-actions">
            <NotificationBell userId={user?.id} />
            <Prefs compact />
          </div>
        </header>
        <main className="shell-content" key={active}>
          {children}
        </main>
      </div>
    </div>
  );
}
