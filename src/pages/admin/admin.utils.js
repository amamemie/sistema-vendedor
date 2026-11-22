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
    'Pendiente': { bg: '#fef3c7', color: '#92400e', text: '⏳ Pendiente' },
    'Aprobado': { bg: '#d1fae5', color: '#065f46', text: '✅ Aprobado' },
    'Rechazado': { bg: '#fee2e2', color: '#991b1b', text: '❌ Rechazado' },
    'Activo': { bg: '#d1fae5', color: '#065f46', text: '✅ Activo' },
    'Inactivo': { bg: '#fee2e2', color: '#991b1b', text: '❌ Inactivo' }
  };
  return estados[estado] || { bg: '#f1f5f9', color: '#64748b', text: estado };
};

export const getEstadoDevolucionBadge = (estado) => {
  const estados = {
    'Pendiente': { bg: '#fef3c7', color: '#92400e', text: '⏳ Pendiente' },
    'Aprobado': { bg: '#d1fae5', color: '#065f46', text: '✅ Aprobado' },
    'Rechazado': { bg: '#fee2e2', color: '#991b1b', text: '❌ Rechazado' }
  };
  return estados[estado] || { bg: '#f1f5f9', color: '#64748b', text: estado };
};

export const getRolBadge = (rol) => {
  const roles = {
    'Admin': { bg: '#ede9fe', color: '#6d28d9', text: '👑 Admin' },
    'Vendedor': { bg: '#dbeafe', color: '#1d4ed8', text: '🏪 Vendedor' },
    'Comprador': { bg: '#f0fdf4', color: '#166534', text: '🛒 Comprador' }
  };
  return roles[rol] || { bg: '#f1f5f9', color: '#64748b', text: rol };
};