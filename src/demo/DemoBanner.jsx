import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/** Aviso de la demo estática: los datos son de ejemplo y los cambios no se guardan. */
export default function DemoBanner() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(() => {
    try {
      return sessionStorage.getItem('sv-demo-banner') !== 'closed';
    } catch {
      return true;
    }
  });
  const [showAccounts, setShowAccounts] = useState(false);
  if (!open) return null;

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem('sv-demo-banner', 'closed');
    } catch {
      /* sin almacenamiento */
    }
  };

  return (
    <div className="demo-banner" role="region" aria-label={t('demo.label')}>
      <div className="demo-banner-row">
        <span className="demo-banner-tag">DEMO</span>
        <p>{t('demo.text')}</p>
        <button type="button" className="demo-banner-link" onClick={() => setShowAccounts((v) => !v)} aria-expanded={showAccounts}>
          {showAccounts ? t('demo.hideAccounts') : t('demo.showAccounts')}
        </button>
        <button type="button" className="demo-banner-close" onClick={close} aria-label={t('common.close')}>
          <i className="ti ti-x" aria-hidden="true" />
        </button>
      </div>
      {showAccounts && (
        <ul className="demo-accounts">
          <li><strong>{t('roles.admin')}</strong> admin@sistema.com · hash_admin_123</li>
          <li><strong>{t('roles.seller')}</strong> vendedor1@gmail.com · hash_vend_1</li>
          <li><strong>{t('roles.buyer')}</strong> comprador1@hotmail.com · hash_comp_1</li>
        </ul>
      )}
    </div>
  );
}
