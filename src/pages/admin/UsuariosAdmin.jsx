import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getRolBadge, getEstadoBadge } from './admin.utils';
import { toast } from '../../components/ui/toast';
import './admin.css';

export default function UsuariosAdmin() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [nuevoRol, setNuevoRol] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [procesando, setProcesando] = useState(null);

  const cargarUsuarios = async () => {
    const data = await api.getUsuarios();
    if (Array.isArray(data)) setUsuarios(data);
    setLoading(false);
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

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

  // Activar / desactivar cuenta (endpoint admin_toggle_usuario.php)
  const cambiarEstado = async (u) => {
    const activo = (u.estado || 'Activo').toLowerCase() === 'activo';
    if (!confirm(activo ? t('admin.users.confirmDeactivate', { email: u.email }) : t('admin.users.confirmActivate', { email: u.email }))) return;
    setProcesando(u.id_usuario);
    const res = await api.toggleUsuario(u.id_usuario, activo ? 'Inactivo' : 'Activo');
    if (res.success) {
      toast(activo ? t('admin.users.deactivated') : t('admin.users.activated'));
      await cargarUsuarios();
    } else {
      toast(res.message || t('errors.generic'), 'error');
    }
    setProcesando(null);
  };

  const filtrados = useMemo(
    () => usuarios.filter((u) => !busqueda || u.email?.toLowerCase().includes(busqueda.toLowerCase())),
    [usuarios, busqueda]
  );

  if (loading) return <div className="skeleton" style={{ height: 360, borderRadius: 16 }} />;

  return (
    <div>
      <div className="productos-header">
        <div>
          <h2 className="productos-title">{t('admin.nav.users')}</h2>
          <p className="productos-count">{t('admin.users.count', { count: filtrados.length })}</p>
        </div>
        <div className="productos-search">
          <i className="ti ti-search" aria-hidden="true" />
          <input placeholder={t('admin.users.search')} aria-label={t('admin.users.search')} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
      </div>

      <div className="table-scroll panel" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>{t('auth.email')}</th><th>{t('admin.users.role')}</th><th>{t('common.status')}</th><th>{t('common.actions')}</th></tr>
          </thead>
          <tbody>
            {filtrados.map((u) => {
              const rolBadge = getRolBadge(u.rol);
              const estado = u.estado || 'Activo';
              const estadoBadge = getEstadoBadge(estado);
              const activo = estado.toLowerCase() === 'activo';
              const soyYo = Number(u.id_usuario) === Number(user?.id);
              return (
                <tr key={u.id_usuario}>
                  <td>#{u.id_usuario}</td>
                  <td>{u.email}</td>
                  <td><span className="badge" style={{ background: rolBadge.bg, color: rolBadge.color }}>{rolBadge.text}</span></td>
                  <td><span className="badge" style={{ background: estadoBadge.bg, color: estadoBadge.color }}>{estadoBadge.text}</span></td>
                  <td>
                    {editando === u.id_usuario ? (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <select value={nuevoRol} onChange={(e) => setNuevoRol(e.target.value)} className="form-select" style={{ width: 'auto', minHeight: 36 }} aria-label={t('admin.users.role')}>
                          <option value="Comprador">{t('roles.buyer')}</option>
                          <option value="Vendedor">{t('roles.seller')}</option>
                          <option value="Admin">{t('roles.admin')}</option>
                        </select>
                        <button className="admin-btn-success" onClick={() => cambiarRol(editando, nuevoRol)}>{t('common.save')}</button>
                        <button className="admin-btn-secondary" onClick={() => setEditando(null)}>{t('common.cancel')}</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className="admin-btn-secondary" onClick={() => { setEditando(u.id_usuario); setNuevoRol(u.rol); }}>
                          <i className="ti ti-user-cog" aria-hidden="true" /> {t('admin.users.changeRole')}
                        </button>
                        {!soyYo && (
                          <button
                            className={activo ? 'admin-btn-danger' : 'admin-btn-success'}
                            onClick={() => cambiarEstado(u)}
                            disabled={procesando === u.id_usuario}
                          >
                            <i className={`ti ${activo ? 'ti-user-off' : 'ti-user-check'}`} aria-hidden="true" />{' '}
                            {activo ? t('admin.users.deactivate') : t('admin.users.activate')}
                          </button>
                        )}
                      </div>
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
