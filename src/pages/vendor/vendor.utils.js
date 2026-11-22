// ============================================
// UTILIDADES COMPARTIDAS - VENDEDOR
// ============================================

import { api } from '../../services/api';

// ============================================
// FUNCIONES DE PRODUCTOS
// ============================================

/**
 * Formatear precio
 */
export const formatearPrecio = (precio) => {
  return `Bs. ${parseFloat(precio).toFixed(2)}`;
};

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
  if (stock <= 0) return 'Sin stock';
  if (stock <= 5) return `⚠️ Stock bajo (${stock})`;
  return `${stock} und.`;
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
    return { success: false, message: 'Error de conexión' };
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
export const estadosPedido = [
  { value: 'Pendiente', label: '⏳ Pendiente' },
  { value: 'Pagada', label: '✅ Pagada' },
  { value: 'Enviado', label: '📦 Enviado' },
  { value: 'Entregado', label: '🏠 Entregado' },
  { value: 'Cancelado', label: '❌ Cancelado' }
];

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
  const textos = {
    'Pendiente': '⏳ Pendiente',
    'Pagada': '✅ Pagada',
    'Enviado': '📦 Enviado',
    'Entregado': '🏠 Entregado',
    'Cancelado': '❌ Cancelado'
  };
  return textos[estado] || estado;
};

// ============================================
// FUNCIONES DE REPORTES
// ============================================

/**
 * Formatear fecha para mostrar
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-BO');
};

/**
 * Obtener nombre del mes
 */
export const getNombreMes = (mes) => {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return meses[mes] || '';
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
  if (!datos.nombreEmpresa?.trim()) errores.push('El nombre de la empresa es requerido');
  if (!datos.nit_rut?.trim()) errores.push('El NIT/RUT es requerido');
  if (!datos.telefono?.trim()) errores.push('El teléfono es requerido');
  if (datos.telefono && !/^\d{7,15}$/.test(datos.telefono.replace(/\D/g, ''))) {
    errores.push('El teléfono debe tener entre 7 y 15 dígitos');
  }
  return errores;
};