// ============================================
// FUNCIONES COMPARTIDAS - ADMINISTRADOR
// ============================================

export const formatearPrecio = (precio) => {
  return `Bs. ${parseFloat(precio).toFixed(2)}`;
};

export const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleDateString('es-BO');
};

export const getEstadoBadge = (estado) => {
  const estados = {
    'Pendiente': { bg: 'var(--warning-light)', color: 'var(--warning-strong)', text: '⏳ Pendiente' },
    'Aprobado': { bg: 'var(--success-light)', color: 'var(--success-strong)', text: '✅ Aprobado' },
    'Rechazado': { bg: 'var(--error-light)', color: '#991b1b', text: '❌ Rechazado' },
    'Activo': { bg: 'var(--success-light)', color: 'var(--success-strong)', text: '✅ Activo' },
    'Inactivo': { bg: 'var(--error-light)', color: '#991b1b', text: '❌ Inactivo' }
  };
  return estados[estado] || { bg: 'var(--gray-100)', color: 'var(--gray-500)', text: estado };
};

export const getEstadoDevolucionBadge = (estado) => {
  const estados = {
    'Pendiente': { bg: 'var(--warning-light)', color: 'var(--warning-strong)', text: '⏳ Pendiente' },
    'Aprobado': { bg: 'var(--success-light)', color: 'var(--success-strong)', text: '✅ Aprobado' },
    'Rechazado': { bg: 'var(--error-light)', color: '#991b1b', text: '❌ Rechazado' }
  };
  return estados[estado] || { bg: 'var(--gray-100)', color: 'var(--gray-500)', text: estado };
};

export const getRolBadge = (rol) => {
  const roles = {
    'Admin': { bg: 'var(--accent-soft)', color: '#6d28d9', text: '👑 Admin' },
    'Vendedor': { bg: 'var(--accent-soft)', color: 'var(--accent-hover)', text: '🏪 Vendedor' },
    'Comprador': { bg: '#f0fdf4', color: '#166534', text: '🛒 Comprador' }
  };
  return roles[rol] || { bg: 'var(--gray-100)', color: 'var(--gray-500)', text: rol };
};