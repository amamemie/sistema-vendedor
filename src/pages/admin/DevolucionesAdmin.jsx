import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { getEstadoDevolucionBadge } from './admin.utils';
import './admin.css';
import { useTranslation } from 'react-i18next';
import { toast } from '../../components/ui/toast';

export default function DevolucionesAdmin() {
  const { t } = useTranslation();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const data = await api.getSolicitudesDevolucion();
      if (Array.isArray(data)) {
        setSolicitudes(data);
      } else {
        console.error('Error: devoluciones no es un array', data);
        setSolicitudes([]);
      }
    } catch (error) {
      console.error('Error cargando devoluciones:', error);
      setSolicitudes([]);
    }
    setLoading(false);
  };

  const procesarDevolucion = async (idCompra, accion) => {
    try {
      const result = await api.procesarDevolucion(idCompra, accion);
      if (result.success) {
        toast(accion === 'Aprobar' ? t('admin.returns.approved') : t('admin.returns.rejected'));
        cargarSolicitudes();
      } else {
        toast(result.message || t('errors.generic'), 'error');
      }
    } catch {
      toast(t('errors.connection'), 'error');
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  if (loading) return <div className="skeleton" style={{ height: 240, borderRadius: 16 }} />;

  return (
    <div>
      {solicitudes.length === 0 ? (
        <div className="empty-state panel">
          <span className="empty-icon"><i className="ti ti-rotate-clockwise" aria-hidden="true" /></span>
          <p>{t('admin.returns.empty')}</p>
        </div>
      ) : (
        <div className="stagger" style={{ display: 'grid', gap: 12 }}>
          {solicitudes.map((s, i) => {
            const badge = getEstadoDevolucionBadge(s.solicita_devolucion);
            return (
              <div key={s.id_compra} className="panel" style={{ '--i': i, marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{t('vendor.orders.order', { id: s.id_compra })}</span>
                  <span className="badge" style={{ background: badge.bg, color: badge.color }}>{badge.text}</span>
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 4 }}><i className="ti ti-user" aria-hidden="true" /> {t('roles.buyer')}: {s.comprador_nombres} {s.comprador_apellidos}</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 4 }}><i className="ti ti-building-store" aria-hidden="true" /> {t('store.store')}: {s.nombre_tienda}</div>
                <div style={{ fontSize: 13.5, margin: '10px 0 14px', background: 'var(--surface-2)', padding: 12, borderRadius: 10 }}>
                  <strong>{t('admin.returns.reason')}:</strong> {s.devolucion_motivo}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="admin-btn-success" onClick={() => procesarDevolucion(s.id_compra, 'Aprobar')}><i className="ti ti-check" aria-hidden="true" /> {t('admin.approve')}</button>
                  <button className="admin-btn-danger" onClick={() => procesarDevolucion(s.id_compra, 'Rechazar')}><i className="ti ti-x" aria-hidden="true" /> {t('admin.reject')}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}