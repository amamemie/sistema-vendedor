// src/pages/vendor/Productos.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './vendor.css';
import { formatearPrecio, getEstadoClase, getStockClase, getStockTexto, subirImagen } from './vendor.utils';
import { useTranslation } from 'react-i18next';
import { toast } from '../../components/ui/toast';

const BASE_URL = 'http://localhost/sistema-vendedor/backend';

// Agregar función a api si no existe (a nivel de módulo, no durante el render)
if (!api.getProductosPorVendedor) {
  api.getProductosPorVendedor = (idVendedor) =>
    fetch(`${BASE_URL}/productos.php?id_vendedor=${idVendedor}`).then((r) => r.json());
}

export default function VendorProductos() {
  const { t } = useTranslation();
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
      toast(t('vendor.products.required'), 'error');
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

      toast(t('vendor.products.saved'));
      setMostrarModal(false);
      setEditando(null);
      setFormData({ 
        nombre: '', descripcion: '', precio_unitario: '', stock: '', id_categoria: '', 
        imagenes: [], imagenesExistentes: [] 
      });
      cargarProductos();
    } catch {
      toast(t('vendor.products.saveError'), 'error');
    }
    setSubiendo(false);
  };

  const eliminarProducto = async (idProducto) => {
    if (confirm(t('vendor.products.confirmDelete'))) {
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


  return (
    <div className="vendor-content">
      <div className="productos-header">
        <div>
          <h2 className="productos-title">{modoVista === 'todos' ? t('vendor.products.catalog') : t('vendor.nav.products')}</h2>
          <p className="productos-count">{t('store.productCount', { count: productosFiltrados.length })}</p>
        </div>
        <div className="productos-toolbar">
          <div className="productos-vista-toggle">
            <button 
              className={`vista-btn ${modoVista === 'mis_productos' ? 'vista-btn-active' : ''}`}
              onClick={() => setModoVista('mis_productos')}
            >
              <i className="ti ti-package" aria-hidden="true" /> {t('vendor.products.mine')}
            </button>
            <button 
              className={`vista-btn ${modoVista === 'todos' ? 'vista-btn-active' : ''}`}
              onClick={() => setModoVista('todos')}
            >
              <i className="ti ti-world" aria-hidden="true" /> {t('vendor.products.catalog')}
            </button>
          </div>
          <div className="productos-search">
            <i className="ti ti-search"></i>
            <input placeholder={t('store.searchPlaceholder')} aria-label={t('store.search')} value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
          {modoVista === 'mis_productos' && (
            <button className="btn btn-primary" onClick={() => { setEditando(null); setFormData({ nombre: '', descripcion: '', precio_unitario: '', stock: '', id_categoria: '', imagenes: [], imagenesExistentes: [] }); setMostrarModal(true); }}>
              <i className="ti ti-plus" aria-hidden="true"></i> {t('vendor.products.add')}
            </button>
          )}
        </div>
      </div>

      {!idTienda && modoVista === 'mis_productos' && (
        <div className="alert alert-info"><i className="ti ti-info-circle" aria-hidden="true" /> {t('vendor.products.noStore')}</div>
      )}

      {loading ? (
        <div className="skeleton" style={{ height: 360, borderRadius: 16 }} />
      ) : (
        <div className="productos-table stagger">
          <div className="productos-table-header">
            <span>{t('vendor.products.photo')}</span><span>{t('vendor.products.product')}</span><span>{t('vendor.products.category')}</span><span>{t('vendor.products.price')}</span><span>{t('vendor.products.stock')}</span><span>{t('common.status')}</span><span>{t('common.actions')}</span>
          </div>
          {productosFiltrados.length === 0 && (
            <div className="empty-state"><i className="ti ti-package-off" style={{ fontSize: 30 }} aria-hidden="true" />{t('store.noResults')}</div>
          )}
          {productosFiltrados.map((p, i) => (
            <div key={p.id_producto} className="productos-table-row" style={{ '--i': i }}>
              <div className="producto-imagen">
                {p.imagen_principal ? <img src={`${BASE_URL}/${p.imagen_principal}`} alt={p.nombre} /> : <i className="ti ti-photo" aria-hidden="true"></i>}
              </div>
              <div>
                <div className="producto-nombre">{p.nombre}</div>
                {p.descripcion && <div className="producto-descripcion">{p.descripcion}</div>}
                {modoVista === 'todos' && p.nombre_tienda && (
                  <div className="producto-tienda"><i className="ti ti-building-store" aria-hidden="true" /> {p.nombre_tienda}</div>
                )}
              </div>
              <span>{p.categoria || '—'}</span>
              <span className="producto-precio">{formatearPrecio(p.precio_unitario)}</span>
              <span className={`producto-stock ${getStockClase(p.stock)}`}>{getStockTexto(p.stock)}</span>
              <span><span className={`producto-estado-badge ${getEstadoClase(p.estado)}`}>{t(`productStatus.${p.estado}`, { defaultValue: p.estado })}</span></span>
              <div className="producto-actions">
                {modoVista === 'mis_productos' && (
                  <>
                    <button className="btn-icon" onClick={() => abrirEditar(p)} aria-label={t('common.edit')} title={t('common.edit')}><i className="ti ti-edit" aria-hidden="true"></i></button>
                    <button className="btn-icon btn-danger-icon" onClick={() => eliminarProducto(p.id_producto)} aria-label={t('common.delete')} title={t('common.delete')}><i className="ti ti-trash" aria-hidden="true"></i></button>
                  </>
                )}
                {modoVista === 'todos' && p.id_vendedor !== idVendedor && (
                  <span className="producto-otro-vendedor">{t('vendor.products.otherSeller')}</span>
                )}
                {modoVista === 'todos' && p.id_vendedor === idVendedor && (
                  <span className="producto-mio-badge">{t('vendor.products.myProduct')}</span>
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
              <h3 className="modal-title">{editando ? t('vendor.products.edit') : t('vendor.products.new')}</h3>
              <button className="modal-close" onClick={() => setMostrarModal(false)} aria-label={t('common.close')}><i className="ti ti-x" aria-hidden="true" /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">{t('vendor.products.name')} *</label>
                <input className="form-input" name="nombre" value={formData.nombre} onChange={handleChange} placeholder={t('vendor.products.namePh')} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('vendor.products.description')}</label>
                <textarea className="form-textarea" name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder={t('vendor.products.descriptionPh')}></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('vendor.products.priceBs')} *</label>
                  <input className="form-input" type="number" step="0.01" name="precio_unitario" value={formData.precio_unitario} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('vendor.products.stock')} *</label>
                  <input className="form-input" type="number" name="stock" value={formData.stock} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('vendor.products.category')} *</label>
                <select className="form-select" name="id_categoria" value={formData.id_categoria} onChange={handleChange}>
                  <option value="">{t('common.select')}</option>
                  {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                </select>
              </div>
              
              {formData.imagenesExistentes.length > 0 && (
                <div className="form-group">
                  <label className="form-label">{t('vendor.products.currentImages')}</label>
                  <div className="imagenes-grid">
                    {formData.imagenesExistentes.map((img, idx) => (
                      <div key={idx} className="imagen-item">
                        <img src={`${BASE_URL}/${img}`} alt="" />
                        {editando && (
                          <button className="imagen-item-remove" onClick={() => eliminarImagenExistente(img)} aria-label={t('common.delete')}><i className="ti ti-x" aria-hidden="true" /></button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">{t('vendor.products.addImages')}</label>
                <input type="file" accept="image/*" multiple onChange={handleImagenes} className="form-input" />
                <div className="imagenes-grid">
                  {formData.imagenes.map((img, idx) => (
                    <div key={idx} className="imagen-item">
                      <img src={img.preview} alt="" />
                      <button className="imagen-item-remove" onClick={() => eliminarImagenNueva(idx)} aria-label={t('common.delete')}><i className="ti ti-x" aria-hidden="true" /></button>
                    </div>
                  ))}
                </div>
                <small style={{ fontSize: 12, color: 'var(--text-3)' }}>{t('vendor.products.multiHint')}</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMostrarModal(false)}>{t('common.cancel')}</button>
              <button className="btn btn-primary" onClick={guardarProducto} disabled={subiendo}>
                {subiendo ? t('common.saving') : t('vendor.products.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}