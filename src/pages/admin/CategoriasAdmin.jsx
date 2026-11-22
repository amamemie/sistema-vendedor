// src/pages/admin/CategoriasAdmin.jsx
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './admin.css';

export default function CategoriasAdmin() {
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
      setMensaje('❌ El nombre es requerido');
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
        setMensaje(editando ? '✅ Categoría actualizada' : '✅ Categoría creada');
        setTimeout(() => {
          setMostrarModal(false);
          cargarCategorias();
        }, 1000);
      } else {
        setMensaje(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error guardando categoría:', error);
      setMensaje('❌ Error de conexión');
    } finally {
      setEnviando(false);
    }
  };

  const eliminarCategoria = async (idCategoria, nombre) => {
    if (!confirm(`¿Eliminar la categoría "${nombre}"?\nLos productos asociados quedarán sin categoría.`)) {
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
        alert('✅ Categoría eliminada');
        cargarCategorias();
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      alert('❌ Error de conexión');
    }
  };

  if (loading) {
    return <div className="admin-loading">Cargando categorías...</div>;
  }

  return (
    <div className="categorias-admin">
      <div className="admin-section-header">
        <h2>📂 Gestión de Categorías</h2>
        <button className="admin-btn-primary" onClick={abrirNueva}>
          + Nueva categoría
        </button>
      </div>

      <div className="categorias-table">
        <div className="categorias-table-header">
          <span>ID</span>
          <span>Nombre</span>
          <span>Detalle</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>
        
        {categorias.length === 0 ? (
          <div className="categorias-empty">No hay categorías registradas</div>
        ) : (
          categorias.map(cat => (
            <div key={cat.id_categoria} className="categorias-table-row">
              <span className="categoria-id">#{cat.id_categoria}</span>
              <span className="categoria-nombre">{cat.nombre}</span>
              <span className="categoria-detalle">{cat.detalle || '—'}</span>
              <span>
                <span className={`categoria-estado ${cat.estado === 'Activo' ? 'estado-activo' : 'estado-inactivo'}`}>
                  {cat.estado || 'Activo'}
                </span>
              </span>
              <div className="categoria-acciones">
                <button className="btn-icon" onClick={() => abrirEditar(cat)}>
                  ✏️
                </button>
                <button className="btn-icon btn-danger-icon" onClick={() => eliminarCategoria(cat.id_categoria, cat.nombre)}>
                  🗑️
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
              <h3>{editando ? 'Editar categoría' : 'Nueva categoría'}</h3>
              <button className="modal-close" onClick={() => setMostrarModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {mensaje && (
                <div className={`modal-mensaje ${mensaje.includes('✅') ? 'success' : 'error'}`}>
                  {mensaje}
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  className="form-input"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Electrónica, Ropa, Hogar..."
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  name="detalle"
                  className="form-textarea"
                  value={formData.detalle}
                  onChange={handleChange}
                  placeholder="Descripción de la categoría"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  name="estado"
                  className="form-select"
                  value={formData.estado}
                  onChange={handleChange}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardarCategoria} disabled={enviando}>
                {enviando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}