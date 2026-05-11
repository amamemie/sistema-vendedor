import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function FormProducto({ idTienda, onGuardado, onCerrar }) {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const [form, setForm] = useState({
    nombre:          '',
    descripcion:     '',
    precio_unitario: '',
    stock:           '',
    id_categoria:    '',
  });

  useEffect(() => {
    api.get('categorias.php')
      .then(data => { if (Array.isArray(data)) setCategorias(data); })
      .catch(() => {});
  }, []);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.nombre || !form.precio_unitario || !form.id_categoria) {
      setError('Nombre, precio y categoría son obligatorios');
      return;
    }
    setLoading(true);
    const data = await api.post('crear_producto.php', { ...form, id_tienda: idTienda });
    setLoading(false);
    if (data.success) {
      onGuardado();
    } else {
      setError(data.message || 'Error al guardar el producto');
    }
  };

  return (
    // Overlay
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16,
    }}
      onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div style={{
        background: '#fff', borderRadius: 14, width: '100%', maxWidth: 480,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: '0.5px solid #e2e8f0',
        }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#0f172a' }}>Nuevo producto</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Completa los datos del producto</p>
          </div>
          <button onClick={onCerrar}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20, padding: 4 }}>
            <i className="ti ti-x" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div>
            <label style={labelStyle}>Nombre del producto *</label>
            <input name="nombre" required value={form.nombre} onChange={handleChange}
              placeholder="Ej: Camiseta Premium Talla M"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>

          <div>
            <label style={labelStyle}>Descripción <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opcional)</span></label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
              placeholder="Describe el producto brevemente..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Precio (Bs.) *</label>
              <input name="precio_unitario" type="number" min="0" step="0.01" required
                value={form.precio_unitario} onChange={handleChange}
                placeholder="0.00"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
            <div>
              <label style={labelStyle}>Stock inicial</label>
              <input name="stock" type="number" min="0"
                value={form.stock} onChange={handleChange}
                placeholder="0"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Categoría *</label>
            <select name="id_categoria" required value={form.id_categoria} onChange={handleChange}
              style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
              <option value="">Selecciona una categoría</option>
              {categorias.map(c => (
                <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
              ))}
            </select>
            {categorias.length === 0 && (
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>
                No se encontraron categorías — verifica tu conexión al backend.
              </p>
            )}
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
              padding: '8px 12px', fontSize: 12, color: '#dc2626',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 14 }} />
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onCerrar}
              style={{
                flex: 1, padding: '10px 0', background: '#f8fafc',
                color: '#64748b', border: '0.5px solid #e2e8f0',
                borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              style={{
                flex: 1, padding: '10px 0',
                background: loading ? '#94a3b8' : '#0f172a',
                color: '#fff', border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
              {loading ? 'Guardando...' : 'Guardar producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: 12, fontWeight: 500, color: '#374151',
  display: 'block', marginBottom: 5,
};

const inputStyle = {
  width: '100%', padding: '9px 12px', fontSize: 13,
  border: '1px solid #e2e8f0', borderRadius: 8,
  outline: 'none', boxSizing: 'border-box',
  color: '#0f172a', background: '#fff',
  transition: 'border-color 0.15s',
};
