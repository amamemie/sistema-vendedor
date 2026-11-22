// src/pages/admin/CategoriasAdmin.jsx
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './admin.css';
import { useTranslation } from 'react-i18next';
import { toast } from '../../components/ui/toast';

export default function CategoriasAdmin() {
  const { t } = useTranslation();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    detalle: '',
    estado: 'Activo'
  });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const cargarCategorias = async () => {
    setLoading(true);
    try {
      const data = await api.getCategorias();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const abrirNueva = () => {
    setEditando(null);
    setFormData({ nombre: '', detalle: '', estado: 'Activo' });
    setMensaje('');
    setMostrarModal(true);
  };

  const abrirEditar = (categoria) => {
    setEditando(categoria);
    setFormData({
      nombre: categoria.nombre,
      detalle: categoria.detalle || '',
      estado: categoria.estado || 'Activo'
    });
    setMensaje('');
    setMostrarModal(true);
  };

  const guardarCategoria = async () => {
    if (!formData.nombre.trim()) {
      setMensaje({ ok: false, text: t('admin.categories.nameRequired') });
      return;
    }

    setEnviando(true);
    setMensaje('');

    try {
      const url = 'http://localhost/sistema-vendedor/backend/categorias.php';
      let response;

      if (editando) {
        // Editar
        response = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_categoria: editando.id_categoria,
            nombre: formData.nombre,
            detalle: formData.detalle,
            estado: formData.estado
          })
        });
      } else {
        // Crear
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre,
            detalle: formData.detalle,
            estado: formData.estado
          })
        });
      }

      const data = await response.json();
      
      if (data.success) {
        setMensaje({ ok: true, text: editando ? t('admin.categories.updated') : t('admin.categories.created') });
        setTimeout(() => {
          setMostrarModal(false);
          cargarCategorias();
        }, 1000);
      } else {
        setMensaje({ ok: false, text: data.message || t('errors.generic') });
      }
    } catch (error) {
      console.error('Error guardando categoría:', error);
      setMensaje({ ok: false, text: t('errors.connection') });
    } finally {
      setEnviando(false);
    }
  };

  const eliminarCategoria = async (idCategoria, nombre) => {
    if (!confirm(t('admin.categories.confirmDelete', { name: nombre }))) {
      return;
    }

    try {
      const response = await fetch('http://localhost/sistema-vendedor/backend/categorias.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_categoria: idCategoria })
      });
      const data = await response.json();
      
      if (data.success) {
        toast(t('admin.categories.deleted'));
        cargarCategorias();
      } else {
        toast(data.message || t('errors.generic'), 'error');
      }
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      toast(t('errors.connection'), 'error');
    }
  };

  if (loading) {
    return <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />;
  }

  return (
    <div className="categorias-admin">
      <div className="admin-section-header">
        <h2>{t('admin.categories.title')}</h2>
        <button className="admin-btn-primary" onClick={abrirNueva}>
          <i className="ti ti-plus" aria-hidden="true" /> {t('admin.categories.new')}
        </button>
      </div>

      <div className="categorias-table">
        <div className="categorias-table-header">
          <span>ID</span>
          <span>{t('vendor.products.name')}</span>
          <span>{t('vendor.products.description')}</span>
          <span>{t('common.status')}</span>
          <span>{t('common.actions')}</span>
        </div>
        
        {categorias.length === 0 ? (
          <div className="empty-state">{t('admin.categories.empty')}</div>
        ) : (
          categorias.map((cat, i) => (
            <div key={cat.id_categoria} className="categorias-table-row" style={{ animation: 'riseIn 0.45s var(--ease) both', animationDelay: `${Math.min(i, 12) * 40}ms` }}>
              <span className="categoria-id">#{cat.id_categoria}</span>
              <span className="categoria-nombre">{cat.nombre}</span>
              <span className="categoria-detalle">{cat.detalle || '—'}</span>
              <span>
                <span className={`categoria-estado ${cat.estado === 'Activo' ? 'estado-activo' : 'estado-inactivo'}`}>
                  {t(`productStatus.${cat.estado || 'Activo'}`)}
                </span>
              </span>
              <div className="categoria-acciones">
                <button className="btn-icon" onClick={() => abrirEditar(cat)} aria-label={t('common.edit')} title={t('common.edit')}>
                  <i className="ti ti-edit" aria-hidden="true" />
                </button>
                <button className="btn-icon btn-danger-icon" onClick={() => eliminarCategoria(cat.id_categoria, cat.nombre)} aria-label={t('common.delete')} title={t('common.delete')}>
                  <i className="ti ti-trash" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para crear/editar categoría */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editando ? t('admin.categories.edit') : t('admin.categories.new')}</h3>
              <button className="modal-close" onClick={() => setMostrarModal(false)} aria-label={t('common.close')}><i className="ti ti-x" aria-hidden="true" /></button>
            </div>
            <div className="modal-body">
              {mensaje && (
                <div className={`alert ${mensaje.ok ? 'alert-success' : 'alert-error'}`} role="status">
                  {mensaje.text}
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">{t('vendor.products.name')} *</label>
                <input
                  type="text"
                  name="nombre"
                  className="form-input"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder={t('admin.categories.namePh')}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t('vendor.products.description')}</label>
                <textarea
                  name="detalle"
                  className="form-textarea"
                  value={formData.detalle}
                  onChange={handleChange}
                  placeholder={t('admin.categories.descPh')}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t('common.status')}</label>
                <select
                  name="estado"
                  className="form-select"
                  value={formData.estado}
                  onChange={handleChange}
                >
                  <option value="Activo">{t('productStatus.Activo')}</option>
                  <option value="Inactivo">{t('productStatus.Inactivo')}</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMostrarModal(false)}>{t('common.cancel')}</button>
              <button className="btn btn-primary" onClick={guardarCategoria} disabled={enviando}>
                {enviando ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}