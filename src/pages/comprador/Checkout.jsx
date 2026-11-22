import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Prefs from '../../components/ui/Prefs';
import { imgUrl } from '../../components/store/Store';
import { formatMoney } from '../../i18n/format';
import './comprador.css';

const METODOS = [
  { value: 'tarjeta', icon: 'ti-credit-card' },
  { value: 'qr', icon: 'ti-qrcode' },
  { value: 'transferencia', icon: 'ti-building-bank' },
];

export default function Checkout({ carrito, total, onConfirm, onBack }) {
  const { t } = useTranslation();
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [loading, setLoading] = useState(false);
  const [direccion, setDireccion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simula el proceso de pago (igual que antes)
    setTimeout(() => {
      setLoading(false);
      onConfirm({ metodoPago, direccion, fecha: new Date().toISOString() });
    }, 2000);
  };

  return (
    <div className="store-page page-enter">
      <div className="store-wrap checkout">
        <div className="detail-top">
          <button type="button" onClick={onBack} className="btn btn-ghost btn-sm">
            <i className="ti ti-arrow-left" aria-hidden="true" /> {t('checkout.back')}
          </button>
          <Prefs compact />
        </div>

        <ol className="steps" aria-label={t('checkout.steps')}>
          <li className="is-done"><span><i className="ti ti-check" aria-hidden="true" /></span>{t('cart.title')}</li>
          <li className="is-current"><span>2</span>{t('checkout.payment')}</li>
          <li><span>3</span>{t('checkout.confirmation')}</li>
        </ol>

        <div className="checkout-grid">
          <form className="panel checkout-form" onSubmit={handleSubmit}>
            <h1>{t('checkout.title')}</h1>

            <label className="field">
              <span className="field-label">{t('checkout.address')}</span>
              <span className="input-wrap">
                <i className="ti ti-map-pin" aria-hidden="true" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: 18 }} />
                <input className="input" type="text" required autoComplete="street-address" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder={t('checkout.addressPh')} />
              </span>
            </label>

            <fieldset className="pay-methods">
              <legend className="field-label">{t('checkout.method')}</legend>
              {METODOS.map((m) => (
                <label key={m.value} className={`pay-method${metodoPago === m.value ? ' is-on' : ''}`}>
                  <input type="radio" name="pago" value={m.value} checked={metodoPago === m.value} onChange={(e) => setMetodoPago(e.target.value)} />
                  <span className="pay-method-icon"><i className={`ti ${m.icon}`} aria-hidden="true" /></span>
                  <span className="pay-method-text">
                    <strong>{t(`checkout.methods.${m.value}`)}</strong>
                    <small>{t(`checkout.methodsHint.${m.value}`)}</small>
                  </span>
                  <i className="ti ti-circle-check pay-method-check" aria-hidden="true" />
                </label>
              ))}
            </fieldset>

            <button type="submit" className="btn btn-ink btn-lg btn-block" disabled={loading}>
              {loading ? <><span className="btn-spinner" /> {t('checkout.processing')}</> : <><i className="ti ti-lock" aria-hidden="true" /> {t('checkout.pay', { total: formatMoney(total) })}</>}
            </button>
            <p className="checkout-secure"><i className="ti ti-shield-check" aria-hidden="true" /> {t('checkout.secure')}</p>
          </form>

          <aside className="panel checkout-summary">
            <h2>{t('checkout.yourOrder')}</h2>
            <ul className="list">
              {carrito.map((item) => {
                const src = imgUrl(item.imagen_principal);
                return (
                  <li key={item.id_producto} className="list-row">
                    <span className="drawer-thumb" style={{ width: 48, height: 48 }}>{src ? <img src={src} alt="" /> : <i className="ti ti-photo" aria-hidden="true" />}</span>
                    <div className="list-main">
                      <strong>{item.nombre}</strong>
                      <span>×{item.cantidad}</span>
                    </div>
                    <span className="list-amount">{formatMoney(item.precio_unitario * item.cantidad)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="checkout-total">
              <span>{t('common.total')}</span>
              <strong>{formatMoney(total)}</strong>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
