// /src/services/api.js
const BASE_URL = 'http://localhost/sistema-vendedor/backend';

// ============================================
// FUNCIÓN GENÉRICA PARA PETICIONES
// ============================================
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}/${endpoint}`;
  console.log(`📡 [API] ${options.method || 'GET'} → ${url}`);

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: options.body || null,
    });
    
    const data = await response.json();
    console.log(`✅ [API] Respuesta:`, data);
    return data;
  } catch (error) {
    console.error(`❌ [API] Error en ${endpoint}:`, error);
    return { success: false, message: 'Error de conexión con el servidor' };
  }
}

// ============================================
// FUNCIÓN PARA SUBIR ARCHIVOS (FormData)
// ============================================
async function uploadFile(endpoint, formData) {
  const url = `${BASE_URL}/${endpoint}`;
  console.log(`📤 [UPLOAD] POST → ${url}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error(`❌ [UPLOAD] Error:`, error);
    return { success: false, message: 'Error al subir archivo' };
  }
}

// ============================================
// AUTH SERVICE (Login y Registro)
// ============================================
export const authService = {
  login: async (email, password) => {
    return request('login.php', { 
      method: 'POST', 
      body: JSON.stringify({ email, password }) 
    });
  },

  register: async (userData) => {
    return request('crear_usuario.php', { 
      method: 'POST', 
      body: JSON.stringify(userData) 
    });
  },
};

