import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/** Botón de tema + selector ES/EN. `onDark` adapta los colores a la barra lateral oscura. */
export default function Prefs({ onDark = false, compact = false }) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const lang = i18n.resolvedLanguage || 'es';
  const isDark = theme === 'dark';

  return (
    <div className={`prefs${onDark ? ' prefs--on-dark' : ''}`}>
      <button
        type="button"
        className="prefs-btn"
        onClick={toggleTheme}
        aria-label={isDark ? t('prefs.toLight') : t('prefs.toDark')}
        title={isDark ? t('prefs.toLight') : t('prefs.toDark')}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
        {!compact && <span>{isDark ? t('prefs.light') : t('prefs.dark')}</span>}
      </button>
      <div className="prefs-lang" role="group" aria-label={t('prefs.language')}>
        {['es', 'en'].map((code) => (
          <button
            key={code}
            type="button"
            aria-pressed={lang === code}
            onClick={() => i18n.changeLanguage(code)}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
