import i18n from './index';

const locale = () => (i18n.resolvedLanguage === 'en' ? 'en-US' : 'es-BO');

/** Moneda en bolivianos: "Bs. 1.234,50" (es) / "Bs. 1,234.50" (en) */
export function formatMoney(value) {
  const n = Number(value) || 0;
  return `Bs. ${n.toLocaleString(locale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(value, opts) {
  return (Number(value) || 0).toLocaleString(locale(), opts);
}

export function formatDate(value, opts = { dateStyle: 'medium' }) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat(locale(), opts).format(d);
}

export function formatDateTime(value) {
  return formatDate(value, { dateStyle: 'medium', timeStyle: 'short' });
}
