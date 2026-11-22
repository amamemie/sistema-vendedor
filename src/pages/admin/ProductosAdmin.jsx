// src/pages/admin/ProductosAdmin.jsx
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './admin.css';
import { useTranslation } from 'react-i18next';
import { toast } from '../../components/ui/toast';
import { formatMoney, formatDate } from '../../i18n/format';

const BASE_URL = 'http://localhost/sistema-vendedor/backend';

export default function ProductosAdmin() {
  const { t } = useTranslation();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('Pendiente');
  const [mostrarModal, setMostrarModal] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [procesando, setProcesando] = useState(false);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/productos_pendientes.php`);
      const data = await response.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setProductos([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const aprobarProducto = async (idProducto) => {
    setProcesando(true);
    try {
      const result = await api.aprobarProducto(idProducto, 'Aprobado');
      if (result.success) {
        toast(t('admin.products.approved'));
        cargarProductos();
      } else {
        toast(result.message || t('errors.generic'), 'error');
      }
    } catch {
      toast(t('errors.generic'), 'error');
    }
    setProcesando(false);
  };

  const rechazarProducto = async (idProducto) => {
    if (!motivoRechazo.trim()) {
      toast(t('admin.products.reasonRequired'), 'error');
      return;
    }
    
    setProcesando(true);
    try {
      const result = await api.aprobarProducto(idProducto, 'Rechazado', motivoRechazo);
      if (result.success) {
        toast(t('admin.products.rejected'), 'info');
        setMostrarModal(null);
        setMotivoRechazo('');
        cargarProductos();
      } else {
        toast(result.message || t('errors.generic'), 'error');
      }
    } catch {
      toast(t('errors.generic'), 'error');
    }
    setProcesando(false);
  };

  const productosFiltrados = productos.filter(p => {
    if (filtro === 'Pendiente') return p.estado_admin === 'Pendiente' || !p.estado_admin;
    if (filtro === 'Aprobado') return p.estado_admin === 'Aprobado';
    if (filtro === 'Rechazado') return p.estado_admin === 'Rechazado';
    return true;
  });

  const formatearPrecio = (precio) => formatMoney(precio);
  const formatearFecha = (fecha) => (fecha ? formatDate(fecha) : '-');

  if (loading) {
    return <div className="skeleton" style={{ height: 360, borderRadius: 16 }} />;
  }

  return (
    <div className="productos-admin">
      <div className="admin-section-header">
        <h2>{t('admin.products.title')}</h2>
        <div className="productos-filtros">
          <button 
            className={`filtro-btn ${filtro === 'Pendiente' ? 'filtro-btn-active' : ''}`}
            onClick={() => setFiltro('Pendiente')}
          >
            {t('admin.products.pending')} ({productos.filter(p => p.estado_admin === 'Pendiente' || !p.estado_admin).length})
          </button>
          <button 
            className={`filtro-btn ${filtro === 'Aprobado' ? 'filtro-btn-active' : ''}`}
            onClick={() => setFiltro('Aprobado')}
          >
            {t('admin.products.approvedTab')}
          </button>
          <button 
            className={`filtro-btn ${filtro === 'Rechazado' ? 'filtro-btn-active' : ''}`}
            onClick={() => setFiltro('Rechazado')}
          >
            {t('admin.products.rejectedTab')}
          </button>
        </div>
      </div>

      {productosFiltrados.length === 0 ? (
        <div className="empty-state panel"><span className="empty-icon"><i className="ti ti-package-off" aria-hidden="true" /></span>{t('admin.products.empty')}</div>
      ) : (
        <div className="productos-pendientes-grid stagger">
          {productosFiltrados.map((producto, i) => (
            <div key={producto.id_producto} className="producto-pendiente-card" style={{ '--i': i }}>
              {/* Imagen */}
              <div className="producto-pendiente-imagen">
                {producto.imagen_principal ? (
                  <img src={`${BASE_URL}/${producto.imagen_principal}`} alt={producto.nombre} />
                ) : (
                  <div className="producto-pendiente-sin-imagen"><i className="ti ti-photo" aria-hidden="true" /></div>
                )}
              </div>
              
              {/* Información */}
              <div className="producto-pendiente-info">
                <h3 className="producto-pendiente-nombre">{producto.nombre}</h3>
                
                <div className="producto-pendiente-descripcion">
                  {producto.descripcion ? (
                    <p>{producto.descripcion}</p>
                  ) : (
                    <p className="sin-descripcion">{t('admin.products.noDescription')}</p>
                  )}
                </div>
                
                <div className="producto-pendiente-detalles">
                  <div className="detalle-item">
                    <span className="detalle-label">{t('vendor.products.price')}</span>
                    <span className="detalle-valor">{formatearPrecio(producto.precio_unitario)}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">{t('vendor.products.category')}</span>
                    <span className="detalle-valor">{producto.categoria || t('admin.products.noCategory')}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">{t('common.date')}</span>
                    <span className="detalle-valor">{formatearFecha(producto.fecha_creacion)}</span>
                  </div>
                </div>
                
                {/* Información del vendedor */}
                <div className="producto-pendiente-vendedor">
                  <div className="vendedor-header">
                    <i className="ti ti-building-store vendedor-icon" aria-hidden="true" />
                    <span className="vendedor-titulo">{t('roles.seller')}</span>
                  </div>
                  <div className="vendedor-info">
                    <div><strong>{t('store.store')}:</strong> {producto.nombre_tienda || '—'}</div>
                    <div><strong>{t('roles.seller')}:</strong> {producto.vendedor_nombre_completo}</div>
                    <div><strong>{t('auth.email')}:</strong> {producto.vendedor_email || '—'}</div>
                    <div><strong>ID:</strong> #{producto.id_vendedor || '—'}</div>
                  </div>
                </div>
              </div>
              
              {/* Estado y acciones */}
              <div className="producto-pendiente-acciones">
                <div className={`producto-estado-badge estado-${producto.estado_admin?.toLowerCase() || 'pendiente'}`}>
                  {t(`productStatus.${producto.estado_admin || 'Pendiente'}`)}
                </div>
                
                {(producto.estado_admin === 'Pendiente' || !producto.estado_admin) && (
                  <div className="acciones-botones">
                    <button 
                      className="btn-aprobar"
                      onClick={() => aprobarProducto(producto.id_producto)}
                      disabled={procesando}
                    >
                      <i className="ti ti-check" aria-hidden="true" /> {t('admin.approve')}
                    </button>
                    <button 
                      className="btn-rechazar"
                      onClick={() => setMostrarModal(producto.id_producto)}
                      disabled={procesando}
                    >
                      <i className="ti ti-x" aria-hidden="true" /> {t('admin.reject')}
                    </button>
                  </div>
                )}
                
                {producto.estado_admin === 'Aprobado' && (
                  <div className="aprobado-info"><i className="ti ti-circle-check" aria-hidden="true" /> {t('admin.products.liveInfo')}</div>
                )}
                
                {producto.estado_admin === 'Rechazado' && producto.rechazo_motivo && (
                  <div className="rechazado-info">
                    <strong>{t('admin.products.rejectReason')}:</strong>
                    <p>{producto.rechazo_motivo}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de rechazo */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('admin.products.rejectTitle')}</h3>
              <button className="modal-close" onClick={() => setMostrarModal(null)} aria-label={t('common.close')}><i className="ti ti-x" aria-hidden="true" /></button>
            </div>
            <div className="modal-body">
              <p>{t('admin.products.rejectQuestion')}</p>
              <textarea
                className="modal-textarea"
                rows="4"
                placeholder={t('admin.products.rejectPh')}
                aria-label={t('admin.products.rejectReason')}
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMostrarModal(null)}>{t('common.cancel')}</button>
              <button 
                className="btn btn-danger" 
                onClick={() => rechazarProducto(mostrarModal)}
                disabled={procesando}
              >
                {procesando ? t('common.processing') : t('admin.products.rejectTitle')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}