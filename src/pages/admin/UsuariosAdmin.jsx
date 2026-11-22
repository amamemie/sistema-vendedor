import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { getRolBadge } from './admin.utils';
import './admin.css';

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [nuevoRol, setNuevoRol] = useState('');

  const cargarUsuarios = async () => {
    setLoading(true);
    const data = await api.getUsuarios();
    if (Array.isArray(data)) setUsuarios(data);
    setLoading(false);
  };

  const cambiarRol = async (idUsuario, rol) => {
    const result = await api.actualizarRolUsuario(idUsuario, rol);
    if (result.success) {
      alert('✅ Rol actualizado');
      cargarUsuarios();
      setEditando(null);
    } else {
      alert('❌ Error: ' + result.message);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Cargando usuarios...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>👥 Gestión de Usuarios</h1>
      <table className="admin-table">
        <thead>
          <tr><th>ID</th><th>Email</th><th>Rol actual</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {usuarios.map(u => {
            const rolBadge = getRolBadge(u.rol);
            return (
              <tr key={u.id_usuario}>
                <td>#{u.id_usuario}</td>
                <td>{u.email}</td>
                <td><span style={{ background: rolBadge.bg, color: rolBadge.color, padding: '3px 8px', borderRadius: 20, fontSize: 11 }}>{rolBadge.text}</span></td>
                <td>
                  {editando === u.id_usuario ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select value={nuevoRol} onChange={e => setNuevoRol(e.target.value)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--gray-200)' }}>
                        <option value="Comprador">Comprador</option><option value="Vendedor">Vendedor</option><option value="Admin">Admin</option>
                      </select>
                      <button className="admin-btn-success" onClick={() => cambiarRol(editando, nuevoRol)}>Guardar</button>
                      <button className="admin-btn-primary" onClick={() => setEditando(null)}>Cancelar</button>
                    </div>
                  ) : (
                    <button className="admin-btn-primary" onClick={() => { setEditando(u.id_usuario); setNuevoRol(u.rol); }}>Cambiar rol</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}