// ============================================
// API GENERAL
// ============================================
export const api = {
  // ========== VENDEDOR - PEDIDOS ==========
getPedidosVendedor: (idVendedor) => 
  request(`pedidos_vendedor.php?id_vendedor=${idVendedor}`, { method: 'GET' }),

// ========== VENDEDOR - REPORTE VENTAS ==========
getReporteVentasVendedor: (idVendedor, fechaInicio, fechaFin) => 
  request(`reporte_ventas_vendedor.php?id_vendedor=${idVendedor}&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`, { method: 'GET' }),

// ========== VENDEDOR - ACTUALIZAR ESTADO PEDIDO ==========
actualizarEstadoPedido: (idPedido, nuevoEstado) => 
  request('actualizar_estado_pedido.php', { 
    method: 'POST', 
    body: JSON.stringify({ id_compra: idPedido, estado: nuevoEstado }) 
  }),

// ========== VENDEDOR - ACTUALIZAR PERFIL ==========
actualizarPerfilVendedor: (datos) => 
  request('actualizar_perfil_vendedor.php', { 
    method: 'POST', 
    body: JSON.stringify(datos) 
  }),
  
  // ========== USUARIOS ==========
  getUsuarios: () => request('usuarios.php', { method: 'GET' }),
  
  actualizarRolUsuario: (idUsuario, nuevoRol) => 
    request('actualizar_rol.php', { 
      method: 'POST', 
      body: JSON.stringify({ id_usuario: idUsuario, rol: nuevoRol }) 
    }),

  // ========== CATEGORÍAS ==========
  getCategorias: () => request('categorias.php', { method: 'GET' }),

  // ========== PRODUCTOS (públicos) ==========
  getProductos: (idTienda = null, publico = false) => {
    let url = `productos.php?publico=${publico}`;
    if (idTienda) url += `&id_tienda=${idTienda}`;
    return request(url, { method: 'GET' });
  },
  // ========== PRODUCTOS POR VENDEDOR ==========
getProductosPorVendedor: (idVendedor) => 
  request(`productos.php?id_vendedor=${idVendedor}`, { method: 'GET' }),
  // ========== PRODUCTOS (gestión vendedor) ==========
  crearProducto: (producto) => 
    request('crear_producto.php', { 
      method: 'POST', 
      body: JSON.stringify(producto) 
    }),

  editarProducto: (producto) => 
    request('editar_producto.php', { 
      method: 'PUT', 
      body: JSON.stringify(producto) 
    }),

  eliminarProducto: (idProducto) => 
    request('eliminar_producto.php', { 
      method: 'DELETE', 
      body: JSON.stringify({ id_producto: idProducto }) 
    }),

  // ========== ADMIN - PRODUCTOS PENDIENTES ==========
  getProductosPendientes: () => request('productos_pendientes.php', { method: 'GET' }),

  aprobarProducto: (idProducto, estadoAdmin, motivo = null) => 
    request('aprobar_producto.php', { 
      method: 'POST', 
      body: JSON.stringify({ 
        id_producto: idProducto, 
        estado_admin: estadoAdmin, 
        motivo 
      }) 
    }),

  // ========== ADMIN - DEVOLUCIONES ==========
  getSolicitudesDevolucion: async () => {
    try {
      const response = await fetch(`${BASE_URL}/solicitudes_devolucion.php`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error en getSolicitudesDevolucion:', error);
      return [];
    }
  },

  procesarDevolucion: (idCompra, accion) => 
    request('procesar_devolucion.php', { 
      method: 'POST', 
      body: JSON.stringify({ id_compra: idCompra, accion }) 
    }),

  // ========== COMPRADOR - DEVOLUCIONES ==========
  solicitarDevolucion: (idCompra, motivo) => 
    request('solicitar_devolucion.php', { 
      method: 'POST', 
      body: JSON.stringify({ id_compra: idCompra, motivo }) 
    }),

  // ========== COMPRADOR - RESEÑAS ==========
  // ========== COMPRADOR - RESEÑAS ==========
calificarProducto: (idProducto, calificacion, comentario = '', idUsuario = null) => 
  request('reseñas.php', { 
    method: 'POST', 
    body: JSON.stringify({ 
      id_producto: idProducto, 
      calificacion: calificacion,
      comentario: comentario,
      id_usuario: idUsuario
    }) 
  }),
  // ========== IMÁGENES ==========
  subirImagen: (idProducto, archivo, esPrincipal = 0) => {
    const formData = new FormData();
    formData.append('id_producto', idProducto);
    formData.append('imagen', archivo);
    formData.append('es_principal', esPrincipal);
    return uploadFile('subir_imagen.php', formData);
  },

  // ========== CARRITO ==========
  getCarrito: () => request('carrito.php', { method: 'GET' }),

  agregarAlCarrito: (producto) => 
    request('carrito.php', { 
      method: 'POST', 
      body: JSON.stringify(producto) 
    }),

  eliminarDelCarrito: (idProducto) => 
    request('carrito.php', { 
      method: 'DELETE', 
      body: JSON.stringify({ id_producto: idProducto }) 
    }),

  vaciarCarrito: () => 
    request('carrito.php', { 
      method: 'DELETE', 
      body: JSON.stringify({ vaciar_todo: true }) 
    }),

  // ========== COMPRAS ==========
  comprar: (datosCompra) => 
    request('comprar.php', { 
      method: 'POST', 
      body: JSON.stringify(datosCompra) 
    }),

  // ========== REPORTES ==========
  getReporteVentas: (fechaInicio = null, fechaFin = null) => {
    let url = 'reporte_ventas.php';
    if (fechaInicio && fechaFin) {
      url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
    }
    return request(url, { method: 'GET' });
  },

  getReporteComisiones: () => request('reporte_comisiones.php', { method: 'GET' }),

  // ========== CHAT (NUEVO) ==========
  getMensajes: (idProducto, idVendedor, idComprador) => 
    request(`chat.php?id_producto=${idProducto}&id_vendedor=${idVendedor}&id_comprador=${idComprador}`, { method: 'GET' }),

  enviarMensaje: (idProducto, mensaje, emisor, idUsuario = null) => 
  request('chat.php', { 
    method: 'POST', 
    body: JSON.stringify({ 
      id_producto: idProducto, 
      mensaje: mensaje, 
      emisor: emisor,
      id_usuario: idUsuario
    }) 
  }),
};