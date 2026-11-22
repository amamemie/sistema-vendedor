import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { getEstadoBadge } from './admin.utils';
import './admin.css';

/** Lista de vendedores registrados (endpoint vendedores.php). */
export default function VendedoresAdmin({ onCrear }) {
  const { t } = useTranslation();
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    api.getVendedores()
      .then((data) => setVendedores(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return vendedores.filter((v) =>
      !q || `${v.nombres} ${v.apellidos} ${v.email} ${v.documento_identidad || ''}`.toLowerCase().includes(q)
    );
  }, [vendedores, busqueda]);

  if (loading) return <div className="skeleton" style={{ height: 360, borderRadius: 16 }} />;

  return (
    <div>
      <div className="productos-header">
        <div>
          <h2 className="productos-title">{t('admin.nav.sellers')}</h2>
          <p className="productos-count">{t('admin.sellers.count', { count: filtrados.length })}</p>
        </div>
        <div className="productos-toolbar">
          <div className="productos-search">
            <i className="ti ti-search" aria-hidden="true" />
            <input placeholder={t('admin.sellers.search')} aria-label={t('admin.sellers.search')} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <button type="button" className="btn btn-primary" onClick={onCrear}>
            <i className="ti ti-user-plus" aria-hidden="true" /> {t('admin.nav.createSeller')}
          </button>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="empty-state panel"><span className="empty-icon"><i className="ti ti-building-store" aria-hidden="true" /></span>{t('admin.sellers.empty')}</div>
      ) : (
        <div className="table-scroll panel" style={{ padding: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>{t('roles.seller')}</th><th>{t('auth.email')}</th><th>{t('auth.phone')}</th>
                <th>{t('admin.sellers.document')}</th><th>{t('admin.sellers.personType')}</th><th>{t('common.status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((v) => {
                const b = getEstadoBadge(v.estado);
                return (
                  <tr key={v.id_vendedor}>
                    <td>#{v.id_vendedor}</td>
                    <td style={{ fontWeight: 600 }}>{`${v.nombres || ''} ${v.apellidos || ''}`.trim() || '—'}</td>
                    <td>{v.email || '—'}</td>
                    <td>{v.telefono || '—'}</td>
                    <td>{v.documento_identidad || '—'}</td>
                    <td>{v.tipo_persona ? t(`admin.sellers.types.${v.tipo_persona}`) : '—'}</td>
                    <td><span className="badge" style={{ background: b.bg, color: b.color }}>{b.text}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
