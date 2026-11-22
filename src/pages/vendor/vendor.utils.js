// ============================================
// UTILIDADES COMPARTIDAS - VENDEDOR
// ============================================

import i18n from '../../i18n';
import { formatMoney, formatDate } from '../../i18n/format';

// ============================================
// FUNCIONES DE PRODUCTOS
// ============================================

/**
 * Formatear precio
 */
export const formatearPrecio = (precio) => formatMoney(precio);

/**
 * Obtener clase CSS según estado del producto
 */
export const getEstadoClase = (estado) => {
  return estado === 'Activo' ? 'estado-activo' : 'estado-inactivo';
};

/**
 * Obtener clase CSS según nivel de stock
 */
export const getStockClase = (stock) => {
  if (stock <= 0) return 'stock-critico';
  if (stock <= 5) return 'stock-bajo';
  return 'stock-normal';
};

/**
 * Obtener texto según nivel de stock
 */
export const getStockTexto = (stock) => {
  if (stock <= 0) return i18n.t('stock.none');
  if (stock <= 5) return i18n.t('stock.low', { count: Number(stock) });
  return i18n.t('stock.units', { count: Number(stock) });
};

/**
 * Subir imagen al servidor
 */
export const subirImagen = async (idProducto, archivo, esPrincipal = 0) => {
  const formData = new FormData();
  formData.append('id_producto', idProducto);
  formData.append('imagen', archivo);
  formData.append('es_principal', esPrincipal);
  
  try {
    const response = await fetch('http://localhost/sistema-vendedor/backend/subir_imagen.php', {
      method: 'POST',
      body: formData
    });
    return await response.json();
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return { success: false, message: i18n.t('errors.connection') };
  }
};

/**
 * Convertir imagen a base64
 */
export const imagenToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// ============================================
// FUNCIONES DE PEDIDOS
// ============================================

/**
 * Estados de pedido con sus clases CSS
 */
export const estadosPedido = ['Pendiente', 'Pagada', 'Enviado', 'Entregado', 'Cancelado'].map((value) => ({
  value,
  get label() { return i18n.t(`orderStatus.${value}`); },
}));

/**
 * Obtener clase CSS del estado del pedido
 */
export const getEstadoPedidoClase = (estado) => {
  const clases = {
    'Pendiente': 'estado-pendiente',
    'Pagada': 'estado-pagado',
    'Enviado': 'estado-enviado',
    'Entregado': 'estado-entregado',
    'Cancelado': 'estado-cancelado'
  };
  return clases[estado] || 'estado-pendiente';
};

/**
 * Obtener texto del estado del pedido
 */
export const getEstadoPedidoTexto = (estado) => {
  return i18n.t(`orderStatus.${estado}`, { defaultValue: estado });
};

// ============================================
// FUNCIONES DE REPORTES
// ============================================

/**
 * Formatear fecha para mostrar
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  return formatDate(fecha);
};

/**
 * Obtener nombre del mes
 */
export const getNombreMes = (mes) => {
  return i18n.t('charts.monthsLong', { returnObjects: true })[mes] || '';
};

// ============================================
// FUNCIONES DE PERFIL (EMPRESA)
// ============================================

/**
 * Guardar datos de la tienda en localStorage
 */
export const guardarTiendaLocal = (tienda) => {
  localStorage.setItem('tienda_vendedor', JSON.stringify(tienda));
};

/**
 * Cargar datos de la tienda desde localStorage
 */
export const cargarTiendaLocal = () => {
  const tienda = localStorage.getItem('tienda_vendedor');
  return tienda ? JSON.parse(tienda) : null;
};

/**
 * Validar datos de empresa
 */
export const validarDatosEmpresa = (datos) => {
  const errores = [];
  if (!datos.nombreEmpresa?.trim()) errores.push(i18n.t('vendor.company.errName'));
  if (!datos.nit_rut?.trim()) errores.push(i18n.t('vendor.company.errNit'));
  if (!datos.telefono?.trim()) errores.push(i18n.t('vendor.company.errPhone'));
  if (datos.telefono && !/^\d{7,15}$/.test(datos.telefono.replace(/\D/g, ''))) {
    errores.push(i18n.t('vendor.company.errPhoneLen'));
  }
  return errores;
};