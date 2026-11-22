import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { getRolBadge } from './admin.utils';
import './admin.css';
import { useTranslation } from 'react-i18next';
import { toast } from '../../components/ui/toast';

export default function UsuariosAdmin() {
  const { t } = useTranslation();
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
      toast(t('admin.users.roleUpdated'));
      cargarUsuarios();
      setEditando(null);
    } else {
      toast(result.message || t('errors.generic'), 'error');
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  if (loading) return <div className="skeleton" style={{ height: 360, borderRadius: 16 }} />;

  return (
    <div>
      <div className="table-scroll panel" style={{ padding: 0 }}>
      <table className="admin-table">
        <thead>
          <tr><th>ID</th><th>{t('auth.email')}</th><th>{t('admin.users.role')}</th><th>{t('common.actions')}</th></tr>
        </thead>
        <tbody>
          {usuarios.map(u => {
            const rolBadge = getRolBadge(u.rol);
            return (
              <tr key={u.id_usuario}>
                <td>#{u.id_usuario}</td>
                <td>{u.email}</td>
                <td><span className="badge" style={{ background: rolBadge.bg, color: rolBadge.color }}>{rolBadge.text}</span></td>
                <td>
                  {editando === u.id_usuario ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select value={nuevoRol} onChange={e => setNuevoRol(e.target.value)} className="form-select" style={{ width: 'auto', minHeight: 36 }} aria-label={t('admin.users.role')}>
                        <option value="Comprador">{t('roles.buyer')}</option><option value="Vendedor">{t('roles.seller')}</option><option value="Admin">{t('roles.admin')}</option>
                      </select>
                      <button className="admin-btn-success" onClick={() => cambiarRol(editando, nuevoRol)}>{t('common.save')}</button>
                      <button className="admin-btn-primary" onClick={() => setEditando(null)}>{t('common.cancel')}</button>
                    </div>
                  ) : (
                    <button className="admin-btn-primary" onClick={() => { setEditando(u.id_usuario); setNuevoRol(u.rol); }}><i className="ti ti-user-cog" aria-hidden="true" /> {t('admin.users.changeRole')}</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}