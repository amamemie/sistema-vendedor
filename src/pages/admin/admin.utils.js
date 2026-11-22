// ============================================
// FUNCIONES COMPARTIDAS - ADMINISTRADOR
// ============================================
import i18n from '../../i18n';
import { formatMoney, formatDate } from '../../i18n/format';

export const formatearPrecio = (precio) => formatMoney(precio);

export const formatearFecha = (fecha) => (fecha ? formatDate(fecha) : '-');

const TONES = {
  Pendiente: ['var(--warning-light)', 'var(--warning)'],
  Aprobado: ['var(--success-light)', 'var(--success)'],
  Rechazado: ['var(--error-light)', 'var(--error)'],
  Activo: ['var(--success-light)', 'var(--success)'],
  Inactivo: ['var(--error-light)', 'var(--error)'],
};

const badge = (estado, ns) => {
  const [bg, color] = TONES[estado] || ['var(--surface-2)', 'var(--text-2)'];
  return { bg, color, text: i18n.t(`${ns}.${estado}`, { defaultValue: estado }) };
};

export const getEstadoBadge = (estado) => badge(estado, 'productStatus');

export const getEstadoDevolucionBadge = (estado) => badge(estado, 'productStatus');

export const getRolBadge = (rol) => {
  const roles = {
    Admin: ['var(--ink)', 'var(--on-ink)', 'roles.admin'],
    Vendedor: ['var(--accent-soft)', 'var(--accent)', 'roles.seller'],
    Comprador: ['var(--info-light)', 'var(--info)', 'roles.buyer'],
  };
  const r = roles[rol];
  return r ? { bg: r[0], color: r[1], text: i18n.t(r[2]) } : { bg: 'var(--surface-2)', color: 'var(--text-2)', text: rol };
};
