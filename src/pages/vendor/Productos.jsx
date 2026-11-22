// src/pages/vendor/Productos.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './vendor.css';
import { formatearPrecio, getEstadoClase, getStockClase, getStockTexto, subirImagen, imagenToBase64 } from './vendor.utils';

const BASE_URL = 'http://localhost/sistema-vendedor/backend';

export default function VendorProductos() {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [modoVista, setModoVista] = useState('mis_productos'); // 'mis_productos' o 'todos'
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_unitario: '',
    stock: '',
    id_categoria: '',
    imagenes: [],
    imagenesExistentes: []
  });
  const [subiendo, setSubiendo] = useState(false);

  const idTienda = user?.id_tienda;
  const idVendedor = user?.id_vendedor;

  const cargarProductos = async () => {
    setLoading(true);
    try {
      let data;
      if (modoVista === 'mis_productos') {
        // Solo productos del vendedor actual
        data = await api.getProductosPorVendedor(idVendedor);
      } else {
        // Todos los productos (catálogo general)
        data = await api.getProductos(null, true);
      }
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setProductos([]);
    }
    setLoading(false);
  };

  const cargarCategorias = async () => {
    const data = await api.getCategorias();
    if (Array.isArray(data)) setCategorias(data);
  };

  useEffect(() => {
    if (idVendedor || modoVista === 'todos') {
      cargarProductos();
    }
    cargarCategorias();
  }, [idVendedor, modoVista]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImagenes = (e) => {
    const files = Array.from(e.target.files);
    const nuevasImagenes = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true
    }));
    setFormData({ ...formData, imagenes: [...formData.imagenes, ...nuevasImagenes] });
  };

  const eliminarImagenNueva = (index) => {
    const nuevas = [...formData.imagenes];
    URL.revokeObjectURL(nuevas[index].preview);
    nuevas.splice(index, 1);
    setFormData({ ...formData, imagenes: nuevas });
  };

  const eliminarImagenExistente = async (imagenUrl) => {
    const nuevasExistentes = formData.imagenesExistentes.filter(url => url !== imagenUrl);
    setFormData({ ...formData, imagenesExistentes: nuevasExistentes });
  };

  const guardarProducto = async () => {
    if (!formData.nombre || !formData.precio_unitario || !formData.id_categoria) {
      alert('❌ Complete los campos obligatorios');
      return;
    }

    setSubiendo(true);
    try {
      let idProducto = editando?.id_producto;
      
      if (!editando) {
        const nuevoProducto = await api.crearProducto({
          id_tienda: idTienda,
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio_unitario: parseFloat(formData.precio_unitario),
          stock: parseInt(formData.stock) || 0,
          id_categoria: parseInt(formData.id_categoria)
        });
        if (nuevoProducto.success) {
          idProducto = nuevoProducto.id_producto;
        } else {
          throw new Error(nuevoProducto.message);
        }
      } else {
        await api.editarProducto({
          id_producto: editando.id_producto,
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio_unitario: parseFloat(formData.precio_unitario),
          id_categoria: parseInt(formData.id_categoria),
          stock: parseInt(formData.stock) || 0
        });
      }

      let esPrincipal = formData.imagenesExistentes.length === 0;
      for (const img of formData.imagenes) {
        await subirImagen(idProducto, img.file, esPrincipal ? 1 : 0);
        esPrincipal = false;
      }

      alert('✅ Producto guardado correctamente');
      setMostrarModal(false);
      setEditando(null);
      setFormData({ 
        nombre: '', descripcion: '', precio_unitario: '', stock: '', id_categoria: '', 
        imagenes: [], imagenesExistentes: [] 
      });
      cargarProductos();
    } catch (error) {
      alert('❌ Error al guardar producto');
    }
    setSubiendo(false);
  };

  const eliminarProducto = async (idProducto) => {
    if (confirm('¿Eliminar este producto?')) {
      await api.eliminarProducto(idProducto);
      cargarProductos();
    }
  };

  const abrirEditar = (producto) => {
    const imagenesGuardadas = [];
    if (producto.imagen_principal) imagenesGuardadas.push(producto.imagen_principal);
    if (producto.imagenes_extra) {
      const extras = producto.imagenes_extra.split(',');
      imagenesGuardadas.push(...extras);
    }
    
    setEditando(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio_unitario: producto.precio_unitario,
      stock: producto.stock || 0,
      id_categoria: producto.id_categoria || '',
      imagenes: [],
      imagenesExistentes: imagenesGuardadas
    });
    setMostrarModal(true);
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Agregar función a api si no existe
  if (!api.getProductosPorVendedor) {
    api.getProductosPorVendedor = (idVendedor) => 
      fetch(`${BASE_URL}/productos.php?id_vendedor=${idVendedor}`)
        .then(r => r.json());
  }

  return (
    <div className="vendor-content">
      <div className="productos-header">
        <div>
          <h1 className="productos-title">Mis Productos</h1>
          <p className="productos-count">{productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {/* Botón para cambiar vista */}
          <div className="productos-vista-toggle">
            <button 
              className={`vista-btn ${modoVista === 'mis_productos' ? 'vista-btn-active' : ''}`}
              onClick={() => setModoVista('mis_productos')}
            >
              📦 Mis productos
            </button>
            <button 
              className={`vista-btn ${modoVista === 'todos' ? 'vista-btn-active' : ''}`}
              onClick={() => setModoVista('todos')}
            >
              🌍 Catálogo general
            </button>
          </div>
          <div className="productos-search">
            <i className="ti ti-search"></i>
            <input placeholder="Buscar productos..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
          {modoVista === 'mis_productos' && (
            <button className="btn-primary" onClick={() => { setEditando(null); setFormData({ nombre: '', descripcion: '', precio_unitario: '', stock: '', id_categoria: '', imagenes: [], imagenesExistentes: [] }); setMostrarModal(true); }}>
              <i className="ti ti-plus"></i> Agregar producto
            </button>
          )}
        </div>
      </div>

      {!idTienda && modoVista === 'mis_productos' && (
        <div style={{ background: '#fef3c7', border: '1px solid #fde047', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13 }}>
          ⚠️ Tu cuenta aún no tiene una tienda asignada. Espera la aprobación del administrador.
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>Cargando productos...</div>
      ) : (
        <div className="productos-table">
          <div className="productos-table-header">
            <span>Foto</span><span>Producto</span><span>Categoría</span><span>Precio</span><span>Stock</span><span>Estado</span><span>Acción</span>
          </div>
          {productosFiltrados.map(p => (
            <div key={p.id_producto} className="productos-table-row">
              <div className="producto-imagen">
                {p.imagen_principal ? <img src={`${BASE_URL}/${p.imagen_principal}`} alt={p.nombre} /> : <i className="ti ti-photo"></i>}
              </div>
              <div>
                <div className="producto-nombre">{p.nombre}</div>
                {p.descripcion && <div className="producto-descripcion">{p.descripcion}</div>}
                {modoVista === 'todos' && p.nombre_tienda && (
                  <div className="producto-tienda">🏪 {p.nombre_tienda}</div>
                )}
              </div>
              <span>{p.categoria || '—'}</span>
              <span className="producto-precio">{formatearPrecio(p.precio_unitario)}</span>
              <span className={`producto-stock ${getStockClase(p.stock)}`}>{getStockTexto(p.stock)}</span>
              <span><span className={`producto-estado-badge ${getEstadoClase(p.estado)}`}>{p.estado}</span></span>
              <div className="producto-actions">
                {modoVista === 'mis_productos' && (
                  <>
                    <button className="btn-icon" onClick={() => abrirEditar(p)}><i className="ti ti-edit"></i></button>
                    <button className="btn-icon btn-danger-icon" onClick={() => eliminarProducto(p.id_producto)}><i className="ti ti-trash"></i></button>
                  </>
                )}
                {modoVista === 'todos' && p.id_vendedor !== idVendedor && (
                  <span className="producto-otro-vendedor">👤 Otro vendedor</span>
                )}
                {modoVista === 'todos' && p.id_vendedor === idVendedor && (
                  <span className="producto-mio-badge">Mi producto</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de producto (solo visible en modo mis productos) */}
      {mostrarModal && modoVista === 'mis_productos' && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editando ? 'Editar producto' : 'Nuevo producto'}</h3>
              <button className="modal-close" onClick={() => setMostrarModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input className="form-input" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre del producto" />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea className="form-textarea" name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción del producto"></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Precio (Bs.) *</label>
                  <input className="form-input" type="number" step="0.01" name="precio_unitario" value={formData.precio_unitario} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock *</label>
                  <input className="form-input" type="number" name="stock" value={formData.stock} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Categoría *</label>
                <select className="form-select" name="id_categoria" value={formData.id_categoria} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                </select>
              </div>
              
              {formData.imagenesExistentes.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Imágenes actuales</label>
                  <div className="imagenes-grid">
                    {formData.imagenesExistentes.map((img, idx) => (
                      <div key={idx} className="imagen-item">
                        <img src={`${BASE_URL}/${img}`} alt="Producto" />
                        {editando && (
                          <button className="imagen-item-remove" onClick={() => eliminarImagenExistente(img)}>✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Agregar imágenes</label>
                <input type="file" accept="image/*" multiple onChange={handleImagenes} className="form-input" />
                <div className="imagenes-grid">
                  {formData.imagenes.map((img, idx) => (
                    <div key={idx} className="imagen-item">
                      <img src={img.preview} alt="Preview" />
                      <button className="imagen-item-remove" onClick={() => eliminarImagenNueva(idx)}>✕</button>
                    </div>
                  ))}
                </div>
                <small style={{ fontSize: 11, color: '#94a3b8' }}>Puedes seleccionar múltiples imágenes manteniendo Ctrl</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardarProducto} disabled={subiendo}>
                {subiendo ? 'Guardando...' : 'Guardar producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}