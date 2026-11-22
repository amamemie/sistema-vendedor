import i18n from '../../i18n';
import { formatMoney, formatDate } from '../../i18n/format';
// ============================================
// UTILIDADES COMPARTIDAS - COMPRADOR
// ============================================

export const CARRITO_STORAGE_KEY = 'carrito';
export const PERFIL_STORAGE_KEY = 'perfil_comprador';

// ============================================
// FUNCIONES DE CARRITO
// ============================================

export const cargarCarrito = () => {
  try {
    const carritoGuardado = localStorage.getItem(CARRITO_STORAGE_KEY);
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  } catch (error) {
    console.error('Error al cargar carrito:', error);
    return [];
  }
};

export const guardarCarrito = (carrito) => {
  try {
    localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carrito));
    return true;
  } catch (error) {
    console.error('Error al guardar carrito:', error);
    return false;
  }
};

export const actualizarCantidad = (carrito, idProducto, nuevaCantidad) => {
  if (nuevaCantidad <= 0) {
    return eliminarDelCarrito(carrito, idProducto);
  }
  
  const nuevoCarrito = carrito.map(item =>
    item.id_producto === idProducto ? { ...item, cantidad: nuevaCantidad } : item
  );
  guardarCarrito(nuevoCarrito);
  return nuevoCarrito;
};

export const eliminarDelCarrito = (carrito, idProducto) => {
  const nuevoCarrito = carrito.filter(item => item.id_producto !== idProducto);
  guardarCarrito(nuevoCarrito);
  return nuevoCarrito;
};

export const vaciarCarrito = () => {
  guardarCarrito([]);
  return [];
};

export const calcularTotalCarrito = (carrito) => {
  if (!carrito.length) return 0;
  return carrito.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
};

export const calcularCantidadItems = (carrito) => {
  if (!carrito.length) return 0;
  return carrito.reduce((sum, item) => sum + item.cantidad, 0);
};

export const formatearPrecio = (precio) => formatMoney(precio);

// ============================================
// FUNCIONES DE FECHA
// ============================================

export const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  return formatDate(fecha);
};

// ============================================
// FUNCIONES DE PERFIL
// ============================================

export const cargarPerfil = () => {
  try {
    const perfilGuardado = localStorage.getItem(PERFIL_STORAGE_KEY);
    return perfilGuardado ? JSON.parse(perfilGuardado) : null;
  } catch (error) {
    console.error('Error al cargar perfil:', error);
    return null;
  }
};

export const guardarPerfil = (perfil) => {
  try {
    localStorage.setItem(PERFIL_STORAGE_KEY, JSON.stringify(perfil));
    return true;
  } catch (error) {
    console.error('Error al guardar perfil:', error);
    return false;
  }
};

export const validarPerfil = (perfil) => {
  const errores = [];
  if (!perfil.nombres?.trim()) errores.push(i18n.t('buyer.profile.errName'));
  if (!perfil.apellidos?.trim()) errores.push(i18n.t('buyer.profile.errLastName'));
  if (perfil.telefono?.trim()) {
    const telefonoLimpio = perfil.telefono.replace(/\D/g, '');
    if (!/^\d{7,15}$/.test(telefonoLimpio)) {
      errores.push(i18n.t('vendor.company.errPhoneLen'));
    }
  }
  return errores;
};

export const obtenerIniciales = (email) => {
  if (!email) return 'U';
  return email.substring(0, 2).toUpperCase();
};

export const imagenToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// ============================================
// FUNCIONES DE REPORTES
// ============================================

export const reportarProducto = async (idProducto, motivo, descripcion) => {
  try {
    const response = await fetch('http://localhost/sistema-vendedor/backend/reportar_producto.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_producto: idProducto, motivo, descripcion })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al reportar producto:', error);
    return { success: false, message: i18n.t('errors.connection') };
  }
};

// `value` se envía al backend (en español, como antes); `label` se muestra traducido.
export const motivosReporte = [
  { id: 1, value: 'Producto dañado o defectuoso', icon: 'ti-tool' },
  { id: 2, value: 'Producto no coincide con la descripción', icon: 'ti-photo-x' },
  { id: 3, value: 'Producto falsificado', icon: 'ti-alert-triangle' },
  { id: 4, value: 'Producto prohibido o ilegal', icon: 'ti-ban' },
  { id: 5, value: 'Vendedor fraudulento', icon: 'ti-user-x' },
  { id: 6, value: 'Publicidad engañosa', icon: 'ti-speakerphone' },
  { id: 7, value: 'Otro motivo', icon: 'ti-dots' },
].map((m) => ({ ...m, get label() { return i18n.t(`report.reasons.${m.id}`); } }));

// ============================================
// FUNCIONES DE PEDIDOS Y RESEÑAS
// ============================================

export const obtenerResenasUsuario = async (userId) => {
  if (!userId) {
    console.error('❌ userId no proporcionado a obtenerResenasUsuario');
    return [];
  }
  try {
    const response = await fetch(`http://localhost/sistema-vendedor/backend/mis_resenas.php?id_usuario=${userId}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    return [];
  }
};

export const obtenerPedidosUsuario = async (userId) => {
  if (!userId) {
    console.error('❌ userId no proporcionado a obtenerPedidosUsuario');
    return [];
  }
  try {
    const response = await fetch(`http://localhost/sistema-vendedor/backend/mis_pedidos.php?id_usuario=${userId}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return [];
  }
};

// ============================================
// FUNCIONES PARA SOLICITAR SER VENDEDOR
// ============================================

export const solicitarSerVendedor = async (userId, datosEmpresa) => {
  if (!userId) {
    return { success: false, message: i18n.t('errors.noUser') };
  }
  try {
    const response = await fetch('http://localhost/sistema-vendedor/backend/solicitar_vendedor.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario: userId, ...datosEmpresa })
    });
    return await response.json();
  } catch (error) {
    console.error('Error al solicitar ser vendedor:', error);
    return { success: false, message: i18n.t('errors.connection') };
  }
};
// ============================================
// FUNCIONES DE ESTRELLAS
// ============================================

export const renderEstrellas = (calificacion) => {
  const estrellasLlenas = '★'.repeat(calificacion);
  const estrellasVacias = '☆'.repeat(5 - calificacion);
  return estrellasLlenas + estrellasVacias;
};
// ============================================
// FUNCIONES DE DEVOLUCIÓN
// ============================================

export const solicitarDevolucion = async (idCompra, motivo) => {
  if (!idCompra) {
    console.error('❌ idCompra no proporcionado');
    return { success: false, message: i18n.t('errors.noOrder') };
  }
  
  try {
    const response = await fetch('http://localhost/sistema-vendedor/backend/solicitar_devolucion.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id_compra: idCompra, 
        motivo: motivo 
      })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al solicitar devolución:', error);
    return { success: false, message: i18n.t('errors.connection') };
  }
};